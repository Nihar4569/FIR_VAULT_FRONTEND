import React, { useState, useEffect } from 'react';
import { criminalAPI } from '../../Services/api';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CriminalStatistics = () => {
  const [statistics, setStatistics] = useState({
    total: 0,
    byStatus: [],
    byCrimeType: [],
    byMonthYear: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchStatistics();
  }, []);
  
  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      const response = await criminalAPI.getAllCriminals();
      if (response.data) {
        const criminals = response.data;
        
        // Process data for statistics
        const statusCounts = {};
        const crimeCounts = {};
        const monthYearCounts = {};
        
        criminals.forEach(criminal => {
          // Status counts
          statusCounts[criminal.status] = (statusCounts[criminal.status] || 0) + 1;
          
          // Crime type counts
          if (criminal.crimes && criminal.crimes.length > 0) {
            criminal.crimes.forEach(crime => {
              crimeCounts[crime.crimeType] = (crimeCounts[crime.crimeType] || 0) + 1;
              
              // Month/Year counts
              const date = new Date(crime.crimeDate);
              const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
              monthYearCounts[monthYear] = (monthYearCounts[monthYear] || 0) + 1;
            });
          }
        });
        
        // Format data for charts
        const byStatus = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
        const byCrimeType = Object.entries(crimeCounts).map(([name, value]) => ({ name, value }));
        const byMonthYear = Object.entries(monthYearCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => {
            const [aMonth, aYear] = a.name.split('/');
            const [bMonth, bYear] = b.name.split('/');
            return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
          });
        
        setStatistics({
          total: criminals.length,
          byStatus,
          byCrimeType,
          byMonthYear
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="font-semibold text-lg">Criminal Statistics & Analytics</h3>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <h4 className="font-medium text-lg mb-2">Total Criminals</h4>
              <p className="text-3xl font-bold text-blue-600">{statistics.total}</p>
            </div>
            
            {statistics.byStatus.slice(0, 3).map((status, index) => (
              <div key={status.name} className={`${
                status.name === 'Arrested' ? 'bg-red-50 text-red-600' :
                status.name === 'Wanted' ? 'bg-yellow-50 text-yellow-600' :
                status.name === 'Convicted' ? 'bg-purple-50 text-purple-600' :
                'bg-green-50 text-green-600'
              } rounded-lg p-4 text-center`}>
                <h4 className="font-medium text-lg mb-2">{status.name}</h4>
                <p className="text-3xl font-bold">{status.value}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-lg mb-4 text-center">Criminal Status Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statistics.byStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-lg mb-4 text-center">Crime Type Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.byCrimeType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-lg mb-4 text-center">Crime Trends (Monthly)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.byMonthYear}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriminalStatistics;