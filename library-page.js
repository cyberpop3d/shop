import { supabase,initChrome,mediaMarkup,monthLabel,stateMarkup,friendlyError,esc } from '/site.js';

let session=null,collections=[],products=[],collectionCodes=[],customDeliverables=[],purchaseMonthIds=new Set(),activeFilter='all';

function collectionCard(c){
  const preview=products.find(p=>p.collection_id===c.id&&p.thumbnail_url)?.thumbnail_url;
  const artwork=c.cover_image_url||c.hero_image_url||preview||(/^2026-(04|05|06|07|08|09|10)$/.test(c.slug||'')?'/images/cults/'+c.slug+'.webp':'');
  const owned=c.has_access===true;
  const media=artwork?mediaMarkup(artwork,c.display_name||monthLabel(c.starts_on)):'<div class="media-placeholder"><span>CLASSIFIED</span></div>';
  const code=collectionCodes.find(x=>x.collection_id===c.id&&x.is_active!==false);
  const purchased=purchaseMonthIds.has(c.id);
  return '<a class="library-collection-card '+(owned?'is-active':'is-locked')+'" data-owned="'+owned+'" data-purchased="'+purchased+'" href="/collection?slug='+encodeURIComponent(c.slug)+'">'+
    '<div class="library-collection-media">'+media+'<span class="library-access-state">'+(owned?(purchased?'PURCHASED':'ACCESS ACTIVE'):'LOCKED')+'</span></div>'+
    '<div class="library-collection-copy"><span>'+esc(c.slug||'')+'</span><h2>'+esc(c.display_name||monthLabel(c.starts_on))+' Collection</h2><p>'+(owned?(code?.cults_code?'Cults code available':'Cults code pending'):'Collection preview · access required')+'</p></div></a>';
}

function renderCollections(){
  const visible=collections.filter(c=>activeFilter==='all'||(activeFilter==='mine'&&c.has_access===true)||(activeFilter==='purchased'&&purchaseMonthIds.has(c.id))||(activeFilter==='locked'&&c.has_access!==true));
  document.querySelector('#collectionGrid').innerHTML=visible.length?visible.map(collectionCard).join(''):stateMarkup('','Nothing in this view','Try another collection filter.');
}

function customDeliveryCard(d){
  const media=d.thumbnail_url?mediaMarkup(d.thumbnail_url,d.title):'<div class="media-placeholder"><span>PRIVATE DELIVERY</span></div>';
  return '<article class="library-model-card"><div class="library-model-media">'+media+'</div><div class="library-model-copy"><span class="badge open">CUSTOM</span><h3>'+esc(d.title)+'</h3>'+(d.download_url?'<a class="library-action" href="'+esc(d.download_url)+'" target="_blank" rel="noopener">Open delivery ↗</a>':'')+'</div></article>';
}
function individualModelCard(p){
  const media=p.thumbnail_url?mediaMarkup(p.thumbnail_url,p.public_title):'<div class="media-placeholder"><span>CYBERPOP</span></div>';
  return '<article class="library-model-card"><div class="library-model-media">'+media+'</div><div class="library-model-copy"><span class="badge open">GRANTED</span><h3>'+esc(p.public_title||p.collection_name+' #'+p.product_number)+'</h3><p>'+esc(p.collection_name||'Collection')+'</p><a class="library-action" href="/product?slug='+encodeURIComponent(p.slug)+'">Open model ↗</a></div></article>';
}

async function loadLibrary(){
  session=await Promise.race([initChrome(),new Promise(resolve=>setTimeout(()=>resolve(null),5000))]);
  const notice=document.querySelector('#libraryNotice');
  if(!session){
    notice.className='notice accent';
    notice.innerHTML='<div><strong>Sign in to open your Library.</strong><span> Collection access is loaded from your verified account.</span></div><a class="btn btn-light" href="/account?returnTo=%2Flibrary">Sign in</a>';
    document.querySelector('#collectionGrid').innerHTML=stateMarkup('auth','Your collections are private','Sign in to see your access.',{href:'/account?returnTo=%2Flibrary',label:'Sign in'});
    document.querySelector('#customDeliveryGrid').innerHTML=stateMarkup('auth','Custom Designs are private','Sign in to see your deliveries.');
    return;
  }
  notice.innerHTML='<div><strong>Your Collection Library</strong><span> Access is verified by your account.</span></div><a class="text-link" href="/account">Open Account →</a>';
  const results=await Promise.all([
    supabase.from('membership_collections').select('*').eq('is_published',true),
    supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_library_products').select('id,collection_id,thumbnail_url,public_title,product_number,collection_name,slug,has_access'),
    supabase.from('membership_collection_delivery_codes').select('collection_id,cults_code,cults_url'),
    supabase.from('custom_deliverables').select('*').eq('user_id',session.user.id).eq('is_active',true).order('created_at',{ascending:false}),
    supabase.from('product_entitlements').select('product_id').eq('user_id',session.user.id).is('revoked_at',null),
    supabase.from('membership_entitlements').select('collection_id,source_kind,status,revoked_at').eq('user_id',session.user.id).eq('status','active').is('revoked_at',null)
  ]);
  const failed=results.find(x=>x.error);if(failed)throw failed.error;
  const raw=results[0].data||[],overview=results[1].data||[];
  products=results[2].data||[];collectionCodes=results[3].data||[];customDeliverables=results[4].data||[];
  const accessById=new Map(overview.map(c=>[c.id,c.has_access===true]));
  collections=raw.map(c=>({...c,has_access:accessById.get(c.id)===true}));
  purchaseMonthIds=new Set((results[7].data||[]).filter(e=>['monthly_payment','migration','purchase'].includes(e.source_kind)).map(e=>e.collection_id));
  renderCollections();
  const individuallyGranted=new Set((results[6].data||[]).map(x=>x.product_id));
  const individualProducts=products.filter(p=>individuallyGranted.has(p.id)&&!collections.some(c=>c.id===p.collection_id));
  document.querySelector('#individualModelsSection').hidden=!individualProducts.length;
  document.querySelector('#individualModelsGrid').innerHTML=individualProducts.map(individualModelCard).join('');
  document.querySelector('#customDeliveryGrid').innerHTML=customDeliverables.length?customDeliverables.map(customDeliveryCard).join(''):stateMarkup('','No custom designs yet','Private design deliveries will appear here when ready.');
}

document.querySelectorAll('[data-library-filter]').forEach(button=>button.addEventListener('click',()=>{
  activeFilter=button.dataset.libraryFilter;
  document.querySelectorAll('[data-library-filter]').forEach(item=>item.classList.toggle('active',item===button));
  renderCollections();
}));

loadLibrary().catch(err=>{
  console.error(err);
  document.querySelector('#collectionGrid').innerHTML=stateMarkup('error','Library unavailable',friendlyError(err,'Your collection access could not be loaded.'),{href:'/library',label:'Retry'});
});
