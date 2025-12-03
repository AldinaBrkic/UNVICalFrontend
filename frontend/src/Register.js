import React, { useState } from "react";
import "./Auth.css";

const BASE_URL = "https://unvical.onrender.com";

function Register({ onRegister }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Registration response:", data);
        onRegister(); // callback da prebacis korisnika na login ili dashboard
      } else {
        alert("Registration failed");
      }
    } catch (err) {
      console.error("Error registering:", err);
      alert("Registration failed. Backend unreachable?");
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-background"></div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
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
          autoComplete="new-password"
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
