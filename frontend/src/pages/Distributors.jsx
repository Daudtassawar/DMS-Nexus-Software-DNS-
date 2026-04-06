import { useState, useEffect } from 'react';
import distributorService from '../services/distributorService';
import { Truck, Edit, TrendingUp, Phone, MapPin, Trash2, Settings, RefreshCcw, UserSquare2, Zap, Share2, Activity, Info, CheckCircle, AlertCircle, Plus, Search, Globe, Network, Building2 } from 'lucide-react';
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
    const [search, setSearch] = useState('');

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
            setError('Failed to retrieve distributor directory records.');
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
                showStatus('success', `Partner record for '${formData.name}' updated.`);
            } else {
                await distributorService.createDistributor(formData);
                showStatus('success', `New logistics partner '${formData.name}' registered.`);
            }
            setIsModalOpen(false);
            fetchDistributors();
        } catch (err) { throw err; }
    };

    const handleDelete = async (d) => {
        const id = d.distributorId || d.id;
        if (!id) {
            showStatus('error', 'Critical Error: Record identifier missing.');
            return;
        }

        if (!window.confirm(`Permanently remove records for distributor '${d.name}'?`)) return;
        
        try {
            await distributorService.deleteDistributor(id);
            showStatus('success', `Distributor '${d.name}' successfully removed.`);
            fetchDistributors();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Failed to remove distributor record.";
            showStatus('error', msg);
        }
    };

    const displayedDisributors = distributors.filter(d => 
        !search || 
        d.name?.toLowerCase().includes(search.toLowerCase()) || 
        d.region?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-[1700px] mx-auto  pb-20">
            {status.message && (
                <div className={`fixed bottom-10 right-10 z-[1000] px-6 py-4 rounded-xl shadow-sm font-bold text-xs uppercase tracking-wider flex items-center gap-3 text-white border border-white/10  ${status.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    {status.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}{status.message}
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Building2 className="text-blue-600" size={24}/> Distributor Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage external distributors, regional coverage, and contact information.</p>
                </div>
                <AppButton onClick={() => { setEditingDistributor(null); setIsModalOpen(true); }} className="rounded-md">
                    <Plus size={18} className="mr-2"/> Add Distributor
                </AppButton>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AppCard className="border-t-4 border-t-blue-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Distributors</p>
                            <h4 className="text-2xl font-bold text-slate-900 tabular-nums">{distributors.length}</h4>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded"><Building2 size={18}/></div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-emerald-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Coverage Regions</p>
                            <h4 className="text-2xl font-bold text-slate-900 tabular-nums">{[...new Set(distributors.map(d => d.region).filter(Boolean))].length}</h4>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded"><Globe size={18}/></div>
                    </div>
                </AppCard>
            </div>

            {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-3 text-sm font-semibold"> <AlertCircle size={18}/> {error}</div>}

            <AppCard p0 className="overflow-hidden shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-slate-50/50 border-b border-slate-200">
                    <div className="relative flex-1 w-full">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or region..." 
                               className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <AppButton variant="secondary" onClick={fetchDistributors} className="rounded-md w-full md:w-auto">
                        <RefreshCcw size={16} className="mr-2"/> Sync
                    </AppButton>
                </div>

                <div className="p-0">
                  <AppTable 
                      headers={['Distributor', 'Region', 'Contact', 'Actions']}
                      data={displayedDisributors}
                      loading={loading}
                      renderRow={(d) => (
                          <>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-slate-50 text-blue-600 rounded-md flex items-center justify-center border border-slate-200 shadow-sm">
                                        <Building2 size={18}/>
                                      </div>
                                      <div>
                                          <p className="font-bold text-sm text-slate-900 leading-tight">{d.name || 'Unknown Distributor'}</p>
                                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">ID: {d.distributorId}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <MapPin size={14} className="text-slate-400"/>
                                    {d.region || 'Not Assigned'}
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                      <Phone size={14} className="text-slate-400"/>
                                      {d.contact || '—'}
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 justify-end">
                                      <button 
                                          onClick={() => { setSelectedDistributor(d); setIsPerformanceOpen(true); }}
                                          className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm"
                                          title="View Performance"
                                      >
                                          <TrendingUp size={16}/>
                                      </button>
                                      <button 
                                          onClick={() => { setEditingDistributor(d); setIsModalOpen(true); }}
                                          className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all shadow-sm"
                                          title="Edit Distributor"
                                      >
                                          <Edit size={16}/>
                                      </button>
                                      <button 
                                          onClick={() => handleDelete(d)}
                                          className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                                          title="Delete Distributor"
                                      >
                                          <Trash2 size={16}/>
                                      </button>
                                  </div>
                              </td>
                          </>
                      )}
                  />
                </div>
            </AppCard>

            {/* Application Modals */}
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
