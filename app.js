// Catálogo Feito em Forma — filtros automáticos, galeria de fotos e orçamento.
const money = value => Number(value).toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
const normalizeSearch = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();

function refreshCatalogFilters() {
  const area = document.querySelector('#catalogo .products');
  if (!area) return;
  const cards = [...area.querySelectorAll('.new-product')];
  const categorySelect = document.getElementById('category-filter');
  const search = document.getElementById('product-search');
  const resultCount = document.getElementById('catalog-results');
  const empty = document.getElementById('catalog-empty');
  if (!categorySelect || !search) return;

  const selected = categorySelect.value;
  const categories = [...new Set(cards.map(card =>
    (card.dataset.category || card.querySelector('.info > .eyebrow')?.textContent || '').trim()
  ).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'pt-BR'));

  categorySelect.replaceChildren(new Option('Todas as categorias', ''));
  categories.forEach(category => categorySelect.add(new Option(category, category)));
  categorySelect.value = categories.includes(selected) ? selected : '';

  const apply = () => {
    const chosen = categorySelect.value;
    const text = normalizeSearch(search.value);
    let visible = 0;
    cards.forEach(card => {
      const category = (card.dataset.category || card.querySelector('.info > .eyebrow')?.textContent || '').trim();
      const haystack = normalizeSearch([card.dataset.name, category, card.querySelector('.info > p')?.textContent].join(' '));
      const show = (!chosen || category === chosen) && (!text || haystack.includes(text));
      card.hidden = !show;
      if (show) visible++;
    });
    if (resultCount) resultCount.textContent = `${visible} produto${visible===1?'':'s'} encontrado${visible===1?'':'s'}`;
    if (empty) empty.hidden = visible !== 0;
  };
  categorySelect.onchange = apply;
  search.oninput = apply;
  apply();
}
window.refreshCatalogFilters = refreshCatalogFilters;

function setupGallery(card) {
  const visual = card.querySelector('.standard-photo');
  const image = visual?.querySelector('img');
  if (!visual || !image || visual.dataset.galleryReady === 'true') return;
  visual.dataset.galleryReady = 'true';
  let images;
  try { images = JSON.parse(card.dataset.images || '[]'); } catch { images = []; }
  if (!Array.isArray(images)) images = [];
  images = images.filter(url => typeof url === 'string' && url.trim());
  if (!images.length) images = [image.getAttribute('src')];
  let index = 0;
  const label = card.dataset.name || 'produto';
  const update = (next) => {
    index = (next + images.length) % images.length;
    image.src = images[index];
    image.alt = `${label} — foto ${index+1} de ${images.length}`;
    const counter = visual.querySelector('.gallery-counter');
    if (counter) counter.textContent = `${index+1} / ${images.length}`;
  };
  card.getGalleryState = () => ({images, index, update});
  if (images.length > 1) {
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'gallery-arrow gallery-prev';
    previous.setAttribute('aria-label', `Ver foto anterior de ${label}`);
    previous.textContent = '‹';
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'gallery-arrow gallery-next';
    next.setAttribute('aria-label', `Ver próxima foto de ${label}`);
    next.textContent = '›';
    const counter = document.createElement('span');
    counter.className = 'gallery-counter';
    counter.setAttribute('aria-live','polite');
    previous.addEventListener('click', event => {event.stopPropagation(); update(index-1);});
    next.addEventListener('click', event => {event.stopPropagation(); update(index+1);});
    visual.append(previous,next,counter);
  }
  update(0);
}

let activeLightboxCard = null;
function updateLightbox() {
  const dialog = document.getElementById('lightbox');
  if (!dialog || !activeLightboxCard) return;
  const state = activeLightboxCard.getGalleryState();
  const img = dialog.querySelector('img');
  img.src = state.images[state.index];
  img.alt = `${activeLightboxCard.dataset.name} — foto ${state.index+1} de ${state.images.length}`;
  const hasMore = state.images.length > 1;
  dialog.querySelectorAll('.lightbox-arrow').forEach(button => button.hidden = !hasMore);
  dialog.querySelector('.lightbox-counter').textContent = hasMore ? `${state.index+1} / ${state.images.length}` : '';
}
function bindCatalogCards() {
  document.querySelectorAll('.new-product').forEach(card => {
    if (card.dataset.cardReady === 'true') return;
    card.dataset.cardReady = 'true';
    setupGallery(card);
    const quantity = card.querySelector('.quantity');
    if (!quantity) return;
    const values = () => {
      const q = Number(quantity.value);
      const min = Number(card.dataset.discountMin || 0);
      return {q, unit: min && q >= min ? Number(card.dataset.discountPrice) : Number(card.dataset.price)};
    };
    quantity.addEventListener('change', () => {
      const {q,unit} = values();
      card.querySelector('.unit-price').textContent = money(unit);
      card.querySelector('.subtotal strong').textContent = money(q*unit);
    });
    card.querySelector('.interest')?.addEventListener('click', () => {
      // O carrinho intercepta este botão e abre o resumo se cart.js estiver ativo.
      const {q,unit} = values();
      const custom = card.querySelector('.personalization')?.value.trim();
      const message = `Olá, Feito em Forma! Tenho interesse neste produto:\n\n${card.dataset.name}\nMaterial: PLA\nMedidas: ${card.dataset.size}${card.dataset.height?'\nAltura: '+card.dataset.height:''}\nQuantidade: ${q}\nValor por unidade: ${money(unit)}\nSubtotal: ${money(unit*q)}${custom?'\nNome(s): '+custom:''}\n\nPodem confirmar disponibilidade, frete e prazo?`;
      window.location.assign('https://wa.me/5511958107686?text='+encodeURIComponent(message));
    });
    card.querySelector('.expand')?.addEventListener('click', () => {
      activeLightboxCard = card;
      updateLightbox();
      document.getElementById('lightbox').showModal();
    });
  });
  refreshCatalogFilters();
}
window.bindCatalogCards = bindCatalogCards;
bindCatalogCards();

const lightbox = document.getElementById('lightbox');
if (lightbox) {
  lightbox.querySelector('.lightbox-prev')?.addEventListener('click', () => {
    const state = activeLightboxCard?.getGalleryState();
    if (state) { state.update(state.index-1); updateLightbox(); }
  });
  lightbox.querySelector('.lightbox-next')?.addEventListener('click', () => {
    const state = activeLightboxCard?.getGalleryState();
    if (state) { state.update(state.index+1); updateLightbox(); }
  });
  lightbox.addEventListener('close', () => {activeLightboxCard = null;});
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const state = activeLightboxCard?.getGalleryState();
      if (state && state.images.length > 1) {
        event.preventDefault();
        state.update(state.index+(event.key==='ArrowRight'?1:-1));
        updateLightbox();
      }
    }
  });
}

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom)) dialog.close();
  });
});
function ideaMessage(description,size,quantity) {
  return 'Olá, Feito em Forma! Gostaria de solicitar uma peça personalizada.'+(description?'\n\nMinha ideia: '+description:'\n\nQuero conversar sobre uma ideia para impressão 3D.')+(size?'\nTamanho aproximado: '+size:'')+(quantity?'\nQuantidade: '+quantity:'')+'\n\nPodemos conversar sobre a viabilidade, o orçamento e o prazo? Vou enviar minhas referências por aqui.';
}
document.getElementById('idea-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const description = document.getElementById('idea-description').value.trim();
  const size = document.getElementById('idea-size').value.trim();
  const quantity = document.getElementById('idea-quantity').value;
  window.location.assign('https://wa.me/5511958107686?text='+encodeURIComponent(ideaMessage(description,size,quantity)));
});
