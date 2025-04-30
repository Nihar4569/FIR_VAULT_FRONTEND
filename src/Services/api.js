// src/Services/api.js

import axios from "axios";

// Base API URL - from environment variable or fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8090';

// Create a standardized axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for consistent error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// Utility for handling BigInteger fields
const prepareBigIntegerFields = (data, fields) => {
  const prepared = {...data};
  
  fields.forEach(field => {
    if (prepared[field] !== undefined && prepared[field] !== null) {
      prepared[field] = prepared[field].toString();
    }
  });
  
  return prepared;
};

export const userAPI = {
  register: (userData) => {
    const formattedData = prepareBigIntegerFields(userData, ['aid', 'phone_no']);
    return apiClient.post('/user/add', formattedData);
  },
  getAllUsers: () => apiClient.get('/user/alluser'),
  getUserById: (id) => apiClient.get(`/user/user/${id}`),
  deleteUser: (id) => apiClient.delete(`/user/delete/${id}`),
};

export const policeAPI = {
  getAllPolice: () => apiClient.get('/police/allpolice'),
  getPoliceById: (id) => apiClient.get(`/police/police/${id}`),
  addPolice: (policeData) => {
    const formattedData = prepareBigIntegerFields(policeData, ['phone_no', 'stationId']);
    return apiClient.post('/police/add', formattedData);
  },
  updatePolice: (policeData) => {
    const formattedData = prepareBigIntegerFields(policeData, ['phone_no', 'stationId']);
    return apiClient.put(`/police/update/${policeData.hrms}`, formattedData);
  },
  deletePolice: (id) => apiClient.delete(`/police/delete/${id}`),
  login: (credentials) => apiClient.post('/police/login', credentials),
};

export const stationAPI = {
  getAllStations: () => apiClient.get('/station/allstation'),
  getStationById: (id) => apiClient.get(`/station/station/${id}`),
  addStation: (stationData) => {
    const formattedData = prepareBigIntegerFields(stationData, ['stationSid', 'phoneNo']);
    return apiClient.post('/station/add', formattedData);
  },
  updateStation: (stationData) => {
    const formattedData = prepareBigIntegerFields(stationData, ['stationSid', 'phoneNo']);
    return apiClient.put(`/station/update/${stationData.stationSid}`, formattedData);
  },
  deleteStation: (id) => apiClient.delete(`/station/delete/${id}`),
  updateStationIncharge: (stationId, inchargeId) => 
    apiClient.put(`/station/update/stationIncharge/${inchargeId}/${stationId}`),
  login: (credentials) => apiClient.post('/station/login', credentials),
};

export const firAPI = {
  getAllFIRs: () => apiClient.get('/fir/allfir'),
  getFIRById: (id) => apiClient.get(`/fir/findbyid/${id}`),
  addFIR: (firData) => {
    const formattedData = prepareBigIntegerFields(firData, ['victimId', 'stationId']);
    // Convert dates to ISO format
    if (firData.complainDate) {
      formattedData.complainDate = new Date(firData.complainDate).toISOString().split('T')[0];
    }
    if (firData.incidentDate) {
      formattedData.incidentDate = new Date(firData.incidentDate).toISOString().split('T')[0];
    }
    return apiClient.post('/fir/addfir', formattedData);
  },
  assignOfficer: (firId, officerId) => 
    apiClient.post(`/fir/assignofficer/${firId}/${officerId}`),
  closeFIR: (firId) => apiClient.post(`/fir/close/${firId}`),
  updateStatus: (firId, status) => 
    apiClient.post(`/fir/update-status/${firId}/${status}`),
  updateFIR: (firId, updateData) => {
    const formattedData = updateData.criminalId ? 
      prepareBigIntegerFields(updateData, ['criminalId']) : updateData;
    return apiClient.put(`/fir/update/${firId}`, formattedData);
  },
};

export const adminAPI = {
  register: (adminData) => apiClient.post('/admin/register', adminData),
  login: (credentials) => apiClient.post('/admin/login', credentials),
  getPendingPoliceApprovals: () => apiClient.get('/admin/pending-police'),
  approvePolice: (hrms) => apiClient.post(`/admin/approve-police/${hrms}`),
  denyPolice: (hrms) => apiClient.post(`/admin/deny-police/${hrms}`),
  getPendingStationApprovals: () => apiClient.get('/admin/pending-stations'),
  approveStation: (sid) => apiClient.post(`/admin/approve-station/${sid}`),
  denyStation: (sid) => apiClient.post(`/admin/deny-station/${sid}`),
  suspendPolice: (hrms) => apiClient.post(`/admin/suspend-police/${hrms}`),
  suspendStation: (sid) => apiClient.post(`/admin/suspend-station/${sid}`),
};

export const criminalAPI = {
  getAllCriminals: () => apiClient.get('/criminal/all'),
  getCriminalById: (id) => apiClient.get(`/criminal/${id}`),
  addCriminal: (criminalData) => {
    const formattedData = prepareBigIntegerFields(
      criminalData, 
      ['criminalId', 'phone_no', 'stationId']
    );
    return apiClient.post('/criminal/add', formattedData);
  },
  updateCriminal: (id, criminalData) => {
    const formattedData = prepareBigIntegerFields(
      criminalData, 
      ['criminalId', 'phone_no', 'stationId']
    );
    return apiClient.put(`/criminal/update/${id}`, formattedData);
  },
  deleteCriminal: (id) => apiClient.delete(`/criminal/delete/${id}`),
  getCriminalsByStation: (stationId) => apiClient.get(`/criminal/station/${stationId}`),
  searchCriminals: (searchParams) => {
    const queryParams = new URLSearchParams();
    if (searchParams.name) queryParams.append('name', searchParams.name);
    if (searchParams.status) queryParams.append('status', searchParams.status);
    
    return apiClient.get(`/criminal/search?${queryParams.toString()}`);
  },
  addCrimeToCriminal: (criminalId, crimeData) => {
    // Format dates correctly
    const formattedCrimeData = {...crimeData};
    
    if (crimeData.crimeDate) {
      formattedCrimeData.crimeDate = new Date(crimeData.crimeDate).toISOString().split('T')[0];
    }
    
    if (crimeData.convictionDate) {
      formattedCrimeData.convictionDate = new Date(crimeData.convictionDate).toISOString().split('T')[0];
    }
    
    return apiClient.post(`/criminal/${criminalId}/addCrime`, formattedCrimeData);
  },
};