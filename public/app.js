const products = [
  { id:'sonya', code:'CP-013', name:'Sonya Blade', series:'MK Arena', category:['View All','MK Arena','90s Arcade'], rarity:'Rare', format:'STL Bundle', price:62, stl:5, popularity:96, date:12, parts:['Hair','Torso','Lower body','Boots'], image:'/images/covers/sonya-blade.png', model:'/models/sonya-blade.glb', desc:'Compact heroic silhouette with multipart print clarity.' },
  { id:'cammy', code:'CP-021', name:'Cammy SF6', series:'Street Fighters', category:['View All','Street Fighters','90s Arcade'], rarity:'Rare', format:'STL Bundle', price:68, stl:5, popularity:94, date:11, parts:['Head','Body','Gloves','Base'], image:'/images/covers/cammy.png', desc:'Square cover slot with premium collectible energy.' },
  { id:'johnny', code:'CP-014', name:'Johnny Cage', series:'MK Arena', category:['View All','MK Arena','90s Arcade'], rarity:'Epic', format:'Physical + STL', price:72, stl:5, popularity:90, date:10, parts:['Head','Torso','Arms','Legs'], image:'/images/covers/johnny-cage.png', desc:'Clean action-pose cover with strong shelf presence.' },
  { id:'ken', code:'CP-017', name:'Ken', series:'Street Fighters', category:['View All','Street Fighters','90s Arcade'], rarity:'Epic', format:'STL Bundle', price:61, stl:5, popularity:89, date:9, parts:['Head','Torso','Pants','Base'], image:'/images/covers/ken.webp', desc:'Arcade fighter energy prepared for product display.' },
  { id:'guile', code:'CP-019', name:'Guile', series:'Street Fighters', category:['View All','Street Fighters','90s Arcade'], rarity:'Epic', format:'STL Bundle', price:64, stl:5, popularity:86, date:8, parts:['Hair','Torso','Arms','Boots'], image:'/images/covers/guile.webp', desc:'Bold silhouette, square cover, collectible-ready layout.' },
  { id:'dhalsim', code:'CP-026', name:'Dhalsim', series:'Street Fighters', category:['View All','Street Fighters','90s Arcade'], rarity:'Epic', format:'STL Bundle', price:59, stl:5, popularity:82, date:7, parts:['Head','Body','Accessories','Base'], image:'/images/covers/dhalsim.webp', desc:'Readable multipart zone plan for physical print prep.' },
  { id:'bison', code:'CP-027', name:'M. Bison', series:'Street Fighters', category:['View All','Street Fighters','90s Arcade'], rarity:'Legendary', format:'Physical Print', price:88, stl:5, popularity:92, date:6, parts:['Cap','Torso','Arms','Boots'], image:'/images/covers/bison.webp', desc:'High-value boss slot with premium drop treatment.' },
  { id:'dudley', code:'CP-029', name:'Dudley', series:'Street Fighters', category:['View All','Street Fighters'], rarity:'Rare', format:'STL Bundle', price:57, stl:5, popularity:70, date:5, parts:['Hair','Torso','Gloves','Legs'], image:'/images/covers/dudley.webp', desc:'Boutique fighter cover with clean shelf appeal.' },
  { id:'juri', code:'CP-025', name:'Juri', series:'Street Fighters', category:['View All','Street Fighters'], rarity:'Epic', format:'STL Bundle', price:65, stl:5, popularity:88, date:4, parts:['Head','Torso','Legs','Base'], image:'/images/covers/juri.webp', desc:'Color-heavy fighter slot prepared for print planning.' },
  { id:'sumo', code:'CP-024', name:'Sumo', series:'90s Arcade', category:['View All','90s Arcade','Street Fighters'], rarity:'Epic', format:'Physical Print', price:70, stl:5, popularity:76, date:3, parts:['Head','Body','Hands','Base'], image:'/images/covers/sumo.webp', desc:'Large character mass with strong product-card potential.' },
  { id:'gouken', code:'CP-028', name:'Gouken', series:'Street Fighters', category:['View All','Street Fighters','Vault Rares'], rarity:'Legendary', format:'Private Drop', price:95, stl:5, popularity:84, date:2, parts:['Head','Body','Cloth','Base'], image:'/images/covers/gouken.png', desc:'Legendary master slot for premium cover treatment.' },
  { id:'magik', code:'CP-030', name:'Magik Mock Series', series:'Mock Series', category:['View All','90s Arcade','Vault Rares'], rarity:'Epic', format:'STL Bundle', price:75, stl:5, popularity:79, date:1, parts:['Hair','Body','Accent','Sword'], image:'/images/covers/magik.webp', desc:'Mock-series cover slot with premium collectible energy.' },
  { id:'beach-01', code:'CP-B01', name:'Beach Power Drop', series:'Beach Theme', category:['View All','Beach Theme'], rarity:'Rare', format:'Coming Soon', price:49, stl:5, popularity:66, date:0, parts:['Head','Body','Base','Accessory'], image:'/images/covers/cammy.png', desc:'Seasonal beach theme placeholder for future product drops.' },
  { id:'vault-01', code:'CP-V01', name:'Founder Shadow', series:'Vault Rares', category:['View All','Vault Rares'], rarity:'Founder', format:'Not sold', price:120, stl:5, popularity:99, date:0, parts:['Hidden','Hidden','Hidden','Hidden'], image:'/images/covers/gouken.png', desc:'Locked silhouette-style reward character for high loyalty tiers.' }
];

