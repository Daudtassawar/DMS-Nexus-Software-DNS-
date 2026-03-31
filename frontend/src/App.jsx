import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import SalesmanDashboard from './pages/SalesmanDashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import InvoiceDetail from './pages/InvoiceDetail';
import CumulativeInvoice from './pages/CumulativeInvoice';
import BulkPrint from './pages/BulkPrint';
import Stock from './pages/Stock';
import Salesmen from './pages/Salesmen';
import Distributors from './pages/Distributors';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import SetPassword from './pages/SetPassword';
import Users from './pages/Users';
import RolesManagement from './pages/RolesManagement';
import DailyOperationsCenter from './pages/DailyOperationsCenter';
import SystemActivityLogs from './pages/SystemActivityLogs';
import Companies from './pages/Companies';
import CompanyLedger from './pages/CompanyLedger';
import CustomerLedger from './pages/CustomerLedger';
import FinancialDashboard from './pages/FinancialDashboard';
import ProfitLossReport from './pages/ProfitLossReport';
import CashFlowTracking from './pages/CashFlowTracking';
import ProductProfitAnalysis from './pages/ProductProfitAnalysis';
import SalesForecast from './pages/SalesForecast';
import BalanceSheet from './pages/BalanceSheet';
import RoutesPage from './pages/Routes';
import VehiclesPage from './pages/Vehicles';

import RequirePermission from './components/RequirePermission';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import authService from './services/authService';

function App() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
  const currentUser = authService.getCurrentUser();
  const user = currentUser?.user;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 1024) {
        setIsSidebarCollapsed(false);
      } else {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 1024;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/set-password" element={<SetPassword />} />

        {/* Protected Layout */}
        <Route path="/*" element={
          currentUser ? (
            <div className="h-screen overflow-hidden flex lg:flex-row flex-col">
              <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                role={user?.role} 
                userName={user?.userName}
                isMobile={isMobile}
                onClose={() => setIsSidebarCollapsed(true)}
              />
              
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <Navbar 
                  onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  isSidebarOpen={!isSidebarCollapsed}
                  isMobile={isMobile}
                />
                
                {/* Mobile Backdrop - Ensure it's above content but below sidebar */}
                {!isSidebarCollapsed && (
                  <div 
                    className="fixed inset-0 bg-black/70 z-[45] lg:hidden"
                    onClick={() => setIsSidebarCollapsed(true)}
                  ></div>
                )}
                
                <main className="flex-1 overflow-y-auto p-3 md:p-6 lg:p-8 bg-[var(--bg-app)]">
                    <Routes>
                    <Route path="/" element={<RequirePermission permission="Dashboard.View">{user?.role === 'Salesman' ? <SalesmanDashboard /> : <Dashboard />}</RequirePermission>} />
                    <Route path="/daily-operations" element={<RequirePermission permission="Finance.View"><DailyOperationsCenter /></RequirePermission>} />
                    <Route path="/invoices" element={<RequirePermission permission="Invoices.View"><Invoices /></RequirePermission>} />
                    <Route path="/invoices/loading-summary" element={<RequirePermission permission="Invoices.View"><CumulativeInvoice /></RequirePermission>} />
                    <Route path="/invoices/bulk-print" element={<RequirePermission permission="Invoices.View"><BulkPrint /></RequirePermission>} />
                    <Route path="/invoices/create" element={<RequirePermission permission="Invoices.Create"><CreateInvoice /></RequirePermission>} />
                    <Route path="/invoices/edit/:id" element={<RequirePermission permission="Invoices.Edit"><CreateInvoice /></RequirePermission>} />
                    <Route path="/invoices/:id" element={<RequirePermission permission="Invoices.View"><InvoiceDetail /></RequirePermission>} />
                    <Route path="/products" element={<RequirePermission permission="Products.View"><Products /></RequirePermission>} />
                    <Route path="/customers" element={<RequirePermission permission="Customers.View"><Customers /></RequirePermission>} />
                    <Route path="/customer-ledger/:id" element={<RequirePermission permission="Customers.View"><CustomerLedger /></RequirePermission>} />
                    <Route path="/stock" element={<RequirePermission permission="Stock.View"><Stock /></RequirePermission>} />
                    <Route path="/salesmen" element={<RequirePermission permission="Salesmen.View"><Salesmen /></RequirePermission>} />
                    <Route path="/reports" element={<RequirePermission permission="Reports.View"><Reports /></RequirePermission>} />
                    <Route path="/users" element={<RequirePermission permission="Users.View"><Users /></RequirePermission>} />
                    <Route path="/roles" element={<RequirePermission permission="Users.View"><RolesManagement /></RequirePermission>} />
                    <Route path="/distributors" element={<RequirePermission permission="Distributors.View"><Distributors /></RequirePermission>} />
                    <Route path="/activity-logs" element={<RequirePermission permission="Users.View"><SystemActivityLogs /></RequirePermission>} />
                    <Route path="/companies" element={<RequirePermission permission="Finance.View"><Companies /></RequirePermission>} />
                    <Route path="/company-ledger/:id" element={<RequirePermission permission="Finance.View"><CompanyLedger /></RequirePermission>} />
                    
                    {/* Accounting & Finance Module */}
                    <Route path="/finance" element={<RequirePermission permission="Finance.View"><FinancialDashboard /></RequirePermission>} />
                    <Route path="/finance/p-and-l" element={<RequirePermission permission="Finance.View"><ProfitLossReport /></RequirePermission>} />
                    <Route path="/finance/cash-flow" element={<RequirePermission permission="Finance.View"><CashFlowTracking /></RequirePermission>} />
                    <Route path="/finance/product-profit" element={<RequirePermission permission="Finance.View"><ProductProfitAnalysis /></RequirePermission>} />
                    <Route path="/finance/forecast" element={<RequirePermission permission="Finance.View"><SalesForecast /></RequirePermission>} />
                    <Route path="/finance/balance-sheet" element={<RequirePermission permission="Finance.View"><BalanceSheet /></RequirePermission>} />
                    
                    {/* Routes & Vehicles */}
                    <Route path="/routes" element={<RequirePermission permission="Invoices.View"><RoutesPage /></RequirePermission>} />
                    <Route path="/vehicles" element={<RequirePermission permission="Invoices.View"><VehiclesPage /></RequirePermission>} />
                  </Routes>
                  
                </main>
              </div>
            </div>
          ) : <Navigate to="/login" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
