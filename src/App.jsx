import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login/Login';
import AdminPanel from './components/AdminPanel/AdminPanel';
import UserPanel from './components/UserPanel/UserPanel';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token'); // Get token from local storage
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Decode the token
        setIsLoggedIn(true);
        setUserRole(decodedToken.role); // Set the user role from the token
      } catch (error) {
        console.error("Invalid token", error);
        setIsLoggedIn(false); // Set login to false if the token is invalid
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={isLoggedIn ? <Navigate to={userRole === 'admin' ? '/admin' : '/user'} /> : <Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />} 
        />
        <Route 
          path="/admin" 
          element={userRole === 'admin' ? <AdminPanel /> : <Navigate to="/" />} 
        />
        <Route 
          path="/user" 
          element={userRole === 'user' ? <UserPanel /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
