// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import HomePage from './pages/HomePage';
import System1Dashboard from './pages/System1/System1Dashboard'; // Keep this import

// Import placeholder components for nested routes (create these next)
import SectorSubdivisionListPage from './pages/System1/SectorSubdivisionListPage';
import SubcityListPage from './pages/System1/SubcityListPage';
import WoredaListPage from './pages/System1/WoredaListPage';
import OrganizationalUnitListPage from './pages/System1/OrganizationalUnitListPage';
import EmployeeListPage from './pages/System1/EmployeeListPage';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    setToken(newToken);
    // Consider navigating here or letting the /login route handle the redirect
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    // Optional: Navigate to login page after logout
  };

  const ProtectedRoute = ({ element }) => {
    return token ? element : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* Route for the Login Page */}
        <Route
          path="/login"
          element={token ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />}
        />

        {/* Route for the Home Page - Protected */}
        <Route
          path="/"
          element={<ProtectedRoute element={<HomePage onLogout={handleLogout} />} />}
        />

        {/* Route for System 1 Dashboard and its nested routes - Protected */}
        {/* When path is /system1/*, render System1Dashboard.
            The nested <Route>s within define what renders in System1Dashboard's <Outlet>. */}
        <Route path="/system1" element={<ProtectedRoute element={<System1Dashboard />} />}>
          {/* Define nested routes here */}
          {/* Index route for /system1 - what shows when you first land on /system1 */}
          <Route index element={<div>Select an option from the menu</div>} /> {/* Placeholder */}

          <Route
            path="sector-subdivisions" // Relative path
            element={<SectorSubdivisionListPage />} // Component to render
          />
          <Route
            path="subcities" // Relative path
            element={<SubcityListPage />}
          />
           <Route
            path="woredas" // Relative path
            element={<WoredaListPage />}
          />
           <Route
            path="organizational-units" // Relative path
            element={<OrganizationalUnitListPage />}
          />
           <Route
            path="employees" // Relative path
            element={<EmployeeListPage />}
          />

          {/* Add nested routes for System 2, 3, 4 later as needed */}
           {/* <Route path="system2/*" element={<System2Dashboard />} /> */}
        </Route>


        {/* Optional: Redirect any unmatched routes to home or login */}
        <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />

      </Routes>
    </Router>
  );
}

export default App;