const axios = require('axios');
const http = require('http');
const crypto = require('crypto');

const API_URL = 'http://localhost:8000';
const ESP32_SECRET = 'door_secret_pass_123';

/**
 * 1. Test Mock ESP32 HMAC Verification
 * This simulates the ESP32 receiving a command from the backend.
 */
const startMockEsp32 = () => {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                const data = JSON.parse(body);
                const { timestamp, signature } = data;

                // Verify HMAC locally in mock
                const payload = JSON.stringify({ timestamp });
                const hmac = crypto.createHmac('sha256', ESP32_SECRET);
                hmac.update(payload);
                const expected = hmac.digest('hex');

                if (signature === expected) {
                    console.log("✅ [Mock ESP32] Signature VALID");
                    res.writeHead(200);
                    res.end(JSON.stringify({ success: true }));
                } else {
                    console.error("❌ [Mock ESP32] Signature INVALID!");
                    res.writeHead(401);
                    res.end(JSON.stringify({ error: "Invalid integrity" }));
                }
            });
        });
        server.listen(8080, () => {
            console.log("📡 Mock ESP32 listening on port 8080");
            resolve(server);
        });
    });
};

/**
 * 2. Test Rate Limiting (Login)
 */
const testRateLimiting = async () => {
    console.log("🔒 Testing Rate Limiting on /auth/login...");
    let caught429 = false;
    for (let i = 0; i < 12; i++) {
        try {
            await axios.post(`${API_URL}/auth/login`, { email: 'wrong@test.com', password: 'bad' });
        } catch (err) {
            if (err.response?.status === 429) {
                caught429 = true;
                break;
            }
        }
    }
    if (caught429) console.log("✅ Rate Limiting working (HTTP 429).");
    else console.error("❌ Rate Limiting FAILED!");
};

/**
 * 3. Test Signed IoT Logging
 */
const testSignedLogging = async () => {
    console.log("🛡️ Testing Signed IoT Logging...");
    const timestamp = Math.floor(Date.now() / 1000);
    const logPayload = {
        method: "Test",
        id: 99,
        status: "success",
        message: "Security Test",
        timestamp: timestamp
    };

    const hmac = crypto.createHmac('sha256', ESP32_SECRET);
    hmac.update(JSON.stringify(logPayload));
    const signature = hmac.digest('hex');

    try {
        const res = await axios.post(`${API_URL}/api/logs/iot`, {
            ...logPayload,
            signature
        });
        if (res.data.success) console.log("✅ Signed Logging working.");
    } catch (err) {
        console.error("❌ Signed Logging failed:", err.response?.data || err.message);
    }
};

const runTests = async () => {
    const mock = await startMockEsp32();

    try {
        await testRateLimiting();
        await testSignedLogging();

        console.log("\n✨ Security Verification Complete.");
    } catch (err) {
        console.error("Verification error:", err);
    } finally {
        mock.close();
        process.exit();
    }
};

runTests();
