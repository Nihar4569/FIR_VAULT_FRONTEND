// src/Portals/Admin/AdminRegister.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../Components/Footer';
import Navbar from '../../Components/Navbar';
import { adminAPI } from '../../Services/api';

const AdminRegister = () => {
    const [adminData, setAdminData] = useState({
        adminId: '',
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        fullName: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setAdminData({
            ...adminData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Basic validation
        if (adminData.password !== adminData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...adminToRegister } = adminData;

            const response = await adminAPI.register(adminToRegister);

            if (response.data) {
                // Store admin data in localStorage
                localStorage.setItem('adminToken', 'admin-token');
                localStorage.setItem('adminData', JSON.stringify(response.data));
                navigate('/admin');
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
                <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-purple-700 p-6 text-white text-center">
                        <div className="inline-block bg-purple-800 rounded-full p-3 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold">Register Admin</h2>
                        <p className="mt-2">Create a new administrator account</p>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="adminId" className="block text-gray-700 text-sm font-medium mb-2">Admin ID</label>
                                <input
                                    type="text"
                                    id="adminId"
                                    name="adminId"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter admin ID"
                                    value={adminData.adminId}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Choose a username"
                                    value={adminData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="fullName" className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter your full name"
                                    value={adminData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter your email"
                                    value={adminData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Create a strong password"
                                    value={adminData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Confirm your password"
                                    value={adminData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition duration-300"
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
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AdminRegister;