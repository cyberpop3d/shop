import { supabase,initChrome,getSession,getCreditSummary,googleProviderReady,signInGoogle,sendMagicLink,signOut,monthLabel,stateMarkup,esc } from '/site.js';

function collectionCard(c){
  return '<a class="collection-tile" href="/collection?slug='+encodeURIComponent(c.slug)+'"><div class="collection-tile-media"><div class="media-placeholder"><span>COLLECTION</span></div></div><div class="collection-tile-copy"><span class="eyebrow">'+esc(c.slug)+'</span><h3>'+esc(monthLabel(c.starts_on))+'</h3><p>'+Number(c.product_count||0)+' models · access active</p></div></a>';
}
function safeReturnTo(){
  const value=new URLSearchParams(location.search).get('returnTo');
  if(!value||!value.startsWith('/')||value.startsWith('//'))return null;
  return value;
}
function renderCreditHistory(rows){
  const target=document.querySelector('#creditHistory');
  if(!rows.length){target.innerHTML=stateMarkup('','No credit activity yet','Credits granted, spent or reversed will appear here.');return}
  target.innerHTML=rows.map(r=>{
    const n=Number(r.amount||0);
    return '<div class="credit-history-row"><time>'+new Date(r.created_at).toLocaleDateString()+'</time><span>'+esc(r.description||r.type)+'</span><strong class="'+(n>0?'positive':'negative')+'">'+(n>0?'+':'')+n+' C</strong></div>';
  }).join('');
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
  const returnTo=safeReturnTo();

  document.querySelector('#profileSection').hidden=!session;
  document.querySelector('#credits').hidden=!session;
  if(!session){
    authMethods.hidden=false;
    document.querySelector('#accountHeading').textContent='Not signed in';
    document.querySelector('#accountCopy').textContent='Sign in to load verified membership, credits and Library ownership.';
    summary.innerHTML='<div class="mini-card"><span>Membership</span><strong>Guest</strong></div><div class="mini-card"><span>Library</span><strong>Sign in required</strong></div>';
    owned.innerHTML=stateMarkup('','No account loaded','Sign in above to load your account state.');
    document.querySelector('#signOutArea').hidden=true;
    return;
  }

  if(returnTo){
    history.replaceState(null,'',location.pathname);
    location.replace(returnTo);
    return;
  }

  authMethods.hidden=true;
  authCard.querySelector('h2').textContent='Signed in.';
  authCard.querySelector('p').textContent='Identity verified. Credits and ownership below come from backend state.';
  document.querySelector('#authStatus').innerHTML='<strong>'+esc(session.user.email)+'</strong>';
  document.querySelector('#signOutArea').hidden=false;

  const results=await Promise.all([
    supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_subscriptions').select('*,membership_plans(name,plan_type)').order('current_period_end',{ascending:false}),
    supabase.from('membership_entitlements').select('*').eq('status','active'),
    supabase.from('member_profiles').select('*').eq('user_id',session.user.id).maybeSingle(),
    supabase.from('member_owned_products').select('id'),
    supabase.from('credit_transactions').select('*').order('created_at',{ascending:false}).limit(50),
    getCreditSummary()
  ]);
  const err=results.find(x=>x&&x.error);if(err)throw err.error;

  const collections=results[0].data||[];
  const subscriptions=results[1].data||[];
  const entitlements=results[2].data||[];
  const profile=results[3].data||{};
  const ownedProducts=results[4].data||[];
  const creditRows=results[5].data||[];
  const credits=results[6]||{balance:0,transaction_count:0};
  const unlocked=collections.filter(c=>c.has_access);
  const annual=subscriptions.find(s=>s.status==='active'&&Number(s.billing_months)===12);

  document.querySelector('#accountHeading').textContent=profile.display_name||session.user.email;
  document.querySelector('#profileDisplayName').value=profile.display_name||'';
  document.querySelector('#profileHandle').value=profile.handle||'';
  document.querySelector('#profileCountry').value=profile.country||'';
  document.querySelector('#profilePrinter').value=profile.preferred_printer||'';
  document.querySelector('#profileBio').value=profile.bio||'';
  document.querySelector('#accountCopy').textContent=annual?'Annual collection access is active.':'Your account is ready for monthly access and permanent credit unlocks.';
  summary.innerHTML='<div class="mini-card"><span>Membership</span><strong>'+(annual?'Annual active':'Monthly / individual access')+'</strong></div><div class="mini-card"><span>Owned models</span><strong>'+ownedProducts.length+'</strong></div><div class="mini-card"><span>Credits</span><strong>'+credits.balance+' C</strong></div><div class="mini-card"><span>Account</span><strong>Verified</strong></div>';
  document.querySelector('#creditBalanceLarge').textContent=credits.balance+' C';
  document.querySelector('#creditTransactionCount').textContent=credits.transaction_count;
  renderCreditHistory(creditRows);
  owned.innerHTML=unlocked.length?unlocked.map(collectionCard).join(''):stateMarkup('','No collection access yet','Permanent product unlocks can still appear in your Library independently of monthly collection access.');
}

document.querySelector('#googleButton').addEventListener('click',async()=>{
  const status=document.querySelector('#authStatus');
  status.innerHTML='<span>Opening Google sign-in…</span>';
  const redirect=location.pathname+location.search;
  const r=await signInGoogle(redirect);
  if(r.error)status.innerHTML='<span>'+esc(r.error.message)+'</span>';
});
document.querySelector('#emailForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const status=document.querySelector('#authStatus');
  status.innerHTML='<span>Sending secure sign-in link…</span>';
  const redirect=location.pathname+location.search;
  const r=await sendMagicLink(document.querySelector('#emailInput').value.trim(),redirect);
  status.innerHTML='<span>'+esc(r.error?r.error.message:'Check your email for the secure sign-in link.')+'</span>';
});
document.querySelector('#profileForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const session=await getSession();
  const status=document.querySelector('#profileStatus');
  if(!session){status.textContent='Sign in first.';return}
  status.textContent='Saving…';
  const handle=document.querySelector('#profileHandle').value.trim().replace(/^@/,'')||null;
  const row={
    user_id:session.user.id,
    display_name:document.querySelector('#profileDisplayName').value.trim()||null,
    handle,
    country:document.querySelector('#profileCountry').value.trim()||null,
    preferred_printer:document.querySelector('#profilePrinter').value.trim()||null,
    bio:document.querySelector('#profileBio').value.trim()||null,
    updated_at:new Date().toISOString()
  };
  const r=await supabase.from('member_profiles').upsert(row,{onConflict:'user_id'});
  status.textContent=r.error?r.error.message:'Profile updated.';
  if(!r.error)setTimeout(()=>status.textContent='',2400);
});

document.querySelector('#signOutButton').addEventListener('click',async()=>{await signOut();location.reload()});
supabase.auth.onAuthStateChange(()=>setTimeout(render,0));
render().catch(err=>{
  console.error(err);
  document.querySelector('#accountSummary').innerHTML=stateMarkup('error','Account unavailable','Your account data could not be loaded.');
  document.querySelector('#ownedCollections').innerHTML='';
});