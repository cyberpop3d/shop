"use client";

import { useMemo, useState } from "react";

const characters = [
  {
    id: "skyline-punch",
    code: "CP-001",
    name: "Skyline Punch Hero",
    short: "Skyline",
    rarity: "Epic",
    rarityClass: "epic",
    type: "Physical Print",
    price: 69,
    popbits: 260,
    poster: "SKYLINE",
    subtitle: "Street-scale hero figure",
    description:
      "A bold collectible figure prepared for multipart FDM planning, display shelves, and future physical order data.",
    print: "30 cm display figure · multipart FDM layout · 4 color regions",
    palette: ["#35b9ff", "#0b75b7", "#10151d", "#f4f8fb"],
    glow: "blue",
    parts: [
      { key: "Head", color: "#35b9ff", filament: "PLA-CYAN-01" },
      { key: "Torso", color: "#0b75b7", filament: "PLA-BLUE-07" },
      { key: "Legs", color: "#10151d", filament: "PLA-BLACK-02" },
      { key: "Base", color: "#dfeaf1", filament: "PLA-WHITE-04" }
    ],
    inventoryNote: "Unlocked from Starter Drop",
    sceneTags: ["Shelf Ready", "Color Blocks", "Physical Order"]
  },
  {
    id: "beach-rabbit",
    code: "CP-017",
    name: "Beach Power Rabbit",
    short: "Beach",
    rarity: "Legendary",
    rarityClass: "legendary",
    type: "Premium STL Bundle",
    price: 78,
    popbits: 520,
    poster: "BEACH",
    subtitle: "Sport collectible figure",
    description:
      "A summer-themed character drop with clean part separation, strong silhouette, and accessory-friendly studio planning.",
    print: "STL + 3MF bundle · head/body/ears/base · printable color plan",
    palette: ["#ff89c7", "#f7c7d9", "#fff1b4", "#6b49ff"],
    glow: "pink",
    parts: [
      { key: "Head", color: "#f7c7d9", filament: "PLA-PINK-02" },
      { key: "Ears", color: "#ff89c7", filament: "PLA-ROSE-08" },
      { key: "Body", color: "#6b49ff", filament: "PLA-VIOLET-03" },
      { key: "Stand", color: "#fff1b4", filament: "PLA-SAND-01" }
    ],
    inventoryNote: "Rare animation enabled",
    sceneTags: ["Legendary", "Beach Drop", "Studio Ready"]
  },
  {
    id: "storm-hat",
    code: "CP-021",
    name: "Storm Hat Warrior",
    short: "Storm",
    rarity: "Rare",
    rarityClass: "rare",
    type: "Physical + STL",
    price: 82,
    popbits: 410,
    poster: "STORM",
    subtitle: "Arcade shelf warrior",
    description:
      "A dramatic display character built around large readable parts, bold color zones, and simple production notes.",
    print: "28 cm figure · hat/head/body/base · low-detail FDM safe parts",
    palette: ["#6df5ff", "#1c96d1", "#1b2536", "#f6f7ff"],
    glow: "cyan",
    parts: [
      { key: "Hat", color: "#f6f7ff", filament: "PLA-WHITE-01" },
      { key: "Head", color: "#6df5ff", filament: "PLA-AQUA-04" },
      { key: "Body", color: "#1c96d1", filament: "PLA-CYAN-09" },
      { key: "Base", color: "#1b2536", filament: "PLA-NAVY-05" }
    ],
    inventoryNote: "Vault reward compatible",
    sceneTags: ["Rare", "Arcade", "Multipart"]
  },
  {
    id: "shelf-titan",
    code: "CP-044",
    name: "Collector Shelf Titan",
    short: "Titan",
    rarity: "Founder",
    rarityClass: "founder",
    type: "Private Collector Model",
    price: 149,
    popbits: 1200,
    poster: "TITAN",
    subtitle: "Private premium model",
    description:
      "A symbolic high-value inventory item for models that are not sold publicly and should feel special when obtained.",
    print: "Private model · premium print preparation · collection badge reward",
    palette: ["#ffbd43", "#f47b0b", "#5a3708", "#fff1d1"],
    glow: "gold",
    parts: [
      { key: "Head", color: "#ffbd43", filament: "PLA-GOLD-06" },
      { key: "Torso", color: "#f47b0b", filament: "PLA-ORANGE-11" },
      { key: "Legs", color: "#5a3708", filament: "PLA-BRONZE-02" },
      { key: "Display Base", color: "#fff1d1", filament: "PLA-CREAM-01" }
    ],
    inventoryNote: "Founder rarity animation",
    sceneTags: ["Founder", "Not Public", "Rare Unlock"]
  }
];

