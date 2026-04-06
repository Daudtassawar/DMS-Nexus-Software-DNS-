import axios from 'axios';

const BASE = '/api/v1/products';

let productsCache = { data: null, timestamp: 0 };
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const clearCache = () => {
    productsCache = { data: null, timestamp: 0 };
};

const productService = {
    getAll: (params = {}) => {
        return axios.get(BASE, { params }).then(r => r.data);
    },

    search: (search, category, page = 1, pageSize = 20) =>
        axios.get(BASE, { params: { search, category, page, pageSize } }).then(r => r.data),

    getCategories: () => axios.get(`${BASE}/categories`).then(r => r.data),

    getById: (id) => axios.get(`${BASE}/${id}`).then(r => r.data),

    create: (product) => axios.post(BASE, product).then(r => {
        clearCache();
        return r.data;
    }),

    update: (id, product) => axios.put(`${BASE}/${id}`, product).then(r => {
        clearCache();
        return r.data;
    }),

    delete: (id) => axios.delete(`${BASE}/${id}`).then(r => {
        clearCache();
        return r;
    }),

    uploadImage: (id, file) => {
        const form = new FormData();
        form.append('file', file);
        return axios.post(`${BASE}/${id}/image`, form, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(r => {
            clearCache();
            return r.data;
        });
    },

    bulkImport: (file) => {
        const form = new FormData();
        form.append('file', file);
        return axios.post(`${BASE}/bulk-import`, form, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(r => {
            clearCache();
            return r.data;
        });
    },
};

export default productService;
