import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CustomerSelector({ onSelectCustomer, selectedCustomerId }) {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        axios.get('/api/v1/customers')
            .then(res => setCustomers(res.data))
            .catch(err => console.error('Failed to load customers', err));
    }, []);

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
            <select
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCustomerId || ''}
                onChange={(e) => onSelectCustomer(e.target.value)}
                required
            >
                <option value="" disabled>-- Select a Customer --</option>
                {customers.map(c => (
                    <option key={c.customerId} value={c.customerId}>
                        {c.customerName} - {c.phone}
                    </option>
                ))}
            </select>
        </div>
    );
}
