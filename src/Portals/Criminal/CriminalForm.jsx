// src/Components/Criminal/CriminalForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { criminalAPI, stationAPI, firAPI } from '../../Services/api';

// Add this utility function outside the component
const normalizeEntityData = (data, options = {}) => {
  const { bigIntFields = [], intFields = [] } = options;
  const normalizedData = { ...data };

  bigIntFields.forEach(field => {
    if (normalizedData[field]) {
      // Safely handle BigInt conversion
      try {
        normalizedData[field] = window.BigInt 
          ? window.BigInt(normalizedData[field]) 
          : String(normalizedData[field]);
      } catch (error) {
        // Fallback to string if conversion fails
        normalizedData[field] = String(normalizedData[field]);
      }
    }
  });

  intFields.forEach(field => {
    if (normalizedData[field]) {
      normalizedData[field] = parseInt(normalizedData[field], 10);
    }
  });

  return normalizedData;
};

export const CriminalForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [stations, setStations] = useState([]);
  const [linkedFir, setLinkedFir] = useState(null);

  // Parse URL query parameters to check if a firId was passed
  const queryParams = new URLSearchParams(location.search);
  const firIdFromQuery = queryParams.get('firId');

  const [formData, setFormData] = useState({
    criminalId: Math.floor(10000000 + Math.random() * 90000000), // Random big integer
    criminalName: '',
    phone_no: '',
    email: '',
    gender: 'Male',
    address: '',
    age: '',
    identificationMarks: '',
    status: 'Arrested',
    photoUrl: '',
    stationId: '',
    registeredById: '', // Will be populated from stored user
    crimes: []
  });

  useEffect(() => {
    fetchStations();

    // If firIdFromQuery exists, fetch that FIR's details
    if (firIdFromQuery) {
      fetchFirDetails(firIdFromQuery);
    }

    // If in edit mode, fetch criminal data
    if (isEditMode) {
      fetchCriminalData();
    } else {
      // For new criminal, initialize with logged in user's station (for police/station users)
      const policeData = localStorage.getItem('policeData');
      if (policeData) {
        try {
          const police = JSON.parse(policeData);
          setFormData(prev => ({
            ...prev,
            stationId: police.stationId,
            registeredById: police.hrms
          }));
        } catch (error) {
          console.error('Error parsing police data:', error);
        }
      }
    }
  }, [id, firIdFromQuery]);

  const fetchFirDetails = async (firId) => {
    try {
      if (!firId) return;

      const response = await firAPI.getFIRById(parseInt(firId));
      const firData = response?.data || response;

      if (firData) {
        setLinkedFir(firData);

        // If a station ID exists in the FIR, pre-populate it
        if (firData.stationId) {
          setFormData(prev => ({
            ...prev,
            stationId: firData.stationId.toString()
          }));
        }
      } else {
        console.error('No FIR data found for ID:', firId);
      }
    } catch (error) {
      console.error('Error fetching FIR details:', error);
    }
  };

  const fetchStations = async () => {
    try {
      const response = await stationAPI.getAllStations();
      const stationsData = response?.data || response || [];

      if (Array.isArray(stationsData)) {
        setStations(stationsData.filter(station => station.approval));
      } else {
        console.error('Invalid stations data format:', stationsData);
        setStations([]);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      setStations([]);
    }
  };

  const fetchCriminalData = async () => {
    setIsLoading(true);
    try {
      const response = await criminalAPI.getCriminalById(id);
      if (response) {
        // Handle BigInteger conversion for form display
        setFormData({
          ...response,
          phone_no: response.phone_no ? response.phone_no.toString() : '',
          stationId: response.stationId ? response.stationId.toString() : ''
        });
      } else {
        setError('Criminal record not found');
      }
    } catch (error) {
      console.error('Error fetching criminal data:', error);
      setError('Failed to load criminal data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'age') {
      // Parse age as integer
      setFormData({
        ...formData,
        [name]: parseInt(value) || ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      // Normalize data for submission
      const submissionData = normalizeEntityData(
        formData,
        {
          bigIntFields: ['criminalId', 'phone_no', 'stationId'],
          intFields: ['registeredById', 'age']
        }
      );

      // Submit to backend
      let response;
      if (isEditMode) {
        response = await criminalAPI.updateCriminal(id, submissionData);
      } else {
        response = await criminalAPI.addCriminal(submissionData);
      }

      const resultData = response?.data || response;

      if (resultData) {
        // If this criminal was created from a FIR link, update the FIR with the criminal ID
        if (firIdFromQuery && resultData.criminalId) {
          await firAPI.updateFIR(firIdFromQuery, {
            criminalId: resultData.criminalId
          });

          // Add a crime record for this criminal linked to the FIR
          if (linkedFir) {
            await criminalAPI.addCrimeToCriminal(resultData.criminalId, {
              crimeType: 'FIR Related',
              description: `Linked from FIR #${firIdFromQuery}: ${linkedFir.description?.substring(0, 100) || 'No description'}...`,
              crimeDate: linkedFir.incidentDate || new Date().toISOString().split('T')[0],
              location: linkedFir.incidentLocation || '',
              firId: parseInt(firIdFromQuery) || 0,
              status: 'Pending'
            });
          }
        }

        navigate(isEditMode ? `/criminals/${id}` : '/criminals');
      } else {
        setError('Failed to save criminal record. Server returned an invalid response.');
      }
    } catch (err) {
      console.error('Error saving criminal data:', err);
      setError(err.response?.data?.message || 'Failed to save criminal record. Please check the form and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading && !formData.criminalName) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="font-semibold text-lg">
          {isEditMode ? 'Edit Criminal Record' : 'Add New Criminal Record'}
        </h3>
        {firIdFromQuery && (
          <p className="text-sm text-blue-600">
            This record will be linked to FIR #{firIdFromQuery}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          {error}
        </div>
      )}

      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="criminalName" className="block text-gray-700 text-sm font-medium mb-2">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="criminalName"
                name="criminalName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.criminalName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-gray-700 text-sm font-medium mb-2">Age <span className="text-red-500">*</span></label>
              <input
                type="number"
                id="age"
                name="age"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.age}
                onChange={handleChange}
                required
                min="1"
                max="120"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-gray-700 text-sm font-medium mb-2">Gender <span className="text-red-500">*</span></label>
              <select
                id="gender"
                name="gender"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="phone_no" className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
              <input
                type="text"
                id="phone_no"
                name="phone_no"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phone_no}
                onChange={handleChange}
                pattern="[0-9]+"
                title="Phone number must contain only digits"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email (Optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-gray-700 text-sm font-medium mb-2">Status <span className="text-red-500">*</span></label>
              <select
                id="status"
                name="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Arrested">Arrested</option>
                <option value="Wanted">Wanted</option>
                <option value="Released">Released</option>
                <option value="In Trial">In Trial</option>
                <option value="Convicted">Convicted</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-gray-700 text-sm font-medium mb-2">Address <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="address"
                name="address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="identificationMarks" className="block text-gray-700 text-sm font-medium mb-2">Identification Marks (Optional)</label>
              <textarea
                id="identificationMarks"
                name="identificationMarks"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.identificationMarks}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="photoUrl" className="block text-gray-700 text-sm font-medium mb-2">Photo URL (Optional)</label>
              <input
                type="url"
                id="photoUrl"
                name="photoUrl"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.photoUrl}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div>
              <label htmlFor="stationId" className="block text-gray-700 text-sm font-medium mb-2">Registered at Station <span className="text-red-500">*</span></label>
              <select
                id="stationId"
                name="stationId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.stationId}
                onChange={handleChange}
                required
              >
                <option value="">Select a station</option>
                {stations.map(station => (
                  <option key={station.stationSid} value={station.stationSid}>
                    {station.stationName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {linkedFir && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Linked FIR Details</h4>
              <p className="text-sm text-gray-700">
                <span className="font-medium">FIR ID:</span> {linkedFir.firId}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Incident Date:</span> {new Date(linkedFir.incidentDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Incident Location:</span> {linkedFir.incidentLocation}
              </p>
              {linkedFir.description && (
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-medium">Description:</span><br/>
                  {linkedFir.description.substring(0, 200)}{linkedFir.description.length > 200 ? '...' : ''}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-300"
              onClick={() => navigate('/criminals')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                isEditMode ? 'Update Criminal Record' : 'Add Criminal Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriminalForm;