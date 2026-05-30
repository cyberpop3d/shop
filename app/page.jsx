"use client";

import { useMemo, useState } from "react";

const products = [
  {
    id: "sagat-corporate",
    code: "CP-010",
    name: "Sagat Corporate",
    short: "Sagat",
    poster: "SAGAT",
    rarity: "Epic",
    rarityClass: "epic",
    category: "Physical + STL",
    status: "Portfolio sample",
    digitalPrice: 5,
    sizePrices: { 15: 39, 30: 69, 40: 109 },
    creditValue: 260,
    loyaltyGain: 35,
    palette: ["#f2c68d", "#1a2438", "#f7faff", "#111820"],
    glow: "#48c7ff",
    line: "Suit display figure with readable multipart zones.",
    printNote: "Head / torso / arms / shoes prepared as color planning groups.",
    parts: [
      { name: "Head", sublayer: "OBJ_head_01", color: "#f2c68d", filament: "PLA-SKIN-02" },
      { name: "Suit Torso", sublayer: "OBJ_torso_02", color: "#1a2438", filament: "PLA-NAVY-06" },
      { name: "Gloves", sublayer: "OBJ_gloves_03", color: "#f7faff", filament: "PLA-WHITE-01" },
      { name: "Shoes", sublayer: "OBJ_shoes_04", color: "#111820", filament: "PLA-BLACK-01" }
    ]
  },
  {
    id: "cammy-sf6",
    code: "CP-011",
    name: "Cammy SF6",
    short: "Cammy",
    poster: "CAMMY",
    rarity: "Rare",
    rarityClass: "rare",
    category: "STL Bundle",
    status: "Portfolio sample",
    digitalPrice: 5,
    sizePrices: { 15: 35, 30: 64, 40: 99 },
    creditValue: 210,
    loyaltyGain: 28,
    palette: ["#ffc87b", "#5ce7c1", "#f8f4e8", "#182334"],
    glow: "#6df0ce",
    line: "Sporty collectible with clean studio color sections.",
    printNote: "Hair / torso / legs / base detected as printable color groups.",
    parts: [
      { name: "Hair", sublayer: "OBJ_hair_01", color: "#ffc87b", filament: "PLA-BLONDE-01" },
      { name: "Body", sublayer: "OBJ_body_02", color: "#5ce7c1", filament: "PLA-MINT-04" },
      { name: "Boots", sublayer: "OBJ_boots_03", color: "#182334", filament: "PLA-BLACK-02" },
      { name: "Base", sublayer: "OBJ_base_04", color: "#f8f4e8", filament: "PLA-WARM-WHITE" }
    ]
  },
  {
    id: "johnny-cage",
    code: "CP-012",
    name: "Johnny Cage",
    short: "Johnny",
    poster: "CAGE",
    rarity: "Epic",
    rarityClass: "epic",
    category: "Physical Print",
    status: "Portfolio sample",
    digitalPrice: 5,
    sizePrices: { 15: 39, 30: 72, 40: 118 },
    creditValue: 300,
    loyaltyGain: 36,
    palette: ["#ffd7a1", "#151d2c", "#18d7c3", "#eaf7ff"],
    glow: "#40d9ff",
    line: "Shelf-ready action figure with strong display attitude.",
    printNote: "Head / glasses / torso / lower body separated for palette planning.",
    parts: [
      { name: "Head", sublayer: "OBJ_head_01", color: "#ffd7a1", filament: "PLA-SKIN-03" },
      { name: "Glasses", sublayer: "OBJ_glasses_02", color: "#151d2c", filament: "PLA-BLACK-01" },
      { name: "Torso", sublayer: "OBJ_torso_03", color: "#18d7c3", filament: "PLA-TEAL-08" },
      { name: "Pants", sublayer: "OBJ_legs_04", color: "#eaf7ff", filament: "PLA-ICE-WHITE" }
    ]
  },
  {
    id: "sonya-blade",
    code: "CP-013",
    name: "Sonya Blade",
    short: "Sonya",
    poster: "SONYA",
    rarity: "Rare",
    rarityClass: "rare",
    category: "STL Bundle",
    status: "Portfolio sample",
    digitalPrice: 5,
    sizePrices: { 15: 34, 30: 62, 40: 96 },
    creditValue: 230,
    loyaltyGain: 30,
    palette: ["#f4c59b", "#73d45d", "#1d2b20", "#eef5e8"],
    glow: "#7df05a",
    line: "Compact heroic silhouette with multipart print clarity.",
    printNote: "Hair / torso / lower body / boots are ready for color decisions.",
    parts: [
      { name: "Hair", sublayer: "OBJ_hair_01", color: "#f4c59b", filament: "PLA-SAND-02" },
      { name: "Torso", sublayer: "OBJ_torso_02", color: "#73d45d", filament: "PLA-GREEN-05" },
      { name: "Legs", sublayer: "OBJ_legs_03", color: "#1d2b20", filament: "PLA-DARK-GREEN" },
      { name: "Boots", sublayer: "OBJ_boots_04", color: "#eef5e8", filament: "PLA-OFFWHITE" }
    ]
  },
  {
    id: "raiden-vault",
    code: "CP-021",
    name: "Raiden Vault Figure",
    short: "Raiden",
    poster: "RAIDEN",
    rarity: "Legendary",
    rarityClass: "legendary",
    category: "Private Drop",
    status: "Rare unlock enabled",
    digitalPrice: 5,
    sizePrices: { 15: 49, 30: 89, 40: 139 },
    creditValue: 700,
    loyaltyGain: 60,
    palette: ["#f6f8ff", "#73ecff", "#29354f", "#d4bc70"],
    glow: "#81efff",
    line: "Premium vault figure reserved for special drops and loyalty moments.",
    printNote: "Hat / head / torso / lower body / base listed from the 3MF preparation plan.",
    parts: [
      { name: "Hat", sublayer: "OBJ_hat_01", color: "#f6f8ff", filament: "PLA-WHITE-02" },
      { name: "Head", sublayer: "OBJ_head_02", color: "#73ecff", filament: "PLA-AQUA-04" },
      { name: "Body", sublayer: "OBJ_body_03", color: "#29354f", filament: "PLA-NAVY-04" },
      { name: "Trim", sublayer: "OBJ_trim_04", color: "#d4bc70", filament: "PLA-GOLD-01" }
    ]
  },
  {
    id: "shadow-founder",
    code: "CP-X01",
    name: "Founder Shadow Model",
    short: "Founder",
    poster: "FOUNDER",
    rarity: "Founder",
    rarityClass: "founder",
    category: "Not publicly sold",
    status: "Exclusive unlock",
    digitalPrice: 5,
    sizePrices: { 15: 69, 30: 149, 40: 229 },
    creditValue: 1500,
    loyaltyGain: 90,
    palette: ["#1a1d24", "#2a3448", "#7bdcff", "#ffd97a"],
    glow: "#ffd56d",
    line: "Symbolic high-value character for rare collection moments.",
    printNote: "The visual slot exists now; production data will be attached later.",
    parts: [
      { name: "Head", sublayer: "OBJ_head_01", color: "#1a1d24", filament: "PLA-MATTE-BLACK" },
      { name: "Body", sublayer: "OBJ_body_02", color: "#2a3448", filament: "PLA-GRAPHITE" },
      { name: "Energy Core", sublayer: "OBJ_core_03", color: "#7bdcff", filament: "PLA-CYAN-NEON" },
      { name: "Base", sublayer: "OBJ_base_04", color: "#ffd97a", filament: "PLA-GOLD-02" }
    ]
  }
];

