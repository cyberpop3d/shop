import { supabase,initChrome,monthLabel,stateMarkup,esc } from '/site.js';
import {mosaicMedia} from '/collection-mosaic.js';
import {fetchLiveCultsCatalog,mergeLiveCults} from '/cults-live.js';

let rows=[],snapshotCollections={};
const snapshotPromise=fetch('/data/cults-collections.json',{cache:'force-cache'})
  .then(r=>r.ok?r.json():null).catch(()=>null);
function snapshotRows(snapshot){
  const source=snapshot?.collections||{};
  return Object.entries(source).map(([slug,items])=>{
    const [year,month]=slug.split('-').map(Number),starts_on=slug+'-01';
    return {id:slug,slug,year,month,starts_on,display_name:monthLabel(starts_on),product_count:items.length,is_published:true};
  }).sort((a,b)=>b.starts_on.localeCompare(a.starts_on));
}
function card(c){
  const items=snapshotCollections[c.slug]||[];
  const artwork=c.cover_image_url||c.hero_image_url||c.preview_image_url||'';
  const media=mosaicMedia(c,items,artwork);
  return '<a class="collection-tile collection-mosaic-tile" href="/collection?slug='+encodeURIComponent(c.slug)+'"><div class="collection-tile-media '+(!artwork?'unfilled':'')+'">'+media+
    (c.is_latest_collection?'<span class="collection-ongoing"><i></i>ONGOING COLLECTION</span>':'')+
    '<span class="collection-mosaic-gradient"></span><span class="collection-mosaic-title"><small>'+esc(c.slug)+'</small><strong>'+esc(c.display_name)+' Collection</strong></span><span class="collection-open">VIEW COLLECTION ↗</span></div><div class="collection-tile-copy"><span class="eyebrow">'+esc(String(c.month).padStart(2,'0'))+' / '+esc(c.year)+'</span><h3>'+esc(c.display_name)+'</h3><p>'+Number(c.product_count||items.length)+' models'+(c.has_access?' · IN YOUR LIBRARY':'')+'</p></div></a>';
}
function render(){
  const grid=document.querySelector('#collectionsGrid');
  grid.innerHTML=rows.length?rows.map(card).join(''):stateMarkup('empty','Collections are loading','');
}
async function load(){
  const snapshot=await snapshotPromise;
  snapshotCollections=snapshot?.collections||{};
  rows=snapshotRows(snapshot);
  if(rows[0])rows[0].is_latest_collection=true;
  render();

  await initChrome();
  const [collectionsResult,overviewResult,liveItems]=await Promise.all([
    supabase.from('membership_collections').select('*').eq('is_published',true).order('starts_on',{ascending:false}),
    supabase.from('membership_collection_overview').select('*'),
    fetchLiveCultsCatalog()
  ]);

  const published=!collectionsResult.error&&collectionsResult.data?.length?collectionsResult.data:[];
  snapshotCollections=mergeLiveCults(snapshotCollections,liveItems,published.length?published:rows);

  if(!published.length){
    rows=snapshotRows({collections:snapshotCollections});
    if(rows[0])rows[0].is_latest_collection=true;
    render();
    return;
  }

  const overview=overviewResult.error?[]:overviewResult.data||[];
  rows=published.map(c=>({
    ...c,...(overview.find(x=>x.id===c.id)||{}),
    product_count:Math.max(Number(c.product_count||0),snapshotCollections[c.slug]?.length||0)
  }));
  if(rows[0])rows[0].is_latest_collection=true;
  render();
}
load().catch(error=>{
  console.error(error);
  if(!rows.length)document.querySelector('#collectionsGrid').innerHTML=stateMarkup('error','Collections unavailable','Please refresh to load the archive.');
});
