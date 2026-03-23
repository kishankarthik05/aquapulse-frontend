#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// WiFi Credentials
const char* ssid = "LEGION";
const char* password = "123456789";
const char* serverUrl = "http://172.25.6.85:3000/api/sensor";

// Pins
#define PH_PIN 34
#define TDS_PIN 35
#define TURB_PIN 32
#define SERVO_PIN 5
#define ONE_WIRE_BUS 15

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

bool feedProcessed = false; 

// -------------------- pH --------------------
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

// -------------------- TDS --------------------
float readTDS() {
    long sum = 0;
    for(int i = 0; i < 20; i++){
        sum += analogRead(TDS_PIN);
        delay(10);
    }
    float avg = sum / 20.0;
    float voltage = avg * (3.3 / 4095.0);

    // Simple approximate formula (can calibrate later)
    float tdsValue = (133.42 * voltage * voltage * voltage 
                    - 255.86 * voltage * voltage 
                    + 857.39 * voltage) * 0.5;

    return tdsValue; // ppm
}

// -------------------- Turbidity --------------------
float readTurbidity() {
    long sum = 0;
    for(int i = 0; i < 20; i++){
        sum += analogRead(TURB_PIN);
        delay(10);
    }
    float avg = sum / 20.0;
    float voltage = avg * (3.3 / 4095.0);

    // Rough conversion (clean water ≈ high voltage)
    float turbidity = 3000 - (voltage * 1000);

    return turbidity;
}

// -------------------- Servo --------------------
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

    // Temperature sensor setup
    pinMode(ONE_WIRE_BUS, INPUT_PULLUP); 
    delay(100); 
    sensors.begin();

    Serial.println("Scanning for Temperature Sensors...");
    if (sensors.getDeviceCount() == 0) {
        Serial.println("CRITICAL: No DS18B20 found!");
    } else {
        Serial.println("Temperature sensor detected!");
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

        // -------------------- GET Feed --------------------
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

        // -------------------- READ SENSORS --------------------
        sensors.requestTemperatures(); 
        float currentTemp = sensors.getTempCByIndex(0);

        if (currentTemp == -127.00) {
            sensors.begin();
            sensors.requestTemperatures();
            currentTemp = sensors.getTempCByIndex(0);
        }

        float currentPH = readPH();
        float currentTDS = readTDS();
        float currentTurb = readTurbidity();

        Serial.printf("Telemetry -> pH: %.2f | Temp: %.2f C | TDS: %.2f ppm | Turbidity: %.2f\n",
                      currentPH, currentTemp, currentTDS, currentTurb);

        // -------------------- POST DATA --------------------
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<256> docSend;

        docSend["ph"] = currentPH;
        docSend["tds"] = currentTDS;
        docSend["turbidity"] = currentTurb;

        if (currentTemp > -50 && currentTemp < 100) {
            docSend["temperature"] = currentTemp;
        } else {
            docSend["temperature"] = 0;
        }

        String requestBody;
        serializeJson(docSend, requestBody);
        http.POST(requestBody);

        http.end();
    }

    delay(2000);
}