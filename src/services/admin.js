
import { supabase } from '../lib/supabase';
import { FINANCE_CONFIG } from '../lib/constants';

export const adminService = {
  // --- Schools Management ---
  getSchools: async () => {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
    return uniqueData.map(s => ({
      id: s.id,
      name: s.name,
      address: s.address,
      contactPerson: s.contact_person,
      phone: s.phone,
      email: s.email,
      status: s.status,
      createdAt: s.created_at
    }));
  },

  updateSchoolStatus: async (schoolId, status) => {
    const { error: pError } = await supabase.from('profiles').update({ status }).eq('id', schoolId);
    if (pError) throw new Error(pError.message);
    const { error: sError } = await supabase.from('schools').update({ status }).eq('id', schoolId);
    if (sError) throw new Error(sError.message);
    return { id: schoolId, status };
  },

  // --- Rates Management ---
  getRates: async () => {
    const { data, error } = await supabase.from('rates').select('*');
    if (error) throw new Error(error.message);

    const rates = {
      mixedPaper: null, cardboard: null, whitePaper: null,
      mixedPaperSell: null, cardboardSell: null, whitePaperSell: null,
      moq: null,
      lastUpdated: null
    };

    data.forEach(row => {
      if (!row.paper_type) return;
      const normalizedType = row.paper_type.replace(/\s+/g, '').toLowerCase();

      if (row.updated_at) {
        if (!rates.lastUpdated || new Date(row.updated_at) > new Date(rates.lastUpdated)) {
          rates.lastUpdated = row.updated_at;
        }
      }

      if (normalizedType === 'mixedpaper') {
        rates.mixedPaper = row.buy_rate !== null ? Number(row.buy_rate) : null;
        rates.mixedPaperSell = row.sell_rate !== null ? Number(row.sell_rate) : null;
        rates.moq = row.moq !== null ? Number(row.moq) : null;
      } else if (normalizedType === 'cardboard') {
        rates.cardboard = row.buy_rate !== null ? Number(row.buy_rate) : null;
        rates.cardboardSell = row.sell_rate !== null ? Number(row.sell_rate) : null;
        if (row.moq !== null) rates.moq = Number(row.moq);
      } else if (normalizedType === 'whitepaper') {
        rates.whitePaper = row.buy_rate !== null ? Number(row.buy_rate) : null;
        rates.whitePaperSell = row.sell_rate !== null ? Number(row.sell_rate) : null;
        if (row.moq !== null) rates.moq = Number(row.moq);
      }
    });
    return rates;
  },

  updateRates: async (ratesData) => {
    const moq = ratesData.moq !== null ? parseFloat(ratesData.moq) : null;
    const rows = [
      {
        paper_type: 'mixedPaper',
        buy_rate: ratesData.mixedPaper !== null ? parseFloat(ratesData.mixedPaper) : null,
        sell_rate: ratesData.mixedPaperSell !== null ? parseFloat(ratesData.mixedPaperSell) : null,
        moq
      },
      {
        paper_type: 'cardboard',
        buy_rate: ratesData.cardboard !== null ? parseFloat(ratesData.cardboard) : null,
        sell_rate: ratesData.cardboardSell !== null ? parseFloat(ratesData.cardboardSell) : null,
        moq
      },
      {
        paper_type: 'whitePaper',
        buy_rate: ratesData.whitePaper !== null ? parseFloat(ratesData.whitePaper) : null,
        sell_rate: ratesData.whitePaperSell !== null ? parseFloat(ratesData.whitePaperSell) : null,
        moq
      }
    ];

    const { error } = await supabase.from('rates').upsert(rows, { onConflict: 'paper_type' });
    if (error) throw new Error(error.message);
    return adminService.getRates();
  },

  // --- Pickups Lifecycle Management ---
  getPickups: async () => {
    const { data, error } = await supabase
      .from('pickups')
      .select(`*, schools:school_id (name)`)
      .order('request_date', { ascending: false });
    if (error) throw new Error(error.message);
    const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
    return uniqueData.map(p => ({
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

  updatePickupStatus: async (pickupId, nextStatus, extraData = {}) => {
    const { data: pickup, error: fetchError } = await supabase
      .from('pickups')
      .select('*, schools:school_id (name)')
      .eq('id', pickupId)
      .single();
    if (fetchError || !pickup) throw new Error('Pickup not found.');

    const currentStatus = pickup.status;
    const valid = validateTransition(currentStatus, nextStatus);
    if (!valid) throw new Error(`Invalid status transition from ${currentStatus} to ${nextStatus}`);

    const updates = { status: nextStatus };

    if (nextStatus === 'scheduled') {
      if (!extraData.scheduledDate) throw new Error('Scheduled date is required.');
      updates.scheduled_date = extraData.scheduledDate;
    }

    if (nextStatus === 'completed') {
      const { actualWeight, paperType, rate } = extraData;
      if (actualWeight === undefined || actualWeight === null || actualWeight <= 0) {
        throw new Error('Valid actual weight is required.');
      }
      if (!paperType) throw new Error('Paper type is required.');
      if (rate === undefined || rate === null || rate < 0) {
        throw new Error('Valid rate is required.');
      }

      updates.actual_weight = parseFloat(actualWeight);
      updates.paper_type = paperType;
      updates.rate = parseFloat(rate);
      updates.amount = updates.actual_weight * updates.rate;
      updates.completed_date = new Date().toISOString();

      // 1. Fetch current inventory to increment
      const { data: invData } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('paper_type', paperType)
        .single();

      const currentQty = invData ? parseFloat(invData.quantity) : 0;
      await supabase
        .from('inventory')
        .upsert({ paper_type: paperType, quantity: currentQty + updates.actual_weight });

      // 2. Add inventory transaction
      await supabase
        .from('inventory_transactions')
        .insert({
          paper_type: paperType,
          quantity: updates.actual_weight,
          movement_type: 'in',
          reference_id: pickupId,
          notes: `School Pickup completed from ${pickup.schools?.name}`
        });

      // 3. Add payment
      await supabase
        .from('payments')
        .insert({
          pickup_id: pickupId,
          school_id: pickup.school_id,
          amount: updates.amount,
          status: 'pending'
        });
    }

    if (nextStatus === 'paid') {
      updates.paid_date = new Date().toISOString();
    }

    const { data: updatedData, error: updateError } = await supabase
      .from('pickups')
      .update(updates)
      .eq('id', pickupId)
      .select(`*, schools:school_id (name)`)
      .single();

    if (updateError) throw new Error(updateError.message);

    return {
      id: updatedData.id,
      schoolId: updatedData.school_id,
      schoolName: updatedData.schools?.name || 'Unknown School',
      paperType: updatedData.paper_type,
      estimatedWeight: updatedData.estimated_weight,
      actualWeight: updatedData.actual_weight,
      rate: updatedData.rate,
      amount: updatedData.amount,
      status: updatedData.status,
      requestDate: updatedData.request_date || updatedData.created_at,
      scheduledDate: updatedData.scheduled_date,
      completedDate: updatedData.completed_date,
      paidDate: updatedData.paid_date
    };
  },

  // --- Payments Collection Management ---
  getPayments: async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, schools:school_id (name)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
    const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
    return uniqueData.map(p => ({
      id: p.id,
      schoolId: p.school_id,
      schoolName: p.schools?.name || 'Unknown School',
      pickupId: p.pickup_id,
      amount: Number(p.amount),
      status: p.status,
      paymentDate: p.payment_date,
      transactionReference: p.transaction_reference,
      createdAt: p.created_at
    }));
  },

  processPayment: async (paymentId, transactionReference) => {
    const txnRef = transactionReference || 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const paymentDate = new Date().toISOString();

    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();
    if (fetchError || !payment) throw new Error('Payment record not found.');
    if (payment.status === 'paid') throw new Error('Payment already processed.');

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        payment_date: paymentDate,
        transaction_reference: txnRef
      })
      .eq('id', paymentId);
    if (updateError) throw new Error(updateError.message);

    await adminService.updatePickupStatus(payment.pickup_id, 'paid');
    return payment;
  },

  // --- Phase 2: Industries Management ---
  getIndustries: async () => {
    const { data, error } = await supabase
      .from('industries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
    return uniqueData.map(i => ({
      id: i.id,
      companyName: i.company_name,
      contactPerson: i.contact_person,
      email: i.email,
      phone: i.phone,
      gstNumber: i.gst_number,
      address: i.address,
      industryType: i.industry_type,
      monthlyRequirementKg: i.monthly_requirement_kg,
      status: i.status,
      createdAt: i.created_at
    }));
  },

  updateIndustryStatus: async (industryId, status) => {
    const { error: pError } = await supabase.from('profiles').update({ status }).eq('id', industryId);
    if (pError) throw new Error(pError.message);
    const { error: iError } = await supabase.from('industries').update({ status }).eq('id', industryId);
    if (iError) throw new Error(iError.message);
    return { id: industryId, status };
  },

  // --- Phase 2: Order Management & Lifecycle ---
  getOrders: async () => {
    const { data, error } = await supabase
      .from('industry_orders')
      .select(`*, industries(company_name)`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
    return uniqueData.map(o => ({
      id: o.id,
      industryId: o.industry_id,
      industryName: o.industries?.company_name || 'Unknown Industry',
      paperType: o.paper_type,
      quantity: o.quantity,
      rate: o.rate,
      amount: o.amount,
      deliveryAddress: o.delivery_address,
      requiredDeliveryDate: o.required_delivery_date,
      additionalNotes: o.additional_notes,
      status: o.status,
      orderDate: o.created_at,
      approvedDate: o.approved_date || null,
      allocatedDate: o.allocated_date || null,
      dispatchedDate: o.dispatched_date || null,
      deliveredDate: o.delivered_date || null,
      completedDate: o.completed_date || null,
      cancelledDate: o.cancelled_date || null
    }));
  },

  updateOrderStatus: async (orderId, nextStatus) => {
    let order;


    const { data, error } = await supabase
      .from('industry_orders')
      .select(`*, industries(company_name)`)
      .eq('id', orderId)
      .single();
    if (error) throw new Error(error.message);

    order = {
      id: data.id,
      industryId: data.industry_id,
      industryName: data.industries?.company_name || 'Unknown',
      paperType: data.paper_type,
      quantity: data.quantity,
      rate: data.rate,
      amount: data.amount,
      status: data.status
    };

    const currentStatus = order.status;

    // Validate transition
    const valid = validateOrderTransition(currentStatus, nextStatus);
    if (!valid) {
      throw new Error(`Invalid order status transition from ${currentStatus} to ${nextStatus}`);
    }

    order.status = nextStatus;
    const nowIso = new Date().toISOString();
    let dateField = null;

    if (nextStatus === 'approved') {
      order.approvedDate = nowIso;
      dateField = 'approved_date';
    }

    // 1. Deduct stock upon transition to "allocated"
    if (nextStatus === 'allocated') {
      const inventory = await adminService.getInventory();
      const stockField = `${order.paperType}Kg`;
      const available = inventory[stockField] || 0;

      if (order.quantity > available) {
        throw new Error(`Cannot allocate stock. Available: ${available} kg. Requested: ${order.quantity} kg.`);
      }

      await supabase
        .from('inventory')
        .upsert({ paper_type: order.paperType, quantity: available - order.quantity });

      await supabase
        .from('inventory_transactions')
        .insert({
          paper_type: order.paperType,
          quantity: order.quantity,
          movement_type: 'out',
          reference_id: order.id,
          notes: `Inventory allocated for Order #${order.id.slice(-6).toUpperCase()} to ${order.industryName}`
        });

      order.allocatedDate = nowIso;
      dateField = 'allocated_date';
    }

    if (nextStatus === 'dispatched') {
      order.dispatchedDate = nowIso;
      dateField = 'dispatched_date';
    }

    if (nextStatus === 'delivered') {
      order.deliveredDate = nowIso;
      dateField = 'delivered_date';
    }

    // 2. Automatically generate Sales record and Industry Payment record when Order status reaches Completed
    if (nextStatus === 'completed') {
      order.completedDate = nowIso;

      const invoiceNumber = 'INV-' + order.id.slice(-6).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

      // Transactional approach: Try updating order first
      const updatePayload = { status: nextStatus, completed_date: nowIso };
      const { error: updErr } = await supabase.from('industry_orders').update(updatePayload).eq('id', orderId);
      if (updErr) throw new Error(updErr.message);

      // 1. Create Sale
      const { data: saleData, error: saleErr } = await supabase
        .from('sales')
        .insert({
          order_id: order.id,
          industry_id: order.industryId,
          invoice_number: invoiceNumber,
          buyer_name: order.industryName,
          paper_type: order.paperType,
          quantity: order.quantity,
          sale_rate: order.rate,
          total_revenue: order.amount,
          sale_date: nowIso
        })
        .select()
        .single();

      if (saleErr) {
        // Rollback order
        await supabase.from('industry_orders').update({ status: currentStatus, completed_date: null }).eq('id', orderId);
        throw new Error(`Failed to create sale record: ${saleErr.message}. Order completion aborted.`);
      }

      // 2. Create Industry Payment
      const baseAmount = order.amount;
      const gstAmount = baseAmount * (FINANCE_CONFIG.GST_RATE / 100);
      const finalAmount = baseAmount + gstAmount;

      const { error: payErr } = await supabase
        .from('industry_payments')
        .insert({
          order_id: order.id,
          industry_id: order.industryId,
          sale_id: saleData.id,
          base_amount: baseAmount,
          gst_amount: gstAmount,
          amount: finalAmount,
          status: 'pending',
          invoice_number: invoiceNumber,
          created_at: nowIso
        });

      if (payErr) {
        // Rollback sale and order
        await supabase.from('sales').delete().eq('id', saleData.id);
        await supabase.from('industry_orders').update({ status: currentStatus, completed_date: null }).eq('id', orderId);
        throw new Error(`Failed to create payment record: ${payErr.message}. Order completion aborted.`);
      }

      return order; // Return early to skip second update
    }

    // 3. Compensating logic: Refund stock if cancelled from allocated or later
    if (nextStatus === 'cancelled') {
      order.cancelledDate = nowIso;
      dateField = 'cancelled_date';
      // If order was allocated, dispatched, or delivered, refund inventory
      if (['allocated', 'dispatched', 'delivered'].includes(currentStatus)) {
        const inventory = await adminService.getInventory();
        const stockField = `${order.paperType}Kg`;
        const newQty = (inventory[stockField] || 0) + order.quantity;

        await supabase
          .from('inventory')
          .upsert({ paper_type: order.paperType, quantity: newQty });

        await supabase
          .from('inventory_transactions')
          .insert({
            paper_type: order.paperType,
            quantity: order.quantity,
            movement_type: 'in',
            reference_id: order.id,
            notes: `Inventory refunded. Order #${order.id.slice(-6).toUpperCase()} cancelled.`
          });
      }
    }

    const updatePayload = { status: nextStatus };
    if (dateField) {
      updatePayload[dateField] = nowIso;
    }

    const { error: updErr } = await supabase
      .from('industry_orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (updErr) throw new Error(updErr.message);

    return order;
  },

  // --- Phase 2: Contracts Management ---
  getContracts: async () => {
    const { data, error } = await supabase
      .from('industry_contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
    return uniqueData.map(c => ({
      id: c.id,
      industryId: c.industry_id,
      industryName: c.industry_name,
      paperType: c.paper_type,
      monthlyVolumeKg: c.monthly_volume_kg,
      contractDurationMonths: c.contract_duration_months,
      expectedRate: c.expected_rate,
      status: c.status,
      requestDate: c.request_date,
      approvedDate: c.approved_date
    }));
  },

  updateContractStatus: async (contractId, status) => {
    const updates = { status, updated_at: new Date().toISOString() };
    if (status === 'approved') {
      updates.approved_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('industry_contracts')
      .update(updates)
      .eq('id', contractId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      industryId: data.industry_id,
      industryName: data.industry_name,
      paperType: data.paper_type,
      monthlyVolumeKg: data.monthly_volume_kg,
      contractDurationMonths: data.contract_duration_months,
      expectedRate: data.expected_rate,
      status: data.status,
      requestDate: data.request_date,
      approvedDate: data.approved_date
    };
  },

  // --- Phase 2.1: Industry Payments Management ---
  getAllIndustryPayments: async () => {
    const { data, error } = await supabase
      .from('industry_payments')
      .select(`*, industries(company_name)`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
    return uniqueData.map(p => ({
      id: p.id,
      saleId: p.sale_id,
      orderId: p.order_id,
      invoiceNumber: p.invoice_number,
      industryId: p.industry_id,
      industryName: p.industries?.company_name || 'Unknown',
      baseAmount: p.base_amount || p.amount,
      gstAmount: p.gst_amount || 0,
      amount: p.amount,
      status: p.status,
      paymentDate: p.payment_date,
      transactionReference: p.transaction_reference,
      createdAt: p.created_at
    }));
  },

  markIndustryPaymentPaid: async (paymentId, transactionReference) => {
    const { data, error } = await supabase
      .from('industry_payments')
      .update({
        status: 'paid',
        payment_date: new Date().toISOString(),
        transaction_reference: transactionReference || 'TXN_IND_' + Math.random().toString(36).substr(2, 9).toUpperCase()
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // --- Onboarding Checklist Status ---
  getOnboardingStatus: async () => {
    const [rates, schools, industries] = await Promise.all([
      adminService.getRates(),
      adminService.getSchools(),
      adminService.getIndustries()
    ]);

    // Check if buying and selling rates are configured
    const ratesSet = rates &&
                     rates.mixedPaper !== null &&
                     rates.cardboard !== null &&
                     rates.whitePaper !== null &&
                     rates.mixedPaperSell !== null &&
                     rates.cardboardSell !== null &&
                     rates.whitePaperSell !== null;

    const pendingSchools = schools.filter(s => s.status === 'pending');
    const pendingIndustries = industries.filter(i => i.status === 'pending');

    // Checklist satisfied when no registrations are pending
    const registrationsReviewed = pendingSchools.length === 0 && pendingIndustries.length === 0;
    const ready = ratesSet && registrationsReviewed;

    return {
      ratesSet,
      registrationsReviewed,
      ready,
      pendingCount: pendingSchools.length + pendingIndustries.length
    };
  },

  // --- Phase 2: Inventory Management ---
  getInventory: async () => {
    const { data, error } = await supabase.from('inventory').select('*');
    if (error) {
      console.error('Error fetching inventory:', error);
      return { mixedPaperKg: 0, cardboardKg: 0, whitePaperKg: 0 };
    }
    const inv = { mixedPaperKg: 0, cardboardKg: 0, whitePaperKg: 0 };
    data.forEach(row => {
      const type = row.paper_type ? row.paper_type.replace(/\s+/g, '').toLowerCase() : '';
      if (type === 'mixedpaper') inv.mixedPaperKg = Number(row.quantity);
      else if (type === 'cardboard') inv.cardboardKg = Number(row.quantity);
      else if (type === 'whitepaper') inv.whitePaperKg = Number(row.quantity);
    });
    return inv;
  },



  getInventoryTransactions: async () => {
    const { data, error } = await supabase.from('inventory_transactions').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching inventory_transactions:', error);
      return [];
    }
    const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
    return uniqueData.map(t => ({
      id: t.id,
      paperType: t.paper_type,
      quantity: Number(t.quantity),
      type: t.movement_type, // 'in' or 'out'
      referenceId: t.reference_id,
      notes: t.notes,
      date: t.created_at
    }));
  }
};

// Helper for pickups lifecycle transitions
function validateTransition(from, to) {
  const allowed = {
    pending: ['approved', 'cancelled'],
    approved: ['scheduled', 'cancelled'],
    scheduled: ['in-progress', 'cancelled'],
    'in-progress': ['completed'],
    completed: ['paid'],
    paid: [],
    cancelled: []
  };
  return allowed[from]?.includes(to) || false;
}

// Helper for industry orders transitions (NEW)
function validateOrderTransition(from, to) {
  const allowed = {
    requested: ['approved', 'cancelled'],
    approved: ['allocated', 'cancelled'],
    allocated: ['dispatched', 'cancelled'],
    dispatched: ['delivered', 'cancelled'],
    delivered: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };
  return allowed[from]?.includes(to) || false;
}
