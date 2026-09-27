import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '/supabase-config.js';

const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
let session=null, plans=[], profile=null, selectedPlan=null;

const money=(n,c)=>new Intl.NumberFormat('en-US',{style:'currency',currency:c}).format(Number(n));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const status=(el,msg,error=false)=>{el.textContent=msg||'';el.classList.toggle('error',error)};
const fmtDate=v=>v?new Intl.DateTimeFormat('en',{dateStyle:'medium'}).format(new Date(v+'T12:00:00')):'—';

async function loadPlans(){
  const {data,error}=await supabase.from('membership_plans').select('*').eq('is_active',true).order('sort_order');
  if(error){$('#plans').innerHTML='<p class="muted">Plans are temporarily unavailable.</p>';return}
  plans=data||[];
  $('#plans').innerHTML=plans.map(p=>`<article class="plan">
    <span class="eyebrow">${p.billing_months===1?'MONTHLY':p.billing_months+' MONTH PREPAID'}</span>
    <h3>${esc(p.name)}</h3>
    <div class="price">${money(p.amount,p.currency)} <small>/ ${p.billing_months===1?'month':p.billing_months+' months'}</small></div>
    <p>${esc(p.description)}</p>
    <button data-plan="${p.id}">Request membership</button>
  </article>`).join('')||'<p class="muted">No active plans.</p>';
  document.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>openRequest(b.dataset.plan));
}

async function refreshSession(){
  const {data:{session:s}}=await supabase.auth.getSession();session=s;
  const logged=!!session;
  $('#loginForm').hidden=logged;$('#sessionBox').hidden=!logged;$('#profilePanel').hidden=!logged;$('#dashboardPanel').hidden=!logged;
  if(!logged){profile=null;return}
  $('#sessionEmail').textContent=session.user.email;
  await loadProfile();await Promise.all([loadOrders(),loadSubscriptions(),loadAccess()]);
}

async function loadProfile(){
  const {data,error}=await supabase.from('membership_customers').select('*').eq('user_id',session.user.id).maybeSingle();
  if(error){status($('#profileStatus'),error.message,true);return}
  profile=data;
  $('#fullName').value=data?.full_name||'';
  $('#clientType').value=data?.client_type||'professional';
  $('#businessName').value=data?.business_name||'';
  $('#country').value=data?.country||'';
}

async function loadOrders(){
  const {data,error}=await supabase.from('membership_orders').select('*,membership_plans(name)').order('created_at',{ascending:false});
  if(error){$('#orders').innerHTML='<p class="muted">Could not load payment requests.</p>';return}
  $('#orders').innerHTML=(data||[]).map(o=>`<article class="record">
    <div class="record-top"><div><h4>${esc(o.membership_plans?.name||'Membership')}</h4><p>${money(o.amount,o.currency)} · ${o.billing_months} month${o.billing_months>1?'s':''}</p></div><span class="badge ${o.status}">${esc(o.status.replaceAll('_',' '))}</span></div>
    <p>Requested start: ${fmtDate(o.requested_start_date)}</p>
    ${o.status==='awaiting_request'?'<p>We have your request. A Payoneer billing request will be sent separately.</p>':''}
    ${o.payoneer_request_url?`<a class="pay-link" href="${esc(o.payoneer_request_url)}" target="_blank" rel="noopener">Open Payoneer request</a>`:''}
  </article>`).join('')||'<p class="muted">No payment requests yet.</p>';
}

async function loadSubscriptions(){
  const {data,error}=await supabase.from('membership_subscriptions').select('*,membership_plans(name)').order('current_period_end',{ascending:false});
  if(error){$('#subscriptions').innerHTML='<p class="muted">Could not load memberships.</p>';return}
  $('#subscriptions').innerHTML=(data||[]).map(s=>`<article class="record"><div class="record-top"><div><h4>${esc(s.membership_plans?.name||'Membership')}</h4><p>${fmtDate(s.current_period_start)} → ${fmtDate(s.current_period_end)}</p></div><span class="badge ${s.status}">${esc(s.status)}</span></div><p>Next billing target: ${fmtDate(s.next_payment_due)}</p></article>`).join('')||'<p class="muted">No active membership yet.</p>';
}

