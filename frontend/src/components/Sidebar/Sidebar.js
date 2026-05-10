import React from "react";

import "./Sidebar.css";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("token");

    navigate("/login");
  };

  return (

    <div className="sidebar">

      <h2 className="logo">
        SmartHome
      </h2>

      <ul className="menu">

        <li>
          <NavLink
            to="/dashboard"
            className="nav-item"
          >
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/control"
            className="nav-item"
          >
            Control
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/analytics"
            className="nav-item"
          >
            Analytics
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/alerts"
            className="nav-item"
          >
            Alerts
          </NavLink>
        </li>

      </ul>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        Logout
      </button>

    </div>

  );
}

export default Sidebar;