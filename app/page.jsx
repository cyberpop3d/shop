'use client';

import { useMemo, useState } from 'react';

const drops = [
  {
    id: 'drop-001',
    name: 'Skyline Punch Hero',
    className: 'Physical Print',
    price: 69,
    scale: '30 cm display figure',
    rarity: 'Launch Drop',
    color: '#21b7ff',
    accent: '#ffd166',
    gradient: 'linear-gradient(145deg,#b9f0ff 0%,#21b7ff 48%,#075985 100%)',
    stage: 'Ready for product data',
    parts: ['Head', 'Torso', 'Arms', 'Base'],
    blurb: 'A hero product slot for made-to-order physical collectible drops, future turntables, shipping rules, and edition badges.'
  },
  {
    id: 'drop-002',
    name: 'Beach Power STL Pack',
    className: 'STL Bundle',
    price: 18,
    scale: 'STL / 3MF / ZIP files',
    rarity: 'Digital Pack',
    color: '#ff70bd',
    accent: '#8affd2',
    gradient: 'linear-gradient(145deg,#ffe1f2 0%,#ff70bd 52%,#7c3aed 100%)',
    stage: 'Secure library placeholder',
    parts: ['STL', '3MF', 'Guide', 'License'],
    blurb: 'A clean digital product slot for multipart FDM/SLA packs, file updates, purchased library, and protected download flow.'
  },
  {
    id: 'drop-003',
    name: 'Cloud Dock Stand Kit',
    className: 'Accessory',
    price: 14,
    scale: 'Printable display stand',
    rarity: 'Add-on',
    color: '#7bf2cf',
    accent: '#4cc9f0',
    gradient: 'linear-gradient(145deg,#ecfff9 0%,#7bf2cf 48%,#0e7490 100%)',
    stage: 'Cross-sell ready',
    parts: ['Base', 'Peg', 'Name Plate', 'Badge'],
    blurb: 'A modular accessory structure for stands, adapters, environment props, and collection display upgrades.'
  },
  {
    id: 'drop-004',
    name: 'Collector Shelf Bundle',
    className: 'Bundle',
    price: 99,
    scale: 'Physical + digital extras',
    rarity: 'Premium Bundle',
    color: '#ff9f1c',
    accent: '#ffffff',
    gradient: 'linear-gradient(145deg,#fff1c7 0%,#ff9f1c 50%,#c2410c 100%)',
    stage: 'Reward link ready',
    parts: ['Figure', 'Stand', 'Bonus STL', 'PopBits'],
    blurb: 'A bundle slot for seasonal drops, collection bonuses, physical items, bonus files, and loyalty rewards.'
  }
];

const questRows = [
  { label: 'Daily check-in', reward: '+20 PopBits', status: 'Live placeholder' },
  { label: 'Upload a make', reward: '+80 PopBits', status: 'Gallery module' },
  { label: 'Complete a drop', reward: 'Badge + coupon', status: 'Collection logic' },
  { label: 'Boss contribution', reward: 'Leaderboard reward', status: 'Arcade layer' }
];

const navItems = ['Lobby', 'Drops', 'Arcade', 'Vault', 'Makes'];

function FigurePreview({ drop }) {
  return (
    <div className="figure-preview" style={{ '--drop-gradient': drop.gradient, '--drop-color': drop.color, '--drop-accent': drop.accent }}>
      <div className="platform-rings">
        <span />
        <span />
        <span />
      </div>
      <div className="scanline" />
      <div className="toy">
        <div className="ear ear-left" />
        <div className="ear ear-right" />
        <div className="toy-head">
          <span className="eye left" />
          <span className="eye right" />
          <span className="smile" />
        </div>
        <div className="toy-core" />
        <div className="toy-arm arm-left" />
        <div className="toy-arm arm-right" />
        <div className="toy-leg leg-left" />
        <div className="toy-leg leg-right" />
        <div className="toy-base" />
      </div>
      <div className="stage-label">
        <strong>{drop.rarity}</strong>
        <span>{drop.scale}</span>
      </div>
    </div>
  );
}

