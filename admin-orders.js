// Gerenciamento de Encomendas realizadas — independente do cadastro de produtos.
(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const productsTab = el('admin-tab-products');
  const ordersTab = el('admin-tab-orders');
  if (!productsTab || !ordersTab) return;

  let orders = [];
  let gallery = [];
  let loaded = false;
  const message = (text) => { el('orders-status').textContent = text; };
  const client = () => window.feitoAdminClient?.();
  const imageList = order => Array.isArray(order?.image_urls) ? order.image_urls.filter(v => typeof v === 'string' && v.trim()) : [];

  function switchTab(name) {
    const isOrders = name === 'orders';
    el('admin-products').hidden = isOrders;
    el('admin-orders').hidden = !isOrders;
    el('admin-reviews').hidden = true;
    el('admin-categories').hidden = true;
    el('admin-tab-categories').classList.remove('active');
    el('admin-tab-categories').setAttribute('aria-pressed','false');
    el('admin-tab-reviews').classList.remove('active');
    el('admin-tab-reviews').setAttribute('aria-pressed','false');
    productsTab.classList.toggle('active', !isOrders);
    ordersTab.classList.toggle('active', isOrders);
    productsTab.setAttribute('aria-pressed', String(!isOrders));
    ordersTab.setAttribute('aria-pressed', String(isOrders));
    if (isOrders) load();
  }
  productsTab.addEventListener('click', () => switchTab('products'));
  ordersTab.addEventListener('click', () => switchTab('orders'));

  async function load() {
    const db = client();
    if (!db) { message('Aguardando conexão do painel.'); return; }
    message('Carregando encomendas realizadas...');
    const {data, error} = await db.from('completed_orders').select('*').order('sort_order', {ascending: true}).order('created_at', {ascending: false});
    if (error) { message(`Não foi possível carregar os trabalhos: ${error.message}. Verifique se executou CRIAR-ENCOMENDAS.sql no projeto Base Catálogo.`); return; }
    loaded = true;
    orders = data || [];
    const categories = el('orders-categories');
    categories.replaceChildren();
    [...new Set(orders.map(o => (o.category || '').trim()).filter(Boolean))]
      .sort((a,b) => a.localeCompare(b,'pt-BR'))
      .forEach(value => { const option = document.createElement('option'); option.value = value; categories.append(option); });
    const list = el('orders-list');list.replaceChildren();
    if (!orders.length) {
      const hint = document.createElement('p'); hint.textContent = 'Ainda não há trabalhos cadastrados. Clique em “Adicionar encomenda realizada”.'; list.append(hint);
    }
    for (const work of orders) {
      const row = document.createElement('div'); row.className='admin-item';
      const img = document.createElement('img'); img.src = imageList(work)[0] || 'logo.jpg'; img.alt=''; img.loading='lazy';
      const info = document.createElement('div'); info.className='admin-info';
      const title = document.createElement('strong'); title.textContent = work.title;
      const sub = document.createElement('div');
      sub.textContent = `${work.category || 'Sem categoria'} · ${imageList(work).length} foto(s) · ${work.active?'Publicado':'Oculto'}`;
      info.append(title, sub);
      const edit = document.createElement('button'); edit.type='button'; edit.textContent='Editar'; edit.addEventListener('click', () => editOrder(work));
      const del = document.createElement('button'); del.type='button'; del.textContent='Excluir'; del.addEventListener('click', () => removeOrder(work));
      row.append(img,info,edit,del);list.append(row);
    }
    message(`${orders.length} trabalho${orders.length===1?'':'s'} cadastrado${orders.length===1?'':'s'}.`);
  }

  function renderPhotos() {
    const list = el('orders-photo-list'); list.replaceChildren();
    if (!gallery.length) {
      const hint = document.createElement('p'); hint.textContent='Nenhuma foto selecionada. Adicione pelo menos uma foto para publicar.'; list.append(hint);
      return;
    }
    gallery.forEach((url,index) => {
      const item = document.createElement('div');item.className='admin-photo';
      const img = document.createElement('img');img.src=url;img.alt=`Foto ${index+1}`;
      const label = document.createElement('span');label.textContent=index===0?'Foto de capa':`Foto ${index+1}`;
      item.append(img,label);
      if (index !== 0) {
        const cover = document.createElement('button');cover.type='button';cover.textContent='Usar como capa';
        cover.addEventListener('click', () => {gallery.splice(index,1);gallery.unshift(url);renderPhotos();});item.append(cover);
      }
      const remove = document.createElement('button');remove.type='button';remove.textContent='Remover';remove.className='admin-photo-remove';
      remove.addEventListener('click', () => {gallery.splice(index,1);renderPhotos();});item.append(remove);
      list.append(item);
    });
  }

  function editOrder(order) {
    const form = el('orders-form');form.hidden=false;
    el('orders-form-title').textContent=order?'Editar encomenda realizada':'Nova encomenda realizada';
    el('orders-id').value=order?.id || '';
    el('orders-title').value=order?.title || '';
    el('orders-category').value=order?.category || '';
    el('orders-description').value=order?.description || '';
    el('orders-instagram').value=order?.instagram_url || '';
    el('orders-sort').value=order?.sort_order ?? 0;
    el('orders-active').checked=order?.active ?? true;
    el('orders-photos').value='';
    gallery=[...imageList(order)];renderPhotos();message('');
    form.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function instagramUrl(input) {
    const value = input.trim();
    if (!value) return null;
    let url;
    try { url = new URL(value); } catch { throw new Error('Informe um link válido da publicação no Instagram.'); }
    if (url.protocol !== 'https:' || !['instagram.com','www.instagram.com'].includes(url.hostname.toLowerCase()) || !/^\/(p|reel|tv)\/[^/]+\/?$/i.test(url.pathname)) {
      throw new Error('Use a URL HTTPS de um post ou Reel do Instagram, por exemplo https://www.instagram.com/p/CODIGO/');
    }
    return url.toString();
  }

  async function saveOrder(event) {
    event.preventDefault();
    const db = client();if(!db) return message('Faça login novamente.');
    const button = el('orders-form').querySelector('[type="submit"]');
    if (button.disabled) return;
    button.disabled = true;
    try {
      const files = [...el('orders-photos').files];
      if (files.length+gallery.length>10) throw new Error('Limite de 10 fotos por trabalho.');
      if (!files.length && gallery.length===0) throw new Error('Adicione pelo menos uma foto para publicar o trabalho.');
      for (const file of files) {
        if (file.size > 5*1024*1024) throw new Error('Cada foto deve ter no máximo 5 MB.');
        if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Envie apenas fotos JPG, PNG ou WebP.');
      }
      const payload = {
        title:el('orders-title').value.trim(),
        category:el('orders-category').value.trim(),
        description:el('orders-description').value.trim(),
        instagram_url:instagramUrl(el('orders-instagram').value),
        sort_order:Number(el('orders-sort').value || 0),
        active:el('orders-active').checked
      };
      if (!payload.title || !payload.category) throw new Error('Preencha o título e a categoria.');
      const photos=[...gallery];
      for(let i=0;i<files.length;i++) {
        message(`Enviando foto ${i+1} de ${files.length}...`);
        const photo=files[i];const ext=photo.type==='image/jpeg'?'jpg':photo.type.split('/')[1];
        const path=`trabalhos/${crypto.randomUUID()}.${ext}`;
        const {error}=await db.storage.from('completed-order-images').upload(path,photo,{contentType:photo.type,upsert:false});
        if(error)throw error;
        photos.push(db.storage.from('completed-order-images').getPublicUrl(path).data.publicUrl);
      }
      payload.image_urls=photos;
      message('Salvando o trabalho...');
      const id=el('orders-id').value;
      const result=id?await db.from('completed_orders').update(payload).eq('id',id):await db.from('completed_orders').insert(payload);
      if(result.error)throw result.error;
      el('orders-form').hidden=true;
      await load();
      message('Encomenda realizada salva com sucesso! A galeria pública já pode exibir a atualização.');
    } catch(error) {
      console.error('Salvar encomenda realizada:',error);
      message(`Não foi possível salvar: ${error.message||String(error)}`);
    } finally {button.disabled=false;}
  }

  async function removeOrder(order) {
    if (!confirm(`Excluir “${order.title}” da galeria de encomendas realizadas?`)) return;
    const db=client();if(!db)return;
    const {error}=await db.from('completed_orders').delete().eq('id',order.id);
    if(error) return message(`Não foi possível excluir: ${error.message}`);
    el('orders-form').hidden=true;
    await load();message('Trabalho removido da galeria. As imagens armazenadas podem ser excluídas separadamente do Storage.');
  }

  el('orders-new').addEventListener('click',()=>editOrder(null));
  el('orders-cancel').addEventListener('click',()=>{el('orders-form').hidden=true;message('');});
  el('orders-form').addEventListener('submit',saveOrder);
  // Sem carregamento de produtos/carrinho nesta aba: são tabelas diferentes.
})();
