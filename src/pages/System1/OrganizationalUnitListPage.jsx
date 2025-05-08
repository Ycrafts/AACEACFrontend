// src/pages/System1/OrganizationalUnitListPage.jsx
import React, { useState, useEffect } from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
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
      // Case when parent is selected
      const parentDivisionName = selectedParent.division_name;

      if (parentDivisionName === "Subcity") {
          // If parent's division is Subcity, show subcity_subdiv_type and woreda
          fieldsToShow.subcity_subdiv_type = true;
          fieldsToShow.woreda = true;
      } else if (parentDivisionName === "Sector Office") {
          // If parent's division is Sector Office
          if (!selectedParent.parent) {
              // If parent has no parent, show subcity
              fieldsToShow.subcity = true;
          } else {
              // If parent has a parent, show woreda
              fieldsToShow.woreda = true;
          }
      }
  } else {
      // Case when no parent is selected
      fieldsToShow.division = true;

      // Get the name of the selected division
      const selectedDivisionName = formData.division ?
          (divisions.find(div => div.id === parseInt(formData.division))?.name || null)
          : null;

      if (selectedDivisionName) {
          if (selectedDivisionName === "Subcity") {
              fieldsToShow.subcity = true;
          } else if (selectedDivisionName === "Sector Office") {
              fieldsToShow.sector_subdiv_type = true;
          }
          // For College and Hospital, no additional fields are shown
      }
  }

  return fieldsToShow;
};

