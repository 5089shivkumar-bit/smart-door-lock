#include <Adafruit_Fingerprint.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <WiFi.h>
#include <time.h>

// --- Hardware Pins ---
const int RELAY_PIN = 23;
#define FINGER_RX 16
#define FINGER_TX 17

// --- Configuration ---
const char *ssid = "YOUR_WIFI_SSID";
const char *password = "YOUR_WIFI_PASSWORD";
const char *secret_token = "door_secret_pass_123";
const char *backend_url = "http://your_backend_ip:8000";

const long UNLOCK_DURATION = 5000;
const int MAX_FAILED_ATTEMPTS = 5;
const unsigned long LOCKOUT_TIME = 300000; // 5 minutes

// --- Global Objects ---
WebServer server(80);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&Serial2);
unsigned long unlockStartTime = 0;
bool isUnlocked = false;
int failedAttempts = 0;
unsigned long lockoutStartTime = 0;

void setup() {
  Serial.begin(115200);
  Serial2.begin(57600, SERIAL_8N1, FINGER_RX, FINGER_TX);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected: " + WiFi.localIP().toString());

  // Init Fingerprint Sensor
  finger.begin(57600);
  if (finger.verifyPassword()) {
    Serial.println("✅ Found fingerprint sensor!");
  } else {
    Serial.println("❌ Did not find fingerprint sensor :(");
  }

  // Init NTP for Replay Protection
  configTime(0, 0, "pool.ntp.org");

  server.on("/unlock", HTTP_POST, handleRemoteUnlock);
  server.begin();
}

void loop() {
  server.handleClient();
  handleAutoLock();

  if (millis() - lockoutStartTime > LOCKOUT_TIME || lockoutStartTime == 0) {
    checkFingerprint();
  } else {
    static unsigned long lastNotify = 0;
    if (millis() - lastNotify > 10000) {
      Serial.println("🔒 System Locked Out due to failed attempts.");
      lastNotify = millis();
    }
  }
}

void handleAutoLock() {
  if (isUnlocked && (millis() - unlockStartTime >= UNLOCK_DURATION)) {
    digitalWrite(RELAY_PIN, LOW);
    isUnlocked = false;
    Serial.println("🔒 Door Auto-Locked.");
  }
}

// --- Face/Remote Unlock Path ---
void handleRemoteUnlock() {
  // Bearer Check
  if (server.header("Authorization") != "Bearer " + String(secret_token)) {
    server.send(403, "application/json", "{\"error\":\"Forbidden\"}");
    return;
  }

  triggerUnlock("Remote/Face");
  server.send(200, "application/json", "{\"success\":true}");
}

// --- Fingerprint Path ---
void checkFingerprint() {
  uint8_t p = finger.getImage();
  if (p != FINGERPRINT_OK)
    return;

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK)
    return;

  p = finger.fingerFastSearch();
  if (p == FINGERPRINT_OK) {
    Serial.printf("✅ Match Found! ID #%d with confidence %d\n",
                  finger.fingerID, finger.confidence);
    failedAttempts = 0;
    triggerUnlock("Fingerprint", finger.fingerID);
  } else if (p == FINGERPRINT_NOTFOUND) {
    failedAttempts++;
    Serial.printf("❌ No Match. Failed attempts: %d/%d\n", failedAttempts,
                  MAX_FAILED_ATTEMPTS);
    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      lockoutStartTime = millis();
    }
    delay(1000);
  }
}

void triggerUnlock(String method, int id = 0) {
  Serial.println("🔓 Access Granted: " + method);
  digitalWrite(RELAY_PIN, HIGH);
  unlockStartTime = millis();
  isUnlocked = true;
  notifyBackend(method, id);
}

void notifyBackend(String method, int id) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(backend_url) + "/api/logs/iot");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + String(secret_token));

    StaticJsonDocument<200> doc;
    doc["method"] = method;
    doc["id"] = id;
    doc["status"] = "success";

    String json;
    serializeJson(doc, json);
    int httpCode = http.POST(json);
    http.end();
  }
}
