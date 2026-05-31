const products = [
  { id: 'sonya', name: 'Sonya Blade', short: 'SONYA\nBLADE', category: 'MK Arena', series: 'MK Arena', code: 'CP-013', rarity: 'Rare', price: 62, stl: 5, popularity: 96, newest: 12, owned: true, image: '/images/covers/sonya-blade.png', model: '/models/sonya-blade.glb', desc: 'Compact heroic silhouette with multipart print clarity.', parts: ['Hair', 'Torso', 'Lower body', 'Boots'], support: 'Medium', height: '30 cm', pieces: 4 },
  { id: 'cammy', name: 'Cammy SF6', short: 'CAMMY\nSF6', category: 'Street Fighters', series: 'Street Fighters', code: 'CP-014', rarity: 'Rare', price: 58, stl: 5, popularity: 92, newest: 11, owned: true, image: '/images/covers/cammy.png', desc: 'Fast stance collectible with clean cover-ready attitude.', parts: ['Head', 'Torso', 'Legs', 'Base'], support: 'Low', height: '30 cm', pieces: 4 },
  { id: 'johnny', name: 'Johnny Cage', short: 'JOHNNY\nCAGE', category: 'MK Arena', series: 'MK Arena', code: 'CP-015', rarity: 'Epic', price: 64, stl: 5, popularity: 89, newest: 10, owned: true, image: '/images/covers/johnny-cage.png', desc: 'Movie-star fight pose with premium shelf energy.', parts: ['Head', 'Body', 'Glasses', 'Base'], support: 'Low', height: '30 cm', pieces: 4 },
  { id: 'ken', name: 'Ken', short: 'KEN', category: 'Street Fighters', series: 'Street Fighters', code: 'CP-016', rarity: 'Epic', price: 65, stl: 5, popularity: 87, newest: 9, image: '/images/covers/ken.webp', desc: 'Explosive martial silhouette for arcade shelves.', parts: ['Hair', 'Gi', 'Legs', 'Base'], support: 'Medium', height: '30 cm', pieces: 4 },
  { id: 'guile', name: 'Guile', short: 'GUILE', category: 'Street Fighters', series: 'Street Fighters', code: 'CP-017', rarity: 'Epic', price: 61, stl: 5, popularity: 84, newest: 8, image: '/images/covers/guile.webp', desc: 'Classic military shape with bold readable planes.', parts: ['Head', 'Torso', 'Pants', 'Boots'], support: 'Low', height: '30 cm', pieces: 4 },
  { id: 'dhalsim', name: 'Dhalsim', short: 'DHALSIM', category: 'Street Fighters', series: 'Street Fighters', code: 'CP-018', rarity: 'Epic', price: 67, stl: 5, popularity: 78, newest: 7, image: '/images/covers/dhalsim.webp', desc: 'Long-form stylized collectible made for strong silhouettes.', parts: ['Head', 'Torso', 'Arms', 'Base'], support: 'High', height: '30 cm', pieces: 5 },
  { id: 'bison', name: 'M. Bison', short: 'M.\nBISON', category: 'Street Fighters', series: 'Street Fighters', code: 'CP-019', rarity: 'Legendary', price: 78, stl: 5, popularity: 95, newest: 6, image: '/images/covers/bison.webp', desc: 'Boss-grade poster presence with premium character energy.', parts: ['Head', 'Cape', 'Body', 'Base'], support: 'Medium', height: '30 cm', pieces: 5 },
  { id: 'dudley', name: 'Dudley', short: 'DUDLEY', category: 'Street Fighters', series: 'Street Fighters', code: 'CP-020', rarity: 'Rare', price: 59, stl: 5, popularity: 68, newest: 5, image: '/images/covers/dudley.webp', desc: 'Boxing elegance translated into a collectible figure.', parts: ['Head', 'Torso', 'Gloves', 'Legs'], support: 'Low', height: '30 cm', pieces: 4 },
  { id: 'juri', name: 'Juri', short: 'JURI', category: 'Street Fighters', series: 'Street Fighters', code: 'CP-021', rarity: 'Epic', price: 66, stl: 5, popularity: 91, newest: 4, image: '/images/covers/juri.webp', desc: 'High-energy villain pose with strong profile readability.', parts: ['Head', 'Torso', 'Legs', 'Base'], support: 'Medium', height: '30 cm', pieces: 4 },
  { id: 'sumo', name: 'Sumo', short: 'SUMO', category: '90s Arcade', series: '90s Arcade', code: 'CP-022', rarity: 'Epic', price: 63, stl: 5, popularity: 71, newest: 3, image: '/images/covers/sumo.webp', desc: 'Chunky arcade power translated into bold print geometry.', parts: ['Head', 'Torso', 'Lower body', 'Base'], support: 'High', height: '30 cm', pieces: 5 },
  { id: 'gouken', name: 'Gouken', short: 'GOUKEN', category: 'Vault Rares', series: 'Vault Rares', code: 'CP-023', rarity: 'Legendary', price: 84, stl: 5, popularity: 86, newest: 2, image: '/images/covers/gouken.png', desc: 'Rare master figure with heavy shelf presence.', parts: ['Head', 'Torso', 'Hands', 'Base'], support: 'Medium', height: '30 cm', pieces: 4 },
  { id: 'magik', name: 'Magik Mockup', short: 'MAGIK', category: 'Vault Rares', series: 'Vault Rares', code: 'CP-024', rarity: 'Epic', price: 72, stl: 5, popularity: 74, newest: 1, image: '/images/covers/magik.webp', desc: 'Premium fantasy drop with cover-first product appeal.', parts: ['Head', 'Body', 'Sword', 'Base'], support: 'High', height: '30 cm', pieces: 6 },
  { id: 'beach', name: 'Beach Power', short: 'BEACH\nPOWER', category: 'Beach Theme', series: 'Beach Theme', code: 'CP-025', rarity: 'Rare', price: 60, stl: 5, popularity: 77, newest: 13, image: '/images/covers/cammy.png', desc: 'Seasonal beach theme slot for summer collectible drops.', parts: ['Head', 'Body', 'Legs', 'Stand'], support: 'Low', height: '30 cm', pieces: 4 },
  { id: 'founder', name: 'Founder Shadow', short: 'FOUNDER\nSHADOW', category: 'Vault Rares', series: 'Vault Rares', code: 'CP-000', rarity: 'Founder', price: 120, stl: 0, popularity: 99, newest: 14, image: '/images/covers/gouken.png', desc: 'Black silhouette unlock slot for premium loyalty milestones.', parts: ['Secret', 'Locked', 'Reward', 'Vault'], support: 'Admin locked', height: '30 cm', pieces: 4 },
];

