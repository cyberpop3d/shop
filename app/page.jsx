"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const products = [
  {
    id: "sagat-corporate",
    code: "CP-010",
    name: "Sagat Corporate",
    short: "Sagat",
    poster: "SAGAT",
    rarity: "Epic",
    rarityClass: "epic",
    category: "Physical + STL",
    status: "Portfolio sample",
    digitalPrice: 5,
    sizePrices: { 15: 39, 30: 69, 40: 109 },
    creditValue: 260,
    loyaltyGain: 35,
    palette: ["#f2c68d", "#1a2438", "#f7faff", "#111820"],
    glow: "#48c7ff",
    line: "Suit display figure with readable multipart zones.",
    printNote: "Head / torso / arms / shoes prepared as color planning groups.",
    parts: [
      { name: "Head", sublayer: "OBJ_head_01", color: "#f2c68d", filament: "PLA-SKIN-02" },
      { name: "Suit Torso", sublayer: "OBJ_torso_02", color: "#1a2438", filament: "PLA-NAVY-06" },
      { name: "Gloves", sublayer: "OBJ_gloves_03", color: "#f7faff", filament: "PLA-WHITE-01" },
      { name: "Shoes", sublayer: "OBJ_shoes_04", color: "#111820", filament: "PLA-BLACK-01" }
    ]
  },
  {
    id: "cammy-sf6",
    code: "CP-011",
    name: "Cammy SF6",
    short: "Cammy",
    poster: "CAMMY",
    rarity: "Rare",
    rarityClass: "rare",
    category: "STL Bundle",
    status: "Portfolio sample",
    digitalPrice: 5,
    sizePrices: { 15: 35, 30: 64, 40: 99 },
    creditValue: 210,
    loyaltyGain: 28,
    palette: ["#ffc87b", "#5ce7c1", "#f8f4e8", "#182334"],
    glow: "#6df0ce",
    line: "Sporty collectible with clean studio color sections.",
    printNote: "Hair / torso / legs / base detected as printable color groups.",
    parts: [
      { name: "Hair", sublayer: "OBJ_hair_01", color: "#ffc87b", filament: "PLA-BLONDE-01" },
      { name: "Body", sublayer: "OBJ_body_02", color: "#5ce7c1", filament: "PLA-MINT-04" },
      { name: "Boots", sublayer: "OBJ_boots_03", color: "#182334", filament: "PLA-BLACK-02" },
      { name: "Base", sublayer: "OBJ_base_04", color: "#f8f4e8", filament: "PLA-WARM-WHITE" }
    ]
  },
  {
    id: "johnny-cage",
    code: "CP-012",
    name: "Johnny Cage",
    short: "Johnny",
    poster: "CAGE",
    rarity: "Epic",
    rarityClass: "epic",
    category: "Physical Print",
    status: "Portfolio sample",
    digitalPrice: 5,
    sizePrices: { 15: 39, 30: 72, 40: 118 },
    creditValue: 300,
    loyaltyGain: 36,
    palette: ["#ffd7a1", "#151d2c", "#18d7c3", "#eaf7ff"],
    glow: "#40d9ff",
    line: "Shelf-ready action figure with strong display attitude.",
    printNote: "Head / glasses / torso / lower body separated for palette planning.",
    parts: [
      { name: "Head", sublayer: "OBJ_head_01", color: "#ffd7a1", filament: "PLA-SKIN-03" },
      { name: "Glasses", sublayer: "OBJ_glasses_02", color: "#151d2c", filament: "PLA-BLACK-01" },
      { name: "Torso", sublayer: "OBJ_torso_03", color: "#18d7c3", filament: "PLA-TEAL-08" },
      { name: "Pants", sublayer: "OBJ_legs_04", color: "#eaf7ff", filament: "PLA-ICE-WHITE" }
    ]
  },
  {
    id: "sonya-blade",
    code: "CP-013",
    name: "Sonya Blade",
    short: "Sonya",
    poster: "SONYA",
    rarity: "Rare",
    rarityClass: "rare",
    category: "STL Bundle",
    status: "Live GLB preview",
    modelSrc: "/models/sonya-blade.glb",
    previewSrc: "/images/sonya-preview.png",
    digitalPrice: 5,
    sizePrices: { 15: 34, 30: 62, 40: 96 },
    creditValue: 230,
    loyaltyGain: 30,
    palette: ["#f4c59b", "#73d45d", "#1d2b20", "#eef5e8"],
    glow: "#7df05a",
    line: "Compact heroic silhouette with multipart print clarity.",
    printNote: "Hair / torso / lower body / boots are ready for color decisions.",
    parts: [
      { name: "Hair", sublayer: "OBJ_hair_01", color: "#f4c59b", filament: "PLA-SAND-02" },
      { name: "Torso", sublayer: "OBJ_torso_02", color: "#73d45d", filament: "PLA-GREEN-05" },
      { name: "Legs", sublayer: "OBJ_legs_03", color: "#1d2b20", filament: "PLA-DARK-GREEN" },
      { name: "Boots", sublayer: "OBJ_boots_04", color: "#eef5e8", filament: "PLA-OFFWHITE" }
    ]
  },
  {
    id: "raiden-vault",
    code: "CP-021",
    name: "Raiden Vault Figure",
    short: "Raiden",
    poster: "RAIDEN",
    rarity: "Legendary",
    rarityClass: "legendary",
    category: "Private Drop",
    status: "Rare unlock enabled",
    digitalPrice: 5,
    sizePrices: { 15: 49, 30: 89, 40: 139 },
    creditValue: 700,
    loyaltyGain: 60,
    palette: ["#f6f8ff", "#73ecff", "#29354f", "#d4bc70"],
    glow: "#81efff",
    line: "Premium vault figure reserved for special drops and loyalty moments.",
    printNote: "Hat / head / torso / lower body / base listed from the 3MF preparation plan.",
    parts: [
      { name: "Hat", sublayer: "OBJ_hat_01", color: "#f6f8ff", filament: "PLA-WHITE-02" },
      { name: "Head", sublayer: "OBJ_head_02", color: "#73ecff", filament: "PLA-AQUA-04" },
      { name: "Body", sublayer: "OBJ_body_03", color: "#29354f", filament: "PLA-NAVY-04" },
      { name: "Trim", sublayer: "OBJ_trim_04", color: "#d4bc70", filament: "PLA-GOLD-01" }
    ]
  },
  {
    id: "shadow-founder",
    code: "CP-X01",
    name: "Founder Shadow Model",
    short: "Founder",
    poster: "FOUNDER",
    rarity: "Founder",
    rarityClass: "founder",
    category: "Not publicly sold",
    status: "Exclusive unlock",
    digitalPrice: 5,
    sizePrices: { 15: 69, 30: 149, 40: 229 },
    creditValue: 1500,
    loyaltyGain: 90,
    palette: ["#1a1d24", "#2a3448", "#7bdcff", "#ffd97a"],
    glow: "#ffd56d",
    line: "Symbolic high-value character for rare collection moments.",
    printNote: "The visual slot exists now; production data will be attached later.",
    parts: [
      { name: "Head", sublayer: "OBJ_head_01", color: "#1a1d24", filament: "PLA-MATTE-BLACK" },
      { name: "Body", sublayer: "OBJ_body_02", color: "#2a3448", filament: "PLA-GRAPHITE" },
      { name: "Energy Core", sublayer: "OBJ_core_03", color: "#7bdcff", filament: "PLA-CYAN-NEON" },
      { name: "Base", sublayer: "OBJ_base_04", color: "#ffd97a", filament: "PLA-GOLD-02" }
    ]
  },
  {
    id: "ryu-classic",
    code: "CP-014",
    name: "Ryu Classic",
    short: "Ryu",
    poster: "RYU",
    rarity: "Epic",
    rarityClass: "epic",
    category: "Street Fighters",
    status: "Roster concept",
    digitalPrice: 5,
    sizePrices: { 15: 38, 30: 68, 40: 104 },
    creditValue: 250,
    loyaltyGain: 32,
    palette: ["#f4c7a0", "#f2f2ef", "#d6403f", "#211d1d"],
    glow: "#ff5d5d",
    line: "Classic arcade fighter slot prepared for portfolio model data.",
    printNote: "Headband / torso / gloves / pants listed as future printable color groups.",
    parts: [
      { name: "Head", sublayer: "OBJ_head_01", color: "#f4c7a0", filament: "PLA-SKIN-02" },
      { name: "Gi", sublayer: "OBJ_gi_02", color: "#f2f2ef", filament: "PLA-WHITE-01" },
      { name: "Headband", sublayer: "OBJ_band_03", color: "#d6403f", filament: "PLA-RED-04" },
      { name: "Gloves", sublayer: "OBJ_gloves_04", color: "#211d1d", filament: "PLA-BLACK-01" }
    ]
  },
  {
    id: "ken-retro",
    code: "CP-015",
    name: "Ken Retro",
    short: "Ken",
    poster: "KEN",
    rarity: "Rare",
    rarityClass: "rare",
    category: "Street Fighters",
    status: "Roster concept",
    digitalPrice: 5,
    sizePrices: { 15: 36, 30: 66, 40: 101 },
    creditValue: 220,
    loyaltyGain: 30,
    palette: ["#ffd080", "#e9433f", "#f6f0dc", "#191923"],
    glow: "#ff9d45",
    line: "Fast action shelf figure slot with bold color blocking.",
    printNote: "Hair / torso / pants / gloves are ready as planned color sections.",
    parts: [
      { name: "Hair", sublayer: "OBJ_hair_01", color: "#ffd080", filament: "PLA-BLONDE-02" },
      { name: "Torso", sublayer: "OBJ_torso_02", color: "#e9433f", filament: "PLA-RED-05" },
      { name: "Pants", sublayer: "OBJ_pants_03", color: "#f6f0dc", filament: "PLA-CREAM-01" },
      { name: "Gloves", sublayer: "OBJ_gloves_04", color: "#191923", filament: "PLA-BLACK-01" }
    ]
  },
  {
    id: "chun-arcade",
    code: "CP-016",
    name: "Chun Arcade",
    short: "Chun",
    poster: "CHUN",
    rarity: "Epic",
    rarityClass: "epic",
    category: "Street Fighters",
    status: "Roster concept",
    digitalPrice: 5,
    sizePrices: { 15: 40, 30: 72, 40: 112 },
    creditValue: 310,
    loyaltyGain: 38,
    palette: ["#ffd5a6", "#2859d6", "#f7f8ff", "#151a29"],
    glow: "#527cff",
    line: "Arcade heroine roster slot with premium collectible staging.",
    printNote: "Hair buns / torso / boots / base planned for multipart color decisions.",
    parts: [
      { name: "Head", sublayer: "OBJ_head_01", color: "#ffd5a6", filament: "PLA-SKIN-03" },
      { name: "Dress", sublayer: "OBJ_body_02", color: "#2859d6", filament: "PLA-BLUE-07" },
      { name: "Boots", sublayer: "OBJ_boots_03", color: "#f7f8ff", filament: "PLA-WHITE-01" },
      { name: "Hair", sublayer: "OBJ_hair_04", color: "#151a29", filament: "PLA-BLACK-02" }
    ]
  },
  {
    id: "guile-shelf",
    code: "CP-017",
    name: "Guile Shelf",
    short: "Guile",
    poster: "GUILE",
    rarity: "Rare",
    rarityClass: "rare",
    category: "Street Fighters",
    status: "Roster concept",
    digitalPrice: 5,
    sizePrices: { 15: 37, 30: 67, 40: 103 },
    creditValue: 240,
    loyaltyGain: 31,
    palette: ["#e8c18a", "#f4d071", "#455942", "#171a1f"],
    glow: "#f0d560",
    line: "Compact military-inspired display figure slot.",
    printNote: "Hair / shirt / pants / boots tracked as future 3MF sublayers.",
    parts: [
      { name: "Hair", sublayer: "OBJ_hair_01", color: "#f4d071", filament: "PLA-BLONDE-03" },
      { name: "Skin", sublayer: "OBJ_skin_02", color: "#e8c18a", filament: "PLA-SKIN-02" },
      { name: "Pants", sublayer: "OBJ_pants_03", color: "#455942", filament: "PLA-OLIVE-04" },
      { name: "Boots", sublayer: "OBJ_boots_04", color: "#171a1f", filament: "PLA-BLACK-01" }
    ]
  },
  {
    id: "blanka-burst",
    code: "CP-018",
    name: "Blanka Burst",
    short: "Blanka",
    poster: "BLANKA",
    rarity: "Legendary",
    rarityClass: "legendary",
    category: "Street Fighters",
    status: "Roster concept",
    digitalPrice: 5,
    sizePrices: { 15: 44, 30: 82, 40: 128 },
    creditValue: 520,
    loyaltyGain: 52,
    palette: ["#63d64d", "#ff8c32", "#f5d28a", "#112219"],
    glow: "#6eff48",
    line: "Electric wild-card slot for rare roster moments.",
    printNote: "Hair / body / wrist bands / base planned as bold printable zones.",
    parts: [
      { name: "Body", sublayer: "OBJ_body_01", color: "#63d64d", filament: "PLA-GREEN-06" },
      { name: "Hair", sublayer: "OBJ_hair_02", color: "#ff8c32", filament: "PLA-ORANGE-04" },
      { name: "Bands", sublayer: "OBJ_bands_03", color: "#f5d28a", filament: "PLA-YELLOW-02" },
      { name: "Base", sublayer: "OBJ_base_04", color: "#112219", filament: "PLA-DARK-GREEN" }
    ]
  },
  {
    id: "vega-mask",
    code: "CP-019",
    name: "Vega Mask",
    short: "Vega",
    poster: "VEGA",
    rarity: "Epic",
    rarityClass: "epic",
    category: "Street Fighters",
    status: "Roster concept",
    digitalPrice: 5,
    sizePrices: { 15: 41, 30: 75, 40: 118 },
    creditValue: 330,
    loyaltyGain: 40,
    palette: ["#f4caa2", "#f5f2e9", "#7a4fe8", "#151724"],
    glow: "#a66cff",
    line: "Masked display figure slot with clean premium silhouette.",
    printNote: "Mask / hair / torso / base listed as planned 3MF objects.",
    parts: [
      { name: "Skin", sublayer: "OBJ_skin_01", color: "#f4caa2", filament: "PLA-SKIN-03" },
      { name: "Mask", sublayer: "OBJ_mask_02", color: "#f5f2e9", filament: "PLA-WHITE-02" },
      { name: "Sash", sublayer: "OBJ_sash_03", color: "#7a4fe8", filament: "PLA-PURPLE-04" },
      { name: "Base", sublayer: "OBJ_base_04", color: "#151724", filament: "PLA-BLACK-01" }
    ]
  },
  {
    id: "balrog-boxer",
    code: "CP-020",
    name: "Balrog Boxer",
    short: "Balrog",
    poster: "BALROG",
    rarity: "Rare",
    rarityClass: "rare",
    category: "Street Fighters",
    status: "Roster concept",
    digitalPrice: 5,
    sizePrices: { 15: 38, 30: 70, 40: 110 },
    creditValue: 260,
    loyaltyGain: 34,
    palette: ["#6b3b26", "#2e6fff", "#d83b36", "#f9f4e4"],
    glow: "#3f82ff",
    line: "Boxing shelf figure slot with chunky multipart logic.",
    printNote: "Head / shorts / gloves / shoes ready for studio color assignment.",
    parts: [
      { name: "Head", sublayer: "OBJ_head_01", color: "#6b3b26", filament: "PLA-BROWN-04" },
      { name: "Shorts", sublayer: "OBJ_shorts_02", color: "#2e6fff", filament: "PLA-BLUE-08" },
      { name: "Gloves", sublayer: "OBJ_gloves_03", color: "#d83b36", filament: "PLA-RED-06" },
      { name: "Shoes", sublayer: "OBJ_shoes_04", color: "#f9f4e4", filament: "PLA-CREAM-01" }
    ]
  },
  {
    id: "akuma-shadow",
    code: "CP-022",
    name: "Akuma Shadow",
    short: "Akuma",
    poster: "AKUMA",
    rarity: "Legendary",
    rarityClass: "legendary",
    category: "Street Fighters",
    status: "Roster concept",
    digitalPrice: 5,
    sizePrices: { 15: 49, 30: 89, 40: 140 },
    creditValue: 720,
    loyaltyGain: 62,
    palette: ["#c74842", "#26202b", "#ff7838", "#0c1016"],
    glow: "#ff5a3b",
    line: "High-level shadow slot for rare poster-card reveals.",
    printNote: "Hair / gi / beads / base planned as printable color zones.",
    parts: [
      { name: "Hair", sublayer: "OBJ_hair_01", color: "#c74842", filament: "PLA-RED-07" },
      { name: "Gi", sublayer: "OBJ_gi_02", color: "#26202b", filament: "PLA-GRAPHITE" },
      { name: "Core", sublayer: "OBJ_core_03", color: "#ff7838", filament: "PLA-ORANGE-05" },
      { name: "Base", sublayer: "OBJ_base_04", color: "#0c1016", filament: "PLA-BLACK-01" }
    ]
  },
  {
    id: "bison-summer",
    code: "CP-023",
    name: "Bison Summer",
    short: "Bison",
    poster: "BISON",
    rarity: "Epic",
    rarityClass: "epic",
    category: "Beach Theme",
    status: "Roster concept",
    digitalPrice: 5,
    sizePrices: { 15: 43, 30: 79, 40: 124 },
    creditValue: 360,
    loyaltyGain: 44,
    palette: ["#f0c096", "#ff4f6d", "#fff0b3", "#1b2131"],
    glow: "#ff5f85",
    line: "Summer boss concept slot with clean multipart blocks.",
    printNote: "Hat / torso / shorts / sandals planned for color mapping.",
    parts: [
      { name: "Skin", sublayer: "OBJ_skin_01", color: "#f0c096", filament: "PLA-SKIN-02" },
      { name: "Top", sublayer: "OBJ_top_02", color: "#ff4f6d", filament: "PLA-PINK-05" },
      { name: "Trim", sublayer: "OBJ_trim_03", color: "#fff0b3", filament: "PLA-YELLOW-02" },
      { name: "Base", sublayer: "OBJ_base_04", color: "#1b2131", filament: "PLA-NAVY-06" }
    ]
  },
  {
    id: "sakura-club",
    code: "CP-024",
    name: "Sakura Club",
    short: "Sakura",
    poster: "SAKURA",
    rarity: "Rare",
    rarityClass: "rare",
    category: "Street Fighters",
    status: "Roster concept",
    digitalPrice: 5,
    sizePrices: { 15: 34, 30: 63, 40: 98 },
    creditValue: 200,
    loyaltyGain: 27,
    palette: ["#f7c7a0", "#ffffff", "#2c5bd8", "#e95b75"],
    glow: "#ff77a0",
    line: "Club roster slot with bright collectible energy.",
    printNote: "Head / uniform / skirt / shoes prepared as future color groups.",
    parts: [
      { name: "Head", sublayer: "OBJ_head_01", color: "#f7c7a0", filament: "PLA-SKIN-03" },
      { name: "Top", sublayer: "OBJ_top_02", color: "#ffffff", filament: "PLA-WHITE-01" },
      { name: "Skirt", sublayer: "OBJ_skirt_03", color: "#2c5bd8", filament: "PLA-BLUE-08" },
      { name: "Trim", sublayer: "OBJ_trim_04", color: "#e95b75", filament: "PLA-PINK-04" }
    ]
  },
  {
    id: "dee-jay-beach",
    code: "CP-025",
    name: "Dee Jay Beach",
    short: "Dee Jay",
    poster: "DEEJAY",
    rarity: "Epic",
    rarityClass: "epic",
    category: "Beach Theme",
    status: "Roster concept",
    digitalPrice: 5,
    sizePrices: { 15: 39, 30: 71, 40: 109 },
    creditValue: 280,
    loyaltyGain: 34,
    palette: ["#6b3b26", "#fff467", "#ff824d", "#0c9f96"],
    glow: "#ffe75d",
    line: "Music-energy beach roster slot with bright stage colors.",
    printNote: "Hair / torso / shorts / base planned for FDM color splits.",
    parts: [
      { name: "Skin", sublayer: "OBJ_skin_01", color: "#6b3b26", filament: "PLA-BROWN-05" },
      { name: "Top", sublayer: "OBJ_top_02", color: "#fff467", filament: "PLA-YELLOW-03" },
      { name: "Shorts", sublayer: "OBJ_shorts_03", color: "#ff824d", filament: "PLA-ORANGE-05" },
      { name: "Base", sublayer: "OBJ_base_04", color: "#0c9f96", filament: "PLA-TEAL-06" }
    ]
  },
  {
    id: "dhalsim-mystic",
    code: "CP-026",
    name: "Dhalsim Mystic",
    short: "Dhalsim",
    poster: "DHALSIM",
    rarity: "Rare",
    rarityClass: "rare",
    category: "Street Fighters",
    status: "Roster concept",
    digitalPrice: 5,
    sizePrices: { 15: 37, 30: 69, 40: 106 },
    creditValue: 255,
    loyaltyGain: 33,
    palette: ["#a66a38", "#f06f2f", "#fff1b1", "#2b1b16"],
    glow: "#ff9b3d",
    line: "Mystic arcade roster slot with poster-style shelf energy.",
    printNote: "Head / torso / wraps / base planned for readable color splits.",
    parts: [
      { name: "Skin", sublayer: "OBJ_skin_01", color: "#a66a38", filament: "PLA-BROWN-03" },
      { name: "Cloth", sublayer: "OBJ_cloth_02", color: "#f06f2f", filament: "PLA-ORANGE-04" },
      { name: "Wraps", sublayer: "OBJ_wraps_03", color: "#fff1b1", filament: "PLA-YELLOW-02" },
      { name: "Base", sublayer: "OBJ_base_04", color: "#2b1b16", filament: "PLA-DARK-BROWN" }
    ]
  }
];

