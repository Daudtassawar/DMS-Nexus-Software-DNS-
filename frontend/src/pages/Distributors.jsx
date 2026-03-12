import { useState, useEffect } from 'react';
import distributorService from '../services/distributorService';
import { Truck, Edit, TrendingUp, Phone, MapPin, Trash2, Settings, RefreshCcw, UserSquare2, Zap, Share2, Activity, Info, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import DistributorModal from '../components/DistributorModal';
import DistributorPerformanceModal from '../components/DistributorPerformanceModal';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import AppInput from '../components/AppInput';
import AppBadge from '../components/AppBadge';

export default function Distributors() {
    const [distributors, setDistributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDistributor, setEditingDistributor] = useState(null);
    const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
    const [selectedDistributor, setSelectedDistributor] = useState(null);

    useEffect(() => { fetchDistributors(); }, []);

    const fetchDistributors = async () => {
        setLoading(true); setError('');
        try {
            const data = await distributorService.getDistributors();
            setDistributors(data || []);
        } catch (err) {
            setError('Supply Chain Registry Access Failure.');
        } finally {
            setLoading(false);
        }
    };

    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: '', message: '' }), 3500);
    };

    const handleSave = async (formData) => {
        try {
            if (formData.distributorId) {
                await distributorService.updateDistributor(formData.distributorId, formData);
                showStatus('success', `Partner node '${formData.name}' upgraded.`);
            } else {
                await distributorService.createDistributor(formData);
                showStatus('success', `New partner '${formData.name}' enlisted.`);
            }
            setIsModalOpen(false);
            fetchDistributors();
        } catch (err) { throw err; }
    };

    const handleDelete = async (d) => {
        const id = d.distributorId || d.id;
        if (!id) {
            console.error("Purge Error: Identifier Missing", d);
            showStatus('error', 'Purge Protocol Failure: Unit reference lost.');
            return;
        }

        if (!window.confirm(`Permanently terminate logistics pipeline for '${d.name}'?`)) return;
        
        try {
            await distributorService.deleteDistributor(id);
            showStatus('success', `Partner node '${d.name}' successfully purged from registry.`);
            fetchDistributors(); // Synchronize with backend to ensure data integrity
        } catch (err) {
            console.error("Purge Error Logged:", err);
            const msg = err.response?.data?.message || err.message || "Pipeline linkages found: Dependent data prevents purge.";
            showStatus('error', msg);
        }
    };

    return (
        <div className="space-y-10 max-w-[1700px] mx-auto animate-fade-in pb-20">
            {/* Header / Config Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 bg-[var(--bg-card)] p-10 rounded-[3.5rem] border border-[var(--border)] shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:rotate-12 transition-transform duration-500"><Truck size={22}/></div>
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic">Supply Chain Infrastructure</span>
                   </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-[var(--text-main)]">
                       Logistic <span className="text-primary not-italic">Nodes</span>
                    </h1>
                    <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-3 italic">Coordinate logistics partners, optimize supply flow, and monitor pipeline integrity.</p>
                </div>
                
                <div className="flex flex-wrap gap-5 relative z-10">
                    <AppButton onClick={() => { setEditingDistributor(null); setIsModalOpen(true); }} className="!px-10 !py-4 !rounded-2xl shadow-lg shadow-primary/20">
                        <Plus className="w-5 h-5 mr-3"/> <span className="uppercase tracking-[0.15em] font-black text-[10px]">Onboard Partner</span>
                    </AppButton>
                </div>
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-bl-[20rem] -mr-40 -mt-40 blur-[100px] pointer-events-none"></div>
            </div>

            {/* Tactical Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <AppCard className="group relative overflow-hidden border-t-4 border-t-blue-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Network capacity</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-[var(--text-main)] tabular-nums">{distributors.length}</h4>
                        </div>
                        <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Share2 size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-emerald-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Node distribution</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-emerald-600 tabular-nums">{[...new Set(distributors.map(d => d.region).filter(Boolean))].length}</h4>
                        </div>
                        <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <MapPin size={24}/>
                        </div>
                    </div>
                </AppCard>
            </div>

            {status.message && (
                <div className={`p-6 border rounded-[2rem] text-[11px] font-black uppercase tracking-widest flex items-center gap-4 animate-slide-up shadow-xl ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'}`}>
                    {status.type === 'success' ? <CheckCircle size={24}/> : <Info size={24}/>}
                    {status.message}
                </div>
            )}

            {/* Central Terminal */}
            <AppCard p0 className="overflow-hidden shadow-2xl border-t-8 border-t-primary group">
                <div className="flex flex-col xl:flex-row gap-8 items-center p-8 bg-[var(--secondary)]/10 border-b border-[var(--border)]">
                    <div className="flex-1 w-full relative">
                        <AppInput 
                            placeholder="Interrogate pipeline: partner, ID, region..." 
                            icon={RefreshCcw}
                            className="!rounded-2xl"
                            readOnly
                        />
                    </div>
                    <AppButton variant="secondary" onClick={fetchDistributors} className="!px-8 !py-3.5 !rounded-2xl group">
                      <RefreshCcw size={18} className="mr-3 text-primary group-hover:rotate-180 transition-transform duration-700"/> 
                      <span className="uppercase tracking-[0.2em] font-black text-[10px]">Deep Refresh</span>
                    </AppButton>
                </div>

                <div className="p-4">
                  <AppTable 
                      headers={['Partner Profile', 'Logistic Intel', 'Dispatch Infrastructure', 'Actions']}
                      data={distributors}
                      loading={loading}
                      renderRow={(d) => (
                          <>
                              <td className="px-8 py-7">
                                  <div className="flex items-center gap-5">
                                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform border-4 border-white/20">
                                        <Truck size={24}/>
                                      </div>
                                      <div>
                                          <p className="font-black text-base italic uppercase tracking-tighter text-[var(--text-main)] mb-1 leading-none">{d.name}</p>
                                          <AppBadge variant="secondary" size="sm" className="px-2 border-none shadow-sm leading-none italic font-black text-[9px] !rounded-md uppercase tracking-widest">NODE-VAL: DIST-{d.distributorId}</AppBadge>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-8 py-7">
                                  <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <MapPin size={10} className="text-primary"/>
                                        <p className="text-xs font-black text-[var(--text-main)] italic leading-none tracking-tight uppercase">{d.region || 'UNMAPPED_NODE'}</p>
                                      </div>
                                      <AppBadge variant="info" size="sm" className="px-4 py-1 border-none shadow-sm leading-none italic font-black text-[8px] uppercase tracking-[0.2em] !rounded-lg">GEO_TAGGED</AppBadge>
                                  </div>
                              </td>
                              <td className="px-8 py-7">
                                  <div className="space-y-2.5">
                                      <div className="flex items-center gap-2">
                                          <Phone size={10} className="text-primary"/>
                                          <p className="text-[10px] font-black text-[var(--text-muted)] italic tracking-widest leading-none">{d.contact || 'SIGNAL_LOST'}</p>
                                      </div>
                                      <div className="flex items-center gap-1.5 py-1 px-3 bg-primary/5 border border-primary/10 rounded-xl w-fit">
                                          <Zap size={10} className="text-primary"/>
                                          <p className="text-[9px] font-black text-primary uppercase tracking-widest italic leading-none">LOGISTIC_CHANNEL_A</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-8 py-7 text-right">
                                  <div className="flex justify-end gap-3">
                                      <button 
                                          onClick={() => { setSelectedDistributor(d); setIsPerformanceOpen(true); }}
                                          className="p-3.5 rounded-2xl bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 hover:bg-emerald-600 hover:text-white transition-all interactive shadow-sm"
                                          title="Flow Analysis"
                                      >
                                          <TrendingUp size={20}/>
                                      </button>
                                      <button 
                                          onClick={() => { setEditingDistributor(d); setIsModalOpen(true); }}
                                          className="p-3.5 rounded-2xl bg-blue-500/5 text-blue-500 border border-blue-500/10 hover:bg-blue-600 hover:text-white transition-all interactive shadow-sm"
                                          title="Override Parameters"
                                      >
                                          <Settings size={20}/>
                                      </button>
                                      <button 
                                          onClick={() => handleDelete(d)}
                                          className="p-3.5 rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-600 hover:text-white transition-all interactive shadow-sm"
                                          title="Purge Pipeline"
                                      >
                                          <Trash2 size={20}/>
                                      </button>
                                  </div>
                              </td>
                          </>
                      )}
                  />
                </div>
            </AppCard>

            {/* Modals */}
            {isModalOpen && (
                <DistributorModal
                    distributor={editingDistributor}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            <DistributorPerformanceModal
                isOpen={isPerformanceOpen}
                distributor={selectedDistributor}
                onClose={() => setIsPerformanceOpen(false)}
            />
        </div>
    );
}
