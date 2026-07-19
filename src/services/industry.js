
import { supabase } from '../lib/supabase';
import { FINANCE_CONFIG } from '../lib/constants';
import { adminService } from './admin';

export const industryService = {
  // Place an order request
  requestOrder: async (industryId, paperType, quantity, deliveryAddress, requiredDeliveryDate, additionalNotes) => {
    const { data, error } = await supabase
      .from('industries')
      .select('company_name')
      .eq('id', industryId)
      .single();
    if (error || !data) throw new Error('Industry profile not found.');
    const companyName = data.company_name;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) throw new Error('Please enter a valid quantity.');

    const rates = await adminService.getRates();
    if (!rates) throw new Error('Platform rates are currently unconfigured.');

    // MOQ check
    if (rates.moq !== null && qty < rates.moq) {
      throw new Error(`Minimum Order Quantity (MOQ) requirement is ${rates.moq} kg.`);
    }

    // Stock check
    const inventory = await adminService.getInventory();
    const stockField = `${paperType}Kg`;
    const availableStock = inventory[stockField] || 0;

    if (qty > availableStock) {
      throw new Error(`Insufficient stock available. Only ${availableStock} kg of ${paperType === 'mixedPaper' ? 'Mixed Paper' : paperType === 'cardboard' ? 'Cardboard' : 'White Paper'} is available.`);
    }

    // Retrieve active selling rate
    const sellRateField = `${paperType}Sell`;
    const activeRate = rates[sellRateField];
    if (activeRate === null || activeRate === undefined) {
      throw new Error(`Selling price for ${paperType === 'mixedPaper' ? 'Mixed Paper' : paperType === 'cardboard' ? 'Cardboard' : 'White Paper'} is not configured.`);
    }

    // First get industry name since it's expected in the return object
    const { data: indData } = await supabase.from('industries').select('company_name').eq('id', industryId).single();
    const companyNameStr = indData ? indData.company_name : companyName;

    const { data: newOrder, error: orderError } = await supabase.from('industry_orders').insert([{
      industry_id: industryId,
      paper_type: paperType,
      quantity: qty,
      rate: activeRate,
      amount: qty * activeRate,
      delivery_address: deliveryAddress,
      required_delivery_date: requiredDeliveryDate,
      additional_notes: additionalNotes,
      status: 'requested',
    }]).select().single();

    if (orderError) throw new Error(orderError.message);

    return {
      id: newOrder.id,
      industryId: newOrder.industry_id,
      industryName: companyNameStr,
      paperType: newOrder.paper_type,
      quantity: newOrder.quantity,
      rate: newOrder.rate,
      amount: newOrder.amount,
      deliveryAddress: newOrder.delivery_address,
      requiredDeliveryDate: newOrder.required_delivery_date,
      additionalNotes: newOrder.additional_notes,
      status: newOrder.status,
      orderDate: newOrder.created_at,
      allocatedDate: newOrder.allocated_date || null,
      dispatchedDate: newOrder.dispatched_date || null,
      deliveredDate: newOrder.delivered_date || null,
      completedDate: newOrder.completed_date || null,
      cancelledDate: newOrder.cancelled_date || null
    };
  },

  // Get industry's orders
  getOrders: async (industryId) => {
    const { data, error } = await supabase
      .from('industry_orders')
      .select(`*, industries(company_name), industry_payments(amount)`)
      .eq('industry_id', industryId)
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
      finalAmount: o.industry_payments?.[0]?.amount || o.amount * (1 + (FINANCE_CONFIG.GST_RATE / 100)),
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

  // Request recurring monthly contracts
  requestContract: async (industryId, paperType, monthlyVolumeKg, contractDurationMonths, expectedRate) => {
    const { data, error } = await supabase
      .from('industries')
      .select('company_name')
      .eq('id', industryId)
      .single();
    if (error || !data) throw new Error('Industry profile not found.');
    const companyName = data.company_name;

    const { data: newContract, error: contractError } = await supabase.from('industry_contracts').insert([{
      industry_id: industryId,
      industry_name: companyName,
      paper_type: paperType,
      monthly_volume_kg: parseFloat(monthlyVolumeKg),
      contract_duration_months: parseInt(contractDurationMonths),
      expected_rate: parseFloat(expectedRate),
      status: 'pending'
    }]).select().single();

    if (contractError) throw new Error(contractError.message);

    return {
      id: newContract.id,
      industryId: newContract.industry_id,
      industryName: newContract.industry_name,
      paperType: newContract.paper_type,
      monthlyVolumeKg: newContract.monthly_volume_kg,
      contractDurationMonths: newContract.contract_duration_months,
      expectedRate: newContract.expected_rate,
      status: newContract.status,
      requestDate: newContract.request_date,
      approvedDate: newContract.approved_date
    };
  },

  // Get contracts for industry
  getContracts: async (industryId) => {
    const { data, error } = await supabase
      .from('industry_contracts')
      .select('*')
      .eq('industry_id', industryId)
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

  // Get dashboard data summary
  getDashboardData: (industryId, ordersArray) => {
    const orders = ordersArray || [];

    const completedOrders = orders.filter(o => o.status === 'completed');
    const pendingOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));

    const totalQtyPurchased = completedOrders.reduce((sum, o) => sum + o.quantity, 0);

    return {
      totalOrders: orders.length,
      pendingCount: pendingOrders.length,
      completedCount: completedOrders.length,
      totalQtyPurchased,
      recentOrders: orders.slice(-5).reverse()
    };
  },

  // Phase 2.1 B2B finance service extensions
  getIndustryInvoices: async (industryId) => {
    return industryService.getIndustryPayments(industryId);
  },

  getIndustryPayments: async (industryId) => {
    const { data, error } = await supabase
      .from('industry_payments')
      .select('*, industries(company_name)')
      .eq('industry_id', industryId)
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

  getIndustryFinancialSummary: async (industryId, ordersArray, paymentsArray) => {
    const orders = ordersArray || [];
    const payments = paymentsArray || [];

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalQtyPurchased = completedOrders.reduce((sum, o) => sum + o.quantity, 0);

    const outstandingAmount = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    const paidAmount = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    // Active contracts
    const { data: contractsData } = await supabase
      .from('industry_contracts')
      .select('id')
      .eq('industry_id', industryId)
      .eq('status', 'approved');
    const contracts = contractsData || [];

    return {
      totalOrders,
      totalQtyPurchased,
      outstandingAmount,
      paidAmount,
      activeContractsCount: contracts.length
    };
  }
};
