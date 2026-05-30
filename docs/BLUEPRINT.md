# CyberPop Shop MVP Notes

This version focuses on a character-first game shop interface.

## Current scope

- Top menu modes do not scroll to page anchors.
- Lobby centers the selected collectible and keeps the product rail directly attached to the stage.
- Portfolio-style sample products are used as the working product set.
- Purchase panel separates GET STL and GET Physical product.
- STL price is shown as $5 with subscription/bulk bundle messaging.
- Physical products include 15 cm, 30 cm, and 40 cm size options.
- Profile creation and symbolic inventory are included.
- Inventory characters open collectible cards.
- Loot area includes Spend site credit (units), a spinning glowing crystal, character previews, and RNG slowdown.
- Rare unlock is visual-first and character-first, not a text card.
- 3D Studio assumes the 3MF package is already loaded and shows detected part/sublayer color planning UI.
- Loyalty includes wallpapers, GIFs, artwork, stickers, profile trophies, site points, wheel spins, and future character unlock silhouette.

## Later real implementation

- Replace CSS placeholders with real optimized product renders / GLB previews from the portfolio pipeline.
- Implement real Bambu/3MF parsing for sublayers, objects, plates, filament colors, and part names.
- Connect products to backend/CMS.
- Connect purchases to Stripe/Shopify/Gumroad/Patreon logic.
- Store inventory, site credit, loyalty, and unlock history server-side.


## v8 Sonya GLB test

- Sonya Blade now uses `public/models/sonya-blade.glb` as the first live 3D preview instead of a CSS placeholder.
- The same live preview appears in lobby, inventory, loot preview, character card, rare unlock overlay, and 3D Studio.
- The 3D Studio color controls attempt rough material recoloring on the GLB preview. Real 3MF sublayer/object parsing still needs a proper implementation later.
