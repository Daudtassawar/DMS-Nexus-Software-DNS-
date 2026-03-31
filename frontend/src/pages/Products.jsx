import { useState, useEffect, useRef } from 'react';
import ProductModal from '../components/ProductModal';
import productService from '../services/productService';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import AppInput from '../components/AppInput';
import AppBadge from '../components/AppBadge';
import RequirePermission from '../components/RequirePermission';
import { Search, Plus, Package, Tag, AlertCircle, Edit3, Trash2, Download, Filter, RefreshCw, Box, Barcode } from 'lucide-react';

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
            console.error('Failed to fetch products');
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
        if (!window.confirm(`Are you sure you want to delete ${p.productName}? This action cannot be undone.`)) return;
        try { 
            await productService.delete(p.productId); 
            setProducts(prev => prev.filter(x => x.productId !== p.productId)); 
        } catch { 
            alert('Error deleting product.');
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
            console.error('Update failed:', err);
        }
    };

    const handleBulkImport = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        setImporting(true);
        try { 
            const r = await productService.bulkImport(file); 
            alert(`Import Successful. Items added: ${r.imported}. Skipped: ${r.skipped}.`); 
            fetchProducts(); 
        } catch { 
            alert('Import failed.'); 
        } finally { 
            setImporting(false); 
            e.target.value = ''; 
        }
    };

    return (
        <div className="space-y-6 max-w-[1700px] mx-auto animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Package className="text-blue-600" size={24}/> Product Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage product specifications, brand details, and pricing structures.</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <input type="file" accept=".csv" ref={importRef} onChange={handleBulkImport} className="hidden" />
                    
                    <RequirePermission permission="Products.Create">
                      <div className="flex gap-3 w-full sm:w-auto">
                          <AppButton variant="secondary" onClick={() => importRef.current?.click()} loading={importing} className="rounded-md">
                              <Download size={18} className="mr-2"/> Import
                          </AppButton>
                          <AppButton onClick={() => { setEditProduct(null); setModalOpen(true); }} className="rounded-md">
                              <Plus size={18} className="mr-2"/> New Product
                          </AppButton>
                      </div>
                    </RequirePermission>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AppCard className="border-t-4 border-t-blue-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Products</p>
                            <h4 className="text-2xl font-bold text-slate-900">{products.length}</h4>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                            <Box size={18}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-emerald-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Categories</p>
                            <h4 className="text-2xl font-bold text-emerald-600">{[...new Set(products.map(p => p.category).filter(Boolean))].length}</h4>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
                            <Tag size={18}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-red-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Low Stock Alerts</p>
                            <h4 className="text-2xl font-bold text-red-600">{products.filter(p => p.stock < 10).length}</h4>
                        </div>
                        <div className="p-2 bg-red-50 text-red-600 rounded">
                            <AlertTriangle size={18}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-amber-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Missing Data</p>
                            <h4 className="text-2xl font-bold text-amber-600 tabular-nums">{products.filter(p => !p.brand || !p.barcode).length}</h4>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded">
                            <AlertCircle size={18}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-indigo-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Filtered Results</p>
                            <h4 className="text-2xl font-bold text-indigo-600 tabular-nums">{displayed.length}</h4>
                        </div>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                            <Filter size={18}/>
                        </div>
                    </div>
                </AppCard>
            </div>

            {/* Filter Terminal */}
            <AppCard p0 className="overflow-hidden shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 items-center p-4 bg-[var(--secondary)]/10 border-b border-[var(--border)]">
                    <div className="flex-1 w-full relative">
                        <AppInput 
                            placeholder="Search by name, brand, or barcode..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            icon={Search}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64">
                           <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                            <Filter size={16}/>
                           </div>
                           <select 
                                value={category} 
                                onChange={e => setCategory(e.target.value)}
                                className="w-full pl-10 pr-6 py-2.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-md text-xs font-semibold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all appearance-none cursor-pointer"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'ALL CATEGORIES' : c.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-2">
                  <AppTable 
                      headers={['Product / Brand', 'Identity', 'Inventory Info', 'Pricing', 'Actions']}
                      data={displayed}
                      loading={loading}
                      renderRow={(p) => (
                          <>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                            {p.imagePath ? <img src={p.imagePath} className="w-full h-full object-cover" /> : <Package className="text-slate-300" size={24}/>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 leading-tight">{p.productName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{p.brand || 'Generic Brand'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-slate-500">
                                          <Barcode size={14} className="text-slate-400"/>
                                          <p className="text-[10px] font-bold tracking-widest">{p.barcode || '---'}</p>
                                        </div>
                                        <AppBadge variant="secondary" size="xs" className="rounded px-2 font-bold">{p.category || 'GENERAL'}</AppBadge>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <h4 className="text-base font-bold text-slate-900 tabular-nums">
                                        {p.minStockLevel || 0} <span className="text-[10px] font-bold text-slate-400 ml-1">{p.unit || 'Units'}</span>
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Minimum Alert Level</p>
                                </td>
                                <td className="px-6 py-4">
                                    <h4 className="text-base font-bold text-blue-600 tabular-nums">Rs. {(p.salePrice || 0).toLocaleString()}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cost: {(p.purchasePrice || 0).toLocaleString()}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 justify-end">
                                        <RequirePermission permission="Products.Edit">
                                            <button 
                                                onClick={() => { setEditProduct(p); setModalOpen(true); }}
                                                className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all shadow-sm"
                                                title="Edit Details"
                                            >
                                                <Edit3 size={16}/>
                                            </button>
                                        </RequirePermission>
                                        <RequirePermission permission="Products.Delete">
                                            <button 
                                                onClick={() => handleDelete(p)}
                                                className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                                                title="Remove Product"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </RequirePermission>
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
