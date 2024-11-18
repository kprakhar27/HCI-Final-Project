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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

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

        checkTokenValidity();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
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

            if (response.ok) {
              setSuccess('Preferences saved successfully!');
              setError('');
              navigate('/main'); // Optionally reload the page or redirect to login page.
            } 
            else {
              alert('Logout failed.');
            }

             // Redirect to the patient dashboard
        } catch (error) {
            setError('Failed to save preferences. Please try again.');
            setSuccess('');
        }
    };

    // Handle logout functionality
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('access_token'); // Get access token from localStorage

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

    return (
      <div className="preference-form-container">
          {/* Navbar with Logout and Profile buttons */}
          <div className="navbar">
              <button onClick={handleLogout} className="navbar-button">Logout</button>
              <Link to="/profile">
                  <button className="navbar-button">Go to Chat</button>
              </Link>
              <Link to="/feedback">
                  <button className="navbar-button">Feedback</button>
              </Link>
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
                      <option value="">Select</option>
                      <option value="just_use">I would like to just use it</option>
                      <option value="daily_planning">Daily planning</option>
                      <option value="health">Health (physical/mental)</option>
                      <option value="grooming">Grooming</option>
                      <option value="household_chores">Household chores</option>
                      <option value="financial_management">Financial management</option>
                      <option value="work_study">Work or study</option>
                      <option value="job_evaluation">Job evaluation criteria</option>
                      <option value="social_relationships">Social relationships and communication</option>
                      <option value="small_talk">Small talk</option>
                  </select>
              </label>

              <label>
                  (If willing) Share some details about your disorder:
                  <textarea
                      value={disorderDetails}
                      onChange={(e) => setDisorderDetails(e.target.value)}
                  />
              </label>

              <label>
                  Are you diagnosed?
                  <select
                      value={isDiagnosed}
                      onChange={(e) => setIsDiagnosed(e.target.value)}
                      required
                  >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                  </select>
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
                  Level of severity:
                  <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                  >
                      <option value="">Select</option>
                      <option value="1">Level 1</option>
                      <option value="2">Level 2</option>
                      <option value="3">Level 3</option>
                  </select>
              </label>

              <button type="submit">Save Preferences</button>
          </form>
      </div>
  );
}

export default PreferenceForm;
