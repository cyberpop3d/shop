import { supabase,initChrome,getSiteMediaSlots,monthLabel,stateMarkup,mediaMarkup,esc } from '/site.js';

const collectionHref=c=>'/collection?slug='+encodeURIComponent(c.slug);
const productHref=p=>'/product?slug='+encodeURIComponent(p.slug||'');
const month=c=>monthLabel(c.starts_on);
const curatedCover=c=>/^2026-(04|05|06|07|08|09|10)$/.test(c.slug||'')?'/images/cults/'+c.slug+'.webp':'';
const curatedWorks=[
  {public_title:'Ghost Rider',collection_name:'September 2026',thumbnail_url:'/images/cults/2026-09.webp',cults_public_url:'https://cults3d.com/en/3d-model/art/ghost-rider-multipart-no-ams'},
  {public_title:'Morrigan Aensland',collection_name:'August 2026',thumbnail_url:'/images/cults/2026-08.webp',cults_public_url:'https://cults3d.com/en/3d-model/art/morrigan-aensland-multipart-no-ams'},
  {public_title:'Jin Kazama',collection_name:'July 2026',thumbnail_url:'/images/cults/2026-07.webp',cults_public_url:'https://cults3d.com/en/3d-model/art/arcade-fighter'},
  {public_title:'Carnage',collection_name:'June 2026',thumbnail_url:'/images/cults/2026-06.webp',cults_public_url:'https://cults3d.com/en/3d-model/art/carnage-multipart-no-ams'},
  {public_title:'Raiden',collection_name:'May 2026',thumbnail_url:'/images/cults/2026-05.webp',cults_public_url:'https://cults3d.com/en/3d-model/art/raiden-mortal-kombat-fan-art-no-ams-multi-part-3mf'},
  {public_title:'Red-Eyes Black Dragon',collection_name:'April 2026',thumbnail_url:'/images/cults/2026-04.webp',cults_public_url:'https://cults3d.com/en/3d-model/art/red-eyes-black-dragon-pet-multi-color-fdm'}
];
const cleanTitle=title=>String(title||'').replace(/\s+Multipart\b.*$/i,'').trim();
async function publicSnapshot(){
  const response=await fetch('/data/cults-collections.json',{cache:'no-store'});
  return response.ok?(await response.json()).collections||{}:{};
}
const archiveFallback=Array.from({length:7},(_,i)=>{
  const number=10-i;
  const slug='2026-'+String(number).padStart(2,'0');
  return {id:slug,slug,starts_on:slug+'-01',display_name:monthLabel(slug+'-01'),product_count:0};
});

