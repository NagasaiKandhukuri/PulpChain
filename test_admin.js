const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const tryLogin = async (email, pw) => {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pw })
  });
  const data = await res.json();
  if (data.user) { console.log("FOUND ADMIN!", email, pw, data.user.id); process.exit(0); }
};

(async () => {
  const emails = ['admin@pulpchain.com', 'admin@gmail.com', 'admin@test.com', 'admin@admin.com', 'testadmin@gmail.com'];
  const passwords = ['admin', 'password', 'admin123', 'testadmin', 'password123', '123456'];
  for (const email of emails) {
    for (const pw of passwords) {
      await tryLogin(email, pw);
    }
  }
  console.log("No admin password matched.");
})();
