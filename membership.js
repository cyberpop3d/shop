import { supabase,initChrome,getSiteMediaSlots,setMediaImage,money,stateMarkup,loadingMarkup,friendlyError,esc } from '/site.js';
async function load(){
  await initChrome();
  document.querySelector('#membershipPlans').innerHTML=loadingMarkup(2,'wide');
  const [slots,p]=await Promise.all([getSiteMediaSlots(),supabase.from('membership_plans').select('*').order('sort_order')]);
  if(p.error)throw p.error;
  setMediaImage(document.querySelector('#membershipHero'),slots.membership_hero?.asset_url,'MEMBERSHIP HERO · 1920 × 700');
  const rows=(p.data||[]).filter(x=>x.slug==='monthly'||x.slug==='annual');
  document.querySelector('#membershipPlans').innerHTML=rows.length?rows.map((x,i)=>{
    const price=Number(x.amount)>0?money(x.amount,x.currency):'TBD';
    return '<article class="price-card '+(i===1?'featured':'')+'"><div><span class="eyebrow">'+esc(x.plan_type||x.slug)+'</span><h3>'+esc(x.name)+'</h3><p class="section-copy">'+(x.slug==='monthly'?'Unlock the active monthly collection when billing is activated.':'Continuous collection access during the active annual period when annual billing launches.')+'</p><div class="price-line"><strong>'+price+'</strong><span>'+(x.slug==='annual'?'/ year':'/ month')+'</span></div><ul class="price-list"><li>Verified personal CyberPop Library</li><li>Collection-based entitlements</li><li>Cults delivery integration</li><li>Credit and legal systems already prepared</li></ul></div><button class="btn btn-ghost" disabled>Payments opening later</button><a class="text-link" style="margin-top:12px" href="/account">Create / prepare account →</a></article>';
  }).join(''):stateMarkup('maintenance','Plans preparing','Membership plan structure exists, but public plans have not been configured yet.');
}
load().catch(e=>document.querySelector('#membershipPlans').innerHTML=stateMarkup('error','Membership unavailable',friendlyError(e,'Plan information could not be loaded.'),{href:'/membership',label:'Retry'}));