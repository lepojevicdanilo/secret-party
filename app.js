const $=(selector,scope=document)=>scope.querySelector(selector);
const $$=(selector,scope=document)=>[...scope.querySelectorAll(selector)];

const header=$('.site-header');
addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>60),{passive:true});
const menu=$('.menu-toggle');
menu.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':''});
$$('.desktop-nav a').forEach(link=>link.addEventListener('click',()=>{header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');document.body.style.overflow=''}));

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.1});
$$('[data-reveal]').forEach((el,index)=>{el.style.transitionDelay=`${Math.min(index%4,3)*70}ms`;observer.observe(el)});

const dialog=$('#productDialog');
let allProducts=[],visibleProducts=[],shown=24,activeType='all',activeTone='all',searchTerm='';
const typeLabels={kolekcija:'Kolekcijski laminat',akcija:'Akcijska ponuda',vrata:'Sobna vrata',paneli:'Akustični paneli',oprema:'Prateći program'};
const escapeHtml=value=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

function productCard(product){
  const badge=product.type==='kolekcija'?'KOLEKCIJA':product.type==='vrata'?'VRATA':'AKCIJA';
  return `<article class="product-card" data-product="${escapeHtml(product.id)}"><div class="product-image"><span>${badge}</span><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy"></div><div class="product-meta"><small>${escapeHtml(typeLabels[product.type]||'Green izbor')}</small><h3>${escapeHtml(product.title)}</h3><div>${product.old?`<del>${escapeHtml(product.old)}</del>`:''}<strong>${escapeHtml(product.current)}</strong></div><button type="button">Detalji i dostupnost <span class="icon icon-ne" aria-hidden="true"></span></button></div></article>`;
}
function applyCatalog(){
  const query=searchTerm.trim().toLocaleLowerCase('sr');
  visibleProducts=allProducts.filter(product=>(activeType==='all'||product.type===activeType)&&(activeTone==='all'||product.tone===activeTone)&&(!query||product.title.toLocaleLowerCase('sr').includes(query)||product.categories.some(category=>category.includes(query))));
  shown=24;renderCatalog();
}
function renderCatalog(){
  const grid=$('#productGrid'),items=visibleProducts.slice(0,shown);
  grid.innerHTML=items.length?items.map(productCard).join(''):'<div class="catalog-empty"><strong>Nema rezultata za ovaj izbor.</strong>Promenite kategoriju, ton ili pojam za pretragu.</div>';
  $('#catalogCount').textContent=`Prikazano ${Math.min(shown,visibleProducts.length)} od ${visibleProducts.length} proizvoda`;
  $('#loadMore').hidden=shown>=visibleProducts.length;
  $$('.product-card',grid).forEach(attachCard);
}
function attachCard(card){
  card.querySelector('button').addEventListener('click',()=>openProduct(card.dataset.product));
  if(matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches){
    card.addEventListener('pointermove',event=>{const box=card.getBoundingClientRect(),x=(event.clientX-box.left)/box.width-.5,y=(event.clientY-box.top)/box.height-.5;card.style.transform=`perspective(900px) rotateX(${-y*4}deg) rotateY(${x*5}deg) translateY(-5px)`});
    card.addEventListener('pointerleave',()=>card.style.transform='');
  }
}
function openProduct(id){
  const product=allProducts.find(item=>item.id===id);if(!product)return;
  $('#dialogImage').src=product.image;$('#dialogImage').alt=product.title;$('#dialogTitle').textContent=product.title;
  $('#dialogSpec').textContent=typeLabels[product.type]||'GREEN IZBOR';$('#dialogPrice').textContent=product.current;
  dialog.dataset.product=product.title;dialog.showModal();
}
fetch('catalog.json').then(response=>response.json()).then(data=>{allProducts=data.products;visibleProducts=allProducts;renderCatalog()}).catch(()=>{$('#productGrid').innerHTML='<div class="catalog-empty"><strong>Katalog trenutno nije dostupan.</strong>Pokušajte ponovo ili pošaljite upit našem timu.</div>';$('#catalogCount').textContent='Katalog nije učitan'});
$$('.catalog-tab').forEach(button=>button.addEventListener('click',()=>{$$('.catalog-tab').forEach(item=>item.classList.remove('active'));button.classList.add('active');activeType=button.dataset.type;applyCatalog()}));
$$('.tone').forEach(button=>button.addEventListener('click',()=>{$$('.tone').forEach(item=>item.classList.remove('active'));button.classList.add('active');activeTone=button.dataset.tone;applyCatalog()}));
$('#catalogSearch').addEventListener('input',event=>{searchTerm=event.target.value;applyCatalog()});
$('#loadMore').addEventListener('click',()=>{shown+=24;renderCatalog()});
$('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
$('#productDialog a').addEventListener('click',()=>{const textarea=$('#inquiryForm textarea');textarea.value=`Zanima me proizvod: ${dialog.dataset.product}. Molim vas za informaciju o dostupnosti.`;dialog.close()});

function calculate(){
  const area=Math.max(1,Number($('#area').value)||1),waste=Number($('input[name="waste"]:checked').value)||5,pack=Math.max(.5,Number($('#pack').value)||2.22);
  const needed=area*(1+waste/100),packs=Math.ceil(needed/pack),coverage=packs*pack;
  $('#packs').textContent=String(packs);$('#areaOutput').textContent=`${area} m²`;$('#area').style.setProperty('--progress',`${((area-1)/149)*100}%`);$('.result-ring').style.setProperty('--ring',`${Math.min(92,Math.max(18,(packs/70)*100))}%`);$('#coverage').textContent=`≈ ${coverage.toLocaleString('sr-RS',{maximumFractionDigits:2})} m² ukupne pokrivenosti`;
}
['input','change'].forEach(event=>$('#calculator').addEventListener(event,calculate));calculate();

$('#inquiryForm').addEventListener('submit',event=>{
  event.preventDefault();const fields=event.target.querySelectorAll('input,select,textarea');const subject=encodeURIComponent(`Upit sa sajta — ${fields[2].value}`);const body=encodeURIComponent(`Ime: ${fields[0].value}\nKontakt: ${fields[1].value}\nTražim: ${fields[2].value}\n\n${fields[3].value}`);$('.form-status').textContent='Otvaramo vaš e-mail sa pripremljenim upitom…';location.href=`mailto:maloprodaja@greenlaminati.rs?subject=${subject}&body=${body}`;
});

$$('.city-tab').forEach(button=>button.addEventListener('click',()=>{
  $$('.city-tab').forEach(item=>item.classList.remove('active'));button.classList.add('active');
  const city=button.dataset.city;
  $$('.salon-card').forEach(card=>card.hidden=city!=='all'&&card.dataset.city!==city);
}));
$$('.faq-list details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)$$('.faq-list details').forEach(other=>{if(other!==item)other.open=false})}));
addEventListener('scroll',()=>{const media=$('.hero-media');if(scrollY<innerHeight&&matchMedia('(prefers-reduced-motion:no-preference)').matches)media.style.transform=`scale(1) translateY(${scrollY*.08}px)`},{passive:true});
