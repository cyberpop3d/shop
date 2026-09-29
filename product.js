import { supabase,initChrome,getSession,mediaMarkup,stateMarkup,loadingMarkup,friendlyError,showToast,esc } from '/site.js';

const slug=new URLSearchParams(location.search).get('slug');
let currentProduct=null;
let currentSession=null;

function card(p){
  const label=(p.collection_name||'CyberPop Collection')+' #'+String(p.product_number||1);
  const media=p.thumbnail_url
    ? mediaMarkup(p.thumbnail_url,label)
    : '<div class="media-placeholder"><span>1200 × 1400</span></div>';
  return '<a class="store-product-card" href="/product?slug='+encodeURIComponent(p.slug||'')+'">'+
    '<div class="store-product-media">'+media+(p.has_access?'<span class="store-product-badge">OWNED</span>':'')+'</div>'+
    '<div class="store-product-body"><h3>'+esc(label)+'</h3><p>'+esc(p.collection_name||'Collection')+'</p></div></a>';
}

function safeReturnPath(){
  return '/product?slug='+encodeURIComponent(slug||'');
}

async function toggleFavorite(productId,button){
  const session=await getSession();
  if(!session){location.href='/account?returnTo='+encodeURIComponent(safeReturnPath());return}
  const existing=await supabase.from('member_favorites').select('product_id').eq('product_id',productId).maybeSingle();
  if(existing.error){console.error(existing.error);showToast('Favorite state could not be loaded.','error');return}
  if(existing.data){
    const r=await supabase.from('member_favorites').delete().eq('product_id',productId);
    if(r.error){console.error(r.error);showToast('Favorite could not be updated.','error');return}
    button.textContent='♡ Favorite';
    button.dataset.active='false';showToast('Removed from favorites.');
  }else{
    const r=await supabase.from('member_favorites').insert({user_id:session.user.id,product_id:productId});
    if(r.error){console.error(r.error);showToast('Favorite could not be updated.','error');return}
    button.textContent='♥ Favorited';
    button.dataset.active='true';showToast('Added to favorites.');
  }
}

async function renderAccess(p){
  const access=document.querySelector('#productAccess');
  if(p.has_access){
    let delivery='';
    if(p.disable_new_downloads){
      delivery='<button class="btn btn-ghost" disabled>Downloads currently unavailable</button>';
    }else if(p.cults_url){
      delivery='<a class="btn btn-light" href="'+esc(p.cults_url)+'" target="_blank" rel="noopener">Open on Cults →</a>';
    }else if(currentSession){
      const [missing,emailOk]=await Promise.all([
        supabase.rpc('get_my_missing_legal_requirements',{p_scope:'download'}),
        Promise.resolve(Boolean(currentSession.user.email_confirmed_at))
      ]);
      if(!emailOk)delivery='<a class="btn btn-ghost" href="/account?returnTo='+encodeURIComponent(safeReturnPath())+'">Verify email to download →</a>';
      else if(!missing.error&&(missing.data||[]).length)delivery='<a class="btn btn-ghost" href="/account?returnTo='+encodeURIComponent(safeReturnPath())+'">Review download agreements →</a>';
      else delivery='<button class="btn btn-ghost" disabled>Delivery link pending</button>';
    }else{
      delivery='<a class="btn btn-ghost" href="/account?returnTo='+encodeURIComponent(safeReturnPath())+'">Sign in for delivery →</a>';
    }
    access.innerHTML='<div class="unlock-box"><span class="eyebrow">IN YOUR LIBRARY</span><div class="unlock-price"><strong>OWNED</strong></div>'+
      '<p class="unlock-note">Ownership is verified by backend entitlement state. Hosting/download availability may be affected by legal or platform restrictions.</p>'+
      delivery+
      '<p class="download-license-note">Licensed to your account. Redistribution of the digital file is prohibited. Physical-print permissions, where applicable, are governed by the license attached to this product.</p></div>';
    return;
  }

  if(p.disable_new_purchases){
    access.innerHTML='<div class="unlock-box"><span class="eyebrow">MODEL ACCESS</span><div class="unlock-price"><strong>UNAVAILABLE</strong></div><p class="unlock-note">New access to this model is currently unavailable.</p></div>';
    return;
  }

  access.innerHTML='<div class="unlock-box"><span class="eyebrow">COLLECTION ACCESS</span><div class="unlock-price"><strong>REQUEST</strong></div>'+
    '<p class="unlock-note">This model is available through a CyberPop collection access request.</p>'+
    '<a class="btn btn-light" href="/access">Get Collection Access →</a></div>';
}

