import React, { useState, useEffect } from 'react';
import PatientProfiles from './PatientProfiles';
import FeedbackForm from './Feedback';
import RequestPatientsButton from './RequestPatients';
import './CGDashboard.css';
import { Link, useNavigate } from 'react-router-dom';
import PatientDetails from './PatientDetails';
import profilePic from './images/profilepicture.jpg';

function CGDashboard() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
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
        // Navigate to PatientDetails page
        navigate(`/patients/${patientId}`);
    };

    const handleFeedbackSubmit = (feedback) => {
        fetch('http://127.0.0.1:8000/auth/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ feedback_text: feedback }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to submit feedback');
                }
                return response.json();
            })
            .then(() => {
                alert('Feedback submitted!');
                navigate('/cgdashboard'); // Redirect to dashboard after feedback submission
            })
            .catch((error) => {
                console.error('Error submitting feedback:', error);
                alert('Failed to submit feedback');
            });
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="header">
                <div className="profile-section">
                    <img src={profilePic} alt="Profile" className="profile-pic" />
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
                        <p>No patients assigned</p>
                    ) : (
                        <PatientProfiles patients={patients} onPatientClick={handlePatientClick} />
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
