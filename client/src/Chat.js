import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chat.css';

const Chat = ({ selectedUser }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    if (selectedUser) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/messages/${selectedUser}`,
          {
            headers: {
              Authorization: token
            }
          }
        );
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages', error);
      }
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedUser]);

  const handleSend = async () => {
    if (message.trim() && selectedUser) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          'http://localhost:5000/send-message',
          { receiverId: selectedUser, message },
          {
            headers: {
              Authorization: token
            }
          }
        );
        console.log('Message sent:', message);
        setMessage(''); // Clear the input field after sending
        fetchMessages(); // Fetch messages again to update the list
      } catch (error) {
        console.error('Error sending message', error);
      }
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">Let's Chat</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            <span className="chat-message-time">{new Date(msg.created_at).toLocaleTimeString()}</span>
            <span className="chat-message-text">{msg.message}</span>
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
          disabled={!selectedUser}
        />
        <button onClick={handleSend} className="chat-send-button" disabled={!selectedUser}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
