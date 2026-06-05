import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure you run this script with the --env-file=.env flag
// e.g., node --env-file=../../.env import-to-supabase.js

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// We need the service role key to bypass RLS during migration, 
// or at least make sure we are admin or bypass it.
// If not available, we use anon key, but might hit RLS.
// Since it's a migration script, preferably use a SERVICE_ROLE_KEY if possible, or disable RLS temporarily.
// We will use anon key for now, assuming RLS allows admins or we run it locally as admin.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key. Did you run with --env-file=.env?");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importData() {
  console.log("Starting migration import...");
  
  const backupPath = path.join(__dirname, 'backup.json');
  if (!fs.existsSync(backupPath)) {
    console.error(`backup.json not found at ${backupPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(backupPath, 'utf8');
  const data = JSON.parse(rawData);
  
  // NOTE: This is a scaffold. 
  // Because we are migrating users to Supabase Auth, we can't easily import passwords.
  // Real users will need to re-register or we use Supabase admin API to create users.
  // For the MVP, we will print instructions and import the non-user data if possible.

  console.log("Found data:");
  console.log(`- Schools: ${data.schools?.length || 0}`);
  console.log(`- Industries: ${data.industries?.length || 0}`);
  console.log(`- Pickups: ${data.pickups?.length || 0}`);
  console.log(`- Inventory items: ${Object.keys(data.inventory || {}).length}`);

  console.log("\n⚠️ Note: Since this system uses Supabase Auth, you must recreate the user accounts (Admin, School, Industry) via the app's Signup page before running a full data linkage script, because foreign keys depend on auth.users(id).");
  
  // Example for rates (no user dependencies)
  if (data.rates && Object.keys(data.rates).length > 0) {
    console.log("Migrating rates...");
    for (const [type, rateInfo] of Object.entries(data.rates)) {
      const { error } = await supabase.from('rates').upsert({
        paper_type: type,
        buy_rate: rateInfo.buy,
        sell_rate: rateInfo.sell,
        moq: rateInfo.moq
      });
      if (error) console.error(`Error migrating rate for ${type}:`, error.message);
    }
  }

  console.log("Migration script scaffold finished.");
}

importData();
