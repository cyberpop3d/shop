import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '/supabase-config.js';

const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=(n,c)=>new Intl.NumberFormat('en-US',{style:'currency',currency:c}).format(Number(n));
const fmt=v=>v?new Intl.DateTimeFormat('en',{dateStyle:'medium'}).format(new Date(v+'T12:00:00')):'—';
const setStatus=(el,msg,error=false)=>{el.textContent=msg||'';el.classList.toggle('error',error)};
let session=null,subscriptions=[],plans=[];

async function ensureAdmin(){
  const {data:{session:s}}=await supabase.auth.getSession();session=s;
  if(!s){$('#loginPanel').hidden=false;$('#adminApp').hidden=true;return false}
  const {data,error}=await supabase.from('sales_admin_users').select('user_id').eq('user_id',s.user.id).maybeSingle();
  if(error||!data){$('#loginPanel').hidden=false;$('#adminApp').hidden=true;setStatus($('#loginStatus'),'This account is not authorized for membership admin.',true);return false}
  $('#loginPanel').hidden=true;$('#adminApp').hidden=false;return true;
}

async function loadAll(){
  const [ordersRes,subsRes,plansRes]=await Promise.all([
    supabase.from('membership_orders').select('*,membership_plans(name),membership_customers!membership_orders_customer_fkey(full_name,email,business_name)').order('created_at',{ascending:false}),
    supabase.from('membership_subscriptions').select('*,membership_plans(name),membership_customers!membership_subscriptions_customer_fkey(full_name,email,business_name)').order('next_payment_due',{ascending:true}),
    supabase.from('membership_plans').select('*').order('sort_order')
  ]);
  if(ordersRes.error) console.error(ordersRes.error);
  if(subsRes.error) console.error(subsRes.error);
  if(plansRes.error) console.error(plansRes.error);
  subscriptions=subsRes.data||[];plans=plansRes.data||[];
  renderStats(ordersRes.data||[],subscriptions);
  renderOrders(ordersRes.data||[]);
  renderSubscriptions(subscriptions);
  renderPlans(plans);
  renderAccessSelect(subscriptions);
}

