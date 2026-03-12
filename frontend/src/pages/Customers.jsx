import { useState, useEffect, useCallback } from 'react';
import customerService from '../services/customerService';
import CustomerModal from '../components/CustomerModal';
import CustomerDetail from '../components/CustomerDetail';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import AppInput from '../components/AppInput';
import AppBadge from '../components/AppBadge';
import { Search, Plus, User, DollarSign, AlertTriangle, CheckCircle, MoreHorizontal, History, Edit, Trash2, MapPin, Zap, UserCircle, ShieldAlert } from 'lucide-react';

const rs = (v) => `Rs. ${(parseFloat(v) || 0).toLocaleString()}`;

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [detailId, setDetailId] = useState(null);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await customerService.getAll(debouncedSearch);
            setCustomers(data);
        } catch { setCustomers([]); } finally { setLoading(false); }
    }, [debouncedSearch]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const handleSave = async (formData) => {
        if (modal === 'edit') {
            await customerService.update(editTarget.customerId, formData);
        } else {
            await customerService.create(formData);
        }
        setModal(null); setEditTarget(null);
        fetchCustomers();
    };

    const handleDelete = async (c) => {
        if (!window.confirm(`Permanently terminate customer node "${c.customerName}"?\nThis Protocol is IRREVERSIBLE.`)) return;
        setDeleting(c.customerId);
        try {
            await customerService.delete(c.customerId);
            fetchCustomers();
        } catch { alert('De-authorization failed: Linked financial records detected.'); }
        finally { setDeleting(null); }
    };

    // Stats
    const totalCustomers = customers.length;
    const totalOutstanding = customers.reduce((s, c) => s + (c.balance || 0), 0);
    const overLimit = customers.filter(c => c.balance > c.creditLimit && c.creditLimit > 0).length;
    const clearAccounts = customers.filter(c => c.balance === 0).length;

    return (
        <div className="space-y-10 max-w-[1700px] mx-auto animate-fade-in pb-20">
            {/* Header / Config Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 bg-[var(--bg-card)] p-10 rounded-[3.5rem] border border-[var(--border)] shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:rotate-12 transition-transform duration-500"><UserCircle size={22}/></div>
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic">CRM Infrastructure</span>
                   </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-[var(--text-main)]">
                       Client <span className="text-primary not-italic">Network</span>
                    </h1>
                    <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-3 italic">Manage client relations, credit exposure, and logistics nodes.</p>
                </div>
                
                <div className="flex flex-wrap gap-5 relative z-10">
                    <AppButton onClick={() => setModal('add')} className="!px-10 !py-4 !rounded-2xl shadow-lg shadow-primary/20">
                        <Plus className="w-5 h-5 mr-3"/> <span className="uppercase tracking-[0.15em] font-black text-[10px]">Enlist Entity</span>
                    </AppButton>
                </div>
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-bl-[20rem] -mr-40 -mt-40 blur-[100px] pointer-events-none"></div>
            </div>

            {/* Tactical Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <AppCard className="group relative overflow-hidden border-t-4 border-t-blue-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Active personnel</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-[var(--text-main)] tabular-nums">{totalCustomers}</h4>
                        </div>
                        <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <User size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-rose-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Net Exposure</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-rose-600 tabular-nums">{rs(totalOutstanding)}</h4>
                        </div>
                        <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <DollarSign size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-amber-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Over-limit status</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-amber-500 tabular-nums">{overLimit}</h4>
                        </div>
                        <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <AlertTriangle size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-emerald-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Clear accounts</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-emerald-500 tabular-nums">{clearAccounts}</h4>
                        </div>
                        <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <CheckCircle size={24}/>
                        </div>
                    </div>
                </AppCard>
            </div>

            {/* Central Terminal */}
            <AppCard p0 className="overflow-hidden shadow-2xl border-t-8 border-t-primary group">
                <div className="p-8 bg-[var(--secondary)]/10 border-b border-[var(--border)]">
                    <div className="max-w-2xl">
                        <AppInput 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Interrogate client matrix: name, ID, zone..."
                            icon={Search}
                            className="!rounded-2xl"
                        />
                    </div>
                </div>

                <div className="p-4">
                  <AppTable 
                      headers={['Customer Profile', 'Logistic / Hub Hub', 'Credit Sanctions', 'Net Exposure', 'Actions']}
                      data={customers}
                      loading={loading}
                      renderRow={(c) => {
                          const isOverLimit = c.creditLimit > 0 && c.balance > c.creditLimit;
                          return (
                            <>
                                <td className="px-8 py-7">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform border-4 border-white/20">
                                            {c.customerName[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-base italic uppercase tracking-tighter text-[var(--text-main)] mb-1 leading-none">{c.customerName}</p>
                                            <AppBadge variant="secondary" size="sm" className="px-2 border-none shadow-sm leading-none italic font-black text-[9px] !rounded-md">AUTH-VAL: {c.customerId}</AppBadge>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-7">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2">
                                          <Zap size={10} className="text-primary"/>
                                          <p className="text-xs font-black text-[var(--text-main)] italic tabular-nums leading-none tracking-tight">{c.phone || 'NO_SIGNAL'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={10} className="text-primary"/>
                                            <AppBadge variant="secondary" size="sm" className="px-4 py-1 border-none shadow-sm leading-none italic font-black text-[9px] uppercase tracking-widest">{c.area || 'GENERAL_NODE'}</AppBadge>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-7">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] italic leading-none">SANCTION: {rs(c.creditLimit)}</p>
                                        {isOverLimit && <AppBadge variant="danger" size="md" dot className="border-none py-1.5 px-4 shadow-lg shadow-rose-500/10 italic font-black uppercase tracking-widest">CRITICAL EXPOSURE</AppBadge>}
                                    </div>
                                </td>
                                <td className="px-8 py-7">
                                    <div className="space-y-1.5">
                                        <p className={`text-2xl font-black tracking-tighter italic tabular-nums leading-none ${c.balance > 0 ? 'text-rose-600' : 'text-emerald-500'}`}>
                                            {rs(c.balance)}
                                        </p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] italic">Delta Exposure</p>
                                    </div>
                                </td>
                                <td className="px-8 py-7">
                                    <div className="flex items-center gap-3 justify-end">
                                        <button 
                                            onClick={() => setDetailId(c.customerId)}
                                            className="p-3 rounded-2xl bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 hover:bg-emerald-600 hover:text-white transition-all interactive shadow-sm"
                                            title="Activity Protocol"
                                        >
                                            <History size={18}/>
                                        </button>
                                        <button 
                                            onClick={() => { setEditTarget(c); setModal('edit'); }}
                                            className="p-3 rounded-2xl bg-blue-500/5 text-blue-500 border border-blue-500/10 hover:bg-blue-600 hover:text-white transition-all interactive shadow-sm"
                                            title="Override Parameters"
                                        >
                                            <Edit size={18}/>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(c)}
                                            disabled={deleting === c.customerId}
                                            className="p-3 rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-600 hover:text-white transition-all interactive shadow-sm"
                                            title="De-authorize Protocol"
                                        >
                                            {deleting === c.customerId ? <MoreHorizontal className="animate-pulse" size={18}/> : <Trash2 size={18}/>}
                                        </button>
                                    </div>
                                </td>
                            </>
                          );
                      }}
                  />
                </div>
            </AppCard>

            {/* Modals */}
            {(modal === 'add' || modal === 'edit') && (
                <CustomerModal
                    customer={modal === 'edit' ? editTarget : null}
                    onSave={handleSave}
                    onClose={() => { setModal(null); setEditTarget(null); }}
                />
            )}

            {detailId !== null && (
                <CustomerDetail
                    customerId={detailId}
                    onClose={() => setDetailId(null)}
                />
            )}
        </div>
    );
}
