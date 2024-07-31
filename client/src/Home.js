import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Chat from './Chat'
import './Home.css'; // Add styling for the layout
import { useState } from 'react';

const Home = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  return (
    <div>
     <div className="layout-container">
      <Navbar/>
      <div className="main-content">
      <Sidebar onSelectUser={setSelectedUser} />
      <Chat selectedUser={selectedUser} />
      </div>
      </div>
    </div>
  )
}

export default Home
