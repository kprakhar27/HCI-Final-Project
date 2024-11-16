import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PatientProfiles() {
    const [patients, setPatients] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatients = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:8000/patients', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPatients(response.data);
            } catch (error) {
                alert('Failed to fetch patients!');
            }
        };
        fetchPatients();
    }, []);

    return (
        <div>
            <h2>Patient Profiles</h2>
            <ul>
                {patients.map((patient) => (
                    <li key={patient.id}>{patient.name}, {patient.age} years old</li>
                ))}
            </ul>
            <button onClick={() => navigate('/feedback')}>Submit Feedback</button>
        </div>
    );
}

export default PatientProfiles;
