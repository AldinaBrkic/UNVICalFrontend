import React, { useState } from "react";
import MyCalendar from "./Calendar";
import Login from "./Login";
import Register from "./Register";
import "./Auth.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Ako korisnik nije logovan, prikazujemo login ili register formu
  if (!isLoggedIn) {
    return (
      <div className="auth-wrapper">
        <div className="auth-background"></div>
        {showRegister ? (
          <Register onRegister={() => setIsLoggedIn(true)} />
        ) : (
          <Login onLogin={() => setIsLoggedIn(true)} />
        )}
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setShowRegister(!showRegister)}
        >
          {showRegister ? "Already have an account? Login" : "New user? Register"}
        </button>
      </div>
    );
  }

  // Ako je korisnik logovan, prikazujemo kalendar sa logout dugmetom
  return <MyCalendar onLogout={() => setIsLoggedIn(false)} />;
}

export default App;
