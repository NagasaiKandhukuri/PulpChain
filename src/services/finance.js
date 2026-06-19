import { supabase } from '../lib/supabase';
import { adminService } from './admin';

export const financeService = {
  // Get sales ledger
  getSales: async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('sale_date', { ascending: false });
    if (error) throw new Error(error.message);
      
    return data.map(s => ({
      id: s.id,
      orderId: s.order_id,
      industryId: s.industry_id,
      invoiceNumber: s.invoice_number,
      buyerName: s.buyer_name,
      paperType: s.paper_type,
      quantity: s.quantity,
      saleRate: s.sale_rate,
      totalRevenue: s.total_revenue,
      saleDate: s.sale_date
    }));
  },

  // Compute operational overview summaries in INR (₹)
  getFinancialSummary: async () => {
    const sales = await financeService.getSales();
    const payments = await adminService.getPayments();
    const industryPayments = await adminService.getAllIndustryPayments();
    const inventory = await adminService.getInventory();
    const pickups = await adminService.getPickups();
    const rates = await adminService.getRates();

    // 1. Purchased weight = actual weight of completed or paid pickups
    const purchasedKg = pickups
      .filter(p => p.status === 'completed' || p.status === 'paid')
      .reduce((sum, p) => sum + (p.actualWeight || 0), 0);

    // 2. Sold weight = quantity of completed sales
    const soldKg = sales.reduce((sum, s) => sum + s.quantity, 0);

    // 3. Revenue = sum of Completed Industry Orders (which write to sales collection)
    const revenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);

    // Calculate GST Collected from industry payments
    const gstCollected = industryPayments.reduce((sum, p) => sum + (p.gstAmount || 0), 0);
    const invoiceTotal = revenue + gstCollected;

    // 4. Expenses = total amount disbursed or pending (accrual accounting)
    const expenses = payments
      .filter(p => p.status === 'paid' || p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    // 5. Net Profit
    const netProfit = revenue - expenses;

    // 6. Average Margin/kg
    const averageMarginPerKg = purchasedKg > 0 ? netProfit / purchasedKg : 0;

    // 7. Inventory value metric calculation
    let inventoryValue = 0;
    if (rates) {
      const mixedVal = (inventory.mixedPaperKg || 0) * (rates.mixedPaperSell || 0);
      const cardVal = (inventory.cardboardKg || 0) * (rates.cardboardSell || 0);
      const whiteVal = (inventory.whitePaperKg || 0) * (rates.whitePaperSell || 0);
      inventoryValue = mixedVal + cardVal + whiteVal;
    }

    // 8. New Upgrades (Turnover, Utilization, Costs, Margins)
    const currentStock = (inventory.whitePaperKg || 0) + (inventory.cardboardKg || 0) + (inventory.mixedPaperKg || 0);
    const utilizationPct = purchasedKg > 0 ? (soldKg / purchasedKg) * 100 : 0;
    const turnoverPct = currentStock > 0 ? (soldKg / currentStock) * 100 : 0;
    const avgProcurementCost = purchasedKg > 0 ? expenses / purchasedKg : 0;
    const avgSellingPrice = soldKg > 0 ? revenue / soldKg : 0;
    const grossMargin = avgSellingPrice - avgProcurementCost;
    const grossMarginPct = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;

    return {
      purchasedKg,
      soldKg,
      paymentsCount: payments.length,
      revenue,
      gstCollected,
      invoiceTotal,
      expenses,
      netProfit,
      averageMarginPerKg,
      inventoryValue,
      currentStock,
      utilizationPct,
      turnoverPct,
      avgProcurementCost,
      avgSellingPrice,
      grossMargin,
      grossMarginPct
    };
  }
};
