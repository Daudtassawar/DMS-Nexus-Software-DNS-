import axios from 'axios';

const BASE = '/api/v1/daily-operations';

const dailyOperationsService = {
    // Activities
    getActivities: () => axios.get(`${BASE}/activity`).then(r => r.data),
    logActivity: (activity) => axios.post(`${BASE}/activity`, activity).then(r => r.data),
    updateActivity: (id, activity) => axios.put(`${BASE}/activity/${id}`, activity).then(r => r.data),
    deleteActivity: (id) => axios.delete(`${BASE}/activity/${id}`).then(r => r.data),

    // Expenses
    getExpenses: () => axios.get(`${BASE}/expense`).then(r => r.data),
    recordExpense: (expense) => axios.post(`${BASE}/expense`, expense).then(r => r.data),
    updateExpense: (id, expense) => axios.put(`${BASE}/expense/${id}`, expense).then(r => r.data),
    deleteExpense: (id) => axios.delete(`${BASE}/expense/${id}`).then(r => r.data),

    // Aggregates
    getCashSummary: () => axios.get(`${BASE}/cash-summary`).then(r => r.data),
    getDailyReport: () => axios.get(`${BASE}/daily-report`).then(r => r.data)
};

export default dailyOperationsService;
