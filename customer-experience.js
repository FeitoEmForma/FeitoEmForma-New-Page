/* Feito em Forma — experiência do cliente v5.5 */
(()=>{'use strict';
const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const dialog=document.getElementById('quick-view'),content=document.getElementById('quick-view-content');
const close=dialog?.querySelector('.quick-close');
let source=null;
const safeText=(el,selector,fallback='')=>el.querySelector(selector)?.textContent?.trim()||fallback;
function openProduct(card){
 source=card;
 const img=card.querySelector('.visual img');
 const photos=(()=>{try{return JSON.parse(card.dataset.images||'[]')}catch{return []}})();
 if(!photos.length&&img?.getAttribute('src'))photos.push(img.getAttribute('src'));
 const name=card.dataset.name||safeText(card,'h3','Produto');
 content.replaceChildren();
 const grid=document.createElement('div');grid.className='quick-grid';
 const media=document.createElement('div');media.className='quick-media';
 const hero=document.createElement('img');hero.alt=name;hero.src=photos[0]||'';media.append(hero);
 if(photos.length>1){const strip=document.createElement('div');strip.className='quick-thumbs';photos.forEach((url,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`Ver foto ${i+1}`);b.className=i===0?'selected':'';const thumb=document.createElement('img');thumb.src=url;thumb.alt='';b.append(thumb);b.addEventListener('click',()=>{hero.src=url;strip.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});strip.append(b)});media.append(strip)}
 const details=document.createElement('div');details.className='quick-details';
 const eyebrow=document.createElement('span');eyebrow.className='eyebrow';eyebrow.textContent=safeText(card,'.info .eyebrow','FEITO EM FORMA');
 const h=document.createElement('h2');h.textContent=name;
 const desc=document.createElement('p');desc.textContent=safeText(card,'.info > p','Peça produzida com carinho pela Feito em Forma.');
 const specs=document.createElement('div');specs.className='quick-specs';card.querySelectorAll('.spec-box').forEach(el=>{const c=document.createElement('div');c.textContent=el.textContent.trim();specs.append(c)});
 const price=document.createElement('strong');price.className='quick-price';price.textContent=money(card.dataset.price);
 const discount=document.createElement('p');discount.className='quick-discount';discount.textContent=safeText(card,'.price-note','Valores sujeitos à confirmação.');
 const label=document.createElement('label');label.textContent='Quantidade';label.htmlFor='quick-qty';
 const qty=document.createElement('select');qty.id='quick-qty';card.querySelectorAll('.quantity option').forEach(opt=>qty.append(opt.cloneNode(true)));qty.value=card.querySelector('.quantity')?.value||'1';
 const custom=card.querySelector('.personalization');
 let customInput=null;
 if(custom){const customLabel=document.createElement('label');customLabel.textContent='Nome(s) para personalizar';customLabel.htmlFor='quick-custom';customInput=document.createElement('input');customInput.id='quick-custom';customInput.maxLength=300;customInput.placeholder='Digite o nome ou mensagem';customInput.value=custom.value;details.append(eyebrow,h,desc,specs,price,discount,customLabel,customInput,label,qty)}
 else details.append(eyebrow,h,desc,specs,price,discount,label,qty);
 const subtotal=document.createElement('p');subtotal.className='quick-subtotal';const update=()=>{const q=Number(qty.value);const min=Number(card.dataset.discountMin||0);const discountPrice=Number(card.dataset.discountPrice);const unit=min&&q>=min&&Number.isFinite(discountPrice)?discountPrice:Number(card.dataset.price);subtotal.textContent='Subtotal estimado: '+money(unit*q)};qty.addEventListener('change',update);update();
 const actions=document.createElement('div');actions.className='quick-actions';
 const add=document.createElement('button');add.type='button';add.className='primary';add.textContent='Adicionar ao carrinho ↗';add.addEventListener('click',()=>{const originalQty=card.querySelector('.quantity');if(originalQty){originalQty.value=qty.value;originalQty.dispatchEvent(new Event('change',{bubbles:true}))}if(customInput&&custom)custom.value=customInput.value;dialog.close();(card.querySelector('.cart-quick-add')||card.querySelector('.interest'))?.click()});
 const back=document.createElement('button');back.type='button';back.className='quick-back';back.textContent='Continuar explorando';back.addEventListener('click',()=>dialog.close());
 actions.append(add,back);details.append(subtotal,actions);grid.append(media,details);content.append(grid);dialog.showModal();
}
close?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
document.addEventListener('click',e=>{
 const card=e.target.closest('.products .new-product');if(!card)return;
 if(e.target.closest('button,input,select,textarea,a,label')){if(e.target.closest('.expand')){e.preventDefault();e.stopImmediatePropagation();openProduct(card)}return}
 if(e.target.closest('.visual,.info h3')){e.preventDefault();openProduct(card)}
},true);
document.querySelectorAll('.products .new-product .visual').forEach(el=>el.title='Clique para ver os detalhes');
new MutationObserver(()=>document.querySelectorAll('.products .new-product .visual').forEach(el=>el.title='Clique para ver os detalhes')).observe(document.querySelector('.products'),{childList:true});
/* Mobile: barra de resumo usa o mesmo carrinho e mantém preços calculados pelo cart.js */
const fab=document.getElementById('cart-open'),counter=document.getElementById('cart-count'),total=document.getElementById('cart-total');
const bar=document.createElement('button');bar.type='button';bar.className='mobile-cart-summary';bar.hidden=true;bar.setAttribute('aria-label','Abrir resumo do carrinho');bar.innerHTML='<span>🛍️ <strong class="mobile-cart-count">0 itens</strong></span><span class="mobile-cart-value">Ver carrinho ↗</span>';document.body.append(bar);
bar.addEventListener('click',()=>fab.click());
const refresh=()=>{const n=Number(counter.textContent||0);bar.hidden=n===0;bar.querySelector('.mobile-cart-count').textContent=n+' '+(n===1?'item':'itens');bar.querySelector('.mobile-cart-value').textContent=(total.textContent||'')+' · Ver carrinho ↗'};
new MutationObserver(refresh).observe(counter,{childList:true,characterData:true,subtree:true});new MutationObserver(refresh).observe(total,{childList:true,characterData:true,subtree:true});refresh();
/* Personalização: fotos de referência são enviadas pelo cliente na conversa WhatsApp, não coletadas pelo GitHub Pages. */
const idea=document.getElementById('idea-form');
if(idea){const box=document.createElement('div');box.className='reference-note';box.innerHTML='<strong>Tem foto, logo ou desenho de referência?</strong><p>Após abrir a conversa, envie o arquivo diretamente pelo WhatsApp. Assim conseguimos avaliar sua ideia com mais precisão.</p>';idea.querySelector('button[type=submit]')?.before(box)}
})();
