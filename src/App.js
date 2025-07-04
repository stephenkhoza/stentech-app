// src/App.js

import React, { useState, useEffect } from 'react';
import './App.css'; // or './App.css'


import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import ContactPage from './pages/ContactPage';
import IDeviceRepairs from './pages/services/IDeviceRepairs';
import SmartphoneBrandSelector from './pages/services/SmartphoneBrandSelector';
import LaptopRepair from './pages/services/LaptopRepair';
import ComputerRepair from './pages/services/ComputerRepair';
import BookRepair from './pages/process/BookRepair';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import CustomerLogin from './pages/CustomerLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerSignUp from './pages/CustomerSignUp';
import CollectAndDeliver from './pages/process/CollectAndDeliver';
import Pricing from './pages/process/Pricing';
import TrackRepair from './pages/process/TrackRepair';
import AboutUs from './pages/company/AboutUs';
import WhyChooseUs from './pages/company/WhyChooseUs';
import MacBookRepairPricing from './pages/services/MacBookRepairPricing';


function AppWrapper() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Admin authentication
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState(false); // Customer authentication

  useEffect(() => {
    AOS.init();
    // Check admin authentication
    const adminLoggedIn = false; // Default to false for security
    setIsAuthenticated(adminLoggedIn);

    // Check customer authentication
    const customerData = sessionStorage.getItem('customerData');
    setIsCustomerAuthenticated(!!customerData);
  }, []);

  // Hide header/footer on login, admin, and customer dashboard pages
  const hideHeaderFooter = ['/login', '/admin', '/signin', '/customer-dashboard'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {!hideHeaderFooter && <Header />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/iDeviceRepairs" element={<IDeviceRepairs />} />
          <Route path="/CellphoneRepair" element={<SmartphoneBrandSelector />} />
          <Route path="/LaptopRepair" element={<LaptopRepair />} />
          <Route path="/ComputerRepair" element={<ComputerRepair />} />
          <Route path="/book-repair" element={<BookRepair />} />
          <Route path="/CollectDeliver" element={<CollectAndDeliver/>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/track-repair" element={<TrackRepair />} />
          <Route path="/about" element={<AboutUs/>} />
          <Route path="/why-choose-us" element={<WhyChooseUs />} />
          <Route path="/services/MacBookRepairPricing" element={<MacBookRepairPricing />} />




           <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/customer-signup" element={<CustomerSignUp />} />
          
          {/* Customer routes */}
          <Route 
            path="/signin" 
            element={
              isCustomerAuthenticated ? (
                <Navigate to="/customer-dashboard" replace />
              ) : (
                <CustomerLogin setIsCustomerAuthenticated={setIsCustomerAuthenticated} />
              )
            } 
          />
          <Route 
            path="/customer-dashboard"
            element={
              isCustomerAuthenticated ? (
                <CustomerDashboard setIsCustomerAuthenticated={setIsCustomerAuthenticated} />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />
          
          {/* Admin routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/admin" replace />
              ) : (
                <LoginPage setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />
          <Route 
            path="/admin"
            element={
              isAuthenticated ? (
                <AdminDashboard setIsAuthenticated={setIsAuthenticated} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

// Wrap App in <Router>
function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;