const image=(url,alt,priority=false)=>mediaMarkup(url,alt,{priority});
function collectionImage(c,models){
  return c.cover_image_url||c.hero_image_url||models.find(p=>p.collection_id===c.id&&p.thumbnail_url)?.thumbnail_url||curatedCover(c);
}
function productCard(p){
  const href=p.cults_public_url||productHref(p);
  return '<a class="store-product-card" href="'+esc(href)+'"'+(p.cults_public_url?' target="_blank" rel="noopener noreferrer"':'')+'><div class="store-product-media">'+
    image(p.thumbnail_url,p.public_title)+
    (p.has_access?'<span class="work-access">IN YOUR LIBRARY</span>':'')+
    '</div><div class="store-product-body"><h3>'+esc(p.public_title)+'</h3><p>'+esc(p.collection_name||'CyberPop Collection')+'</p></div></a>';
}
function collectionCard(c,models){
  const artwork=collectionImage(c,models);
  return '<a class="collection-tile" href="'+collectionHref(c)+'"><div class="collection-tile-media '+(!artwork?'unfilled':'')+'">'+
    image(artwork,c.display_name)+(!artwork?'<span class="collection-type-cover">'+esc(month(c))+'</span>':'')+
    '<span class="collection-open">VIEW COLLECTION ↗</span></div><div class="collection-tile-copy">'+
    '<span class="eyebrow">'+esc(c.slug)+'</span><h3>'+esc(c.display_name)+'</h3>'+
    (Number(c.product_count||0)?'<p>'+Number(c.product_count)+' models</p>':'')+'</div></a>';
}
function previewCard(c,models,large=false){
  const artwork=collectionImage(c,models);
  return '<a class="showcase-preview '+(large?'showcase-preview-wide ':'')+(!artwork?'unfilled':'')+'" href="'+collectionHref(c)+'">'+
    image(artwork,c.display_name)+'<span class="showcase-preview-shade"></span><span class="showcase-preview-label">'+
    '<small>COLLECTION</small><strong>'+esc(month(c))+'</strong></span><span class="showcase-arrow" aria-hidden="true">↗</span></a>';
}
function renderShowcase(collections,models,slots){
  const current=collections.filter(c=>c.starts_on<=new Date().toISOString().slice(0,10));
  const visible=current.length?current:collections;
  const feature=visible[0];
  const featureArt=slots.home_hero?.asset_url||(feature?collectionImage(feature,models):'');
  const featurePanel=document.querySelector('#heroFeature');
  featurePanel.classList.toggle('has-artwork',!!featureArt);
  if(featureArt){
    featurePanel.insertAdjacentHTML('afterbegin','<div class="showcase-feature-media">'+image(featureArt,feature?.display_name||'CyberPop collection',true)+'</div>');
  }
  if(feature){
    featurePanel.insertAdjacentHTML('beforeend','<a class="showcase-feature-link" href="'+collectionHref(feature)+'">'+esc(month(feature))+' <span aria-hidden="true">↗</span></a>');
  }
  const previews=visible.slice(1,5);
  document.querySelector('#heroPreviews').innerHTML=previews.map((c,i)=>previewCard(c,models,i===0)).join('');
  document.querySelector('#heroPreviews').hidden=!previews.length;
}

async function loadHome(){
  await initChrome();
  const [mediaResult,overviewResult,collectionsResult,productsResult,snapshotResult]=await Promise.allSettled([
    getSiteMediaSlots(),
    supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_collections').select('*').eq('is_published',true).order('starts_on',{ascending:false}),
    supabase.from('membership_library_products').select('*').order('collection_starts_on',{ascending:false}).order('product_number',{ascending:false}).limit(100),
    publicSnapshot()
  ]);
  const slots=mediaResult.status==='fulfilled'?mediaResult.value:{};
  const overview=overviewResult.status==='fulfilled'&&!overviewResult.value.error?overviewResult.value.data||[]:[];
  const raw=collectionsResult.status==='fulfilled'&&!collectionsResult.value.error?collectionsResult.value.data||[]:archiveFallback;
  const snapshot=snapshotResult.status==='fulfilled'?snapshotResult.value:{};
  const collections=(raw.length?raw:archiveFallback).map(c=>{
    const row={...c,...(overview.find(x=>x.id===c.id)||{})};
    if(!Number(row.product_count||0))row.product_count=(snapshot[c.slug]||[]).length;
    return row;
  });
  const models=productsResult.status==='fulfilled'&&!productsResult.value.error?(productsResult.value.data||[]).filter(p=>p.thumbnail_url):[];
  renderShowcase(collections,models,slots);

  const currentWorks=(snapshot['2026-09']||[]).slice(0,8).map(item=>({
    public_title:cleanTitle(item.title),collection_name:'September 2026',thumbnail_url:item.imageUrl,cults_public_url:item.url
  }));
  const selected=models.length?models.slice(0,8):(currentWorks.length?currentWorks:curatedWorks);
  document.querySelector('#newReleases').hidden=!selected.length;
  document.querySelector('#newReleaseGrid').innerHTML=selected.map(productCard).join('');
  document.querySelector('#homeCollections').innerHTML=collections.length?
    collections.map(c=>collectionCard(c,models)).join(''):
    stateMarkup('empty','Collections are being prepared','');
}

loadHome().catch(error=>{
  console.error(error);
  document.querySelector('#newReleases').hidden=true;
  renderShowcase(archiveFallback,[],{});
  document.querySelector('#homeCollections').innerHTML=archiveFallback.map(c=>collectionCard(c,[])).join('');
});
