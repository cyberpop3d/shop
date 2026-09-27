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
export async function getSession(){
  const r=await supabase.auth.getSession();
  return r.data.session||null;
}
export async function ensureCustomerProfile(session){
  if(!session||!session.user||!session.user.email)return;
  const meta=session.user.user_metadata||{};
  const fallback=session.user.email.split('@')[0].replace(/[._-]+/g,' ').trim()||'Member';
  const fullName=String(meta.full_name||meta.name||fallback).trim();

  const existing=await supabase.from('membership_customers').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(existing.error)throw existing.error;
  if(!existing.data){
    const created=await supabase.from('membership_customers').insert({
      user_id:session.user.id,full_name:fullName,email:session.user.email,client_type:'professional'
    });
    if(created.error&&created.error.code!=='23505')throw created.error;
  }

  const profileExisting=await supabase.from('member_profiles').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(profileExisting.error)throw profileExisting.error;
  if(!profileExisting.data){
    const profileCreated=await supabase.from('member_profiles').insert({
      user_id:session.user.id,
      display_name:fullName
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
export async function sendMagicLink(email,redirectPath='/account'){
  return supabase.auth.signInWithOtp({email:email,options:{emailRedirectTo:location.origin+redirectPath}});
}
export async function signOut(){
  await supabase.auth.signOut();
}
export function syncHeader(session){
  const label=session&&session.user?session.user.email.split('@')[0]:'Account';
  document.querySelectorAll('[data-account-label]').forEach(el=>el.textContent=label);
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.site-nav');
  if(toggle&&nav)toggle.onclick=()=>nav.classList.toggle('open');
}
export async function initChrome(){
  const session=await getSession();
  if(session)await ensureCustomerProfile(session);
  syncHeader(session);
  return session;
}
