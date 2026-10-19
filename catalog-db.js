// Produtos públicos do Supabase. Categorias e imagens adicionais vêm do cadastro ADM.
(async()=>{
  const cfg = window.FEITO_CONFIG || {};
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) return;
  const db = window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
  const {data,error} = await db.from('products').select('*').eq('active',true).order('sort_order');
  if (error) {console.error('Catálogo:',error); const area=document.querySelector('.products'); if(area)area.innerHTML='<p class="catalog-warning" role="alert">Catálogo temporariamente indisponível. Tente atualizar a página ou fale conosco pelo WhatsApp para confirmar produtos e valores.</p>'; window.dispatchEvent(new Event('feito:catalog-error'));return;}
  const area = document.querySelector('.products');
  if (!area) return;
  const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = n => Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const photos = p => {
    const array = Array.isArray(p.image_urls) ? p.image_urls.filter(s=>typeof s==='string'&&s.trim()) : [];
    return array.length ? array : [p.image_url||'logo.jpg'];
  };
  window.feitoCatalogProducts = data || [];
  area.innerHTML = (data||[]).map(p => {
    const gallery = photos(p);
    const photoData = esc(JSON.stringify(gallery));
    return `<article class="product new-product" data-id="${esc(p.id)}" data-price="${Number(p.price)}" data-discount-min="${p.discount_min||0}" data-discount-price="${p.discount_price??''}" data-name="${esc(p.name)}" data-category="${esc(p.category||'FEITO EM FORMA')}" data-images="${photoData}" data-size="${esc(p.size)}" data-height="${esc(p.height)}" data-stock="${p.stock_quantity===null?'':Number(p.stock_quantity)}"><div class="visual standard-photo"><img src="${esc(gallery[0])}" alt="${esc(p.name)}" loading="lazy"><button class="expand" type="button" aria-label="Ampliar foto de ${esc(p.name)}">↗</button></div><div class="info"><span class="eyebrow">${esc(p.category||'FEITO EM FORMA')}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="specs"><div class="spec-box"><strong>Material</strong><span>${esc(p.material||'PLA')}</span></div><div class="spec-box"><strong>Medidas</strong><span>${esc(p.size||'A confirmar')}</span></div>${p.height?`<div class="spec-box"><strong>Altura</strong><span>${esc(p.height)}</span></div>`:''}</div><p class="stock-status ${p.stock_quantity===0?'stock-out':p.stock_quantity===null?'stock-made':'stock-ready'}">${p.stock_quantity===null?'Produzido sob encomenda':p.stock_quantity===0?'Sem unidades em estoque · consulte prazo':p.stock_quantity+' unidade(s) em estoque'}</p><div class="price"><span class="unit-price">${money(p.price)}</span><small>por unidade</small></div><p class="price-note ${p.discount_min?'discount':''}">${p.discount_min?`A partir de ${p.discount_min} unidades: ${money(p.discount_price)} cada`:'Consulte disponibilidade e prazo'}</p>${p.personalization?`<label for="custom-${p.id}">Nome(s) para personalizar</label><input id="custom-${p.id}" class="personalization" maxlength="300" placeholder="Nome(s)">`:''}<label for="qty-${p.id}">Escolha a quantidade</label><select id="qty-${p.id}" class="quantity">${[1,2,3,4,5,6,10,15,20,30,50].map(n=>`<option value="${n}">${n} unidade${n>1?'s':''}</option>`).join('')}</select><div class="subtotal">Subtotal <strong>${money(p.price)}</strong></div><button class="interest" type="button">Tenho interesse <span>↗</span></button></div></article>`;
  }).join('');
  const summary = document.querySelector('#catalogo .section-heading > p');
  if (summary) summary.textContent = `${data.length} produtos disponíveis. Escolha seus favoritos e adicione ao carrinho.`;
  window.bindCatalogCards?.();
window.dispatchEvent(new Event('feito:catalog-loaded'));
})();
