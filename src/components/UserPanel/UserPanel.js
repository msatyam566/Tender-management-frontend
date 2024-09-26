import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserPanel.css'; // Import the CSS file

const UserPanel = () => {
  const [tenders, setTenders] = useState([]);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    tenderId: '',
    companyName: '',
    bidCost: '',
  });


  // Decrypting th token 

  const encryptedToken = localStorage.getItem('token');

  const secretKey = "tendermanagement123"
  const decryptedToken = CryptoJS.AES.decrypt(encryptedToken, secretKey).toString(CryptoJS.enc.Utf8);
  // Fetch all active tenders

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user/tenders/active', {
          headers: {
            Authorization: `${decryptedToken}`,
          },
        });
        setTenders(response.data);
      } catch (error) {
        console.error('Error fetching tenders:', error);
        toast.error('Error fetching tenders.');
      }
    };
    fetchTenders();
  }, [decryptedToken]);

  // Set up Socket.IO connection and listen for notifications from tenderExtended even

  useEffect(() => {
    const socket = io('http://localhost:5000');

    // Listen for 'tenderExtended' event
    socket.on('tenderExtended', (data) => {
      setNotification(`Tender "${data.tenderName}" end time extended by ${data.bufferTime} minutes.`);
      toast.info(`Tender "${data.tenderName}" extended by ${data.bufferTime} minutes.`);

      // updating the tenders state to reflect the new end time
      setTenders((prevTenders) =>
        prevTenders.map((tender) =>
          tender._id === data.tenderId ? { ...tender, tenderEndTime: data.newEndTime } : tender
        )
      );
    });

    // Cleanup the socket connection when the component unmounts
    return () => {
      socket.off('tenderExtended');
      socket.disconnect();
    };
  }, [tenders]);

  // Clear notification after a few seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 10000); // Clear notification after 10 seconds
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [notification]);

  // Handle form input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle bid submission that is submitted by user

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/user/bid', formData, {
        headers: {
          Authorization: `${decryptedToken}`,
        },
      });
      if (response) {
        toast.success('Bid submitted successfully.');
        setFormData({
          tenderId: '',
          companyName: '',
          bidCost: '',
        });
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.error('Failed to submit bid.');
    }
  };

  // handle logout event

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("def");
    window.location.reload();
  };

  return (
    <div className="user-panel-container">
      <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>

      {notification && <div className="notification">{notification}</div>} 

      <div className="user-panel-content">
        {/* Form for submitting a bid */}
        <form onSubmit={handleSubmit} className="bid-form">
          <div className="form-group">
            <label htmlFor="tenderId">Select Tender</label>
            <select
              name="tenderId"
              onChange={handleChange}
              value={formData.tenderId}
              required
            >
              <option value="">Select a tender</option>
              {tenders.map((tender) => (
                <option key={tender._id} value={tender._id}>
                  {tender.tenderName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="companyName">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter your company name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="bidCost">Bid Cost</label>
            <input
              type="number"
              id="bidCost"
              name="bidCost"
              value={formData.bidCost}
              onChange={handleChange}
              placeholder="Enter your bid cost"
              required
            />
          </div>
          <button type="submit" className="submit-button">
            Submit Bid
          </button>
        </form>

        {/* Box to show available tenders */}
        <div className="tender-box">
          <h2>Available Tenders</h2>
          {tenders.length > 0 ? (
            <table className="tender-table">
              <thead>
                <tr>
                  <th>Tender Name</th>
                  <th>Description</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                </tr>
              </thead>
              <tbody>
                {tenders.map((tender) => (
                  <tr key={tender._id}>
                    <td>{tender.tenderName}</td>
                    <td>{tender.tenderDescription}</td>
                    <td>{new Date(tender.tenderStartTime).toLocaleString()}</td>
                    <td>{new Date(tender.tenderEndTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No active tenders available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPanel;
