'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const drops = [
  {
    id: 'skyline-hero',
    name: 'Skyline Print Hero',
    poster: 'SKYLINE',
    tag: 'Starter physical figure',
    price: 69,
    scale: '30 cm physical print',
    format: 'Multipart FDM + display STL',
    palette: ['#83d8ff', '#0d76aa', '#063d66'],
    accent: '#4fc3ff',
    slogan: 'A desk-size hero built like a premium toy drop.',
    material: 'Satin PLA / resin-ready preview',
    parts: ['Head', 'Torso', 'Arms', 'Legs', 'Base'],
    rarity: 'Alpha Drop',
    printCue: 'Large clean color regions, no tiny paint lines.'
  },
  {
    id: 'bunny-athlete',
    name: 'Beach Bunny Athlete',
    poster: 'BEACH',
    tag: 'Sport collectible concept',
    price: 74,
    scale: '28 cm physical print',
    format: 'Separate color parts + STL pack',
    palette: ['#ffc2e7', '#ff63b7', '#7d55ff'],
    accent: '#ff63b7',
    slogan: 'A playful summer drop with toy-shelf attitude.',
    material: 'Matte pastel print finish',
    parts: ['Head', 'Ears', 'Body', 'Shorts', 'Stand'],
    rarity: 'Seasonal',
    printCue: 'Thick readable costume blocks for multipart printing.'
  },
  {
    id: 'storm-hat',
    name: 'Storm Hat Warrior',
    poster: 'STORM',
    tag: 'Arcade legend inspired original',
    price: 79,
    scale: '31 cm physical print',
    format: 'Collector STL + physical option',
    palette: ['#cbf7ff', '#00a6ff', '#123bd1'],
    accent: '#00a6ff',
    slogan: 'The kind of shelf piece that feels like a boss entrance.',
    material: 'Satin blue PLA with separated hat rim',
    parts: ['Hat', 'Head', 'Torso', 'Hands', 'Base'],
    rarity: 'Collector',
    printCue: 'Accessory silhouette stays thick, printable, and readable.'
  },
  {
    id: 'tiger-boss',
    name: 'Corporate Tiger Boss',
    poster: 'BOSS',
    tag: 'Premium power suit figure',
    price: 89,
    scale: '32 cm physical print',
    format: 'Paint-free multipart figure',
    palette: ['#ffe0a3', '#ff9c2b', '#874900'],
    accent: '#ff9c2b',
    slogan: 'A heavy desk trophy with arcade villain energy.',
    material: 'Dark suit plastic + warm accent parts',
    parts: ['Head', 'Jacket', 'Arms', 'Pants', 'Shoes'],
    rarity: 'Premium',
    printCue: 'Bold suit volumes, thick seams, clean assembly logic.'
  }
];

const modeCopy = {
  lobby: 'Live lobby mode: hero stage, active drop, shop status.',
  drops: 'Drop mode: product reveals, parts, print format, collector details.',
  arcade: 'Mini-game mode: reward loops and playable event shells.',
  loot: 'Loot mode: free daily crystal, transparent odds, no cash wagering.',
  rewards: 'Rewards mode: PopBits, loyalty streaks, library unlocks.'
};

const lootRewards = [
  { label: 'PopBits', value: '+40', chance: 'Common' },
  { label: 'Accessory STL', value: 'Mini gear', chance: 'Rare' },
  { label: 'Print coupon', value: '5%', chance: 'Rare' },
  { label: 'Collector badge', value: 'Vault mark', chance: 'Epic' }
];

const miniGames = [
  {
    id: 'pinata',
    name: 'Piñata Boss',
    text: 'Break a chunky toy boss, collect shards, unlock harmless shop bonuses.',
    status: 'First vertical slice candidate'
  },
  {
    id: 'runner',
    name: 'Print Runner',
    text: 'A short map run through shelves, filament gates, and product poster rooms.',
    status: 'Prototype later'
  },
  {
    id: 'forge',
    name: 'Crystal Forge',
    text: 'Use earned shards to reveal a reward, badge, or accessory slot.',
    status: 'Reward system bridge'
  }
];

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Header({ activeMode, setActiveMode, popBits, cartCount }) {
  const modes = [
    ['lobby', 'Lobby'],
    ['drops', 'Drops'],
    ['arcade', 'Mini Game'],
    ['loot', 'Loot'],
    ['rewards', 'Rewards']
  ];

  return (
    <header className="site-header">
      <div className="brand-block">
        <div className="brand-mark">CP</div>
        <div>
          <strong>CyberPop</strong>
          <span>3D printable toy universe</span>
        </div>
      </div>

      <nav className="mode-nav" aria-label="Interface mode selector">
        {modes.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveMode(id)}
            className={activeMode === id ? 'is-active' : ''}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <div className="currency-pill">✦ {popBits}</div>
        <button type="button" className="cart-pill">Cart {cartCount}</button>
      </div>
    </header>
  );
}

