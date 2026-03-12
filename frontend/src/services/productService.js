import axios from 'axios';

const BASE = '/api/v1/products';

const productService = {
    getAll: () => axios.get(BASE).then(r => r.data),

    search: (search, category) =>
        axios.get(BASE, { params: { search, category } }).then(r => r.data),

    getCategories: () => axios.get(`${BASE}/categories`).then(r => r.data),

    getById: (id) => axios.get(`${BASE}/${id}`).then(r => r.data),

    create: (product) => axios.post(BASE, product).then(r => r.data),

    update: (id, product) => axios.put(`${BASE}/${id}`, product).then(r => r.data),

    delete: (id) => axios.delete(`${BASE}/${id}`),

    uploadImage: (id, file) => {
        const form = new FormData();
        form.append('file', file);
        return axios.post(`${BASE}/${id}/image`, form, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(r => r.data);
    },

    bulkImport: (file) => {
        const form = new FormData();
        form.append('file', file);
        return axios.post(`${BASE}/bulk-import`, form, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(r => r.data);
    },
};

export default productService;
