#include <Arduino.h>
#include <WiFi.h>
#include <DHT.h>

#include <WiFiClientSecure.h>
#include <PubSubClient.h>

// =====================================================
//                    WIFI SETTINGS
// =====================================================

 const char* ssid = "ESP32";
 const char* password = "12345678";




// =====================================================
//                    MQTT SETTINGS
// =====================================================

const char* mqtt_server =
"19cfde9f5b3e4395a47af67ca465d59d.s1.eu.hivemq.cloud";

const int mqtt_port = 8883;

const char* mqtt_user =
"deepoosorai";

const char* mqtt_password =
"Hisoka@987";

// =====================================================
//                    MQTT CLIENT
// =====================================================

WiFiClientSecure espClient;

PubSubClient client(espClient);

// =====================================================
//                     PIN SETUP
// =====================================================

#define LIGHT_RELAY_PIN   22
#define FAN_RELAY_PIN     23
#define AUTO_LIGHT_RELAY  27

#define PIR_PIN           18

#define LDR_PIN           34
#define MQ2_PIN           35

#define DHT_PIN           4
#define DHT_TYPE          DHT11

// =====================================================
//                    DHT SENSOR
// =====================================================

DHT dht(DHT_PIN, DHT_TYPE);

// =====================================================
//                  THRESHOLDS
// =====================================================

#define DARK_THRESHOLD    2200
#define LIGHT_THRESHOLD   1800

#define TEMP_THRESHOLD    33
#define GAS_THRESHOLD     2500

// =====================================================
//                     TIMER
// =====================================================

const unsigned long fanDelay = 10000;

unsigned long lastFanMotionTime = 0;

const unsigned long lightDelay = 10000;

unsigned long lastLightMotionTime = 0;

// =====================================================
//                     STATES
// =====================================================

bool darkState = false;

bool lightState = false;

bool fanState = false;

bool gasDetected = false;

// =====================================================
//               MANUAL CONTROL STATES
// =====================================================

bool manualLight = true;

bool manualFan = true;

// =====================================================
//                  STABLE LDR READ
// =====================================================

int readLDR() {

    long total = 0;

    for (int i = 0; i < 10; i++) {

        total += analogRead(LDR_PIN);

        delay(2);
    }

    return total / 10;
}

// =====================================================
//                    MQTT CALLBACK
// =====================================================

void callback(
    char* topic,
    byte* payload,
    unsigned int length
) {

    String message;

    for (int i = 0; i < length; i++) {

        message += (char)payload[i];
    }

    String topicStr =
        String(topic);

    Serial.print("Topic: ");

    Serial.println(topicStr);

    Serial.print("Message: ");

    Serial.println(message);

    // =================================================
    //                    LIGHT
    // =================================================

    if (topicStr == "home/light") {

        if (message == "ON") {

            manualLight = true;

            lightState = true;
        }

        else if (message == "OFF") {

            manualLight = true;

            lightState = false;
        }

        else if (message == "AUTO") {

    manualLight = false;
}

else if (message == "MANUAL") {

    manualLight = true;
}

    }

    // =================================================
    //                      FAN
    // =================================================

    if (topicStr == "home/fan") {

        if (message == "ON") {

            manualFan = true;

            fanState = true;
        }

        else if (message == "OFF") {

            manualFan = true;

            fanState = false;
        }

        else if (message == "AUTO") {

    manualFan = false;
}

else if (message == "MANUAL") {

    manualFan = true;
}
    }
}

// =====================================================
//                  MQTT RECONNECT
// =====================================================

void reconnect() {

    while (!client.connected()) {

        Serial.println(
            "Connecting MQTT..."
        );

        if (

            client.connect(
                "ESP32Client",
                mqtt_user,
                mqtt_password
            )

        ) {

            Serial.println(
                "MQTT Connected"
            );

            client.subscribe(
                "home/light"
            );

            client.subscribe(
                "home/fan"
            );

        } else {

            Serial.print(
                "MQTT Failed: "
            );

            Serial.println(
                client.state()
            );

            delay(2000);
        }
    }
}

// =====================================================
//                        SETUP
// =====================================================