function Figure3D({ drop }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -12, y: px * 18 });
  }

  return (
    <div
      className="figure-stage"
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        '--c1': drop.palette[0],
        '--c2': drop.palette[1],
        '--c3': drop.palette[2],
        '--tiltX': `${tilt.x}deg`,
        '--tiltY': `${tilt.y}deg`
      }}
    >
      <div className="stage-rings" />
      <div className="print-grid" />
      <div className="figure-shadow" />
      <div className="toy-model" aria-label={`${drop.name} interactive 3D placeholder`}>
        <div className="toy-head" />
        <div className="toy-ear toy-ear-left" />
        <div className="toy-ear toy-ear-right" />
        <div className="toy-body" />
        <div className="toy-arm toy-arm-left" />
        <div className="toy-arm toy-arm-right" />
        <div className="toy-leg toy-leg-left" />
        <div className="toy-leg toy-leg-right" />
        <div className="toy-base" />
      </div>
      <div className="orbit-chip chip-one">GLB slot</div>
      <div className="orbit-chip chip-two">STL pack</div>
    </div>
  );
}

function HeroWorld({ activeDrop, activeMode, addPopBits }) {
  return (
    <section className="hero-world" style={{ '--accent': activeDrop.accent }}>
      <div className="poster-word" aria-hidden="true">{activeDrop.poster}</div>
      <div className="hero-left">
        <div className="mode-terminal">
          <span className="terminal-dot" />
          <strong>{activeMode.toUpperCase()} MODE</strong>
          <p>{modeCopy[activeMode]}</p>
        </div>

        <div className="poster-copy">
          <span>{activeDrop.rarity}</span>
          <h1>{activeDrop.name}</h1>
          <p>{activeDrop.slogan}</p>
        </div>

        <div className="print-spec-row">
          <div>
            <span>Scale</span>
            <strong>{activeDrop.scale}</strong>
          </div>
          <div>
            <span>Format</span>
            <strong>{activeDrop.format}</strong>
          </div>
          <div>
            <span>Material feel</span>
            <strong>{activeDrop.material}</strong>
          </div>
        </div>
      </div>

      <Figure3D drop={activeDrop} />

      <aside className="drop-terminal">
        <div className="terminal-topline">
          <span>Active Drop</span>
          <strong>${activeDrop.price}</strong>
        </div>
        <h2>{activeDrop.tag}</h2>
        <p>{activeDrop.printCue}</p>
        <div className="part-list">
          {activeDrop.parts.map((part) => <span key={part}>{part}</span>)}
        </div>
        <button type="button" onClick={addPopBits}>Inspect +10 PopBits</button>
      </aside>
    </section>
  );
}

