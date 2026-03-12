import { useState, useEffect } from 'react';
import AppModal from './AppModal';
import AppInput from './AppInput';
import AppButton from './AppButton';
import { Truck, MapPin, Phone } from 'lucide-react';

export default function DistributorModal({ distributor, onSave, onClose }) {
    const isEdit = Boolean(distributor?.distributorId);
    const [form, setForm] = useState({ name: '', region: '', contact: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (distributor) {
            setForm({
                name: distributor.name || '',
                region: distributor.region || '',
                contact: distributor.contact || '',
            });
        }
    }, [distributor]);

    const handleChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSaving(true);
        try {
            await onSave({
                ...(isEdit ? { distributorId: distributor.distributorId } : {}),
                ...form
            });
        } catch (err) {
            setError(err.response?.data?.title || err.response?.data || 'Failed to register partner.');
        } finally { setSaving(false); }
    };

    return (
        <AppModal
            isOpen={true}
            onClose={onClose}
            title={isEdit ? 'Corporate Data Correction' : 'Logistic Node Enlistment'}
            size="md"
            footer={
                <>
                    <AppButton variant="secondary" onClick={onClose} disabled={saving}>Cancel</AppButton>
                    <AppButton onClick={handleSubmit} loading={saving}>
                        {isEdit ? 'Correct File' : 'Onboard Partner'}
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
                      <Truck size={14}/> Supply Identity
                  </h4>
                  <AppInput 
                      label="Distributor / Company Name" 
                      placeholder="e.g. Globex Fulfillment" 
                      value={form.name} 
                      onChange={handleChange('name')}
                      required
                  />
                  <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-semibold text-[var(--text-main)]">Operational Region</label>
                          <div className="relative">
                            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
                            <input 
                              placeholder="e.g. South Sector"
                              value={form.region}
                              onChange={handleChange('region')}
                              required
                              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none font-bold"
                            />
                          </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-semibold text-[var(--text-main)]">Dispatch POC</label>
                          <div className="relative">
                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
                            <input 
                              placeholder="Phone / Radio Handle"
                              value={form.contact}
                              onChange={handleChange('contact')}
                              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>
                      </div>
                  </div>
                </div>
            </div>
        </AppModal>
    );
}
