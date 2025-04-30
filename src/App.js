// src/App.js

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import './App.css';
import Home from './Pages/Home';

// Import portal components
import { AdminLogin, AdminPortal, AdminRegister } from './Portals/Admin';
import { PoliceLogin, PolicePortal } from './Portals/Police';
import { StationLogin, StationPortal } from './Portals/Station';
import { TrackingPortal } from './Portals/Tracking';
import { FileFIR, UserLogin, UserPortal, UserRegister } from './Portals/User';
import { CriminalPortal } from './Portals/Criminal';

// Import context and protected route
import { AuthProvider } from "./Context/AuthContext";
import { ProtectedRoute } from "./Context/ProtectedRoute";

// Import AOS for animations 
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from "react";

function App() {
  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
      mirror: false,
      disable: window.innerWidth < 768,
      offset: 0
    });
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />

            {/* User Portal Routes */}
            <Route element={<ProtectedRoute authType="user" />}>
              <Route path="/user" element={<UserPortal />} />
              <Route path="/user/file-fir" element={<FileFIR />} />
            </Route>
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/register" element={<UserRegister />} />

            {/* Police Portal Routes */}
            <Route element={<ProtectedRoute authType="police" />}>
              <Route path="/police" element={<PolicePortal />} />
            </Route>
            <Route path="/police/login" element={<PoliceLogin />} />

            {/* Station Portal Routes */}
            <Route element={<ProtectedRoute authType="station" />}>
              <Route path="/station" element={<StationPortal />} />
            </Route>
            <Route path="/station/login" element={<StationLogin />} />

            {/* Tracking Portal Routes - No auth required */}
            <Route path="/tracking" element={<TrackingPortal />} />
            <Route path="/tracking/:id" element={<TrackingPortal />} />

            {/* Admin Portal Routes */}
            <Route element={<ProtectedRoute authType="admin" />}>
              <Route path="/admin" element={<AdminPortal />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            
            {/* Criminal Portal Routes - Require admin or police auth */}
            <Route element={<ProtectedRoute authType="admin" />}>
              <Route path="/criminals/*" element={<CriminalPortal />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;