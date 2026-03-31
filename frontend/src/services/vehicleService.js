import axios from 'axios';

const BASE = '/api/v1/vehicles';

const vehicleService = {
    getAll: () => axios.get(BASE).then(r => r.data),
    getById: (id) => axios.get(`${BASE}/${id}`).then(r => r.data),
    create: (data) => axios.post(BASE, data).then(r => r.data),
    update: (id, data) => axios.put(`${BASE}/${id}`, data),
    delete: (id) => axios.delete(`${BASE}/${id}`),
};

export default vehicleService;
