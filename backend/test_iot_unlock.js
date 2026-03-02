const axios = require('axios');
const http = require('http');
require('dotenv').config();

const MOCK_PORT = 3333;
const MOCK_SECRET = process.env.ESP32_SECRET || 'door_secret_pass_123';

/**
 * 1. Start Mock ESP32 Server
 */
const startMockEsp32 = () => {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            const auth = req.headers['authorization'];

            console.log(`📡 [Mock ESP32] Received ${req.method} ${req.url}`);
            console.log(`🔑 [Mock ESP32] Auth Header: ${auth}`);

            if (req.url === '/unlock' && req.method === 'POST') {
                if (auth === `Bearer ${MOCK_SECRET}`) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: "Relay Triggered" }));
                    console.log("✅ [Mock ESP32] Access Granted & Relay Triggered");
                } else {
                    res.writeHead(403);
                    res.end("Forbidden");
                    console.log("❌ [Mock ESP32] Invalid Token");
                }
            } else {
                res.writeHead(404);
                res.end();
            }
        });

        server.listen(MOCK_PORT, () => {
            console.log(`🚀 [Mock ESP32] Listening on port ${MOCK_PORT}`);
            resolve(server);
        });
    });
};

/**
 * 2. Test Function (mimics unlockDoor in server.js)
 */
async function testUnlock() {
    console.log("\n🧪 Starting IoT Unlock Test...");

    try {
        const response = await axios.post(`http://localhost:${MOCK_PORT}/unlock`, {}, {
            headers: { 'Authorization': `Bearer ${MOCK_SECRET}` },
            timeout: 5000
        });

        console.log("📊 Result Status:", response.status);
        console.log("📦 Result Data:", response.data);

        if (response.data.success) {
            console.log("✨ TEST PASSED: Unlock command verified!");
        } else {
            throw new Error("Unexpected response data");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.response?.data || error.message);
        process.exit(1);
    }
}

// Execute
(async () => {
    const server = await startMockEsp32();
    await testUnlock();
    server.close(() => {
        console.log("🛑 [Mock ESP32] Server stopped.");
        process.exit(0);
    });
})();
