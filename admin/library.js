import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.1';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '/supabase-config.js';

const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
let session=null,collections=[],products=[],privateRows=[],customers=[],entitlements=[],subscriptions=[],codes=[],plans=[],creditAccounts=[],productEntitlements=[],customDeliverables=[];
let productSearch='',productFilter='all';

$('#collectionMonth').innerHTML=monthNames.map((m,i)=>'<option value="'+(i+1)+'">'+m+'</option>').join('');
$('#collectionMonth').value='10';

function setText(sel,msg){$(sel).textContent=msg||''}
function notify(msg,type='success'){
  const toast=$('#adminToast');if(!toast)return;
  toast.textContent=msg||'';toast.className='toast '+(type==='error'?'error ':'')+'show';
  clearTimeout(notify._t);notify._t=setTimeout(()=>toast.className='toast',2600);
}
function setSync(msg){const el=$('#syncState');if(el)el.textContent=msg||'Ready'}
function firstDay(ym){return ym+'-01'}
function addMonths(dateStr,n){const d=new Date(dateStr+'T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+n);return d.toISOString().slice(0,10)}
function customerName(id){const c=customers.find(x=>x.user_id===id);return c?(c.full_name||c.email):id}
function collectionName(id){const c=collections.find(x=>x.id===id);return c?c.display_name:id}

async function checkCultsConnection(){
  const badge=$('#cultsConnectionBadge'),button=$('#cultsSyncButton'),status=$('#cultsSyncStatus');
  badge.textContent='CHECKING';badge.className='badge warn';button.disabled=true;
  try{
    const response=await fetch('/api/cults-sync?limit=1&offset=0',{cache:'no-store',headers:{Authorization:'Bearer '+session.access_token}});
    const data=await response.json();
    if(data.configured){
      badge.textContent=data.ok?'CONNECTED':'API ERROR';
      badge.className='badge '+(data.ok?'on':'warn');
      button.disabled=!data.ok;
      status.textContent=data.ok?'Cults API connected. Ready to import your own designs.':(data.error||'Cults API error.');
    }else{
      badge.textContent='NOT CONFIGURED';badge.className='badge warn';
      status.textContent='Add the rotated CULTS_API_KEY_ROTATED secret to the Vercel preview environment to enable sync.';
    }
  }catch(error){
    badge.textContent='UNAVAILABLE';badge.className='badge warn';
    status.textContent=error.message||'Could not check Cults API.';
  }
}

async function syncFromCults(){
  const button=$('#cultsSyncButton'),status=$('#cultsSyncStatus');
  button.disabled=true;setSync('Cults sync…');status.textContent='Fetching latest designs from Cults…';
  try{
    const response=await fetch('/api/cults-sync?limit=50&offset=0',{cache:'no-store',headers:{Authorization:'Bearer '+session.access_token}});
    const payload=await response.json();
    if(!payload.ok)throw new Error(payload.error||'Cults sync failed.');
    let created=0,updated=0,failed=0;
    const items=[...(payload.results||[])].sort((a,b)=>new Date(a.publishedAt||0)-new Date(b.publishedAt||0));
    for(const item of items){
      const r=await supabase.rpc('admin_import_cults_product',{
        p_source_url:item.url,
        p_source_name:item.name,
        p_image_url:item.imageUrl||null,
        p_published_at:item.publishedAt||null,
        p_raw_metadata:item
      });
      if(r.error){console.error(r.error);failed++;continue}
      const row=Array.isArray(r.data)?r.data[0]:null;
      if(row&&row.was_created)created++;else updated++;
    }
    status.textContent='Cults sync complete · '+created+' new · '+updated+' updated'+(failed?' · '+failed+' failed':'')+'.';
    notify('Cults catalog synced.');
    await loadAll();
  }catch(error){
    status.textContent=error.message||'Cults sync failed.';
    notify(status.textContent,'error');
  }finally{
    setSync('Ready');button.disabled=false;
  }
}

async function ensureAdmin(){
  const auth=await supabase.auth.getSession();session=auth.data.session;
  if(!session){$('#loginPanel').hidden=false;$('#adminApp').hidden=true;return false}
  const check=await supabase.from('sales_admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(check.error||!check.data){$('#loginPanel').hidden=false;$('#adminApp').hidden=true;setText('#loginStatus','This account is not authorized for admin.');return false}
  $('#loginPanel').hidden=true;$('#adminApp').hidden=false;return true;
}

async function loadAll(){
  setSync('Syncing…');
  const res=await Promise.all([
    supabase.from('membership_collections').select('*').order('starts_on',{ascending:false}),
    supabase.from('membership_products').select('*').order('collection_id').order('product_number'),
    supabase.from('membership_product_private').select('*'),
    supabase.from('membership_product_delivery').select('*'),
    supabase.from('membership_customers').select('*').order('full_name'),
    supabase.from('membership_entitlements').select('*'),
    supabase.from('membership_subscriptions').select('*,membership_plans(name,plan_type)'),
    supabase.from('membership_collection_codes').select('*'),
    supabase.from('membership_plans').select('*').order('sort_order'),
    supabase.from('credit_accounts').select('*'),
    supabase.from('product_entitlements').select('*'),
    supabase.from('custom_deliverables').select('*').order('created_at',{ascending:false})
  ]);
  const err=res.find(x=>x.error);if(err)throw err.error;
  collections=res[0].data||[];products=res[1].data||[];privateRows=res[2].data||[];
  const deliveryRows=res[3].data||[];
  customers=res[4].data||[];entitlements=res[5].data||[];subscriptions=res[6].data||[];codes=res[7].data||[];plans=res[8].data||[];creditAccounts=res[9].data||[];
  productEntitlements=res[10].data||[];customDeliverables=res[11].data||[];
  products=products.map(p=>({...p,delivery:deliveryRows.find(d=>d.product_id===p.id)||null}));
  renderAll();setSync('Synced');
  checkCultsConnection();
}

function renderAll(){
  renderStats();renderCollections();renderProducts();renderSelects();renderPlans();renderCustomDeliverables();
}
function renderStats(){
  const included=products.filter(p=>p.is_included&&p.is_published).length;
  const monthly=entitlements.filter(e=>e.status==='active').length;
  const annual=subscriptions.filter(s=>s.status==='active'&&Number(s.billing_months)===12).length;
  $('#stats').innerHTML=[
    ['COLLECTION MONTHS',collections.length],['INCLUDED MODELS',included],['MONTH GRANTS',monthly],['ANNUAL MEMBERS',annual]
  ].map(x=>'<div class="stat"><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>').join('');
}
function renderCollections(){
  $('#collections').innerHTML=collections.map(c=>{
    const count=products.filter(p=>p.collection_id===c.id).length;
    return '<article class="record"><div class="record-head"><div><h3>'+esc(c.display_name)+'</h3><p>'+esc(c.slug)+' · '+count+' model'+(count===1?'':'s')+' · starts '+esc(c.starts_on)+'</p></div><span class="badge '+(c.is_published?'on':'warn')+'">'+(c.is_published?'PUBLISHED':'DRAFT')+'</span></div>'+
      '<div class="actions"><button data-publish-collection="'+c.id+'" class="secondary">'+(c.is_published?'Make draft':'Publish')+'</button></div></article>';
  }).join('')||'<p class="small">No collections.</p>';
  document.querySelectorAll('[data-publish-collection]').forEach(b=>b.onclick=()=>toggleCollection(b.dataset.publishCollection));
}
function productMatchesAdminFilter(p){
  const priv=privateRows.find(x=>x.product_id===p.id);
  const haystack=[p.public_title,priv?.internal_name,collectionName(p.collection_id),priv?.rights_property_key].filter(Boolean).join(' ').toLowerCase();
  if(productSearch&&!haystack.includes(productSearch))return false;
  if(productFilter==='published')return p.is_published&&p.legal_status==='ACTIVE'&&p.takedown_state==='NONE';
  if(productFilter==='draft')return !p.is_published;
  if(productFilter==='legal')return p.legal_status!=='ACTIVE'||p.takedown_state!=='NONE';
  if(productFilter==='fan')return p.ip_class==='UNOFFICIAL_FAN_WORK';
  if(productFilter==='commercial')return p.license_scope==='PHYSICAL_COMMERCIAL'||p.commercial_print_allowed;
  if(productFilter==='missing')return !p.thumbnail_url||!p.credit_price||!priv?.internal_name;
  return true;
}
function renderProducts(){
  const visible=products.filter(productMatchesAdminFilter);
  $('#productAdminCount').textContent=visible.length+' / '+products.length+' products';
  $('#products').innerHTML=visible.map(p=>{
    const priv=privateRows.find(x=>x.product_id===p.id);
    const thumb=p.thumbnail_url?'<div class="record-thumb"><img src="'+esc(p.thumbnail_url)+'" alt=""></div>':'<div class="record-thumb empty">CP</div>';
    const legalWarn=p.legal_status!=='ACTIVE'||p.takedown_state!=='NONE';
    return '<article class="record"><div class="record-head"><div class="record-main">'+thumb+'<div><h3>'+esc(p.public_title)+'</h3><p>Admin name: <strong>'+esc(priv?priv.internal_name:'—')+'</strong> · '+esc(collectionName(p.collection_id))+'</p><p>Property key: <strong>'+esc(priv?.rights_property_key||'—')+'</strong></p></div></div>'+
      '<div><span class="badge '+(p.is_included?'on':'')+'">'+(p.is_included?'INCLUDED':'EXCLUDED')+'</span> <span class="badge '+(p.is_published?'on':'')+'">'+(p.is_published?'VISIBLE':'HIDDEN')+'</span> <span class="badge '+(legalWarn?'warn':'on')+'">'+esc(p.legal_status||'ACTIVE')+'</span></div></div>'+
      '<div class="rights-admin-grid">'+
        '<label>Collection<select data-product-collection="'+p.id+'">'+collections.map(c=>'<option value="'+c.id+'" '+(c.id===p.collection_id?'selected':'')+'>'+esc(c.display_name)+'</option>').join('')+'</select></label>'+
        '<label>Credit price<input data-credit-price="'+p.id+'" type="number" min="1" step="1" value="'+(p.credit_price??'')+'" placeholder="40"></label>'+
        '<label>IP Class<select data-ip-class="'+p.id+'"><option value="ORIGINAL" '+(p.ip_class==='ORIGINAL'?'selected':'')+'>ORIGINAL</option><option value="RIGHTS_CLEARED" '+(p.ip_class==='RIGHTS_CLEARED'?'selected':'')+'>RIGHTS_CLEARED</option><option value="UNOFFICIAL_FAN_WORK" '+(p.ip_class==='UNOFFICIAL_FAN_WORK'?'selected':'')+'>UNOFFICIAL_FAN_WORK</option></select></label>'+
        '<label>License Scope<select data-license-scope="'+p.id+'"><option value="PERSONAL" '+(p.license_scope==='PERSONAL'?'selected':'')+'>PERSONAL</option><option value="PHYSICAL_COMMERCIAL" '+(p.license_scope==='PHYSICAL_COMMERCIAL'?'selected':'')+'>PHYSICAL_COMMERCIAL</option></select></label>'+
        '<label>Subscription<select data-subscription-access="'+p.id+'"><option value="true" '+(p.subscription_access?'selected':'')+'>Included</option><option value="false" '+(!p.subscription_access?'selected':'')+'>Excluded</option></select></label>'+
        '<label>Physical print<select data-commercial-print="'+p.id+'"><option value="false" '+(!p.commercial_print_allowed?'selected':'')+'>No</option><option value="true" '+(p.commercial_print_allowed?'selected':'')+'>Yes</option></select></label>'+
        '<label>Fan notice<select data-fan-disclaimer="'+p.id+'"><option value="false" '+(!p.fan_art_disclaimer?'selected':'')+'>Off</option><option value="true" '+(p.fan_art_disclaimer?'selected':'')+'>On</option></select></label>'+
        '<label>Rights property key<input data-rights-property="'+p.id+'" value="'+esc(priv?.rights_property_key||'')+'" placeholder="admin-only"></label>'+
        '<label>License terms version<input data-license-version="'+p.id+'" value="'+esc(p.license_terms_version||'')+'" placeholder="optional"></label>'+
      '</div>'+
      '<div class="actions"><button data-save-rights="'+p.id+'">Save product rights</button><button data-move-product="'+p.id+'" class="secondary">Move to selected collection</button><button data-toggle-included="'+p.id+'" class="secondary">'+(p.is_included?'Exclude membership':'Include membership')+'</button><button data-legal-action="HIDE" data-product-id="'+p.id+'" class="secondary">Hide</button><button data-legal-action="LEGAL_REVIEW" data-product-id="'+p.id+'" class="secondary">Legal review</button><button data-legal-action="TAKEDOWN" data-product-id="'+p.id+'" class="danger">Takedown</button><button data-legal-action="DISCONTINUE" data-product-id="'+p.id+'" class="secondary">Discontinue</button><button data-legal-action="DISABLE_DOWNLOADS" data-product-id="'+p.id+'" class="secondary">Disable downloads</button><button data-legal-action="ACTIVATE" data-product-id="'+p.id+'" class="secondary">Activate</button></div></article>';
  }).join('')||'<div class="admin-empty"><strong>No products match this view.</strong><span>Change the search or filter to see more catalog items.</span></div>';
  document.querySelectorAll('[data-toggle-included]').forEach(b=>b.onclick=()=>toggleProduct(b.dataset.toggleIncluded,'is_included'));
  document.querySelectorAll('[data-save-rights]').forEach(b=>b.onclick=()=>saveProductRights(b.dataset.saveRights));
  document.querySelectorAll('[data-move-product]').forEach(b=>b.onclick=()=>moveProductToCollection(b.dataset.moveProduct));
  document.querySelectorAll('[data-legal-action]').forEach(b=>b.onclick=()=>runLegalAction(b.dataset.productId,b.dataset.legalAction));
}
function optionRows(list,valueFn,labelFn){return list.map(x=>'<option value="'+esc(valueFn(x))+'">'+esc(labelFn(x))+'</option>').join('')}
function renderSelects(){
  const collectionOptions=optionRows(collections,x=>x.id,x=>x.display_name);
  ['#productCollection','#monthlyCollection','#codeCollection'].forEach(s=>$(s).innerHTML=collectionOptions);
  const customerOptions=optionRows(customers,x=>x.user_id,x=>(x.full_name||x.email)+' · '+x.email);
  ['#monthlyCustomer','#annualCustomer','#codeCustomer','#creditCustomer','#productGrantCustomer','#customCustomer'].forEach(s=>$(s).innerHTML=customerOptions);
  const productOptions=optionRows(products,x=>x.id,x=>{
    const priv=privateRows.find(p=>p.product_id===x.id);
    return (priv?.internal_name||x.public_title)+' · '+collectionName(x.collection_id);
  });
  $('#productGrantProduct').innerHTML=productOptions;
  document.querySelectorAll('#creditCustomer option').forEach(o=>{
    const account=creditAccounts.find(x=>x.user_id===o.value);o.textContent+=' · '+Number(account?.balance||0)+' C';
  });
}
function renderPlans(){
  const rows=plans.filter(p=>p.slug==='monthly'||p.slug==='annual');
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
  if(r.error){notify(r.error.message,'error');return}notify('Collection visibility updated.');await loadAll();
}
async function saveProductRights(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  const priceValue=document.querySelector('[data-credit-price="'+id+'"]').value.trim();
  const ipClass=document.querySelector('[data-ip-class="'+id+'"]').value;
  let licenseScope=document.querySelector('[data-license-scope="'+id+'"]').value;
  let commercial=document.querySelector('[data-commercial-print="'+id+'"]').value==='true';
  if(commercial)licenseScope='PHYSICAL_COMMERCIAL';
  if(licenseScope==='PHYSICAL_COMMERCIAL')commercial=true;
  const patch={
    credit_price:priceValue?Number(priceValue):null,
    ip_class:ipClass,
    license_scope:licenseScope,
    subscription_access:document.querySelector('[data-subscription-access="'+id+'"]').value==='true',
    commercial_print_allowed:commercial,
    fan_art_disclaimer:ipClass==='UNOFFICIAL_FAN_WORK'||document.querySelector('[data-fan-disclaimer="'+id+'"]').value==='true',
    license_terms_version:document.querySelector('[data-license-version="'+id+'"]').value.trim()||null
  };
  const priv=privateRows.find(x=>x.product_id===id);
  const propertyKey=document.querySelector('[data-rights-property="'+id+'"]').value.trim()||null;
  const pr=priv
    ? await supabase.from('membership_product_private').update({rights_property_key:propertyKey}).eq('product_id',id)
    : await supabase.from('membership_product_private').insert({product_id:id,internal_name:'',rights_property_key:propertyKey});
  if(pr.error){notify(pr.error.message,'error');return}
  const r=await supabase.from('membership_products').update(patch).eq('id',id);
  if(r.error){notify(r.error.message,'error');return}
  notify('Product rights metadata updated.');await loadAll();
}
async function moveProductToCollection(id){
  const select=document.querySelector('[data-product-collection="'+id+'"]');
  if(!select)return;
  const r=await supabase.rpc('admin_move_product_to_collection',{p_product_id:id,p_collection_id:select.value});
  if(r.error){notify(r.error.message,'error');return}
  notify('Model moved to '+collectionName(select.value)+'.');await loadAll();
}
function renderCustomDeliverables(){
  const target=$('#customDeliverables');if(!target)return;
  target.innerHTML=customDeliverables.map(d=>{
    const active=d.is_active!==false;
    const link=d.download_url?'<a class="secondary" target="_blank" rel="noopener" href="'+esc(d.download_url)+'">Open delivery ↗</a>':'';
    return '<article class="record"><div class="record-head"><div><h3>'+esc(d.title)+'</h3><p>'+esc(customerName(d.user_id))+' · '+esc(d.source_kind)+' · '+new Date(d.created_at).toLocaleDateString()+'</p></div><span class="badge '+(active?'on':'warn')+'">'+(active?'ACTIVE':'REVOKED')+'</span></div><div class="actions">'+link+(active?'<button class="secondary" data-revoke-custom="'+d.id+'">Revoke</button>':'')+'</div></article>';
  }).join('')||'<p class="small">No private custom deliveries yet.</p>';
  document.querySelectorAll('[data-revoke-custom]').forEach(b=>b.onclick=()=>revokeCustomDelivery(b.dataset.revokeCustom));
}
async function revokeCustomDelivery(id){
  const r=await supabase.from('custom_deliverables').update({is_active:false,updated_at:new Date().toISOString()}).eq('id',id);
  if(r.error){notify(r.error.message,'error');return}
  notify('Custom delivery revoked.');await loadAll();
}

async function runLegalAction(id,action){
  const note=window.prompt('Optional internal note for '+action+':','')||null;
  const r=await supabase.rpc('admin_set_product_legal_state',{p_product_id:id,p_action:action,p_note:note});
  if(r.error){notify(r.error.message,'error');return}
  notify('Legal state updated: '+action);await loadAll();
}
async function toggleProduct(id,field){
  const p=products.find(x=>x.id===id);if(!p)return;
  const patch={};patch[field]=!p[field];
  const r=await supabase.from('membership_products').update(patch).eq('id',id);
  if(r.error){notify(r.error.message,'error');return}notify('Product settings updated.');await loadAll();
}

$('#collectionForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const year=Number($('#collectionYear').value),month=Number($('#collectionMonth').value);
  const mm=String(month).padStart(2,'0'),starts=year+'-'+mm+'-01';
  const row={year,month,slug:year+'-'+mm,display_name:monthNames[month-1]+' '+year,starts_on:starts,is_published:$('#collectionPublished').value==='true'};
  const r=await supabase.from('membership_collections').insert(row);
  if(r.error){notify(r.error.message,'error');return}notify('Collection month created.');await loadAll();
});

$('#productForm').addEventListener('submit',async e=>{
  e.preventDefault();setText('#productStatus','Adding product…');
  const ipClass=$('#productIpClass').value;
  let licenseScope=$('#productLicenseScope').value;
  let commercial=$('#productCommercialPrint').value==='true';
  if(commercial)licenseScope='PHYSICAL_COMMERCIAL';
  if(licenseScope==='PHYSICAL_COMMERCIAL')commercial=true;
  const row={
    collection_id:$('#productCollection').value,
    product_number:Number($('#productNumber').value),
    thumbnail_url:$('#productThumbnail').value.trim()||null,
    is_included:true,is_published:true,sort_order:Number($('#productNumber').value),
    ip_class:ipClass,license_scope:licenseScope,
    subscription_access:$('#productSubscriptionAccess').value==='true',
    commercial_print_allowed:commercial,
    fan_art_disclaimer:ipClass==='UNOFFICIAL_FAN_WORK'||$('#productFanDisclaimer').value==='true'
  };
  const p=await supabase.from('membership_products').insert(row).select('id').single();
  if(p.error){setText('#productStatus',p.error.message);return}
  const priv=await supabase.from('membership_product_private').insert({
    product_id:p.data.id,
    internal_name:$('#productInternalName').value.trim(),
    admin_note:$('#productNote').value.trim()||null,
    rights_property_key:$('#productRightsPropertyKey').value.trim()||null
  });
  if(priv.error){await supabase.from('membership_products').delete().eq('id',p.data.id);setText('#productStatus',priv.error.message);return}
  const deliveryUrl=$('#productCultsUrl').value.trim();
  if(deliveryUrl){
    const delivery=await supabase.from('membership_product_delivery').insert({product_id:p.data.id,cults_url:deliveryUrl});
    if(delivery.error){await supabase.from('membership_products').delete().eq('id',p.data.id);setText('#productStatus',delivery.error.message);return}
    const source=await supabase.from('membership_product_sources').insert({
      product_id:p.data.id,provider:'cults',source_url:deliveryUrl,
      source_name:$('#productInternalName').value.trim(),source_image_url:$('#productThumbnail').value.trim()||null,
      sync_status:'linked',last_synced_at:new Date().toISOString()
    });
    if(source.error){console.warn(source.error)}
  }
  e.target.reset();setText('#productStatus','Product added and included by default.');notify('Product added to the collection.');await loadAll();
});

$('#productGrantForm').addEventListener('submit',async e=>{
  e.preventDefault();
  setText('#productGrantStatus','Granting model…');
  const r=await supabase.rpc('admin_set_product_entitlement',{
    p_user_id:$('#productGrantCustomer').value,
    p_product_id:$('#productGrantProduct').value,
    p_source:$('#productGrantSource').value,
    p_reference:$('#productGrantReference').value.trim()||null,
    p_active:true
  });
  setText('#productGrantStatus',r.error?r.error.message:'Model access granted.');
  if(!r.error){notify('Model added to customer Library.');await loadAll()}
});
$('#revokeProductGrant').onclick=async()=>{
  setText('#productGrantStatus','Revoking model…');
  const r=await supabase.rpc('admin_set_product_entitlement',{
    p_user_id:$('#productGrantCustomer').value,
    p_product_id:$('#productGrantProduct').value,
    p_source:$('#productGrantSource').value,
    p_reference:$('#productGrantReference').value.trim()||null,
    p_active:false
  });
  setText('#productGrantStatus',r.error?r.error.message:'Model access revoked.');
  if(!r.error){notify('Model removed from customer Library.');await loadAll()}
};

$('#customDeliveryForm').addEventListener('submit',async e=>{
  e.preventDefault();
  setText('#customDeliveryStatus','Adding private delivery…');
  const row={
    user_id:$('#customCustomer').value,
    title:$('#customTitle').value.trim(),
    description:$('#customDescription').value.trim()||null,
    thumbnail_url:$('#customThumbnailUrl').value.trim()||null,
    download_url:$('#customDownloadUrl').value.trim()||null,
    source_kind:$('#customSourceKind').value,
    source_reference:$('#customReference').value.trim()||null,
    admin_note:$('#customAdminNote').value.trim()||null,
    created_by:session.user.id
  };
  const r=await supabase.from('custom_deliverables').insert(row);
  setText('#customDeliveryStatus',r.error?r.error.message:'Private delivery added.');
  if(!r.error){notify('Custom design delivered to customer account.');e.target.reset();await loadAll()}
});

$('#creditAdjustForm').addEventListener('submit',async e=>{
  e.preventDefault();
  setText('#creditAdjustStatus','Applying ledger adjustment…');
  const amount=Number($('#creditAmount').value);
  const r=await supabase.rpc('admin_adjust_credits',{
    p_user_id:$('#creditCustomer').value,
    p_amount:amount,
    p_description:$('#creditDescription').value.trim()
  });
  if(r.error){setText('#creditAdjustStatus',r.error.message);return}
  const data=r.data||{};
  setText('#creditAdjustStatus','Adjustment recorded. New balance: '+Number(data.balance||0)+' C.');
  notify('Credit ledger updated.');e.target.reset();await loadAll();
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
  const plan=plans.find(p=>p.slug==='annual');if(!plan){setText('#accessStatus','Annual plan is missing.');return}
  const start=firstDay($('#annualStart').value),end=addMonths(start,12);
  const row={user_id:$('#annualCustomer').value,plan_id:plan.id,status:'active',billing_months:12,current_period_start:start,current_period_end:end,next_payment_due:end,auto_renew:true,cancel_at_period_end:false};
  const r=await supabase.from('membership_subscriptions').upsert(row,{onConflict:'user_id,plan_id'});
  setText('#accessStatus',r.error?r.error.message:'Annual access granted for 12 collection months.');if(!r.error)await loadAll();
});
$('#revokeAnnual').onclick=async()=>{
  const plan=plans.find(p=>p.slug==='annual');if(!plan)return;
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
  if(r.error){notify(r.error.message,'error');return}notify('Plan updated.');await loadAll();
}

$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();setText('#loginStatus','Sending sign-in link…');
  const r=await supabase.auth.signInWithOtp({email:$('#loginEmail').value.trim(),options:{emailRedirectTo:location.origin+'/admin/library.html'}});
  setText('#loginStatus',r.error?r.error.message:'Check your email for the admin sign-in link.');
});
$('#productAdminSearch').addEventListener('input',e=>{productSearch=e.target.value.trim().toLowerCase();renderProducts()});
$('#productAdminFilter').addEventListener('change',e=>{productFilter=e.target.value;renderProducts()});
$('#refresh').onclick=loadAll;
$('#cultsCheckButton').onclick=checkCultsConnection;
$('#cultsSyncButton').onclick=syncFromCults;
supabase.auth.onAuthStateChange(()=>setTimeout(init,0));
async function init(){if(await ensureAdmin())loadAll().catch(e=>{setSync('Error');notify(e.message,'error')})}
init();
