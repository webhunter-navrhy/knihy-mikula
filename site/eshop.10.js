/* Linka B9: správanie šablóny e-shopu (košík, filter, galéria, pokladňa). Dáta: window.ESHOP z data.js. */
(function(){
"use strict";
var E=window.ESHOP||{produkty:[]},B=document.body,PRE=B.getAttribute("data-pre")||"./";
var KK="eshop:"+E.slug+":kosik",KA="eshop:"+E.slug+":admin";
function uloz(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function citaj(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
/* úpravy z ukážky adminu (cena, názov, skrytie) sa prejavia aj v obchode */
var A=citaj(KA,{}),U=A.produkty||{};
var P={};E.produkty.forEach(function(p){var u=U[p.id];if(u){if(u.c)p.c=+u.c;if(u.n)p.n=u.n;if(u.skryt)p.skryt=1}P[p.id]=p});
function eur(x){var s=(Math.round(x*100)/100).toFixed(2).split("."),c=s[0].replace(/\B(?=(\d{3})+(?!\d))/g," ");return c+","+s[1]+" €"}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function foto(f){return /^https?:/.test(f)?f:PRE+f}
document.querySelectorAll("[data-cena-id]").forEach(function(el){var p=P[el.getAttribute("data-cena-id")];if(p&&U[p.id]&&U[p.id].c)el.firstChild.nodeValue=eur(p.c)});
document.querySelectorAll("[data-nazov-id]").forEach(function(el){var p=P[el.getAttribute("data-nazov-id")];if(p&&U[p.id]&&U[p.id].n)el.textContent=p.n});
document.querySelectorAll(".kr[data-id]").forEach(function(el){var p=P[el.getAttribute("data-id")];if(p&&p.skryt)el.remove()});

/* fotka, ktorá sa nenačíta (CDN obchodu), sa skryje, aby nebol rozbitý obrázok */
document.querySelectorAll("img[data-p]").forEach(function(im){function zle(){var k=im.closest("[data-kruh]");if(k){k.style.display="none";return}im.style.visibility="hidden"}if(im.complete&&!im.naturalWidth&&im.src)zle();im.addEventListener("error",zle)});

/* menu na mobile */
var mb=document.querySelector(".menu-btn"),mn=document.querySelector(".mnav");
if(mb&&mn)mb.addEventListener("click",function(){var o=mn.classList.toggle("o");mb.setAttribute("aria-expanded",o);document.documentElement.style.overflow=o?"hidden":""});

/* toast */
var T=document.createElement("div");T.className="toast";T.setAttribute("role","status");B.appendChild(T);var tt;
function toast(t){T.textContent=t;T.classList.add("o");clearTimeout(tt);tt=setTimeout(function(){T.classList.remove("o")},2200)}

/* košík */
var K=citaj(KK,[]).filter(function(x){return P[x.id]});
function ulozK(){uloz(KK,K);kresli()}
function spolu(){return K.reduce(function(s,x){return s+P[x.id].c*x.q},0)}
function kusov(){return K.reduce(function(s,x){return s+x.q},0)}
function pridaj(id,q){q=q||1;var x=K.find(function(x){return x.id===id});if(x)x.q+=q;else K.push({id:id,q:q});ulozK();otvor()}
function zmen(id,q){var x=K.find(function(x){return x.id===id});if(!x)return;x.q=Math.max(0,q);if(!x.q)K=K.filter(function(y){return y!==x});ulozK()}
var kp=document.createElement("aside");kp.className="kp";kp.setAttribute("aria-label","Košík");
kp.innerHTML='<div class="kp-h"><h2>Košík</h2><button class="ik" data-zavri aria-label="Zavrieť"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="kp-p"></div><div class="kp-s"></div>';
var kz=document.createElement("div");kz.className="kp-pozadie";B.appendChild(kp);B.appendChild(kz);
function otvor(){kp.classList.add("o");kz.classList.add("o")}
function zavri(){kp.classList.remove("o");kz.classList.remove("o")}
kz.addEventListener("click",zavri);kp.querySelector("[data-zavri]").addEventListener("click",zavri);
document.addEventListener("keydown",function(e){if(e.key==="Escape")zavri()});
function polozka(x,maleMn){var p=P[x.id];return '<div class="pol"><div class="f"><img src="'+esc(foto(p.f[0]))+'" alt="" loading="lazy"></div><div><a href="'+PRE+'p/'+p.s+'/">'+esc(p.n)+'</a>'+
(maleMn?'<div class="mn"><button data-q="-1" data-id="'+x.id+'" aria-label="Menej">−</button><input value="'+x.q+'" inputmode="numeric" data-qi="'+x.id+'" aria-label="Množstvo"><button data-q="1" data-id="'+x.id+'" aria-label="Viac">+</button></div><button class="zm" data-zmaz="'+x.id+'">Odstrániť</button>':'<div style="color:var(--muted);font-size:13.5px;margin-top:4px">'+x.q+' ks</div>')+
'</div><div class="c">'+eur(p.c*x.q)+'</div></div>'}
function kresli(){
  document.querySelectorAll(".pocet").forEach(function(b){var n=kusov();b.textContent=n;b.classList.toggle("je",n>0)});
  var tp=kp.querySelector(".kp-p"),ts=kp.querySelector(".kp-s");
  if(!K.length){tp.innerHTML='<p class="prazdne">Košík je zatiaľ prázdny.</p>';ts.innerHTML='<a class="bt sv pl" href="'+PRE+'produkty/">Prezrieť ponuku</a>'}
  else{tp.innerHTML=K.map(function(x){return polozka(x,1)}).join("");
    ts.innerHTML='<div class="rd"><span>Medzisúčet</span><b>'+eur(spolu())+'</b></div><a class="bt pl" href="'+PRE+'kosik/">Pokračovať k objednávke</a><button class="bt sv pl" data-zavri2>Nakupovať ďalej</button>';
    ts.querySelector("[data-zavri2]").addEventListener("click",zavri)}
  if(window.__pokladna)window.__pokladna();
}
document.addEventListener("click",function(e){
  var t=e.target.closest("[data-pridaj]");
  if(t){e.preventDefault();var mi=document.querySelector("[data-mn-hl]");pridaj(t.getAttribute("data-pridaj"),mi&&t.hasAttribute("data-s-mn")?Math.max(1,parseInt(mi.value)||1):1);return}
  t=e.target.closest("[data-q]");if(t){var x=K.find(function(x){return x.id===t.getAttribute("data-id")});if(x)zmen(x.id,x.q+ +t.getAttribute("data-q"));return}
  t=e.target.closest("[data-zmaz]");if(t){zmen(t.getAttribute("data-zmaz"),0);return}
  t=e.target.closest("[data-kosik]");if(t){e.preventDefault();otvor();return}
  t=e.target.closest("[data-mn-btn]");if(t){var i=document.querySelector("[data-mn-hl]");i.value=Math.max(1,(parseInt(i.value)||1)+ +t.getAttribute("data-mn-btn"))}
});
document.addEventListener("change",function(e){var t=e.target.closest("[data-qi]");if(t)zmen(t.getAttribute("data-qi"),parseInt(t.value)||0)});

/* záložky kategórií na úvode (data-zalozky = id mriežky) */
document.querySelectorAll("[data-zalozky]").forEach(function(z){var m=document.getElementById(z.getAttribute("data-zalozky"));if(!m)return;
  z.addEventListener("click",function(e){var b=e.target.closest("button[data-k]");if(!b)return;var k=b.getAttribute("data-k");
    z.querySelectorAll("button").forEach(function(x){x.setAttribute("aria-selected",x===b)});
    if(k)m.setAttribute("data-tab",k);else m.removeAttribute("data-tab");
    [].forEach.call(m.children,function(c){c.hidden=!!k&&c.getAttribute("data-k")!==k})})});
/* obľúbené (len vizuálne, v prehliadači) */
var OB=citaj("eshop:"+E.slug+":oblubene",[]);
document.querySelectorAll("[data-srdce]").forEach(function(b){var id=b.closest(".kr")&&b.closest(".kr").getAttribute("data-id");
  if(OB.indexOf(id)>-1)b.classList.add("on");b.addEventListener("click",function(){var i=OB.indexOf(id);if(i>-1)OB.splice(i,1);else OB.push(id);
  b.classList.toggle("on");uloz("eshop:"+E.slug+":oblubene",OB)})});

/* galéria detailu */
var gh=document.querySelector(".gal-h img");
document.querySelectorAll(".gal-m button").forEach(function(b){b.addEventListener("click",function(){gh.src=b.querySelector("img").src;
document.querySelectorAll(".gal-m button").forEach(function(x){x.removeAttribute("aria-current")});b.setAttribute("aria-current","true")})});

/* výpis: filter, cena, triedenie, hľadanie */
var mriezka=document.querySelector("[data-vypis]");
if(mriezka){
  var q=new URLSearchParams(location.search),karty=[].slice.call(mriezka.children),fl=document.querySelector(".fl");
  var hl=(q.get("q")||"").toLowerCase();if(q.get("k")){var ch=document.querySelector('[data-fk="'+q.get("k")+'"]');if(ch)ch.checked=true}
  if(q.get("j")){var cj=document.querySelector('[data-fj="'+q.get("j")+'"]');if(cj)cj.checked=true}
  var hi=document.querySelectorAll("input[name=q]");hi.forEach(function(i){i.value=q.get("q")||""});
  function filtruj(){
    var ks=[].slice.call(document.querySelectorAll("[data-fk]:checked")).map(function(c){return c.getAttribute("data-fk")});
    var js_=[].slice.call(document.querySelectorAll("[data-fj]:checked")).map(function(c){return c.getAttribute("data-fj")});
    var od=parseFloat(document.querySelector("[data-od]").value)||0,po=parseFloat(document.querySelector("[data-po]").value)||1e9;
    var sk=document.querySelector("[data-skladom]").checked,tr=document.querySelector("[data-tried]").value,n=0;
    var zoz=karty.filter(function(k){var p=P[k.getAttribute("data-id")];if(!p||p.skryt)return false;
      var ok=(!ks.length||ks.indexOf(p.k)>-1)&&(!js_.length||js_.indexOf(p.j)>-1)&&p.c>=od&&p.c<=po&&(!sk||p.ks)&&(!hl||(p.n+" "+(p.z||"")).toLowerCase().indexOf(hl)>-1);k.hidden=!ok;if(ok)n++;return ok});
    zoz.sort(function(a,b){var x=P[a.getAttribute("data-id")],y=P[b.getAttribute("data-id")];
      return tr==="lac"?x.c-y.c:tr==="dra"?y.c-x.c:tr==="naz"?x.n.localeCompare(y.n,"sk"):(+a.getAttribute("data-i"))-(+b.getAttribute("data-i"))});
    zoz.forEach(function(k){mriezka.appendChild(k)});
    document.querySelector("[data-pocet]").textContent=n+" "+(n===1?"produkt":n>1&&n<5?"produkty":"produktov");
    document.querySelector(".prazdne").hidden=n>0;
  }
  document.querySelectorAll(".fl input,[data-tried]").forEach(function(i){i.addEventListener("input",filtruj);i.addEventListener("change",filtruj)});
  var fb=document.querySelector(".fl-btn");if(fb)fb.addEventListener("click",function(){fl.classList.add("o")});
  document.querySelectorAll(".fl-zavri").forEach(function(b){b.addEventListener("click",function(){fl.classList.remove("o")})});
  filtruj();
}

/* pokladňa (ukážka): košík -> doprava a platba -> údaje -> potvrdenie s ukážkou e-mailu */
var pk=document.querySelector("[data-pokladna]");
if(pk){
  var krok=1,vol={d:"kurier",pl:"karta"};
  var DOP={kurier:["Kuriér na adresu","Doručenie do 1–2 pracovných dní",4.9],box:["Výdajné miesto alebo Z-BOX","Vyzdvihnete, keď sa Vám to hodí",2.9],osobne:["Osobný odber","Na našej adrese "+(E.mesto||""),0]};
  var PLA={karta:["Platba kartou cez Stripe","Visa, Mastercard, Maestro, bezpečne cez platobnú bránu Stripe",0],apple:["Apple Pay / Google Pay","Cez Stripe, rýchla platba telefónom",0],prevod:["Bankový prevod","Údaje pošleme e-mailom",0],dobierka:["Dobierka","Platba pri prevzatí",1.5]};
  /* doprava a platby z ich súčasných podmienok (data.js E.dop / E.pla); cena null = podľa ich cenníka */
  if(E.dop&&E.dop.length){DOP={};E.dop.forEach(function(x){DOP[x[0]]=[x[1],x[2],x[3]]});vol.d=E.dop[0][0]}
  if(E.pla){Object.keys(PLA).forEach(function(k){if(k!=="karta"&&k!=="apple"&&E.pla.indexOf(k)<0)delete PLA[k]});if(PLA.dobierka)PLA.dobierka[2]=null}
  function poplatky(){return (DOP[vol.d][2]||0)+(PLA[vol.pl][2]||0)}
  function neznama(){return DOP[vol.d][2]===null||PLA[vol.pl][2]===null}
  function suhrn(){return '<aside class="suhrn"><h2>Súhrn objednávky</h2>'+K.map(function(x){return polozka(x,0)}).join("")+
    '<div class="rd" style="margin-top:10px"><span>Tovar</span><span>'+eur(spolu())+'</span></div><div class="rd"><span>Doprava a platba</span><span>'+(neznama()?"podľa cenníka":poplatky()?eur(poplatky()):"zadarmo")+'</span></div>'+
    '<div class="rd sp"><span>'+(neznama()?"Spolu s DPH bez dopravy":"Spolu s DPH")+'</span><span>'+eur(spolu()+poplatky())+'</span></div><p class="pozn">Ukážka pokladne: objednávka sa z návrhu nikam neodošle a nič sa neplatí.</p></aside>'}
  function kroky(){return '<div class="kroky">'+["Košík","Doprava a platba","Údaje","Hotovo"].map(function(t,i){return '<span class="'+(i+1===krok?"ak2":"")+'">'+(i+1)+". "+t+'</span>'}).join("")+'</div>'}
  function moznosti(meno,M,akt){return '<div class="vol">'+Object.keys(M).map(function(k){return '<label><input type="radio" name="'+meno+'" value="'+k+'"'+(k===akt?" checked":"")+'><span>'+M[k][0]+'<small>'+esc(M[k][1])+'</small></span><span>'+(M[k][2]===null?"podľa cenníka":M[k][2]?eur(M[k][2]):"zadarmo")+'</span></label>'}).join("")+'</div>'}
  window.__pokladna=function(){
    if(krok===4)return;
    if(!K.length){pk.innerHTML='<div class="hotovo"><h1>Košík je prázdny</h1><p>Pridajte si do košíka niečo z ponuky a vyskúšajte si celú objednávku.</p><p style="margin-top:28px"><a class="bt" href="'+PRE+'produkty/">Prezrieť ponuku</a></p></div>';return}
    var h='<div class="pk"><div>'+kroky();
    if(krok===1)h+='<h2>Košík</h2>'+K.map(function(x){return polozka(x,1)}).join("")+'<div style="display:flex;gap:12px;margin-top:28px;flex-wrap:wrap"><button class="bt" data-dalej>Doprava a platba</button><a class="bt sv" href="'+PRE+'produkty/">Nakupovať ďalej</a></div>';
    if(krok===2)h+='<h2>Doprava</h2>'+moznosti("d",DOP,vol.d)+'<h2>Platba</h2>'+moznosti("pl",PLA,vol.pl)+'<button class="bt" data-dalej>Pokračovať</button>';
    if(krok===3)h+='<h2>Kontaktné údaje</h2><form data-form><div class="pole"><label>Meno a priezvisko<input name="meno" required autocomplete="name" value="Jana Nováková"></label><label>E-mail<input name="email" type="email" required autocomplete="email" value="jana.novakova@example.sk"></label>'+
      '<label>Telefón<input name="tel" autocomplete="tel" value="+421 900 123 456"></label><label>PSČ<input name="psc" autocomplete="postal-code" value="811 01"></label><label class="cele">Ulica a číslo<input name="ulica" autocomplete="street-address" value="Hlavná 12"></label>'+
      '<label class="cele">Mesto<input name="mesto" autocomplete="address-level2" value="Bratislava"></label><label class="cele">Poznámka k objednávke<textarea name="pozn"></textarea></label></div>'+
      '<label class="suhlas"><input type="checkbox" required checked> <span>Súhlasím s <a class="odk" href="'+PRE+'obchodne-podmienky/">obchodnými podmienkami</a> a beriem na vedomie <a class="odk" href="'+PRE+'ochrana-osobnych-udajov/">spracúvanie osobných údajov</a>.</span></label>'+
      '<button class="bt" type="submit">Objednať s povinnosťou platby</button></form>';
    h+='</div>'+suhrn()+'</div>';pk.innerHTML=h;
    var d=pk.querySelector("[data-dalej]");if(d)d.addEventListener("click",function(){krok++;window.__pokladna();scrollTo(0,0)});
    pk.querySelectorAll("input[type=radio]").forEach(function(r){r.addEventListener("change",function(){vol[r.name]=r.value;window.__pokladna()})});
    var f=pk.querySelector("[data-form]");if(f)f.addEventListener("submit",function(e){e.preventDefault();hotovo(new FormData(f))});
  };
  function hotovo(fd){
    krok=4;var c="2026"+String(Math.floor(1000+Math.random()*8999)),sp=spolu()+poplatky();
    var ob=citaj("eshop:"+E.slug+":objednavky",[]);ob.unshift({c:c,m:fd.get("meno"),e:fd.get("email"),s:sp,d:new Date().toISOString(),pol:K.slice()});uloz("eshop:"+E.slug+":objednavky",ob.slice(0,20));
    pk.innerHTML='<div class="hotovo"><div class="ok"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>'+
      '<h1>Ďakujeme, objednávka č. '+c+' je prijatá</h1><p>Takto to uvidí Váš zákazník. Zároveň mu odíde potvrdenie e-mailom a Vám sa objednávka objaví v administrácii.</p>'+
      '<div class="mail"><div class="mail-h">Od: '+esc(E.nazov)+' &lt;'+esc(E.email)+'&gt;<br>Predmet: Potvrdenie objednávky č. '+c+'</div><div class="mail-t">Dobrý deň, '+esc(String(fd.get("meno")).split(" ")[0])+',<br><br>ďakujeme za objednávku v obchode <b>'+esc(E.nazov)+'</b>. '+
      'Objednali ste '+kusov()+' ks tovaru v hodnote <b>'+eur(sp)+'</b>, doprava: '+DOP[vol.d][0].toLowerCase()+', platba: '+PLA[vol.pl][0].toLowerCase()+'.<br><br>O odoslaní Vás budeme informovať ďalším e-mailom.<br><br>S pozdravom<br>'+esc(E.nazov)+(E.telefon?'<br>'+esc(E.telefon):'')+'</div></div>'+
      '<p class="pozn" style="margin-top:22px">Ukážka: objednávka sa z návrhu nikam neodoslala. <a class="odk" href="'+PRE+'admin/">Pozrite si ju v ukážke administrácie</a></p></div>';
    K=[];uloz(KK,K);document.querySelectorAll(".pocet").forEach(function(b){b.textContent=0;b.classList.remove("je")});scrollTo(0,0);
  }
}
kresli();
})();

/* záložky kategórií na úvode. Záložka ukáže produkty kategórie aj mimo úvodného výberu (data-mimo),
   bez osamelých kariet v poslednom rade; „Celá ponuka“ vedie do zvolenej kategórie. Spúšťa sa po eshop.js. */
(function(){
function stlpce(m){return getComputedStyle(m).gridTemplateColumns.split(" ").filter(Boolean).length||1}
function ukaz(m,k){var n=stlpce(m),max=!k?1e9:m.id==="ae-nove"?6-6%n:3*n,v=[];
  [].forEach.call(m.children,function(c){var ok=k?c.getAttribute("data-k")===k:!c.hasAttribute("data-mimo");c.hidden=!ok;if(ok)v.push(c)});
  var ost=v.length>n&&v.length%n===1?1:0;v.slice(Math.min(max,v.length-ost)).forEach(function(c){c.hidden=true})}
document.querySelectorAll("[data-zalozky]").forEach(function(z){var m=document.getElementById(z.getAttribute("data-zalozky"));if(!m)return;
  var sek=z.closest("section"),cela=sek&&[].filter.call(sek.querySelectorAll("a"),function(a){return a.getAttribute("href")==="produkty/"}).pop(),pov=cela&&cela.textContent;
  z.addEventListener("click",function(e){var b=e.target.closest("button[data-k]");if(!b)return;var k=b.getAttribute("data-k");
    setTimeout(function(){ukaz(m,k);if(cela){cela.setAttribute("href",k?"produkty/?k="+k:"produkty/");
      cela.textContent=k?"Všetko z kategórie "+b.textContent.replace("✦","").trim():pov}},0)})});
})();
/* výpis /produkty/ na tablete (3 stĺpce) bez osamelej poslednej karty: keď by ostala 1 sama,
   výpis prejde na 4 stĺpce (alebo 2), produkty sa neskrývajú */
(function(){var m=document.querySelector("[data-vypis]");if(!m)return;
function uprav(){m.style.gridTemplateColumns="";var n=getComputedStyle(m).gridTemplateColumns.split(" ").filter(Boolean).length;
  var v=[].filter.call(m.children,function(c){return !c.hidden&&c.offsetParent!==null}).length;
  if(n===3&&v>3&&v%3===1)m.style.gridTemplateColumns="repeat("+(v%4!==1?4:2)+",minmax(0,1fr))"}
new MutationObserver(function(){requestAnimationFrame(uprav)}).observe(m,{attributes:true,subtree:true,attributeFilter:["hidden","style","class"],childList:true});
addEventListener("resize",uprav);uprav()})();
/* lišta podstránok — kategórie, ktoré sa nezmestia, sa schovajú od konca; „Všetky produkty“ a „Kontakt“
   ostávajú vždy (kategórie sú aj v menu a pätičke). Pri 1000 px sa inak „Kontakt“ orezal na „KON“. */
(function(){var n=document.querySelector("header.hl .nav");if(!n)return;
var kat=[].filter.call(n.querySelectorAll("a"),function(a){return /[?&]k=/.test(a.getAttribute("href")||"")});
function uprav(){kat.forEach(function(a){a.style.display=""});
  for(var i=kat.length-1;i>=0&&n.scrollWidth>n.clientWidth+1;i--)kat[i].style.display="none"}
addEventListener("resize",uprav);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(uprav);uprav()})();

/* vyskakovacie okienko o výpredaji (raz za návštevu) */
(function(){var BASE_=(document.querySelector('script[src*="eshop."]').src||'').replace(/eshop[^\/]*$/,'');var KP="mikula:vypredaj";try{if(sessionStorage.getItem(KP))return}catch(e){}
var o=document.createElement("div");o.className="vyp-o";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-labelledby","vyp-t");
o.innerHTML='<div class="vyp"><button class="vyp-x" aria-label="Zavrieť">✕</button><div class="vyp-s">Výpredaj skladových zásob</div><h2 id="vyp-t">Učebnice a slovníky za výpredajové ceny</h2><p>Po 36 rokoch vydávame posledné zásoby. Anglický, nemecký, francúzsky, taliansky či španielsky jazyk: čo je na sklade, to sa predáva, kým sa nerozchytá.</p><a class="bt" href="'+BASE_+'produkty/?k=akcia">Pozrieť výpredaj</a></div>';
function zavri(){o.remove();document.removeEventListener("keydown",kd);try{sessionStorage.setItem(KP,"1")}catch(e){}}
function kd(e){if(e.key==="Escape")zavri()}
o.addEventListener("click",function(e){if(e.target===o||e.target.closest(".vyp-x")||e.target.closest("a"))zavri()});
document.addEventListener("keydown",kd);setTimeout(function(){document.body.appendChild(o);var b=o.querySelector(".bt");if(b)b.focus()},900)})();
