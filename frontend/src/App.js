import {

  useEffect,

  useState

} from "react";

import mqtt from "mqtt";

import "./App.css";

import SensorCard
from "./components/SensorCard";

import DeviceControl
from "./components/DeviceControl";

import {

  FaTemperatureHigh,

  FaLightbulb,

  FaRunning,

  FaWind,

  FaTint

} from "react-icons/fa";

// =====================================================
//                    MQTT CLIENT
// =====================================================

const client = mqtt.connect(

  "wss://19cfde9f5b3e4395a47af67ca465d59d.s1.eu.hivemq.cloud:8884/mqtt",

  {

    username: "deepoosorai",

    password: "Hisoka@987"
  }
);

function App() {

  const [data, setData] =

useState({

  temperature: 0,

  humidity: 0,

  ldr: 0,

  motion: 0,

  gas: 0,

  light: "OFF",

  fan: "OFF",

  autoLight: "OFF",

  lightAuto: true,

  fanAuto: true
});

const [online, setOnline] =
  useState(false);

const [lastSeen, setLastSeen] =
  useState(Date.now());

  // =====================================================
  //                  MQTT CONNECT
  // =====================================================

  useEffect(() => {

  // ============================================
  // MQTT CONNECT
  // ============================================

  client.on("connect", () => {

    console.log(
      "MQTT Connected"
    );

    client.subscribe(
      "home/sensors"
    );
  });

  // ============================================
  // MQTT MESSAGE
  // ============================================

  client.on(

    "message",

    (topic, message) => {

      if (
        topic === "home/sensors"
      ) {

        const sensorData =

          JSON.parse(
            message.toString()
          );

        // Update sensor data

        setData(sensorData);

        // ESP32 ONLINE

        setOnline(true);

        // Update heartbeat

        setLastSeen(
          Date.now()
        );
      }
    }
  );

  // ============================================
  // HEARTBEAT CHECK
  // ============================================

  const checkESP32 =

    setInterval(() => {

      const now = Date.now();

      // No sensor data for 5 sec

      if (

        now - lastSeen > 5000

      ) {

        setOnline(false);
      }

    }, 1000);

  // ============================================
  // CLEANUP
  // ============================================

  return () => {

    clearInterval(
      checkESP32
    );
  };

}, [lastSeen]);

  // =====================================================
  //                  LIGHT CONTROL
  // =====================================================

  const toggleLight = () => {

    client.publish(

      "home/light",

      data.light === "ON"
        ? "OFF"
        : "ON"
    );
  };

  // =====================================================
  //                    FAN CONTROL
  // =====================================================

  const toggleFan = () => {

    client.publish(

      "home/fan",

      data.fan === "ON"
        ? "OFF"
        : "ON"
    );
  };

  // =====================================================
  //                    AUTO MODE
  // =====================================================

  const toggleLightAuto = () => {

  if (data.lightAuto) {

    client.publish(
      "home/light",
      "MANUAL"
    );

  } else {

    client.publish(
      "home/light",
      "AUTO"
    );
  }
};

  const toggleFanAuto = () => {

  if (data.fanAuto) {

    client.publish(
      "home/fan",
      "MANUAL"
    );

  } else {

    client.publish(
      "home/fan",
      "AUTO"
    );
  }
};

  return (

    <div className="app">

      {
  !online && (

    <div className="offline-banner">

      <div className="offline-card">

        <div className="wifi-icon">

          📡

        </div>

        <h2>
          ESP32 Offline
        </h2>

        <p>

          Waiting for device
          connection...

        </p>

      </div>

    </div>
  )
}

      <div className="top-bar">

        <div>

          <h1>
            Smart Home Dashboard
          </h1>

          <div className="connection-status">

  <div
    className={
      online
        ? "status-dot online"
        : "status-dot offline"
    }
  ></div>

  <p>

    {
      online

      ? "ESP32 Connected"

      : "ESP32 Not Connected"
    }

  </p>

</div>

        </div>

      </div>

      {/* ================================================= */}
      {/*                  SENSOR SECTION                   */}
      {/* ================================================= */}

      <h2 className="section-title">
        SENSOR READINGS
      </h2>

      <div className="sensor-grid">

        <SensorCard
          title="Temperature"
          value={`${data.temperature}°C`}
          status="NORMAL"
          color="#7c3aed"
          icon={<FaTemperatureHigh />}
        />

        <SensorCard
          title="Humidity"
          value={`${data.humidity}%`}
          status="NORMAL"
          color="#0ea5e9"
          icon={<FaTint />}
        />

        <SensorCard
          title="Light Intensity"
          value={data.ldr}
          status={
            data.ldr > 2000
              ? "DARK"
              : "BRIGHT"
          }
          color="#facc15"
          icon={<FaLightbulb />}
        />

        <SensorCard
  title="Street Light"
  value={data.autoLight}
  status={
    data.autoLight === "ON"
      ? "DARK"
      : "BRIGHT"
  }
  color="#f59e0b"
  icon={<FaLightbulb />}
/>

        <SensorCard
          title="Motion Status"
          value={
            data.motion
              ? "Detected"
              : "No Motion"
          }
          status="ACTIVE"
          color="#22c55e"
          icon={<FaRunning />}
        />

        <SensorCard
          title="Gas Level"
          value={data.gas}
          status={
            data.gas > 2500
              ? "DANGER"
              : "SAFE"
          }
          color="#ef4444"
          icon={<FaWind />}
        />

      </div>

      {/* ================================================= */}
      {/*                APPLIANCE SECTION                  */}
      {/* ================================================= */}

      <h2 className="section-title">
        APPLIANCE CONTROL
      </h2>

      {/* LIGHT */}

      <DeviceControl

  title="Light"

  subtitle="Living Room"

  state={data.light === "ON"}

  auto={data.lightAuto}

  onToggle={
    online
      ? toggleLight
      : null
  }

  onAutoToggle={
    online
      ? toggleLightAuto
      : null
  }
/>

      {/* FAN */}

      <DeviceControl

  title="Fan"

  subtitle="Living Room"

  state={data.fan === "ON"}

  auto={data.fanAuto}

  onToggle={
    online
      ? toggleFan
      : null
  }

  onAutoToggle={
    online
      ? toggleFanAuto
      : null
  }
/>
    </div>
  );
}

export default App;