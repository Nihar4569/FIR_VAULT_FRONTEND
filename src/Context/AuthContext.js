// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const AuthContext = createContext();

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  // Auth states for different user types
  const [userAuth, setUserAuth] = useState(null);
  const [policeAuth, setPoliceAuth] = useState(null);
  const [stationAuth, setStationAuth] = useState(null);
  const [adminAuth, setAdminAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      // User authentication
      const userToken = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');
      if (userToken && userData) {
        setUserAuth(JSON.parse(userData));
      }

      // Police authentication
      const policeToken = localStorage.getItem('policeToken');
      const policeData = localStorage.getItem('policeData');
      if (policeToken && policeData) {
        setPoliceAuth(JSON.parse(policeData));
      }

      // Station authentication
      const stationToken = localStorage.getItem('stationToken');
      const stationData = localStorage.getItem('stationData');
      if (stationToken && stationData) {
        setStationAuth(JSON.parse(stationData));
      }

      // Admin authentication
      const adminToken = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');
      if (adminToken && adminData) {
        setAdminAuth(JSON.parse(adminData));
      }
    } catch (error) {
      console.error('Error loading auth state from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login functions
  const loginUser = (data) => {
    localStorage.setItem('userToken', 'user-token');
    localStorage.setItem('userData', JSON.stringify(data));
    setUserAuth(data);
  };

  const loginPolice = (data) => {
    localStorage.setItem('policeToken', 'police-token');
    localStorage.setItem('policeData', JSON.stringify(data));
    setPoliceAuth(data);
  };

  const loginStation = (data) => {
    localStorage.setItem('stationToken', 'station-token');
    localStorage.setItem('stationData', JSON.stringify(data));
    setStationAuth(data);
  };

  const loginAdmin = (data) => {
    localStorage.setItem('adminToken', 'admin-token');
    localStorage.setItem('adminData', JSON.stringify(data));
    setAdminAuth(data);
  };

  // Logout functions
  const logoutUser = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUserAuth(null);
  };

  const logoutPolice = () => {
    localStorage.removeItem('policeToken');
    localStorage.removeItem('policeData');
    setPoliceAuth(null);
  };

  const logoutStation = () => {
    localStorage.removeItem('stationToken');
    localStorage.removeItem('stationData');
    setStationAuth(null);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdminAuth(null);
  };

  // Check if user is authenticated
  const isUserAuthenticated = !!userAuth;
  const isPoliceAuthenticated = !!policeAuth;
  const isStationAuthenticated = !!stationAuth;
  const isAdminAuthenticated = !!adminAuth;

  // Context value
  const value = {
    userAuth,
    policeAuth,
    stationAuth,
    adminAuth,
    isLoading,
    isUserAuthenticated,
    isPoliceAuthenticated,
    isStationAuthenticated,
    isAdminAuthenticated,
    loginUser,
    loginPolice,
    loginStation,
    loginAdmin,
    logoutUser,
    logoutPolice,
    logoutStation,
    logoutAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};