function renderRightsNotices(p){
  const target=document.querySelector('#productRightsNotices');
  const notices=[];
  notices.push('<article class="rights-notice"><span class="eyebrow">DIGITAL FILE LICENSE</span><strong>'+(p.license_scope==='PHYSICAL_COMMERCIAL'?'Physical-print permission attached':'Personal use by default')+'</strong><p>Digital redistribution rights are never included. Do not resell, upload, share or redistribute STL/3MF/ZIP files or modified digital derivatives.</p><a href="/rights-of-use">View Rights of Use →</a></article>');
  if(p.ip_class==='UNOFFICIAL_FAN_WORK'||p.fan_art_disclaimer){
    notices.push('<article class="rights-notice warn"><span class="eyebrow">UNOFFICIAL FAN-CREATED WORK</span><strong>Not an official third-party product.</strong><p>Unofficial fan-created design. Not affiliated with, sponsored by, endorsed by or represented as an official product of any third-party rights holder. Third-party names, characters, trademarks and properties remain the property of their respective owners. Any license offered by CyberPop applies only to rights CyberPop is legally entitled to grant.</p><a href="/ip-policy">IP / Rights Holder Policy →</a></article>');
  }
  if(p.commercial_print_allowed||p.license_scope==='PHYSICAL_COMMERCIAL'){
    notices.push('<article class="rights-notice"><span class="eyebrow">COMMERCIAL PHYSICAL PRINT PERMISSION</span><strong>Physical prints only.</strong><p>You manufacture and sell physical prints independently. You are responsible for manufacturing quality, materials, safety, labeling, taxes, marketplace compliance and any third-party rights applicable to your activity. This does not create an official third-party franchise license.</p><a href="/seller-license">Seller License Terms →</a></article>');
  }
  target.innerHTML=notices.join('');
}

async function load(){
  currentSession=await initChrome();
  document.querySelector('#relatedGrid').innerHTML=loadingMarkup(6,'card');
  const v=await supabase.from('membership_library_products').select('*').eq('slug',slug).maybeSingle();
  if(v.error)throw v.error;
  if(!v.data)throw new Error('Model not found.');
  const p=v.data;currentProduct=p;

  const [raw,g,favorite]=await Promise.all([
    supabase.from('membership_products').select('description').eq('id',p.id).maybeSingle(),
    supabase.from('membership_product_images').select('*').eq('product_id',p.id).order('sort_order'),
    currentSession?supabase.from('member_favorites').select('product_id').eq('product_id',p.id).maybeSingle():Promise.resolve({data:null,error:null})
  ]);

  const publicLabel=(p.collection_name||'CyberPop Collection')+' #'+String(p.product_number||1);
  document.title=publicLabel+' — CyberPop';
  document.querySelector('#productEyebrow').textContent=p.collection_name||'MODEL';
  document.querySelector('#productName').textContent=publicLabel;
  document.querySelector('#productDescription').textContent='CyberPop multipart collectible model.';
  document.querySelector('#productTags').innerHTML='<span>'+(p.multipart?'MULTIPART':'MODEL')+'</span><span>'+(p.ams_required?'AMS':'NO AMS')+'</span>'+(p.height_mm?'<span>'+p.height_mm+' MM</span>':'')+'<span>'+(p.license_scope==='PHYSICAL_COMMERCIAL'?'PHYSICAL PRINT PERMISSION':'PERSONAL LICENSE')+'</span>';
  renderRightsNotices(p);

  const images=[...(g.data||[])];
  if(p.thumbnail_url&&!images.some(x=>x.image_url===p.thumbnail_url))images.unshift({image_url:p.thumbnail_url});
  const main=document.querySelector('#galleryMain'),thumbs=document.querySelector('#galleryThumbs');
  function setMain(url){main.innerHTML=url?mediaMarkup(url,publicLabel,{priority:true,controls:true}):'<div class="media-placeholder"><span>PRODUCT GALLERY · 1600 × 1600</span></div>'}
  setMain(images[0]?.image_url||null);
  thumbs.innerHTML=images.map((x,i)=>'<button class="gallery-thumb" data-i="'+i+'">'+mediaMarkup(x.image_url,'')+'</button>').join('');
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
load().catch(e=>{console.error(e);document.querySelector('#productDetail').innerHTML=stateMarkup('error','Model unavailable',friendlyError(e,'This model could not be loaded.'),{href:'/collections',label:'Browse collections'});document.querySelector('#productRightsNotices').innerHTML='';document.querySelector('#relatedGrid').innerHTML='';});
