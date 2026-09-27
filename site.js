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
export function stateMarkup(type,title,copy){
  return '<div class="state-card '+esc(type||'')+'"><strong>'+esc(title)+'</strong><p>'+esc(copy)+'</p></div>';
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
  if(!footer||footer.querySelector('.global-legal-footer'))return;
  const row=document.createElement('div');
  row.className='site-shell global-legal-footer';
  row.innerHTML='<div class="global-legal-links"><a href="/terms">Terms</a><a href="/rights-of-use">Rights of Use</a><a href="/privacy">Privacy</a><a href="/refund-policy">Refund Policy</a><a href="/ip-policy">IP / Rights Holder</a><a href="/rights-center">Rights Center</a><a href="/license-faq">License FAQ</a></div><p>CyberPop creates independent digital designs, including original works and unofficial fan-created interpretations. Third-party names and properties remain the property of their respective rights holders. Rights holders may contact <a href="mailto:rights@yontuk.com">rights@yontuk.com</a>.</p>';
  footer.appendChild(row);
}
export async function initChrome(){
  ensureGlobalLegalFooter();
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
  return session;
}
