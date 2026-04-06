import axios from 'axios';

const BASE = '/api/v1/customers';

let customersCache = { data: null, timestamp: 0 };
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const clearCache = () => {
    customersCache = { data: null, timestamp: 0 };
};

const customerService = {
    getAll: async (params = {}) => {
        // We could still check if params is empty for caching, 
        // but for pagination we need to fetch fresh pages.
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
        clearCache();
        return res.data;
    },

    update: async (id, data) => {
        const res = await axios.put(`${BASE}/${id}`, { ...data, customerId: id });
        clearCache();
        return res.data;
    },

    delete: async (id) => {
        await axios.delete(`${BASE}/${id}`);
        clearCache();
    },

    recordPayment: async (id, amount, note) => {
        const res = await axios.post(`${BASE}/${id}/payment`, { amount, note });
        clearCache();
        return res.data;
    },
};

export default customerService;
