import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fganztzskjtlczcyhnut.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnYW56dHpza2p0bGN6Y3lobnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0OTgwNjksImV4cCI6MjA5NjA3NDA2OX0.UV8nFhrwZE-LcYwtMELRWmvha64n4B4ct7B4nG3-Yuo'
);

async function checkSchema(table) {
  // Using REST API via node-fetch or standard RPC is easier, but standard select with limit 1 should return columns in the response keys
  const { data, error } = await supabase.from(table).select('*').limit(1);
  if (error) {
    console.log(`Table ${table} error:`, error.message);
  } else {
    // If empty array, columns aren't exposed directly like this.
    // Instead we can use RPC or rely on the previous inspection of schema.sql.
    // For now let's just insert a dummy or check existing data.
    console.log(`Table ${table} query success.`);
  }
}

async function run() {
  await checkSchema('rates');
  await checkSchema('pickups');
  await checkSchema('inventory');
  await checkSchema('inventory_transactions');
  await checkSchema('payments');
}

run();
