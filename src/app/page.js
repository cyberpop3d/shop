'use client';

import { useMemo, useState } from 'react';

const rarityRank = {
  Common: 1,
  Rare: 2,
  Epic: 3,
  Legendary: 4,
  Mythic: 5,
  Founder: 6
};

const rarityCopy = {
  Common: 'Core catalog figure',
  Rare: 'Limited reward model',
  Epic: 'Seasonal collectible',
  Legendary: 'Premium archive piece',
  Mythic: 'Never sold directly',
  Founder: 'Ultra early supporter item'
};

const characters = [
  {
    id: 'skyline-hero',
    name: 'Skyline Print Hero',
    codename: 'SKYLINE',
    line: 'Drop 01 / Starter Hero',
    rarity: 'Common',
    owned: true,
    price: 69,
    height: '30 cm display print',
    format: 'STL + physical print ready',
    slogan: 'Clean cuts. Big shapes. Shelf energy.',
    palette: ['#83d8ff', '#075a83', '#f4fbff', '#082235'],
    pieces: ['Head', 'Torso', 'Arms', 'Legs', 'Sneakers', 'Base'],
    poster: 'A bold entry figure built around clean FDM color blocks and a friendly game-lobby silhouette.',
    filament: ['Bambu PLA Matte Sky Blue', 'Bambu PLA Basic Blue', 'Bambu PLA Matte White', 'PLA Black'],
    studioNote: 'Starter multipart palette with simple separated volumes.'
  },
  {
    id: 'beach-athlete',
    name: 'Beach Sprint Bunny',
    codename: 'BEACH',
    line: 'Summer Power Series',
    rarity: 'Rare',
    owned: true,
    price: 74,
    height: '28 cm multipart FDM print',
    format: '3MF color planning target',
    slogan: 'Sporty, sunny, chunky, printable.',
    palette: ['#ffb3d9', '#8c5cff', '#fff2c7', '#3a255f'],
    pieces: ['Head', 'Ears', 'Torso', 'Shorts', 'Legs', 'Sandals'],
    poster: 'A playful athletic collectible with separated color regions and no fragile string details.',
    filament: ['PLA Pink', 'PLA Purple', 'PLA Cream', 'PLA Deep Violet'],
    studioNote: 'Good test figure for skin / costume / accessory material matching.'
  },
  {
    id: 'storm-warrior',
    name: 'Storm Hat Warrior',
    codename: 'STORM',
    line: 'Arcade Legends Archive',
    rarity: 'Epic',
    owned: true,
    price: 79,
    height: '31 cm physical display print',
    format: 'STL pack + future 3MF',
    slogan: 'Arcade drama without tiny fragile noise.',
    palette: ['#99ecff', '#0a3c63', '#ffffff', '#111827'],
    pieces: ['Hat', 'Head', 'Torso', 'Hands', 'Pants', 'Energy Base'],
    poster: 'Designed for cinematic product presentation and readable part separation.',
    filament: ['PLA Cyan', 'PLA Navy', 'PLA White', 'PLA Charcoal'],
    studioNote: 'Hat and energy base remain separate for clean printing.'
  },
  {
    id: 'vault-tiger',
    name: 'Vault Tiger Boss',
    codename: 'VAULT',
    line: 'Locked Collector Vault',
    rarity: 'Legendary',
    owned: false,
    price: 129,
    height: '32 cm premium physical print',
    format: 'Collector vault unlock',
    slogan: 'Premium suit energy for serious display shelves.',
    palette: ['#f6a623', '#101827', '#fef3c7', '#ffffff'],
    pieces: ['Head', 'Jacket', 'Torso', 'Gloves', 'Pants', 'Shoes'],
    poster: 'A higher value model that should feel like a discovered archive item rather than a normal card.',
    filament: ['PLA Orange', 'PLA Silk Navy', 'PLA Cream', 'PLA White'],
    studioNote: 'Suit and body colors need strong contrast in the studio.'
  },
  {
    id: 'crystal-founder',
    name: 'Crystal Founder Dragon',
    codename: 'FOUNDER',
    line: 'Founder Reward / Not Sold',
    rarity: 'Founder',
    owned: false,
    price: null,
    height: 'Special reward display print',
    format: 'Profile achievement unlock',
    slogan: 'A profile trophy that should feel impossible to buy.',
    palette: ['#8ef6ff', '#6d5cff', '#f4fbff', '#ffcb66'],
    pieces: ['Head', 'Horns', 'Torso', 'Wings', 'Tail', 'Crystal Base'],
    poster: 'A symbolic inventory trophy for rare moments, special events, and loyalty milestones.',
    filament: ['PLA Translucent Cyan', 'PLA Purple', 'PLA White', 'PLA Gold'],
    studioNote: 'Rare animation should trigger when this enters the inventory.'
  }
];

