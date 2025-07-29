import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import ProductPage from './pages/ProductPage';
import BillingPage from './pages/BillingPage';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import YearlyReportPage from './pages/YearlyReportPage';
import LoginPage from './pages/LoginPage';
import RegisterStaff from './pages/RegisterStaff';
import CreditReport from './pages/CreditReport';
import StockReport from './pages/StockReport';
import PurchaseTable from './pages/PurchaseTable';
import PurchaseBilling from './pages/PurchaseBilling';

import bgImage from './assets/bgimage.jpg';
import './App.css';

function PrivateRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/" />;
}

function AppWrapper() {
  const location = useLocation();
  const showSidebar = location.pathname !== '/';

  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        color: 'white',
      }}
    >
      <div style={{ display: 'flex' }}>
        {showSidebar && <Sidebar />}
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/product" element={<PrivateRoute><ProductPage /></PrivateRoute>} />
            <Route path="/billing" element={<PrivateRoute><BillingPage /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/sales-history" element={<PrivateRoute><SalesHistoryPage /></PrivateRoute>} />
            <Route path="/yearly-report" element={<PrivateRoute><YearlyReportPage /></PrivateRoute>} />
            <Route path="/register-staff" element={<PrivateRoute><RegisterStaff /></PrivateRoute>} />
            <Route path="/purchase" element={<PrivateRoute><PurchaseTable /></PrivateRoute>} />
            <Route path="/purchase-billing" element={<PrivateRoute><PurchaseBilling /></PrivateRoute>} />
            <Route path="/stock-report" element={<PrivateRoute><StockReport /></PrivateRoute>} />
            <Route path="/credit-report" element={<PrivateRoute><CreditReport /></PrivateRoute>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
