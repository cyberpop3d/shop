'use client';

import { useMemo, useState } from 'react';

const products = [
  {
    id: 'cp-hero-01',
    name: 'Skyline Print Hero',
    type: 'Physical print',
    price: 69,
    format: 'Made-to-order collectible',
    difficulty: 'Ready to display',
    gradient: 'linear-gradient(145deg, #ffffff, #52c7ff)',
    description: 'A premium physical CyberPop figure concept prepared for collectible display and future product data integration.',
    parts: ['Head', 'Body', 'Base', 'Accessory']
  },
  {
    id: 'cp-stl-02',
    name: 'Pop Lab STL Pack',
    type: 'STL bundle',
    price: 18,
    format: 'STL / 3MF / ZIP',
    difficulty: 'Intermediate print',
    gradient: 'linear-gradient(145deg, #dff7ff, #78f2d4)',
    description: 'A digital file pack placeholder for multipart 3D printable toy models, stands, and future secure downloads.',
    parts: ['STL files', '3MF files', 'License note', 'Print guide']
  },
  {
    id: 'cp-stand-03',
    name: 'Cloud Base Stand',
    type: 'Display stand',
    price: 14,
    format: 'Accessory / stand',
    difficulty: 'Easy print',
    gradient: 'linear-gradient(145deg, #ffffff, #ffd166)',
    description: 'A clean display base category for peg adapters, themed stands, and collectible shelf organization.',
    parts: ['Base', 'Peg adapter', 'Logo plate']
  },
  {
    id: 'cp-bundle-04',
    name: 'Starter Shelf Bundle',
    type: 'Bundle',
    price: 99,
    format: 'Physical + digital extras',
    difficulty: 'Collector package',
    gradient: 'linear-gradient(145deg, #ffecf6, #ff7ab6)',
    description: 'A future bundle structure for complete collection drops, bonus accessories, profile badges, and reward unlocks.',
    parts: ['Figure', 'Stand', 'Badge', 'PopBits bonus']
  }
];

const modules = [
  {
    icon: '🧊',
    title: '3D preview ready',
    body: 'The first version leaves space for optimized GLB previews, part toggles, color palettes, and future screenshot tools.'
  },
  {
    icon: '🧰',
    title: 'Library foundation',
    body: 'Purchased STL files, version updates, license notes, and related accessory suggestions can live in a protected library.'
  },
  {
    icon: '🎮',
    title: 'Game layer',
    body: 'PopBits, Crystal Forge, Piñata Boss, Print Lab Tycoon, quests, and contests are designed as expandable modules.'
  }
];

const rewardRows = [
  ['Daily login', '+20 PopBits'],
  ['Share a make', '+80 PopBits'],
  ['Complete a collection', 'Badge + coupon'],
  ['Boss contribution', 'Leaderboard reward']
];

function ProductCard({ product, active, onInspect, onAdd }) {
  return (
    <article className="product-card">
      <div className="product-preview">
        <div className="product-token" style={{ '--token-gradient': product.gradient }} />
      </div>
      <div className="card-foot">
        <span className="badge">{product.type}</span>
        <strong>${product.price}</strong>
      </div>
      <h3>{product.name}</h3>
      <p>{product.format}</p>
      <div className="card-foot">
        <button className="ghost-button" onClick={() => onInspect(product)}>{active ? 'Inspecting' : 'Inspect'}</button>
        <button className="secondary-button" onClick={() => onAdd(product)}>Add</button>
      </div>
    </article>
  );
}

function CartDrawer({ cart, rewards, onClose }) {
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart]);
  return (
    <div className="cart-drawer" onClick={onClose}>
      <aside className="cart-panel" onClick={(event) => event.stopPropagation()}>
        <div className="cart-top">
          <div>
            <strong style={{ fontSize: 24, letterSpacing: '-0.05em' }}>Cart prototype</strong>
            <p style={{ margin: '4px 0 0', color: 'rgba(6,16,24,.54)' }}>Checkout is a placeholder for the MVP foundation.</p>
          </div>
          <button className="ghost-button" onClick={onClose}>Close</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-item">Your cart is empty.</div>
          ) : (
            cart.map((item, index) => (
              <div className="cart-item" key={`${item.id}-${index}`}>
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ color: 'rgba(6,16,24,.52)', fontSize: 13 }}>{item.type}</div>
                </div>
                <strong>${item.price}</strong>
              </div>
            ))
          )}
        </div>
        <div className="reward-row"><span>Unlocked rewards</span><strong>{rewards}</strong></div>
        <div className="reward-row"><span>Prototype total</span><strong>${total}</strong></div>
        <button className="primary-button" disabled={cart.length === 0} style={{ marginTop: 12, width: '100%' }}>Checkout placeholder</button>
      </aside>
    </div>
  );
}

