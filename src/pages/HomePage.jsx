// src/pages/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Hook for navigation

function HomePage({ onLogout }) { // Receive onLogout as a prop
  const navigate = useNavigate(); // Get the navigate function from react-router-dom

  // Function to handle system selection
  const handleSystemSelect = (systemPath) => {
    navigate(systemPath); // Navigate to the specified path
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Select a System</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Option 1 */}
        <button
          className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
          onClick={() => handleSystemSelect('/system1')} // Navigate to System 1 path
        >
          <div className="text-4xl mb-3">📊</div> {/* Placeholder Icon/Emoji */}
          <h2 className="text-lg font-semibold text-gray-700">System 1 Name</h2>
        </button>

        {/* System Option 2 */}
        <button
           className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out opacity-50 cursor-not-allowed"
           disabled // Disable this button as the system is not ready
        >
          <div className="text-4xl mb-3">⚙️</div> {/* Placeholder Icon/Emoji */}
          <h2 className="text-lg font-semibold text-gray-700">System 2 Name</h2>
        </button>

         {/* System Option 3 */}
         <button
           className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out opacity-50 cursor-not-allowed"
           disabled // Disable this button as the system is not ready
         >
           <div className="text-4xl mb-3">📝</div> {/* Placeholder Icon/Emoji */}
           <h2 className="text-lg font-semibold text-gray-700">System 3 Name</h2>
         </button>

         {/* System Option 4 */}
         <button
            className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out opacity-50 cursor-not-allowed"
            disabled // Disable this button as the system is not ready
         >
           <div className="text-4xl mb-3">📦</div> {/* Placeholder Icon/Emoji */}
           <h2 className="text-lg font-semibold text-gray-700">System 4 Name</h2>
         </button>

      </div>

       {/* Logout button */}
       <button
         onClick={onLogout} // Use the onLogout prop
         className="mt-8 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow transition-colors"
       >
         Logout
       </button>
    </div>
  );
}

export default HomePage;