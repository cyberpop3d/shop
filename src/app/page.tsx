'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeCheck,
  Box,
  ChevronRight,
  Coins,
  Crown,
  Download,
  Eye,
  Flame,
  Gamepad2,
  Gift,
  Heart,
  ImageIcon,
  Layers3,
  LockKeyhole,
  Package,
  Palette,
  Rotate3D,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Swords,
  Trophy,
  UserRound,
  X
} from 'lucide-react';
import { bossParts, makes, Product, products, quests } from '@/lib/data';

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function Button({ children, onClick, variant = 'primary', className = '', disabled = false }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  disabled?: boolean;
}) {
  const variants = {
    primary: 'bg-slate-950 text-white hover:bg-slate-800 shadow-card',
    secondary: 'bg-white/75 text-slate-950 border border-white/80 hover:bg-white',
    ghost: 'bg-white/30 text-slate-900 border border-sky-100 hover:bg-white/60',
    danger: 'bg-rose-500 text-white hover:bg-rose-600'
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black tracking-tight transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

function Tag({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-2 text-xs font-black text-slate-700 shadow-sm">
      {icon}{children}
    </span>
  );
}

function Header({ cartCount, xp, openCart }: { cartCount: number; xp: number; openCart: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/55 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-soft">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-base font-black uppercase tracking-[0.28em] text-slate-950">Cyberpop3D</div>
            <div className="text-xs font-bold text-slate-500">Playable STL + Physical Print Shop</div>
          </div>
        </div>
        <nav className="hidden items-center gap-2 lg:flex">
          {['Shop', 'Collections', 'Library', 'Rewards', 'Games', 'Makes'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white/70 hover:text-slate-950">
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Tag icon={<Coins size={14} />}>{xp} PopBits</Tag>
          <Button variant="primary" onClick={openCart} className="px-4 py-2">
            <ShoppingCart size={16} /> {cartCount}
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero({ scrollToShop, scrollToGames }: { scrollToShop: () => void; scrollToGames: () => void }) {
  return (
    <section className="relative mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:py-14">
      <div className="glass overflow-hidden rounded-[2.75rem] p-7 sm:p-10">
        <div className="flex flex-wrap gap-2">
          <Tag icon={<Crown size={14} />}>Premium Toy Platform</Tag>
          <Tag icon={<Gamepad2 size={14} />}>Game UI Energy</Tag>
          <Tag icon={<Rotate3D size={14} />}>3D Preview Ready</Tag>
        </div>
        <h1 className="mt-8 max-w-4xl text-5xl font-black leading-[.92] tracking-[-.07em] text-slate-950 sm:text-7xl lg:text-8xl">
          A playable world for printable collectibles.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Buy STL files, physical figures, stands, accessories, and digital collection rewards inside a bright Cyberpop universe built for collectors, makers, and playful product discovery.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={scrollToShop}>Enter the Shop <ChevronRight size={18} /></Button>
          <Button variant="secondary" onClick={scrollToGames}>Play for Rewards <Flame size={18} /></Button>
        </div>
      </div>

      <div className="dark-glass relative overflow-hidden rounded-[2.75rem] p-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_25%,rgba(92,200,255,.48),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,.20),transparent_28%)]" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <Tag icon={<Star size={14} />}>Season 01 Preview</Tag>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-950">NEW DROP</span>
          </div>
          <div className="relative mt-8 flex h-[340px] items-end justify-center rounded-[2.25rem] border border-white/10 bg-white/10 p-6">
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, -2, 2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative h-64 w-48"
            >
              <div className="absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-[2rem] bg-gradient-to-br from-white to-sky-200 shadow-2xl" />
              <div className="absolute left-1/2 top-20 h-40 w-40 -translate-x-1/2 rounded-[3rem] bg-gradient-to-br from-sky-300 to-cyan-500 shadow-[0_50px_110px_rgba(56,189,248,.35)]" />
              <div className="absolute bottom-0 left-1/2 h-8 w-64 -translate-x-1/2 rounded-full bg-black/35 blur-md" />
            </motion.div>
            <div className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] border border-white/10 bg-slate-950/65 p-4 backdrop-blur-xl">
              <div className="text-xs font-black uppercase tracking-[.28em] text-sky-200">Current spotlight</div>
              <div className="mt-1 flex items-center justify-between">
                <div className="text-2xl font-black">Beach Power Cat</div>
                <div className="text-xl font-black">$82</div>
              </div>
              <div className="mt-2 text-sm text-white/65">Physical print · collector card · profile badge</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, select, addToCart }: { product: Product; select: () => void; addToCart: () => void }) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      className="group glass relative overflow-hidden rounded-[2rem] p-4"
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(circle at 50% 0%, ${product.accent}35, transparent 55%)` }} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <Tag>{product.kind}</Tag>
          <button className="rounded-full bg-white/65 p-2 text-slate-500 hover:text-rose-500"><Heart size={17} /></button>
        </div>
        <button onClick={select} className="mt-4 flex h-52 w-full items-center justify-center overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/50">
          <motion.div whileHover={{ rotate: 6, scale: 1.05 }} className="relative h-36 w-32">
            <div className="absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 rounded-[1.5rem] shadow-lg" style={{ background: product.accent }} />
            <div className="absolute left-1/2 top-14 h-24 w-28 -translate-x-1/2 rounded-[2.1rem] shadow-xl" style={{ background: `linear-gradient(135deg, ${product.accent}, #ffffff)` }} />
            <div className="absolute bottom-0 left-1/2 h-4 w-36 -translate-x-1/2 rounded-full bg-slate-500/20 blur-sm" />
          </motion.div>
        </button>
        <div className="mt-4">
          <div className="text-xs font-black uppercase tracking-[.22em] text-slate-400">{product.collection}</div>
          <h3 className="mt-1 min-h-14 text-2xl font-black leading-none tracking-[-.04em] text-slate-950">{product.name}</h3>
          <p className="mt-2 text-sm font-bold text-slate-500">{product.scale}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Starting at</div>
            <div className="text-3xl font-black text-slate-950">${product.price}</div>
          </div>
          <Button variant="primary" onClick={addToCart} className="px-4 py-2">Add</Button>
        </div>
      </div>
    </motion.article>
  );
}

function ProductModal({ product, close, addToCart }: { product: Product | null; close: () => void; addToCart: (p: Product) => void }) {
  if (!product) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950/55 p-4 backdrop-blur-xl" onClick={close}>
        <motion.div
          initial={{ y: 30, opacity: 0, scale: .98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: .98 }}
          onClick={(e) => e.stopPropagation()}
          className="mx-auto grid max-h-[92vh] max-w-6xl overflow-auto rounded-[2.5rem] bg-white p-4 shadow-2xl lg:grid-cols-[1fr_.85fr]"
        >
          <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-100 to-white p-6">
            <button onClick={close} className="absolute right-4 top-4 z-20 rounded-full bg-white p-3 shadow-lg"><X size={18} /></button>
            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 32%, ${product.accent}66, transparent 42%)` }} />
            <div className="relative flex h-full min-h-[470px] items-center justify-center">
              <motion.div drag dragConstraints={{ left: -100, right: 100, top: -60, bottom: 60 }} whileTap={{ cursor: 'grabbing' }} className="relative h-72 w-56 cursor-grab">
                <div className="absolute left-1/2 top-0 h-28 w-28 -translate-x-1/2 rounded-[2.4rem] shadow-2xl" style={{ background: product.accent }} />
                <div className="absolute left-1/2 top-24 h-48 w-52 -translate-x-1/2 rounded-[4rem] shadow-2xl" style={{ background: `linear-gradient(135deg, ${product.accent}, #fff)` }} />
                <div className="absolute bottom-0 left-1/2 h-9 w-80 -translate-x-1/2 rounded-full bg-slate-600/20 blur-lg" />
              </motion.div>
            </div>
            <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-3">
              <Tag icon={<Rotate3D size={14} />}>{product.previewMode}</Tag>
              <Tag icon={<Palette size={14} />}>Color preview planned</Tag>
              <Tag icon={<Layers3 size={14} />}>{product.parts.length} parts</Tag>
            </div>
          </div>
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <Tag>{product.kind}</Tag>
              <Tag>{product.difficulty} print</Tag>
            </div>
            <h2 className="mt-5 text-5xl font-black leading-none tracking-[-.06em] text-slate-950">{product.name}</h2>
            <p className="mt-5 text-base leading-7 text-slate-600">{product.description}</p>
            <div className="mt-6 rounded-[2rem] bg-sky-50 p-5">
              <div className="text-xs font-black uppercase tracking-[.22em] text-slate-400">What is included</div>
              <div className="mt-4 grid gap-2">
                {product.includes.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm font-bold text-slate-700">
                    <BadgeCheck size={17} className="text-sky-500" /> {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 rounded-[2rem] border border-sky-100 p-5">
              <div className="text-xs font-black uppercase tracking-[.22em] text-slate-400">Multipart breakdown</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.parts.map((part) => <Tag key={part} icon={<Box size={14} />}>{part}</Tag>)}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between rounded-[2rem] bg-slate-950 p-5 text-white">
              <div>
                <div className="text-xs font-black uppercase tracking-[.22em] text-white/45">Price</div>
                <div className="text-4xl font-black">${product.price}</div>
              </div>
              <Button variant="secondary" onClick={() => addToCart(product)}>Add to cart</Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function RewardsPanel({ xp, setXp }: { xp: number; setXp: React.Dispatch<React.SetStateAction<number>> }) {
  const [bossState, setBossState] = useState(bossParts);
  const [unlocked, setUnlocked] = useState<string[]>([]);

  function hitBoss(id: string) {
    setBossState((state) => state.map((m) => m.id === id ? { ...m, current: Math.max(0, m.current - 18) } : m));
    setXp((current) => current + 12);
    if (xp + 12 >= 60 && !unlocked.includes('POPBITS-5')) setUnlocked((u) => [...u, 'POPBITS-5']);
  }

  return (
    <section id="games" className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
        <div className="dark-glass rounded-[2.5rem] p-7 text-white">
          <Tag icon={<Swords size={14} />}>Mini Game Hub</Tag>
          <h2 className="mt-5 text-4xl font-black tracking-[-.06em]">Piñata Boss Demo</h2>
          <p className="mt-3 text-sm leading-6 text-white/65">A lightweight reward loop: users collect PopBits, damage monthly monsters, and unlock coupons or cosmetics. Real rewards should be calculated server-side.</p>
          <div className="mt-6 space-y-3">
            {bossState.map((monster) => (
              <div key={monster.id} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-black">{monster.name}</div>
                  <Button variant="secondary" className="px-4 py-2" onClick={() => hitBoss(monster.id)}>Hit +12 XP</Button>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/25">
                  <motion.div className="h-full rounded-full bg-sky-300" animate={{ width: `${monster.current}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-[2.5rem] p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Tag icon={<Gift size={14} />}>Rewards</Tag>
              <h2 className="mt-5 text-4xl font-black tracking-[-.06em] text-slate-950">Loyalty loop</h2>
            </div>
            <div className="rounded-[1.5rem] bg-white/70 px-5 py-4 text-center shadow-sm">
              <div className="text-xs font-black uppercase tracking-[.2em] text-slate-400">PopBits</div>
              <div className="text-4xl font-black text-slate-950">{xp}</div>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {quests.map((quest) => (
              <div key={quest.id} className="rounded-[1.5rem] bg-white/65 p-4 shadow-sm">
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="font-black text-slate-950">{quest.label}</div>
                    <div className="text-sm font-bold text-sky-700">{quest.reward}</div>
                  </div>
                  <div className="text-sm font-black text-slate-400">{quest.progress}%</div>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-sky-100">
                  <div className="h-full rounded-full bg-sky-400" style={{ width: `${quest.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[1.5rem] border border-sky-100 bg-sky-50/70 p-4 text-sm font-bold text-slate-600">
            Unlocked coupons: {unlocked.length ? unlocked.join(', ') : 'No coupon unlocked yet'}
          </div>
        </div>
      </div>
    </section>
  );
}

function LibraryAndMakes() {
  return (
    <section id="library" className="mx-auto mt-8 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[.85fr_1.15fr]">
      <div className="glass rounded-[2.5rem] p-7">
        <Tag icon={<Download size={14} />}>My Library Preview</Tag>
        <h2 className="mt-5 text-4xl font-black tracking-[-.06em] text-slate-950">Purchased files stay protected.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">The production version should use authenticated or signed downloads for STL, 3MF, ZIP packages, licenses, and version updates.</p>
        <div className="mt-6 space-y-3">
          {['Beach Power Cat — STL archive', 'Sky Dock Display Base — 3MF', 'Starter Pack — license note'].map((file) => (
            <div key={file} className="flex items-center justify-between rounded-[1.5rem] bg-white/70 p-4 shadow-sm">
              <div className="flex items-center gap-3 font-bold text-slate-700"><Package size={18} /> {file}</div>
              <LockKeyhole size={17} className="text-slate-400" />
            </div>
          ))}
        </div>
      </div>
      <div id="makes" className="glass rounded-[2.5rem] p-7">
        <Tag icon={<ImageIcon size={14} />}>Makes Gallery</Tag>
        <h2 className="mt-5 text-4xl font-black tracking-[-.06em] text-slate-950">Seed the world with real prints.</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {makes.map((make) => (
            <div key={make.id} className="rounded-[1.75rem] bg-white/70 p-4 shadow-sm">
              <div className="flex h-32 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-sky-100 to-white">
                <ImageIcon className="text-sky-400" size={34} />
              </div>
              <div className="mt-3 text-sm font-black text-slate-950">{make.title}</div>
              <div className="mt-1 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{make.user}</span>
                <span>{make.likes} likes</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CartDrawer({ cart, close }: { cart: Product[]; close: () => void }) {
  const total = useMemo(() => cart.reduce((sum, p) => sum + p.price, 0), [cart]);
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950/45 p-4 backdrop-blur-xl" onClick={close}>
        <motion.aside initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} onClick={(e) => e.stopPropagation()} className="ml-auto flex h-full max-w-md flex-col rounded-[2.25rem] bg-white p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-[-.05em]">Cart mockup</h2>
            <button onClick={close} className="rounded-full bg-sky-50 p-3"><X size={18} /></button>
          </div>
          <div className="mt-5 flex-1 space-y-3 overflow-auto">
            {cart.length === 0 ? <div className="rounded-[1.5rem] bg-sky-50 p-5 text-sm font-bold text-slate-500">Your cart is empty.</div> : cart.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center justify-between rounded-[1.5rem] bg-sky-50 p-4">
                <div>
                  <div className="font-black text-slate-950">{item.name}</div>
                  <div className="text-xs font-bold text-slate-500">{item.kind} · {item.scale}</div>
                </div>
                <div className="font-black">${item.price}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[1.75rem] bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white/55">Prototype total</span>
              <span className="text-4xl font-black">${total}</span>
            </div>
            <Button className="mt-4 w-full" variant="secondary" disabled={cart.length === 0}>Continue to checkout</Button>
            <p className="mt-3 text-xs leading-5 text-white/45">The real checkout can connect to Stripe, Shopify, merchant-of-record, or a staged payment provider.</p>
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}

export default function CyberpopShopHome() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [xp, setXp] = useState(0);

  function addToCart(product: Product) {
    setCart((items) => [...items, product]);
    setCartOpen(true);
  }

  return (
    <div className="cyber-bg min-h-screen text-slate-950">
      <Header cartCount={cart.length} xp={xp} openCart={() => setCartOpen(true)} />
      <Hero scrollToShop={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })} scrollToGames={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })} />
      <section id="shop" className="mx-auto mt-2 max-w-7xl px-4 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Tag icon={<ShoppingCart size={14} />}>Shop / Catalog MVP</Tag>
            <h2 className="mt-4 text-5xl font-black tracking-[-.07em] text-slate-950">STLs, physical figures, stands, and bundles.</h2>
          </div>
          <p className="max-w-xl text-sm font-bold leading-6 text-slate-500">A first storefront layer for products, collection progress, authenticated files, physical print offers, and later 3D viewer/customizer integration.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} select={() => setSelectedProduct(product)} addToCart={() => addToCart(product)} />
          ))}
        </div>
      </section>
      <RewardsPanel xp={xp} setXp={setXp} />
      <LibraryAndMakes />
      <section id="contests" className="mx-auto mt-8 max-w-7xl px-4 pb-16 sm:px-6">
        <div className="dark-glass rounded-[2.5rem] p-8 text-white">
          <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <Tag icon={<Trophy size={14} />}>Coming Soon</Tag>
              <h2 className="mt-5 text-5xl font-black tracking-[-.07em]">Design Arena & contests</h2>
            </div>
            <p className="text-base leading-8 text-white/65">Future phases can add design, print, painting, and diorama contests with moderation, rewards, leaderboard visibility, gallery placement, and seasonal collection rituals.</p>
          </div>
        </div>
      </section>
      <ProductModal product={selectedProduct} close={() => setSelectedProduct(null)} addToCart={addToCart} />
      {cartOpen && <CartDrawer cart={cart} close={() => setCartOpen(false)} />}
    </div>
  );
}
