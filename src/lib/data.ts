export type ProductKind = 'STL' | 'Physical' | 'Bundle' | 'Stand' | 'Accessory';

export type Product = {
  id: string;
  name: string;
  collection: string;
  kind: ProductKind;
  price: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  scale: string;
  accent: string;
  description: string;
  parts: string[];
  includes: string[];
  previewMode: 'GLB preview ready' | 'Render sequence planned' | 'Coming soon';
};

export const products: Product[] = [
  {
    id: 'cp-hero-01',
    name: 'Beach Power Cat',
    collection: 'Summer Arcade Drop',
    kind: 'Physical',
    price: 82,
    difficulty: 'Medium',
    scale: '30 cm physical figure',
    accent: '#13b6ff',
    description: 'A chunky premium collectible figure prepared for physical print sales, display shelves, and collector photos.',
    parts: ['Head', 'Torso', 'Arms', 'Shorts', 'Base', 'Beach ball'],
    includes: ['Painted physical print', 'Collector card', 'Display base', 'Digital profile badge'],
    previewMode: 'Render sequence planned'
  },
  {
    id: 'cp-stl-02',
    name: 'Storm Hat Fighter',
    collection: 'Arcade Legends',
    kind: 'STL',
    price: 18,
    difficulty: 'Advanced',
    scale: 'Multipart STL package',
    accent: '#6ec8ff',
    description: 'Multipart STL with optimized assembly logic, thick color regions, and optional display base compatibility.',
    parts: ['Hat', 'Head', 'Body', 'Hands', 'Lower body', 'Base'],
    includes: ['STL files', '3MF package', 'Assembly notes', 'License note'],
    previewMode: 'GLB preview ready'
  },
  {
    id: 'cp-stand-03',
    name: 'Sky Dock Display Base',
    collection: 'Stand Market',
    kind: 'Stand',
    price: 9,
    difficulty: 'Easy',
    scale: 'Modular display base',
    accent: '#a6e7ff',
    description: 'A clean display platform built for collectible photography, peg adapters, and simple FDM printing.',
    parts: ['Platform', 'Peg adapter', 'Back plate'],
    includes: ['STL files', 'Peg options', 'Bambu-oriented notes'],
    previewMode: 'GLB preview ready'
  },
  {
    id: 'cp-bundle-04',
    name: 'Starter Collector Pack',
    collection: 'Cyberpop Starter',
    kind: 'Bundle',
    price: 49,
    difficulty: 'Medium',
    scale: '3 STL figures + stands',
    accent: '#57d6ff',
    description: 'A first-buyer bundle that unlocks digital collection progress, profile cosmetics, and reward credits.',
    parts: ['Figure A', 'Figure B', 'Figure C', '3 stands'],
    includes: ['STL archive', '3MF files', 'Profile badge', 'Reward credit'],
    previewMode: 'Coming soon'
  }
];

export const quests = [
  { id: 'daily-login', label: 'Daily login', reward: '+10 PopBits', progress: 40 },
  { id: 'inspect-product', label: 'Inspect a 3D preview', reward: 'Preview shard', progress: 75 },
  { id: 'share-make', label: 'Upload a printed make', reward: '+50 PopBits', progress: 10 }
];

export const makes = [
  { id: 'mk-01', user: 'Founder Shelf', title: 'First painted beach print', likes: 28 },
  { id: 'mk-02', user: 'Print Lab A', title: 'Clean FDM test with display base', likes: 19 },
  { id: 'mk-03', user: 'Cyberpop Seed', title: 'Collector shelf setup', likes: 34 }
];

export const bossParts = [
  { id: 'support', name: 'Support Goblin', hp: 100, current: 72 },
  { id: 'warp', name: 'Warp Beast', hp: 100, current: 55 },
  { id: 'string', name: 'Stringing Slime', hp: 100, current: 31 }
];
