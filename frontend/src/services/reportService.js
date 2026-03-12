import axios from 'axios';

const BASE = '/api/v1/reports';

const reportService = {
    getDashboard: async () => {
        const res = await axios.get(`${BASE}/dashboard-metrics`);
        return res.data;
    },

    getSales: async (startDate, endDate) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const res = await axios.get(`${BASE}/sales`, { params });
        return res.data;
    },

    getProducts: async (startDate, endDate) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const res = await axios.get(`${BASE}/products`, { params });
        return res.data;
    },

    getFinancials: async (startDate, endDate) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const res = await axios.get(`${BASE}/financials`, { params });
        return res.data;
    },

    getInventory: async () => {
        const res = await axios.get(`${BASE}/inventory`);
        return res.data;
    }
};

export default reportService;
