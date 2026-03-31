import { useState, useEffect } from 'react';
import vehicleService from '../services/vehicleService';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import AppInput from '../components/AppInput';
import AppModal from '../components/AppModal';
import { Truck, Plus, Edit3, Trash2, Search, RefreshCcw, CheckCircle, AlertCircle, Phone, User, Settings2 } from 'lucide-react';
import AppBadge from '../components/AppBadge';

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editVehicle, setEditVehicle] = useState(null);
    const [form, setForm] = useState({ vehicleNumber: '', driverName: '', driverPhone: '', vehicleType: 'Truck', isActive: true });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ type: '', msg: '' });

    const fetchVehicles = async () => {
        setLoading(true);
        try { 
            const data = await vehicleService.getAll(); 
            setVehicles(data || []); 
        } catch { 
            showToast('error', 'Failed to retrieve vehicle data.'); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchVehicles(); }, []);

    const showToast = (type, msg) => { 
        setToast({ type, msg }); 
        setTimeout(() => setToast({ type: '', msg: '' }), 3500); 
    };

    const displayed = vehicles.filter(v => {
        const q = search.toLowerCase();
        return !q || v.vehicleNumber?.toLowerCase().includes(q) || v.driverName?.toLowerCase().includes(q);
    });

    const openModal = (vehicle = null) => {
        setEditVehicle(vehicle);
        setForm(vehicle ? { 
            vehicleNumber: vehicle.vehicleNumber, 
            driverName: vehicle.driverName || '', 
            driverPhone: vehicle.driverPhone || '', 
            vehicleType: vehicle.vehicleType || 'Truck', 
            isActive: vehicle.isActive 
        } : { 
            vehicleNumber: '', 
            driverName: '', 
            driverPhone: '', 
            vehicleType: 'Truck', 
            isActive: true 
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.vehicleNumber.trim()) return;
        setSaving(true);
        try {
            if (editVehicle) { 
                await vehicleService.update(editVehicle.vehicleId, form); 
                showToast('success', 'Vehicle configuration updated.'); 
            } else { 
                await vehicleService.create(form); 
                showToast('success', 'Vehicle registered successfully.'); 
            }
            setModalOpen(false); 
            fetchVehicles();
        } catch { 
            showToast('error', 'Operation failed. Please check inputs.'); 
        } finally { 
            setSaving(false); 
        }
    };

    const handleDelete = async (v) => {
        if (!window.confirm(`Are you sure you want to delete vehicle "${v.vehicleNumber}"?`)) return;
        try { 
            await vehicleService.delete(v.vehicleId); 
            setVehicles(prev => prev.filter(x => x.vehicleId !== v.vehicleId)); 
            showToast('success', 'Vehicle record deleted.'); 
        } catch { 
            showToast('error', 'Failed to delete vehicle.'); 
        }
    };

    return (
        <div className="space-y-6 max-w-[1700px] mx-auto animate-fade-in pb-20">
            {toast.msg && (
                <div className={`fixed bottom-10 right-10 z-[1000] px-6 py-4 rounded-xl shadow-xl font-bold text-xs uppercase tracking-wider flex items-center gap-3 text-white border border-white/10 animate-slide-up ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}{toast.msg}
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)] shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Truck className="text-blue-600" size={24}/> Vehicle Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage transport fleet, driver assignments, and vehicle statuses.</p>
                </div>
                <AppButton onClick={() => openModal()} className="rounded-md">
                    <Plus size={18} className="mr-2"/> Add Vehicle
                </AppButton>
            </div>

            <AppCard p0 className="overflow-hidden shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-slate-50/50 border-b border-slate-200">
                    <div className="relative flex-1 w-full">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by number or driver..." 
                               className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <AppButton variant="secondary" onClick={fetchVehicles} className="rounded-md w-full md:w-auto">
                        <RefreshCcw size={16} className="mr-2"/> Sync
                    </AppButton>
                </div>
                
                <AppTable
                    headers={['Vehicle Information', 'Driver Details', 'Type', 'Status', 'Actions']}
                    data={displayed}
                    loading={loading}
                    renderRow={(v) => (
                        <>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center border border-slate-100 shadow-sm">
                                      <Truck size={20}/>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">{v.vehicleNumber}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">ID: {v.vehicleId}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <User size={12} className="text-slate-400"/>
                                        {v.driverName || 'Unassigned'}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                        <Phone size={10}/>
                                        {v.driverPhone || '—'}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <AppBadge variant="secondary" size="sm" className="rounded px-2 font-bold">{v.vehicleType}</AppBadge>
                            </td>
                            <td className="px-6 py-4">
                                <AppBadge variant={v.isActive ? 'success' : 'secondary'} size="sm" className="rounded px-2 font-bold" dot={false}>
                                    {v.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </AppBadge>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 justify-end">
                                    <button onClick={() => openModal(v)} className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all shadow-sm" title="Update Vehicle"><Edit3 size={16}/></button>
                                    <button onClick={() => handleDelete(v)} className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm" title="Delete Vehicle"><Trash2 size={16}/></button>
                                </div>
                            </td>
                        </>
                    )}
                />
            </AppCard>

            {modalOpen && (
                <AppModal isOpen={true} onClose={() => setModalOpen(false)} title={editVehicle ? 'Update Vehicle Record' : 'Register New Vehicle'} size="md"
                    footer={<><AppButton variant="secondary" onClick={() => setModalOpen(false)} disabled={saving} className="rounded-md">Cancel</AppButton><AppButton onClick={handleSave} loading={saving} className="rounded-md">Save Vehicle</AppButton></>}>
                    <div className="space-y-4 pt-2">
                        <AppInput label="Vehicle Registration No." placeholder="e.g. ABC-1234" value={form.vehicleNumber} onChange={e => setForm(f => ({...f, vehicleNumber: e.target.value}))} required className="rounded-md"/>
                        <AppInput label="Driver Name" placeholder="e.g. Shahid Khan" value={form.driverName} onChange={e => setForm(f => ({...f, driverName: e.target.value}))} className="rounded-md"/>
                        <AppInput label="Contact Number" placeholder="e.g. 0300-1234567" value={form.driverPhone} onChange={e => setForm(f => ({...f, driverPhone: e.target.value}))} className="rounded-md"/>
                        
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuration</label>
                            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <span className="text-xs font-bold text-slate-700">Vehicle Type</span>
                                    <select value={form.vehicleType} onChange={e => setForm(f => ({...f, vehicleType: e.target.value}))} 
                                            className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-500">
                                        {['Truck', 'Pickup', 'Van', 'Bike', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer mt-5 group">
                                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({...f, isActive: e.target.checked}))} 
                                           className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                                    <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Active / Operational</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </AppModal>
            )}
        </div>
    );
}
