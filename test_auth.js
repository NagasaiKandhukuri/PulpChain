const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: {
    'apikey': key,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'testindustry1@gmail.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => {
  if (data.user) {
    console.log("AUTH UID:", data.user.id);
    console.log("AUTH EMAIL:", data.user.email);
  } else {
    console.log("Error:", data);
  }
})
.catch(err => console.error(err));
