import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.1';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '/supabase-config.js';

export const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
export const $=s=>document.querySelector(s);
export const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

export function monthLabel(date){
  return new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(new Date(date+'T12:00:00'));
}
export function money(amount,currency='USD'){
  return new Intl.NumberFormat('en-US',{style:'currency',currency,maximumFractionDigits:0}).format(Number(amount||0));
}
export function stateMarkup(type,title,copy,action=null){
  const kind=type||'empty';
  const icons={empty:'◇',error:'!',locked:'⌁',success:'✓',maintenance:'◌',auth:'↗'};
  const icon=icons[kind]||'◇';
  const actionHtml=action&&action.href&&action.label
    ? '<a class="state-action" href="'+esc(action.href)+'">'+esc(action.label)+' →</a>'
    : '';
  return '<div class="state-card '+esc(kind)+'"><div class="state-icon">'+esc(icon)+'</div><div class="state-copy"><strong>'+esc(title)+'</strong><p>'+esc(copy)+'</p>'+actionHtml+'</div></div>';
}
export function loadingMarkup(count=4,variant='card'){
  const total=Math.max(1,Math.min(12,Number(count)||1));
  return Array.from({length:total},()=>'<div class="skeleton skeleton-'+esc(variant)+'"><span></span></div>').join('');
}
export function friendlyError(error,fallback='Something went wrong.'){
  const raw=String(error?.message||error||'').toLowerCase();
  if(!raw)return fallback;
  if(raw.includes('failed to fetch')||raw.includes('network'))return 'Network connection interrupted. Try again.';
  if(raw.includes('jwt')||raw.includes('session'))return 'Your session needs to be refreshed. Sign in again.';
  if(raw.includes('permission')||raw.includes('row-level')||raw.includes('rls'))return 'This action is not available for this account.';
  return fallback;
}
export function showToast(message,type='success'){
  let host=document.querySelector('.site-toast');
  if(!host){host=document.createElement('div');host.className='site-toast';document.body.appendChild(host)}
  host.textContent=message;
  host.className='site-toast '+esc(type)+' show';
  clearTimeout(showToast._timer);
  showToast._timer=setTimeout(()=>host.className='site-toast',2800);
}
export function setButtonBusy(button,busy,label='Working…'){
  if(!button)return;
  if(busy){
    if(!button.dataset.originalLabel)button.dataset.originalLabel=button.textContent;
    button.disabled=true;button.classList.add('is-busy');button.textContent=label;
  }else{
    button.disabled=false;button.classList.remove('is-busy');
    if(button.dataset.originalLabel){button.textContent=button.dataset.originalLabel;delete button.dataset.originalLabel}
  }
}
export function ensureNetworkState(){
  let pill=document.querySelector('.network-state');
  if(!pill){pill=document.createElement('div');pill.className='network-state';pill.textContent='Offline';document.body.appendChild(pill)}
  const sync=()=>pill.classList.toggle('show',!navigator.onLine);
  window.addEventListener('online',sync);window.addEventListener('offline',sync);sync();
}

