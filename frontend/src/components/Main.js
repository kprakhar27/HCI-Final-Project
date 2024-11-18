import React, { useState, useEffect } from 'react';
import PatientProfiles from './PatientProfiles';
import FeedbackForm from './Feedback';
import RequestPatientsButton from './RequestPatients';
import './Main.css'; 
import { Link, useNavigate } from 'react-router-dom';
import PatientDetails from './PatientDetails';
import profilePic from './images/profilepicture.jpg';

function Main() {
  const [messages, setMessages] = useState([]); // Store conversation history
  const [input, setInput] = useState(''); // Store user input
  const [loading, setLoading] = useState(false); // Handle loading state
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

  // Handle input field changes
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  

  // Handle sending message to LLM API (e.g., OpenAI)
  const handleSendMessage = async () => {
    if (!input.trim()) return; // Prevent sending empty messages

    const userMessage = { role: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]); // Add user message to chat

    setLoading(true); // Start loading state while waiting for response
    setInput(''); // Clear input field

    try {
      const response = await fetch('http://127.0.0.1:8000/user/llm', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ prompt: input }), // Send prompt to backend or LLM API
      });

      const data = await response.json();
      const botMessage = { role: 'bot', text: data.response }; // Assume API returns { response: "..." }
      setMessages((prevMessages) => [...prevMessages, botMessage]); // Add bot response to chat
    } catch (error) {
      console.error('Error fetching LLM response:', error);
      const errorMessage = { role: 'bot', text: "Sorry, I couldn't process that." };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false); // Stop loading state after response is received
    }
  };

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access_token'); // Get access token from localStorage

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
    <div className="chatbot">
      {/* Navbar with Logout and Profile buttons */}
      <div className="navbar">
        <button onClick={handleLogout} className="navbar-button">Logout</button>
        <Link to="/profile">
          <button className="navbar-button">Go to profile</button>
        </Link>
        <Link to="/feedback">
          <button className="navbar-button">Feedback</button>
        </Link>
      </div>

      <div className="chatbox">
        {/* Message container */}
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-text">{message.text}</div>
            </div>
          ))}
          {loading && <div className="message bot"><div className="typing">Typing...</div></div>}
        </div>
        
        {/* Input container */}
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button onClick={handleSendMessage} disabled={loading || !input.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
}
export default Main;
