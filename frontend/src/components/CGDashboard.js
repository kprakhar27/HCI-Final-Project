import React, { useState, useEffect } from 'react';
import PatientProfiles from './PatientProfiles';
import FeedbackForm from './Feedback';
import RequestPatientsButton from './RequestPatients';
import './CGDashboard.css';
import { Link, useNavigate } from 'react-router-dom';

function CGDashboard() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);  // Add loading state to handle fetch state
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch patients on load
        fetch('http://127.0.0.1:5000/api/patients', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setPatients(data);
                setLoading(false);
            })
            .catch((error) => {
                setError('Error fetching patients');
                setLoading(false);
            });
    }, []);

    const handleFeedbackSubmit = (feedback) => {
        // Send feedback to backend
        fetch('http://127.0.0.1:5000/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ feedback_text: feedback }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert('Feedback submitted!');
                navigate('/cgdashboard'); // Redirect back to dashboard after feedback submission
            })
            .catch((error) => {
                console.error('Error submitting feedback:', error);
                alert('Failed to submit feedback');
            });
    };

    return (
        <div className="dashboard-container">
            <div className="header">
                <div className="profile-section">
                    <img src="images/profilepicture.jpg" alt="Profile" className="profile-pic" />
                    <div className="profile-buttons">
                        <button>My Profile</button>
                        <button>Account Details</button>
                        <button>Contact</button>
                    </div>
                </div>
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
                        <p>No patients assigned</p>  // Display this message if no patients exist
                    ) : (
                        <PatientProfiles patients={patients} />
                    )}
                </>
            )}

            {/* Request Patients Button */}
            <RequestPatientsButton />

            {/* Feedback Form Button */}
            <Link to="/feedback">
                <button className="feedback-btn">Provide Feedback</button>
            </Link>
        </div>
    );
}

export default CGDashboard;
