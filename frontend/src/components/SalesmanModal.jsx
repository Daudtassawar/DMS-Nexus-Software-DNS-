import { useState, useEffect } from 'react';
import salesmanService from '../services/salesmanService';
import AppModal from './AppModal';
import AppInput from './AppInput';
import AppButton from './AppButton';
import { User, Target, Percent, MapPin, Phone } from 'lucide-react';

export default function SalesmanModal({ isOpen, onClose, salesman, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        area: '',
        commissionRate: 0,
        monthlyTarget: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (salesman) {
                setFormData({
                    name: salesman.name,
                    phone: salesman.phone || '',
                    area: salesman.area || '',
                    commissionRate: salesman.commissionRate || 0,
                    monthlyTarget: salesman.monthlyTarget || 0
                });
            } else {
                setFormData({ name: '', phone: '', area: '', commissionRate: 0, monthlyTarget: 0 });
            }
            setError('');
        }
    }, [salesman, isOpen]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        
        try {
            const payload = {
                ...formData,
                commissionRate: parseFloat(formData.commissionRate) || 0,
                monthlyTarget: parseFloat(formData.monthlyTarget) || 0
            };

            if (salesman) {
                await salesmanService.updateSalesman(salesman.salesmanId, { ...payload, salesmanId: salesman.salesmanId });
            } else {
                await salesmanService.createSalesman(payload);
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save salesman profile.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isEdit = !!salesman;

    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Update Personnel File' : 'New Sales Enlistment'}
            size="md"
            footer={
                <>
                    <AppButton variant="secondary" onClick={onClose} disabled={loading}>Discard</AppButton>
                    <AppButton onClick={handleSubmit} loading={loading}>
                        {isEdit ? 'Update Records' : 'Enlist Rep'}
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
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <User size={14}/> Identity & Territory
                    </h4>
                    <AppInput 
                        name="name"
                        label="Full Name" 
                        placeholder="e.g. Alice Smith" 
                        value={formData.name} 
                        onChange={handleChange}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[var(--text-main)]">Point of Contact</label>
                            <div className="relative">
                                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
                                <input 
                                    name="phone"
                                    placeholder="03xx-xxxxxxx"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[var(--text-main)]">Operational Area</label>
                            <div className="relative">
                                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
                                <input 
                                    name="area"
                                    placeholder="e.g. North Side"
                                    value={formData.area}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <Target size={14}/> Performance Objectives
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[var(--text-main)]">Monthly Target (Rs.)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">Rs.</span>
                                <input 
                                    name="monthlyTarget"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.monthlyTarget}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none font-bold text-primary"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[var(--text-main)]">Commission (%)</label>
                            <div className="relative">
                                <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
                                <input 
                                    name="commissionRate"
                                    type="number"
                                    step="0.1"
                                    placeholder="0.0"
                                    value={formData.commissionRate}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppModal>
    );
}
