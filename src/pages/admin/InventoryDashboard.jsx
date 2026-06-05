import React from 'react';
import { adminService } from '../../services/admin';
import { financeService } from '../../services/finance';
import { formatINR } from '../../components/Layout';
import { Scale, Milestone, Weight, History, ArrowDownLeft, ArrowUpRight, TrendingUp, BarChart2 } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const InventoryDashboard = () => {
  const inventory = adminService.getInventory();
  const summary = financeService.getFinancialSummary();
  const transactions = adminService.getInventoryTransactions().reverse(); // Newest first
  const rates = adminService.getRates();

  const ratesConfigured = rates && 
                         rates.mixedPaperSell !== null && 
                         rates.cardboardSell !== null && 
                         rates.whitePaperSell !== null;

  // Stock status helper
  const getStockStatus = (weight) => {
    if (weight <= 0) return { label: 'Out of Stock', color: 'var(--danger)', bg: '#fee2e2' };
    if (weight <= 100) return { label: 'Low Stock', color: 'var(--warning)', bg: '#fffbeb' };
    if (weight <= 500) return { label: 'Healthy', color: 'var(--success)', bg: '#d1fae5' };
    return { label: 'Overstock', color: 'var(--info)', bg: '#e0f2fe' };
  };

  // Compile visual trends from transaction histories
  const trendsMap = {};
  adminService.getInventoryTransactions().forEach(t => {
    const day = new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!trendsMap[day]) {
      trendsMap[day] = { procured: 0, sold: 0 };
    }
    if (t.type === 'in') {
      trendsMap[day].procured += t.quantity;
    } else if (t.type === 'out') {
      trendsMap[day].sold += t.quantity;
    }
  });

  const sortedDays = Object.keys(trendsMap).sort((a, b) => new Date(a) - new Date(b)).slice(-10);
  const procuredTrendData = sortedDays.map(d => trendsMap[d].procured);
  const soldTrendData = sortedDays.map(d => trendsMap[d].sold);

  // Compute a simple running inventory balance trend
  let currentRunningStock = 0;
  const balanceTrendData = sortedDays.map(d => {
    currentRunningStock += (trendsMap[d].procured - trendsMap[d].sold);
    return Math.max(0, currentRunningStock);
  });

  const chartLabels = sortedDays.length > 0 ? sortedDays : ['No Data'];
  const pData = procuredTrendData.length > 0 ? procuredTrendData : [0];
  const sData = soldTrendData.length > 0 ? soldTrendData : [0];
  const bData = balanceTrendData.length > 0 ? balanceTrendData : [0];

  const trendChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Procurement (kg)',
        data: pData,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Sales (kg)',
        data: sData,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Stock Balance (kg)',
        data: bData,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#64748b', font: { family: 'Plus Jakarta Sans', weight: '600' } } }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { display: false } },
      y: { ticks: { color: '#64748b' }, grid: { color: '#e2e8f0' } }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem' }}>Inventory & Stock Intelligence</h1>
        <p style={{ color: 'var(--text-muted)' }}>Warehouse diagnostics, stock statuses, financial asset valuations, and audit histories.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid-cols-4">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVAILABLE STOCK</span>
          <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Scale style={{ color: 'var(--primary)' }} size={20} />
            {summary.currentStock} kg
          </h2>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>INVENTORY VALUE</span>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--success)' }}>
            {formatINR(summary.inventoryValue)}
          </h2>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PROCURED</span>
          <h2 style={{ fontSize: '1.8rem' }}>{summary.purchasedKg} kg</h2>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SOLD</span>
          <h2 style={{ fontSize: '1.8rem' }}>{summary.soldKg} kg</h2>
        </div>
      </div>

      {/* Advanced Performance KPIs */}
      <div className="grid-cols-5">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TURNOVER RATE</span>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{summary.turnoverPct.toFixed(1)}%</h3>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>UTILIZATION RATE</span>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{summary.utilizationPct.toFixed(1)}%</h3>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVG BUY COST</span>
          <h3 style={{ fontSize: '1.4rem' }}>{formatINR(summary.avgProcurementCost)} /kg</h3>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVG SELL RATE</span>
          <h3 style={{ fontSize: '1.4rem' }}>{formatINR(summary.avgSellingPrice)} /kg</h3>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>GROSS MARGIN</span>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--success)' }}>{formatINR(summary.grossMargin)} /kg</h3>
        </div>
      </div>

      {/* Live Physical Stock Breakdown with Health Indicators */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3>Physical Stock Breakdown & Health</h3>
        <div className="grid-cols-3">
          {[
            { name: 'White Paper', weight: inventory.whitePaperKg || 0, sellKey: 'whitePaperSell' },
            { name: 'Cardboard', weight: inventory.cardboardKg || 0, sellKey: 'cardboardSell' },
            { name: 'Mixed Paper', weight: inventory.mixedPaperKg || 0, sellKey: 'mixedPaperSell' }
          ].map((item) => {
            const health = getStockStatus(item.weight);
            return (
              <div key={item.name} style={{ padding: '20px', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{item.name}</strong>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: health.color, backgroundColor: health.bg, padding: '4px 8px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' }}>
                    {health.label}
                  </span>
                </div>
                <p style={{ fontSize: '1.8rem', fontWeight: 700, margin: '4px 0' }}>{item.weight} kg</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Value: {ratesConfigured ? formatINR(item.weight * rates[item.sellKey]) : 'Unconfigured'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stock Analytics Trend Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={20} style={{ color: 'var(--primary)' }} /> Warehouse Stock Movements & Balance Trends
          </h3>
          <div style={{ height: '350px', position: 'relative' }}>
            <Line data={trendChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Audit Trails log */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={20} /> Stock Movement Audit Trail
        </h3>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <History size={36} />
            <h4 className="empty-state-title">No transactions logged</h4>
            <p style={{ fontSize: '0.8rem', margin: '4px 0' }}>Stock movements from completed pickups and allocated orders will log here.</p>
          </div>
        ) : (
          <div className="table-container" style={{ margin: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Direction</th>
                  <th>Material</th>
                  <th>Volume (kg)</th>
                  <th>Reference ID</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.date).toLocaleString()}</td>
                    <td>
                      {tx.type === 'in' ? (
                        <span style={{ color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ArrowDownLeft size={14} /> Incoming (+)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--danger)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ArrowUpRight size={14} /> Outgoing (-)
                        </span>
                      )}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {tx.paperType === 'mixedPaper' ? 'Mixed Paper' : tx.paperType === 'cardboard' ? 'Cardboard' : 'White Paper'}
                    </td>
                    <td style={{ fontWeight: 700 }}>{tx.quantity} kg</td>
                    <td style={{ fontFamily: 'monospace' }}>{tx.referenceId}</td>
                    <td>{tx.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default InventoryDashboard;
