import React from 'react';
import { industryService } from '../../services/industry';

import { useAuth } from '../../contexts/AuthContext';
import { documentsService } from '../../services/documents';
import { formatINR } from '../../utils/format';
import { Download, FileSpreadsheet } from 'lucide-react';
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

export const IndustryInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await Promise.resolve(industryService.getIndustryInvoices(user.id));
      setInvoices(data.reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadInvoices();
  }, []);

  const downloadPDF = async (invoice) => {
    try {
      // Create Document metadata log if not exists
      const docLogs = await documentsService.getDocuments();
      const logged = docLogs.find(d => d.referenceId === invoice.saleId && d.type === 'sales_invoice');
      if (!logged) {
        await documentsService.logDocument(
          'sales_invoice',
          invoice.invoiceNumber,
          invoice.saleId,
          invoice.industryName,
          invoice.amount
        );
      }

      const orders = await Promise.resolve(industryService.getOrders(user.id));
      const order = orders.find(o => o.id === invoice.orderId) || {};

      let industryDetails = {};
      const { data } = await supabase
        .from('industries')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        industryDetails = {
          contactPerson: data.contact_person,
          gstNumber: data.gst_number,
          address: data.address,
          phone: data.phone
        };
      }

      const doc = new jsPDF();

      // Brand Header
      doc.setFontSize(22);
      doc.setTextColor(16, 185, 129); // Emerald Green
      doc.text("PulpChain", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("Convert waste paper into value.", 14, 25);
      doc.text("B2B Circular Economy Network", 14, 30);

      // Title & Meta
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("COMMERCIAL INVOICE", 130, 20);

      doc.setFontSize(10);
      doc.text(`Invoice No: ${invoice.invoiceNumber}`, 130, 28);
      doc.text(`Invoice Date: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString()}`, 130, 34);

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 40, 196, 40);

      // Industry Details
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("CUSTOMER DETAILS (BILL TO):", 14, 48);
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(invoice.industryName || 'Unknown Industry', 14, 54);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Contact Person: ${industryDetails.contactPerson || 'N/A'}`, 14, 60);
      doc.text(`GSTIN: ${industryDetails.gstNumber || 'N/A'}`, 14, 65);
      doc.text(`Address: ${industryDetails.address || 'N/A'}`, 14, 70);
      doc.text(`Phone: ${industryDetails.phone || 'N/A'}`, 14, 75);

      // Divider
      doc.line(14, 82, 196, 82);

      // Order Items Calculation
      // Note: invoice.amount already includes GST as calculated by the backend.
      const taxRate = 18; // 18% GST standard
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
        startY: 88,
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
      doc.text("PulpChain Finance Team", 143, sigY + 10);

      // Wire Settlement Details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("Wire Settlement Details", 14, sigY - 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Bank Name: State Bank of India", 14, sigY);
      doc.text("Account Number: 40291039910", 14, sigY + 5);
      doc.text("IFSC Code: SBIN0004019", 14, sigY + 10);
      doc.text("Beneficiary: PulpChain Recycling Private Limited", 14, sigY + 15);

      doc.text("Thank you for partnering with PulpChain. Sustainable recycling certified.", 14, 280);

      doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Error exporting PDF Invoice.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem' }}>Commercial Invoices</h1>
        <p style={{ color: 'var(--text-muted)' }}>View and download legal tax invoices generated for completed cargo deliveries.</p>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Your B2B Invoices</h3>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <FileSpreadsheet size={48} />
            <h3 className="empty-state-title">No invoices available</h3>
            <p style={{ maxWidth: '400px', margin: '4px auto' }}>Invoices will appear here automatically when orders are delivered and marked completed by the admin.</p>
          </div>
        ) : (
          <div className="table-container" style={{ margin: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Date Generated</th>
                  <th>Order Payout (Excl. Tax)</th>
                  <th>GST (18%)</th>
                  <th>Grand Total</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const subtotal = inv.baseAmount || inv.amount;
                  const gst = inv.gstAmount || 0;
                  const grandTotal = inv.amount; // Amount already includes GST
                  return (
                    <tr key={inv.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                      <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td>{formatINR(subtotal)}</td>
                      <td>{formatINR(gst)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(grandTotal)}</td>
                      <td>
                        <span className={`badge badge-${inv.status}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => downloadPDF(inv)}
                          className="btn btn-primary btn-sm"
                          style={{ gap: '6px' }}
                        >
                          <Download size={14} /> Download Invoice
                        </button>
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
export default IndustryInvoices;