const categories = [
  { name: 'View All', filter: 'all' },
  { name: '90s Arcade', filter: '90s Arcade' },
  { name: 'Street Fighters', filter: 'Street Fighters' },
  { name: 'MK Arena', filter: 'MK Arena' },
  { name: 'Beach Theme', filter: 'Beach Theme' },
  { name: 'Vault Rares', filter: 'Vault Rares' },
];

const rewardNodes = [
  { xp: 100, name: 'Wallpaper Pack', note: '100 XP', img: '/images/covers/sonya-blade.png', left: 10 },
  { xp: 180, name: 'Silent Sticker', note: '50 XP left', img: '/images/covers/johnny-cage.png', left: 25 },
  { xp: 300, name: 'Sonya GIF', note: '70 XP left', img: '/images/covers/sonya-blade.png', left: 43 },
  { xp: 460, name: 'Artwork Drop', note: '230 XP left', img: '/images/covers/bison.webp', left: 62 },
  { xp: 700, name: 'Character Unlock', note: '470 XP left', img: '/images/covers/gouken.png', left: 84, locked: true },
];

let selected = products[0];
let activeCategory = 'all';
let sortMode = 'newest';
let buyExpanded = false;
let selectedBuyType = null;
let physicalSize = '30';
let mediaMode = 'product';
let cart = 0;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function setMode(mode) {
  $$('.mode-tab').forEach((button) => button.classList.toggle('is-active', button.dataset.mode === mode));
  $$('.mode-screen').forEach((screen) => screen.classList.toggle('is-active', screen.dataset.screen === mode));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sortedProducts() {
  let list = activeCategory === 'all' ? [...products] : products.filter((product) => product.category === activeCategory);
  if (activeCategory === 'Street Fighters') {
    const filler = [];
    while (list.length + filler.length < 18) {
      const source = list[(list.length + filler.length) % list.length] || products[0];
      filler.push({ ...source, id: `${source.id}-alt-${filler.length}`, name: `${source.name} Alt`, short: source.short, isAlt: true });
    }
    list = [...list, ...filler];
  }
  if (sortMode === 'popular') return list.sort((a, b) => b.popularity - a.popularity);
  if (sortMode === 'price') return list.sort((a, b) => b.price - a.price);
  return list.sort((a, b) => b.newest - a.newest);
}

function setSelected(product) {
  selected = product;
  selectedBuyType = null;
  buyExpanded = false;
  mediaMode = 'product';
  $('#mediaTriptych').hidden = false;
  $('#modelStage').hidden = true;
  renderSelected();
  renderRoster();
  renderStudio();
}

function renderMedia() {
  const slots = mediaMode === 'technical'
    ? [
        { role: 'Parts split', title: 'Part Separation', img: selected.image, note: 'Model breakdown', chip: `${selected.pieces} pieces`, detail: 'Head / body / lower body / base groups previewed here.' },
        { role: 'Build plate', title: 'Build Plate', img: selected.image, note: 'Print preparation', chip: `Support ${selected.support}`, detail: 'Support density and plate notes come from the admin panel.' },
        { role: 'Video / 3D', title: '3D Preview', img: selected.image, note: 'Preview flow', chip: 'Open studio', detail: 'Open the model preview and continue into color planning.' },
      ]
    : [
        { role: 'Cover', title: selected.name, img: selected.image, note: selected.series, chip: selected.code, detail: 'Main square listing cover.' },
        { role: 'Print preview', title: 'Print Preview', img: selected.image, note: 'Product media', chip: selected.rarity, detail: 'Admin-selectable square preview slot.' },
        { role: 'Technical / video', title: 'Technical / Video', img: selected.image, note: 'Tools embedded', chip: 'Tools', detail: 'Switch to print utilities and technical media.' },
      ];

  $('#mediaModeLabel').textContent = mediaMode === 'technical' ? 'Technical Media' : 'Selected Collectible';
  $('#mediaTriptych').innerHTML = slots.map((slot, index) => `
    <button class="media-card ${mediaMode === 'technical' ? 'is-technical' : ''}" data-slot-index="${index}" type="button" aria-label="${slot.title}">
      <img src="${slot.img}" alt="${selected.name} ${slot.role}" />
      <span class="media-badge">${slot.role}</span>
      <strong>${slot.title}</strong>
      <small>${slot.note}</small>
      <span class="tech-chip">${slot.chip}</span>
      <span class="tech-popover">${slot.detail}</span>
    </button>
  `).join('');

  $$('.media-card').forEach((card) => card.addEventListener('click', () => {
    const index = Number(card.dataset.slotIndex);
    if (mediaMode === 'product' && index === 2) {
      mediaMode = 'technical';
      renderMedia();
      return;
    }
    if (mediaMode === 'technical' && index === 2) {
      openModelPreview();
    }
  }));
}

function renderSelected() {
  $('#sideTitle').innerHTML = selected.short.replace('\n', '<br/>');
  $('#sideSeries').textContent = selected.series;
  $('#sideDesc').textContent = selected.desc;
  $('#buyName').textContent = selected.name;
  $('#buyIntro').textContent = 'Format, price and loyalty details expand here only after you choose.';
  $('#modelViewer').src = selected.model || '/models/sonya-blade.glb';
  renderMedia();
  renderBuyPanel();
}

function renderBuyPanel() {
  $('#buyOptions').hidden = !buyExpanded;
  $('#stlDetail').hidden = selectedBuyType !== 'stl';
  $('#physicalDetail').hidden = selectedBuyType !== 'physical';
  $('#buyConsole').classList.toggle('is-expanded', buyExpanded || selectedBuyType);
  $$('.choice-button').forEach((button) => button.classList.toggle('is-active', button.dataset.buyType === selectedBuyType));
  $('#physicalLabel').textContent = `${physicalSize} cm physical`;
  const priceMap = { '15': 42, '30': selected.price, '40': Math.round(selected.price * 1.55) };
  $('#physicalPrice').textContent = `$${priceMap[physicalSize]}`;
  const xpMap = { '15': '+18 XP · wheel progress', '30': '+28 XP · wheel progress · trophy points', '40': '+44 XP · premium trophy · site points' };
  $('#physicalXp').textContent = xpMap[physicalSize];
  $$('.size-row button').forEach((button) => button.classList.toggle('is-active', button.dataset.size === physicalSize));
}

function renderCategories() {
  $('#categoryTrack').innerHTML = categories.map((cat) => `
    <button class="category-card ${activeCategory === cat.filter ? 'is-active' : ''}" data-category="${cat.filter}">
      <strong>${cat.name}</strong>
    </button>
  `).join('');
  $$('.category-card').forEach((button) => button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    $('#categoryTitle').textContent = categories.find((c) => c.filter === activeCategory)?.name || 'View All';
    renderCategories();
    renderRoster();
  }));
}

