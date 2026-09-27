import { supabase,initChrome,getSiteMediaSlots,setMediaImage,monthLabel,stateMarkup,esc } from '/site.js';

let session=null,collections=[],products=[],libraryItems=[],activeFilter='all',searchTerm='',sortMode='newest';

function collectionCard(c){
  const open=Boolean(c.has_access);
  const media=c.cover_image_url?'<img src="'+esc(c.cover_image_url)+'" alt="'+esc(c.display_name||monthLabel(c.starts_on))+'">':'<div class="media-placeholder"><span>1200 × 900</span></div>';
  return '<a class="collection-tile" href="/collection?slug='+encodeURIComponent(c.slug)+'"><div class="collection-tile-media">'+media+'</div><div class="collection-tile-copy"><span class="eyebrow">'+esc(c.slug)+'</span><h3>'+esc(c.display_name||monthLabel(c.starts_on))+'</h3><p>'+Number(c.product_count||0)+' models · '+(open?'Unlocked':'Locked')+'</p></div></a>';
}

function itemFor(productId){return libraryItems.find(x=>x.product_id===productId)}

function modelCard(p){
  const saved=itemFor(p.id);
  const favorite=Boolean(saved&&saved.is_favorite);
  const owned=Boolean(p.has_access);
  const media=p.thumbnail_url
    ? '<div class="library-model-media"><img src="'+esc(p.thumbnail_url)+'" alt="'+esc(p.public_title)+'" loading="lazy"></div>'
    : '<div class="library-model-media placeholder"></div>';
  const primary=owned&&p.cults_url
    ? '<a class="library-action" href="'+esc(p.cults_url)+'" target="_blank" rel="noopener">Open on Cults ↗</a>'
    : '<a class="library-action muted-action" href="/collection?slug='+encodeURIComponent(p.collection_slug||'')+'">'+(owned?'Open collection':'View access')+'</a>';
  return '<article class="library-model-card" data-product-id="'+p.id+'">'+
    media+
    '<div class="library-model-copy"><div class="library-model-top"><span class="badge '+(owned?'open':'')+'">'+(owned?'Owned':'Locked')+'</span><button class="favorite-btn '+(favorite?'active':'')+'" data-favorite="'+p.id+'" type="button" aria-label="Favorite">'+(favorite?'★':'☆')+'</button></div>'+
    '<h3>'+esc(p.public_title)+'</h3><p>'+esc(p.collection_name||'Collection')+' · v'+esc(p.version||'1.0')+'</p>'+
    '<div class="library-model-actions"><button class="library-action secondary-action" data-save="'+p.id+'" type="button">'+(saved?'In Library':'Add to Library')+'</button>'+primary+'</div></div></article>';
}

function filteredProducts(){
  let rows=[...products];
  if(activeFilter==='owned')rows=rows.filter(x=>x.has_access);
  if(activeFilter==='locked')rows=rows.filter(x=>!x.has_access);
  if(activeFilter==='favorites')rows=rows.filter(x=>itemFor(x.id)?.is_favorite);
  if(searchTerm)rows=rows.filter(x=>(x.public_title+' '+(x.collection_name||'')).toLowerCase().includes(searchTerm));
  rows.sort((a,b)=>{
    if(sortMode==='az')return String(a.public_title).localeCompare(String(b.public_title));
    const ad=new Date(a.release_date||a.collection_starts_on||0).getTime();
    const bd=new Date(b.release_date||b.collection_starts_on||0).getTime();
    return sortMode==='oldest'?ad-bd:bd-ad;
  });
  return rows;
}

function renderModels(){
  const grid=document.querySelector('#modelLibraryGrid');
  if(!session){
    grid.innerHTML=stateMarkup('','Sign in to build your library','You can browse collections as a guest, but personal library items and favorites belong to your account.');
    return;
  }
  const rows=filteredProducts();
  grid.innerHTML=rows.length?rows.map(modelCard).join(''):stateMarkup('','No models found','Try another filter or search term.');
  document.querySelectorAll('[data-save]').forEach(btn=>btn.onclick=()=>toggleSaved(btn.dataset.save));
  document.querySelectorAll('[data-favorite]').forEach(btn=>btn.onclick=()=>toggleFavorite(btn.dataset.favorite));
}

async function toggleSaved(productId){
  if(!session)return;
  const current=itemFor(productId);
  if(current){
    const r=await supabase.from('member_library_items').delete().eq('id',current.id);
    if(r.error)return alert(r.error.message);
    libraryItems=libraryItems.filter(x=>x.id!==current.id);
  }else{
    const r=await supabase.from('member_library_items').insert({user_id:session.user.id,product_id:productId}).select('*').single();
    if(r.error)return alert(r.error.message);
    libraryItems.push(r.data);
  }
  renderModels();
}

async function toggleFavorite(productId){
  if(!session)return;
  const current=itemFor(productId);
  if(current){
    const r=await supabase.from('member_library_items').update({is_favorite:!current.is_favorite,updated_at:new Date().toISOString()}).eq('id',current.id).select('*').single();
    if(r.error)return alert(r.error.message);
    libraryItems=libraryItems.map(x=>x.id===current.id?r.data:x);
  }else{
    const r=await supabase.from('member_library_items').insert({user_id:session.user.id,product_id:productId,is_favorite:true}).select('*').single();
    if(r.error)return alert(r.error.message);
    libraryItems.push(r.data);
  }
  renderModels();
}

async function loadLibrary(){
  session=await initChrome();
  const slots=await getSiteMediaSlots();
  setMediaImage(document.querySelector('#libraryHero'),slots.library_hero?.asset_url,'LIBRARY HERO · 1920 × 640');
  const notice=document.querySelector('#libraryNotice');
  const cta=document.querySelector('#libraryAccountCta');
  if(session){
    notice.className='notice';
    notice.innerHTML='<div><strong>Signed in as '+esc(session.user.email)+'</strong><span> Your personal library and favorites are active.</span></div>';
    cta.textContent='Manage account';
  }else{
    notice.className='notice accent';
    notice.innerHTML='<div><strong>You are browsing as a guest.</strong><span> Sign in to create your personal CyberPop library.</span></div><a class="btn btn-primary" href="/account">Sign in</a>';
  }

  const requests=[
    supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_library_products').select('*'),
    supabase.from('membership_collections').select('*').eq('is_published',true)
  ];
  if(session)requests.push(supabase.from('member_library_items').select('*'));
  const results=await Promise.all(requests);
  const err=results.find(x=>x.error);if(err)throw err.error;
  const overview=results[0].data||[],rawCollections=results[2].data||[];
  collections=overview.map(c=>({...c,...(rawCollections.find(x=>x.id===c.id)||{})}));
  products=results[1].data||[];
  libraryItems=session?(results[3].data||[]):[];

  const grid=document.querySelector('#collectionGrid');
  grid.innerHTML=collections.length?collections.map(collectionCard).join(''):stateMarkup('','No collection months yet','Published monthly drops will appear here automatically.');
  renderModels();
}

document.querySelector('#librarySearch').addEventListener('input',e=>{searchTerm=e.target.value.trim().toLowerCase();renderModels()});
document.querySelector('#librarySort').addEventListener('change',e=>{sortMode=e.target.value;renderModels()});
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
  activeFilter=btn.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===btn));
  renderModels();
}));

loadLibrary().catch(err=>{
  console.error(err);
  document.querySelector('#collectionGrid').innerHTML=stateMarkup('error','Library unavailable','The collection archive could not be loaded right now.');
  document.querySelector('#modelLibraryGrid').innerHTML=stateMarkup('error','Personal library unavailable','Your model library could not be loaded right now.');
});
