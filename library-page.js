import { supabase,initChrome,getSiteMediaSlots,setMediaImage,mediaMarkup,monthLabel,stateMarkup,friendlyError,esc } from '/site.js';

let session=null,collections=[],products=[],collectionCodes=[],customDeliverables=[];

function collectionCard(c){
  const active=Boolean(c.has_access);
  const preview=products.find(p=>p.collection_id===c.id&&p.thumbnail_url)?.thumbnail_url;
  const artwork=c.cover_image_url||c.hero_image_url||preview||(/^2026-(04|05|06|07|08|09|10)$/.test(c.slug||'')?'/images/cults/'+c.slug+'.webp':'');
  const media=artwork?mediaMarkup(artwork,c.display_name||monthLabel(c.starts_on)):'<div class="media-placeholder"><span>COLLECTION</span></div>';
  const code=collectionCodes.find(x=>x.collection_id===c.id&&x.is_active!==false);
  return '<a class="library-collection-card '+(active?'is-active':'is-locked')+'" href="/collection?slug='+encodeURIComponent(c.slug)+'">'+
    '<div class="library-collection-media">'+media+'<span class="library-access-state">'+(active?'ACTIVE':'LOCKED')+'</span></div>'+
    '<div class="library-collection-copy"><span>'+esc(c.slug)+'</span><h2>'+esc(c.display_name||monthLabel(c.starts_on))+'</h2><p>'+(active?(code?.cults_code?'Cults code available':'Code pending'):'View collection')+'</p></div></a>';
}

function customDeliveryCard(d){
  const media=d.thumbnail_url?mediaMarkup(d.thumbnail_url,d.title):'<div class="media-placeholder"><span>PRIVATE DELIVERY</span></div>';
  return '<article class="library-model-card"><div class="library-model-media">'+media+'</div><div class="library-model-copy"><span class="badge open">CUSTOM</span><h3>'+esc(d.title)+'</h3>'+(d.download_url?'<a class="library-action" href="'+esc(d.download_url)+'" target="_blank" rel="noopener">Open delivery ↗</a>':'')+'</div></article>';
}

async function loadLibrary(){
  session=await Promise.race([initChrome(),new Promise(resolve=>setTimeout(()=>resolve(null),5000))]);
  const slots=await Promise.race([getSiteMediaSlots().catch(()=>({})),new Promise(resolve=>setTimeout(()=>resolve({}),3500))]);
  setMediaImage(document.querySelector('#libraryHero'),slots.library_hero?.asset_url||'/images/cults/2026-09.webp','CyberPop Library');
  const notice=document.querySelector('#libraryNotice');
  if(!session){
    notice.className='notice accent';
    notice.innerHTML='<div><strong>Sign in to open your Library.</strong><span> Collection access is loaded from your verified account.</span></div><a class="btn btn-light" href="/account?returnTo=%2Flibrary">Sign in</a>';
    document.querySelector('#collectionGrid').innerHTML=stateMarkup('auth','Your collections are private','Sign in to view active and locked collection months.',{href:'/account?returnTo=%2Flibrary',label:'Sign in'});
    return;
  }
  notice.innerHTML='<div><strong>Your Collection Library</strong><span> Access is verified by your account.</span></div><a class="text-link" href="/account">Open Account →</a>';
  const results=await Promise.all([
    supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_collections').select('*').eq('is_published',true),
    supabase.from('member_owned_products').select('collection_id,thumbnail_url'),
    supabase.from('membership_collection_codes').select('*').eq('is_active',true),
    supabase.from('custom_deliverables').select('*').eq('is_active',true).order('created_at',{ascending:false})
  ]);
  const failed=results.find(x=>x.error);if(failed)throw failed.error;
  const overview=results[0].data||[],raw=results[1].data||[];
  products=results[2].data||[];collectionCodes=results[3].data||[];customDeliverables=results[4].data||[];
  collections=overview.map(c=>({...c,...(raw.find(x=>x.id===c.id)||{})}));
  document.querySelector('#collectionGrid').innerHTML=collections.length?collections.map(collectionCard).join(''):stateMarkup('','No collections yet','Published monthly collections will appear here.');
  const customSection=document.querySelector('#customDeliveriesSection');
  if(customDeliverables.length){customSection.hidden=false;document.querySelector('#customDeliveryGrid').innerHTML=customDeliverables.map(customDeliveryCard).join('')}
}

loadLibrary().catch(err=>{
  console.error(err);
  document.querySelector('#collectionGrid').innerHTML=stateMarkup('error','Library unavailable',friendlyError(err,'Your collection access could not be loaded.'),{href:'/library',label:'Retry'});
});
