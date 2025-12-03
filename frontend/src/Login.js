import React, { useState } from "react";
import "./Auth.css";

const BASE_URL = "https://unvical.onrender.com";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login response:", data);

        // Ako login uspije, pozovi callback
        onLogin(data); 
      } else {
        alert("Invalid credentials");
      }
    } catch (err) {
      console.error("Error logging in:", err);
      alert("Login failed. Backend unreachable?");
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-background"></div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