const modeLabels = ["Lobby", "Profile", "3D Studio", "Loot", "Mini Game", "Rewards"];

const collectionFilters = [
  { id: "all", label: "View All", note: "Full playable shelf", ids: products.map((item) => item.id) },
  { id: "90s-arcade", label: "90s Arcade", note: "Arcade nostalgia wall", ids: ["sagat-corporate", "cammy-sf6", "johnny-cage", "sonya-blade", "raiden-vault", "ryu-classic", "ken-retro", "chun-arcade", "guile-shelf", "blanka-burst", "vega-mask", "balrog-boxer", "akuma-shadow", "dhalsim-mystic"] },
  { id: "street-fighters", label: "Street Fighters", note: "18-slot tournament select", ids: ["sagat-corporate", "cammy-sf6", "ryu-classic", "ken-retro", "chun-arcade", "guile-shelf", "blanka-burst", "vega-mask", "balrog-boxer", "akuma-shadow", "bison-summer", "sakura-club", "dee-jay-beach", "dhalsim-mystic", "johnny-cage", "sonya-blade", "raiden-vault", "shadow-founder", "cammy-sf6"] },
  { id: "MK Arena", label: "MK Arena", note: "Combat shelf", ids: ["johnny-cage", "sonya-blade", "raiden-vault", "shadow-founder"] },
  { id: "beach-theme", label: "Beach Theme", note: "Summer body drops", ids: ["cammy-sf6", "sonya-blade", "bison-summer", "dee-jay-beach"] },
  { id: "vault-rares", label: "Vault Rares", note: "High value unlocks", ids: ["raiden-vault", "shadow-founder", "akuma-shadow", "blanka-burst"] }
];

