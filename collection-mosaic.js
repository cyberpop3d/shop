import {mediaMarkup} from '/site.js';

const monthStart=date=>String(date||'').slice(0,7);
export function isOngoingCollection(c){
  return Boolean(c.is_latest_collection)||monthStart(c.starts_on)===new Date().toISOString().slice(0,7);
}
export function mosaicMedia(c,items=[],fallback=''){
  const all=items.map(x=>typeof x==='string'?x:x?.imageUrl||x?.thumbnail_url).filter(Boolean);
  const selected=c.cover_image_url||all[0]||fallback;
  const images=selected?[selected,...all.filter(url=>url!==selected)].slice(0,16):[];
  const ongoing=isOngoingCollection(c);
  const cells=Array.from({length:17},(_,i)=>{
    const url=images[i];
    return '<span class="collection-mosaic-cell '+(i===0?'feature ':'')+(!url?'classified':'')+'">'+
      (url?mediaMarkup(url,(c.display_name||'CyberPop')+' Collection #'+(i+1)):
        '<span class="classified-mark" aria-hidden="true"><i>✳</i><b>CLASSIFIED</b><small>CYBERPOP / '+String(i+1).padStart(2,'0')+'</small></span>')+'</span>';
  }).join('');
  return '<div class="collection-mosaic">'+cells+'</div>'+
    (ongoing?'<span class="collection-ongoing"><i></i>ONGOING COLLECTION</span>':'');
}
