import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.1';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '/supabase-config.js';

const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let session=null,customers=[],products=[],privateRows=[],deliveryRows=[],codes=[],coupons=[];

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
function renderSelectors(){
  const customerOptions=customers.map(c=>'<option value="'+c.user_id+'">'+esc(customerLabel(c))+'</option>').join('');
  ['#grantCustomer','#patreonCustomer','#codeCustomer'].forEach(x=>$(x).innerHTML=customerOptions);
  $('#codeProduct').innerHTML=products.map(p=>'<option value="'+p.id+'">'+esc(productLabel(p))+'</option>').join('');
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
    supabase.from('discount_coupons').select('*').order('created_at',{ascending:false})
  ]);
  const err=res.find(x=>x.error);if(err)throw err.error;
  customers=res[0].data||[];products=res[1].data||[];privateRows=res[2].data||[];deliveryRows=res[3].data||[];codes=res[4].data||[];coupons=res[5].data||[];
  renderSelectors();renderCodes();renderCoupons();
  if(!$('#grantStart').value){
    const d=new Date(),m=String(d.getMonth()+1).padStart(2,'0');$('#grantStart').value=d.getFullYear()+'-'+m;
  }
  setText('#accessSync','Synced');
}
$('#grantTermForm').addEventListener('submit',async e=>{
  e.preventDefault();setText('#grantStatus','Granting…');
  const source=$('#grantSource').value;
  const ref=$('#grantReference').value.trim()||null;
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
  setText('#grantStatus',Number(r.data?.collections_granted||0)+' collection month(s) granted.');notify('Collection access granted.');
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
  const r=await supabase.auth.signInWithOtp({email:$('#accessLoginEmail').value.trim(),options:{emailRedirectTo:location.origin+'/admin/access'}});
  setText('#accessLoginStatus',r.error?r.error.message:'Check your email for the admin sign-in link.');
});
$('#accessRefresh').onclick=load;
supabase.auth.onAuthStateChange(()=>setTimeout(init,0));
async function init(){if(await ensureAdmin())load().catch(e=>{setText('#accessSync','Error');notify(e.message,'error')})}
init();