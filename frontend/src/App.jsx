import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';

// Lazy load page components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SalesmanDashboard = lazy(() => import('./pages/SalesmanDashboard'));
const Products = lazy(() => import('./pages/Products'));
const Customers = lazy(() => import('./pages/Customers'));
const Invoices = lazy(() => import('./pages/Invoices'));
const CreateInvoice = lazy(() => import('./pages/CreateInvoice'));
const InvoiceDetail = lazy(() => import('./pages/InvoiceDetail'));
const CumulativeInvoice = lazy(() => import('./pages/CumulativeInvoice'));
const BulkPrint = lazy(() => import('./pages/BulkPrint'));
const Stock = lazy(() => import('./pages/Stock'));
const Salesmen = lazy(() => import('./pages/Salesmen'));
const Distributors = lazy(() => import('./pages/Distributors'));
const Reports = lazy(() => import('./pages/Reports'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const SetPassword = lazy(() => import('./pages/SetPassword'));
const Users = lazy(() => import('./pages/Users'));
const RolesManagement = lazy(() => import('./pages/RolesManagement'));
const DailyOperationsCenter = lazy(() => import('./pages/DailyOperationsCenter'));
const SystemActivityLogs = lazy(() => import('./pages/SystemActivityLogs'));
const Companies = lazy(() => import('./pages/Companies'));
const CompanyLedger = lazy(() => import('./pages/CompanyLedger'));
const CustomerLedger = lazy(() => import('./pages/CustomerLedger'));
const FinancialDashboard = lazy(() => import('./pages/FinancialDashboard'));
const ProfitLossReport = lazy(() => import('./pages/ProfitLossReport'));
const CashFlowTracking = lazy(() => import('./pages/CashFlowTracking'));
const ProductProfitAnalysis = lazy(() => import('./pages/ProductProfitAnalysis'));
const SalesForecast = lazy(() => import('./pages/SalesForecast'));
const BalanceSheet = lazy(() => import('./pages/BalanceSheet'));
const RoutesPage = lazy(() => import('./pages/Routes'));
const VehiclesPage = lazy(() => import('./pages/Vehicles'));
const SystemSettings = lazy(() => import('./pages/SystemSettings'));

// Loading Fallback Component
const PageLoader = () => (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-[var(--border)] border-t-[var(--primary)] rounded-2xl animate-spin shadow-xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-ping"></div>
            </div>
        </div>
        <div className="flex flex-col items-center">
            <h2 className="text-lg font-black text-[var(--text-main)] uppercase tracking-[0.3em] animate-pulse">DMS NEXUS</h2>
            <div className="flex items-center gap-2 mt-2">
                <span className="w-8 h-0.5 bg-[var(--primary)] rounded-full animate-pulse"></span>
                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Synchronizing Core Systems</p>
                <span className="w-8 h-0.5 bg-[var(--primary)] rounded-full animate-pulse"></span>
            </div>
        </div>
    </div>
);

import RequirePermission from './components/RequirePermission';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import authService from './services/authService';

function App() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
  const currentUser = authService?.getCurrentUser?.();
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
      <Suspense fallback={<PageLoader />}>
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
                  
                  {/* Mobile Backdrop */}
                  {!isSidebarCollapsed && isMobile && (
                    <div 
                      className="fixed inset-0 z-[45] lg:hidden"
                      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
                      onClick={() => setIsSidebarCollapsed(true)}
                    ></div>
                  )}
                  
                  <main className="flex-1 overflow-y-auto p-3 md:p-6 lg:p-8 bg-[var(--bg-app)]">
                      <Suspense fallback={<PageLoader />}>
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
                          <Route path="/settings" element={<RequirePermission permission="Users.View"><SystemSettings /></RequirePermission>} />
                        </Routes>
                      </Suspense>
                  </main>
                </div>
              </div>
            ) : <Navigate to="/login" replace />
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