const productRanks = {
  "sagat-corporate": { popularity: 72, release: 1 },
  "cammy-sf6": { popularity: 79, release: 2 },
  "johnny-cage": { popularity: 86, release: 3 },
  "sonya-blade": { popularity: 93, release: 4 },
  "raiden-vault": { popularity: 100, release: 5 },
  "shadow-founder": { popularity: 78, release: 6 },
  "ryu-classic": { popularity: 85, release: 7 },
  "ken-retro": { popularity: 92, release: 8 },
  "chun-arcade": { popularity: 99, release: 9 },
  "guile-shelf": { popularity: 77, release: 10 },
  "blanka-burst": { popularity: 84, release: 11 },
  "vega-mask": { popularity: 91, release: 12 },
  "balrog-boxer": { popularity: 98, release: 13 },
  "akuma-shadow": { popularity: 76, release: 14 },
  "bison-summer": { popularity: 83, release: 15 },
  "sakura-club": { popularity: 90, release: 16 },
  "dee-jay-beach": { popularity: 97, release: 17 },
  "dhalsim-mystic": { popularity: 83, release: 18 }
};

const sortOptions = [
  { id: "newest", label: "Newest" },
  { id: "popular", label: "Most Popular" },
  { id: "expensive", label: "Highest Price" }
];

