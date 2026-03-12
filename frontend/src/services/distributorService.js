import axios from 'axios';

const BASE = '/api/distributors';

const distributorService = {
    getDistributors: async () => {
        const res = await axios.get(BASE);
        return res.data;
    },

    getDistributorById: async (id) => {
        const res = await axios.get(`${BASE}/${id}`);
        return res.data;
    },

    createDistributor: async (data) => {
        const res = await axios.post(BASE, data);
        return res.data;
    },

    updateDistributor: async (id, data) => {
        const res = await axios.put(`${BASE}/${id}`, { ...data, distributorId: id });
        return res.data;
    },

    deleteDistributor: async (id) => {
        if (!id) throw new Error("Distributor ID is required for deletion");
        await axios.delete(`${BASE}/${id}`);
    },

    getPerformance: async (id) => {
        const res = await axios.get(`${BASE}/${id}/performance`);
        return res.data;
    }
};

export default distributorService;
