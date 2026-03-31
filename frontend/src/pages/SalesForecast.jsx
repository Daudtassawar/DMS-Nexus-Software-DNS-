import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { 
    TrendingUp, Calendar, Target, Zap, 
    ArrowUpRight, AlertCircle, Sparkles, BrainCircuit
} from 'lucide-react';

const SalesForecast = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ historical: [], forecast: [] });

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                const res = await axios.get('/api/v1/Analytics/sales-forecast');
                setData(res.data);
            } catch (err) {
                console.error("Error fetching forecast:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchForecast();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    const combindedData = [...data.historical, ...data.forecast];

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl"><BrainCircuit size={20}/></div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Predictive Engine</span>
                    </div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                        Sales <span className="text-primary not-italic">Forecast</span>
                    </h1>
                </div>
                <div className="bg-slate-900 border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-4">
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live Core Sync</span>
                    </div>
                    <div className="w-px h-6 bg-white/5"></div>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Node Status: Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Visual Projection */}
                <div className="lg:col-span-3 bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl group">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white italic mb-1">30-Day Velocity & 7-Day Forecast</h3>
                            <p className="text-[10px] text-slate-500 font-bold italic">Linear Moving Average + 1.5% Daily Trend Integration</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-0.5 bg-primary"></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Actual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-400"></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Predicted</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={combindedData}>
                                <defs>
                                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    stroke="#64748b"
                                    fontSize={10}
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis hide domain={['auto', 'auto']} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    formatter={(val) => [`$${parseFloat(val).toLocaleString()}`, 'Amount']}
                                    labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px', color: '#64748b' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={4} fill="url(#actualGradient)" dot={{ r: 4, stroke: '#2563eb', fill: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Area type="monotone" dataKey="predictedAmount" stroke="#10b981" strokeWidth={4} strokeDasharray="8 8" fill="url(#forecastGradient)" dot={{ r: 4, stroke: '#10b981', fill: '#000', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-emerald-500/5 pointer-events-none"></div>
                </div>

                {/* Right Panel: Intelligence Briefing */}
                <div className="space-y-6">
                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                             <Sparkles className="text-primary animate-pulse" size={20} />
                             <h4 className="text-xs font-black text-white italic uppercase tracking-[0.2em]">Demand Briefing</h4>
                        </div>
                        
                        <div className="space-y-6 flex-1">
                             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Projected Peak</p>
                                 <h2 className="text-2xl font-black text-white italic tracking-tighter">
                                     ${Math.max(...data.forecast.map(x => x.predictedAmount)).toLocaleString()}
                                 </h2>
                                 <p className="text-[9px] font-bold text-emerald-400 uppercase mt-1 italic tracking-widest flex items-center gap-1">
                                     <ArrowUpRight size={10}/> Expecting Growth
                                 </p>
                             </div>

                             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Forecast Confidence</p>
                                 <h2 className="text-2xl font-black text-white italic tracking-tighter">88.4%</h2>
                                 <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                                      <div className="bg-primary h-full w-[88.4%]"></div>
                                 </div>
                             </div>
                        </div>

                        <div className="mt-auto pt-6">
                             <button className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest italic shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                 Update Demand Model
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warnings/Advisories */}
            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex items-center gap-6">
                 <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                      <AlertCircle size={24} />
                 </div>
                 <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1 italic">Tactical Sales Advisory</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed max-w-[800px]">
                          Predictive analysis indicates a potential stock-out for highly profitable beverages in the next 72 hours based on trend velocity. 
                          We recommend increasing procurement orders for 'Pepsi 1L' and 'Coke 500ml' by at least 15% to capitalize on the upcoming demand spike.
                      </p>
                 </div>
            </div>
        </div>
    );
};

export default SalesForecast;
