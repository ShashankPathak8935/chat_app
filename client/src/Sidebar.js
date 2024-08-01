import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Sidebar.css';

const Sidebar = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/users', {
          headers: {
            Authorization: token
          }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Users</h2>
      <ul className="sidebar-users">
        {users.map((user) => (
          <li key={user.id} className="sidebar-user-item" onClick={() => onSelectUser(user.id)}>
            <img src={`http://localhost:5000/${user.profile_picture}`} alt={user.username} className="sidebar-user-pic" />
            <span className="sidebar-user-name">{user.username}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;