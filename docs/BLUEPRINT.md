# CyberPop Shop V5 Blueprint

## Direction

CyberPop Shop should feel like a playable collectible platform, not a generic e-commerce template. The home interface should use controlled game mechanisms: lobby modes, character posters, profile inventory, reward progression, mini-game tabs, and a simple studio workflow for print palette decisions.

## Main modules

1. Lobby
   - Large poster-style scroll sections
   - Character placeholder presence in front of huge background typography
   - 3D print specifications visible in each drop scene

2. Profile
   - Display name
   - Collector title
   - Favorite filament
   - Printer setup
   - Streak and PopBits summary

3. Symbolic Inventory
   - Character tiles
   - Rarity levels
   - Character card modal
   - Rare unlock animation for premium, never-sold, or event-only models

4. 3D Studio
   - Simple multipart character preview
   - Detected parts / sublayers
   - Color picker per part
   - Filament code input per part
   - Bambu 3MF import placeholder

5. Loot Foundation
   - Earned crystals only for now
   - No paid mystery box loop
   - Transparent reward rules

6. Mini Games
   - Piñata Boss
   - Print Runner
   - Crystal Forge

7. Rewards
   - PopBits
   - Collector level
   - Daily streak
   - Makes / contest hooks

## Real implementation later

- Account authentication
- Real inventory backed by purchases and rewards
- 3MF parser for Bambu Studio files
- Model preview with Three.js / React Three Fiber
- Secure library and downloads
- Server-side PopBits ledger
- Admin CMS for products, rarity, rewards, and contests