function renderStats(orders,subs){
  const pending=orders.filter(o=>o.status==='awaiting_request').length;
  const sent=orders.filter(o=>o.status==='request_sent').length;
  const active=subs.filter(s=>s.status==='active').length;
  const due=subs.filter(s=>s.status==='active'&&s.next_payment_due&&new Date(s.next_payment_due+'T00:00:00')<=new Date(Date.now()+7*86400000)).length;
  $('#stats').innerHTML=[
    ['Awaiting Payoneer',pending],['Request sent',sent],['Active members',active],['Due ≤ 7 days',due]
  ].map(x=>`<div class="stat"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');
}

function renderOrders(rows){
  $('#orders').innerHTML=rows.map(o=>{
    const client=o.membership_customers||{};
    return `<article class="record">
      <div class="record-top">
        <div><h3>${esc(client.full_name||o.full_name_snapshot)}</h3><p>${esc(client.email||o.email_snapshot)} ${client.business_name?'· '+esc(client.business_name):''}</p><p><strong>${esc(o.membership_plans?.name||'Membership')}</strong> · ${money(o.amount,o.currency)} · ${o.billing_months} month${o.billing_months>1?'s':''}</p><p>${esc(o.service_description)}</p></div>
        <span class="badge ${o.status}">${esc(o.status.replaceAll('_',' '))}</span>
      </div>
      <div class="controls">
        <input data-url="${o.id}" type="url" placeholder="Payoneer request URL" value="${esc(o.payoneer_request_url||'')}">
        <input data-ref="${o.id}" placeholder="Payoneer reference" value="${esc(o.payoneer_request_id||'')}">
        <button data-sent="${o.id}" ${o.status==='paid'?'disabled':''}>Request sent</button>
        <button data-paid="${o.id}" ${o.status==='paid'?'disabled':''}>Mark paid</button>
      </div>
      <p class="muted">Requested start: ${fmt(o.requested_start_date)} ${o.paid_at?'· Paid '+new Date(o.paid_at).toLocaleString():''}</p>
    </article>`;
  }).join('')||'<p class="muted">No membership requests.</p>';
  document.querySelectorAll('[data-sent]').forEach(b=>b.onclick=()=>markSent(b.dataset.sent));
  document.querySelectorAll('[data-paid]').forEach(b=>b.onclick=()=>markPaid(b.dataset.paid));
}

async function markSent(id){
  const url=document.querySelector(`[data-url="${id}"]`).value.trim();
  const ref=document.querySelector(`[data-ref="${id}"]`).value.trim();
  const {error}=await supabase.from('membership_orders').update({
    status:'request_sent',payoneer_request_url:url||null,payoneer_request_id:ref||null,payoneer_sent_at:new Date().toISOString()
  }).eq('id',id);
  if(error){alert(error.message);return}await loadAll();
}

async function markPaid(id){
  const ref=document.querySelector(`[data-ref="${id}"]`).value.trim();
  const {error}=await supabase.rpc('admin_activate_membership',{p_order_id:id,p_payoneer_reference:ref||null});
  if(error){alert(error.message);return}await loadAll();
}

function renderSubscriptions(rows){
  $('#subscriptions').innerHTML=rows.map(s=>{
    const c=s.membership_customers||{};
    const overdue=s.next_payment_due&&new Date(s.next_payment_due+'T00:00:00')<new Date();
    return `<article class="record">
      <div class="record-top"><div><h3>${esc(c.full_name||c.email||'Member')}</h3><p>${esc(s.membership_plans?.name||'Membership')} · ${fmt(s.current_period_start)} → ${fmt(s.current_period_end)}</p><p>${esc(c.email||'')}</p></div><span class="badge ${s.status}">${overdue?'due / ':''}${esc(s.status)}</span></div>
      <div class="controls">
        <span class="muted">Next due: ${fmt(s.next_payment_due)}</span>
        <span></span>
        <button data-renew="${s.id}">Create renewal</button>
        <button data-cancel="${s.id}" class="ghost">Cancel</button>
      </div>
    </article>`;
  }).join('')||'<p class="muted">No active memberships.</p>';
  document.querySelectorAll('[data-renew]').forEach(b=>b.onclick=()=>createRenewal(b.dataset.renew));
  document.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=()=>cancelSub(b.dataset.cancel));
}

async function createRenewal(id){
  const s=subscriptions.find(x=>x.id===id);if(!s)return;
  const {error}=await supabase.from('membership_orders').insert({user_id:s.user_id,plan_id:s.plan_id,subscription_id:s.id,requested_start_date:s.current_period_end,status:'awaiting_request'});
  if(error){alert(error.message);return}await loadAll();
}
async function cancelSub(id){
  if(!confirm('Mark this membership canceled?'))return;
  const {error}=await supabase.from('membership_subscriptions').update({status:'canceled',next_payment_due:null}).eq('id',id);
  if(error){alert(error.message);return}await loadAll();
}

function renderAccessSelect(rows){
  $('#accessSubscription').innerHTML=rows.filter(s=>s.status==='active').map(s=>{
    const c=s.membership_customers||{};
    return `<option value="${s.id}" data-user="${s.user_id}">${esc(c.full_name||c.email||s.user_id)} — ${esc(s.membership_plans?.name||'Membership')}</option>`;
  }).join('');
}

$('#accessForm').addEventListener('submit',async e=>{
  e.preventDefault();const opt=$('#accessSubscription').selectedOptions[0];
  if(!opt){setStatus($('#accessStatus'),'No active subscription selected.',true);return}
  setStatus($('#accessStatus'),'Saving…');
  const row={subscription_id:opt.value,user_id:opt.dataset.user,period_label:$('#accessPeriod').value.trim(),cults_code:$('#accessCode').value.trim()||null,cults_url:$('#accessCultsUrl').value.trim()||null,download_url:$('#accessDownloadUrl').value.trim()||null,note:$('#accessNote').value.trim()||null};
  const {error}=await supabase.from('membership_access').upsert(row,{onConflict:'subscription_id,period_label'});
  if(error){setStatus($('#accessStatus'),error.message,true);return}
  setStatus($('#accessStatus'),'Access saved.');$('#accessForm').reset();renderAccessSelect(subscriptions);
});

function renderPlans(rows){
  $('#plans').innerHTML=rows.map(p=>`<article class="record plan-edit">
    <label>Name<input data-name="${p.id}" value="${esc(p.name)}"></label>
    <label>Price<input data-amount="${p.id}" type="number" min="0" step=".01" value="${p.amount}"></label>
    <label>Months<select data-months="${p.id}">${[1,3,6,12].map(m=>`<option value="${m}" ${m===p.billing_months?'selected':''}>${m}</option>`).join('')}</select></label>
    <label>Active<select data-active="${p.id}"><option value="true" ${p.is_active?'selected':''}>Yes</option><option value="false" ${!p.is_active?'selected':''}>No</option></select></label>
    <button data-save-plan="${p.id}">Save</button>
  </article>`).join('');
  document.querySelectorAll('[data-save-plan]').forEach(b=>b.onclick=()=>savePlan(b.dataset.savePlan));
}
async function savePlan(id){
  const patch={name:document.querySelector(`[data-name="${id}"]`).value.trim(),amount:Number(document.querySelector(`[data-amount="${id}"]`).value),billing_months:Number(document.querySelector(`[data-months="${id}"]`).value),is_active:document.querySelector(`[data-active="${id}"]`).value==='true'};
  const {error}=await supabase.from('membership_plans').update(patch).eq('id',id);
  if(error){alert(error.message);return}await loadAll();
}

$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();setStatus($('#loginStatus'),'Sending sign-in link…');
  const {error}=await supabase.auth.signInWithOtp({email:$('#loginEmail').value.trim(),options:{emailRedirectTo:location.origin+'/admin/memberships.html'}});
  setStatus($('#loginStatus'),error?error.message:'Check your email for the admin sign-in link.',!!error);
});
$('#refresh').onclick=loadAll;
supabase.auth.onAuthStateChange(()=>setTimeout(init,0));
async function init(){if(await ensureAdmin())await loadAll()}
await init();
