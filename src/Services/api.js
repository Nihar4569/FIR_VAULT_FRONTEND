import axios from 'axios';

// Base URL for API calls
const API_BASE_URL = 'http://localhost:8090';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User related API calls
export const userAPI = {
  register: (userData) => {
    const formattedData = {
      ...userData,
      aid: userData.aid
    };
    return apiClient.post('/user/add', formattedData);
  },
  getAllUsers: () => {
    return apiClient.get('/user/alluser');
  },
  getUserById: (id) => {
    return apiClient.get(`/user/user/${id}`);
  },
  login: (credentials) => {
    return apiClient.get(`/user/user/${credentials.aid}`)
      .then(response => {
        if (response.data && response.data.password === credentials.password) {
          return { data: response.data };
        } else {
          throw new Error("Invalid credentials");
        }
      });
  },
  deleteUser: (id) => {
    return apiClient.delete(`/user/delete/${id}`);
  }
};

// FIR related API calls
export const firAPI = {
  addFIR: (firData) => {
    // Format data for the backend
    const formattedData = {
      ...firData,
      // Ensure IDs are strings for BigInteger parsing
      victimId: firData.victimId.toString(),
      stationId: firData.stationId.toString(),
      // Make sure dates are in correct format for LocalDate
      complainDate: firData.complainDate,
      incidentDate: firData.incidentDate
    };
    return apiClient.post('/fir/addfir', formattedData);
  },
  getAllFIRs: () => {
    return apiClient.get('/fir/allfir');
  },
  getFIRById: (id) => {
    return apiClient.get(`/fir/findbyid/${id}`);
  },
  assignOfficer: (firId, officerId) => {
    return apiClient.post(`/fir/assignofficer/${firId}/${officerId}`);
  },
  closeFIR: (firId) => {
    return apiClient.post(`/fir/close/${firId}`);
  },
  updateStatus: (firId, status) => {
    return apiClient.post(`/fir/update-status/${firId}/${status}`);
  },
};

// Police related API calls
export const policeAPI = {
  addPolice: (policeData) => {
    return apiClient.post('/police/add', policeData);
  },
  getAllPolice: () => {
    return apiClient.get('/police/allpolice');
  },
  getPoliceById: (id) => {
    return apiClient.get(`/police/police/${id}`);
  },
  updatePolice: (policeData) => {
    return apiClient.put(`/police/update/${policeData.hrms}`, policeData);
  },
  deletePolice: (id) => {
    return apiClient.delete(`/police/delete/${id}`);
  },
  login: (credentials) => {
    return apiClient.get('/police/allpolice')
      .then(response => {
        const officers = response.data;
        const officer = officers.find(
          o => o.hrms === parseInt(credentials.hrms) && o.password === credentials.password
        );
        if (officer) {
          return { data: officer };
        } else {
          throw new Error("Invalid credentials");
        }
      });
  }
};

// Station related API calls
export const stationAPI = {
  addStation: (stationData) => {
    // Format data for the backend
    const formattedData = {
      ...stationData,
      StationInchargeId: stationData.StationInchargeId ? parseInt(stationData.StationInchargeId) : 0
    };
    return apiClient.post('/station/add', formattedData);
  },
  getAllStations: () => {
    return apiClient.get('/station/allstation')
      .then(response => {
        // Fix potential field name issues
        const fixedData = response.data?.map(station => ({
          ...station,
          StationInchargeId: station.StationInchargeId || station.stationInchargeId
        }));
        return { ...response, data: fixedData };
      });
  },
  getStationById: (id) => {
    return apiClient.get(`/station/station/${id}`);
  },
  updateStation: (stationData) => {
    // Ensure StationInchargeId is properly formatted
    const formattedData = {
      ...stationData,
      StationInchargeId: stationData.StationInchargeId ? parseInt(stationData.StationInchargeId) : 0
    };
    return apiClient.put(`/station/update/${formattedData.stationSid}`, formattedData);
  },
  deleteStation: (id) => {
    return apiClient.delete(`/station/delete/${id}`);
  },
  updateStationIncharge: (stationId, officerId) => {
    return apiClient.put(`/station/update/stationIncharge/${officerId}/${stationId}`);
  }
};

// Admin API calls
export const adminAPI = {
  register: (adminData) => {
    return apiClient.post('/admin/register', adminData);
  },
  login: (credentials) => {
    return apiClient.post('/admin/login', credentials);
  },
  getPendingPoliceApprovals: () => {
    return apiClient.get('/admin/pending-police');
  },
  approvePolice: (hrms) => {
    return apiClient.post(`/admin/approve-police/${hrms}`);
  },
  denyPolice: (hrms) => {
    return apiClient.post(`/admin/deny-police/${hrms}`);
  },
  getPendingStationApprovals: () => {
    return apiClient.get('/admin/pending-stations');
  },
  approveStation: (sid) => {
    return apiClient.post(`/admin/approve-station/${sid}`);
  },
  denyStation: (sid) => {
    return apiClient.post(`/admin/deny-station/${sid}`);
  }
};

// Update the default export
export default {
  user: userAPI,
  fir: firAPI,
  police: policeAPI,
  station: stationAPI,
  admin: adminAPI
};