// src/pages/System1/OrganizationalUnitListPage.jsx
import React, { useState, useEffect } from 'react';
// Import all necessary API functions, including the new getAll... ones
import {
    getOrganizationalUnits,
    deleteOrganizationalUnit,
    createOrganizationalUnit, // Import for Create
    updateOrganizationalUnit, // Import for Update
    getAllDivisions,
    getAllSectorSubdivisionTypes,
    getAllSubcitySubdivisionTypes,
    getAllOrganizationalUnits, // For Parent dropdown
    getAllSubcities,
    getAllWoredas,
} from '../../api';

// Import the helper function for detail display (already there)
const getOrganizationalUnitDetailsToShow = (unit) => {
    const details = []; // Array to hold the details we want to display

    // Rule: Always display Name and Division
    details.push({ label: 'Name', value: unit.name || 'N/A' });
    details.push({ label: 'Division', value: unit.division_name || 'N/A' });

    // Rule: Display Sector Subdivision Type ONLY if division IS "Sector Office"
    if (unit.division_name === "Sector Office") {
        details.push({ label: 'Sector Subdivision Type', value: unit.sector_subdiv_type_name || 'N/A' });
    }

    // Rule: Display Subcity Subdivision Type ONLY if division IS "Subcity"
    if (unit.division_name === "Subcity") {
         details.push({ label: 'Subcity Subdivision Type', value: unit.subcity_subdiv_type_name || 'N/A' });
    }

     // Rule: Display Parent ONLY if parent is NOT NULL
    if (!!unit.parent_name) { // Check if parent_name is truthy
         details.push({ label: 'Parent', value: unit.parent_name });
    }

    // Rule: Subcity is shown always (displaying "N/A" if null)
    details.push({ label: 'Subcity', value: unit.subcity_name || 'N/A' });

    // Rule: Display Woreda UNLESS the division type is "Subcity" AND it has NO parent
    if (!(unit.division_name === "Subcity" && !unit.parent_name)) {
         details.push({ label: 'Woreda', value: unit.woreda_name || 'N/A' });
    }

    // Include required_employees_no if applicable and you want to display it
    // Based on your serializer, it's included, so let's display it if not null/empty
    if (unit.required_employees_no !== undefined && unit.required_employees_no !== null && unit.required_employees_no !== '') {
       details.push({ label: 'Required Employees', value: unit.required_employees_no });
    }


    // TODO: Add more rules here as needed for other conditions/fields

    return details; // Return the prepared list of details
};



const getFormFieldsToShow = (formData, divisions, parentOrganizationalUnits) => {
  const fieldsToShow = {
      name: true, // Always show name
      required_employees_no: true, // Always show required_employees_no
      parent: true, // Always show parent field
      division: false,
      sector_subdiv_type: false,
      subcity_subdiv_type: false,
      subcity: false,
      woreda: false,
  };

  const selectedParent = formData.parent ?
                         (parentOrganizationalUnits.find(unit => unit.id === parseInt(formData.parent)) || null)
                         : null;

  if (selectedParent) {
      fieldsToShow.division = true;

      const parentDivisionName = selectedParent.division_name;

      if (parentDivisionName === "Subcity") {
          fieldsToShow.woreda = true;
      } else if (parentDivisionName === "Sector Office") {
          // If parent's division is Sector Office
          const parentHasParent = !!selectedParent.parent;
          if (parentHasParent) {
              // If parent has a parent, show woreda
              fieldsToShow.woreda = true;
          } else {
              // If parent has no parent, show subcity
              fieldsToShow.subcity = true;
          }
      }
  } else {
      // No parent selected - show division field for manual selection
      fieldsToShow.division = true;

      // Get the name of the manually selected division
      const selectedDivisionName = formData.division ?
                                   (divisions.find(div => div.id === parseInt(formData.division))?.name || null)
                                   : null;

      if (selectedDivisionName) {
          if (selectedDivisionName === "Subcity") {
              // If division is Subcity, show subcity field
              fieldsToShow.subcity = true;
          } else if (selectedDivisionName === "Sector Office") {
              // If division is Sector Office, show sector subdivision type
              fieldsToShow.sector_subdiv_type = true;
          }
          // For College and Hospital, no additional fields are shown
      }
  }

  return fieldsToShow;
};

