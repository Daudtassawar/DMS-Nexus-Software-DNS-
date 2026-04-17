import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const systemSettingsService = {
  getSettings: async () => {
    const response = await axios.get(`${API_URL}/SystemSettings`);
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await axios.put(`${API_URL}/SystemSettings`, settings);
    return response.data;
  }
};

export default systemSettingsService;