function ScrollDropScenes({ activeId, setActiveId }) {
  const refs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.dataset?.dropId) setActiveId(visible.target.dataset.dropId);
      },
      { threshold: [0.35, 0.5, 0.7], rootMargin: '-15% 0px -30% 0px' }
    );

    refs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [setActiveId]);

  return (
    <section className="drop-scroll-shell">
      <div className="section-kicker">Scroll / Drop reveal</div>
      <h2>Every scroll should feel like a new collectible poster.</h2>
      <p className="section-lead">The real version can replace these CSS placeholders with GLB models, but the behavior is already set: the character, poster word, print specs, and product mood change as the user scrolls.</p>

      <div className="scene-stack">
        {drops.map((drop, index) => (
          <article
            key={drop.id}
            data-drop-id={drop.id}
            ref={(node) => { refs.current[index] = node; }}
            className={cx('drop-scene', activeId === drop.id && 'is-current')}
            style={{ '--scene': drop.accent }}
          >
            <div className="scene-index">0{index + 1}</div>
            <div>
              <span>{drop.rarity}</span>
              <h3>{drop.poster}</h3>
              <p>{drop.slogan}</p>
            </div>
            <div className="scene-print-card">
              <strong>{drop.name}</strong>
              <small>{drop.scale}</small>
              <small>{drop.parts.length} printable components</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function LootLab({ popBits, addPopBits }) {
  return (
    <section className="systems-section loot-section">
      <div className="section-heading">
        <span>Loot foundation</span>
        <h2>Crystal reward loop, not casino clutter.</h2>
        <p>Chance mechanics are framed as a free loyalty/event layer: transparent, lightweight, and separated from checkout until the legal/product rules are defined.</p>
      </div>

      <div className="loot-grid">
        <div className="crystal-machine">
          <div className="machine-label">Daily Crystal</div>
          <div className="crystal-core">✦</div>
          <button type="button" onClick={addPopBits}>Open free demo crystal</button>
          <small>Current demo balance: {popBits} PopBits</small>
        </div>

        <div className="reward-table">
          {lootRewards.map((reward) => (
            <div key={reward.label} className="reward-row">
              <span>{reward.chance}</span>
              <strong>{reward.label}</strong>
              <em>{reward.value}</em>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniGameBay() {
  const [active, setActive] = useState(miniGames[0].id);
  const game = miniGames.find((item) => item.id === active);

  return (
    <section className="systems-section game-section">
      <div className="section-heading">
        <span>Mini game bay</span>
        <h2>A tabbed arcade shell we can turn into a real game later.</h2>
      </div>

      <div className="game-tabs">
        {miniGames.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={active === item.id ? 'is-active' : ''}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="game-cabinet">
        <div className="cabinet-screen">
          <div className="pixel-shelf" />
          <div className="boss-toy">★</div>
          <div className="hit-zone">Tap / Break / Earn</div>
        </div>
        <div className="cabinet-copy">
          <span>{game.status}</span>
          <h3>{game.name}</h3>
          <p>{game.text}</p>
          <div className="cabinet-steps">
            <small>Play</small>
            <small>Earn shards</small>
            <small>Unlock reward</small>
            <small>Return to shop</small>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoyaltySystem({ popBits }) {
  const tiers = [
    ['Daily Login', 'Small PopBits reward + streak marker'],
    ['Print Library', 'Purchased STL/physical product history'],
    ['Makes Gallery', 'Upload print photos and earn profile badges'],
    ['Collection Sets', 'Complete themed drops for display rewards']
  ];

  return (
    <section className="systems-section loyalty-section">
      <div className="section-heading">
        <span>Loyalty foundation</span>
        <h2>Rewards should make users feel progress, not confusion.</h2>
        <p>PopBits, badges, collection progress, and makes gallery loops can live together without filling the whole screen with random UI.</p>
      </div>

      <div className="loyalty-board">
        <div className="balance-orb">
          <span>PopBits</span>
          <strong>{popBits}</strong>
          <small>Demo wallet</small>
        </div>
        <div className="tier-list">
          {tiers.map(([title, text], index) => (
            <div key={title} className="tier-item">
              <b>{index + 1}</b>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [activeId, setActiveId] = useState(drops[0].id);
  const [activeMode, setActiveMode] = useState('lobby');
  const [popBits, setPopBits] = useState(260);
  const [cartCount, setCartCount] = useState(0);

  const activeDrop = useMemo(
    () => drops.find((drop) => drop.id === activeId) || drops[0],
    [activeId]
  );

  function addPopBits() {
    setPopBits((value) => value + 10);
  }

  return (
    <main className="page-shell">
      <Header activeMode={activeMode} setActiveMode={setActiveMode} popBits={popBits} cartCount={cartCount} />

      <HeroWorld activeDrop={activeDrop} activeMode={activeMode} addPopBits={addPopBits} />

      <div className="quick-shop-strip">
        {drops.map((drop) => (
          <button
            key={drop.id}
            type="button"
            className={activeId === drop.id ? 'is-active' : ''}
            onClick={() => {
              setActiveId(drop.id);
              setCartCount((count) => count + 1);
            }}
            style={{ '--strip': drop.accent }}
          >
            <span>{drop.poster}</span>
            <strong>{drop.name}</strong>
            <small>Add preview / ${drop.price}</small>
          </button>
        ))}
      </div>

      <ScrollDropScenes activeId={activeId} setActiveId={setActiveId} />
      <LootLab popBits={popBits} addPopBits={addPopBits} />
      <MiniGameBay />
      <LoyaltySystem popBits={popBits} />
    </main>
  );
}
