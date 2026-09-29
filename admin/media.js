import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.1';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '/supabase-config.js';

const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let session=null,slots=[],collections=[],products=[],privateRows=[],gallery=[],snapshotCollections={};
const snapshotItems=slug=>snapshotCollections[slug]||[];
function artworkPicker(items,key,kind){
  if(!items.length)return '';
  return '<div class="media-artwork-picker"><label>Choose existing Cults artwork<select data-artwork-'+kind+'="'+esc(key)+'"><option value="">Choose model…</option>'+
    items.map((item,i)=>'<option value="'+esc(item.imageUrl)+'">#'+(i+1)+' · '+esc(item.title||'Model')+'</option>').join('')+
    '</select></label><button type="button" class="secondary" data-artwork-save-'+kind+'="'+esc(key)+'">Use this artwork</button></div>';
}

function toast(msg,type='success'){
  const el=$('#adminToast');el.textContent=msg;el.className='toast '+(type==='error'?'error ':'')+'show';
  clearTimeout(toast.t);toast.t=setTimeout(()=>el.className='toast',2600);
}
function ratioLabel(w,h){
  const gcd=(a,b)=>b?gcd(b,a%b):a;const d=gcd(w,h);
  return (w/d)+':'+(h/d);
}
function safeName(name){return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-')}
function publicUrl(path){return supabase.storage.from('cyberpop-media').getPublicUrl(path).data.publicUrl}
function fileDimensions(file){
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file);
    if(file.type.startsWith('video/')){
      const video=document.createElement('video');video.preload='metadata';
      video.onloadedmetadata=()=>{resolve({width:video.videoWidth,height:video.videoHeight});URL.revokeObjectURL(url)};
      video.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Could not read video dimensions.'))};
      video.src=url;return;
    }
    const img=new Image();
    img.onload=()=>{resolve({width:img.naturalWidth,height:img.naturalHeight});URL.revokeObjectURL(url)};
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Could not read image dimensions.'))};img.src=url;
  });
}
async function ensureAdmin(){
  const auth=await supabase.auth.getSession();session=auth.data.session;
  if(!session){$('#mediaLoginPanel').hidden=false;$('#mediaApp').hidden=true;return false}
  const check=await supabase.from('sales_admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(check.error||!check.data){$('#mediaLoginPanel').hidden=false;$('#mediaApp').hidden=true;$('#mediaLoginStatus').textContent='This account is not authorized for admin.';return false}
  $('#mediaLoginPanel').hidden=true;$('#mediaApp').hidden=false;return true;
}
async function uploadImage(file,path){
  const dimensions=await fileDimensions(file);
  const upload=await supabase.storage.from('cyberpop-media').upload(path,file,{upsert:false,contentType:file.type,cacheControl:'3600'});
  if(upload.error)throw upload.error;
  return {path,url:publicUrl(path),...dimensions};
}
async function removePath(path){
  if(!path)return;
  const r=await supabase.storage.from('cyberpop-media').remove([path]);
  if(r.error)console.warn(r.error);
}
function preview(url,label,w=16,h=9){
  const video=url&&/(?:videos\.cults3d\.com|\.(?:mp4|webm|mov)(?:$|[?#]))/i.test(url);
  const media=video?'<video src="'+esc(url)+'" aria-label="'+esc(label)+'" muted loop autoplay playsinline preload="metadata"></video>':url?'<img src="'+esc(url)+'" alt="'+esc(label)+'">':'<div class="media-empty">NO MEDIA</div>';
  return '<div class="media-preview" style="aspect-ratio:'+Number(w)+'/'+Number(h)+'">'+media+'</div>';
}
function dimStatus(originalW,originalH,targetW,targetH){
  if(!originalW||!originalH)return 'No image uploaded';
  const exact=originalW===targetW&&originalH===targetH;
  const sameRatio=Math.abs((originalW/originalH)-(targetW/targetH))<0.004;
  if(exact)return 'Exact target size';
  if(sameRatio)return originalW+' × '+originalH+' · same ratio, displayed without crop';
  return originalW+' × '+originalH+' · ratio differs, black letterbox will fill the remainder';
}
function siteSlotCard(s){
  const heroSlot=['home_hero','home_preview_1','home_preview_2','home_preview_3','home_preview_4'].includes(s.slot_key);
  const available=heroSlot?Object.entries(snapshotCollections).flatMap(([slug,items])=>items.map(item=>({...item,title:slug+' · '+item.title}))):[];
  return '<article class="media-admin-card">'+preview(s.asset_url,s.label,s.recommended_width,s.recommended_height)+
    '<div class="media-admin-copy"><div class="record-head"><div><span class="eyebrow">'+esc(s.page_name)+'</span><h3>'+esc(s.label)+'</h3></div><span class="badge">'+ratioLabel(s.recommended_width,s.recommended_height)+'</span></div>'+
    '<p>'+esc(s.description||'')+'</p><div class="media-spec"><strong>'+s.recommended_width+' × '+s.recommended_height+' px</strong><span>'+esc(dimStatus(s.original_width,s.original_height,s.recommended_width,s.recommended_height))+'</span></div>'+
    '<div class="media-upload-row"><label class="admin-btn media-file-label">Upload / replace<input type="file" accept="image/png,image/jpeg,image/webp,image/avif,video/mp4,video/webm" data-site-file="'+esc(s.slot_key)+'"></label>'+(s.asset_url?'<button class="ghost" data-site-remove="'+esc(s.slot_key)+'">Remove</button>':'')+'</div>'+artworkPicker(available,s.slot_key,'site')+'</div></article>';
}
function collectionCard(c){
  const picker=artworkPicker(snapshotItems(c.slug),c.id,'collection');
  return '<article class="media-admin-card">'+preview(c.cover_image_url,c.display_name+' card',1200,900)+
    '<div class="media-admin-copy"><div class="record-head"><div><span class="eyebrow">'+esc(c.slug)+'</span><h3>'+esc(c.display_name)+' · Card</h3></div><span class="badge">4:3</span></div>'+
    '<p>Choose the lead model for the collection mosaic, or upload custom cover art.</p><div class="media-spec"><strong>Square collection mosaic</strong><span>The chosen artwork appears in the large top-left cell.</span></div>'+
    '<div class="media-upload-row"><label class="admin-btn media-file-label">Upload / replace<input type="file" accept="image/png,image/jpeg,image/webp,image/avif,video/mp4,video/webm" data-collection-cover="'+c.id+'"></label>'+(c.cover_image_url?'<button class="ghost" data-collection-cover-remove="'+c.id+'">Remove</button>':'')+'</div>'+picker+'</div></article>'+
    '<article class="media-admin-card">'+preview(c.hero_image_url,c.display_name+' hero',1920,900)+
    '<div class="media-admin-copy"><div class="record-head"><div><span class="eyebrow">'+esc(c.slug)+'</span><h3>'+esc(c.display_name)+' · Hero</h3></div><span class="badge">32:15</span></div>'+
    '<p>Wide artwork for the collection detail header.</p><div class="media-spec"><strong>1920 × 900 px</strong><span>Off-ratio images remain centered on black.</span></div>'+
    '<div class="media-upload-row"><label class="admin-btn media-file-label">Upload / replace<input type="file" accept="image/png,image/jpeg,image/webp,image/avif,video/mp4,video/webm" data-collection-hero="'+c.id+'"></label>'+(c.hero_image_url?'<button class="ghost" data-collection-hero-remove="'+c.id+'">Remove</button>':'')+'</div></div></article>';
}
function productName(p){const priv=privateRows.find(x=>x.product_id===p.id);return priv?.internal_name||p.public_title}
function heroField(key,label,value,type='text'){
  return '<label>'+esc(label)+'<input type="'+type+'" data-hero-field="'+esc(key)+'" value="'+esc(value||'')+'"></label>';
}
function renderHeroComposer(){
  const slot=slots.find(x=>x.slot_key==='home_hero');if(!slot)return;
  const c=slot.content_json||{};
  const groups=[
    ['Main copy',heroField('studio_caption','Small studio caption',c.studio_caption||'CYBERPOP Studio Design Service')+heroField('primary_label','Primary button',c.primary_label)+heroField('primary_href','Primary link',c.primary_href)+heroField('secondary_label','Secondary button',c.secondary_label)+heroField('secondary_href','Secondary link',c.secondary_href)],
    ['Main artwork label',heroField('feature_label','Collection label',c.feature_label)+heroField('feature_href','Collection link',c.feature_href)],
    ['Preview 1 · wide',heroField('preview_1_label','Label',c.preview_1_label)+heroField('preview_1_href','Link',c.preview_1_href)],
    ['Preview 2 · small',heroField('preview_2_label','Label',c.preview_2_label)+heroField('preview_2_href','Link',c.preview_2_href)],
    ['Preview 3 · small',heroField('preview_3_label','Label',c.preview_3_label)+heroField('preview_3_href','Link',c.preview_3_href)],
    ['Preview 4 · small',heroField('preview_4_label','Label',c.preview_4_label)+heroField('preview_4_href','Link',c.preview_4_href)]
  ];
  $('#heroComposer').innerHTML=groups.map(g=>'<div class="hero-composer-group"><h3>'+g[0]+'</h3>'+g[1]+'</div>').join('');
}
async function saveHeroComposer(){
  const content={};document.querySelectorAll('[data-hero-field]').forEach(input=>content[input.dataset.heroField]=input.value.trim());
  const r=await supabase.from('site_media_slots').update({content_json:content,updated_by:session.user.id,updated_at:new Date().toISOString()}).eq('slot_key','home_hero');
  if(r.error)return toast(r.error.message,'error');toast('Homepage hero updated.');await load();
}
function renderProductEditor(){
  const id=$('#mediaProductSelect').value;const p=products.find(x=>x.id===id);
  if(!p){$('#productMediaEditor').innerHTML='<p class="small">No model selected.</p>';return}
  const images=gallery.filter(x=>x.product_id===p.id).sort((a,b)=>a.sort_order-b.sort_order);
  $('#productMediaEditor').innerHTML='<div class="media-product-main">'+
    '<article class="media-admin-card">'+preview(p.thumbnail_url,productName(p),1200,1400)+'<div class="media-admin-copy"><span class="eyebrow">CARD MEDIA</span><h3>'+esc(productName(p))+'</h3><p>Used in product grids, library cards and related model cards.</p><div class="media-spec"><strong>1200 × 1400 px</strong><span>6:7 target · contain + black background.</span></div><div class="media-upload-row"><label class="admin-btn media-file-label">Upload / replace<input type="file" accept="image/png,image/jpeg,image/webp,image/avif,video/mp4,video/webm" data-product-thumb="'+p.id+'"></label>'+(p.thumbnail_url?'<button class="ghost" data-product-thumb-remove="'+p.id+'">Remove</button>':'')+'</div></div></article>'+
    '<article class="media-admin-card media-gallery-add"><div class="media-admin-copy"><span class="eyebrow">PRODUCT GALLERY</span><h3>Add gallery media</h3><p>Recommended 1600 × 1600 px. The original image or video is stored unchanged.</p><div class="media-spec"><strong>1600 × 1600 px</strong><span>Image or video · contain + black background.</span></div><label class="admin-btn media-file-label">Add media<input type="file" accept="image/png,image/jpeg,image/webp,image/avif,video/mp4,video/webm" data-gallery-add="'+p.id+'"></label></div></article>'+
    '</div><div class="media-gallery-grid">'+(images.length?images.map((g,i)=>'<article class="media-gallery-item">'+preview(g.image_url,'Gallery '+(i+1),1600,1600)+'<div class="media-gallery-meta"><span>#'+(i+1)+' · '+(g.original_width||'?')+' × '+(g.original_height||'?')+'</span><button class="ghost" data-gallery-remove="'+g.id+'">Remove</button></div></article>').join(''):'<div class="record"><p class="small">No gallery images yet.</p></div>')+'</div>';
  bindProductEvents();
}
function bindProductEvents(){
  document.querySelectorAll('[data-product-thumb]').forEach(input=>input.onchange=e=>uploadProductThumb(input.dataset.productThumb,e.target.files[0]));
  document.querySelectorAll('[data-product-thumb-remove]').forEach(btn=>btn.onclick=()=>removeProductThumb(btn.dataset.productThumbRemove));
  document.querySelectorAll('[data-gallery-add]').forEach(input=>input.onchange=e=>addGallery(input.dataset.galleryAdd,e.target.files[0]));
  document.querySelectorAll('[data-gallery-remove]').forEach(btn=>btn.onclick=()=>removeGallery(btn.dataset.galleryRemove));
}
function render(){
  renderHeroComposer();
  $('#siteSlots').innerHTML=slots.map(siteSlotCard).join('');
  $('#collectionMedia').innerHTML=collections.map(collectionCard).join('')||'<p class="small">No collections yet.</p>';
  $('#mediaProductSelect').innerHTML=products.map(p=>'<option value="'+p.id+'">'+esc(productName(p))+' · '+esc(p.public_title)+'</option>').join('');
  document.querySelectorAll('[data-site-file]').forEach(input=>input.onchange=e=>uploadSiteSlot(input.dataset.siteFile,e.target.files[0]));
  document.querySelectorAll('[data-site-remove]').forEach(btn=>btn.onclick=()=>removeSiteSlot(btn.dataset.siteRemove));
  document.querySelectorAll('[data-artwork-save-site]').forEach(btn=>btn.onclick=()=>selectArtwork('site',btn.dataset.artworkSaveSite));
  document.querySelectorAll('[data-artwork-save-collection]').forEach(btn=>btn.onclick=()=>selectArtwork('collection',btn.dataset.artworkSaveCollection));
  document.querySelectorAll('[data-collection-cover]').forEach(input=>input.onchange=e=>uploadCollectionCover(input.dataset.collectionCover,e.target.files[0]));
  document.querySelectorAll('[data-collection-cover-remove]').forEach(btn=>btn.onclick=()=>removeCollectionCover(btn.dataset.collectionCoverRemove));
  document.querySelectorAll('[data-collection-hero]').forEach(input=>input.onchange=e=>uploadCollectionHero(input.dataset.collectionHero,e.target.files[0]));
  document.querySelectorAll('[data-collection-hero-remove]').forEach(btn=>btn.onclick=()=>removeCollectionHero(btn.dataset.collectionHeroRemove));
  renderProductEditor();
}
async function load(){
  const res=await Promise.all([
    supabase.from('site_media_slots').select('*').order('page_name').order('slot_key'),
    supabase.from('membership_collections').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_products').select('*').order('collection_id').order('product_number'),
    supabase.from('membership_product_private').select('*'),
    supabase.from('membership_product_images').select('*'),
    fetch('/data/cults-collections.json').then(r=>r.ok?r.json():null).catch(()=>null)
  ]);
  const err=res.find(x=>x.error);if(err)throw err.error;
  slots=res[0].data||[];collections=res[1].data||[];products=res[2].data||[];privateRows=res[3].data||[];gallery=res[4].data||[];snapshotCollections=res[5]?.collections||{};
  render();
}
async function selectArtwork(kind,key){
  const select=document.querySelector('[data-artwork-'+kind+'="'+CSS.escape(key)+'"]');
  const url=select?.value;
  if(!url)return toast('Choose a model first.','error');
  const table=kind==='site'?'site_media_slots':'membership_collections';
  const query=kind==='site'?'slot_key':'id';
  const values=kind==='site'?{asset_url:url,storage_path:null,original_width:null,original_height:null,file_name:null,updated_by:session.user.id,updated_at:new Date().toISOString()}:
    {cover_image_url:url,cover_storage_path:null,updated_at:new Date().toISOString()};
  const result=await supabase.from(table).update(values).eq(query,key);
  if(result.error)return toast(result.error.message,'error');
  toast('Featured artwork updated.');await load();
}
async function uploadSiteSlot(key,file){
  if(!file)return;const slot=slots.find(x=>x.slot_key===key);if(!slot)return;
  try{
    toast('Uploading '+slot.label+'…');
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
    const path='site/'+key+'/'+Date.now()+'-'+safeName(file.name||('image.'+ext));
    const up=await uploadImage(file,path);
    const r=await supabase.from('site_media_slots').update({asset_url:up.url,storage_path:up.path,original_width:up.width,original_height:up.height,file_name:file.name,updated_by:session.user.id,updated_at:new Date().toISOString()}).eq('slot_key',key);
    if(r.error)throw r.error;await removePath(slot.storage_path);toast('Image updated.');await load();
  }catch(e){toast(e.message,'error')}
}
async function removeSiteSlot(key){
  const slot=slots.find(x=>x.slot_key===key);if(!slot)return;
  const r=await supabase.from('site_media_slots').update({asset_url:null,storage_path:null,original_width:null,original_height:null,file_name:null,updated_by:session.user.id,updated_at:new Date().toISOString()}).eq('slot_key',key);
  if(r.error)return toast(r.error.message,'error');await removePath(slot.storage_path);toast('Image removed.');await load();
}
async function uploadCollectionCover(id,file){
  if(!file)return;const c=collections.find(x=>x.id===id);if(!c)return;
  try{
    const path='collections/'+id+'/cover/'+Date.now()+'-'+safeName(file.name);
    const up=await uploadImage(file,path);
    const r=await supabase.from('membership_collections').update({cover_image_url:up.url,cover_storage_path:up.path,updated_at:new Date().toISOString()}).eq('id',id);
    if(r.error)throw r.error;await removePath(c.cover_storage_path);toast('Collection card image updated.');await load();
  }catch(e){toast(e.message,'error')}
}
async function removeCollectionCover(id){
  const c=collections.find(x=>x.id===id);if(!c)return;
  const r=await supabase.from('membership_collections').update({cover_image_url:null,cover_storage_path:null,updated_at:new Date().toISOString()}).eq('id',id);
  if(r.error)return toast(r.error.message,'error');await removePath(c.cover_storage_path);toast('Collection card image removed.');await load();
}
async function uploadCollectionHero(id,file){
  if(!file)return;const c=collections.find(x=>x.id===id);if(!c)return;
  try{
    const path='collections/'+id+'/hero/'+Date.now()+'-'+safeName(file.name);
    const up=await uploadImage(file,path);
    const r=await supabase.from('membership_collections').update({hero_image_url:up.url,hero_storage_path:up.path,updated_at:new Date().toISOString()}).eq('id',id);
    if(r.error)throw r.error;await removePath(c.hero_storage_path);toast('Collection hero updated.');await load();
  }catch(e){toast(e.message,'error')}
}
async function removeCollectionHero(id){
  const c=collections.find(x=>x.id===id);if(!c)return;
  const r=await supabase.from('membership_collections').update({hero_image_url:null,hero_storage_path:null,updated_at:new Date().toISOString()}).eq('id',id);
  if(r.error)return toast(r.error.message,'error');await removePath(c.hero_storage_path);toast('Collection hero removed.');await load();
}
async function uploadProductThumb(id,file){
  if(!file)return;const p=products.find(x=>x.id===id);if(!p)return;
  try{
    const path='products/'+id+'/thumbnail/'+Date.now()+'-'+safeName(file.name);
    const up=await uploadImage(file,path);
    const r=await supabase.from('membership_products').update({thumbnail_url:up.url,thumbnail_storage_path:up.path,product_updated_at:new Date().toISOString()}).eq('id',id);
    if(r.error)throw r.error;await removePath(p.thumbnail_storage_path);toast('Product thumbnail updated.');await load();$('#mediaProductSelect').value=id;renderProductEditor();
  }catch(e){toast(e.message,'error')}
}
async function removeProductThumb(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  const r=await supabase.from('membership_products').update({thumbnail_url:null,thumbnail_storage_path:null,product_updated_at:new Date().toISOString()}).eq('id',id);
  if(r.error)return toast(r.error.message,'error');await removePath(p.thumbnail_storage_path);toast('Thumbnail removed.');await load();$('#mediaProductSelect').value=id;renderProductEditor();
}
async function addGallery(id,file){
  if(!file)return;
  try{
    const dims=await fileDimensions(file);const path='products/'+id+'/gallery/'+Date.now()+'-'+safeName(file.name);
    const upload=await supabase.storage.from('cyberpop-media').upload(path,file,{contentType:file.type,cacheControl:'3600'});
    if(upload.error)throw upload.error;
    const current=gallery.filter(x=>x.product_id===id);const r=await supabase.from('membership_product_images').insert({product_id:id,image_url:publicUrl(path),storage_path:path,sort_order:current.length,original_width:dims.width,original_height:dims.height});
    if(r.error){await removePath(path);throw r.error}toast('Gallery image added.');await load();$('#mediaProductSelect').value=id;renderProductEditor();
  }catch(e){toast(e.message,'error')}
}
async function removeGallery(id){
  const g=gallery.find(x=>x.id===id);if(!g)return;
  const r=await supabase.from('membership_product_images').delete().eq('id',id);
  if(r.error)return toast(r.error.message,'error');await removePath(g.storage_path);toast('Gallery image removed.');await load();$('#mediaProductSelect').value=g.product_id;renderProductEditor();
}

$('#mediaProductSelect').addEventListener('change',renderProductEditor);
$('#saveHeroComposer').onclick=()=>saveHeroComposer();
$('#refreshMedia').onclick=()=>load().catch(e=>toast(e.message,'error'));
$('#mediaLoginForm').addEventListener('submit',async e=>{
  e.preventDefault();$('#mediaLoginStatus').textContent='Sending sign-in link…';
  const r=await supabase.auth.signInWithOtp({email:$('#mediaLoginEmail').value.trim(),options:{emailRedirectTo:location.origin+'/admin/media'}});
  $('#mediaLoginStatus').textContent=r.error?r.error.message:'Check your email for the admin sign-in link.';
});
supabase.auth.onAuthStateChange(()=>setTimeout(init,0));
async function init(){if(await ensureAdmin())load().catch(e=>toast(e.message,'error'))}
init();
