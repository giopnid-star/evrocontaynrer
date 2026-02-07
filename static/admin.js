document.addEventListener('DOMContentLoaded', () => {
  const qEl = document.getElementById('q');
  const sentEl = document.getElementById('sent');
  const searchBtn = document.getElementById('searchBtn');
  const exportBtn = document.getElementById('exportBtn');
  const backupBtn = document.getElementById('backupBtn');
  const tbody = document.querySelector('#contactsTable tbody');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const pageInfo = document.getElementById('pageInfo');

  let page = 1, limit = 20, total = 0;

  async function load() {
    const q = encodeURIComponent(qEl.value || '');
    const sent = sentEl.value;
    const res = await fetch(`/api/contacts?q=${q}&sent=${sent}&page=${page}&limit=${limit}`);
    const data = await res.json();
    total = data.total || 0;
    render(data.contacts || []);
    pageInfo.textContent = `${page} / ${Math.max(1, Math.ceil(total/limit))} (Всего: ${total})`;
  }

  function render(items){
    tbody.innerHTML = '';
    for(const it of items){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${it.id}</td><td>${escapeHtml(it.name)}</td><td>${escapeHtml(it.email)}</td><td>${escapeHtml(it.message)}</td><td>${it.created_at}</td><td>${it.sent}</td>`;
      tbody.appendChild(tr);
    }
  }

  function escapeHtml(s){ return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  searchBtn.addEventListener('click', ()=>{ page=1; load(); });
  prevBtn.addEventListener('click', ()=>{ if(page>1){ page--; load(); }});
  nextBtn.addEventListener('click', ()=>{ page++; load(); });

  exportBtn.addEventListener('click', async ()=>{
    const q = encodeURIComponent(qEl.value || '');
    const sent = sentEl.value;
    const url = `/api/contacts/export?q=${q}&sent=${sent}`;
    window.open(url, '_blank');
  });

  backupBtn.addEventListener('click', async ()=>{
    backupBtn.disabled = true; backupBtn.textContent='Бэкап...';
    const res = await fetch('/api/backup', { method: 'POST' });
    const data = await res.json();
    if(res.ok){ alert('Бэкап создан: '+data.file); } else { alert('Ошибка: '+(data.error||'см. сервер')); }
    backupBtn.disabled = false; backupBtn.textContent='Создать бэкап DB';
  });

  // initial load
  load();
});
