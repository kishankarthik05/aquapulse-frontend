#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "LEGION";
const char* password = "123456789";
const char* serverUrl = "http://172.25.6.191:3000/api/sensor";

// Pin connections from pH module
#define PH_PIN   34   // Po → GPIO34
#define TEMP_PIN 35   // To → GPIO35

void setup() {
  Serial.begin(115200);

  // Set analog resolution (ESP32 default is fine but we define it)
  analogReadResolution(12); // values from 0-4095

  // Connect WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nAquaPulse ESP32 Connected!");
}

void loop() {

  // 🔵 Read raw analog values
  int phRaw   = analogRead(PH_PIN);
  int tempRaw = analogRead(TEMP_PIN);

  // Convert to voltage
  float phVoltage   = phRaw * (3.3 / 4095.0);
  float tempVoltage = tempRaw * (3.3 / 4095.0);

  // 📊 Convert voltage → pH value
  // This formula is approximate (you will calibrate later)
  float phValue = 7 + ((2.5 - phVoltage) / 0.18);

  // 🌡 Convert voltage → temperature
  // Approximate thermistor formula from HW-828
  float temperature = (tempVoltage - 0.5) * 100;

  // Print values to serial
  Serial.print("pH: ");
  Serial.print(phValue, 2);
  Serial.print("   Temp: ");
  Serial.println(temperature, 2);

  // 📡 Send data to server
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["temperature"] = temperature;
    doc["ph"] = phValue;
    doc["ammonia"] = 0.3;  // keep mock values
    doc["oxygen"] = 6.8;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);
    Serial.printf("HTTP Response code: %d\n", httpResponseCode);

    http.end();
  }

  delay(2000); // send every 2 sec
}