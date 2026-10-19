// Galeria de trabalhos realizados. Sem orçamento, vendas ou carrinho.
(() => {
  'use strict';
  const lightbox = document.getElementById('lightbox');
  const filter = document.getElementById('gallery-filter');
  if(!lightbox || !filter) return;
  const lightboxImage=lightbox.querySelector('img');
  const lightboxCount=lightbox.querySelector('.order-lightbox-count');
  const lightboxPrevious=lightbox.querySelector('.order-lightbox-prev');
  const lightboxNext=lightbox.querySelector('.order-lightbox-next');
  let selected=null;

  const getImages = card => {
    let images=[];
    try { images=JSON.parse(card.dataset.images || '[]'); } catch {}
    if (!Array.isArray(images)) images=[];
    images=images.filter(s=>typeof s==='string'&&s.trim());
    if (!images.length) {
      const src=card.querySelector('.portfolio-photo img')?.getAttribute('src');
      if(src)images.push(src);
    }
    return images;
  };
  function switchImage(card,increment){
    const photos=card._photos||[];
    if(!photos.length)return;
    card._selectedPhoto=(card._selectedPhoto+increment+photos.length)%photos.length;
    const image=card.querySelector('.portfolio-photo img');
    image.src=photos[card._selectedPhoto];
    image.alt=`${card.querySelector('.portfolio-info h2')?.textContent || 'Trabalho'} — foto ${card._selectedPhoto+1} de ${photos.length}`;
    const count=card.querySelector('.order-photo-count');
    if(count)count.textContent=`${card._selectedPhoto+1} / ${photos.length}`;
    if(selected===card)renderLightbox();
  }
  function renderLightbox(){
    if(!selected)return;
    const photos=selected._photos;
    lightboxImage.src=photos[selected._selectedPhoto];
    lightboxImage.alt=`${selected.querySelector('h2')?.textContent||'Trabalho'} — foto ${selected._selectedPhoto+1} de ${photos.length}`;
    const many=photos.length>1;
    lightboxPrevious.hidden=!many;
    lightboxNext.hidden=!many;
    lightboxCount.textContent=many?`${selected._selectedPhoto+1} / ${photos.length}`:'';
  }
  function bindCards(){
    document.querySelectorAll('.portfolio-card').forEach(card=>{
      if(card.dataset.initializedGallery==='1')return;
      card.dataset.initializedGallery='1';
      const images=getImages(card);
      if(!images.length)return;
      card._photos=images;card._selectedPhoto=0;
      const mainButton=card.querySelector('.portfolio-photo');
      mainButton.addEventListener('click',()=>{selected=card;renderLightbox();lightbox.showModal();});
      if(images.length>1){
        const wrapper=document.createElement('div');wrapper.className='order-photo-wrap';
        mainButton.parentNode.insertBefore(wrapper,mainButton);wrapper.append(mainButton);
        const prev=document.createElement('button');prev.type='button';prev.className='order-photo-arrow order-photo-prev';prev.setAttribute('aria-label','Foto anterior');prev.textContent='‹';
        const next=document.createElement('button');next.type='button';next.className='order-photo-arrow order-photo-next';next.setAttribute('aria-label','Próxima foto');next.textContent='›';
        const count=document.createElement('span');count.className='order-photo-count';count.setAttribute('aria-live','polite');
        prev.addEventListener('click',()=>switchImage(card,-1));next.addEventListener('click',()=>switchImage(card,1));
        wrapper.append(prev,next,count);switchImage(card,0);
      }
    });
    const selectedFilter=filter.value;
    const categories=[...new Set([...document.querySelectorAll('.portfolio-card')].map(card=>card.dataset.category?.trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    filter.replaceChildren(new Option('Todos',''));
    categories.forEach(category=>filter.append(new Option(category,category)));
    filter.value=categories.includes(selectedFilter)?selectedFilter:'';
    refreshFilter();
  }
  function refreshFilter(){
    let count=0;
    document.querySelectorAll('.portfolio-card').forEach(card=>{
      card.hidden=!!filter.value&&card.dataset.category!==filter.value;
      if(!card.hidden)count++;
    });
    document.getElementById('gallery-count').textContent=`${count} ${count===1?'trabalho':'trabalhos'}`;
  }
  filter.addEventListener('change',refreshFilter);
  lightboxPrevious.addEventListener('click',()=>{if(selected)switchImage(selected,-1);});
  lightboxNext.addEventListener('click',()=>{if(selected)switchImage(selected,1);});
  lightbox.addEventListener('keydown',event=>{
    if(!selected || selected._photos?.length<2)return;
    if(event.key==='ArrowLeft'){event.preventDefault();switchImage(selected,-1);}
    if(event.key==='ArrowRight'){event.preventDefault();switchImage(selected,1);}
  });
  lightbox.querySelector('.close')?.addEventListener('click',()=>lightbox.close());
  lightbox.addEventListener('click',event=>{
    const r=lightbox.getBoundingClientRect();
    if(event.target===lightbox&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))lightbox.close();
  });
  lightbox.addEventListener('close',()=>{selected=null;});
  window.bindCompletedOrdersGallery=bindCards;
  bindCards();
})();
