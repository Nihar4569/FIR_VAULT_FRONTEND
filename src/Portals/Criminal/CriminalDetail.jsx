// src/Components/Criminal/CriminalDetail.jsx - Fixed version
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { criminalAPI, firAPI } from '../../Services/api';
import { formatPhoneNumber, getStatusDisplayClass, formatDate } from '../../utils/dataUtils';

export const CriminalDetail = () => {
  const { id } = useParams();
  const [criminal, setCriminal] = useState(null);
  const [linkedFirs, setLinkedFirs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCriminalDetails();
  }, [id]);

  const fetchCriminalDetails = async () => {
    setIsLoading(true);
    try {
      const response = await criminalAPI.getCriminalById(id);
      // Fix: Access response.data instead of just response
      if (response && response.data) {
        setCriminal(response.data);
        
        // If the criminal has crimes with FIR IDs, fetch those FIRs
        if (response.data.crimes && response.data.crimes.length > 0) {
          const firIds = response.data.crimes
            .filter(crime => crime.firId)
            .map(crime => crime.firId);
          
          if (firIds.length > 0) {
            fetchLinkedFirs(firIds);
          }
        }
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

  const fetchLinkedFirs = async (firIds) => {
    try {
      // Get all FIRs and filter for the ones linked to this criminal
      const allFirsResponse = await firAPI.getAllFIRs();
      // Fix: Access response.data instead of just response
      if (allFirsResponse && allFirsResponse.data) {
        const linked = allFirsResponse.data.filter(fir => firIds.includes(fir.firId));
        setLinkedFirs(linked);
      }
    } catch (error) {
      console.error('Error fetching linked FIRs:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this criminal record? This action cannot be undone.')) {
      try {
        await criminalAPI.deleteCriminal(id);
        navigate('/criminals');
      } catch (error) {
        console.error('Error deleting criminal:', error);
        setError('Failed to delete criminal record. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  if (!criminal) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Criminal record not found</p>
        <Link to="/criminals" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Back to Criminal Records
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h3 className="font-semibold text-lg">Criminal Details</h3>
        <div className="flex space-x-2">
          <Link
            to={`/criminals/edit/${criminal.criminalId}`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
          >
            Delete
          </button>
          <Link
            to="/criminals"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            {criminal.photoUrl ? (
              <img
                src={criminal.photoUrl}
                alt={criminal.criminalName}
                className="w-full rounded-lg shadow-md object-cover"
                style={{ maxHeight: '300px' }}
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}

            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-2">Current Status</h4>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusDisplayClass(criminal.status, 'criminal')}`}>
                {criminal.status}
              </span>
            </div>
          </div>

          <div className="md:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-500 text-sm">Name</label>
                <p className="font-medium text-lg">{criminal.criminalName}</p>
              </div>
              <div>
                <label className="block text-gray-500 text-sm">Age</label>
                <p className="font-medium">{criminal.age} years</p>
              </div>
              <div>
                <label className="block text-gray-500 text-sm">Gender</label>
                <p className="font-medium">{criminal.gender}</p>
              </div>
              <div>
                <label className="block text-gray-500 text-sm">Contact</label>
                <p className="font-medium">{formatPhoneNumber(criminal.phone_no)}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-500 text-sm">Address</label>
                <p className="font-medium">{criminal.address}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-500 text-sm">Identification Marks</label>
                <p className="font-medium">{criminal.identificationMarks || 'None recorded'}</p>
              </div>
            </div>

            <h4 className="font-semibold border-b pb-2 mb-4">Crime Records</h4>
            
            {criminal.crimes && criminal.crimes.length > 0 ? (
              <div className="space-y-4 mb-4">
                {criminal.crimes.map((crime, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <h5 className="font-medium">{crime.crimeType}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        crime.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        crime.status === 'Under Trial' ? 'bg-blue-100 text-blue-800' :
                        crime.status === 'Convicted' ? 'bg-red-100 text-red-800' :
                        crime.status === 'Acquitted' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {crime.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Date:</span> {formatDate(crime.crimeDate)}
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span> {crime.location || 'Not specified'}
                      </div>
                      {crime.firId && (
                        <div>
                          <span className="text-gray-500">FIR:</span> 
                          <Link 
                            to={`/tracking/${crime.firId}`} 
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            #{crime.firId}
                          </Link>
                        </div>
                      )}
                      {crime.status === 'Convicted' && (
                        <>
                          <div>
                            <span className="text-gray-500">Conviction Date:</span> {formatDate(crime.convictionDate)}
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-gray-500">Punishment:</span> {crime.punishment}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-500">Description:</span>
                      <p className="mt-1">{crime.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 border rounded-lg bg-gray-50">
                <p className="text-gray-500">No crime records found for this individual</p>
              </div>
            )}

            {/* Linked FIRs Section */}
            {linkedFirs.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold border-b pb-2 mb-4">Linked FIRs</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FIR ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {linkedFirs.map(fir => (
                        <tr key={fir.firId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{fir.firId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(fir.complainDate)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fir.incidentLocation}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              fir.close ? 'bg-green-100 text-green-800' : 
                              fir.officerId ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {fir.close ? 'Resolved' : fir.officerId ? 'In Progress' : 'Submitted'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/tracking/${fir.firId}`} className="text-blue-600 hover:text-blue-900">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Link
                to={`/criminals/${criminal.criminalId}/add-crime`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Add Crime Record
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}