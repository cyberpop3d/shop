import { supabase,initChrome,getSiteMediaSlots,monthLabel,stateMarkup,mediaMarkup,esc } from '/site.js';
import {mosaicMedia} from '/collection-mosaic.js';
import {fetchLiveCultsCatalog,mergeLiveCults} from '/cults-live.js';

const collectionHref=c=>'/collection?slug='+encodeURIComponent(c.slug);
const month=c=>monthLabel(c.starts_on);
const curatedCover=c=>/^2026-(04|05|06|07|08|09|10)$/.test(c.slug||'')?'/images/cults/'+c.slug+'.webp':'';
async function publicSnapshot(){
  const response=await fetch('/data/cults-collections.json',{cache:'no-store'});
  return response.ok?(await response.json()).collections||{}:{};
}
const archiveFallback=Array.from({length:8},(_,i)=>{
  const number=11-i;
  const slug='2026-'+String(number).padStart(2,'0');
  return {id:slug,slug,starts_on:slug+'-01',display_name:monthLabel(slug+'-01'),product_count:0};
});

const image=(url,alt,priority=false)=>mediaMarkup(url,alt,{priority});
function collectionImage(c,models){
  return c.cover_image_url||c.hero_image_url||models.find(p=>p.collection_id===c.id&&p.thumbnail_url)?.thumbnail_url||curatedCover(c);
}
function productCard(p,index){
  const collectionName=p.collection_name||'CyberPop Collection';
  const label=p.display_label||p.public_title||'CyberPop collectible';
  const href=p.collection_slug?collectionHref({slug:p.collection_slug}):'/collections';
  return '<a class="selected-work-card '+(index===0?'selected-work-feature':'')+'" href="'+esc(href)+'"><div class="selected-work-media">'+
    image(p.thumbnail_url,label)+(p.has_access?'<span class="work-access">IN YOUR LIBRARY</span>':'')+
    '<span class="selected-work-shade"></span><span class="selected-work-label">'+esc(label)+'</span></div></a>';
}
function collectionCard(c,models,snapshotItems=[]){
  const artwork=collectionImage(c,models);
  const items=snapshotItems.length?snapshotItems:models.filter(p=>p.collection_id===c.id&&p.thumbnail_url);
  const mosaic=mosaicMedia(c,items,artwork);
  return '<a class="collection-tile collection-mosaic-tile" href="'+collectionHref(c)+'"><div class="collection-tile-media '+(!artwork?'unfilled':'')+'">'+
    mosaic+(!artwork?'<span class="collection-type-cover">'+esc(month(c))+'</span>':'')+
    '<span class="collection-mosaic-gradient"></span><span class="collection-mosaic-title"><small>'+esc(c.slug)+'</small><strong>'+esc(c.display_name||month(c))+' Collection</strong></span>'+
    '<span class="collection-open">VIEW COLLECTION ↗</span></div><div class="collection-tile-copy">'+
    '<span class="eyebrow">'+esc(c.slug)+'</span><h3>'+esc(c.display_name)+'</h3>'+
    (Number(c.product_count||0)?'<p>'+Number(c.product_count)+' models</p>':'')+'</div></a>';
}
function renderShowcase(collections,models,slots,snapshot={}){
  const current=collections.filter(c=>c.starts_on<=new Date().toISOString().slice(0,10));
  const visible=current.length?current:collections;
  const feature=visible[0];
  const settings=slots.home_hero?.content_json||{};
  const featureItems=snapshot[feature?.slug]||[];
  const featureArt=slots.home_hero?.asset_url||featureItems.find(item=>item.imageUrl)?.imageUrl||'';
  const featurePanel=document.querySelector('#heroFeature');
  featurePanel.classList.toggle('has-artwork',!!featureArt);
  featurePanel.querySelector('.showcase-feature-media')?.remove();
  if(featureArt){
    featurePanel.insertAdjacentHTML('afterbegin','<div class="showcase-feature-media">'+image(featureArt,feature?.display_name||'CyberPop collection',true)+'</div>');
  }
  document.querySelector('#heroStudioCaption').textContent=(settings.studio_caption&&settings.studio_caption!=='CYBERPOP STUDIO')?settings.studio_caption:'MADE TO PRINT. BUILT TO COLLECT.';
  const label=document.querySelector('#heroCollectionLabel');
  if(label)label.textContent=feature?month(feature)+' / '+(featureItems.filter(item=>item.imageUrl).length||Number(feature.product_count||0))+' RELEASED':'MULTIPART / NO AMS';
  const link=document.querySelector('#heroCollectionLink');
  if(link)link.href=feature?collectionHref(feature):'/collections';
}

