import { supabase,initChrome,getSession,getCreditSummary,stateMarkup,esc } from '/site.js';

const slug=new URLSearchParams(location.search).get('slug');
let currentProduct=null;
let currentSession=null;

function card(p){
  const media=p.thumbnail_url
    ? '<img src="'+esc(p.thumbnail_url)+'" alt="'+esc(p.public_title)+'">'
    : '<div class="media-placeholder"><span>1200 × 1400</span></div>';
  return '<a class="store-product-card" href="/product?slug='+encodeURIComponent(p.slug||'')+'">'+
    '<div class="store-product-media">'+media+(p.has_access?'<span class="store-product-badge">OWNED</span>':'')+'</div>'+
    '<div class="store-product-body"><h3>'+esc(p.public_title)+'</h3><p>'+esc(p.collection_name||'Collection')+
    (p.credit_price?' · '+Number(p.credit_price)+' C':'')+'</p></div></a>';
}

function safeReturnPath(){
  return '/product?slug='+encodeURIComponent(slug||'');
}

async function toggleFavorite(productId,button){
  const session=await getSession();
  if(!session){location.href='/account?returnTo='+encodeURIComponent(safeReturnPath());return}
  const existing=await supabase.from('member_favorites').select('product_id').eq('product_id',productId).maybeSingle();
  if(existing.error){console.error(existing.error);return}
  if(existing.data){
    const r=await supabase.from('member_favorites').delete().eq('product_id',productId);
    if(r.error)return console.error(r.error);
    button.textContent='♡ Favorite';
    button.dataset.active='false';
  }else{
    const r=await supabase.from('member_favorites').insert({user_id:session.user.id,product_id:productId});
    if(r.error)return console.error(r.error);
    button.textContent='♥ Favorited';
    button.dataset.active='true';
  }
}

async function renderAccess(p){
  const access=document.querySelector('#productAccess');
  if(p.has_access){
    access.innerHTML='<div class="unlock-box"><span class="eyebrow">IN YOUR LIBRARY</span><div class="unlock-price"><strong>OWNED</strong></div>'+
      '<p class="unlock-note">Ownership is verified by the backend entitlement state.</p>'+
      (p.cults_url?'<a class="btn btn-light" href="'+esc(p.cults_url)+'" target="_blank" rel="noopener">Open on Cults →</a>':'<button class="btn btn-ghost" disabled>Delivery link pending</button>')+
      '</div>';
    return;
  }

  if(!currentSession){
    access.innerHTML='<div class="unlock-box"><span class="eyebrow">MODEL ACCESS</span>'+
      '<div class="unlock-price"><strong>'+(p.credit_price?Number(p.credit_price)+' C':'—')+'</strong><span>credit unlock</span></div>'+
      '<p class="unlock-note">Sign in to check your balance and unlock this model.</p>'+
      '<a class="btn btn-light" href="/account?returnTo='+encodeURIComponent(safeReturnPath())+'">Sign in to unlock →</a></div>';
    return;
  }

  if(!p.credit_price){
    access.innerHTML='<div class="unlock-box"><span class="eyebrow">MODEL ACCESS</span><div class="unlock-price"><strong>SOON</strong></div><p class="unlock-note">Credit price has not been published yet.</p></div>';
    return;
  }

  const summary=await getCreditSummary();
  const enough=summary.balance>=Number(p.credit_price);
  access.innerHTML='<div class="unlock-box"><span class="eyebrow">CREDIT UNLOCK</span>'+
    '<div class="unlock-price"><strong>'+Number(p.credit_price)+' C</strong><span>permanent model unlock</span></div>'+
    '<p class="unlock-note">Balance: '+summary.balance+' C · The server will re-read the product price before spending credits.</p>'+
    '<button id="unlockButton" class="btn btn-light">'+(enough?'Unlock for '+Number(p.credit_price)+' C':'Need '+(Number(p.credit_price)-summary.balance)+' more credits')+'</button>'+
    '<div id="unlockResult" class="unlock-result"></div></div>';
  document.querySelector('#unlockButton').onclick=()=>openUnlockDialog(p,summary);
}

function ensureDialog(){
  let dialog=document.querySelector('#unlockDialog');
  if(dialog)return dialog;
  dialog=document.createElement('dialog');
  dialog.id='unlockDialog';
  dialog.className='unlock-dialog';
  document.body.appendChild(dialog);
  return dialog;
}

function openUnlockDialog(p,summary){
  const dialog=ensureDialog();
  const price=Number(p.credit_price||0);
  dialog.innerHTML='<div class="unlock-dialog-inner"><span class="eyebrow">CONFIRM UNLOCK</span>'+
    '<h3>Unlock '+esc(p.public_title)+'?</h3>'+
    '<p>Credits are spent only if the backend confirms the current product price, your balance and that you do not already own the model.</p>'+
    '<div class="unlock-balance-grid"><div><span>Price</span><strong>'+price+' C</strong></div><div><span>Current</span><strong>'+summary.balance+' C</strong></div><div><span>After</span><strong>'+Math.max(0,summary.balance-price)+' C</strong></div></div>'+
    '<div id="dialogUnlockResult" class="unlock-result"></div>'+
    '<div class="unlock-dialog-actions"><button id="cancelUnlock" class="btn btn-ghost">Cancel</button><button id="confirmUnlock" class="btn btn-light">Unlock Model</button></div></div>';
  dialog.showModal();
  document.querySelector('#cancelUnlock').onclick=()=>dialog.close();
  document.querySelector('#confirmUnlock').onclick=()=>performUnlock(p.id,dialog);
}