const gameTabs = [
  {
    id: "pinata",
    title: "Piñata Boss",
    status: "Reward Run",
    text: "Break a simple shelf boss, earn PopBits, and unlock transparent shop rewards."
  },
  {
    id: "runner",
    title: "Print Runner",
    status: "Prototype",
    text: "Move through a stylized print lab route, collect shards, and reveal future drop teasers."
  },
  {
    id: "forge",
    title: "Crystal Forge",
    status: "Collection Loop",
    text: "Turn earned shards into badges, accessory coupons, or seasonal collection progress."
  }
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Button({ children, onClick, variant = "dark", className = "", disabled = false }) {
  return (
    <button className={cx("btn", `btn-${variant}`, className)} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function RarityBadge({ rarity, className = "" }) {
  const rarityClass = rarity.toLowerCase();
  return <span className={cx("rarity", rarityClass, className)}>{rarity}</span>;
}

function Header({ mode, setMode, popbits, cartCount }) {
  const nav = ["Lobby", "Drops", "Profile", "Studio", "Loot", "Mini Game", "Rewards"];
  return (
    <header className="topbar">
      <div className="brandMark">CP</div>
      <div className="brandText">
        <strong>CyberPop</strong>
        <span>Playable Print Shop</span>
      </div>
      <nav className="navModes" aria-label="Main interface modes">
        {nav.map((item) => (
          <button key={item} onClick={() => setMode(item)} className={mode === item ? "active" : ""}>
            {item}
          </button>
        ))}
      </nav>
      <div className="topStats">
        <span className="coin">✦ {popbits}</span>
        <span className="cartPill">Cart {cartCount}</span>
      </div>
    </header>
  );
}

function CharacterFigure({ character, large = false }) {
  const [a, b, c, d] = character.palette;
  const rabbit = character.id.includes("rabbit");
  const hat = character.id.includes("storm");
  const founder = character.rarity === "Founder";
  return (
    <div className={cx("figureWrap", large && "figureLarge", `glow-${character.glow}`)}>
      <div className="orbit orbitOne" />
      <div className="orbit orbitTwo" />
      <div className="figureShadow" />
      <div className="figureModel" style={{ "--c1": a, "--c2": b, "--c3": c, "--c4": d }}>
        {rabbit && <><i className="ear left" /><i className="ear right" /></>}
        {hat && <i className="stormHat" />}
        {founder && <i className="crown" />}
        <div className="head"><span /><span /></div>
        <div className="torso" />
        <div className="arm left" />
        <div className="arm right" />
        <div className="leg left" />
        <div className="leg right" />
      </div>
    </div>
  );
}

function CharacterRail({ selected, setSelected, setCardOpen }) {
  return (
    <div className="characterRail">
      {characters.map((char) => (
        <button
          key={char.id}
          className={cx("railItem", selected.id === char.id && "selected")}
          onClick={() => {
            setSelected(char);
            setCardOpen(true);
          }}
        >
          <CharacterFigure character={char} />
          <div>
            <strong>{char.short}</strong>
            <span>{char.rarity}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function CharacterCard({ character, onStudio, onAdd, onRare }) {
  return (
    <aside className="characterCard">
      <div className="cardTopline">
        <span>{character.code}</span>
        <RarityBadge rarity={character.rarity} />
      </div>
      <h2>{character.name}</h2>
      <p>{character.description}</p>
      <div className="printSpec">{character.print}</div>
      <div className="tagGrid">
        {character.sceneTags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <div className="cardPrice">
        <div>
          <span>Starting at</span>
          <strong>${character.price}</strong>
        </div>
        <div>
          <span>Reward value</span>
          <strong>✦ {character.popbits}</strong>
        </div>
      </div>
      <div className="cardActions">
        <Button onClick={() => onAdd(character)}>Add to Loadout</Button>
        <Button variant="light" onClick={() => onStudio(character)}>Open 3D Studio</Button>
      </div>
      {(character.rarity === "Legendary" || character.rarity === "Founder") && (
        <Button variant="gold" className="full" onClick={() => onRare(character)}>
          Preview Rare Unlock
        </Button>
      )}
    </aside>
  );
}

function Lobby({ selected, setSelected, setMode, setCart, setRareAnimation, setCardOpen }) {
  return (
    <section className="lobbyScene">
      <div className="posterLayer">
        <span>{selected.poster}</span>
        <span>{selected.poster}</span>
      </div>
      <div className="leftPanel panelGlass">
        <span className="eyebrow">Season 00</span>
        <h1>Drop Lobby</h1>
        <p>Pick a collectible, inspect its print plan, then send it to the studio or loadout.</p>
        <div className="missionStack">
          <div><b>Daily Check-in</b><span>+20 PopBits</span></div>
          <div><b>Upload a Make</b><span>+80 PopBits</span></div>
          <div><b>Complete a Set</b><span>Badge reward</span></div>
        </div>
      </div>

      <div className="stage panelGlass">
        <div className="stageHeader">
          <span>{selected.type}</span>
          <RarityBadge rarity={selected.rarity} />
        </div>
        <CharacterFigure character={selected} large />
        <div className="stageFooter">
          <div>
            <span>{selected.subtitle}</span>
            <strong>{selected.name}</strong>
          </div>
          <Button onClick={() => setMode("Studio")}>Studio</Button>
        </div>
      </div>

      <CharacterCard
        character={selected}
        onStudio={(character) => {
          setSelected(character);
          setMode("Studio");
        }}
        onAdd={(character) => setCart((prev) => [...prev, character])}
        onRare={(character) => setRareAnimation(character)}
      />

      <CharacterRail selected={selected} setSelected={setSelected} setCardOpen={setCardOpen} />
    </section>
  );
}

function Drops({ selected, setSelected, setCart, setMode }) {
  return (
    <section className="modeShell">
      <div className="modeIntro compact">
        <span className="eyebrow">Drop Board</span>
        <h1>Selectable character drops</h1>
        <p>Every drop stays tied to the model preview, rarity, print format, and studio color planning.</p>
      </div>
      <div className="dropBoard">
        <div className="dropStage panelGlass">
          <div className="posterMini">{selected.poster}</div>
          <CharacterFigure character={selected} large />
        </div>
        <CharacterCard
          character={selected}
          onStudio={(character) => {
            setSelected(character);
            setMode("Studio");
          }}
          onAdd={(character) => setCart((prev) => [...prev, character])}
          onRare={() => {}}
        />
      </div>
      <div className="dropGrid">
        {characters.map((char) => (
          <button key={char.id} className={cx("dropTile", selected.id === char.id && "selected")} onClick={() => setSelected(char)}>
            <CharacterFigure character={char} />
            <span>{char.code}</span>
            <strong>{char.name}</strong>
            <RarityBadge rarity={char.rarity} />
          </button>
        ))}
      </div>
    </section>
  );
}

function Profile({ profile, setProfile, selected, setSelected, setMode, setRareAnimation, setCart }) {
  return (
    <section className="modeShell profileGrid">
      <div className="profileCreate panelGlass">
        <span className="eyebrow">Collector Profile</span>
        <h1>Create your profile</h1>
        <label>Display name<input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Collector name" /></label>
        <label>Collector title<input value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} placeholder="Shelf Architect" /></label>
        <label>Printer setup<input value={profile.printer} onChange={(e) => setProfile({ ...profile, printer: e.target.value })} placeholder="Bambu Lab P1S, AMS, etc." /></label>
        <label>Favorite filament<input value={profile.filament} onChange={(e) => setProfile({ ...profile, filament: e.target.value })} placeholder="PLA Matte Cyan" /></label>
      </div>

      <div className="inventory panelGlass">
        <div className="inventoryHeader">
          <div>
            <span className="eyebrow">Symbolic Inventory</span>
            <h2>{profile.name || "New Collector"}</h2>
            <p>{profile.title || "Collector title not set"}</p>
          </div>
          <div className="profileBadge">{characters.length} Items</div>
        </div>
        <div className="inventoryGrid">
          {characters.map((char) => (
            <button key={char.id} className={cx("inventoryItem", selected.id === char.id && "selected")} onClick={() => setSelected(char)}>
              <CharacterFigure character={char} />
              <strong>{char.name}</strong>
              <RarityBadge rarity={char.rarity} />
              <span>{char.inventoryNote}</span>
            </button>
          ))}
        </div>
      </div>

      <CharacterCard
        character={selected}
        onStudio={(character) => {
          setSelected(character);
          setMode("Studio");
        }}
        onAdd={(character) => setCart((prev) => [...prev, character])}
        onRare={(character) => setRareAnimation(character)}
      />
    </section>
  );
}

function Studio({ selected, setSelected }) {
  const [partState, setPartState] = useState(() => Object.fromEntries(characters.map((c) => [c.id, c.parts])));
  const parts = partState[selected.id] || selected.parts;

  function updatePart(index, patch) {
    setPartState((prev) => {
      const current = prev[selected.id] || selected.parts;
      const next = current.map((part, i) => (i === index ? { ...part, ...patch } : part));
      return { ...prev, [selected.id]: next };
    });
  }

  return (
    <section className="modeShell studioGrid">
      <div className="studioStage panelGlass">
        <span className="eyebrow">3D Studio Prototype</span>
        <h1>{selected.name}</h1>
        <p>Plan color regions for multipart FDM printing and match each part to a filament code before production.</p>
        <div className="studioPreview">
          <CharacterFigure character={{ ...selected, parts, palette: parts.map((p) => p.color).concat(selected.palette).slice(0, 4) }} large />
        </div>
      </div>

      <div className="partEditor panelGlass">
        <div className="editorHeader">
          <div>
            <span className="eyebrow">Part Color Mapping</span>
            <h2>Printable palette</h2>
          </div>
          <select value={selected.id} onChange={(e) => setSelected(characters.find((c) => c.id === e.target.value))}>
            {characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="partList">
          {parts.map((part, index) => (
            <div className="partRow" key={`${part.key}-${index}`}>
              <div className="colorSwatch" style={{ background: part.color }} />
              <div>
                <strong>{part.key}</strong>
                <span>Detected layer placeholder</span>
              </div>
              <input type="color" value={part.color} onChange={(e) => updatePart(index, { color: e.target.value })} aria-label={`${part.key} color`} />
              <input value={part.filament} onChange={(e) => updatePart(index, { filament: e.target.value })} placeholder="Enter your filament code" />
            </div>
          ))}
        </div>
        <div className="threeMfBox">
          <strong>3MF sublayer parser placeholder</strong>
          <p>Later this area should read Bambu Studio 3MF structure, detect object or sublayer names, and map them to editable color regions.</p>
          <button>Drop .3mf file here</button>
        </div>
      </div>
    </section>
  );
}

function Loot({ popbits, setPopbits, setRareAnimation, selected }) {
  const [opened, setOpened] = useState(false);
  function openVault() {
    setOpened(true);
    setPopbits((v) => v + 75);
    if (selected.rarity === "Legendary" || selected.rarity === "Founder") setRareAnimation(selected);
  }
  return (
    <section className="modeShell lootGrid">
      <div className="vault panelGlass">
        <span className="eyebrow">Earned Loot System</span>
        <h1>Crystal Vault</h1>
        <p>Reward loops should be earned through activity, makes, collections, and events. The final rules can be tuned later.</p>
        <div className={cx("crystal", opened && "opened")}>✦</div>
        <Button variant="gold" onClick={openVault}>{opened ? "Open Again" : "Open Earned Crystal"}</Button>
      </div>
      <div className="lootRules panelGlass">
        <h2>Foundation Rules</h2>
        <div><b>No paid mystery pressure</b><span>Rewards are tied to loyalty and activity.</span></div>
        <div><b>Rare animation moments</b><span>Founder and Legendary items can trigger special unlock sequences.</span></div>
        <div><b>Inventory first</b><span>Unlocked items should appear in the profile inventory immediately.</span></div>
        <div><b>Current balance</b><span>✦ {popbits} PopBits</span></div>
      </div>
    </section>
  );
}

function MiniGame({ popbits, setPopbits }) {
  const [active, setActive] = useState(gameTabs[0]);
  const [hits, setHits] = useState(0);
  return (
    <section className="modeShell miniGameGrid">
      <div className="gamePanel panelGlass">
        <span className="eyebrow">Mini Game Module</span>
        <h1>{active.title}</h1>
        <p>{active.text}</p>
        <div className="gameTabs">
          {gameTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActive(tab)} className={active.id === tab.id ? "active" : ""}>
              <strong>{tab.title}</strong><span>{tab.status}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="bossArena panelGlass">
        <div className="bossPoster">{active.id === "pinata" ? "BOSS" : active.id === "runner" ? "RUN" : "FORGE"}</div>
        <button className="bossButton" onClick={() => { setHits((h) => h + 1); setPopbits((v) => v + 10); }}>
          <span>{active.id === "pinata" ? "🪅" : active.id === "runner" ? "🏃" : "💎"}</span>
        </button>
        <div className="arenaStats"><b>{hits}</b><span>actions completed · +10 PopBits each</span></div>
      </div>
    </section>
  );
}

function Rewards({ popbits, profile }) {
  const progress = Math.min(100, Math.round((popbits / 1200) * 100));
  return (
    <section className="modeShell rewardsGrid">
      <div className="rewardHero panelGlass">
        <span className="eyebrow">Loyalty System</span>
        <h1>Collector Rewards</h1>
        <p>Daily check-ins, makes gallery uploads, collection completion, and mini games can feed a transparent PopBits ledger.</p>
        <div className="progressTrack"><span style={{ width: `${progress}%` }} /></div>
        <strong>{progress}% toward Founder Track</strong>
      </div>
      <div className="rewardCards">
        <div className="panelGlass"><b>Daily Login</b><span>+20 PopBits</span></div>
        <div className="panelGlass"><b>Upload a Make</b><span>+80 PopBits</span></div>
        <div className="panelGlass"><b>Complete a Drop</b><span>Badge + vault key</span></div>
        <div className="panelGlass"><b>{profile.name || "Collector"}</b><span>Printer: {profile.printer || "Not set"}</span></div>
      </div>
    </section>
  );
}

function RareAnimation({ character, onClose }) {
  if (!character) return null;
  return (
    <div className="rareOverlay" onClick={onClose}>
      <div className={cx("rareBox", character.rarityClass)} onClick={(e) => e.stopPropagation()}>
        <div className="rareBurst">✦</div>
        <span>{character.rarity} Unlock</span>
        <h1>{character.name}</h1>
        <p>{character.inventoryNote}</p>
        <CharacterFigure character={character} />
        <Button variant="light" onClick={onClose}>Continue</Button>
      </div>
    </div>
  );
}

export default function CyberPopShop() {
  const [mode, setMode] = useState("Lobby");
  const [selected, setSelected] = useState(characters[0]);
  const [cart, setCart] = useState([]);
  const [popbits, setPopbits] = useState(260);
  const [profile, setProfile] = useState({ name: "", title: "", printer: "", filament: "" });
  const [rareAnimation, setRareAnimation] = useState(null);
  const [, setCardOpen] = useState(true);

  const modeView = useMemo(() => {
    if (mode === "Lobby") return <Lobby selected={selected} setSelected={setSelected} setMode={setMode} setCart={setCart} setRareAnimation={setRareAnimation} setCardOpen={setCardOpen} />;
    if (mode === "Drops") return <Drops selected={selected} setSelected={setSelected} setCart={setCart} setMode={setMode} />;
    if (mode === "Profile") return <Profile profile={profile} setProfile={setProfile} selected={selected} setSelected={setSelected} setMode={setMode} setRareAnimation={setRareAnimation} setCart={setCart} />;
    if (mode === "Studio") return <Studio selected={selected} setSelected={setSelected} />;
    if (mode === "Loot") return <Loot popbits={popbits} setPopbits={setPopbits} setRareAnimation={setRareAnimation} selected={selected} />;
    if (mode === "Mini Game") return <MiniGame popbits={popbits} setPopbits={setPopbits} />;
    return <Rewards popbits={popbits} profile={profile} />;
  }, [mode, selected, profile, popbits]);

  return (
    <main>
      <Header mode={mode} setMode={setMode} popbits={popbits} cartCount={cart.length} />
      {modeView}
      <RareAnimation character={rareAnimation} onClose={() => setRareAnimation(null)} />
    </main>
  );
}
