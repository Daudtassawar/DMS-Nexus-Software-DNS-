import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, X, MessageSquare, Shield, Zap } from 'lucide-react';
import AIChatWindow from './AIChatWindow';

const AIContextAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsTooltipVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end">
      {/* Pulse Notification Tooltip */}
      {isTooltipVisible && !isOpen && (
        <div className="mb-4 animate-bounce-subtle">
          <div className="bg-primary text-white px-5 py-3 rounded-2xl shadow-2xl relative border border-white/20">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
              <Zap size={14} className="animate-pulse"/> Current Node Analysis Available
            </p>
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-primary rotate-45 border-r border-b border-white/20"></div>
            <button 
              onClick={() => setIsTooltipVisible(false)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-slate-900 border border-white/20 rounded-full flex items-center justify-center text-[10px] hover:bg-rose-500 transition-colors"
            >
              <X size={10}/>
            </button>
          </div>
        </div>
      )}

      {/* Main Activation Trigger */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsTooltipVisible(false);
        }}
        className={`
          relative w-18 h-18 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-2xl group overflow-hidden
          ${isOpen 
            ? 'bg-rose-500 shadow-rose-500/30 rotate-90 scale-90' 
            : 'bg-primary shadow-primary/30 hover:scale-110 hover:shadow-primary/50'}
        `}
        style={{ width: '72px', height: '72px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {isOpen ? (
          <X className="text-white animate-fade-in" size={32} />
        ) : (
          <div className="relative">
            <Bot className="text-white transition-transform group-hover:scale-110" size={36} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-primary shadow-[0_0_10px_#10b981]"></div>
          </div>
        )}

        {/* Decorative background pulse */}
        {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20 group-hover:opacity-40"></div>
        )}
      </button>

      {/* Context Intel Overlay */}
      <AIChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default AIContextAssistant;
