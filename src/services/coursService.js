import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

const coursService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/api/cours`);
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/api/cours/${id}`);
    return response.data;
  },

  create: async (coursData, token) => {
    const response = await axios.post(`${API_URL}/api/cours`, coursData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  update: async (id, coursData, token) => {
    const response = await axios.put(`${API_URL}/api/cours/${id}`, coursData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  delete: async (id, token) => {
    const response = await axios.delete(`${API_URL}/api/cours/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  search: async (query) => {
    const response = await axios.get(`${API_URL}/api/cours/recherche?q=${query}`);
    return response.data;
  }
};

export default coursService;