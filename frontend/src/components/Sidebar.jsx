import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Users, Database, 
  Users2, FileText, BarChart3, Shield, 
  Truck, Zap, LogOut, Terminal, ShieldCheck, Building2,
  TrendingUp, Landmark, MapPin, Settings, X
} from 'lucide-react';
import RequirePermission from './RequirePermission';
import SidebarItem from './SidebarItem';
import authService from '../services/authService';

const Sidebar = ({ isCollapsed, role, userName, isMobile, onClose }) => {
  const location = useLocation();

  const sections = [
    {
      id: 'DMS CORE',
      items: [
        { label: role === 'Salesman' ? 'My Dashboard' : 'System Hub', path: '/', permission: 'Dashboard.View', icon: LayoutDashboard },
        { label: 'Ops Center', path: '/daily-operations', permission: 'Finance.View', icon: Zap },
      ]
    },
    {
      id: 'LOGISTICS',
      items: [
        { label: 'Inventory', path: '/products', permission: 'Products.View', icon: Package },
        { label: 'Stock Ops', path: '/stock', permission: 'Stock.View', icon: Database },
        { label: 'Distributors', path: '/distributors', permission: 'Distributors.View', icon: Truck },
        { label: 'Routes', path: '/routes', permission: 'Invoices.View', icon: MapPin },
      ]
    },
    {
      id: 'SALES & CRM',
      items: [
        { label: 'Invoices', path: '/invoices', permission: 'Invoices.View', icon: FileText },
        { label: 'Customers', path: '/customers', permission: 'Customers.View', icon: Users },
        { label: 'Sales Crew', path: '/salesmen', permission: 'Salesmen.View', icon: Users2 },
      ]
    },
    {
      id: 'FINANCIALS',
      items: [
        { label: 'Companies', path: '/companies', permission: 'Finance.View', icon: Building2 },
        { label: 'Finance Hub', path: '/finance', permission: 'Finance.View', icon: Landmark },
        { label: 'P&L Reports', path: '/finance/p-and-l', permission: 'Finance.View', icon: BarChart3 },
        { label: 'Cash Tracking', path: '/finance/cash-flow', permission: 'Finance.View', icon: Zap },
      ]
    },
    {
      id: 'CONTROL',
      items: [
        { label: 'Reports', path: '/reports', permission: 'Reports.View', icon: BarChart3 },
        { label: 'Terminals', path: '/users', permission: 'Users.View', icon: Shield },
        { label: 'Security Logs', path: '/activity-logs', permission: 'Users.View', icon: ShieldCheck },
        { label: 'App Settings', path: '/settings', permission: 'Users.View', icon: Settings },
      ]
    }
  ];

  const checkActive = (path) => {
    if (path === '#') return false;
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  if (isMobile && isCollapsed) return null;

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 bg-[var(--bg-card)] border-r border-[var(--border)] transition-all duration-500 ease-in-out flex flex-col
        ${isCollapsed ? 'w-20' : 'w-72'}
        ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        lg:static lg:translate-x-0
      `}
    >
      {/* Sidebar Branding */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--bg-app)] bg-opacity-40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-[var(--ring)]">
            <Terminal size={22} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-black text-[var(--text-main)] tracking-tighter leading-none uppercase">DMS NEXUS</span>
              <span className="text-[9px] font-black text-[var(--primary)] tracking-[0.2em] mt-1 uppercase">Enterprise</span>
            </div>
          )}
        </div>
        
        {isMobile && !isCollapsed && (
          <button 
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors bg-[var(--secondary)] rounded-lg"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Scroller */}
      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 custom-scrollbar">
        {sections.map((section, sidx) => (
          <div key={section.id} className="mb-4 last:mb-0">
            {!isCollapsed && (
              <div className="px-6 mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">
                  {section.id}
                </span>
              </div>
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
                    onClick={isMobile ? onClose : item.onClick}
                  />
                </RequirePermission>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-app)] bg-opacity-30">
          <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-amber-300 flex items-center justify-center text-white font-black text-sm border-2 border-[var(--bg-card)] shadow-lg shadow-[var(--ring)]">
                {userName?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-black text-[var(--text-main)] truncate uppercase tracking-tight">{userName || 'Active Terminal'}</span>
                <span className="text-[9px] font-black text-[var(--primary)] truncate uppercase tracking-[0.1em]">{role || 'Standard'} Access</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
