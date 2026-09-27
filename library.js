import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.1';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '/supabase-config.js';

const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let session=null,collections=[],products=[],codes=[],subscriptions=[],plans=[],selectedId=null;

function monthLabel(date){
  return new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(new Date(date+'T12:00:00'));
}
function setStatus(text){$('#authStatus').textContent=text}

async function loadPublic(){
  const results=await Promise.all([
    supabase.from('membership_collection_overview').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_library_products').select('*').order('sort_order').order('product_number'),
    supabase.from('membership_plans').select('*').order('sort_order')
  ]);
  const c=results[0],p=results[1],pl=results[2];
  if(c.error) throw c.error;
  if(p.error) throw p.error;
  collections=c.data||[];
  products=p.data||[];
  plans=pl.data||[];
}
async function loadPrivate(){
  if(!session){codes=[];subscriptions=[];return}
  const results=await Promise.all([
    supabase.from('membership_collection_codes').select('*').eq('is_active',true),
    supabase.from('membership_subscriptions').select('*,membership_plans(name,plan_type)').order('current_period_end',{ascending:false})
  ]);
  codes=results[0].data||[];
  subscriptions=results[1].data||[];
}
function renderAccount(){
  const logged=!!session;
  $('#loginForm').hidden=logged;
  $('#sessionBox').hidden=!logged;
  $('#accountTitle').textContent=logged?'Signed in':'Sign in';
  $('#memberState').textContent=logged?'MEMBER ACCOUNT':'GUEST';
  $('#sessionEmail').textContent=session&&session.user?session.user.email:'';
  if(logged){
    const annual=subscriptions.find(s=>s.status==='active'&&Number(s.billing_months)===12);
    setStatus(annual?'Annual access is active.':'Monthly access is granted collection by collection.');
  }
}
function renderPlans(){
  const annual=plans.find(p=>p.plan_type==='annual');
  if(annual&&annual.is_active&&Number(annual.amount)>0){
    $('#annualPrice').textContent=new Intl.NumberFormat('en-US',{style:'currency',currency:annual.currency}).format(Number(annual.amount))+' / year';
  }
}
function renderCollections(){
  const rail=$('#collectionRail');
  rail.innerHTML=collections.map(c=>{
    return '<button class="month-card '+(selectedId===c.id?'active':'')+'" data-collection="'+c.id+'">'+
      '<div class="month-top"><span class="eyebrow">'+esc(c.year)+'</span><span class="lock '+(c.has_access?'open':'')+'">'+(c.has_access?'UNLOCKED':'LOCKED')+'</span></div>'+
      '<div><strong>'+esc(monthLabel(c.starts_on))+'</strong><div class="small">'+Number(c.product_count||0)+' product'+(Number(c.product_count||0)===1?'':'s')+'</div></div>'+
      '</button>';
  }).join('')||'<div class="empty">No published collection months yet.</div>';
  rail.querySelectorAll('[data-collection]').forEach(b=>b.onclick=()=>{selectedId=b.dataset.collection;renderCollections();renderDetail()});
}
function renderDetail(){
  const c=collections.find(x=>x.id===selectedId)||collections[0];
  if(!c){
    $('#detailTitle').textContent='No collection selected';
    $('#productGrid').innerHTML='<div class="empty">Create the first collection from admin.</div>';
    return;
  }
  selectedId=c.id;
  const has=!!c.has_access;
  $('#detailTitle').textContent=monthLabel(c.starts_on);
  $('#detailEyebrow').textContent=String(c.slug).toUpperCase();
  $('#detailAccess').textContent=has?'UNLOCKED':'LOCKED';
  $('#detailAccess').classList.toggle('unlocked',has);
  $('#lockedMessage').hidden=has;

  const code=codes.find(x=>x.collection_id===c.id);
  $('#codeBox').hidden=!has;
  if(has){
    $('#codeValue').textContent=code&&code.cults_code?code.cults_code:'Access active · code not assigned yet';
    $('#codeNote').textContent=code&&code.note?code.note:'';
    $('#codeLink').hidden=!(code&&code.cults_url);
    if(code&&code.cults_url) $('#codeLink').href=code.cults_url;
  }

  const rows=products.filter(p=>p.collection_id===c.id);
  $('#productGrid').innerHTML=rows.map(p=>{
    const image=p.thumbnail_url?'<img src="'+esc(p.thumbnail_url)+'" alt="'+esc(p.public_title)+'">':'PRODUCT IMAGE';
    const action=has&&p.cults_url?'<a class="button-link" target="_blank" rel="noopener" href="'+esc(p.cults_url)+'">Open product</a>':'<button type="button" disabled>'+(has?'Delivery pending':'Locked')+'</button>';
    return '<article class="product-card"><div class="product-image">'+image+'</div><div class="product-copy"><h3>'+esc(p.public_title)+'</h3><p>'+(has?'Included in your collection access.':'Unlock this month to access the product.')+'</p>'+action+'</div></article>';
  }).join('')||'<div class="empty">No products have been added to this month yet.</div>';
}
async function refresh(){
  const auth=await supabase.auth.getSession();
  session=auth.data.session;
  await loadPublic();
  await loadPrivate();
  if(!selectedId&&collections.length)selectedId=collections[0].id;
  renderAccount();renderPlans();renderCollections();renderDetail();
}
$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  setStatus('Sending sign-in link…');
  const result=await supabase.auth.signInWithOtp({email:$('#loginEmail').value.trim(),options:{emailRedirectTo:location.origin+'/'}});
  setStatus(result.error?result.error.message:'Check your email for the secure sign-in link.');
});
$('#signOutButton').onclick=async()=>{await supabase.auth.signOut();location.reload()};
$('#accountJump').onclick=()=>$('#accountPanel').scrollIntoView({behavior:'smooth'});
supabase.auth.onAuthStateChange(()=>setTimeout(refresh,0));
refresh().catch(err=>{console.error(err);$('#collectionRail').innerHTML='<div class="empty">Library could not be loaded.</div>';setStatus('Library connection error.')});
