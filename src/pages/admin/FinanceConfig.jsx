import React from 'react';
import { financeService } from '../../services/finance';
import { formatINR } from '../../utils/format';
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
import { Info } from 'lucide-react';

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

export const FinanceConfig = () => {
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    financeService.getFinancialSummary()
      .then(data => setSummary(data || {}))
      .catch(e => { console.error('Finance error', e); setSummary({}); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading financial data...</div>;

  // Chart data config
  const financialChartData = {
    labels: ['Financial Flow (INR)'],
    datasets: [
      {
        label: 'Revenue (Sales)',
        data: [summary?.revenue || 0],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
      {
        label: 'Expenses (School Payouts)',
        data: [summary?.expenses || 0],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
      {
        label: 'Net Profit',
        data: [summary?.netProfit || 0],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      }
    ]
  };

  const volumeChartData = {
    labels: ['Material Volumes (kg)'],
    datasets: [
      {
        label: 'Purchased Weight',
        data: [summary?.purchasedKg || 0],
        backgroundColor: 'rgba(245, 158, 11, 0.7)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
      {
        label: 'Sold Weight',
        data: [summary?.soldKg || 0],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      }
    ]
  };

  // Compile monthly profit trends or general timelines
  const profitTrendData = {
    labels: ['Initial Stage', 'Current Stage'],
    datasets: [
      {
        label: 'Net Profit Trend (₹)',
        data: [0, summary?.netProfit || 0],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#64748b',
          font: { family: 'Plus Jakarta Sans', weight: '600' }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
      y: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem' }}>Financial Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>Operations audit, payout statistics, and profit margins analysis.</p>
      </div>

      {/* Financial KPI stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '24px' }}>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>REVENUE TOTAL</span>
          <h2 style={{ color: 'var(--success)', marginTop: '4px' }}>{formatINR(summary?.revenue || 0)}</h2>
        </div>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>GST COLLECTED</span>
          <h2 style={{ color: 'var(--primary)', marginTop: '4px' }}>{formatINR(summary?.gstCollected || 0)}</h2>
        </div>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>INVOICE TOTAL</span>
          <h2 style={{ color: 'var(--success)', marginTop: '4px' }}>{formatINR(summary?.invoiceTotal || 0)}</h2>
        </div>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>EXPENSES</span>
          <h2 style={{ color: 'var(--danger)', marginTop: '4px' }}>{formatINR(summary?.expenses || 0)}</h2>
        </div>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>NET PROFIT</span>
          <h2 style={{ color: 'var(--info)', marginTop: '4px' }}>{formatINR(summary?.netProfit || 0)}</h2>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid-cols-3">
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL INVENTORY VALUE</span>
          <h3 style={{ marginTop: '4px' }}>{formatINR(summary?.inventoryValue || 0)}</h3>
        </div>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PROCURED (KG)</span>
          <h3 style={{ marginTop: '4px' }}>{summary?.purchasedKg || 0} kg</h3>
        </div>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SOLD (KG)</span>
          <h3 style={{ marginTop: '4px' }}>{summary?.soldKg || 0} kg</h3>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className="grid-cols-2">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3>Revenue vs Payout Flow</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Bar data={financialChartData} options={chartOptions} />
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3>Volume Recycled vs Sold</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Bar data={volumeChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3>Profit Trend Analysis</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Line data={profitTrendData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Margin Summary Details */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={20} style={{ color: 'var(--primary)' }} />
          Operations Ledger Audit Summaries
        </h3>
        <div className="grid-cols-3" style={{ gap: '24px' }}>
          <div>
            <strong>Purchased Weight (Total)</strong>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              {summary?.purchasedKg || 0} kg
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total weight cleared by logistics</span>
          </div>

          <div>
            <strong>Sold Weight (Total)</strong>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              {summary?.soldKg || 0} kg
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total processed weight shipped to buyers</span>
          </div>

          <div>
            <strong>Operational Leverage</strong>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>
              {(summary?.purchasedKg || 0) > 0 ? (((summary?.soldKg || 0) / summary.purchasedKg) * 100).toFixed(1) : 0}%
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ratio of sold materials vs purchased cargo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FinanceConfig;
