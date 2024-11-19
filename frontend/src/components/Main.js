import React, { useState, useEffect } from 'react';
import './Main.css'; 
import { Link, useNavigate } from 'react-router-dom';
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
          localStorage.removeItem('token'); // Clear invalid token
          navigate('/');
        }
      } catch (error) {
        console.error('Error validating token:', error);
        localStorage.removeItem('token'); // Clear invalid token
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
    <div className="chatbot" style={{ backgroundColor: '#f0f0f5', padding: '20px' }}>
      {/* Navbar with Logout and Profile buttons */}
      <div className="navbar" role="navigation" aria-label="Main Navigation">
        <button
          onClick={handleLogout}
          className="navbar-button"
          aria-label="Log out of your account"
          title="This will log you out of the chat and return you to the homepage"
          style={{ marginRight: '10px' }}
        >
          Logout
        </button>
        
        <Link to="/profile" aria-label="Go to your profile page">
          <button
            className="navbar-button"
            title="View or edit your personal profile information"
            style={{ marginRight: '10px' }}
          >
            Profile
          </button>
        </Link>
  
        <Link to="/feedback" aria-label="Give feedback about this chatbot">
          <button
            className="navbar-button"
            title="Share your feedback or report issues with the chatbot"
            style={{ marginRight: '10px' }}
          >
            Feedback
          </button>
        </Link>
      </div>
  
      <div className="chatbox" role="main" aria-live="polite" style={{ marginTop: '20px' }}>
        <div className="chat-description" style={{ margin: '15px', color: '#555' }}>
          <p>
            <strong>Chat Area:</strong> Messages from you and the chatbot will appear here. Your messages will be on the right, and chatbot responses will be on the left.
          </p>
        </div>
  
        {/* Message container */}
        <div className="messages" role="log" aria-label="Chat messages between you and the chatbot">
          <div className ="chatList">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role}`}
              style={{
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: message.role === 'user' ? '#cfe9ff' : '#e2e2e2',
              }}
              aria-label={message.role === 'user' ? 'Your message' : 'Chatbot message'}
            >
              <div className="message-text" aria-label={message.text}>
                {message.text}
              </div>
            </div>
          ))}
          {loading && (
            <div
              className="message bot"
              aria-label="Chatbot is typing a response"
              style={{ fontStyle: 'italic', color: '#999' }}
            >
              <div className="typing">Typing...</div>
            </div>
          )}
        </div>
        </div>
  
        <div className="input-description" style={{ margin: '15px', color: '#555' }}>
          <p>
            <strong>Type Your Message Below:</strong> Enter your message in the input box and press "Send" when you're ready. The chatbot will respond to each message you send.
          </p>
        </div>
  
        {/* Input container */}
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            disabled={loading}
            aria-label="Input field to type your message to the chatbot"
            title="Type your message to the chatbot here"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            aria-label="Send message to chatbot"
            title="Click to send your message to the chatbot"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
  
}  
export default Main;
