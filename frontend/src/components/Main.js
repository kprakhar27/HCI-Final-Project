import React, { useState, useEffect, useRef } from 'react';
import './Main.css'; 
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

function Main() {
  const [messages, setMessages] = useState([]); // Store conversation history
  const [input, setInput] = useState(''); // Store user input
  const [loading, setLoading] = useState(false); // Handle loading state
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState(16);
  const messagesEndRef = useRef(null);
  
  // const [transcript, setTranscript] = useState("");
  

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

  // Accessibility: Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Accessibility: Theme and Font Size Management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [theme, fontSize]);

  // Keyboard Navigation
  const handleKeyDown = (event) => {
    
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }

    if (event.ctrlKey && event.key === 't') {
      event.preventDefault();
      setTheme(theme === 'light' ? 'dark' : 'light');
    }

    if (event.ctrlKey && event.key === '-') {
      event.preventDefault();
      setFontSize(Math.max(12, fontSize - 2));
    }

    if (event.ctrlKey && event.key === '=') {
      event.preventDefault();
      setFontSize(Math.min(24, fontSize + 2));
    }

    if (event.ctrlKey && event.key === 'f') {
      event.preventDefault();
      navigate('/feedback');
    }

    if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();
      navigate('/profile');
    }

    if (event.ctrlKey && event.key === 'l') {
      event.preventDefault();
      handleLogout();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // Handle input field changes
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { 
      id: Date.now(), 
      role, 
      content,
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  // Handle sending message to LLM API (e.g., OpenAI)
  const handleSendMessage = async () => {
    if (!input.trim()) return; // Prevent sending empty messages

    addMessage("user", input)

    // const userMessage = { role: 'user', text: input };
    // setMessages((prevMessages) => [...prevMessages, userMessage]); // Add user message to chat

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
      const llmResponse = data.response;
      addMessage("assistant", llmResponse);
    } catch (error) {
      console.error('Error fetching LLM response:', error);
      const errorMessage = "Sorry, I couldn't process that.";
      addMessage("assistant", errorMessage);
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
    <div className="chatbot">
      {/* Navbar with Logout and Profile buttons */}
      <div className="navbar">
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

        <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle Dark Mode"
          >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>

          <div className="font-controls">
            <button 
              onClick={() => setFontSize(Math.max(12, fontSize - 2))}
              aria-label="Decrease Text Size"
            >
              A-
            </button>
            <button 
              onClick={() => setFontSize(Math.min(24, fontSize + 2))}
              aria-label="Increase Text Size"
            >
              A+
            </button>
          </div>
      </div>
  
      <div className="chatbox" role="main" aria-live="polite" style={{ marginTop: '20px' }}>
        <div className="chat-description">
          <p>
            <strong>Chat Area:</strong> Messages from you and the chatbot will appear here. Your messages will be on the right, and chatbot responses will be on the left.
          </p>
        </div>
  
        {/* Message container */}
        <div className="messages" role="log" aria-label="Chat messages between you and the chatbot">
          <div className ="chatList">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role}`}
              aria-label={message.role === 'user' ? 'Your message' : 'Chatbot message'}
            >
              <div className="message-text" aria-label={message.content}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
                
                <span className="message-timestamp">{message.timestamp}</span>
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
          <div ref={messagesEndRef} />
        </div>
        </div>
  
        <div className="input-description">
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
