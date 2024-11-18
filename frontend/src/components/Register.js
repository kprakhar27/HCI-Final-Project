import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(''); // For assigning roles
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/auth/register', {
                username,
                password,
                role,
            });
            setSuccess('Registration successful!');
            setError('');
            navigate('/cgdashboard');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError('A user with this username already exists.');
            } else {
                setError('Registration failed. Please try again.');
            }
            setSuccess('');
        }
    };

    // Handle "Back to Login" button click
    const handleGoBack = () => {
        navigate('/'); // Navigate back to login page
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Role (e.g., Caregiver)"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
            </form>
            <button className="back-to-login" onClick={handleGoBack}>
                Back to Login
            </button>
        </div>
    );
};

export default RegisterPage;
