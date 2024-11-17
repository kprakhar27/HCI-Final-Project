import React, { useState } from 'react';
import axios from 'axios';
import './FeedbackForm.css';
import { useNavigate } from 'react-router-dom';

const FeedbackForm = () => {
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!token) {
            setError('User not authenticated.');
            return;
        }

        try {
            const response = await axios.post(
                'http://127.0.0.1:5000/auth/feedback',
                { feedback_text: feedback },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setSuccess('Feedback submitted successfully!');
            setFeedback(''); // Reset feedback input
            setTimeout(() => {
                navigate('/cgdashboard'); // Redirect to dashboard
            }, 1000);
        } catch (error) {
            setError('Failed to submit feedback.');
        }
    };

    return (
        <div className="feedback-container">
            <h3>Provide Feedback</h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    placeholder="Share your thoughts here..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                ></textarea>
                <button type="submit">Submit Feedback</button>
            </form>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
        </div>
    );
};

export default FeedbackForm;