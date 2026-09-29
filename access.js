import { supabase,initChrome,setButtonBusy,esc } from '/site.js';

let session=null,selectedPackage='monthly-drop',pastCollections=[],selectedCollections=new Set();
const packages=[
  {slug:'monthly-drop',label:'Monthly Drop',price:20,suffix:'USD',description:'Current monthly collection'},
  {slug:'six-month',label:'6 Month Access',price:100,suffix:'USD',description:'6 upcoming collections · no archive months'},
  {slug:'past-collections',label:'Past Collections',price:30,suffix:'EACH',description:'Choose one or more archive months'},
  {slug:'annual-plus-3',label:'Annual + 3 Past',price:200,suffix:'USD',description:'12 months and 3 past collections'}
];

const displayedPrice=p=>p.slug==='past-collections'?p.price*Math.max(1,selectedCollections.size):p.price;
function renderPlans(){
  const target=document.querySelector('#accessPlans');
  target.innerHTML=packages.map(p=>
    '<button type="button" class="purchase-plan '+(selectedPackage===p.slug?'selected':'')+'" data-plan="'+p.slug+'" aria-pressed="'+(selectedPackage===p.slug)+'">'+
      '<span class="purchase-plan-dot" aria-hidden="true"></span><span><span class="purchase-plan-label">'+esc(p.label)+'</span><small>'+esc(p.description)+'</small></span><strong>$'+displayedPrice(p).toFixed(0)+'</strong><span class="purchase-plan-currency">'+p.suffix+'</span>'+
    '</button>'
  ).join('');
  target.querySelectorAll('[data-plan]').forEach(btn=>btn.onclick=()=>{
    selectedPackage=btn.dataset.plan;
    if(selectedPackage==='monthly-drop'||selectedPackage==='six-month')selectedCollections.clear();
    if(selectedPackage==='annual-plus-3'&&selectedCollections.size>3)selectedCollections=new Set([...selectedCollections].slice(0,3));
    renderPlans();renderCollectionChooser();
  });
}
function renderCollectionChooser(){
  const chooser=document.querySelector('#pastCollectionChooser');
  const needsCollections=selectedPackage==='past-collections'||selectedPackage==='annual-plus-3';
  chooser.hidden=!needsCollections;
  if(!needsCollections)return;
  const annual=selectedPackage==='annual-plus-3';
  document.querySelector('#pastCollectionTitle').textContent=annual?'Choose 3 included past collections':'Choose past collections · $30 each';
  document.querySelector('#pastCollectionCount').textContent=annual?selectedCollections.size+' / 3 selected':selectedCollections.size+' selected · $'+(selectedCollections.size*30);
  document.querySelector('#pastCollectionOptions').innerHTML=pastCollections.map(c=>{
    const checked=selectedCollections.has(c.slug);
    const disabled=annual&&!checked&&selectedCollections.size>=3;
    return '<label class="past-collection-option '+(checked?'selected ':'')+(disabled?'disabled':'')+'"><input type="checkbox" value="'+esc(c.slug)+'" '+(checked?'checked ':'')+(disabled?'disabled':'')+'><span><strong>'+esc(c.display_name)+'</strong><small>'+esc(c.slug)+'</small></span><b>'+((annual&&checked)?'INCLUDED':'$30')+'</b></label>';
  }).join('');
  document.querySelectorAll('#pastCollectionOptions input').forEach(input=>input.onchange=()=>{
    if(input.checked)selectedCollections.add(input.value);else selectedCollections.delete(input.value);
    renderPlans();renderCollectionChooser();
  });
}
async function init(){
  session=await initChrome();
  const requested=new URLSearchParams(location.search).get('package');
  if(packages.some(p=>p.slug===requested))selectedPackage=requested;
  if(!session){
    document.querySelector('#accessAuth').hidden=false;document.querySelector('#accessApp').hidden=true;
    document.querySelector('#accessAuth a').href='/account?returnTo='+encodeURIComponent('/access?package='+selectedPackage);return;
  }
  if(!session.user.email_confirmed_at){
    document.querySelector('#accessAuth').hidden=false;document.querySelector('#accessAuth h2').textContent='Verify your email first.';
    document.querySelector('#accessAuth p').textContent='Verify your CyberPop email, then return here to request access.';return;
  }
  const profile=await supabase.from('member_profiles').select('country_code').eq('user_id',session.user.id).maybeSingle();
  if(profile.error)throw profile.error;
  const auth=document.querySelector('#accessAuth');
  const app=document.querySelector('#accessApp');
  const authAction=auth.querySelector('a');
  if(!profile.data?.country_code){
    auth.hidden=false;app.hidden=true;
    auth.querySelector('h2').textContent='Complete your profile first.';
    auth.querySelector('p').textContent='Choose your country / region in your CyberPop account before requesting access.';
    authAction.href='/account?returnTo='+encodeURIComponent('/access?package='+selectedPackage);
    authAction.textContent='Complete profile ↗';
    return;
  }
  if(String(profile.data.country_code).toUpperCase()==='TR'){
    auth.hidden=false;app.hidden=true;
    auth.querySelector('h2').textContent='Service unavailable in Türkiye.';
    auth.querySelector('p').textContent='We do not currently provide services in Türkiye.';
    authAction.href='/account';
    authAction.textContent='Open account ↗';
    return;
  }
  auth.hidden=true;app.hidden=false;
  document.querySelector('#accessEmail').textContent=session.user.email||'';
  const monthStart=new Date().toISOString().slice(0,7)+'-01';
  const r=await supabase.from('membership_collections').select('slug,display_name,starts_on').eq('is_published',true).lt('starts_on',monthStart).order('starts_on',{ascending:false});
  if(r.error)throw r.error;pastCollections=r.data||[];renderPlans();renderCollectionChooser();
}
function requestNote(){
  const note=document.querySelector('#accessNote').value.trim();
  const invoiceName=document.querySelector('#invoiceName').value.trim();
  const invoiceCountry=document.querySelector('#invoiceCountry').value.trim();
  const billing=[invoiceName&&'Invoice name/company: '+invoiceName,invoiceCountry&&'Invoice country/region: '+invoiceCountry].filter(Boolean);
  return [note,billing.length?'Billing details shared by customer:\n'+billing.join('\n'):''].filter(Boolean).join('\n\n')||null;
}
document.querySelector('#accessForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const status=document.querySelector('#accessStatus'),success=document.querySelector('#accessSuccess'),button=document.querySelector('#accessSubmit');
  const selected=[...selectedCollections];
  if(selectedPackage==='past-collections'&&!selected.length){status.textContent='Choose at least one past collection.';return}
  if(selectedPackage==='annual-plus-3'&&selected.length!==3){status.textContent='Choose exactly 3 past collections for annual access.';return}
  const note=requestNote();if(note&&note.length>1200){status.textContent='Please shorten the note or invoice details.';return}
  setButtonBusy(button,true,'Sending…');status.textContent='';
  const r=await supabase.rpc('submit_collection_package_request',{p_package_slug:selectedPackage,p_collection_slugs:selected,p_note:note,p_coupon_code:document.querySelector('#accessCoupon').value.trim()||null});
  setButtonBusy(button,false);if(r.error){status.textContent=r.error.message;return}
  document.querySelector('#accessForm').hidden=true;success.hidden=false;
  success.innerHTML='<span class="purchase-success-mark">✓</span><span class="eyebrow">REQUEST RECEIVED</span><h2>Thank you.</h2><p><strong>Order ID: '+esc(r.data?.request_code||'—')+'</strong></p><p>After review, your Payoneer payment link will appear in your account. Keep this Order ID for reference.</p><a href="/account">Open account ↗</a>';
});
init().catch(err=>{console.error(err);document.querySelector('#accessApp').hidden=false;document.querySelector('#accessStatus').textContent='Access request page could not be loaded.'});
