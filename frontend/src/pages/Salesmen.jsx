import { useState, useEffect } from 'react';
import salesmanService from '../services/salesmanService';
import { UserPlus, Settings, Edit, TrendingUp, DollarSign, Crosshair, MapPin, Phone, Trash2, MoreHorizontal, UserCircle, Activity, Target, Zap, Plus, AlertCircle, CheckCircle, Info } from 'lucide-react';
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
            setError('Force Registry Access Failure.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (s) => {
        if (!window.confirm(`Permanently terminate duties for salesman '${s.name}'?`)) return;
        try {
            await salesmanService.deleteSalesman(s.salesmanId);
            setStatus({ type: 'success', message: `Salesman '${s.name}' de-authorized.` });
            setSalesmen(prev => prev.filter(x => x.salesmanId !== s.salesmanId));
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch {
            setStatus({ type: 'error', message: `Purge protocol failed for '${s.name}'.` });
        }
    };

    return (
        <div className="space-y-10 max-w-[1700px] mx-auto animate-fade-in pb-20">
            {/* Header / Config Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 bg-[var(--bg-card)] p-10 rounded-[3.5rem] border border-[var(--border)] shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:rotate-12 transition-transform duration-500"><UserCircle size={22}/></div>
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic">Human Capital Infrastructure</span>
                   </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-[var(--text-main)]">
                       Sales <span className="text-primary not-italic">Force</span>
                    </h1>
                    <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-3 italic">Coordinate territory reps, set benchmarks, and analyze growth velocity.</p>
                </div>
                
                <div className="flex flex-wrap gap-5 relative z-10">
                    <AppButton onClick={() => { setEditingSalesman(null); setIsSalesmanModalOpen(true); }} className="!px-10 !py-4 !rounded-2xl shadow-lg shadow-primary/20">
                        <Plus className="w-5 h-5 mr-3"/> <span className="uppercase tracking-[0.15em] font-black text-[10px]">Onboard Rep</span>
                    </AppButton>
                </div>
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-bl-[20rem] -mr-40 -mt-40 blur-[100px] pointer-events-none"></div>
            </div>

            {/* Tactical Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <AppCard className="group relative overflow-hidden border-t-4 border-t-blue-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Active personnel</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-[var(--text-main)] tabular-nums">{salesmen.length}</h4>
                        </div>
                        <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Activity size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-emerald-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Avg efficiency</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-emerald-600 tabular-nums">
                              {salesmen.length ? (salesmen.reduce((s, x) => s + x.commissionRate, 0) / salesmen.length).toFixed(1) : 0}%
                            </h4>
                        </div>
                        <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                           <DollarSign size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-primary transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Cumulative target</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-primary tabular-nums">
                              Rs. {salesmen.reduce((s, x) => s + x.monthlyTarget, 0).toLocaleString()}
                            </h4>
                        </div>
                        <div className="p-3.5 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                           <Target size={24}/>
                        </div>
                    </div>
                </AppCard>
            </div>

            {error && <div className="p-6 bg-rose-500 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-4 shadow-xl shadow-rose-500/20 animate-shake"> <AlertCircle size={24}/> {error}</div>}
            
            {status.message && (
                <div className={`p-6 border rounded-[2rem] text-[11px] font-black uppercase tracking-widest flex items-center gap-4 animate-slide-up shadow-xl ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'}`}>
                    {status.type === 'success' ? <CheckCircle size={24}/> : <Info size={24}/>}
                    {status.message}
                </div>
            )}

            {/* Central Terminal */}
            <AppCard p0 className="overflow-hidden shadow-2xl border-t-8 border-t-primary group">
                <AppTable 
                    headers={['Salesman Profile', 'Logistics Infrastructure', 'Quota Benchmarks', 'Yield Rate', 'Actions']}
                    data={salesmen}
                    loading={loading}
                    renderRow={(s) => (
                        <>
                            <td className="px-8 py-7">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform border-4 border-white/20">
                                        {(s.name?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-black text-base italic uppercase tracking-tighter text-[var(--text-main)] mb-1 leading-none">{s.name || 'UNKNOWN'}</p>
                                        <AppBadge variant="secondary" size="sm" className="px-2 border-none shadow-sm leading-none italic font-black text-[9px] !rounded-md uppercase tracking-widest">REP-VAL: {s.salesmanId}</AppBadge>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-7">
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2">
                                      <MapPin size={10} className="text-primary"/>
                                      <p className="text-xs font-black text-[var(--text-main)] italic leading-none tracking-tight uppercase">{s.area || 'UNMAPPED_ZONE'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={10} className="text-primary"/>
                                        <p className="text-[10px] font-black text-[var(--text-muted)] italic tracking-widest leading-none">{s.phone || 'NO_SIGNAL'}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-7">
                                <div className="space-y-1.5">
                                    <p className="text-2xl font-black text-primary tracking-tighter italic leading-none tabular-nums">Rs. {s.monthlyTarget.toLocaleString()}</p>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] italic leading-none">Monthly Quota</p>
                                </div>
                            </td>
                            <td className="px-8 py-7">
                                <div className="flex flex-col gap-2">
                                  <AppBadge variant="success" size="md" className="px-4 py-1.5 border-none shadow-sm italic font-black text-[10px] !rounded-xl">
                                      {s.commissionRate}% INTEL YIELD
                                  </AppBadge>
                                  <div className="flex items-center gap-1 opacity-40">
                                    <Zap size={8} className="text-emerald-500"/>
                                    <span className="text-[8px] font-black uppercase tracking-widest">Efficiency Sigma</span>
                                  </div>
                                </div>
                            </td>
                            <td className="px-8 py-7 text-right">
                               <div className="flex justify-end gap-3">
                                  <button 
                                      onClick={() => { setPerformanceSalesmanId(s.salesmanId); setPerformanceName(s.name); setIsPerformanceModalOpen(true); }}
                                      className="p-3 rounded-2xl bg-indigo-500/5 text-indigo-500 border border-indigo-500/10 hover:bg-indigo-600 hover:text-white transition-all interactive shadow-sm"
                                      title="Performance Matrix"
                                  >
                                      <TrendingUp size={20}/>
                                  </button>
                                  <button 
                                      onClick={() => { setEditingSalesman(s); setIsSalesmanModalOpen(true); }}
                                      className="p-3 rounded-2xl bg-blue-500/5 text-blue-500 border border-blue-500/10 hover:bg-blue-600 hover:text-white transition-all interactive shadow-sm"
                                      title="Override Parameters"
                                  >
                                      <Settings size={20}/>
                                  </button>
                                  <button 
                                      onClick={() => handleDelete(s)}
                                      className="p-3 rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-600 hover:text-white transition-all interactive shadow-sm"
                                      title="Purge Protocol"
                                  >
                                      <Trash2 size={20}/>
                                  </button>
                               </div>
                            </td>
                        </>
                    )}
                />
            </AppCard>

            {/* Modals */}
            <SalesmanModal 
                isOpen={isSalesmanModalOpen} 
                onClose={() => setIsSalesmanModalOpen(false)} 
                salesman={editingSalesman} 
                onSave={fetchSalesmen} 
            />
            
            <SalesmanPerformanceModal 
                isOpen={isPerformanceModalOpen} 
                onClose={() => setIsPerformanceModalOpen(false)} 
                salesmanId={performanceSalesmanId} 
                titleName={performanceName}
            />
        </div>
    );
}