export async function getSiteMediaSlots(){
  const r=await supabase.from('site_media_slots').select('*');
  if(r.error)throw r.error;
  return Object.fromEntries((r.data||[]).map(x=>[x.slot_key,x]));
}
export function setMediaImage(container,imageUrl,label='MEDIA'){
  if(!container)return;
  const img=container.querySelector('img');
  const placeholder=container.querySelector('.media-placeholder');
  if(imageUrl&&img){img.src=imageUrl;img.hidden=false;if(placeholder)placeholder.hidden=true}
  else{if(img){img.removeAttribute('src');img.hidden=true}if(placeholder){placeholder.hidden=false;const span=placeholder.querySelector('span');if(span&&label)span.textContent=label}}
}
export async function getSession(){
  const r=await supabase.auth.getSession();
  return r.data.session||null;
}
export async function ensureCustomerProfile(session){
  if(!session||!session.user||!session.user.email)return;

  const existing=await supabase.from('membership_customers').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(existing.error)throw existing.error;
  if(!existing.data){
    const created=await supabase.from('membership_customers').insert({
      user_id:session.user.id,
      full_name:null,
      email:session.user.email,
      client_type:'professional'
    });
    if(created.error&&created.error.code!=='23505')throw created.error;
  }

  const profileExisting=await supabase.from('member_profiles').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(profileExisting.error)throw profileExisting.error;
  if(!profileExisting.data){
    const profileCreated=await supabase.from('member_profiles').insert({
      user_id:session.user.id,
      display_name:null
    });
    if(profileCreated.error&&profileCreated.error.code!=='23505')throw profileCreated.error;
  }
}
export async function googleProviderReady(){
  try{
    const response=await fetch(SUPABASE_URL+'/auth/v1/settings',{headers:{apikey:SUPABASE_PUBLISHABLE_KEY}});
    if(!response.ok)return false;
    const data=await response.json();
    return Boolean(data&&data.external&&data.external.google);
  }catch(_){return false}
}
export async function signInGoogle(redirectPath='/account'){
  return supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+redirectPath}});
}
export async function signInWithPassword(email,password){
  return supabase.auth.signInWithPassword({email,password});
}
export async function signUpWithPassword(email,password,redirectPath='/account'){
  return supabase.auth.signUp({
    email,password,
    options:{emailRedirectTo:location.origin+redirectPath}
  });
}
export async function resendSignupConfirmation(email,redirectPath='/account'){
  return supabase.auth.resend({
    type:'signup',email,
    options:{emailRedirectTo:location.origin+redirectPath}
  });
}
export async function signOut(){
  await supabase.auth.signOut();
}
export async function getCreditSummary(){
  const session=await getSession();
  if(!session)return {balance:0,transaction_count:0};
  const r=await supabase.rpc('get_my_credit_summary');
  if(r.error)throw r.error;
  const row=Array.isArray(r.data)?r.data[0]:r.data;
  return {balance:Number(row?.balance||0),transaction_count:Number(row?.transaction_count||0)};
}
export function syncHeader(session,creditBalance=0,handle=null){
  const label=session&&session.user?(handle?'@'+handle:session.user.email.split('@')[0]):'Account';
  document.querySelectorAll('[data-account-label]').forEach(el=>el.textContent=label);
  const nav=document.querySelector('.site-nav');
  if(nav&&session){
    let credit=nav.querySelector('.credit-chip');
    if(!credit){
      credit=document.createElement('a');
      credit.className='credit-chip';
      credit.href='/account#credits';
      const account=nav.querySelector('.account-chip')||nav.lastElementChild;
      nav.insertBefore(credit,account);
    }
    credit.innerHTML='◇ <strong data-credit-balance>'+Number(creditBalance||0)+'</strong> C';
  }else if(nav){
    nav.querySelector('.credit-chip')?.remove();
  }
  const toggle=document.querySelector('.menu-toggle');
  if(toggle&&nav)toggle.onclick=()=>nav.classList.toggle('open');
}
export function ensureGlobalLegalFooter(){
  const footer=document.querySelector('.footer');
  if(!footer||footer.querySelector('.global-legal-footer')||footer.querySelector('a[href="/terms"]'))return;
  const row=document.createElement('div');
  row.className='site-shell global-legal-footer';
  row.innerHTML='<div class="global-legal-links"><a href="/terms">Terms</a><a href="/rights-of-use">Rights of Use</a><a href="/privacy">Privacy</a><a href="/refund-policy">Refund Policy</a><a href="/ip-policy">IP / Rights Holder</a><a href="/rights-center">Rights Center</a><a href="/license-faq">License FAQ</a></div><p>CyberPop creates independent digital designs, including original works and unofficial fan-created interpretations. Third-party names and properties remain the property of their respective rights holders. Rights holders may contact <a href="mailto:rights@yontuk.com">rights@yontuk.com</a>.</p>';
  footer.appendChild(row);
}
export async function initChrome(){
  ensureGlobalLegalFooter();
  ensureNetworkState();
  const session=await getSession();
  let balance=0;
  let handle=null;
  if(session){
    await ensureCustomerProfile(session);
    try{balance=(await getCreditSummary()).balance}catch(error){console.warn('Credit summary unavailable',error)}
    try{
      const p=await supabase.from('member_profiles').select('handle').eq('user_id',session.user.id).maybeSingle();
      if(!p.error)handle=p.data?.handle||null;
    }catch(_){}
  }
  syncHeader(session,balance,handle);
  requestAnimationFrame(()=>document.body.classList.add('page-ready'));
  return session;
}
