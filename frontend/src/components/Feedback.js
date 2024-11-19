import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedbackForm.css';
import { useNavigate } from 'react-router-dom';

const FeedbackForm = () => {
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Check if token is valid on component load
  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/'); // No token found, redirect to login
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/auth/validate-token', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Token is valid, proceed with loading chatbot
          console.log('Token is valid');
        } else {
          // Token is invalid or expired, redirect to login
          localStorage.removeItem('access_token'); // Clear invalid token
          navigate('/');
        }
      } catch (error) {
        console.error('Error validating token:', error);
        localStorage.removeItem('access_token'); // Clear invalid token
        navigate('/');
      }
    };

    checkTokenValidity();
  }, [navigate]);

  const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/auth/feedback',
                { feedback_text: feedback },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(response)
            setSuccess('Feedback submitted successfully!');
            alert(success);
            setFeedback('');
        } catch (error) {
            setError('Failed to submit feedback.');
            alert('Failed to submit feedback.');
        }
    };

    // Handle logout functionality
  const handleLogout = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/logout', {
        method: 'POST',
        headers: {
          // 'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`// Send access token in Authorization header
        },
      });

      if (response.ok) {
        localStorage.removeItem('access_token'); // Remove access token from localStorage on successful logout
        alert('Successfully logged out.');
        window.location.reload(); // Optionally reload the page or redirect to login page.
      } else {
        alert('Logout failed.');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('An error occurred during logout.');
    }
  };

    return (
        <div className="feedback-container">
            {/* Navbar with Logout and Profile buttons */}
            <div className="navbar">
                <button onClick={handleLogout} className="navbar-button">Logout</button>
                <button onClick={() => navigate(-1)} className="navbar-button">Back</button>
                {/* <Link to="/main">
                    <button className="navbar-button">Go to Main</button>
                </Link>
                <Link to="/profile">
                    <button className="navbar-button">Go to Profile</button>
                </Link> */}
            </div>

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