import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { criminalAPI, firAPI } from '../../Services/api';

const AddCrimeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [criminal, setCriminal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [firs, setFirs] = useState([]);
  
  const [crimeData, setCrimeData] = useState({
    crimeType: '',
    description: '',
    crimeDate: new Date().toISOString().split('T')[0],
    location: '',
    firId: '',
    status: 'Pending',
    punishment: '',
    convictionDate: ''
  });

  useEffect(() => {
    fetchCriminalDetails();
    fetchFIRs();
  }, [id]);

  const fetchCriminalDetails = async () => {
    setIsLoading(true);
    try {
      const response = await criminalAPI.getCriminalById(id);
      if (response.data) {
        setCriminal(response.data);
      } else {
        setError('Criminal record not found');
      }
    } catch (error) {
      console.error('Error fetching criminal details:', error);
      setError('Failed to load criminal details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFIRs = async () => {
    try {
      const response = await firAPI.getAllFIRs();
      if (response.data) {
        setFirs(response.data);
      }
    } catch (error) {
      console.error('Error fetching FIRs:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCrimeData({
      ...crimeData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await criminalAPI.addCrimeToCriminal(id, crimeData);
      if (response.data) {
        navigate(`/criminals/${id}`);
      }
    } catch (err) {
      console.error('Error adding crime:', err);
      setError('Failed to add crime record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!criminal) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        Criminal record not found. <Link to="/criminals" className="underline">Return to criminal records</Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="font-semibold text-lg">Add Crime Record for {criminal.criminalName}</h3>
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
              <label htmlFor="crimeType" className="block text-gray-700 text-sm font-medium mb-2">Crime Type</label>
              <select
                id="crimeType"
                name="crimeType"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={crimeData.crimeType}
                onChange={handleChange}
                required
              >
                <option value="">Select Crime Type</option>
                <option value="Theft">Theft</option>
                <option value="Robbery">Robbery</option>
                <option value="Assault">Assault</option>
                <option value="Murder">Murder</option>
                <option value="Fraud">Fraud</option>
                <option value="Kidnapping">Kidnapping</option>
                <option value="Drug Offense">Drug Offense</option>
                <option value="Cybercrime">Cybercrime</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="crimeDate" className="block text-gray-700 text-sm font-medium mb-2">Date of Crime</label>
              <input
                type="date"
                id="crimeDate"
                name="crimeDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={crimeData.crimeDate}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-gray-700 text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={crimeData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="firId" className="block text-gray-700 text-sm font-medium mb-2">Related FIR (Optional)</label>
              <select
                id="firId"
                name="firId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={crimeData.firId}
                onChange={handleChange}
              >
                <option value="">Select FIR (if applicable)</option>
                {firs.map(fir => (
                  <option key={fir.firId} value={fir.firId}>
                    FIR #{fir.firId} - {new Date(fir.complainDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-gray-700 text-sm font-medium mb-2">Status</label>
              <select
                id="status"
                name="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={crimeData.status}
                onChange={handleChange}
                required
              >
                <option value="Pending">Pending</option>
                <option value="Under Trial">Under Trial</option>
                <option value="Convicted">Convicted</option>
                <option value="Acquitted">Acquitted</option>
              </select>
            </div>

            {crimeData.status === 'Convicted' && (
              <>
                <div>
                  <label htmlFor="convictionDate" className="block text-gray-700 text-sm font-medium mb-2">Conviction Date</label>
                  <input
                    type="date"
                    id="convictionDate"
                    name="convictionDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={crimeData.convictionDate}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label htmlFor="punishment" className="block text-gray-700 text-sm font-medium mb-2">Punishment</label>
                  <input
                    type="text"
                    id="punishment"
                    name="punishment"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={crimeData.punishment}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 5 years imprisonment"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">Description</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={crimeData.description}
                onChange={handleChange}
                required
                placeholder="Detailed description of the crime..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-300"
              onClick={() => navigate(`/criminals/${id}`)}
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
                  Saving...
                </span>
              ) : 'Add Crime Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCrimeForm;