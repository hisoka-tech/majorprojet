import React from "react";

import "./DeviceCard.css";

function DeviceCard({
  device,
  status
}) {

  return (

    <div className="device-card">

      <h3>{device}</h3>

      <button>
        {status}
      </button>

    </div>

  );
}

export default DeviceCard;