const modeLabels = ["Lobby", "Profile", "3D Studio", "Loot", "Mini Game", "Rewards"];

const rewardTiers = [
  { level: 1, title: "Starter Collector", unlocks: ["Profile trophy", "Site points", "Wallpaper pack"] },
  { level: 2, title: "Print Club", unlocks: ["GIF reward", "Artwork drop", "1 wheel spin"] },
  { level: 3, title: "Vault Regular", unlocks: ["Sticker sheet", "Bonus site credit", "Profile badge"] },
  { level: 4, title: "Rare Hunter", unlocks: ["Extra wheel spins", "Early access slot", "Vault artwork"] },
  { level: 5, title: "Character Unlock", unlocks: ["Mystery character silhouette", "Founder trophy", "Special animation"] }
];

function cx(...items) {
  return items.filter(Boolean).join(" ");
}

function Button({ children, onClick, variant = "dark", className = "", disabled = false }) {
  return (
    <button className={cx("btn", `btn-${variant}`, className)} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function ProductFigure({ product, big = false, studioColors }) {
  const colors = studioColors || product.parts.map((part) => part.color);
  return (
    <div className={cx("figureWrap", big && "figureBig")} style={{ "--glow": product.glow }}>
      <div className="orbit orbitOne" />
      <div className="orbit orbitTwo" />
      <div className="shadowBlob" />
      <div className="toyFigure">
        <div className="earLeft" style={{ background: colors[0] }} />
        <div className="earRight" style={{ background: colors[0] }} />
        <div className="head" style={{ background: colors[0] }}>
          <span className="eye eyeA" />
          <span className="eye eyeB" />
          <span className="smile" />
        </div>
        <div className="body" style={{ background: colors[1] || colors[0] }} />
        <div className="arm armLeft" style={{ background: colors[2] || colors[1] }} />
        <div className="arm armRight" style={{ background: colors[2] || colors[1] }} />
        <div className="leg legLeft" style={{ background: colors[3] || colors[2] || colors[1] }} />
        <div className="leg legRight" style={{ background: colors[3] || colors[2] || colors[1] }} />
      </div>
    </div>
  );
}

function ProductRail({ products, selected, onSelect }) {
  return (
    <div className="productRail">
      {products.map((item) => (
        <button key={item.id} className={cx("railItem", selected.id === item.id && "active")} onClick={() => onSelect(item)}>
          <ProductFigure product={item} />
          <div className="railInfo">
            <span className={cx("rarity", item.rarityClass)}>{item.rarity}</span>
            <strong>{item.name}</strong>
            <small>{item.category}</small>
          </div>
        </button>
      ))}
    </div>
  );
}

function PurchasePanel({ selected, selectedSize, setSelectedSize, loyaltyXp, onPurchasePreview }) {
  const physicalPrice = selected.sizePrices[selectedSize];
  const nextXp = Math.min(100, loyaltyXp + selected.loyaltyGain);

  return (
    <aside className="purchasePanel panelGlass">
      <div className="eyebrow">Selected collectible</div>
      <h2>{selected.name}</h2>
      <p>{selected.line}</p>

      <div className="buySwitch">
        <div className="buyOption">
          <div>
            <span>GET STL</span>
            <strong>$5</strong>
          </div>
          <small>Digital product access. May be cheaper through subscription access or bulk bundle packs.</small>
          <Button variant="dark" onClick={onPurchasePreview}>Choose STL</Button>
        </div>

        <div className="buyOption physical">
          <div>
            <span>GET Physical product</span>
            <strong>${physicalPrice}</strong>
          </div>
          <div className="sizeButtons" aria-label="Physical size options">
            {[15, 30, 40].map((size) => (
              <button key={size} className={selectedSize === size ? "active" : ""} onClick={() => setSelectedSize(size)}>
                {size} cm
              </button>
            ))}
          </div>
          <small>Made-to-order physical print. Size changes price, packaging, and print preparation.</small>
          <Button variant="gold" onClick={onPurchasePreview}>Choose physical</Button>
        </div>
      </div>

      <div className="checkoutLoyalty">
        <div className="loyaltyHead">
          <span>Loyalty after this purchase</span>
          <b>+{selected.loyaltyGain} XP</b>
        </div>
        <div className="progress"><span style={{ width: `${nextXp}%` }} /></div>
        <div className="loyaltyUnlocks">
          <span>Activates: profile trophy</span>
          <span>site points</span>
          <span>wheel progress</span>
        </div>
      </div>

      <div className="partSummary">
        {selected.parts.map((part) => (
          <span key={part.name}>{part.name}</span>
        ))}
      </div>
    </aside>
  );
}

function Lobby({ selected, setSelected, selectedSize, setSelectedSize, loyaltyXp, onPurchasePreview, onOpenStudio }) {
  return (
    <section className="lobbyLayout">
      <div className="posterWord" aria-hidden="true">{selected.poster}</div>

      <div className="leftDeck panelGlass">
        <div className="eyebrow">Season 00</div>
        <h1>CyberPop Drop Room</h1>
        <p>Pick a collectible, inspect the print plan, choose STL or physical, then move it into the studio for color planning.</p>
        <div className="quickStats">
          <div><b>{selected.rarity}</b><span>Rarity</span></div>
          <div><b>{selected.creditValue}</b><span>Credit value</span></div>
          <div><b>{selected.parts.length}</b><span>Parts</span></div>
        </div>
        <Button variant="light" onClick={onOpenStudio}>Open in 3D Studio</Button>
      </div>

      <main className="centerStage panelGlass">
        <div className="stageTopline">
          <span>{selected.code}</span>
          <b className={cx("rarity", selected.rarityClass)}>{selected.rarity}</b>
        </div>
        <ProductFigure product={selected} big />
        <div className="stageCaption">
          <strong>{selected.name}</strong>
          <span>{selected.printNote}</span>
        </div>
        <ProductRail products={products} selected={selected} onSelect={setSelected} />
      </main>

      <PurchasePanel
        selected={selected}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        loyaltyXp={loyaltyXp}
        onPurchasePreview={onPurchasePreview}
      />
    </section>
  );
}

function Profile({ profile, setProfile, ownedIds, setOwnedIds, selected, setSelected, setMode }) {
  const owned = products.filter((item) => ownedIds.includes(item.id));
  const [card, setCard] = useState(selected);

  return (
    <section className="profileGrid pagePanel">
      <div className="profileCreate panelGlass">
        <div className="eyebrow">Profile setup</div>
        <h2>Create collector profile</h2>
        <label>Display name<input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Your collector name" /></label>
        <label>Printer setup<input value={profile.printer} onChange={(e) => setProfile({ ...profile, printer: e.target.value })} placeholder="Bambu A1 / P1S / X1C..." /></label>
        <label>Favorite filament<input value={profile.filament} onChange={(e) => setProfile({ ...profile, filament: e.target.value })} placeholder="PLA Matte Black, PLA-CYAN-04..." /></label>
        <div className="profileCardMini">
          <div className="avatar">CP</div>
          <div><b>{profile.name || "New Collector"}</b><span>{profile.printer || "Printer setup not set"}</span></div>
        </div>
      </div>

      <div className="inventory panelGlass">
        <div className="sectionHead">
          <div><div className="eyebrow">Symbolic inventory</div><h2>Character shelf</h2></div>
          <button className="textButton" onClick={() => setOwnedIds(products.map((p) => p.id))}>Demo unlock all</button>
        </div>
        <div className="inventoryGrid">
          {products.map((item) => {
            const owned = ownedIds.includes(item.id);
            return (
              <button key={item.id} className={cx("inventoryTile", owned ? "owned" : "locked")} onClick={() => { setCard(item); setSelected(item); }}>
                <ProductFigure product={item} />
                <span className={cx("rarity", item.rarityClass)}>{item.rarity}</span>
                <strong>{item.name}</strong>
                <small>{owned ? "Owned" : "Locked"}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div className="characterCard panelGlass">
        <div className="cardVisual"><ProductFigure product={card} big /></div>
        <span className={cx("rarity", card.rarityClass)}>{card.rarity}</span>
        <h2>{card.name}</h2>
        <p>{card.line}</p>
        <div className="partSummary">{card.parts.map((part) => <span key={part.name}>{part.name}</span>)}</div>
        <Button variant="dark" onClick={() => { setSelected(card); setMode("3D Studio"); }}>Open in 3D Studio</Button>
      </div>
    </section>
  );
}

function Studio({ selected }) {
  const [partColors, setPartColors] = useState(selected.parts.map((part) => part.color));
  const [filaments, setFilaments] = useState(selected.parts.map((part) => part.filament));

  function setPartColor(index, value) {
    const copy = [...partColors];
    copy[index] = value;
    setPartColors(copy);
  }

  function setFilament(index, value) {
    const copy = [...filaments];
    copy[index] = value;
    setFilaments(copy);
  }

  return (
    <section className="studioLayout pagePanel">
      <div className="studioStage panelGlass">
        <div className="eyebrow">3D Studio</div>
        <h2>{selected.name}</h2>
        <p>3MF package loaded. Edit the visible print palette and match every detected part with your own filament code.</p>
        <ProductFigure product={selected} big studioColors={partColors} />
      </div>

      <div className="sublayerPanel panelGlass">
        <div className="sectionHead">
          <div><div className="eyebrow">Bambu 3MF readout</div><h2>Detected parts</h2></div>
          <span className="loadedBadge">3MF loaded</span>
        </div>
        <div className="partsEditor">
          {selected.parts.map((part, index) => (
            <div className="partEditor" key={part.name}>
              <div className="partColor" style={{ background: partColors[index] }} />
              <div className="partMeta">
                <b>{part.name}</b>
                <span>{part.sublayer}</span>
              </div>
              <label>Color<input type="color" value={partColors[index]} onChange={(e) => setPartColor(index, e.target.value)} /></label>
              <label>Enter your filament code<input value={filaments[index]} onChange={(e) => setFilament(index, e.target.value)} /></label>
            </div>
          ))}
        </div>
        <div className="studioNote">Parser is a UI prototype for now. The real version will read object names, sublayers, plates, and filament assignments from the uploaded/prepared 3MF package.</div>
      </div>
    </section>
  );
}

function Loot({ siteCredit, setSiteCredit, setSelected, ownedIds, setOwnedIds, triggerRare }) {
  const [spinning, setSpinning] = useState(false);
  const [spinIndex, setSpinIndex] = useState(0);
  const [result, setResult] = useState(null);
  const cost = 50;

  function runSpin() {
    if (spinning || siteCredit < cost) return;
    setSpinning(true);
    setResult(null);
    setSiteCredit((value) => value - cost);
    const finalIndex = Math.floor(Math.random() * products.length);
    let step = 0;
    const totalSteps = 26 + finalIndex;

    function tick() {
      const next = step % products.length;
      setSpinIndex(next);
      step += 1;
      if (step <= totalSteps) {
        const delay = 40 + step * 13;
        window.setTimeout(tick, delay);
      } else {
        const won = products[finalIndex];
        setSpinIndex(finalIndex);
        setResult(won);
        setSelected(won);
        setOwnedIds((ids) => ids.includes(won.id) ? ids : [...ids, won.id]);
        setSpinning(false);
        if (["Legendary", "Founder"].includes(won.rarity)) {
          triggerRare(won);
        }
      }
    }
    tick();
  }

  const current = result || products[spinIndex];

  return (
    <section className="lootLayout pagePanel">
      <div className="lootMachine panelGlass">
        <div className="eyebrow">Loot crystal</div>
        <h2>Spend site credit (units)</h2>
        <p>Use earned site credit to run the crystal. It previews characters, slows down, and lands on one collectible unlock.</p>

        <div className={cx("crystalStage", spinning && "spinning")}>
          <div className="crystalAura" />
          <div className="glowCrystal" />
          <div className="crystalBeam" />
        </div>

        <div className="spinControls">
          <div><b>{siteCredit}</b><span>available units</span></div>
          <Button variant="gold" onClick={runSpin} disabled={spinning || siteCredit < cost}>{spinning ? "Rolling..." : `Spend ${cost} units`}</Button>
        </div>
      </div>

      <div className="previewPanel panelGlass">
        <div className="sectionHead"><div><div className="eyebrow">Character preview</div><h2>{current.name}</h2></div><span className={cx("rarity", current.rarityClass)}>{current.rarity}</span></div>
        <div className="previewWinner"><ProductFigure product={current} big /></div>
        <div className="lootRail">
          {products.map((item, index) => (
            <div key={item.id} className={cx("lootThumb", index === spinIndex && "active")}> <ProductFigure product={item} /> <span>{item.short}</span></div>
          ))}
        </div>
        {result && <div className="resultStrip"><b>{result.name}</b><span>added to symbolic inventory</span></div>}
      </div>
    </section>
  );
}

function MiniGame() {
  return (
    <section className="pagePanel gamesPanel">
      {["Piñata Boss", "Print Runner", "Crystal Forge"].map((title, index) => (
        <div className="gameCard panelGlass" key={title}>
          <div className="gameIcon">{index === 0 ? "✦" : index === 1 ? "›" : "◆"}</div>
          <h2>{title}</h2>
          <p>{index === 0 ? "Break a shelf boss for site points and wheel progress." : index === 1 ? "A simple movement mini game for seasonal rewards." : "Craft reward shards into cosmetics, trophies, and bonus unlocks."}</p>
          <Button variant="light">Prototype slot</Button>
        </div>
      ))}
    </section>
  );
}

function Rewards({ loyaltyXp }) {
  return (
    <section className="pagePanel rewardsPanel">
      <div className="rewardIntro panelGlass">
        <div className="eyebrow">Loyalty path</div>
        <h2>Rewards should keep the profile alive between drops.</h2>
        <p>Wallpapers, GIFs, artwork, stickers, profile trophies, site points, wheel spins, and future character unlocks can all live here.</p>
        <div className="progress big"><span style={{ width: `${loyaltyXp}%` }} /></div>
      </div>
      <div className="tierGrid">
        {rewardTiers.map((tier) => (
          <div className={cx("tierCard", tier.level === 5 && "mysteryTier", "panelGlass")} key={tier.level}>
            {tier.level === 5 && <div className="mysterySilhouette"><ProductFigure product={products[5]} big /></div>}
            <span>Level {tier.level}</span>
            <h3>{tier.title}</h3>
            <ul>{tier.unlocks.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function RareUnlock({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="rareOverlay" onClick={onClose}>
      <div className="rarePortal">
        <div className="burstRing ringA" />
        <div className="burstRing ringB" />
        <div className="burstRing ringC" />
        <ProductFigure product={item} big />
        <div className="rareLabel"><span className={cx("rarity", item.rarityClass)}>{item.rarity}</span><b>{item.name}</b></div>
      </div>
    </div>
  );
}

export default function CyberPopShop() {
  const [mode, setMode] = useState("Lobby");
  const [selected, setSelected] = useState(products[0]);
  const [selectedSize, setSelectedSize] = useState(30);
  const [siteCredit, setSiteCredit] = useState(260);
  const [loyaltyXp, setLoyaltyXp] = useState(42);
  const [ownedIds, setOwnedIds] = useState(["sagat-corporate", "cammy-sf6"]);
  const [rareItem, setRareItem] = useState(null);
  const [profile, setProfile] = useState({ name: "", printer: "", filament: "" });

  const cartCount = useMemo(() => ownedIds.length, [ownedIds]);

  function purchasePreview() {
    setLoyaltyXp((value) => Math.min(100, value + selected.loyaltyGain));
    setSiteCredit((value) => value + 25);
    setOwnedIds((ids) => ids.includes(selected.id) ? ids : [...ids, selected.id]);
    if (["Legendary", "Founder"].includes(selected.rarity)) setRareItem(selected);
  }

  return (
    <div className="appShell">
      <header className="topbar">
        <div className="brandMark">CP</div>
        <div className="brandText"><strong>CyberPop</strong><span>Playable Shop Alpha</span></div>
        <nav className="navModes">
          {modeLabels.map((label) => <button key={label} className={mode === label ? "active" : ""} onClick={() => setMode(label)}>{label}</button>)}
        </nav>
        <div className="topStats"><div className="coin">✦ {siteCredit}</div><div className="cartPill">Inventory {cartCount}</div></div>
      </header>

      {mode === "Lobby" && <Lobby selected={selected} setSelected={setSelected} selectedSize={selectedSize} setSelectedSize={setSelectedSize} loyaltyXp={loyaltyXp} onPurchasePreview={purchasePreview} onOpenStudio={() => setMode("3D Studio")} />}
      {mode === "Profile" && <Profile profile={profile} setProfile={setProfile} ownedIds={ownedIds} setOwnedIds={setOwnedIds} selected={selected} setSelected={setSelected} setMode={setMode} />}
      {mode === "3D Studio" && <Studio selected={selected} />}
      {mode === "Loot" && <Loot siteCredit={siteCredit} setSiteCredit={setSiteCredit} setSelected={setSelected} ownedIds={ownedIds} setOwnedIds={setOwnedIds} triggerRare={setRareItem} />}
      {mode === "Mini Game" && <MiniGame />}
      {mode === "Rewards" && <Rewards loyaltyXp={loyaltyXp} />}

      <RareUnlock item={rareItem} onClose={() => setRareItem(null)} />
    </div>
  );
}
