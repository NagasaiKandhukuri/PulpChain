import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testJoin() {
  const { data, error } = await supabase
    .from('industry_payments')
    .select('*, industries(company_name)')
    .limit(1);
    
  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Industry Payment Row:", JSON.stringify(data?.[0], null, 2));
  }
}

testJoin();
