import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Users, Database, 
  Users2, FileText, BarChart3, Shield, 
  Truck, Zap, LogOut, Terminal, ShieldCheck
} from 'lucide-react';
import RequirePermission from './RequirePermission';
import SidebarItem from './SidebarItem';
import authService from '../services/authService';

const Sidebar = ({ isCollapsed, role, userName }) => {
  const location = useLocation();

  const sections = [
    {
      id: 'MAIN',
      items: [
        { label: 'Dashboard', path: '/', permission: 'Dashboard.View', icon: LayoutDashboard },
        { label: 'Operations Center', path: '/daily-operations', permission: 'Finance.View', icon: Zap },
      ]
    },
    {
      id: 'MANAGEMENT',
      items: [
        { label: 'Products', path: '/products', permission: 'Products.View', icon: Package },
        { label: 'Customers', path: '/customers', permission: 'Customers.View', icon: Users },
        { label: 'Stock Management', path: '/stock', permission: 'Stock.View', icon: Database },
        { label: 'Sales Team', path: '/salesmen', permission: 'Salesmen.View', icon: Users2 },
        { label: 'Invoices', path: '/invoices', permission: 'Invoices.View', icon: FileText },
      ]
    },
    {
      id: 'ADMIN',
      items: [
        { label: 'Reports & Analytics', path: '/reports', permission: 'Reports.View', icon: BarChart3 },
        { label: 'User Management', path: '/users', permission: 'Users.View', icon: Shield },
        { label: 'Distributors', path: '/distributors', permission: 'Distributors.View', icon: Truck },
        { label: 'Activity Logs', path: '/activity-logs', permission: 'Users.View', icon: ShieldCheck },
      ]
    },
    {
      id: 'SYSTEM',
      items: [
        { label: 'System Exit', path: '#', icon: LogOut, onClick: () => authService.logout() },
      ]
    }
  ];

  const checkActive = (path) => {
    if (path === '#') return false;
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <aside className={`
      h-screen bg-[#020617] text-white flex flex-col border-r border-white/5 transition-all duration-500 relative z-50 overflow-hidden
      ${isCollapsed ? 'w-24' : 'w-72'}
    `}>
      {/* Brand Identity */}
      <div className="p-8 mb-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 transform rotate-12 shrink-0 border border-white/10">
            <Terminal size={22} className="text-white"/>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter leading-none italic uppercase text-white">DMS <span className="text-primary not-italic">NEXUS</span></span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 italic">V4.8.2-ULT</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 flex flex-col gap-2 relative z-10 custom-scrollbar">
        {sections.map((section, sidx) => (
          <div key={section.id} className="mb-6 last:mb-0">
            {!isCollapsed && (
              <div className="px-8 mb-3 flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
                  {section.id}
                </span>
                <div className="flex-1 h-px bg-white/5"></div>
              </div>
            )}
            {isCollapsed && sidx > 0 && (
              <div className="mx-6 my-4 h-px bg-white/5"></div>
            )}
            
            <div className="flex flex-col gap-1">
              {section.items.map((item, idx) => (
                <RequirePermission key={idx} permission={item.permission}>
                  <SidebarItem 
                    icon={item.icon}
                    label={item.label}
                    route={item.path}
                    isActive={checkActive(item.path)}
                    isCollapsed={isCollapsed}
                    onClick={item.onClick}
                  />
                </RequirePermission>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Operator Node */}
      <div className={`p-6 mt-auto border-t border-white/5 bg-slate-900/50 relative z-10`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black border border-primary/20 shrink-0 uppercase">
                {userName?.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none mb-1">NODE AUTH</p>
                <p className="font-black truncate text-xs text-white uppercase italic tracking-tighter">{userName}</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary/10 rounded-full blur-xl"></div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black border border-primary/20">
                {userName?.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

