// src/api.js
import axios from 'axios';

// Get the token from localStorage
const getToken = () => localStorage.getItem('token');

// Create an Axios instance with a base URL and token interceptor
const api = axios.create({
  baseURL: 'http://localhost:8000/api/employee-tracker', // Make sure this matches your Django backend URL
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// --- Sector Subdivision Type API Calls ---

export const getSectorSubdivisionTypes = (page = 1, pageSize = 10, searchTerm = '') => {
  return api.get('sector-subdivision-types/', {
    params: {
      page: page,
      page_size: pageSize,
      search: searchTerm, // Parameter name should match your Django SearchFilter
    },
  });
};

export const createSectorSubdivisionType = (name) => {
  return api.post('sector-subdivision-types/', { name });
};

export const updateSectorSubdivisionType = (id, name) => {
  return api.put(`sector-subdivision-types/${id}/`, { name }); // Use PUT for full update
  // Or PATCH if you only send the fields that changed: api.patch(`sector-subdivision-types/${id}/`, { name });
};

export const deleteSectorSubdivisionType = (id) => {
  return api.delete(`sector-subdivision-types/${id}/`);
};

// --- Subcity API Calls ---

export const getSubcities = (page = 1, pageSize = 10, searchTerm = '') => {
    return api.get('subcities/', {
      params: {
        page: page,
        page_size: pageSize,
        search: searchTerm, // Parameter name should match your Django SearchFilter
      },
    });
  };

  export const createSubcity = (name) => {
    return api.post('subcities/', { name });
  };

  export const updateSubcity = (id, name) => {
    return api.put(`subcities/${id}/`, { name }); // Use PUT for full update
  };

  export const deleteSubcity = (id) => {
    return api.delete(`subcities/${id}/`);
  };

  export const getAllSubcities = () => {
    // Assumes the backend endpoint '/api/employee-tracker/subcities/'
    // when called without pagination parameters, returns a simple array of all subcities.
    return api.get('subcities/');
  };

// --- Woreda API Calls ---

export const getWoredas = (page = 1, pageSize = 10, searchTerm = '') => {
  return api.get('woredas/', {
    params: {
      page: page,
      page_size: pageSize,
      search: searchTerm, // Parameter name should match your Django SearchFilter
    },
  });
};

export const createWoreda = (name, subcityId) => {
  // Assuming your backend expects the subcity foreign key as 'subcity' with its ID
  return api.post('woredas/', { name, subcity: subcityId });
};

export const updateWoreda = (id, name, subcityId) => {
   // Assuming your backend expects the subcity foreign key as 'subcity' with its ID
  return api.put(`woredas/${id}/`, { name, subcity: subcityId }); // Or PATCH
};

export const deleteWoreda = (id) => {
  return api.delete(`woredas/${id}/`);
};

export const getAllWoredas = () => {
    return api.get('woredas/'); // Fetch all for dropdowns
};

// --- Organizational Unit API Calls ---

export const getOrganizationalUnits = (page = 1, pageSize = 10, searchTerm = '') => {
  // The search term will be applied by the backend's SearchFilter across
  // name, division__name, sector_subdiv_type__name, subcity__name, woreda__name
  return api.get('organizational-units/', {
    params: {
      page: page,
      page_size: pageSize,
      search: searchTerm, // Parameter name should match your Django SearchFilter
    },
  });
};

// For creating and updating, you'll need to send the IDs of related FKs
export const createOrganizationalUnit = (formData) => {
  // formData should be an object like { name: '...', division: <id>, woreda: <id>, ... }
  return api.post('organizational-units/', formData);
};

export const updateOrganizationalUnit = (id, formData) => {
   // formData should be an object like { name: '...', division: <id>, woreda: <id>, ... }
  return api.put(`organizational-units/${id}/`, formData); // Or PATCH
};

export const deleteOrganizationalUnit = (id) => {
  return api.delete(`organizational-units/${id}/`);
};

// Add function to fetch ALL Organizational Units for the Parent dropdown
export const getAllOrganizationalUnits = () => {
    return api.get('organizational-units/'); // Fetch all for parent dropdown
};


// --- Add API calls for other models needed for dropdowns ---

export const getAllDivisions = () => {
    // Assuming your endpoint for Divisions is '/divisions/'
    return api.get('divisions/');
};

export const getAllSectorSubdivisionTypes = () => {
    // Assuming your endpoint for Sector Subdivision Types is '/sector-subdivision-types/'
    return api.get('sector-subdivision-types/');
};

export const getAllSubcitySubdivisionTypes = () => {
    // Assuming your endpoint for Subcity Subdivision Types is '/subcity-subdivision-types/'
    return api.get('subcity-subdivision-types/');
};


// Employee API functions
export const getEmployees = async (page = 1, pageSize = 10, search = '') => {
    return api.get('/employees/', {
        params: {
            page,
            page_size: pageSize,
            search
        }
    });
};

export const createEmployee = async (employeeData) => {
    return api.post('/employees/', employeeData);
};

export const updateEmployee = async (id, employeeData) => {
    return api.put(`/employees/${id}/`, employeeData);
};

export const deleteEmployee = async (id) => {
    return api.delete(`/employees/${id}/`);
};

export const getAllEmployeeRoles = async () => {
    return api.get('/employee-roles/');
};
