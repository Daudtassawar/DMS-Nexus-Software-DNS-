import axios from 'axios';

const paymentService = {
    getAll: async () => {
        const response = await axios.get('/api/v1/payments');
        return response.data;
    },
    getByInvoiceId: async (invoiceId) => {
        const response = await axios.get(`/api/v1/payments/invoice/${invoiceId}`);
        return response.data;
    },
    create: async (paymentData) => {
        const response = await axios.post('/api/v1/payments', paymentData);
        return response.data;
    },
    createBulk: async (bulkData) => {
        const response = await axios.post('/api/v1/payments/bulk', bulkData);
        return response.data;
    }
};

export default paymentService;
