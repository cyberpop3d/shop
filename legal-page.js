import { supabase,initChrome,esc,stateMarkup } from '/site.js';

const type=document.body.dataset.documentType;
const FALLBACK={
  terms_of_use:{
    title:'Terms of Use',
    summary:'Draft policy summary — not yet effective.',
    sections:[
      ['What CyberPop provides','CyberPop is an independent digital design studio and platform offering digital 3D design work, printable-file access, memberships, credits and product-specific licenses. Buying access does not transfer copyright or intellectual-property ownership.'],
      ['Account and platform use','Users must use their own account and must not use CyberPop services for piracy, credential sharing, automated scraping, payment fraud or other severe abuse. Mandatory rights under applicable law are not excluded.'],
      ['Digital products','Digital files are licensed rather than sold as intellectual-property ownership. File access, Library availability and downloads may be affected by valid legal takedowns, court orders, sanctions, fraud, severe account abuse or technical shutdown.'],
      ['Physical prints','Unless a separate Seller License or product-specific commercial physical-print permission applies, digital files are for personal/non-commercial use. Independent physical sellers remain responsible for their own manufacturing, materials, safety, labeling, taxes and marketplace compliance.']
    ]
  },
  rights_of_use:{
    title:'Rights of Use',
    summary:'Draft license summary — not yet effective.',
    sections:[
      ['Default license','CyberPop digital files are personal/non-commercial hobby-use files unless a separate Seller License or product-specific physical-print permission expressly applies.'],
      ['Digital redistribution prohibited','STL, 3MF, OBJ, ZIP files, download links and modified digital derivatives may not be sold, shared, uploaded, sublicensed or redistributed through Telegram, Discord, torrent, shared drives, file hosts, marketplaces, piracy sites or private communities.'],
      ['Modifications do not create redistribution rights','Resizing, splitting, hollowing, repairing, remeshing, adding supports, topology edits, sculpt edits, color changes, conversion or combining meshes does not create a right to redistribute the digital file.'],
      ['Third-party rights','Any permission granted by CyberPop applies only to rights CyberPop owns or is legally entitled to license. It does not grant third-party copyright, trademark, character-merchandising or franchise rights.']
    ]
  },
  privacy_policy:{
    title:'Privacy Policy',
    summary:'Draft privacy architecture summary — not yet effective.',
    sections:[
      ['Account identity','CyberPop account identity is based on verified email and username. Legal first and last name are not required merely to browse, favorite models, create an account or build a Library.'],
      ['Country / region','Country is private and is never displayed publicly. It may be processed internally when legitimately needed for service operation, fraud prevention, tax/compliance, payment processing or legal obligations.'],
      ['Payment identity','If a transaction requires legal name or billing information, that payment identity is kept separate from the public CyberPop username and should only collect data actually required by the payment workflow.'],
      ['Service providers','Authentication, payment, analytics, transactional email and similar providers may process data where necessary to operate the service. CyberPop should avoid collecting unnecessary personal data.']
    ]
  },
  refund_policy:{
    title:'Refund Policy',
    summary:'Draft refund-policy summary — not yet effective.',
    sections:[
      ['Digital delivery','Where legally valid consent for immediate digital delivery has been obtained and digital content has been made available, change-of-mind reasons may not automatically create a refund right to the extent permitted by applicable law.'],
      ['Supportable refund cases','Examples requiring support/review include non-delivery, wrong product, materially corrupted files, duplicate charges, material mismatch from description and mandatory statutory remedies.'],
      ['Refunds and credits','Refund and chargeback handling must remain linked to the corresponding payment, credits, entitlement and download state. Records should be adjusted through explicit business logic rather than silently deleting history.'],
      ['Mandatory rights','Nothing in this policy excludes consumer remedies or liability that cannot legally be excluded.']
    ]
  },
  ip_policy:{
    title:'IP / Rights Holder Policy',
    summary:'Draft IP policy summary — not yet effective.',
    sections:[
      ['Independent studio position','CyberPop operates under its own brand and does not represent third-party fan-created work as official, licensed, authorized, approved or endorsed by the respective rights holder.'],
      ['Unofficial fan-created work','CyberPop does not claim ownership of third-party characters, trademarks, brands or fictional properties. Any CyberPop license applies only to rights CyberPop is legally entitled to grant.'],
      ['Rights-holder review','A rights holder or authorized representative may identify the relevant IP, CyberPop URL, authority and contact information through the Rights Center. A verified request may result in legal review, suspension, takedown or a permanent do-not-publish block.'],
      ['No admission','Removal or suspension in response to a notice does not by itself constitute an admission of infringement or liability.']
    ]
  },
  seller_license_terms:{
    title:'Seller License Terms',
    summary:'Draft Seller License summary — not yet effective.',
    sections:[
      ['Scope','A CyberPop Seller License, where active, is limited to physical prints produced from authorized CyberPop design files. It is account-bound, non-transferable and does not permit digital-file redistribution.'],
      ['Third-party IP','Seller permission covers only rights CyberPop owns or controls. It does not grant rights in third-party characters, trademarks, brands, franchises or fictional properties.'],
      ['Independent manufacturing','The seller independently manufactures and sells physical products and is responsible for printer calibration, material choice, safety, assembly, warnings, labeling, packaging, shipping, taxes and marketplace obligations.'],
      ['Seller identification','Where required by the applicable Seller License, a seller may identify themselves as a “Licensed CyberPop Seller” solely to describe CyberPop physical-print permission, not as an official license from any third-party rights holder.']
    ]
  },
  credits_terms:{
    title:'Credits Terms',
    summary:'Draft credits summary — not yet effective.',
    sections:[
      ['Closed-loop units','Credits are closed-loop CyberPop platform usage units. They are usable only within CyberPop, are not user-to-user transferable, cannot be sent to outside sellers, do not produce interest and are not marketed as cryptocurrency or an investment product.'],
      ['Pricing','A model’s credit price must be shown before unlock. The backend—not browser-supplied values—determines the authoritative price and available balance.'],
      ['Unlocks','A successful credit unlock creates a product entitlement in one atomic server-authorized transaction. Duplicate requests must not double-charge credits.'],
      ['Refunds and chargebacks','Payment reversals, refunds and chargebacks must be reconciled with the credit ledger and related entitlements through explicit business rules rather than deleting history.']
    ]
  }
};

