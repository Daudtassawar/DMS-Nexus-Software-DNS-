import axios from 'axios';

const BASE = '/api/v1/reports';

let dashboardCache = { data: null, timestamp: 0 };
const DASHBOARD_CACHE_DURATION = 60 * 1000; // 1 minute

const reportService = {
    getDashboard: async () => {
        if (dashboardCache.data && (Date.now() - dashboardCache.timestamp) < DASHBOARD_CACHE_DURATION) {
            return dashboardCache.data;
        }
        const res = await axios.get(`${BASE}/dashboard-metrics`);
        dashboardCache.data = res.data;
        dashboardCache.timestamp = Date.now();
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
    },
    
    getSalesmanAnalysis: async (range) => {
        const res = await axios.get(`${BASE}/salesman-analysis`, { params: { range } });
        return res.data;
    }
};

export default reportService;
