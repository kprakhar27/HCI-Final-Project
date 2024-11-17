import React, { useState } from 'react';
import axios from 'axios';

const FeedbackForm = () => {
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
        } catch (error) {
            setError('Failed to submit feedback.');
        }
    };

    return (
        <div>
            <h2>Provide Feedback</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter your feedback here"
                    required
                />
                <button type="submit">Submit Feedback</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    );
};

export default FeedbackForm;
