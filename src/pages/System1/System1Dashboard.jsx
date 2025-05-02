// src/pages/System1/System1Dashboard.jsx
import React from 'react';
// Import Link, Outlet, useLocation, AND useNavigate
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

function System1Dashboard() {
  const location = useLocation();
  // Initialize the navigate hook
  const navigate = useNavigate();

  const isBaseSystem1Route = location.pathname === '/system1';

  const dataEntryLinks = [
    { to: 'sector-subdivisions', label: 'የሴክተር መ/ቤት ኣይነቶች' },
    { to: 'subcities', label: 'ክፍለ ከተማዎች' },
    { to: 'woredas', label: 'ወርዳዎች' },
    { to: 'organizational-units', label: 'የድርጅት ክፍሎች' },
    { to: 'employees', label: 'ሰራተኞች' },
  ];

  // Note: This code uses the blue color theme from an earlier version
  // If you want the lighter theme with the hex code, let me know,
  // and I can provide that version with the button change.

  return (
    <div className="min-h-screen bg-gray-100"> {/* Keep a light background */}
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md"> {/* Header background from your provided code */}
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">የሰራተኞች መዝገብ</h1> {/* Title from your provided code */}
          {/* Changed Link to a button with onClick using navigate(-1) */}
          <button
            onClick={() => navigate(-1)} // Go back one step in history
            // Applying button styles from your provided Link, adapting for button element
            className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back {/* Changed button text to "Back" */}
          </button>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {isBaseSystem1Route ? (
          // Show the menu when at the base /system1 path
          <div className="space-y-8">
            {/* Fill Out Data Section */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">ይመዝግቡ</h2> {/* Heading from your provided code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataEntryLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to} // Nested route path
                    className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out text-center"
                  >
                    {/* Using a slightly darker blue for link text */}
                    <p className="text-lg font-medium text-blue-700 group-hover:text-blue-900">{link.label}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Analysis Section */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Analysis</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Placeholder for Analysis options */}
                 <div className="block p-6 bg-white rounded-lg shadow-md opacity-50 cursor-not-allowed text-center">
                    <p className="text-lg font-medium text-gray-500">Analysis Report 1 (Coming Soon)</p>
                 </div>
                  <div className="block p-6 bg-white rounded-lg shadow-md opacity-50 cursor-not-allowed text-center">
                    <p className="text-lg font-medium text-gray-500">Analysis Dashboard (Coming Soon)</p>
                 </div>
               </div>
            </div>
          </div>
        ) : (
          // Render the nested route component when a nested path is matched
          <Outlet />
        )}
      </div>
    </div>
  );
}

export default System1Dashboard;