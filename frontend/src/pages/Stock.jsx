import { useState, useEffect, useCallback } from 'react';
import stockService from '../services/stockService';
import StockHistoryModal from '../components/StockHistoryModal';
import StockOperationsModal from '../components/StockOperationsModal';
import ManualStockModal from '../components/ManualStockModal';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import AppInput from '../components/AppInput';
import AppBadge from '../components/AppBadge';
import { Package, AlertTriangle, Clock, Search, Settings2, BarChart3, Plus, Layers, RefreshCcw, Zap, Box, Activity } from 'lucide-react';

export default function Stock() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    const [historyProduct, setHistoryProduct] = useState(null);
    const [opProduct, setOpProduct] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchStock = useCallback(async () => {
        setLoading(true);
        try {
            const data = await stockService.getOverview();
            setInventory(data);
        } catch { setInventory([]); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchStock(); }, [fetchStock]);

    const filtered = inventory.filter(p => 
        p.productName.toLowerCase().includes(search.toLowerCase()) || 
        (p.barcode || '').includes(search)
    );

    return (
        <div className="space-y-10 max-w-[1700px] mx-auto animate-fade-in pb-20">
            {/* Header / Config Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 bg-[var(--bg-card)] p-10 rounded-[3.5rem] border border-[var(--border)] shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:rotate-12 transition-transform duration-500"><Layers size={22}/></div>
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic">Inventory Infrastructure</span>
                   </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-[var(--text-main)]">
                       Stock <span className="text-primary not-italic">Omni</span>
                    </h1>
                    <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-3 italic">Global inventory density, batch tracking, and life-cycle monitoring.</p>
                </div>
                
                <div className="flex flex-wrap gap-5 relative z-10">
                    <AppButton onClick={() => setIsAddModalOpen(true)} className="!px-10 !py-4 !rounded-2xl shadow-lg shadow-primary/20">
                        <Plus className="w-5 h-5 mr-3"/> <span className="uppercase tracking-[0.15em] font-black text-[10px]">Registry Stock</span>
                    </AppButton>
                </div>
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-bl-[20rem] -mr-40 -mt-40 blur-[100px] pointer-events-none"></div>
            </div>

            {/* Tactical Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <AppCard className="group relative overflow-hidden border-t-4 border-t-blue-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Registry asset count</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-[var(--text-main)] tabular-nums">{inventory.length}</h4>
                        </div>
                        <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Box size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-emerald-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Volumetric units</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-emerald-600 tabular-nums">{inventory.reduce((s, p) => s + p.totalQuantity, 0)}</h4>
                        </div>
                        <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Package size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-rose-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Critical depletion</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-rose-600 tabular-nums animate-pulse">{inventory.filter(p => p.isLowStock).length}</h4>
                        </div>
                        <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <AlertTriangle size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-amber-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Integrity alerts</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-amber-500 tabular-nums">{inventory.filter(p => p.isExpiringSoon || p.isExpired).length}</h4>
                        </div>
                        <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Clock size={24}/>
                        </div>
                    </div>
                </AppCard>
            </div>

            {/* Central Terminal */}
            <AppCard p0 className="overflow-hidden shadow-2xl border-t-8 border-t-primary group">
                <div className="flex flex-col xl:flex-row gap-8 items-center p-8 bg-[var(--secondary)]/10 border-b border-[var(--border)]">
                    <div className="flex-1 w-full relative">
                        <AppInput 
                            placeholder="Interrogate data: name, brand, barcode..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            icon={Search}
                            className="!rounded-2xl"
                        />
                    </div>
                    <AppButton variant="secondary" onClick={fetchStock} className="!px-8 !py-3.5 !rounded-2xl group">
                      <RefreshCcw size={18} className="mr-3 text-primary group-hover:rotate-180 transition-transform duration-700"/> 
                      <span className="uppercase tracking-[0.2em] font-black text-[10px]">Sync Cluster</span>
                    </AppButton>
                </div>

                <div className="p-4">
                  <AppTable 
                      headers={['Asset Specification', 'Segment Hub', 'Volumetric Density', 'Batch / Lifecycle', 'Actions']}
                      data={filtered}
                      loading={loading}
                      renderRow={(p) => (
                          <>
                              <td className="px-8 py-7">
                                  <div className="flex items-center gap-5">
                                      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black group-hover:scale-110 transition-transform border border-primary/20 shadow-sm">
                                        <Package size={24}/>
                                      </div>
                                      <div>
                                          <p className="font-black text-base italic uppercase tracking-tighter text-[var(--text-main)] mb-1 leading-none">{p.productName}</p>
                                          <AppBadge variant="secondary" size="sm" className="px-2 border-none shadow-sm leading-none italic font-black text-[9px] !rounded-md uppercase tracking-widest">REF: {p.barcode || 'NO_LINK'}</AppBadge>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-8 py-7 text-center sm:text-left">
                                  <AppBadge variant="info" size="sm" className="px-5 py-1.5 border-none shadow-sm italic font-black uppercase tracking-widest !rounded-xl">{p.category || 'GENERAL'}</AppBadge>
                              </td>
                              <td className="px-8 py-7">
                                  <div className="flex items-center gap-6">
                                      <div>
                                        <p className={`text-3xl font-black tracking-tighter tabular-nums leading-none mb-2 ${p.isLowStock ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`}>
                                            {p.totalQuantity}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${p.isLowStock ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]' : 'bg-emerald-500'}`}></div>
                                          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-60">
                                            {p.isLowStock ? 'CRITICAL DEPLETION' : 'OPTIMAL DENSITY'}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex-1 w-32 h-2 bg-[var(--bg-app)] rounded-full overflow-hidden shadow-inner border border-[var(--border)]">
                                          <div 
                                            className={`h-full rounded-full transition-all duration-[1.5s] ${p.isLowStock ? 'bg-rose-600' : 'bg-emerald-500'}`} 
                                            style={{width: `${Math.min(100, (p.totalQuantity/((p.minStockLevel || 1.5)*2.5))*100)}%`}}
                                          />
                                      </div>
                                  </div>
                              </td>
                              <td className="px-8 py-7">
                                  <div className="space-y-3">
                                      {p.isExpired ? (
                                          <AppBadge variant="danger" size="md" className="px-5 py-2 border-none shadow-lg shadow-rose-500/10 italic font-black uppercase tracking-widest">LIFECYCLE TERMINATED</AppBadge>
                                      ) : p.isExpiringSoon ? (
                                          <div className="space-y-2">
                                              <AppBadge variant="warning" size="md" className="px-5 py-2 border-none shadow-lg shadow-amber-500/10 italic font-black uppercase tracking-widest animate-pulse">NEAR EXPIRY</AppBadge>
                                              <p className="text-[10px] font-black text-amber-600 italic uppercase tracking-widest pl-2">Limit: {new Date(p.expiryDate).toLocaleDateString()}</p>
                                          </div>
                                      ) : (
                                          <div className="flex flex-col gap-1">
                                            <p className="text-xs font-black text-[var(--text-main)] italic tabular-nums">{p.expiryDate ? `Exp: ${new Date(p.expiryDate).toLocaleDateString()}` : 'Indefinite'}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">Lifecycle Threshold</p>
                                          </div>
                                      )}
                                      <div className="flex items-center gap-2 py-1.5 px-3 bg-primary/5 border border-primary/10 rounded-xl w-fit">
                                        <Zap size={10} className="text-primary"/>
                                        <p className="text-[9px] font-black text-primary uppercase tracking-widest italic leading-none">Batch: {p.batchNumber || 'CORE_MANIFEST'}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-8 py-7">
                                  <div className="flex justify-end gap-3">
                                      <button 
                                        onClick={() => setOpProduct(p)} 
                                        className="p-3.5 rounded-2xl bg-indigo-500/5 text-indigo-500 border border-indigo-500/10 hover:bg-indigo-600 hover:text-white transition-all interactive shadow-sm"
                                        title="Override Parameters"
                                      >
                                          <Settings2 size={20}/>
                                      </button>
                                      <button 
                                        onClick={() => setHistoryProduct(p)} 
                                        className="p-3.5 rounded-2xl bg-[var(--bg-app)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-primary hover:text-white transition-all interactive shadow-sm"
                                        title="Telemetry Feed"
                                      >
                                          <Activity size={20}/>
                                      </button>
                                  </div>
                              </td>
                          </>
                      )}
                  />
                </div>
            </AppCard>

            {/* Modals */}
            {historyProduct && <StockHistoryModal product={historyProduct} onClose={() => setHistoryProduct(null)} />}
            {opProduct && <StockOperationsModal product={opProduct} onClose={() => setOpProduct(null)} onSuccess={() => { setOpProduct(null); fetchStock(); }} />}
            {isAddModalOpen && <ManualStockModal onClose={() => setIsAddModalOpen(false)} onSuccess={() => { setIsAddModalOpen(false); fetchStock(); }} />}
        </div>
    );
}
