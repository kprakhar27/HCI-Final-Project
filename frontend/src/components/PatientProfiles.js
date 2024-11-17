import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FeedbackForm from './Feedback';

function PatientProfiles() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const token = localStorage.getItem('token'); // Get JWT token from localStorage
                const response = await axios.get('http://127.0.0.1:5000/auth/patients', {
                    headers: {
                        Authorization: `Bearer ${token}` // Attach token to Authorization header
                    }
                });
                setPatients(response.data); // Set the patients data
                setLoading(false); // Stop loading
            } catch (error) {
                setError('Failed to fetch patients');
                setLoading(false);
                console.error('error fetching patients:', error.response || error.message);
            }
        };

        fetchPatients();
    }, []); // Run this effect once on component mount

    if (loading) {
        return <div>Loading patients...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Patient List</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {patients.map((patient) => (
                    <li key={patient.id}>{patient.name}</li>
                ))}
            </ul>

            {/* Include the Feedback Form Below */}
            <FeedbackForm />
        </div>
    );
}

export default PatientProfiles;
