import { supabase,initChrome,getSiteMediaSlots,monthLabel,stateMarkup,loadingMarkup,friendlyError,esc } from '/site.js';

function productCard(p){
  const media=p.thumbnail_url?'<img src="'+esc(p.thumbnail_url)+'" alt="'+esc(p.public_title)+'" loading="lazy">':'<div class="media-placeholder"><span>1200 × 1400</span></div>';
  const badge=p.has_access?'<span class="work-access">IN YOUR LIBRARY</span>':'';
  return '<a class="store-product-card" href="/product?slug='+encodeURIComponent(p.slug||'')+'"><div class="store-product-media">'+media+badge+'</div><div class="store-product-body"><h3>'+esc(p.public_title)+'</h3><p>'+esc(p.collection_name||'CyberPop Collection')+'</p></div></a>';
}
function collectionCard(c,previewImage){
  const image=c.cover_image_url||previewImage;
  const media=image?'<img src="'+esc(image)+'" alt="'+esc(c.display_name)+'" loading="lazy">':'<div class="media-placeholder"><span>COLLECTION COVER</span></div>';
  return '<a class="collection-tile" href="/collection?slug='+encodeURIComponent(c.slug)+'"><div class="collection-tile-media">'+media+'<span class="collection-open">VIEW COLLECTION ↗</span></div><div class="collection-tile-copy"><span class="eyebrow">'+esc(c.slug)+'</span><h3>'+esc(c.display_name)+'</h3><p>'+Number(c.product_count||0)+' models'+(c.has_access?' · in your library':'')+'</p></div></a>';
}
const visualWorks=[
  ['cammy.png','Cammy'],['johnny-cage.png','Johnny Cage'],['dhalsim.webp','Dhalsim'],['juri.webp','Juri']
];
function renderVisualWorks(){
  return visualWorks.map(([file,name],i)=>'<a class="store-product-card fallback-work" href="/collections"><div class="store-product-media"><img src="/images/covers/'+file+'" alt="'+name+' CyberPop 3D character design" loading="lazy"><span class="work-number">0'+(i+1)+'</span></div><div class="store-product-body"><h3>'+name+'</h3><p>CyberPop character study</p></div></a>').join('');
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
  const modelRows=products.data||[];
  if(slots.home_hero?.asset_url){
    const heroImage=document.querySelector('.hero-art-main img');
    if(heroImage)heroImage.src=slots.home_hero.asset_url;
  }
  if(latest){
    document.querySelector('#latestSection').hidden=false;
    document.querySelector('#latestMeta').textContent=monthLabel(latest.starts_on)+' · '+Number(latest.product_count||0)+' models';
    const banner=document.querySelector('#latestCollectionBanner');banner.className='latest-banner';
    const bannerUrl=latest.cover_image_url||modelRows.find(p=>p.collection_id===latest.id)?.thumbnail_url||latest.hero_image_url;
    banner.innerHTML='<a class="latest-banner-art" href="/collection?slug='+encodeURIComponent(latest.slug)+'">'+(bannerUrl?'<img src="'+esc(bannerUrl)+'" alt="'+esc(latest.display_name)+'" loading="lazy">':'<div class="media-placeholder"><span>CYBERPOP COLLECTION</span></div>')+'<span class="collection-open">OPEN COLLECTION ↗</span></a><div class="latest-banner-copy"><span class="eyebrow">'+esc(latest.slug)+' · '+Number(latest.product_count||0)+' MODELS</span><h3>'+esc(monthLabel(latest.starts_on))+'</h3><p>'+esc(latest.description||'A monthly collection of CyberPop character designs.')+'</p><a class="text-link" href="/collection?slug='+encodeURIComponent(latest.slug)+'">View Collection <span aria-hidden="true">↗</span></a></div>';
  }else{
    document.querySelector('#latestSection').hidden=true;
  }
  document.querySelector('#newReleaseGrid').innerHTML=modelRows.length?modelRows.slice(0,4).map(productCard).join(''):renderVisualWorks();
  document.querySelector('#homeCollections').innerHTML=collections.length?collections.slice(0,4).map(c=>collectionCard(c,modelRows.find(p=>p.collection_id===c.id)?.thumbnail_url)).join(''):stateMarkup('empty','No collections yet','Published monthly drops will appear here automatically.');
}
document.querySelector('#newReleaseGrid').innerHTML=loadingMarkup(4,'card');
loadHome().catch(e=>{
  console.error(e);
  document.querySelector('#latestSection').hidden=true;
  document.querySelector('#newReleaseGrid').innerHTML=renderVisualWorks();
  document.querySelector('#homeCollections').innerHTML=stateMarkup('error','Archive unavailable',friendlyError(e,'The collection archive could not be loaded.'),{href:'/',label:'Retry'});
});
