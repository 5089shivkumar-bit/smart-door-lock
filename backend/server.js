require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Supabase Connection ---
const supabaseUrl = process.env.SUPABASE_URL || "https://wdtizlzfsijikcejerwq.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// Request Logger Middleware
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST') console.log('📦 Body:', JSON.stringify(req.body, null, 2));
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
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        const user = { name: 'Super Admin', email: email, role: 'admin' };
        const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token: accessToken, user });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
});

// Dashboard Stats Endpoint
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const { count: userCount } = await supabase.from('employees').select('*', { count: 'exact', head: true });
        const { count: grantedCount } = await supabase.from('access_logs').select('*', { count: 'exact', head: true }).eq('status', 'success');
        const { count: deniedCount } = await supabase.from('access_logs').select('*', { count: 'exact', head: true }).eq('status', 'failed');

        res.json({
            totalUsers: userCount || 0,
            activeDevices: 1, // Placeholder
            todayEntries: grantedCount || 0,
            failedAttempts: deniedCount || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
    }
});

// Users Endpoints
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const { data: users, error } = await supabase.from('employees').select('*');
        if (error) throw error;
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/users', authenticateToken, async (req, res) => {
    try {
        const { employeeId, name, email, role, accessLevel, faceEncoding, image_url } = req.body;

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

        if (error) throw error;
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Alias for registration if requested
app.post('/api/face/register', authenticateToken, async (req, res) => {
    console.log("📝 Face registration redirect/alias called");
    // Forward to existing users endpoint logic
    return app._router.handle(req, res);
});

app.listen(PORT, () => {
    console.log(`Server (Supabase Mode) running on port ${PORT}`);
});
