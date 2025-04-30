// src/Portals/Station/StationLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { stationAPI } from '../../Services/api';

const StationLogin = () => {
  const [credentials, setCredentials] = useState({
    stationSid: '', // Changed from stationCode to stationSid to match backend
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    try {
      // Check if stationSid is numeric before sending to backend
      if (!/^\d+$/.test(credentials.stationSid)) {
        setError('Station ID must be numeric');
        setIsLoading(false);
        return;
      }
  
      // Call the actual API for login
      const response = await stationAPI.login({
        stationSid: credentials.stationSid,
        pass: credentials.password // 'pass' is the password field name in the backend
      });
      
      const stationData = response.data || response;
      
      if (stationData) {
        // Store station data and token in localStorage
        localStorage.setItem('stationToken', 'station-token');
        localStorage.setItem('stationData', JSON.stringify(stationData));
        navigate('/station');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setError('Invalid credentials or station not approved.');
        } else if (err.response.status === 404) {
          setError('Station not found. Please check your Station ID.');
        } else if (err.response.status === 403) {
          setError('Station is not approved yet. Please contact admin.');
        } else {
          setError('Login failed. Please check your credentials and try again.');
        }
      } else {
        setError('Unable to connect to server. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-20 flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg overflow-hidden" >
          <div className="bg-blue-700 p-6 text-white text-center">
            <div className="inline-block bg-blue-800 rounded-full p-3 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Station Admin Login</h2>
            <p className="mt-2">Access police station management portal</p>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="stationSid" className="block text-gray-700 text-sm font-medium mb-2">Station ID</label>
                <input
                  type="text"
                  id="stationSid"
                  name="stationSid"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter numeric station ID"
                  value={credentials.stationSid}
                  onChange={handleChange}
                  pattern="[0-9]+"
                  title="Station ID must be numeric"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter your numeric station ID (no letters or special characters)
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
                <p className="mt-2 text-sm text-right">
                  <a href="#" className="text-blue-600 hover:text-blue-800">Forgot password?</a>
                </p>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Login'}
              </button>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              For technical assistance, contact system administrator
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StationLogin;