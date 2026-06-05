// Database service for managing data in localStorage.
// This is designed to act as an abstraction layer simulating a relational database.

const KEYS = {
  RATES: 'pulpchain_rates',
  SCHOOLS: 'pulpchain_schools',
  PICKUPS: 'pulpchain_pickups',
  PAYMENTS: 'pulpchain_payments',
  SALES: 'pulpchain_sales',
  DOCUMENTS: 'pulpchain_documents',
  SESSION: 'pulpchain_session',
  
  // Phase 2 Collections
  INDUSTRIES: 'pulpchain_industries',
  INVENTORY: 'pulpchain_inventory',
  ORDERS: 'pulpchain_industry_orders',
  TRANSACTIONS: 'pulpchain_inventory_transactions',
  CONTRACTS: 'pulpchain_industry_contracts',
  INDUSTRY_PAYMENTS: 'pulpchain_industry_payments'
};

// Initialize empty stores on first load if not present
export const initDB = () => {
  if (!localStorage.getItem(KEYS.RATES)) {
    localStorage.setItem(KEYS.RATES, JSON.stringify({
      mixedPaper: null,
      cardboard: null,
      whitePaper: null,
      mixedPaperSell: null,
      cardboardSell: null,
      whitePaperSell: null,
      moq: null,
      lastUpdated: null
    }));
  }
  if (!localStorage.getItem(KEYS.SCHOOLS)) {
    localStorage.setItem(KEYS.SCHOOLS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.PICKUPS)) {
    localStorage.setItem(KEYS.PICKUPS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.PAYMENTS)) {
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.SALES)) {
    localStorage.setItem(KEYS.SALES, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.DOCUMENTS)) {
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify([]));
  }
  
  // Phase 2 Initializations
  if (!localStorage.getItem(KEYS.INDUSTRIES)) {
    localStorage.setItem(KEYS.INDUSTRIES, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.INVENTORY)) {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify({
      mixedPaperKg: 0,
      cardboardKg: 0,
      whitePaperKg: 0,
      lastUpdated: new Date().toISOString()
    }));
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.CONTRACTS)) {
    localStorage.setItem(KEYS.CONTRACTS, JSON.stringify([]));
  }
  if (!localStorage.getItem('pulpchain_industry_payments')) {
    localStorage.setItem('pulpchain_industry_payments', JSON.stringify([]));
  }
};

// Call initialization
initDB();

export const getCollection = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error reading collection ${key}`, e);
    return [];
  }
};

export const saveCollection = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving collection ${key}`, e);
  }
};

export const db = {
  // Rates
  getRates: () => {
    const data = localStorage.getItem(KEYS.RATES);
    return data ? JSON.parse(data) : null;
  },
  saveRates: (rates) => {
    localStorage.setItem(KEYS.RATES, JSON.stringify({
      ...rates,
      lastUpdated: new Date().toISOString()
    }));
  },

  // Schools
  getSchools: () => getCollection(KEYS.SCHOOLS),
  saveSchools: (schools) => saveCollection(KEYS.SCHOOLS, schools),
  addSchool: (school) => {
    const schools = getCollection(KEYS.SCHOOLS);
    schools.push(school);
    saveCollection(KEYS.SCHOOLS, schools);
  },

  // Pickups
  getPickups: () => getCollection(KEYS.PICKUPS),
  savePickups: (pickups) => saveCollection(KEYS.PICKUPS, pickups),
  addPickup: (pickup) => {
    const pickups = getCollection(KEYS.PICKUPS);
    pickups.push(pickup);
    saveCollection(KEYS.PICKUPS, pickups);
  },

  // Payments
  getPayments: () => getCollection(KEYS.PAYMENTS),
  savePayments: (payments) => saveCollection(KEYS.PAYMENTS, payments),
  addPayment: (payment) => {
    const payments = getCollection(KEYS.PAYMENTS);
    payments.push(payment);
    saveCollection(KEYS.PAYMENTS, payments);
  },

  // Sales
  getSales: () => getCollection(KEYS.SALES),
  saveSales: (sales) => saveCollection(KEYS.SALES, sales),
  addSale: (sale) => {
    const sales = getCollection(KEYS.SALES);
    sales.push(sale);
    saveCollection(KEYS.SALES, sales);
  },

  // Documents
  getDocuments: () => getCollection(KEYS.DOCUMENTS),
  saveDocuments: (docs) => saveCollection(KEYS.DOCUMENTS, docs),
  addDocument: (docItem) => {
    const docs = getCollection(KEYS.DOCUMENTS);
    docs.push(docItem);
    saveCollection(KEYS.DOCUMENTS, docs);
  },

  // Phase 2: Industry
  getIndustries: () => getCollection(KEYS.INDUSTRIES),
  saveIndustries: (industries) => saveCollection(KEYS.INDUSTRIES, industries),
  addIndustry: (ind) => {
    const industries = getCollection(KEYS.INDUSTRIES);
    industries.push(ind);
    saveCollection(KEYS.INDUSTRIES, industries);
  },

  // Phase 2: Inventory
  getInventory: () => {
    const data = localStorage.getItem(KEYS.INVENTORY);
    return data ? JSON.parse(data) : { mixedPaperKg: 0, cardboardKg: 0, whitePaperKg: 0, lastUpdated: new Date().toISOString() };
  },
  saveInventory: (inv) => {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify({
      ...inv,
      lastUpdated: new Date().toISOString()
    }));
  },

  // Phase 2: Orders
  getOrders: () => getCollection(KEYS.ORDERS),
  saveOrders: (orders) => saveCollection(KEYS.ORDERS, orders),
  addOrder: (order) => {
    const orders = getCollection(KEYS.ORDERS);
    orders.push(order);
    saveCollection(KEYS.ORDERS, orders);
  },

  // Phase 2: Transactions
  getTransactions: () => getCollection(KEYS.TRANSACTIONS),
  saveTransactions: (txs) => saveCollection(KEYS.TRANSACTIONS, txs),
  addTransaction: (tx) => {
    const txs = getCollection(KEYS.TRANSACTIONS);
    txs.push(tx);
    saveCollection(KEYS.TRANSACTIONS, txs);
  },

  // Phase 2: Contracts
  getContracts: () => getCollection(KEYS.CONTRACTS),
  saveContracts: (contracts) => saveCollection(KEYS.CONTRACTS, contracts),
  addContract: (contract) => {
    const contracts = getCollection(KEYS.CONTRACTS);
    contracts.push(contract);
    saveCollection(KEYS.CONTRACTS, contracts);
  },

  // Phase 2.1: Industry Payments
  getIndustryPayments: () => getCollection(KEYS.INDUSTRY_PAYMENTS),
  saveIndustryPayments: (pays) => saveCollection(KEYS.INDUSTRY_PAYMENTS, pays),
  addIndustryPayment: (pay) => {
    const pays = getCollection(KEYS.INDUSTRY_PAYMENTS);
    pays.push(pay);
    saveCollection(KEYS.INDUSTRY_PAYMENTS, pays);
  },

  // Session Management (simulating JWT/Cookie auth session)
  getSession: () => {
    try {
      const session = localStorage.getItem(KEYS.SESSION);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },
  setSession: (session) => {
    if (session) {
      localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(KEYS.SESSION);
    }
  }
};
