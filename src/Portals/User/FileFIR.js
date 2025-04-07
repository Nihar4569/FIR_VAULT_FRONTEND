import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../Components/Footer';
import Navbar from '../../Components/Navbar';
import { firAPI, stationAPI } from '../../Services/api';

const FileFIR = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firId: Math.floor(1000 + Math.random() * 9000),
    complainDate: new Date().toISOString().split('T')[0],
    incidentDate: new Date().toISOString().split('T')[0],
    incidentLocation: '',
    description: '',
    status: 'submitted',
    victimId: '',
    officerId: 0,
    close: false,
    stationId: '' // Will be filled based on selection
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    const userDataStr = localStorage.getItem('userData');

    if (!token || !userDataStr) {
      navigate('/user/login');
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      setIsAuthenticated(true);
      setUser(userData);

      // Set user ID in form data - ensure it's a string
      setFormData(prev => ({
        ...prev,
        victimId: userData.aid.toString() // Convert to string to ensure proper BigInteger handling
      }));

      // Fetch police stations
      fetchStations();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/user/login');
    }
  }, [navigate]);

  const fetchStations = async () => {
    try {
      const response = await stationAPI.getAllStations();
      if (response.data) {
        // Only show approved stations
        const approvedStations = response.data.filter(station => station.approval === true);
        setStations(approvedStations);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      setError('Failed to load police stations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'stationId') {
      // For stationId, ensure we're saving the actual ID value
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Find the selected station to display its details
      const selectedStn = stations.find(station => 
        station && station.stationSid != null && station.stationSid.toString() === value
      );
      setSelectedStation(selectedStn);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Format data for the backend
      const submissionData = {
        ...formData,
        victimId: formData.victimId.toString(), // Ensure victimId is a string
        stationId: formData.stationId.toString() // Ensure stationId is a string
      };

      // Submit the FIR to the backend
      const response = await firAPI.addFIR(submissionData);
      
      if (response.data) {
        // Navigate to user dashboard on success
        navigate('/user');
      }
    } catch (err) {
      console.error('FIR submission error:', err);
      setError('Failed to submit FIR. Please try again.');

      // Show more detailed error if available
      if (err.response && err.response.data) {
        console.error('Error details:', err.response.data);
        setError(`Failed to submit FIR: ${err.response.data.message || 'Server error'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-20 py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-6">File a New FIR</h2>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Police Station Selection */}
                <div className="mb-4">
                  <label htmlFor="stationId" className="block text-gray-700 text-sm font-medium mb-2">Police Station</label>
                  <select
                    id="stationId"
                    name="stationId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.stationId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a Police Station</option>
                    {stations.map(station => (
                      <option key={station.stationSid} value={station.stationSid}>
                        {station.stationName}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStation && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Station Address:</span> {selectedStation.address}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Incharge:</span> {selectedStation.StationIncharge}
                    </p>
                  </div>
                )}

                {/* Incident Location */}
                <div className="mb-4">
                  <label htmlFor="incidentLocation" className="block text-gray-700 text-sm font-medium mb-2">Incident Location</label>
                  <input
                    type="text"
                    id="incidentLocation"
                    name="incidentLocation"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Where did the incident occur"
                    value={formData.incidentLocation}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="complainDate" className="block text-gray-700 text-sm font-medium mb-2">Complaint Date</label>
                    <input
                      type="date"
                      id="complainDate"
                      name="complainDate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.complainDate}
                      onChange={handleChange}
                      required
                      readOnly
                    />
                  </div>
                  <div>
                    <label htmlFor="incidentDate" className="block text-gray-700 text-sm font-medium mb-2">Incident Date</label>
                    <input
                      type="date"
                      id="incidentDate"
                      name="incidentDate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.incidentDate}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Description Field */}
                <div className="mb-6">
                  <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">Incident Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide detailed information about the incident"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Declaration Checkbox */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600"
                      required
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I hereby declare that the information provided above is true to the best of my knowledge
                    </span>
                  </label>
                </div>

                {/* Submit/Cancel Buttons */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-300"
                    onClick={() => navigate('/user')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : 'Submit FIR'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FileFIR;