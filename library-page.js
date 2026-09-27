import { supabase,initChrome,monthLabel,stateMarkup,esc } from '/site.js';

function collectionCard(c){
  const open=Boolean(c.has_access);
  return '<a class="collection-card" href="/collection?slug='+encodeURIComponent(c.slug)+'"><div class="lock-art"></div><div class="collection-card-body"><div class="collection-card-top"><span class="eyebrow">'+esc(c.slug)+'</span><span class="badge '+(open?'open':'')+'">'+(open?'Unlocked':'Locked')+'</span></div><h3>'+esc(monthLabel(c.starts_on))+'</h3><p>'+Number(c.product_count||0)+' published product'+(Number(c.product_count||0)===1?'':'s')+' · '+(open?'Ready in your library':'Visible in the archive')+'</p></div></a>';
}

async function loadLibrary(){
  const session=await initChrome();
  const notice=document.querySelector('#libraryNotice');
  const cta=document.querySelector('#libraryAccountCta');
  if(session){
    notice.className='notice';
    notice.innerHTML='<div><strong>Signed in as '+esc(session.user.email)+'</strong><span> Your unlocked months are marked below.</span></div>';
    cta.textContent='Manage account';
  }else{
    notice.className='notice accent';
    notice.innerHTML='<div><strong>You are browsing as a guest.</strong><span> Sign in to reveal your unlocked collection months.</span></div><a class="btn btn-primary" href="/account">Sign in</a>';
  }

  const result=await supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false});
  if(result.error)throw result.error;
  const rows=result.data||[];
  const grid=document.querySelector('#collectionGrid');
  grid.innerHTML=rows.length?rows.map(collectionCard).join(''):stateMarkup('','No collection months yet','Published monthly drops will appear here automatically.');
}
loadLibrary().catch(err=>{
  console.error(err);
  document.querySelector('#collectionGrid').innerHTML=stateMarkup('error','Library unavailable','The collection archive could not be loaded right now.');
});
