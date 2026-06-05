import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from './ProtectedRoute';

// Public pages
import { Home } from '../pages/public/Home';
import { About } from '../pages/public/About';
import { Pricing } from '../pages/public/Pricing';
import { Contact } from '../pages/public/Contact';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';
import { Marketplace } from '../pages/public/Marketplace';
import { ForIndustries } from '../pages/public/ForIndustries';
import { RegisterIndustry } from '../pages/public/RegisterIndustry';
import { ForgotPassword } from '../pages/public/ForgotPassword';
import { ResetPassword } from '../pages/public/ResetPassword';

// School pages
import { SchoolDashboard } from '../pages/school/Dashboard';
import { RequestPickup } from '../pages/school/RequestPickup';
import { SchoolPickups } from '../pages/school/PickupHistory';
import { SchoolPayments } from '../pages/school/Payments';

// Industry pages (Phase 2)
import { IndustryLogin } from '../pages/industry/IndustryLogin';
import { IndustryDashboard } from '../pages/industry/IndustryDashboard';
import { RequestOrder } from '../pages/industry/RequestOrder';
import { OrderHistory } from '../pages/industry/OrderHistory';
import { IndustryContracts } from '../pages/industry/IndustryContracts';
import { IndustryInvoices } from '../pages/industry/IndustryInvoices';
import { IndustryPayments } from '../pages/industry/IndustryPayments';
import { IndustryDocuments } from '../pages/industry/IndustryDocuments';

// Admin pages
import { AdminLogin } from '../pages/admin/AdminLogin';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { SchoolsList } from '../pages/admin/SchoolsList';
import { PickupsList } from '../pages/admin/PickupsList';
import { RatesConfig } from '../pages/admin/RatesConfig';
import { SalesConfig } from '../pages/admin/SalesConfig';
import { InvoiceGenerator } from '../pages/admin/InvoiceGenerator';
import { FinanceConfig } from '../pages/admin/FinanceConfig';
import { ManageIndustries } from '../pages/admin/ManageIndustries';
import { ManageOrders } from '../pages/admin/ManageOrders';
import { InventoryDashboard } from '../pages/admin/InventoryDashboard';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
      <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
      <Route path="/for-industries" element={<Layout><ForIndustries /></Layout>} />
      <Route path="/register-industry" element={<Layout><RegisterIndustry /></Layout>} />
      <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
      <Route path="/reset-password" element={<Layout><ResetPassword /></Layout>} />

      {/* School Protected Pages */}
      <Route
        path="/school/dashboard"
        element={
          <ProtectedRoute allowedRole="school">
            <Layout>
              <SchoolDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/request"
        element={
          <ProtectedRoute allowedRole="school">
            <Layout>
              <RequestPickup />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/pickups"
        element={
          <ProtectedRoute allowedRole="school">
            <Layout>
              <SchoolPickups />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/payments"
        element={
          <ProtectedRoute allowedRole="school">
            <Layout>
              <SchoolPayments />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Industry Portal Open Route */}
      <Route path="/industry/login" element={<Layout><IndustryLogin /></Layout>} />

      {/* Industry Protected Pages */}
      <Route
        path="/industry/dashboard"
        element={
          <ProtectedRoute allowedRole="industry">
            <Layout>
              <IndustryDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/industry/request-order"
        element={
          <ProtectedRoute allowedRole="industry">
            <Layout>
              <RequestOrder />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/industry/orders"
        element={
          <ProtectedRoute allowedRole="industry">
            <Layout>
              <OrderHistory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/industry/invoices"
        element={
          <ProtectedRoute allowedRole="industry">
            <Layout>
              <IndustryInvoices />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/industry/payments"
        element={
          <ProtectedRoute allowedRole="industry">
            <Layout>
              <IndustryPayments />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/industry/documents"
        element={
          <ProtectedRoute allowedRole="industry">
            <Layout>
              <IndustryDocuments />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/industry/contracts"
        element={
          <ProtectedRoute allowedRole="industry">
            <Layout>
              <IndustryContracts />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Auth Pages */}
      <Route path="/admin/login" element={<Layout><AdminLogin /></Layout>} />

      {/* Admin Protected Pages */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/schools"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <SchoolsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/industries"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <ManageIndustries />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pickups"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <PickupsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <ManageOrders />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <InventoryDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rates"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <RatesConfig />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sales"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <SalesConfig />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/documents"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <InvoiceGenerator />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/finance"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <FinanceConfig />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Wildcard fallback redirects */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
