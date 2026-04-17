import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://shortelement.onrender.com';

const coursService = {
  // Récupérer tous les cours
  getAll: async () => {
    const response = await axios.get(`${API_URL}/cours`);
    return response.data;
  },

  // Récupérer un cours par ID
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/cours/${id}`);
    return response.data;
  },

  // Créer un cours (nécessite token)
  create: async (coursData, token) => {
    const response = await axios.post(`${API_URL}/cours`, coursData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Mettre à jour un cours (nécessite token admin)
  update: async (id, coursData, token) => {
    const response = await axios.put(`${API_URL}/cours/${id}`, coursData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Supprimer un cours (nécessite token admin)
  delete: async (id, token) => {
    const response = await axios.delete(`${API_URL}/cours/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Rechercher des cours
  search: async (query) => {
    const response = await axios.get(`${API_URL}/cours/recherche?q=${query}`);
    return response.data;
  }
};

export default coursService;