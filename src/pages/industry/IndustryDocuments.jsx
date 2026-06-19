import React from 'react';
import { industryService } from '../../services/industry';
import { authService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { formatINR } from '../../components/Layout';
import { FileText, Download, Scale, ArrowUpRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../../lib/supabase';

const formatPDFCurrency = (val) => {
  if (val === null || val === undefined) return 'Rs. 0.00';
  return 'Rs. ' + Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const IndustryDocuments = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const [invoicesData, ordersData] = await Promise.all([
        Promise.resolve(industryService.getIndustryInvoices(user.id)),
        Promise.resolve(industryService.getOrders(user.id))
      ]);
      setInvoices(invoicesData.reverse());
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadDocuments();
  }, []);

  const downloadPDF = async (invoice) => {
    try {
      const currentOrders = await Promise.resolve(industryService.getOrders(user.id));
      const order = currentOrders.find(o => o.id === invoice.orderId) || {};
      
      let industryDetails = {};
      const { data } = await supabase
        .from('industries')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        industryDetails = {
          companyName: data.company_name,
          contactPerson: data.contact_person,
          gstNumber: data.gst_number,
          address: data.address,
          phone: data.phone
        };
      }

      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(16, 185, 129); // Emerald Green
      doc.text("PulpChain", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("Convert waste paper into value.", 14, 25);
      doc.text("B2B Circular Economy Network", 14, 30);

      // Title & Meta info
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("COMMERCIAL INVOICE", 130, 20);

      doc.setFontSize(10);
      doc.text(`Invoice No: ${invoice.invoiceNumber}`, 130, 28);
      doc.text(`Invoice Date: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString()}`, 130, 34);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 40, 196, 40);

      // Customer details
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("CUSTOMER DETAILS (BILL TO):", 14, 48);
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(industryDetails.companyName || 'Unknown Industry', 14, 54);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Contact Person: ${industryDetails.contactPerson || 'N/A'}`, 14, 60);
      doc.text(`GSTIN: ${industryDetails.gstNumber || 'N/A'}`, 14, 65);
      doc.text(`Address: ${industryDetails.address || 'N/A'}`, 14, 70);

      doc.line(14, 80, 196, 80);

      // Table mapping details
      // Note: invoice.amount already includes GST as calculated by the backend.
      const taxRate = 18;
      const subtotal = invoice.baseAmount || invoice.amount;
      const gstAmount = invoice.gstAmount || 0;
      const grandTotal = invoice.amount;

      const paperName = order.paperType === 'mixedPaper' ? 'Mixed Paper' 
                      : order.paperType === 'cardboard' ? 'Cardboard' 
                      : order.paperType === 'whitePaper' ? 'White Paper' 
                      : 'General / Unsorted';

      const tableColumn = ["Paper Material Type", "Quantity (kg)", "Rate (per kg)", "Total (Excl. Tax)"];
      const tableRows = [
        [
          paperName,
          `${order.quantity || 0} kg`,
          formatPDFCurrency(order.rate || 0),
          formatPDFCurrency(subtotal)
        ]
      ];

      autoTable(doc, {
        startY: 85,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 10 }
      });

      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("Subtotal:", 130, finalY);
      doc.text(formatPDFCurrency(subtotal), 170, finalY);

      doc.text(`GST (${taxRate}%):`, 130, finalY + 6);
      doc.text(formatPDFCurrency(gstAmount), 170, finalY + 6);

      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("Grand Total (INR):", 130, finalY + 14);
      doc.text(formatPDFCurrency(grandTotal), 170, finalY + 14);

      // Signature Block
      const sigY = finalY + 45;
      doc.setDrawColor(148, 163, 184);
      doc.line(135, sigY, 190, sigY);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Authorized Signature", 145, sigY + 5);

      doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Error exporting PDF Invoice.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem' }}>Historical Documents & Invoices</h1>
        <p style={{ color: 'var(--text-muted)' }}>View commercial sales tax invoices, order specifics, and download transaction logs.</p>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <Box size={48} />
            <h3 className="empty-state-title">No documents available</h3>
            <p style={{ maxWidth: '400px', margin: '4px auto' }}>Invoice sheets will generate automatically once the order logistics status is marked Completed.</p>
          </div>
        ) : (
          <div className="table-container" style={{ margin: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Date</th>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const order = orders.find(o => o.id === inv.orderId) || {};
                  const paperName = order.paperType === 'mixedPaper' ? 'Mixed Paper' 
                                  : order.paperType === 'cardboard' ? 'Cardboard' 
                                  : order.paperType === 'whitePaper' ? 'White Paper' 
                                  : 'Recycled Fiber';
                  return (
                    <tr key={inv.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                      <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td style={{ textTransform: 'capitalize' }}>{paperName}</td>
                      <td>{order.quantity || 0} kg</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(inv.amount)}</td>
                      <td>
                        <span className={`badge badge-${inv.status}`}>{inv.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => downloadPDF(inv)} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
                            <Download size={14} /> Download PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default IndustryDocuments;
