import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1') + '/ai-context-assistant';

const aiAssistantService = {
    chat: async (question, currentPage) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/chat`, 
            { question, currentPage },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }
};

export default aiAssistantService;
