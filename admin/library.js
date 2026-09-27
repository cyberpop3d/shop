import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.1';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '/supabase-config.js';

const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
let session=null,collections=[],products=[],privateRows=[],customers=[],entitlements=[],subscriptions=[],codes=[],plans=[];

$('#collectionMonth').innerHTML=monthNames.map((m,i)=>'<option value="'+(i+1)+'">'+m+'</option>').join('');
$('#collectionMonth').value='10';

function setText(sel,msg){$(sel).textContent=msg||''}
function firstDay(ym){return ym+'-01'}
function addMonths(dateStr,n){const d=new Date(dateStr+'T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+n);return d.toISOString().slice(0,10)}
function customerName(id){const c=customers.find(x=>x.user_id===id);return c?(c.full_name||c.email):id}
function collectionName(id){const c=collections.find(x=>x.id===id);return c?c.display_name:id}

async function ensureAdmin(){
  const auth=await supabase.auth.getSession();session=auth.data.session;
  if(!session){$('#loginPanel').hidden=false;$('#adminApp').hidden=true;return false}
  const check=await supabase.from('sales_admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(check.error||!check.data){$('#loginPanel').hidden=false;$('#adminApp').hidden=true;setText('#loginStatus','This account is not authorized for admin.');return false}
  $('#loginPanel').hidden=true;$('#adminApp').hidden=false;return true;
}

async function loadAll(){
  const res=await Promise.all([
    supabase.from('membership_collections').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_products').select('*').order('collection_id').order('product_number'),
    supabase.from('membership_product_private').select('*'),
    supabase.from('membership_customers').select('*').order('full_name'),
    supabase.from('membership_entitlements').select('*'),
    supabase.from('membership_subscriptions').select('*,membership_plans(name,plan_type)'),
    supabase.from('membership_collection_codes').select('*'),
    supabase.from('membership_plans').select('*').order('sort_order')
  ]);
  const err=res.find(x=>x.error);if(err)throw err.error;
  collections=res[0].data||[];products=res[1].data||[];privateRows=res[2].data||[];customers=res[3].data||[];
  entitlements=res[4].data||[];subscriptions=res[5].data||[];codes=res[6].data||[];plans=res[7].data||[];
  renderAll();
}

function renderAll(){
  renderStats();renderCollections();renderProducts();renderSelects();renderPlans();
}
function renderStats(){
  const included=products.filter(p=>p.is_included&&p.is_published).length;
  const monthly=entitlements.filter(e=>e.status==='active').length;
  const annual=subscriptions.filter(s=>s.status==='active'&&s.membership_plans&&s.membership_plans.plan_type==='annual').length;
  $('#stats').innerHTML=[
    ['COLLECTION MONTHS',collections.length],['INCLUDED MODELS',included],['MONTH GRANTS',monthly],['ANNUAL MEMBERS',annual]
  ].map(x=>'<div class="stat"><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>').join('');
}
function renderCollections(){
  $('#collections').innerHTML=collections.map(c=>{
    return '<article class="record"><div class="record-head"><div><h3>'+esc(c.display_name)+'</h3><p>'+esc(c.slug)+' · starts '+esc(c.starts_on)+'</p></div><span class="badge '+(c.is_published?'on':'')+'">'+(c.is_published?'PUBLISHED':'DRAFT')+'</span></div>'+
      '<div class="actions"><button data-publish-collection="'+c.id+'" class="secondary">'+(c.is_published?'Make draft':'Publish')+'</button></div></article>';
  }).join('')||'<p class="small">No collections.</p>';
  document.querySelectorAll('[data-publish-collection]').forEach(b=>b.onclick=()=>toggleCollection(b.dataset.publishCollection));
}
function renderProducts(){
  $('#products').innerHTML=products.map(p=>{
    const priv=privateRows.find(x=>x.product_id===p.id);
    return '<article class="record"><div class="record-head"><div><h3>'+esc(p.public_title)+'</h3><p>Admin name: <strong>'+esc(priv?priv.internal_name:'—')+'</strong> · '+esc(collectionName(p.collection_id))+'</p></div>'+
      '<div><span class="badge '+(p.is_included?'on':'')+'">'+(p.is_included?'INCLUDED':'EXCLUDED')+'</span> <span class="badge '+(p.is_published?'on':'')+'">'+(p.is_published?'VISIBLE':'HIDDEN')+'</span></div></div>'+
      '<div class="actions"><button data-toggle-included="'+p.id+'">'+(p.is_included?'Exclude from membership':'Include in membership')+'</button><button data-toggle-published="'+p.id+'" class="secondary">'+(p.is_published?'Hide product':'Show product')+'</button></div></article>';
  }).join('')||'<p class="small">No models added yet.</p>';
  document.querySelectorAll('[data-toggle-included]').forEach(b=>b.onclick=()=>toggleProduct(b.dataset.toggleIncluded,'is_included'));
  document.querySelectorAll('[data-toggle-published]').forEach(b=>b.onclick=()=>toggleProduct(b.dataset.togglePublished,'is_published'));
}
function optionRows(list,valueFn,labelFn){return list.map(x=>'<option value="'+esc(valueFn(x))+'">'+esc(labelFn(x))+'</option>').join('')}
function renderSelects(){
  const collectionOptions=optionRows(collections,x=>x.id,x=>x.display_name);
  ['#productCollection','#monthlyCollection','#codeCollection'].forEach(s=>$(s).innerHTML=collectionOptions);
  const customerOptions=optionRows(customers,x=>x.user_id,x=>(x.full_name||x.email)+' · '+x.email);
  ['#monthlyCustomer','#annualCustomer','#codeCustomer'].forEach(s=>$(s).innerHTML=customerOptions);
}
function renderPlans(){
  const rows=plans.filter(p=>p.plan_type==='monthly'||p.plan_type==='annual');
  $('#plans').innerHTML=rows.map(p=>'<article class="record plan-edit">'+
    '<label>Name<input data-plan-name="'+p.id+'" value="'+esc(p.name)+'"></label>'+
    '<label>Type<input value="'+esc(p.plan_type)+'" disabled></label>'+
    '<label>Price<input data-plan-amount="'+p.id+'" type="number" min="0" step=".01" value="'+Number(p.amount)+'"></label>'+
    '<label>Active<select data-plan-active="'+p.id+'"><option value="true" '+(p.is_active?'selected':'')+'>Yes</option><option value="false" '+(!p.is_active?'selected':'')+'>No</option></select></label>'+
    '<button data-save-plan="'+p.id+'">Save</button></article>').join('');
  document.querySelectorAll('[data-save-plan]').forEach(b=>b.onclick=()=>savePlan(b.dataset.savePlan));
}

async function toggleCollection(id){
  const c=collections.find(x=>x.id===id);if(!c)return;
  const r=await supabase.from('membership_collections').update({is_published:!c.is_published}).eq('id',id);
  if(r.error)return alert(r.error.message);await loadAll();
}
async function toggleProduct(id,field){
  const p=products.find(x=>x.id===id);if(!p)return;
  const patch={};patch[field]=!p[field];
  const r=await supabase.from('membership_products').update(patch).eq('id',id);
  if(r.error)return alert(r.error.message);await loadAll();
}

$('#collectionForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const year=Number($('#collectionYear').value),month=Number($('#collectionMonth').value);
  const mm=String(month).padStart(2,'0'),starts=year+'-'+mm+'-01';
  const row={year,month,slug:year+'-'+mm,display_name:monthNames[month-1]+' '+year,starts_on:starts,is_published:$('#collectionPublished').value==='true'};
  const r=await supabase.from('membership_collections').insert(row);
  if(r.error)return alert(r.error.message);await loadAll();
});

$('#productForm').addEventListener('submit',async e=>{
  e.preventDefault();setText('#productStatus','Adding product…');
  const row={collection_id:$('#productCollection').value,product_number:Number($('#productNumber').value),thumbnail_url:$('#productThumbnail').value.trim()||null,cults_url:$('#productCultsUrl').value.trim()||null,is_included:true,is_published:true,sort_order:Number($('#productNumber').value)};
  const p=await supabase.from('membership_products').insert(row).select('id').single();
  if(p.error){setText('#productStatus',p.error.message);return}
  const priv=await supabase.from('membership_product_private').insert({product_id:p.data.id,internal_name:$('#productInternalName').value.trim(),admin_note:$('#productNote').value.trim()||null});
  if(priv.error){await supabase.from('membership_products').delete().eq('id',p.data.id);setText('#productStatus',priv.error.message);return}
  e.target.reset();setText('#productStatus','Product added and included by default.');await loadAll();
});

$('#monthlyAccessForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const row={user_id:$('#monthlyCustomer').value,collection_id:$('#monthlyCollection').value,source_kind:'manual',status:'active',revoked_at:null,granted_at:new Date().toISOString()};
  const r=await supabase.from('membership_entitlements').upsert(row,{onConflict:'user_id,collection_id'});
  setText('#accessStatus',r.error?r.error.message:'Monthly access granted.');if(!r.error)await loadAll();
});
$('#revokeMonthly').onclick=async()=>{
  const r=await supabase.from('membership_entitlements').upsert({user_id:$('#monthlyCustomer').value,collection_id:$('#monthlyCollection').value,source_kind:'manual',status:'revoked',revoked_at:new Date().toISOString()},{onConflict:'user_id,collection_id'});
  setText('#accessStatus',r.error?r.error.message:'Monthly access revoked.');if(!r.error)await loadAll();
};

$('#annualAccessForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const plan=plans.find(p=>p.plan_type==='annual');if(!plan){setText('#accessStatus','Annual plan is missing.');return}
  const start=firstDay($('#annualStart').value),end=addMonths(start,12);
  const row={user_id:$('#annualCustomer').value,plan_id:plan.id,status:'active',billing_months:12,current_period_start:start,current_period_end:end,next_payment_due:end,auto_renew:true,cancel_at_period_end:false};
  const r=await supabase.from('membership_subscriptions').upsert(row,{onConflict:'user_id,plan_id'});
  setText('#accessStatus',r.error?r.error.message:'Annual access granted for 12 collection months.');if(!r.error)await loadAll();
});
$('#revokeAnnual').onclick=async()=>{
  const plan=plans.find(p=>p.plan_type==='annual');if(!plan)return;
  const r=await supabase.from('membership_subscriptions').update({status:'canceled',auto_renew:false,next_payment_due:null}).eq('user_id',$('#annualCustomer').value).eq('plan_id',plan.id);
  setText('#accessStatus',r.error?r.error.message:'Annual access revoked.');if(!r.error)await loadAll();
};

