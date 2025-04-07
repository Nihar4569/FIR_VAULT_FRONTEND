import AOS from 'aos';
import 'aos/dist/aos.css';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Components
import Footer from '../Components/Footer';
import Navbar from '../Components/Navbar';

function Home() {
  // Initialize AOS animation library
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0" data-aos="fade-right">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Online FIR Tracking System</h1>
              <p className="text-xl mb-6">File and track police complaints easily from anywhere, anytime. A modern approach to law enforcement.</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/user" className="bg-white text-blue-700 hover:bg-blue-100 px-6 py-3 rounded-lg font-medium transition duration-300 transform hover:scale-105">
                  File an FIR
                </Link>
                <Link to="/tracking" className="bg-transparent hover:bg-blue-800 border border-white px-6 py-3 rounded-lg font-medium transition duration-300 transform hover:scale-105">
                  Track Status
                </Link>
              </div>
            </div>
            <div className="md:w-1/2" data-aos="fade-left">
              <img src="/api/placeholder/600/400" alt="FIR System" className="rounded-lg shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" data-aos="fade-up">Our Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* User Portal */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300" data-aos="zoom-in" data-aos-delay="100">
              <div className="bg-blue-100 text-blue-700 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">User Portal</h3>
              <p className="text-gray-600 text-center mb-4">Register, file complaints, and manage your FIR records.</p>
              <Link to="/user" className="block text-center text-blue-600 hover:text-blue-800 font-medium">Access Portal →</Link>
            </div>
            
            {/* Police Portal */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300" data-aos="zoom-in" data-aos-delay="200">
              <div className="bg-blue-100 text-blue-700 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Police Portal</h3>
              <p className="text-gray-600 text-center mb-4">For police personnel to manage and update FIR records.</p>
              <Link to="/police" className="block text-center text-blue-600 hover:text-blue-800 font-medium">Access Portal →</Link>
            </div>
            
            {/* Station Portal */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300" data-aos="zoom-in" data-aos-delay="300">
              <div className="bg-blue-100 text-blue-700 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Station Portal</h3>
              <p className="text-gray-600 text-center mb-4">Police station management for case allocation and tracking.</p>
              <Link to="/station" className="block text-center text-blue-600 hover:text-blue-800 font-medium">Access Portal →</Link>
            </div>
            
            {/* Tracking Portal */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300" data-aos="zoom-in" data-aos-delay="400">
              <div className="bg-blue-100 text-blue-700 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">FIR Tracking</h3>
              <p className="text-gray-600 text-center mb-4">Track your complaint status and get real-time updates.</p>
              <Link to="/tracking" className="block text-center text-blue-600 hover:text-blue-800 font-medium">Track FIR →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16" data-aos="fade-up">How It Works</h2>
          
          <div className="flex flex-col md:flex-row">
            {/* Step 1 */}
            <div className="md:w-1/4 text-center mb-8 md:mb-0" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Register</h3>
              <p className="text-gray-600 px-4">Create an account with your details to access the system.</p>
            </div>
            
            {/* Step 2 */}
            <div className="md:w-1/4 text-center mb-8 md:mb-0" data-aos="fade-up" data-aos-delay="200">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">File FIR</h3>
              <p className="text-gray-600 px-4">Fill the online form with all necessary details of your complaint.</p>
            </div>
            
            {/* Step 3 */}
            <div className="md:w-1/4 text-center mb-8 md:mb-0" data-aos="fade-up" data-aos-delay="300">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Verification</h3>
              <p className="text-gray-600 px-4">Police officials verify and process your complaint.</p>
            </div>
            
            {/* Step 4 */}
            <div className="md:w-1/4 text-center" data-aos="fade-up" data-aos-delay="400">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-xl font-semibold mb-2">Track Status</h3>
              <p className="text-gray-600 px-4">Monitor your FIR status in real-time through the tracking portal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {/* Stat 1 */}
            <div data-aos="zoom-in" data-aos-delay="100">
              <div className="text-4xl font-bold mb-2">5000+</div>
              <p className="text-xl opacity-80">FIRs Filed</p>
            </div>
            
            {/* Stat 2 */}
            <div data-aos="zoom-in" data-aos-delay="200">
              <div className="text-4xl font-bold mb-2">100+</div>
              <p className="text-xl opacity-80">Police Stations</p>
            </div>
            
            {/* Stat 3 */}
            <div data-aos="zoom-in" data-aos-delay="300">
              <div className="text-4xl font-bold mb-2">90%</div>
              <p className="text-xl opacity-80">Resolution Rate</p>
            </div>
            
            {/* Stat 4 */}
            <div data-aos="zoom-in" data-aos-delay="400">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-xl opacity-80">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center" data-aos="fade-up">
          <h2 className="text-3xl font-bold mb-4">Ready to File or Track an FIR?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Our online system makes it quick and easy to file complaints and track their progress.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/user" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-300 transform hover:scale-105">
              File an FIR
            </Link>
            <Link to="/tracking" className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition duration-300 transform hover:scale-105">
              Track FIR Status
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

export default Home;