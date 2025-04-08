import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { stationAPI, firAPI, policeAPI } from '../../Services/api';

const StationPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [station, setStation] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if station admin is logged in
    const token = localStorage.getItem('stationToken');
    const stationDataStr = localStorage.getItem('stationData');

    if (!token || !stationDataStr) {
      setIsLoading(false);
      return;
    }

    try {
      const stationData = JSON.parse(stationDataStr);
      setIsAuthenticated(true);
      setStation(stationData);

      // Fetch data from the backend
      fetchData(stationData.stationSid);
    } catch (error) {
      console.error('Error parsing station data:', error);
      setIsLoading(false);
    }
  }, []);

  const fetchData = async (stationId) => {
    try {
      // Fetch FIRs for this station
      const firsResponse = await firAPI.getAllFIRs();
      if (firsResponse.data) {
        // Filter FIRs for this station
        const stationFIRs = firsResponse.data.filter(fir =>
          fir.stationId && fir.stationId.toString() === stationId.toString()
        );
        setCases(stationFIRs);
      }

      // Fetch officers for this station
      const officersResponse = await policeAPI.getAllPolice();
      if (officersResponse.data) {
        // Filter officers for this station
        const stationOfficers = officersResponse.data.filter(officer =>
          officer.stationId && officer.stationId.toString() === stationId.toString() && officer.approval
        );
        setOfficers(stationOfficers);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data from the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('stationToken');
    localStorage.removeItem('stationData');
    setIsAuthenticated(false);
    setStation(null);
    navigate('/station/login');
  };

  // Open modal for specific operations
  const openModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Function to handle input change in forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Assign officer to FIR
  const handleAssignOfficer = async (firId, officerId) => {
    setIsProcessing(true);
    try {
      await firAPI.assignOfficer(firId, officerId);
      await firAPI.updateStatus(firId, "assigned");
      // Refresh data
      fetchData(station.stationSid);
      setIsModalOpen(false);
      alert("Officer assigned successfully");
    } catch (error) {
      console.error('Error assigning officer:', error);
      setError('Failed to assign officer. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // View FIR details
  const handleViewFIR = (fir) => {
    openModal('viewFIR', fir);
  };

  // Reassign FIR to a different officer
  const handleReassignFIR = (fir) => {
    setFormData({ officerId: fir.officerId || '' });
    openModal('reassignOfficer', fir);
  };

  // Reopen a closed FIR
  const handleReopenFIR = async (firId) => {
    setIsProcessing(true);
    try {
      await firAPI.closeFIR(firId); // This toggles the close state
      await firAPI.updateStatus(firId, "reopened");
      // Refresh data
      fetchData(station.stationSid);
      alert("FIR reopened successfully");
    } catch (error) {
      console.error('Error reopening FIR:', error);
      setError('Failed to reopen FIR. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Change FIR status
  const handleChangeStatus = (fir) => {
    setFormData({ status: fir.status || 'submitted' });
    openModal('changeStatus', fir);
  };

  // Update FIR status
  const handleUpdateStatus = async (firId, status) => {
    setIsProcessing(true);
    try {
      await firAPI.updateStatus(firId, status);
      // Refresh data
      fetchData(station.stationSid);
      setIsModalOpen(false);
      alert(`FIR status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Stats calculations
  const pendingCases = cases.filter(c => c.status === 'submitted').length;
  const inProgressCases = cases.filter(c => ['assigned', 'investigating'].includes(c.status)).length;
  const resolvedCases = cases.filter(c => c.close).length;
  const activeOfficers = officers.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Police Station Portal</h1>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : isAuthenticated ? (
            <div>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {/* Station Info */}
              <div className="bg-blue-700 text-white rounded-lg shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="bg-blue-800 rounded-full p-3 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">{station?.stationName || 'Police Station'}</h2>
                      <p className="text-blue-200">Station ID: {station?.stationSid || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                <div className="flex border-b">
                  <button
                    className={`flex-1 py-4 px-6 text-center font-medium cursor-pointer transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    Dashboard
                  </button>
                  <button
                    className={`flex-1 py-4 px-6 text-center font-medium cursor-pointer transition ${activeTab === 'officers' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('officers')}
                  >
                    Officers
                  </button>
                  <button
                    className={`flex-1 py-4 px-6 text-center font-medium cursor-pointer transition ${activeTab === 'cases' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('cases')}
                  >
                    Cases
                  </button>
                  <button
                    className={`flex-1 py-4 px-6 text-center font-medium cursor-pointer transition ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('reports')}
                  >
                    Reports
                  </button>
                </div>
              </div>

              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-800 p-3 rounded-full mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Pending Cases</div>
                          <div className="text-2xl font-bold">{pendingCases}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="bg-yellow-100 text-yellow-800 p-3 rounded-full mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">In Progress</div>
                          <div className="text-2xl font-bold">{inProgressCases}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="bg-green-100 text-green-800 p-3 rounded-full mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Resolved</div>
                          <div className="text-2xl font-bold">{resolvedCases}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="bg-purple-100 text-purple-800 p-3 rounded-full mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Active Officers</div>
                          <div className="text-2xl font-bold">{activeOfficers}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Cases */}
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                    <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                      <h3 className="font-semibold">Recent Cases</h3>
                      <button
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        onClick={() => setActiveTab('cases')}
                      >
                        View All
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FIR ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {cases.slice(0, 5).map((fir) => (
                            <tr key={fir.firId} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm font-medium">{fir.firId}</td>
                              <td className="py-3 px-4 text-sm text-gray-500">{new Date(fir.complainDate).toLocaleDateString()}</td>
                              <td className="py-3 px-4 text-sm">{fir.incidentLocation}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${fir.close ? 'bg-green-100 text-green-800' :
                                  fir.officerId ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                  {fir.close ? 'Resolved' :
                                    fir.officerId ? 'In Progress' :
                                      'Pending'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {fir.officerId ? (
                                  (() => {
                                    const assignedOfficer = officers.find(o => o.hrms === fir.officerId);
                                    return assignedOfficer ? assignedOfficer.name : `Officer ID: ${fir.officerId}`;
                                  })()
                                ) : 'Not Assigned'}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                  onClick={() => handleViewFIR(fir)}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Officers Tab */}
              {activeTab === 'officers' && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                    <h3 className="font-semibold">Station Officers</h3>
                  </div>
                  {officers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HRMS ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Cases</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {officers.map((officer) => {
                            // Count assigned cases
                            const assignedCases = cases.filter(fir => fir.officerId === officer.hrms).length;

                            return (
                              <tr key={officer.hrms} className="hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm font-medium">{officer.hrms}</td>
                                <td className="py-3 px-4 text-sm">{officer.name}</td>
                                <td className="py-3 px-4 text-sm">{officer.position}</td>
                                <td className="py-3 px-4 text-sm text-gray-500">{officer.email}</td>
                                <td className="py-3 px-4 text-sm text-gray-500">{officer.phone_no?.toString()}</td>
                                <td className="py-3 px-4 text-sm text-center">{assignedCases}</td>
                                <td className="py-3 px-4">
                                  <div className="flex space-x-2">
                                    <button
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                      onClick={() => openModal('viewOfficer', officer)}
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No officers assigned to this station yet.
                    </div>
                  )}
                </div>
              )}

              {/* Cases Tab */}
              {activeTab === 'cases' && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="font-semibold">All Cases</h3>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Search cases..."
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Statuses</option>
                        <option value="submitted">Pending</option>
                        <option value="assigned">Assigned</option>
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                  {cases.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FIR ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Filed</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incident Date</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {cases.map((fir) => (
                            <tr key={fir.firId} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm font-medium">{fir.firId}</td>
                              <td className="py-3 px-4 text-sm text-gray-500">{new Date(fir.complainDate).toLocaleDateString()}</td>
                              <td className="py-3 px-4 text-sm text-gray-500">{new Date(fir.incidentDate).toLocaleDateString()}</td>
                              <td className="py-3 px-4 text-sm">{fir.incidentLocation}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${fir.close ? 'bg-green-100 text-green-800' :
                                  fir.officerId ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                  {fir.close ? 'Resolved' :
                                    fir.officerId ? fir.status || 'In Progress' :
                                      'Pending'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {fir.officerId ? (
                                  (() => {
                                    const assignedOfficer = officers.find(o => o.hrms === fir.officerId);
                                    return assignedOfficer ? assignedOfficer.name : `Officer ID: ${fir.officerId}`;
                                  })()
                                ) : (
                                  <button
                                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                                    onClick={() => openModal('assignOfficer', fir)}
                                  >
                                    Assign
                                  </button>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    onClick={() => handleViewFIR(fir)}
                                  >
                                    View
                                  </button>
                                  {fir.officerId && (
                                    <button
                                      className="text-orange-600 hover:text-orange-800 text-sm"
                                      onClick={() => handleReassignFIR(fir)}
                                    >
                                      Reassign
                                    </button>
                                  )}
                                  {fir.close && (
                                    <button
                                      className="text-green-600 hover:text-green-800 text-sm"
                                      onClick={() => handleReopenFIR(fir.firId)}
                                    >
                                      Reopen
                                    </button>
                                  )}
                                  {!fir.close && (
                                    <button
                                      className="text-purple-600 hover:text-purple-800 text-sm"
                                      onClick={() => handleChangeStatus(fir)}
                                    >
                                      Change Status
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No cases found for this station.
                    </div>
                  )}
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6">
                  <h3 className="text-xl font-semibold mb-4">Generate Reports</h3>
                  <p className="text-gray-600 mb-6">Select report type and date range to generate station performance reports.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="reportType" className="block text-gray-700 text-sm font-medium mb-2">Report Type</label>
                      <select
                        id="reportType"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="caseStatus">Case Status Summary</option>
                        <option value="officerPerformance">Officer Performance</option>
                        <option value="responseTime">Response Time Analysis</option>
                        <option value="caseType">Case Type Distribution</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="dateRange" className="block text-gray-700 text-sm font-medium mb-2">Date Range</label>
                      <select
                        id="dateRange"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="weekly">Last 7 Days</option>
                        <option value="monthly">Last 30 Days</option>
                        <option value="quarterly">Last 90 Days</option>
                        <option value="yearly">Last 12 Months</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>
                  </div>

                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                    onClick={() => alert("This feature will be available soon!")}
                  >
                    Generate Report
                  </button>

                  <div className="mt-8 border-t pt-6">
                    <h4 className="font-medium mb-4">Case Summary</h4>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded shadow">
                          <p className="text-sm text-gray-500">Total Cases</p>
                          <p className="text-2xl font-bold">{cases.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded shadow">
                          <p className="text-sm text-gray-500">Pending</p>
                          <p className="text-2xl font-bold">{pendingCases}</p>
                        </div>
                        <div className="bg-white p-4 rounded shadow">
                          <p className="text-sm text-gray-500">In Progress</p>
                          <p className="text-2xl font-bold">{inProgressCases}</p>
                        </div>
                        <div className="bg-white p-4 rounded shadow">
                          <p className="text-sm text-gray-500">Resolved</p>
                          <p className="text-2xl font-bold">{resolvedCases}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-center mb-6">Station Admin Login Required</h2>
                <p className="text-gray-600 mb-6 text-center">
                  Please login to access the station administration portal.
                </p>
                <div className="flex flex-col gap-4">
                  <Link to="/station/login" className="bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded transition duration-300">
                    Login
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for FIR Details, Officer Assignment, etc. */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-xl font-semibold">
                  {modalType === 'viewFIR' && 'FIR Details'}
                  {modalType === 'assignOfficer' && 'Assign Officer'}
                  {modalType === 'viewOfficer' && 'Officer Details'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* View FIR Details */}
              {modalType === 'viewFIR' && selectedItem && (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">FIR ID</p>
                      <p className="font-medium">{selectedItem.firId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs ${selectedItem.close ? 'bg-green-100 text-green-800' :
                          selectedItem.officerId ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                          {selectedItem.close ? 'Resolved' :
                            selectedItem.officerId ? selectedItem.status || 'In Progress' :
                              'Pending'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Complaint Date</p>
                      <p className="font-medium">{new Date(selectedItem.complainDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Incident Date</p>
                      <p className="font-medium">{new Date(selectedItem.incidentDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Incident Location</p>
                      <p className="font-medium">{selectedItem.incidentLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Assigned Officer</p>
                      <p className="font-medium">
                        {selectedItem.officerId ? (
                          (() => {
                            const assignedOfficer = officers.find(o => o.hrms === selectedItem.officerId);
                            return assignedOfficer ? assignedOfficer.name : `Officer ID: ${selectedItem.officerId}`;
                          })()
                        ) : 'Not Assigned'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="mt-1 p-3 bg-gray-50 rounded">{selectedItem.description}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end space-x-3 mt-6 pt-3 border-t">
                    {!selectedItem.officerId && (
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => {
                          setModalType('assignOfficer');
                          setFormData({ officerId: '' });
                        }}
                      >
                        Assign Officer
                      </button>
                    )}
                   
                  </div>
                  {/* Action buttons */}
<div className="flex justify-end space-x-3 mt-6 pt-3 border-t">
  {!selectedItem.officerId && (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      onClick={() => {
        setModalType('assignOfficer');
        setFormData({ officerId: '' });
      }}
    >
      Assign Officer
    </button>
  )}
  {selectedItem.officerId && (
    <button
      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
      onClick={() => {
        setModalType('reassignOfficer');
        setFormData({ officerId: selectedItem.officerId || '' });
      }}
    >
      Reassign
    </button>
  )}
  {selectedItem.close ? (
    <button
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      onClick={() => handleReopenFIR(selectedItem.firId)}
      disabled={isProcessing}
    >
      {isProcessing ? 'Processing...' : 'Reopen Case'}
    </button>
  ) : (
    <button
      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      onClick={() => {
        setModalType('changeStatus');
        setFormData({ status: selectedItem.status || 'submitted' });
      }}
    >
      Change Status
    </button>
  )}
  <button
    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
    onClick={() => setIsModalOpen(false)}
  >
    Close
  </button>
</div>
                </div>
              )}
              {/* Reassign Officer to FIR */}
              {modalType === 'reassignOfficer' && selectedItem && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAssignOfficer(selectedItem.firId, parseInt(formData.officerId));
                }}>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">FIR ID</p>
                    <p className="font-medium">{selectedItem.firId}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Current Officer</p>
                    <p className="font-medium">
                      {(() => {
                        const assignedOfficer = officers.find(o => o.hrms === selectedItem.officerId);
                        return assignedOfficer ? assignedOfficer.name : `Officer ID: ${selectedItem.officerId}`;
                      })() || 'Not Assigned'}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="officerId" className="block text-gray-700 text-sm font-medium mb-2">Select New Officer</label>
                    <select
                      id="officerId"
                      name="officerId"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.officerId || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Choose an officer</option>
                      {officers.map(officer => (
                        <option key={officer.hrms} value={officer.hrms}>
                          {officer.name} ({officer.position})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6 pt-3 border-t">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Reassign Officer'}
                    </button>
                  </div>
                </form>
              )}

              {/* Change FIR Status */}
              {modalType === 'changeStatus' && selectedItem && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateStatus(selectedItem.firId, formData.status);
                }}>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">FIR ID</p>
                    <p className="font-medium">{selectedItem.firId}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Current Status</p>
                    <p className="font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs ${selectedItem.close ? 'bg-green-100 text-green-800' :
                          selectedItem.officerId ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        {selectedItem.close ? 'Resolved' :
                          selectedItem.status || (selectedItem.officerId ? 'In Progress' : 'Pending')}
                      </span>
                    </p>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="status" className="block text-gray-700 text-sm font-medium mb-2">Select New Status</label>
                    <select
                      id="status"
                      name="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.status || ''}
                      onChange={handleInputChange}
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

                  <div className="flex justify-end space-x-3 mt-6 pt-3 border-t">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Update Status'}
                    </button>
                  </div>
                </form>
              )}

              {/* Assign Officer to FIR */}
              {modalType === 'assignOfficer' && selectedItem && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAssignOfficer(selectedItem.firId, parseInt(formData.officerId));
                }}>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">FIR ID</p>
                    <p className="font-medium">{selectedItem.firId}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Incident</p>
                    <p className="font-medium">{selectedItem.incidentLocation} on {new Date(selectedItem.incidentDate).toLocaleDateString()}</p>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="officerId" className="block text-gray-700 text-sm font-medium mb-2">Select Officer</label>
                    <select
                      id="officerId"
                      name="officerId"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.officerId || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Choose an officer</option>
                      {officers.map(officer => (
                        <option key={officer.hrms} value={officer.hrms}>
                          {officer.name} ({officer.position})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end space-x-3 mt-6 pt-3 border-t">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Assign Officer'}
                    </button>
                  </div>
                </form>
              )}

              {/* View Officer Details */}
              {modalType === 'viewOfficer' && selectedItem && (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">HRMS ID</p>
                      <p className="font-medium">{selectedItem.hrms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedItem.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Position</p>
                      <p className="font-medium">{selectedItem.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium">{selectedItem.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedItem.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedItem.phone_no?.toString()}</p>
                    </div>
                  </div>

                  {/* Officer's assigned cases */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Assigned Cases</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {cases.filter(fir => fir.officerId === selectedItem.hrms).length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                          {cases.filter(fir => fir.officerId === selectedItem.hrms).map(fir => (
                            <li key={fir.firId} className="py-2">
                              <div className="flex justify-between">
                                <span className="font-medium">FIR #{fir.firId}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${fir.close ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {fir.close ? 'Resolved' : fir.status || 'In Progress'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{fir.incidentLocation} - {new Date(fir.complainDate).toLocaleDateString()}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-center py-2">No cases currently assigned</p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end space-x-3 mt-6 pt-3 border-t">
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default StationPortal;