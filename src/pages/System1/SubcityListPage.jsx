// src/pages/System1/SubcityListPage.jsx
import React, { useState, useEffect } from 'react';
// Import the Subcity API functions
import { getSubcities, createSubcity, updateSubcity, deleteSubcity } from '../../api';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Subcities</h2>

          {error && <p className="text-red-500 dark:text-red-300 mb-4">{error}</p>}

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search subcities..."
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
              Add New Subcity
            </button>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <div className="mb-4 p-6 border rounded-md bg-gray-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Add New Subcity</h3>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subcity Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter subcity name"
                    value={newSubcityName}
                    onChange={(e) => setNewSubcityName(e.target.value)}
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
              <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Edit Subcity</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subcity Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter subcity name"
                    value={editSubcityName}
                    onChange={(e) => setEditSubcityName(e.target.value)}
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

          {/* Table */}
          {loading ? (
            <p className="text-slate-600 dark:text-slate-400">Loading subcities...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                  {subcities.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                        No subcities found
                      </td>
                    </tr>
                  ) : (
                    subcities.map((subcity) => (
                      <tr key={subcity.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                          {subcity.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditClick(subcity)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4 transition-colors duration-200"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(subcity.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls (Removed as not applicable) */}
          {/* The pagination controls section is removed from here */}

        </div>
      </div>
    </div>
  );
}

export default SubcityListPage;