import React, { useState } from 'react';
import { criminalAPI } from '../../Services/api';

const GeoSearch = () => {
  const [location, setLocation] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = async () => {
    if (!location.trim()) return;
    
    setIsSearching(true);
    try {
      // Search criminals by location
      const response = await criminalAPI.searchCriminals({ location });
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching by location:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="mb-6">
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Search by location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !location.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {searchResults.length > 0 && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Search Results ({searchResults.length})</h4>
          <div className="max-h-64 overflow-y-auto">
            {searchResults.map(criminal => (
              <div key={criminal.criminalId} className="border-b py-2">
                <div className="flex items-center">
                  {criminal.photoUrl && (
                    <img
                      src={criminal.photoUrl}
                      alt={criminal.criminalName}
                      className="h-10 w-10 rounded-full object-cover mr-3"
                    />
                  )}
                  <div>
                    <p className="font-medium">{criminal.criminalName}</p>
                    <p className="text-sm text-gray-500">{criminal.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};