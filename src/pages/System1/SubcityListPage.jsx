// src/pages/System1/SubcityListPage.jsx
import React, { useState, useEffect } from 'react';
// Import the Subcity API functions
import { getSubcities, createSubcity, updateSubcity, deleteSubcity } from '../../api';

function SubcityListPage() {
  // Change state variable names from 'types' to 'subcities'
  const [subcities, setSubcities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // State for Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // State for Forms (Create/Edit)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  // Change state variable name
  const [currentEditItem, setCurrentEditItem] = useState(null);
  // Change state variable names for form inputs
  const [newSubcityName, setNewSubcityName] = useState('');
  const [editSubcityName, setEditSubcityName] = useState('');


  const fetchSubcities = async (search) => { // Removed page and size parameters
    setLoading(true);
    setError(null);
    try {
      const response = await getSubcities(1, 10, search);
      setSubcities(response.data);
    } catch (err) {
      setError("Failed to fetch subcities.");
      console.error("Error fetching subcities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcities(debouncedSearchTerm);
  }, [debouncedSearchTerm]); 

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearInterval(handler);
    };
  }, [searchTerm]);

  // --- Pagination Handlers (Removed) ---
  // ... (Removed handlePageChange function) ...

  // --- Search Handler ---
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    // setCurrentPage(1); // No pagination to reset
  };

  // --- Create Handlers ---
  const handleCreateClick = () => {
    setShowCreateForm(true);
    setNewSubcityName(''); // Clear previous input
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newSubcityName.trim()) return;

    try {
      await createSubcity(newSubcityName);
      setShowCreateForm(false);
      setNewSubcityName('');
      fetchSubcities(debouncedSearchTerm); // Refresh the list (no page needed)
    } catch (err) {
      setError("Failed to create subcity.");
      console.error("Error creating subcity:", err);
    }
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
  };

  // --- Edit Handlers ---
  const handleEditClick = (subcity) => {
    setCurrentEditItem(subcity);
    setEditSubcityName(subcity.name); // Load current name into input
    setShowEditForm(true);
  };

   const handleEditSubmit = async (e) => {
    e.preventDefault();
     if (!editSubcityName.trim()) return;

    try {
      await updateSubcity(currentEditItem.id, editSubcityName);
      setShowEditForm(false);
      setCurrentEditItem(null);
      setEditSubcityName('');
      fetchSubcities(debouncedSearchTerm); // Refresh the list
    } catch (err) {
      setError("Failed to update subcity.");
      console.error("Error updating subcity:", err);
    }
  };

   const handleEditCancel = () => {
    setShowEditForm(false);
    setCurrentEditItem(null);
    setEditSubcityName('');
  };

  // --- Delete Handler ---
  // src/pages/System1/SubcityListPage.jsx
// ... (previous imports and state variables) ...

// --- Delete Handler ---
const handleDeleteClick = async (subcityId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteSubcity(subcityId);
        // If successful, refresh the list
        fetchSubcities(debouncedSearchTerm);
        // Optional: Clear any previous errors on success
        setError(null);
      } catch (err) {
        console.error("Error deleting subcity:", err); // Always log the full error
  
        // *** Check the error response status and display backend detail message ***
        if (err.response && err.response.status === 409 && err.response.data && err.response.data.detail) {
          // If status is 409 Conflict and there's a detail message from backend
          setError("Deletion failed: " + err.response.data.detail);
        }
        // You could keep other specific status checks if needed.
        else {
          // Handle other unexpected errors or generic failures
          setError("An unexpected error occurred while trying to delete the subcity. Please try again.");
        }
         // Clear the error message after a few seconds
         setTimeout(() => {
             setError(null);
         }, 7000); // Clear error after 7 seconds
      }
    }
  };
  
  // ... (rest of the component code) ...

  // --- Render ---

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Subcities</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search subcities..."
          value={searchTerm}
          onChange={handleSearchInputChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus->ring-blue-400"
        />
      </div>

      {/* Create New Button */}
      {!showCreateForm && !showEditForm && (
         <button
           onClick={handleCreateClick}
           className="mb-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md shadow"
         >
           Add New Subcity
         </button>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-4 p-4 border rounded-md bg-gray-50">
          <h3 className="text-xl font-semibold mb-2">Add New Subcity</h3>
          <form onSubmit={handleCreateSubmit} className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Subcity Name"
              value={newSubcityName}
              onChange={(e) => setNewSubcityName(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus->ring-blue-400"
            />
            <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">Save</button>
            <button type="button" onClick={handleCreateCancel} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md">Cancel</button>
          </form>
        </div>
      )}

       {/* Edit Form */}
       {showEditForm && currentEditItem && (
         <div className="mb-4 p-4 border rounded-md bg-gray-50">
           <h3 className="text-xl font-semibold mb-2">Edit Subcity</h3>
           <form onSubmit={handleEditSubmit} className="flex items-center space-x-4">
             <input
               type="text"
               placeholder="Subcity Name"
               value={editSubcityName}
               onChange={(e) => setEditSubcityName(e.target.value)}
               className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus->ring-blue-400"
             />
             <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">Update</button>
             <button type="button" onClick={handleEditCancel} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md">Cancel</button>
           </form>
         </div>
       )}

      {/* Loading and Data Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          {/* Use subcities state */}
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
               {/* Map over subcities state */}
              {Array.isArray(subcities) && subcities.map((subcity) => (
                // Use subcity.id and subcity.name
                <tr key={subcity.id}>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{subcity.name}</td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-800">
                    {/* Pass the subcity object to edit handler */}
                    <button
                      onClick={() => handleEditClick(subcity)}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow mr-2"
                    >
                      Edit
                    </button>
                    {/* Pass the subcity.id to delete handler */}
                    <button
                      onClick={() => handleDeleteClick(subcity.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
               {/* Check subcities length */}
               {Array.isArray(subcities) && subcities.length === 0 && !loading && (
                 <tr>
                   <td colSpan="2" className="px-6 py-4 text-center text-gray-500">No data found.</td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls (Removed as not applicable) */}
      {/* The pagination controls section is removed from here */}

    </div>
  );
}

export default SubcityListPage;