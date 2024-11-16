import React, { useState } from 'react';
import axios from 'axios';

function FeedbackPage() {
    const [feedback, setFeedback] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:8000/feedback',
                { feedback },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Feedback submitted!');
        } catch (error) {
            alert('Failed to submit feedback!');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Submit Feedback</h2>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} required />
            <button type="submit">Submit</button>
        </form>
    );
}

export default FeedbackPage;
