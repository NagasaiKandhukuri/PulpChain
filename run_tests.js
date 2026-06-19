const URL = process.env.VITE_SUPABASE_URL;
const SR_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Credentials
const IND_EMAIL = 'testindustry1@gmail.com';
const IND_PW = 'testindustry1';
const ADM_EMAIL = 'admin@pulpchain.com';
const ADM_PW = 'admin@123';

async function req(path, method = 'GET', body = null, token = SR_KEY) {
  const opts = {
    method,
    headers: {
      'apikey': SR_KEY, // use SR_KEY as apikey to bypass some restrictions if needed, but normally use ANON_KEY for auth endpoints
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };
  if (path.includes('/auth/v1')) {
    opts.headers['apikey'] = ANON_KEY;
  }
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${URL}${path}`, opts);
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`HTTP ${r.status} ${path}: ${txt}`);
  }
  return path.includes('/auth/v1') ? r.json() : (r.status === 204 ? null : r.json());
}

async function run() {
  console.log("== STARTING VERIFICATION TESTS ==");
  
  // 1. Authenticate
  const indAuth = await req('/auth/v1/token?grant_type=password', 'POST', { email: IND_EMAIL, password: IND_PW });
  const indToken = indAuth.access_token;
  const indUid = indAuth.user.id;
  
  const admAuth = await req('/auth/v1/token?grant_type=password', 'POST', { email: ADM_EMAIL, password: ADM_PW });
  const admToken = admAuth.access_token;
  const admUid = admAuth.user.id;

  console.log("Auth Success. IndUID:", indUid, "AdmUID:", admUid);

  const getInv = async () => {
    const inv = await req('/rest/v1/inventory?select=*', 'GET', null, SR_KEY);
    return inv.reduce((acc, i) => { acc[i.paper_type] = parseFloat(i.quantity); return acc; }, {});
  };

  // 1. Industry Order Creation
  console.log("\n-- 1. Industry Order Creation --");
  const types = ['whitePaper', 'cardboard', 'mixedPaper'];
  const orderIds = {};
  for (const pt of types) {
    const res = await req('/rest/v1/industry_orders', 'POST', {
      industry_id: indUid,
      paper_type: pt,
      quantity: 10,
      rate: 15,
      amount: 150,
      status: 'requested',
      delivery_address: '123 Test St',
      required_delivery_date: new Date().toISOString()
    }, indToken);
    orderIds[pt] = res[0].id;
    console.log(`Created ${pt} order: ${orderIds[pt]}`);
  }

  // 2. Requested -> Approved
  console.log("\n-- 2. Requested -> Approved --");
  const wpId = orderIds['whitePaper'];
  const invBeforeApprove = await getInv();
  
  await req(`/rest/v1/industry_orders?id=eq.${wpId}`, 'PATCH', { status: 'approved', approved_date: new Date().toISOString() }, admToken);
  const approvedOrder = (await req(`/rest/v1/industry_orders?id=eq.${wpId}`, 'GET', null, SR_KEY))[0];
  console.log(`Order ${wpId} status: ${approvedOrder.status}, approved_date: ${approvedOrder.approved_date}`);
  
  const invAfterApprove = await getInv();
  console.log(`Inventory Before: ${invBeforeApprove['whitePaper']}, After: ${invAfterApprove['whitePaper']} (Expected: Unchanged)`);

  // 3. Approved -> Allocated
  console.log("\n-- 3. Approved -> Allocated --");
  const invBeforeAlloc = await getInv();
  // We must simulate the exact adminService logic since our REST PATCH bypasses JS logic.
  // Wait, the test says "perform verification tests" which implies using the application logic!
  // Doing it via pure REST PATCH won't trigger the JS inventory deduction!
  // So I need to use the adminService or replicate its logic. 
  console.log("Skipping direct REST patch for allocation to use JS layer via next script.");
}

run().catch(console.error);
