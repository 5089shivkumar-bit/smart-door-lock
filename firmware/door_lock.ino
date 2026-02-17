#include <WebServer.h>
#include <WiFi.h>


const char *ssid = "YOUR_WIFI_SSID";
const char *password = "YOUR_WIFI_PASSWORD";
const char *secret_token = "my_secure_token";

WebServer server(80);
const int RELAY_PIN = 23; // GPIO connected to Relay

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Initially Locked

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected: " + WiFi.localIP().toString());

  server.on("/unlock", HTTP_POST, handleUnlock);
  server.begin();
}

void loop() { server.handleClient(); }

void handleUnlock() {
  if (!server.hasHeader("Authorization")) {
    server.send(401, "text/plain", "Unauthorized");
    return;
  }

  String authHeader = server.header("Authorization");
  if (authHeader != "Bearer " + String(secret_token)) {
    server.send(403, "text/plain", "Forbidden");
    return;
  }

  // Unlock Procedure
  Serial.println("Unlocking Door...");
  digitalWrite(RELAY_PIN, HIGH);
  server.send(200, "text/plain", "Unlocked");

  delay(5000); // Keep open for 5 seconds

  digitalWrite(RELAY_PIN, LOW);
  Serial.println("Door Locked.");
}
