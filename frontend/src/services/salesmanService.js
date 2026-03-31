import axios from 'axios';

const API_URL = '/api/v1/salesmen/';

const getSalesmen = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const getSalesman = async (id) => {
    const response = await axios.get(API_URL + id);
    return response.data;
};

const createSalesman = async (salesmanData) => {
    const response = await axios.post(API_URL, salesmanData);
    return response.data;
};

const updateSalesman = async (id, salesmanData) => {
    const response = await axios.put(API_URL + id, salesmanData);
    return response.data;
};

const deleteSalesman = async (id) => {
    const response = await axios.delete(API_URL + id);
    return response.data;
};

const getSalesmanPerformance = async (id, year, month) => {
    const response = await axios.get(`${API_URL}${id}/performance?year=${year}&month=${month}`);
    return response.data;
};

const assignCustomers = async (id, customerIds) => {
    const response = await axios.put(`${API_URL}${id}/customers`, customerIds);
    return response.data;
};

const salesmanService = {
    getSalesmen,
    getSalesman,
    createSalesman,
    updateSalesman,
    deleteSalesman,
    getSalesmanPerformance,
    assignCustomers
};

export default salesmanService;
