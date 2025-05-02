// src/pages/System1/SectorSubdivisionListPage.jsx
import React, { useState, useEffect } from 'react';
import { getSectorSubdivisionTypes, createSectorSubdivisionType, updateSectorSubdivisionType, deleteSectorSubdivisionType } from '../../api'; // Import API functions

function SectorSubdivisionListPage() {
  const [types, setTypes] = useState([]); // State to hold the list of types
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Pagination states are not needed for the current non-paginated response
  // const [currentPage, setCurrentPage] = useState(1);
  // const [pageSize, setPageSize] = useState(10);
  // const [totalCount, setTotalCount] = useState(0);

  // State for Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // For delayed search

  // State for Forms (Create/Edit)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null); // Item being edited
  const [newTypeName, setNewTypeName] = useState(''); // State for create form input
  const [editTypeName, setEditTypeName] = useState(''); // State for edit form input


  // --- Data Fetching ---
  // Simplified fetchTypes for non-paginated response
  const fetchTypes = async (search) => { // Removed page and size parameters
    setLoading(true);
    setError(null);
    try {
      // Pass search term, but ignore pagination params as they aren't used by backend for this endpoint
      const response = await getSectorSubdivisionTypes(1, 10, search); // Still pass, but backend ignores
      setTypes(response.data); // *** Set types directly from response.data as it's the array ***
      // Total count and pagination info are not available in this response structure
      // setTotalCount(response.data.count);
    } catch (err) {
      setError("Failed to fetch sector subdivision types.");
      console.error("Error fetching types:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Effects ---

  // Effect to fetch data when component mounts or debounced search changes
  useEffect(() => {
    fetchTypes(debouncedSearchTerm); // Call with just the search term
  }, [debouncedSearchTerm]); // Re-run effect when debouncedSearchTerm changes

  // Effect to debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearInterval(handler);
    };
  }, [searchTerm]);

  // --- Pagination Handlers (Remove or comment out for now) ---
  // const handlePageChange = (newPage) => {
  //   // Pagination logic not applicable with current backend response
  // };

  // --- Search Handler ---
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    // setCurrentPage(1); // No pagination to reset
  };

  // --- Create Handlers ---
  const handleCreateClick = () => {
    setShowCreateForm(true);
    setNewTypeName(''); // Clear previous input
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    try {
      await createSectorSubdivisionType(newTypeName);
      setShowCreateForm(false);
      setNewTypeName('');
      fetchTypes(debouncedSearchTerm); // Refresh the list (no page needed)
    } catch (err) {
      setError("Failed to create sector subdivision type.");
      console.error("Error creating type:", err);
    }
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
  };

  // --- Edit Handlers ---
  const handleEditClick = (type) => {
    setCurrentEditItem(type);
    setEditTypeName(type.name);
    setShowEditForm(true);
  };

   const handleEditSubmit = async (e) => {
    e.preventDefault();
     if (!editTypeName.trim()) return;

    try {
      await updateSectorSubdivisionType(currentEditItem.id, editTypeName);
      setShowEditForm(false);
      setCurrentEditItem(null);
      setEditTypeName('');
      fetchTypes(debouncedSearchTerm); // Refresh the list
    } catch (err) {
      setError("Failed to update sector subdivision type.");
      console.error("Error updating type:", err);
    }
  };

   const handleEditCancel = () => {
    setShowEditForm(false);
    setCurrentEditItem(null);
    setEditTypeName('');
  };

  // --- Delete Handler ---
  // src/pages/System1/SectorSubdivisionListPage.jsx
// ... (previous imports and state variables) ...

// --- Delete Handler ---
const handleDeleteClick = async (typeId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteSectorSubdivisionType(typeId);
        // If successful, refresh the list
        fetchTypes(debouncedSearchTerm);
         // Optional: Clear any previous errors on success
         setError(null);
      } catch (err) {
        console.error("Error deleting type:", err); // Always log the full error
  
        // *** Check the error response status and display backend detail message ***
        if (err.response && err.response.status === 409 && err.response.data && err.response.data.detail) {
          // If status is 409 Conflict and there's a detail message from backend
          setError("Deletion failed: " + err.response.data.detail);
        }
        // You could keep other specific status checks if needed, but 409 is expected for ProtectedError now.
        // else if (err.response && err.response.status === ...) { ... }
        else {
          // Handle other unexpected errors or generic failures
          setError("An unexpected error occurred while trying to delete the sector subdivision type. Please try again.");
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
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sector Subdivision Types</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search types..."
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
           Add New Type
         </button>
      )}


      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-4 p-4 border rounded-md bg-gray-50">
          <h3 className="text-xl font-semibold mb-2">Add New Sector Subdivision Type</h3>
          <form onSubmit={handleCreateSubmit} className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Type Name"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">Save</button>
            <button type="button" onClick={handleCreateCancel} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md">Cancel</button>
          </form>
        </div>
      )}

       {/* Edit Form */}
       {showEditForm && currentEditItem && (
         <div className="mb-4 p-4 border rounded-md bg-gray-50">
           <h3 className="text-xl font-semibold mb-2">Edit Sector Subdivision Type</h3>
           <form onSubmit={handleEditSubmit} className="flex items-center space-x-4">
             <input
               type="text"
               placeholder="Type Name"
               value={editTypeName}
               onChange={(e) => setEditTypeName(e.target.value)}
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
          {/* Added Array.isArray check for robustness */}
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Use types directly as it's the array */}
              {Array.isArray(types) && types.map((type) => (
                <tr key={type.id}>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{type.name}</td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-800">
                    <button
                      onClick={() => handleEditClick(type)}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(type.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
               {/* Keep the "No data found" check */}
               {Array.isArray(types) && types.length === 0 && !loading && (
                 <tr>
                   <td colSpan="2" className="px-6 py-4 text-center text-gray-500">No data found.</td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls (Remove or comment out as not applicable) */}
      {/* {!loading && totalCount > 0 && ( ... )} */}

    </div>
  );
}

export default SectorSubdivisionListPage;