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
// Add API calls for other models here later (Subcity, Woreda, etc.)
// export const getSubcities = (...) => { ... };
// export const createSubcity = (...) => { ... };
// ... and so on for all your models.