async function performUnlock(productId,dialog){
  const button=document.querySelector('#confirmUnlock');
  const result=document.querySelector('#dialogUnlockResult');
  button.disabled=true;button.textContent='Processing…';result.textContent='';
  const r=await supabase.rpc('unlock_product_with_credits',{p_product_id:productId});
  if(r.error){
    result.className='unlock-result error';
    result.textContent=r.error.message;
    button.disabled=false;button.textContent='Try Again';
    return;
  }
  const data=r.data||{};
  if(data.status==='unlocked'){
    result.className='unlock-result success';
    result.textContent='Unlocked. The model is now in your Library.';
    button.textContent='Unlocked';
    setTimeout(()=>location.reload(),700);
    return;
  }
  if(data.status==='already_owned'){
    result.className='unlock-result success';
    result.textContent='Already owned. No credits were spent.';
    setTimeout(()=>location.reload(),600);
    return;
  }
  if(data.status==='insufficient_credits'){
    result.className='unlock-result error';
    result.textContent='Insufficient credits. You need '+Number(data.needed||0)+' more C.';
    button.disabled=false;button.textContent='Unlock Model';
    return;
  }
  result.className='unlock-result error';
  result.textContent='Unlock could not be completed.';
  button.disabled=false;button.textContent='Try Again';
}

async function load(){
  currentSession=await initChrome();
  const v=await supabase.from('membership_library_products').select('*').eq('slug',slug).maybeSingle();
  if(v.error)throw v.error;
  if(!v.data)throw new Error('Model not found.');
  const p=v.data;currentProduct=p;

  const [raw,g,favorite]=await Promise.all([
    supabase.from('membership_products').select('description').eq('id',p.id).maybeSingle(),
    supabase.from('membership_product_images').select('*').eq('product_id',p.id).order('sort_order'),
    currentSession?supabase.from('member_favorites').select('product_id').eq('product_id',p.id).maybeSingle():Promise.resolve({data:null,error:null})
  ]);

  document.title=p.public_title+' — CyberPop';
  document.querySelector('#productEyebrow').textContent=p.collection_name||'MODEL';
  document.querySelector('#productName').textContent=p.public_title;
  document.querySelector('#productDescription').textContent=raw.data?.description||'CyberPop multipart collectible model.';
  document.querySelector('#productTags').innerHTML='<span>'+(p.multipart?'MULTIPART':'MODEL')+'</span><span>'+(p.ams_required?'AMS':'NO AMS')+'</span>'+(p.height_mm?'<span>'+p.height_mm+' MM</span>':'')+(p.credit_price?'<span>'+Number(p.credit_price)+' C</span>':'');

  const images=[...(g.data||[])];
  if(p.thumbnail_url&&!images.some(x=>x.image_url===p.thumbnail_url))images.unshift({image_url:p.thumbnail_url});
  const main=document.querySelector('#galleryMain'),thumbs=document.querySelector('#galleryThumbs');
  function setMain(url){main.innerHTML=url?'<img src="'+esc(url)+'" alt="'+esc(p.public_title)+'">':'<div class="media-placeholder"><span>PRODUCT GALLERY · 1600 × 1600</span></div>'}
  setMain(images[0]?.image_url||null);
  thumbs.innerHTML=images.map((x,i)=>'<button class="gallery-thumb" data-i="'+i+'"><img src="'+esc(x.image_url)+'" alt=""></button>').join('');
  thumbs.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>setMain(images[Number(b.dataset.i)].image_url));

  const favButton=document.querySelector('#favoriteProduct');
  favButton.textContent=favorite.data?'♥ Favorited':'♡ Favorite';
  favButton.onclick=()=>toggleFavorite(p.id,favButton);

  await renderAccess(p);

  document.querySelector('#detailOwned').textContent=p.has_access?'Owned':'Locked';
  document.querySelector('#detailMultipart').textContent=p.multipart?'Yes':'—';
  document.querySelector('#detailAms').textContent=p.ams_required?'Required':'No';
  document.querySelector('#detailHeight').textContent=p.height_mm?p.height_mm+' mm':'—';
  document.querySelector('#detailVersion').textContent=p.version||'1.0';
  document.querySelector('#detailRelease').textContent=p.release_date||'—';
  document.querySelector('#detailUpdated').textContent=p.product_updated_at?new Date(p.product_updated_at).toLocaleDateString():'—';
  document.querySelector('#collectionLink').href='/collection?slug='+encodeURIComponent(p.collection_slug||'');

  const related=await supabase.from('membership_library_products').select('*').eq('collection_id',p.collection_id).neq('id',p.id).limit(6);
  document.querySelector('#relatedGrid').innerHTML=(related.data||[]).map(card).join('')||stateMarkup('','No related models','More models from this collection will appear here.');
}
load().catch(e=>{console.error(e);document.querySelector('#productDetail').innerHTML=stateMarkup('error','Model unavailable',e.message)});