async function loadAccess(){
  const {data,error}=await supabase.from('membership_access').select('*').order('created_at',{ascending:false});
  if(error){$('#access').innerHTML='<p class="muted">Could not load access records.</p>';return}
  $('#access').innerHTML=(data||[]).map(a=>`<article class="record"><div class="record-top"><div><h4>${esc(a.period_label)}</h4><p>${esc(a.note||'Membership delivery')}</p></div></div>
    ${a.cults_code?`<p><strong>Cults code:</strong> <code>${esc(a.cults_code)}</code></p>`:''}
    ${a.cults_url?`<a class="download-link" href="${esc(a.cults_url)}" target="_blank" rel="noopener">Open Cults</a>`:''}
    ${a.download_url?`<a class="download-link" href="${esc(a.download_url)}" target="_blank" rel="noopener">Download files</a>`:''}
  </article>`).join('')||'<p class="muted">Your delivery codes and download links will appear here after activation.</p>';
}

function openRequest(id){
  if(!session){status($('#authStatus'),'Verify your email first.',true);$('#authPanel').scrollIntoView({behavior:'smooth'});return}
  if(!profile?.full_name){status($('#profileStatus'),'Save your billing profile before requesting a membership.',true);$('#profilePanel').scrollIntoView({behavior:'smooth'});return}
  selectedPlan=plans.find(p=>p.id===id);if(!selectedPlan)return;
  $('#dialogPlanName').textContent=selectedPlan.name;
  $('#dialogTerm').textContent=selectedPlan.billing_months===1?'1 month':selectedPlan.billing_months+' months';
  $('#dialogAmount').textContent=money(selectedPlan.amount,selectedPlan.currency);
  $('#requestedStartDate').value=new Date().toISOString().slice(0,10);
  status($('#requestStatus'),'');
  $('#requestDialog').showModal();
}

$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();const email=$('#loginEmail').value.trim();
  status($('#authStatus'),'Sending secure sign-in link…');
  const redirectTo=location.origin+'/membership/';
  const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo}});
  status($('#authStatus'),error?error.message:'Check your email for the sign-in link.',!!error);
});
$('#signOutButton').onclick=async()=>{await supabase.auth.signOut();location.reload()};
$('#profileForm').addEventListener('submit',async e=>{
  e.preventDefault();status($('#profileStatus'),'Saving…');
  const row={user_id:session.user.id,email:session.user.email,full_name:$('#fullName').value.trim(),client_type:$('#clientType').value,business_name:$('#businessName').value.trim()||null,country:$('#country').value.trim()||null};
  const {error}=await supabase.from('membership_customers').upsert(row,{onConflict:'user_id'});
  if(error){status($('#profileStatus'),error.message,true);return}
  status($('#profileStatus'),'Billing profile saved.');await loadProfile();
});
$('#requestForm').addEventListener('submit',async e=>{
  e.preventDefault();if(!selectedPlan)return;
  status($('#requestStatus'),'Creating request…');
  const {error}=await supabase.from('membership_orders').insert({user_id:session.user.id,plan_id:selectedPlan.id,requested_start_date:$('#requestedStartDate').value});
  if(error){status($('#requestStatus'),error.message,true);return}
  status($('#requestStatus'),'Request created. We will send the Payoneer request separately.');
  setTimeout(()=>$('#requestDialog').close(),900);await loadOrders();
});
$('#refreshButton').onclick=async()=>{await loadPlans();if(session)await Promise.all([loadOrders(),loadSubscriptions(),loadAccess()])};
supabase.auth.onAuthStateChange(()=>setTimeout(refreshSession,0));
await loadPlans();await refreshSession();
