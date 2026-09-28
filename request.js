import { supabase,initChrome,getSession,setButtonBusy,esc } from '/site.js';

const ISO_CODES=`AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(' ');
const display=new Intl.DisplayNames(['en'],{type:'region'});
const countries=ISO_CODES.map(code=>({code,name:display.of(code)||code})).sort((a,b)=>a.name.localeCompare(b.name));
const countryInput=document.querySelector('#requestCountry');
document.querySelector('#countryOptions').innerHTML=countries.map(x=>'<option value="'+esc(x.name)+'">'+x.code+'</option>').join('');

function countryCode(value){
  const v=String(value||'').trim();
  const upper=v.toUpperCase();
  return countries.find(x=>x.code===upper)?.code||countries.find(x=>x.name.toLowerCase()===v.toLowerCase())?.code||null;
}

async function prefill(){
  const session=await initChrome();
  if(!session)return;
  document.querySelector('#requestEmail').value=session.user.email||'';
  const profile=await supabase.from('member_profiles').select('country_code').eq('user_id',session.user.id).maybeSingle();
  if(!profile.error&&profile.data?.country_code){
    const row=countries.find(x=>x.code===profile.data.country_code);
    if(row)countryInput.value=row.name;
  }
}

document.querySelector('#requestForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const button=document.querySelector('#requestSubmit');
  const status=document.querySelector('#requestStatus');
  const success=document.querySelector('#requestSuccess');
  const code=countryCode(countryInput.value);
  if(!code){status.textContent='Choose a valid country / region from the list.';return}
  if(!document.querySelector('#requestConsent').checked){status.textContent='Please confirm the required acknowledgement.';return}

  setButtonBusy(button,true,'Submitting…');
  status.textContent='Creating your request…';
  success.hidden=true;

  const r=await supabase.rpc('submit_service_request',{
    p_first_name:document.querySelector('#firstName').value.trim(),
    p_last_name:document.querySelector('#lastName').value.trim(),
    p_email:document.querySelector('#requestEmail').value.trim(),
    p_country_code:code,
    p_request_type:document.querySelector('#requestType').value,
    p_subject:document.querySelector('#requestSubject').value.trim()||null,
    p_brief:document.querySelector('#requestBrief').value.trim()
  });

  setButtonBusy(button,false);
  if(r.error){status.textContent=r.error.message;return}

  const data=r.data||{};
  status.textContent='';
  document.querySelector('#requestForm').hidden=true;
  success.hidden=false;
  success.innerHTML='<div class="state-icon">✓</div><div class="state-copy"><strong>Request received.</strong><p>Reference: '+esc(data.request_code||'—')+'. We will review the request and contact you at the email you provided with scope and pricing. No payment has been taken.</p><a class="state-action" href="/account">Open your CyberPop account →</a></div>';
});

prefill().catch(console.error);
