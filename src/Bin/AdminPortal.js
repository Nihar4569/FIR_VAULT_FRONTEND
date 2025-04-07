import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { adminAPI, policeAPI, stationAPI, firAPI, userAPI } from '../../Services/api';

const AdminPortal = () => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingPolice, setPendingPolice] = useState([]);
  const [pendingStations, setPendingStations] = useState([]);
  const [allPolice, setAllPolice] = useState([]);
  const [allStations, setAllStations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allFIRs, setAllFIRs] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger refreshes

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPolice: 0,
    totalStations: 0,
    totalFIRs: 0,
    pendingApprovals: 0,
    resolvedFIRs: 0,
    pendingFIRs: 0
  });

  const navigate = useNavigate();

  // Fetch all data whenever refreshKey changes
  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');

    if (!token || !adminData) {
      navigate('/admin/login');
      return;
    }

    setAdmin(JSON.parse(adminData));
    setIsAuthenticated(true);

    // Fetch all data
    fetchAllData();
  }, [navigate, refreshKey]);

  const refreshData = () => {
    setRefreshKey(oldKey => oldKey + 1); // Increment refreshKey to trigger a refresh
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [
        policeResponse,
        stationResponse,
        pendingPoliceResponse,
        pendingStationResponse,
        usersResponse,
        firsResponse
      ] = await Promise.all([
        policeAPI.getAllPolice(),
        stationAPI.getAllStations(),
        adminAPI.getPendingPoliceApprovals(),
        adminAPI.getPendingStationApprovals(),
        userAPI.getAllUsers(),
        firAPI.getAllFIRs()
      ]);

      setAllPolice(policeResponse.data || []);
      setAllStations(stationResponse.data || []);
      setPendingPolice(pendingPoliceResponse.data || []);
      setPendingStations(pendingStationResponse.data || []);
      setAllUsers(usersResponse.data || []);
      setAllFIRs(firsResponse.data || []);

      // Calculate stats
      const resolvedFIRs = firsResponse.data ? firsResponse.data.filter(fir => fir.close).length : 0;
      const pendingFIRs = firsResponse.data ? firsResponse.data.filter(fir => !fir.close).length : 0;

      setStats({
        totalUsers: usersResponse.data ? usersResponse.data.length : 0,
        totalPolice: policeResponse.data ? policeResponse.data.length : 0,
        totalStations: stationResponse.data ? stationResponse.data.length : 0,
        totalFIRs: firsResponse.data ? firsResponse.data.length : 0,
        pendingApprovals: (pendingPoliceResponse.data?.length || 0) + (pendingStationResponse.data?.length || 0),
        resolvedFIRs,
        pendingFIRs
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePolice = async (hrms) => {
    setIsProcessing(true);
    try {
      await adminAPI.approvePolice(hrms);
      // Update the pending police list
      setPendingPolice(prevPendingPolice => prevPendingPolice.filter(p => p.hrms !== hrms));
      alert('Police officer approved successfully');
      refreshData(); // Refresh all data
    } catch (error) {
      console.error('Error approving police:', error);
      alert('Failed to approve police officer. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDenyPolice = async (hrms) => {
    setIsProcessing(true);
    try {
      await adminAPI.denyPolice(hrms);
      // Update the pending police list
      setPendingPolice(prevPendingPolice => prevPendingPolice.filter(p => p.hrms !== hrms));
      alert('Police officer rejected successfully');
      refreshData(); // Refresh all data
    } catch (error) {
      console.error('Error denying police:', error);
      alert('Failed to reject police officer. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveStation = async (sid) => {
    setIsProcessing(true);
    try {
      await adminAPI.approveStation(sid);
      // Update the pending stations list
      setPendingStations(prevPendingStations => prevPendingStations.filter(s => s.stationSid.toString() !== sid.toString()));
      alert('Station approved successfully');
      refreshData(); // Refresh all data
    } catch (error) {
      console.error('Error approving station:', error);
      alert('Failed to approve station. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDenyStation = async (sid) => {
    setIsProcessing(true);
    try {
      await adminAPI.denyStation(sid);
      // Update the pending stations list
      setPendingStations(prevPendingStations => prevPendingStations.filter(s => s.stationSid.toString() !== sid.toString()));
      alert('Station rejected successfully');
      refreshData(); // Refresh all data
    } catch (error) {
      console.error('Error denying station:', error);
      alert('Failed to reject station. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle edit station
  const handleEditStation = (station) => {
    openModal('editStation', station);
  };

  // Handle delete station
  const handleDeleteStation = async (stationSid) => {
    if (window.confirm('Are you sure you want to delete this station? This action cannot be undone.')) {
      setIsProcessing(true);
      try {
        await stationAPI.deleteStation(stationSid);
        alert('Station deleted successfully');
        refreshData();
      } catch (error) {
        console.error('Error deleting station:', error);
        alert('Failed to delete station. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Handle edit police
  const handleEditPolice = (police) => {
    openModal('editPolice', police);
  };

  // Handle delete police
  const handleDeletePolice = async (hrms) => {
    if (window.confirm('Are you sure you want to delete this police officer? This action cannot be undone.')) {
      setIsProcessing(true);
      try {
        await policeAPI.deletePolice(hrms);
        alert('Police officer deleted successfully');
        refreshData();
      } catch (error) {
        console.error('Error deleting police officer:', error);
        alert('Failed to delete police officer. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Update station incharge
  const handleUpdateStationIncharge = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
  
    try {
      // Find the selected officer to get their name
      const selectedOfficer = allPolice.find(officer =>
        officer.hrms.toString() === formData.stationInchargeId.toString()
      );
  
      if (!selectedOfficer) {
        throw new Error('Selected officer not found');
      }
  
      const updatedStation = {
        ...selectedItem,
        StationInchargeId: parseInt(formData.stationInchargeId), // Convert to integer
        StationIncharge: selectedOfficer.name // Update incharge name as well
      };
  
      await stationAPI.updateStation(updatedStation);
      alert('Station incharge updated successfully');
      setIsModalOpen(false);
      refreshData();
    } catch (error) {
      console.error('Error updating station incharge:', error);
      setError('Failed to update station incharge. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  

  // Function to handle input change in modal forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Function to open modal for specific operations
  const openModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);

    // Initialize form data based on modal type
    if (type === 'updateStationIncharge') {
      setFormData({
        stationInchargeId: item.StationInchargeId || ''
      });
    } else if (type === 'editStation') {
      setFormData({
        stationName: item.stationName || '',
        address: item.address || '',
        pinCode: item.pinCode || '',
        phoneNo: item.phoneNo || '',
        sEmail: item.sEmail || ''
      });
    } else if (type === 'editPolice') {
      setFormData({
        name: item.name || '',
        email: item.email || '',
        phone_no: item.phone_no || '',
        position: item.position || '',
        stationId: item.stationId || ''
      });
    } else if (type === 'viewPolice' || type === 'viewStation' || type === 'viewFIR' || type === 'viewUser') {
      // For view modals, just use the item as is
    }

    setIsModalOpen(true);
    setError('');
  };

  // View details functions
  const handleViewPoliceDetails = (police) => {
    openModal('viewPolice', police);
  };

  const handleViewStationDetails = (station) => {
    openModal('viewStation', station);
  };

  const handleViewUserDetails = (user) => {
    openModal('viewUser', user);
  };

  const handleViewFIRDetails = (fir) => {
    openModal('viewFIR', fir);
  };

  // Reassign FIR
  const handleReassignFIR = (fir) => {
    openModal('reassignFIR', fir);
  };

  // Add new police
  const handleAddNewPolice = () => {
    openModal('addPolice', null);
  };

  // Add new station
  const handleAddNewStation = () => {
    openModal('addStation', null);
  };

  // Handle delete user
  const handleDeleteUser = async (aid) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setIsProcessing(true);
      try {
        await userAPI.deleteUser(aid);
        alert('User deleted successfully');
        refreshData(); // Refresh the data
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Handle submit for add/edit forms
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      switch (modalType) {
        case 'editStation':
          await stationAPI.updateStation({
            ...selectedItem,
            ...formData
          });
          alert('Station updated successfully');
          break;

        case 'editPolice':
          await policeAPI.updatePolice({
            ...selectedItem,
            ...formData
          });
          alert('Police officer updated successfully');
          break;

        case 'addStation':
          // Set stationSid to pinCode when adding a new station
          const stationData = {
            ...formData,
            stationSid: formData.pinCode, // Set stationSid equal to pinCode
            approval: true // Admin created stations are auto-approved
          };
          await stationAPI.addStation(stationData);
          alert('Station added successfully');
          break;

        case 'addPolice':
          await policeAPI.addPolice({
            ...formData,
            approval: true // Admin created officers are auto-approved
          });
          alert('Police officer added successfully');
          break;

        case 'reassignFIR':
          await firAPI.assignOfficer(selectedItem.firId, formData.officerId);
          alert('FIR reassigned successfully');
          break;

        default:
          throw new Error('Unknown form type');
      }

      setIsModalOpen(false);
      refreshData();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-purple-700 text-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-purple-800 rounded-full p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Admin Portal</h1>
                  <p className="text-purple-200">Welcome, {admin?.fullName || 'Administrator'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="flex flex-wrap border-b">
              <button
                className={`py-4 px-6 text-center font-medium cursor-pointer transition ${activeTab === 'dashboard' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`py-4 px-6 text-center font-medium cursor-pointer transition ${activeTab === 'police' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveTab('police')}
              >
                Police Approvals ({pendingPolice.length})
              </button>
              <button
                className={`py-4 px-6 text-center font-medium cursor-pointer transition ${activeTab === 'stations' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveTab('stations')}
              >
                Station Approvals ({pendingStations.length})
              </button>
              <button
                className={`py-4 px-6 text-center font-medium cursor-pointer transition ${activeTab === 'manageStations' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveTab('manageStations')}
              >
                Manage Stations
              </button>
              <button
                className={`py-4 px-6 text-center font-medium cursor-pointer transition ${activeTab === 'managePolice' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveTab('managePolice')}
              >
                Manage Police
              </button>
              <button
                className={`py-4 px-6 text-center font-medium cursor-pointer transition ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveTab('users')}
              >
                Users
              </button>
              <button
                className={`py-4 px-6 text-center font-medium cursor-pointer transition ${activeTab === 'firs' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveTab('firs')}
              >
                FIRs
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                  <div className="p-4 bg-gray-50 border-b">
                    <h2 className="font-semibold text-lg">System Overview</h2>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-purple-50 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                          <div className="bg-purple-100 p-3 rounded-full mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Total Users</p>
                            <p className="text-2xl font-bold">{stats.totalUsers}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-3 rounded-full mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Police Officers</p>
                            <p className="text-2xl font-bold">{stats.totalPolice}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-3 rounded-full mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Stations</p>
                            <p className="text-2xl font-bold">{stats.totalStations}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                          <div className="bg-yellow-100 p-3 rounded-full mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Total FIRs</p>
                            <p className="text-2xl font-bold">{stats.totalFIRs}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                          <div className="bg-red-100 p-3 rounded-full mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Pending Approvals</p>
                            <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-indigo-50 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-3 rounded-full mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Resolved FIRs</p>
                            <p className="text-2xl font-bold">{stats.resolvedFIRs}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-pink-50 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                          <div className="bg-pink-100 p-3 rounded-full mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Pending FIRs</p>
                            <p className="text-2xl font-bold">{stats.pendingFIRs}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={() => setActiveTab('police')}
                          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          Review Police Approvals
                        </button>
                        <button
                          onClick={() => setActiveTab('stations')}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Review Station Approvals
                        </button>
                        <button
                          onClick={() => setActiveTab('manageStations')}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Manage Stations
                        </button>
                        <button
                          onClick={() => setActiveTab('firs')}
                          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                        >
                          View FIRs
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Police Approvals Tab */}
              {activeTab === 'police' && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b">
                    <h2 className="font-semibold text-lg">Pending Police Approvals</h2>
                  </div>

                  {pendingPolice.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HRMS ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {pendingPolice.map((police) => (
                            <tr key={police.hrms} className="hover:bg-gray-50">
                              <td className="py-3 px-4">{police.hrms}</td>
                              <td className="py-3 px-4">{police.name}</td>
                              <td className="py-3 px-4">{police.email}</td>
                              <td className="py-3 px-4">{police.position}</td>
                              <td className="py-3 px-4">{police.stationId}</td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleApprovePolice(police.hrms)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                                    disabled={isProcessing}
                                  >
                                    {isProcessing ? 'Processing...' : 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => handleDenyPolice(police.hrms)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                    disabled={isProcessing}
                                  >
                                    {isProcessing ? 'Processing...' : 'Deny'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No pending police approvals
                    </div>
                  )}
                </div>
              )}

              {/* Station Approvals Tab */}
              {activeTab === 'stations' && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b">
                    <h2 className="font-semibold text-lg">Pending Station Approvals</h2>
                  </div>

                  {pendingStations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station Name</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incharge</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {pendingStations.map((station) => (
                            <tr key={station.stationSid} className="hover:bg-gray-50">
                              <td className="py-3 px-4">{station.stationSid}</td>
                              <td className="py-3 px-4">{station.stationName}</td>
                              <td className="py-3 px-4">{station.StationInchargeId || 'Not assigned'}</td>
                              <td className="py-3 px-4">{station.address}</td>
                              <td className="py-3 px-4">{station.sEmail}</td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleApproveStation(station.stationSid)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                                    disabled={isProcessing}
                                  >
                                    {isProcessing ? 'Processing...' : 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => handleDenyStation(station.stationSid)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                    disabled={isProcessing}
                                  >
                                    {isProcessing ? 'Processing...' : 'Deny'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No pending station approvals
                    </div>
                  )}
                </div>
              )}

              {/* Manage Stations Tab */}
              {activeTab === 'manageStations' && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h2 className="font-semibold text-lg">Manage Stations</h2>
                    <button
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                      onClick={handleAddNewStation}
                    >
                      Add New Station
                    </button>
                  </div>

                  {allStations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station Name</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incharge</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incharge ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {allStations.map((station) => (
                            <tr key={station.stationSid} className="hover:bg-gray-50">
                              <td className="py-3 px-4">{station.stationSid}</td>
                              <td className="py-3 px-4">{station.stationName}</td>
                              <td className="py-3 px-4">{station.StationIncharge}</td>
                              <td className="py-3 px-4">{station.StationInchargeId || 'Not assigned'}</td>
                              <td className="py-3 px-4">{station.address}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${station.approval ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {station.approval ? 'Approved' : 'Pending'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewStationDetails(station)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => openModal('updateStationIncharge', station)}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
                                  >
                                    Update Incharge
                                  </button>
                                  <button
                                    onClick={() => handleEditStation(station)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStation(station.stationSid)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No stations found
                    </div>
                  )}
                </div>
              )}

              {/* Manage Police Tab */}
              {activeTab === 'managePolice' && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h2 className="font-semibold text-lg">Manage Police Officers</h2>
                    <button
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                      onClick={handleAddNewPolice}
                    >
                      Add New Officer
                    </button>
                  </div>

                  {allPolice.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HRMS ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {allPolice.map((officer) => (
                            <tr key={officer.hrms} className="hover:bg-gray-50">
                              <td className="py-3 px-4">{officer.hrms}</td>
                              <td className="py-3 px-4">{officer.name}</td>
                              <td className="py-3 px-4">{officer.position}</td>
                              <td className="py-3 px-4">{officer.email}</td>
                              <td className="py-3 px-4">{officer.stationId}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${officer.approval ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {officer.approval ? 'Approved' : 'Pending'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewPoliceDetails(officer)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleEditPolice(officer)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeletePolice(officer.hrms)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No police officers found
                    </div>
                  )}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b">
                    <h2 className="font-semibold text-lg">Manage Users</h2>
                  </div>

                  {allUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aadhar ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {allUsers.map((user) => (
                            <tr key={user.aid} className="hover:bg-gray-50">
                              <td className="py-3 px-4">{user.aid}</td>
                              <td className="py-3 px-4">{user.User_name}</td>
                              <td className="py-3 px-4">{user.email}</td>
                              <td className="py-3 px-4">{user.phone_no}</td>
                              <td className="py-3 px-4">{user.gender}</td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewUserDetails(user)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user.aid)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No users found
                    </div>
                  )}
                </div>
              )}

              {/* FIRs Tab */}
              {activeTab === 'firs' && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b">
                    <h2 className="font-semibold text-lg">All FIRs</h2>
                  </div>

                  {allFIRs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FIR ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint Date</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incident Location</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officer ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {allFIRs.map((fir) => (
                            <tr key={fir.firId} className="hover:bg-gray-50">
                              <td className="py-3 px-4">{fir.firId}</td>
                              <td className="py-3 px-4">{new Date(fir.complainDate).toLocaleDateString()}</td>
                              <td className="py-3 px-4">{fir.incidentLocation}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${fir.close ? 'bg-green-100 text-green-800' :
                                    fir.officerId ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                  }`}>
                                  {fir.close ? 'Resolved' : fir.officerId ? 'In Progress' : 'Submitted'}
                                </span>
                              </td>
                              <td className="py-3 px-4">{fir.stationId}</td>
                              <td className="py-3 px-4">{fir.officerId || 'Not Assigned'}</td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewFIRDetails(fir)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => handleReassignFIR(fir)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                                  >
                                    Reassign
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No FIRs found
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals for different operations */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh] w-full max-w-xl">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="text-xl font-semibold">
                  {modalType === 'updateStationIncharge' && 'Update Station Incharge'}
                  {modalType === 'editStation' && 'Edit Station'}
                  {modalType === 'editPolice' && 'Edit Police Officer'}
                  {modalType === 'addStation' && 'Add New Station'}
                  {modalType === 'addPolice' && 'Add New Police Officer'}
                  {modalType === 'viewPolice' && 'Police Officer Details'}
                  {modalType === 'viewStation' && 'Station Details'}
                  {modalType === 'viewFIR' && 'FIR Details'}
                  {modalType === 'viewUser' && 'User Details'}
                  {modalType === 'reassignFIR' && 'Reassign FIR'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {/* Update Station Incharge Form */}
              {modalType === 'updateStationIncharge' && (
                <form onSubmit={handleUpdateStationIncharge}>
                  <div className="mb-4">
                    <label htmlFor="stationName" className="block text-gray-700 text-sm font-medium mb-2">Station Name</label>
                    <input
                      type="text"
                      id="stationName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      value={selectedItem?.stationName || ''}
                      readOnly
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="currentIncharge" className="block text-gray-700 text-sm font-medium mb-2">Current Incharge</label>
                    <input
                      type="text"
                      id="currentIncharge"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      value={selectedItem?.StationIncharge || 'Not assigned'}
                      readOnly
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="stationInchargeId" className="block text-gray-700 text-sm font-medium mb-2">Select New Incharge</label>
                    <select
                      id="stationInchargeId"
                      name="stationInchargeId"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formData.stationInchargeId || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select an Officer</option>
                      {allPolice
                        .filter(officer => officer.approval && officer.stationId?.toString() === selectedItem?.stationSid?.toString())
                        .map(officer => (
                          <option key={officer.hrms} value={officer.hrms}>
                            {officer.name} ({officer.position})
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Updating...' : 'Update Incharge'}
                    </button>
                  </div>
                </form>
              )}

              {/* View Modals */}
              {(modalType === 'viewPolice' || modalType === 'viewStation' || modalType === 'viewFIR' || modalType === 'viewUser') && (
                <div className="space-y-4">
                  {/* Display details based on the type */}
                  {modalType === 'viewPolice' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-500 text-sm">HRMS ID</label>
                          <p className="font-medium">{selectedItem?.hrms}</p>
                        </div>
                        <div>
                          <label className="block text-gray-500 text-sm">Name</label>
                          <p className="font-medium">{selectedItem?.name}</p>
                        </div>
                        <div>
                          <label className="block text-gray-500 text-sm">Email</label>
                          <p className="font-medium">{selectedItem?.email}</p>
                        </div>
                        <div>
                          <label className="block text-gray-500 text-sm">Phone</label>
                          <p className="font-medium">{selectedItem?.phone_no}</p>
                        </div>
                        <div>
                          <label className="block text-gray-500 text-sm">Position</label>
                          <p className="font-medium">{selectedItem?.position}</p>
                        </div>
                        <div>
                          <label className="block text-gray-500 text-sm">Station ID</label>
                          <p className="font-medium">{selectedItem?.stationId}</p>
                        </div>
                        <div>
                          <label className="block text-gray-500 text-sm">Gender</label>
                          <p className="font-medium">{selectedItem?.gender}</p>
                        </div>
                        <div>
                          <label className="block text-gray-500 text-sm">Status</label>
                          <p className="font-medium">
                            <span className={`px-2 py-1 rounded-full text-xs ${selectedItem?.approval ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {selectedItem?.approval ? 'Approved' : 'Pending'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Add buttons at the bottom */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Add and Edit Forms */}
              {(modalType === 'editStation' || modalType === 'addStation' || modalType === 'editPolice' || modalType === 'addPolice' || modalType === 'reassignFIR') && (
                <form onSubmit={handleSubmitForm}>
                  {/* Form fields based on type */}

                  {/* Station Form Fields */}
                  {(modalType === 'editStation' || modalType === 'addStation') && (
                    <>
                      {/* Add station form fields here */}
                      <div className="mb-4">
                        <label htmlFor="stationName" className="block text-gray-700 text-sm font-medium mb-2">Station Name</label>
                        <input
                          type="text"
                          id="stationName"
                          name="stationName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={formData.stationName || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="address" className="block text-gray-700 text-sm font-medium mb-2">Address</label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={formData.address || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="pinCode" className="block text-gray-700 text-sm font-medium mb-2">Pin Code</label>
                          <input
                            type="text"
                            id="pinCode"
                            name="pinCode"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={formData.pinCode || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="phoneNo" className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                          <input
                            type="text"
                            id="phoneNo"
                            name="phoneNo"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={formData.phoneNo || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="sEmail" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          id="sEmail"
                          name="sEmail"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={formData.sEmail || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Police Form Fields */}
                  {(modalType === 'editPolice' || modalType === 'addPolice') && (
                    <>
                      {modalType === 'addPolice' && (
                        <div className="mb-4">
                          <label htmlFor="hrms" className="block text-gray-700 text-sm font-medium mb-2">HRMS ID</label>
                          <input
                            type="text"
                            id="hrms"
                            name="hrms"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={formData.hrms || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      )}

                      <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="phone_no" className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                          <input
                            type="text"
                            id="phone_no"
                            name="phone_no"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={formData.phone_no || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="position" className="block text-gray-700 text-sm font-medium mb-2">Position</label>
                          <select
                            id="position"
                            name="position"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={formData.position || ''}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Position</option>
                            <option value="Constable">Constable</option>
                            <option value="Head Constable">Head Constable</option>
                            <option value="Assistant Sub-Inspector">Assistant Sub-Inspector</option>
                            <option value="Sub-Inspector">Sub-Inspector</option>
                            <option value="Inspector">Inspector</option>
                            <option value="Deputy Superintendent">Deputy Superintendent</option>
                            <option value="Superintendent">Superintendent</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="gender" className="block text-gray-700 text-sm font-medium mb-2">Gender</label>
                          <select
                            id="gender"
                            name="gender"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={formData.gender || ''}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="stationId" className="block text-gray-700 text-sm font-medium mb-2">Station</label>
                        <select
                          id="stationId"
                          name="stationId"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={formData.stationId || ''}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Station</option>
                          {allStations
                            .filter(station => station.approval) // Only show approved stations
                            .map(station => (
                              <option key={station.stationSid} value={station.stationSid}>
                                {station.stationName}
                              </option>
                            ))
                          }
                        </select>
                      </div>

                      {modalType === 'addPolice' && (
                        <div className="mb-4">
                          <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                          <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={formData.password || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Reassign FIR Form - Modified version */}
                  {modalType === 'reassignFIR' && (
                    <>
                      <div className="mb-4">
                        <label htmlFor="firId" className="block text-gray-700 text-sm font-medium mb-2">FIR ID</label>
                        <input
                          type="text"
                          id="firId"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          value={selectedItem?.firId || ''}
                          readOnly
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="currentOfficer" className="block text-gray-700 text-sm font-medium mb-2">Current Officer</label>
                        <input
                          type="text"
                          id="currentOfficer"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          value={selectedItem?.officerId ? `Officer ID: ${selectedItem.officerId}` : 'Not assigned'}
                          readOnly
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">FIR Station ID</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          value={selectedItem?.stationId || 'Not assigned'}
                          readOnly
                        />
                      </div>

                      <div className="mb-6">
                        <label htmlFor="officerId" className="block text-gray-700 text-sm font-medium mb-2">Select New Officer</label>
                        <select
                          id="officerId"
                          name="officerId"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={formData.officerId || ''}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select an Officer</option>
                          {allPolice
                            .filter(officer =>
                              officer.approval
                            )
                            .map(officer => (
                              <option key={officer.hrms} value={officer.hrms}>
                                {officer.name} ({officer.position}) - Station ID: {officer.stationId}
                              </option>
                            ))
                          }
                        </select>
                        {allPolice.filter(officer => officer.approval).length === 0 && (
                          <p className="mt-2 text-sm text-red-600">
                            No approved officers available. Please approve officers first.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' :
                        modalType.startsWith('add') ? 'Add' :
                          modalType.startsWith('edit') ? 'Update' :
                            'Submit'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminPortal;