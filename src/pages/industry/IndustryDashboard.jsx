import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { industryService } from '../../services/industry';
import { adminService } from '../../services/admin';
import { authService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { formatINR } from '../../components/Layout';
import { Box, FileText, ShoppingBag, Weight, Clock, AlertTriangle, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const IndustryDashboard = () => {
  const { user } = useAuth();
  const [industries, setIndustries] = useState([]);
  const [rates, setRates] = useState(null);
  const [inventory, setInventory] = useState({ mixedPaperKg: 0, cardboardKg: 0, whitePaperKg: 0 });
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({ totalOrders: 0, fulfilledOrders: 0, pendingPayments: 0 });
  const [finSummary, setFinSummary] = useState({ totalPaid: 0, totalPending: 0 });
  const [invoicesList, setInvoicesList] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [industriesData, ratesData, inventoryData, rawOrdersData, invoicesListData] = await Promise.all([
          adminService.getIndustries().catch(() => []),
          adminService.getRates().catch(() => null),
          adminService.getInventory().catch(() => ({ mixedPaperKg: 0, cardboardKg: 0, whitePaperKg: 0 })),
          Promise.resolve(industryService.getOrders(user.id)).catch(() => []),
          Promise.resolve(industryService.getIndustryPayments(user.id)).catch(() => [])
        ]);
        
        const ordersData = rawOrdersData || [];
        const paymentsData = invoicesListData || [];
        const metricsData = industryService.getDashboardData(user.id, ordersData);
        const finSummaryData = await industryService.getIndustryFinancialSummary(user.id, ordersData, paymentsData);
        setIndustries(Array.isArray(industriesData) ? industriesData : []);
        setRates(ratesData);
        setInventory(inventoryData);
        setMetrics(metricsData);
        setFinSummary(finSummaryData);
        setInvoicesList(paymentsData);
        setRecentOrders(Array.isArray(ordersData) ? ordersData.reverse().slice(0, 5) : []);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const industry = industries.find(i => i.id === user?.id) || {};

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  const ratesConfigured = rates && 
                         rates.mixedPaperSell !== null && 
                         rates.cardboardSell !== null && 
                         rates.whitePaperSell !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>Welcome, {industry.companyName}!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Here is your PulpChain industry dashboard.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Status:</span>
          {industry.status === 'approved' ? (
            <span className="badge badge-approved" style={{ gap: '4px' }}>
              <ShieldCheck size={14} /> Active Buyer
            </span>
          ) : (
            <span className="badge badge-pending">{industry.status}</span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-6">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px' }}>
          <div style={{ padding: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
            <ShoppingBag size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>TOTAL ORDERS</span>
            <h3 style={{ fontSize: '1.1rem', marginTop: '2px' }}>{finSummary.totalOrders}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px' }}>
          <div style={{ padding: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
            <Weight size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>WEIGHT</span>
            <h3 style={{ fontSize: '1.1rem', marginTop: '2px' }}>{finSummary.totalQtyPurchased} kg</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px' }}>
          <div style={{ padding: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
            <FileText size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>INVOICES</span>
            <h3 style={{ fontSize: '1.1rem', marginTop: '2px' }}>{invoicesList.length}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fee2e2', color: 'var(--danger)', borderRadius: 'var(--radius-md)' }}>
            <Clock size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>OUTSTANDING</span>
            <h3 style={{ fontSize: '1.1rem', marginTop: '2px', color: 'var(--danger)' }}>{formatINR(finSummary.outstandingAmount)}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px' }}>
          <div style={{ padding: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
            <FileText size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>TOTAL PAID</span>
            <h3 style={{ fontSize: '1.1rem', marginTop: '2px', color: 'var(--success)' }}>{formatINR(finSummary.paidAmount)}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px' }}>
          <div style={{ padding: '8px', backgroundColor: '#e0f2fe', color: 'var(--info)', borderRadius: 'var(--radius-md)' }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>ACTIVE CONTRACTS</span>
            <h3 style={{ fontSize: '1.1rem', marginTop: '2px' }}>{finSummary.activeContractsCount}</h3>
          </div>
        </div>
      </div>

      {/* Stock Levels & Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className="grid-cols-2">
        
        {/* Available Stocks card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3>Available Stock & Selling Price</h3>
          
          {!ratesConfigured ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px 0', textAlign: 'center' }}>
              <AlertTriangle size={28} style={{ color: 'var(--warning)' }} />
              <strong>Rates are being configured</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin has not configured selling price metrics yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
                <div>
                  <strong>White Paper</strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available: {inventory.whitePaperKg || 0} kg</span>
                </div>
                <strong style={{ color: 'var(--primary)' }}>{formatINR(rates.whitePaperSell)} / kg</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
                <div>
                  <strong>Cardboard</strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available: {inventory.cardboardKg || 0} kg</span>
                </div>
                <strong style={{ color: 'var(--primary)' }}>{formatINR(rates.cardboardSell)} / kg</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
                <div>
                  <strong>Mixed Paper</strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available: {inventory.mixedPaperKg || 0} kg</span>
                </div>
                <strong style={{ color: 'var(--primary)' }}>{formatINR(rates.mixedPaperSell)} / kg</strong>
              </div>

              <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Minimum Order MOQ: <strong>{rates.moq || 0} kg</strong></span>
                <span>Last updated: {rates.lastUpdated ? new Date(rates.lastUpdated).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '12px' }}>
            <Link to="/industry/request-order" className="btn btn-primary btn-sm btn-full">
              Place Order Request
            </Link>
            <Link to="/industry/contracts" className="btn btn-secondary btn-sm btn-full">
              Request supply contract
            </Link>
          </div>
        </div>

        {/* Recent Orders log */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Recent Orders History</h3>
            <Link to="/industry/orders" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          {metrics.recentOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <Box size={36} />
              <h4 className="empty-state-title" style={{ fontSize: '1rem' }}>No orders placed yet</h4>
              <p style={{ fontSize: '0.8rem', margin: '4px 0 12px 0' }}>Data will appear after operations begin.</p>
              <Link to="/industry/request-order" className="btn btn-secondary btn-sm">Place first order</Link>
            </div>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Material</th>
                    <th>Qty (kg)</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {o.paperType === 'mixedPaper' ? 'Mixed Paper' : o.paperType === 'cardboard' ? 'Cardboard' : 'White Paper'}
                      </td>
                      <td>{o.quantity} kg</td>
                      <td style={{ fontWeight: 600 }}>{formatINR(o.amount)}</td>
                      <td>
                        <span className={`badge badge-${o.status}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default IndustryDashboard;