function renderRoster() {
  const list = sortedProducts();
  $('#fighterRoster').innerHTML = list.map((product) => `
    <button class="roster-tile ${selected.id === product.id ? 'is-active' : ''}" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}" />
      <span class="rarity-flag">${product.rarity}</span>
      <b>${product.name}</b>
    </button>
  `).join('');
  $$('.roster-tile').forEach((tile) => tile.addEventListener('click', () => {
    const product = sortedProducts().find((p) => p.id === tile.dataset.id);
    if (product) setSelected(product);
  }));
}

function renderOrbit() {
  $('#previewOrbit').innerHTML = products.slice(0, 8).map((product, index) => {
    const angle = (index / 8) * Math.PI * 2;
    const x = 50 + Math.cos(angle) * 42;
    const y = 50 + Math.sin(angle) * 42;
    return `<span class="orbit-card" style="left:${x}%;top:${y}%"><img src="${product.image}" alt="${product.name}" /></span>`;
  }).join('');
}

function renderRewards() {
  $('#rewardTrack').innerHTML = rewardNodes.map((reward) => `
    <button class="reward-node ${reward.locked ? 'locked' : ''}" style="left:${reward.left}%" title="${reward.name}">
      <b>${reward.xp} XP</b>
      <img src="${reward.img}" alt="${reward.name}" />
      <small>${reward.note}</small>
    </button>
  `).join('');
}

