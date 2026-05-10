import React from "react";

import Sidebar from
"../../components/Sidebar/Sidebar";

import Navbar from
"../../components/Navbar/Navbar";

import SensorCard from
"../../components/SensorCard/SensorCard";

import DeviceCard from
"../../components/DeviceCard/DeviceCard";

function Dashboard() {

  return (

    <div
      style={{
        display: "flex",
        background: "#020617",
        minHeight: "100vh",
        color: "white"
      }}
    >

      <Sidebar />

      <div
        style={{
          marginLeft: "250px",
          width: "100%",
          padding: "30px"
        }}
      >

        <Navbar />

        {/* Sensor Cards */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",

            gap: "25px",

            marginTop: "30px"
          }}
        >

          <SensorCard
            title="Temperature"
            value="28°C"
          />

          <SensorCard
            title="Humidity"
            value="65%"
          />

          <SensorCard
            title="Motion"
            value="Detected"
          />

          <SensorCard
            title="Smoke"
            value="Safe"
          />

        </div>

        {/* Device Cards */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",

            gap: "25px",

            marginTop: "40px"
          }}
        >

          <DeviceCard
            device="Fan"
            status="ON"
          />

          <DeviceCard
            device="Bulb"
            status="OFF"
          />

        </div>

      </div>

    </div>

  );
}

export default Dashboard;