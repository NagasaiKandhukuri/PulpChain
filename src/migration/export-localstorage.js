/**
 * RUN THIS IN THE BROWSER CONSOLE to export the current localStorage state to backup.json.
 * 
 * Instructions:
 * 1. Open your running PulpChain application in the browser.
 * 2. Open Developer Tools (F12 or Right Click -> Inspect).
 * 3. Go to the Console tab.
 * 4. Paste this entire script and press Enter.
 * 5. It will download 'backup.json' to your computer.
 * 6. Move 'backup.json' into this src/migration/ folder.
 */
(function exportLocalStorage() {
  const data = {
    schools: JSON.parse(localStorage.getItem('pulpchain_schools') || '[]'),
    industries: JSON.parse(localStorage.getItem('pulpchain_industries') || '[]'),
    inventory: JSON.parse(localStorage.getItem('pulpchain_inventory') || '[]'),
    inventoryTransactions: JSON.parse(localStorage.getItem('pulpchain_inventory_transactions') || '[]'),
    rates: JSON.parse(localStorage.getItem('pulpchain_rates') || '{}'),
    pickups: JSON.parse(localStorage.getItem('pulpchain_pickups') || '[]'),
    payments: JSON.parse(localStorage.getItem('pulpchain_payments') || '[]'),
    industryOrders: JSON.parse(localStorage.getItem('pulpchain_industry_orders') || '[]'),
    industryPayments: JSON.parse(localStorage.getItem('pulpchain_industry_payments') || '[]')
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  console.log('✅ Exported localStorage to backup.json');
})();
