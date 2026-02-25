require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = 8000;

// --- Supabase Connection ---
const supabaseUrl = process.env.SUPABASE_URL || "https://wdtizlzfsijikcejerwq.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors({
    origin: ['http://localhost:5180', 'http://localhost:5181'],
    credentials: true
}));

app.use(express.json());

// Root Route for Health Check
app.get('/', (req, res) => {
    res.json({
        status: 'Online',
        service: 'Smart Door Lock API',
        endpoints: ['/api/stats', '/api/logs', '/api/users', '/auth/login']
    });
});

// Request Logger Middleware
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST') {
        const logBody = { ...req.body };
        if (logBody.faceEncoding) logBody.faceEncoding = "[ENCODING_DATA]";
        console.log('📦 Body:', JSON.stringify(logBody, null, 2));
    }
    next();
});

// --- Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Routes ---

// Login Endpoint
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const user = { name: 'Super Admin', email: email, role: 'admin' };
            const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ token: accessToken, user });
        }
        return res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Dashboard Stats Endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const { count: userCount } = await supabase.from('employees').select('*', { count: 'exact', head: true });
        const { count: grantedCount } = await supabase.from('access_logs').select('*', { count: 'exact', head: true }).eq('status', 'success');
        const { count: deniedCount } = await supabase.from('access_logs').select('*', { count: 'exact', head: true }).eq('status', 'failed');

        res.json({
            totalUsers: userCount || 0,
            activeDevices: 1,
            todayEntries: grantedCount || 0,
            failedAttempts: deniedCount || 0
        });
    } catch (error) {
        console.error("❌ Stats error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Logs Endpoint
app.get('/api/logs', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: logs, count, error } = await supabase
            .from('access_logs')
            .select(`*, employees(name, email)`, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        res.json({
            logs,
            pagination: {
                total: count,
                page: Number(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error("❌ Logs error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Users Endpoints
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const { data: users, error } = await supabase.from('employees').select('*');
        if (error) throw error;
        res.json(users);
    } catch (error) {
        console.error("❌ Get users error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/api/users', authenticateToken, async (req, res) => {
    try {
        const { employeeId, name, email, role, faceEncoding, image_url } = req.body;

        const { data: newUser, error } = await supabase
            .from('employees')
            .upsert({
                employee_id: employeeId,
                name,
                email,
                role: role === 'admin' ? 'admin' : 'employee',
                face_embedding: faceEncoding,
                image_url
            }, { on_conflict: 'employee_id' })
            .select()
            .single();

        if (error) {
            console.error("❌ Supabase Upsert Error:", error);
            throw error;
        }

        console.log("✅ User created/updated in Supabase:", newUser.employee_id);
        res.status(201).json(newUser);
    } catch (error) {
        console.error("❌ Create user error:", error);
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('employees')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error("❌ Delete user error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Biometric Support (Mock Fallback when Python API is offline)
app.post('/api/biometrics/face/register', upload.single('file'), async (req, res) => {
    try {
        const { employeeId, email } = req.body;
        console.log(`📸 Received biometric registration for: ${employeeId}`);

        if (!employeeId) {
            return res.status(400).json({ success: false, message: "Missing employeeId" });
        }

        let imageUrl = null;

        // Optional: Upload image to Supabase if file exists
        if (req.file) {
            const fileName = `faces/${employeeId}_${Date.now()}.jpg`;
            const { data, error: uploadError } = await supabase.storage
                .from('biometrics')
                .upload(fileName, req.file.buffer, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage
                    .from('biometrics')
                    .getPublicUrl(fileName);
                imageUrl = publicUrl;
                console.log(`✅ Image uploaded to Supabase: ${imageUrl}`);
            } else {
                console.warn("⚠️ Supabase image upload failed:", uploadError.message);
            }
        }

        // Generate a 128-dimension mock encoding (random for development)
        const mockEncoding = Array.from({ length: 128 }, () => (Math.random() * 0.2) - 0.1);

        res.json({
            success: true,
            message: "Face registered (Development Mock Mode)",
            encoding: mockEncoding,
            image_url: imageUrl,
            employeeId: employeeId // Return the ID so frontend is in sync
        });
    } catch (error) {
        console.error("❌ Biometric fallback error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/biometrics/face/verify', upload.single('file'), async (req, res) => {
    try {
        console.log("🔍 [Verification] Checking face identity...");

        // Fetch employees from Supabase
        const { data: employees, error } = await supabase
            .from('employees')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !employees || employees.length === 0) {
            console.warn("🚫 Access Denied: No employees registered in database.");
            return res.status(401).json({
                success: false,
                message: "No registered identities found."
            });
        }

        // --- Realistic Verification Flow ---
        // Attempt to call the Python Biometric Engine (Port 8001)
        try {
            const { default: axios } = await import('axios');
            const FormData = (await import('form-data')).default;

            const form = new FormData();
            form.append('file', req.file.buffer, {
                filename: 'verify.jpg',
                contentType: 'image/jpeg'
            });

            console.log("📡 Forwarding to Biometric Engine (Port 8001)...");
            const response = await axios.post('http://localhost:8001/api/biometrics/face/verify', form, {
                headers: form.getHeaders(),
                timeout: 5000
            });

            if (response.data.success) {
                const matchedUser = response.data.user;
                console.log(`✅ Access Granted (Real Match): Welcome ${matchedUser.name}`);

                // Log success
                await supabase.from('access_logs').insert({
                    employee_id: matchedUser.employee_id,
                    status: 'success',
                    confidence: response.data.confidence || 0.98,
                    device_id: 'terminal_01'
                });

                return res.json({
                    success: true,
                    message: `Authorized: Welcome ${matchedUser.name}`,
                    user: matchedUser
                });
            } else {
                console.warn("🚫 Access Denied: Face not recognized by AI engine.");
                // Log failure
                await supabase.from('access_logs').insert({
                    status: 'failed',
                    device_id: 'terminal_01'
                });

                return res.status(401).json({
                    success: false,
                    message: "Access Denied: Face not recognized."
                });
            }
        } catch (engineError) {
            console.warn("⚠️ Biometric Engine (Port 8001) is offline. Using strict security mode.");

            // In strict mode, we NEVER auto-grant without the AI engine.
            // Log the attempt as a system error/denial
            await supabase.from('access_logs').insert({
                status: 'failed',
                device_id: 'terminal_01'
            });

            return res.status(503).json({
                success: false,
                message: "Security Service Temporary Offline. Please try again later."
            });
        }

    } catch (error) {
        console.error("❌ Verification error:", error);
        res.status(500).json({ success: false, error: "Internal Verification Error" });
    }
});

// 404 Catch-all (to ensure port 8000 ONLY shows JSON)
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `Route ${req.url} does not exist on this API gateway.`
    });
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
