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
            console.log(response)
            setSuccess('Registration successful!');
            setError('');
            if (role === "caregiver"){
                navigate('/cgprofile');
            } else {
                const response = await axios.post('http://127.0.0.1:8000/user/checkprofile', { username }, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.data.response === "TRUE") {
                    navigate('/main')
                } else {
                    navigate('/profile')
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError('A user with this username already exists.');
            } else {
                setError('Registration failed. Please try again.');
            }
            setSuccess('');
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleSubmit}>
                <h2>Register for Adapt.AI</h2>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                
                <input
                    type="text"
                    placeholder="Enter Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                >
                    <option value="" disabled>Select Role</option>
                    <option value="caregiver">Caregiver</option>
                    <option value="user">User</option>
                </select>
                <button type="submit">Register</button>
                <p>Already have an account? <a href="/">Login</a></p>
            </form>
        </div>
    );
}    

export default RegisterPage;
