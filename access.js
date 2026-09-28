import { supabase,initChrome,setButtonBusy,esc } from '/site.js';

let session=null,plans=[],selectedPlan=null;

function planLabel(p){
  const months=Number(p.billing_months);
  return months===1?'1 Month':months+' Months';
}
function renderPlans(){
  const target=document.querySelector('#accessPlans');
  target.innerHTML=plans.map(p=>
    '<button type="button" class="access-plan '+(selectedPlan===p.slug?'selected':'')+'" data-plan="'+esc(p.slug)+'">'+
      '<span>'+esc(planLabel(p))+'</span><strong>$'+Number(p.amount).toFixed(0)+'</strong>'+
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
    return;
  }
  document.querySelector('#accessAuth').hidden=true;
  document.querySelector('#accessApp').hidden=false;
  document.querySelector('#accessEmail').textContent=session.user.email||'';
  const r=await supabase.from('membership_plans').select('slug,name,amount,currency,billing_months').eq('is_active',true).in('billing_months',[1,3,12]).order('billing_months');
  if(r.error)throw r.error;
  plans=r.data||[];
  selectedPlan=plans[0]?.slug||null;
  renderPlans();
}
document.querySelector('#accessForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const status=document.querySelector('#accessStatus');
  const success=document.querySelector('#accessSuccess');
  const button=document.querySelector('#accessSubmit');
  if(!selectedPlan){status.textContent='Choose an access period.';return}
  setButtonBusy(button,true,'Sending…');
  status.textContent='';
  const r=await supabase.rpc('submit_collection_access_request',{
    p_plan_slug:selectedPlan,
    p_note:document.querySelector('#accessNote').value.trim()||null,
    p_coupon_code:document.querySelector('#accessCoupon').value.trim()||null
  });
  setButtonBusy(button,false);
  if(r.error){status.textContent=r.error.message;return}
  document.querySelector('#accessForm').hidden=true;
  success.hidden=false;
  success.innerHTML='<div class="state-icon">✓</div><div class="state-copy"><strong>Request received.</strong><p>'+esc(r.data?.request_code||'')+' · We will send the Payoneer payment request to your account email.</p><a class="state-action" href="/account">Account →</a></div>';
});
init().catch(err=>{
  console.error(err);
  document.querySelector('#accessStatus').textContent='Access request page could not be loaded.';
});