function OrganizationalUnitListPage() {
  const [organizationalUnits, setOrganizationalUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');


  const [expandedRowId, setExpandedRowId] = useState(null);

  // --- State for Forms ---
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null); // Item being edited

  // State for Create/Edit Form Input Values
  const [formData, setFormData] = useState({
      name: '',
      required_employees_no: '', // Assuming this field exists and is a number
      division: '', // Store selected Division ID
      sector_subdiv_type: '', // Store selected Sector Subdivision Type ID
      subcity_subdiv_type: '', // Store selected Subcity Subdivision Type ID
      parent: '', // Store selected Parent Organizational Unit ID
      subcity: '', // Store selected Subcity ID
      woreda: '', // Store selected Woreda ID
  });

  // --- State for Dropdown Data ---
  const [divisions, setDivisions] = useState([]);
  const [sectorSubdivTypes, setSectorSubdivTypes] = useState([]);
  const [subcitySubdivTypes, setSubcitySubdivTypes] = useState([]);
  const [parentOrganizationalUnits, setParentOrganizationalUnits] = useState([]);
  const [subcities, setSubcities] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true); // Loading state for all dropdowns


  // --- Data Fetching ---

  // Fetch Organizational Unit data (paginated and searchable)
  const fetchOrganizationalUnits = async (page, size, search) => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await getOrganizationalUnits(page, size, search);
       // Assuming your paginated response has 'results' and 'count' keys
      setOrganizationalUnits(response.data.results);
      setTotalCount(response.data.count);
       // Collapse any expanded row when data refreshes
       setExpandedRowId(null);
    } catch (err) {
      setError("Failed to fetch organizational units.");
      console.error("Error fetching organizational units:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for all dropdowns
    // Fetch data for all dropdowns
    const fetchDropdownData = async () => {
      setLoadingDropdowns(true);
      try {
          // Fetch data for all dropdowns concurrently
          const [
              divisionsRes,
              sectorSubdivTypesRes,
              subcitySubdivTypesRes,
              organizationalUnitsRes, // For parent dropdown
              subcitiesRes,
              woredasRes,
          ] = await Promise.all([
              getAllDivisions(),
              getAllSectorSubdivisionTypes(),
              getAllSubcitySubdivisionTypes(),
              getAllOrganizationalUnits(), // This API call returns the data
              getAllSubcities(),
              getAllWoredas(),
          ]);

          setDivisions(divisionsRes.data);
          setSectorSubdivTypes(sectorSubdivTypesRes.data);
          setSubcitySubdivTypes(subcitySubdivTypesRes.data);

          // --- CORRECTED LOGIC HERE ---
          // Access the 'results' array from the organizationalUnitsRes.data
          const allOrganizationalUnits = organizationalUnitsRes.data.results;

          // Check if allOrganizationalUnits is actually an array before filtering
          if (Array.isArray(allOrganizationalUnits)) {
               // Filter out the current unit from the parent dropdown list when editing
               // (This filtering doesn't affect the Create form as currentEditItem is null)
               const potentialParents = allOrganizationalUnits.filter(unit =>
                   unit.id !== (currentEditItem ? currentEditItem.id : null)
                   // Add any other rules for what can be a parent here if needed
               );
               setParentOrganizationalUnits(potentialParents);
          } else {
               // Handle unexpected data format for organizational units
               console.error("API did not return an array in the 'results' key for organizational units:", organizationalUnitsRes.data);
               setParentOrganizationalUnits([]); // Set to empty array to prevent further errors
               // Optionally, you could set an error state to inform the user
          }
          // --- END OF CORRECTED LOGIC ---


          setSubcities(subcitiesRes.data);
          setWoredas(woredasRes.data);

      } catch (err) {
          console.error("Failed to fetch dropdown data:", err);
          // This catch block will handle general API errors (like the 500)
          // You might want to set a more user-friendly error message here
          setError("Failed to load necessary data for the form. Please try again.");
          setTimeout(() => setError(null), 10000); // Clear error after 10 seconds
      } finally {
          setLoadingDropdowns(false);
      }
  };


  // --- Effects ---

  // Effect to fetch Woreda data when component mounts or pagination/search changes
  useEffect(() => {
    fetchOrganizationalUnits(currentPage, pageSize, debouncedSearchTerm);
  }, [currentPage, pageSize, debouncedSearchTerm]); // Re-run effect when these states change

  // Effect to debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearInterval(handler);
    };
  }, [searchTerm]);

   // Effect to fetch dropdown data when component mounts or when editing starts/stops (to filter parent dropdown)
   useEffect(() => {
       fetchDropdownData();
   }, [currentEditItem]); // Re-run if currentEditItem changes (for parent dropdown filtering)


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

   // --- Detail View Handler ---
   const handleRowClick = (unitId) => {
       // Toggle expanded state: if the clicked row is already expanded, collapse it; otherwise, expand it.
       setExpandedRowId(expandedRowId === unitId ? null : unitId);
   };

  // --- Form State Handling ---
  // --- Form State Handling ---
 // --- Form State Handling ---
   const handleInputChange = (e) => {
        const { name, value } = e.target;
  
        // Special handling for dropdowns where an empty string should be null
        // and number input where empty string should be null or 0
        let finalValue = value;
        if (e.target.type === 'select-one' && value === '') {
            finalValue = null; // Convert empty string from select to null
        } else if (e.target.type === 'number' && value === '') {
             finalValue = null; // Convert empty string from number input to null
        }
  
        setFormData(prevFormData => {
            const newState = {
                ...prevFormData,
                [name]: finalValue
            };
  
            // --- Logic to derive fields when Parent changes ---
            if (name === 'parent') {
                const selectedParent = finalValue ?
                                       (parentOrganizationalUnits.find(unit => unit.id === parseInt(finalValue)) || null)
                                       : null;
  
                if (selectedParent) {
                    // Set derived fields from the selected parent
                    newState.division = selectedParent.division || null; // Use parent's division ID (allow null)
                    newState.sector_subdiv_type = selectedParent.sector_subdiv_type || null; // Use parent's sector subdiv type ID (allow null)
                    newState.subcity_subdiv_type = selectedParent.subcity_subdiv_type || null; // Use parent's subcity subdiv type ID (allow null)
  
                    // Optional: Reset Subcity and Woreda if parent is selected, as they might be inherited
                    // Or keep their values and let the visibility logic handle it.
                    // Let's reset them for now to avoid confusion.
                    newState.subcity = null;
                    newState.woreda = null;
  
                } else {
                    // If parent is cleared, clear derived fields and allow manual selection again
                    newState.division = ''; // Set to empty string for manual select default
                    newState.sector_subdiv_type = null;
                    newState.subcity_subdiv_type = null;
                    // Keep Subcity and Woreda as they might be needed for top-level units
                }
            }
  
            return newState;
        });
    };

  // Helper to get the name of a division from its ID
  const getDivisionNameById = (divisionId) => {
      const division = divisions.find(div => div.id === parseInt(divisionId));
      return division ? division.name : null;
  };

  // --- Create Handlers ---
   const handleCreateClick = () => {
       setShowCreateForm(true);
        // Reset form data to initial empty state when opening create form
       setFormData({
           name: '',
           required_employees_no: '',
           division: '', // Use empty string for initial select value
           sector_subdiv_type: '',
           subcity_subdiv_type: '',
           parent: '',
           subcity: '',
           woreda: '',
       });
       setError(null); // Clear errors
   };

   const handleCreateSubmit = async (e) => {
       e.preventDefault();

       // Basic frontend validation (can be expanded)
       if (!formData.name.trim()) {
           setError("Organizational Unit Name is required.");
           setTimeout(() => setError(null), 5000);
           return;
       }
        // TODO: Add more specific validation based on currently visible/required fields
        // Example: If Sector Subdivision Type dropdown is visible, check if it's selected
        const fieldsToShow = getFormFieldsToShow(formData, divisions, parentOrganizationalUnits); // Get current form field visibility

        if (fieldsToShow.sector_subdiv_type && !formData.sector_subdiv_type) {
             setError("Sector Subdivision Type is required for this division.");
             setTimeout(() => setError(null), 5000);
             return;
        }
         if (fieldsToShow.subcity_subdiv_type && !formData.subcity_subdiv_type) {
              setError("Subcity Subdivision Type is required for this division.");
              setTimeout(() => setError(null), 5000);
              return;
         }
         // Add validation for other conditionally required fields (e.g., Parent, Subcity, Woreda)


       console.log("Submitting Create Form:", formData); // Log form data

       try {
           // Call the create API function with the form data
           await createOrganizationalUnit(formData);
           setShowCreateForm(false);
           // Refresh the list
           fetchOrganizationalUnits(currentPage, pageSize, debouncedSearchTerm);
           setError(null); // Clear errors on success
       } catch (err) {
           console.error("Error creating organizational unit:", err);
           // TODO: Handle API error, including displaying backend validation errors
            if (err.response && err.response.data) {
                 // Display backend validation errors if available
                 setError("Failed to create organizational unit: " + JSON.stringify(err.response.data));
             } else {
                 setError("Failed to create organizational unit. Please try again.");
             }
            setTimeout(() => setError(null), 7000);
       }
   };

   const handleCreateCancel = () => {
       setShowCreateForm(false);
        setError(null); // Clear errors
   };


  // --- Edit Handlers ---
   const handleEditClick = (unit) => {
       setShowEditForm(true);
       setCurrentEditItem(unit);
       // Populate form data with the existing unit's data
       // Ensure all fields are populated correctly, handling nulls
       setFormData({
           name: unit.name || '',
           required_employees_no: unit.required_employees_no || '', // Assuming it might be null
           // Use the ID from the fetched data for dropdowns
           // Ensure null values from API are correctly set to null in state
           division: unit.division || '',
           sector_subdiv_type: unit.sector_subdiv_type || null,
           subcity_subdiv_type: unit.subcity_subdiv_type || null,
           parent: unit.parent || null,
           subcity: unit.subcity || null,
           woreda: unit.woreda || null,
       });
       setError(null); // Clear errors
   };

   const handleEditSubmit = async (e) => {
       e.preventDefault();

        // TODO: Add frontend validation based on currently visible/required fields
        if (!formData.name.trim()) {
            setError("Organizational Unit Name is required.");
            setTimeout(() => setError(null), 5000);
            return;
        }
         // TODO: Add more specific validation based on selected division/parent
         const fieldsToShow = getFormFieldsToShow(formData, divisions, parentOrganizationalUnits); // Get current form field visibility

         if (fieldsToShow.sector_subdiv_type && !formData.sector_subdiv_type) {
              setError("Sector Subdivision Type is required for this division.");
              setTimeout(() => setError(null), 5000);
              return;
         }
          if (fieldsToShow.subcity_subdiv_type && !formData.subcity_subdiv_type) {
               setError("Subcity Subdivision Type is required for this division.");
               setTimeout(() => setError(null), 5000);
               return;
          }
          // Add validation for other conditionally required fields (e.g., Parent, Subcity, Woreda)


       console.log("Submitting Edit Form:", formData); // Log form data


       try {
           // Call the update API function with the item ID and form data
           await updateOrganizationalUnit(currentEditItem.id, formData);
           setShowEditForm(false);
           setCurrentEditItem(null); // Clear the item being edited
           // Refresh the list
           fetchOrganizationalUnits(currentPage, pageSize, debouncedSearchTerm);
            setError(null); // Clear errors on success
       } catch (err) {
           console.error("Error updating organizational unit:", err);
            // TODO: Handle API error, including displaying backend validation errors
            if (err.response && err.response.data) {
                 // Display backend validation errors if available
                 setError("Failed to update organizational unit: " + JSON.stringify(err.response.data));
             } else {
                 setError("Failed to update organizational unit. Please try again.");
             }
            setTimeout(() => setError(null), 7000);
       }
   };

   const handleEditCancel = () => {
       setShowEditForm(false);
       setCurrentEditItem(null);
        setError(null); // Clear errors
   };

  // --- Delete Handler ---
  const handleDeleteClick = async (organizationalUnitId) => {
      if (window.confirm("Are you sure you want to delete this organizational unit?")) {
        try {
          await deleteOrganizationalUnit(organizationalUnitId);
          // Refresh the list after successful deletion
          fetchOrganizationalUnits(currentPage, pageSize, debouncedSearchTerm);
          // Clear any previous errors on success
          setError(null);
        } catch (err) {
          console.error("Error deleting organizational unit:", err);

          if (
            err.response &&
            err.response.status === 409 &&
            err.response.data &&
            err.response.data.detail
          ) {
            setError("Deletion failed: " + err.response.data.detail);
          } else {
            setError(
              "An unexpected error occurred while trying to delete the organizational unit. Please try again."
            );
          }

          // Automatically clear the error after 7 seconds
          setTimeout(() => {
            setError(null);
          }, 7000);
        }
      }
    };


  // --- Render ---

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Organizational Units</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, division, subcity, woreda..." // Updated placeholder
          value={searchTerm}
          onChange={handleSearchInputChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Create New Button */}
       {/* Only show the button if no forms are currently open */}
      {!showCreateForm && !showEditForm && (
         <button
           onClick={handleCreateClick}
           className="mb-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md shadow"
         >
           Add New Organizational Unit
         </button>
      )}


      {/* Create Form - Conditionally render */}
{showCreateForm && (
  <div className="mb-4 p-6 border rounded-md bg-gray-50">
      <h3 className="text-xl font-semibold mb-4">Add New Organizational Unit</h3>
      {/* *** START OF CREATE FORM JSX *** */}
      {loadingDropdowns ? (
          <p>Loading form data...</p>
      ) : (
          <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Use the helper function to determine which fields to show */}
              {/* Pass parentOrganizationalUnits to the helper */}
              {Object.entries(getFormFieldsToShow(formData, divisions, parentOrganizationalUnits)).map(([fieldName, isVisible]) => {
                  // Skip if the field should not be visible according to getFormFieldsToShow
                  if (!isVisible) return null;

                  // Determine if the field is derived (only applies to division and subdivision types when parent is selected)
                  const isDerivedField = !!formData.parent &&
                                         (fieldName === 'division' ||
                                          fieldName === 'sector_subdiv_type' ||
                                          fieldName === 'subcity_subdiv_type');

                  // Render the appropriate input/select or read-only text
                  switch (fieldName) {
                      case 'name':
                          return (
                              <div key={fieldName}>
                                  <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                  <input
                                      id={`create-${fieldName}`}
                                      type="text"
                                      name={fieldName}
                                      value={formData[fieldName]}
                                      onChange={handleInputChange}
                                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                      required
                                  />
                              </div>
                          );
                      case 'required_employees_no':
                           return (
                               <div key={fieldName}>
                                   <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Required Employees No.</label>
                                   <input
                                       id={`create-${fieldName}`}
                                       type="number"
                                       name={fieldName}
                                       value={formData[fieldName] || ''}
                                       onChange={handleInputChange}
                                       className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                       min="0"
                                   />
                               </div>
                           );
                      case 'parent':
                           // The parent field should ALWAYS be a selectable dropdown if isVisible is true
                           // It is NOT a derived field in the same way division/subdivision types are.
                           return (
                               <div key={fieldName}>
                                   <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Parent Organizational Unit</label>
                                   <select
                                       id={`create-${fieldName}`}
                                       name={fieldName}
                                       value={formData[fieldName] || ''}
                                       onChange={handleInputChange}
                                       className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                       disabled={loadingDropdowns || parentOrganizationalUnits.length === 0}
                                   >
                                       <option value="">Select Parent (Optional)</option>
                                       {/* Filter out the current unit from the parent dropdown list when editing - handled in fetchDropdownData */}
                                       {Array.isArray(parentOrganizationalUnits) && parentOrganizationalUnits.map(unit => (
                                           <option key={unit.id} value={unit.id}>{unit.name}</option>
                                       ))}
                                   </select>
                                    {parentOrganizationalUnits.length === 0 && !loadingDropdowns && <p className="text-sm text-gray-500 mt-1">No suitable parent units available.</p>}
                               </div>
                           );
                      case 'division':
                          // This field is derived if parent is selected, manual otherwise
                          const derivedDivisionName = isDerivedField ? getDivisionNameById(formData.division) : null;
                          return (
                              <div key={fieldName}>
                                  <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                                  {isDerivedField ? (
                                      // Display derived division name as read-only text
                                      <p className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700">
                                          {derivedDivisionName || 'N/A'}
                                      </p>
                                  ) : (
                                      // Allow manual selection if no parent
                                      <select
                                          id={`create-${fieldName}`}
                                          name={fieldName}
                                          value={formData[fieldName] || ''}
                                          onChange={handleInputChange}
                                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                          disabled={loadingDropdowns || divisions.length === 0}
                                          required={!formData.parent}
                                      >
                                          <option value="">Select Division</option>
                                          {Array.isArray(divisions) && divisions.map(div => (
                                              <option key={div.id} value={div.id}>{div.name}</option>
                                          ))}
                                      </select>
                                  )}
                                   {divisions.length === 0 && !loadingDropdowns && <p className="text-sm text-red-500 mt-1">No Divisions available.</p>}
                              </div>
                          );
                      case 'sector_subdiv_type':
                           // This field is derived if parent is selected, manual otherwise
                           const derivedSectorSubdivName = isDerivedField ? getSectorSubdivTypeNameById(formData.sector_subdiv_type) : null;
                           return (
                               <div key={fieldName}>
                                   <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Sector Subdivision Type</label>
                                   {isDerivedField ? (
                                        // Display derived type name as read-only text
                                        <p className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700">
                                            {derivedSectorSubdivName || 'N/A'}
                                        </p>
                                   ) : (
                                        // Allow manual selection if no parent and field is visible by rule
                                        <select
                                            id={`create-${fieldName}`}
                                            name={fieldName}
                                            value={formData[fieldName] || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                            disabled={loadingDropdowns || sectorSubdivTypes.length === 0}
                                            required={isVisible && !formData.parent}
                                        >
                                            <option value="">Select Sector Subdivision Type</option>
                                            {Array.isArray(sectorSubdivTypes) && sectorSubdivTypes.map(type => (
                                                <option key={type.id} value={type.id}>{type.name}</option>
                                            ))}
                                        </select>
                                   )}
                                    {sectorSubdivTypes.length === 0 && !loadingDropdowns && <p className="text-sm text-red-500 mt-1">No Sector Subdivision Types available.</p>}
                               </div>
                           );
                      case 'subcity_subdiv_type':
                           // This field is derived if parent is selected, manual otherwise
                           const isDerivedSubcitySubdiv = isDerivedField; // Same derivation logic
                           const derivedSubcitySubdivName = isDerivedSubcitySubdiv ? getSubcitySubdivTypeNameById(formData.subcity_subdiv_type) : null;
                            return (
                                <div key={fieldName}>
                                    <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Subcity Subdivision Type</label>
                                    {isDerivedSubcitySubdiv ? (
                                         // Display derived type name as read-only text
                                         <p className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700">
                                             {derivedSubcitySubdivName || 'N/A'}
                                         </p>
                                    ) : (
                                         // Allow manual selection if no parent and field is visible by rule
                                         <select
                                             id={`create-${fieldName}`}
                                             name={fieldName}
                                             value={formData[fieldName] || ''}
                                             onChange={handleInputChange}
                                             className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                             disabled={loadingDropdowns || subcitySubdivTypes.length === 0}
                                             required={isVisible && !formData.parent}
                                         >
                                             <option value="">Select Subcity Subdivision Type</option>
                                             {Array.isArray(subcitySubdivTypes) && subcitySubdivTypes.map(type => (
                                                 <option key={type.id} value={type.id}>{type.name}</option>
                                             ))}
                                         </select>
                                    )}
                                     {subcitySubdivTypes.length === 0 && !loadingDropdowns && <p className="text-sm text-red-500 mt-1">No Subcity Subdivision Types available.</p>}
                                </div>
                            );
                      case 'subcity':
                           return (
                               <div key={fieldName}>
                                   <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Subcity</label>
                                   <select
                                       id={`create-${fieldName}`}
                                       name={fieldName}
                                       value={formData[fieldName] || ''}
                                       onChange={handleInputChange}
                                       className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                       disabled={loadingDropdowns || subcities.length === 0}
                                   >
                                       <option value="">Select Subcity (Optional)</option>
                                       {Array.isArray(subcities) && subcities.map(sub => (
                                           <option key={sub.id} value={sub.id}>{sub.name}</option>
                                       ))}
                                   </select>
                                    {subcities.length === 0 && !loadingDropdowns && <p className="text-sm text-red-500 mt-1">No Subcities available.</p>}
                               </div>
                           );
                      case 'woreda':
                           return (
                               <div key={fieldName}>
                                   <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Woreda</label>
                                   <select
                                       id={`create-${fieldName}`}
                                       name={fieldName}
                                       value={formData[fieldName] || ''}
                                       onChange={handleInputChange}
                                       className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                       disabled={loadingDropdowns || woredas.length === 0}
                                   >
                                       <option value="">Select Woreda (Optional)</option>
                                       {Array.isArray(woredas) && woredas.map(wor => (
                                           <option key={wor.id} value={wor.id}>{wor.name}</option>
                                       ))}
                                   </select>
                                    {woredas.length === 0 && !loadingDropdowns && <p className="text-sm text-red-500 mt-1">No Woredas available.</p>}
                               </div>
                           );
                      default:
                          return null;
                  }
              })}

              <div className="flex justify-end space-x-4 mt-6">
                  <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow">Save</button>
                  <button type="button" onClick={handleCreateCancel} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md">Cancel</button>
              </div>
          </form>
      )}
      {/* *** END OF CREATE FORM JSX *** */}
  </div>
)}

       {/* Edit Form - Conditionally render */}
       {showEditForm && currentEditItem && (
            <div className="mb-4 p-6 border rounded-md bg-gray-50">
                <h3 className="text-xl font-semibold mb-4">Edit Organizational Unit</h3>
                 {/* *** START OF EDIT FORM JSX (Similar to Create, but pre-populated) *** */}
                 {loadingDropdowns ? (
                     <p>Loading form data...</p>
                 ) : (
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                  {/* Use the helper function to determine which fields to show */}
                  {/* Pass parentOrganizationalUnits to the helper */}
                  {Object.entries(getFormFieldsToShow(formData, divisions, parentOrganizationalUnits)).map(([fieldName, isVisible]) => {
                      // Skip if the field should not be visible
                      if (!isVisible) return null;

                      // Determine if the field is derived (only if parent is selected)
                      const isDerivedField = !!formData.parent &&
                                             (fieldName === 'division' ||
                                              fieldName === 'sector_subdiv_type' ||
                                              fieldName === 'subcity_subdiv_type');

                      // Render the appropriate input/select or read-only text
                      switch (fieldName) {
                          case 'name':
                              return (
                                  <div key={fieldName}>
                                      <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                      <input
                                          id={`edit-${fieldName}`}
                                          type="text"
                                          name={fieldName}
                                          value={formData[fieldName]}
                                          onChange={handleInputChange}
                                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                          required
                                      />
                                  </div>
                              );
                          case 'required_employees_no':
                               return (
                                   <div key={fieldName}>
                                       <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Required Employees No.</label>
                                       <input
                                           id={`edit-${fieldName}`}
                                           type="number"
                                           name={fieldName}
                                           value={formData[fieldName] || ''}
                                           onChange={handleInputChange}
                                           className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                           min="0"
                                       />
                                   </div>
                               );
                          case 'parent':
                               return (
                                   <div key={fieldName}>
                                       <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Parent Organizational Unit</label>
                                       <select
                                           id={`edit-${fieldName}`}
                                           name={fieldName}
                                           value={formData[fieldName] || ''}
                                           onChange={handleInputChange}
                                           className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                           disabled={loadingDropdowns || parentOrganizationalUnits.length === 0}
                                       >
                                           <option value="">Select Parent (Optional)</option>
                                           {Array.isArray(parentOrganizationalUnits) && parentOrganizationalUnits.map(unit => (
                                               <option key={unit.id} value={unit.id}>{unit.name}</option>
                                           ))}
                                       </select>
                                        {parentOrganizationalUnits.length === 0 && !loadingDropdowns && <p className="text-sm text-gray-500 mt-1">No suitable parent units available.</p>}
                                   </div>
                               );
                          case 'division':
                              const derivedDivisionName = isDerivedField ? getDivisionNameById(formData.division) : null;
                              return (
                                  <div key={fieldName}>
                                      <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                                      {isDerivedField ? (
                                          // Display derived division name as read-only text
                                          <p className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700">
                                              {derivedDivisionName || 'N/A'}
                                          </p>
                                      ) : (
                                          // Allow manual selection if no parent
                                          <select
                                              id={`edit-${fieldName}`}
                                              name={fieldName}
                                              value={formData[fieldName] || ''}
                                              onChange={handleInputChange}
                                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                              disabled={loadingDropdowns || divisions.length === 0}
                                              required={!formData.parent}
                                          >
                                              <option value="">Select Division</option>
                                              {Array.isArray(divisions) && divisions.map(div => (
                                                  <option key={div.id} value={div.id}>{div.name}</option>
                                              ))}
                                          </select>
                                      )}
                                       {divisions.length === 0 && !loadingDropdowns && <p className="text-sm text-red-500 mt-1">No Divisions available.</p>}
                                  </div>
                              );
                          case 'sector_subdiv_type':
                               const derivedSectorSubdivName = isDerivedField ? getSectorSubdivTypeNameById(formData.sector_subdiv_type) : null;
                               return (
                                   <div key={fieldName}>
                                       <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Sector Subdivision Type</label>
                                       {isDerivedField ? (
                                            // Display derived type name as read-only text
                                            <p className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700">
                                                {derivedSectorSubdivName || 'N/A'}
                                            </p>
                                       ) : (
                                            // Allow manual selection if no parent and field is visible by rule
                                            <select
                                                id={`edit-${fieldName}`}
                                                name={fieldName}
                                                value={formData[fieldName] || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                                disabled={loadingDropdowns || sectorSubdivTypes.length === 0}
                                                required={isVisible && !formData.parent}
                                            >
                                                <option value="">Select Sector Subdivision Type</option>
                                                {Array.isArray(sectorSubdivTypes) && sectorSubdivTypes.map(type => (
                                                    <option key={type.id} value={type.id}>{type.name}</option>
                                                ))}
                                            </select>
                                       )}
                                        {sectorSubdivTypes.length === 0 && !loadingDropdowns && <p className="text-sm text-red-500 mt-1">No Sector Subdivision Types available.</p>}
                                   </div>
                               );
                          case 'subcity_subdiv_type':
                               const isDerivedSubcitySubdiv = isDerivedField;
                               const derivedSubcitySubdivName = isDerivedSubcitySubdiv ? getSubcitySubdivTypeNameById(formData.subcity_subdiv_type) : null;
                                return (
                                    <div key={fieldName}>
                                        <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Subcity Subdivision Type</label>
                                        {isDerivedSubcitySubdiv ? (
                                             // Display derived type name as read-only text
                                             <p className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700">
                                                 {derivedSubcitySubdivName || 'N/A'}
                                             </p>
                                        ) : (
                                             // Allow manual selection if no parent and field is visible by rule
                                             <select
                                                 id={`edit-${fieldName}`}
                                                 name={fieldName}
                                                 value={formData[fieldName] || ''}
                                                 onChange={handleInputChange}
                                                 className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                                 disabled={loadingDropdowns || subcitySubdivTypes.length === 0}
                                                 required={isVisible && !formData.parent}
                                             >
                                                 <option value="">Select Subcity Subdivision Type</option>
                                                 {Array.isArray(subcitySubdivTypes) && subcitySubdivTypes.map(type => (
                                                     <option key={type.id} value={type.id}>{type.name}</option>
                                                 ))}
                                             </select>
                                        )}
                                         {subcitySubdivTypes.length === 0 && !loadingDropdowns && <p className="text-sm text-red-500 mt-1">No Subcity Subdivision Types available.</p>}
                                    </div>
                                );
                          case 'subcity':
                               return (
                                   <div key={fieldName}>
                                       <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Subcity</label>
                                       <select
                                           id={`edit-${fieldName}`}
                                           name={fieldName}
                                           value={formData[fieldName] || ''}
                                           onChange={handleInputChange}
                                           className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                           disabled={loadingDropdowns || subcities.length === 0}
                                       >
                                           <option value="">Select Subcity (Optional)</option>
                                           {Array.isArray(subcities) && subcities.map(sub => (
                                               <option key={sub.id} value={sub.id}>{sub.name}</option>
                                           ))}
                                       </select>
                                        {subcities.length === 0 && !loadingDropdowns && <p className="text-sm text-red-500 mt-1">No Subcities available.</p>}
                                   </div>
                               );
                          case 'woreda':
                               return (
                                   <div key={fieldName}>
                                       <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 mb-1">Woreda</label>
                                       <select
                                           id={`edit-${fieldName}`}
                                           name={fieldName}
                                           value={formData[fieldName] || ''}
                                           onChange={handleInputChange}
                                           className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                                           disabled={loadingDropdowns || woredas.length === 0}
                                       >
                                           <option value="">Select Woreda (Optional)</option>
                                           {Array.isArray(woredas) && woredas.map(wor => (
                                               <option key={wor.id} value={wor.id}>{wor.name}</option>
                                           ))}
                                       </select>
                                        {woredas.length === 0 && !loadingDropdowns && <p className="text-sm text-red-500 mt-1">No Woredas available.</p>}
                                   </div>
                               );
                          default:
                              return null;
                      }
                   })}

                   <div className="flex justify-end space-x-4 mt-6">
                       <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow">Update</button>
                       <button type="button" onClick={handleEditCancel} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md">Cancel</button>
                   </div>
               </form>

                 )}
                {/* *** END OF EDIT FORM JSX *** */}
            </div>
        )}


      {/* Loading and Data Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            {/* ... thead and tbody (with expandable rows) ... */}
            <thead>
              <tr>
                {/* Displaying only the name column for now */}
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">Name</th>
                 <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(organizationalUnits) && organizationalUnits.map((unit) => (
                // Use fragment <> </> to group the main row and the expandable row
                <React.Fragment key={unit.id}>
                  <tr
                     className="hover:bg-gray-50 cursor-pointer" // Add hover effect and cursor pointer
                     onClick={() => handleRowClick(unit.id)} // Add click handler to the row
                  >
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                       {unit.name}
                        {/* Optional: Add an indicator for expanded state */}
                       <span className="ml-2 text-sm text-gray-500">
                           {expandedRowId === unit.id ? '▲' : '▼'}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-800">
                      <button
                        onClick={(e) => {
                           e.stopPropagation(); // Prevent row click when clicking button
                           handleEditClick(unit);
                        }}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow mr-2"
                      >
                        Edit
                      </button>
                      <button
                         onClick={(e) => {
                            e.stopPropagation(); // Prevent row click when clicking button
                            handleDeleteClick(unit.id);
                         }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {/* Expandable Row for Details */}
                  {expandedRowId === unit.id && (
                      <tr>
                          <td colSpan="2" className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                              {/* CONTENT OF THE EXPANDABLE DETAIL DIV using the helper function */}
                              <div className="p-4 bg-white rounded shadow-sm">
                                  <h4 className="text-lg font-semibold mb-4">Organizational Unit Details</h4>
                                  {/* Use the helper function to get details and map over them */}
                                  {getOrganizationalUnitDetailsToShow(unit).map((detail, index) => (
                                       <p key={index} className="mb-2 last:mb-0"><strong>{detail.label}:</strong> {detail.value}</p> // Added mb-2 for spacing
                                  ))}

                                  {/* TODO: Add logic to fetch/display nested Organizational Units if applicable (for hierarchy view) */}
                              </div>
                          </td>
                      </tr>
                  )}
                </React.Fragment>
              ))}
               {Array.isArray(organizationalUnits) && organizationalUnits.length === 0 && !loading && (
                 <tr>
                   <td colSpan="2" className="px-6 py-4 text-center text-gray-500">No organizational units found.</td>
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

export default OrganizationalUnitListPage;
