import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../Components/Footer';
import Navbar from '../../Components/Navbar';
import { firAPI, stationAPI, userAPI } from '../../Services/api';

const PolicePortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [officer, setOfficer] = useState(null);
  const [stationInfo, setStationInfo] = useState(null);
  const [firs, setFirs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFir, setSelectedFir] = useState(null);
  const [complainant, setComplainant] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if police officer is logged in
    const token = localStorage.getItem('policeToken');
    const policeDataStr = localStorage.getItem('policeData');

    if (token && policeDataStr) {
      try {
        const policeData = JSON.parse(policeDataStr);
        setIsAuthenticated(true);
        setOfficer(policeData);

        // Fetch station information
        fetchStationInfo(policeData.stationId);

        // Fetch FIRs
        fetchFIRs(policeData.hrms, policeData.stationId);
      } catch (error) {
        console.error('Error parsing police data:', error);
        localStorage.removeItem('policeToken');
        localStorage.removeItem('policeData');
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchStationInfo = async (stationId) => {
    try {
      if (!stationId) {
        console.error('No station ID provided');
        return;
      }

      const response = await stationAPI.getStationById(stationId);
      if (response.data) {
        setStationInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching station info:', error);
    }
  };

  const fetchFIRs = async (officerId, stationId) => {
    try {
      // Get all FIRs from backend
      const response = await firAPI.getAllFIRs();
      if (response.data) {
        // Filter FIRs based on the officer's station
        const stationFIRs = response.data.filter(fir =>
          fir.stationId && fir.stationId.toString() === stationId.toString()
        );
        setFirs(stationFIRs);
      }
    } catch (error) {
      console.error('Error fetching FIRs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComplainantDetails = async (victimId) => {
    try {
      const response = await userAPI.getUserById(victimId);
      if (response.data) {
        setComplainant(response.data);
      }
    } catch (error) {
      console.error('Error fetching complainant details:', error);
    }
  };

  const viewFirDetails = async (fir) => {
    setSelectedFir(fir);
    setComplainant(null); // Reset complainant info
    setIsViewModalOpen(true);
    
    // Fetch complainant details
    if (fir.victimId) {
      fetchComplainantDetails(fir.victimId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('policeToken');
    localStorage.removeItem('policeData');
    setIsAuthenticated(false);
    setOfficer(null);
    navigate('/police/login');
  };

  const handleAssignToMe = async (firId) => {
    setIsProcessing(true);
    try {
      await firAPI.assignOfficer(firId, officer.hrms);
      // Update status to "assigned"
      await firAPI.updateStatus(firId, "assigned");
      // Refresh FIRs
      await fetchFIRs(officer.hrms, officer.stationId);
      // Show success message
      alert("FIR has been assigned to you successfully");
    } catch (error) {
      console.error('Error assigning officer:', error);
      alert("Failed to assign FIR. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStatus = async (firId, status) => {
    setIsProcessing(true);
    try {
      await firAPI.updateStatus(firId, status);
      // Refresh FIRs
      await fetchFIRs(officer.hrms, officer.stationId);
      // Show success message
      alert(`FIR status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveFIR = async (firId) => {
    setIsProcessing(true);
    try {
      await firAPI.closeFIR(firId);
      await firAPI.updateStatus(firId, "resolved");
      // Refresh FIRs
      await fetchFIRs(officer.hrms, officer.stationId);
      // Show success message
      alert("FIR has been marked as resolved");
    } catch (error) {
      console.error('Error closing FIR:', error);
      alert("Failed to resolve FIR. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter FIRs based on active tab
  const filteredFIRs = firs.filter(fir => {
    if (activeTab === 'pending') return fir.status === 'submitted' && !fir.officerId;
    if (activeTab === 'inProgress') return fir.officerId === officer?.hrms && !fir.close;
    if (activeTab === 'resolved') return fir.close && fir.officerId === officer?.hrms;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Police Officer Portal</h1>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : isAuthenticated ? (
            <div>
              <div className="bg-blue-700 text-white rounded-lg shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="bg-blue-800 rounded-full p-3 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">{officer.name}</h2>
                      <p className="text-blue-200">
                        {officer.position} | {stationInfo ? stationInfo.stationName : 'Loading station...'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/police/profile" className="bg-blue-600 hover:bg-blue-800 px-4 py-2 rounded text-center">
                      Profile
                    </Link>
                    <button
                      className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                <div className="grid grid-cols-3 divide-x">
                  <div
                    className={`py-4 px-6 text-center cursor-pointer transition ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('pending')}
                  >
                    <div className="text-2xl font-bold mb-1">
                      {firs.filter(fir => fir.status === 'submitted' && !fir.officerId).length}
                    </div>
                    <div className="text-sm">Pending</div>
                  </div>
                  <div
                    className={`py-4 px-6 text-center cursor-pointer transition ${activeTab === 'inProgress' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('inProgress')}
                  >
                    <div className="text-2xl font-bold mb-1">
                      {firs.filter(fir => fir.officerId === officer?.hrms && !fir.close).length}
                    </div>
                    <div className="text-sm">My Cases</div>
                  </div>
                  <div
                    className={`py-4 px-6 text-center cursor-pointer transition ${activeTab === 'resolved' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('resolved')}
                  >
                    <div className="text-2xl font-bold mb-1">
                      {firs.filter(fir => fir.close && fir.officerId === officer?.hrms).length}
                    </div>
                    <div className="text-sm">Resolved</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {activeTab === 'pending' ? 'Pending FIRs' :
                      activeTab === 'inProgress' ? 'My Cases' :
                        activeTab === 'resolved' ? 'Resolved FIRs' : 'All FIRs'}
                  </h3>
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="Search FIRs..."
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                    />
                    <select className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">All</option>
                      <option value="high">Recent</option>
                      <option value="medium">Oldest</option>
                    </select>
                  </div>
                </div>

                {filteredFIRs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FIR ID</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint Date</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incident Date</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredFIRs.map((fir) => (
                          <tr key={fir.firId} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-medium">{fir.firId}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{new Date(fir.complainDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{new Date(fir.incidentDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-sm">{fir.incidentLocation}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${fir.close
                                  ? 'bg-green-100 text-green-800'
                                  : fir.officerId
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                {fir.close ? 'Resolved' : fir.officerId ? 'Investigating' : 'Submitted'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <button 
                                  className="text-blue-600 hover:text-blue-800"
                                  onClick={() => viewFirDetails(fir)}
                                >
                                  View
                                </button>
                                {!fir.officerId && (
                                  <button
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={() => handleAssignToMe(fir.firId)}
                                    disabled={isProcessing}
                                  >
                                    {isProcessing ? 'Processing...' : 'Assign to Me'}
                                  </button>
                                )}
                                {fir.officerId === officer.hrms && !fir.close && (
                                  <div className="flex space-x-2">
                                    <button
                                      className="text-blue-600 hover:text-blue-800"
                                      onClick={() => handleUpdateStatus(fir.firId, "investigating")}
                                      disabled={isProcessing}
                                    >
                                      {isProcessing ? 'Processing...' : 'Investigating'}
                                    </button>
                                    <button
                                      className="text-blue-600 hover:text-blue-800"
                                      onClick={() => handleResolveFIR(fir.firId)}
                                      disabled={isProcessing}
                                    >
                                      {isProcessing ? 'Processing...' : 'Resolve'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No FIRs found in this category</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-center mb-6">Police Login Required</h2>
                <p className="text-gray-600 mb-6 text-center">
                  Please login to access the police portal.
                </p>
                <div className="flex flex-col gap-4">
                  <Link to="/police/login" className="bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded transition duration-300">
                    Login
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View FIR Modal */}
      {isViewModalOpen && selectedFir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">FIR #{selectedFir.firId}</h2>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <p className="text-lg">
                    <span className={`px-2 py-1 rounded-full text-xs ${selectedFir.close
                      ? 'bg-green-100 text-green-800'
                      : selectedFir.officerId
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                      }`}>
                      {selectedFir.close ? 'Resolved' : selectedFir.officerId ? 'Investigating' : 'Submitted'}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Filed On</h3>
                  <p className="text-lg">{new Date(selectedFir.complainDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Incident Date</h3>
                  <p className="text-lg">{new Date(selectedFir.incidentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Incident Location</h3>
                  <p className="text-lg">{selectedFir.incidentLocation}</p>
                </div>
              </div>

              {/* Complainant Information - Loaded Asynchronously */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-lg mb-2">Complainant Information</h3>
                {complainant ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{complainant.User_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium">{complainant.phone_no}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{complainant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Aadhar ID</p>
                      <p className="font-medium">{complainant.aid}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                  </div>
                )}
              </div>

              {/* Incident Description */}
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">Incident Description</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-line">{selectedFir.description}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-6 border-t pt-4">
                {!selectedFir.officerId && (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    onClick={() => {
                      handleAssignToMe(selectedFir.firId);
                      setIsViewModalOpen(false);
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Assign to Me'}
                  </button>
                )}
                {selectedFir.officerId === officer?.hrms && !selectedFir.close && (
                  <>
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                      onClick={() => {
                        handleUpdateStatus(selectedFir.firId, "investigating");
                        setIsViewModalOpen(false);
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Mark as Investigating'}
                    </button>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      onClick={() => {
                        handleResolveFIR(selectedFir.firId);
                        setIsViewModalOpen(false);
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Resolve Case'}
                    </button>
                  </>
                )}
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PolicePortal;