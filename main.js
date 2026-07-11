
(function(){
  const communities = ['Downtown Dubai','Dubai Marina','JVC','Palm Jumeirah','Business Bay','Arabian Ranches','Al Reem Island','Yas Island'];
  const types = ['apartment','villa','townhouse','office'];
  const iconFor = {
    apartment: '<svg viewBox="0 0 48 48" fill="none" stroke="#C6A15B" stroke-width="1.4"><rect x="10" y="6" width="28" height="38"/><path d="M16 14h4M28 14h4M16 22h4M28 22h4M16 30h4M28 30h4"/></svg>',
    villa: '<svg viewBox="0 0 48 48" fill="none" stroke="#C6A15B" stroke-width="1.4"><path d="M6 24l18-14 18 14"/><rect x="10" y="24" width="28" height="16"/><rect x="20" y="30" width="8" height="10"/></svg>',
    townhouse: '<svg viewBox="0 0 48 48" fill="none" stroke="#C6A15B" stroke-width="1.4"><rect x="8" y="18" width="14" height="22"/><rect x="26" y="10" width="14" height="30"/><path d="M8 18l7-6 7 6"/></svg>',
    office: '<svg viewBox="0 0 48 48" fill="none" stroke="#C6A15B" stroke-width="1.4"><rect x="12" y="4" width="24" height="40"/><path d="M18 12h4M26 12h4M18 20h4M26 20h4M18 28h4M26 28h4M18 36h4M26 36h4"/></svg>'
  };

  function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  const listings = [];
  for(let i=0;i<24;i++){
    const type = types[rand(0,3)];
    const beds = type==='office' ? 0 : rand(0,4);
    const mode = i % 3 === 0 ? 'rent' : 'sale';
    listings.push({
      id:'AMK-'+(1000+i),
      type, beds,
      community: communities[rand(0,communities.length-1)],
      price: mode==='rent' ? rand(45,220)*1000 : rand(6,120)*100000,
      area: rand(550,4200),
      furnished: rand(0,1)===1,
      mode
    });
  }

  let state = { mode:'sale', search:'', type:'', beds:'', maxPrice:8000000, community:'', furnish:'' };
  let favorites = new Set();

  const communityChips = document.getElementById('communityChips');
  communities.forEach(c => {
    const b = document.createElement('button');
    b.className = 'chip'; b.textContent = c; b.dataset.community = c;
    b.addEventListener('click', () => {
      state.community = state.community === c ? '' : c;
      communityChips.querySelectorAll('.chip').forEach(x=>x.classList.toggle('active', x.dataset.community===state.community));
      render();
    });
    communityChips.appendChild(b);
  });

  document.getElementById('listingTabs').addEventListener('click', e=>{
    const btn = e.target.closest('button[data-mode]'); if(!btn) return;
    state.mode = btn.dataset.mode;
    document.querySelectorAll('#listingTabs button').forEach(b=>b.classList.toggle('active', b===btn));
    render();
  });
  document.getElementById('furnishChips').addEventListener('click', e=>{
    const btn = e.target.closest('button[data-furnish]'); if(!btn) return;
    state.furnish = btn.dataset.furnish;
    document.querySelectorAll('#furnishChips .chip').forEach(b=>b.classList.toggle('active', b===btn));
    render();
  });
  document.getElementById('priceRange').addEventListener('input', e=>{
    state.maxPrice = Number(e.target.value);
    document.getElementById('priceLabel').textContent = 'Up to AED ' + state.maxPrice.toLocaleString();
    render();
  });
  document.getElementById('typeSelect').addEventListener('change', e=>{ state.type = e.target.value; render(); });
  document.getElementById('bedSelect').addEventListener('change', e=>{ state.beds = e.target.value; render(); });
  document.getElementById('searchBtn').addEventListener('click', ()=>{ state.search = document.getElementById('searchLocation').value; render(); });
  document.getElementById('searchLocation').addEventListener('keydown', e=>{ if(e.key==='Enter'){ state.search = e.target.value; render(); } });

  function priceUnit(){ return state.mode==='rent' ? '/yr' : ''; }

  function render(){
    let items = listings.filter(l => l.mode === state.mode);
    if(state.type) items = items.filter(l => l.type === state.type);
    if(state.beds !== '') items = items.filter(l => state.beds==='4' ? l.beds>=4 : l.beds === Number(state.beds));
    if(state.community) items = items.filter(l => l.community === state.community);
    if(state.furnish) items = items.filter(l => (state.furnish==='furnished') === l.furnished);
    items = items.filter(l => l.price <= state.maxPrice);
    if(state.search) items = items.filter(l => l.community.toLowerCase().includes(state.search.toLowerCase()));

    document.getElementById('resultsTitle').textContent = state.mode === 'sale' ? 'For Sale' : 'For Rent';
    document.getElementById('resultsCount').textContent = items.length + ' results';

    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    if(items.length === 0){
      grid.innerHTML = '<div class="empty"><div class="display" style="color:#EDF1F5;font-size:1.1rem;margin-bottom:6px;">No matches</div>Try widening your filters.</div>';
      return;
    }
    items.forEach(l => {
      const card = document.createElement('div');
      card.className = 'card';
      const isFav = favorites.has(l.id);
      card.innerHTML = `
        <div class="card-media">
          <span class="badge-type">${l.type}</span>
          <button class="fav ${isFav?'active':''}" data-fav="${l.id}" aria-label="Save listing">${isFav?'♥':'♡'}</button>
          ${iconFor[l.type]}
        </div>
        <div class="card-body">
          <div class="price display">AED ${l.price.toLocaleString()}<span>${priceUnit()}</span></div>
          <div class="loc">${l.community}</div>
          <div class="spec-row">
            <span>${l.beds===0?'Studio':l.beds+' Bed'}</span><span>${l.area.toLocaleString()} sqft</span><span>${l.furnished?'Furnished':'Unfurnished'}</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
    grid.querySelectorAll('[data-fav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.fav;
        favorites.has(id) ? favorites.delete(id) : favorites.add(id);
        render();
      });
    });
  }

  render();
})();
