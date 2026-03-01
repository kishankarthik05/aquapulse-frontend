#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "LEGION";
const char* password = "123456789";

// Updated to your Hotspot Gateway IP based on your ipconfig
const char* serverUrl = "http://10.160.204.180:3000/api/sensor"; 

// Pin definitions
#define PH_PIN 34 

void setup() {
  Serial.begin(115200);
  
  // Set resolution to 12-bit (0-4095) for better accuracy
  analogReadResolution(12); 
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nAquaPulse ESP32 Connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // 1. Read actual sensor value
    int rawValue = analogRead(PH_PIN);
    
    // 2. Convert to pH (This is a basic linear map; calibrate as needed)
    // 0v = pH 0, 3.3v (4095) = pH 14
    float phValue = (rawValue / 4095.0) * 14.0;

    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["temperature"] = 26.5; // Keeping temp mock for now
    doc["ph"] = phValue;       // REAL SENSOR DATA
    doc["ammonia"] = 0.3;
    doc["oxygen"] = 6.8;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);
    Serial.printf("pH: %.2f | HTTP: %d\n", phValue, httpResponseCode);
    
    http.end();
  }
  // Fast refresh for sequential graphing
  delay(500); 
}