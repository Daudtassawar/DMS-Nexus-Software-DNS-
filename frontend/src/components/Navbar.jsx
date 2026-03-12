import React from 'react';
import ThemeToggle from './ThemeToggle';
import authService from '../services/authService';
import { Menu, Search, LogOut, Bell, Shield, Command, Zap, Activity, Globe } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const user = authService.getCurrentUser()?.user;

  return (
    <header className="h-28 bg-[var(--bg-app)]/80 border-b border-[var(--border)] px-10 flex items-center justify-between sticky top-0 z-40 backdrop-blur-2xl transition-all relative overflow-hidden">
      {/* Decorative top gradient surge */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-20"></div>

      <div className="flex items-center gap-10">
        <button 
          onClick={onToggleSidebar}
          className="p-4 rounded-[1.5rem] bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border)] hover:border-primary/50 hover:bg-primary/5 transition-all shadow-xl interactive group shrink-0"
        >
          <Menu className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
        </button>
        
        <div className="hidden xl:flex items-center gap-4 bg-[var(--bg-app)] border border-[var(--border)] px-6 py-3.5 rounded-3xl w-[30rem] shadow-inner group transition-all focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/40 relative overflow-hidden">
          <Search size={18} className="text-slate-500 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="INTERROGATE GLOBAL CLUSTER MATRIX..." 
            className="bg-transparent border-none outline-none text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-main)] w-full placeholder:text-slate-500 italic"
          />
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-card)] rounded-xl text-[10px] font-black text-[var(--text-muted)] border border-[var(--border)] shadow-sm">
            <Command size={11} className="text-primary"/> <span className="tracking-widest">K</span>
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 bg-primary w-0 group-focus-within:w-full transition-all duration-700"></div>
        </div>
      </div>

      <div className="flex items-center gap-6 lg:gap-12">
        {/* Status Indicators */}
        <div className="hidden lg:flex items-center gap-8 border-r border-[var(--border)] pr-12">
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <Globe size={12} className="text-emerald-500 animate-pulse"/>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 italic">Core Network Live</span>
              </div>
              <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-tighter opacity-40">Uplink Stable</p>
            </div>
            
            <button className="p-4 rounded-2xl text-[var(--text-muted)] hover:text-primary hover:bg-primary/5 transition-all relative group shadow-sm bg-[var(--bg-card)] border border-[var(--border)]">
                <Bell size={22} className="group-hover:rotate-12 transition-transform"/>
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[var(--bg-app)] shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse"></span>
            </button>
            <ThemeToggle />
        </div>
        
        <div className="flex items-center gap-6 group/user cursor-pointer">
          <div className="text-right hidden sm:block transition-all group-hover/user:-translate-x-2">
            <div className="flex items-center justify-end gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse"></div>
                <p className="text-[13px] font-black tracking-tighter uppercase text-[var(--text-main)] italic leading-none">{user?.userName}</p>
            </div>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] leading-none">PRIMARY AUTHORIZED NODE</p>
          </div>
          
          <div className="relative">
            <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-primary to-primary/60 border-4 border-white/10 shadow-2xl flex items-center justify-center text-white font-black text-xl group-hover/user:rotate-12 transition-transform duration-500">
               {user?.userName?.charAt(0).toUpperCase()}
            </div>
            <button 
              onClick={() => authService.logout()}
              className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all border-2 border-[var(--bg-app)]"
              title="Terminate Pipeline"
            >
              <LogOut size={12} className="font-bold" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
