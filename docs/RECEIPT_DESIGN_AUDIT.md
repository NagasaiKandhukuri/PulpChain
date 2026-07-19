# PulpChain Purchase Receipt Design Audit

## 1. Final Receipt Structure
The purchase receipt has been successfully centralized through `src/services/purchaseReceiptGenerator.js`. All receipt generations across Admin and Industry platforms now use this exact standard:

1. **Header**: Custom SVG-drawn minimalist logo with `PulpChain` branding.
2. **Supplier Information**: Dynamically mapped contact details (no duplicates, no empty/nulls).
3. **Collection Details**: Accurate Pickup ID, Material Type, Weight, and Date.
4. **Purchase Breakdown**: Clean `autoTable` with HSN 4707 and proper INR formatting.
5. **Total Amount**: Dynamically calculated words with large ₹ typography.
6. **Payment Information**: Payout Status, Disbursed Date, and Transaction Reference (UTR).
7. **Verification**: A real, scannable QR code linking to `https://pulpchain.in/verify/${receiptNo}`.
8. **Footer**: Clean "Computer-generated purchase receipt. No physical signature required."

## 2. Branding Decisions
- **Logo**: Instead of an external image dependency, the logo is drawn directly onto the PDF using `jsPDF` vector primitives (a primary-color circle with a bold white "P" inside). This is lightweight, scales infinitely, and avoids any copyright issues.
- **Company Name**: Hardcoded safely as `PulpChain` (no "Pvt Ltd" or "Logistics").
- **Address**: The fake Bangalore address was permanently removed.
- **Identifiers**: Labeled safely as `GSTIN: DEMO-ONLY` and `PAN: DEMO-ONLY`.

## 3. QR Implementation & Library Source
- **Library**: `qrcode` (NPM package, version 1.5.x).
- **License**: MIT License (included by default in the node module).
- **Implementation**: We use `QRCode.toDataURL()` with `errorCorrectionLevel: 'H'` to generate a robust Data URI that is directly embedded into the PDF using `doc.addImage()`.
- **Fallback**: The `try/catch` block ensures that if the QR fails to generate in edge-case browsers, a safe text fallback ("QR Verification currently unavailable.") appears without crashing the receipt generation.

## 4. Database Field Mapping
| PDF Field | Supabase Column Mapping |
| :--- | :--- |
| Supplier Name | `pickup.schoolName` OR `schools.name` |
| Collection Date | `pickup.completedDate` |
| Scale Weight | `pickup.actualWeight` |
| Total Amount | `pickup.amount` |
| Payout Status | `payments.status` |
| Disbursed Date | `payments.payment_date` |
| UTR / Transaction Ref | `payments.transaction_reference` |

## 5. Duplicate & Unwanted Content Removed
- **Wire Settlement Details**: SBI Account No, IFSC, and Beneficiary name have been entirely removed from supplier purchase receipts (they remain only on B2B outgoing invoices).
- **Operational Claims**: "PulpChain Operations Team" and "Automated logistics invoice check" have been permanently removed.

## 6. Missing-Data Behavior
- Replaced `undefined`, `null`, and `NaN` with safe defaults: `Not Available` or `Rs. 0.00`.
- Supplier address gracefully collapses if not present.
- If UTR/Transaction Reference is missing, it displays `Transaction Reference / UTR: Not Available`.

## 7. Validation Performed
- ✅ **Lint Result**: `npm run lint` passed with zero errors (`✖ 0 problems`). All unused variables and missing imports were resolved across the project.
- ✅ **Build Result**: `npm run build` completed in ~673ms with all chunks successfully rendered.
- ✅ **PDF Formatting**: `jsPDF` parameters carefully tuned for A4 dimensions without text overflow.

## 8. Final Success Condition
Every PulpChain purchase receipt is now visually consistent, factually accurate, production-safe, branded simply as `PulpChain`, and verifiable using a real QR code.
