import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import InvoiceDetail from './pages/InvoiceDetail';
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

import RequirePermission from './components/RequirePermission';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AIContextAssistant from './components/AIContextAssistant';
import authService from './services/authService';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const currentUser = authService.getCurrentUser();
  const user = currentUser?.user;

  if (!currentUser && !['/login', '/register', '/verify-email'].includes(window.location.pathname)) {
    // Note: This logic is a bit crude but keeps the routing safe
  }

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
            <div className="flex h-screen bg-[var(--bg-app)] overflow-hidden">
              <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                role={user?.role} 
                userName={user?.userName} 
              />
              
              <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                
                <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-slide-in">
                  <Routes>
                    <Route path="/" element={<RequirePermission permission="Dashboard.View"><Dashboard /></RequirePermission>} />
                    <Route path="/daily-operations" element={<RequirePermission permission="Finance.View"><DailyOperationsCenter /></RequirePermission>} />
                    <Route path="/invoices" element={<RequirePermission permission="Invoices.View"><Invoices /></RequirePermission>} />
                    <Route path="/invoices/create" element={<RequirePermission permission="Invoices.Create"><CreateInvoice /></RequirePermission>} />
                    <Route path="/invoices/edit/:id" element={<RequirePermission permission="Invoices.Edit"><CreateInvoice /></RequirePermission>} />
                    <Route path="/invoices/:id" element={<RequirePermission permission="Invoices.View"><InvoiceDetail /></RequirePermission>} />
                    <Route path="/products" element={<RequirePermission permission="Products.View"><Products /></RequirePermission>} />
                    <Route path="/customers" element={<RequirePermission permission="Customers.View"><Customers /></RequirePermission>} />
                    <Route path="/stock" element={<RequirePermission permission="Stock.View"><Stock /></RequirePermission>} />
                    <Route path="/salesmen" element={<RequirePermission permission="Salesmen.View"><Salesmen /></RequirePermission>} />
                    <Route path="/reports" element={<RequirePermission permission="Reports.View"><Reports /></RequirePermission>} />
                    <Route path="/users" element={<RequirePermission permission="Users.View"><Users /></RequirePermission>} />
                    <Route path="/roles" element={<RequirePermission permission="Users.View"><RolesManagement /></RequirePermission>} />
                    <Route path="/distributors" element={<RequirePermission permission="Distributors.View"><Distributors /></RequirePermission>} />
                    <Route path="/activity-logs" element={<RequirePermission permission="Users.View"><SystemActivityLogs /></RequirePermission>} />
                  </Routes>
                  
                  <AIContextAssistant />
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
