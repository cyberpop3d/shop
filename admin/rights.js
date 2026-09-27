import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.1';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '/supabase-config.js';
const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let session=null,reports=[],blocklist=[],legalDocs=[],audit=[],customers=[],sellerLicenses=[];

function setText(sel,msg){$(sel).textContent=msg||''}
function notify(msg,type='success'){const t=$('#adminToast');t.textContent=msg;t.className='toast '+(type==='error'?'error ':'')+'show';clearTimeout(notify._t);notify._t=setTimeout(()=>t.className='toast',2600)}
function setSync(msg){$('#syncState').textContent=msg||'Ready'}
function isAdmin(){return supabase.from('sales_admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle()}

async function ensureAdmin(){
  const a=await supabase.auth.getSession();session=a.data.session;
  if(!session){$('#loginPanel').hidden=false;$('#adminApp').hidden=true;return false}
  const check=await isAdmin();
  if(check.error||!check.data){$('#loginPanel').hidden=false;$('#adminApp').hidden=true;setText('#loginStatus','This account is not authorized for admin.');return false}
  $('#loginPanel').hidden=true;$('#adminApp').hidden=false;return true;
}
async function loadAll(){
  setSync('Syncing…');
  const res=await Promise.all([
    supabase.from('rights_reports').select('*').order('created_at',{ascending:false}),
    supabase.from('ip_property_blocklist').select('*').order('created_at',{ascending:false}),
    supabase.from('legal_documents').select('*').order('document_type').order('created_at',{ascending:false}),
    supabase.from('legal_admin_audit').select('*').order('created_at',{ascending:false}).limit(80),
    supabase.from('membership_customers').select('user_id,email,full_name').order('email'),
    supabase.from('seller_licenses').select('*').order('created_at',{ascending:false})
  ]);
  const err=res.find(x=>x.error);if(err)throw err.error;
  reports=res[0].data||[];blocklist=res[1].data||[];legalDocs=res[2].data||[];audit=res[3].data||[];customers=res[4].data||[];sellerLicenses=res[5].data||[];
  render();setSync('Synced');
}
function render(){
  $('#rightsStats').innerHTML=[
    ['OPEN REPORTS',reports.filter(r=>!['closed','rejected'].includes(r.status)).length],
    ['VERIFIED',reports.filter(r=>r.status==='verified').length],
    ['BLOCKED PROPERTIES',blocklist.filter(b=>b.is_active).length],
    ['ACTIVE SELLERS',sellerLicenses.filter(s=>s.status==='active').length]
  ].map(x=>'<div class="stat"><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>').join('');
  renderReports();renderBlocklist();renderLegal();renderSellerLicenses();renderAudit();renderReportOptions();
}
function renderReportOptions(){
  $('#blockSourceReport').innerHTML='<option value="">No linked report</option>'+reports.map(r=>'<option value="'+r.id+'">'+esc(r.report_type)+' · '+esc(r.relevant_ip||r.contact_email)+'</option>').join('');
}
function renderReports(){
  $('#rightsReports').innerHTML=reports.length?reports.map(r=>
    '<article class="record"><div class="record-head"><div><h3>'+esc(r.report_type.replaceAll('_',' ').toUpperCase())+'</h3><p>'+esc(r.reporter_name)+(r.company?' · '+esc(r.company):'')+' · '+esc(r.contact_email)+'</p></div><span class="badge '+(['verified','actioned'].includes(r.status)?'on':'warn')+'">'+esc(r.status)+'</span></div>'+
    '<p><strong>Relevant IP:</strong> '+esc(r.relevant_ip||'—')+'</p>'+
    '<p>'+esc(r.explanation)+'</p>'+
    '<div class="report-links">'+(r.cyberpop_url?'<a href="'+esc(r.cyberpop_url)+'" target="_blank">CyberPop URL ↗</a>':'')+(r.external_url?'<a href="'+esc(r.external_url)+'" target="_blank">Evidence ↗</a>':'')+'</div>'+
    '<div class="rights-admin-grid"><label>Status<select data-report-status="'+r.id+'">'+['submitted','reviewing','verified','actioned','rejected','closed'].map(s=>'<option value="'+s+'" '+(r.status===s?'selected':'')+'>'+s+'</option>').join('')+'</select></label>'+
    '<label>Admin note<input data-report-note="'+r.id+'" value="'+esc(r.admin_note||'')+'"></label></div>'+
    '<div class="actions"><button data-save-report="'+r.id+'">Save review</button>'+(r.relevant_ip?'<button class="danger" data-block-report="'+r.id+'">Block property</button>':'')+'</div></article>'
  ).join(''):'<p class="small">No reports submitted.</p>';
  document.querySelectorAll('[data-save-report]').forEach(b=>b.onclick=()=>saveReport(b.dataset.saveReport));
  document.querySelectorAll('[data-block-report]').forEach(b=>b.onclick=()=>blockFromReport(b.dataset.blockReport));
}
async function saveReport(id){
  const status=document.querySelector('[data-report-status="'+id+'"]').value;
  const note=document.querySelector('[data-report-note="'+id+'"]').value.trim()||null;
  const r=await supabase.from('rights_reports').update({status,admin_note:note,updated_at:new Date().toISOString()}).eq('id',id);
  if(r.error)return notify(r.error.message,'error');
  await supabase.from('legal_admin_audit').insert({admin_user_id:session.user.id,action_type:'UPDATE_RIGHTS_REPORT',target_type:'rights_report',target_id:id,details:{status,note}});
  notify('Report review updated.');await loadAll();
}
async function blockFromReport(id){
  const r=reports.find(x=>x.id===id);if(!r)return;
  if(!confirm('Block "'+(r.relevant_ip||'this property')+'" and suspend matching products?'))return;
  const key=(r.relevant_ip||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const q=await supabase.rpc('admin_block_ip_property',{p_property_key:key,p_display_label:r.relevant_ip,p_reason:'Verified rights report '+id,p_source_report_id:id});
  if(q.error)return notify(q.error.message,'error');
  await supabase.from('rights_reports').update({status:'actioned',updated_at:new Date().toISOString()}).eq('id',id);
  notify('Property blocked and matching products suspended.');await loadAll();
}
function renderBlocklist(){
  $('#blocklist').innerHTML=blocklist.length?blocklist.map(b=>'<article class="record"><div class="record-head"><div><h3>'+esc(b.display_label)+'</h3><p>'+esc(b.property_key)+' · '+esc(b.reason||'No reason recorded')+'</p></div><span class="badge '+(b.is_active?'warn':'')+'">'+(b.is_active?'DO NOT PUBLISH':'INACTIVE')+'</span></div><div class="actions"><button class="secondary" data-toggle-block="'+b.id+'">'+(b.is_active?'Deactivate block':'Reactivate block')+'</button></div></article>').join(''):'<p class="small">No blocked properties.</p>';
  document.querySelectorAll('[data-toggle-block]').forEach(b=>b.onclick=()=>toggleBlock(b.dataset.toggleBlock));
}
async function toggleBlock(id){
  const row=blocklist.find(x=>x.id===id);if(!row)return;
  const r=await supabase.from('ip_property_blocklist').update({is_active:!row.is_active}).eq('id',id);
  if(r.error)return notify(r.error.message,'error');
  await supabase.from('legal_admin_audit').insert({admin_user_id:session.user.id,action_type:row.is_active?'DEACTIVATE_PROPERTY_BLOCK':'REACTIVATE_PROPERTY_BLOCK',target_type:'ip_property',target_id:id,details:{property_key:row.property_key}});
  notify('Blocklist updated.');await loadAll();
}
function renderLegal(){
  $('#legalDocuments').innerHTML=legalDocs.map(d=>
    '<article class="record"><div class="record-head"><div><h3>'+esc(d.title)+' · '+esc(d.version)+'</h3><p>'+esc(d.document_type)+' · '+esc(d.public_path)+'</p></div><div><span class="badge '+(d.is_current?'on':d.status==='draft'?'warn':'')+'">'+esc(d.status)+(d.is_current?' · CURRENT':'')+'</span></div></div>'+
    '<div class="rights-admin-grid"><label>Title<input data-legal-title="'+d.id+'" value="'+esc(d.title)+'"></label><label>Public path<input data-legal-path="'+d.id+'" value="'+esc(d.public_path)+'"></label>'+
    '<label>Reaccept<select data-legal-reaccept="'+d.id+'"><option value="false" '+(!d.requires_reacceptance?'selected':'')+'>No</option><option value="true" '+(d.requires_reacceptance?'selected':'')+'>Yes</option></select></label>'+
    '<label>Account required<select data-legal-account="'+d.id+'"><option value="false" '+(!d.required_for_account?'selected':'')+'>No</option><option value="true" '+(d.required_for_account?'selected':'')+'>Yes</option></select></label>'+
    '<label>Purchase required<select data-legal-purchase="'+d.id+'"><option value="false" '+(!d.required_for_purchase?'selected':'')+'>No</option><option value="true" '+(d.required_for_purchase?'selected':'')+'>Yes</option></select></label>'+
    '<label>Download required<select data-legal-download="'+d.id+'"><option value="false" '+(!d.required_for_download?'selected':'')+'>No</option><option value="true" '+(d.required_for_download?'selected':'')+'>Yes</option></select></label></div>'+
    '<label style="margin-top:10px">Markdown content<textarea class="admin-textarea" data-legal-content="'+d.id+'">'+esc(d.content_markdown||'')+'</textarea></label>'+
    '<div class="actions"><button data-save-legal="'+d.id+'">Save '+(d.status==='draft'?'draft':'metadata')+'</button>'+(d.status==='draft'?'<button class="danger" data-publish-legal="'+d.id+'">Publish as current</button>':'')+'<a class="admin-btn secondary" href="'+esc(d.public_path)+'" target="_blank">Preview ↗</a></div></article>'
  ).join('');
  document.querySelectorAll('[data-save-legal]').forEach(b=>b.onclick=()=>saveLegal(b.dataset.saveLegal));
  document.querySelectorAll('[data-publish-legal]').forEach(b=>b.onclick=()=>publishLegal(b.dataset.publishLegal));
}
async function saveLegal(id){
  const patch={
    title:document.querySelector('[data-legal-title="'+id+'"]').value.trim(),
    public_path:document.querySelector('[data-legal-path="'+id+'"]').value.trim(),
    content_markdown:document.querySelector('[data-legal-content="'+id+'"]').value,
    requires_reacceptance:document.querySelector('[data-legal-reaccept="'+id+'"]').value==='true',
    required_for_account:document.querySelector('[data-legal-account="'+id+'"]').value==='true',
    required_for_purchase:document.querySelector('[data-legal-purchase="'+id+'"]').value==='true',
    required_for_download:document.querySelector('[data-legal-download="'+id+'"]').value==='true',
    updated_at:new Date().toISOString()
  };
  const r=await supabase.from('legal_documents').update(patch).eq('id',id);
  if(r.error)return notify(r.error.message,'error');
  notify('Legal version saved.');await loadAll();
}
async function publishLegal(id){
  const d=legalDocs.find(x=>x.id===id);if(!d)return;
  if(!confirm('Publish '+d.title+' '+d.version+' as the CURRENT version? This can create new acceptance requirements.'))return;
  await saveLegal(id);
  const r=await supabase.rpc('admin_publish_legal_document',{p_document_id:id});
  if(r.error)return notify(r.error.message,'error');
  notify('Legal version published as current.');await loadAll();
}
function renderSellerLicenses(){
  $('#sellerUser').innerHTML=customers.map(c=>'<option value="'+c.user_id+'">'+esc(c.email)+(c.full_name?' · '+esc(c.full_name):'')+'</option>').join('');
  const currentSellerTerms=legalDocs.find(d=>d.document_type==='seller_license_terms'&&d.is_current&&d.status==='published');
  if(currentSellerTerms&&!$('#sellerTermsVersion').value)$('#sellerTermsVersion').value=currentSellerTerms.version;
  $('#sellerLicenses').innerHTML=sellerLicenses.length?sellerLicenses.map(s=>{
    const c=customers.find(x=>x.user_id===s.user_id);
    return '<article class="record"><div class="record-head"><div><h3>'+esc(c?.email||s.user_id)+'</h3><p>Terms: '+esc(s.terms_version||'—')+(s.expires_at?' · expires '+esc(s.expires_at):'')+'</p></div><span class="badge '+(s.status==='active'?'on':'warn')+'">'+esc(s.status)+'</span></div><p>'+esc(s.admin_note||'')+'</p></article>';
  }).join(''):'<p class="small">No Seller Licenses configured.</p>';
}
function renderAudit(){
  $('#auditLog').innerHTML=audit.length?audit.map(a=>'<article class="record"><div class="record-head"><div><h3>'+esc(a.action_type)+'</h3><p>'+new Date(a.created_at).toLocaleString()+' · '+esc(a.target_type)+' · '+esc(a.target_id||'—')+'</p></div></div><p>'+esc(JSON.stringify(a.details||{}))+'</p></article>').join(''):'<p class="small">No legal admin actions yet.</p>';
}
$('#blockPropertyForm').addEventListener('submit',async e=>{
  e.preventDefault();setText('#blockStatus','Blocking property…');
  const r=await supabase.rpc('admin_block_ip_property',{
    p_property_key:$('#blockPropertyKey').value.trim(),
    p_display_label:$('#blockPropertyLabel').value.trim(),
    p_reason:$('#blockReason').value.trim(),
    p_source_report_id:$('#blockSourceReport').value||null
  });
  if(r.error){setText('#blockStatus',r.error.message);return}
  e.target.reset();setText('#blockStatus','Property blocked. Matching models moved to legal review.');await loadAll();
});
$('#sellerLicenseForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const status=$('#sellerStatus').value;
  const now=new Date().toISOString();
  const row={
    user_id:$('#sellerUser').value,status,scope:'PHYSICAL_PRINTS_ONLY',
    terms_version:$('#sellerTermsVersion').value.trim()||null,
    activated_at:status==='active'?now:null,
    expires_at:$('#sellerExpires').value||null,
    suspended_at:status==='suspended'?now:null,
    revoked_at:status==='revoked'?now:null,
    admin_note:$('#sellerNote').value.trim()||null,
    updated_at:now
  };
  const r=await supabase.from('seller_licenses').upsert(row,{onConflict:'user_id'});
  if(r.error){setText('#sellerStatusLine',r.error.message);return}
  await supabase.from('legal_admin_audit').insert({
    admin_user_id:session.user.id,action_type:'UPDATE_SELLER_LICENSE',target_type:'user',target_id:row.user_id,
    details:{status:row.status,terms_version:row.terms_version,expires_at:row.expires_at}
  });
  setText('#sellerStatusLine','Seller License updated.');notify('Seller License updated.');await loadAll();
});

$('#newLegalForm').addEventListener('submit',async e=>{
  e.preventDefault();setText('#legalCreateStatus','Creating draft…');
  const row={
    document_type:$('#legalType').value,version:$('#legalVersion').value.trim(),title:$('#legalTitleInput').value.trim(),
    public_path:$('#legalPath').value.trim(),content_markdown:$('#legalContentInput').value,status:'draft',is_current:false,
    requires_reacceptance:$('#legalReaccept').value==='true',required_for_account:$('#legalAccountRequired').value==='true',
    required_for_purchase:$('#legalPurchaseRequired').value==='true',required_for_download:$('#legalDownloadRequired').value==='true',
    created_by:session.user.id
  };
  const r=await supabase.from('legal_documents').insert(row);
  if(r.error){setText('#legalCreateStatus',r.error.message);return}
  e.target.reset();setText('#legalCreateStatus','Draft version created.');notify('Legal draft created.');await loadAll();
});
$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();setText('#loginStatus','Sending sign-in link…');
  const r=await supabase.auth.signInWithOtp({email:$('#loginEmail').value.trim(),options:{emailRedirectTo:location.origin+'/admin/rights'}});
  setText('#loginStatus',r.error?r.error.message:'Check your email for the admin sign-in link.');
});
$('#refresh').onclick=loadAll;
supabase.auth.onAuthStateChange(()=>setTimeout(init,0));
async function init(){if(await ensureAdmin())loadAll().catch(e=>{setSync('Error');notify(e.message,'error')})}
init();