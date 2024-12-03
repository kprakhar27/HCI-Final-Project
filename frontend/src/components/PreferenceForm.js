import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PreferenceForm.css';
import axios from 'axios';

function PreferenceForm() {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [occupation, setOccupation] = useState('');
    const [topic, setTopic] = useState('');
    const [disorderDetails, setDisorderDetails] = useState('');
    const [isDiagnosed, setIsDiagnosed] = useState('');
    const [caregiverUsername, setCaregiverUsername] = useState('');
    const [level, setLevel] = useState('');
    const [status, setStatus] = useState('notexist');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const [theme, setTheme] = useState("light");
    const [fontSize, setFontSize] = useState(16);


    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    });


    // Keyboard Navigation
    const handleKeyDown = (event) => {

        if (event.ctrlKey && event.key === 't') {
            event.preventDefault();
            setTheme(theme === 'light' ? 'dark' : 'light');
        }

        if (event.ctrlKey && event.key === '-') {
            event.preventDefault();
            setFontSize(Math.max(12, fontSize - 2));
        }

        if (event.ctrlKey && event.key === '=') {
            event.preventDefault();
            setFontSize(Math.min(24, fontSize + 2));
        }

        if (event.ctrlKey && event.key === 'f') {
            event.preventDefault();
            navigate('/feedback');
        }

        if (event.ctrlKey && event.key === 'm') {
            event.preventDefault();
            navigate('/main');
        }

        if (event.ctrlKey && event.key === 'l') {
            event.preventDefault();
            handleLogout();
        }
    };

    // Accessibility: Theme and Font Size Management
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.fontSize = `${fontSize}px`;
    }, [theme, fontSize]);

    // Check if token is valid on component load
    useEffect(() => {
        const checkTokenValidity = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/'); // No token found, redirect to login
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/auth/validate-token', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    localStorage.removeItem('access_token'); // Clear invalid token
                    navigate('/');
                }
            } catch (error) {
                console.error('Error validating token:', error);
                localStorage.removeItem('access_token'); // Clear invalid token
                navigate('/');
            }
        };

        const setDefaultValues = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/user/getprofile', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if (data.status === "success") {
                    setStatus("success");
                    setName(data.name);
                    setAge(data.age);
                    setOccupation(data.occupation)
                    setTopic(data.topic);
                    setDisorderDetails(data.disorder_details);
                    setIsDiagnosed(data.is_diagnosed);
                    setCaregiverUsername(data.cg_name);
                    setLevel(data.level);
                }
            } catch (error) {
                console.error('Error getting profile', error);
            }
        };

        setDefaultValues();
        checkTokenValidity();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status !== "success") {
            try {
                const response = await axios.post('http://127.0.0.1:8000/user/addprofile', {
                    name,
                    age,
                    occupation,
                    topic,
                    disorderDetails,
                    isDiagnosed,
                    level,
                    caregiverUsername,
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.status === "success") {
                    setSuccess('Preferences saved successfully!');
                    setError('');
                    alert('Successfully saved profile');
                    navigate('/main'); // Optionally reload the page or redirect to login page.
                }
                else {
                    alert('Could not save preferences.');
                }
            } catch (error) {
                setError('Failed to save preferences. Please try again.');
                setSuccess('');
            }
        } else {
            try {
                const response = await axios.post('http://127.0.0.1:8000/user/updateprofile', {
                    name,
                    age,
                    occupation,
                    topic,
                    disorderDetails,
                    isDiagnosed,
                    level,
                    caregiverUsername,
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.status === "success") {
                    setSuccess('Preferences updated successfully!');
                    setError('');
                    alert('Successfully updated profile');
                    navigate('/profile'); // Optionally reload the page or redirect to login page.
                }
                else {
                    alert('Could not update preferences.');
                }
            } catch (error) {
                setError('Failed to update preferences. Please try again.');
                setSuccess('');
            }
        }
    };

    // Handle logout functionality
    const handleLogout = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/logout', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Send access token in Authorization header
                },
            });

            if (response.ok) {
                localStorage.removeItem('access_token'); // Remove access token from localStorage on successful logout
                alert('Successfully logged out.');
                window.location.reload(); // Optionally reload the page or redirect to login page.
            } else {
                alert('Logout failed.');
            }
        } catch (error) {
            console.error('Error logging out:', error);
            alert('An error occurred during logout.');
        }
    };

    const handleDeleteProfile = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete your profile? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            const response = await axios.post('http://127.0.0.1:8000/user/deleteprofile', {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log(response)
            console.log(localStorage.getItem('token'))

            if (response.data.status === "success") {
                alert('Profile deleted successfully.');
                localStorage.removeItem('token');
                navigate('/'); // Redirect to login page
            } else {
                console.log('here')
                alert('Could not delete profile. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting profile:', error);
            alert('An error occurred while trying to delete the profile.');
        }
    };

    return (
        <div className="preference-form-container">
            {/* Navbar with Logout and Profile buttons */}
            <div className="navbar">
                <button onClick={handleLogout} className="navbar-button">Logout</button>
                <Link to="/main">
                    <button className="navbar-button">Go to Chat</button>
                </Link>
                <Link to="/feedback">
                    <button className="navbar-button">Feedback</button>
                </Link>
                <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    aria-label="Toggle Dark Mode"
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                <div className="font-controls">
                    <button
                        onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                        aria-label="Decrease Text Size"
                    >
                        A-
                    </button>
                    <button
                        onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                        aria-label="Increase Text Size"
                    >
                        A+
                    </button>
                </div>
            </div>

            <h2>Set Your Preferences</h2>
            <form onSubmit={handleSubmit}>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}

                <label>
                    Name:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Age:
                    <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Occupation:
                    <input
                        type="text"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Anything specific you want to talk about?
                    <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                    >
                        <option value={topic}>{topic}</option>
                        <option value="Nothing in particular">Nothing in particular</option>
                        <option value="daily planning">Daily planning</option>
                        <option value="health">Health (physical/mental)</option>
                        <option value="grooming">Grooming</option>
                        <option value="household chores">Household chores</option>
                        <option value="financial management">Financial management</option>
                        <option value="work study">Work or study</option>
                        <option value="job evaluation">Job evaluation criteria</option>
                        <option value="social relationships">Social relationships and communication</option>
                        <option value="small talk">Small talk</option>
                    </select>
                </label>



                <label>
                    Are you diagnosed?
                    <select
                        value={isDiagnosed}
                        onChange={(e) => setIsDiagnosed(e.target.value)}
                        required
                    >
                        <option value={isDiagnosed}>{isDiagnosed}</option>
                        <option value="yes">Yes</option>
                    </select>
                </label>

                <label>
                    Anything you would like the AI assistant to make note of?
                    <textarea
                        value={disorderDetails}
                        onChange={(e) => setDisorderDetails(e.target.value)}
                    />
                </label>

                <label>
                    Do you have a caregiver? If yes, what is their username (you can add it later as well):
                    <input
                        type="text"
                        value={caregiverUsername}
                        onChange={(e) => setCaregiverUsername(e.target.value)}
                        placeholder="Enter caregiver username"
                    />
                </label>

                <label>
                    How would you like the AI assistant to respond? You can choose how simple or detailed the answers should be
                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                    >
                        <option value={level}>{level}</option>
                        <option value="Simple and Clear">Simple and Clear</option>
                        <option value="Detailed and Explanatory">Detailed and Explanatory</option>
                        <option value="Friendly and Casual">Friendly and Casual</option>
                        {/* <option value="factual">Just the Fact</option> */}
                    </select>
                </label>

                <button type="submit">Save Preferences</button>


                <button
                    type="button"
                    className="delete-button"
                    onClick={handleDeleteProfile}
                >
                    Delete Profile
                </button>
            </form>
        </div>
    );
}

export default PreferenceForm;
