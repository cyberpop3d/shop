import { supabase,initChrome,monthLabel,stateMarkup,esc } from '/site.js';

const params=new URLSearchParams(location.search);
const slug=params.get('slug');

function productCard(p,collectionOpen){
  const open=Boolean(collectionOpen&&p.has_access);
  const media=p.thumbnail_url?'<div class="product-card-media"><img src="'+esc(p.thumbnail_url)+'" alt="'+esc(p.public_title)+'" loading="lazy"><span class="product-lock">'+(open?'OPEN':'LOCKED')+'</span></div>':'<div class="product-card-media placeholder"><span class="product-lock">'+(open?'OPEN':'LOCKED')+'</span></div>';
  let action='<button class="btn btn-ghost" disabled>'+(open?'Delivery pending':'Locked')+'</button>';
  if(open&&p.cults_url)action='<a class="btn btn-primary" href="'+esc(p.cults_url)+'" target="_blank" rel="noopener">Open product ↗</a>';
  if(open&&p.download_url)action='<a class="btn btn-primary" href="'+esc(p.download_url)+'" target="_blank" rel="noopener">Download ↗</a>';
  return '<article class="product-card">'+media+'<div class="product-card-copy"><h3>'+esc(p.public_title)+'</h3><p>'+(open?'Included in your collection access.':'Sign in with eligible access to open delivery.')+'</p>'+action+'</div></article>';
}

async function loadCollection(){
  const session=await initChrome();
  const overview=await supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false});
  if(overview.error)throw overview.error;
  const collections=overview.data||[];
  const c=(slug?collections.find(x=>x.slug===slug):collections[0]);
  if(!c){
    document.querySelector('#collectionHero').className='';
    document.querySelector('#collectionHero').innerHTML=stateMarkup('error','Collection not found','This collection does not exist or is not published.');
    document.querySelector('#productGrid').innerHTML='';
    return;
  }

  document.title=monthLabel(c.starts_on)+' — CyberPop';
  const open=Boolean(c.has_access);
  const hero=document.querySelector('#collectionHero');
  hero.className='collection-hero';
  hero.innerHTML='<div><span class="eyebrow">'+esc(c.slug)+'</span><h1>'+esc(monthLabel(c.starts_on))+'</h1><p>'+Number(c.product_count||0)+' published products. '+(open?'This collection is unlocked for your account.':'This month is visible in the archive but currently locked for your account.')+'</p><div class="collection-meta"><span>'+Number(c.product_count||0)+' models</span><span>'+(open?'Unlocked':'Locked')+'</span><span>Multipart FDM</span></div></div><div class="collection-number">'+String(c.month).padStart(2,'0')+'</div>';

  const productsResult=await supabase.from('membership_library_products').select('*').eq('collection_id',c.id).order('sort_order').order('product_number');
  if(productsResult.error)throw productsResult.error;
  const products=productsResult.data||[];
  const grid=document.querySelector('#productGrid');
  grid.innerHTML=products.length?products.map(p=>productCard(p,open)).join(''):stateMarkup('','Collection preparing','No published models have been added to this collection yet.');

  if(open){
    const area=document.querySelector('#accessArea');
    area.hidden=false;
    let code=null;
    if(session){
      const r=await supabase.from('membership_collection_codes').select('*').eq('collection_id',c.id).eq('is_active',true).maybeSingle();
      if(!r.error)code=r.data;
    }
    const target=document.querySelector('#accessCode');
    target.innerHTML='<div><span class="eyebrow">COLLECTION ACCESS</span><div class="code-value">'+esc(code&&code.cults_code?code.cults_code:'ACCESS ACTIVE')+'</div><div class="section-copy" style="font-size:12px">'+esc(code&&code.note?code.note:'Your account is authorized for this collection.')+'</div></div>'+(code&&code.cults_url?'<a class="btn btn-light" href="'+esc(code.cults_url)+'" target="_blank" rel="noopener">Open Cults ↗</a>':'');
  }else{
    const area=document.querySelector('#accessArea');
    area.hidden=false;
    area.innerHTML='<div class="notice accent"><div><strong>'+(session?'This month is locked.':'Sign in to check access.')+'</strong><span> '+(session?'A matching monthly entitlement or active annual period is required.':'Your member account may already own this collection.')+'</span></div><a class="btn btn-primary" href="/account">'+(session?'Manage account':'Sign in')+'</a></div>';
  }
}
loadCollection().catch(err=>{
  console.error(err);
  document.querySelector('#collectionHero').className='';
  document.querySelector('#collectionHero').innerHTML=stateMarkup('error','Collection unavailable','This collection could not be loaded right now.');
  document.querySelector('#productGrid').innerHTML='';
});
