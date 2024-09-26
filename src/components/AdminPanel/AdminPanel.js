import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AdminPanel.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminPanel = () => {
  const [tenders, setTenders] = useState([]);
  const [bids, setBids] = useState([]);
  const [selectedTender, setSelectedTender] = useState('');
  const [newTender, setNewTender] = useState({
    tenderName: '',
    tenderDescription: '',
    tenderStartTime: new Date(), // use Date object for DatePicker
    tenderEndTime: new Date(),
    bufferTime: '',
  });

  // getting the encrypt token to decrypt it
  const encryptedToken = localStorage.getItem('token');
  const secretKey = "tendermanagement123";
  const decryptedToken = CryptoJS.AES.decrypt(encryptedToken, secretKey).toString(CryptoJS.enc.Utf8);

  // Fetch all tenders
  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/tenders', {
          headers: {
            Authorization: `${decryptedToken}`,
          },
        });
        setTenders(response.data);
      } catch (error) {
        console.error('Error fetching tenders:', error);
        toast.error('Error fetching tenders!');
      }
    };
    fetchTenders();
  }, [decryptedToken]);

  // Fetch bids for a selected tender
  const fetchBids = async (tenderId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/bids/${tenderId}`, {
        headers: {
          Authorization: `${decryptedToken}`,
        },
      });
      setBids(response.data);
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast.error('Error fetching bids!');
    }
  };


  // function to handle selection of tenders
  const handleTenderSelect = (e) => {
    const tenderId = e.target.value;
    setSelectedTender(tenderId);
    if (tenderId) {
      fetchBids(tenderId);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTender({
      ...newTender,
      [name]: value,
    });
  };

  const handleDateChange = (date, name) => {
    setNewTender({
      ...newTender,
      [name]: date,
    });
  };

  // Submit new tender
  const handleSubmitTender = async (e) => {
    e.preventDefault();
    try {
      const createTender = await axios.post('http://localhost:5000/api/admin/tender', newTender, {
        headers: {
          Authorization: `${decryptedToken}`,
        },
      });

      setNewTender({
        tenderName: '',
        tenderDescription: '',
        tenderStartTime: new Date(),
        tenderEndTime: new Date(),
        bufferTime: '',
      });

      if (createTender) {
        toast.success('Tender created successfully');
      }

      // Refresh tenders list
      const response = await axios.get('http://localhost:5000/api/admin/tenders', {
        headers: {
          Authorization: `${decryptedToken}`,
        },
      });
      setTenders(response.data);

    } catch (error) {
      console.error('Error creating tender:', error);
      toast.error('Error creating tender!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    window.location.reload();
  };

  return (
    <div className="admin-panel">
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
      <button className="logout-button" onClick={handleLogout}>Logout</button>

      <h1>Admin Panel</h1>

      <h2>Create New Tender</h2>
      <form onSubmit={handleSubmitTender}>
        <input
          type="text"
          name="tenderName"
          placeholder="Tender Name"
          value={newTender.tenderName}
          onChange={handleInputChange}
          required
        />
        <textarea
          name="tenderDescription"
          placeholder="Tender Description"
          value={newTender.tenderDescription}
          onChange={handleInputChange}
          required
        />
        <DatePicker
          selected={newTender.tenderStartTime}
          onChange={(date) => handleDateChange(date, 'tenderStartTime')}
          showTimeSelect
          dateFormat="Pp"
          placeholderText="Select start time"
        />
        <DatePicker
          selected={newTender.tenderEndTime}
          onChange={(date) => handleDateChange(date, 'tenderEndTime')}
          showTimeSelect
          dateFormat="Pp"
          placeholderText="Select end time"
        />
        <input
          type="number"
          name="bufferTime"
          placeholder="Buffer Time (in minutes)"
          value={newTender.bufferTime}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Create Tender</button>
      </form>

      <h2>View Tenders</h2>
      <select onChange={handleTenderSelect} value={selectedTender}>
        <option value="">Select a tender</option>
        {tenders.map(tender => (
          <option key={tender._id} value={tender._id}>
            {tender.tenderName}
          </option>
        ))}
      </select>

      <h2>Manage Bids</h2>
      {bids.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Bid Cost</th>
              <th>Bid Time</th>
              <th>Last Minute Bid</th>
            </tr>
          </thead>
          <tbody>
            {bids.map(bid => (
              <tr key={bid._id}>
                <td>{bid.companyName}</td>
                <td>{bid.bidCost}</td>
                <td>{new Date(bid.bidTime).toLocaleString()}</td>
                <td>{bid.lastMinuteBid ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No bids for this tender</p>
      )}
    </div>
  );
};

export default AdminPanel;
