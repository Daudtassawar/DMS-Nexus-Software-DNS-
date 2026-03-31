import { useState, useEffect } from 'react';
import routeService from '../services/routeService';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import AppInput from '../components/AppInput';
import AppModal from '../components/AppModal';
import { MapPin, Plus, Edit3, Trash2, Search, RefreshCcw, CheckCircle, AlertCircle, Map, Globe, Info } from 'lucide-react';
import AppBadge from '../components/AppBadge';

export default function Routes() {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editRoute, setEditRoute] = useState(null);
    const [form, setForm] = useState({ routeName: '', area: '', description: '', isActive: true });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ type: '', msg: '' });

    const fetchRoutes = async () => {
        setLoading(true);
        try { 
            const data = await routeService.getAll(); 
            setRoutes(data || []); 
        } catch { 
            showToast('error', 'Failed to retrieve delivery routes.'); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchRoutes(); }, []);

    const showToast = (type, msg) => { 
        setToast({ type, msg }); 
        setTimeout(() => setToast({ type: '', msg: '' }), 3500); 
    };

    const displayed = routes.filter(r => {
        const q = search.toLowerCase();
        return !q || r.routeName?.toLowerCase().includes(q) || r.area?.toLowerCase().includes(q);
    });

    const openModal = (route = null) => {
        setEditRoute(route);
        setForm(route ? { 
            routeName: route.routeName, 
            area: route.area || '', 
            description: route.description || '', 
            isActive: route.isActive 
        } : { 
            routeName: '', 
            area: '', 
            description: '', 
            isActive: true 
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.routeName.trim()) return;
        setSaving(true);
        try {
            if (editRoute) { 
                await routeService.update(editRoute.routeId, form); 
                showToast('success', 'Route definition updated successfully.'); 
            } else { 
                await routeService.create(form); 
                showToast('success', 'New delivery route defined.'); 
            }
            setModalOpen(false); 
            fetchRoutes();
        } catch { 
            showToast('error', 'Operation failed. Please verify route details.'); 
        } finally { 
            setSaving(false); 
        }
    };

    const handleDelete = async (r) => {
        if (!window.confirm(`Are you sure you want to permanently delete route "${r.routeName}"?`)) return;
        try { 
            await routeService.delete(r.routeId); 
            setRoutes(prev => prev.filter(x => x.routeId !== r.routeId)); 
            showToast('success', 'Route record removed.'); 
        } catch { 
            showToast('error', 'Failed to remove route record.'); 
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
                        <Map className="text-blue-600" size={24}/> Route Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Configure and manage delivery routes and distribution areas.</p>
                </div>
                <AppButton onClick={() => openModal()} className="rounded-md">
                    <Plus size={18} className="mr-2"/> New Route
                </AppButton>
            </div>

            <AppCard p0 className="overflow-hidden shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-slate-50/50 border-b border-slate-200">
                    <div className="relative flex-1 w-full">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by route name or area..." 
                               className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <AppButton variant="secondary" onClick={fetchRoutes} className="rounded-md w-full md:w-auto">
                        <RefreshCcw size={16} className="mr-2"/> Sync
                    </AppButton>
                </div>
                
                <AppTable
                    headers={['Route Name', 'Coverage Area', 'Status', 'Actions']}
                    data={displayed}
                    loading={loading}
                    renderRow={(r) => (
                        <>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center border border-slate-100">
                                      <MapPin size={20}/>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">{r.routeName}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 truncate max-w-[250px]" title={r.description}>{r.description || 'No description provided'}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <Globe size={14} className="text-slate-400"/>
                                    {r.area || 'All Areas'}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <AppBadge variant={r.isActive ? 'success' : 'secondary'} size="sm" className="rounded px-2 font-bold" dot={false}>
                                    {r.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </AppBadge>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 justify-end">
                                    <button onClick={() => openModal(r)} className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all shadow-sm" title="Edit Route"><Edit3 size={16}/></button>
                                    <button onClick={() => handleDelete(r)} className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm" title="Delete Route"><Trash2 size={16}/></button>
                                </div>
                            </td>
                        </>
                    )}
                />
            </AppCard>

            {modalOpen && (
                <AppModal isOpen={true} onClose={() => setModalOpen(false)} title={editRoute ? 'Update Route Details' : 'Initialize New Route'} size="md"
                    footer={<><AppButton variant="secondary" onClick={() => setModalOpen(false)} disabled={saving} className="rounded-md">Cancel</AppButton><AppButton onClick={handleSave} loading={saving} className="rounded-md">Save Route</AppButton></>}>
                    <div className="space-y-4 pt-2">
                        <AppInput label="Route Name" placeholder="e.g. North Zone" value={form.routeName} onChange={e => setForm(f => ({...f, routeName: e.target.value}))} required className="rounded-md"/>
                        <AppInput label="Coverage Area" placeholder="e.g. Sector 11-A, Sector 11-B" value={form.area} onChange={e => setForm(f => ({...f, area: e.target.value}))} className="rounded-md"/>
                        
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route Description</label>
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-4">
                                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} 
                                          placeholder="Additional details or specific bounds..."
                                          className="w-full bg-white border border-slate-200 rounded-md p-3 text-sm font-medium focus:outline-none focus:border-blue-500 min-h-[100px] resize-none"></textarea>
                                
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({...f, isActive: e.target.checked}))} 
                                           className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                                    <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Mark as Active / Operational</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </AppModal>
            )}
        </div>
    );
}
