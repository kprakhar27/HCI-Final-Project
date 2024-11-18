import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './PatientDetails.css';

function PatientDetail() {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/patients/${patientId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch patient details');
                }
                return response.json();
            })
            .then((data) => {
                setPatient(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching patient details:', error);
                setLoading(false);
            });
    }, [patientId]);

    if (loading) {
        return <p>Loading patient details...</p>;
    }

    if (!patient) {
        return <p>Error loading patient details.</p>;
    }

    return (
        <div className="patient-detail">
            <h2>{patient.name}</h2>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Condition:</strong> {patient.condition}</p>
            <p><strong>Notes:</strong> {patient.notes}</p>
        </div>
    );
}

export default PatientDetail;
