import React from "react";

import Sidebar
from "../../components/Sidebar/Sidebar";

function Analytics() {

  return (

    <div style={{
      display: "flex",
      background: "#0f172a",
      minHeight: "100vh",
      color: "white"
    }}>

      <Sidebar />

      <div style={{
        marginLeft: "250px",
        padding: "30px"
      }}>

        <h1>Analytics Page</h1>

      </div>

    </div>

  );
}

export default Analytics;