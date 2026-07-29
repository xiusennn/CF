// hub.js — interactions for the editorial/content hub pages.
(function(){
  const all = Array.from(document.querySelectorAll('[data-hub-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-hub-card]'));
  all.forEach(btn=>btn.addEventListener('click',()=>{
    const f=btn.dataset.hubFilter;
    all.forEach(x=>x.classList.toggle('active',x===btn));
    cards.forEach(card=>{ card.hidden=!(f==='all'||card.dataset.hubCard.includes(f)); });
  }));
  document.querySelectorAll('[data-copy-template]').forEach(btn=>btn.addEventListener('click',async()=>{
    try { await navigator.clipboard.writeText(btn.dataset.copyTemplate); btn.textContent='Copied'; setTimeout(()=>btn.textContent='Copy template',1200); } catch(e) { btn.textContent='Select text to copy'; }
  }));
  document.querySelectorAll('.workflow-step').forEach(step=>step.addEventListener('click',()=>step.classList.toggle('expanded')));
})();
