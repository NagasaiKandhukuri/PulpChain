import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '../services/db';
import { documentsService } from '../services/documents';
import { supabase } from '../lib/supabase';
import { FEATURES } from '../lib/features';

// Helper function to format INR cleanly without using broken unicode symbols in PDF
const formatPDFCurrency = (val) => {
  if (val === null || val === undefined) return 'Rs. 0.00';
  return 'Rs. ' + Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const generatePurchaseReceiptPDF = async (pickup) => {
  try {
    let schoolInfo = {};
    if (FEATURES.USE_SUPABASE_AUTH) {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', pickup.schoolId)
        .single();
      
      if (!error && data) {
        // Map Supabase columns to expected camelCase properties for PDF
        schoolInfo = {
          name: data.name,
          contactPerson: data.contact_person,
          phone: data.phone,
          email: data.email,
          address: data.address
        };
      }
    } else {
      const schools = db.getSchools();
      schoolInfo = schools.find(s => s.id === pickup.schoolId) || {};
    }

    const payments = db.getPayments();
    const paymentInfo = payments.find(py => py.pickupId === pickup.id) || {};
    
    // Determine Receipt Number
    let receiptNo = '';
    const docLogs = db.getDocuments();
    const existingDoc = docLogs.find(d => d.referenceId === pickup.id && d.type === 'purchase_receipt');
    if (existingDoc) {
      receiptNo = existingDoc.documentNumber;
    } else {
      receiptNo = `REC-${new Date(pickup.completedDate || Date.now()).toISOString().slice(2,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`;
      documentsService.logDocument(
        'purchase_receipt',
        receiptNo,
        pickup.id,
        pickup.schoolName,
        pickup.amount
      );
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Color Palette
    const primaryColor = [16, 185, 129]; // PulpChain Emerald Green
    const textMain = [15, 23, 42]; // Slate 900
    const textMuted = [100, 116, 139]; // Slate 500
    const lightBorder = [226, 232, 240]; // Slate 200

    // 1. Header Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("PulpChain", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("Convert Waste Paper Into Value", 14, 25);

    // Document Title & Meta details aligned to the right
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(textMain[0], textMain[1], textMain[2]);
    doc.text("PURCHASE RECEIPT", 140, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(textMain[0], textMain[1], textMain[2]);
    doc.text(`Receipt No: ${receiptNo}`, 140, 26);
    doc.text(`Receipt Date: ${new Date(pickup.completedDate || Date.now()).toLocaleDateString('en-IN')}`, 140, 31);
    doc.text(`Pickup ID: ${pickup.id}`, 140, 36);

    // Section separator line
    doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
    doc.setLineWidth(0.4);
    doc.line(14, 42, 196, 42);

    // 2. Structured Multi-column Layout for Supplier & Collection Info
    // Column 1: Supplier Information
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("SUPPLIER INFORMATION", 14, 50);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(textMain[0], textMain[1], textMain[2]);
    doc.text(pickup.schoolName || schoolInfo.name || "N/A", 14, 56);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Contact Person: ${schoolInfo.contactPerson || "N/A"}`, 14, 62);
    doc.text(`Phone: ${schoolInfo.phone || "N/A"}`, 14, 67);
    doc.text(`Email: ${schoolInfo.email || "N/A"}`, 14, 72);
    
    // Address block handling wrapping safely
    const addressStr = schoolInfo.address || "N/A";
    const splitAddress = doc.splitTextToSize(`Address: ${addressStr}`, 80);
    doc.text(splitAddress, 14, 77);

    // Column 2: Collection Information
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("COLLECTION DETAILS", 115, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(textMain[0], textMain[1], textMain[2]);
    
    const paperName = pickup.paperType === 'mixedPaper' ? 'Mixed Paper' 
                    : pickup.paperType === 'cardboard' ? 'Cardboard' 
                    : 'White Paper';

    doc.text(`Pickup ID: ${pickup.id}`, 115, 56);
    doc.text(`Material Type: ${paperName}`, 115, 61);
    doc.text(`Scale Weight: ${pickup.actualWeight} kg`, 115, 66);
    doc.text(`Status: Completed`, 115, 71);

    // Line separator before table
    doc.line(14, 94, 196, 94);

    // 3. Financial Breakdown Table (autoTable)
    const tableColumn = ["Material Type", "Actual Weight (kg)", "Rate/kg (Excl. Tax)", "Subtotal Amount"];
    const tableRows = [
      [
        paperName,
        `${pickup.actualWeight} kg`,
        formatPDFCurrency(pickup.rate),
        formatPDFCurrency(pickup.amount)
      ]
    ];

    autoTable(doc, {
      startY: 98,
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
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      },
      margin: { left: 14, right: 14 }
    });

    const tableFinalY = doc.lastAutoTable.finalY;

    // 4. Financial Summary & Payout Block (aligned to right side)
    const summaryStartY = tableFinalY + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(textMain[0], textMain[1], textMain[2]);
    doc.text("TOTAL AMOUNT PAID", 120, summaryStartY);
    
    doc.setFontSize(13);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(formatPDFCurrency(pickup.amount), 196, summaryStartY, { align: 'right' });

    // 5. Payment Log Information Section (aligned to left side)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("PAYMENT LOG", 14, summaryStartY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(textMain[0], textMain[1], textMain[2]);
    doc.text(`Payout Status: ${paymentInfo.status ? paymentInfo.status.toUpperCase() : 'PENDING'}`, 14, summaryStartY + 7);
    doc.text(`Disbursed Date: ${paymentInfo.paymentDate ? new Date(paymentInfo.paymentDate).toLocaleDateString('en-IN') : '--'}`, 14, summaryStartY + 12);
    
    const splitTxnRef = doc.splitTextToSize(`Transaction Ref (UTR): ${paymentInfo.transactionReference || '--'}`, 90);
    doc.text(splitTxnRef, 14, summaryStartY + 17);

    // 6. Signatory Area & Corporate Footer
    const sigY = Math.max(summaryStartY + 45, 235);

    // Separator line before signature section
    doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
    doc.line(14, sigY - 8, 196, sigY - 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(textMain[0], textMain[1], textMain[2]);
    doc.text("PulpChain Operations Team", 14, sigY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("Automated logistics invoice check.", 14, sigY + 5);

    // Signature Line
    doc.setDrawColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.line(135, sigY, 196, sigY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("Authorized Signatory", 148, sigY + 5);

    // 7. Page Boundaries declaration footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("This receipt certifies cargo handoff, weight validation, and official payout details.", 14, 280);

    doc.save(`Receipt-${receiptNo}.pdf`);
  } catch (e) {
    console.error(e);
    alert("Error generating PDF Purchase Receipt.");
  }
};
