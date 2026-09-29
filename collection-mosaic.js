import {esc,mediaMarkup} from '/site.js';

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

let overlay;
function ensureOverlay(){
  if(overlay)return overlay;
  overlay=document.createElement('div');overlay.className='collection-hover-preview';
  overlay.setAttribute('aria-hidden','true');document.body.append(overlay);return overlay;
}
export function bindCollectionPreviews(root=document){
  const popup=ensureOverlay();
  const hide=()=>{popup.classList.remove('visible');popup.setAttribute('aria-hidden','true')};
  root.querySelectorAll('.collection-mosaic-tile').forEach(tile=>{
    const show=()=>{
      if(!matchMedia('(hover:hover) and (min-width:901px)').matches)return;
      const media=tile.querySelector('.collection-tile-media');
      const r=tile.getBoundingClientRect();
      const width=Math.min(660,innerWidth-48),height=width;
      const left=Math.min(Math.max(r.left+r.width/2-width/2,24),innerWidth-width-24);
      const top=Math.min(Math.max(r.top+r.height/2-height/2,78),innerHeight-height-24);
      popup.style.left=left+'px';popup.style.top=top+'px';popup.style.width=width+'px';
      popup.innerHTML=media.innerHTML+'<span class="hover-preview-hint">CLICK TO VIEW COLLECTION ↗</span>';
      popup.classList.add('visible');popup.setAttribute('aria-hidden','false');
    };
    tile.addEventListener('pointerenter',show);tile.addEventListener('pointerleave',hide);
    tile.addEventListener('focusin',show);tile.addEventListener('focusout',hide);
  });
  window.addEventListener('scroll',hide,{passive:true});
}
