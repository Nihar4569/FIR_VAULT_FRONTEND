// src/Components/Criminal/LinkCriminalModal.jsx
import React, { useState, useEffect } from 'react';
import { criminalAPI, firAPI } from '../../Services/api';

const LinkCriminalModal = ({ isOpen, onClose, firId, refreshData }) => {
  const [criminals, setCriminals] = useState([]);
  const [selectedCriminal, setSelectedCriminal] = useState('');
  const [isNewCriminal, setIsNewCriminal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  
  useEffect(() => {
    if (isOpen) {
      fetchCriminals();
    }
  }, [isOpen]);
  
  const fetchCriminals = async () => {
    setIsLoading(true);
    try {
      const response = await criminalAPI.getAllCriminals();
      const criminalsData = response?.data || response || [];
      setCriminals(Array.isArray(criminalsData) ? criminalsData : []);
    } catch (error) {
      console.error('Error fetching criminals:', error);
      setError('Failed to load criminal records. Please try again.');
      setCriminals([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLinkCriminal = async () => {
    if (!selectedCriminal) {
      setError('Please select a criminal record');
      return;
    }
    
    setIsProcessing(true);
    try {
      // Add crime record to the selected criminal
      await criminalAPI.addCrimeToCriminal(selectedCriminal, {
        crimeType: 'FIR Related',
        description: `Linked from FIR #${firId}`,
        crimeDate: new Date().toISOString().split('T')[0],
        location: '',
        firId: parseInt(firId) || 0,
        status: 'Pending'
      });
      
      // Update the FIR to reference the criminal
      await firAPI.updateFIR(firId, { 
        criminalId: selectedCriminal 
      });
      
      if (refreshData && typeof refreshData === 'function') {
        refreshData();
      }
      onClose();
    } catch (error) {
      console.error('Error linking criminal to FIR:', error);
      setError('Failed to link criminal to FIR. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCreateNew = () => {
    // Navigate to create new criminal form with FIR ID pre-filled
    window.location.href = `/criminals/add?firId=${firId}`;
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh] w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Link FIR to Criminal Record</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="flex items-center mb-4">
                  <input
                    type="radio"
                    checked={!isNewCriminal}
                    onChange={() => setIsNewCriminal(false)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Link to existing criminal record</span>
                </label>
                
                {!isNewCriminal && (
                  <select
                    value={selectedCriminal}
                    onChange={(e) => setSelectedCriminal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isNewCriminal}
                  >
                    <option value="">Select a criminal record</option>
                    {criminals.length > 0 ? (
                      criminals.map(criminal => (
                        <option key={criminal.criminalId} value={criminal.criminalId}>
                          {criminal.criminalName} (ID: {criminal.criminalId})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No criminal records found</option>
                    )}
                  </select>
                )}
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isNewCriminal}
                    onChange={() => setIsNewCriminal(true)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Create new criminal record</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                {isNewCriminal ? (
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create New
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLinkCriminal}
                    disabled={!selectedCriminal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Link Criminal
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkCriminalModal;