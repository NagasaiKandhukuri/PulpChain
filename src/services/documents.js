import { db } from './db';

export const documentsService = {
  // Get all documents metadata
  getDocuments: () => {
    return db.getDocuments();
  },

  // Log a new document generation event (for audit & future DB migration)
  logDocument: (type, documentNumber, referenceId, recipientName, amount) => {
    const newDoc = {
      id: 'doc_' + Math.random().toString(36).substr(2, 9),
      type, // 'purchase_receipt' | 'sales_invoice'
      documentNumber,
      referenceId,
      recipientName,
      amount,
      dateGenerated: new Date().toISOString()
    };
    db.addDocument(newDoc);
    return newDoc;
  }
};