const earnMissions = [
  { id: "daily", title: "Daily check-in", value: "+20 units", detail: "Open the lobby once per day and keep the collector streak alive.", icon: "◐", mode: "Rewards" },
  { id: "make", title: "Upload a make", value: "+80 units", detail: "Share a printed build photo to the makes gallery once the gallery module is active.", icon: "▧", mode: "Profile" },
  { id: "tag", title: "Tag CyberPop on Instagram", value: "+120 units", detail: "Post your printed model and tag the account to request a manual reward review.", icon: "✦", mode: "Profile" },
  { id: "app", title: "Mobile companion app", value: "+150 units", detail: "A future app slot for push missions, streaks, and collection alerts.", icon: "▣", mode: "Mini Game" },
  { id: "studio", title: "Finish a color plan", value: "+40 units", detail: "Assign filament codes to every 3MF part inside the 3D Studio.", icon: "◆", mode: "3D Studio" }
];

const rewardMilestones = [
  {
    id: "wallpaper-sagat",
    xp: 8,
    type: "Wallpaper",
    title: "Sagat Corporate Wallpaper",
    description: "A clean cover-image style wallpaper reward for the collector profile library.",
    characterId: "sagat-corporate",
    icon: "▣",
    glow: "#4fc9ff"
  },
  {
    id: "sonya-gif",
    xp: 22,
    type: "GIF",
    title: "Sonya Blade GIF",
    description: "A short animated profile reward connected to the Sonya collectible slot.",
    characterId: "sonya-blade",
    icon: "◈",
    glow: "#7df05a"
  },
  {
    id: "silent-sticker",
    xp: 38,
    type: "Sticker",
    title: "Johnny Cage Silent Sticker",
    description: "A profile sticker reward with a clean comic-card preview style.",
    characterId: "johnny-cage",
    icon: "✦",
    glow: "#40d9ff"
  },
  {
    id: "wheel-spin",
    xp: 54,
    type: "Wheel Spin",
    title: "Bonus Wheel Spin",
    description: "One extra reward spin added to the account reward pool.",
    characterId: "cammy-sf6",
    icon: "✺",
    glow: "#6df0ce"
  },
  {
    id: "vault-artwork",
    xp: 70,
    type: "Artwork",
    title: "Raiden Vault Artwork",
    description: "A premium artwork card for the vault-themed profile gallery.",
    characterId: "raiden-vault",
    icon: "◆",
    glow: "#81efff"
  },
  {
    id: "profile-trophy",
    xp: 84,
    type: "Trophy",
    title: "Rare Hunter Trophy",
    description: "A profile trophy that marks a higher collector loyalty tier.",
    characterId: "shadow-founder",
    icon: "★",
    glow: "#ffd56d"
  },
  {
    id: "character-unlock",
    xp: 96,
    type: "Character Unlock",
    title: "Founder Shadow Character",
    description: "A future character unlock slot. The silhouette stays locked until the required loyalty stage.",
    characterId: "shadow-founder",
    icon: "?",
    glow: "#ffcc63",
    mystery: true
  }
];

function cx(...items) {
  return items.filter(Boolean).join(" ");
}

function Button({ children, onClick, variant = "dark", className = "", disabled = false }) {
  return (
    <button className={cx("btn", `btn-${variant}`, className)} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function hexToRgba(hex) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
  const int = parseInt(full, 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255, 1];
}

function GLBFigure({ product, big = false, studioColors }) {
  const viewerRef = useRef(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !studioColors || studioColors.length === 0) return;

    const applyStudioColors = () => {
      const materials = viewer.model?.materials || [];
      materials.forEach((material, index) => {
        const color = studioColors[index % studioColors.length];
        material.pbrMetallicRoughness?.setBaseColorFactor(hexToRgba(color));
      });
    };

    viewer.addEventListener("load", applyStudioColors);
    const timer = window.setTimeout(applyStudioColors, 300);
    return () => {
      viewer.removeEventListener("load", applyStudioColors);
      window.clearTimeout(timer);
    };
  }, [studioColors, product.id]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    let frame = 0;
    const startedAt = performance.now();
    const orbitDistance = big ? "3.05m" : "3.35m";

    const rotateCamera = (now) => {
      const degrees = ((now - startedAt) / 36) % 360;
      viewer.cameraOrbit = `${degrees}deg 70deg ${orbitDistance}`;
      viewer.jumpCameraToGoal?.();
      frame = window.requestAnimationFrame(rotateCamera);
    };

    frame = window.requestAnimationFrame(rotateCamera);
    return () => window.cancelAnimationFrame(frame);
  }, [product.id, big]);

  return (
    <div className={cx("figureWrap glbFigureWrap", big && "figureBig")} style={{ "--glow": product.glow }}>
      <div className="orbit orbitOne" />
      <div className="orbit orbitTwo" />
      <div className="shadowBlob" />
      <model-viewer
        ref={viewerRef}
        className={cx("glbViewer", big && "glbViewerBig")}
        src={product.modelSrc}
        poster={product.previewSrc || undefined}
        alt={`${product.name} 3D preview`}
        camera-controls
        disable-zoom
        auto-rotate
        auto-rotate-delay="0"
        rotation-per-second="32deg"
        interaction-prompt="none"
        shadow-intensity="0.78"
        exposure="1"
        environment-image="neutral"
        camera-orbit="0deg 70deg 3.2m"
        field-of-view="29deg"
        loading="eager"
        reveal="auto"
      >
        <div className="modelFallback">Loading Sonya GLB...</div>
      </model-viewer>
      <div className="liveModelBadge">Live GLB</div>
    </div>
  );
}

