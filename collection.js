import { supabase,initChrome,setMediaImage,stateMarkup,loadingMarkup,friendlyError,esc } from '/site.js';
const slug=new URLSearchParams(location.search).get('slug');let session=null,collection=null,products=[],filter='all',sort='newest';
function card(p){
  const media=p.thumbnail_url?'<img src="'+esc(p.thumbnail_url)+'" alt="'+esc(p.public_title)+'" loading="lazy">':'<div class="media-placeholder"><span>1200 × 1400</span></div>';
  return '<a class="store-product-card" href="/product?slug='+encodeURIComponent(p.slug||'')+'"><div class="store-product-media">'+media+'<span class="store-product-badge '+(p.has_access?'owned-badge':'locked-badge')+'">'+(p.has_access?'OWNED':'LOCKED')+'</span></div><div class="store-product-body"><h3>'+esc(p.public_title)+'</h3><p>'+esc(p.collection_name||'Collection')+'<br>Multipart · '+(p.ams_required?'AMS':'No AMS')+(p.height_mm?' · '+p.height_mm+' mm':'')+(p.credit_price?' · '+Number(p.credit_price)+' C':'')+'</p></div></a>';
}
function render(){
  let rows=[...products];
  if(filter==='owned')rows=rows.filter(x=>x.has_access);
  if(filter==='locked')rows=rows.filter(x=>!x.has_access);
  rows.sort((a,b)=>sort==='az'?String(a.public_title).localeCompare(String(b.public_title)):sort==='oldest'?Number(a.product_number)-Number(b.product_number):Number(b.product_number)-Number(a.product_number));
  document.querySelector('#collectionCount').textContent=products.length+' models · '+products.filter(x=>x.has_access).length+' owned';
  document.querySelector('#productGrid').innerHTML=rows.length?rows.map(card).join(''):stateMarkup('empty','No models found','Nothing matches the active collection filter.');
}
async function load(){
  if(!slug)throw new Error('Missing collection slug');
  session=await initChrome();
  document.querySelector('#productGrid').innerHTML=loadingMarkup(6,'card');
  const [cRes,oRes]=await Promise.all([
    supabase.from('membership_collections').select('*').eq('slug',slug).eq('is_published',true).maybeSingle(),
    supabase.from('membership_collection_overview').select('*').eq('slug',slug).maybeSingle()
  ]);
  if(cRes.error)throw cRes.error;if(!cRes.data)throw new Error('Collection not found.');
  collection={...cRes.data,...(oRes.data||{})};
  document.title=collection.display_name+' — CyberPop';
  setMediaImage(document.querySelector('#collectionHero'),collection.hero_image_url||collection.cover_image_url,'COLLECTION HERO · 1920 × 900');
  document.querySelector('#collectionCrumb').textContent='COLLECTIONS / '+collection.slug;
  document.querySelector('#collectionTitle').textContent=collection.display_name.toUpperCase();
  document.querySelector('#collectionDescription').textContent=collection.description||'A CyberPop monthly collectible collection.';
  document.querySelector('#collectionMeta').innerHTML='<span>'+Number(collection.product_count||0)+' MODELS</span><span>MULTIPART</span><span>'+(collection.has_access?'ACCESS ACTIVE':'ARCHIVE')+'</span>';
  const pRes=await supabase.from('membership_library_products').select('*').eq('collection_id',collection.id).order('product_number');
  if(pRes.error)throw pRes.error;products=pRes.data||[];render();
  const area=document.querySelector('#accessArea');area.hidden=false;
  area.innerHTML=collection.has_access
    ? '<div class="notice"><div><strong>Collection access active.</strong><span> Owned models are available through your verified Library.</span></div><a class="btn btn-light" href="/library">Open Library →</a></div>'
    : '<div class="notice accent"><div><strong>Archive preview.</strong><span> You can browse every model now. Payment activation is intentionally disabled during pre-launch.</span></div><a class="btn btn-ghost" href="/membership">Membership details →</a></div>';
}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));render()});
document.querySelector('#collectionSort').onchange=e=>{sort=e.target.value;render()};
load().catch(e=>{console.error(e);document.querySelector('#productGrid').innerHTML=stateMarkup('error','Collection unavailable',friendlyError(e,'This collection could not be loaded.'),{href:'/collections',label:'Back to collections'})});