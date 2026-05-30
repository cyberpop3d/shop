# CyberPop Shop MVP Blueprint

## Purpose

CyberPop Shop is not a simple e-commerce storefront. It is the starting point for a premium 3D printable toy ecosystem that can grow into STL sales, physical figures, product previews, user profiles, makes galleries, loyalty rewards, mini games, seasonal contests, Patreon access, and a long-term CyberPop universe.

## MVP 0 in this package

This package is a clean deployable starter. It intentionally avoids fragile dependencies and keeps the first build stable.

Included:

- Landing page
- Product catalog foundation
- Product spotlight panel
- Cart mockup
- PopBits reward placeholder
- Piñata Boss demo loop
- Library / 3D preview / game module placeholders
- Responsive sky-blue / white glass UI direction

Not included yet:

- Real payment
- User accounts
- Database
- Secure STL delivery
- Admin panel
- GLB viewer
- Real product CMS
- Server-side reward ledger

## Suggested next phases

### MVP 1 — Shop core

- Real product data
- Product detail pages
- Cart and checkout provider decision
- Digital vs physical product distinction
- Secure download architecture plan

### MVP 2 — Library and previews

- User account
- Purchased product library
- GLB product preview placeholder to real viewer
- Makes gallery seed content

### MVP 3 — Loyalty

- PopBits ledger
- Daily login
- Coupons and badges
- Patreon code entry

### MVP 4 — Game systems

- Crystal Forge
- Piñata Boss
- Print Lab Tycoon prototype
- Leaderboard foundation

### MVP 5 — Community

- Makes gallery upload
- Moderation
- Contests
- Collection showcases

## Technical direction

- Next.js / React frontend
- Vercel hosting
- Later backend for users, products, orders, library, rewards, games, gallery, contests, and admin tools
- GLB/GLTF for web previews, STL/3MF/ZIP for actual product delivery
- Secure authenticated downloads for paid digital files
