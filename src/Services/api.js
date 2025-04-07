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
  // Existing methods
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
  // New methods
  deleteUser: (id) => {
    return apiClient.delete(`/user/delete/${id}`);
  }
};

// FIR related API calls
export const firAPI = {
  // Add new FIR
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

  // Get all FIRs
  getAllFIRs: () => {
    return apiClient.get('/fir/allfir');
  },

  // Get FIR by ID
  getFIRById: (id) => {
    return apiClient.get(`/fir/findbyid/${id}`);
  },

  // Assign officer to FIR
  assignOfficer: (firId, officerId) => {
    return apiClient.post(`/fir/assignofficer/${firId}/${officerId}`);
  },

  // Close FIR
  closeFIR: (firId) => {
    return apiClient.post(`/fir/close/${firId}`);
  },

  updateStatus: (firId, status) => {
    return apiClient.post(`/fir/update-status/${firId}/${status}`);
  },
};

// Police related API calls
export const policeAPI = {
  // Existing methods
  addPolice: (policeData) => {
    return apiClient.post('/police/add', policeData);
  },
  getAllPolice: () => {
    return apiClient.get('/police/allpolice');
  },
  getPoliceById: (id) => {
    return apiClient.get(`/police/police/${id}`);
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
  },

  // Login (client-side implementation until backend supports it)
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
  // Existing methods
  addStation: (stationData) => {
    return apiClient.post('/station/add', stationData);
  },
  getAllStations: () => {
    return apiClient.get('/station/allstation');
  },
  getStationById: (id) => {
    return apiClient.get(`/station/station/${id}`);
  },
  // New methods
  updateStation: (stationData) => {
    return apiClient.put(`/station/update/${stationData.stationSid}`, stationData);
  },
  deleteStation: (id) => {
    return apiClient.delete(`/station/delete/${id}`);
  }
};


// Add to src/Services/api.js

export const adminAPI = {
  // Register new admin
  register: (adminData) => {
    return apiClient.post('/admin/register', adminData);
  },

  // Admin login
  login: (credentials) => {
    return apiClient.post('/admin/login', credentials);
  },

  // Get pending police approvals
  getPendingPoliceApprovals: () => {
    return apiClient.get('/admin/pending-police');
  },

  // Approve police
  approvePolice: (hrms) => {
    return apiClient.post(`/admin/approve-police/${hrms}`);
  },

  // Deny police
  denyPolice: (hrms) => {
    return apiClient.post(`/admin/deny-police/${hrms}`);
  },

  // Get pending station approvals
  getPendingStationApprovals: () => {
    return apiClient.get('/admin/pending-stations');
  },

  // Approve station
  approveStation: (sid) => {
    return apiClient.post(`/admin/approve-station/${sid}`);
  },

  // Deny station
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