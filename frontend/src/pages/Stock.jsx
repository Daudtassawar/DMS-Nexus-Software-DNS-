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
import { Package, AlertTriangle, Clock, Search, Settings2, BarChart3, Plus, Layers, RefreshCw, Zap, Box, Activity } from 'lucide-react';

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
        <div className="space-y-6 max-w-[1700px] mx-auto animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)] shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">Stock Inventory</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Monitor stock levels, batch expiries, and inventory history.</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <AppButton onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} className="mr-2"/> Update Stock Registry
                    </AppButton>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AppCard className="border-t-4 border-t-blue-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Total Products</p>
                            <h4 className="text-2xl font-bold text-[var(--text-main)] tabular-nums">{inventory.length}</h4>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-md">
                            <Box size={20}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-emerald-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Total Units</p>
                            <h4 className="text-2xl font-bold text-emerald-600 tabular-nums">{inventory.reduce((s, p) => s + p.totalQuantity, 0)}</h4>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-md">
                            <Package size={20}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-rose-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Low Stock Alerts</p>
                            <h4 className="text-2xl font-bold text-rose-600 tabular-nums">{inventory.filter(p => p.isLowStock).length}</h4>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-md">
                            <AlertTriangle size={20}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-amber-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Expiring Soon</p>
                            <h4 className="text-2xl font-bold text-amber-600 tabular-nums">{inventory.filter(p => p.isExpiringSoon || p.isExpired).length}</h4>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-md">
                            <Clock size={20}/>
                        </div>
                    </div>
                </AppCard>
            </div>

            {/* Filter Section */}
            <AppCard p0 className="overflow-hidden shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-slate-50/50 border-b border-slate-200">
                    <div className="flex-1 w-full">
                        <AppInput 
                            placeholder="Search by product name or barcode..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            icon={Search}
                        />
                    </div>
                    <AppButton variant="secondary" onClick={fetchStock} className="rounded-md">
                      <RefreshCw size={16} className="mr-2"/>
                      <span className="text-xs font-bold uppercase tracking-wider">Sync</span>
                    </AppButton>
                </div>

                <div className="p-2">
                  <AppTable 
                      headers={['Product Name', 'Category', 'Stock Level', 'Expiry', 'Actions']}
                      data={filtered}
                      loading={loading}
                      renderRow={(p) => (
                          <>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-200 text-blue-600 flex items-center justify-center shadow-sm">
                                        <Package size={20}/>
                                      </div>
                                      <div>
                                          <p className="font-bold text-sm text-slate-900 leading-tight">{p.productName}</p>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Barcode: {p.barcode || '---'}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <AppBadge variant="secondary" size="xs" className="rounded px-2 font-bold">{p.category || 'GENERAL'}</AppBadge>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-4">
                                      <div>
                                        <h4 className={`text-xl font-bold tabular-nums ${p.isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {p.totalQuantity}
                                        </h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                          {p.isLowStock ? 'LOW STOCK' : 'IN STOCK'}
                                        </p>
                                      </div>
                                      <div className="flex-1 max-w-[80px] h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                          <div 
                                            className={`h-full rounded-full ${p.isLowStock ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                            style={{width: `${Math.min(100, (p.totalQuantity/((p.minStockLevel || 10)*2))*100)}%`}}
                                          />
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="space-y-1.5">
                                      {p.isExpired ? (
                                          <AppBadge variant="danger" size="xs" className="rounded px-2 font-bold">EXPIRED</AppBadge>
                                      ) : p.isExpiringSoon ? (
                                          <div className="space-y-1">
                                              <AppBadge variant="warning" size="xs" className="rounded px-2 font-bold">NEAR EXPIRY</AppBadge>
                                              <p className="text-[10px] font-bold text-amber-600 uppercase">{new Date(p.expiryDate).toLocaleDateString()}</p>
                                          </div>
                                      ) : (
                                          <p className="text-xs font-bold text-slate-700">
                                            {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : 'No Expiry'}
                                          </p>
                                      )}
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Batch: {p.batchNumber || 'N/A'}</p>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex gap-2 justify-end">
                                      <button 
                                        onClick={() => setOpProduct(p)} 
                                        className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all shadow-sm"
                                        title="Stock Operations"
                                      >
                                          <Settings2 size={16}/>
                                      </button>
                                      <button 
                                        onClick={() => setHistoryProduct(p)} 
                                        className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all shadow-sm"
                                        title="Transaction History"
                                      >
                                          <Activity size={16}/>
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
