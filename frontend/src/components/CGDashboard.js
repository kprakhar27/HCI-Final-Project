import React, { useState, useEffect } from 'react';
import PatientProfiles from './PatientProfiles';
import RequestPatientsButton from './RequestPatients';
import './CGDashboard.css';
import { Link, useNavigate } from 'react-router-dom';

function CGDashboard() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [input, setInput] = useState('');
    // const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
    
            if (response.ok) {
              // Token is valid, proceed with loading chatbot
              console.log('Token is valid');
            } else {
              // Token is invalid or expired, redirect to login
              localStorage.removeItem('token'); // Clear invalid token
              navigate('/');
            }
          } catch (error) {
            console.error('Error validating token:', error);
            localStorage.removeItem('token'); // Clear invalid token
            navigate('/');
          }
        };
    
        checkTokenValidity();
      }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            return; // Skip fetching if no token is found
        }

        // Fetch patients on load
        fetch('http://127.0.0.1:8000/auth/patients', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch patients');
                }
                return response.json();
            })
            .then((data) => {
                setPatients(data);
                setLoading(false);
            })
            .catch(() => {
                setError('No patients assigned');
                setLoading(false);
            });
    }, []);

    const handlePatientClick = (patientId) => {
        navigate(`/patients/${patientId}`);  // Ensure this matches the dynamic route
    };
    
    const handleLogout = async () => {
        try {    
          const response = await fetch('http://127.0.0.1:8000/auth/logout', {
            method: 'POST',
            headers: {
              // 'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`// Send access token in Authorization header
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
        <div className="dashboard-container">
            {/* Header */}
            <div className="navbar" role="navigation" aria-label="Main Navigation">
        <button
          onClick={handleLogout}
          className="navbar-button"
          aria-label="Log out of your account"
          title="This will log you out of the chat and return you to the homepage"
          style={{ marginRight: '10px' }}
        >
          Logout
        </button>
        
        <Link to="/CGprofile" aria-label="Go to your profile page">
          <button
            className="navbar-button"
            title="View or edit your personal profile information"
            style={{ marginRight: '10px' }}
          >
            Profile
          </button>
        </Link>
  
        <Link to="/feedback" aria-label="Give feedback about this chatbot">
          <button
            className="navbar-button"
            title="Share your feedback or report issues with the chatbot"
            style={{ marginRight: '10px' }}
          >
            Feedback
          </button>
        </Link>
      </div>

            <h2>Welcome to your Dashboard</h2>

            {/* Loading or Error Handling */}
            {loading ? (
                <p>Loading patients...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <>
                    {patients.length === 0 ? (
                        <p>No patients assigned</p>
                    ) : (
                        <PatientProfiles patients={patients} onPatientClick={handlePatientClick} />
                    )}
                </>
            )}

            {/* Request Patients Button */}
            <RequestPatientsButton />
        </div>
    );
}

export default CGDashboard;
