import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://fganztzskjtlczcyhnut.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnYW56dHpza2p0bGN6Y3lobnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0OTgwNjksImV4cCI6MjA5NjA3NDA2OX0.UV8nFhrwZE-LcYwtMELRWmvha64n4B4ct7B4nG3-Yuo";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCounts() {
  const { count: salesCount } = await supabase.from('sales').select('*', { count: 'exact', head: true });
  const { count: paymentsCount } = await supabase.from('industry_payments').select('*', { count: 'exact', head: true });
  const { count: ordersCount } = await supabase.from('industry_orders').select('*', { count: 'exact', head: true }).eq('status', 'completed');
  
  console.log(`Sales count: ${salesCount}`);
  console.log(`Industry payments count: ${paymentsCount}`);
  console.log(`Completed orders count: ${ordersCount}`);
  if (salesCount === paymentsCount && paymentsCount === ordersCount) {
    console.log("SUCCESS: completed orders = sales = industry_payments");
  } else {
    console.log("MISMATCH!");
  }
}
checkCounts();
