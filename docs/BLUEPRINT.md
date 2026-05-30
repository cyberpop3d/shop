# Cyberpop3D Shop Blueprint

## Product Positioning

Cyberpop3D is not a normal STL marketplace. It is a premium 3D printable toy ecosystem where physical products, STL files, user profiles, print galleries, collection progress, rewards, mini games, and a digital Cyberpop universe reinforce each other.

## Core Flow

1. User enters Cyberpop Shop.
2. User browses STL files, physical prints, stands, accessories, and bundles.
3. User opens a product page with renders, print notes, part list, and later 3D GLB preview.
4. User purchases a product.
5. Digital product appears in the user's protected library.
6. Product also becomes part of the user's digital collection/profile.
7. User earns PopBits, badges, shards, or event progress.
8. User can upload print photos to the makes gallery.
9. Mini games and seasonal events keep the ecosystem alive.

## MVP Phases

### MVP 1 — Shop Core
- homepage
- catalog
- product page
- account
- checkout
- secure download library
- license notes

### MVP 2 — 3D Preview + Profile
- GLB/GLTF viewer
- part visibility
- accessory switch
- basic user profile
- makes gallery
- seed content

### MVP 3 — Loyalty
- PopBits or equivalent currency
- daily login
- coupons
- badges
- collection progress
- Patreon code input

### MVP 4 — Mini Games
- piñata/boss damage
- crystal forge/reward opening
- simple tycoon or map runner
- monthly leaderboard

### MVP 5 — Community
- design/print/painting contests
- gallery voting
- curated front-page makes
- seasonal events

### MVP 6 — Advanced Tools
- AI print settings assistant
- Bambu/slicer workflow
- advanced customizer
- animated digital collection scenes

## Technical Direction

- Frontend: Next.js / React
- 3D: Three.js / React Three Fiber
- Hosting: Vercel
- Database: user, product, order, license, reward, quest, gallery, contest, leaderboard, currency ledger
- File security: authenticated or signed downloads for STL/3MF/ZIP
- Preview asset pipeline: STL/3MF/ZIP for sale, GLB/GLTF for web preview, PNG/JPG for thumbnails, JSON metadata for product data

## Key Rule

The playful layer should support commerce, not obscure it. Children and younger audiences should feel discovery and excitement; parents and adult collectors should see pricing, shipping, materials, file access, and trust information clearly.
