import axios from 'axios';

const BASE = '/api/v1/stock';

const stockService = {
    getOverview: async () => {
        const res = await axios.get(`${BASE}/overview`);
        return res.data;
    },

    getWarehouseBreakdown: async (productId) => {
        const res = await axios.get(`${BASE}/product/${productId}`);
        return res.data;
    },

    getTransactions: async (productId = null) => {
        const url = productId ? `${BASE}/transactions?productId=${productId}` : `${BASE}/transactions`;
        const res = await axios.get(url);
        return res.data;
    },

    addStock: async (productId, quantity, warehouseLocation, batchNumber = null, expiryDate = null) => {
        const res = await axios.post(`${BASE}/add`, { productId, quantity, warehouseLocation, batchNumber, expiryDate });
        return res.data;
    },

    reduceStock: async (productId, quantity, warehouseLocation, reason) => {
        const res = await axios.post(`${BASE}/reduce`, { productId, quantity, warehouseLocation, reason });
        return res.data;
    },

    adjustStock: async (productId, quantity, warehouseLocation) => {
        const res = await axios.post(`${BASE}/adjust`, { productId, quantity, warehouseLocation });
        return res.data;
    },

    transferStock: async (productId, quantity, fromWarehouse, toWarehouse) => {
        const res = await axios.post(`${BASE}/transfer`, { productId, quantity, fromWarehouse, toWarehouse });
        return res.data;
    }
};

export default stockService;
