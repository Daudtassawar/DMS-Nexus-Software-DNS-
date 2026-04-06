import { useState, useEffect } from 'react';
import stockService from '../services/stockService';
import productService from '../services/productService';
import AppModal from './AppModal';
import AppInput from './AppInput';
import AppButton from './AppButton';
import { Search, Package, Warehouse, Calendar, Layers } from 'lucide-react';

export default function ManualStockModal({ onClose, onSuccess }) {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [qty, setQty] = useState('');
    const [wh, setWh] = useState('Main Warehouse');
    const [batchNumber, setBatchNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try { const data = await productService.getAll(); setProducts(data || []); }
            catch (err) { console.error('Failed to load products', err); }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => 
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode || '').includes(searchTerm)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedProduct) { setError('Select a product to continue.'); return; }
        const q = parseInt(qty);
        if (isNaN(q) || q <= 0) { setError('Invalid quantity.'); return; }

        setLoading(true);
        try {
            await stockService.addStock(selectedProduct.productId, q, wh, batchNumber, expiryDate);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to record stock entry.');
        } finally { setLoading(false); }
    };

    return (
        <AppModal
            isOpen={true}
            onClose={onClose}
            title="External Incoming Stock"
            subtitle="Record new batch arrivals manually"
            size="lg"
            footer={
                <>
                    <AppButton variant="secondary" onClick={onClose} disabled={loading}>Cancel</AppButton>
                    <AppButton onClick={handleSubmit} loading={loading} disabled={!selectedProduct}>
                        Verify & Commit Batch
                    </AppButton>
                </>
            }
        >
            <div className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Step 1: Selection */}
                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">01. Source Product</h4>
                    {!selectedProduct ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4"/>
                                <input 
                                    type="text" 
                                    placeholder="Tap to search or scan barcode..." 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-[var(--secondary)] border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all font-semibold"
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {filteredProducts.slice(0, 10).map(p => (
                                    <div 
                                        key={p.productId} 
                                        onClick={() => setSelectedProduct(p)}
                                        className="p-3 bg-[var(--bg-app)] border border-[var(--border)] rounded-xl hover:border-primary cursor-pointer transition-all flex justify-between items-center group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--secondary)] flex items-center justify-center"><Package size={14} className="text-[var(--text-muted)]"/></div>
                                            <div>
                                                <div className="font-bold text-sm">{p.productName}</div>
                                                <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">{p.barcode || 'NO BARCODE'}</div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">CHOOSE</div>
                                    </div>
                                ))}
                                {filteredProducts.length > 10 && <p className="text-center text-[10px] font-bold text-[var(--text-muted)] italic py-2">Keep typing to narrow results...</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between ">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary text-white rounded-xl shadow-sm shadow-primary/20"><Package size={20}/></div>
                                <div>
                                    <div className="font-bold text-primary">{selectedProduct.productName}</div>
                                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{selectedProduct.barcode || 'SYSTEM-REF'}</div>
                                </div>
                            </div>
                            <button type="button" onClick={() => setSelectedProduct(null)} className="text-[10px] font-bold text-rose-500 hover:underline uppercase tracking-widest">Change</button>
                        </div>
                    )}
                </div>

                {/* Step 2: Batch Data */}
                <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">02. Arrival Logistics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AppInput label="Units Received" type="number" min="1" placeholder="0" value={qty} onChange={e => setQty(e.target.value)} required />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[var(--text-main)]">Target Warehouse</label>
                            <div className="relative">
                                <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] p-0.5" size={20}/>
                                <input 
                                    required 
                                    placeholder="Main Hub" 
                                    value={wh} 
                                    onChange={e => setWh(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] font-semibold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[var(--text-main)]">Batch Identifier</label>
                            <div className="relative">
                                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] p-0.5" size={20}/>
                                <input 
                                    placeholder="B-2026-X" 
                                    value={batchNumber} 
                                    onChange={e => setBatchNumber(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] font-semibold"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[var(--text-main)]">Expiry Declaration</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] p-0.5" size={20}/>
                                <input 
                                    type="date" 
                                    value={expiryDate} 
                                    onChange={e => setExpiryDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] font-semibold"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppModal>
    );
}