const categories = [
  { name:'View All', label:'Full shelf' },
  { name:'90s Arcade', label:'Nostalgia' },
  { name:'Street Fighters', label:'Fighting game' },
  { name:'MK Arena', label:'Arena icons' },
  { name:'Beach Theme', label:'Seasonal' },
  { name:'Vault Rares', label:'Premium' }
];

const rewards = [
  { xp:20, title:'Dudley Gentleman Wallpaper', type:'Wallpaper', status:'Claimed', image:'/images/covers/dudley.webp' },
  { xp:42, title:'Sonya Blade GIF', type:'GIF', status:'Claimed', image:'/images/covers/sonya-blade.png' },
  { xp:54, title:'Johnny Cage Silent Sticker', type:'Sticker', status:'Claimed', image:'/images/covers/johnny-cage.png' },
  { xp:70, title:'Raiden Vault Artwork', type:'Artwork', status:'28 XP left', image:'/images/covers/magik.webp' },
  { xp:84, title:'Rare Hunter Trophy', type:'Trophy', status:'42 XP left', image:'/images/covers/bison.webp' },
  { xp:96, title:'Founder Shadow Character', type:'Character Unlock', status:'54 XP left', image:'/images/covers/gouken.png' }
];

let selected = products[0];
let activeCategory = 'View All';
let owned = new Set(['sonya','cammy','johnny']);
let unitCount = 345;
let modelOpen = false;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function rarityClass(rarity) {
  return String(rarity).toLowerCase().replace(/\s+/g, '-');
}

function filteredProducts() {
  const sortValue = $('#sortSelect')?.value || 'newest';
  let items = products.filter(p => p.category.includes(activeCategory));
  if (sortValue === 'price') items = items.slice().sort((a,b) => b.price - a.price);
  if (sortValue === 'popular') items = items.slice().sort((a,b) => b.popularity - a.popularity);
  if (sortValue === 'newest') items = items.slice().sort((a,b) => b.date - a.date);
  return items;
}

function setMode(mode) {
  $$('.mode-tab').forEach(btn => btn.classList.toggle('is-active', btn.dataset.mode === mode));
  $$('.mode-screen').forEach(screen => screen.classList.toggle('is-active', screen.dataset.screen === mode));
  if (mode === 'studio') renderStudio();
  if (mode === 'collection') renderCollection();
}

function selectProduct(id) {
  selected = products.find(p => p.id === id) || products[0];
  modelOpen = false;
  updateSelectedUI();
  renderRoster();
}

