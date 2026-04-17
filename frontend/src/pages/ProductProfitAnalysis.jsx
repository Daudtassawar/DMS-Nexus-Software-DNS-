import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Package, TrendingUp, TrendingDown, Target, Zap, 
    ArrowUpRight, ArrowDownRight, Layers, LayoutList, Search
} from 'lucide-react';
import { formatCurrency } from '../utils/currencyUtils';

const ProductProfitAnalysis = () => {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProfit = async () => {
            try {
                const res = await axios.get('/api/v1/Analytics/product-profit');
                setProducts(res.data);
            } catch (err) {
                console.error("Error fetching product profit:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfit();
    }, []);

    const filtered = products.filter(p => 
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-6  pb-20">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><Layers size={20}/></div>
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em] italic">Product Intelligence</span>
                </div>
                <h1 className="text-3xl font-bold uppercase italic tracking-tighter text-white">
                    Profitability <span className="text-primary not-italic">Ranking</span>
                </h1>
            </div>

            {/* Top/Bottom Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1 italic">Highest Profit Contribution</p>
                        <h3 className="text-xl font-bold text-white italic truncate max-w-[200px]">{products[0]?.productName}</h3>
                        <p className="text-[10px] font-bold text-emerald-400 mt-1 uppercase italic">+ {formatCurrency(products[0]?.profit, false)} Profit</p>
                    </div>
                    <div className="p-4 bg-emerald-500/20 text-emerald-500 rounded-full animate-pulse">
                        <TrendingUp size={30} />
                    </div>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1 italic">Least Profit Contribution</p>
                        <h3 className="text-xl font-bold text-white italic truncate max-w-[200px]">{products[products.length-1]?.productName}</h3>
                        <p className="text-[10px] font-bold text-rose-400 mt-1 uppercase italic">{formatCurrency(products[products.length-1]?.profit, false)} Profit</p>
                    </div>
                    <div className="p-4 bg-rose-500/20 text-rose-500 rounded-full">
                        <TrendingDown size={30} />
                    </div>
                </div>
            </div>

            {/* List with Search */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0">
                            <Target size={22} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold italic uppercase text-lg tracking-tighter">Margin Analysis</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">All nodes synchronized</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search data-set..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-white outline-none focus:border-primary transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                                <th className="px-8 py-5">Product Matrix</th>
                                <th className="px-8 py-5">Qty Sold</th>
                                <th className="px-8 py-5">Revenue</th>
                                <th className="px-8 py-5">Net Cost</th>
                                <th className="px-8 py-5">Profit</th>
                                <th className="px-8 py-5">Margin %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-white/5 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                                                <Package size={20} className="text-slate-500 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white italic tracking-tighter">{item.productName}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.brand}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400 font-mono">{item.quantitySold}</span>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase">Units</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-white italic tracking-tighter">{formatCurrency(item.revenue)}</td>
                                    <td className="px-8 py-6 text-sm font-bold text-rose-500/80 italic tracking-tighter">- {formatCurrency(item.cost)}</td>
                                    <td className="px-8 py-6">
                                        <div className={`px-4 py-2 rounded-xl text-xs font-bold italic tracking-tighter inline-block ${item.profit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                            {formatCurrency(item.profit, true)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden max-w-[100px]">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${item.margin > 25 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                                style={{ width: `${Math.max(5, item.margin)}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-[10px] font-bold italic mt-1 block ${item.margin > 25 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {item.margin.toFixed(1)}% Efficiency
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductProfitAnalysis;
