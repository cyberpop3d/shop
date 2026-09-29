module.exports = async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  try{
    const response=await fetch('https://wdtbanucnxnwbruwcgmv.supabase.co/auth/v1/settings',{
      headers:{apikey:'sb_publishable_pKtNNmvdA3__Eh0KZnb2FA_3saYRIp1'}
    });
    const data=await response.json().catch(()=>null);
    res.status(response.ok?200:502).json({
      ok:response.ok,
      google:Boolean(data&&data.external&&data.external.google)
    });
  }catch(error){
    res.status(500).json({ok:false,google:false});
  }
};