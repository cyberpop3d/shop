export async function fetchLiveCultsCatalog(limit=50){
  try{
    const response=await fetch('/api/cults-public?limit='+encodeURIComponent(limit),{cache:'no-store'});
    if(!response.ok)return [];
    const payload=await response.json();
    return payload?.ok&&Array.isArray(payload.results)?payload.results:[];
  }catch(error){
    console.warn('Live Cults catalog unavailable',error);
    return [];
  }
}

function publishedCollectionRows(collections){
  return (collections||[])
    .filter(collection=>collection?.slug&&collection?.starts_on&&collection.is_published!==false)
    .sort((a,b)=>String(b.starts_on).localeCompare(String(a.starts_on)));
}

function targetCollectionSlug(item,collections,snapshot){
  const date=item?.publishedAt?new Date(item.publishedAt):null;
  const rows=publishedCollectionRows(collections);
  if(date&&!Number.isNaN(date.getTime())){
    for(const collection of rows){
      const start=new Date(String(collection.starts_on)+'T00:00:00Z');
      if(Number.isNaN(start.getTime()))continue;
      const earlyWindow=new Date(start.getTime()-7*24*60*60*1000);
      if(date>=earlyWindow)return collection.slug;
    }
    const calendarSlug=item.publishedAt.slice(0,7);
    if(rows.some(collection=>collection.slug===calendarSlug)||snapshot?.[calendarSlug])return calendarSlug;
  }
  return rows[0]?.slug||Object.keys(snapshot||{}).sort().reverse()[0]||null;
}

export function mergeLiveCults(snapshot,liveItems,collections){
  const merged=Object.fromEntries(Object.entries(snapshot||{}).map(([slug,items])=>[slug,[...(items||[])]]));
  if(!Array.isArray(liveItems)||!liveItems.length)return merged;

  const known=new Set();
  Object.values(merged).flat().forEach(item=>{
    if(item?.id)known.add('id:'+item.id);
    if(item?.url)known.add('url:'+item.url);
  });

  const additions={};
  for(const item of liveItems){
    const idKey=item?.externalId?'id:'+item.externalId:null;
    const urlKey=item?.url?'url:'+item.url:null;
    if((idKey&&known.has(idKey))||(urlKey&&known.has(urlKey)))continue;
    const slug=targetCollectionSlug(item,collections,merged);
    if(!slug)continue;
    if(!additions[slug])additions[slug]=[];
    additions[slug].push({
      id:item.externalId||item.url,
      title:item.name||'Untitled design',
      url:item.url,
      imageUrl:item.imageUrl||null,
      publishedAt:item.publishedAt||null,
      live:true
    });
    if(idKey)known.add(idKey);
    if(urlKey)known.add(urlKey);
  }

  for(const [slug,items] of Object.entries(additions)){
    items.sort((a,b)=>String(b.publishedAt||'').localeCompare(String(a.publishedAt||'')));
    merged[slug]=[...items,...(merged[slug]||[])];
  }
  return merged;
}
