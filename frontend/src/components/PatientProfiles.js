import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PatientProfiles.css';

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

    if (loading) {
        return <div>Loading patients...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // return (
    //     <div>
    //         <h2>Patient List</h2>
    //         {error && <p style={{ color: 'red' }}>{error}</p>}
    //         <ul>
    //             {patients.map((patient) => (
    //                 <li key={patient.id}>{patient.name}</li>
    //             ))}
    //         </ul>

    //         {/* Include the Feedback Form Below */}
    //         <FeedbackForm />
    //     </div>
    // );
    return (
        <div className="patient-container">
            <h2>Patient List</h2>
            {patients.length === 0 ? (
                <p>No Patients Assigned</p> // Show this if there are no patients
            ) : (
                <table className="patient-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Caregiver</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((patient) => (
                            <tr key={patient.id}>
                                <td>{patient.id}</td>
                                <td>{patient.name}</td>
                                <td>{patient.age}</td>
                                <td>{patient.caregiver}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default PatientProfiles;
