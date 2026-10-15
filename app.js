function unitPrice(id,price,quantity){return Number(id)===14&&quantity>=5?8:price}
const money=value=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
document.querySelectorAll('.new-product').forEach(card=>{
 const quantity=card.querySelector('.quantity');
 function values(){const q=Number(quantity.value);return {q,unit:unitPrice(card.dataset.id,Number(card.dataset.price),q)}}
 quantity.addEventListener('change',()=>{const {q,unit}=values();card.querySelector('.unit-price').textContent=money(unit);card.querySelector('.subtotal strong').textContent=money(q*unit)});
 card.querySelector('.interest').addEventListener('click',()=>{const {q,unit}=values(),custom=card.querySelector('.personalization')?.value.trim();const message=`Olá, Feito em Forma! Tenho interesse neste produto:\n\n${card.dataset.name}\nMaterial: PLA\nMedidas: ${card.dataset.size}${card.dataset.height?'\nAltura: '+card.dataset.height:''}\nQuantidade: ${q}\nValor por unidade: ${money(unit)}\nSubtotal: ${money(unit*q)}${custom?'\nNome(s): '+custom:''}\n\nPodem confirmar disponibilidade, frete e prazo?`;window.location.assign('https://wa.me/5511958107686?text='+encodeURIComponent(message))});
 card.querySelector('.expand').addEventListener('click',()=>{const source=card.querySelector('.standard-photo img'),box=document.getElementById('lightbox'),img=box.querySelector('img');img.src=source.src;img.alt=source.alt;box.showModal()});
});
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close()})});

function ideaMessage(description,size,quantity){return 'Olá, Feito em Forma! Gostaria de solicitar uma peça personalizada.'+(description?'\n\nMinha ideia: '+description:'\n\nQuero conversar sobre uma ideia para impressão 3D.')+(size?'\nTamanho aproximado: '+size:'')+(quantity?'\nQuantidade: '+quantity:'')+'\n\nPodemos conversar sobre a viabilidade, o orçamento e o prazo? Vou enviar minhas referências por aqui.'}
document.getElementById('idea-form').addEventListener('submit',event=>{event.preventDefault();const description=document.getElementById('idea-description').value.trim(),size=document.getElementById('idea-size').value.trim(),quantity=document.getElementById('idea-quantity').value;window.location.assign('https://wa.me/5511958107686?text='+encodeURIComponent(ideaMessage(description,size,quantity)))});
