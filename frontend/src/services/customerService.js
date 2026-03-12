import axios from 'axios';

const BASE = '/api/v1/customers';

const customerService = {
    getAll: async (search = '') => {
        const params = search ? { search } : {};
        const res = await axios.get(BASE, { params });
        return res.data;
    },

    getById: async (id) => {
        const res = await axios.get(`${BASE}/${id}`);
        return res.data;
    },

    getHistory: async (id) => {
        const res = await axios.get(`${BASE}/${id}/history`);
        return res.data;
    },

    create: async (data) => {
        const res = await axios.post(BASE, data);
        return res.data;
    },

    update: async (id, data) => {
        const res = await axios.put(`${BASE}/${id}`, { ...data, customerId: id });
        return res.data;
    },

    delete: async (id) => {
        await axios.delete(`${BASE}/${id}`);
    },

    recordPayment: async (id, amount, note) => {
        const res = await axios.post(`${BASE}/${id}/payment`, { amount, note });
        return res.data;
    },
};

export default customerService;