function ProductFigure({ product, big = false, studioColors }) {
  if (product.modelSrc) {
    return <GLBFigure product={product} big={big} studioColors={studioColors} />;
  }

  const colors = studioColors || product.parts.map((part) => part.color);
  return (
    <div className={cx("figureWrap", big && "figureBig")} style={{ "--glow": product.glow }}>
      <div className="orbit orbitOne" />
      <div className="orbit orbitTwo" />
      <div className="shadowBlob" />
      <div className="toyFigure">
        <div className="earLeft" style={{ background: colors[0] }} />
        <div className="earRight" style={{ background: colors[0] }} />
        <div className="head" style={{ background: colors[0] }}>
          <span className="eye eyeA" />
          <span className="eye eyeB" />
          <span className="smile" />
        </div>
        <div className="body" style={{ background: colors[1] || colors[0] }} />
        <div className="arm armLeft" style={{ background: colors[2] || colors[1] }} />
        <div className="arm armRight" style={{ background: colors[2] || colors[1] }} />
        <div className="leg legLeft" style={{ background: colors[3] || colors[2] || colors[1] }} />
        <div className="leg legRight" style={{ background: colors[3] || colors[2] || colors[1] }} />
      </div>
    </div>
  );
}


function CharacterPortrait({ product }) {
  const swatches = product.palette || product.parts.map((part) => part.color);
  if (product.previewSrc) {
    return (
      <div className="portraitBox livePortrait" style={{ "--portraitGlow": product.glow }}>
        <img src={product.previewSrc} alt={`${product.name} preview`} />
      </div>
    );
  }

  return (
    <div className="portraitBox" style={{ "--portraitGlow": product.glow, "--p0": swatches[0], "--p1": swatches[1], "--p2": swatches[2], "--p3": swatches[3] }}>
      <span className="portraitHalo" />
      <span className="portraitHead" />
      <span className="portraitChest" />
      <span className="portraitArm left" />
      <span className="portraitArm right" />
      <span className="portraitBase" />
    </div>
  );
}

const rosterOffsets = [0, -18, 12, -8, 22, -14, 8, -24, 18, -6, 14, -20, 6, 24, -12, 16, -18, 4];
const rosterTilts = [-7, 4, -2, 8, -5, 2, -9, 6, -3, 9, -6, 3, -8, 5, -1, 7, -4, 2];