function updateSelectedUI() {
  $('#heroImage').src = selected.image;
  $('#heroImage').alt = `${selected.name} cover`;
  $('#heroSeries').textContent = selected.series;
  $('#heroName').textContent = selected.name;
  $('#heroDesc').textContent = selected.desc;
  $('#heroCode').textContent = selected.code;
  $('#heroRarity').textContent = selected.rarity;
  $('#heroFormat').textContent = selected.format;
  $('#buyName').textContent = selected.name;
  $('#buyDesc').textContent = selected.desc;
  $('#physicalPrice').textContent = `$${selected.price}`;
  $('#purchaseXp').textContent = `+${Math.max(18, Math.round(selected.price * .45))} XP`;
  $('#sideRarity').textContent = selected.rarity;
  $('#sideParts').textContent = selected.parts.length;
  $('#studioName').textContent = selected.name;
  $('#studioImage').src = selected.image;
  const parts = $('#partChips');
  parts.innerHTML = selected.parts.map(part => `<span>${part}</span>`).join('');
  const viewer = $('#modelViewer');
  if (viewer && selected.model) viewer.setAttribute('src', selected.model);
  $('#posterStage').hidden = false;
  $('#modelStage').hidden = true;
  $('#togglePreview').textContent = selected.model ? '3D print preview' : 'No 3D preview yet';
  $('#togglePreview').disabled = !selected.model;
  renderStudio();
}

function renderCategories() {
  const track = $('#categoryTrack');
  track.innerHTML = categories.map(cat => {
    const count = products.filter(p => p.category.includes(cat.name)).length;
    return `<button class="category-tab ${cat.name === activeCategory ? 'is-active' : ''}" data-category="${cat.name}"><strong>${cat.name}</strong><span>${count} slots · ${cat.label}</span></button>`;
  }).join('');
  track.querySelectorAll('[data-category]').forEach(btn => btn.addEventListener('click', () => {
    activeCategory = btn.dataset.category;
    $('#categoryTitle').textContent = activeCategory;
    const count = products.filter(p => p.category.includes(activeCategory)).length;
    $('#categoryMeta').textContent = activeCategory === 'View All' ? `Full playable shelf · ${count} active covers` : `${count} square cover slots`;
    renderCategories();
    renderRoster();
  }));
}

function renderRoster() {
  const roster = $('#fighterRoster');
  const items = filteredProducts();
  roster.innerHTML = items.map(p => `
    <button class="roster-tile ${p.id === selected.id ? 'is-active' : ''}" data-product="${p.id}" title="${p.name}">
      <img src="${p.image}" alt="${p.name}" loading="lazy" />
      <span class="rarity-flag">${p.rarity}</span>
      <b>${p.name}</b>
    </button>
  `).join('');
  roster.querySelectorAll('[data-product]').forEach(btn => btn.addEventListener('click', () => selectProduct(btn.dataset.product)));
}

function renderOrbit() {
  const orbit = $('#previewOrbit');
  const items = products.slice(0, 8);
  orbit.innerHTML = items.map((p, i) => {
    const angle = (360 / items.length) * i;
    const radius = 46;
    const x = 50 + Math.cos((angle - 90) * Math.PI / 180) * radius;
    const y = 50 + Math.sin((angle - 90) * Math.PI / 180) * radius;
    return `<div class="orbit-card" style="left:${x}%;top:${y}%"><img src="${p.image}" alt="${p.name}" /></div>`;
  }).join('');
}

function spinCrystal() {
  const orbit = $('#previewOrbit');
  const crystal = $('#crystal3d');
  const cost = Number($('#spinUnits').value || 50);
  unitCount = Math.max(0, unitCount - cost);
  updateUnits();
  orbit.classList.add('is-spinning');
  crystal.style.animationDuration = '.55s';
  $('#unlockCard').hidden = true;
  setTimeout(() => {
    orbit.classList.remove('is-spinning');
    crystal.style.animationDuration = '3.2s';
    const prize = products[Math.floor(Math.random() * Math.min(products.length, 10))];
    selected = prize;
    owned.add(prize.id);
    updateSelectedUI();
    renderRoster();
    renderUnlock(prize);
    updateOwnedCount();
  }, 2100);
}

function renderUnlock(prize) {
  $('#unlockImage').src = prize.image;
  $('#unlockName').textContent = prize.name;
  $('#unlockRarity').textContent = `${prize.rarity} collectible added to My Collection.`;
  $('#unlockCard').hidden = false;
}

