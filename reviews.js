(()=>{'use strict';
const $=id=>document.getElementById(id),cfg=window.FEITO_CONFIG||{};
const list=$('reviews-list'),summary=$('reviews-summary'),form=$('review-form'),status=$('review-status');
const controls=$('reviews-controls'),prev=$('review-prev'),next=$('review-next'),position=$('reviews-position');
let reviewsData=[],activeIndex=0,autoTimer=null;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function stopAuto(){if(autoTimer){clearInterval(autoTimer);autoTimer=null;}}
function startAuto(){stopAuto();if(reviewsData.length>1&&!reducedMotion.matches&&!document.hidden)autoTimer=setInterval(()=>showReview(activeIndex+1),7000);}
function showReview(index){if(!reviewsData.length)return;activeIndex=(index+reviewsData.length)%reviewsData.length;
  [...list.children].forEach((card,i)=>{const selected=i===activeIndex;card.hidden=!selected;card.setAttribute('aria-hidden',String(!selected));});
  if(position)position.textContent=`${activeIndex+1} de ${reviewsData.length}`;
}
prev?.addEventListener('click',()=>{showReview(activeIndex-1);startAuto()});
next?.addEventListener('click',()=>{showReview(activeIndex+1);startAuto()});
list.addEventListener('mouseenter',stopAuto);list.addEventListener('mouseleave',startAuto);
list.addEventListener('focusin',stopAuto);list.addEventListener('focusout',e=>{if(!list.contains(e.relatedTarget))startAuto()});
controls?.addEventListener('mouseenter',stopAuto);controls?.addEventListener('mouseleave',startAuto);
controls?.addEventListener('focusin',stopAuto);controls?.addEventListener('focusout',e=>{if(!controls.contains(e.relatedTarget))startAuto()});
document.addEventListener('visibilitychange',()=>document.hidden?stopAuto():startAuto());
reducedMotion.addEventListener?.('change',()=>reducedMotion.matches?stopAuto():startAuto());
list.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){showReview(activeIndex+1);startAuto()}else if(e.key==='ArrowLeft'){showReview(activeIndex-1);startAuto()}});

if(!list||!form)return;
if(!window.supabase||!cfg.supabaseUrl||!cfg.supabaseAnonKey){list.textContent='Avaliações temporariamente indisponíveis.';form.querySelector('button').disabled=true;return;}
const db=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!=null)x.textContent=text;return x;}
async function load(){const {data,error}=await db.from('customer_reviews').select('id,customer_name,product_name,rating,comment,photo_url,created_at').eq('status','approved').order('created_at',{ascending:false}).limit(36);list.replaceChildren();if(error){list.append(el('p','','As avaliações estarão disponíveis após a configuração do banco de dados.'));return;}
const reviews=data||[];reviewsData=reviews;stopAuto();if(controls)controls.hidden=reviews.length<=1;if(!reviews.length){list.append(el('p','reviews-empty','As primeiras avaliações aparecerão aqui. Já recebeu sua encomenda? Seja o primeiro a contar!'));summary.textContent='';return;}
const average=reviews.reduce((a,r)=>a+Number(r.rating),0)/reviews.length;summary.textContent=`★ ${average.toFixed(1).replace('.',',')} / 5 · ${reviews.length} avaliação(ões) exibida(s)`;
reviews.forEach(r=>{const card=el('article','review-card');const stars=el('div','review-card-stars','★'.repeat(r.rating)+'☆'.repeat(5-r.rating));stars.setAttribute('aria-label',r.rating+' de 5 estrelas');const h=el('h3','',r.customer_name);const product=el('p','review-product',r.product_name);const text=el('p','review-comment',r.comment);card.append(stars,h,product,text);if(r.photo_url){const img=el('img','review-image');img.src=r.photo_url;img.alt='Foto da encomenda enviada por '+r.customer_name;img.loading='lazy';card.append(img)}card.append(el('small','review-date',new Date(r.created_at).toLocaleDateString('pt-BR')));list.append(card)});showReview(0);startAuto();}
const photo=$('review-photo');photo.addEventListener('change',()=>{const preview=$('review-photo-preview');preview.replaceChildren();const f=photo.files[0];preview.hidden=!f;if(f){const img=el('img');img.src=URL.createObjectURL(f);img.alt='Prévia da foto selecionada';img.onload=()=>URL.revokeObjectURL(img.src);preview.append(img)}});
form.addEventListener('submit',async e=>{e.preventDefault();if($('review-website').value)return;const button=$('review-send');if(button.disabled)return;button.disabled=true;status.textContent='Enviando avaliação...';let path=null;try{
const file=photo.files[0];if(file&&(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>3*1024*1024))throw Error('A foto deve ser JPG, PNG ou WebP e ter até 3 MB.');
let url=null;if(file){const ext=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';path='pendentes/'+crypto.randomUUID()+'.'+ext;const upload=await db.storage.from('customer-review-images').upload(path,file,{contentType:file.type,upsert:false});if(upload.error)throw upload.error;url=db.storage.from('customer-review-images').getPublicUrl(path).data.publicUrl;}
const rating=Number(form.querySelector('input[name="rating"]:checked')?.value);if(!Number.isInteger(rating)||rating<1||rating>5)throw Error('Selecione de 1 a 5 estrelas.');
const payload={customer_name:$('review-name').value.trim(),product_name:$('review-product').value.trim(),rating,comment:$('review-comment').value.trim(),photo_url:url,photo_path:path,status:'pending'};
const result=await db.from('customer_reviews').insert(payload);if(result.error)throw result.error;
form.reset();$('review-photo-preview').replaceChildren();$('review-photo-preview').hidden=true;status.textContent='Obrigado! 💙 Sua avaliação foi recebida e ficará visível após aprovação da Feito em Forma.';
}catch(err){status.textContent='Não foi possível enviar: '+(err.message||'tente novamente.');console.error(err)}finally{button.disabled=false}});
load();
})();