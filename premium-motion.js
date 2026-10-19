// Animações discretas com suporte a acessibilidade
(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.07,rootMargin:'0px 0px 30px 0px'});
const watch=()=>document.querySelectorAll('.section-heading,.product,.portfolio-card,.custom-project,.portfolio-intro').forEach(el=>{if(!el.classList.contains('reveal-on-scroll')){el.classList.add('reveal-on-scroll');observer.observe(el)}});
document.addEventListener('DOMContentLoaded',()=>{watch();const catalog=document.querySelector('.products,.portfolio-grid');if(catalog)new MutationObserver(watch).observe(catalog,{childList:true})});
})();
