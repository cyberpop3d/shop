import { supabase,initChrome,setMediaImage,stateMarkup,loadingMarkup,friendlyError,esc } from '/site.js';
const slug=new URLSearchParams(location.search).get('slug');let session=null,collection=null,products=[],filter='all',sort='newest';
function card(p){
  const media=p.thumbnail_url?'<img src="'+esc(p.thumbnail_url)+'" alt="'+esc(p.public_title)+'" loading="lazy">':'<div class="media-placeholder"><span>CYBERPOP</span></div>';
  const href=p.public_preview_url||'/product?slug='+encodeURIComponent(p.slug||'');
  const badge=p.public_preview_url?'':p.has_access?'<span class="store-product-badge owned-badge">IN YOUR LIBRARY</span>':'';
  return '<a class="store-product-card" href="'+esc(href)+'"'+(p.public_preview_url?' target="_blank" rel="noopener noreferrer"':'')+'><div class="store-product-media">'+media+badge+'</div><div class="store-product-body"><h3>'+esc(p.public_title)+'</h3><p>'+esc(p.collection_name||'Collection')+'</p></div></a>';
}
function render(){
  let rows=[...products];
  if(filter==='owned')rows=rows.filter(x=>x.has_access);
  if(filter==='locked')rows=rows.filter(x=>!x.has_access);
  rows.sort((a,b)=>sort==='az'?String(a.public_title).localeCompare(String(b.public_title)):sort==='oldest'?Number(a.product_number)-Number(b.product_number):Number(b.product_number)-Number(a.product_number));
  document.querySelector('#collectionCount').textContent=products.length+' models'+(products.some(x=>!x.public_preview_url)?' · '+products.filter(x=>x.has_access).length+' owned':'');
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
  document.querySelector('#collectionCrumb').textContent='COLLECTIONS / '+collection.slug;
  document.querySelector('#collectionTitle').textContent=collection.display_name.toUpperCase();
  document.querySelector('#collectionDescription').textContent=collection.description||'';
  document.querySelector('#collectionMeta').innerHTML=(Number(collection.product_count||0)?'<span>'+Number(collection.product_count)+' MODELS</span>':'')+'<span>'+(collection.has_access?'ACCESS ACTIVE':'ARCHIVE')+'</span>';
  const pRes=await supabase.from('membership_library_products').select('*').eq('collection_id',collection.id).order('product_number');
  if(pRes.error)throw pRes.error;products=pRes.data||[];
  if(!products.length){
    const snapshot=await fetch('/data/cults-collections.json').then(r=>r.ok?r.json():null).catch(()=>null);
    products=(snapshot?.collections?.[collection.slug]||[]).map((item,index)=>({
      public_title:String(item.title||'').replace(/\s+Multipart\b.*$/i,'').trim(),
      thumbnail_url:item.imageUrl,collection_name:collection.display_name,product_number:index+1,
      public_preview_url:item.url,has_access:false
    }));
    document.querySelector('#collectionFilters').hidden=true;
  }
  document.querySelector('#collectionMeta').innerHTML='<span>'+products.length+' MODELS</span><span>'+(collection.has_access?'ACCESS ACTIVE':'ARCHIVE')+'</span>';
  render();
  const curated=/^2026-(04|05|06|07|08|09|10)$/.test(collection.slug)?'/images/cults/'+collection.slug+'.webp':'';
  setMediaImage(document.querySelector('#collectionHero'),collection.cover_image_url||products.find(p=>p.thumbnail_url)?.thumbnail_url||collection.hero_image_url||curated,'COLLECTION ARTWORK');
  const area=document.querySelector('#accessArea');area.hidden=false;
  area.innerHTML=collection.has_access
    ? '<div class="notice"><div><strong>Collection access active.</strong><span> Owned models are available through your verified Library.</span></div><a class="btn btn-light" href="/library">Open Library →</a></div>'
    : '<div class="notice accent"><div><strong>Explore the collection.</strong><span> Request access when you’re ready.</span></div><a class="btn btn-ghost" href="/access">Request Access →</a></div>';
}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));render()});
document.querySelector('#collectionSort').onchange=e=>{sort=e.target.value;render()};
load().catch(e=>{console.error(e);document.querySelector('#productGrid').innerHTML=stateMarkup('error','Collection unavailable',friendlyError(e,'This collection could not be loaded.'),{href:'/collections',label:'Back to collections'})});
