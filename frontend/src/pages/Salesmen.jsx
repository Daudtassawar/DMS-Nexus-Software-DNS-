import { useState, useEffect } from 'react';
import salesmanService from '../services/salesmanService';
import { UserPlus, Settings, Edit, TrendingUp, DollarSign, Crosshair, MapPin, Phone, Trash2, MoreHorizontal, UserCircle, Activity, Target, Zap, Plus, AlertCircle, CheckCircle, Info, Briefcase, Users, PieChart, ShieldCheck } from 'lucide-react';
import SalesmanModal from '../components/SalesmanModal';
import SalesmanPerformanceModal from '../components/SalesmanPerformanceModal';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import AppBadge from '../components/AppBadge';

export default function Salesmen() {
    const [salesmen, setSalesmen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });

    // Modal States
    const [isSalesmanModalOpen, setIsSalesmanModalOpen] = useState(false);
    const [editingSalesman, setEditingSalesman] = useState(null);
    const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
    const [performanceSalesmanId, setPerformanceSalesmanId] = useState(null);
    const [performanceName, setPerformanceName] = useState('');

    useEffect(() => { fetchSalesmen(); }, []);

    const fetchSalesmen = async () => {
        setLoading(true); setError('');
        try {
            const data = await salesmanService.getSalesmen();
            setSalesmen(data || []);
        } catch (err) {
            setError('Failed to retrieve sales records.');
        } finally {
            setLoading(false);
        }
    };

    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: '', message: '' }), 3500);
    };

    const handleDelete = async (s) => {
        if (!window.confirm(`Permanently remove records for representative '${s.name}'?`)) return;
        try {
            await salesmanService.deleteSalesman(s.salesmanId);
            showStatus('success', `Representative '${s.name}' record removed.`);
            setSalesmen(prev => prev.filter(x => x.salesmanId !== s.salesmanId));
        } catch {
            showStatus('error', `Failed to remove record for '${s.name}'.`);
        }
    };

    const avgCommission = salesmen.length ? (salesmen.reduce((s, x) => s + x.commissionRate, 0) / salesmen.length) : 0;
    const totalTargets = salesmen.reduce((s, x) => s + x.monthlyTarget, 0);

    return (
        <div className="space-y-6 max-w-[1700px] mx-auto  pb-20">
            {status.message && (
                <div className={`fixed bottom-10 right-10 z-[1000] px-6 py-4 rounded-xl shadow-sm font-bold text-xs uppercase tracking-wider flex items-center gap-3 text-white border border-white/10  ${status.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    {status.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}{status.message}
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)] shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Briefcase className="text-blue-600" size={24}/> Sales Team Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage field representatives, operational sales areas, and commission structures.</p>
                </div>
                <AppButton onClick={() => { setEditingSalesman(null); setIsSalesmanModalOpen(true); }} className="rounded-md">
                    <Plus size={18} className="mr-2"/> Register Salesman
                </AppButton>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AppCard className="border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded">
                            <Users size={20}/>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Active Salesmen</p>
                            <h4 className="text-xl font-bold text-slate-900">{salesmen.length} Representatives</h4>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded">
                            <PieChart size={20}/>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">AVG Commission</p>
                            <h4 className="text-xl font-bold text-slate-900">{avgCommission.toFixed(1)}% Rate</h4>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded">
                            <Target size={20}/>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Sales Target</p>
                            <h4 className="text-xl font-bold text-slate-900">Rs. {totalTargets.toLocaleString()}</h4>
                        </div>
                    </div>
                </AppCard>
            </div>

            {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-3 text-sm font-bold"> <AlertCircle size={18}/> {error}</div>}

            <AppCard p0 className="overflow-hidden shadow-sm border border-slate-200">
                <AppTable 
                    headers={['Sales Representative', 'Sales Area', 'Performance Target', 'Commission', 'Actions']}
                    data={salesmen}
                    loading={loading}
                    renderRow={(s) => (
                        <>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-base border border-slate-200">
                                        {s.name ? s.name[0].toUpperCase() : '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 leading-tight">{s.name || 'Unassigned'}</p>
                                        <p className="text-[10px] font-bold text-blue-600 mt-1">ID: {s.salesmanId}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                      <MapPin size={12} className="text-slate-400"/> {s.area || 'General Zone'}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                        <Phone size={10}/> {s.phone || 'No contact'}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <h4 className="text-base font-bold text-slate-900 tabular-nums">Rs. {s.monthlyTarget.toLocaleString()}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Monthly Target</p>
                            </td>
                            <td className="px-6 py-4">
                                <AppBadge variant="success" size="sm" className="rounded px-2 font-bold">
                                    {s.commissionRate}% Rate
                                </AppBadge>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 justify-end">
                                    <button 
                                        onClick={() => { setPerformanceSalesmanId(s.salesmanId); setPerformanceName(s.name); setIsPerformanceModalOpen(true); }}
                                        className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all shadow-sm"
                                        title="Performance Analytics"
                                    >
                                        <TrendingUp size={16}/>
                                    </button>
                                    <button 
                                        onClick={() => { setEditingSalesman(s); setIsSalesmanModalOpen(true); }}
                                        className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all shadow-sm"
                                        title="Edit Details"
                                    >
                                        <Settings size={16}/>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(s)}
                                        className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                                        title="Remove Salesman"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </td>
                        </>
                    )}
                />
            </AppCard>

        </div>
    );
}
