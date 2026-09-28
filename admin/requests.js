import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.1';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '/supabase-config.js';

const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let session=null,rows=[],searchTerm='',filter='open';

function notify(msg,type='success'){
  const toast=$('#adminToast');toast.textContent=msg;toast.className='toast '+(type==='error'?'error ':'')+'show';
  clearTimeout(notify._t);notify._t=setTimeout(()=>toast.className='toast',2600);
}
function setSync(v){$('#requestSync').textContent=v}
function isOpen(status){return !['fulfilled','declined','cancelled'].includes(status)}
function filtered(){
  return rows.filter(r=>{
    if(filter==='open'&&!isOpen(r.status))return false;
    if(filter!=='open'&&filter!=='all'&&r.status!==filter)return false;
    if(searchTerm){
      const hay=[r.request_code,r.first_name,r.last_name,r.email,r.subject,r.brief,r.country_code,r.plan_slug,r.coupon_code].filter(Boolean).join(' ').toLowerCase();
      if(!hay.includes(searchTerm))return false;
    }
    return true;
  });
}
function option(value,label,current){return '<option value="'+value+'" '+(value===current?'selected':'')+'>'+label+'</option>'}
function renderStats(){
  const open=rows.filter(r=>isOpen(r.status)).length;
  const awaiting=rows.filter(r=>['quoted','payment_requested'].includes(r.status)).length;
  const paid=rows.filter(r=>['paid','in_progress'].includes(r.status)).length;
  const fulfilled=rows.filter(r=>r.status==='fulfilled').length;
  $('#requestStats').innerHTML=[
    ['OPEN',open],['AWAITING PAYMENT',awaiting],['PAID / ACTIVE',paid],['FULFILLED',fulfilled]
  ].map(x=>'<div class="stat"><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>').join('');
}
function render(){
  const visible=filtered();
  $('#requestCount').textContent=visible.length+' / '+rows.length+' requests';
  $('#requestRows').innerHTML=visible.map(r=>{
    const linked=r.user_id?'<span class="badge on">ACCOUNT LINKED</span>':'<span class="badge warn">NO ACCOUNT YET</span>';
    const payment=r.payoneer_payment_url?'<a class="secondary admin-btn" href="'+esc(r.payoneer_payment_url)+'" target="_blank" rel="noopener">Open payment link ↗</a>':'';
    const name=((r.first_name||'')+' '+(r.last_name||'')).trim()||r.email;
    const plan=r.plan_months
      ? '<div class="admin-callout"><span><strong>'+Number(r.plan_months)+' MONTH ACCESS</strong> · 
      '<div class="rights-admin-grid">'+
        '<label>Status<select data-status="'+r.id+'">'+
          option('submitted','Submitted',r.status)+option('reviewing','Reviewing',r.status)+option('quoted','Quoted',r.status)+option('payment_requested','Payment requested',r.status)+option('paid','Paid',r.status)+option('in_progress','In progress',r.status)+option('fulfilled','Fulfilled',r.status)+option('declined','Declined',r.status)+option('cancelled','Cancelled',r.status)+
        '</select></label>'+
        '<label>Quote<input data-quote="'+r.id+'" type="number" min="0" step=".01" value="'+(r.quote_amount??'')+'" placeholder="150"></label>'+
        '<label>Currency<input data-currency="'+r.id+'" maxlength="3" value="'+esc(r.currency||'USD')+'"></label>'+
        '<label>Payoneer payment URL<input data-payment-url="'+r.id+'" type="url" value="'+esc(r.payoneer_payment_url||'')+'" placeholder="https://..."></label>'+
        '<label>Payment reference<input data-payment-ref="'+r.id+'" value="'+esc(r.payment_reference||'')+'"></label>'+
        '<label>Invoice reference<input data-invoice-ref="'+r.id+'" value="'+esc(r.invoice_reference||'')+'"></label>'+
        '<label style="grid-column:span 2">Admin note<input data-admin-note="'+r.id+'" value="'+esc(r.admin_note||'')+'"></label>'+
      '</div>'+
      '<div class="actions"><button data-save-request="'+r.id+'">Save request</button>'+payment+
        (!r.user_id?'<button class="secondary" data-link-account="'+r.id+'">Link matching account</button>':'')+
        '<a class="secondary admin-btn" href="/admin/access">Access Control →</a>'+
        '<a class="secondary admin-btn" href="mailto:'+encodeURIComponent(r.email)+'">Email customer ↗</a>'+
      '</div>'+accessGrant+
    '</article>';
  }).join('')||'<div class="admin-empty"><strong>No requests match this view.</strong><span>Change the search or status filter.</span></div>';
  document.querySelectorAll('[data-save-request]').forEach(b=>b.onclick=()=>saveRequest(b.dataset.saveRequest));
  document.querySelectorAll('[data-link-account]').forEach(b=>b.onclick=()=>linkMatchingAccount(b.dataset.linkAccount));
  document.querySelectorAll('[data-grant-request]').forEach(b=>b.onclick=()=>grantRequestAccess(b.dataset.grantRequest));
}
async function grantRequestAccess(id){
  const start=document.querySelector('[data-access-start="'+id+'"]')?.value;
  if(!start){notify('Choose an access start month.','error');return}
  const row=rows.find(x=>x.id===id);if(!row)return;
  if(row.status!=='paid'){notify('Mark the request Paid and save it first.','error');return}
  if(!row.payment_reference){notify('Save the Payoneer payment reference first.','error');return}
  const r=await supabase.rpc('admin_grant_access_from_request',{p_request_id:id,p_start_on:start+'-01'});
  if(r.error){notify(r.error.message,'error');return}
  notify('Collection access granted.');await load();
}
async function linkMatchingAccount(id){
  const row=rows.find(x=>x.id===id);if(!row)return;
  const found=await supabase.from('membership_customers').select('user_id,email').ilike('email',row.email).limit(2);
  if(found.error){notify(found.error.message,'error');return}
  if(!found.data?.length){notify('No CyberPop account with this email yet.','error');return}
  if(found.data.length>1){notify('More than one matching account found. Review manually.','error');return}
  const r=await supabase.from('service_requests').update({user_id:found.data[0].user_id,updated_at:new Date().toISOString()}).eq('id',id);
  if(r.error){notify(r.error.message,'error');return}
  notify('Request linked to the matching CyberPop account.');await load();
}
async function saveRequest(id){
  const patch={
    status:document.querySelector('[data-status="'+id+'"]').value,
    quote_amount:document.querySelector('[data-quote="'+id+'"]').value?Number(document.querySelector('[data-quote="'+id+'"]').value):null,
    currency:document.querySelector('[data-currency="'+id+'"]').value.trim().toUpperCase()||'USD',
    payoneer_payment_url:document.querySelector('[data-payment-url="'+id+'"]').value.trim()||null,
    payment_reference:document.querySelector('[data-payment-ref="'+id+'"]').value.trim()||null,
    invoice_reference:document.querySelector('[data-invoice-ref="'+id+'"]').value.trim()||null,
    admin_note:document.querySelector('[data-admin-note="'+id+'"]').value.trim()||null,
    updated_at:new Date().toISOString()
  };
  const r=await supabase.from('service_requests').update(patch).eq('id',id);
  if(r.error){notify(r.error.message,'error');return}
  notify('Request updated.');await load();
}
async function ensureAdmin(){
  const auth=await supabase.auth.getSession();session=auth.data.session;
  if(!session){$('#requestLoginPanel').hidden=false;$('#requestAdminApp').hidden=true;return false}
  const check=await supabase.from('sales_admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(check.error||!check.data){$('#requestLoginPanel').hidden=false;$('#requestAdminApp').hidden=true;$('#requestLoginStatus').textContent='This account is not authorized for admin.';return false}
  $('#requestLoginPanel').hidden=true;$('#requestAdminApp').hidden=false;return true;
}
async function load(){
  setSync('Syncing…');
  const r=await supabase.from('service_requests').select('*').order('created_at',{ascending:false});
  if(r.error)throw r.error;
  rows=r.data||[];renderStats();render();setSync('Synced');
}
$('#requestLoginForm').addEventListener('submit',async e=>{
  e.preventDefault();$('#requestLoginStatus').textContent='Sending sign-in link…';
  const r=await supabase.auth.signInWithOtp({email:$('#requestLoginEmail').value.trim(),options:{emailRedirectTo:location.origin+'/admin/requests'}});
  $('#requestLoginStatus').textContent=r.error?r.error.message:'Check your email for the admin sign-in link.';
});
$('#requestSearch').addEventListener('input',e=>{searchTerm=e.target.value.trim().toLowerCase();render()});
$('#requestFilter').addEventListener('change',e=>{filter=e.target.value;render()});
$('#requestRefresh').onclick=load;
supabase.auth.onAuthStateChange(()=>setTimeout(init,0));
async function init(){if(await ensureAdmin())load().catch(e=>{setSync('Error');notify(e.message,'error')})}
init();
+Number(r.plan_list_price||0).toFixed(0)+' '+esc(r.currency||'USD')+(r.coupon_code?' · Coupon '+esc(r.coupon_code):'')+'</span></div>'
      : '';
    const accessGrant=(r.request_type==='collection_access'&&r.plan_months&&r.user_id)
      ? '<div class="actions"><input data-access-start="'+r.id+'" type="month" min="2026-04" value="'+new Date().toISOString().slice(0,7)+'"><button data-grant-request="'+r.id+'">Grant '+Number(r.plan_months)+' month'+(Number(r.plan_months)>1?'s':'')+'</button></div>'
      : '';
    return '<article class="record" data-request="'+r.id+'">'+
      '<div class="record-head"><div><span class="eyebrow">'+esc(r.request_code)+'</span><h3>'+esc(name)+'</h3><p>'+esc(r.email)+' · '+esc(r.country_code||'—')+' · '+esc(r.request_type)+'</p></div><div>'+linked+' <span class="badge '+(isOpen(r.status)?'warn':'on')+'">'+esc(r.status.toUpperCase())+'</span></div></div>'+
      plan+
      '<div><strong>'+esc(r.subject||'No subject')+'</strong><p style="white-space:pre-wrap;margin-top:7px">'+esc(r.brief)+'</p></div>'+
      '<div class="rights-admin-grid">'+
        '<label>Status<select data-status="'+r.id+'">'+
          option('submitted','Submitted',r.status)+option('reviewing','Reviewing',r.status)+option('quoted','Quoted',r.status)+option('payment_requested','Payment requested',r.status)+option('paid','Paid',r.status)+option('in_progress','In progress',r.status)+option('fulfilled','Fulfilled',r.status)+option('declined','Declined',r.status)+option('cancelled','Cancelled',r.status)+
        '</select></label>'+
        '<label>Quote<input data-quote="'+r.id+'" type="number" min="0" step=".01" value="'+(r.quote_amount??'')+'" placeholder="150"></label>'+
        '<label>Currency<input data-currency="'+r.id+'" maxlength="3" value="'+esc(r.currency||'USD')+'"></label>'+
        '<label>Payoneer payment URL<input data-payment-url="'+r.id+'" type="url" value="'+esc(r.payoneer_payment_url||'')+'" placeholder="https://..."></label>'+
        '<label>Payment reference<input data-payment-ref="'+r.id+'" value="'+esc(r.payment_reference||'')+'"></label>'+
        '<label>Invoice reference<input data-invoice-ref="'+r.id+'" value="'+esc(r.invoice_reference||'')+'"></label>'+
        '<label style="grid-column:span 2">Admin note<input data-admin-note="'+r.id+'" value="'+esc(r.admin_note||'')+'"></label>'+
      '</div>'+
      '<div class="actions"><button data-save-request="'+r.id+'">Save request</button>'+payment+
        (!r.user_id?'<button class="secondary" data-link-account="'+r.id+'">Link matching account</button>':'')+
        '<a class="secondary admin-btn" href="/admin/library">Open Library & Access →</a>'+
        '<a class="secondary admin-btn" href="mailto:'+encodeURIComponent(r.email)+'">Email customer ↗</a>'+
      '</div>'+
    '</article>';
  }).join('')||'<div class="admin-empty"><strong>No requests match this view.</strong><span>Change the search or status filter.</span></div>';
  document.querySelectorAll('[data-save-request]').forEach(b=>b.onclick=()=>saveRequest(b.dataset.saveRequest));
  document.querySelectorAll('[data-link-account]').forEach(b=>b.onclick=()=>linkMatchingAccount(b.dataset.linkAccount));
}
async function linkMatchingAccount(id){
  const row=rows.find(x=>x.id===id);if(!row)return;
  const found=await supabase.from('membership_customers').select('user_id,email').ilike('email',row.email).limit(2);
  if(found.error){notify(found.error.message,'error');return}
  if(!found.data?.length){notify('No CyberPop account with this email yet.','error');return}
  if(found.data.length>1){notify('More than one matching account found. Review manually.','error');return}
  const r=await supabase.from('service_requests').update({user_id:found.data[0].user_id,updated_at:new Date().toISOString()}).eq('id',id);
  if(r.error){notify(r.error.message,'error');return}
  notify('Request linked to the matching CyberPop account.');await load();
}
async function saveRequest(id){
  const patch={
    status:document.querySelector('[data-status="'+id+'"]').value,
    quote_amount:document.querySelector('[data-quote="'+id+'"]').value?Number(document.querySelector('[data-quote="'+id+'"]').value):null,
    currency:document.querySelector('[data-currency="'+id+'"]').value.trim().toUpperCase()||'USD',
    payoneer_payment_url:document.querySelector('[data-payment-url="'+id+'"]').value.trim()||null,
    payment_reference:document.querySelector('[data-payment-ref="'+id+'"]').value.trim()||null,
    invoice_reference:document.querySelector('[data-invoice-ref="'+id+'"]').value.trim()||null,
    admin_note:document.querySelector('[data-admin-note="'+id+'"]').value.trim()||null,
    updated_at:new Date().toISOString()
  };
  const r=await supabase.from('service_requests').update(patch).eq('id',id);
  if(r.error){notify(r.error.message,'error');return}
  notify('Request updated.');await load();
}
async function ensureAdmin(){
  const auth=await supabase.auth.getSession();session=auth.data.session;
  if(!session){$('#requestLoginPanel').hidden=false;$('#requestAdminApp').hidden=true;return false}
  const check=await supabase.from('sales_admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(check.error||!check.data){$('#requestLoginPanel').hidden=false;$('#requestAdminApp').hidden=true;$('#requestLoginStatus').textContent='This account is not authorized for admin.';return false}
  $('#requestLoginPanel').hidden=true;$('#requestAdminApp').hidden=false;return true;
}
async function load(){
  setSync('Syncing…');
  const r=await supabase.from('service_requests').select('*').order('created_at',{ascending:false});
  if(r.error)throw r.error;
  rows=r.data||[];renderStats();render();setSync('Synced');
}
$('#requestLoginForm').addEventListener('submit',async e=>{
  e.preventDefault();$('#requestLoginStatus').textContent='Sending sign-in link…';
  const r=await supabase.auth.signInWithOtp({email:$('#requestLoginEmail').value.trim(),options:{emailRedirectTo:location.origin+'/admin/requests'}});
  $('#requestLoginStatus').textContent=r.error?r.error.message:'Check your email for the admin sign-in link.';
});
$('#requestSearch').addEventListener('input',e=>{searchTerm=e.target.value.trim().toLowerCase();render()});
$('#requestFilter').addEventListener('change',e=>{filter=e.target.value;render()});
$('#requestRefresh').onclick=load;
supabase.auth.onAuthStateChange(()=>setTimeout(init,0));
async function init(){if(await ensureAdmin())load().catch(e=>{setSync('Error');notify(e.message,'error')})}
init();