void setup() {

    Serial.begin(115200);

    dht.begin();

    pinMode(
        LIGHT_RELAY_PIN,
        OUTPUT
    );

    pinMode(
        FAN_RELAY_PIN,
        OUTPUT
    );

    pinMode(
        AUTO_LIGHT_RELAY,
        OUTPUT
    );

    pinMode(
        PIR_PIN,
        INPUT
    );

    pinMode(
        MQ2_PIN,
        INPUT
    );

    // =================================================
    //                INITIAL STATES
    // =================================================

    // Light relay active LOW

    digitalWrite(
        LIGHT_RELAY_PIN,
        HIGH
    );

    // Fan relay active HIGH

    digitalWrite(
        FAN_RELAY_PIN,
        LOW
    );

    digitalWrite(
        AUTO_LIGHT_RELAY,
        LOW
    );

    // =================================================
    //                  WIFI CONNECT
    // =================================================

    WiFi.begin(
        ssid,
        password
    );

    Serial.print(
        "Connecting WiFi"
    );

    while (
        WiFi.status() != WL_CONNECTED
    ) {

        delay(500);

        Serial.print(".");
    }

    Serial.println();

    Serial.println(
        "WiFi Connected"
    );

    Serial.print(
        "IP Address: "
    );

    Serial.println(
        WiFi.localIP()
    );

    // =================================================
    //                    MQTT SETUP
    // =================================================

    espClient.setInsecure();

    client.setServer(
        mqtt_server,
        mqtt_port
    );

    client.setCallback(callback);
}

// =====================================================
//                         LOOP
// =====================================================

void loop() {

    // =================================================
    //                  MQTT CONNECT
    // =================================================

    if (!client.connected()) {

        reconnect();
    }

    client.loop();

    // =================================================
    //                  SENSOR READ
    // =================================================

    int motion =
        digitalRead(PIR_PIN);

    int ldrValue =
        readLDR();

    int gasValue =
        analogRead(MQ2_PIN);

    float temperature =
        dht.readTemperature();

    float humidity =
        dht.readHumidity();

    // =================================================
    //                DARK/BRIGHT STABILITY
    // =================================================

    if (

        !darkState &&

        ldrValue > DARK_THRESHOLD

    ) {

        darkState = true;
    }

    if (

        darkState &&

        ldrValue < LIGHT_THRESHOLD

    ) {

        darkState = false;
    }

    // =================================================
    //                  LIGHT AUTO
    // =================================================

    if (!manualLight) {

        if (

            darkState &&

            motion == HIGH

        ) {

            lastLightMotionTime =
                millis();
        }

        if (!darkState) {

            lightState = false;
        }

        else {

            lightState =

                (

                    millis() -

                    lastLightMotionTime

                    <= lightDelay
                );
        }
    }

    // =================================================
    //                    FAN AUTO
    // =================================================

    gasDetected =
        (gasValue > GAS_THRESHOLD);

    if (!manualFan) {

        if (

            motion == HIGH &&

            temperature >= TEMP_THRESHOLD

        ) {

            lastFanMotionTime =
                millis();
        }

        fanState =

            gasDetected ||

            (

                temperature >=
                TEMP_THRESHOLD &&

                (

                    millis() -

                    lastFanMotionTime

                    <= fanDelay
                )
            );
    }


    // =================================================
    //          AUTO DARK BULB (NEW RELAY)
    // =================================================

    // LDR values above DARK_THRESHOLD mean darkness

    digitalWrite(

         AUTO_LIGHT_RELAY,

         darkState ? LOW : HIGH

    );


    // =================================================
    //                 RELAY CONTROL
    // =================================================

    // Light relay active LOW

    digitalWrite(

        LIGHT_RELAY_PIN,

        lightState ? LOW : HIGH
    );

    // Fan relay active HIGH

    digitalWrite(

        FAN_RELAY_PIN,

        fanState ? HIGH : LOW
    );

    // =================================================
    //               MQTT SENSOR JSON
    // =================================================

    String sensorJson = "{";

    sensorJson += "\"temperature\":";
    sensorJson += String(temperature);
    sensorJson += ",";

    sensorJson += "\"humidity\":";
    sensorJson += String(humidity);
    sensorJson += ",";

    sensorJson += "\"ldr\":";
    sensorJson += String(ldrValue);
    sensorJson += ",";

    sensorJson += "\"motion\":";
    sensorJson += String(motion);
    sensorJson += ",";

    sensorJson += "\"gas\":";
    sensorJson += String(gasValue);
    sensorJson += ",";

    sensorJson += "\"light\":\"";
    sensorJson += lightState ? "ON" : "OFF";
    sensorJson += "\",";

    sensorJson += "\"fan\":\"";
    sensorJson += fanState ? "ON" : "OFF";
    sensorJson += "\",";

    sensorJson += "\"autoLight\":\"";
sensorJson += (darkState ? "ON" : "OFF");
sensorJson += "\",";

    sensorJson += "\"lightAuto\":";
    sensorJson += manualLight ? "false" : "true";
    sensorJson += ",";

    sensorJson += "\"fanAuto\":";
    sensorJson += manualFan ? "false" : "true";

    sensorJson += "}";

    // =================================================
    //               PUBLISH SENSORS
    // =================================================

    client.publish(

        "home/sensors",

        sensorJson.c_str()
    );

    delay(1000);
}