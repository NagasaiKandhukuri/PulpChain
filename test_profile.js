const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

fetch(`${url}/rest/v1/profiles?email=eq.testindustry1@gmail.com`, {
  method: 'GET',
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
})
.then(res => res.json())
.then(data => console.log("PROFILES:", data))
.catch(err => console.error(err));
