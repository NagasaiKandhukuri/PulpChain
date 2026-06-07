import { db } from './db';
import { supabase } from '../lib/supabase';
import { FEATURES } from '../lib/features';
import { adminService } from './admin';

export const industryService = {
  // Place an order request
  requestOrder: async (industryId, paperType, quantity, deliveryAddress, requiredDeliveryDate, additionalNotes) => {
    let companyName = 'Unknown Industry';
    if (FEATURES.USE_SUPABASE_AUTH) {
      const { data, error } = await supabase
        .from('industries')
        .select('company_name')
        .eq('id', industryId)
        .single();
      if (error || !data) throw new Error('Industry profile not found.');
      companyName = data.company_name;
    } else {
      const industries = db.getIndustries();
      const ind = industries.find(i => i.id === industryId);
      if (!ind) throw new Error('Industry profile not found.');
      companyName = ind.companyName;
    }

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

    const newOrder = {
      id: 'ord_' + Math.random().toString(36).substr(2, 9),
      industryId,
      industryName: companyName,
      paperType,
      quantity: qty,
      rate: activeRate,
      amount: qty * activeRate,
      deliveryAddress,
      requiredDeliveryDate,
      additionalNotes,
      status: 'requested',
      orderDate: new Date().toISOString(),
      allocatedDate: null,
      dispatchedDate: null,
      deliveredDate: null,
      completedDate: null
    };

    db.addOrder(newOrder);
    return newOrder;
  },

  // Get industry's orders
  getOrders: (industryId) => {
    const orders = db.getOrders();
    return orders.filter(o => o.industryId === industryId);
  },

  // Request recurring monthly contracts
  requestContract: async (industryId, paperType, monthlyVolumeKg, contractDurationMonths, expectedRate) => {
    let companyName = 'Unknown Industry';
    if (FEATURES.USE_SUPABASE_AUTH) {
      const { data, error } = await supabase
        .from('industries')
        .select('company_name')
        .eq('id', industryId)
        .single();
      if (error || !data) throw new Error('Industry profile not found.');
      companyName = data.company_name;
    } else {
      const industries = db.getIndustries();
      const ind = industries.find(i => i.id === industryId);
      if (!ind) throw new Error('Industry profile not found.');
      companyName = ind.companyName;
    }

    const newContract = {
      id: 'con_' + Math.random().toString(36).substr(2, 9),
      industryId,
      industryName: companyName,
      paperType,
      monthlyVolumeKg: parseFloat(monthlyVolumeKg),
      contractDurationMonths: parseInt(contractDurationMonths),
      expectedRate: parseFloat(expectedRate),
      status: 'pending',
      requestDate: new Date().toISOString(),
      approvedDate: null
    };

    db.addContract(newContract);
    return newContract;
  },

  // Get contracts for industry
  getContracts: (industryId) => {
    const contracts = db.getContracts();
    return contracts.filter(c => c.industryId === industryId);
  },

  // Get dashboard data summary
  getDashboardData: (industryId) => {
    const orders = industryService.getOrders(industryId);
    
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
  getIndustryInvoices: (industryId) => {
    // Invoices correspond directly to the completed or paid payments linked to the industry
    const payments = db.getIndustryPayments();
    return payments.filter(p => p.industryId === industryId);
  },

  getIndustryPayments: (industryId) => {
    const payments = db.getIndustryPayments();
    return payments.filter(p => p.industryId === industryId);
  },

  getIndustryFinancialSummary: (industryId) => {
    const orders = industryService.getOrders(industryId);
    const payments = db.getIndustryPayments().filter(p => p.industryId === industryId);

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
    const contracts = db.getContracts().filter(c => c.industryId === industryId && c.status === 'approved');

    return {
      totalOrders,
      totalQtyPurchased,
      outstandingAmount,
      paidAmount,
      activeContractsCount: contracts.length
    };
  }
};