function renderRewards() {
  const xp = 42;
  const track = $('#rewardTrack');
  track.innerHTML = rewards.map((r, i) => {
    const pos = 7 + i * (86 / (rewards.length - 1));
    const claimed = xp >= r.xp;
    return `<button class="reward-node ${claimed ? 'claimed' : 'locked'}" style="left:${pos}%" title="${r.title} · ${Math.max(0, r.xp - xp)} XP left"><b>${claimed ? 'Claimed' : r.xp + ' XP'}</b><img src="${r.image}" alt="${r.title}" /><small>${r.type}</small></button>`;
  }).join('');
  $('#rewardGrid').innerHTML = rewards.map(r => {
    const left = Math.max(0, r.xp - xp);
    const purchases = left === 0 ? 'In vault' : `${Math.max(1, Math.ceil(left / 28))} more purchase${Math.ceil(left / 28) > 1 ? 's' : ''}`;
    return `<article class="reward-card"><img src="${r.image}" alt="${r.title}" /><div><h3>${r.title}</h3><p>${left === 0 ? 'Unlocked' : `${left} XP left · ${purchases}`}</p></div></article>`;
  }).join('');
}

function renderCollection() {
  const grid = $('#collectionGrid');
  grid.innerHTML = products.map(p => {
    const isOwned = owned.has(p.id);
    return `<button class="collection-card ${isOwned ? '' : 'is-locked'}" data-collection="${p.id}"><img src="${p.image}" alt="${p.name}" /><h3>${p.name}</h3><p>${isOwned ? 'Purchased character' : 'Locked · view drop'}</p></button>`;
  }).join('');
  grid.querySelectorAll('[data-collection]').forEach(btn => btn.addEventListener('click', () => {
    selectProduct(btn.dataset.collection);
    setMode('drop');
  }));
}

function renderStudio() {
  const parts = $('#studioParts');
  if (!parts) return;
  parts.innerHTML = selected.parts.map((part, index) => {
    const colors = ['#d9b472', '#2f4f3c', '#101820', '#f3efe1', '#6f50ff'];
    return `<div class="part-row"><strong>${part}</strong><input type="color" value="${colors[index % colors.length]}" aria-label="${part} color" /><input type="text" placeholder="Enter filament code" value="" /></div>`;
  }).join('');
}

function updateUnits() {
  $('#unitCount').textContent = unitCount;
  $('#sideUnits').textContent = unitCount;
}
function updateOwnedCount() {
  $('#ownedCount').textContent = owned.size;
}

function init() {
  renderCategories();
  renderRoster();
  renderOrbit();
  renderRewards();
  renderCollection();
  updateSelectedUI();
  updateUnits();
  updateOwnedCount();

  $$('.mode-tab').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
  $$('[data-mode-shortcut]').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.modeShortcut)));
  $('#sortSelect').addEventListener('change', renderRoster);
  $('#spinButton').addEventListener('click', spinCrystal);
  $('#viewCollection').addEventListener('click', () => setMode('collection'));
  $('#unlockStudio').addEventListener('click', () => setMode('studio'));
  $('#togglePreview').addEventListener('click', () => {
    if (!selected.model) return;
    modelOpen = !modelOpen;
    $('#posterStage').hidden = modelOpen;
    $('#modelStage').hidden = !modelOpen;
    $('#togglePreview').textContent = modelOpen ? 'Show cover image' : '3D print preview';
  });
  $$('.size-tabs button').forEach(btn => btn.addEventListener('click', () => {
    $$('.size-tabs button').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const base = selected.price;
    const mult = btn.dataset.size === '15' ? .72 : btn.dataset.size === '40' ? 1.42 : 1;
    $('#physicalPrice').textContent = `$${Math.round(base * mult)}`;
  }));
  const dialog = $('#unitDialog');
  $('#unitsButton').addEventListener('click', () => dialog.showModal());
  $('#openUnitBoard').addEventListener('click', () => dialog.showModal());
  $('#missionCard').addEventListener('click', () => dialog.showModal());
}

document.addEventListener('DOMContentLoaded', init);
