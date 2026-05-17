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

  FaWind

} from "react-icons/fa";

// =====================================================
//                    MQTT CLIENT
// =====================================================

const client = mqtt.connect(

  "wss://de9fcc2a2c21468eb9222078177ef4fa.s1.eu.hivemq.cloud:8884/mqtt",

  {

    username: "sanjoykh27",

    password: "Sanjoy@9862"
  }
);

function App() {

  const [data, setData] =

    useState({

      temperature: 0,

      ldr: 0,

      motion: 0,

      gas: 0,

      light: "OFF",

      fan: "OFF",

      lightAuto: true,

      fanAuto: true
    });

  // =====================================================
  //                  MQTT CONNECT
  // =====================================================

  useEffect(() => {

    client.on("connect", () => {

      console.log(
        "MQTT Connected"
      );

      client.subscribe(
        "home/sensors"
      );
    });

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

          setData(sensorData);
        }
      }
    );

  }, []);

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

    client.publish(

      "home/light",

      "AUTO"
    );
  };

  const toggleFanAuto = () => {

    client.publish(

      "home/fan",

      "AUTO"
    );
  };

  return (

    <div className="app">

      <div className="top-bar">

        <div>

          <h1>
            Smart Home Dashboard
          </h1>

          <p>
            MQTT Connected
          </p>

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

        onToggle={toggleLight}

        onAutoToggle={toggleLightAuto}
      />

      {/* FAN */}

      <DeviceControl

        title="Fan"

        subtitle="Living Room"

        state={data.fan === "ON"}

        auto={data.fanAuto}

        onToggle={toggleFan}

        onAutoToggle={toggleFanAuto}
      />

    </div>
  );
}

export default App;