function FighterSelectArena({ activeCollection, setActiveCollection, sortMode, setSortMode, selectedSize, visibleProducts, selected, onSelect }) {
  const currentCollection = collectionFilters.find((item) => item.id === activeCollection) || collectionFilters[0];
  return (
    <section className="fighterSelectArena" style={{ "--selectedGlow": selected.glow }}>
      <div className="fighterHeader">
        <div>
          <span className="miniEyebrow">Character select</span>
          <h3>{currentCollection.label}</h3>
        </div>
        <div className="fighterTools">
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)} aria-label="Sort characters">
            {sortOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
          <small>{selectedSize} cm price view</small>
        </div>
      </div>

      <div className="rosterTabs" aria-label="Character categories">
        {collectionFilters.map((collection) => (
          <button key={collection.id} className={activeCollection === collection.id ? "active" : ""} onClick={() => setActiveCollection(collection.id)}>
            <b>{collection.label}</b>
            <span>{collection.ids.length} slots</span>
          </button>
        ))}
      </div>

      <div className="fighterSelectGridWrap">
        <div className="selectedFighterPlate">
          <div className="plateBackText">{selected.poster}</div>
          <CharacterPortrait product={selected} />
          <div className="plateMeta">
            <span className={cx("rarity", selected.rarityClass)}>{selected.rarity}</span>
            <h4>{selected.name}</h4>
            <p>{selected.category} · ${selected.sizePrices[selectedSize]}</p>
          </div>
        </div>

        <div className="fighterGrid" aria-label="Scrollable character roster">
          {visibleProducts.map((item, index) => {
            const offset = rosterOffsets[index % rosterOffsets.length];
            const tilt = rosterTilts[index % rosterTilts.length];
            const active = selected.id === item.id;
            return (
              <button
                key={`${item.id}-${index}`}
                className={cx("fighterSlot", active && "active", item.rarityClass)}
                style={{ "--slotGlow": item.glow, "--lift": `${offset}px`, "--tilt": `${tilt}deg`, "--z": `${active ? 46 : 8 + (index % 4) * 6}px` }}
                onClick={() => onSelect(item)}
              >
                <span className="slotCode">{item.code}</span>
                <CharacterPortrait product={item} />
                <strong>{item.short}</strong>
                <small>{item.rarity}</small>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoryControls({ activeCollection, setActiveCollection, sortMode, setSortMode, selectedSize }) {
  return (
    <div className="collectionControls">
      <div className="collectionTabs" aria-label="Character collections">
        {collectionFilters.map((collection) => {
          const count = collection.ids.length;
          return (
            <button
              key={collection.id}
              className={activeCollection === collection.id ? "active" : ""}
              onClick={() => setActiveCollection(collection.id)}
            >
              <b>{collection.label}</b>
              <span>{collection.note}</span>
              <small>{count} models</small>
            </button>
          );
        })}
      </div>

      <div className="sortBox">
        <span>Sort lobby</span>
        <select value={sortMode} onChange={(event) => setSortMode(event.target.value)} aria-label="Sort characters">
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
        <small>Physical price uses {selectedSize} cm.</small>
      </div>
    </div>
  );
}

function ProductRail({ products, selected, onSelect }) {
  return (
    <div className="productRail">
      {products.map((item) => (
        <button key={item.id} className={cx("railItem", selected.id === item.id && "active")} onClick={() => onSelect(item)}>
          <ProductFigure product={item} />
          <div className="railInfo">
            <span className={cx("rarity", item.rarityClass)}>{item.rarity}</span>
            <strong>{item.name}</strong>
            <small>{item.category}</small>
          </div>
        </button>
      ))}
    </div>
  );
}

function PurchasePanel({ selected, selectedSize, setSelectedSize, loyaltyXp, onPurchasePreview }) {
  const physicalPrice = selected.sizePrices[selectedSize];
  const nextXp = Math.min(100, loyaltyXp + selected.loyaltyGain);

  return (
    <aside className="purchasePanel panelGlass">
      <div className="eyebrow">Selected collectible</div>
      <h2>{selected.name}</h2>
      <p>{selected.line}</p>

      <div className="buySwitch">
        <div className="buyOption">
          <div>
            <span>GET STL</span>
            <strong>$5</strong>
          </div>
          <small>Digital product access. May be cheaper through subscription access or bulk bundle packs.</small>
          <Button variant="dark" onClick={onPurchasePreview}>Choose STL</Button>
        </div>

        <div className="buyOption physical">
          <div>
            <span>GET Physical product</span>
            <strong>${physicalPrice}</strong>
          </div>
          <div className="sizeButtons" aria-label="Physical size options">
            {[15, 30, 40].map((size) => (
              <button key={size} className={selectedSize === size ? "active" : ""} onClick={() => setSelectedSize(size)}>
                {size} cm
              </button>
            ))}
          </div>
          <small>Made-to-order physical print. Size changes price, packaging, and print preparation.</small>
          <Button variant="gold" onClick={onPurchasePreview}>Choose physical</Button>
        </div>
      </div>

      <div className="checkoutLoyalty">
        <div className="loyaltyHead">
          <span>Loyalty after this purchase</span>
          <b>+{selected.loyaltyGain} XP</b>
        </div>
        <div className="progress"><span style={{ width: `${nextXp}%` }} /></div>
        <div className="loyaltyUnlocks">
          <span>Activates: profile trophy</span>
          <span>site points</span>
          <span>wheel progress</span>
        </div>
      </div>

      <div className="partSummary">
        {selected.parts.map((part) => (
          <span key={part.name}>{part.name}</span>
        ))}
      </div>
    </aside>
  );
}

function Lobby({ selected, setSelected, selectedSize, setSelectedSize, loyaltyXp, onPurchasePreview, onOpenStudio, setMode, setCreditDrawerOpen }) {
  const [activeCollection, setActiveCollection] = useState("all");
  const [sortMode, setSortMode] = useState("newest");

  const visibleProducts = useMemo(() => {
    const collection = collectionFilters.find((item) => item.id === activeCollection) || collectionFilters[0];
    const filtered = products.filter((item) => collection.ids.includes(item.id));
    return [...filtered].sort((a, b) => {
      if (sortMode === "popular") return (productRanks[b.id]?.popularity || 0) - (productRanks[a.id]?.popularity || 0);
      if (sortMode === "expensive") return (b.sizePrices[selectedSize] || 0) - (a.sizePrices[selectedSize] || 0);
      return (productRanks[b.id]?.release || 0) - (productRanks[a.id]?.release || 0);
    });
  }, [activeCollection, sortMode, selectedSize]);

  useEffect(() => {
    if (visibleProducts.length && !visibleProducts.some((item) => item.id === selected.id)) {
      setSelected(visibleProducts[0]);
    }
  }, [visibleProducts, selected.id, setSelected]);

  return (
    <section className="lobbyLayout">
      <div className="posterWord" aria-hidden="true">{selected.poster}</div>

      <div className="leftDeck panelGlass">
        <div className="eyebrow">Season 00</div>
        <h1>CyberPop Drop Room</h1>
        <p>Pick a collectible, inspect the print plan, choose STL or physical, then move it into the studio for color planning.</p>
        <div className="quickStats">
          <button onClick={() => setCreditDrawerOpen(true)}><b>{selected.creditValue}</b><span>Credit value</span></button>
          <button onClick={() => setMode("Rewards")}><b>{selected.rarity}</b><span>Rarity track</span></button>
          <button onClick={onOpenStudio}><b>{selected.parts.length}</b><span>Color parts</span></button>
        </div>
        <div className="miniMissionRail">
          <button onClick={() => setCreditDrawerOpen(true)}><span>✦</span><b>Earn units</b><small>daily · makes · Instagram tag</small></button>
          <button onClick={() => setMode("Mini Game")}><span>◆</span><b>Play for wheel progress</b><small>arcade layer</small></button>
        </div>
        <Button variant="light" onClick={onOpenStudio}>Open in 3D Studio</Button>
      </div>

      <main className="centerStage panelGlass">
        <div className="stageTopline">
          <span>{selected.code}</span>
          <b className={cx("rarity", selected.rarityClass)}>{selected.rarity}</b>
        </div>
        <ProductFigure product={selected} big />
        <div className="stageCaption">
          <strong>{selected.name}</strong>
          <span>{selected.printNote}</span>
        </div>
        <EngagementStack selected={selected} setMode={setMode} setCreditDrawerOpen={setCreditDrawerOpen} />
        <FighterSelectArena
          activeCollection={activeCollection}
          setActiveCollection={setActiveCollection}
          sortMode={sortMode}
          setSortMode={setSortMode}
          selectedSize={selectedSize}
          visibleProducts={visibleProducts}
          selected={selected}
          onSelect={setSelected}
        />
      </main>

      <PurchasePanel
        selected={selected}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        loyaltyXp={loyaltyXp}
        onPurchasePreview={onPurchasePreview}
      />
    </section>
  );
}

function Profile({ profile, setProfile, ownedIds, setOwnedIds, selected, setSelected, setMode }) {
  const owned = products.filter((item) => ownedIds.includes(item.id));
  const locked = products.filter((item) => !ownedIds.includes(item.id));
  const inventoryList = [...owned, ...locked];
  const [card, setCard] = useState(selected);

  return (
    <section className="profileGrid pagePanel">
      <div className="profileCreate panelGlass">
        <div className="eyebrow">Profile setup</div>
        <h2>Create collector profile</h2>
        <label>Display name<input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Your collector name" /></label>
        <label>Printer setup<input value={profile.printer} onChange={(e) => setProfile({ ...profile, printer: e.target.value })} placeholder="Bambu A1 / P1S / X1C..." /></label>
        <label>Favorite filament<input value={profile.filament} onChange={(e) => setProfile({ ...profile, filament: e.target.value })} placeholder="PLA Matte Black, PLA-CYAN-04..." /></label>
        <div className="profileCardMini">
          <div className="avatar">CP</div>
          <div><b>{profile.name || "New Collector"}</b><span>{profile.printer || "Printer setup not set"}</span></div>
        </div>
      </div>

      <div className="inventory panelGlass">
        <div className="sectionHead">
          <div><div className="eyebrow">My collection</div><h2>Purchased characters</h2><p className="inventorySubline">Unlocked characters from checkout, drops, and loyalty rewards appear here first.</p></div>
          <button className="textButton" onClick={() => setOwnedIds(products.map((p) => p.id))}>Demo unlock all</button>
        </div>
        <div className="inventoryGrid">
          {inventoryList.map((item) => {
            const owned = ownedIds.includes(item.id);
            return (
              <button key={item.id} className={cx("inventoryTile", owned ? "owned" : "locked")} onClick={() => { setCard(item); setSelected(item); }}>
                <ProductFigure product={item} />
                <span className={cx("rarity", item.rarityClass)}>{item.rarity}</span>
                <strong>{item.name}</strong>
                <small>{owned ? "Owned" : "Locked"}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div className="characterCard panelGlass">
        <div className="cardVisual"><ProductFigure product={card} big /></div>
        <span className={cx("rarity", card.rarityClass)}>{card.rarity}</span>
        <h2>{card.name}</h2>
        <p>{card.line}</p>
        <div className="partSummary">{card.parts.map((part) => <span key={part.name}>{part.name}</span>)}</div>
        <Button variant="dark" onClick={() => { setSelected(card); setMode("3D Studio"); }}>Open in 3D Studio</Button>
      </div>
    </section>
  );
}

function Studio({ selected }) {
  const [partColors, setPartColors] = useState(selected.parts.map((part) => part.color));
  const [filaments, setFilaments] = useState(selected.parts.map((part) => part.filament));

  function setPartColor(index, value) {
    const copy = [...partColors];
    copy[index] = value;
    setPartColors(copy);
  }

  function setFilament(index, value) {
    const copy = [...filaments];
    copy[index] = value;
    setFilaments(copy);
  }

  return (
    <section className="studioLayout pagePanel">
      <div className="studioStage panelGlass">
        <div className="eyebrow">3D Studio</div>
        <h2>{selected.name}</h2>
        <p>3MF package loaded. Edit the visible print palette and match every detected part with your own filament code.</p>
        <ProductFigure product={selected} big studioColors={partColors} />
      </div>

      <div className="sublayerPanel panelGlass">
        <div className="sectionHead">
          <div><div className="eyebrow">Bambu 3MF readout</div><h2>Detected parts</h2></div>
          <span className="loadedBadge">3MF loaded</span>
        </div>
        <div className="partsEditor">
          {selected.parts.map((part, index) => (
            <div className="partEditor" key={part.name}>
              <div className="partColor" style={{ background: partColors[index] }} />
              <div className="partMeta">
                <b>{part.name}</b>
                <span>{part.sublayer}</span>
              </div>
              <label>Color<input type="color" value={partColors[index]} onChange={(e) => setPartColor(index, e.target.value)} /></label>
              <label>Enter your filament code<input value={filaments[index]} onChange={(e) => setFilament(index, e.target.value)} /></label>
            </div>
          ))}
        </div>
        <div className="studioNote">Parser is a UI prototype for now. The real version will read object names, sublayers, plates, and filament assignments from the uploaded/prepared 3MF package. Sonya currently uses the supplied low-size colored GLB as the live preview; studio color changes are applied to detected GLB materials as a rough prototype.</div>
      </div>
    </section>
  );
}

function Loot({ siteCredit, setSiteCredit, setSelected, ownedIds, setOwnedIds, triggerRare, setMode }) {
  const [spinning, setSpinning] = useState(false);
  const [spinIndex, setSpinIndex] = useState(3);
  const [result, setResult] = useState(null);
  const [burst, setBurst] = useState(false);
  const cost = 50;

  function runSpin() {
    if (spinning || siteCredit < cost) return;
    setSpinning(true);
    setResult(null);
    setBurst(false);
    setSiteCredit((value) => value - cost);

    const finalIndex = Math.floor(Math.random() * products.length);
    let step = 0;
    const totalSteps = 36 + finalIndex;

    function tick() {
      const next = step % products.length;
      setSpinIndex(next);
      step += 1;

      if (step <= totalSteps) {
        const delay = 28 + Math.pow(step, 1.35) * 3.1;
        window.setTimeout(tick, delay);
      } else {
        const won = products[finalIndex];
        setSpinIndex(finalIndex);
        setSelected(won);
        setOwnedIds((ids) => ids.includes(won.id) ? ids : [...ids, won.id]);
        setBurst(true);
        window.setTimeout(() => {
          setResult(won);
          setSpinning(false);
          if (["Legendary", "Founder"].includes(won.rarity)) triggerRare(won);
        }, 560);
      }
    }

    tick();
  }

  const activeItem = result || products[spinIndex];
  const orbitRotation = spinIndex * -60;

  return (
    <section className="pagePanel lootV2Panel">
      <div className="lootHeaderPanel panelGlass">
        <div>
          <div className="eyebrow">Crystal drop</div>
          <h2>Spend site credit (units)</h2>
          <p>Spin the crystal to reveal one character. The crystal and character preview ring move as one machine, then the winner appears as a poster-card unlock.</p>
        </div>
        <div className="creditBox"><b>{siteCredit}</b><span>available units</span></div>
      </div>

      <div className={cx("crystalRoulette panelGlass", spinning && "spinning", burst && "burst", result && "revealed")} style={{ "--orbitRotation": `${orbitRotation}deg`, "--resultGlow": activeItem.glow }}>
        <div className="rouletteBackdrop">CRYSTAL</div>
        <div className="rouletteFloor" />
        <div className="rouletteOrbit" style={{ "--orbitRotation": `${orbitRotation}deg` }}>
          {products.map((item, index) => (
            <button
              key={item.id}
              className={cx("orbitPreview", index === spinIndex && "active")}
              style={{ "--slotAngle": `${index * 60}deg`, "--slotGlow": item.glow }}
              onClick={() => {
                if (spinning) return;
                setSpinIndex(index);
                setResult(null);
                setSelected(item);
              }}
            >
              <ProductFigure product={item} />
              <span>{item.short}</span>
            </button>
          ))}
        </div>

        <div className="crystalCoreWrap">
          <div className="crystalHalo" />
          <div className="crystal3D">
            <span className="facet facetA" />
            <span className="facet facetB" />
            <span className="facet facetC" />
          </div>
          <div className="crystalShadow" />
        </div>

        {burst && <div className="lootBurst"><span /><span /><span /><span /><span /></div>}

        {result && (
          <div className="lootPosterReveal" style={{ "--posterGlow": result.glow }}>
            <div className="posterBackText">{result.poster}</div>
            <div className="posterFoil" />
            <div className="posterRarity"><span>{result.rarity}</span><b>{result.code}</b></div>
            <div className="posterFigure"><ProductFigure product={result} big /></div>
            <div className="posterCopy">
              <small>Character unlocked</small>
              <h3>{result.name}</h3>
              <p>Added to My Collection · purchased characters shelf</p>
              <div className="posterActions">
                <Button variant="gold" onClick={() => { setSelected(result); setMode("Profile"); }}>View in My Collection</Button>
                <Button variant="light" onClick={() => { setSelected(result); setMode("3D Studio"); }}>Open 3D Studio</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="spinBar panelGlass">
        <div>
          <b>{activeItem.name}</b>
          <span className={cx("rarity", activeItem.rarityClass)}>{activeItem.rarity}</span>
        </div>
        <Button variant="gold" onClick={runSpin} disabled={spinning || siteCredit < cost}>{spinning ? "Crystal spinning..." : `Spend ${cost} units`}</Button>
      </div>
    </section>
  );
}

function MiniGame() {
  return (
    <section className="pagePanel gamesPanel">
      {["Piñata Boss", "Print Runner", "Crystal Forge"].map((title, index) => (
        <div className="gameCard panelGlass" key={title}>
          <div className="gameIcon">{index === 0 ? "✦" : index === 1 ? "›" : "◆"}</div>
          <h2>{title}</h2>
          <p>{index === 0 ? "Break a shelf boss for site points and wheel progress." : index === 1 ? "A simple movement mini game for seasonal rewards." : "Craft reward shards into cosmetics, trophies, and bonus unlocks."}</p>
          <Button variant="light">Prototype slot</Button>
        </div>
      ))}
    </section>
  );
}

function RewardPreviewCard({ reward, unlocked }) {
  const product = products.find((item) => item.id === reward.characterId) || products[0];
  return (
    <div className={cx("rewardPreviewCard", unlocked ? "unlocked" : "locked")} style={{ "--cardGlow": reward.glow }}>
      <div className="rewardPosterWord">{reward.mystery && !unlocked ? "LOCKED" : product.poster}</div>
      <div className="rewardCardShine" />
      <div className="rewardCardTop">
        <span>{reward.type}</span>
        <b>{unlocked ? "Unlocked" : `${reward.xp} XP`}</b>
      </div>
      <div className={cx("rewardFigureSlot", reward.mystery && !unlocked && "mysteryFigureSlot")}>
        <ProductFigure product={product} big />
      </div>
      <div className="rewardCardText">
        <h2>{reward.title}</h2>
        <p>{reward.description}</p>
      </div>
    </div>
  );
}

function Rewards({ loyaltyXp }) {
  const [activeReward, setActiveReward] = useState(rewardMilestones[1]);

  return (
    <section className="pagePanel rewardsPanel rewardTrackPanel">
      <div className="rewardHeader panelGlass">
        <div className="eyebrow">Loyalty path</div>
        <div className="rewardHeaderRow">
          <div>
            <h2>Collector reward track</h2>
            <p>Unlock profile extras across the track: GIFs, stickers, wallpapers, artwork, trophies, wheel spins, and future character unlocks.</p>
          </div>
          <div className="loyaltyScore"><b>{loyaltyXp}</b><span>XP</span></div>
        </div>
      </div>

      <div className="rewardStage panelGlass">
        <div className="rewardProgressLane">
          <div className="rewardProgressBase" />
          <div className="rewardProgressFill" style={{ width: `${loyaltyXp}%` }} />
          {rewardMilestones.map((reward) => {
            const unlocked = loyaltyXp >= reward.xp;
            const product = products.find((item) => item.id === reward.characterId) || products[0];
            return (
              <button
                key={reward.id}
                className={cx("rewardNode", unlocked ? "unlocked" : "locked", activeReward.id === reward.id && "active", reward.mystery && "mystery")}
                style={{ left: `${reward.xp}%`, "--nodeGlow": reward.glow }}
                onMouseEnter={() => setActiveReward(reward)}
                onClick={() => setActiveReward(reward)}
                aria-label={reward.title}
              >
                <span className="nodePulse" />
                <span className="nodeIcon">{reward.icon}</span>
                <span className="nodeMiniFigure"><ProductFigure product={product} /></span>
                <small>{reward.type}</small>
              </button>
            );
          })}
        </div>

        <div className="rewardCardsRow">
          {rewardMilestones.map((reward) => {
            const unlocked = loyaltyXp >= reward.xp;
            return (
              <button
                key={reward.id}
                className={cx("miniRewardCard", unlocked ? "unlocked" : "locked", activeReward.id === reward.id && "active")}
                style={{ "--nodeGlow": reward.glow }}
                onMouseEnter={() => setActiveReward(reward)}
                onClick={() => setActiveReward(reward)}
              >
                <span>{reward.type}</span>
                <b>{reward.title}</b>
                <small>{unlocked ? "Unlocked" : `${reward.xp} XP`}</small>
              </button>
            );
          })}
        </div>
      </div>

      <RewardPreviewCard reward={activeReward} unlocked={loyaltyXp >= activeReward.xp} />
    </section>
  );
}


function DepthBackdrop() {
  return (
    <div className="depthBackdrop" aria-hidden="true">
      <span className="bgOrb orbBlue" />
      <span className="bgOrb orbPurple" />
      <span className="bgOrb orbGold" />
      <span className="midRing ringA" />
      <span className="midRing ringB" />
      <span className="foregroundShard shardA" />
      <span className="foregroundShard shardB" />
      <span className="foregroundShard shardC" />
    </div>
  );
}

function TopActionBar({ selected, siteCredit, loyaltyXp, setMode, setCreditDrawerOpen }) {
  const nextReward = rewardMilestones.find((reward) => reward.xp > loyaltyXp) || rewardMilestones[rewardMilestones.length - 1];
  return (
    <div className="topActionBar">
      <button className="actionCard actionCredit" onClick={() => setCreditDrawerOpen(true)}>
        <span className="actionIcon">✦</span>
        <div><b>Earn units</b><small>{siteCredit} available · missions ready</small></div>
        <em>Open</em>
      </button>
      <button className="actionCard actionStudio" onClick={() => setMode("3D Studio")}>
        <span className="actionIcon">◆</span>
        <div><b>Color plan</b><small>{selected.parts.length} parts · filament codes</small></div>
        <em>Studio</em>
      </button>
      <button className="actionCard actionReward" onClick={() => setMode("Rewards")}>
        <span className="actionIcon">◈</span>
        <div><b>{nextReward.type}</b><small>{nextReward.title}</small></div>
        <i><span style={{ width: `${loyaltyXp}%` }} /></i>
      </button>
    </div>
  );
}

function CreditDrawer({ open, onClose, setMode }) {
  if (!open) return null;
  return (
    <div className="creditOverlay" onClick={onClose}>
      <aside className="creditDrawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawerTop">
          <div><div className="eyebrow">Site credit</div><h2>Unit boost board</h2></div>
          <button onClick={onClose}>×</button>
        </div>
        <div className="unitCore">
          <div className="unitCrystal"><span /></div>
          <div><b>Earn more units</b><p>Choose a visible action, then move into the related section. These are UI hooks for the real reward ledger later.</p></div>
        </div>
        <div className="missionList">
          {earnMissions.map((mission) => (
            <button key={mission.id} className="missionRow" onClick={() => { setMode(mission.mode); onClose(); }}>
              <span className="missionIcon">{mission.icon}</span>
              <div><b>{mission.title}</b><small>{mission.detail}</small></div>
              <strong>{mission.value}</strong>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function EngagementStack({ selected, setMode, setCreditDrawerOpen }) {
  const beams = [
    { title: "Units", detail: "Open missions", action: () => setCreditDrawerOpen(true), icon: "✦" },
    { title: "Studio", detail: `${selected.parts.length} color groups`, action: () => setMode("3D Studio"), icon: "◆" },
    { title: "Rewards", detail: "Track unlocks", action: () => setMode("Rewards"), icon: "◈" }
  ];

  return (
    <div className="engagementStack">
      {beams.map((beam) => (
        <button key={beam.title} onClick={beam.action}>
          <span>{beam.icon}</span>
          <div><b>{beam.title}</b><small>{beam.detail}</small></div>
        </button>
      ))}
    </div>
  );
}

function RareUnlock({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="rareOverlay" onClick={onClose}>
      <div className="legendaryCard" style={{ "--legendGlow": item.glow }}>
        <div className="legendaryPoster">{item.poster}</div>
        <div className="legendaryFoil" />
        <div className="legendaryScanlines" />
        <div className="legendaryTop"><span>{item.rarity}</span><b>{item.code}</b></div>
        <div className="legendaryFigure"><ProductFigure product={item} big /></div>
        <div className="legendaryBottom">
          <small>Character unlocked</small>
          <h2>{item.name}</h2>
        </div>
      </div>
    </div>
  );
}

export default function CyberPopShop() {
  const [mode, setMode] = useState("Lobby");
  const [selected, setSelected] = useState(products.find((item) => item.id === "sonya-blade") || products[0]);
  const [selectedSize, setSelectedSize] = useState(30);
  const [siteCredit, setSiteCredit] = useState(260);
  const [loyaltyXp, setLoyaltyXp] = useState(42);
  const [ownedIds, setOwnedIds] = useState(["sagat-corporate", "cammy-sf6", "sonya-blade"]);
  const [rareItem, setRareItem] = useState(null);
  const [profile, setProfile] = useState({ name: "", printer: "", filament: "" });
  const [creditDrawerOpen, setCreditDrawerOpen] = useState(false);

  const cartCount = useMemo(() => ownedIds.length, [ownedIds]);

  function purchasePreview() {
    setLoyaltyXp((value) => Math.min(100, value + selected.loyaltyGain));
    setSiteCredit((value) => value + 25);
    setOwnedIds((ids) => ids.includes(selected.id) ? ids : [...ids, selected.id]);
    if (["Legendary", "Founder"].includes(selected.rarity)) setRareItem(selected);
  }

  return (
    <div className="appShell">
      <DepthBackdrop />
      <header className="topbar topbarNoBrand">
        <nav className="navModes">
          {modeLabels.map((label) => <button key={label} className={mode === label ? "active" : ""} onClick={() => setMode(label)}>{label}</button>)}
        </nav>
        <div className="topStats">
          <button className="coin interactivePill" onClick={() => setCreditDrawerOpen(true)}><span>✦</span><b>{siteCredit}</b><small>Units</small></button>
          <button className="flowPill" onClick={() => setMode("Rewards")}><span>Rewards</span><b>{loyaltyXp}%</b></button>
          <button className="cartPill" onClick={() => setMode("Profile")}>Inventory {cartCount}</button>
        </div>
      </header>
      <TopActionBar selected={selected} siteCredit={siteCredit} loyaltyXp={loyaltyXp} setMode={setMode} setCreditDrawerOpen={setCreditDrawerOpen} />

      {mode === "Lobby" && <Lobby selected={selected} setSelected={setSelected} selectedSize={selectedSize} setSelectedSize={setSelectedSize} loyaltyXp={loyaltyXp} onPurchasePreview={purchasePreview} onOpenStudio={() => setMode("3D Studio")} setMode={setMode} setCreditDrawerOpen={setCreditDrawerOpen} />}
      {mode === "Profile" && <Profile profile={profile} setProfile={setProfile} ownedIds={ownedIds} setOwnedIds={setOwnedIds} selected={selected} setSelected={setSelected} setMode={setMode} />}
      {mode === "3D Studio" && <Studio selected={selected} />}
      {mode === "Loot" && <Loot siteCredit={siteCredit} setSiteCredit={setSiteCredit} setSelected={setSelected} ownedIds={ownedIds} setOwnedIds={setOwnedIds} triggerRare={setRareItem} setMode={setMode} />}
      {mode === "Mini Game" && <MiniGame />}
      {mode === "Rewards" && <Rewards loyaltyXp={loyaltyXp} />}

      <CreditDrawer open={creditDrawerOpen} onClose={() => setCreditDrawerOpen(false)} setMode={setMode} />
      <RareUnlock item={rareItem} onClose={() => setRareItem(null)} />
    </div>
  );
}
