import { supabase,initChrome,getSiteMediaSlots,monthLabel,stateMarkup,friendlyError,esc } from '/site.js';

const collectionHref=c=>'/collection?slug='+encodeURIComponent(c.slug);
const productHref=p=>'/product?slug='+encodeURIComponent(p.slug||'');
const month=c=>monthLabel(c.starts_on);

function image(url,alt,priority=false){
  return url?'<img src="'+esc(url)+'" alt="'+esc(alt)+'" '+(priority?'fetchpriority="high"':'loading="lazy"')+'>':'';
}
function collectionImage(c,models){
  return c.cover_image_url||c.hero_image_url||models.find(p=>p.collection_id===c.id&&p.thumbnail_url)?.thumbnail_url||'';
}
function productCard(p){
  return '<a class="store-product-card" href="'+productHref(p)+'"><div class="store-product-media">'+
    image(p.thumbnail_url,p.public_title)+
    (p.has_access?'<span class="work-access">IN YOUR LIBRARY</span>':'')+
    '</div><div class="store-product-body"><h3>'+esc(p.public_title)+'</h3><p>'+esc(p.collection_name||'CyberPop Collection')+'</p></div></a>';
}
function collectionCard(c,models){
  const artwork=collectionImage(c,models);
  return '<a class="collection-tile" href="'+collectionHref(c)+'"><div class="collection-tile-media '+(!artwork?'unfilled':'')+'">'+
    image(artwork,c.display_name)+(!artwork?'<span class="collection-type-cover">'+esc(month(c))+'</span>':'')+
    '<span class="collection-open">VIEW COLLECTION ↗</span></div><div class="collection-tile-copy">'+
    '<span class="eyebrow">'+esc(c.slug)+'</span><h3>'+esc(c.display_name)+'</h3>'+
    (Number(c.product_count||0)?'<p>'+Number(c.product_count)+' models</p>':'')+'</div></a>';
}
function previewCard(c,models,large=false){
  const artwork=collectionImage(c,models);
  return '<a class="showcase-preview '+(large?'showcase-preview-wide ':'')+(!artwork?'unfilled':'')+'" href="'+collectionHref(c)+'">'+
    image(artwork,c.display_name)+'<span class="showcase-preview-shade"></span><span class="showcase-preview-label">'+
    '<small>COLLECTION</small><strong>'+esc(month(c))+'</strong></span><span class="showcase-arrow" aria-hidden="true">↗</span></a>';
}
function renderShowcase(collections,models,slots){
  const feature=collections[0];
  const featureArt=slots.home_hero?.asset_url||(feature?collectionImage(feature,models):'');
  const featurePanel=document.querySelector('#heroFeature');
  featurePanel.classList.toggle('has-artwork',!!featureArt);
  if(featureArt){
    featurePanel.insertAdjacentHTML('afterbegin','<div class="showcase-feature-media">'+image(featureArt,feature?.display_name||'CyberPop collection',true)+'</div>');
  }
  if(feature){
    featurePanel.insertAdjacentHTML('beforeend','<a class="showcase-feature-link" href="'+collectionHref(feature)+'">'+esc(month(feature))+' <span aria-hidden="true">↗</span></a>');
  }
  const previews=collections.slice(1,5);
  document.querySelector('#heroPreviews').innerHTML=previews.map((c,i)=>previewCard(c,models,i===0)).join('');
  document.querySelector('#heroPreviews').hidden=!previews.length;
}

async function loadHome(){
  await initChrome();
  const [slots,overview,collectionRows,products]=await Promise.all([
    getSiteMediaSlots(),
    supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_collections').select('*').eq('is_published',true).order('starts_on',{ascending:false}),
    supabase.from('membership_library_products').select('*').order('collection_starts_on',{ascending:false}).order('product_number',{ascending:false}).limit(100)
  ]);
  if(overview.error)throw overview.error;
  if(collectionRows.error)throw collectionRows.error;
  if(products.error)throw products.error;
  const access=overview.data||[];
  const collections=(collectionRows.data||[]).map(c=>({...c,...(access.find(x=>x.id===c.id)||{})}));
  const models=(products.data||[]).filter(p=>p.thumbnail_url);
  renderShowcase(collections,models,slots);

  const selected=models.slice(0,8);
  document.querySelector('#newReleases').hidden=!selected.length;
  document.querySelector('#newReleaseGrid').innerHTML=selected.map(productCard).join('');
  document.querySelector('#homeCollections').innerHTML=collections.length?
    collections.map(c=>collectionCard(c,models)).join(''):
    stateMarkup('empty','Collections are being prepared','');
}

loadHome().catch(error=>{
  console.error(error);
  document.querySelector('#newReleases').hidden=true;
  document.querySelector('#heroPreviews').hidden=true;
  document.querySelector('#homeCollections').innerHTML=stateMarkup('error','Archive unavailable',friendlyError(error,'The collection archive could not be loaded.'),{href:'/',label:'Retry'});
});