function TopNav({ cartCount, popBits }) {
  return (
    <header className="top-nav">
      <a className="brand-lockup" href="#top" aria-label="CyberPop Shop home">
        <span className="brand-emblem">CP</span>
        <span>
          <strong>CyberPop</strong>
          <small>Playable Shop Alpha</small>
        </span>
      </a>
      <nav className="menu-tabs" aria-label="Main navigation">
        {navItems.map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>
        ))}
      </nav>
      <div className="player-strip">
        <span className="wallet">✦ {popBits}</span>
        <button className="nav-cart">Cart {cartCount}</button>
      </div>
    </header>
  );
}

function DropTerminal({ drop, onAdd, onNext, onPrev }) {
  return (
    <aside className="drop-terminal">
      <div className="terminal-top">
        <span>Featured Drop</span>
        <strong>{drop.id.toUpperCase()}</strong>
      </div>
      <h2>{drop.name}</h2>
      <p>{drop.blurb}</p>
      <div className="terminal-price-row">
        <div>
          <span>Starting at</span>
          <strong>${drop.price}</strong>
        </div>
        <button className="primary-action" onClick={() => onAdd(drop)}>Add to loadout</button>
      </div>
      <div className="part-grid">
        {drop.parts.map((part) => <span key={part}>{part}</span>)}
      </div>
      <div className="terminal-controls">
        <button onClick={onPrev}>‹ Previous</button>
        <button onClick={onNext}>Next ›</button>
      </div>
    </aside>
  );
}

