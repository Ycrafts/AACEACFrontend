// src/pages/System1/WoredaListPage.jsx
import React, { useState, useEffect } from 'react';
// Import Woreda API functions and getAllSubcities
import { getWoredas, createWoreda, updateWoreda, deleteWoreda, getAllSubcities } from '../../api';
// Import the ProtectedError handling logic if needed (assuming your backend returns 409 now)
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

function WoredaListPage() {
  const [woredas, setWoredas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Match your backend's default
  const [totalCount, setTotalCount] = useState(0);

  // State for Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // State for Forms (Create/Edit)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [newWoredaName, setNewWoredaName] = useState('');
  // State for the selected Subcity ID in the create form
  const [newWoredaSubcityId, setNewWoredaSubcityId] = useState('');
  const [editWoredaName, setEditWoredaName] = useState('');
   // State for the selected Subcity ID in the edit form
  const [editWoredaSubcityId, setEditWoredaSubcityId] = useState('');


  // State for Subcities dropdown data
  const [subcities, setSubcities] = useState([]);
  const [loadingSubcities, setLoadingSubcities] = useState(true);


  // --- Data Fetching ---

  // Fetch Woreda data (paginated)
  const fetchWoredas = async (page, size, search) => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await getWoredas(page, size, search);
       // Assuming your paginated response has 'results' and 'count' keys
      setWoredas(response.data.results);
      setTotalCount(response.data.count);
    } catch (err) {
      setError("Failed to fetch woredas.");
      console.error("Error fetching woredas:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Subcity data for dropdown
  const fetchSubcitiesForDropdown = async () => {
      setLoadingSubcities(true);
      try {
          const response = await getAllSubcities(); // Use the API function to get all subcities
          setSubcities(response.data); // Assuming response.data is the array of subcities
      } catch (err) {
          console.error("Failed to fetch subcities for dropdown:", err);
          // Handle error fetching subcities if needed, maybe show a message or disable dropdown
      } finally {
          setLoadingSubcities(false);
      }
  };


  // --- Effects ---

  // Effect to fetch Woreda data when component mounts or pagination/search changes
  useEffect(() => {
    fetchWoredas(currentPage, pageSize, debouncedSearchTerm);
  }, [currentPage, pageSize, debouncedSearchTerm]);

  // Effect to debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearInterval(handler);
    };
  }, [searchTerm]);

   // Effect to fetch Subcity data for dropdown when component mounts
   useEffect(() => {
       fetchSubcitiesForDropdown();
   }, []); // Empty dependency array means this runs only once on mount


  // --- Pagination Handlers ---
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(totalCount / pageSize)) {
      setCurrentPage(newPage);
    }
  };

  // --- Search Handler ---
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // --- Create Handlers ---
  const handleCreateClick = () => {
    setShowCreateForm(true);
    setNewWoredaName(''); // Clear previous input
     // Set a default or clear previous selection for the dropdown
    setNewWoredaSubcityId(''); // Start with no subcity selected
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
     // Ensure both name and subcity are selected
    if (!newWoredaName.trim() || !newWoredaSubcityId) {
         setError("Woreda name and Subcity are required."); // Add validation message
         setTimeout(() => setError(null), 5000);
         return;
    }

    try {
      // Use the createWoreda API function with both name and subcityId
      await createWoreda(newWoredaName, newWoredaSubcityId);
      setShowCreateForm(false);
      setNewWoredaName('');
      setNewWoredaSubcityId(''); // Clear dropdown selection
       // Refresh the list, staying on the current page and search term
      fetchWoredas(currentPage, pageSize, debouncedSearchTerm);
      setError(null); // Clear errors on success
    } catch (err) {
      setError("Failed to create woreda.");
      console.error("Error creating woreda:", err);
       setTimeout(() => setError(null), 7000);
    }
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
     setNewWoredaName('');
     setNewWoredaSubcityId(''); // Clear dropdown selection
  };

  // --- Edit Handlers ---
  const handleEditClick = (woreda) => {
    setCurrentEditItem(woreda);
    setEditWoredaName(woreda.name); // Load current name
     // Assuming the woreda object includes the subcity ID field (e.g., woreda.subcity)
     // Adjust 'woreda.subcity' if your serializer names the FK field differently
    setEditWoredaSubcityId(woreda.subcity); // Load current subcity ID
    setShowEditForm(true);
  };

   const handleEditSubmit = async (e) => {
    e.preventDefault();
      // Ensure both name and subcity are selected
     if (!editWoredaName.trim() || !editWoredaSubcityId) {
         setError("Woreda name and Subcity are required.");
         setTimeout(() => setError(null), 5000);
         return;
     }

    try {
      // Use the updateWoreda API function with id, name, and subcityId
      await updateWoreda(currentEditItem.id, editWoredaName, editWoredaSubcityId);
      setShowEditForm(false);
      setCurrentEditItem(null);
      setEditWoredaName('');
      setEditWoredaSubcityId(''); // Clear dropdown selection
      // Refresh the list
      fetchWoredas(currentPage, pageSize, debouncedSearchTerm);
       setError(null); // Clear errors on success
    } catch (err) {
      setError("Failed to update woreda.");
      console.error("Error updating woreda:", err);
       setTimeout(() => setError(null), 7000);
    }
  };

   const handleEditCancel = () => {
    setShowEditForm(false);
    setCurrentEditItem(null);
    setEditWoredaName('');
    setEditWoredaSubcityId(''); // Clear dropdown selection
  };

  // --- Delete Handler ---
  // Re-using the enhanced delete handler logic from previous steps
  const handleDeleteClick = async (woredaId) => {
      if (window.confirm("Are you sure you want to delete this item?")) {
        try {
          await deleteWoreda(woredaId);
          fetchWoredas(currentPage, pageSize, debouncedSearchTerm); // Refresh the list
           setError(null); // Clear errors on success
        } catch (err) {
          console.error("Error deleting woreda:", err);

          // Assuming your backend returns 409 for ProtectedError now
          if (err.response && err.response.status === 409 && err.response.data && err.response.data.detail) {
            setError("Deletion failed: " + err.response.data.detail);
          }
          // Fallback for other errors
          else {
            setError("An unexpected error occurred while trying to delete the woreda. Please try again.");
          }
           setTimeout(() => {
               setError(null);
           }, 7000);
        }
      }
    };


  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Woredas</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search woredas..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
          />
        </div>

        {/* Create New Button */}
        {!showCreateForm && !showEditForm && (
          <button
            onClick={handleCreateClick}
            className="mb-6 px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800 rounded-lg transition-colors duration-200"
          >
            Add New Woreda
          </button>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Add New Woreda</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label htmlFor="newWoredaName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Woreda Name
                </label>
                <input
                  id="newWoredaName"
                  type="text"
                  placeholder="Enter woreda name"
                  value={newWoredaName}
                  onChange={(e) => setNewWoredaName(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="newWoredaSubcity" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subcity
                </label>
                {loadingSubcities ? (
                  <p className="text-slate-500 dark:text-slate-400">Loading subcities...</p>
                ) : (
                  <select
                    id="newWoredaSubcity"
                    value={newWoredaSubcityId}
                    onChange={(e) => setNewWoredaSubcityId(e.target.value)}
                    disabled={subcities.length === 0}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select a Subcity</option>
                    {Array.isArray(subcities) && subcities.map((subcity) => (
                      <option key={subcity.id} value={subcity.id}>
                        {subcity.name}
                      </option>
                    ))}
                  </select>
                )}
                {subcities.length === 0 && !loadingSubcities && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">No subcities available. Please add a subcity first.</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCreateCancel}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Form */}
        {showEditForm && currentEditItem && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Edit Woreda</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="editWoredaName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Woreda Name
                </label>
                <input
                  id="editWoredaName"
                  type="text"
                  placeholder="Enter woreda name"
                  value={editWoredaName}
                  onChange={(e) => setEditWoredaName(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="editWoredaSubcity" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subcity
                </label>
                {loadingSubcities ? (
                  <p className="text-slate-500 dark:text-slate-400">Loading subcities...</p>
                ) : (
                  <select
                    id="editWoredaSubcity"
                    value={editWoredaSubcityId}
                    onChange={(e) => setEditWoredaSubcityId(e.target.value)}
                    disabled={subcities.length === 0}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select a Subcity</option>
                    {Array.isArray(subcities) && subcities.map((subcity) => (
                      <option key={subcity.id} value={subcity.id}>
                        {subcity.name}
                      </option>
                    ))}
                  </select>
                )}
                {subcities.length === 0 && !loadingSubcities && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">No subcities available. Please add a subcity first.</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}


        {/* Loading and Data Table */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">Loading woredas...</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-slate-50 dark:bg-slate-800 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 bg-slate-50 dark:bg-slate-800 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Subcity
                  </th>
                  <th className="px-6 py-3 bg-slate-50 dark:bg-slate-800 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {Array.isArray(woredas) && woredas.map((woreda) => (
                  <tr key={woreda.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {woreda.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {woreda.subcity ? woreda.subcity_name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEditClick(woreda)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(woreda.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {Array.isArray(woredas) && woredas.length === 0 && !loading && (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                      No woredas found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalCount > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
            </span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>
              <span className="text-sm text-slate-700 dark:text-slate-300">Page {currentPage}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage * pageSize >= totalCount}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default WoredaListPage;