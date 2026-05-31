"use client";

import { useMemo, useState } from "react";

const products = [
  {
    id: "sonya-blade",
    code: "CP-013",
    name: "Sonya Blade",
    short: "Sonya",
    series: "MK Arena",
    categories: ["View All", "MK Arena", "90s Arcade"],
    rarity: "Rare",
    className: "rare",
    price: 62,
    stlPrice: 5,
    popularity: 94,
    release: 12,
    xp: 30,
    units: 230,
    cover: "/images/covers/sonya-blade.png",
    model: "/models/sonya-blade.glb",
    parts: ["Hair", "Torso", "Legs", "Boots"],
    tagline: "Ready for STL, physical print, and studio color planning.",
    palette: ["#e9b77a", "#75d34e", "#121c18", "#e8eee6"]
  },
  {
    id: "cammy-sf6",
    code: "CP-011",
    name: "Cammy SF6",
    short: "Cammy",
    series: "Street Fighters",
    categories: ["View All", "Street Fighters", "90s Arcade"],
    rarity: "Rare",
    className: "rare",
    price: 64,
    stlPrice: 5,
    popularity: 91,
    release: 11,
    xp: 28,
    units: 210,
    cover: "/images/covers/cammy.png",
    parts: ["Hair", "Body", "Boots", "Base"],
    tagline: "Clean color regions with a premium cover-style presentation.",
    palette: ["#e5b472", "#5de6c5", "#15202f", "#e8f1f4"]
  },
  {
    id: "johnny-cage",
    code: "CP-012",
    name: "Johnny Cage",
    short: "Johnny",
    series: "MK Arena",
    categories: ["View All", "MK Arena", "90s Arcade"],
    rarity: "Epic",
    className: "epic",
    price: 72,
    stlPrice: 5,
    popularity: 87,
    release: 10,
    xp: 36,
    units: 300,
    cover: "/images/covers/johnny-cage.png",
    parts: ["Head", "Glasses", "Torso", "Pants"],
    tagline: "Shelf-ready physical print with strong display attitude.",
    palette: ["#d69d75", "#0b0c10", "#d8dfe4", "#1d2230"]
  },
  {
    id: "dudley-boxer",
    code: "CP-010",
    name: "Dudley Gentleman Boxer",
    short: "Dudley",
    series: "Street Fighters",
    categories: ["View All", "Street Fighters"],
    rarity: "Epic",
    className: "epic",
    price: 69,
    stlPrice: 5,
    popularity: 73,
    release: 9,
    xp: 35,
    units: 260,
    cover: "/images/covers/dudley.webp",
    parts: ["Head", "Shirt", "Gloves", "Shoes"],
    tagline: "Gentleman fighter cover slot prepared for physical print sales.",
    palette: ["#c99766", "#f0f2ef", "#1c53d6", "#15212a"]
  },
  {
    id: "juri",
    code: "CP-020",
    name: "Juri Neon Fighter",
    short: "Juri",
    series: "Street Fighters",
    categories: ["View All", "Street Fighters", "90s Arcade"],
    rarity: "Epic",
    className: "epic",
    price: 67,
    stlPrice: 5,
    popularity: 79,
    release: 8,
    xp: 34,
    units: 245,
    cover: "/images/covers/juri.webp",
    parts: ["Hair", "Torso", "Pants", "Feet"],
    tagline: "A compact fighter collectible with high-energy color blocking.",
    palette: ["#f844be", "#1b2032", "#8ee5e0", "#f6c7b7"]
  },
  {
    id: "bison",
    code: "CP-026",
    name: "M. Bison Red Commander",
    short: "Bison",
    series: "Street Fighters",
    categories: ["View All", "Street Fighters", "90s Arcade"],
    rarity: "Epic",
    className: "epic",
    price: 78,
    stlPrice: 5,
    popularity: 85,
    release: 7,
    xp: 40,
    units: 320,
    cover: "/images/covers/bison.webp",
    parts: ["Cap", "Torso", "Arms", "Boots"],
    tagline: "Bold physical display piece with strong premium shelf presence.",
    palette: ["#be202a", "#111111", "#f0d071", "#8f9aa6"]
  },
  {
    id: "ken",
    code: "CP-023",
    name: "Ken Flame Fighter",
    short: "Ken",
    series: "Street Fighters",
    categories: ["View All", "Street Fighters", "90s Arcade"],
    rarity: "Rare",
    className: "rare",
    price: 62,
    stlPrice: 5,
    popularity: 88,
    release: 6,
    xp: 28,
    units: 220,
    cover: "/images/covers/ken.webp",
    parts: ["Head", "Torso", "Gloves", "Pants"],
    tagline: "Classic arcade energy translated into a collectible print cover.",
    palette: ["#e0a660", "#e33f2f", "#111111", "#f8d698"]
  },
  {
    id: "sumo",
    code: "CP-022",
    name: "Sumo Warrior",
    short: "Sumo",
    series: "Street Fighters",
    categories: ["View All", "Street Fighters", "90s Arcade"],
    rarity: "Epic",
    className: "epic",
    price: 70,
    stlPrice: 5,
    popularity: 66,
    release: 5,
    xp: 32,
    units: 235,
    cover: "/images/covers/sumo.webp",
    parts: ["Hair", "Body", "Belt", "Base"],
    tagline: "Chunky arcade figure with readable multipart surface zones.",
    palette: ["#d79f75", "#111f34", "#e2e8f0", "#d92332"]
  },
  {
    id: "dhalsim",
    code: "CP-024",
    name: "Dhalsim Mystic",
    short: "Dhalsim",
    series: "Street Fighters",
    categories: ["View All", "Street Fighters", "90s Arcade"],
    rarity: "Epic",
    className: "epic",
    price: 71,
    stlPrice: 5,
    popularity: 74,
    release: 4,
    xp: 35,
    units: 255,
    cover: "/images/covers/dhalsim.webp",
    parts: ["Head", "Beads", "Body", "Cloth"],
    tagline: "A dramatic cover figure for a premium printable collection.",
    palette: ["#8b5a30", "#d3d5d5", "#c99531", "#111111"]
  },
  {
    id: "guile",
    code: "CP-017",
    name: "Guile Sonic Soldier",
    short: "Guile",
    series: "Street Fighters",
    categories: ["View All", "Street Fighters", "90s Arcade"],
    rarity: "Rare",
    className: "rare",
    price: 68,
    stlPrice: 5,
    popularity: 82,
    release: 3,
    xp: 30,
    units: 250,
    cover: "/images/covers/guile.webp",
    parts: ["Hair", "Torso", "Arms", "Base"],
    tagline: "Strong toy silhouette with a black poster cover direction.",
    palette: ["#e2b870", "#324f2d", "#111111", "#a77b3c"]
  },
  {
    id: "magik",
    code: "CP-030",
    name: "Magik Mock Series",
    short: "Magik",
    series: "Mock Series",
    categories: ["View All", "Vault Rares", "90s Arcade"],
    rarity: "Epic",
    className: "epic",
    price: 75,
    stlPrice: 5,
    popularity: 78,
    release: 2,
    xp: 39,
    units: 345,
    cover: "/images/covers/magik.webp",
    parts: ["Hair", "Body", "Accent", "Sword"],
    tagline: "Premium mock-series cover slot with collectible energy.",
    palette: ["#e8c77b", "#1b2134", "#a738e6", "#d8e5ef"]
  },
  {
    id: "gouken",
    code: "CP-031",
    name: "Gouken Master",
    short: "Gouken",
    series: "Street Fighters",
    categories: ["View All", "Street Fighters", "90s Arcade"],
    rarity: "Legendary",
    className: "legendary",
    price: 86,
    stlPrice: 5,
    popularity: 83,
    release: 1,
    xp: 48,
    units: 410,
    cover: "/images/covers/gouken.png",
    parts: ["Head", "Beard", "Body", "Cloth"],
    tagline: "High-level display cover with legendary collection presence.",
    palette: ["#b98d5d", "#f1f2f3", "#7d6b5a", "#141414"]
  }
];

