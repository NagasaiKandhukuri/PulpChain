import React from 'react';
import { adminService } from '../../services/admin';
import { financeService } from '../../services/finance';
import { documentsService } from '../../services/documents';
import { formatINR } from '../../components/Layout';
import { Receipt, Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generatePurchaseReceiptPDF } from '../../services/purchaseReceiptGenerator';
import { supabase } from '../../lib/supabase';
import { FEATURES } from '../../lib/features';

const formatPDFCurrency = (val) => {
  if (val === null || val === undefined) return 'Rs. 0.00';
  return 'Rs. ' + Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const InvoiceGenerator = () => {
  const [activeTab, setActiveTab] = React.useState('purchase'); // 'purchase' | 'sales'
  const [pickups, setPickups] = React.useState([]);
  const [sales, setSales] = React.useState([]);
  const [schools, setSchools] = React.useState([]);
  const [payments, setPayments] = React.useState([]);
  const [industryPayments, setIndustryPayments] = React.useState([]);
  const [documentsLog, setDocumentsLog] = React.useState([]);
  const [taxRate, setTaxRate] = React.useState(18); // GST 18%

  const loadData = async () => {
    // Receipts are generated from completed/paid pickups
    const allPickups = adminService.getPickups().reverse();
    const completedOrPaid = allPickups.filter(p => p.status === 'completed' || p.status === 'paid');
    setPickups(completedOrPaid);
    
    setSales(financeService.getSales().reverse());
    const schoolsData = await adminService.getSchools();
    setSchools(Array.isArray(schoolsData) ? schoolsData : []);
    setPayments(adminService.getPayments());
    setIndustryPayments(await adminService.getAllIndustryPayments());
    setDocumentsLog(documentsService.getDocuments());
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Check if a document is already logged
  const getLoggedDoc = (refId, type) => {
    return documentsLog.find(d => d.referenceId === refId && d.type === type);
  };

  // 1. Generate Purchase Receipt PDF
  const generatePurchaseReceipt = (pickup) => {
    generatePurchaseReceiptPDF(pickup);
    loadData();
  };

  // 2. Generate Sales Invoice PDF
  const generateSalesInvoice = async (sale) => {
    try {
      let industryDetails = {};
      if (FEATURES.USE_SUPABASE_AUTH) {
        // Industry's order has industryId, but we might only have buyerName directly if sale doesn't have it.
        // Wait, the `sale` object is actually an order payment, let's see where it gets buyerName...
        // Assuming sale.buyerName is the companyName, we query by company_name.
        const { data } = await supabase
          .from('industries')
          .select('*')
          .eq('company_name', sale.buyerName)
          .single();
        if (data) {
          industryDetails = {
            contactPerson: data.contact_person,
            gstNumber: data.gst_number,
            address: data.address
          };
        }
      } else {
        const rawIndustries = JSON.parse(localStorage.getItem('pulpchain_industries') || '[]');
        industryDetails = rawIndustries.find(i => i.companyName === sale.buyerName) || {};
      }

      // Determine or log invoice metadata
      let invoiceNo = sale.invoiceNumber;
      const existingDoc = getLoggedDoc(sale.id, 'sales_invoice');
      if (!existingDoc) {
        documentsService.logDocument(
          'sales_invoice',
          invoiceNo,
          sale.id,
          sale.buyerName,
          sale.totalRevenue
        );
        loadData(); // Reload logs
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
      
      // Invoice Meta title
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("COMMERCIAL INVOICE", 130, 20);
      
      doc.setFontSize(10);
      doc.text(`Invoice No: ${invoiceNo}`, 130, 28);
      doc.text(`Date: ${new Date(sale.saleDate).toLocaleDateString()}`, 130, 34);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 42, 196, 42);
      
      // Buyer details
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text("BILL TO:", 14, 52);
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(sale.buyerName, 14, 58);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Contact Person: ${industryDetails.contactPerson || 'N/A'}`, 14, 64);
      doc.text(`GSTIN: ${industryDetails.gstNumber || 'N/A'}`, 14, 69);
      doc.text(`Address: ${industryDetails.address || 'N/A'}`, 14, 74);
      
      doc.line(14, 80, 196, 80);

      // Calculations
      const subtotal = sale.totalRevenue;
      const taxAmount = (subtotal * taxRate) / 100;
      const finalTotal = subtotal + taxAmount;

      const paperName = sale.paperType === 'mixedPaper' ? 'Mixed Paper' 
                      : sale.paperType === 'cardboard' ? 'Cardboard' 
                      : sale.paperType === 'whitePaper' ? 'White Paper' 
                      : 'General / Unsorted';

      // Table columns & rows
      const tableColumn = ["Item Description", "Qty (kg)", "Rate (per kg)", "Total Amount"];
      const tableRows = [
        [
          `Recycled Cargo - ${paperName}`,
          `${sale.quantity} kg`,
          formatPDFCurrency(sale.saleRate),
          formatPDFCurrency(subtotal)
        ]
      ];

      // Table
      autoTable(doc, {
        startY: 85,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] }, // Emerald Green
        styles: { fontSize: 10 }
      });

      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      
      doc.text("Subtotal:", 135, finalY);
      doc.text(formatPDFCurrency(subtotal), 170, finalY);
      
      doc.text(`Tax (${taxRate}% GST):`, 135, finalY + 6);
      doc.text(formatPDFCurrency(taxAmount), 170, finalY + 6);
      
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("Final Total (INR):", 135, finalY + 14);
      doc.text(formatPDFCurrency(finalTotal), 170, finalY + 14);

      // Authorized signature block for Sales Invoice
      const sigY = finalY + 40;
      doc.setDrawColor(148, 163, 184);
      doc.line(135, sigY, 190, sigY);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Authorized Signature", 145, sigY + 5);
      doc.text("PulpChain Executive", 146, sigY + 10);
      
      doc.text("Thank you for your business. Let's make circular economy sustainable.", 14, 280);

      doc.save(`Invoice-${invoiceNo}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Error generating PDF sales invoice.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>Documents Hub</h1>
          <p style={{ color: 'var(--text-muted)' }}>Generate dynamic Purchase Receipts for schools or Commercial Sales Invoices.</p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--surface-border)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setActiveTab('purchase')}
            className={`btn btn-sm ${activeTab === 'purchase' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', boxShadow: 'none' }}
          >
            Purchase Documents
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`btn btn-sm ${activeTab === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', boxShadow: 'none' }}
          >
            Sales Documents
          </button>
        </div>
      </div>

      {activeTab === 'purchase' ? (
        // --- PURCHASE DOCUMENTS HUB ---
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Purchase Receipts & Vouchers</h3>
          {pickups.length === 0 ? (
            <div className="empty-state">
              <Receipt size={48} />
              <h3 className="empty-state-title">No completed pickups yet</h3>
              <p style={{ maxWidth: '400px', margin: '8px auto' }}>
                Completed or paid collections from schools will show up here to trigger receipt sheet generation.
              </p>
            </div>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Receipt Number</th>
                    <th>School Name</th>
                    <th>Material</th>
                    <th>Weight</th>
                    <th>Amount</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pickups.map((p) => {
                    const logged = getLoggedDoc(p.id, 'purchase_receipt');
                    const receiptNo = logged ? logged.documentNumber : '--';
                    return (
                      <tr key={p.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{receiptNo}</td>
                        <td>{p.schoolName}</td>
                        <td style={{ textTransform: 'capitalize' }}>
                          {p.paperType === 'mixedPaper' ? 'Mixed Paper' : p.paperType === 'cardboard' ? 'Cardboard' : 'White Paper'}
                        </td>
                        <td>{p.actualWeight} kg</td>
                        <td style={{ fontWeight: 700 }}>{formatINR(p.amount)}</td>
                        <td>
                          <span className={`badge badge-${p.status}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => generatePurchaseReceipt(p)}
                            className="btn btn-primary btn-sm"
                            style={{ gap: '6px' }}
                          >
                            <Download size={14} /> Download PDF
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
      ) : (
        // --- SALES DOCUMENTS HUB ---
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Tax Configuration setting */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <strong>Commercial Tax Settings</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Define GST percentage value to apply to sales invoice logs.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label htmlFor="taxRate" style={{ fontWeight: 600, fontSize: '0.9rem' }}>GST %</label>
              <input
                type="number"
                id="taxRate"
                className="form-control"
                style={{ width: '80px', padding: '8px' }}
                value={taxRate}
                onChange={(e) => setTaxRate(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Commercial Invoices & Sales Receipts</h3>
            {sales.length === 0 ? (
              <div className="empty-state">
                <Receipt size={48} />
                <h3 className="empty-state-title">No commercial sales logged yet</h3>
                <p style={{ maxWidth: '400px', margin: '8px auto' }}>
                  Log cargo deliveries from industry orders to trigger sales invoice and receipts sheets generation.
                </p>
              </div>
            ) : (
              <div className="table-container" style={{ margin: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Invoice Number</th>
                      <th>Industry Name</th>
                      <th>Material</th>
                      <th>Quantity</th>
                      <th>Amount</th>
                      <th>Payment Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((s) => {
                      const subtotal = s.totalRevenue;
                      const gstVal = (subtotal * taxRate) / 100;
                      const finalVal = subtotal + gstVal;
                      const logged = getLoggedDoc(s.id, 'sales_invoice');
                      
                      // Match payment info
                      const matchedPayment = industryPayments.find(p => p.orderId === s.id.replace('sale_', ''));
                      
                      return (
                        <tr key={s.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.invoiceNumber}</td>
                          <td>{s.buyerName}</td>
                          <td style={{ textTransform: 'capitalize' }}>
                            {s.paperType === 'mixedPaper' ? 'Mixed Paper' : s.paperType === 'cardboard' ? 'Cardboard' : 'White Paper'}
                          </td>
                          <td>{s.quantity} kg</td>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(finalVal)}</td>
                          <td>
                            <span className={`badge badge-${matchedPayment ? matchedPayment.status : 'pending'}`}>
                              {matchedPayment ? matchedPayment.status : 'pending'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => generateSalesInvoice(s)}
                              className="btn btn-primary btn-sm"
                              style={{ gap: '6px' }}
                            >
                              <Download size={14} /> Download PDF
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
      )}
    </div>
  );
};
export default InvoiceGenerator;
