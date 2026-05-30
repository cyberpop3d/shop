export type ProductKind = "STL" | "Physical" | "Stand" | "Bundle";

export type Product = {
  slug: string;
  name: string;
  series: string;
  kind: ProductKind;
  price: number;
  popBits: number;
  scale: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  short: string;
  description: string;
  accent: string;
  preview: string;
  parts: string[];
  included: string[];
  tags: string[];
};

export const products: Product[] = [
  {
    slug: "storm-hat-warrior",
    name: "Storm Hat Warrior",
    series: "Arcade Legends",
    kind: "Physical",
    price: 79,
    popBits: 120,
    scale: "28 cm physical print",
    difficulty: "Medium",
    short: "A dramatic shelf-ready collectible with modular hat, body, and base parts.",
    description: "A made-to-order physical CyberPop collectible designed for display shelves and premium product photography.",
    accent: "from-sky-300 to-blue-500",
    preview: "⚡",
    parts: ["Hat", "Head", "Torso", "Arms", "Base"],
    included: ["Printed figure", "Display base", "Collector card placeholder"],
    tags: ["New drop", "Physical", "Multipart"]
  },
  {
    slug: "neon-bunny-athlete",
    name: "Neon Bunny Athlete",
    series: "Beach Power Series",
    kind: "STL",
    price: 24,
    popBits: 55,
    scale: "STL / 3MF printable package",
    difficulty: "Medium",
    short: "Stylized multipart beach-athlete figure prepared for home printing.",
    description: "A printable figure package with separated parts, future GLB preview support, and suggested print metadata placeholders.",
    accent: "from-cyan-200 to-pink-300",
    preview: "🐰",
    parts: ["Head", "Ears", "Body", "Legs", "Stand"],
    included: ["STL files", "3MF placeholder", "ZIP delivery placeholder"],
    tags: ["STL", "Beach", "FanPop"]
  },
  {
    slug: "corporate-tiger-boss",
    name: "Corporate Tiger Boss",
    series: "Power Suit Icons",
    kind: "Bundle",
    price: 99,
    popBits: 180,
    scale: "Physical + digital bundle",
    difficulty: "Advanced",
    short: "Premium physical print bundle with digital library delivery placeholder.",
    description: "A hybrid product direction showing how CyberPop can sell both physical collectibles and authenticated digital files.",
    accent: "from-amber-200 to-orange-400",
    preview: "🐯",
    parts: ["Head", "Suit torso", "Hands", "Shoes", "Base"],
    included: ["Printed figure", "Digital STL library unlock", "Bonus stand placeholder"],
    tags: ["Bundle", "Premium", "Collector"]
  },
  {
    slug: "sky-display-stand",
    name: "Sky Display Stand",
    series: "Stand Market",
    kind: "Stand",
    price: 12,
    popBits: 20,
    scale: "Universal display base",
    difficulty: "Easy",
    short: "A modular display stand concept for CyberPop figures and shelf scenes.",
    description: "A foundation for the stand market category, including peg/adaptor compatibility fields in future product metadata.",
    accent: "from-sky-100 to-cyan-300",
    preview: "🧊",
    parts: ["Base plate", "Peg adaptor", "Name plate"],
    included: ["STL stand files", "Peg adaptor placeholder"],
    tags: ["Stand", "Accessory", "Modular"]
  }
];

export const collections = [
  "Arcade Legends",
  "Beach Power Series",
  "Power Suit Icons",
  "Stand Market"
];

export const roadmap = [
  "MVP 1: shop, catalog, product page, cart, library placeholder",
  "MVP 2: GLB viewer, profile, makes gallery, seed content",
  "MVP 3: PopBits, daily login, coupons, badges, collection progress",
  "MVP 4: Piñata boss, Crystal Forge, leaderboard, Print Lab prototype",
  "MVP 5: contests, community showcases, seasonal events",
  "MVP 6: AI print settings, slicer flow, advanced customizer"
];
