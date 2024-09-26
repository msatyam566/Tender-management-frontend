import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import CryptoJS from 'crypto-js';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsLoggedIn, setUserRole }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState(''); // Add error state
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // POST request to your backend API
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);

            // Extract the token and user role from the response
            const { token } = response.data;
            const decodedToken = jwtDecode(token);

            const { role } = decodedToken


            // Encrypting the token and role using a secret key
            
            const secretKey = 'tendermanagement123'; 
            const encryptedToken = CryptoJS.AES.encrypt(token, secretKey).toString();
            const encryptedRole = CryptoJS.AES.encrypt(role, secretKey).toString();


            // Storing token and user role in localStorage by encrypting it
            localStorage.setItem('token', encryptedToken);
            localStorage.setItem('def', encryptedRole);

            // Update state in the parent component (App)
            setIsLoggedIn(true);
            setUserRole(role);

            // Navigate the user based on their role
            if (role === 'admin') {
                navigate('/admin'); // Navigate to admin panel
            } else if (role === 'user') {
                navigate('/user'); // Navigate to user panel
            }

        } catch (error) {
            console.error('Login failed:', error);
            setErrorMessage('Login failed server error'); 
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error message */}
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    );
};

export default Login;
