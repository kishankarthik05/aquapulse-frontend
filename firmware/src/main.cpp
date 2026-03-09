#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

// WiFi
const char* ssid = "LEGION";
const char* password = "123456789";
const char* serverUrl = "http://172.25.7.204:3000/api/sensor";

// Pins
#define PH_PIN 34
#define SERVO_PIN 18
#define BUTTON_PIN 4

Servo feederServo;
bool lastButtonState = HIGH;


// ===== Function to read stable pH =====
float readPH() {

  long sum = 0;

  for(int i = 0; i < 20; i++){
    sum += analogRead(PH_PIN);
    delay(10);
  }

  float avg = sum / 20.0;

  float voltage = avg * (3.3 / 4095.0);

  // Custom calibration based on your measured voltage
  float phValue = 7 + (0.5 - voltage) * 10;

  Serial.print("Voltage: ");
  Serial.print(voltage,3);

  Serial.print(" | pH: ");
  Serial.println(phValue,2);

  return phValue;
}



void setup() {

  Serial.begin(115200);

  analogReadResolution(12);

  pinMode(BUTTON_PIN, INPUT_PULLUP);

  feederServo.attach(SERVO_PIN);
  feederServo.write(0);


  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nAquaPulse ESP32 Connected!");
}



void loop() {

  // ===== 1️⃣ MANUAL BUTTON FEED =====
  bool buttonState = digitalRead(BUTTON_PIN);

  if (lastButtonState == HIGH && buttonState == LOW) {

    Serial.println("Manual feeding triggered");

    feederServo.write(180);
    delay(1500);

    feederServo.write(0);
    delay(800);
  }

  lastButtonState = buttonState;



  if (WiFi.status() == WL_CONNECTED) {

    // ===== 2️⃣ WEBSITE FEED COMMAND =====
    HTTPClient httpCheck;

    httpCheck.begin(serverUrl);

    int code = httpCheck.GET();

    if(code == 200){

      String payload = httpCheck.getString();

      StaticJsonDocument<256> doc;

      deserializeJson(doc, payload);

      bool feedNow = doc["feed"];

      if(feedNow){

        Serial.println("Website feeding triggered!");

        feederServo.write(180);
        delay(1500);

        feederServo.write(0);
        delay(800);
      }
    }

    httpCheck.end();



    // ===== 3️⃣ READ PH SENSOR =====
    float phValue = readPH();



    // ===== 4️⃣ SEND DATA TO SERVER =====
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

    Serial.printf("Data sent | HTTP: %d\n", httpResponseCode);

    http.end();
  }

  delay(1000);
}