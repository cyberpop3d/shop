# Cyberpop3D Shop MVP

A first deployable Next.js prototype for a playable Cyberpop3D storefront.

This version is not a finished commerce backend. It is a visual and interaction foundation for:

- STL / physical figure / stand / bundle catalog
- Premium sky-blue / white glass game UI direction
- Product detail preview modal
- Cart mockup
- PopBits loyalty points
- Piñata boss mini-game loop
- Protected library placeholder
- Makes gallery seed content placeholder
- Future contests section

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

Push this folder to a GitHub repo, import it in Vercel, and deploy.

Recommended project/domain later:

```txt
shop.kiarostudio.com/cyberpop
```

For the first clean deployment, a separate repo is recommended:

```txt
cyberpop3d/cyberpop-shop
```

## Current scope

This is MVP 0 / visual vertical slice. It intentionally uses mock data from `src/lib/data.ts`.

The next implementation layer should add:

- user accounts
- product CMS/admin
- secure paid file delivery
- real payment provider
- order records
- loyalty ledger
- server-side reward calculation
- GLB/GLTF product previews
- gallery upload/moderation
