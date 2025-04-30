import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../Components/Footer';
import Navbar from '../../Components/Navbar';
import { firAPI, stationAPI, userAPI, criminalAPI } from '../../Services/api';
import { LinkCriminalModal } from '../Criminal';
import { formatDate, getStatusDisplayClass, getStatusDisplayName } from '../../utils/dataUtils';
import { getErrorMessage } from '../../utils/errorUtils';
import { useAuth } from '../../Context/AuthContext';
const PolicePortal = () => {
  const { policeAuth, isPoliceAuthenticated, logoutPolice } = useAuth();
  const [officer, setOfficer] = useState(null);
  const [stationInfo, setStationInfo] = useState(null);
  const [firs, setFirs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFir, setSelectedFir] = useState(null);
  const [complainant, setComplainant] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [isLinkCriminalModalOpen, setIsLinkCriminalModalOpen] = useState(false);
  const [linkingFirId, setLinkingFirId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Comprehensive status flow with multiple stages
  const statusFlow = {
    'submitted': 'assigned',
    'assigned': 'investigating',
    'investigating': 'evidence_collection',
    'evidence_collection': 'under_review',
    'under_review': 'resolved'
  };

  // Detailed status display names for UI
  const statusDisplayNames = {
    'submitted': 'Submitted',
    'assigned': 'Assigned',
    'investigating': 'Investigating',
    'evidence_collection': 'Evidence Collection',
    'under_review': 'Under Review',
    'resolved': 'Resolved'
  };

  useEffect(() => {
    if (!isPoliceAuthenticated) {
      navigate('/police/login');
      return;
    }

    setOfficer(policeAuth);

    // Fetch station information and FIRs
    if (policeAuth?.stationId) {
      fetchStationInfo(policeAuth.stationId);
      fetchFIRs(policeAuth.hrms, policeAuth.stationId);
    } else {
      console.error('Missing station ID in police auth data');
      setIsLoading(false);
    }
  }, [isPoliceAuthenticated, policeAuth, navigate]);

  const openLinkCriminalModal = (firId) => {
    setLinkingFirId(firId);
    setIsLinkCriminalModalOpen(true);
  };

  const fetchStationInfo = async (stationId) => {
    try {
      if (!stationId) {
        console.error('No station ID provided');
        return;
      }

      const response = await stationAPI.getStationById(stationId);
      const stationData = response?.data || response;
      
      if (stationData) {
        setStationInfo(stationData);
      } else {
        console.error('No station data returned for ID:', stationId);
        setError('Failed to retrieve station information. Please contact administrator.');
      }
    } catch (error) {
      console.error('Error fetching station info:', error);
      setError('Error loading station information: ' + getErrorMessage(error));
    }
  };

  const fetchFIRs = async (officerId, stationId) => {
    try {
      if (!stationId) {
        console.error('No station ID provided');
        setIsLoading(false);
        return;
      }

      const response = await firAPI.getAllFIRs();
      const firsData = response?.data || response || [];
      
      if (Array.isArray(firsData)) {
        // Ensure stationId is treated as string for comparison
        const stationIdStr = stationId.toString();
        
        const stationFIRs = firsData.filter(fir =>
          fir.stationId && fir.stationId.toString() === stationIdStr
        );
        
        setFirs(stationFIRs);
      } else {
        console.error('Invalid FIRs data format:', firsData);
        setFirs([]);
        setError('Failed to load FIR data. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching FIRs:', error);
      setError('Error loading FIRs: ' + getErrorMessage(error));
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
      if (!victimId) {
        console.error('No victim ID provided');
        return;
      }
      
      const response = await userAPI.getUserById(victimId);
      const userData = response?.data || response;
      
      if (userData) {
        setComplainant(userData);
      } else {
        console.error('No user data found for victim ID:', victimId);
      }
    } catch (error) {
      console.error('Error fetching complainant details:', error);
      setError('Error loading complainant details: ' + getErrorMessage(error));
    }
  };
 
  const viewFirDetails = async (fir) => {
    setSelectedFir(fir);
    setComplainant(null);
    setIsViewModalOpen(true);
 
    if (fir.victimId) {
      fetchComplainantDetails(fir.victimId);
    }
  };
 
  const handleLogout = () => {
    logoutPolice();
    navigate('/police/login');
  };
 
  const handleAssignToMe = async (firId) => {
    setIsProcessing(true);
    setError('');
    
    try {
      if (!officer?.hrms) {
        throw new Error('Officer ID is missing');
      }
      
      const assignResponse = await firAPI.assignOfficer(firId, officer.hrms);
      
      if (assignResponse) {
        // Also update the status to "assigned"
        await firAPI.updateStatus(firId, "assigned");
        
        // Refresh FIRs list
        await fetchFIRs(officer.hrms, officer.stationId);
        alert("FIR has been assigned to you successfully");
      } else {
        throw new Error('Failed to assign FIR');
      }
    } catch (error) {
      console.error('Error assigning officer:', error);
      setError('Error assigning FIR: ' + getErrorMessage(error));
      alert("Failed to assign FIR. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
 
  const handleUpdateStatus = async (firId, status) => {
    setIsProcessing(true);
    setError('');
    
    try {
      if (!firId || !status) {
        throw new Error('FIR ID or status is missing');
      }
      
      const response = await firAPI.updateStatus(firId, status);
      
      if (response) {
        // If setting to "resolved", also close the FIR if it's not already closed
        if (status === "resolved") {
          const fir = firs.find(f => f.firId === firId);
          if (fir && !fir.close) {
            await firAPI.closeFIR(firId);
          }
        }
        
        // Refresh FIRs list
        await fetchFIRs(officer.hrms, officer.stationId);
        alert(`FIR status updated to ${statusDisplayNames[status] || status}`);
        setIsStatusModalOpen(false);
        setIsViewModalOpen(false);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Error updating status: ' + getErrorMessage(error));
      alert("Failed to update status. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
 
  const handleResolveFIR = async (firId) => {
    setIsProcessing(true);
    setError('');
    
    try {
      if (!firId) {
        throw new Error('FIR ID is missing');
      }
      
      const response = await firAPI.closeFIR(firId);
      
      if (response) {
        // Also update status to "resolved"
        await firAPI.updateStatus(firId, "resolved");
        
        // Refresh FIRs list
        await fetchFIRs(officer.hrms, officer.stationId);
        alert("FIR has been marked as resolved");
      } else {
        throw new Error('Failed to resolve FIR');
      }
    } catch (error) {
      console.error('Error closing FIR:', error);
      setError('Error resolving FIR: ' + getErrorMessage(error));
      alert("Failed to resolve FIR. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
 
  // Get next status in workflow
  const getNextStatus = (currentStatus) => {
    return statusFlow[currentStatus] || 'resolved';
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
 
  // Handle input changes from search
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };
 
  // Handle sort selection
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
 
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Police Officer Portal</h1>
 
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button 
                className="float-right font-bold" 
                onClick={() => setError('')}
              >
                &times;
              </button>
            </div>
          )}
 
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : isPoliceAuthenticated ? (
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
                      <h2 className="text-2xl font-semibold">{officer?.name}</h2>
                      <p className="text-blue-200">
                        {officer?.position} | {stationInfo ? stationInfo.stationName : 'Loading station...'}
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
                  <div className="flex flex-col md:flex-row w-full md:w-auto gap-2">
                    <input
                      type="text"
                      placeholder="Search by FIR ID, location..."
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                    />
                    <select 
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sortOption}
                      onChange={handleSortChange}
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
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusDisplayClass(fir.status, 'fir')}`}>
                                {getStatusDisplayName(fir.status)}
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
                                {fir.officerId === officer?.hrms && !fir.close && (
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
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusDisplayClass(selectedFir.status, 'fir')}`}>
                    {getStatusDisplayName(selectedFir.status)}
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h2 className="text-xl font-bold">FIR Details #{selectedFir.firId}</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Complaint Date</h3>
                  <p>{formatDate(selectedFir.complainDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Incident Date</h3>
                  <p>{formatDate(selectedFir.incidentDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Incident Location</h3>
                  <p>{selectedFir.incidentLocation}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <p>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusDisplayClass(selectedFir.status, 'fir')}`}>
                      {getStatusDisplayName(selectedFir.status)}
                    </span>
                  </p>
                </div>
                {selectedFir.officerId && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Assigned Officer</h3>
                    <p>{selectedFir.officerId === officer?.hrms ? 'You' : `Officer #${selectedFir.officerId}`}</p>
                  </div>
                )}
                {selectedFir.criminalId && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Linked Criminal</h3>
                    <p>ID: {selectedFir.criminalId.toString()}</p>
                  </div>
                )}
              </div>
 
              {complainant && (
                <div className="mb-6">
                  <h3 className="font-medium border-b pb-2 mb-2">Complainant Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span> 
                      <p>{complainant.User_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Aadhar ID:</span> 
                      <p>{complainant.aid?.toString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Phone:</span> 
                      <p>{complainant.phone_no?.toString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Email:</span> 
                      <p>{complainant.email}</p>
                    </div>
                  </div>
                </div>
              )}
 
              <div className="mb-6">
                <h3 className="font-medium border-b pb-2 mb-2">Complaint Description</h3>
                <p className="bg-gray-50 p-3 rounded whitespace-pre-wrap">{selectedFir.description}</p>
              </div>
 
              <div className="flex justify-between mt-6 pt-4 border-t">
                <div>
                  {!selectedFir.criminalId && (
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        openLinkCriminalModal(selectedFir.firId);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                    >
                      Link to Criminal Record
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  {selectedFir.officerId === officer?.hrms && !selectedFir.close && (
                    <>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        onClick={() => handleOpenStatusChange(selectedFir)}
                      >
                        Change Status
                      </button>
                      {(selectedFir.status === 'under_review' || selectedFir.status === 'resolved') && (
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                          onClick={() => {
                            handleResolveFIR(selectedFir.firId);
                            setIsViewModalOpen(false);
                          }}
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Processing...' : 'Mark as Resolved'}
                        </button>
                      )}
                    </>
                  )}
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* Link Criminal Modal */}
      {isLinkCriminalModalOpen && (
        <LinkCriminalModal
          isOpen={isLinkCriminalModalOpen}
          onClose={() => setIsLinkCriminalModalOpen(false)}
          firId={linkingFirId}
          refreshData={() => fetchFIRs(officer?.hrms, officer?.stationId)}
        />
      )}
 
      <Footer />
    </div>
  );
 };
 
 export default PolicePortal;