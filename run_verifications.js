// Mock localStorage first
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

// Now dynamically import
async function run() {
  const { initDB } = await import('./src/services/db.js');
  initDB();

  const { supabase } = await import('./src/lib/supabase.js');
  const { industryService } = await import('./src/services/industry.js');
  const { adminService } = await import('./src/services/admin.js');

  console.log("=== STARTING VERIFICATION ===\n");
  
  // 1. Authenticate Industry
  console.log("Authenticating as Industry...");
  const { data: indData, error: indErr } = await supabase.auth.signInWithPassword({
    email: 'testindustry1@gmail.com',
    password: 'testindustry1'
  });
  if (indErr) throw indErr;
  const indUid = indData.user.id;
  console.log("Industry Auth Success:", indUid);

  // 1. Industry Order Creation
  console.log("\n[TEST 1] Creating Orders (whitePaper, cardboard, mixedPaper)");
  const types = ['whitePaper', 'cardboard', 'mixedPaper'];
  const orderIds = {};
  
  global.localStorage.setItem('pulpchain_rates', JSON.stringify({
    whitePaperSell: 15, cardboardSell: 10, mixedPaperSell: 5, moq: 1
  }));

  for (const pt of types) {
    const order = await industryService.requestOrder(indUid, pt, 100, '123 Test St', new Date().toISOString(), '');
    orderIds[pt] = order.id;
    console.log(`Created ${pt} order: ${order.id}`);
  }

  const { data: verifyOrders } = await supabase.from('industry_orders').select('*').in('id', Object.values(orderIds));
  if (verifyOrders.length === 3) {
    console.log("✅ Verified: 3 industry_orders rows created.");
  } else {
    console.error("❌ Failed to create orders.");
  }

  console.log("\nAuthenticating as Admin...");
  const { data: admData, error: admErr } = await supabase.auth.signInWithPassword({
    email: 'admin@pulpchain.com',
    password: 'admin@123'
  });
  if (admErr) throw admErr;
  console.log("Admin Auth Success");

  const getInv = async () => {
    const { data } = await supabase.from('inventory').select('*');
    return data.reduce((acc, i) => { acc[i.paper_type] = Number(i.quantity); return acc; }, {});
  };

  const wpId = orderIds['whitePaper'];
  const cbId = orderIds['cardboard'];
  const mpId = orderIds['mixedPaper'];

  // 2. Requested -> Approved
  console.log("\n[TEST 2] Requested -> Approved (White Paper)");
  const invBeforeApprove = await getInv();
  await adminService.updateOrderStatus(wpId, 'approved');
  
  const { data: orderAppr } = await supabase.from('industry_orders').select('status, approved_date').eq('id', wpId).single();
  const invAfterApprove = await getInv();
  
  if (orderAppr.status === 'approved' && orderAppr.approved_date) {
    console.log(`✅ Status changed to ${orderAppr.status}, approved_date populated: ${orderAppr.approved_date}`);
  } else {
    console.error("❌ Failed status change or missing approved_date");
  }
  
  if (invBeforeApprove['whitePaper'] === invAfterApprove['whitePaper']) {
    console.log("✅ Inventory remains unchanged.");
  } else {
    console.error("❌ Inventory changed unexpectedly.");
  }

  // 3. Approved -> Allocated
  console.log("\n[TEST 3] Approved -> Allocated (White Paper)");
  const invBeforeAlloc = await getInv();
  await supabase.from('inventory').upsert({ paper_type: 'whitePaper', quantity: (invBeforeAlloc['whitePaper'] || 0) + 100 });
  const invReadyForAlloc = await getInv();
  console.log(`Inventory before allocation: ${invReadyForAlloc['whitePaper']}`);

  await adminService.updateOrderStatus(wpId, 'allocated');
  const invAfterAlloc = await getInv();
  console.log(`Inventory after allocation: ${invAfterAlloc['whitePaper']}`);
  
  if (invAfterAlloc['whitePaper'] === invReadyForAlloc['whitePaper'] - 100) {
    console.log("✅ Inventory decreased correctly.");
  } else {
    console.error("❌ Inventory did not decrease correctly.");
  }

  const { data: txsOut } = await supabase.from('inventory_transactions').select('*').eq('reference_id', wpId).order('created_at', {ascending: false});
  if (txsOut && txsOut.length > 0 && txsOut[0].movement_type === 'out') {
    console.log("✅ inventory_transactions row created with movement_type='out'.");
  } else {
    console.error("❌ Failed to find 'out' transaction.");
  }

  // 4. Allocated -> Cancelled
  console.log("\n[TEST 4] Allocated -> Cancelled (White Paper)");
  await adminService.updateOrderStatus(wpId, 'cancelled');
  const invAfterCancel = await getInv();
  
  if (invAfterCancel['whitePaper'] === invReadyForAlloc['whitePaper']) {
    console.log("✅ Inventory restored exactly.");
  } else {
    console.error(`❌ Inventory NOT restored. Expected ${invReadyForAlloc['whitePaper']}, got ${invAfterCancel['whitePaper']}`);
  }

  const { data: txsIn } = await supabase.from('inventory_transactions').select('*').eq('reference_id', wpId).eq('movement_type', 'in');
  if (txsIn && txsIn.length > 0) {
    console.log("✅ Refund transaction exists with movement_type='in'.");
  } else {
    console.error("❌ Failed to find refund transaction.");
  }

  // 5. Full Lifecycle
  console.log("\n[TEST 5] Full Lifecycle (Mixed Paper)");
  await adminService.updateOrderStatus(mpId, 'approved');
  await supabase.from('inventory').upsert({ paper_type: 'mixedPaper', quantity: 100 });
  await adminService.updateOrderStatus(mpId, 'allocated');
  await adminService.updateOrderStatus(mpId, 'dispatched');
  await adminService.updateOrderStatus(mpId, 'delivered');
  await adminService.updateOrderStatus(mpId, 'completed');

  const { data: orderFull } = await supabase.from('industry_orders').select('*').eq('id', mpId).single();
  if (orderFull.approved_date && orderFull.allocated_date && orderFull.dispatched_date && orderFull.delivered_date && orderFull.completed_date) {
    console.log("✅ All lifecycle timestamps are populated.");
  } else {
    console.error("❌ Missing lifecycle timestamps:", orderFull);
  }

  // 6. Inventory Reconciliation
  console.log("\n[TEST 6] Inventory Reconciliation");
  const { data: allInv } = await supabase.from('inventory').select('*');
  const { data: allTx } = await supabase.from('inventory_transactions').select('*');
  
  let discrepancies = 0;
  for (const item of allInv) {
    const typeTxs = allTx.filter(t => t.paper_type === item.paper_type);
    const sumIn = typeTxs.filter(t => t.movement_type === 'in').reduce((s, t) => s + Number(t.quantity), 0);
    const sumOut = typeTxs.filter(t => t.movement_type === 'out').reduce((s, t) => s + Number(t.quantity), 0);
    const calculated = sumIn - sumOut;
    
    if (Math.abs(Number(item.quantity) - calculated) > 0.01) {
      discrepancies++;
      console.error(`❌ Discrepancy for ${item.paper_type}: DB=${item.quantity}, Calculated=${calculated}`);
    }
  }
  if (discrepancies === 0) {
    console.log("✅ Zero discrepancies found in reconciliation.");
  }

  // 7. Paper Type Consistency
  console.log("\n[TEST 7] Paper Type Consistency");
  const typesFound = new Set([...allInv.map(i => i.paper_type), ...allTx.map(t => t.paper_type)]);
  const invalidTypes = [...typesFound].filter(t => !['whitePaper', 'cardboard', 'mixedPaper'].includes(t));
  if (invalidTypes.length === 0) {
    console.log("✅ No title-case variants allowed. Values are consistent.");
  } else {
    console.error("❌ Found invalid paper types:", invalidTypes);
  }

  // 8. RLS Verification
  console.log("\n[TEST 8] RLS Verification");
  await supabase.auth.signInWithPassword({ email: 'testindustry1@gmail.com', password: 'testindustry1' });
  const { data: indOrders } = await supabase.from('industry_orders').select('industry_id');
  const foreignOrders = indOrders.filter(o => o.industry_id !== indUid);
  if (foreignOrders.length === 0) {
    console.log("✅ Industry user only sees own orders.");
  } else {
    console.error("❌ Industry user sees other orders!");
  }

  await supabase.auth.signInWithPassword({ email: 'admin@pulpchain.com', password: 'admin@123' });
  const { data: admOrders } = await supabase.from('industry_orders').select('id');
  if (admOrders.length >= 3) {
    console.log("✅ Admin sees all orders.");
  } else {
    console.error("❌ Admin does not see all orders.");
  }

  console.log("\n=== VERIFICATION COMPLETE ===");
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
