
async function loadData() {
  const res = await fetch('data.json?ts=' + Date.now());
  const data = await res.json();
  // Set header
  document.querySelector('#name').textContent = data.site.title;
  document.querySelector('#subtitle').textContent = data.site.subtitle;
  document.querySelector('#updatedAt').textContent = new Date(data.site.updated_at).toLocaleString();
  if (data.site.links) {
    const links = document.querySelector('#links');
    links.innerHTML = '';
    data.site.links.forEach(l => {
      const a = document.createElement('a');
      a.href = l.href; a.textContent = l.label; a.target = '_blank'; a.rel='noopener';
      links.appendChild(a);
      links.appendChild(document.createTextNode(' ・ '));
    });
  }
  // Render manifesto
  renderManifesto(data.manifesto);
  // Render activity
  renderActivities(data.activities);
  // Render news
  renderNews(data.news);
  window.DATA = data;
}
function statusInfo(s) {
  switch(s){
    case 'done': return {label:'達成', cls:'done', pct:100};
    case 'partial': return {label:'一部達成', cls:'wip', pct:60};
    case 'wip': return {label:'進行中', cls:'wip', pct:35};
    default: return {label:'未着手', cls:'not', pct:0};
  }
}
function renderManifesto(items) {
  const wrap = document.querySelector('#sect-manifesto .grid');
  const sel = document.querySelector('#filter-status');
  const kw = document.querySelector('#mf-search');
  const doRender = () => {
    const s = sel.value;
    const q = kw.value.trim().toLowerCase();
    wrap.innerHTML='';
    let filtered = items.filter(it => (s==='all' || it.status===s) && (q==='' || it.title.toLowerCase().includes(q) || (it.tags||[]).join(' ').toLowerCase().includes(q)));
    if(filtered.length===0){ wrap.innerHTML='<div class="empty">該当する項目がありません</div>'; return; }
    filtered.forEach(it => {
      const st = statusInfo(it.status);
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `
        <div class="kicker">公約</div>
        <h3>${it.title}</h3>
        <div class="meta">
          <span class="badge ${st.cls}">${st.label}</span>
          <span>${it.department||''}</span>
          <span>${it.period||''}</span>
        </div>
        <div class="progress"><div style="width:${st.pct}%"></div></div>
        <ul class="taglist">${(it.tags||[]).map(t=>`<li>#${t}</li>`).join('')}</ul>
        <details>
          <summary>内容を開く</summary>
          <div style="margin-top:8px; font-size:14px; line-height:1.6;">${it.body||''}</div>
          ${(it.links||[]).map(l=>`<div style="margin-top:6px;"><a href="${l.href}" target="_blank" rel="noopener">${l.label||l.href}</a></div>`).join('')}
        </details>
      `;
      wrap.appendChild(card);
    });
  };
  sel.onchange = doRender;
  kw.oninput = doRender;
  doRender();
}
function renderActivities(items){
  const wrap = document.querySelector('#sect-activities .grid');
  const kw = document.querySelector('#ac-search');
  const doRender = () => {
    const q = kw.value.trim().toLowerCase();
    wrap.innerHTML='';
    let filtered = items.filter(it => q==='' || it.title.toLowerCase().includes(q) || (it.tags||[]).join(' ').toLowerCase().includes(q) || (it.location||'').toLowerCase().includes(q));
    if(filtered.length===0){ wrap.innerHTML='<div class="empty">該当する活動はありません</div>'; return; }
    filtered.sort((a,b)=> (b.date||'').localeCompare(a.date||''));
    filtered.forEach(it => {
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `
        <div class="kicker">地域活動</div>
        <h3>${it.title}</h3>
        <div class="meta">
          <span>${it.date||''}</span>
          <span>${it.location||''}</span>
        </div>
        <ul class="taglist">${(it.tags||[]).map(t=>`<li>#${t}</li>`).join('')}</ul>
        <details>
          <summary>内容を開く</summary>
          <div style="margin-top:8px; font-size:14px; line-height:1.6;">${it.body||''}</div>
          ${(it.links||[]).map(l=>`<div style="margin-top:6px;"><a href="${l.href}" target="_blank" rel="noopener">${l.label||l.href}</a></div>`).join('')}
          ${(it.media||[]).map(m=>`<div style="margin-top:6px;"><a href="${m}" target="_blank" rel="noopener">写真/動画を見る</a></div>`).join('')}
        </details>
      `;
      wrap.appendChild(card);
    });
  };
  kw.oninput = doRender;
  doRender();
}
function renderNews(items){
  const wrap = document.querySelector('#sect-news .grid');
  wrap.innerHTML='';
  if(!items || items.length===0){ wrap.innerHTML='<div class="empty">お知らせはありません</div>'; return; }
  items.sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  items.forEach(it => {
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `
      <div class="kicker">お知らせ</div>
      <h3>${it.title}</h3>
      <div class="meta">
        <span>${it.date||''}</span>
      </div>
      <details>
        <summary>内容を開く</summary>
        <div style="margin-top:8px; font-size:14px; line-height:1.6;">${it.body||''}</div>
        ${(it.links||[]).map(l=>`<div style="margin-top:6px;"><a href="${l.href}" target="_blank" rel="noopener">${l.label||l.href}</a></div>`).join('')}
      </details>
    `;
    wrap.appendChild(card);
  });
}
function switchTab(tab){
  document.querySelectorAll('nav.tabs button').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  document.querySelectorAll('.section').forEach(s=>s.classList.toggle('active', s.id===tab));
}
document.addEventListener('DOMContentLoaded', ()=>{
  loadData();
  document.querySelectorAll('nav.tabs button').forEach(b=>{
    b.addEventListener('click', ()=> switchTab(b.dataset.tab));
  });
});
