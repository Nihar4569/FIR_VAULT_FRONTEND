import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../Components/Footer';
import Navbar from '../../Components/Navbar';
import { userAPI } from '../../Services/api';

const UserRegister = () => {
  const [userData, setUserData] = useState({
    aid: '', // Added Aadhar ID field
    User_name: '',
    email: '',
    phone_no: '',
    dob: '',
    gender: 'Male',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const userToRegister = {
        aid: userData.aid, // Include Aadhar ID
        User_name: userData.User_name,
        email: userData.email,
        phone_no: userData.phone_no,
        dob: userData.dob,
        gender: userData.gender,
        password: userData.password
      };

      const response = await userAPI.register(userToRegister);

      if (response.data) {
        // Store user data in localStorage
        localStorage.setItem('userToken', 'user-mock-token');
        localStorage.setItem('userData', JSON.stringify(response.data));
        navigate('/user');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-20 py-8 flex items-center justify-center bg-gray-50">
        <div className="max-w-lg w-full mx-4 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6">User Registration</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Aadhar ID Field */}
                <div>
                  <label htmlFor="aid" className="block text-gray-700 text-sm font-medium mb-2">Aadhar Number</label>
                  <input
                    type="text"
                    id="aid"
                    name="aid"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your 12-digit Aadhar ID"
                    value={userData.aid}
                    onChange={handleChange}
                    required
                    maxLength="12"
                    pattern="[0-9]{12}"
                    title="Aadhar ID must be 12 digits"
                  />
                </div>

                <div>
                  <label htmlFor="User_name" className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    id="User_name"
                    name="User_name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                    value={userData.User_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                    value={userData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone_no" className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="text"
                    id="phone_no"
                    name="phone_no"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                    value={userData.phone_no}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    title="Phone number must be 10 digits"
                    maxLength="10"
                  />
                </div>

                <div>
                  <label htmlFor="dob" className="block text-gray-700 text-sm font-medium mb-2">Date of Birth</label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={userData.dob}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-gray-700 text-sm font-medium mb-2">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={userData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Create a password"
                    value={userData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your password"
                    value={userData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    required
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I agree to the{" "}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-800">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
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
                ) : 'Register'}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/user/login" className="text-blue-600 hover:text-blue-800">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserRegister;