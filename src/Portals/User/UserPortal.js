import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../Components/Footer';
import Navbar from '../../Components/Navbar';
import { firAPI } from '../../Services/api';

const UserPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [firs, setFirs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    const userDataStr = localStorage.getItem('userData');

    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setIsAuthenticated(true);
        setUser(userData);

        // Fetch FIRs related to this user
        fetchUserFIRs(userData.aid);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserFIRs = async (userId) => {
    try {
      // Get all FIRs and filter for this user
      // Note: This is a workaround since backend doesn't provide an endpoint to get FIRs by userId
      const response = await firAPI.getAllFIRs();
      if (response.data) {
        // Filter FIRs for this user (assuming victimId matches user's aid)
        const userFirs = response.data.filter(fir => fir.victimId === userId);
        setFirs(userFirs);
      }
    } catch (error) {
      console.error('Error fetching FIRs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/user/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">User Portal</h1>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : isAuthenticated ? (
            <div >
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4">Welcome, {user.User_name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{user.phone_no.toString()}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total FIRs</p>
                    <p className="font-medium">{firs.length}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link to="/user/file-fir" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    File New FIR
                  </Link>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">
                    Edit Profile
                  </button>
                  <button
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded ml-auto"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-4">Your FIRs</h3>

              {firs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="py-3 px-4 text-left">FIR ID</th>
                        <th className="py-3 px-4 text-left">Date Filed</th>
                        <th className="py-3 px-4 text-left">Incident Date</th>
                        <th className="py-3 px-4 text-left">Location</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {firs.map((fir) => (
                        <tr key={fir.firId} className="hover:bg-gray-50">
                          <td className="py-3 px-4">{fir.firId}</td>
                          <td className="py-3 px-4">{new Date(fir.complainDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{new Date(fir.incidentDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{fir.incidentLocation}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${fir.close
                              ? 'bg-green-100 text-green-800'
                              : fir.officerId
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                              }`}>
                              {fir.close ? 'Resolved' : fir.officerId ? 'In Progress' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Link to={`/tracking/${fir.firId}`} className="text-blue-600 hover:text-blue-800 mr-3">
                              Track
                            </Link>
                            <Link to={`/user/firs/${fir.firId}`} className="text-blue-600 hover:text-blue-800">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600 mb-4">You haven't filed any FIRs yet.</p>
                  <Link to="/user/file-fir" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    File Your First FIR
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden" >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-center mb-6">User Login Required</h2>
                <p className="text-gray-600 mb-6 text-center">
                  Please login to access the user portal and manage your FIRs.
                </p>
                <div className="flex flex-col gap-4">
                  <Link to="/user/login" className="bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded transition duration-300">
                    Login
                  </Link>
                  <p className="text-center text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/user/register" className="text-blue-600 hover:text-blue-800">
                      Register
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserPortal;