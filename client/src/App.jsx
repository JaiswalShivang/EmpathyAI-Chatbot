import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    {
      text: "Hello, I'm Empathy AI, here to listen and support you with compassion. Remember, I'm not a substitute for professional help. How are you feeling today?",
      sender: 'ai'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Function to render text with clickable links
  const renderMessageText = (text) => {
    // Regex to match [text](url) format
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      // Add the link
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="message-link"
        >
          {match[1]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      const aiMessage = { text: data.response, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { text: 'Sorry, I encountered an error. Please try again.', sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Empathy AI</h1>
        <p>Your compassionate companion for emotional support</p>
      </header>
      <div className="chat-container">
        <div className="chat-messages" ref={messagesEndRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender} fade-in`}>
              <div className="message-bubble">
                {renderMessageText(msg.text)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message ai fade-in">
              <div className="message-bubble typing">
                Empathy AI is typing...
              </div>
            </div>
          )}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            disabled={loading}
            aria-label="Type your message here"
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
      <footer className="footer">
        <p>
          <strong>Important:</strong> This AI is for emotional support only and is not a substitute for professional medical or psychological help.
          In case of emergency or suicidal thoughts, please call <strong>022-25521111</strong> immediately.
        </p>
        <p>Your conversations are private and confidential.</p>
      </footer>
    </div>
  );
}

export default App;