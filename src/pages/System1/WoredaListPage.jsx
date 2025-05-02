// src/pages/System1/WoredaListPage.jsx
import React, { useState, useEffect } from 'react';
// Import Woreda API functions and getAllSubcities
import { getWoredas, createWoreda, updateWoreda, deleteWoreda, getAllSubcities } from '../../api';
// Import the ProtectedError handling logic if needed (assuming your backend returns 409 now)

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
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Woredas</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search woredas or subcities..." // Updated placeholder
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
           Add New Woreda
         </button>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-4 p-4 border rounded-md bg-gray-50">
          <h3 className="text-xl font-semibold mb-2">Add New Woreda</h3>
          <form onSubmit={handleCreateSubmit} className="space-y-4"> {/* Use space-y for vertical spacing */}
            <div>
                <label htmlFor="newWoredaName" className="block text-sm font-medium text-gray-700 mb-1">Woreda Name</label>
                <input
                id="newWoredaName"
                type="text"
                placeholder="Woreda Name"
                value={newWoredaName}
                onChange={(e) => setNewWoredaName(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus->ring-blue-400"
                />
            </div>
            <div>
                <label htmlFor="newWoredaSubcity" className="block text-sm font-medium text-gray-700 mb-1">Subcity</label>
                 {loadingSubcities ? (
                     <p>Loading Subcities...</p>
                 ) : (
                    <select
                      id="newWoredaSubcity"
                      value={newWoredaSubcityId}
                      onChange={(e) => setNewWoredaSubcityId(e.target.value)}
                       // Disable if no subcities loaded or none available
                      disabled={subcities.length === 0}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus->ring-blue-400"
                    >
                       <option value="">Select a Subcity</option> {/* Default option */}
                       {/* Map over subcities to create dropdown options */}
                       {Array.isArray(subcities) && subcities.map((subcity) => (
                           <option key={subcity.id} value={subcity.id}>
                               {subcity.name}
                           </option>
                       ))}
                    </select>
                 )}
                 {subcities.length === 0 && !loadingSubcities && (
                     <p className="text-sm text-red-500 mt-1">No Subcities available. Please add a Subcity first.</p>
                 )}
            </div>

            <div className="flex justify-end space-x-4"> {/* Buttons at the end */}
                <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">Save</button>
                <button type="button" onClick={handleCreateCancel} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md">Cancel</button>
            </div>
          </form>
        </div>
      )}

       {/* Edit Form */}
       {showEditForm && currentEditItem && (
         <div className="mb-4 p-4 border rounded-md bg-gray-50">
           <h3 className="text-xl font-semibold mb-2">Edit Woreda</h3>
           <form onSubmit={handleEditSubmit} className="space-y-4"> {/* Use space-y */}
             <div>
                 <label htmlFor="editWoredaName" className="block text-sm font-medium text-gray-700 mb-1">Woreda Name</label>
                 <input
                   id="editWoredaName"
                   type="text"
                   placeholder="Woreda Name"
                   value={editWoredaName}
                   onChange={(e) => setEditWoredaName(e.target.value)}
                   className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus->ring-blue-400"
                 />
             </div>
             <div>
                 <label htmlFor="editWoredaSubcity" className="block text-sm font-medium text-gray-700 mb-1">Subcity</label>
                  {loadingSubcities ? (
                      <p>Loading Subcities...</p>
                  ) : (
                    <select
                      id="editWoredaSubcity"
                      value={editWoredaSubcityId}
                      onChange={(e) => setEditWoredaSubcityId(e.target.value)}
                      disabled={subcities.length === 0}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus->ring-blue-400"
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
                      <p className="text-sm text-red-500 mt-1">No Subcities available. Please add a Subcity first.</p>
                  )}
             </div>

             <div className="flex justify-end space-x-4"> {/* Buttons at the end */}
                <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">Update</button>
                <button type="button" onClick={handleEditCancel} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md">Cancel</button>
             </div>
           </form>
         </div>
       )}


      {/* Loading and Data Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">Name</th>
                {/* Add column for Subcity Name */}
                 <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">Subcity</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(woredas) && woredas.map((woreda) => (
                <tr key={woreda.id}> {/* Assuming woreda objects have an 'id' */}
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{woreda.name}</td>
                  {/* Display Subcity name - assuming woreda object includes it */}
                  {/* Your serializer needs to include the subcity name or object */}
                  {/* If serializer includes subcity object: woreda.subcity.name */}
                  {/* If serializer includes subcity name directly: woreda.subcity_name */}
                  {/* Assuming serializer includes the full subcity object: */}
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                     {woreda.subcity ? woreda.subcity_name : 'N/A'} {/* Access subcity name */}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-800">
                    <button
                      onClick={() => handleEditClick(woreda)}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(woreda.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
               {Array.isArray(woredas) && woredas.length === 0 && !loading && (
                 <tr>
                   {/* Adjust colspan based on number of columns */}
                   <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No woredas found.</td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalCount > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <span>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage * pageSize >= totalCount}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default WoredaListPage;