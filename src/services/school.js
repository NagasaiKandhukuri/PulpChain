import { supabase } from '../lib/supabase';

export const schoolService = {
  // Request a pickup
  requestPickup: async (schoolId, paperType, estimatedWeight) => {
    let schoolName = 'Unknown School';
    
    const { data, error: schoolError } = await supabase
      .from('schools')
      .select('name')
      .eq('id', schoolId)
      .single();
    if (schoolError || !data) throw new Error('School not found.');
    schoolName = data.name;

    const { data: newPickup, error } = await supabase.from('pickups').insert([{
      school_id: schoolId,
      paper_type: paperType,
      estimated_weight: parseFloat(estimatedWeight),
      status: 'pending'
    }]).select().single();
    
    if (error) throw new Error(error.message);
    return newPickup;
  },

  // Get school's pickups
  getPickups: async (schoolId) => {
    const { data, error } = await supabase
      .from('pickups')
      .select(`*, schools:school_id (name)`)
      .eq('school_id', schoolId)
      .order('request_date', { ascending: false });
      
    if (error) throw new Error(error.message);
    
    // Transform snake_case to camelCase
    return data.map(p => ({
      id: p.id,
      schoolId: p.school_id,
      schoolName: p.schools?.name || 'Unknown School',
      paperType: p.paper_type,
      estimatedWeight: p.estimated_weight,
      actualWeight: p.actual_weight,
      rate: p.rate,
      amount: p.amount,
      status: p.status,
      requestDate: p.request_date || p.created_at,
      scheduledDate: p.scheduled_date,
      completedDate: p.completed_date,
      paidDate: p.paid_date
    }));
  },

  // Get payments received for a school
  getPayments: async (schoolId) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('school_id', schoolId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
    return data.map(p => ({
      id: p.id,
      schoolId: p.school_id,
      pickupId: p.pickup_id,
      amount: Number(p.amount),
      status: p.status,
      paymentDate: p.payment_date,
      transactionReference: p.transaction_reference
    }));
  },

  // Get dashboard metrics for school
  getDashboardData: async (schoolId) => {
    let schoolPickups = [];
    try {
      schoolPickups = await schoolService.getPickups(schoolId);
    } catch(e) {
      schoolPickups = [];
    }
    let schoolPayments = [];
    try {
      schoolPayments = await schoolService.getPayments(schoolId);
    } catch(e) {
      schoolPayments = [];
    }

    // Sum of paid payments
    const totalEarnings = schoolPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalWeightCompleted = schoolPickups
      .filter(p => p.status === 'completed' || p.status === 'paid')
      .reduce((sum, p) => sum + (p.actualWeight || 0), 0);

    return {
      totalPickups: schoolPickups.length,
      totalEarnings,
      totalWeightCompleted,
      recentPickups: schoolPickups.slice(0, 5), // Assumes already sorted descending
      recentPayments: schoolPayments.slice(-5).reverse()
    };
  }
};