const miniGames = [
  {
    name: 'Piñata Boss',
    status: 'Prototype loop',
    reward: '+25 PopBits',
    description: 'Tap a chunky shelf boss, break safe reward shells, and earn transparent loyalty bonuses.'
  },
  {
    name: 'Print Runner',
    status: 'Planned',
    reward: '+Streak XP',
    description: 'A light side-scrolling run through filament gates, supports, and print beds.'
  },
  {
    name: 'Crystal Forge',
    status: 'Planned',
    reward: '+Color shards',
    description: 'Combine earned shards into cosmetic profile badges and non-paid reward crystals.'
  }
];

const tabs = ['Lobby', 'Collection', '3D Studio', 'Loot', 'Mini Games', 'Rewards'];

const defaultProfile = {
  handle: 'PrintHero',
  title: 'Starter Collector',
  favoriteFilament: 'Bambu PLA Matte Sky Blue',
  printer: 'Bambu Lab / FDM setup',
  streak: 3
};

function RarityBadge({ rarity }) {
  return <span className={`rarity rarity-${rarity.toLowerCase()}`}>{rarity}</span>;
}

function NavButton({ active, children, onClick }) {
  return (
    <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FigurePreview({ character, studioPalette }) {
  const palette = studioPalette || character.palette;
  return (
    <div className="figure-stage" style={{ '--glow': palette[0], '--deep': palette[1] }}>
      <div className="poster-word">{character.codename}</div>
      <div className="turntable">
        <div className="figure-shadow" />
        <div className="toy-figure">
          <div className="toy-head" style={{ background: palette[0] }} />
          <div className="toy-neck" style={{ background: palette[2] || palette[0] }} />
          <div className="toy-body" style={{ background: palette[1] }}>
            <div className="toy-chest" style={{ background: palette[2] || '#fff' }} />
          </div>
          <div className="toy-arm left" style={{ background: palette[1] }} />
          <div className="toy-arm right" style={{ background: palette[1] }} />
          <div className="toy-leg left" style={{ background: palette[3] || palette[1] }} />
          <div className="toy-leg right" style={{ background: palette[3] || palette[1] }} />
          <div className="toy-foot left" style={{ background: palette[2] || palette[0] }} />
          <div className="toy-foot right" style={{ background: palette[2] || palette[0] }} />
        </div>
      </div>
    </div>
  );
}

function ProfileCreator({ profile, setProfile }) {
  const [draft, setDraft] = useState(profile || defaultProfile);

  return (
    <div className="panel profile-panel">
      <div>
        <p className="eyebrow">Profile setup</p>
        <h2>Create your CyberPop profile</h2>
        <p className="soft-copy">
          This is the symbolic account layer for inventory, rewards, makes, badges, 3D Studio palettes, and future purchased libraries.
        </p>
      </div>
      <div className="profile-grid">
        <label>
          Display name
          <input value={draft.handle} onChange={(event) => setDraft({ ...draft, handle: event.target.value })} />
        </label>
        <label>
          Collector title
          <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
        </label>
        <label>
          Favorite filament
          <input value={draft.favoriteFilament} onChange={(event) => setDraft({ ...draft, favoriteFilament: event.target.value })} />
        </label>
        <label>
          Printer setup
          <input value={draft.printer} onChange={(event) => setDraft({ ...draft, printer: event.target.value })} />
        </label>
      </div>
      <button className="primary-action" onClick={() => setProfile(draft)} type="button">
        Save profile
      </button>
    </div>
  );
}

function ProfileCard({ profile, popbits, inventoryCount, onCreate }) {
  if (!profile) {
    return (
      <aside className="profile-card empty">
        <p className="eyebrow">Collector profile</p>
        <h3>No profile yet</h3>
        <p>Create a profile to activate symbolic inventory, rewards, and studio palettes.</p>
        <button className="small-action" onClick={onCreate} type="button">Create profile</button>
      </aside>
    );
  }

  return (
    <aside className="profile-card">
      <div className="avatar-orb">CP</div>
      <div>
        <p className="eyebrow">Collector profile</p>
        <h3>{profile.handle}</h3>
        <p>{profile.title}</p>
      </div>
      <div className="mini-stats">
        <Stat label="Inventory" value={inventoryCount} />
        <Stat label="PopBits" value={popbits} />
        <Stat label="Streak" value={`${profile.streak} days`} />
      </div>
      <div className="filament-chip">Favorite filament: {profile.favoriteFilament}</div>
    </aside>
  );
}

function CharacterTile({ character, selected, onClick, onUnlock }) {
  const locked = !character.owned;
  return (
    <article className={`inventory-tile ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`} onClick={onClick} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') onClick(); }}>
      <div className="tile-visual">
        <FigurePreview character={character} />
        {!character.owned && <div className="lock-mask">Locked</div>}
      </div>
      <div className="tile-info">
        <RarityBadge rarity={character.rarity} />
        <h3>{character.name}</h3>
        <p>{character.line}</p>
      </div>
      {!character.owned && rarityRank[character.rarity] >= 4 && (
        <button
          className="rare-demo-button"
          onClick={(event) => {
            event.stopPropagation();
            onUnlock(character);
          }}
          type="button"
        >
          Rare unlock demo
        </button>
      )}
    </article>
  );
}

function CharacterModal({ character, onClose, onStudio, onUnlock }) {
  if (!character) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="character-modal" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" onClick={onClose} type="button">×</button>
        <div className="modal-visual">
          <FigurePreview character={character} />
        </div>
        <div className="modal-copy">
          <div className="modal-title-row">
            <RarityBadge rarity={character.rarity} />
            <span>{rarityCopy[character.rarity]}</span>
          </div>
          <h2>{character.name}</h2>
          <p>{character.poster}</p>
          <div className="spec-grid">
            <Stat label="Height" value={character.height} />
            <Stat label="Format" value={character.format} />
            <Stat label="Parts" value={character.pieces.length} />
          </div>
          <div className="piece-list">
            {character.pieces.map((piece) => <span key={piece}>{piece}</span>)}
          </div>
          <div className="modal-actions">
            {character.owned ? (
              <button className="primary-action" onClick={onStudio} type="button">Open in 3D Studio</button>
            ) : (
              <button className="primary-action" onClick={() => onUnlock(character)} type="button">Trigger rare inventory demo</button>
            )}
            <button className="secondary-action" onClick={onClose} type="button">Close card</button>
          </div>
        </div>
      </article>
    </div>
  );
}

function RareAnimation({ character, onDone }) {
  if (!character) return null;
  return (
    <div className="rare-animation" onClick={onDone}>
      <div className="rare-burst">✦</div>
      <div className="rare-card-pop">
        <RarityBadge rarity={character.rarity} />
        <h2>{character.name}</h2>
        <p>Added to your symbolic inventory</p>
        <button className="primary-action" type="button">Continue</button>
      </div>
    </div>
  );
}

function CollectionPanel({ inventory, selectedCharacter, setSelectedCharacter, onOpenStudio, onUnlock }) {
  const ownedCount = inventory.filter((item) => item.owned).length;
  const rareCount = inventory.filter((item) => item.owned && rarityRank[item.rarity] >= 4).length;

  return (
    <section className="content-section collection-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Symbolic inventory</p>
          <h2>Your character collection</h2>
          <p className="soft-copy">Click any character to open its collectible card, rarity data, print information, and studio shortcut.</p>
        </div>
        <div className="header-stats">
          <Stat label="Owned" value={`${ownedCount}/${inventory.length}`} />
          <Stat label="Rare+" value={rareCount} />
        </div>
      </div>
      <div className="inventory-grid">
        {inventory.map((character) => (
          <CharacterTile
            key={character.id}
            character={character}
            selected={selectedCharacter?.id === character.id}
            onClick={() => setSelectedCharacter(character)}
            onUnlock={onUnlock}
          />
        ))}
      </div>
      <CharacterModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        onStudio={onOpenStudio}
        onUnlock={onUnlock}
      />
    </section>
  );
}

function StudioPanel({ character, updateCharacterPalette }) {
  const [studioCharacterId, setStudioCharacterId] = useState(character.id);
  const activeCharacter = characters.find((item) => item.id === studioCharacterId) || character;
  const [partColors, setPartColors] = useState(() => activeCharacter.pieces.map((piece, index) => ({
    piece,
    color: activeCharacter.palette[index % activeCharacter.palette.length],
    filamentCode: activeCharacter.filament[index % activeCharacter.filament.length],
    detectedLayer: `3MF sublayer ${index + 1}`
  })));

  function switchCharacter(id) {
    const next = characters.find((item) => item.id === id) || activeCharacter;
    setStudioCharacterId(id);
    setPartColors(next.pieces.map((piece, index) => ({
      piece,
      color: next.palette[index % next.palette.length],
      filamentCode: next.filament[index % next.filament.length],
      detectedLayer: `3MF sublayer ${index + 1}`
    })));
  }

  const previewPalette = partColors.map((part) => part.color);

  function updatePart(index, field, value) {
    const next = partColors.map((part, partIndex) => partIndex === index ? { ...part, [field]: value } : part);
    setPartColors(next);
    updateCharacterPalette(activeCharacter.id, next.map((part) => part.color));
  }

  return (
    <section className="content-section studio-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">3D Studio prototype</p>
          <h2>Plan the print palette before slicing</h2>
          <p className="soft-copy">
            This prototype UI simulates how multipart 3MF sublayers can become editable color zones. The real parser can be connected later.
          </p>
        </div>
        <select value={studioCharacterId} onChange={(event) => switchCharacter(event.target.value)}>
          {characters.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>

      <div className="studio-grid">
        <div className="studio-preview-card">
          <FigurePreview character={activeCharacter} studioPalette={previewPalette} />
          <div className="studio-meta">
            <RarityBadge rarity={activeCharacter.rarity} />
            <h3>{activeCharacter.name}</h3>
            <p>{activeCharacter.studioNote}</p>
          </div>
        </div>

        <div className="studio-editor-card">
          <div className="editor-topline">
            <div>
              <p className="eyebrow">Detected print parts</p>
              <h3>Color + filament mapping</h3>
            </div>
            <span className="parser-pill">3MF parser placeholder</span>
          </div>
          <div className="part-editor-list">
            {partColors.map((part, index) => (
              <div className="part-editor" key={`${part.piece}-${index}`}>
                <div className="part-color-chip" style={{ background: part.color }} />
                <div className="part-editor-main">
                  <strong>{part.piece}</strong>
                  <span>{part.detectedLayer}</span>
                </div>
                <label>
                  Color
                  <input type="color" value={part.color} onChange={(event) => updatePart(index, 'color', event.target.value)} />
                </label>
                <label className="filament-input">
                  Enter your filament code
                  <input value={part.filamentCode} onChange={(event) => updatePart(index, 'filamentCode', event.target.value)} />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="studio-import-card">
          <p className="eyebrow">3MF layer reader concept</p>
          <h3>Bambu 3MF sublayer import</h3>
          <p>
            Future version: upload a Bambu Studio 3MF, read object/sublayer names, detect separated multipart regions, then map each printable part to a real filament code.
          </p>
          <div className="dropzone">
            <strong>Drop .3mf file here</strong>
            <span>UI prototype only for now</span>
          </div>
          <div className="parser-log">
            <span>Ready to detect: part names</span>
            <span>Ready to detect: color assignments</span>
            <span>Ready to match: filament codes</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function LootPanel({ popbits, setPopbits, onRare }) {
  const [crystals, setCrystals] = useState(1);

  function openCrystal() {
    if (crystals <= 0) return;
    setCrystals((value) => value - 1);
    setPopbits((value) => value + 45);
    onRare(characters.find((item) => item.id === 'crystal-founder'));
  }

  return (
    <section className="content-section loot-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Loot foundation</p>
          <h2>Reward crystals without pay-to-gamble mechanics</h2>
          <p className="soft-copy">This is a safe foundation: earned crystals, transparent rewards, no paid mystery purchase loop.</p>
        </div>
        <Stat label="Daily crystals" value={crystals} />
      </div>
      <div className="loot-grid">
        <div className="crystal-card">
          <div className="big-crystal">◆</div>
          <h3>Daily Crystal</h3>
          <p>Open an earned crystal to trigger a rare animation demo and add symbolic PopBits.</p>
          <button className="primary-action" disabled={crystals <= 0} onClick={openCrystal} type="button">Open earned crystal</button>
        </div>
        <div className="loot-rules">
          <h3>System rules to decide later</h3>
          <ul>
            <li>Rewards must be earned through site activity, purchases, contests, or community actions.</li>
            <li>Paid random boxes should be avoided for trust and parent-safe design.</li>
            <li>Rare animation should be reserved for expensive, event-only, or never-sold models.</li>
            <li>Inventory history should show where each rare model came from.</li>
          </ul>
        </div>
        <div className="vault-card">
          <p className="eyebrow">Vault preview</p>
          <h3>Rare model arrival animation</h3>
          <div className="vault-animation-demo">
            <span>LEGENDARY</span>
            <strong>Model unlocked</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniGamesPanel({ popbits, setPopbits }) {
  const [activeGame, setActiveGame] = useState(miniGames[0]);
  const [hits, setHits] = useState(0);

  function playDemo() {
    setHits((value) => value + 1);
    setPopbits((value) => value + 25);
  }

  return (
    <section className="content-section mini-game-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Mini game tab</p>
          <h2>Playable reward layer foundation</h2>
          <p className="soft-copy">Small game loops can support loyalty and discovery without taking over the shop experience.</p>
        </div>
        <Stat label="Demo hits" value={hits} />
      </div>
      <div className="game-layout">
        <div className="game-tabs">
          {miniGames.map((game) => (
            <button className={activeGame.name === game.name ? 'active' : ''} onClick={() => setActiveGame(game)} key={game.name} type="button">
              <strong>{game.name}</strong>
              <span>{game.status}</span>
            </button>
          ))}
        </div>
        <div className="game-arena-card">
          <div className="arena-monster">◉</div>
          <h3>{activeGame.name}</h3>
          <p>{activeGame.description}</p>
          <button className="primary-action" onClick={playDemo} type="button">Play demo action</button>
          <div className="reward-strip">Reward: {activeGame.reward}</div>
        </div>
      </div>
    </section>
  );
}

function RewardsPanel({ profile, popbits }) {
  const level = Math.min(5, Math.floor(popbits / 100) + 1);
  return (
    <section className="content-section rewards-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Loyalty foundation</p>
          <h2>PopBits, badges, streaks, and collection progress</h2>
          <p className="soft-copy">This system should reward real participation: purchases, makes, daily visits, contest entries, and profile growth.</p>
        </div>
        <Stat label="Collector level" value={level} />
      </div>
      <div className="reward-track">
        {[1, 2, 3, 4, 5].map((step) => (
          <div className={`reward-node ${level >= step ? 'complete' : ''}`} key={step}>
            <span>{step}</span>
            <strong>{step === 1 ? 'Starter' : step === 2 ? 'Maker' : step === 3 ? 'Collector' : step === 4 ? 'Vault' : 'Founder'}</strong>
          </div>
        ))}
      </div>
      <div className="badge-grid">
        <div className="badge-card"><strong>Daily streak</strong><span>{profile?.streak || 0} days</span></div>
        <div className="badge-card"><strong>PopBits balance</strong><span>{popbits}</span></div>
        <div className="badge-card"><strong>Print gallery</strong><span>Coming soon</span></div>
        <div className="badge-card"><strong>Contest entries</strong><span>Coming soon</span></div>
      </div>
    </section>
  );
}

function LobbyPanel({ featured, inventory, setSelectedCharacter, setActiveTab, onRare }) {
  return (
    <>
      <section className="hero-lobby">
        <div className="hero-copy">
          <p className="eyebrow">Playable 3D printable shop</p>
          <h1>Build a collection that feels alive before it becomes a print.</h1>
          <p>
            CyberPop should behave like a controlled game lobby: scroll through drops, open character cards, earn profile rewards, and send owned models into a simple multipart color studio.
          </p>
          <div className="hero-actions">
            <button className="primary-action" onClick={() => setActiveTab('Collection')} type="button">Open collection</button>
            <button className="secondary-action" onClick={() => setActiveTab('3D Studio')} type="button">Enter 3D Studio</button>
          </div>
        </div>
        <div className="hero-stage-card">
          <FigurePreview character={featured} />
          <div className="spotlight-terminal">
            <RarityBadge rarity={featured.rarity} />
            <h2>{featured.name}</h2>
            <p>{featured.slogan}</p>
            <button onClick={() => setSelectedCharacter(featured)} type="button">Open character card</button>
          </div>
        </div>
      </section>

      <section className="poster-scroll">
        {inventory.map((character, index) => (
          <article className="drop-poster" key={character.id} style={{ '--poster': character.palette[0], '--poster-deep': character.palette[1] }}>
            <div className="drop-background-word">{character.codename}</div>
            <div className="drop-poster-copy">
              <RarityBadge rarity={character.rarity} />
              <h2>{character.name}</h2>
              <p>{character.poster}</p>
              <div className="poster-actions">
                <button className="small-action" onClick={() => setSelectedCharacter(character)} type="button">Character card</button>
                {rarityRank[character.rarity] >= 4 && !character.owned && (
                  <button className="small-action glow" onClick={() => onRare(character)} type="button">Rare animation demo</button>
                )}
              </div>
            </div>
            <div className="drop-figure-wrap">
              <FigurePreview character={character} />
            </div>
            <div className="print-spec-strip">
              <span>{character.height}</span>
              <span>{character.format}</span>
              <span>{character.pieces.length} printable parts</span>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

export default function CyberPopShop() {
  const [activeTab, setActiveTab] = useState('Lobby');
  const [profile, setProfile] = useState(null);
  const [popbits, setPopbits] = useState(260);
  const [inventory, setInventory] = useState(characters);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [rareAnimation, setRareAnimation] = useState(null);
  const [customPalettes, setCustomPalettes] = useState({});

  const featured = useMemo(() => inventory.find((item) => item.owned) || inventory[0], [inventory]);
  const inventoryCount = inventory.filter((item) => item.owned).length;

  function unlockRare(character) {
    setInventory((items) => items.map((item) => item.id === character.id ? { ...item, owned: true } : item));
    setPopbits((value) => value + 120);
    setRareAnimation(character);
  }

  function openStudioFromCard() {
    setActiveTab('3D Studio');
    setSelectedCharacter(null);
  }

  function updateCharacterPalette(id, palette) {
    setCustomPalettes((current) => ({ ...current, [id]: palette }));
  }

  const studioCharacter = selectedCharacter || featured;
  const inventoryWithCustomPalette = inventory.map((item) => customPalettes[item.id] ? { ...item, palette: customPalettes[item.id] } : item);
  const featuredWithPalette = inventoryWithCustomPalette.find((item) => item.id === featured.id) || featured;

  return (
    <main className="site-shell">
      <header className="topbar">
        <div className="brand-mark"><span>CP</span></div>
        <div className="brand-copy">
          <strong>CyberPop</strong>
          <span>Playable 3D print shop</span>
        </div>
        <nav className="tab-nav" aria-label="Main interface modes">
          {tabs.map((tab) => (
            <NavButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>{tab}</NavButton>
          ))}
        </nav>
        <button className="currency-pill" onClick={() => setActiveTab('Rewards')} type="button">✦ {popbits}</button>
        <button className="cart-pill" type="button">Cart 0</button>
      </header>

      <div className="workspace">
        <ProfileCard profile={profile} popbits={popbits} inventoryCount={inventoryCount} onCreate={() => setActiveTab('Profile')} />

        {activeTab === 'Profile' && <ProfileCreator profile={profile} setProfile={setProfile} />}
        {activeTab === 'Lobby' && (
          <LobbyPanel
            featured={featuredWithPalette}
            inventory={inventoryWithCustomPalette}
            setSelectedCharacter={setSelectedCharacter}
            setActiveTab={setActiveTab}
            onRare={unlockRare}
          />
        )}
        {activeTab === 'Collection' && (
          <CollectionPanel
            inventory={inventoryWithCustomPalette}
            selectedCharacter={selectedCharacter}
            setSelectedCharacter={setSelectedCharacter}
            onOpenStudio={openStudioFromCard}
            onUnlock={unlockRare}
          />
        )}
        {activeTab === '3D Studio' && (
          <StudioPanel character={studioCharacter} updateCharacterPalette={updateCharacterPalette} />
        )}
        {activeTab === 'Loot' && <LootPanel popbits={popbits} setPopbits={setPopbits} onRare={unlockRare} />}
        {activeTab === 'Mini Games' && <MiniGamesPanel popbits={popbits} setPopbits={setPopbits} />}
        {activeTab === 'Rewards' && <RewardsPanel profile={profile} popbits={popbits} />}
      </div>

      <CharacterModal
        character={activeTab === 'Lobby' ? selectedCharacter : null}
        onClose={() => setSelectedCharacter(null)}
        onStudio={openStudioFromCard}
        onUnlock={unlockRare}
      />
      <RareAnimation character={rareAnimation} onDone={() => setRareAnimation(null)} />
    </main>
  );
}
