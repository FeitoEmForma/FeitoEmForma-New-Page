// Painel Feito em Forma — mantém image_url para compatibilidade com produtos antigos
// e utiliza image_urls (text[]) para várias imagens por produto.
const cfg=window.FEITO_CONFIG||{};
const $=id=>document.getElementById(id);
let db,items=[],draftPhotos=[],categoryNames=[];
const status=s=>$('status').textContent=s;
const fields=['name','price','category','material','size','height','description','discount-min','discount-price','sort-order','stock-quantity','personalization','active'];
const get=id=>$(id).type==='checkbox'?$(id).checked:$(id).value;
const photoUrls=p=>{
  const list=Array.isArray(p?.image_urls)?p.image_urls.filter(Boolean):[];
  return list.length?list:(p?.image_url?[p.image_url]:[]);
};

async function authorized(){
  const {data:{user}}=await db.auth.getUser();
  if(!user)return false;
  const {data}=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();
  return !!data;
}
async function view(){
  const ok=await authorized();
  $('login').hidden=ok;
  $('dashboard').hidden=!ok;
  if(ok)await load();
}
async function load(){
  const {data,error}=await db.from('products').select('*').order('sort_order');
  if(error)return status(error.message);
  items=data||[];
  await loadCategoryOptions();
  $('product-list').replaceChildren();
  for(const p of items){
    const row=document.createElement('div');row.className='admin-item';
    const img=document.createElement('img');img.src=photoUrls(p)[0]||'logo.jpg';img.alt='';
    const info=document.createElement('div');info.className='admin-info';
    const title=document.createElement('strong');title.textContent=p.name;
    const sub=document.createElement('div');sub.textContent=`${p.category} · R$ ${Number(p.price).toFixed(2).replace('.',',')} · ${photoUrls(p).length} foto(s) · ${p.stock_quantity===null?'Sob encomenda':p.stock_quantity+' em estoque'} · ${p.active?'Publicado':'Oculto'}`;
    info.append(title,sub);
    const edit=document.createElement('button');edit.textContent='Editar';edit.onclick=()=>editProduct(p);
    const del=document.createElement('button');del.textContent='Excluir';del.onclick=()=>remove(p);
    row.append(img,info,edit,del);$('product-list').append(row);
  }
}
async function loadCategoryOptions(){
  const {data,error}=await db.from('categories').select('name').order('name');
  if(error){status('Não foi possível carregar as categorias. Execute supabase-categorias-v6.2.sql no Supabase: '+error.message);return;}
  categoryNames=(data||[]).map(x=>x.name);
  const select=$('category'),selected=select.value;
  select.replaceChildren(new Option('Selecione uma categoria',''));
  categoryNames.forEach(name=>select.add(new Option(name,name)));
  if(selected&&categoryNames.includes(selected))select.value=selected;
}
window.feitoRefreshCategoryOptions=loadCategoryOptions;
window.feitoRefreshProducts=load;
function renderPhotoList(){
  const list=$('photo-list');list.replaceChildren();
  if(!draftPhotos.length){
    const p=document.createElement('p');p.textContent='Nenhuma foto salva. Selecione uma ou várias imagens abaixo.';
    list.append(p);return;
  }
  draftPhotos.forEach((url,index)=>{
    const item=document.createElement('div');item.className='admin-photo';
    const img=document.createElement('img');img.src=url;img.alt=`Foto ${index+1}`;
    const label=document.createElement('span');label.textContent=index===0?'Foto de capa':`Foto ${index+1}`;
    item.append(img,label);
    if(index>0){
      const cover=document.createElement('button');cover.type='button';cover.textContent='Usar como capa';
      cover.onclick=()=>{draftPhotos.splice(index,1);draftPhotos.unshift(url);renderPhotoList();};
      item.append(cover);
    }
    const remove=document.createElement('button');remove.type='button';remove.className='admin-photo-remove';remove.textContent='Remover';
    remove.onclick=()=>{draftPhotos.splice(index,1);renderPhotoList();};
    item.append(remove);list.append(item);
  });
}
function editProduct(p){
  $('product-form').hidden=false;
  $('form-title').textContent=p?'Editar produto':'Novo produto';
  $('product-id').value=p?.id||'';
  for(const f of fields){
    const el=$(f),key=f.replaceAll('-','_');
    if(el.type==='checkbox')el.checked=p?p[key]??false:f==='active';
    else el.value=p?.[key]??({category:categoryNames[0]||'',material:'PLA','sort-order':items.length}[f]??'');
  }
  draftPhotos=[...photoUrls(p)];
  $('photo').value='';renderPhotoList();
  status('');
  $('product-form').scrollIntoView({behavior:'smooth'});
}
async function remove(p){
  if(!confirm(`Excluir definitivamente "${p.name}"?`))return;
  const {error}=await db.from('products').delete().eq('id',p.id);
  if(error)return status(error.message);
  status('Produto excluído.');await load();
}
async function save(e){
  e.preventDefault();
  const submit=$('product-form').querySelector('[type="submit"]');
  if(submit.disabled)return;
  submit.disabled=true;
  try{
    status('Salvando...');
    const id=$('product-id').value;
    const obj={};
    for(const f of fields)obj[f.replaceAll('-','_')]=get(f);
    if(!categoryNames.includes(obj.category))throw Error('Selecione uma categoria cadastrada na aba Coleções e categorias.');
    for(const k of ['price','sort_order'])obj[k]=Number(obj[k]||0);
    for(const k of ['discount_min','discount_price'])obj[k]=obj[k]===''?null:Number(obj[k]);
    obj.stock_quantity=obj.stock_quantity===''?null:Number(obj.stock_quantity);
    if(obj.stock_quantity!==null&&(!Number.isSafeInteger(obj.stock_quantity)||obj.stock_quantity<0))throw Error('Informe um estoque válido (inteiro não negativo).');
    if((obj.discount_min===null)!==(obj.discount_price===null))throw Error('Informe quantidade e preço promocional juntos.');
    let pictures=[...draftPhotos];
    const files=Array.from($('photo').files||[]);
    if(pictures.length+files.length>10)throw Error('Cada produto pode ter no máximo 10 fotos.');
    for(const photo of files){
      if(photo.size>5*1024*1024)throw Error('Cada imagem deve ter no máximo 5 MB.');
      if(!['image/jpeg','image/png','image/webp'].includes(photo.type))throw Error('Envie fotos JPG, PNG ou WebP.');
    }
    for(let i=0;i<files.length;i++){
      const photo=files[i];
      status(`Enviando foto ${i+1} de ${files.length}...`);
      const ext=photo.type==='image/jpeg'?'jpg':photo.type.split('/')[1];
      const filename=`${crypto.randomUUID()}.${ext}`;
      const {error}=await db.storage.from('product-images').upload(filename,photo,{contentType:photo.type});
      if(error)throw error;
      pictures.push(db.storage.from('product-images').getPublicUrl(filename).data.publicUrl);
    }
    obj.image_urls=pictures;
    obj.image_url=pictures[0]||null;
    const result=id?await db.from('products').update(obj).eq('id',id):await db.from('products').insert(obj);
    if(result.error)throw result.error;
    $('product-form').hidden=true;
    status('Produto salvo com sucesso.');
    await load();
  }catch(error){
    console.error('Salvar produto:',error);
    status(`Não foi possível salvar: ${error.message||error}. Se mencionar image_urls, execute supabase.sql (v5.1) no Supabase.`);
  }finally{submit.disabled=false;}
}
async function init(){
  if(!cfg.supabaseUrl||!cfg.supabaseAnonKey||!window.supabase)return;
  $('setup').hidden=true;
  db=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
  $('login-form').onsubmit=async e=>{
    e.preventDefault();status('Entrando...');
    const {error}=await db.auth.signInWithPassword({email:$('email').value,password:$('password').value});
    if(error)return status(`Não foi possível entrar: ${error.message}`);
    if(!await authorized()){await db.auth.signOut();return status('Esta conta não tem autorização administrativa.');}
    status('');await view();
  };
  $('logout').onclick=async()=>{await db.auth.signOut();await view();};
  $('new').onclick=()=>editProduct(null);
  $('cancel').onclick=()=>$('product-form').hidden=true;
  $('product-form').onsubmit=save;
  await view();
}
init();

// Reutiliza a sessão autenticada no mesmo projeto Supabase.
window.feitoAdminClient = () => db;
