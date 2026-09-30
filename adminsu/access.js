import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.1';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '/supabase-config.js';

const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const ADMIN_EMAIL='finnrubber@gmail.com';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let session=null,customers=[],products=[],privateRows=[],deliveryRows=[],codes=[],coupons=[],collections=[],entitlements=[],grants=[],orders=[],modelGrants=[],collectionCodes=[],subscriptions=[];

function notify(msg,type='success'){
  const t=$('#adminToast');t.textContent=msg;t.className='toast '+(type==='error'?'error ':'')+'show';
  clearTimeout(notify._t);notify._t=setTimeout(()=>t.className='toast',2500);
}
function setText(sel,v){$(sel).textContent=v||''}
function customerLabel(c){return (c.full_name||c.email)+' · '+c.email}
function productLabel(p){
  const priv=privateRows.find(x=>x.product_id===p.id);
  return (priv?.internal_name||p.public_title||'Model')+' · '+(p.public_title||'');
}
function monthLabel(date){return new Date(date+'T12:00:00Z').toLocaleDateString('en-US',{month:'long',year:'numeric',timeZone:'UTC'})}
function endMonth(start,months){const [year,month]=start.slice(0,7).split('-').map(Number);return new Date(Date.UTC(year,month-1+months-1,1)).toISOString().slice(0,10)}
function renderGrantRange(){
  const start=$('#grantStart').value,months=Number($('#grantMonths').value);
  $('#grantRange').textContent=start&&months?monthLabel(start+'-01')+' → '+monthLabel(endMonth(start,months))+' · '+months+' collection month'+(months===1?'':'s'): 'Choose a start month and term.';
}
function renderSelectors(){
  const customerOptions=customers.map(c=>'<option value="'+c.user_id+'">'+esc(customerLabel(c))+'</option>').join('');
  ['#grantCustomer','#patreonCustomer','#codeCustomer','#modelGrantCustomer','#collectionCodeCustomer'].forEach(x=>$(x).innerHTML=customerOptions);
  $('#codeProduct').innerHTML=products.map(p=>'<option value="'+p.id+'">'+esc(productLabel(p))+'</option>').join('');
  $('#modelGrantProduct').innerHTML=products.map(p=>'<option value="'+p.id+'">'+esc(productLabel(p))+'</option>').join('');
  renderCodeCollections();renderGrantRange();
}
function renderCodeCollections(){
  const userId=$('#collectionCodeCustomer').value;
  const owned=new Set(entitlements.filter(e=>e.user_id===userId&&e.status==='active').map(e=>e.collection_id));
  $('#collectionCodeCollection').innerHTML=collections.filter(c=>owned.has(c.id)).map(c=>'<option value="'+c.id+'">'+esc(c.display_name)+'</option>').join('');
  $('#collectionCodeStatus').textContent=owned.size?'':'This customer has no active collection entitlement yet.';
}
function renderMembers(){
  const term=$('#memberSearch').value.trim().toLowerCase();
  const visible=customers.filter(c=>{
    const customerOrders=orders.filter(o=>o.user_id===c.user_id);
    return !term||[c.email,c.full_name,...customerOrders.map(o=>o.request_code)].some(v=>String(v||'').toLowerCase().includes(term));
  });
  $('#memberCount').textContent=visible.length+' / '+customers.length+' accounts';
  $('#memberRows').innerHTML=visible.map(c=>{
    const owned=entitlements.filter(e=>e.user_id===c.user_id&&e.status==='active');
    const purchased=orders.filter(o=>o.user_id===c.user_id&&o.request_type==='collection_access');
    const terms=grants.filter(g=>g.user_id===c.user_id).sort((a,b)=>b.created_at.localeCompare(a.created_at));
    const direct=modelGrants.filter(g=>g.user_id===c.user_id&&!g.revoked_at);
    const memberSubscriptions=subscriptions.filter(s=>s.user_id===c.user_id&&s.status==='active');
    const codeCount=collectionCodes.filter(x=>x.user_id===c.user_id&&x.is_active&&x.cults_code).length;
    const monthNames=owned.map(e=>collections.find(x=>x.id===e.collection_id)).filter(Boolean).sort((a,b)=>a.starts_on.localeCompare(b.starts_on)).map(x=>x.display_name);
    return '<article class="record member-record"><div class="record-head"><div><h3>'+esc(c.full_name||c.email)+'</h3><p>'+esc(c.email)+'</p></div><span class="badge '+(owned.length?'on':'')+'">'+owned.length+' COLLECTION'+(owned.length===1?'':'S')+'</span></div>'+
      '<div class="member-months">'+(monthNames.length?monthNames.map(x=>'<span>'+esc(x)+'</span>').join(''):'<span>No collection access</span>')+'</div>'+
      '<div class="member-ledger">'+(purchased.length?purchased.slice(0,8).map(o=>'<div><strong>'+esc(o.request_code)+'</strong> · '+esc(o.plan_slug||o.subject)+' · '+esc(o.status.replaceAll('_',' '))+(o.quote_amount!=null?' · $'+Number(o.quote_amount).toFixed(2):'')+'</div>').join(''):'<div>No collection orders yet</div>')+
      (terms.length?'<div>Terms: '+terms.slice(0,4).map(g=>esc(monthLabel(g.start_on)+'–'+monthLabel(endMonth(g.start_on,g.months))+' ('+g.months+' months)'+(g.source_reference?' · '+g.source_reference:''))).join(' · ')+'</div>':'')+
      (memberSubscriptions.length?'<div>Active legacy subscription: '+memberSubscriptions.map(s=>esc(s.billing_months+' months · through '+(s.current_period_end||'—'))).join(' · ')+'</div>':'')+
      '<div>Individual models: '+(direct.length?direct.map(g=>esc(products.find(p=>p.id===g.product_id)?.public_title||'Model')).join(', '):'none')+' · '+codeCount+' collection Cults code'+(codeCount===1?'':'s')+'</div></div></article>';
  }).join('')||'<div class="admin-empty"><strong>No customers match.</strong><span>Try an email or order ID.</span></div>';
}
function renderCodes(){
  $('#productCodeRows').innerHTML=codes.slice(0,40).map(c=>{
    const customer=customers.find(x=>x.user_id===c.user_id);
    const product=products.find(x=>x.id===c.product_id);
    return '<article class="record"><div class="record-head"><div><h3>'+esc(productLabel(product||{}))+'</h3><p>'+esc(customer?customerLabel(customer):c.user_id)+'</p></div><span class="badge on">'+esc(c.cults_code)+'</span></div></article>';
  }).join('')||'<p class="small">No model codes assigned yet.</p>';
}
function renderCoupons(){
  $('#couponRows').innerHTML=coupons.map(c=>
    '<article class="record"><div class="record-head"><div><h3>'+esc(c.code)+'</h3><p>'+esc(c.audience)+' · '+esc(c.discount_type)+' · '+Number(c.discount_value)+'</p></div><span class="badge '+(c.is_active?'on':'warn')+'">'+(c.is_active?'ACTIVE':'OFF')+'</span></div></article>'
  ).join('')||'<p class="small">No coupons yet.</p>';
}
async function ensureAdmin(){
  const a=await supabase.auth.getSession();session=a.data.session;
  if(!session){$('#accessLoginPanel').hidden=false;$('#accessAdminApp').hidden=true;return false}
  const r=await supabase.from('sales_admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(r.error||!r.data){$('#accessLoginPanel').hidden=false;$('#accessAdminApp').hidden=true;setText('#accessLoginStatus','This account is not authorized for admin.');return false}
  $('#accessLoginPanel').hidden=true;$('#accessAdminApp').hidden=false;return true;
}
async function load(){
  setText('#accessSync','Syncing…');
  const res=await Promise.all([
    supabase.from('membership_customers').select('*').order('email'),
    supabase.from('membership_products').select('*').order('created_at',{ascending:false}),
    supabase.from('membership_product_private').select('*'),
    supabase.from('membership_product_delivery').select('*'),
    supabase.from('membership_product_codes').select('*').order('created_at',{ascending:false}),
    supabase.from('discount_coupons').select('*').order('created_at',{ascending:false}),
    supabase.from('membership_collections').select('id,display_name,starts_on').order('starts_on'),
    supabase.from('membership_entitlements').select('user_id,collection_id,status'),
    supabase.from('membership_access_grants').select('user_id,start_on,months,source_reference,created_at').order('created_at',{ascending:false}),
    supabase.from('service_requests').select('user_id,request_code,request_type,plan_slug,subject,status,quote_amount').order('created_at',{ascending:false}),
    supabase.from('product_entitlements').select('user_id,product_id,revoked_at'),
    supabase.from('membership_collection_codes').select('user_id,collection_id,cults_code,is_active'),
    supabase.from('membership_subscriptions').select('user_id,status,billing_months,current_period_end')
  ]);
  const err=res.find(x=>x.error);if(err)throw err.error;
  customers=res[0].data||[];products=res[1].data||[];privateRows=res[2].data||[];deliveryRows=res[3].data||[];codes=res[4].data||[];coupons=res[5].data||[];
  collections=res[6].data||[];entitlements=res[7].data||[];grants=res[8].data||[];orders=res[9].data||[];modelGrants=res[10].data||[];collectionCodes=res[11].data||[];subscriptions=res[12].data||[];
  renderSelectors();renderCodes();renderCoupons();renderMembers();
  if(!$('#grantStart').value){
    const d=new Date(),m=String(d.getMonth()+1).padStart(2,'0');$('#grantStart').value=d.getFullYear()+'-'+m;
  }
  renderGrantRange();
  setText('#accessSync','Synced');
}
$('#grantStart').addEventListener('change',renderGrantRange);
$('#grantMonths').addEventListener('change',renderGrantRange);
$('#memberSearch').addEventListener('input',renderMembers);
$('#collectionCodeCustomer').addEventListener('change',renderCodeCollections);
$('#grantTermForm').addEventListener('submit',async e=>{
  e.preventDefault();setText('#grantStatus','Granting…');
  const source=$('#grantSource').value;
  const ref=$('#grantReference').value.trim()||null;
  if(source==='manual_payment'&&!ref){setText('#grantStatus','A verified Payoneer payment reference is required.');return}
  const requestId=$('#grantRequest').value.trim()||null;
  const r=await supabase.rpc('admin_grant_collection_term',{
    p_user_id:$('#grantCustomer').value,
    p_start_on:$('#grantStart').value+'-01',
    p_months:Number($('#grantMonths').value),
    p_source_type:source,
    p_source_reference:ref,
    p_service_request_id:requestId,
    p_patreon_member_id:null
  });
  if(r.error){setText('#grantStatus',r.error.message);return}
  setText('#grantStatus',Number(r.data?.collections_granted||0)+' collection months granted · '+$('#grantRange').textContent);notify('Collection access granted.');await load();
});
$('#modelGrantForm').addEventListener('submit',async e=>{
  e.preventDefault();setText('#modelGrantStatus','Granting model…');
  const r=await supabase.rpc('admin_set_product_entitlement',{
    p_user_id:$('#modelGrantCustomer').value,p_product_id:$('#modelGrantProduct').value,
    p_source:$('#modelGrantSource').value,p_reference:$('#modelGrantReference').value.trim()||null,p_active:true
  });
  setText('#modelGrantStatus',r.error?r.error.message:'Model added to the customer Library.');
  if(!r.error){notify('Model access granted.');await load()}
});
$('#collectionCodeForm').addEventListener('submit',async e=>{
  e.preventDefault();setText('#collectionCodeStatus','Saving…');
  const userId=$('#collectionCodeCustomer').value,collectionId=$('#collectionCodeCollection').value;
  if(!entitlements.some(x=>x.user_id===userId&&x.collection_id===collectionId&&x.status==='active')){
    setText('#collectionCodeStatus','Grant this collection to the customer first.');return;
  }
  const r=await supabase.from('membership_collection_codes').upsert({
    user_id:userId,collection_id:collectionId,cults_code:$('#collectionCodeValue').value.trim(),
    cults_url:$('#collectionCodeUrl').value.trim()||null,is_active:true
  },{onConflict:'user_id,collection_id'});
  setText('#collectionCodeStatus',r.error?r.error.message:'Collection code saved and visible to this customer.');
  if(!r.error){notify('Collection Cults code assigned.');$('#collectionCodeValue').value='';await load()}
});
$('#patreonSearchBtn').onclick=async()=>{
  const email=$('#patreonSearch').value.trim();
  setText('#patreonStatus','Searching…');
  const r=await supabase.from('sales_patreon_members').select('member_id,full_name,email,patron_status,last_charge_date,last_charge_status,currently_entitled_amount_cents').ilike('email',email).order('last_charge_date',{ascending:false,nullsFirst:false}).limit(10);
  if(r.error){setText('#patreonStatus',r.error.message);return}
  const rows=r.data||[];
  setText('#patreonStatus',rows.length?'':'No matching Patreon member.');
  $('#patreonResults').innerHTML=rows.map(p=>
    '<article class="record"><div class="record-head"><div><h3>'+esc(p.full_name||p.email||p.member_id)+'</h3><p>'+esc(p.email||'')+' · '+esc(p.patron_status||'')+' · '+esc(p.last_charge_status||'')+' · '+(p.last_charge_date?new Date(p.last_charge_date).toLocaleDateString():'No charge')+'</p></div><button data-import-patreon="'+esc(p.member_id)+'">Link + grant paid month</button></div></article>'
  ).join('');
  document.querySelectorAll('[data-import-patreon]').forEach(b=>b.onclick=()=>importPatreon(b.dataset.importPatreon));
};
async function importPatreon(memberId){
  setText('#patreonStatus','Importing…');
  const r=await supabase.rpc('admin_import_patreon_access',{
    p_user_id:$('#patreonCustomer').value,
    p_patreon_member_id:memberId,
    p_founder_status:$('#patreonFounder').value==='true',
    p_founder_note:$('#patreonFounderNote').value.trim()||null
  });
  if(r.error){setText('#patreonStatus',r.error.message);return}
  const d=r.data||{};setText('#patreonStatus','Patreon linked · '+(d.paid_month||'paid month')+' granted.');notify('Patreon access migrated.');
}
$('#productCodeForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const productId=$('#codeProduct').value;
  const fallback=deliveryRows.find(x=>x.product_id===productId)?.cults_url||null;
  const row={
    user_id:$('#codeCustomer').value,
    product_id:productId,
    cults_code:$('#productCode').value.trim(),
    cults_url:$('#productCodeUrl').value.trim()||fallback,
    assigned_by:session.user.id,
    is_active:true,
    updated_at:new Date().toISOString()
  };
  const r=await supabase.from('membership_product_codes').upsert(row,{onConflict:'user_id,product_id'});
  setText('#productCodeStatus',r.error?r.error.message:'Cults3D code assigned.');
  if(!r.error){notify('Cults3D code assigned.');e.target.reset();await load()}
});
$('#couponForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const until=$('#couponUntil').value?new Date($('#couponUntil').value).toISOString():null;
  const row={
    code:$('#couponCode').value.trim().toUpperCase(),
    label:$('#couponLabel').value.trim()||null,
    audience:$('#couponAudience').value,
    discount_type:$('#couponType').value,
    discount_value:Number($('#couponValue').value),
    valid_until:until,
    created_by:session.user.id,
    is_active:true
  };
  const r=await supabase.from('discount_coupons').insert(row);
  if(r.error){notify(r.error.message,'error');return}
  notify('Coupon created.');e.target.reset();await load();
});
$('#accessLoginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  if($('#accessLoginEmail').value.trim().toLowerCase()!==ADMIN_EMAIL){alert('This admin panel is restricted to the authorized account.');return}
  const r=await supabase.auth.signInWithOtp({email:$('#accessLoginEmail').value.trim(),options:{emailRedirectTo:location.origin+'/adminsu/access'}});
  setText('#accessLoginStatus',r.error?r.error.message:'Check your email for the admin sign-in link.');
});
$('#accessRefresh').onclick=load;
supabase.auth.onAuthStateChange(()=>setTimeout(init,0));
async function init(){if(await ensureAdmin())load().catch(e=>{setText('#accessSync','Error');notify(e.message,'error')})}
init();