function draftMarkup(f){
  return '<div class="legal-draft-banner"><strong>DRAFT · NOT YET EFFECTIVE</strong><span>'+esc(f.summary)+'</span></div>'+
    f.sections.map(([h,p])=>'<section><h2>'+esc(h)+'</h2><p>'+esc(p)+'</p></section>').join('');
}
function markdownToHtml(md){
  const lines=String(md||'').replace(/\r/g,'').split('\n');
  let html='',list=false;
  const closeList=()=>{if(list){html+='</ul>';list=false}};
  for(const raw of lines){
    const line=raw.trim();
    if(!line){closeList();continue}
    if(line.startsWith('### ')){closeList();html+='<h3>'+esc(line.slice(4))+'</h3>';continue}
    if(line.startsWith('## ')){closeList();html+='<h2>'+esc(line.slice(3))+'</h2>';continue}
    if(line.startsWith('# ')){closeList();html+='<h1>'+esc(line.slice(2))+'</h1>';continue}
    if(line.startsWith('- ')){if(!list){html+='<ul>';list=true}html+='<li>'+esc(line.slice(2))+'</li>';continue}
    closeList();html+='<p>'+esc(line)+'</p>';
  }
  closeList();return html;
}
async function load(){
  await initChrome();
  const fallback=FALLBACK[type]||{title:'CyberPop Legal',summary:'Draft — not yet effective.',sections:[]};
  document.querySelector('#legalTitle').textContent=fallback.title.toUpperCase();
  document.title=fallback.title+' — CyberPop';
  const r=await supabase.from('legal_documents').select('*').eq('document_type',type).eq('status','published').eq('is_current',true).maybeSingle();
  if(r.error)throw r.error;
  const badge=document.querySelector('#legalVersion');
  const content=document.querySelector('#legalContent');
  if(!r.data){
    badge.textContent='DRAFT';
    content.innerHTML=draftMarkup(fallback);
    return;
  }
  badge.textContent=r.data.version;
  document.querySelector('#legalEffective').textContent=r.data.effective_at?'Effective '+new Date(r.data.effective_at).toLocaleDateString():'Published version';
  content.innerHTML=markdownToHtml(r.data.content_markdown);
}
load().catch(err=>{
  console.error(err);
  document.querySelector('#legalContent').innerHTML=stateMarkup('error','Legal page unavailable','This document could not be loaded right now.');
});