function DropRail({ selected, setSelected }) {
  return (
    <section id="drops" className="drop-rail">
      <div className="section-title">
        <span>Shop Drop Rail</span>
        <h2>Products should feel like selectable characters, not lazy cards.</h2>
        <p>Each slot is designed like a game shop tile: readable class, price, product state, reward hook, and future 3D preview space.</p>
      </div>
      <div className="rail-grid">
        {drops.map((drop) => (
          <button
            key={drop.id}
            className={`drop-tile ${selected.id === drop.id ? 'active' : ''}`}
            onClick={() => setSelected(drop)}
            style={{ '--tile-gradient': drop.gradient, '--tile-color': drop.color }}
          >
            <div className="tile-art"><span /></div>
            <div className="tile-meta">
              <small>{drop.className}</small>
              <strong>{drop.name}</strong>
              <em>{drop.stage}</em>
            </div>
            <div className="tile-price">${drop.price}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ArcadePanel({ popBits, setPopBits, rewardCount, setRewardCount }) {
  const [charge, setCharge] = useState(42);
  const [message, setMessage] = useState('Tap crystals to charge the forge.');

  function hitCrystal(power) {
    setCharge((current) => {
      const next = Math.min(100, current + power);
      setPopBits((value) => value + power);
      if (next >= 100) {
        setRewardCount((value) => value + 1);
        setMessage('Reward forged. The real version would validate this server-side.');
        return 0;
      }
      setMessage(`Forge charge +${power}. Keep going.`);
      return next;
    });
  }

  return (
    <section id="arcade" className="arcade-panel">
      <div className="arcade-left">
        <span className="eyebrow">Arcade Layer Prototype</span>
        <h2>Crystal Forge reward loop</h2>
        <p>The first playable loop should support the shop, not fight it: quick interaction, visible reward progress, then back into the product flow.</p>
        <div className="charge-meter"><span style={{ width: `${charge}%` }} /></div>
        <div className="charge-meta"><strong>{charge}% charged</strong><span>{message}</span></div>
      </div>
      <div className="crystal-board">
        {[8, 12, 15, 20].map((power, index) => (
          <button key={power} className={`crystal crystal-${index + 1}`} onClick={() => hitCrystal(power)}>
            <span />
            <strong>+{power}</strong>
          </button>
        ))}
      </div>
      <div className="arcade-stats">
        <div><span>PopBits</span><strong>{popBits}</strong></div>
        <div><span>Forged rewards</span><strong>{rewardCount}</strong></div>
        <div><span>Anti-cheat</span><strong>Server later</strong></div>
      </div>
    </section>
  );
}

function VaultPanel() {
  return (
    <section id="vault" className="vault-panel">
      <div className="section-title compact">
        <span>Platform spine</span>
        <h2>Shop, library, rewards, makes — one interface language.</h2>
      </div>
      <div className="module-lanes">
        <div><strong>01</strong><h3>Purchased Library</h3><p>Secure STL/3MF downloads, license notes, version updates, product history.</p></div>
        <div><strong>02</strong><h3>3D Preview Bay</h3><p>GLB viewer placeholder for part toggles, color previews, turntables, and screenshots.</p></div>
        <div id="makes"><strong>03</strong><h3>Makes Gallery</h3><p>Real print photos, likes, profile pages, contest entries, and featured community shelves.</p></div>
        <div><strong>04</strong><h3>Admin/CMS</h3><p>Product metadata, prices, files, preview assets, rewards, and seasonal drops.</p></div>
      </div>
    </section>
  );
}

function CartDrawer({ cart, onClose, rewardCount }) {
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart]);
  return (
    <div className="cart-backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="cart-head">
          <div><span>Loadout Cart</span><strong>Prototype Checkout</strong></div>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="cart-list">
          {cart.length === 0 ? <p>Your cart is empty.</p> : cart.map((item, index) => (
            <div className="cart-line" key={`${item.id}-${index}`}>
              <span style={{ background: item.gradient }} />
              <div><strong>{item.name}</strong><small>{item.className}</small></div>
              <b>${item.price}</b>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <div><span>Forged rewards</span><strong>{rewardCount}</strong></div>
          <div><span>Prototype total</span><strong>${total}</strong></div>
          <button disabled={cart.length === 0}>Checkout placeholder</button>
        </div>
      </aside>
    </div>
  );
}

export default function Home() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [popBits, setPopBits] = useState(260);
  const [rewardCount, setRewardCount] = useState(2);

  const selected = drops[selectedIndex];

  function setSelected(drop) {
    setSelectedIndex(drops.findIndex((item) => item.id === drop.id));
  }

  function nextDrop() {
    setSelectedIndex((current) => (current + 1) % drops.length);
  }

  function prevDrop() {
    setSelectedIndex((current) => (current - 1 + drops.length) % drops.length);
  }

  function addToCart(drop) {
    setCart((current) => [...current, drop]);
    setCartOpen(true);
  }

  return (
    <>
      <TopNav cartCount={cart.length} popBits={popBits} />
      <main id="top">
        <section id="lobby" className="lobby-shell">
          <div className="world-backdrop" />
          <div className="lobby-grid">
            <div className="mission-panel">
              <div className="season-chip">Season 00 · Shop Alpha</div>
              <h1>CyberPop Drop Room</h1>
              <p>Browse collectible drops like a game lobby: pick a product, inspect the shelf role, earn PopBits, unlock rewards, then move cleanly into checkout.</p>
              <div className="mission-actions">
                <a href="#drops" className="primary-action">Enter drop rail</a>
                <a href="#arcade" className="ghost-action">Try forge loop</a>
              </div>
              <div className="quest-stack">
                {questRows.map((quest) => (
                  <div key={quest.label}>
                    <span>{quest.status}</span>
                    <strong>{quest.label}</strong>
                    <em>{quest.reward}</em>
                  </div>
                ))}
              </div>
            </div>

            <div className="center-stage" style={{ '--stage-color': selected.color }}>
              <div className="stage-topline">
                <span>{selected.className}</span>
                <strong>{selected.rarity}</strong>
              </div>
              <FigurePreview drop={selected} />
              <div className="stage-bottomline">
                <span>{selected.name}</span>
                <button onClick={() => addToCart(selected)}>Quick add · ${selected.price}</button>
              </div>
            </div>

            <DropTerminal drop={selected} onAdd={addToCart} onNext={nextDrop} onPrev={prevDrop} />
          </div>
        </section>

        <DropRail selected={selected} setSelected={setSelected} />
        <ArcadePanel popBits={popBits} setPopBits={setPopBits} rewardCount={rewardCount} setRewardCount={setRewardCount} />
        <VaultPanel />
      </main>
      <footer className="footer">CyberPop Shop MVP 0 · Game-interface storefront foundation · Vercel-ready Next.js build</footer>
      {cartOpen && <CartDrawer cart={cart} rewardCount={rewardCount} onClose={() => setCartOpen(false)} />}
    </>
  );
}
