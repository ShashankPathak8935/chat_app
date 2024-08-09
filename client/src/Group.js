import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Group.css';

const Group = () => {
  const [fullNames, setFullNames] = useState([]);
  const [checkedNames, setCheckedNames] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [notification, setNotification] = useState(''); // State for the notification message
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFullNames = async () => {
      try {
        const response = await axios.get('http://localhost:5000/fullnames');
        setFullNames(response.data);
      } catch (error) {
        console.error('Error fetching full names:', error);
      }
    };

    fetchFullNames();
  }, []);

  const handleCheckboxChange = (name) => {
    setCheckedNames((prev) => {
      if (prev.includes(name)) {
        return prev.filter((n) => n !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  const handleBackButtonClick = () => {
    navigate('/home'); // Navigate to the home page
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate group name
    if (!groupName.trim()) {
      setNotification('Please enter a group name.');
      return; // Prevent form submission if the group name is empty
    }

    // Check if at least two members are selected
    if (checkedNames.length < 2) {
      setNotification('Please select at least two members for this group.');
      return; // Prevent form submission if fewer than two members are selected
    }

    try {
      // Clear the notification
      setNotification('');

      // Create group
      const groupResponse = await axios.post('http://localhost:5000/create-group', {
        groupName,
      });

      const groupId = groupResponse.data.groupId; // Assume your backend returns the new group ID

      // Add members to group
      const userIds = fullNames
        .filter(user => checkedNames.includes(user.fullname))
        .map(user => user.id); // Collect the IDs of the checked users

      await axios.post('http://localhost:5000/add-group-members', {
        groupId,
        userIds,
      });

      // Set success notification
      setNotification('Group created successfully.');

      // Optionally, you can navigate after a short delay
      setTimeout(() => {
        navigate('/home');
      }, 2000); // 2-second delay before redirecting

    } catch (error) {
      console.error('Error creating group:', error);
      setNotification('this group already exits.');
    }
  };

  return (
    <div className="group-page">
      <h2>Create Group</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="group-name">Group Name:</label>
        <input
          type="text"
          id="group-name"
          placeholder='Enter Group Name'
          name="group-name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <div className="full-names">
          {fullNames.map((user, index) => (
            <div key={index} className="checkbox-wrapper">
              <input
                type="checkbox"
                id={`user-${index}`}
                name="group-members"
                value={user.fullname}
                checked={checkedNames.includes(user.fullname)}
                onChange={() => handleCheckboxChange(user.fullname)}
              />
              <label htmlFor={`user-${index}`}>{user.fullname}</label>
            </div>
          ))}
        </div>

        {/* Display the notification if there is one */}
        {notification && <div className="notification">{notification}</div>}

        <button type="submit">Create Group</button>
      </form>

      {/* Back Button */}
      <button className="back-button" onClick={handleBackButtonClick}>
        Back
      </button>
    </div>
  );
};

export default Group;
