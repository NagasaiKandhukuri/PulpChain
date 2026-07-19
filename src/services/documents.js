
import { supabase } from '../lib/supabase';

export const documentsService = {
  // Get all documents metadata
  getDocuments: async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
    return uniqueData.map(d => ({
      id: d.id,
      type: d.document_type,
      documentNumber: d.document_number,
      referenceId: d.reference_id,
      recipientName: d.party_name,
      amount: d.amount,
      dateGenerated: d.generated_at
    }));
  },

  // Log a new document generation event
  logDocument: async (type, documentNumber, referenceId, recipientName, amount) => {
    const { data, error } = await supabase.from('documents').insert([{
      document_type: type,
      document_number: documentNumber,
      reference_id: referenceId,
      party_name: recipientName,
      amount: amount
    }]).select().single();

    if (error) {
      console.error('Error logging document:', error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      type: data.document_type,
      documentNumber: data.document_number,
      referenceId: data.reference_id,
      recipientName: data.party_name,
      amount: data.amount,
      dateGenerated: data.generated_at
    };
  }
};
