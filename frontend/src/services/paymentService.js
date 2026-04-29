import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://10.100.8.199:5002/api/v1';

const paymentService = {
    getAll: async () => {
        const response = await axios.get(`${API_URL}/payments`);
        return response.data;
    },
    getByInvoiceId: async (invoiceId) => {
        const response = await axios.get(`${API_URL}/payments/invoice/${invoiceId}`);
        return response.data;
    },
    create: async (paymentData) => {
        const response = await axios.post(`${API_URL}/payments`, paymentData);
        return response.data;
    }
};

export default paymentService;
