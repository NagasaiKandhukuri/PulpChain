// Mock localStorage first
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

async function run() {
  const { initDB } = await import('./src/services/db.js');
  initDB();

  const { supabase } = await import('./src/lib/supabase.js');
  const { industryService } = await import('./src/services/industry.js');
  const { adminService } = await import('./src/services/admin.js');

  console.log("=== Phase 4B-3 Verification ===");
  
  // Login as admin
  const { error: admErr } = await supabase.auth.signInWithPassword({
    email: 'admin@pulpchain.com',
    password: 'admin@123'
  });
  if (admErr) throw admErr;
  console.log("Admin logged in successfully.\n");

  console.log("[STEP 2] Order Completion Test");
  let targetOrder = null;
  const { data: indData } = await supabase.auth.signInWithPassword({
    email: 'testindustry1@gmail.com',
    password: 'testindustry1'
  });
  
  global.localStorage.setItem('pulpchain_rates', JSON.stringify({
    whitePaperSell: 15, cardboardSell: 10, mixedPaperSell: 5, moq: 1
  }));
  
  const newOrder = await industryService.requestOrder(indData.user.id, 'whitePaper', 100, 'Test', new Date().toISOString(), '');
  targetOrder = newOrder;
  console.log(`Created new order: ${targetOrder.id}`);
  
  // Login back as admin
  await supabase.auth.signInWithPassword({ email: 'admin@pulpchain.com', password: 'admin@123' });

  try {
    // Fulfill order
    await adminService.updateOrderStatus(targetOrder.id, 'approved');
    await supabase.from('inventory').upsert({ paper_type: 'whitePaper', quantity: 1000 });
    await adminService.updateOrderStatus(targetOrder.id, 'allocated');
    await adminService.updateOrderStatus(targetOrder.id, 'dispatched');
    await adminService.updateOrderStatus(targetOrder.id, 'delivered');
    console.log("Order is now delivered. Marking as completed...");
    await adminService.updateOrderStatus(targetOrder.id, 'completed');
    
    // Verify industry_orders
    const { data: orderData } = await supabase.from('industry_orders').select('*').eq('id', targetOrder.id).single();
    if (orderData.status === 'completed' && orderData.completed_date) {
      console.log("✅ industry_orders: status became completed and completed_date populated");
    } else {
      console.error("❌ industry_orders: failed to update correctly");
    }
    
    // Verify sales
    const { data: salesData, error: sDataErr } = await supabase.from('sales').select('*').eq('order_id', targetOrder.id);
    if (sDataErr) console.error("Sales fetch error:", sDataErr.message);
    if (salesData && salesData.length === 1) {
      console.log("✅ sales: exactly one row created");
      if (salesData[0].order_id === targetOrder.id) {
        console.log("✅ sales.order_id = industry_orders.id");
      }
    } else {
      console.error(`❌ sales: expected 1 row, got ${salesData?.length}`);
    }
    
    // Verify industry_payments
    const { data: paymentsData, error: pDataErr } = await supabase.from('industry_payments').select('*').eq('order_id', targetOrder.id);
    if (pDataErr) console.error("Payments fetch error:", pDataErr.message);
    if (paymentsData && paymentsData.length === 1) {
      console.log("✅ industry_payments: exactly one row created");
      if (salesData && salesData.length === 1 && paymentsData[0].sale_id === salesData[0].id) {
        console.log("✅ industry_payments.sale_id = sales.id");
      }
      if (paymentsData[0].order_id === targetOrder.id) {
        console.log("✅ industry_payments.order_id = industry_orders.id");
      }
    } else {
      console.error(`❌ industry_payments: expected 1 row, got ${paymentsData?.length}`);
    }

  } catch (err) {
    console.error("Order completion failed:", err.message);
  }

  console.log("\n[STEP 3] Data Integrity Queries");
  const { data: completedOrders } = await supabase.from('industry_orders').select('id').eq('status', 'completed');
  const { data: sales, error: sErr } = await supabase.from('sales').select('id, order_id');
  if (sErr) console.error("Sales Error:", sErr.message);
  const { data: payments, error: pErr } = await supabase.from('industry_payments').select('id, sale_id');
  if (pErr) console.error("Payments Error:", pErr.message);
  
  const salesOrderIds = new Set((sales || []).map(s => s.order_id));
  const missingSales = (completedOrders || []).filter(o => !salesOrderIds.has(o.id));
  console.log("A) Completed Orders missing Sales:");
  console.log("Expected: 0 | Actual:", missingSales.length, missingSales.length === 0 ? "✅" : "❌");

  const paymentSaleIds = new Set((payments || []).map(p => p.sale_id));
  const missingPayments = (sales || []).filter(s => !paymentSaleIds.has(s.id));
  console.log("B) Sales missing Industry Payments:");
  console.log("Expected: 0 | Actual:", missingPayments.length, missingPayments.length === 0 ? "✅" : "❌");

  const orderSaleCounts = {};
  for (const s of (sales || [])) orderSaleCounts[s.order_id] = (orderSaleCounts[s.order_id] || 0) + 1;
  const duplicates = Object.entries(orderSaleCounts).filter(([_, count]) => count > 1);
  console.log("C) Duplicate Sales per Order:");
  console.log("Expected: 0 | Actual:", duplicates.length, duplicates.length === 0 ? "✅" : "❌");

  const salePayCounts = {};
  for (const p of (payments || [])) {
    if (p.sale_id) salePayCounts[p.sale_id] = (salePayCounts[p.sale_id] || 0) + 1;
  }
  const dupPayments = Object.entries(salePayCounts).filter(([_, count]) => count > 1);
  console.log("D) Duplicate Payments per Sale:");
  console.log("Expected: 0 | Actual:", dupPayments.length, dupPayments.length === 0 ? "✅" : "❌");

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
