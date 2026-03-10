const { exec } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const BLE_MAC = process.env.ESP32_BLE_MAC;
const PYTHON_SCRIPT = path.join(__dirname, 'ble_lock.py');

let isConnected = false;
let isProcessing = false;
let statusCache = null;
let lastStatusUpdate = 0;
let bleLock = Promise.resolve();
let currentStatusPromise = null;

/**
 * Runs the Python BLE bridge script with the given command with 3x retry logic and locking.
 */
async function runBleCommand(command, retries = 3) {
    // Wait for the previous BLE operation to finish
    return bleLock = bleLock.then(async () => {
        for (let i = 0; i < retries; i++) {
            const result = await new Promise((resolve) => {
                if (!BLE_MAC && command !== 'SCAN' && command !== 'ADAPTER') {
                    return resolve({ success: false, message: 'ESP32_BLE_MAC configuration missing' });
                }

                const macArg = (command === 'SCAN' || command === 'ADAPTER') ? '' : ` ${BLE_MAC}`;
                const fullCommand = `python "${PYTHON_SCRIPT}" ${command}${macArg}`;
                console.log(`📡 [Attempt ${i + 1}/${retries}] Executing BLE Command: ${fullCommand}`);

                exec(fullCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`❌ BLE Script Error: ${error.message}`);
                        return resolve({ success: false, message: error.message });
                    }

                    const output = stdout.trim();
                    console.log(`📟 BLE Script Output: ${output}`);

                    // Special handling for JSON output (SCAN)
                    if (command === 'SCAN') {
                        try {
                            const devices = JSON.parse(output);
                            return resolve({ success: true, message: output, devices });
                        } catch (e) {
                            return resolve({ success: false, message: 'Failed to parse device scan results' });
                        }
                    }

                    if (output.includes('SUCCESS') || output.includes('ONLINE') || output.includes('ADAPTER_OK')) {
                        resolve({ success: true, message: output });
                    } else {
                        resolve({ success: false, message: output });
                    }
                });
            });

            if (result.success) return result;

            console.warn(`⚠️ Command failed, retrying in 1s... (${i + 1}/${retries})`);
            await new Promise(r => setTimeout(r, 1000));
        }

        return { success: false, message: `Command failed after ${retries} attempts.` };
    }).catch(err => {
        console.error("❌ BLE Lock Error:", err);
        return { success: false, message: err.message };
    });
}

/**
 * Connect/Disconnect logic (Logical state)
 */
async function connectBle() {
    console.log(`🔗 Connecting to ${BLE_MAC}...`);
    const status = await checkStatus();
    if (status.online) {
        isConnected = true;
        return { success: true, message: 'Device connected successfully' };
    }
    return { success: false, message: 'Device not found or unreachable' };
}

async function disconnectBle() {
    console.log(`🔌 Disconnecting from ${BLE_MAC}...`);
    isConnected = false;
    return { success: true, message: 'Device disconnected' };
}

/**
 * Sends a BLE command to the ESP32 to unlock the door.
 */
async function unlockDoor() {
    if (isProcessing) {
        console.warn('⚠️ Door operation already in progress. Ignoring duplicate command.');
        return { success: false, message: 'Operation in progress' };
    }

    console.log(`🔓 Attempting to unlock door via BLE (${BLE_MAC})...`);
    isProcessing = true;

    try {
        const result = await runBleCommand('ON');

        if (result.success) {
            console.log('✅ Door unlocked successfully');
            isConnected = true;

            // Auto-relock after 7 seconds
            setTimeout(async () => {
                console.log('🔒 Auto-relocking door via BLE...');
                await runBleCommand('OFF');
                isProcessing = false;
                console.log('✅ Door relocked and system ready.');
            }, 7000);

            return { success: true, message: 'Door unlocked. Auto-relock in 7 seconds.' };
        }

        isProcessing = false; // Reset if failed
        return { success: false, message: `BLE Unlock failed: ${result.message}` };
    } catch (err) {
        isProcessing = false;
        return { success: false, message: `Critical error: ${err.message}` };
    }
}

/**
 * Sends a BLE command to the ESP32 to lock the door.
 */
async function lockDoor() {
    console.log(`🔒 Attempting to lock door via BLE (${BLE_MAC})...`);
    const result = await runBleCommand('OFF');
    if (result.success) {
        isProcessing = false;
        isConnected = true;
        console.log('✅ Door locked successfully');
        return { success: true, message: 'Door locked.' };
    }
    return { success: false, message: `BLE Lock failed: ${result.message}` };
}

/**
 * Checks if the ESP32 is online via BLE scanning.
 */
async function checkStatus() {
    const now = Date.now();
    if (statusCache && (now - lastStatusUpdate < 10000)) {
        console.log("💎 Returning cached BLE status...");
        return statusCache;
    }

    if (currentStatusPromise) {
        console.log("⏳ Status check already in progress, waiting...");
        return currentStatusPromise;
    }

    currentStatusPromise = (async () => {
        try {
            const result = await runBleCommand('STATUS');

            // Attempt to get RSSI if online
            let rssi = -100;
            if (result.success) {
                const scan = await runBleCommand('SCAN');
                if (scan.success && scan.devices) {
                    const dev = scan.devices.find(d => d.address.toUpperCase() === BLE_MAC.toUpperCase());
                    if (dev) rssi = dev.rssi;
                }
            }

            const status = {
                online: result.success,
                isConnected: result.success && isConnected,
                ip: null,
                port: null,
                name: process.env.ESP32_DEVICE_NAME || 'BLE Door Lock',
                mac: BLE_MAC,
                rssi: rssi,
                method: 'BLE',
                isLocked: !isProcessing,
                message: result.success ? 'Hardware Online (BLE)' : 'Hardware Offline (BLE Unreachable)'
            };

            statusCache = status;
            lastStatusUpdate = Date.now();
            return status;
        } finally {
            currentStatusPromise = null;
        }
    })();

    return currentStatusPromise;
}

/**
 * Returns device configuration information.
 */
function getDeviceInfo() {
    return {
        name: process.env.ESP32_DEVICE_NAME || 'BLE Door Lock',
        mac: BLE_MAC,
        method: 'BLE'
    };
}

module.exports = {
    unlockDoor,
    lockDoor,
    checkStatus,
    getDeviceInfo,
    runBleCommand,
    connectBle,
    disconnectBle
};
