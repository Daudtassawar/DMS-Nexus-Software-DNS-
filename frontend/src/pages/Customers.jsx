import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import customerService from '../services/customerService';
import CustomerModal from '../components/CustomerModal';
import CustomerDetail from '../components/CustomerDetail';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import AppInput from '../components/AppInput';
import AppBadge from '../components/AppBadge';
import { Search, Plus, User, DollarSign, AlertTriangle, CheckCircle, MoreHorizontal, History, Edit, Trash2, MapPin, Zap, UserCircle, ShieldAlert, FileText, Phone } from 'lucide-react';

const rs = (v) => `Rs. ${(parseFloat(v) || 0).toLocaleString()}`;

export default function Customers() {
    const navigate = useNavigate();
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
        if (!window.confirm(`Are you sure you want to delete customer "${c.customerName}"? This action is permanent.`)) return;
        setDeleting(c.customerId);
        try {
            await customerService.delete(c.customerId);
            fetchCustomers();
        } catch { alert('Cannot delete customer with existing financial history.'); }
        finally { setDeleting(null); }
    };

    // Stats
    const totalCustomers = customers.length;
    const totalOutstanding = customers.reduce((s, c) => s + (c.balance || 0), 0);
    const overLimit = customers.filter(c => c.balance > c.creditLimit && c.creditLimit > 0).length;
    const clearAccounts = customers.filter(c => c.balance === 0).length;

    return (
        <div className="space-y-6 max-w-[1700px] mx-auto animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)] shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <User className="text-blue-600" size={24}/> Customer Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage customer profiles, contact information, credit limits, and delivery locations.</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <AppButton onClick={() => setModal('add')} className="rounded-md">
                        <Plus size={18} className="mr-2"/> New Customer
                    </AppButton>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AppCard className="border-t-4 border-t-blue-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Customers</p>
                            <h4 className="text-2xl font-bold text-slate-900 tabular-nums">{totalCustomers}</h4>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                            <User size={18}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-red-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Receivables</p>
                            <h4 className="text-2xl font-bold text-red-600 tabular-nums">{rs(totalOutstanding)}</h4>
                        </div>
                        <div className="p-2 bg-red-50 text-red-600 rounded">
                            <DollarSign size={18}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-amber-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Over Credit Limit</p>
                            <h4 className="text-2xl font-bold text-amber-600 tabular-nums">{overLimit}</h4>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded">
                            <AlertTriangle size={18}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-emerald-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Zero Balance</p>
                            <h4 className="text-2xl font-bold text-emerald-600 tabular-nums">{clearAccounts}</h4>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
                            <CheckCircle size={18}/>
                        </div>
                    </div>
                </AppCard>
            </div>

            {/* Filter Section */}
            <AppCard p0 className="overflow-hidden shadow-sm">
                <div className="p-4 bg-[var(--secondary)]/10 border-b border-[var(--border)]">
                    <div className="max-w-xl">
                        <AppInput 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, ID, or zone..."
                            icon={Search}
                        />
                    </div>
                </div>

                <div className="p-2">
                  <AppTable 
                      headers={['Customer Name', 'Contact & Location', 'Credit Info', 'Balance', 'Actions']}
                      data={customers}
                      loading={loading}
                      renderRow={(c) => {
                          const isOverLimit = c.creditLimit > 0 && c.balance > c.creditLimit;
                          return (
                            <>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                                            {c.customerName[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 leading-tight">{c.customerName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1">ID: {c.customerId}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                          <Phone size={12} className="text-slate-400"/>
                                          <span>{c.phone || 'No Phone'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} className="text-slate-400"/>
                                            <span className="text-xs text-slate-500 font-medium">{c.area || 'General Area'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Credit Limit: {rs(c.creditLimit)}</p>
                                        {isOverLimit && <AppBadge variant="danger" size="xs" className="rounded px-2">OVER LIMIT</AppBadge>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <h4 className={`text-base font-bold tabular-nums ${c.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {rs(c.balance)}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Outstanding Balance</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 justify-end">
                                        <button 
                                            onClick={() => navigate(`/customer-ledger/${c.customerId}`)}
                                            className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all shadow-sm"
                                            title="Statement of Account"
                                        >
                                            <FileText size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => setDetailId(c.customerId)}
                                            className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-all shadow-sm"
                                            title="Order History"
                                        >
                                            <History size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => { setEditTarget(c); setModal('edit'); }}
                                            className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all shadow-sm"
                                            title="Edit Profile"
                                        >
                                            <Edit size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(c)}
                                            disabled={deleting === c.customerId}
                                            className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                                            title="Remove Customer"
                                        >
                                            {deleting === c.customerId ? <MoreHorizontal size={16} className="animate-pulse"/> : <Trash2 size={16}/>}
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
