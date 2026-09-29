import {
  supabase,initChrome,getSession,getCreditSummary,googleProviderReady,
  signInGoogle,signInWithPassword,signUpWithPassword,resendSignupConfirmation,
  signOut,monthLabel,stateMarkup,esc
} from '/site.js';

let authMode='signin';
let activeSession=null;
let currentProfile=null;
let accountRequirements=[];
let missingAccountRequirements=[];
let actionRequirements=[];
let missingActionRequirements=[];

const ISO_CODES=`AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(' ');

function countryOptions(){
  const display=new Intl.DisplayNames(['en'],{type:'region'});
  return ISO_CODES.map(code=>({code,name:display.of(code)||code})).sort((a,b)=>a.name.localeCompare(b.name));
}
const COUNTRIES=countryOptions();
function populateCountries(){
  document.querySelector('#countryOptions').innerHTML=COUNTRIES.map(x=>'<option value="'+esc(x.name)+'">'+x.code+'</option>').join('');
}
function countryDisplay(code){
  const row=COUNTRIES.find(x=>x.code===code);return row?row.name:(code||'');
}
function countryCodeFromInput(value){
  const v=String(value||'').trim();
  const upper=v.toUpperCase();
  const byCode=COUNTRIES.find(x=>x.code===upper);
  if(byCode)return byCode.code;
  const byName=COUNTRIES.find(x=>x.name.toLowerCase()===v.toLowerCase());
  return byName?byName.code:null;
}
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
function setAuthMode(mode){
  authMode=mode;
  document.querySelectorAll('[data-auth-mode]').forEach(b=>b.classList.toggle('active',b.dataset.authMode===mode));
  document.querySelector('#passwordConfirmInput').hidden=mode!=='signup';
  document.querySelector('#passwordInput').autocomplete=mode==='signup'?'new-password':'current-password';
  document.querySelector('#emailSubmitButton').textContent=mode==='signup'?'Create account':'Sign in';
}
function legalLabel(type){
  return ({
    terms_of_use:'Terms of Use',rights_of_use:'Rights of Use',privacy_policy:'Privacy Policy',
    refund_policy:'Refund Policy',ip_policy:'IP / Rights Holder Policy',
    seller_license_terms:'Seller License Terms',credits_terms:'Credits Terms'
  })[type]||type;
}
function renderOnboardingLegal(){
  const box=document.querySelector('#onboardingLegal');
  if(!accountRequirements.length){
    box.innerHTML='<div class="notice"><span>Legal documents are currently in draft and are not being silently treated as accepted. Published required versions will appear here automatically.</span></div>';
    return;
  }
  const missingSet=new Set(missingAccountRequirements.map(x=>x.document_type));
  box.innerHTML='<div class="legal-acceptance-copy"><strong>Required agreements</strong><p>Required boxes are never pre-selected.</p></div>'+
    accountRequirements.map(d=>{
      const already=!missingSet.has(d.document_type);
      return '<label class="legal-check"><input type="checkbox" data-legal-accept="'+esc(d.document_type)+'" '+(already?'checked disabled':'')+'>'+
        '<span>I have read and agree to the <a href="'+esc(d.public_path)+'" target="_blank">'+esc(d.title)+'</a> <small>'+esc(d.document_version)+'</small>.</span></label>';
    }).join('')+
    '<p class="legal-summary">CyberPop digital files are licensed for personal use unless a separate Seller License applies. Digital redistribution is prohibited.</p>';
}
function onboardingComplete(){
  return Boolean(currentProfile?.handle&&currentProfile?.country_code&&currentProfile?.onboarding_completed_at&&!missingAccountRequirements.length);
}
function renderLegalHistory(docs,acceptances){
  const target=document.querySelector('#legalAgreementList');
  if(!docs.length){
    target.innerHTML=stateMarkup('','No published legal versions yet','Draft legal pages exist, but CyberPop is not recording acceptance of unpublished documents.');
    return;
  }
  const missingIds=new Set(missingActionRequirements.map(x=>x.document_id));
  const required=missingActionRequirements.length
    ? '<div class="legal-action-required"><strong>Action required</strong><p>Current agreements must be accepted before protected purchase/download actions continue.</p>'+
      missingActionRequirements.map(d=>'<label class="legal-check"><input type="checkbox" data-action-legal="'+d.document_type+'"><span>I have read and agree to <a href="'+esc(d.public_path)+'" target="_blank">'+esc(d.title)+'</a> <small>'+esc(d.document_version)+'</small>.</span></label>').join('')+
      '<button id="acceptActionLegal" class="btn btn-primary" type="button">Accept selected agreements</button><span id="actionLegalStatus" class="small"></span></div>'
    : '';
  target.innerHTML=required+'<div class="legal-version-list">'+docs.map(d=>{
    const accepted=acceptances.find(a=>a.legal_document_id===d.id);
    return '<div class="legal-version-row"><div><strong>'+esc(d.title)+'</strong><span>'+esc(d.version)+'</span></div><div>'+(accepted?'Accepted '+new Date(accepted.accepted_at).toLocaleDateString():(missingIds.has(d.id)?'Acceptance required':'Not required'))+'</div><a href="'+esc(d.public_path)+'">View →</a></div>';
  }).join('')+'</div>';
  const accept=document.querySelector('#acceptActionLegal');
  if(accept)accept.onclick=acceptRequiredActionLegal;
}
function renderPatreonTransition(row){
  const section=document.querySelector('#patreonTransitionSection');
  const target=document.querySelector('#patreonTransition');
  if(!row){section.hidden=true;target.innerHTML='';return}
  section.hidden=false;
  const paidMonth=row.last_charge_date?new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(new Date(row.last_charge_date)):'Patreon';
  const founder=row.founder_status?'<span class="badge open">FOUNDER PRICING PRESERVED</span>':'';
  target.innerHTML='<div class="notice"><div><strong>Patreon linked · '+esc(paidMonth)+'</strong><span> Your paid Patreon month is active here. Future access can continue through CyberPop without waiting for the next Patreon billing date.</span></div>'+founder+'</div>';
}
function renderServiceRequests(rows){
  const target=document.querySelector('#serviceRequestHistory');
  if(!rows.length){
    target.innerHTML=stateMarkup('','No requests yet','Submit a custom design or access request and it will appear here.',{href:'/request',label:'Create request'});
    return;
  }
  target.innerHTML='<div class="legal-version-list">'+rows.map(r=>{
    const quote=r.quote_amount!=null?Number(r.quote_amount).toFixed(2)+' '+esc(r.currency||'USD'):'Quote pending';
    const payment=r.payoneer_payment_url&&['payment_requested','paid','in_progress','fulfilled'].includes(r.status)
      ? '<a href="'+esc(r.payoneer_payment_url)+'" target="_blank" rel="noopener">Payment link ↗</a>'
      : '<span>'+esc(quote)+'</span>';
    return '<div class="legal-version-row"><div><strong>'+esc(r.request_code)+' · '+esc(r.subject||r.request_type)+'</strong><span>'+new Date(r.created_at).toLocaleDateString()+' · '+esc(r.status.replaceAll('_',' ').toUpperCase())+'</span></div><div>'+payment+'</div><a href="/request">New request →</a></div>';
  }).join('')+'</div>';
}

function renderPayments(rows){
  const target=document.querySelector('#purchaseHistory');
  if(!rows.length){target.innerHTML=stateMarkup('','No payments yet','Verified Payoneer transactions will appear here when checkout is connected.');return}
  target.innerHTML='<div class="legal-version-list">'+rows.map(p=>'<div class="legal-version-row"><div><strong>'+esc(p.payment_type)+'</strong><span>'+esc(p.provider)+'</span></div><div>'+esc(p.status.toUpperCase())+'</div><strong>'+Number(p.amount).toFixed(2)+' '+esc(p.currency)+'</strong></div>').join('')+'</div>';
}
function renderSellerLicense(row){
  const target=document.querySelector('#sellerLicenseCard');
  if(!row){
    target.innerHTML='<div class="notice"><div><strong>No active Seller License.</strong><span> Personal-use digital file rights do not include physical commercial sales.</span></div><a class="btn btn-ghost" href="/seller-license">View Seller License Terms →</a></div>';
    return;
  }
  target.innerHTML='<div class="account-summary"><div class="mini-card"><span>Status</span><strong>'+esc(row.status.toUpperCase())+'</strong></div><div class="mini-card"><span>Scope</span><strong>Physical prints only</strong></div></div>'+
    '<p class="section-copy" style="margin-top:14px">Digital redistribution is never included. Seller permission does not grant third-party character, trademark or franchise rights.</p>';
}

function uniqDocs(rows){return [...new Map(rows.map(x=>[x.document_id,x])).values()]}
async function loadLegalState(){
  const [accountReq,accountMissing,purchaseReq,purchaseMissing,downloadReq,downloadMissing]=await Promise.all([
    supabase.rpc('get_current_legal_requirements',{p_scope:'account'}),
    supabase.rpc('get_my_missing_legal_requirements',{p_scope:'account'}),
    supabase.rpc('get_current_legal_requirements',{p_scope:'purchase'}),
    supabase.rpc('get_my_missing_legal_requirements',{p_scope:'purchase'}),
    supabase.rpc('get_current_legal_requirements',{p_scope:'download'}),
    supabase.rpc('get_my_missing_legal_requirements',{p_scope:'download'})
  ]);
  const all=[accountReq,accountMissing,purchaseReq,purchaseMissing,downloadReq,downloadMissing];
  const err=all.find(x=>x.error);if(err)throw err.error;
  accountRequirements=accountReq.data||[];
  missingAccountRequirements=accountMissing.data||[];
  actionRequirements=uniqDocs([...(purchaseReq.data||[]),...(downloadReq.data||[])]);
  missingActionRequirements=uniqDocs([...(purchaseMissing.data||[]),...(downloadMissing.data||[])]);
}
async function acceptRequiredActionLegal(){
  const status=document.querySelector('#actionLegalStatus');
  const boxes=[...document.querySelectorAll('[data-action-legal]')];
  const unchecked=boxes.filter(x=>!x.checked);
  if(unchecked.length){status.textContent='Accept each required current agreement to continue.';return}
  status.textContent='Recording acceptance…';
  for(const box of boxes){
    const r=await supabase.rpc('accept_current_legal_document',{p_document_type:box.dataset.actionLegal,p_acceptance_method:'account_legal_review'});
    if(r.error){status.textContent=r.error.message;return}
  }
  status.textContent='Accepted.';
  setTimeout(()=>render(),300);
}

async function render(){
  activeSession=await initChrome();
  const google=await googleProviderReady();
  const googleButton=document.querySelector('#googleButton');
  googleButton.disabled=!google;
  googleButton.title=google?'Sign in with Google':'Google OAuth setup is pending';

  const authMethods=document.querySelector('#authMethods');
  const authCard=document.querySelector('#authCard');
  const summary=document.querySelector('#accountSummary');
  const owned=document.querySelector('#ownedCollections');
  const returnTo=safeReturnTo();

  ['#profileSection','#credits','#legalSection','#sellerLicenseSection','#purchaseSection','#serviceRequestSection'].forEach(s=>document.querySelector(s).hidden=!activeSession);
  if(!activeSession)document.querySelector('#patreonTransitionSection').hidden=true;
  if(!activeSession){
    document.querySelector('#onboardingSection').hidden=true;
    authMethods.hidden=false;
    document.querySelector('#accountHeading').textContent='Not signed in';
    document.querySelector('#accountCopy').textContent='Sign in or create an account. Legal name is not required.';
    summary.innerHTML='<div class="mini-card"><span>Account</span><strong>Guest</strong></div><div class="mini-card"><span>Library</span><strong>Sign in required</strong></div>';
    owned.innerHTML=stateMarkup('','No account loaded','Sign in above to load your account state.');
    document.querySelector('#signOutArea').hidden=true;
    return;
  }

  authMethods.hidden=true;
  authCard.querySelector('h2').textContent='Signed in.';
  authCard.querySelector('p').textContent='Your authentication identity is verified separately from any future payment identity.';
  document.querySelector('#authStatus').innerHTML='<strong>'+esc(activeSession.user.email)+'</strong>';
  document.querySelector('#signOutArea').hidden=false;

  const results=await Promise.all([
    supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_subscriptions').select('*,membership_plans(name,plan_type)').order('current_period_end',{ascending:false}),
    supabase.from('member_profiles').select('*').eq('user_id',activeSession.user.id).maybeSingle(),
    supabase.from('member_owned_products').select('id'),
    supabase.from('credit_transactions').select('*').order('created_at',{ascending:false}).limit(50),
    getCreditSummary(),
    supabase.from('legal_documents').select('*').eq('status','published').order('document_type'),
    supabase.from('legal_acceptances').select('*').order('accepted_at',{ascending:false}),
    supabase.from('seller_licenses').select('*').eq('user_id',activeSession.user.id).maybeSingle(),
    supabase.from('payments').select('*').order('created_at',{ascending:false}).limit(30),
    supabase.from('service_requests').select('*').eq('user_id',activeSession.user.id).order('created_at',{ascending:false}).limit(50),
    supabase.from('patreon_account_links').select('*').eq('user_id',activeSession.user.id).maybeSingle()
  ]);
  const err=results.find(x=>x&&x.error);if(err)throw err.error;

  const collections=results[0].data||[];
  const subscriptions=results[1].data||[];
  currentProfile=results[2].data||{};
  const ownedProducts=results[3].data||[];
  const creditRows=results[4].data||[];
  const credits=results[5]||{balance:0,transaction_count:0};
  const legalDocs=results[6].data||[];
  const acceptances=results[7].data||[];
  const sellerLicense=results[8].data||null;
  const payments=results[9].data||[];
  const serviceRequests=results[10].data||[];
  const patreonLink=results[11].data||null;
  await loadLegalState();

  const needsOnboarding=!onboardingComplete();
  document.querySelector('#onboardingSection').hidden=!needsOnboarding;
  if(needsOnboarding){
    document.querySelector('#onboardingHandle').value=currentProfile.handle||'';
    document.querySelector('#onboardingCountry').value=countryDisplay(currentProfile.country_code);
    renderOnboardingLegal();
  }

  const annual=subscriptions.find(s=>s.status==='active'&&Number(s.billing_months)===12);
  const unlocked=collections.filter(c=>c.has_access);
  const verified=Boolean(activeSession.user.email_confirmed_at);

  document.querySelector('#accountHeading').textContent=currentProfile.handle?'@'+currentProfile.handle:activeSession.user.email;
  document.querySelector('#accountCopy').textContent=needsOnboarding?'Finish onboarding before protected actions.':(missingActionRequirements.length?'Review current agreements before purchase/download actions.':(annual?'Annual collection access is active.':'Your CyberPop account is ready.'));
  summary.innerHTML='<div class="mini-card"><span>Email</span><strong>'+(verified?'Verified':'Verification required')+'</strong></div>'+
    '<div class="mini-card"><span>Owned models</span><strong>'+ownedProducts.length+'</strong></div>'+
    '<div class="mini-card"><span>Credits</span><strong>'+credits.balance+' C</strong></div>'+
    '<div class="mini-card"><span>Account</span><strong>'+esc((currentProfile.account_status||'active').toUpperCase())+'</strong></div>';

  document.querySelector('#profileHandle').value=currentProfile.handle||'';
  document.querySelector('#profileEmail').value=activeSession.user.email||'';
  document.querySelector('#profileCountry').value=countryDisplay(currentProfile.country_code);
  document.querySelector('#profilePrinter').value=currentProfile.preferred_printer||'';
  document.querySelector('#profileBio').value=currentProfile.bio||'';

  document.querySelector('#creditBalanceLarge').textContent=credits.balance+' C';
  document.querySelector('#creditTransactionCount').textContent=credits.transaction_count;
  renderCreditHistory(creditRows);
  renderLegalHistory(legalDocs,acceptances);
  renderSellerLicense(sellerLicense);
  renderPayments(payments);
  renderPatreonTransition(patreonLink);
  renderServiceRequests(serviceRequests);

  owned.innerHTML=unlocked.length?unlocked.map(collectionCard).join(''):stateMarkup('','No collection access yet','Permanent product unlocks can still appear in your Library independently of monthly collection access.');

  if(returnTo&&!needsOnboarding&&verified&&!missingActionRequirements.length){
    history.replaceState(null,'',location.pathname);
    location.replace(returnTo);
  }
}

document.querySelectorAll('[data-auth-mode]').forEach(b=>b.onclick=()=>setAuthMode(b.dataset.authMode));
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
  const email=document.querySelector('#emailInput').value.trim();
  const password=document.querySelector('#passwordInput').value;
  const confirm=document.querySelector('#passwordConfirmInput').value;
  if(authMode==='signup'&&password!==confirm){
    status.innerHTML='<span>Passwords do not match.</span>';return;
  }
  status.innerHTML='<span>'+(authMode==='signup'?'Creating account…':'Signing in…')+'</span>';
  const r=authMode==='signup'
    ? await signUpWithPassword(email,password,location.pathname+location.search)
    : await signInWithPassword(email,password);
  if(r.error){status.innerHTML='<span>'+esc(r.error.message)+'</span>';return}
  if(authMode==='signup'&&!r.data.session){
    status.innerHTML='<div><strong>Verify your email.</strong><span> We sent a confirmation link to '+esc(email)+'. Protected actions stay locked until verification.</span></div>';
    return;
  }
  status.innerHTML='<span>Signed in.</span>';
  setTimeout(render,0);
});

document.querySelector('#onboardingForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const status=document.querySelector('#onboardingStatus');
  const session=await getSession();
  if(!session){status.textContent='Sign in first.';return}
  if(!session.user.email_confirmed_at){status.textContent='Verify your email before completing your account.';return}

  const requiredUnchecked=[...document.querySelectorAll('[data-legal-accept]:not(:disabled)')].filter(x=>!x.checked);
  if(requiredUnchecked.length){status.textContent='Accept the required legal documents to continue.';return}

  status.textContent='Saving account…';
  for(const box of document.querySelectorAll('[data-legal-accept]:checked:not(:disabled)')){
    const r=await supabase.rpc('accept_current_legal_document',{p_document_type:box.dataset.legalAccept,p_acceptance_method:'account_onboarding'});
    if(r.error){status.textContent=r.error.message;return}
  }

  const handle=document.querySelector('#onboardingHandle').value.trim().replace(/^@/,'');
  const country=countryCodeFromInput(document.querySelector('#onboardingCountry').value);
  if(!country){status.textContent='Choose a valid country / region from the list.';return}
  const p=await supabase.from('member_profiles').update({
    handle,country_code:country,onboarding_completed_at:new Date().toISOString(),updated_at:new Date().toISOString()
  }).eq('user_id',session.user.id);
  if(p.error){status.textContent=p.error.message;return}
  status.textContent='Welcome to CyberPop.';
  setTimeout(()=>render(),350);
});

document.querySelector('#profileForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const session=await getSession();
  const status=document.querySelector('#profileStatus');
  if(!session){status.textContent='Sign in first.';return}
  status.textContent='Saving…';
  const handle=document.querySelector('#profileHandle').value.trim().replace(/^@/,'')||null;
  const row={
    handle,
    country_code:document.querySelector('#profileCountry').value?countryCodeFromInput(document.querySelector('#profileCountry').value):null,
    preferred_printer:document.querySelector('#profilePrinter').value.trim()||null,
    bio:document.querySelector('#profileBio').value.trim()||null,
    updated_at:new Date().toISOString()
  };
  if(document.querySelector('#profileCountry').value&&!row.country_code){status.textContent='Choose a valid country / region from the list.';return}
  const r=await supabase.from('member_profiles').update(row).eq('user_id',session.user.id);
  status.textContent=r.error?r.error.message:'Account updated.';
  if(!r.error)setTimeout(()=>render(),300);
});

document.querySelector('#signOutButton').addEventListener('click',async()=>{await signOut();location.reload()});
supabase.auth.onAuthStateChange(()=>setTimeout(render,0));
populateCountries();
setAuthMode('signin');
render().catch(err=>{
  console.error(err);
  document.querySelector('#accountSummary').innerHTML=stateMarkup('error','Account unavailable','Your account data could not be loaded.');
  document.querySelector('#ownedCollections').innerHTML='';
});