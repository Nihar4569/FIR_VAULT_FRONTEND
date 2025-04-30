import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import CriminalList from './CriminalList';
import AddCrimeForm from './AddCrimeForm';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { CriminalForm } from './CriminalForm';
import { CriminalDetail } from '.';

const CriminalPortal = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4 text-center">Criminal Records Management</h1>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="flex border-b">
              <Link 
                to="/criminals" 
                className={`flex-1 py-4 px-6 text-center font-medium cursor-pointer transition ${location.pathname === '/criminals' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
              >
                All Criminals
              </Link>
              <Link 
                to="/criminals/add" 
                className={`flex-1 py-4 px-6 text-center font-medium cursor-pointer transition ${location.pathname === '/criminals/add' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
              >
                Add New Criminal
              </Link>
              <Link 
                to="/criminals/statistics" 
                className={`flex-1 py-4 px-6 text-center font-medium cursor-pointer transition ${location.pathname === '/criminals/statistics' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
              >
                Statistics
              </Link>
            </div>
          </div>
          
          <Routes>
            <Route path="/" element={<CriminalList />} />
            <Route path="/add" element={<CriminalForm />} />
            <Route path="/edit/:id" element={<CriminalForm />} />
            <Route path="/:id" element={<CriminalDetail />} />
            <Route path="/:id/add-crime" element={<AddCrimeForm />} />
            <Route path="/statistics" element={<CriminalStatistics />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Simple statistics component - you can enhance this with real data and charts
const CriminalStatistics = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="font-semibold text-lg">Criminal Statistics</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <h4 className="font-medium text-lg mb-2">Total Criminals</h4>
            <p className="text-3xl font-bold text-blue-600">152</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <h4 className="font-medium text-lg mb-2">Wanted Criminals</h4>
            <p className="text-3xl font-bold text-yellow-600">24</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <h4 className="font-medium text-lg mb-2">Convicted</h4>
            <p className="text-3xl font-bold text-green-600">87</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium text-lg mb-4">Crime Distribution</h4>
          <p className="text-gray-500 text-center py-8">
            [This section would ideally include charts and more detailed statistics. In a real implementation, you would use a charting library like Chart.js or Recharts to display crime type distribution, conviction rates, etc.]
          </p>
        </div>
      </div>
    </div>
  );
};

export default CriminalPortal;