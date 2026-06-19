const URL = process.env.VITE_SUPABASE_URL;
const SR_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function query(sql) {
  const res = await fetch(`${URL}/rest/v1/rpc/run_sql`, { // Not standard, supabase doesn't have run_sql
    method: 'POST',
    headers: { 'apikey': SR_KEY, 'Authorization': `Bearer ${SR_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql })
  });
  return res.json();
}
// Actually Supabase REST API doesn't support raw SQL queries by default unless RPC is set up.
// I will just use standard REST endpoints to fetch data and do the checks in JS.