function renderCollection() {
  $('#collectionGrid').innerHTML = products.map((product) => `
    <button class="collection-card ${product.owned ? '' : 'is-locked'}" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}" />
      <span>${product.owned ? 'Owned' : 'Not owned'}</span>
      <h3>${product.name}</h3>
      <p>${product.series} · ${product.rarity}</p>
      <b>${product.owned ? 'Open product' : 'Preview / buy'}</b>
    </button>
  `).join('');
  $$('.collection-card').forEach((card) => card.addEventListener('click', () => {
    const product = products.find((p) => p.id === card.dataset.id);
    if (product) { setSelected(product); setMode('drop'); }
  }));
}

function renderStudio() {
  $('#studioImage').src = selected.image;
  $('#studioName').textContent = selected.name;
  $('#studioParts').innerHTML = selected.parts.map((part, index) => `
    <div class="part-row">
      <strong>${part}</strong>
      <input type="color" value="${['#d9c59b', '#556246', '#181e25', '#2f2a25'][index % 4]}" />
      <input type="text" placeholder="Enter your filament code" />
    </div>
  `).join('');
}

function showToast(title, message) {
  $('#toastTitle').textContent = title;
  $('#toastMessage').textContent = message;
  $('#toast').hidden = false;
  $('#toast').classList.add('is-visible');
  setTimeout(() => {
    $('#toast').classList.remove('is-visible');
    setTimeout(() => { $('#toast').hidden = true; }, 250);
  }, 3300);
}

