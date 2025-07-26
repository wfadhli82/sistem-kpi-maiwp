import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: "flex", gap: 16, padding: 16, background: "#e3eafc",
      borderRadius: 12, marginBottom: 24, alignItems: "center"
    }}>
      <button onClick={() => navigate("/")} style={btnStyle}>Laman Utama</button>
      <button onClick={() => navigate("/admin")} style={btnStyle}>Admin</button>
      <button onClick={() => navigate("/user")} style={btnStyle}>User</button>
      <button onClick={() => navigate("/dashboard")} style={btnStyle}>Dashboard</button>
    </div>
  );
}

const btnStyle = {
  padding: "8px 20px",
  background: "#1976d2",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer"
}; 