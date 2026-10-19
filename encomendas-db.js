// Encomendas realizadas: carregadas do Supabase, somente para visualização.
(async () => {
  'use strict';
  const cfg=window.FEITO_CONFIG || {};
  if(!cfg.supabaseUrl||!cfg.supabaseAnonKey||!window.supabase)return; // mantém a galeria anterior como fallback
  const db=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
  const {data,error}=await db.from('completed_orders').select('id,title,category,description,instagram_url,image_urls,sort_order').eq('active',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false});
  if(error){console.error('Encomendas realizadas:',error);return;}
  const grid=document.querySelector('.portfolio-grid');if(!grid)return;
  grid.replaceChildren();
  const instagramUrl=value=>{
    if(!value)return null;
    try {
      const u=new URL(value);
      if(u.protocol==='https:'&&['instagram.com','www.instagram.com'].includes(u.hostname.toLowerCase())&&/^\/(p|reel|tv)\/[^/]+\/?$/i.test(u.pathname))return u.href;
    }catch{}
    return null;
  };
  const node=(tag,classes,text)=>{
    const e=document.createElement(tag);
    if(classes)e.className=classes;
    if(text!==undefined)e.textContent=text;
    return e;
  };
  for(const work of data||[]){
    const photos=Array.isArray(work.image_urls)?work.image_urls.filter(url=>typeof url==='string'&&url.trim()):[];
    const card=node('article','portfolio-card');card.dataset.category=work.category||'Encomendas realizadas';card.dataset.images=JSON.stringify(photos);
    const button=node('button','portfolio-photo');button.type='button';button.setAttribute('aria-label',`Ampliar foto: ${work.title}`);
    const image=node('img');image.src=photos[0]||'logo.jpg';image.alt=`${work.title} — Feito em Forma`;image.loading='lazy';
    const mark=node('span','', '↗');mark.setAttribute('aria-hidden','true');button.append(image,mark);
    const info=node('div','portfolio-info');
    const category=node('span','eyebrow',work.category||'Encomendas realizadas');
    const title=node('h2','',work.title);const description=node('p','',work.description||'');info.append(category,title,description);
    const url=instagramUrl(work.instagram_url);
    if(url){const link=node('a','source-link','Ver publicação no Instagram ↗');link.href=url;link.target='_blank';link.rel='noopener noreferrer';info.append(link);}
    card.append(button,info);grid.append(card);
  }
  const note=document.querySelector('.portfolio-note');
  if(note)note.textContent='Trabalhos já realizados pela Feito em Forma. Veja as fotos e, quando disponível, a publicação original no Instagram.';
  const empty=document.getElementById('gallery-empty');
  if(empty)empty.hidden=(data||[]).length!==0;
  window.bindCompletedOrdersGallery?.();
})();
