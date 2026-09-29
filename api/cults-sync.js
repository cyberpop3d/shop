module.exports = async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET'){
    res.status(405).json({ok:false,error:'Method not allowed'});
    return;
  }

  // Deliberately use a fresh variable name so a previously exposed CULTS_API_KEY
  // in a deployment environment can never be reused by this endpoint.
  const username='CyberPOP';
  const apiKey=process.env.CULTS_API_KEY_ROTATED;
  const authHeader=req.headers.authorization||'';
  const accessToken=authHeader.startsWith('Bearer ')?authHeader.slice(7):'';

  if(!accessToken){
    res.status(401).json({ok:false,error:'Admin sign-in required.'});
    return;
  }

  try{
    const userResponse=await fetch('https://wdtbanucnxnwbruwcgmv.supabase.co/auth/v1/user',{
      headers:{
        'Authorization':'Bearer '+accessToken,
        'apikey':'sb_publishable_pKtNNmvdA3__Eh0KZnb2FA_3saYRIp1'
      }
    });
    const user=await userResponse.json().catch(()=>null);
    if(!userResponse.ok||!user||!user.id){
      res.status(401).json({ok:false,error:'Invalid admin session.'});
      return;
    }

    const adminResponse=await fetch('https://wdtbanucnxnwbruwcgmv.supabase.co/rest/v1/sales_admin_users?select=user_id&user_id=eq.'+encodeURIComponent(user.id),{
      headers:{
        'Authorization':'Bearer '+accessToken,
        'apikey':'sb_publishable_pKtNNmvdA3__Eh0KZnb2FA_3saYRIp1'
      }
    });
    const adminRows=await adminResponse.json().catch(()=>[]);
    if(!adminResponse.ok||!Array.isArray(adminRows)||adminRows.length===0){
      res.status(403).json({ok:false,error:'Admin authorization required.'});
      return;
    }
  }catch(error){
    res.status(401).json({ok:false,error:'Could not validate admin session.'});
    return;
  }

  if(!username||!apiKey){
    res.status(503).json({
      ok:false,
      configured:false,
      error:'The rotated Cults API credential is not configured yet.'
    });
    return;
  }

  const limit=Math.min(Math.max(Number(req.query.limit||50),1),50);
  const offset=Math.max(Number(req.query.offset||0),0);

  const query=`
    query CyberpopOwnDesigns($limit: Int!, $offset: Int!) {
      myself {
        creationsBatch(limit: $limit, offset: $offset, sort: BY_PUBLICATION) {
          total
          results {
            name(locale: EN)
            url(locale: EN)
            illustrationImageUrl
            publishedAt
            creator { nick }
          }
        }
      }
    }
  `;

  try{
    const auth=Buffer.from(username+':'+apiKey).toString('base64');
    const response=await fetch('https://cults3d.com/graphql',{
      method:'POST',
      headers:{
        'Authorization':'Basic '+auth,
        'Content-Type':'application/json',
        'User-Agent':'CyberPop-Catalog-Sync/1.0'
      },
      body:JSON.stringify({query,variables:{limit,offset}})
    });
    const body=await response.json().catch(()=>({}));
    if(!response.ok||body.errors){
      res.status(502).json({
        ok:false,
        configured:true,
        error:'Cults API request failed.',
        details:body.errors||null
      });
      return;
    }

    const batch=body&&body.data&&body.data.myself&&body.data.myself.creationsBatch;
    const results=(batch&&batch.results)||[];
    res.status(200).json({
      ok:true,
      configured:true,
      total:Number(batch&&batch.total||results.length),
      offset,
      limit,
      rateLimit:{
        limit:response.headers.get('x-ratelimit-limit'),
        remaining:response.headers.get('x-ratelimit-remaining'),
        reset:response.headers.get('x-ratelimit-reset')
      },
      results:results.map(item=>({
        name:item.name||'Untitled design',
        url:item.url,
        imageUrl:item.illustrationImageUrl||null,
        publishedAt:item.publishedAt||null,
        creator:item.creator&&item.creator.nick?item.creator.nick:username
      })).filter(item=>item.url)
    });
  }catch(error){
    res.status(500).json({ok:false,configured:true,error:error.message||'Unexpected sync error'});
  }
};
