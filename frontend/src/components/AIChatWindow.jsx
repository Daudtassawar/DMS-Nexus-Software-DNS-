import { useState, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Sparkles, Layout, Database, TrendingUp, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function AIChatWindow({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Operational Directive Alpha. I am your system intelligence. How can I optimize your current workflow?" }
  ]);
  const [input, setInput] = useState('');
  const location = useLocation();

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    
    // Simulate thinking
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `Analysis of your request regarding "${input}" is in progress. Currently monitoring node: ${location.pathname.split('/')[1] || 'Core Dashboard'}.` 
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-24 right-8 w-[420px] h-[600px] bg-[#0f172a]/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-slide-up z-[9999]">
      {/* Header */}
      <div className="p-6 bg-primary border-b border-white/10 flex items-center justify-between relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-white font-black uppercase italic tracking-tighter text-sm">System Intelligence</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[9px] font-black text-white/70 uppercase tracking-widest italic">Live Analysis Active</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors relative z-10">
          <X size={20} />
        </button>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-16 -mt-16"></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] font-bold leading-relaxed shadow-lg ${
              m.role === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-white/5 text-slate-300 border border-white/10 rounded-bl-none italic'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-6 border-t border-white/10 bg-black/20">
        <div className="relative group">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Interrogate data core..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 py-4 text-white text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary focus:bg-white/10 transition-all placeholder:text-slate-600"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
            <Send size={16} />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex gap-2">
               <div className="p-1.5 bg-white/5 rounded-lg border border-white/5 text-slate-500"><Layout size={12}/></div>
               <div className="p-1.5 bg-white/5 rounded-lg border border-white/5 text-slate-500"><Database size={12}/></div>
            </div>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">v4.2 AICore Integrated</p>
        </div>
      </form>
    </div>
  );
}
