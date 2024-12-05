import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PatientDetails.css';
import defaultMetric from './images/metrics.jpg';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

function PatientDetails() {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [sessionTopics, setSessionTopics] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [messageData, setMessageData] = useState([]);
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

        const fetchMessageData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/user/messages_per_interval/${window.location.pathname.split("/")[2]}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                console.info(response);

                if (!response.ok) {
                    throw new Error('Failed to fetch message data');
                }

                const data = await response.json();
                if (data.status === 'success') {
                    setMessageData(data.data);
                }
            } catch (error) {
                setError('Failed to load message data');
            }
        };


        fetchPatientData();
        fetchMessageData();
    }, [patientId]);


    const handleTopicSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/user/patients/${window.location.pathname.split("/")[2]}/topics`, {
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
            window.location.reload();
        } catch (error) {
            console.error('Error submitting topics:', error);
            alert('Failed to submit session topics.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <p>Loading patient details...</p>;
    if (error) return <p>{error}</p>;

    const chartData = {
        labels: messageData.map((entry) => entry.interval),
        datasets: [
            {
                label: 'Messages per 5-minute Interval',
                data: messageData.map((entry) => entry.count),
                backgroundColor: 'rgba(75, 192, 192, 0.6)', // Lighter shade
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                borderRadius: 10,  // Rounded corners for bars
                hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',  // Hover effect
                hoverBorderColor: 'rgba(75, 192, 192, 1)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                        family: 'Arial, sans-serif',
                        weight: 'bold',
                    },
                    color: '#333',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',  // Dark tooltip background
                titleFont: {
                    weight: 'bold',
                },
                bodyFont: {
                    size: 14,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: true, // Show grid lines for X-axis
                    color: '#e0e0e0', // Light grid color
                },
                ticks: {
                    font: {
                        size: 12,
                        family: 'Arial, sans-serif',
                    },
                    color: '#333',
                },
            },
            y: {
                grid: {
                    display: true,  // Show grid lines for Y-axis
                    color: '#e0e0e0', // Light grid color
                },
                ticks: {
                    font: {
                        size: 12,
                        family: 'Arial, sans-serif',
                    },
                    color: '#333',
                },
            },
        },
    };

    return (
        <div className="patient-details-container">
            {/* Back Button */}
            <button onClick={() => navigate('/cgdashboard')} className="back-button">
                &lt; Back to Dashboard
            </button>

            <h2>{patient.name}</h2>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Conversation Style:</strong> {patient.level}</p>
            <p><strong>Topic for discussion:</strong> {patient.topic}</p>

            {/* Time Spent Plot Section */}
            <div className="plot-section">
                <h3>Time Spent on Tool</h3>
                {/* <img src={defaultMetric} alt="Profile" className="profile-pic" /> */}
                {/* Render the Bar Chart */}
                <Bar data={chartData} options={chartOptions} />
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
