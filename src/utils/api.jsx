import axios from 'axios';

// Define the base URL for your backend API.
const API_URL = import.meta.env.PORT ? import.meta.env.PORT : 'https://supply-link-backend.vercel.app/api';

// Create an axios instance with the base URL pre-configured.
const api = axios.create({
  baseURL: API_URL,
});

export const createUserInDb = (userData) => {
  // Makes a POST request to http://localhost:8001/api/users
  return api.post('/users', userData);
};

export const completeOnboarding = (data) => {
  // Makes a PUT request to http://localhost:8001/api/users/complete-onboarding
  return api.put('/users/complete-onboarding', data);
};

/**
 * Fetches the mock data (requirements and bids) from the backend.
 * @returns {Promise<Object>} A promise that resolves to the data from the API.
 */
export const fetchMockData = () => {
  // Makes a GET request to http://localhost:8001/api/mockData
  return api.get('/mockData');
};

/**
 * Fetches all requirements for a specific state.
 * @param {string} state - The state to fetch requirements for.
 * @returns {Promise<Object>} A promise that resolves to the requirements data.
 */
export const fetchRequirementsByState = (state) => {
  if (!state) {
    return Promise.resolve({ data: [] }); // Return empty if no state is provided
  }
  // Makes a GET request to http://localhost:8001/api/requirements/state/:state
  return api.get(`/requirements/state/${state}`);
};


export const postNewRequirement = (requirementData) => {
  // Makes a POST request to http://localhost:8001/api/requirements
  return api.post('/requirements', requirementData);
};

// Add a function to fetch requirements by the vendor's user ID
export const fetchRequirementsByVendor = (clerkUserId) => {
  if (!clerkUserId) return Promise.resolve({ data: [] });
  // You will need to create this backend route
  return api.get(`/requirements/vendor/${clerkUserId}`); 
};

// Add a function to update a requirement
export const updateRequirement = (id, requirementData) => {
  return api.put(`/requirements/${id}`, requirementData);
};

// Add a function to delete a requirement
export const deleteRequirement = (id) => {
  return api.delete(`/requirements/${id}`);
};

/**
 * Fetches all bids for a specific requirement.
 * @param {string} requirementId - The ID of the requirement.
 * @returns {Promise<Object>} A promise that resolves to the bids data.
 */
export const fetchBidsForRequirement = (requirementId) => {
  // Makes a GET request to http://localhost:8001/api/bids/requirement/:requirementId
  return api.get(`/bids/requirement/${requirementId}`);
};


export const fetchBidsByState = (state) => {
  if (!state) return Promise.resolve({ data: [] });
  return api.get(`/bids/state/${state}`);
};

/**
 * Posts a new bid to the backend.
 * @param {Object} bidData - The data for the new bid.
 * @returns {Promise<Object>} A promise that resolves to the newly created bid.
 */
export const postBid = (bidData) => {
  // Makes a POST request to http://localhost:8001/api/bids
  return api.post('/bids', bidData);
};

/**
 * Fetches all past deals with populated user names.
 * @returns {Promise<Object>} A promise that resolves to the past deals data.
 */
export const fetchPastDeals = () => {
  // Makes a GET request to http://localhost:8001/api/deals
  return api.get('/deals');
};

export default api;