export default function Home() {
  const [selected, setSelected] = useState(products[0]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [bossHp, setBossHp] = useState(100);
  const [popBits, setPopBits] = useState(120);
  const [rewards, setRewards] = useState(0);

  function addToCart(product) {
    setCart((current) => [...current, product]);
    setCartOpen(true);
  }

  function hitBoss() {
    setBossHp((current) => {
      const next = Math.max(0, current - 12);
      if (next === 0) {
        setRewards((value) => value + 1);
        setPopBits((value) => value + 50);
      } else {
        setPopBits((value) => value + 5);
      }
      return next;
    });
  }

  function resetBoss() {
    setBossHp(100);
  }

  return (
    <>
      <header className="topbar">
        <nav className="shell nav">
          <a className="brand" href="#top">
            <span className="logo-mark">✦</span>
            <span>CyberPop Shop</span>
          </a>
          <div className="nav-links">
            <a href="#shop">Shop</a>
            <a href="#rewards">Rewards</a>
            <a href="#games">Games</a>
            <a href="#library">Library</a>
          </div>
          <button className="pill-button" onClick={() => setCartOpen(true)}>Cart · {cart.length}</button>
        </nav>
      </header>

      <main id="top" className="shell">
        <section className="hero">
          <div className="hero-card">
            <span className="kicker">Premium 3D printable toy ecosystem</span>
            <h1>Collect, print, play, and unlock.</h1>
            <p>
              CyberPop Shop is the foundation for a playful 3D printable toy platform: physical prints, STL files, product previews, user libraries, PopBits rewards, makes galleries, mini games, and future seasonal contests.
            </p>
            <div className="cta-row">
              <a className="primary-button" href="#shop">Explore shop</a>
              <a className="secondary-button" href="#games">Try game layer</a>
            </div>
            <div className="stats-grid">
              <div className="stat-card"><strong>{popBits}</strong><span>PopBits demo balance</span></div>
              <div className="stat-card"><strong>{rewards}</strong><span>Unlocked rewards</span></div>
              <div className="stat-card"><strong>{products.length}</strong><span>Starter products</span></div>
            </div>
          </div>

          <div className="glass-card showcase-card">
            <div className="figure-stage">
              <div className="figure" aria-label="Stylized CyberPop figure preview">
                <div className="head" />
                <div className="arm left" />
                <div className="arm right" />
                <div className="body" />
                <div className="leg left" />
                <div className="leg right" />
                <div className="base" />
              </div>
            </div>
            <div className="spotlight-info">
              <div>
                <h2>{selected.name}</h2>
                <p>{selected.description}</p>
              </div>
              <div className="price">${selected.price}</div>
            </div>
          </div>
        </section>

        <section className="section" id="shop">
          <div className="section-head">
            <div>
              <span className="kicker">Shop core</span>
              <h2>Product catalog foundation</h2>
            </div>
            <p>Starter cards for physical prints, STL bundles, display stands, and collector bundles. Later these connect to product data, stock, checkout, secure downloads, and admin tools.</p>
          </div>
          <div className="catalog-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} active={selected.id === product.id} onInspect={setSelected} onAdd={addToCart} />
            ))}
          </div>
        </section>

        <section className="section" id="library">
          <div className="section-head">
            <div>
              <span className="kicker">Platform modules</span>
              <h2>Built for more than a store</h2>
            </div>
            <p>The brief defines CyberPop as a shop, toy brand, digital collection universe, game hub, and community platform. These modules keep that direction open without overbuilding MVP 1.</p>
          </div>
          <div className="modules-grid">
            {modules.map((module) => (
              <div className="module-card" key={module.title}>
                <div className="module-icon">{module.icon}</div>
                <h3>{module.title}</h3>
                <p>{module.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="games">
          <div className="section-head">
            <div>
              <span className="kicker">Mini game hub placeholder</span>
              <h2>Piñata Boss demo loop</h2>
            </div>
            <p>A safe first game layer: tap the boss, collect PopBits, unlock transparent rewards. In production, reward results must be calculated server-side.</p>
          </div>
          <div className="game-panel">
            <div className="boss-card">
              <div className="boss-arena">
                <button className="boss" aria-label="Hit boss" onClick={hitBoss} />
              </div>
              <div style={{ marginTop: 18 }}>
                <div className="progress"><span style={{ width: `${bossHp}%` }} /></div>
                <div className="card-foot"><strong>Boss HP: {bossHp}%</strong><button className="ghost-button" onClick={resetBoss}>Reset</button></div>
              </div>
            </div>
            <div className="reward-card" id="rewards">
              <span className="kicker">Rewards foundation</span>
              <h2 style={{ marginTop: 14 }}>PopBits and quests</h2>
              <p style={{ color: 'rgba(6,16,24,.58)', lineHeight: 1.7 }}>The real version can include daily login streaks, Crystal Forge, collection shards, makes gallery bonuses, Patreon code rewards, and leaderboard events.</p>
              <div className="reward-list">
                {rewardRows.map(([label, value]) => (
                  <div className="reward-row" key={label}><span>{label}</span><strong>{value}</strong></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          CyberPop Shop MVP 0 · Clean starter build · Next.js-ready foundation
        </footer>
      </main>

      {cartOpen && <CartDrawer cart={cart} rewards={rewards} onClose={() => setCartOpen(false)} />}
    </>
  );
}
