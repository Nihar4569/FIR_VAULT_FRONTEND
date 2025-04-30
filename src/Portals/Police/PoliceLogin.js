import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../Components/Footer';
import Navbar from '../../Components/Navbar';
import { policeAPI } from '../../Services/api';

const PoliceLogin = () => {
  const [credentials, setCredentials] = useState({
    hrms: '',
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
      // Validate hrms is numeric
      if (!credentials.hrms || isNaN(credentials.hrms)) {
        setError('Please enter a valid HRMS number');
        setIsLoading(false);
        return;
      }
  
      const response = await policeAPI.login(credentials);
      const policeData = response.data || response;
      
      if (policeData) {
        localStorage.setItem('policeToken', 'police-mock-token');
        localStorage.setItem('policeData', JSON.stringify(policeData));
        navigate('/police');
      } else {
        setError('Invalid credentials or account not approved.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setError('Invalid credentials or your account has not been approved.');
        } else if (err.response.status === 404) {
          setError('Officer not found. Please check your HRMS number.');
        } else {
          setError('Login failed. Please try again.');
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
        <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-700 p-6 text-white text-center">
            <div className="inline-block bg-blue-800 rounded-full p-3 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Police Officer Login</h2>
            <p className="mt-2">Secure access for law enforcement personnel</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="hrms" className="block text-gray-700 text-sm font-medium mb-2">HRMS Number</label>
                <input
                  type="text"
                  id="hrms"
                  name="hrms"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your HRMS number"
                  value={credentials.hrms}
                  onChange={handleChange}
                  required
                />
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
              For technical assistance, contact your station administrator
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PoliceLogin;