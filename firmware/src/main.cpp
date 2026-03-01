#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

// WiFi
const char* ssid = "LEGION";
const char* password = "123456789";
const char* serverUrl = "http://10.160.204.180:3000/api/sensor";

// Sensor pin
#define PH_PIN 34 

// Servo + Button pins
#define SERVO_PIN 18
#define BUTTON_PIN 4

Servo feederServo;
bool lastButtonState = HIGH;

void setup() {
  Serial.begin(115200);

  analogReadResolution(12);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  feederServo.attach(SERVO_PIN);
  feederServo.write(0); // start position

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nAquaPulse ESP32 Connected!");
}

void loop() {

  // ===== 1️⃣ PHYSICAL BUTTON FEED =====
  bool buttonState = digitalRead(BUTTON_PIN);

  if (lastButtonState == HIGH && buttonState == LOW) {
    Serial.println("Manual feeding triggered");

    feederServo.write(180);
    delay(1500);
    feederServo.write(0);
    delay(800);
  }
  lastButtonState = buttonState;


  // ===== 2️⃣ WEBSITE FEED CHECK =====
  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient httpCheck;
    httpCheck.begin(serverUrl);
    int code = httpCheck.GET();

    if (code == 200) {
      String payload = httpCheck.getString();

      StaticJsonDocument<256> doc;
      deserializeJson(doc, payload);

      bool feedNow = doc["feed"];

      if (feedNow) {
        Serial.println("Website feeding triggered!");

        feederServo.write(180);
        delay(1500);
        feederServo.write(0);
        delay(800);
      }
    }
    httpCheck.end();


    // ===== 3️⃣ SENSOR + SERVER UPLOAD =====
    int rawValue = analogRead(PH_PIN);
    float phValue = (rawValue / 4095.0) * 14.0;

    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> docSend;
    docSend["temperature"] = 26.5;
    docSend["ph"] = phValue;
    docSend["ammonia"] = 0.3;
    docSend["oxygen"] = 6.8;

    String requestBody;
    serializeJson(docSend, requestBody);

    int httpResponseCode = http.POST(requestBody);
    Serial.printf("pH: %.2f | HTTP: %d\n", phValue, httpResponseCode);

    http.end();
  }

  delay(500);
}