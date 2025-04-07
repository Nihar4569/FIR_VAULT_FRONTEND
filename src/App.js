import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import './App.css';
import Home from './Pages/Home';

// Import portal components
import { AdminLogin, AdminPortal, AdminRegister } from './Portals/Admin';
import { PoliceLogin, PolicePortal } from './Portals/Police';
import { StationLogin, StationPortal } from './Portals/Station';
import { TrackingPortal } from './Portals/Tracking';
import { FileFIR, UserLogin, UserPortal, UserRegister } from './Portals/User';

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
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* User Portal Routes */}
          <Route path="/user" element={<UserPortal />} />
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/register" element={<UserRegister />} />
          <Route path="/user/file-fir" element={<FileFIR />} />

          {/* Police Portal Routes */}
          <Route path="/police" element={<PolicePortal />} />
          <Route path="/police/login" element={<PoliceLogin />} />

          {/* Station Portal Routes */}
          <Route path="/station" element={<StationPortal />} />
          <Route path="/station/login" element={<StationLogin />} />

          {/* Tracking Portal Routes */}
          <Route path="/tracking" element={<TrackingPortal />} />
          <Route path="/tracking/:id" element={<TrackingPortal />} />

          {/* Admin Portal Routes */}
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;