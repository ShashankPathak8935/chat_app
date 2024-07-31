import React, { useState } from 'react';
import axios from 'axios';
import './Chat.css';

const Chat = ({ selectedUser }) => {
  const [message, setMessage] = useState('');

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
      } catch (error) {
        console.error('Error sending message', error);
      }
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">Let's Chat</h2>
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
