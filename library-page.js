import { supabase,initChrome,getSiteMediaSlots,setMediaImage,monthLabel,stateMarkup,loadingMarkup,friendlyError,showToast,esc } from '/site.js';

let session=null,collections=[],products=[],favorites=[],activeFilter='all',searchTerm='',sortMode='newest';

function collectionCard(c){
  const open=Boolean(c.has_access);
  const media=c.cover_image_url?'<img src="'+esc(c.cover_image_url)+'" alt="'+esc(c.display_name||monthLabel(c.starts_on))+'">':'<div class="media-placeholder"><span>1200 × 900</span></div>';
  return '<a class="collection-tile" href="/collection?slug='+encodeURIComponent(c.slug)+'"><div class="collection-tile-media">'+media+'</div><div class="collection-tile-copy"><span class="eyebrow">'+esc(c.slug)+'</span><h3>'+esc(c.display_name||monthLabel(c.starts_on))+'</h3><p>'+Number(c.product_count||0)+' models · '+(open?'Collection access active':'Browse collection')+'</p></div></a>';
}

function isFavorite(productId){return favorites.some(x=>x.product_id===productId)}

function modelCard(p){
  const favorite=isFavorite(p.id);
  const media=p.thumbnail_url
    ? '<div class="library-model-media"><img src="'+esc(p.thumbnail_url)+'" alt="'+esc(p.public_title)+'" loading="lazy"></div>'
    : '<div class="library-model-media placeholder"><div class="media-placeholder"><span>1200 × 1400</span></div></div>';
  const primary=p.cults_url
    ? '<a class="library-action" href="'+esc(p.cults_url)+'" target="_blank" rel="noopener">Open on Cults ↗</a>'
    : '<a class="library-action muted-action" href="/product?slug='+encodeURIComponent(p.slug||'')+'">Open model</a>';
  return '<article class="library-model-card" data-product-id="'+p.id+'">'+media+
    '<div class="library-model-copy"><div class="library-model-top"><span class="badge open">OWNED</span><button class="favorite-btn '+(favorite?'active':'')+'" data-favorite="'+p.id+'" type="button" aria-label="Favorite">'+(favorite?'★':'☆')+'</button></div>'+
    '<h3><a href="/product?slug='+encodeURIComponent(p.slug||'')+'">'+esc(p.public_title)+'</a></h3><p>'+esc(p.collection_name||'Collection')+' · v'+esc(p.version||'1.0')+'</p>'+
    '<div class="library-model-actions">'+primary+'</div></div></article>';
}

function filteredProducts(){
  let rows=[...products];
  if(activeFilter==='favorites')rows=rows.filter(x=>isFavorite(x.id));
  if(activeFilter==='updated')rows=rows.filter(x=>{
    const updated=new Date(x.product_updated_at||0).getTime();
    const released=new Date(x.release_date||x.collection_starts_on||0).getTime();
    return updated>released+(24*60*60*1000);
  });
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
    grid.innerHTML=stateMarkup('auth','Sign in to open your Library','Ownership is loaded from your verified account entitlements.',{href:'/account?returnTo=%2Flibrary',label:'Sign in'});
    return;
  }
  const rows=filteredProducts();
  document.querySelector('#libraryModelMeta').textContent=products.length+' owned models · '+favorites.length+' favorites';
  grid.innerHTML=rows.length?rows.map(modelCard).join(''):stateMarkup('empty',activeFilter==='favorites'?'No favorites yet':'Library empty',activeFilter==='favorites'?'Favorite an owned model and it will appear here.':'Unlock a model or receive collection access and it will appear here automatically.',{href:'/collections',label:'Browse collections'});
  document.querySelectorAll('[data-favorite]').forEach(btn=>btn.onclick=()=>toggleFavorite(btn.dataset.favorite));
}

async function toggleFavorite(productId){
  if(!session)return;
  if(isFavorite(productId)){
    const r=await supabase.from('member_favorites').delete().eq('product_id',productId);
    if(r.error){showToast('Favorite could not be updated.','error');return}
    favorites=favorites.filter(x=>x.product_id!==productId);showToast('Removed from favorites.');
  }else{
    const r=await supabase.from('member_favorites').insert({user_id:session.user.id,product_id:productId});
    if(r.error){showToast('Favorite could not be updated.','error');return}
    favorites.push({user_id:session.user.id,product_id:productId});showToast('Added to favorites.');
  }
  renderModels();
}

async function loadLibrary(){
  session=await initChrome();
  document.querySelector('#modelLibraryGrid').innerHTML=loadingMarkup(8,'card');
  const slots=await getSiteMediaSlots();
  setMediaImage(document.querySelector('#libraryHero'),slots.library_hero?.asset_url,'LIBRARY HERO · 1920 × 640');
  const notice=document.querySelector('#libraryNotice');
  const cta=document.querySelector('#libraryAccountCta');

  if(!session){
    notice.className='notice accent';
    notice.innerHTML='<div><strong>You are browsing as a guest.</strong><span> Sign in to load your verified Library.</span></div><a class="btn btn-light" href="/account?returnTo=%2Flibrary">Sign in</a>';
    cta.textContent='Sign in';
    document.querySelector('#collectionGrid').innerHTML='';
    renderModels();
    return;
  }

  notice.className='notice';
  notice.innerHTML='<div><strong>Verified Library</strong><span> Models below are returned from backend ownership state, not browser flags.</span></div>';
  cta.textContent='Manage account';

  const results=await Promise.all([
    supabase.from('member_owned_products').select('*'),
    supabase.from('member_favorites').select('*'),
    supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_collections').select('*').eq('is_published',true)
  ]);
  const err=results.find(x=>x.error);if(err)throw err.error;

  products=results[0].data||[];
  favorites=results[1].data||[];
  const overview=results[2].data||[],rawCollections=results[3].data||[];
  collections=overview.map(c=>({...c,...(rawCollections.find(x=>x.id===c.id)||{})}));

  document.querySelector('#collectionGrid').innerHTML=collections.length?collections.map(collectionCard).join(''):stateMarkup('','No collection months yet','Published monthly drops will appear here automatically.');
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
  document.querySelector('#collectionGrid').innerHTML='';
  document.querySelector('#modelLibraryGrid').innerHTML=stateMarkup('error','Library unavailable',friendlyError(err,'Your verified ownership could not be loaded right now.'),{href:'/library',label:'Retry'});
});