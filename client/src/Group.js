import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Group.css';

const Group = () => {
  const [fullNames, setFullNames] = useState([]);
  const [checkedNames, setCheckedNames] = useState([]);
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

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

    try {
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

      // Redirect to the home page
      navigate('/home');
    } catch (error) {
      console.error('Error creating group:', error);
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
          required
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
