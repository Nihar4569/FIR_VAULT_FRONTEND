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
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('');

  // Status flow - defines the next status in the workflow
  const statusFlow = {
    'submitted': 'assigned',
    'assigned': 'investigating',
    'investigating': 'evidence_collection',
    'evidence_collection': 'under_review',
    'under_review': 'resolved'
  };

  // Status display names for UI
  const statusDisplayNames = {
    'submitted': 'Submitted',
    'assigned': 'Assigned',
    'investigating': 'Investigating',
    'evidence_collection': 'Evidence Collection',
    'under_review': 'Under Review',
    'resolved': 'Resolved'
  };

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

  const handleOpenStatusChange = (fir) => {
    setSelectedFir(fir);
    setNewStatus(fir.status || 'submitted');
    setIsStatusModalOpen(true);
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
      alert(`FIR status updated to ${statusDisplayNames[status] || status}`);
      // Close both modals
      setIsStatusModalOpen(false);
      setIsViewModalOpen(false);
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

  // Get next status in workflow
  const getNextStatus = (currentStatus) => {
    return statusFlow[currentStatus] || 'resolved';
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Apply search filter
  const applySearchFilter = (firs) => {
    if (!searchQuery.trim()) return firs;
    
    const query = searchQuery.toLowerCase().trim();
    return firs.filter(fir => 
      fir.firId.toString().includes(query) ||
      fir.incidentLocation?.toLowerCase().includes(query) ||
      fir.description?.toLowerCase().includes(query)
    );
  };

  // Apply sorting
  const applySorting = (firs) => {
    if (!sortOption) return firs;
    
    const sortedFirs = [...firs];
    
    switch(sortOption) {
      case 'recent':
        return sortedFirs.sort((a, b) => new Date(b.complainDate) - new Date(a.complainDate));
      case 'oldest':
        return sortedFirs.sort((a, b) => new Date(a.complainDate) - new Date(b.complainDate));
      default:
        return sortedFirs;
    }
  };

  // Filter FIRs based on active tab
  const filteredFIRs = applySorting(applySearchFilter(firs.filter(fir => {
    if (activeTab === 'pending') return fir.status === 'submitted' && !fir.officerId;
    if (activeTab === 'inProgress') return fir.officerId === officer?.hrms && !fir.close;
    if (activeTab === 'resolved') return fir.close && fir.officerId === officer?.hrms;
    return true;
  })));

  // Get status badge color
  const getStatusBadgeColor = (fir) => {
    if (fir.close) return 'bg-green-100 text-green-800';
    
    switch(fir.status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
        return 'bg-orange-100 text-orange-800';
      case 'evidence_collection':
        return 'bg-purple-100 text-purple-800';
      case 'under_review':
        return 'bg-indigo-100 text-indigo-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get formatted status display name
  const getStatusDisplayName = (fir) => {
    if (fir.close) return 'Resolved';
    return statusDisplayNames[fir.status] || fir.status || 'Submitted';
  };

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
                <div className="p-4 bg-gray-50 border-b flex flex-col md:flex-row items-center justify-between">
                  <h3 className="text-lg font-semibold mb-2 md:mb-0">
                    {activeTab === 'pending' ? 'Pending FIRs' :
                      activeTab === 'inProgress' ? 'My Cases' :
                        activeTab === 'resolved' ? 'Resolved FIRs' : 'All FIRs'}
                  </h3>
                  <div className="flex flex-col md:flex-row w-full md:w-auto gap-2">
                    <input
                      type="text"
                      placeholder="Search by FIR ID, location..."
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select 
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="">Sort by</option>
                      <option value="recent">Most Recent</option>
                      <option value="oldest">Oldest First</option>
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
                            <td className="py-3 px-4 text-sm text-gray-500">{formatDate(fir.complainDate)}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{formatDate(fir.incidentDate)}</td>
                            <td className="py-3 px-4 text-sm">{fir.incidentLocation}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(fir)}`}>
                                {getStatusDisplayName(fir)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  className="text-blue-600 hover:text-blue-800"
                                  onClick={() => viewFirDetails(fir)}
                                >
                                  View
                                </button>
                                
                                {/* Show Assign button only for pending FIRs */}
                                {!fir.officerId && fir.status === 'submitted' && (
                                  <button
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={() => handleAssignToMe(fir.firId)}
                                    disabled={isProcessing}
                                  >
                                    {isProcessing ? 'Processing...' : 'Assign to Me'}
                                  </button>
                                )}
                                
                                {/* Show dynamic next status button for assigned cases */}
                                {fir.officerId === officer.hrms && !fir.close && (
                                  <>
                                    {fir.status !== 'resolved' && (
                                      <button
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => handleUpdateStatus(fir.firId, getNextStatus(fir.status))}
                                        disabled={isProcessing}
                                      >
                                        {isProcessing ? 'Processing...' : `Move to ${statusDisplayNames[getNextStatus(fir.status)]}`}
                                      </button>
                                    )}
                                    
                                    {/* Show resolve button only for cases in final stages */}
                                    {(fir.status === 'under_review' || fir.status === 'resolved') && !fir.close && (
                                      <button
                                        className="text-green-600 hover:text-green-800"
                                        onClick={() => handleResolveFIR(fir.firId)}
                                        disabled={isProcessing}
                                      >
                                        {isProcessing ? 'Processing...' : 'Close Case'}
                                      </button>
                                    )}
                                    
                                    {/* Status change button always available */}
                                    <button
                                      className="text-purple-600 hover:text-purple-800"
                                      onClick={() => handleOpenStatusChange(fir)}
                                      disabled={isProcessing}
                                    >
                                      Change Status
                                    </button>
                                  </>
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
                    <p className="text-gray-500">
                      {searchQuery ? "No FIRs match your search criteria" : "No FIRs found in this category"}
                    </p>
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

      {/* Status Change Confirmation Modal */}
      {isStatusModalOpen && selectedFir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Update FIR Status</h2>
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Current Status</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(selectedFir)}`}>
                    {getStatusDisplayName(selectedFir)}
                  </span>
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="newStatus" className="block text-gray-700 text-sm font-medium mb-2">Select New Status</label>
                <select
                  id="newStatus"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  <option value="">Select status</option>
                  <option value="submitted">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="investigating">Investigating</option>
                  <option value="evidence_collection">Evidence Collection</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg mb-6">
                <p className="text-sm">
                  <span className="font-medium">Note:</span> Changing the status will update the case progress.
                  This action will be recorded in the system.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => setIsStatusModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => handleUpdateStatus(selectedFir.firId, newStatus)}
                  disabled={isProcessing || !newStatus}
                >
                  {isProcessing ? 'Updating...' : 'Confirm Status Change'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(selectedFir)}`}>
                      {getStatusDisplayName(selectedFir)}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Filed On</h3>
                  <p className="text-lg">{formatDate(selectedFir.complainDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Incident Date</h3>
                  <p className="text-lg">{formatDate(selectedFir.incidentDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Incident Location</h3>
                  <p className="text-lg">{selectedFir.incidentLocation}</p>
                </div>
              </div>

              {/* Case Timeline */}
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">Case Timeline</h3>
                <div className="relative pl-8 border-l-2 border-blue-200 ml-4 mb-4">
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">{formatDate(selectedFir.complainDate)}</p>
                    <p className="font-medium">FIR Submitted</p>
                    <p className="text-sm text-gray-600">Case was registered in the system</p>
                  </div>
                  
                  {selectedFir.officerId && (
                    <div className="mb-4">
                      <div className="absolute -left-2 w-4 h-4 rounded-full bg-yellow-500"></div>
                      <p className="text-sm text-gray-500">-</p>
                      <p className="font-medium">Assigned to Officer</p>
                      <p className="text-sm text-gray-600">Case assigned to {officer?.name}</p>
                    </div>
                  )}
                  
                  {selectedFir.status === 'investigating' && (
                    <div className="mb-4">
                      <div className="absolute -left-2 w-4 h-4 rounded-full bg-orange-500"></div>
                      <p className="text-sm text-gray-500">-</p>
                      <p className="font-medium">Investigation Started</p>
                      <p className="text-sm text-gray-600">Officer began investigating the case</p>
                    </div>
                  )}
                  
                  {selectedFir.status === 'evidence_collection' && (
                    <div className="mb-4">
                      <div className="absolute -left-2 w-4 h-4 rounded-full bg-purple-500"></div>
                      <p className="text-sm text-gray-500">-</p>
                      <p className="font-medium">Evidence Collection</p>
                      <p className="text-sm text-gray-600">Gathering evidence related to the case</p>
                    </div>
                  )}
                  
                  {selectedFir.status === 'under_review' && (
                    <div className="mb-4">
                      <div className="absolute -left-2 w-4 h-4 rounded-full bg-indigo-500"></div>
                      <p className="text-sm text-gray-500">-</p>
                      <p className="font-medium">Under Review</p>
                      <p className="text-sm text-gray-600">Case is under final review before resolution</p>
                    </div>
                  )}
                  
                  {selectedFir.close && (
                    <div className="mb-4">
                      <div className="absolute -left-2 w-4 h-4 rounded-full bg-green-500"></div>
                      <p className="text-sm text-gray-500">-</p>
                      <p className="font-medium">Case Resolved</p>
                      <p className="text-sm text-gray-600">Case has been closed successfully</p>
                    </div>
                  )}
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

              {/* Add Case Notes Section */}
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">Case Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    rows="3"
                    placeholder="Add notes about this case (for internal use only)"
                  ></textarea>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm">
                    Save Notes
                  </button>
                  <p className="text-xs text-gray-500 mt-1">These notes are only visible to police officers</p>
                </div>
              </div>

              {/* Evidence Tracker */}
              {selectedFir.officerId === officer?.hrms && !selectedFir.close && (
                <div className="mb-6">
                  <h3 className="font-medium text-lg mb-2">Evidence Tracker</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <input type="checkbox" id="evidence1" className="h-4 w-4 text-blue-600" />
                        <label htmlFor="evidence1" className="text-gray-700">Witness statements collected</label>
                      </li>
                      <li className="flex items-center space-x-2">
                        <input type="checkbox" id="evidence2" className="h-4 w-4 text-blue-600" />
                        <label htmlFor="evidence2" className="text-gray-700">Photos of incident location</label>
                      </li>
                      <li className="flex items-center space-x-2">
                        <input type="checkbox" id="evidence3" className="h-4 w-4 text-blue-600" />
                        <label htmlFor="evidence3" className="text-gray-700">Documentation verified</label>
                      </li>
                    </ul>
                    <div className="flex items-center mt-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add new evidence item"
                      />
                      <button className="bg-blue-600 text-white px-3 py-1 rounded-r-md">Add</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-end gap-4 mt-6 border-t pt-4">
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
                    {/* Next status button */}
                    {selectedFir.status !== 'resolved' && (
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        onClick={() => {
                          handleUpdateStatus(selectedFir.firId, getNextStatus(selectedFir.status));
                          setIsViewModalOpen(false);
                        }}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : `Move to ${statusDisplayNames[getNextStatus(selectedFir.status)]}`}
                      </button>
                    )}
                    
                    {/* Change Status button */}
                    <button
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleOpenStatusChange(selectedFir);
                      }}
                      disabled={isProcessing}
                    >
                      Change Status
                    </button>
                    
                    {/* Resolve button for final stages */}
                    {(selectedFir.status === 'under_review' || selectedFir.status === 'resolved') && !selectedFir.close && (
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                        onClick={() => {
                          handleResolveFIR(selectedFir.firId);
                          setIsViewModalOpen(false);
                        }}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : 'Close Case'}
                      </button>
                    )}
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