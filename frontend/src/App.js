import React from "react";

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";

import Dashboard from
"./pages/Dashboard/Dashboard";

import Control from
"./pages/Control/Control";

import Analytics from
"./pages/Analytics/Analytics";

import Alerts from
"./pages/Alerts/Alerts";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/control"
          element={<Control />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/alerts"
          element={<Alerts />}
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;