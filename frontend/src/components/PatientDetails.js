import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PatientDetails.css';
import defaultMetric from './images/metrics.jpg';

function PatientDetails() {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [sessionTopics, setSessionTopics] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/user/patients/${window.location.pathname.split("/")[2]}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
    
                if (!response.ok) {
                    throw new Error('Failed to fetch patient details');
                }
    
                const data = await response.json();
                setPatient(data);
                console.info(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching patient details:', error);
                setError('Failed to load patient details');
                setLoading(false);
            }
        };
    
        fetchPatientData();
    }, [patientId]);
    

    const handleTopicSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/user/patients/1/topics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ topics: sessionTopics }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit topics');
            }

            alert('Session topics submitted successfully!');
            setSessionTopics('');
        } catch (error) {
            console.error('Error submitting topics:', error);
            alert('Failed to submit session topics.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <p>Loading patient details...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="patient-details-container">
            {/* Back Button */}
            <button onClick={() => navigate('/cgdashboard')} className="back-button">
                &lt; Back to Dashboard
            </button>

            <h2>{patient.name}</h2>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Condition Level:</strong> {patient.level}</p>
            <p><strong>Notes:</strong> {patient.topic}</p>

            {/* Time Spent Plot Section */}
            <div className="plot-section">
                <h3>Time Spent on Tool</h3>
                <img src={defaultMetric} alt="Profile" className="profile-pic" />
            </div>

            {/* Session Topics Section */}
            <div className="session-topics-section">
                <h3>Add Topics for Next Session</h3>
                <form onSubmit={handleTopicSubmit}>
                    <textarea
                        value={sessionTopics}
                        onChange={(e) => setSessionTopics(e.target.value)}
                        placeholder="Enter topics for the next session..."
                        required
                    ></textarea>
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PatientDetails;
