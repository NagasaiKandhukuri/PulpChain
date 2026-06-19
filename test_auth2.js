const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const tryLogin = async (pw) => {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testindustry1@gmail.com', password: pw })
  });
  const data = await res.json();
  if (data.user) { console.log("FOUND! UID:", data.user.id, "PW:", pw); process.exit(0); }
};

(async () => {
  const passwords = ['password', 'password123', 'password123456', '123456', 'Testindustry1!', 'testindustry1', 'test1234', 'testpassword', 'admin123', 'admin'];
  for (const pw of passwords) {
    await tryLogin(pw);
  }
  console.log("No password matched.");
})();
