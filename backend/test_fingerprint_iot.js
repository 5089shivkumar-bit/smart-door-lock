const axios = require('axios');
require('dotenv').config();

const SECRET = process.env.ESP32_SECRET || 'door_secret_pass_123';
const BACKEND_URL = 'http://localhost:8000';

async function testFingerprintNotify() {
    console.log("🧪 Testing Fingerprint Notification to Backend...");

    try {
        const response = await axios.post(`${BACKEND_URL}/api/logs/iot`, {
            method: "Fingerprint",
            id: 1, // Mock fingerprint ID
            status: "success",
            message: "Match Found"
        }, {
            headers: {
                'Authorization': `Bearer ${SECRET}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("📊 Response Status:", response.status);
        console.log("📦 Response Data:", response.data);

        if (response.data.success) {
            console.log("✨ TEST PASSED: Fingerprint event logged successfully!");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.response?.data || error.message);
        process.exit(1);
    }
}

testFingerprintNotify();
