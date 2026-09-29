import { supabase,initChrome,getSiteMediaSlots,monthLabel,stateMarkup,mediaMarkup,esc } from '/site.js';
import {mosaicMedia,bindCollectionPreviews} from '/collection-mosaic.js';

const collectionHref=c=>'/collection?slug='+encodeURIComponent(c.slug);
const month=c=>monthLabel(c.starts_on);
const curatedCover=c=>/^2026-(04|05|06|07|08|09|10)$/.test(c.slug||'')?'/images/cults/'+c.slug+'.webp':'';
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
function productCard(p,index){
  const collectionName=p.collection_name||'CyberPop Collection';
  const label=p.display_label||collectionName+' #'+String(index+1);
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
function previewCard(c,models,large=false,slot={},settings={},index=1){
  const artwork=slot.asset_url||collectionImage(c,models);
  const label=settings['preview_'+index+'_label']||month(c);
  const href=settings['preview_'+index+'_href']||collectionHref(c);
  return '<a class="showcase-preview '+(large?'showcase-preview-wide ':'')+(!artwork?'unfilled':'')+'" href="'+esc(href)+'">'+
    image(artwork,label)+'<span class="showcase-preview-shade"></span><span class="showcase-preview-label">'+
    '<small>COLLECTION</small><strong>'+esc(label)+'</strong></span><span class="showcase-arrow" aria-hidden="true">↗</span></a>';
}
function renderShowcase(collections,models,slots){
  const current=collections.filter(c=>c.starts_on<=new Date().toISOString().slice(0,10));
  const visible=current.length?current:collections;
  const feature=visible[0];
  const settings=slots.home_hero?.content_json||{};
  const featureArt=slots.home_hero?.asset_url||(feature?collectionImage(feature,models):'');
  const featurePanel=document.querySelector('#heroFeature');
  featurePanel.classList.toggle('has-artwork',!!featureArt);
  if(featureArt){
    featurePanel.insertAdjacentHTML('afterbegin','<div class="showcase-feature-media">'+image(featureArt,feature?.display_name||'CyberPop collection',true)+'</div>');
  }
  if(feature){
    featurePanel.insertAdjacentHTML('beforeend','<a class="showcase-feature-link" href="'+esc(settings.feature_href||collectionHref(feature))+'">'+esc(settings.feature_label||month(feature))+' <span aria-hidden="true">↗</span></a>');
  }
  document.querySelector('#heroStudioCaption').textContent=settings.studio_caption||'CYBERPOP Studio Design Service';
  const primary=document.querySelector('#heroPrimaryAction'),secondary=document.querySelector('#heroSecondaryAction');
  primary.href=settings.primary_href||'/access';primary.querySelector('span').textContent=settings.primary_label||'Purchase Collection';
  secondary.href=settings.secondary_href||'/collections';secondary.querySelector('span').textContent=settings.secondary_label||'Explore Collections';
  const previews=visible.slice(1,5);
  document.querySelector('#heroPreviews').innerHTML=previews.map((c,i)=>previewCard(c,models,i===0,slots['home_preview_'+(i+1)]||{},settings,i+1)).join('');
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
  if(collections[0])collections[0].is_latest_collection=true;
  renderShowcase(collections,models,slots);

  const selectedPool=Object.entries(snapshot).flatMap(([collectionSlug,items])=>{
    const collection=collections.find(c=>c.slug===collectionSlug);
    const collectionName=collection?.display_name||monthLabel(collectionSlug+'-01');
    return (items||[]).map((item,index)=>({thumbnail_url:item.imageUrl,collection_slug:collectionSlug,collection_name:collectionName,display_label:collectionName+' #'+String(index+1)}));
  }).filter(x=>x.thumbnail_url);
  for(let i=selectedPool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[selectedPool[i],selectedPool[j]]=[selectedPool[j],selectedPool[i]]}
  const dbSelected=models.map((p,index)=>({...p,collection_slug:collections.find(c=>c.id===p.collection_id)?.slug,display_label:(p.collection_name||'CyberPop Collection')+' #'+String(index+1)}));
  const selected=(selectedPool.length?selectedPool:dbSelected).slice(0,5);
  document.querySelector('#newReleases').hidden=!selected.length;
  document.querySelector('#newReleaseGrid').innerHTML=selected.map(productCard).join('');
  document.querySelector('#homeCollections').innerHTML=collections.length?
    collections.map(c=>collectionCard(c,models,snapshot[c.slug]||[])).join(''):
    stateMarkup('empty','Collections are being prepared','');
  bindCollectionPreviews(document.querySelector('#homeCollections'));
}

loadHome().catch(error=>{
  console.error(error);
  document.querySelector('#newReleases').hidden=true;
  renderShowcase(archiveFallback,[],{});
  document.querySelector('#homeCollections').innerHTML=archiveFallback.map(c=>collectionCard(c,[])).join('');
});
