import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.1';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '/supabase-config.js';

const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let session=null;

function statusRow(label,status,copy,link=''){
  const ok=status==='ready',warn=status==='warning',off=status==='off';
  return '<div class="health-row"><div><strong>'+esc(label)+'</strong><span>'+esc(copy)+'</span></div><div class="health-row-side"><span class="badge '+(ok?'on':warn||off?'warn':'')+'">'+esc(status.toUpperCase())+'</span>'+(link?'<a href="'+esc(link)+'">Open ↗</a>':'')+'</div></div>';
}
function readiness(label,ready,copy,link){
  return '<a class="readiness-card '+(ready?'ready':'pending')+'" href="'+esc(link)+'"><div class="readiness-mark">'+(ready?'✓':'·')+'</div><div><strong>'+esc(label)+'</strong><span>'+esc(copy)+'</span></div><b>↗</b></a>';
}
function toast(msg,type='success'){const el=$('#adminToast');el.textContent=msg;el.className='toast '+(type==='error'?'error ':'')+'show';clearTimeout(toast.t);toast.t=setTimeout(()=>el.className='toast',2500)}

async function ensureAdmin(){
  const auth=await supabase.auth.getSession();session=auth.data.session;
  if(!session){$('#dashboardLoginPanel').hidden=false;$('#dashboardApp').hidden=true;return false}
  const check=await supabase.from('sales_admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(check.error||!check.data){$('#dashboardLoginPanel').hidden=false;$('#dashboardApp').hidden=true;$('#dashboardLoginStatus').textContent='This account is not authorized for admin.';return false}
  $('#dashboardLoginPanel').hidden=true;$('#dashboardApp').hidden=false;return true;
}

async function checkGoogle(){
  try{
    const response=await fetch(SUPABASE_URL+'/auth/v1/settings',{headers:{apikey:SUPABASE_PUBLISHABLE_KEY}});
    if(!response.ok)return false;const data=await response.json();return Boolean(data?.external?.google);
  }catch(_){return false}
}
async function checkCults(){
  try{
    const r=await fetch('/api/cults-sync?limit=1&offset=0',{cache:'no-store',headers:{Authorization:'Bearer '+session.access_token}});
    const data=await r.json();return {configured:Boolean(data.configured),ok:Boolean(data.ok),error:data.error||null};
  }catch(e){return {configured:false,ok:false,error:e.message}}
}
async function load(){
  $('#dashboardSync').textContent='Syncing…';
  const [collections,products,customers,entitlements,subs,media,legal,reports,blocks,credits,google,cults]=await Promise.all([
    supabase.from('membership_collections').select('id,is_published,cover_image_url,hero_image_url'),
    supabase.from('membership_products').select('id,is_published,is_included,thumbnail_url,credit_price,legal_status,takedown_state,ip_class,license_scope'),
    supabase.from('membership_customers').select('user_id'),
    supabase.from('product_entitlements').select('id'),
    supabase.from('membership_subscriptions').select('id,status,billing_months'),
    supabase.from('site_media_slots').select('slot_key,asset_url'),
    supabase.from('legal_documents').select('id,status,is_current,document_type'),
    supabase.from('rights_reports').select('id,report_type,relevant_ip,status,created_at').order('created_at',{ascending:false}).limit(12),
    supabase.from('ip_property_blocklist').select('id,is_active'),
    supabase.from('credit_accounts').select('user_id,balance'),
    checkGoogle(),checkCults()
  ]);
  const queries=[collections,products,customers,entitlements,subs,media,legal,reports,blocks,credits];
  const error=queries.find(x=>x.error);if(error)throw error.error;

  const c=collections.data||[],p=products.data||[],u=customers.data||[],pe=entitlements.data||[],s=subs.data||[];
  const mediaRows=media.data||[],legalRows=legal.data||[],reportRows=reports.data||[],blockRows=blocks.data||[],creditRows=credits.data||[];
  const published=p.filter(x=>x.is_published&&x.is_included&&x.legal_status==='ACTIVE'&&x.takedown_state==='NONE');
  const incomplete=p.filter(x=>!x.thumbnail_url||!x.credit_price||x.legal_status!=='ACTIVE'||x.takedown_state!=='NONE');
  const activeAnnual=s.filter(x=>x.status==='active'&&Number(x.billing_months)===12).length;
  const totalCredits=creditRows.reduce((n,x)=>n+Number(x.balance||0),0);
  const openReports=reportRows.filter(x=>!['closed','rejected'].includes(x.status));
  const mediaReady=mediaRows.length>0&&mediaRows.every(x=>Boolean(x.asset_url));
  const legalCurrent=legalRows.filter(x=>x.status==='published'&&x.is_current);
  const requiredLegalTypes=['terms_of_use','rights_of_use','privacy_policy','refund_policy','ip_policy','credits_terms'];
  const legalReady=requiredLegalTypes.every(type=>legalCurrent.some(x=>x.document_type===type));

  $('#dashboardStats').innerHTML=[
    ['PUBLISHED MODELS',published.length],['MEMBER ACCOUNTS',u.length],['OWNED MODELS',pe.length],['CREDITS IN ACCOUNTS',totalCredits]
  ].map(x=>'<div class="stat"><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>').join('');

  $('#readinessGrid').innerHTML=[
    readiness('Catalog structure',c.length>0&&p.length>0,c.length+' collections · '+p.length+' models','/adminsu/library'),
    readiness('Storefront media',mediaReady,mediaRows.filter(x=>x.asset_url).length+' / '+mediaRows.length+' global slots filled','/adminsu/media'),
    readiness('Legal versions',legalReady,legalCurrent.length+' current published documents','/adminsu/rights'),
    readiness('Google sign-in',google,google?'Provider enabled':'Provider credentials still pending','/account'),
    readiness('Cults sync',cults.ok,cults.ok?'Connected':'Credentials / API connection pending','/adminsu/library'),
    readiness('Payment provider',false,'Intentionally disabled until company + Payoneer are ready','/adminsu/memberships')
  ].join('');

  $('#systemHealth').innerHTML=[
    statusRow('Supabase data layer','ready','Catalog, entitlement, credit and rights queries responding.'),
    statusRow('Google OAuth',google?'ready':'warning',google?'Enabled and discoverable.':'Provider setup pending.','/account'),
    statusRow('Cults API',cults.ok?'ready':'warning',cults.ok?'Catalog sync endpoint connected.':(cults.configured?'Configured but API check failed.':'Credentials not configured.'),'/adminsu/library'),
    statusRow('Legal publication',legalReady?'ready':'warning',legalReady?'Core legal documents have current published versions.':'Draft/version review still required.','/adminsu/rights'),
    statusRow('Payment checkout','off','Real-money checkout intentionally unavailable until company/provider setup.','/adminsu/memberships'),
    statusRow('Active annual members',activeAnnual?'ready':'warning',activeAnnual+' active annual access record'+(activeAnnual===1?'':'s')+'.')
  ].join('');

  $('#dashboardRights').innerHTML=openReports.length?openReports.slice(0,5).map(r=>'<a class="record compact-record" href="/adminsu/rights"><div><h3>'+esc(r.report_type.replaceAll('_',' '))+'</h3><p>'+esc(r.relevant_ip||'No property label')+' · '+esc(r.status)+'</p></div><span>↗</span></a>').join(''):'<div class="admin-empty"><strong>No open rights reports.</strong><span>Incoming reports will appear here.</span></div>';
  $('#dashboardCatalogIssues').innerHTML=incomplete.length?incomplete.slice(0,6).map(x=>'<a class="record compact-record" href="/adminsu/library"><div><h3>Product '+esc(String(x.id).slice(0,8))+'</h3><p>'+(!x.thumbnail_url?'Missing thumbnail · ':'')+(!x.credit_price?'Missing credit price · ':'')+(x.legal_status!=='ACTIVE'?esc(x.legal_status):'')+'</p></div><span>↗</span></a>').join(''):'<div class="admin-empty"><strong>Catalog checks clean.</strong><span>No obvious product setup gaps found.</span></div>';

  $('#dashboardSync').textContent='Synced';
}
$('#dashboardLoginForm').addEventListener('submit',async e=>{
  e.preventDefault();$('#dashboardLoginStatus').textContent='Sending sign-in link…';
  const r=await supabase.auth.signInWithOtp({email:$('#dashboardLoginEmail').value.trim(),options:{emailRedirectTo:location.origin+'/adminsu/'}});
  $('#dashboardLoginStatus').textContent=r.error?r.error.message:'Check your email for the admin sign-in link.';
});
$('#dashboardRefresh').onclick=()=>load().catch(e=>{console.error(e);$('#dashboardSync').textContent='Error';toast('Dashboard refresh failed.','error')});
supabase.auth.onAuthStateChange(()=>setTimeout(init,0));
async function init(){if(await ensureAdmin())load().catch(e=>{console.error(e);$('#dashboardSync').textContent='Error';toast('Dashboard could not load.','error')})}
init();