const categories = ["View All", "90s Arcade", "Street Fighters", "MK Arena", "Beach Theme", "Vault Rares"];
const sizes = [15, 30, 40];

const rewardTrack = [
  { id: "wallpaper", type: "Wallpaper", title: "Dudley Wallpaper", xp: 120, purchases: 0, img: "/images/covers/dudley.webp", state: "claimed" },
  { id: "gif", type: "GIF", title: "Sonya Blade GIF", xp: 220, purchases: 1, img: "/images/covers/sonya-blade.png", state: "claimed" },
  { id: "sticker", type: "Sticker", title: "Johnny Silent Sticker", xp: 360, purchases: 2, img: "/images/covers/johnny-cage.png", state: "claimed" },
  { id: "spin", type: "Wheel", title: "Bonus Wheel Spin", xp: 480, purchases: 3, img: "/images/covers/cammy.png", state: "next" },
  { id: "art", type: "Artwork", title: "Raiden Vault Artwork", xp: 620, purchases: 4, img: "/images/covers/magik.webp", state: "locked" },
  { id: "trophy", type: "Trophy", title: "Rare Hunter Trophy", xp: 760, purchases: 5, img: "/images/covers/gouken.png", state: "locked" },
  { id: "unlock", type: "Character", title: "Shadow Character Unlock", xp: 900, purchases: 6, img: "/images/covers/bison.webp", state: "locked" }
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function sortProducts(list, sort) {
  const copy = [...list];
  if (sort === "price") copy.sort((a, b) => b.price - a.price);
  if (sort === "popular") copy.sort((a, b) => b.popularity - a.popularity);
  if (sort === "newest") copy.sort((a, b) => b.release - a.release);
  return copy;
}

function Badge({ children, tone = "default" }) {
  return <span className={cx("badge", tone)}>{children}</span>;
}

function SquareImage({ src, alt, className = "" }) {
  return (
    <div className={cx("square-media", className)}>
      <img src={src} alt={alt} loading="lazy" />
    </div>
  );
}

export default function Page() {
  const [mode, setMode] = useState("drop");
  const [category, setCategory] = useState("View All");
  const [sort, setSort] = useState("newest");
  const [selectedId, setSelectedId] = useState("sonya-blade");
  const [show3d, setShow3d] = useState(false);
  const [size, setSize] = useState(30);
  const [units, setUnits] = useState(345);
  const [spinning, setSpinning] = useState(false);
  const [lootResult, setLootResult] = useState(null);
  const [rewardModal, setRewardModal] = useState(null);

  const filtered = useMemo(() => {
    const base = category === "View All" ? products : products.filter((p) => p.categories.includes(category));
    return sortProducts(base, sort);
  }, [category, sort]);

  const selected = products.find((p) => p.id === selectedId) || products[0];
  const activeIndex = filtered.findIndex((p) => p.id === selected.id);
  const currentXp = 430;
  const maxXp = 900;

  function chooseCharacter(product) {
    setSelectedId(product.id);
    setShow3d(false);
  }

  function spinCrystal() {
    if (spinning) return;
    setLootResult(null);
    setSpinning(true);
    setUnits((value) => Math.max(0, value - 50));
    window.setTimeout(() => {
      const result = products[Math.floor(Math.random() * products.length)];
      setSelectedId(result.id);
      setLootResult(result);
      setSpinning(false);
    }, 2400);
  }

  return (
    <main className="site-shell">
      <div className="depth-bg">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
        <span className="grid-glow" />
      </div>

      <nav className="top-command">
        <div className="mode-tabs" aria-label="Main navigation">
          {[
            ["drop", "Drop Room"],
            ["collection", "Collection"],
            ["loot", "Loot"],
            ["rewards", "Rewards"],
            ["studio", "3D Studio"]
          ].map(([key, label]) => (
            <button key={key} className={cx(mode === key && "active")} onClick={() => setMode(key)}>
              {label}
            </button>
          ))}
        </div>
        <div className="top-actions">
          <button className="wallet" onClick={() => setMode("loot")}>
            <span>{units}</span>
            <small>Units</small>
          </button>
          <button className="inventory-button" onClick={() => setMode("collection")}>My Collection</button>
        </div>
      </nav>

      {mode === "drop" && (
        <section className="fight-layout">
          <aside className="player-panel glass-panel">
            <Badge>Season 00</Badge>
            <h1>CyberPop Drop Room</h1>
            <p className="muted">Select a collectible, inspect the cover, choose STL or physical, then move to 3D Studio when you need color planning.</p>
            <div className="player-stats">
              <div><strong>{units}</strong><small>Credit value</small></div>
              <div><strong>{selected.rarity}</strong><small>Rarity track</small></div>
              <div><strong>{selected.parts.length}</strong><small>Color parts</small></div>
            </div>
            <div className="flow-stack">
              <button onClick={() => setMode("loot")}>Earn units <small>missions + crystal</small></button>
              <button onClick={() => setMode("rewards")}>Track rewards <small>{maxXp - currentXp} XP to final unlock</small></button>
              <button onClick={() => setMode("studio")}>Open 3D Studio <small>filament planning</small></button>
            </div>
          </aside>

          <section className="main-arena">
            <div className="spotlight-card arena-panel">
              <div className="cover-stage">
                <div className="stage-header">
                  <Badge tone={selected.className}>{selected.rarity}</Badge>
                  <span>{selected.code}</span>
                </div>
                {!show3d ? (
                  <SquareImage src={selected.cover} alt={`${selected.name} cover`} className="main-cover" />
                ) : selected.model ? (
                  <div className="model-stage square-media main-cover">
                    <model-viewer src={selected.model} camera-controls auto-rotate rotation-per-second="22deg" exposure="1" shadow-intensity="0.6" ar ar-modes="webxr scene-viewer quick-look" />
                  </div>
                ) : (
                  <SquareImage src={selected.cover} alt={`${selected.name} cover`} className="main-cover dimmed" />
                )}
              </div>
              <div className="spotlight-info">
                <div>
                  <small>Selected collectible</small>
                  <h2>{selected.name}</h2>
                  <p>{selected.tagline}</p>
                </div>
                <div className="part-row">
                  {selected.parts.map((part) => <span key={part}>{part}</span>)}
                </div>
                <div className="arena-actions">
                  <button className="primary" onClick={() => setShow3d((value) => !value)}>{show3d ? "Show cover" : "3D print preview"}</button>
                  <button onClick={() => setMode("studio")}>Open 3D Studio</button>
                </div>
              </div>
            </div>

            <div className="select-panel arena-panel">
              <div className="select-header">
                <div>
                  <Badge>Choose your collectible</Badge>
                  <h3>{category}</h3>
                  <small>{filtered.length} square cover slots</small>
                </div>
                <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort characters">
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="price">Highest Price</option>
                </select>
              </div>

              <div className="category-strip" aria-label="Categories">
                {categories.map((item) => {
                  const count = item === "View All" ? products.length : products.filter((p) => p.categories.includes(item)).length;
                  return (
                    <button key={item} className={cx(category === item && "active")} onClick={() => setCategory(item)}>
                      <span>{item}</span><b>{count}</b>
                    </button>
                  );
                })}
              </div>

              <div className="fighter-roster" aria-label="Character roster">
                {filtered.map((product, index) => (
                  <button
                    key={product.id}
                    className={cx("portrait-tile", selected.id === product.id && "selected")}
                    style={{ "--delay": `${index * 18}ms` }}
                    onClick={() => chooseCharacter(product)}
                  >
                    <SquareImage src={product.cover} alt={product.name} />
                    <span className="tile-code">{product.code}</span>
                    <strong>{product.short}</strong>
                    <small>{product.rarity}</small>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="purchase-panel glass-panel">
            <Badge>Checkout route</Badge>
            <h2>{selected.name}</h2>
            <p className="muted">Digital STL access or made-to-order physical print. Subscription access and bulk packs can reduce digital cost.</p>
            <div className="buy-card stl">
              <div><small>Get STL</small><strong>${selected.stlPrice}</strong></div>
              <button>Choose STL</button>
            </div>
            <div className="buy-card physical">
              <div><small>Get physical product</small><strong>${selected.price}</strong></div>
              <div className="size-row">
                {sizes.map((item) => <button key={item} className={size === item ? "active" : ""} onClick={() => setSize(item)}>{item} cm</button>)}
              </div>
              <button>Choose physical</button>
            </div>
            <div className="loyalty-chip">
              <b>+{selected.xp} XP after this purchase</b>
              <div className="mini-progress"><span style={{ width: `${Math.min(100, ((currentXp + selected.xp) / maxXp) * 100)}%` }} /></div>
              <small>Activates site points, trophy progress, and wheel progress.</small>
            </div>
          </aside>
        </section>
      )}

      {mode === "collection" && (
        <section className="page-panel collection-page">
          <div className="section-title">
            <Badge>Player inventory</Badge>
            <h2>My Collection</h2>
            <p>Purchased characters stay here for studio access, palette planning, and future unlock tracking.</p>
          </div>
          <div className="collection-grid">
            {products.slice(0, 8).map((product) => (
              <button key={product.id} className="collection-card" onClick={() => { chooseCharacter(product); setMode("drop"); }}>
                <SquareImage src={product.cover} alt={product.name} />
                <div><Badge tone={product.className}>{product.rarity}</Badge><h3>{product.name}</h3><small>Open product route</small></div>
              </button>
            ))}
          </div>
        </section>
      )}

      {mode === "loot" && (
        <section className="page-panel loot-page">
          <div className="section-title centered">
            <Badge>Spend site credit (units)</Badge>
            <h2>Crystal Drop</h2>
            <p>One crystal, one connected character wheel, one collectible result.</p>
          </div>
          <div className="loot-machine">
            <div className={cx("crystal-core", spinning && "spinning")} aria-hidden="true"><i /></div>
            <div className={cx("loot-ring", spinning && "spinning")}>
              {products.slice(0, 8).map((product, index) => (
                <div key={product.id} className="ring-card" style={{ "--i": index }}>
                  <SquareImage src={product.cover} alt={product.name} />
                </div>
              ))}
            </div>
            <button className="spin-button" onClick={spinCrystal} disabled={spinning || units < 50}>{spinning ? "Rolling..." : "Spin - 50 units"}</button>
          </div>
          {lootResult && (
            <div className="unlock-card poster-card">
              <SquareImage src={lootResult.cover} alt={lootResult.name} />
              <div>
                <Badge tone={lootResult.className}>{lootResult.rarity} pull</Badge>
                <h3>{lootResult.name}</h3>
                <p>Added to your collection route.</p>
                <button onClick={() => setMode("collection")}>View in My Collection</button>
              </div>
            </div>
          )}
        </section>
      )}

      {mode === "rewards" && (
        <section className="page-panel rewards-page">
          <div className="rewards-poster">
            <div>
              <Badge>Monthly track</Badge>
              <h2>Climb the track. Reach the ranks. Collect the drops.</h2>
            </div>
            <button onClick={() => setMode("loot")}>Earn units</button>
          </div>
          <div className="track-board">
            <div className="track-line"><span style={{ width: `${(currentXp / maxXp) * 100}%` }} /></div>
            {rewardTrack.map((reward, index) => {
              const left = Math.min(94, Math.max(4, (reward.xp / maxXp) * 100));
              const remaining = Math.max(0, reward.xp - currentXp);
              return (
                <button key={reward.id} className={cx("reward-node", reward.state)} style={{ left: `${left}%`, "--stagger": `${index * 40}ms` }} onClick={() => setRewardModal({ ...reward, remaining })}>
                  <SquareImage src={reward.img} alt={reward.title} />
                  <b>{reward.type}</b>
                  <small>{remaining === 0 ? "Claimed" : `${remaining} XP left`}</small>
                </button>
              );
            })}
          </div>
          <div className="checkpoint-grid">
            {rewardTrack.slice(3).map((reward) => {
              const remaining = Math.max(0, reward.xp - currentXp);
              const purchasesLeft = Math.max(0, reward.purchases - 2);
              return (
                <div key={reward.id} className="checkpoint-card">
                  <Badge>{reward.type}</Badge>
                  <h3>{reward.title}</h3>
                  <p>{remaining} XP left</p>
                  <small>{purchasesLeft} more purchases</small>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {mode === "studio" && (
        <section className="page-panel studio-page">
          <div className="section-title">
            <Badge>3MF package loaded</Badge>
            <h2>3D Studio Color Plan</h2>
            <p>Choose color groups and match your own filament codes before printing.</p>
          </div>
          <div className="studio-grid">
            <SquareImage src={selected.cover} alt={selected.name} className="studio-cover" />
            <div className="parts-editor">
              {selected.parts.map((part, index) => (
                <label key={part} className="part-row-editor">
                  <span><b>{part}</b><small>Detected color group {index + 1}</small></span>
                  <input type="color" defaultValue={selected.palette[index % selected.palette.length]} />
                  <input placeholder="Enter your filament code" defaultValue={`PLA-${part.toUpperCase().slice(0, 5)}-${index + 1}`} />
                </label>
              ))}
            </div>
          </div>
        </section>
      )}

      {rewardModal && (
        <div className="modal-backdrop" onClick={() => setRewardModal(null)}>
          <div className="reward-modal" onClick={(event) => event.stopPropagation()}>
            <SquareImage src={rewardModal.img} alt={rewardModal.title} />
            <Badge>{rewardModal.type}</Badge>
            <h3>{rewardModal.title}</h3>
            <p>{rewardModal.remaining === 0 ? "Unlocked in your vault." : `${rewardModal.remaining} XP left to unlock.`}</p>
            <button onClick={() => setRewardModal(null)}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
}
