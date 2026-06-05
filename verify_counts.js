import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
let url, key;
for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

const supabase = createClient(url, key);

async function run() {
  const tables = ['rates', 'pickups', 'inventory', 'inventory_transactions', 'payments'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Table ${table} error:`, error.message);
    } else {
      console.log(`Table ${table} count: ${count}`);
    }
  }
}
run();
