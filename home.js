import { supabase,initChrome,getSiteMediaSlots,setMediaImage,monthLabel,stateMarkup,esc } from '/site.js';

function productCard(p){
  const media=p.thumbnail_url?'<img src="'+esc(p.thumbnail_url)+'" alt="'+esc(p.public_title)+'" loading="lazy">':'<div class="media-placeholder"><span>1200 × 1400</span></div>';
  return '<a class="store-product-card" href="/product?slug='+encodeURIComponent(p.slug||'')+'"><div class="store-product-media">'+media+'<span class="store-product-badge">NEW</span></div><div class="store-product-body"><h3>'+esc(p.public_title)+'</h3><p>'+esc(p.collection_name||'Collection')+'<br>Multipart · '+(p.ams_required?'AMS':'No AMS')+(p.height_mm?' · '+p.height_mm+' mm':'')+'</p></div></a>';
}
function collectionCard(c){
  const media=c.cover_image_url?'<img src="'+esc(c.cover_image_url)+'" alt="'+esc(c.display_name)+'" loading="lazy">':'<div class="media-placeholder"><span>COLLECTION COVER · 1200 × 900</span></div>';
  return '<a class="collection-tile" href="/collection?slug='+encodeURIComponent(c.slug)+'"><div class="collection-tile-media">'+media+'</div><div class="collection-tile-copy"><span class="eyebrow">'+esc(c.slug)+'</span><h3>'+esc(c.display_name)+'</h3><p>'+Number(c.product_count||0)+' models</p></div></a>';
}
async function loadHome(){
  await initChrome();
  const [slots,overview,collectionRows,products]=await Promise.all([
    getSiteMediaSlots(),
    supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_collections').select('*').eq('is_published',true).order('starts_on',{ascending:false}),
    supabase.from('membership_library_products').select('*').order('collection_starts_on',{ascending:false}).order('product_number',{ascending:false}).limit(12)
  ]);
  if(overview.error)throw overview.error;if(collectionRows.error)throw collectionRows.error;if(products.error)throw products.error;
  const access=overview.data||[],raw=collectionRows.data||[];
  const collections=raw.map(c=>({...c,...(access.find(x=>x.id===c.id)||{})}));
  const latest=collections[0];
  setMediaImage(document.querySelector('#homeHero'),slots.home_hero?.asset_url,'HOMEPAGE HERO · 1920 × 1080');
  if(latest){
    document.querySelector('#heroTitle').textContent=monthLabel(latest.starts_on).toUpperCase()+' COLLECTION';
    document.querySelector('#heroCopy').textContent=Number(latest.product_count||0)+' models in the latest CyberPop monthly drop.';
    document.querySelector('#heroCta').href='/collection?slug='+encodeURIComponent(latest.slug);
    document.querySelector('#latestMeta').textContent=monthLabel(latest.starts_on)+' · '+Number(latest.product_count||0)+' models';
    const banner=document.querySelector('#latestCollectionBanner');banner.className='latest-banner';
    const bannerUrl=slots.home_latest_banner?.asset_url||latest.hero_image_url||latest.cover_image_url;
    banner.innerHTML='<div class="latest-banner-copy"><span class="eyebrow">'+esc(latest.slug)+'</span><h3>'+esc(monthLabel(latest.starts_on))+'</h3><p class="section-copy">'+Number(latest.product_count||0)+' models in this drop.</p><div><a class="btn btn-light" href="/collection?slug='+encodeURIComponent(latest.slug)+'">View Collection →</a></div></div><div class="latest-banner-media media-letterbox">'+(bannerUrl?'<img src="'+esc(bannerUrl)+'" alt="'+esc(latest.display_name)+'">':'<div class="media-placeholder"><span>LATEST BANNER · 1920 × 640</span></div>')+'</div>';
  }else document.querySelector('#latestCollectionBanner').innerHTML=stateMarkup('','Collection preparing','Create or sync a published collection to populate this area.');
  document.querySelector('#newReleaseGrid').innerHTML=(products.data||[]).slice(0,6).map(productCard).join('')||stateMarkup('','No models yet','Synced or manually added models will appear here.');
  document.querySelector('#homeCollections').innerHTML=collections.slice(0,4).map(collectionCard).join('')||stateMarkup('','No collections yet','Collection cards will appear after content is added.');
}
loadHome().catch(e=>{console.error(e);document.querySelector('#newReleaseGrid').innerHTML=stateMarkup('error','Storefront unavailable',e.message)});