import { supabase,initChrome,getSiteMediaSlots,monthLabel,stateMarkup,loadingMarkup,friendlyError,esc } from '/site.js';
let rows=[],active='all';
function card(c){
  const artwork=cover(c);
  const media=artwork?'<img src="'+esc(artwork)+'" alt="'+esc(c.display_name)+'" loading="lazy">':'<span class="collection-type-cover">'+esc(c.display_name)+'</span>';
  return '<a class="collection-tile" href="/collection?slug='+encodeURIComponent(c.slug)+'"><div class="collection-tile-media '+(!artwork?'unfilled':'')+'">'+media+'</div><div class="collection-tile-copy"><span class="eyebrow">'+esc(String(c.month).padStart(2,'0'))+' / '+esc(c.year)+'</span><h3>'+esc(c.display_name)+'</h3>'+(Number(c.product_count||0)?'<p>'+Number(c.product_count)+' models</p>':'')+'</div></a>';
}
function cover(c){return c.cover_image_url||c.preview_image_url||(/^2026-(04|05|06|07|08|09|10)$/.test(c.slug||'')?'/images/cults/'+c.slug+'.webp':'')}
function renderHero(collections,slot){
  const feature=collections.filter(c=>c.starts_on<=new Date().toISOString().slice(0,10)).slice(0,4);
  document.querySelector('#archiveHeroArt').innerHTML=feature.map((c,i)=>{
    const artwork=(i===0&&slot)||cover(c);
    return '<a class="archive-art-cell '+(!artwork?'unfilled':'')+'" href="/collection?slug='+encodeURIComponent(c.slug)+'">'+
      (artwork?'<img src="'+esc(artwork)+'" alt="'+esc(c.display_name)+'" loading="lazy">':'')+
      '<span>'+esc(monthLabel(c.starts_on))+'</span></a>';
  }).join('');
}
function render(){
  const filtered=active==='all'?rows:rows.filter(x=>String(x.year)===active);
  document.querySelector('#collectionsGrid').innerHTML=filtered.length?filtered.map(card).join(''):stateMarkup('empty','No collections','Nothing matches this year filter.');
}
async function load(){
  await initChrome();
  document.querySelector('#collectionsGrid').innerHTML=loadingMarkup(8,'wide');
  const [slots,c,o,products,snapshot]=await Promise.all([
    getSiteMediaSlots(),
    supabase.from('membership_collections').select('*').eq('is_published',true).order('starts_on',{ascending:false}),
    supabase.from('membership_collection_overview').select('*'),
    supabase.from('membership_library_products').select('collection_id,thumbnail_url').not('thumbnail_url','is',null).order('product_number'),
    fetch('/data/cults-collections.json').then(r=>r.ok?r.json():null).catch(()=>null)
  ]);
  if(c.error)throw c.error;if(o.error)throw o.error;if(products.error)throw products.error;
  rows=(c.data||[]).map(x=>{
    const row={...x,...((o.data||[]).find(y=>y.id===x.id)||{}),preview_image_url:(products.data||[]).find(p=>p.collection_id===x.id)?.thumbnail_url||null};
    if(!Number(row.product_count||0))row.product_count=(snapshot?.collections?.[x.slug]||[]).length;
    return row;
  });
  renderHero(rows,slots.collections_hero?.asset_url);
  const years=[...new Set(rows.map(x=>x.year))].sort((a,b)=>b-a);
  const modelCount=rows.reduce((n,x)=>n+Number(x.product_count||0),0);
  const unlocked=rows.filter(x=>x.has_access).length;
  document.querySelector('#collectionSummary').innerHTML='<span><strong>'+rows.length+'</strong> drops</span><span><strong>'+modelCount+'</strong> models</span>'+(unlocked?'<span><strong>'+unlocked+'</strong> unlocked</span>':'');
  document.querySelector('#yearFilters').innerHTML=years.map(y=>'<button class="filter-chip" data-year="'+y+'">'+y+'</button>').join('');
  document.querySelectorAll('[data-year]').forEach(b=>b.onclick=()=>{active=b.dataset.year;document.querySelectorAll('[data-year]').forEach(x=>x.classList.toggle('active',x===b));render()});
  render();
}
load().catch(e=>document.querySelector('#collectionsGrid').innerHTML=stateMarkup('error','Collections unavailable',friendlyError(e,'The archive could not be loaded.'),{href:'/collections',label:'Retry'}));
