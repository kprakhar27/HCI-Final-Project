import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CGProfile.css';

function CGProfile() {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [occupation, setOccupation] = useState('');
    const [license, setLicense] = useState('');
    const [status, setStatus] = useState('notexist');
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

        const loadProfile = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/getprofile', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = response.data;
                if (data.status === "success") {
                    setStatus("success");
                    setName(data.name);
                    setAge(data.age);
                    setOccupation(data.occupation);
                    setLicense(data.license);
                }
            } catch (error) {
                console.error('Error loading caregiver profile:', error);
            }
        };

        loadProfile();
        checkTokenValidity();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status !== "success") {
            try {
                const response = await axios.post('http://127.0.0.1:8000/api/addprofile', {
                    name,
                    age,
                    occupation,
                    license,
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.status === "success") {
                    setSuccess('Profile saved successfully!');
                    setError('');
                    alert('Successfully saved profile');
                    navigate('/cgdashboard');
                } else {
                    alert('Could not save profile.');
                }
            } catch (error) {
                setError('Failed to save profile. Please try again.');
                setSuccess('');
            }
        } else {
            try {
                const response = await axios.post('http://127.0.0.1:8000/api/updateprofile', {
                    name,
                    age,
                    occupation,
                    license,
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.status === "success") {
                    setSuccess('Profile updated successfully!');
                    setError('');
                    alert('Successfully updated profile');
                    navigate('/CGprofile');
                } else {
                    alert('Could not update profile.');
                }
            } catch (error) {
                setError('Failed to update profile. Please try again.');
                setSuccess('');
            }
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/logout', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                localStorage.removeItem('access_token');
                alert('Successfully logged out.');
                window.location.reload();
            } else {
                alert('Logout failed.');
            }
        } catch (error) {
            console.error('Error logging out:', error);
            alert('An error occurred during logout.');
        }
    };

    return (
      <div className="profile-container">
          <div className="navbar">
              <button onClick={handleLogout} className="navbar-button">Logout</button>
              <Link to="/CGDashboard">
                  <button className="navbar-button">Go to Dashboard</button>
              </Link>
          </div>

          <h2>Caregiver Profile</h2>
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
                  />
              </label>

              <label>
                  License:
                  <input
                      type="text"
                      value={license}
                      onChange={(e) => setLicense(e.target.value)}
                  />
              </label>

              <button type="submit">Save Profile</button>
          </form>
      </div>
  );
}

export default CGProfile;