// Add the ParentSelectionModal component
const ParentSelectionModal = ({ 
    isOpen, 
    onClose, 
    onSelect, 
    organizationalUnits, 
    loading, 
    error,
    currentPage,
    totalPages,
    onPageChange,
    searchTerm,
    onSearchChange
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl transition-colors duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Select Parent Organizational Unit</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors duration-200"
                    >
                        ✕
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search organizational units..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-4 text-slate-500 dark:text-slate-300">
                        <p>Loading organizational units...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-red-500 dark:text-red-300 text-center py-4">
                        <p>{error}</p>
                    </div>
                )}

                {/* No Parent Option */}
                <div
                    className="p-3 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors duration-150 bg-white dark:bg-slate-800 mb-2"
                    onClick={() => onSelect({ id: null, name: 'No Parent' })}
                >
                    <div className="font-medium text-slate-800 dark:text-slate-100">No Parent</div>
                </div>

                {/* Organizational Units List */}
                {!loading && !error && (
                    <div className="space-y-2">
                        {organizationalUnits.map(unit => (
                            <div
                                key={unit.id}
                                className="p-3 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors duration-150 bg-white dark:bg-slate-800"
                                onClick={() => onSelect(unit)}
                            >
                                <div className="font-medium text-slate-800 dark:text-slate-100">{unit.name}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    Division: {unit.division_name}
                                    {unit.parent_name && ` | Parent: ${unit.parent_name}`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Add helper functions for getting subdivision type names
const getSectorSubdivTypeNameById = (id, sectorSubdivTypes) => {
    if (!id) return null;
    const type = sectorSubdivTypes.find(type => type.id === parseInt(id));
    return type ? type.name : null;
};

const getSubcitySubdivTypeNameById = (id, subcitySubdivTypes) => {
    if (!id) return null;
    const type = subcitySubdivTypes.find(type => type.id === parseInt(id));
    return type ? type.name : null;
};

// Add a helper function to fetch all pages of woredas
const fetchAllWoredas = async () => {
    let allWoredas = [];
    let currentPage = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
        try {
            const response = await getAllWoredas(currentPage, 100); // Increased page size to 100
            const data = response.data;
            
            if (data.results) {
                allWoredas = [...allWoredas, ...data.results];
            }
            
            // Check if there are more pages
            hasMorePages = !!data.next;
            currentPage++;
        } catch (error) {
            console.error('Error fetching woredas page:', error);
            break;
        }
    }
    
    console.log('Total woredas fetched:', allWoredas.length);
    return allWoredas;
};

// Update the fetchDropdownData function
const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
        // Fetch data for all dropdowns concurrently
        const [
            divisionsRes,
            sectorSubdivTypesRes,
            subcitySubdivTypesRes,
            organizationalUnitsRes,
            subcitiesRes,
            woredasRes,
        ] = await Promise.all([
            getAllDivisions(),
            getAllSectorSubdivisionTypes(),
            getAllSubcitySubdivisionTypes(),
            getAllOrganizationalUnits(),
            getAllSubcities(),
            getAllWoredas(1, 1000), // Request a large page size to get all woredas at once
        ]);

        // Set all the data
        setDivisions(divisionsRes.data || []);
        setSectorSubdivTypes(sectorSubdivTypesRes.data || []);
        setSubcitySubdivTypes(subcitySubdivTypesRes.data || []);
        setSubcities(subcitiesRes.data || []);
        
        // Handle woredas data - support both paginated and non-paginated responses
        if (woredasRes.data) {
            // Check if the response is paginated (has results property)
            const woredasData = woredasRes.data.results || woredasRes.data;
            if (Array.isArray(woredasData)) {
                console.log('Setting woredas:', woredasData.length);
                setWoredas(woredasData);
            } else {
                console.error("Invalid woredas data format:", woredasData);
                setWoredas([]);
            }
        } else {
            console.error("No woredas data in response:", woredasRes);
            setWoredas([]);
        }

        // Handle organizational units
        if (organizationalUnitsRes.data && organizationalUnitsRes.data.results) {
            const allOrganizationalUnits = organizationalUnitsRes.data.results;
            const potentialParents = allOrganizationalUnits.filter(unit =>
                unit.id !== (currentEditItem ? currentEditItem.id : null)
            );
            setParentOrganizationalUnits(potentialParents);
        } else {
            console.error("Unexpected organizational units response format:", organizationalUnitsRes.data);
            setParentOrganizationalUnits([]);
        }

    } catch (err) {
        console.error("Failed to fetch dropdown data:", err);
        setError("Failed to load necessary data for the form. Please try again.");
        setTimeout(() => setError(null), 10000);
    } finally {
        setLoadingDropdowns(false);
    }
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

  // Modify the parent units state and fetching
  const [showParentModal, setShowParentModal] = useState(false);
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [parentCurrentPage, setParentCurrentPage] = useState(1);
  const [parentPageSize] = useState(10);
  const [parentTotalPages, setParentTotalPages] = useState(1);
  const [parentUnits, setParentUnits] = useState([]);
  const [loadingParentUnits, setLoadingParentUnits] = useState(false);


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

  // Update the fetchDropdownData function
  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
        // Fetch data for all dropdowns concurrently
        const [
            divisionsRes,
            sectorSubdivTypesRes,
            subcitySubdivTypesRes,
            organizationalUnitsRes,
            subcitiesRes,
            woredasRes,
        ] = await Promise.all([
            getAllDivisions(),
            getAllSectorSubdivisionTypes(),
            getAllSubcitySubdivisionTypes(),
            getAllOrganizationalUnits(),
            getAllSubcities(),
            getAllWoredas(1, 1000), // Request a large page size to get all woredas at once
        ]);

        // Set all the data
        setDivisions(divisionsRes.data || []);
        setSectorSubdivTypes(sectorSubdivTypesRes.data || []);
        setSubcitySubdivTypes(subcitySubdivTypesRes.data || []);
        setSubcities(subcitiesRes.data || []);
        
        // Handle woredas data - support both paginated and non-paginated responses
        if (woredasRes.data) {
            // Check if the response is paginated (has results property)
            const woredasData = woredasRes.data.results || woredasRes.data;
            if (Array.isArray(woredasData)) {
                console.log('Setting woredas:', woredasData.length);
                setWoredas(woredasData);
            } else {
                console.error("Invalid woredas data format:", woredasData);
                setWoredas([]);
            }
        } else {
            console.error("No woredas data in response:", woredasRes);
            setWoredas([]);
        }

        // Handle organizational units
        if (organizationalUnitsRes.data && organizationalUnitsRes.data.results) {
            const allOrganizationalUnits = organizationalUnitsRes.data.results;
            const potentialParents = allOrganizationalUnits.filter(unit =>
                unit.id !== (currentEditItem ? currentEditItem.id : null)
            );
            setParentOrganizationalUnits(potentialParents);
        } else {
            console.error("Unexpected organizational units response format:", organizationalUnitsRes.data);
            setParentOrganizationalUnits([]);
        }

    } catch (err) {
        console.error("Failed to fetch dropdown data:", err);
        setError("Failed to load necessary data for the form. Please try again.");
        setTimeout(() => setError(null), 10000);
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
           const response = await createOrganizationalUnit(formData);
           setShowCreateForm(false);
           
           // Refresh both the main list and the parent units list
           await Promise.all([
               fetchOrganizationalUnits(currentPage, pageSize, debouncedSearchTerm),
               fetchDropdownData() // This will refresh parentOrganizationalUnits
           ]);
           
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

  // Modify the handleParentSelect function to set all derived fields
  const handleParentSelect = (unit) => {
      setFormData(prev => ({
          ...prev,
          parent: unit.id,
          parent_name: unit.name,
          // Set division from parent
          division: unit.division || null,
          // Set subdivision types if they exist
          sector_subdiv_type: unit.sector_subdiv_type || null,
          subcity_subdiv_type: unit.subcity_subdiv_type || null,
          // Set location fields if they exist
          subcity: unit.subcity || null,
          woreda: unit.woreda || null
      }));
      setShowParentModal(false);
  };

  // Modify the fetchParentUnits function to filter out organizational units that have grandparents
  const fetchParentUnits = async (page, size, search) => {
      setLoadingParentUnits(true);
      try {
          const response = await getOrganizationalUnits(page, size, search);
          const allUnits = response.data.results;
          // Filter out Hospital and College divisions AND units that have grandparents
          const filteredUnits = allUnits.filter(unit => {
              if (unit.division_name === "Hospital" || unit.division_name === "College") {
                  return false;
              }
              if (unit.parent) {
                  // Find the parent unit
                  const parentUnit = allUnits.find(u => u.id === unit.parent);
                  // If the parent unit exists and it has a parent, this unit has a grandparent
                  if (parentUnit && parentUnit.parent) {
                      return false;
                  }
              }
              return true;
          });
          setParentUnits(filteredUnits);
          setParentTotalPages(Math.ceil(filteredUnits.length / parentPageSize));
      } catch (err) {
          console.error("Error fetching parent units:", err);
          setError("Failed to fetch parent organizational units.");
      } finally {
          setLoadingParentUnits(false);
      }
  };

  // Modify the effect to use the new fetch function
  useEffect(() => {
      if (showParentModal) {
          fetchParentUnits(parentCurrentPage, parentPageSize, parentSearchTerm);
      }
  }, [showParentModal, parentCurrentPage, parentSearchTerm]);

  // Add handler for parent search
  const handleParentSearch = (value) => {
      setParentSearchTerm(value);
      setParentCurrentPage(1); // Reset to first page on new search
  };

  // Update the getFilteredWoredas function to add more logging
  const getFilteredWoredas = (subcityId) => {
      console.log('Filtering woredas for subcity:', subcityId);
      console.log('Total woredas available:', woredas.length);
      
      // Ensure woredas is an array
      if (!Array.isArray(woredas)) {
          console.error("Woredas is not an array:", woredas);
          return [];
      }
      
      // If no subcity is selected, return all woredas
      if (!subcityId) {
          return woredas;
      }

      // Convert subcityId to number for comparison
      const numericSubcityId = parseInt(subcityId);
      console.log('Looking for woredas with subcity ID:', numericSubcityId);
      
      // Filter woredas where subcity matches the selected subcity
      const filtered = woredas.filter(woreda => {
          if (!woreda || woreda.subcity === undefined) {
              console.warn('Invalid woreda object:', woreda);
              return false;
          }
          const woredaSubcityId = parseInt(woreda.subcity);
          const matches = woredaSubcityId === numericSubcityId;
          if (matches) {
              console.log('Found matching woreda:', woreda.name);
          }
          return matches;
      });

      console.log('Filtered woredas count:', filtered.length);
      return filtered;
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Organizational Units</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, division, subcity, woreda..."
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
            Add New Organizational Unit
          </button>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Add New Organizational Unit</h3>
            {loadingDropdowns ? (
              <p className="text-slate-500 dark:text-slate-400">Loading form data...</p>
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
                                    <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Name</label>
                                    <input
                                        id={`create-${fieldName}`}
                                        type="text"
                                        name={fieldName}
                                        value={formData[fieldName]}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                        required
                                    />
                                </div>
                            );
                        case 'required_employees_no':
                             return (
                                 <div key={fieldName}>
                                     <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Required Employees No.</label>
                                     <input
                                         id={`create-${fieldName}`}
                                         type="number"
                                         name={fieldName}
                                         value={formData[fieldName] || ''}
                                         onChange={handleInputChange}
                                         className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                         min="0"
                                     />
                                 </div>
                             );
                        case 'parent':
                             return (
                                 <div key={fieldName}>
                                     <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Parent Organizational Unit</label>
                                     <div className="relative">
                                         <input
                                             type="text"
                                             value={formData.parent ? 
                                                 (parentOrganizationalUnits.find(u => u.id === parseInt(formData.parent))?.name || 'No Parent') 
                                                 : 'No Parent'}
                                             readOnly
                                             className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100"
                                             onClick={() => setShowParentModal(true)}
                                             placeholder="Click to select parent organizational unit"
                                         />
                                         <div 
                                             className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                                             onClick={() => setShowParentModal(true)}
                                         >
                                             <svg className="h-5 w-5 text-gray-400 dark:text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                 <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                             </svg>
                                         </div>
                                     </div>
                                 </div>
                             );
                        case 'division':
                            // This field is derived if parent is selected, manual otherwise
                            const derivedDivisionName = isDerivedField ? getDivisionNameById(formData.division) : null;
                            return (
                                <div key={fieldName}>
                                    <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Division</label>
                                    {isDerivedField ? (
                                        // Display derived division name as read-only text
                                        <p className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100">
                                            {derivedDivisionName || 'N/A'}
                                        </p>
                                    ) : (
                                        // Allow manual selection if no parent
                                        <select
                                            id={`create-${fieldName}`}
                                            name={fieldName}
                                            value={formData[fieldName] || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
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
                             const derivedSectorSubdivName = isDerivedField ? getSectorSubdivTypeNameById(formData.sector_subdiv_type, sectorSubdivTypes) : null;
                             return (
                                 <div key={fieldName}>
                                     <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Sector Subdivision Type</label>
                                     {isDerivedField ? (
                                          // Display derived type name as read-only text
                                          <p className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100">
                                              {derivedSectorSubdivName || 'N/A'}
                                          </p>
                                     ) : (
                                          // Allow manual selection if no parent and field is visible by rule
                                          <select
                                              id={`create-${fieldName}`}
                                              name={fieldName}
                                              value={formData[fieldName] || ''}
                                              onChange={handleInputChange}
                                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
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
                             const isDerivedSubcitySubdiv = isDerivedField;
                             const derivedSubcitySubdivName = isDerivedSubcitySubdiv ? getSubcitySubdivTypeNameById(formData.subcity_subdiv_type, subcitySubdivTypes) : null;
                              return (
                                  <div key={fieldName}>
                                      <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Subcity Subdivision Type</label>
                                      {isDerivedSubcitySubdiv ? (
                                           // Display derived type name as read-only text
                                           <p className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100">
                                               {derivedSubcitySubdivName || 'N/A'}
                                           </p>
                                      ) : (
                                           // Allow manual selection if no parent and field is visible by rule
                                           <select
                                               id={`create-${fieldName}`}
                                               name={fieldName}
                                               value={formData[fieldName] || ''}
                                               onChange={handleInputChange}
                                               className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
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
                                     <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Subcity</label>
                                     <select
                                         id={`create-${fieldName}`}
                                         name={fieldName}
                                         value={formData[fieldName] || ''}
                                         onChange={handleInputChange}
                                         className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
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
                             const filteredWoredas = getFilteredWoredas(formData.subcity);
                             console.log("Rendering woreda field with filtered woredas:", filteredWoredas);
                             return (
                                 <div key={fieldName}>
                                     <label htmlFor={`create-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Woreda</label>
                                     <select
                                         id={`create-${fieldName}`}
                                         name={fieldName}
                                         value={formData[fieldName] || ''}
                                         onChange={handleInputChange}
                                         className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                         disabled={loadingDropdowns || filteredWoredas.length === 0}
                                     >
                                         <option value="">Select Woreda (Optional)</option>
                                         {Array.isArray(filteredWoredas) && filteredWoredas.map(wor => (
                                             <option key={wor.id} value={wor.id}>{wor.name}</option>
                                         ))}
                                     </select>
                                      {filteredWoredas.length === 0 && !loadingDropdowns && (
                                          <p className="text-sm text-gray-500 mt-1">
                                              {formData.subcity ? 
                                                  `No Woredas available for selected Subcity (ID: ${formData.subcity})` : 
                                                  "Please select a Subcity first."}
                                          </p>
                                      )}
                                 </div>
                             );
                        default:
                            return null;
                    }
                })}

                <div className="flex justify-end space-x-4 mt-6">
                    <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200">Save</button>
                    <button type="button" onClick={handleCreateCancel} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors duration-200">Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Edit Form */}
        {showEditForm && currentEditItem && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Edit Organizational Unit</h3>
            {loadingDropdowns ? (
              <p className="text-slate-500 dark:text-slate-400">Loading form data...</p>
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
                                    <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Name</label>
                                    <input
                                        id={`edit-${fieldName}`}
                                        type="text"
                                        name={fieldName}
                                        value={formData[fieldName]}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                        required
                                    />
                                </div>
                            );
                        case 'required_employees_no':
                             return (
                                 <div key={fieldName}>
                                     <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Required Employees No.</label>
                                     <input
                                         id={`edit-${fieldName}`}
                                         type="number"
                                         name={fieldName}
                                         value={formData[fieldName] || ''}
                                         onChange={handleInputChange}
                                         className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                         min="0"
                                     />
                                 </div>
                             );
                        case 'parent':
                             return (
                                 <div key={fieldName}>
                                     <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Parent Organizational Unit</label>
                                     <div className="relative">
                                         <input
                                             type="text"
                                             value={formData.parent ? 
                                                 (parentOrganizationalUnits.find(u => u.id === parseInt(formData.parent))?.name || 'No Parent') 
                                                 : 'No Parent'}
                                             readOnly
                                             className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100"
                                             onClick={() => setShowParentModal(true)}
                                             placeholder="Click to select parent organizational unit"
                                         />
                                         <div 
                                             className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                                             onClick={() => setShowParentModal(true)}
                                         >
                                             <svg className="h-5 w-5 text-gray-400 dark:text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                 <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                             </svg>
                                         </div>
                                     </div>
                                 </div>
                             );
                        case 'division':
                            const derivedDivisionName = isDerivedField ? getDivisionNameById(formData.division) : null;
                            return (
                                <div key={fieldName}>
                                    <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Division</label>
                                    {isDerivedField ? (
                                        // Display derived division name as read-only text
                                        <p className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100">
                                            {derivedDivisionName || 'N/A'}
                                        </p>
                                    ) : (
                                        // Allow manual selection if no parent
                                        <select
                                            id={`edit-${fieldName}`}
                                            name={fieldName}
                                            value={formData[fieldName] || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
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
                             const derivedSectorSubdivName = isDerivedField ? getSectorSubdivTypeNameById(formData.sector_subdiv_type, sectorSubdivTypes) : null;
                             return (
                                 <div key={fieldName}>
                                     <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Sector Subdivision Type</label>
                                     {isDerivedField ? (
                                          // Display derived type name as read-only text
                                          <p className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100">
                                              {derivedSectorSubdivName || 'N/A'}
                                          </p>
                                     ) : (
                                          // Allow manual selection if no parent and field is visible by rule
                                          <select
                                              id={`edit-${fieldName}`}
                                              name={fieldName}
                                              value={formData[fieldName] || ''}
                                              onChange={handleInputChange}
                                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
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
                             const derivedSubcitySubdivName = isDerivedSubcitySubdiv ? getSubcitySubdivTypeNameById(formData.subcity_subdiv_type, subcitySubdivTypes) : null;
                              return (
                                  <div key={fieldName}>
                                      <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Subcity Subdivision Type</label>
                                      {isDerivedSubcitySubdiv ? (
                                           // Display derived type name as read-only text
                                           <p className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100">
                                               {derivedSubcitySubdivName || 'N/A'}
                                           </p>
                                      ) : (
                                           // Allow manual selection if no parent and field is visible by rule
                                           <select
                                               id={`edit-${fieldName}`}
                                               name={fieldName}
                                               value={formData[fieldName] || ''}
                                               onChange={handleInputChange}
                                               className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
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
                                     <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Subcity</label>
                                     <select
                                         id={`edit-${fieldName}`}
                                         name={fieldName}
                                         value={formData[fieldName] || ''}
                                         onChange={handleInputChange}
                                         className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
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
                             const editFilteredWoredas = getFilteredWoredas(formData.subcity);
                             return (
                                 <div key={fieldName}>
                                     <label htmlFor={`edit-${fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">Woreda</label>
                                     <select
                                         id={`edit-${fieldName}`}
                                         name={fieldName}
                                         value={formData[fieldName] || ''}
                                         onChange={handleInputChange}
                                         className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                         disabled={loadingDropdowns || editFilteredWoredas.length === 0}
                                     >
                                         <option value="">Select Woreda (Optional)</option>
                                         {Array.isArray(editFilteredWoredas) && editFilteredWoredas.map(wor => (
                                             <option key={wor.id} value={wor.id}>{wor.name}</option>
                                         ))}
                                     </select>
                                      {editFilteredWoredas.length === 0 && !loadingDropdowns && <p className="text-sm text-gray-500 mt-1">No Woredas available for selected Subcity.</p>}
                                 </div>
                             );
                        default:
                            return null;
                    }
                })}

                <div className="flex justify-end space-x-4 mt-6">
                    <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200">Update</button>
                    <button type="button" onClick={handleEditCancel} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors duration-200">Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Loading and Data Table */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">Loading organizational units...</p>
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {Array.isArray(organizationalUnits) && organizationalUnits.map((unit) => (
                  <React.Fragment key={unit.id}>
                    <tr
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors duration-200"
                      onClick={() => handleRowClick(unit.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                        {unit.name}
                        <span className="ml-2 text-slate-500 dark:text-slate-400">
                          {expandedRowId === unit.id ? '▲' : '▼'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(unit);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(unit.id);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRowId === unit.id && (
                      <tr>
                        <td colSpan="2" className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                          <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Organizational Unit Details</h4>
                            {getOrganizationalUnitDetailsToShow(unit).map((detail, index) => (
                              <p key={index} className="mb-2 last:mb-0 text-slate-700 dark:text-slate-100">
                                <span className="font-medium text-slate-900 dark:text-slate-100">{detail.label}:</span> {detail.value}
                              </p>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {Array.isArray(organizationalUnits) && organizationalUnits.length === 0 && !loading && (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                      No organizational units found.
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

        {/* Parent Selection Modal */}
        <ParentSelectionModal
          isOpen={showParentModal}
          onClose={() => setShowParentModal(false)}
          onSelect={handleParentSelect}
          organizationalUnits={parentUnits}
          loading={loadingParentUnits}
          error={error}
          currentPage={parentCurrentPage}
          totalPages={parentTotalPages}
          onPageChange={setParentCurrentPage}
          searchTerm={parentSearchTerm}
          onSearchChange={handleParentSearch}
        />
      </div>
    </div>
  );
}

export default OrganizationalUnitListPage;
