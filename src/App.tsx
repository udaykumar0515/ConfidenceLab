import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import { getCurrentUser, logoutUser } from './utils/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser({ id: currentUser.id, name: currentUser.name, email: currentUser.email });
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setShowSignup(false);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setIsLoggedIn(false);
  };

  const handleSwitchToSignup = () => {
    setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignup(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {!isLoggedIn ? (
        showSignup ? (
          <Signup onSignup={handleLogin} onSwitchToLogin={handleSwitchToLogin} />
        ) : (
          <Login onLogin={handleLogin} onSwitchToSignup={handleSwitchToSignup} />
        )
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;