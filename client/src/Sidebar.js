import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Sidebar.css';

const Sidebar = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
    onSelectUser(userId);
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sidebar">
      {/* <h2 className="sidebar-title">Users</h2> */}
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={handleSearch}
        className="sidebar-search"
      />
      <ul className="sidebar-users">
        {filteredUsers.map((user) => (
          <li
            key={user.id}
            className={`sidebar-user-item ${selectedUserId === user.id ? 'selected' : ''}`}
            onClick={() => handleUserClick(user.id)}
          >
            <img
              src={`http://localhost:5000/${user.profile_picture}`}
              alt={user.username}
              className="sidebar-user-pic"
            />
            <span className="sidebar-user-name">{user.fullname}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
