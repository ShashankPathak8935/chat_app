import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Chat from './Chat';
import './Home.css'; // Add styling for the layout

const Home = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleSelectUser = (userId) => {
    setSelectedUser(userId);
    setSelectedGroup(null); // Deselect group if a user is selected
  };

  const handleSelectGroup = (groupId) => {
    setSelectedGroup(groupId);
    setSelectedUser(null); // Deselect user if a group is selected
  };


  return (
    <div className="layout-container">
      <Navbar />
      <div className="main-content">
      <Sidebar onSelectUser={handleSelectUser} onSelectGroup={handleSelectGroup} />
      <Chat selectedUser={selectedUser} selectedGroup={selectedGroup} />
      </div>
    </div>
  );
};

export default Home;
