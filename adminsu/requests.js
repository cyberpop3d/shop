import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.1';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '/supabase-config.js';

const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let session=null,rows=[],searchTerm='',filter='open';
let firstLoad=true,knownPaymentReports=new Set(),refreshTimer=null;

function notify(msg,type='success'){
  const toast=$('#adminToast');
  toast.textContent=msg;
  toast.className='toast '+(type==='error'?'error ':'')+'show';
  clearTimeout(notify._t);
  notify._t=setTimeout(()=>toast.className='toast',2600);
}
function setSync(v){$('#requestSync').textContent=v}
function isOpen(status){return !['fulfilled','declined','cancelled'].includes(status)}
function currentMonth(){return new Date().toISOString().slice(0,7)}
function option(value,label,current){return '<option value="'+value+'" '+(value===current?'selected':'')+'>'+label+'</option>'}

function filtered(){
  return rows.filter(r=>{
    if(filter==='open'&&!isOpen(r.status))return false;
    if(filter==='customer_reported'&&!r.customer_payment_reported_at)return false;
    if(!['open','all','customer_reported'].includes(filter)&&r.status!==filter)return false;
    if(searchTerm){
      const hay=[r.request_code,r.first_name,r.last_name,r.email,r.subject,r.brief,r.country_code,r.plan_slug,r.coupon_code]
        .filter(Boolean).join(' ').toLowerCase();
      if(!hay.includes(searchTerm))return false;
    }
    return true;
  });
}
function renderStats(){
  const open=rows.filter(r=>isOpen(r.status)).length;
  const awaiting=rows.filter(r=>['quoted','payment_requested'].includes(r.status)).length;
  const paid=rows.filter(r=>r.status==='paid').length;
  const fulfilled=rows.filter(r=>r.status==='fulfilled').length;
  const reported=rows.filter(r=>r.customer_payment_reported_at&&!['paid','fulfilled'].includes(r.status)).length;
  $('#requestStats').innerHTML=[
    ['OPEN',open],['AWAITING PAYMENT',awaiting],['CUSTOMER SAYS PAID',reported],['PAID',paid],['FULFILLED',fulfilled]
  ].map(x=>'<div class="stat"><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>').join('');
}
function render(){
  const visible=filtered();
  $('#requestCount').textContent=visible.length+' / '+rows.length+' requests';
  $('#requestRows').innerHTML=visible.map(r=>{
    const linked=r.user_id?'<span class="badge on">ACCOUNT LINKED</span>':'<span class="badge warn">NO ACCOUNT YET</span>';
    const payment=r.payoneer_payment_url
      ? '<a class="secondary admin-btn" href="'+esc(r.payoneer_payment_url)+'" target="_blank" rel="noopener">Open payment link ↗</a>'
      : '';
    const name=((r.first_name||'')+' '+(r.last_name||'')).trim()||r.email;
    const packageSlug=r.request_metadata?.package_slug;
    const selectedSlugs=Array.isArray(r.request_metadata?.collection_slugs)?r.request_metadata.collection_slugs:[];
    const plan=(r.plan_months||packageSlug)
      ? '<div class="admin-callout"><span><strong>'+esc(packageSlug?packageSlug.replaceAll('-',' ').toUpperCase():Number(r.plan_months)+' MONTH ACCESS')+'</strong> · $'+Number(r.plan_list_price||0).toFixed(0)+' '+esc(r.currency||'USD')+(selectedSlugs.length?' · '+esc(selectedSlugs.join(', ')):'')+(r.coupon_code?' · Coupon '+esc(r.coupon_code):'')+'</span></div>'
      : '';
    const reported=r.customer_payment_reported_at
      ? '<div class="admin-callout payment-reported-callout"><span><strong>CUSTOMER SAYS PAYMENT SENT</strong> · '+esc(new Date(r.customer_payment_reported_at).toLocaleString())+(r.customer_payment_note?' · '+esc(r.customer_payment_note):'')+'</span></div>'
      : '';
    const accessGrant=(r.request_type==='collection_access'&&(r.plan_months||packageSlug)&&r.user_id&&r.status!=='fulfilled')
      ? '<div class="actions"><label>Access starts<input data-access-start="'+r.id+'" type="month" min="2026-04" value="'+currentMonth()+'"></label><button data-grant-request="'+r.id+'">Confirm payment & grant access</button><span class="small">Verify payment in Payoneer first. This immediately opens the selected collections.</span></div>'
      : '';

    return '<article class="record" data-request="'+r.id+'">'+
      '<div class="record-head"><div><span class="eyebrow">'+esc(r.request_code)+'</span><h3>'+esc(name)+'</h3><p>'+esc(r.email)+' · '+esc(r.country_code||'—')+' · '+esc(r.request_type)+'</p></div><div>'+linked+' <span class="badge '+(isOpen(r.status)?'warn':'on')+'">'+esc(r.status.toUpperCase())+'</span></div></div>'+
      plan+
      reported+
      '<div><strong>'+esc(r.subject||'No subject')+'</strong><p style="white-space:pre-wrap;margin-top:7px">'+esc(r.brief)+'</p></div>'+
      '<div class="rights-admin-grid">'+
        '<label>Status<select data-status="'+r.id+'">'+
          option('submitted','Submitted',r.status)+
          option('reviewing','Reviewing',r.status)+
          option('quoted','Quoted',r.status)+
          option('payment_requested','Payment requested',r.status)+
          option('paid','Paid',r.status)+
          option('in_progress','In progress',r.status)+
          option('fulfilled','Fulfilled',r.status)+
          option('declined','Declined',r.status)+
          option('cancelled','Cancelled',r.status)+
        '</select></label>'+
        '<label>Quote<input data-quote="'+r.id+'" type="number" min="0" step=".01" value="'+(r.quote_amount??'')+'" placeholder="'+(r.plan_list_price??'')+'"></label>'+
        '<label>Currency<input data-currency="'+r.id+'" maxlength="3" value="'+esc(r.currency||'USD')+'"></label>'+
        '<label>Payoneer payment URL<input data-payment-url="'+r.id+'" type="url" value="'+esc(r.payoneer_payment_url||'')+'" placeholder="https://..."></label>'+
        '<label>Payment reference<input data-payment-ref="'+r.id+'" value="'+esc(r.payment_reference||'')+'" placeholder="required before access"></label>'+
        '<label>Invoice reference<input data-invoice-ref="'+r.id+'" value="'+esc(r.invoice_reference||'')+'"></label>'+
        '<label style="grid-column:span 2">Admin note<input data-admin-note="'+r.id+'" value="'+esc(r.admin_note||'')+'"></label>'+
      '</div>'+
      '<div class="actions"><button data-save-request="'+r.id+'">Save request</button>'+payment+
        (!r.user_id?'<button class="secondary" data-link-account="'+r.id+'">Link matching account</button>':'')+
        '<a class="secondary admin-btn" href="/adminsu/access">Access Control →</a>'+
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
  const row=rows.find(x=>x.id===id);
  if(!row)return;
  const reference=document.querySelector('[data-payment-ref="'+id+'"]')?.value.trim();
  if(!reference){notify('Enter the verified Payoneer payment reference.','error');return}
  const button=document.querySelector('[data-grant-request="'+id+'"]');button.disabled=true;
  const r=await supabase.rpc('admin_confirm_payment_and_grant',{p_request_id:id,p_start_on:start+'-01',p_payment_reference:reference});
  button.disabled=false;
  if(r.error){notify(r.error.message,'error');return}
  notify('Payment recorded and collection access granted.');await load();
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
  const row=rows.find(x=>x.id===id);
  const status=document.querySelector('[data-status="'+id+'"]');
  if(row?.request_type==='collection_access'&&status.value==='paid'){notify('Use Confirm payment & grant access after verifying Payoneer.','error');return}
  const paymentUrl=document.querySelector('[data-payment-url="'+id+'"]').value.trim()||null;
  let nextStatus=status.value;
  if(paymentUrl&&['submitted','reviewing','quoted'].includes(nextStatus))nextStatus='payment_requested';
  const patch={
    status:nextStatus,
    quote_amount:document.querySelector('[data-quote="'+id+'"]').value?Number(document.querySelector('[data-quote="'+id+'"]').value):null,
    currency:document.querySelector('[data-currency="'+id+'"]').value.trim().toUpperCase()||'USD',
    payoneer_payment_url:paymentUrl,
    payment_reference:document.querySelector('[data-payment-ref="'+id+'"]').value.trim()||null,
    invoice_reference:document.querySelector('[data-invoice-ref="'+id+'"]').value.trim()||null,
    admin_note:document.querySelector('[data-admin-note="'+id+'"]').value.trim()||null,
    updated_at:new Date().toISOString()
  };
  const r=await supabase.from('service_requests').update(patch).eq('id',id);
  if(r.error){notify(r.error.message,'error');return}
  notify(paymentUrl&&nextStatus==='payment_requested'?'Payment link published to customer account.':'Request updated.');await load();
}
async function ensureAdmin(){
  const auth=await supabase.auth.getSession();session=auth.data.session;
  if(!session){$('#requestLoginPanel').hidden=false;$('#requestAdminApp').hidden=true;return false}
  const check=await supabase.from('sales_admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(check.error||!check.data){
    $('#requestLoginPanel').hidden=false;$('#requestAdminApp').hidden=true;
    $('#requestLoginStatus').textContent='This account is not authorized for admin.';
    return false;
  }
  $('#requestLoginPanel').hidden=true;$('#requestAdminApp').hidden=false;return true;
}
async function load(){
  setSync('Syncing…');
  const r=await supabase.from('service_requests').select('*').order('created_at',{ascending:false});
  if(r.error)throw r.error;
  rows=r.data||[];
  const reports=new Set(rows.filter(row=>row.customer_payment_reported_at).map(row=>row.id));
  if(!firstLoad){
    const fresh=rows.find(row=>reports.has(row.id)&&!knownPaymentReports.has(row.id));
    if(fresh)notify(fresh.request_code+' · customer reports payment sent. Verify in Payoneer before confirming.');
  }
  knownPaymentReports=reports;firstLoad=false;
  renderStats();render();setSync('Synced');
}
$('#requestLoginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  $('#requestLoginStatus').textContent='Sending sign-in link…';
  const r=await supabase.auth.signInWithOtp({email:$('#requestLoginEmail').value.trim(),options:{emailRedirectTo:location.origin+'/adminsu/requests'}});
  $('#requestLoginStatus').textContent=r.error?r.error.message:'Check your email for the admin sign-in link.';
});
$('#requestSearch').addEventListener('input',e=>{searchTerm=e.target.value.trim().toLowerCase();render()});
$('#requestFilter').addEventListener('change',e=>{filter=e.target.value;render()});
$('#requestRefresh').onclick=load;
supabase.auth.onAuthStateChange(()=>setTimeout(init,0));
async function init(){
  if(await ensureAdmin()){
    load().catch(e=>{setSync('Error');notify(e.message,'error')});
    if(!refreshTimer)refreshTimer=setInterval(()=>load().catch(e=>notify(e.message,'error')),30000);
  }else if(refreshTimer){clearInterval(refreshTimer);refreshTimer=null}
}
init();
