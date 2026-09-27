module.exports = async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET'){
    res.status(405).json({ok:false,error:'Method not allowed'});
    return;
  }

  const username=process.env.CULTS_USERNAME;
  const apiKey=process.env.CULTS_API_KEY;

  if(!username||!apiKey){
    res.status(503).json({
      ok:false,
      configured:false,
      error:'Cults API credentials are not configured yet.'
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
