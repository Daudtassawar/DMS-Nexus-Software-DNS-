import { useState } from 'react';
import stockService from '../services/stockService';
import AppModal from './AppModal';
import AppInput from './AppInput';
import AppButton from './AppButton';
import { Plus, Minus, Settings2, Move } from 'lucide-react';

export default function StockOperationsModal({ product, onSuccess, onClose }) {
    const [op, setOp] = useState('add'); // add | reduce | adjust | transfer
    const [qty, setQty] = useState('');
    const [wh1, setWh1] = useState('Main Hub');
    const [wh2, setWh2] = useState('');
    const [batchNumber, setBatchNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [reason, setReason] = useState('Damaged');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        const q = parseInt(qty);
        if (isNaN(q) || (op !== 'adjust' && q <= 0)) { setError('Please enter a valid quantity.'); setLoading(false); return; }

        try {
            if (op === 'add') await stockService.addStock(product.productId, q, wh1, batchNumber, expiryDate);
            else if (op === 'reduce') await stockService.reduceStock(product.productId, q, wh1, reason);
            else if (op === 'adjust') await stockService.adjustStock(product.productId, q, wh1);
            else if (op === 'transfer') await stockService.transferStock(product.productId, q, wh1, wh2);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'The operation could not be completed.');
        } finally { setLoading(false); }
    };

    const ops = [
        { id: 'add', label: 'Restock', icon: <Plus size={16}/>, variant: 'emerald' },
        { id: 'reduce', label: 'Deduct', icon: <Minus size={16}/>, variant: 'rose' },
        { id: 'adjust', label: 'Sync', icon: <Settings2 size={16}/>, variant: 'indigo' },
        { id: 'transfer', label: 'Move', icon: <Move size={16}/>, variant: 'amber' }
    ];

    return (
        <AppModal
            isOpen={true}
            onClose={onClose}
            title="Stock Command"
            subtitle={product.productName}
            size="md"
            footer={
                <>
                    <AppButton variant="secondary" onClick={onClose} disabled={loading}>Discard</AppButton>
                    <AppButton onClick={handleSubmit} loading={loading} className={
                        op === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' :
                        op === 'reduce' ? 'bg-rose-600 hover:bg-rose-700' :
                        op === 'transfer' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-primary'
                    }>
                        Execute {op.toUpperCase()}
                    </AppButton>
                </>
            }
        >
            <div className="space-y-6">
                {/* Op Switcher */}
                <div className="flex bg-[var(--secondary)] p-1 rounded-xl">
                    {ops.map(o => (
                        <button 
                            key={o.id}
                            onClick={() => { setOp(o.id); setError(''); }}
                            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg transition-all ${
                                op === o.id 
                                ? 'bg-[var(--bg-card)] text-primary shadow-sm scale-[1.02]' 
                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                        >
                            {o.icon}
                            <span className="text-[10px] font-bold uppercase tracking-widest">{o.label}</span>
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <AppInput 
                        label={op === 'adjust' ? 'Target Level (Units)' : 'Transaction Quantity'} 
                        type="number" 
                        min={op === 'adjust' ? 0 : 1}
                        placeholder="0"
                        value={qty}
                        onChange={e => setQty(e.target.value)}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <AppInput 
                            label={op === 'transfer' ? 'Source Warehouse' : 'Warehouse Location'} 
                            placeholder="Main Hub" 
                            value={wh1} 
                            onChange={e => setWh1(e.target.value)}
                        />
                        {op === 'transfer' && (
                            <AppInput 
                                label="Target Warehouse" 
                                placeholder="Branch B" 
                                value={wh2} 
                                onChange={e => setWh2(e.target.value)}
                            />
                        )}
                        {op !== 'transfer' && (
                          <div className="flex flex-col gap-1.5">
                              <label className="text-sm font-semibold text-[var(--text-main)]">Product SKU</label>
                              <div className="px-4 py-2.5 bg-[var(--secondary)] rounded-lg text-xs font-bold text-[var(--text-muted)] truncate">
                                {product.barcode || 'N/A'}
                              </div>
                          </div>
                        )}
                    </div>

                    {op === 'add' && (
                        <div className="grid grid-cols-2 gap-4 ">
                            <AppInput label="Batch Number" placeholder="B2026-X" value={batchNumber} onChange={e => setBatchNumber(e.target.value)} />
                            <AppInput label="Expiry Date" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
                        </div>
                    )}

                    {op === 'reduce' && (
                        <div className="flex flex-col gap-1.5 ">
                            <label className="text-sm font-semibold text-[var(--text-main)]">Deduction Protocol</label>
                            <select 
                                value={reason} 
                                onChange={e => setReason(e.target.value)}
                                className="w-full px-4 py-2.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2"
                            >
                                <option value="Damaged">💥 Physical Damage</option>
                                <option value="Expired">⌛ Expiry Lifecycle</option>
                                <option value="Lost">❓ Inventory Variance (Lost)</option>
                                <option value="Returns">🔄 Customer Returns</option>
                                <option value="Other">📝 Operational Adjustment</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>
        </AppModal>
    );
}
