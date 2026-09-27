import {supabase,initChrome,esc} from '/site.js';
await initChrome();
const type=document.querySelector('#reportType');
function syncAuthority(){const rights=type.value==='rights_holder';document.querySelector('#authorityLabel').hidden=!rights;document.querySelector('#authorityConfirmed').required=rights}
type.onchange=syncAuthority;syncAuthority();
document.querySelector('#rightsReportForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const status=document.querySelector('#rightsReportStatus');
  status.textContent='Submitting…';
  const row={
    report_type:type.value,
    reporter_name:document.querySelector('#reporterName').value.trim(),
    company:document.querySelector('#reportCompany').value.trim()||null,
    contact_email:document.querySelector('#reportEmail').value.trim(),
    relevant_ip:document.querySelector('#reportIp').value.trim()||null,
    cyberpop_url:document.querySelector('#reportCyberpopUrl').value.trim()||null,
    external_url:document.querySelector('#reportExternalUrl').value.trim()||null,
    explanation:document.querySelector('#reportExplanation').value.trim(),
    authority_confirmed:type.value==='rights_holder'?document.querySelector('#authorityConfirmed').checked:false,
    status:'submitted'
  };
  const r=await supabase.from('rights_reports').insert(row);
  if(r.error){status.textContent=r.error.message;return}
  e.target.reset();syncAuthority();status.textContent='Report received. CyberPop will review the submission.';
});