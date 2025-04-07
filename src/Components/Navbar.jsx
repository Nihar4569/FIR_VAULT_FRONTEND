import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const location = useLocation();

  // Check authentication status
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    const policeToken = localStorage.getItem('policeToken');
    const stationToken = localStorage.getItem('stationToken');
    
    if (userToken) {
      setIsLoggedIn(true);
      setUserType('user');
    } else if (policeToken) {
      setIsLoggedIn(true);
      setUserType('police');
    } else if (stationToken) {
      setIsLoggedIn(true);
      setUserType('station');
    } else {
      setIsLoggedIn(false);
      setUserType(null);
    }
  }, [location]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('policeToken');
    localStorage.removeItem('policeData');
    localStorage.removeItem('stationToken');
    localStorage.removeItem('stationData');
    setIsLoggedIn(false);
    setUserType(null);
    window.location.href = '/';
  };

  // Determine if current page is not home
  const isNotHomePage = location.pathname !== '/';
  // Force nav background on non-home pages
  const forceBackground = isNotHomePage || scrolled;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${forceBackground ? 'bg-white shadow-md text-gray-800' : 'bg-transparent text-white'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${forceBackground ? 'text-blue-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            <span className={`font-bold text-xl ${forceBackground ? 'text-blue-600' : 'text-white'}`}>FIR Vault</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className={`font-medium hover:text-blue-400 transition ${forceBackground ? 'text-gray-700 hover:text-blue-600' : 'text-white'}`}>Home</Link>
            <Link to="/user" className={`font-medium hover:text-blue-400 transition ${forceBackground ? 'text-gray-700 hover:text-blue-600' : 'text-white'}`}>User Portal</Link>
            <Link to="/police" className={`font-medium hover:text-blue-400 transition ${forceBackground ? 'text-gray-700 hover:text-blue-600' : 'text-white'}`}>Police Portal</Link>
            <Link to="/station" className={`font-medium hover:text-blue-400 transition ${forceBackground ? 'text-gray-700 hover:text-blue-600' : 'text-white'}`}>Station Portal</Link>
            <Link to="/tracking" className={`font-medium hover:text-blue-400 transition ${forceBackground ? 'text-gray-700 hover:text-blue-600' : 'text-white'}`}>Track FIR</Link>
            <Link to="/admin" className={`font-medium hover:text-blue-400 transition ${forceBackground ? 'text-gray-700 hover:text-blue-600' : 'text-white'}`}>Admin Portal</Link>
          </div>

          {/* Login/Register/Logout Buttons for Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className={`px-4 py-2 rounded transition bg-red-500 text-white hover:bg-red-600`}
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/user/login" className={`px-4 py-2 rounded transition ${forceBackground ? 'text-blue-600 hover:text-blue-800' : 'text-white hover:text-blue-200'}`}>
                  Login
                </Link>
                <Link to="/user/register" className={`px-4 py-2 rounded transition ${forceBackground ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-blue-600 hover:bg-blue-50'}`}>
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`focus:outline-none ${forceBackground ? 'text-blue-600' : 'text-white'}`}
            >
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white rounded-lg shadow-lg mt-2 py-2 px-4 absolute right-4 left-4 z-20">
            <Link to="/" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/user" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>User Portal</Link>
            <Link to="/police" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>Police Portal</Link>
            <Link to="/station" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>Station Portal</Link>
            <Link to="/tracking" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>Track FIR</Link>
            <div className="pt-2 mt-2 border-t border-gray-200">
              {isLoggedIn ? (
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full py-2 mt-1 bg-red-500 text-white hover:bg-red-600 text-center rounded"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/user/login" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>Login</Link>
                  <Link to="/user/register" className="block py-2 mt-1 bg-blue-600 text-white hover:bg-blue-700 text-center rounded" onClick={() => setIsOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;