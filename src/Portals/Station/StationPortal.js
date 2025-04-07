import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';

const StationPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [station, setStation] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if station admin is logged in
    const token = localStorage.getItem('stationToken');
    if (token) {
      // For demo purposes, we'll just set authentication to true
      // In production, you would validate the token with your backend
      setIsAuthenticated(true);
      setStation({
        name: 'Central Police Station',
        code: 'CPS-01',
        address: '123 Police Plaza, Central City',
        jurisdiction: 'Central District',
        contact: '555-1234567'
      });
      
      // Mock officers data
      setOfficers([
        { id: 1, name: 'Officer Smith', badgeNumber: 'PO-7823', rank: 'Sub-Inspector', status: 'Active', casesAssigned: 5 },
        { id: 2, name: 'Officer Johnson', badgeNumber: 'PO-8912', rank: 'Constable', status: 'Active', casesAssigned: 3 },
        { id: 3, name: 'Officer Rivera', badgeNumber: 'PO-5432', rank: 'Sub-Inspector', status: 'Active', casesAssigned: 4 },
        { id: 4, name: 'Officer Chen', badgeNumber: 'PO-3478', rank: 'Inspector', status: 'Active', casesAssigned: 2 },
        { id: 5, name: 'Officer Patel', badgeNumber: 'PO-6721', rank: 'Constable', status: 'On Leave', casesAssigned: 0 }
      ]);
      
      // Mock cases data
      setCases([
        { id: 'FIR2554', date: '2025-03-28', complainant: 'John Doe', subject: 'Vehicle Theft', status: 'Pending', assignedTo: null, priority: 'High' },
        { id: 'FIR2553', date: '2025-03-27', complainant: 'Lisa Johnson', subject: 'Property Damage', status: 'In Progress', assignedTo: 'Officer Smith', priority: 'Medium' },
        { id: 'FIR2552', date: '2025-03-26', complainant: 'Mike Stevens', subject: 'Assault Case', status: 'In Progress', assignedTo: 'Officer Rivera', priority: 'High' },
        { id: 'FIR2550', date: '2025-03-25', complainant: 'Sarah Williams', subject: 'Burglary', status: 'Resolved', assignedTo: 'Officer Johnson', priority: 'Medium' },
        { id: 'FIR2548', date: '2025-03-24', complainant: 'Robert Clark', subject: 'Missing Person', status: 'Resolved', assignedTo: 'Officer Chen', priority: 'High' }
      ]);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('stationToken');
    setIsAuthenticated(false);
    setStation(null);
    navigate('/station/login');
  };

  // Stats calculations
  const pendingCases = cases.filter(c => c.status === 'Pending').length;
  const inProgressCases = cases.filter(c => c.status === 'In Progress').length;
  const resolvedCases = cases.filter(c => c.status === 'Resolved').length;
  const activeOfficers = officers.filter(o => o.status === 'Active').length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center" >Police Station Portal</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : isAuthenticated ? (
            <div >
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
                      <h2 className="text-2xl font-semibold">{station.name}</h2>
                      <p className="text-blue-200">Station Code: {station.code} | {station.jurisdiction}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/station/settings" className="bg-blue-600 hover:bg-blue-800 px-4 py-2 rounded text-center">
                      Settings
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
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {cases.slice(0, 5).map((fir) => (
                            <tr key={fir.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm font-medium">{fir.id}</td>
                              <td className="py-3 px-4 text-sm text-gray-500">{fir.date}</td>
                              <td className="py-3 px-4 text-sm">{fir.subject}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  fir.status === 'Pending' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : fir.status === 'In Progress' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-green-100 text-green-800'
                                }`}>
                                  {fir.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {fir.assignedTo || 'Not Assigned'}
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
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                      Add Officer
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge Number</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cases Assigned</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {officers.map((officer) => (
                          <tr key={officer.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-medium">{officer.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{officer.badgeNumber}</td>
                            <td className="py-3 px-4 text-sm">{officer.rank}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                officer.status === 'Active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {officer.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-center">{officer.casesAssigned}</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-800 text-sm">
                                  View
                                </button>
                                <button className="text-blue-600 hover:text-blue-800 text-sm">
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                        <option value="pending">Pending</option>
                        <option value="inProgress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FIR ID</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complainant</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {cases.map((fir) => (
                          <tr key={fir.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-medium">{fir.id}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{fir.date}</td>
                            <td className="py-3 px-4 text-sm">{fir.complainant}</td>
                            <td className="py-3 px-4 text-sm">{fir.subject}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                fir.status === 'Pending' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : fir.status === 'In Progress' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-green-100 text-green-800'
                              }`}>
                                {fir.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {fir.assignedTo || (
                                <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                  Assign
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-800 text-sm">
                                  View
                                </button>
                                <button className="text-blue-600 hover:text-blue-800 text-sm">
                                  Update
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                  
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
                    Generate Report
                  </button>
                  
                  <div className="mt-8 border-t pt-6">
                    <h4 className="font-medium mb-4">Recent Reports</h4>
                    <div className="space-y-4">
                      <div className="p-4 border rounded flex items-center justify-between">
                        <div>
                          <p className="font-medium">Case Status Summary</p>
                          <p className="text-sm text-gray-500">Generated on April 1, 2025</p>
                        </div>
                        <div>
                          <button className="text-blue-600 hover:text-blue-800 mr-4">View</button>
                          <button className="text-blue-600 hover:text-blue-800">Download</button>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded flex items-center justify-between">
                        <div>
                          <p className="font-medium">Officer Performance Report</p>
                          <p className="text-sm text-gray-500">Generated on March 15, 2025</p>
                        </div>
                        <div>
                          <button className="text-blue-600 hover:text-blue-800 mr-4">View</button>
                          <button className="text-blue-600 hover:text-blue-800">Download</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden" >
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
      <Footer />
    </div>
  );
};

export default StationPortal;