$('#codeForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const row={user_id:$('#codeCustomer').value,collection_id:$('#codeCollection').value,cults_code:$('#cultsCode').value.trim()||null,cults_url:$('#cultsUrl').value.trim()||null,note:$('#codeNote').value.trim()||null,is_active:true};
  const r=await supabase.from('membership_collection_codes').upsert(row,{onConflict:'user_id,collection_id'});
  setText('#codeStatus',r.error?r.error.message:'Collection code saved.');if(!r.error){e.target.reset();await loadAll()}
});

async function savePlan(id){
  const patch={name:document.querySelector('[data-plan-name="'+id+'"]').value.trim(),amount:Number(document.querySelector('[data-plan-amount="'+id+'"]').value),is_active:document.querySelector('[data-plan-active="'+id+'"]').value==='true'};
  const r=await supabase.from('membership_plans').update(patch).eq('id',id);
  if(r.error)return alert(r.error.message);await loadAll();
}

$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();setText('#loginStatus','Sending sign-in link…');
  const r=await supabase.auth.signInWithOtp({email:$('#loginEmail').value.trim(),options:{emailRedirectTo:location.origin+'/admin/library.html'}});
  setText('#loginStatus',r.error?r.error.message:'Check your email for the admin sign-in link.');
});
$('#refresh').onclick=loadAll;
supabase.auth.onAuthStateChange(()=>setTimeout(init,0));
async function init(){if(await ensureAdmin())loadAll().catch(e=>alert(e.message))}
init();
