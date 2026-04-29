import { useState, useEffect } from 'react';
import salesmanService from '../services/salesmanService';
import AppModal from './AppModal';
import AppInput from './AppInput';
import AppButton from './AppButton';
import { User, Phone, MapPin, DollarSign, Shield } from 'lucide-react';

export default function CustomerModal({ customer, onSave, onClose }) {
    const isEdit = Boolean(customer?.customerId);
    
    const [form, setForm] = useState({ customerName: '', phone: '', address: '', area: '', creditLimit: '0', salesmanId: '' });
    const [salesmen, setSalesmen] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        salesmanService.getSalesmen().then(data => setSalesmen(data || [])).catch(() => {});
    }, []);

    useEffect(() => {
        if (customer) {
            setForm({
                customerName: customer.customerName || '',
                phone: customer.phone || '',
                address: customer.address || '',
                area: customer.area || '',
                creditLimit: customer.creditLimit?.toString() || '0',
                salesmanId: customer.salesmanId || '',
            });
        }
    }, [customer]);

    const handleChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSaving(true);
        try {
            await onSave({
                ...(isEdit ? { customerId: customer.customerId } : {}),
                ...form,
                creditLimit: parseFloat(form.creditLimit) || 0,
                salesmanId: form.salesmanId ? parseInt(form.salesmanId) : null,
            });
        } catch (err) {
            setError(err.response?.data?.title || err.response?.data || 'Failed to save customer.');
        } finally { setSaving(false); }
    };

    return (
        <AppModal
            isOpen={true}
            onClose={onClose}
            title={isEdit ? 'Update Customer Profile' : 'Register New Customer'}
            size="md"
            footer={
                <>
                    <AppButton variant="secondary" onClick={onClose} disabled={saving}>Cancel</AppButton>
                    <AppButton onClick={handleSubmit} loading={saving}>
                        {isEdit ? 'Update Profile' : 'Add Customer'}
                    </AppButton>
                </>
            }
        >
            <div className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                        <User size={14}/> Identity & Contact
                    </h4>
                    <AppInput 
                        label="Customer Name" 
                        placeholder="e.g. Ahmed Khan" 
                        value={form.customerName} 
                        onChange={handleChange('customerName')}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <AppInput 
                            label="Phone Number" 
                            placeholder="03xx-xxxxxxx" 
                            value={form.phone} 
                            onChange={handleChange('phone')}
                            required
                        />
                        <AppInput 
                            label="Area" 
                            placeholder="e.g. Gulshan" 
                            value={form.area} 
                            onChange={handleChange('area')}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={14}/> Logistics
                  </h4>
                   <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-[var(--text-main)]">Assigned Salesman</label>
                        <select 
                            value={form.salesmanId} 
                            onChange={handleChange('salesmanId')}
                            className="w-full px-4 py-2.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                        >
                            <option value="">No Salesman Assigned</option>
                            {salesmen.map(s => (
                                <option key={s.salesmanId} value={s.salesmanId}>{s.name} ({s.area || 'General'})</option>
                            ))}
                        </select>
                    </div>
                    <AppInput 
                        label="Full Address" 
                        placeholder="Street, Building, landmark..." 
                        value={form.address} 
                        onChange={handleChange('address')}
                    />
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                        <Shield size={14}/> Financial Safeguard
                    </h4>
                    <AppInput 
                        label="Credit Limit (Rs.)" 
                        type="number" 
                        step="0.01" 
                        value={form.creditLimit} 
                        onChange={handleChange('creditLimit')}
                        helperText="Maximum allowed outstanding balance."
                    />
                </div>
            </div>
        </AppModal>
    );
}
