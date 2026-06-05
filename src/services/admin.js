import { db } from './db';
import { supabase } from '../lib/supabase';
import { FEATURES } from '../lib/features';

export const adminService = {
  // --- Schools Management ---
  getSchools: async () => {
    if (FEATURES.USE_SUPABASE_AUTH) {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data.map(s => ({
        id: s.id,
        name: s.name,
        address: s.address,
        contactPerson: s.contact_person,
        phone: s.phone,
        email: s.email,
        status: s.status,
        createdAt: s.created_at
      }));
    }
    return db.getSchools().reverse();
  },

  updateSchoolStatus: async (schoolId, status) => {
    if (FEATURES.USE_SUPABASE_AUTH) {
      const { error: pError } = await supabase.from('profiles').update({ status }).eq('id', schoolId);
      if (pError) throw new Error(pError.message);
      const { error: sError } = await supabase.from('schools').update({ status }).eq('id', schoolId);
      if (sError) throw new Error(sError.message);
      return { id: schoolId, status };
    }
    const schools = db.getSchools();
    const index = schools.findIndex(s => s.id === schoolId);
    if (index === -1) throw new Error('School not found.');
    
    schools[index].status = status;
    db.saveSchools(schools);
    return schools[index];
  },

  // --- Rates Management ---
  getRates: () => {
    return db.getRates();
  },

  updateRates: (ratesData) => {
    db.saveRates({
      mixedPaper: ratesData.mixedPaper !== null ? parseFloat(ratesData.mixedPaper) : null,
      cardboard: ratesData.cardboard !== null ? parseFloat(ratesData.cardboard) : null,
      whitePaper: ratesData.whitePaper !== null ? parseFloat(ratesData.whitePaper) : null,
      mixedPaperSell: ratesData.mixedPaperSell !== null ? parseFloat(ratesData.mixedPaperSell) : null,
      cardboardSell: ratesData.cardboardSell !== null ? parseFloat(ratesData.cardboardSell) : null,
      whitePaperSell: ratesData.whitePaperSell !== null ? parseFloat(ratesData.whitePaperSell) : null,
      moq: ratesData.moq !== null ? parseFloat(ratesData.moq) : null
    });
    return db.getRates();
  },

  // --- Pickups Lifecycle Management ---
  getPickups: () => {
    return db.getPickups();
  },

  updatePickupStatus: (pickupId, nextStatus, extraData = {}) => {
    const pickups = db.getPickups();
    const index = pickups.findIndex(p => p.id === pickupId);
    if (index === -1) throw new Error('Pickup not found.');

    const pickup = pickups[index];
    const currentStatus = pickup.status;

    // Validate transitions
    const valid = validateTransition(currentStatus, nextStatus);
    if (!valid) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${nextStatus}`);
    }

    pickup.status = nextStatus;

    if (nextStatus === 'scheduled') {
      if (!extraData.scheduledDate) throw new Error('Scheduled date is required.');
      pickup.scheduledDate = extraData.scheduledDate;
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

      pickup.actualWeight = parseFloat(actualWeight);
      pickup.paperType = paperType;
      pickup.rate = parseFloat(rate);
      pickup.amount = pickup.actualWeight * pickup.rate;
      pickup.completedDate = new Date().toISOString();

      // INCREMENT INVENTORY & LOG TRANSACTION (NEW)
      const inventory = db.getInventory();
      const stockField = `${paperType}Kg`;
      inventory[stockField] = (inventory[stockField] || 0) + pickup.actualWeight;
      db.saveInventory(inventory);

      const transaction = {
        id: 'tx_in_' + Math.random().toString(36).substr(2, 9),
        type: 'in',
        paperType,
        quantity: pickup.actualWeight,
        date: new Date().toISOString(),
        referenceId: pickup.id,
        notes: `School Pickup completed from ${pickup.schoolName}`
      };
      db.addTransaction(transaction);

      // Automatically create a pending payment record
      const paymentId = 'pay_' + Math.random().toString(36).substr(2, 9);
      const newPayment = {
        id: paymentId,
        pickupId: pickup.id,
        schoolId: pickup.schoolId,
        schoolName: pickup.schoolName,
        amount: pickup.amount,
        status: 'pending',
        paymentDate: null,
        transactionReference: null
      };
      db.addPayment(newPayment);
    }

    if (nextStatus === 'paid') {
      pickup.paidDate = new Date().toISOString();
    }

    pickups[index] = pickup;
    db.savePickups(pickups);
    return pickup;
  },

  // --- Payments Collection Management ---
  getPayments: () => {
    return db.getPayments();
  },

  processPayment: (paymentId, transactionReference) => {
    const payments = db.getPayments();
    const index = payments.findIndex(p => p.id === paymentId);
    if (index === -1) throw new Error('Payment record not found.');

    const payment = payments[index];
    if (payment.status === 'paid') throw new Error('Payment already processed.');

    payment.status = 'paid';
    payment.paymentDate = new Date().toISOString();
    payment.transactionReference = transactionReference || 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();

    payments[index] = payment;
    db.savePayments(payments);

    // Update corresponding pickup status to paid
    adminService.updatePickupStatus(payment.pickupId, 'paid');
    return payment;
  },

  // --- Phase 2: Industries Management ---
  getIndustries: async () => {
    if (FEATURES.USE_SUPABASE_AUTH) {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data.map(i => ({
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
    }
    return db.getIndustries().reverse();
  },

  updateIndustryStatus: async (industryId, status) => {
    if (FEATURES.USE_SUPABASE_AUTH) {
      const { error: pError } = await supabase.from('profiles').update({ status }).eq('id', industryId);
      if (pError) throw new Error(pError.message);
      const { error: iError } = await supabase.from('industries').update({ status }).eq('id', industryId);
      if (iError) throw new Error(iError.message);
      return { id: industryId, status };
    }
    const industries = db.getIndustries();
    const index = industries.findIndex(i => i.id === industryId);
    if (index === -1) throw new Error('Industry not found.');

    industries[index].status = status;
    db.saveIndustries(industries);
    return industries[index];
  },

  // --- Phase 2: Order Management & Lifecycle ---
  getOrders: () => {
    return db.getOrders();
  },

  updateOrderStatus: (orderId, nextStatus) => {
    const orders = db.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Order not found.');

    const order = orders[index];
    const currentStatus = order.status;

    // Validate transition
    const valid = validateOrderTransition(currentStatus, nextStatus);
    if (!valid) {
      throw new Error(`Invalid order status transition from ${currentStatus} to ${nextStatus}`);
    }

    order.status = nextStatus;

    if (nextStatus === 'approved') {
      order.approvedDate = new Date().toISOString();
    }

    // 1. Deduct stock upon transition to "allocated"
    if (nextStatus === 'allocated') {
      const inventory = db.getInventory();
      const stockField = `${order.paperType}Kg`;
      const available = inventory[stockField] || 0;

      if (order.quantity > available) {
        throw new Error(`Cannot allocate stock. Available: ${available} kg. Requested: ${order.quantity} kg.`);
      }

      inventory[stockField] = available - order.quantity;
      db.saveInventory(inventory);
      order.allocatedDate = new Date().toISOString();

      // Log transaction
      const transaction = {
        id: 'tx_out_' + Math.random().toString(36).substr(2, 9),
        type: 'out',
        paperType: order.paperType,
        quantity: order.quantity,
        date: new Date().toISOString(),
        referenceId: order.id,
        notes: `Inventory allocated for Order #${order.id.slice(-6).toUpperCase()} to ${order.industryName}`
      };
      db.addTransaction(transaction);
    }

    if (nextStatus === 'dispatched') {
      order.dispatchedDate = new Date().toISOString();
    }

    if (nextStatus === 'delivered') {
      order.deliveredDate = new Date().toISOString();
    }

    // 2. Automatically generate Sales record and Industry Payment record when Order status reaches Completed
    if (nextStatus === 'completed') {
      order.completedDate = new Date().toISOString();

      const invoiceNumber = 'INV-' + order.id.slice(-6).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

      // Auto Sale creation
      const saleId = 'sale_' + order.id;
      const sales = db.getSales();
      if (!sales.some(s => s.id === saleId)) {
        const newSale = {
          id: saleId,
          invoiceNumber,
          buyerName: order.industryName,
          paperType: order.paperType,
          quantity: order.quantity,
          saleRate: order.rate,
          totalRevenue: order.amount,
          saleDate: new Date().toISOString()
        };
        db.addSale(newSale);
      }

      // Auto Industry Payment creation (Phase 2.1)
      const indPayments = db.getIndustryPayments();
      if (!indPayments.some(p => p.orderId === order.id)) {
        const newIndPayment = {
          id: 'indpay_' + Math.random().toString(36).substr(2, 9),
          orderId: order.id,
          invoiceNumber,
          industryId: order.industryId,
          industryName: order.industryName,
          amount: order.amount,
          status: 'pending',
          paymentDate: null,
          transactionReference: null,
          createdAt: new Date().toISOString()
        };
        db.addIndustryPayment(newIndPayment);
      }
    }

    // 3. Compensating logic: Refund stock if cancelled from allocated or later
    if (nextStatus === 'cancelled') {
      order.cancelledDate = new Date().toISOString();
      // If order was allocated, dispatched, or delivered, refund inventory
      if (['allocated', 'dispatched', 'delivered'].includes(currentStatus)) {
        const inventory = db.getInventory();
        const stockField = `${order.paperType}Kg`;
        inventory[stockField] = (inventory[stockField] || 0) + order.quantity;
        db.saveInventory(inventory);

        // Log compensating transaction
        const transaction = {
          id: 'tx_ref_' + Math.random().toString(36).substr(2, 9),
          type: 'in',
          paperType: order.paperType,
          quantity: order.quantity,
          date: new Date().toISOString(),
          referenceId: order.id,
          notes: `Inventory refunded. Order #${order.id.slice(-6).toUpperCase()} cancelled.`
        };
        db.addTransaction(transaction);
      }
    }

    orders[index] = order;
    db.saveOrders(orders);
    return order;
  },

  // --- Phase 2: Contracts Management ---
  getContracts: async () => {
    return db.getContracts().reverse();
  },

  updateContractStatus: (contractId, status) => {
    const contracts = db.getContracts();
    const index = contracts.findIndex(c => c.id === contractId);
    if (index === -1) throw new Error('Contract not found.');

    contracts[index].status = status;
    if (status === 'approved') {
      contracts[index].approvedDate = new Date().toISOString();
    }
    db.saveContracts(contracts);
    return contracts[index];
  },

  // --- Phase 2.1: Industry Payments Management ---
  getAllIndustryPayments: () => {
    return db.getIndustryPayments();
  },

  markIndustryPaymentPaid: (paymentId, transactionReference) => {
    const payments = db.getIndustryPayments();
    const index = payments.findIndex(p => p.id === paymentId);
    if (index === -1) throw new Error('Industry payment record not found.');

    const payment = payments[index];
    if (payment.status === 'paid') throw new Error('Payment is already marked as paid.');

    payment.status = 'paid';
    payment.paymentDate = new Date().toISOString();
    payment.transactionReference = transactionReference || 'TXN_IND_' + Math.random().toString(36).substr(2, 9).toUpperCase();

    payments[index] = payment;
    db.saveIndustryPayments(payments);
    return payment;
  },

  // --- Onboarding Checklist Status ---
  getOnboardingStatus: () => {
    const rates = db.getRates();
    const schools = db.getSchools();
    const industries = db.getIndustries();

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
  getInventory: () => {
    return db.getInventory();
  },

  updateInventory: (inventoryData) => {
    db.saveInventory(inventoryData);
    return db.getInventory();
  },

  addInventoryTransaction: (transaction) => {
    db.addTransaction(transaction);
  },

  getInventoryTransactions: () => {
    return db.getTransactions();
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
