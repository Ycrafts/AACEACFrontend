// src/pages/System1/SectorSubdivisionListPage.jsx
import React, { useState, useEffect } from 'react';
import { getSectorSubdivisionTypes, createSectorSubdivisionType, updateSectorSubdivisionType, deleteSectorSubdivisionType } from '../../api'; // Import API functions
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

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
      console.error("Error creating type:", err);
      setError(`A sector subdivision type with the name '${newTypeName}' already exists. Please use a different name.`);
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
      console.error("Error updating type:", err);
      setError(`A sector subdivision type with the name '${editTypeName}' already exists. Please use a different name.`);
    }
  };

   const handleEditCancel = () => {
    setShowEditForm(false);
    setCurrentEditItem(null);
    setEditTypeName('');
  };

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
  
  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Sector Subdivision Types</h2>

          {error && <p className="text-red-500 dark:text-red-300 mb-4">{error}</p>}

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search types..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>

          {/* Create New Button */}
          {!showCreateForm && !showEditForm && (
            <button
              onClick={handleCreateClick}
              className="mb-4 px-4 py-2 font-medium rounded-md shadow transition-colors duration-200
                bg-indigo-100 text-indigo-700 hover:bg-indigo-200
                dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
            >
              Add New Type
            </button>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <div className="mb-4 p-6 border rounded-md bg-gray-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Add New Sector Subdivision Type</h3>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Type Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter type name"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCancel}
                    className="px-4 py-2 bg-gray-300 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-md transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Form */}
          {showEditForm && currentEditItem && (
            <div className="mb-4 p-6 border rounded-md bg-gray-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Edit Sector Subdivision Type</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Type Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter type name"
                    value={editTypeName}
                    onChange={(e) => setEditTypeName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-4 py-2 bg-gray-300 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-md transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Loading and Data Table */}
          {loading ? (
            <div className="text-center py-4 text-slate-500 dark:text-slate-300">
              <p>Loading sector subdivision types...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {Array.isArray(types) && types.map((type) => (
                    <tr key={type.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {type.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(type)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 transition-colors duration-150"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(type.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {Array.isArray(types) && types.length === 0 && !loading && (
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                        No sector subdivision types found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls (Remove or comment out as not applicable) */}
          {/* {!loading && totalCount > 0 && ( ... )} */}

        </div>
      </div>
    </div>
  );
}

export default SectorSubdivisionListPage;