async function loadHome(){
  await initChrome().catch(error=>console.warn('Account header unavailable',error));
  const [mediaResult,overviewResult,collectionsResult,productsResult,snapshotResult,liveResult]=await Promise.allSettled([
    getSiteMediaSlots(),
    supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_collections').select('*').eq('is_published',true).order('starts_on',{ascending:false}),
    supabase.from('membership_library_products').select('*').order('collection_starts_on',{ascending:false}).order('product_number',{ascending:false}).limit(100),
    publicSnapshot(),
    fetchLiveCultsCatalog()
  ]);
  const slots=mediaResult.status==='fulfilled'?mediaResult.value:{};
  const overview=overviewResult.status==='fulfilled'&&!overviewResult.value.error?overviewResult.value.data||[]:[];
  const raw=collectionsResult.status==='fulfilled'&&!collectionsResult.value.error?collectionsResult.value.data||[]:archiveFallback;
  const baseSnapshot=snapshotResult.status==='fulfilled'?snapshotResult.value:{};
  const liveItems=liveResult.status==='fulfilled'?liveResult.value:[];
  const snapshot=mergeLiveCults(baseSnapshot,liveItems,raw.length?raw:archiveFallback);
  const months=Object.keys(snapshot).sort().reverse();
  const mosaicQueue=[];
  for(let index=0;index<16;index++)for(const slug of months){
    const item=snapshot[slug]?.[index];
    if(item?.imageUrl&&!/\.(mp4|webm|mov)(?:$|[?#])/i.test(item.imageUrl))mosaicQueue.push(item.imageUrl);
  }
  document.querySelector('#monthlyDropMosaic').innerHTML=mosaicQueue.slice(0,16).map(url=>'<img src="'+esc(url)+'" alt="" loading="lazy" decoding="async">').join('');
  const collections=(raw.length?raw:archiveFallback).map(c=>{
    const row={...c,...(overview.find(x=>x.id===c.id)||{})};
    if(!Number(row.product_count||0))row.product_count=(snapshot[c.slug]||[]).length;
    return row;
  });
  const models=productsResult.status==='fulfilled'&&!productsResult.value.error?(productsResult.value.data||[]).filter(p=>p.thumbnail_url):[];
  const current=collections.find(c=>c.starts_on<=new Date().toISOString().slice(0,10));
  if(current)current.is_latest_collection=true;
  renderShowcase(collections,models,slots,snapshot);

  // All model artwork and titles come from the published CyberPop/Cults catalog.
  const displayTitle=value=>String(value||'').replace(/\\s+Multipart\\s+No[- ]?AMS\\b/ig,'').replace(/\\s+Multipart\\b/ig,'').replace(/\\s+No[- ]?AMS\\b/ig,'').trim();
  const publishedSlugs=new Set(collections.map(c=>c.slug));
  const selectedPool=Object.entries(snapshot).filter(([collectionSlug])=>publishedSlugs.has(collectionSlug)).flatMap(([collectionSlug,items])=>{
    return (items||[]).filter(item=>item.imageUrl).map((item,index)=>({
      thumbnail_url:item.imageUrl,collection_slug:collectionSlug,
      display_label:displayTitle(item.title)||'CyberPop collectible',
      published_at:item.publishedAt||collectionSlug+'-01',position:index
    }));
  });
  selectedPool.sort((a,b)=>String(b.published_at).localeCompare(String(a.published_at)));
  const dbSelected=models.map(p=>({
    ...p,collection_slug:collections.find(c=>c.id===p.collection_id)?.slug,
    display_label:displayTitle(p.public_title)||'CyberPop collectible'
  }));
  // Prioritize the current collection; fill remaining slots with selected real releases.
  const curatedNames=['dr doom','magneto','bojack','loki','venom','dante','vergil','frieren','sentinel'];
  const currentPool=selectedPool.filter(p=>p.collection_slug===current?.slug).slice(0,4);
  const archivedPool=curatedNames.flatMap(name=>selectedPool.filter(p=>p.collection_slug!==current?.slug&&p.display_label.toLowerCase().includes(name)).slice(0,1));
  const selected=[];
  const seen=new Set();
  for(const item of [...currentPool,...archivedPool,...selectedPool,...dbSelected]){
    const key=item.thumbnail_url||item.display_label;
    if(seen.has(key))continue;
    seen.add(key);selected.push(item);
    if(selected.length===8)break;
  }
  document.querySelector('#newReleases').hidden=!selected.length;
  document.querySelector('#newReleaseGrid').innerHTML=selected.map(productCard).join('');
  document.querySelector('#homeCollections').innerHTML=collections.length?
    collections.map(c=>collectionCard(c,models,snapshot[c.slug]||[])).join(''):
    stateMarkup('empty','Collections are being prepared','');
  document.querySelectorAll('.drop-access-card').forEach(card=>{
    const reveal=()=>card.classList.add('is-revealed');
    card.addEventListener('pointerenter',reveal,{once:true});card.addEventListener('focusin',reveal,{once:true});
  });
}

loadHome().catch(error=>{
  console.error(error);
  document.querySelector('#newReleases').hidden=true;
  renderShowcase(archiveFallback,[],{});
  document.querySelector('#homeCollections').innerHTML=archiveFallback.map(c=>collectionCard(c,[])).join('');
});
