import { useState, useEffect } from 'react';
import stockService from '../services/stockService';
import AppModal from './AppModal';
import AppButton from './AppButton';
import AppTable from './AppTable';
import { Package, History, Warehouse, Clock, TrendingUp, TrendingDown } from 'lucide-react';

export default function StockHistoryModal({ product, onClose }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('breakdown'); // breakdown | history

    useEffect(() => {
        const fetchTx = async () => {
            setLoading(true);
            try {
                const data = await stockService.getTransactions(product.productId);
                setTransactions(data);
            } catch { setTransactions([]); } finally { setLoading(false); }
        };
        fetchTx();
    }, [product]);

    const Badge = ({ type }) => {
        const t = type.toLowerCase();
        const isOut = t.includes('out') || t.includes('reduce');
        const isAdj = t.includes('adjust');
        
        return (
            <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                isOut ? 'bg-rose-100 text-rose-600' : isAdj ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
                {isOut ? <TrendingDown size={10}/> : isAdj ? <TrendingUp size={10}/> : <TrendingUp size={10}/>}
                {type}
            </div>
        );
    };

    return (
        <AppModal
            isOpen={true}
            onClose={onClose}
            title="Stock Intelligence"
            subtitle={`${product.productName} (Code: ${product.productId})`}
            size="lg"
            footer={<AppButton variant="secondary" onClick={onClose}>Close Portal</AppButton>}
        >
            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex bg-[var(--secondary)] p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('breakdown')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${
                            activeTab === 'breakdown' ? 'bg-[var(--bg-card)] text-primary shadow-sm' : 'text-[var(--text-muted)] hover:text-primary'
                        }`}
                    >
                        <Warehouse size={14}/> Warehouse Distribution
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${
                            activeTab === 'history' ? 'bg-[var(--bg-card)] text-primary shadow-sm' : 'text-[var(--text-muted)] hover:text-primary'
                        }`}
                    >
                        <Clock size={14}/> Transaction Log ({transactions.length})
                    </button>
                </div>

                <div className="bg-[var(--bg-app)] border border-[var(--border)] rounded-2xl overflow-hidden min-h-[300px]">
                    {activeTab === 'breakdown' ? (
                        <AppTable 
                            headers={['Location / Warehouse', 'Available Quantity', 'Allocation']}
                            data={product.warehouses || []}
                            loading={false}
                            renderRow={(w) => (
                                <>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Warehouse size={14}/></div>
                                            <p className="font-bold text-sm tracking-tight">{w.warehouseLocation || 'Primary Hub'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xl font-bold text-primary">{w.quantity}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-full bg-[var(--secondary)] h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-primary h-full rounded-full" 
                                                style={{width: `${Math.min(100, (w.quantity/product.totalQuantity)*100)}%`}}
                                            />
                                        </div>
                                    </td>
                                </>
                            )}
                        />
                    ) : (
                        <AppTable 
                            headers={['Timestamp', 'Event Type', 'Units']}
                            data={transactions}
                            loading={loading}
                            renderRow={(t) => (
                                <>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-semibold text-[var(--text-muted)]">
                                            {new Date(t.date).toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge type={t.transactionType} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-sm">{t.quantity > 0 ? `+${t.quantity}` : t.quantity}</p>
                                    </td>
                                </>
                            )}
                        />
                    )}
                </div>
            </div>
        </AppModal>
    );
}
