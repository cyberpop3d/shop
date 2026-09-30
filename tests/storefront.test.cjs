const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function siteContext(fetch){
  const calls=[];
  const context=vm.createContext({URL,AbortSignal,fetch,createClient:()=>({auth:{signInWithOAuth:async options=>{calls.push(options);return {data:{url:'https://accounts.google.com'},error:null}}}}),SUPABASE_URL:'https://project.supabase.co',SUPABASE_PUBLISHABLE_KEY:'public-key'});
  vm.runInContext(fs.readFileSync('site.js','utf8').replace(/^import .*$/gm,'').replace(/^export /gm,''),context);
  return {context,calls};
}
test('account redirects keep internal return paths and reject external origins',()=>{
  const {context}=siteContext();
  for(const value of ['https://evil.test','//evil.test','/\\evil.test','///evil.test',null])assert.equal(context.safeAccountPath(value),'/account');
  assert.equal(context.safeAccountPath('/account?returnTo=%2Faccess%3Fpackage%3Dannual-plus-3'),'/account?returnTo=%2Faccess%3Fpackage%3Dannual-plus-3');
  assert.equal(context.safeAccountPath('//evil.test',null),null);
});
test('Google uses the studio origin and lets customers choose their account',async()=>{
  const {context,calls}=siteContext();
  await context.signInGoogle('//evil.test');
  assert.equal(calls[0].provider,'google');
  assert.equal(calls[0].options.redirectTo,'https://cyberpopstudio.com/account');
  assert.equal(calls[0].options.queryParams.prompt,'select_account');
});
test('provider discovery distinguishes disabled Google from network failures',async()=>{
  for(const [response,expected] of [[{ok:true,json:async()=>({external:{google:true}})},true],[{ok:true,json:async()=>({external:{google:false}})},false],[{ok:false},null]]){
    const {context}=siteContext(async()=>response);
    assert.equal(await context.googleProviderReady(),expected);
  }
  const {context}=siteContext(async()=>{throw new Error('offline')});
  assert.equal(await context.googleProviderReady(),null);
});
test('hero keeps the studio logo until admin explicitly selects artwork',()=>{
  let mediaCount=0,markup='';
  const nodes={
    '#heroFeature':{classList:{toggle(){}},querySelector:()=>mediaCount?{remove(){mediaCount--}}:null,insertAdjacentHTML(_,html){mediaCount++;markup=html}},
    '#heroStudioCaption':{},'#heroCollectionLabel':{},'#heroCollectionLink':{}
  };
  class FixedDate extends Date{constructor(...args){super(...(args.length?args:['2026-09-30T00:00:00Z']))}}
  const context=vm.createContext({Date:FixedDate,Intl,document:{querySelector:s=>nodes[s]},monthLabel:d=>d.slice(0,7),mediaMarkup:(url)=>`<img src="${url}">`,esc:v=>String(v)});
  vm.runInContext(fs.readFileSync('home.js','utf8').replace(/^import .*$/gm,'').split('loadHome().catch')[0],context);
  const rows=[{slug:'2026-10',starts_on:'2026-10-01',display_name:'October'},{slug:'2026-09',starts_on:'2026-09-01',display_name:'September',product_count:16}];
  context.renderShowcase(rows,[],{}, {'2026-09':[{imageUrl:'https://art.test/september.png'}]});
  assert.equal(mediaCount,0);
  assert.equal(markup,'');
  assert.equal(nodes['#heroCollectionLink'].href,'/collection?slug=2026-09');
  assert.match(nodes['#heroCollectionLabel'].textContent,/16 models/);
  context.renderShowcase(rows,[],{home_hero:{asset_url:'https://art.test/admin.png'}},{});
  assert.equal(mediaCount,1);
  assert.match(markup,/admin.png/);
});
