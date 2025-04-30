import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../Components/Footer';
import Navbar from '../../Components/Navbar';
import { userAPI } from '../../Services/api';

const UserLogin = () => {
  const [credentials, setCredentials] = useState({
    aid: '', // Changed from phone_no to aid
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
      // Ensure aid is valid
      if (!credentials.aid || !/^\d{12}$/.test(credentials.aid)) {
        setError('Please enter a valid 12-digit Aadhar number');
        setIsLoading(false);
        return;
      }
  
      // Get user by aid
      const response = await userAPI.getUserById(credentials.aid);
      const userData = response.data || response;
  
      if (userData) {
        // Check if password matches
        if (userData.password === credentials.password) {
          // Store user data in localStorage
          localStorage.setItem('userToken', 'user-mock-token');
          localStorage.setItem('userData', JSON.stringify(userData));
          navigate('/user');
        } else {
          setError('Invalid password. Please try again.');
        }
      } else {
        setError('User not found. Please check your Aadhar ID.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response && err.response.status === 404) {
        setError('User not found. Please check your Aadhar ID.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
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
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6">User Login</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="aid" className="block text-gray-700 text-sm font-medium mb-2">Aadhar ID</label>
                <input
                  type="text"
                  id="aid"
                  name="aid"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your 12-digit Aadhar ID"
                  value={credentials.aid}
                  onChange={handleChange}
                  required
                  maxLength="12"
                  pattern="[0-9]{12}"
                  title="Aadhar ID must be 12 digits"
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

            <p className="mt-6 text-center text-gray-600">
              Don't have an account?{" "}
              <Link to="/user/register" className="text-blue-600 hover:text-blue-800">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserLogin;