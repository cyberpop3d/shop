import { supabase,initChrome,monthLabel,money,stateMarkup,esc } from '/site.js';

async function loadHome(){
  await initChrome();
  const results=await Promise.all([
    supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_plans').select('*').order('sort_order')
  ]);
  const c=results[0],p=results[1];
  if(c.error)throw c.error;
  if(p.error)throw p.error;
  const collections=c.data||[];
  const plans=p.data||[];
  const latest=collections[0];
  const target=document.querySelector('#latestCollection');

  if(!latest){
    target.className='';
    target.innerHTML=stateMarkup('','First collection is being prepared','Published collection months will appear here automatically.');
  }else{
    target.className='collection-feature';
    target.innerHTML='<div class="collection-copy"><div><span class="eyebrow">'+esc(latest.slug)+'</span><h3>'+esc(monthLabel(latest.starts_on))+'</h3><div class="collection-meta"><span>'+Number(latest.product_count||0)+' models</span><span>'+(latest.has_access?'Unlocked for you':'Member collection')+'</span></div></div><div><p>Open the collection page to view every published model and your account-specific access.</p><a class="btn btn-dark" href="/collection?slug='+encodeURIComponent(latest.slug)+'">View collection ↗</a></div></div><div class="collection-art"><div class="collection-art-grid"><img src="/images/covers/ken.webp" alt=""><img src="/images/covers/dhalsim.webp" alt=""><img src="/images/covers/dudley.webp" alt=""><img src="/images/covers/sumo.webp" alt=""></div></div>';
  }

  const monthly=plans.find(x=>x.slug==='monthly');
  const annual=plans.find(x=>x.slug==='annual');
  if(monthly&&Number(monthly.amount)>0)document.querySelector('#monthlyPrice').textContent=money(monthly.amount,monthly.currency);
  if(annual&&annual.is_active&&Number(annual.amount)>0){
    document.querySelector('#annualPrice').textContent=money(annual.amount,annual.currency);
    document.querySelector('#annualSuffix').textContent='/ year';
  }
}
loadHome().catch(err=>{
  console.error(err);
  const t=document.querySelector('#latestCollection');
  t.className='';
  t.innerHTML=stateMarkup('error','Collection feed unavailable','The library data could not be loaded. Please try again shortly.');
});
