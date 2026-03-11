#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// WiFi Credentials
const char* ssid = "LEGION";
const char* password = "123456789";
const char* serverUrl = "http://10.17.30.180:3000/api/sensor";

// Pins
#define PH_PIN 34
#define SERVO_PIN 18
#define ONE_WIRE_BUS 15

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

bool feedProcessed = false; 

float readPH() {
    long sum = 0;
    for(int i = 0; i < 20; i++){
        sum += analogRead(PH_PIN);
        delay(10);
    }
    float avg = sum / 20.0;
    float voltage = avg * (3.3 / 4095.0);
    return 7 + (1.5 - voltage) * 10;
}

void moveServoManual(int pulseUs) {
    for(int i = 0; i < 50; i++) { 
        digitalWrite(SERVO_PIN, HIGH);
        delayMicroseconds(pulseUs); 
        digitalWrite(SERVO_PIN, LOW);
        delay(20);
    }
}

void setup() {
    Serial.begin(115200);
    analogReadResolution(12);
    pinMode(SERVO_PIN, OUTPUT);

    // --- STEP 1: INTERNAL PULLUP ATTEMPT ---
    // This tries to use the ESP32's built-in resistor.
    pinMode(ONE_WIRE_BUS, INPUT_PULLUP); 
    delay(100); 
    
    sensors.begin();
    
    // --- STEP 2: SENSOR SCANNER ---
    Serial.println("Scanning for Temperature Sensors...");
    DeviceAddress tempDeviceAddress;
    if (sensors.getDeviceCount() == 0) {
        Serial.println("CRITICAL: No DS18B20 found! Check Wiring/Resistor.");
    } else {
        Serial.print("Success! Found ");
        Serial.print(sensors.getDeviceCount(), DEC);
        Serial.println(" sensor(s).");
    }

    moveServoManual(500);

    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi");
}

void loop() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        
        // --- 1️⃣ GET: Feed Command ---
        http.begin(serverUrl);
        if (http.GET() == 200) {
            StaticJsonDocument<256> doc;
            deserializeJson(doc, http.getString());
            bool serverSaysFeed = doc["feed"];
            if (serverSaysFeed && !feedProcessed) {
                moveServoManual(2400); 
                delay(1500); 
                moveServoManual(500);  
                feedProcessed = true; 
            } 
            if (!serverSaysFeed) feedProcessed = false;
        }
        http.end();

        // --- 2️⃣ READ SENSORS ---
        sensors.requestTemperatures(); 
        float currentTemp = sensors.getTempCByIndex(0);
        
        // If still -127, try to re-init
        if (currentTemp == -127.00) {
            sensors.begin();
            sensors.requestTemperatures();
            currentTemp = sensors.getTempCByIndex(0);
        }

        float currentPH = readPH();
        Serial.printf("Telemetry -> pH: %.2f | Temp: %.2f C\n", currentPH, currentTemp);

        // --- 3️⃣ POST: Send Data ---
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        StaticJsonDocument<256> docSend;
        docSend["ph"] = currentPH;
        
        // Only send valid temp data
        if (currentTemp > -50 && currentTemp < 100) {
            docSend["temperature"] = currentTemp;
        } else {
            docSend["temperature"] = 0; // Default to 0 if sensor is failing
        }
        
        String requestBody;
        serializeJson(docSend, requestBody);
        http.POST(requestBody);
        http.end();
    }
    delay(2000); 
}