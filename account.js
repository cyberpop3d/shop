import { supabase,initChrome,getSession,googleProviderReady,signInGoogle,sendMagicLink,signOut,monthLabel,stateMarkup,esc } from '/site.js';

function collectionCard(c){
  return '<a class="collection-card" href="/collection?slug='+encodeURIComponent(c.slug)+'"><div class="lock-art"></div><div class="collection-card-body"><div class="collection-card-top"><span class="eyebrow">'+esc(c.slug)+'</span><span class="badge open">Unlocked</span></div><h3>'+esc(monthLabel(c.starts_on))+'</h3><p>'+Number(c.product_count||0)+' published products · Open in your library</p></div></a>';
}

async function render(){
  const session=await initChrome();
  const google=await googleProviderReady();
  const googleButton=document.querySelector('#googleButton');
  googleButton.disabled=!google;
  googleButton.title=google?'Sign in with Google':'Google OAuth setup is pending';

  const authMethods=document.querySelector('#authMethods');
  const authCard=document.querySelector('#authCard');
  const summary=document.querySelector('#accountSummary');
  const owned=document.querySelector('#ownedCollections');

  if(!session){
    authMethods.hidden=false;
    document.querySelector('#accountHeading').textContent='Not signed in';
    document.querySelector('#accountCopy').textContent='Sign in to load membership and collection access.';
    summary.innerHTML='<div class="mini-card"><span>Membership</span><strong>Guest</strong></div><div class="mini-card"><span>Library</span><strong>Locked until sign-in</strong></div>';
    owned.innerHTML=stateMarkup('','No account loaded','Sign in above to reveal the collection months attached to your account.');
    document.querySelector('#signOutArea').hidden=true;
    return;
  }

  authMethods.hidden=true;
  authCard.querySelector('h2').textContent='Signed in.';
  authCard.querySelector('p').textContent='Your member identity is verified. Access below is loaded directly from your account.';
  document.querySelector('#authStatus').innerHTML='<strong>'+esc(session.user.email)+'</strong>';
  document.querySelector('#signOutArea').hidden=false;

  const results=await Promise.all([
    supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_subscriptions').select('*,membership_plans(name,plan_type)').order('current_period_end',{ascending:false}),
    supabase.from('membership_entitlements').select('*').eq('status','active')
  ]);
  const err=results.find(x=>x.error);if(err)throw err.error;
  const collections=results[0].data||[];
  const subscriptions=results[1].data||[];
  const entitlements=results[2].data||[];
  const unlocked=collections.filter(c=>c.has_access);
  const annual=subscriptions.find(s=>s.status==='active'&&Number(s.billing_months)===12);

  document.querySelector('#accountHeading').textContent=session.user.email;
  document.querySelector('#accountCopy').textContent=annual?'Annual collection access is active.':'Collection access is currently handled month by month.';
  summary.innerHTML='<div class="mini-card"><span>Membership</span><strong>'+(annual?'Annual active':'Monthly / individual months')+'</strong></div><div class="mini-card"><span>Unlocked collections</span><strong>'+unlocked.length+'</strong></div><div class="mini-card"><span>Month grants</span><strong>'+entitlements.length+'</strong></div><div class="mini-card"><span>Account</span><strong>Verified</strong></div>';
  owned.innerHTML=unlocked.length?unlocked.map(collectionCard).join(''):stateMarkup('','No collection access yet','Your account is ready, but no monthly entitlement or active annual period is attached yet.');
}

document.querySelector('#googleButton').addEventListener('click',async()=>{
  const status=document.querySelector('#authStatus');
  status.innerHTML='<span>Opening Google sign-in…</span>';
  const r=await signInGoogle('/account');
  if(r.error)status.innerHTML='<span>'+esc(r.error.message)+'</span>';
});
document.querySelector('#emailForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const status=document.querySelector('#authStatus');
  status.innerHTML='<span>Sending secure sign-in link…</span>';
  const r=await sendMagicLink(document.querySelector('#emailInput').value.trim(),'/account');
  status.innerHTML='<span>'+esc(r.error?r.error.message:'Check your email for the secure sign-in link.')+'</span>';
});
document.querySelector('#signOutButton').addEventListener('click',async()=>{
  await signOut();
  location.reload();
});
supabase.auth.onAuthStateChange(()=>setTimeout(render,0));
render().catch(err=>{
  console.error(err);
  document.querySelector('#accountSummary').innerHTML=stateMarkup('error','Account unavailable','Your account data could not be loaded.');
  document.querySelector('#ownedCollections').innerHTML='';
});
