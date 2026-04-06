import axios from 'axios';

const BASE = '/api/v1/invoices';

const invoiceService = {
    getAll: async (params = {}) => {
        const res = await axios.get(BASE, { params });
        return res.data;
    },

    getById: async (id) => {
        const res = await axios.get(`${BASE}/${id}`);
        return res.data;
    },

    create: async (data) => {
        const res = await axios.post(BASE, data);
        return res.data;
    },

    update: async (id, data) => {
        const res = await axios.put(`${BASE}/${id}`, data);
        return res.data;
    },

    delete: async (id) => {
        await axios.delete(`${BASE}/${id}`);
    },

    patchStatus: async (id, status) => {
        await axios.patch(`${BASE}/${id}/status`, { status });
    }
};

export default invoiceService;
