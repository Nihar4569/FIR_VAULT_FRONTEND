// src/Components/Criminal/CriminalList.jsx - Improved version
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { criminalAPI } from '../../Services/api';
import { getStatusDisplayClass } from '../../utils/dataUtils';

const CriminalList = ({ stationId }) => {
  const [criminals, setCriminals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [filteredCriminals, setFilteredCriminals] = useState([]);

  useEffect(() => {
    fetchCriminals();
  }, [stationId]);

  // Apply filters whenever criminals, searchTerm, or statusFilter changes
  useEffect(() => {
    filterCriminals();
  }, [criminals, searchTerm, statusFilter]);


const fetchCriminals = async () => {
  setIsLoading(true);
  try {
    let response;
    if (stationId) {
      // Ensure stationId is a valid BigInteger (numeric string)
      if (/^\d+$/.test(stationId.toString())) {
        // Valid numeric stationId - can be converted to BigInteger
        response = await criminalAPI.getCriminalsByStation(stationId);
      } else {
        // Invalid format for BigInteger - log warning and fetch all criminals
        console.warn(`Station ID "${stationId}" is not a valid BigInteger. Fetching all criminals instead.`);
        response = await criminalAPI.getAllCriminals();
      }
    } else {
      // No stationId provided - get all criminals
      response = await criminalAPI.getAllCriminals();
    }
    
    const criminalsData = response?.data || response || [];
    setCriminals(Array.isArray(criminalsData) ? criminalsData : []);
  } catch (error) {
    console.error('Error fetching criminals:', error);
    setError('Failed to load criminals. Please try again later.');
    setCriminals([]);
  } finally {
    setIsLoading(false);
  }
};

  const filterCriminals = () => {
    let filtered = [...criminals];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(criminal => 
        criminal.criminalName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(criminal => 
        criminal.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    setFilteredCriminals(filtered);
  };

  const handleSearch = () => {
    // The filtering is already being done by the useEffect,
    // but we keep this method for potential server-side filtering in the future
    filterCriminals();
  };

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  // This function gets crime count, handling the case where crimes might be null
  const getCrimeCount = (criminal) => {
    if (!criminal.crimes) return 0;
    return criminal.crimes.length;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h3 className="font-semibold text-lg">Criminal Records</h3>
        <Link to="/criminals/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
          Add Criminal Record
        </Link>
      </div>

      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-1/4">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Arrested">Arrested</option>
              <option value="Wanted">Wanted</option>
              <option value="Released">Released</option>
              <option value="In Trial">In Trial</option>
              <option value="Convicted">Convicted</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Search
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border-b border-red-200 text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : filteredCriminals.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crimes</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCriminals.map((criminal) => (
                <tr key={criminal.criminalId} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{criminal.criminalId}</td>
                  <td className="py-3 px-4">
                    {criminal.photoUrl ? (
                      <img
                        src={criminal.photoUrl}
                        alt={criminal.criminalName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 text-xs">No Img</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">{criminal.criminalName}</td>
                  <td className="py-3 px-4 text-sm">{criminal.age}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusDisplayClass(criminal.status, 'criminal')}`}>
                      {criminal.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {getCrimeCount(criminal)} crimes
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Link 
                        to={`/criminals/${criminal.criminalId}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Link>
                      <Link
                        to={`/criminals/edit/${criminal.criminalId}`}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No criminal records found</p>
        </div>
      )}
    </div>
  );
};

export default CriminalList;