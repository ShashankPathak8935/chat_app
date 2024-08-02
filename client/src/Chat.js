import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './Chat.css';

const Chat = ({ selectedUser }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketIo = io('http://localhost:5000');

    if (selectedUser) {
      socketIo.emit('join-room', selectedUser);
    }

    socketIo.on('receive-message', (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [selectedUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5000/messages', {
            headers: {
              Authorization: `Bearer ${token}`
            },
            params: {
              receiverId: selectedUser
            }
          });
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages', error);
        }
      }
    };

    fetchMessages();
  }, [selectedUser]);

  const handleSend = async () => {
    if (message.trim() && selectedUser) {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.post('http://localhost:5000/send-message', {
          receiverId: selectedUser,
          message
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 201) {
          const messageData = response.data;
          socket.emit('send-message', messageData);
          setMessage('');
        }
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
          <div
            key={index}
            className={`chat-message ${msg.sender_id === localStorage.getItem('user_id') ? 'sent' : 'received'}`}
          >
            <p>{msg.message}</p>
            <span className="chat-timestamp">
              {new Date(msg.created_at).toLocaleTimeString()}
            </span>
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
