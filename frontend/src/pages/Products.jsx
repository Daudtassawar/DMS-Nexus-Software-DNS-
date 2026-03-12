import { useState, useEffect, useRef } from 'react';
import ProductModal from '../components/ProductModal';
import productService from '../services/productService';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import AppInput from '../components/AppInput';
import AppBadge from '../components/AppBadge';
import { Search, Plus, Package, Tag, AlertCircle, Edit3, Trash2, Download, Filter, RefreshCcw, Zap, Box, Layers, Barcode } from 'lucide-react';

const CATEGORIES = ['All', 'Soft Drink', 'Juice', 'Water', 'Energy Drink', 'Dairy', 'Snacks', 'Other'];

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [modalOpen, setModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [importing, setImporting] = useState(false);
    const importRef = useRef();

    const fetchProducts = async () => {
        setLoading(true);
        try { 
            const d = await productService.getAll(); 
            setProducts(Array.isArray(d) ? d : []); 
        } catch { 
            console.error('Core Registry Sync Failure');
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const displayed = products.filter(p => {
        const m = !search || [p.productName, p.brand, p.barcode].some(v => v?.toLowerCase().includes(search.toLowerCase()));
        const c = category === 'All' || p.category === category;
        return m && c;
    });

    const handleDelete = async (p) => {
        if (!window.confirm(`Permanently expunge ${p.productName} from the central catalogue?`)) return;
        try { 
            await productService.delete(p.productId); 
            setProducts(prev => prev.filter(x => x.productId !== p.productId)); 
        } catch { 
            alert('Purge sequence interrupted.');
        }
    };

    const handleSave = async (payload, imageFile) => {
        const isEdit = payload.productId > 0;
        try {
            if (isEdit) { 
                await productService.update(payload.productId, payload); 
            } else { 
                const c = await productService.create(payload); 
                if (imageFile && c?.productId) { 
                    try { await productService.uploadImage(c.productId, imageFile); } catch {} 
                } 
            }
            if (isEdit && imageFile) { 
                try { await productService.uploadImage(payload.productId, imageFile); } catch {} 
            }
            setModalOpen(false); 
            setEditProduct(null); 
            fetchProducts();
        } catch (err) {
            alert('Registry update failed.');
        }
    };

    const handleBulkImport = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        setImporting(true);
        try { 
            const r = await productService.bulkImport(file); 
            alert(`Import Successful. Nodes added: ${r.imported}. Conflicts: ${r.skipped}.`); 
            fetchProducts(); 
        } catch { 
            alert('Bulk ingestion failed.'); 
        } finally { 
            setImporting(false); 
            e.target.value = ''; 
        }
    };

    return (
        <div className="space-y-10 max-w-[1700px] mx-auto animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 bg-[var(--bg-card)] p-10 rounded-[3.5rem] border border-[var(--border)] shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:rotate-12 transition-transform duration-500"><Package size={22}/></div>
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic">Catalogue Management</span>
                   </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-[var(--text-main)]">
                       Product <span className="text-primary not-italic">Nexus</span>
                    </h1>
                    <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-3 italic">Manage unit specifications, pricing models, and registry parameters.</p>
                </div>
                
                <div className="flex flex-wrap gap-5 relative z-10">
                    <input type="file" accept=".csv" ref={importRef} onChange={handleBulkImport} className="hidden" />
                    <AppButton variant="secondary" onClick={() => importRef.current?.click()} loading={importing} className="!px-8 !py-4 !rounded-2xl">
                        <Download className="w-5 h-5 mr-3"/> <span className="uppercase tracking-[0.15em] font-black text-[10px]">Bulk Ingestion</span>
                    </AppButton>
                    <AppButton onClick={() => { setEditProduct(null); setModalOpen(true); }} className="!px-10 !py-4 !rounded-2xl shadow-lg shadow-primary/20">
                        <Plus className="w-5 h-5 mr-3"/> <span className="uppercase tracking-[0.15em] font-black text-[10px]">Register Asset</span>
                    </AppButton>
                </div>
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-bl-[20rem] -mr-40 -mt-40 blur-[100px] pointer-events-none"></div>
            </div>

            {/* Tactical Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <AppCard className="group relative overflow-hidden border-t-4 border-t-blue-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Total active SKUs</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-[var(--text-main)] tabular-nums">{products.length}</h4>
                        </div>
                        <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Box size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-emerald-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Sector coverage</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-[var(--text-main)] tabular-nums">{[...new Set(products.map(p => p.category).filter(Boolean))].length}</h4>
                        </div>
                        <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Tag size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-amber-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Registry anomalies</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-[var(--text-main)] tabular-nums">{products.filter(p => !p.brand || !p.barcode).length}</h4>
                        </div>
                        <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <AlertCircle size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-primary transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Active Viewport</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-[var(--text-main)] tabular-nums">{displayed.length}</h4>
                        </div>
                        <div className="p-3.5 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                            <RefreshCcw size={24}/>
                        </div>
                    </div>
                </AppCard>
            </div>

            {/* Central Terminal */}
            <AppCard p0 className="overflow-hidden shadow-2xl border-t-8 border-t-primary group">
                <div className="flex flex-col xl:flex-row gap-8 items-center p-8 bg-[var(--secondary)]/10 border-b border-[var(--border)]">
                    <div className="flex-1 w-full relative">
                        <AppInput 
                            placeholder="Interrogate registry: name, brand, barcode..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            icon={Search}
                            className="!rounded-2xl"
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full xl:w-auto">
                        <div className="relative flex-1 xl:w-72 group/select">
                           <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary/60 group-hover/select:text-primary transition-colors">
                            <Filter size={16}/>
                           </div>
                           <select 
                                value={category} 
                                onChange={e => setCategory(e.target.value)}
                                className="w-full pl-12 pr-6 py-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] italic focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'Segment: ALL NODES' : `NODE: ${c.toUpperCase()}`}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                  <AppTable 
                      headers={['Asset / Descriptor', 'Identity Node', 'Operational Rules', 'Valuation Matrix', 'Actions']}
                      data={displayed}
                      loading={loading}
                      renderRow={(p) => (
                          <>
                              <td className="px-8 py-7">
                                  <div className="flex items-center gap-5">
                                      <div className="w-16 h-16 rounded-[1.25rem] bg-[var(--bg-app)] overflow-hidden border border-[var(--border)] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-all relative">
                                          {p.imagePath ? <img src={p.imagePath} className="w-full h-full object-cover" /> : <Package className="text-primary opacity-20" size={32}/>}
                                          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors"></div>
                                      </div>
                                      <div>
                                          <p className="font-black text-base italic uppercase tracking-tighter text-[var(--text-main)] mb-1 leading-none">{p.productName}</p>
                                          <AppBadge variant="info" size="sm" className="px-3 border-none shadow-sm italic !rounded-lg">{p.brand || 'UNIDENTIFIED'}</AppBadge>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-8 py-7">
                                  <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-[var(--text-muted)] group-hover:text-primary transition-colors">
                                        <Barcode size={12}/>
                                        <p className="text-[10px] font-black uppercase tracking-widest italic">{p.barcode || 'NO_LINK'}</p>
                                      </div>
                                      <AppBadge variant="secondary" size="md" className="border-none px-4 py-1 italic font-bold tracking-widest uppercase">{p.category || 'N/A'}</AppBadge>
                                  </div>
                              </td>
                              <td className="px-8 py-7">
                                  <div className="space-y-2">
                                      <p className="text-xl font-black text-[var(--text-main)] italic tabular-nums leading-none tracking-tighter">{p.minStockLevel || 0} <span className="text-[10px] uppercase not-italic font-extrabold text-[var(--text-muted)] tracking-widest ml-1">{p.unit}</span></p>
                                      {p.expiryDate ? (
                                        <div className="flex items-center gap-1.5 py-1 px-3 bg-amber-500/5 border border-amber-500/10 rounded-lg w-fit">
                                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                          <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">EXP: {new Date(p.expiryDate).toLocaleDateString()}</p>
                                        </div>
                                      ) : (
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">NO EXPIRY LIMIT</p>
                                      )}
                                  </div>
                              </td>
                              <td className="px-8 py-7">
                                  <div className="space-y-1.5">
                                      <p className="text-2xl font-black text-primary italic leading-none tracking-tighter tabular-nums">Rs.{p.salePrice.toLocaleString()}</p>
                                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">Basal: {p.purchasePrice}</p>
                                  </div>
                              </td>
                              <td className="px-8 py-7">
                                  <div className="flex items-center gap-3 justify-end">
                                      <button 
                                          onClick={() => { setEditProduct(p); setModalOpen(true); }}
                                          className="p-3 rounded-2xl bg-blue-500/5 text-blue-500 border border-blue-500/10 hover:bg-blue-600 hover:text-white transition-all interactive shadow-sm"
                                          title="Configure Node"
                                      >
                                          <Edit3 size={18}/>
                                      </button>
                                      <button 
                                          onClick={() => handleDelete(p)}
                                          className="p-3 rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-600 hover:text-white transition-all interactive shadow-sm"
                                          title="Expunge Protocol"
                                      >
                                          <Trash2 size={18}/>
                                      </button>
                                  </div>
                              </td>
                          </>
                      )}
                  />
                </div>
            </AppCard>

            {modalOpen && (
                <ProductModal
                    product={editProduct}
                    onSave={handleSave}
                    onClose={() => { setModalOpen(false); setEditProduct(null); }}
                />
            )}
        </div>
    );
}
