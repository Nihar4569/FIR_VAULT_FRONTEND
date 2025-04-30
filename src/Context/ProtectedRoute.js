import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ 
  authType = 'user', 
  redirectPath = '/login',
  children 
}) => {
  const auth = useAuth();
  
  if (auth.isLoading) {
    // Show loading spinner while checking authentication
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Check if user is authenticated based on auth type
  let isAuthenticated = false;
  
  switch (authType) {
    case 'user':
      isAuthenticated = auth.isUserAuthenticated;
      redirectPath = '/user/login';
      break;
    case 'police':
      isAuthenticated = auth.isPoliceAuthenticated;
      redirectPath = '/police/login';
      break;
    case 'station':
      isAuthenticated = auth.isStationAuthenticated;
      redirectPath = '/station/login';
      break;
    case 'admin':
      isAuthenticated = auth.isAdminAuthenticated;
      redirectPath = '/admin/login';
      break;
    default:
      isAuthenticated = false;
      redirectPath = '/login';
  }
  
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return children ? children : <Outlet />;
};