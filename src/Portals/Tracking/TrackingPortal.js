import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../Components/Footer';
import Navbar from '../../Components/Navbar';
import { firAPI, policeAPI } from '../../Services/api';

const TrackingPortal = () => {
  const [searchParams, setSearchParams] = useState({
    firId: '',
    contactNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [firData, setFirData] = useState(null);
  const [officerData, setOfficerData] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSearchError('');
    setFirData(null);
    setOfficerData(null);
  
    try {
      // Validate FIR ID
      if (!searchParams.firId || isNaN(parseInt(searchParams.firId))) {
        setSearchError('Please enter a valid FIR ID.');
        setIsLoading(false);
        return;
      }
  
      // Fetch FIR by ID
      const firId = parseInt(searchParams.firId);
      const firResponse = await firAPI.getFIRById(firId);
      const firResponseData = firResponse?.data || firResponse;
      
      if (firResponseData) {
        setFirData(firResponseData);
        
        // If FIR has an assigned officer, fetch officer details
        if (firResponseData.officerId) {
          try {
            const officerResponse = await policeAPI.getPoliceById(firResponseData.officerId);
            const officerResponseData = officerResponse?.data || officerResponse;
            
            if (officerResponseData) {
              setOfficerData(officerResponseData);
            }
          } catch (officerError) {
            console.error('Error fetching officer details:', officerError);
          }
        }
      } else {
        setSearchError('FIR not found with the given ID.');
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setSearchError('Error tracking FIR: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to determine status for display
  const getDisplayStatus = (fir) => {
    if (fir.close) return 'Resolved';
    if (fir.officerId) return 'In Progress';
    return 'Pending';
  };

  // Generate mock timeline based on FIR status
  const generateTimeline = (fir) => {
    const timeline = [
      {
        date: new Date(fir.complainDate).toLocaleDateString(),
        time: "09:00 AM",
        status: "Submitted",
        remarks: "FIR submitted online"
      }
    ];

    if (fir.officerId) {
      const assignDate = new Date(fir.complainDate);
      assignDate.setDate(assignDate.getDate() + 1);
      
      timeline.push({
        date: assignDate.toLocaleDateString(),
        time: "11:00 AM",
        status: "Assigned",
        remarks: `Case assigned to an officer for investigation`
      });
      
      if (fir.close) {
        const resolveDate = new Date(fir.complainDate);
        resolveDate.setDate(resolveDate.getDate() + 7);
        
        timeline.push({
          date: resolveDate.toLocaleDateString(),
          time: "03:30 PM",
          status: "Resolved",
          remarks: "Investigation completed and case resolved"
        });
      } else {
        const updateDate = new Date(fir.complainDate);
        updateDate.setDate(updateDate.getDate() + 3);
        
        timeline.push({
          date: updateDate.toLocaleDateString(),
          time: "02:15 PM",
          status: "In Progress",
          remarks: "Investigation in progress, gathering evidence and witness statements"
        });
      }
    }

    return timeline;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'Assigned':
        return 'bg-purple-100 text-purple-800';
      case 'In Progress':
        return 'bg-orange-100 text-orange-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center" >FIR Status Tracking</h1>
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden mb-8" >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Track Your FIR Status</h2>
              <p className="text-gray-600 mb-6">
                Enter your FIR ID to check the current status of your complaint.
              </p>
              
              {searchError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {searchError}
                </div>
              )}
              
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firId" className="block text-gray-700 text-sm font-medium mb-2">FIR ID / Tracking Number</label>
                    <input
                      type="text"
                      id="firId"
                      name="firId"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 12345"
                      value={searchParams.firId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contactNumber" className="block text-gray-700 text-sm font-medium mb-2">Contact Number (Optional)</label>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Phone number used during filing"
                      value={searchParams.contactNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded transition duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                      </span>
                    ) : 'Track FIR Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {firData && (
            <div className="max-w-4xl mx-auto" >
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                <div className="bg-blue-700 text-white p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h2 className="text-2xl font-bold">FIR #{firData.firId}</h2>
                      <p className="text-blue-100">Filed on {new Date(firData.complainDate).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-white ${
                        firData.close ? 'text-green-700' : 
                        firData.officerId ? 'text-yellow-700' : 'text-blue-700'
                      }`}>
                        {getDisplayStatus(firData)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">FIR ID</h3>
                      <p className="text-lg">{firData.firId}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                      <p className="text-lg">{getDisplayStatus(firData)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Incident Date</h3>
                      <p className="text-lg">{new Date(firData.incidentDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Incident Location</h3>
                      <p className="text-lg">{firData.incidentLocation}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Assigned Officer</h3>
                      <p className="text-lg">{officerData ? officerData.name : 'Not yet assigned'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Police Station</h3>
                      <p className="text-lg">{officerData ? officerData.stationName : 'Pending Assignment'}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Status Timeline</h3>
                    
                    <div className="relative">
                      {/* Vertical line for timeline */}
                      <div className="absolute left-6 top-5 h-full w-0.5 bg-gray-200"></div>
                      
                      <div className="space-y-6">
                        {generateTimeline(firData).map((item, index) => (
                          <div key={index} className="flex">
                            <div className={`relative flex items-center justify-center w-12 h-12 rounded-full ${getStatusColor(item.status)} z-10 mr-4`}>
                              {index === 0 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              ) : index === generateTimeline(firData).length - 1 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 flex-1">
                              <div className="flex flex-col sm:flex-row justify-between mb-2">
                                <h4 className="font-medium">{item.status}</h4>
                                <span className="text-gray-500 text-sm">{item.date}, {item.time}</span>
                              </div>
                              <p className="text-gray-600">{item.remarks}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 mb-8">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300"
                  onClick={() => {
                    alert('Status inquiry has been sent. An officer will contact you soon.');
                  }}
                >
                  Request Status Update
                </button>
                <button 
                  className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2 rounded transition duration-300"
                  onClick={() => {
                    window.print();
                  }}
                >
                  Print Details
                </button>
              </div>
            </div>
          )}
          
          <div className="max-w-3xl mx-auto mt-12" >
            <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="divide-y">
                <div className="p-6">
                  <h3 className="font-medium text-lg mb-2">How long does it take to process an FIR?</h3>
                  <p className="text-gray-600">
                    The processing time varies depending on the nature and complexity of the case. Generally, initial verification is done within 24-48 hours, and the investigation process follows based on case priority.
                  </p>
                </div>
                <div className="p-6">
                  <h3 className="font-medium text-lg mb-2">What if I forgot my FIR number?</h3>
                  <p className="text-gray-600">
                    If you've forgotten your FIR number, you can contact the police station where you filed the complaint. Alternatively, log in to your user account where all your filed FIRs are listed.
                  </p>
                </div>
                <div className="p-6">
                  <h3 className="font-medium text-lg mb-2">How often is the status updated?</h3>
                  <p className="text-gray-600">
                    The status is updated whenever there is a significant development in your case. For high-priority cases, updates may be more frequent. You can always request a status update if you need more information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TrackingPortal;