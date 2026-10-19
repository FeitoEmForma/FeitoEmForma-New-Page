/* Gerenciamento de coleções — Feito em Forma v6.2 */
(()=>{'use strict';
const $=id=>document.getElementById(id),tabs=['products','categories','orders','reviews'];
const status=message=>{const el=$('categories-status');if(el)el.textContent=message};
async function client(){return window.feitoAdminClient?.()}
async function render(){
 const db=await client();if(!db)return;
 const [cats,products]=await Promise.all([db.from('categories').select('id,name').order('name'),db.from('products').select('id,category')]);
 if(cats.error||products.error){status('Erro ao carregar categorias: '+(cats.error||products.error).message);return}
 const list=$('categories-list');list.replaceChildren();
 const counts=new Map();(products.data||[]).forEach(p=>counts.set(p.category,(counts.get(p.category)||0)+1));
 if(!cats.data?.length){const empty=document.createElement('p');empty.textContent='Nenhuma categoria cadastrada.';list.append(empty)}
 for(const cat of cats.data||[]){
  const row=document.createElement('div');row.className='admin-item category-item';
  const info=document.createElement('div');info.className='admin-info';
  const title=document.createElement('strong');title.textContent=cat.name;
  const count=document.createElement('div');const n=counts.get(cat.name)||0;count.textContent=n+' produto(s)';info.append(title,count);
  const edit=document.createElement('button');edit.type='button';edit.textContent='Renomear';edit.onclick=async()=>{
   const next=prompt('Novo nome para esta categoria:',cat.name)?.trim();if(!next||next===cat.name)return;
   if(next.length>100)return status('O nome deve ter até 100 caracteres.');
   if(!confirm(`Renomear "${cat.name}" para "${next}"? Os produtos serão atualizados.`))return;
   status('Renomeando categoria...');
   const {error}=await db.rpc('rename_product_category',{category_id:cat.id,new_name:next});
   if(error)return status('Não foi possível renomear: '+error.message);
   status('Categoria e produtos atualizados.');await render();await window.feitoRefreshProducts?.();
  };
  const del=document.createElement('button');del.type='button';del.textContent='Excluir';del.disabled=n>0;del.title=n?'Transfira os produtos antes de excluir':'Excluir categoria vazia';
  del.onclick=async()=>{if(!confirm(`Excluir a categoria vazia "${cat.name}"?`))return;const {error}=await db.from('categories').delete().eq('id',cat.id);if(error)return status('Erro: '+error.message);status('Categoria excluída.');await render();await window.feitoRefreshCategoryOptions?.()};
  row.append(info,edit,del);list.append(row);
 }
}
$('category-create-form')?.addEventListener('submit',async e=>{
 e.preventDefault();const name=$('category-new-name').value.trim();if(!name)return;
 const db=await client();if(!db)return;
 const {error}=await db.from('categories').insert({name});
 if(error)return status('Não foi possível criar: '+error.message);
 $('category-new-name').value='';status('Categoria criada.');await render();await window.feitoRefreshCategoryOptions?.();
});
$('admin-tab-categories')?.addEventListener('click',async()=>{
 for(const name of tabs){const panel=$('admin-'+name),tab=$('admin-tab-'+name);if(panel)panel.hidden=name!=='categories';if(tab){tab.classList.toggle('active',name==='categories');tab.setAttribute('aria-pressed',String(name==='categories'))}}
 await render();
});
})();