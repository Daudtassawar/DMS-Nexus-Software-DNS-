import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Users, Database, 
  Users2, FileText, BarChart3, Shield, 
  Truck, Zap, LogOut, Terminal, ShieldCheck, Building2,
  TrendingUp, Landmark, MapPin
} from 'lucide-react';
import RequirePermission from './RequirePermission';
import SidebarItem from './SidebarItem';
import authService from '../services/authService';

const Sidebar = ({ isCollapsed, role, userName, isMobile, onClose }) => {
  const location = useLocation();

  const sections = [
    {
      id: 'MAIN',
      items: [
        { label: role === 'Salesman' ? 'My Day' : 'Dashboard', path: '/', permission: 'Dashboard.View', icon: LayoutDashboard },
        { label: 'Operations Center', path: '/daily-operations', permission: 'Finance.View', icon: Zap },
      ]
    },
    {
      id: 'MANAGEMENT',
      items: [
        { label: 'Companies (Suppliers)', path: '/companies', permission: 'Finance.View', icon: Building2 },
        { label: 'Products', path: '/products', permission: 'Products.View', icon: Package },
        { label: 'Customers', path: '/customers', permission: 'Customers.View', icon: Users },
        { label: 'Stock Management', path: '/stock', permission: 'Stock.View', icon: Database },
        { label: 'Sales Team', path: '/salesmen', permission: 'Salesmen.View', icon: Users2 },
        { label: 'Invoices', path: '/invoices', permission: 'Invoices.View', icon: FileText },
        { label: 'Routes', path: '/routes', permission: 'Invoices.View', icon: MapPin },
        { label: 'Vehicles', path: '/vehicles', permission: 'Invoices.View', icon: Truck },
      ]
    },
    {
      id: 'FINANCE',
      items: [
        { label: 'Financial Dashboard', path: '/finance', permission: 'Finance.View', icon: Landmark },
        { label: 'Profit & Loss', path: '/finance/p-and-l', permission: 'Finance.View', icon: BarChart3 },
        { label: 'Balance Sheet', path: '/finance/balance-sheet', permission: 'Finance.View', icon: Landmark },
        { label: 'Cash Flow', path: '/finance/cash-flow', permission: 'Finance.View', icon: Zap },
        { label: 'Product Profit', path: '/finance/product-profit', permission: 'Finance.View', icon: Package },
        { label: 'Sales Forecast', path: '/finance/forecast', permission: 'Finance.View', icon: TrendingUp },
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

  // On mobile, if collapsed, don't render at all to avoid taking space
  if (isMobile && isCollapsed) return null;

  return (
    <aside 
      style={{ display: isMobile && isCollapsed ? 'none' : 'flex' }}
      className={`
        h-screen bg-[var(--bg-card)] text-[var(--text-main)] flex flex-col border-r border-[var(--border)] transition-all duration-300 z-50 overflow-hidden
        ${isMobile ? 'fixed top-0 left-0 w-64 shadow-sm' : (isCollapsed ? 'static w-20' : 'static w-64')}
      `}
    >
      {/* Brand Identity */}
      <div className="p-6 border-b border-[var(--border)] bg-[var(--secondary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[var(--primary)] flex items-center justify-center shrink-0">
              <Terminal size={18} className="text-white"/>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none text-[var(--text-main)]">Hamdaan <span className="text-[var(--primary)]">Traders</span></span>
                <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider mt-1">ERP SYSTEM</span>
              </div>
            )}
          </div>
          
          {isMobile && !isCollapsed && (
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
            >
              <LogOut size={18} className="rotate-180" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 custom-scrollbar">
        {sections.map((section, sidx) => (
          <div key={section.id} className="mb-4 last:mb-0">
            {!isCollapsed && (
              <div className="px-6 mb-2 flex items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  {section.id}
                </span>
              </div>
            )}
            {isCollapsed && sidx > 0 && (
              <div className="mx-4 my-2 h-px bg-[var(--border)]"></div>
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

      {/* User Information */}
      <div className="p-4 mt-auto border-t border-[var(--border)] bg-[var(--secondary)]">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)] shadow-sm">
            <div className="w-8 h-8 rounded-md bg-[var(--bg-app)] text-[var(--primary)] flex items-center justify-center font-bold border border-[var(--border)] shrink-0 text-sm">
                {userName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight leading-none mb-1">User Account</p>
                <p className="font-bold truncate text-xs text-[var(--text-main)] uppercase tracking-tight">{userName}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-md bg-[var(--bg-app)] text-[var(--primary)] flex items-center justify-center font-bold border border-[var(--border)] shadow-sm text-sm">
                {userName?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

