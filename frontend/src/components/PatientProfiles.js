import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PatientProfiles.css';
import { useNavigate } from 'react-router-dom';

function PatientProfiles() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const token = localStorage.getItem('token'); // Get JWT token from localStorage
                const response = await axios.get('http://127.0.0.1:8000/auth/patients', {
                    headers: {
                        Authorization: `Bearer ${token}` // Attach token to Authorization header
                    }
                });
                console.info('here: ', response.data);
                if (response.data.length === 0) {
                    setPatients([]);
                } else {
                    setPatients(response.data);
                }
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch patients');
                setLoading(false);
                console.error('error fetching patients:', error.response || error.message);
                setPatients([]);
            }
        };

        fetchPatients();
    }, []); // Run this effect once on component mount

    const handleRowClick = (patientId) => {
        const userConfirmed = window.confirm(
            'Accessing patient information. Make sure no one else can see your screen. Data protected by HIPAA.'
        );
        if (userConfirmed) {
            navigate(`/patients/${patientId}`); // Navigate to the patient details page
        }
    };

    if (loading) {
        return <div>Loading patients...</div>;
    }

    

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="patient-container">
            <h2>Ward List</h2>
            {patients.length === 0 ? (
                <p>No Patients Assigned</p> // Show this if there are no patients
            ) : (
                <table className="patient-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Age</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((patient) => (
                            <tr
                                key={patient.id}
                                onClick={() => handleRowClick(patient.id)} // Handle row click
                                className="clickable-row"
                            >
                                {/* <td>{patient.id}</td> */}
                                <td>{patient.name}</td>
                                <td className="secure-age">
                                    <span className="masked">***</span>
                                    <span className="unmasked">{patient.age}</span>
                                </td>
                                {/* <td>{patient.caregiver}</td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default PatientProfiles;
