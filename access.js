import { supabase,initChrome,setButtonBusy,esc } from '/site.js';

let session=null,plans=[],selectedPlan=null;

function planLabel(p){
  const months=Number(p.billing_months);
  return months===1?'1 Month':months+' Months';
}
function renderPlans(){
  const target=document.querySelector('#accessPlans');
  target.innerHTML=plans.map(p=>
    '<button type="button" class="purchase-plan '+(selectedPlan===p.slug?'selected':'')+'" data-plan="'+esc(p.slug)+'" aria-pressed="'+(selectedPlan===p.slug)+'">'+
      '<span class="purchase-plan-dot" aria-hidden="true"></span><span class="purchase-plan-label">'+esc(planLabel(p))+'</span><strong>$'+Number(p.amount).toFixed(0)+'</strong><span class="purchase-plan-currency">USD</span>'+
    '</button>'
  ).join('');
  target.querySelectorAll('[data-plan]').forEach(btn=>btn.onclick=()=>{
    selectedPlan=btn.dataset.plan;renderPlans();
  });
}
async function init(){
  session=await initChrome();
  if(!session){
    document.querySelector('#accessAuth').hidden=false;
    document.querySelector('#accessApp').hidden=true;
    return;
  }
  if(!session.user.email_confirmed_at){
    document.querySelector('#accessAuth').hidden=false;
    document.querySelector('#accessAuth h2').textContent='Verify your email first.';
    document.querySelector('#accessAuth p').textContent='Verify your CyberPop email, then return here to request access.';
    return;
  }
  document.querySelector('#accessAuth').hidden=true;
  document.querySelector('#accessApp').hidden=false;
  document.querySelector('#accessEmail').textContent=session.user.email||'';
  const r=await supabase.from('membership_plans').select('slug,name,amount,currency,billing_months').eq('is_active',true).in('billing_months',[1,3,12]).order('billing_months');
  if(r.error)throw r.error;
  plans=r.data||[];
  if(!plans.length){document.querySelector('#accessStatus').textContent='Access periods are temporarily unavailable.';document.querySelector('#accessSubmit').disabled=true;return}
  selectedPlan=plans[0]?.slug||null;
  renderPlans();
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
  const status=document.querySelector('#accessStatus');
  const success=document.querySelector('#accessSuccess');
  const button=document.querySelector('#accessSubmit');
  if(!selectedPlan){status.textContent='Choose an access period.';return}
  const note=requestNote();
  if(note&&note.length>1200){status.textContent='Please shorten the note or invoice details.';return}
  setButtonBusy(button,true,'Sending…');
  status.textContent='';
  const r=await supabase.rpc('submit_collection_access_request',{
    p_plan_slug:selectedPlan,
    p_note:note,
    p_coupon_code:document.querySelector('#accessCoupon').value.trim()||null
  });
  setButtonBusy(button,false);
  if(r.error){status.textContent=r.error.message;return}
  document.querySelector('#accessForm').hidden=true;
  success.hidden=false;
  success.innerHTML='<span class="purchase-success-mark">✓</span><span class="eyebrow">REQUEST RECEIVED</span><h2>Thank you.</h2><p>'+esc(r.data?.request_code||'')+'</p><p>We will review your request and email the Payoneer payment link.</p><a href="/account">Open account ↗</a>';
});
init().catch(err=>{
  console.error(err);
  document.querySelector('#accessApp').hidden=false;
  document.querySelector('#accessStatus').textContent='Access request page could not be loaded.';
});
