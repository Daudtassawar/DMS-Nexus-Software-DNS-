import axios from 'axios';

const BASE = '/api/audit-logs';

const auditLogService = {
    getLogs: async ({ userId, module, fromDate, toDate } = {}) => {
        const params = {};
        if (userId) params.userId = userId;
        if (module) params.module = module;
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        const res = await axios.get(BASE, { params });
        return res.data;
    }
};

export default auditLogService;