function openModelPreview() {
  $('#mediaTriptych').hidden = true;
  $('#modelStage').hidden = false;
}

function closeModelPreview() {
  $('#mediaTriptych').hidden = false;
  $('#modelStage').hidden = true;
}

function init() {
  renderSelected();
  renderCategories();
  renderRoster();
  renderOrbit();
  renderRewards();
  renderCollection();
  renderStudio();

  $$('.mode-tab').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));
  $$('[data-mode-shortcut]').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.modeShortcut)));
  $('#sortSelect').addEventListener('change', (event) => { sortMode = event.target.value; renderRoster(); });

  $('#togglePreview').addEventListener('click', openModelPreview);
  $('#closePreview').addEventListener('click', closeModelPreview);
  $('#modelBuyButton').addEventListener('click', () => {
    closeModelPreview();
    buyExpanded = true;
    renderBuyPanel();
  });

  const roster = $('#fighterRoster');
  const scrollRoster = (direction) => roster.scrollBy({ left: direction * Math.max(420, roster.clientWidth * 0.7), behavior: 'smooth' });
  $('#rosterPrev').addEventListener('click', () => scrollRoster(-1));
  $('#rosterNext').addEventListener('click', () => scrollRoster(1));
  ['rosterPrev','rosterNext'].forEach((id) => {
    const arrow = document.getElementById(id);
    arrow.addEventListener('wheel', (event) => {
      event.preventDefault();
      scrollRoster(event.deltaY > 0 ? 1 : -1);
    }, { passive: false });
  });
  roster.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      roster.scrollLeft += event.deltaY;
    }
  }, { passive: false });

  $('#buyMainButton').addEventListener('click', () => {
    buyExpanded = !buyExpanded;
    if (!buyExpanded) selectedBuyType = null;
    renderBuyPanel();
  });
  $$('.choice-button').forEach((button) => button.addEventListener('click', () => {
    selectedBuyType = button.dataset.buyType;
    buyExpanded = true;
    renderBuyPanel();
  }));
  $$('.size-row button').forEach((button) => button.addEventListener('click', () => {
    physicalSize = button.dataset.size;
    renderBuyPanel();
  }));
  $$('[data-complete]').forEach((button) => button.addEventListener('click', () => {
    cart += 1;
    $('#cartCount').textContent = cart;
    const type = button.dataset.complete === 'stl' ? 'STL file' : `${physicalSize} cm physical product`;
    showToast('Purchase flow started', `${selected.name} ${type} will be available through your profile after checkout.`);
  }));

  $('#unitsButton').addEventListener('click', () => $('#unitDialog').showModal());
  $('#spinButton').addEventListener('click', () => {
    $('#previewOrbit').classList.add('is-spinning');
    $('#crystal3d').classList.add('is-spinning');
    $('#unlockCard').hidden = true;
    setTimeout(() => {
      $('#previewOrbit').classList.remove('is-spinning');
      $('#crystal3d').classList.remove('is-spinning');
      const product = products[Math.floor(Math.random() * products.length)];
      $('#unlockImage').src = product.image;
      $('#unlockName').textContent = product.name;
      $('#unlockRarity').textContent = `${product.rarity} collectible added to your shelf.`;
      $('#unlockCard').hidden = false;
      selected = product;
    }, 1700);
  });
  $('#viewCollection').addEventListener('click', () => setMode('collection'));
  $('#unlockStudio').addEventListener('click', () => setMode('studio'));
}

init();
