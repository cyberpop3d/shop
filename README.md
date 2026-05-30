# CyberPop Shop Game UI v6

A clean Next.js prototype for the CyberPop Shop direction.

This version focuses on a playable collectible interface instead of a generic ecommerce hero.

## Main ideas

- Top navigation changes interface modes and does not scroll to page anchors.
- The main lobby keeps the character, selection rail, and character card close together.
- Character selection changes the central stage, poster background, rarity, print details, and studio data.
- Profile mode includes a simple collector profile and symbolic inventory.
- Inventory characters open character cards with rarity and studio actions.
- Legendary and Founder characters can trigger a rare unlock animation placeholder.
- Studio mode includes multipart color mapping and filament code inputs.
- 3MF/Bambu sublayer parsing is represented as UI only for now.
- Loot, mini game, and rewards modules are present as foundations, not final systems.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Push this folder to the `cyberpop3d/shop` repository and let Vercel deploy the main branch.
