import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { documentsService } from '../services/documents';
import { supabase } from '../lib/supabase';
import QRCode from 'qrcode';

const formatPDFCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return 'Rs. 0.00';
  return 'Rs. ' + Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const numberToWords = (num) => {
  const roundedNum = Math.floor(Number(num));
  if (roundedNum === 0 || isNaN(roundedNum)) return 'Rupees Zero Only';

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numStr = roundedNum.toString();
  if (numStr.length > 9) return 'Amount too large';

  const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';

  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';

  return 'Rupees ' + str.trim() + ' Only';
};

export const generatePurchaseReceiptPDF = async (pickup) => {
  try {
    let schoolInfo = {};
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', pickup.schoolId)
      .single();

    if (!error && data) {
      schoolInfo = {
        name: data.name,
        contactPerson: data.contact_person,
        phone: data.phone,
        email: data.email,
        address: data.address
      };
    }

    const { data: paymentInfoData } = await supabase
      .from('payments')
      .select('*')
      .eq('pickup_id', pickup.id)
      .single();
    const paymentInfo = paymentInfoData || {};

    // Determine Receipt Number
    let receiptNo = '';
    const docLogs = await documentsService.getDocuments();
    const existingDoc = docLogs.find(d => d.referenceId === pickup.id && d.type === 'purchase_receipt');
    if (existingDoc) {
      receiptNo = existingDoc.documentNumber;
    } else {
      receiptNo = `REC-${new Date(pickup.completedDate || Date.now()).toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
      await documentsService.logDocument(
        'purchase_receipt',
        receiptNo,
        pickup.id,
        pickup.schoolName || schoolInfo.name || 'Unknown',
        pickup.amount || 0
      );
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [16, 185, 129];
    const textMain = [15, 23, 42];
    const textMuted = [100, 116, 139];
    const lightBorder = [226, 232, 240];

    // Helper to get compressed logo
    const getLogoBase64 = () => new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = (img.height * 150) / img.width;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(null);
      img.src = '/assets/logo.jpg';
    });

    const logoDataUrl = await getLogoBase64();

    // ==========================================
    // 1. HEADER SECTION
    // ==========================================

    // Draw Logo
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'JPEG', 14, 15, 12, 12);
    } else {
      // Fallback
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.circle(20, 22, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("P", 18, 25.5);
    }

    // Company Brand Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("PulpChain", 30, 25);

    // Document Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(textMain[0], textMain[1], textMain[2]);
    doc.text("PURCHASE RECEIPT", 140, 20);

    // Receipt Meta
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(`Receipt No: ${receiptNo}`, 140, 26);
    const receiptDate = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY format
    doc.text(`Receipt Date: ${receiptDate}`, 140, 31);

    // ==========================================
    // COMPANY INFORMATION (Safe/Legal)
    // ==========================================
    doc.setFontSize(9);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("PulpChain", 14, 35);
    doc.text("GSTIN: DEMO-ONLY", 14, 40);
    doc.text("PAN: DEMO-ONLY", 14, 45);

    doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
    doc.setLineWidth(0.4);
    doc.line(14, 50, 196, 50);

    // ==========================================
    // 2. SUPPLIER INFORMATION
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("SUPPLIER INFORMATION", 14, 58);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(textMain[0], textMain[1], textMain[2]);

    const supplierName = pickup.schoolName || schoolInfo.name;
    let currentY = 64;

    if (supplierName) { doc.text(`Supplier Name: ${supplierName}`, 14, currentY); currentY += 5; }
    if (schoolInfo.contactPerson) { doc.text(`Contact Person: ${schoolInfo.contactPerson}`, 14, currentY); currentY += 5; }
    if (schoolInfo.phone) { doc.text(`Phone: ${schoolInfo.phone}`, 14, currentY); currentY += 5; }
    if (schoolInfo.email) { doc.text(`Email: ${schoolInfo.email}`, 14, currentY); currentY += 5; }
    if (schoolInfo.address) {
      const splitAddress = doc.splitTextToSize(`Address: ${schoolInfo.address}`, 80);
      doc.text(splitAddress, 14, currentY);
    }

    // ==========================================
    // 3. COLLECTION DETAILS
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("COLLECTION DETAILS", 115, 58);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(textMain[0], textMain[1], textMain[2]);

    const paperName = pickup.paperType === 'mixedPaper' ? 'Mixed Paper'
                    : pickup.paperType === 'cardboard' ? 'Cardboard'
                    : 'White Paper';

    doc.text(`Pickup ID: ${pickup.id || 'Not Available'}`, 115, 64);
    doc.text(`Material Type: ${paperName}`, 115, 69);
    doc.text(`Scale Weight: ${pickup.actualWeight || 0} kg`, 115, 74);
    const colDate = pickup.completedDate ? new Date(pickup.completedDate).toLocaleDateString('en-GB') : 'Not Available';
    doc.text(`Collection Date: ${colDate}`, 115, 79);
    doc.text(`Status: Completed`, 115, 84);

    doc.line(14, 95, 196, 95);

    // ==========================================
    // 4. PURCHASE BREAKDOWN
    // ==========================================
    const tableColumn = ["Material", "HSN Code", "Quantity", "Rate", "Amount"];
    const tableRows = [
      [
        paperName,
        "4707",
        `${pickup.actualWeight || 0} kg`,
        formatPDFCurrency(pickup.rate || 0),
        formatPDFCurrency(pickup.amount || 0)
      ]
    ];

    autoTable(doc, {
      startY: 100,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 9.5,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 9.5,
        textColor: textMain,
        font: 'helvetica'
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      },
      margin: { left: 14, right: 14 }
    });

    const tableFinalY = doc.lastAutoTable.finalY;

    // ==========================================
    // 5 & 6. TOTAL AMOUNT & TAX DISPLAY
    // ==========================================
    const summaryStartY = tableFinalY + 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(textMain[0], textMain[1], textMain[2]);
    doc.text("TOTAL AMOUNT PAID", 14, summaryStartY);

    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(formatPDFCurrency(pickup.amount || 0), 14, summaryStartY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    const amountWords = numberToWords(pickup.amount || 0);
    doc.text(amountWords, 14, summaryStartY + 13);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("GST: Not Applicable", 14, summaryStartY + 20);

    // ==========================================
    // 7. PAYMENT INFORMATION
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("PAYMENT INFORMATION", 115, summaryStartY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(textMain[0], textMain[1], textMain[2]);

    const paymentStatus = paymentInfo.status ? paymentInfo.status.toUpperCase() : 'PENDING';
    const paymentDate = paymentInfo.payment_date ? new Date(paymentInfo.payment_date).toLocaleDateString('en-GB') : 'Not Available';
    const txRef = paymentInfo.transaction_reference || 'Not Available';

    doc.text(`Payout Status: ${paymentStatus}`, 115, summaryStartY + 7);
    doc.text(`Disbursed Date: ${paymentDate}`, 115, summaryStartY + 12);
    const splitTxnRef = doc.splitTextToSize(`Transaction Reference / UTR: ${txRef}`, 80);
    doc.text(splitTxnRef, 115, summaryStartY + 17);

    doc.line(14, summaryStartY + 35, 196, summaryStartY + 35);

    // ==========================================
    // 8. REAL QR CODE IMPLEMENTATION
    // ==========================================
    const qrY = summaryStartY + 45;

    try {
      const qrPayload = `https://pulpchain.in/verify/${receiptNo}`;
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'H',
        margin: 1,
        color: {
          dark: '#0f172a',  // slate-900
          light: '#ffffff'
        }
      });

      doc.addImage(qrDataUrl, 'PNG', 14, qrY, 25, 25);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(textMain[0], textMain[1], textMain[2]);
      doc.text("Scan to verify this receipt", 45, qrY + 13);

    } catch (qrErr) {
      console.error("QR Generation failed:", qrErr);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text("QR Verification currently unavailable.", 14, qrY + 13);
    }

    // ==========================================
    // 10. CLEAN FOOTER
    // ==========================================
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("Computer-generated purchase receipt.", 14, 275);
    doc.text("No physical signature required.", 14, 280);

    doc.save(`Receipt-${receiptNo}.pdf`);
  } catch (e) {
    console.error(e);
    alert("Error generating PDF Purchase Receipt.");
  }
};
