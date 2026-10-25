/* Linka B9: ukážka administrácie e-shopu. Ukážkové objednávky a zákazníci sú generované (stabilne podľa obchodu),
   produkty sú skutočné z obchodu. Úpravy produktov sa uložia do prehliadača a prejavia sa aj v obchode. */
(function(){
"use strict";
var E=window.ESHOP,PRE=document.body.getAttribute("data-pre")||"../",R=document.getElementById("adm");
var KA="eshop:"+E.slug+":admin";
function citaj(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
function uloz(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function eur(x){var s=(Math.round(x*100)/100).toFixed(2).split("."),c=s[0].replace(/\B(?=(\d{3})+(?!\d))/g," ");return c+","+s[1]+" €"}
function foto(f){return /^https?:/.test(f)?f:PRE+f}
/* stabilný náhodný generátor podľa obchodu */
var h=0;for(var i=0;i<E.slug.length;i++)h=(h*31+E.slug.charCodeAt(i))|0;
function rnd(){h|=0;h=h+0x6D2B79F5|0;var t=Math.imul(h^h>>>15,1|h);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
function vyber(a){return a[Math.floor(rnd()*a.length)]}
var A=citaj(KA,{produkty:{}});A.produkty=A.produkty||{};
var P=E.produkty.map(function(p,i){var u=A.produkty[p.id]||{};return{id:p.id,s:p.s,n:u.n||p.n,c:u.c?+u.c:p.c,f:p.f,kn:p.kn||"Bez kategórie",skryt:!!u.skryt,
  sklad:u.sklad!=null?+u.sklad:(p.ks?Math.floor(3+rnd()*40):0),popis:u.popis||""}});
var MENA=["Jana Nováková","Peter Horváth","Martina Kováčová","Michal Varga","Lucia Tóthová","Tomáš Baláž","Zuzana Molnárová","Martin Szabó","Katarína Šimková","Juraj Kollár",
"Veronika Lukáčová","Marek Nagy","Eva Krajčírová","Lukáš Bartoš","Simona Hudáková","Andrej Polák","Monika Gregorová","Róbert Mikuš","Ivana Benková","Patrik Kráľ","Barbora Oravcová","Filip Urban"];
var MESTA=["Bratislava","Košice","Prešov","Žilina","Nitra","Banská Bystrica","Trnava","Trenčín","Martin","Poprad","Zvolen","Piešťany","Michalovce","Nové Zámky","Levice","Komárno"];
var STAVY=[["nova","Nová"],["zapl","Zaplatená"],["odosl","Odoslaná"],["dor","Doručená"],["zrus","Zrušená"]];
var DOPR=["Kuriér","Z-BOX","Výdajné miesto","Osobný odber"],PLAT=["Karta (Stripe)","Apple Pay (Stripe)","Prevod","Dobierka","Google Pay (Stripe)"];
var dnes=new Date();dnes.setHours(12,0,0,0);
var ZAK=MENA.map(function(m){var e=m.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(" ",".")+"@example.sk";return{m:m,e:e,mesto:vyber(MESTA),ob:0,s:0,posl:null}});
var OBJ=[],c0=2026100;
for(var d=59;d>=0;d--){var n=Math.floor(rnd()*3.2+(d<10?1:0));for(var k=0;k<n;k++){
  var z=vyber(ZAK),pol=[],np=1+Math.floor(rnd()*2.4);for(var j=0;j<np;j++){var p=vyber(P);pol.push({id:p.id,q:1+Math.floor(rnd()*1.6)})}
  var s=pol.reduce(function(a,x){var p=P.find(function(y){return y.id===x.id});return a+p.c*x.q},0)+(rnd()<.6?4.9:2.9);
  var dt=new Date(dnes-d*864e5-Math.floor(rnd()*36e6));var st=d<1?"nova":d<3?vyber(["nova","zapl","odosl"]):d<7?vyber(["odosl","dor","zapl"]):(rnd()<.05?"zrus":"dor");
  OBJ.push({c:String(++c0),z:z,dt:dt,pol:pol,s:s,st:st,dop:vyber(DOPR),pl:vyber(PLAT)});if(st!=="zrus"){z.ob++;z.s+=s;z.posl=dt}}}
citaj("eshop:"+E.slug+":objednavky",[]).forEach(function(o){OBJ.push({c:o.c,z:{m:o.m,e:o.e,mesto:""},dt:new Date(o.d),pol:o.pol.filter(function(x){return P.some(function(p){return p.id===x.id})}),s:o.s,st:"nova",dop:"z ukážky",pl:"z ukážky",ja:1})});
var ZST=citaj(KA,{}).stavy||{};OBJ.forEach(function(o){if(ZST[o.c])o.st=ZST[o.c]});
OBJ.sort(function(a,b){return b.dt-a.dt});
function dat(d){return d.getDate()+". "+(d.getMonth()+1)+"."}
function stav(s){var x=STAVY.find(function(y){return y[0]===s});return '<span class="st st-'+s+'">'+x[1]+'</span>'}
var IK={prehlad:'<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 4v3h6V4z"/>',objednavky:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>',
produkty:'<path d="M4 8l8-4 8 4-8 4zM4 8v8l8 4 8-4V8M12 12v8"/>',zakaznici:'<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .6 3 2.6 3 6"/>',
statistiky:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',nastavenia:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>'};
var MENU=[["prehlad","Prehľad"],["objednavky","Objednávky"],["produkty","Produkty"],["zakaznici","Zákazníci"],["statistiky","Štatistiky"],["nastavenia","Nastavenia"]];
function ik(k){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">'+IK[k]+'</svg>'}
function logo(){return E.logo?'<img src="'+esc(foto(E.logo))+'" alt="'+esc(E.nazov)+'" referrerpolicy="no-referrer">':'<b>'+esc(E.nazov)+'</b>'}

function prihlasenie(){
  R.innerHTML='<div class="prihl"><form>'+logo()+'<h1>Administrácia obchodu</h1><p>Ukážka: prihlasovacie údaje sú vyplnené, stačí kliknúť.</p>'+
  '<label>E-mail<input value="'+esc(E.email)+'" autocomplete="username"></label><label>Heslo<input type="password" value="ukazka123" autocomplete="current-password"></label>'+
  '<button class="bt" type="submit">Prihlásiť sa</button><a href="'+PRE+'" style="font-size:13.5px;color:var(--muted);text-align:center">Späť do obchodu</a></form></div>';
  R.querySelector("form").addEventListener("submit",function(e){e.preventDefault();try{sessionStorage.setItem("adm:"+E.slug,1)}catch(x){}aplikacia()});
}
function aplikacia(){
  R.innerHTML='<div class="app"><nav class="bok"><div class="lg">'+logo()+'</div>'+MENU.map(function(m){return '<a href="#'+m[0]+'" data-m="'+m[0]+'">'+ik(m[0])+m[1]+'</a>'}).join("")+
  '<div class="dole"><a href="'+PRE+'" style="padding:0">Zobraziť obchod ↗</a></div></nav><main class="hlavna"></main></div>';
  addEventListener("hashchange",kresli);kresli();
}
function kresli(){
  var s=(location.hash||"#prehlad").slice(1);if(!MENU.some(function(m){return m[0]===s}))s="prehlad";
  document.querySelectorAll(".bok a[data-m]").forEach(function(a){a.toggleAttribute("aria-current",a.getAttribute("data-m")===s)});
  var M=document.querySelector(".hlavna");M.innerHTML='<div class="uk">Ukážka administrácie: produkty sú z Vášho obchodu, objednávky a zákazníci sú ukážkové. Zmeny produktov sa hneď prejavia v obchode (len vo Vašom prehliadači).</div>'+STR[s]();
  if(PO[s])PO[s](M);scrollTo(0,0);
}
function tabObj(zoz){return '<div class="obal"><table class="tab"><thead><tr><th>Číslo</th><th>Dátum</th><th>Zákazník</th><th class="skry">Doprava</th><th>Stav</th><th class="r">Suma</th></tr></thead><tbody>'+
  zoz.map(function(o){return '<tr data-o="'+o.c+'"><td>'+o.c+'</td><td>'+dat(o.dt)+'</td><td>'+esc(o.z.m)+'</td><td class="skry">'+o.dop+'</td><td>'+stav(o.st)+'</td><td class="r">'+eur(o.s)+'</td></tr>'}).join("")+'</tbody></table></div>'}
function od(dni){var t=dnes-dni*864e5;return OBJ.filter(function(o){return o.dt>=t&&o.st!=="zrus"})}
var STR={
prehlad:function(){
  var o30=od(30),o60=OBJ.filter(function(o){return o.dt<dnes-30*864e5&&o.st!=="zrus"}),t30=o30.reduce(function(a,o){return a+o.s},0),t60=o60.reduce(function(a,o){return a+o.s},0)||1;
  var dni=[];for(var d=29;d>=0;d--){var den=new Date(dnes-d*864e5);dni.push(OBJ.filter(function(o){return o.st!=="zrus"&&o.dt.toDateString()===den.toDateString()}).reduce(function(a,o){return a+o.s},0))}
  var mx=Math.max.apply(null,dni)||1,w=100/30;
  var bary=dni.map(function(v,i){var hh=v/mx*180;return '<rect x="'+(i*w+w*.18).toFixed(2)+'%" y="'+(200-hh).toFixed(1)+'" width="'+(w*.64).toFixed(2)+'%" height="'+Math.max(hh,1.5).toFixed(1)+'" rx="0.35" ry="3" fill="var(--a)" opacity="'+(i===29?1:.78)+'"><title>'+eur(v)+'</title></rect>'}).join("");
  var nove=OBJ.filter(function(o){return o.st==="nova"}).length,mal=P.filter(function(p){return p.sklad<5}).length;
  return '<div class="top"><h1>Dobrý deň</h1><span style="color:var(--muted)">'+dnes.toLocaleDateString("sk-SK",{weekday:"long",day:"numeric",month:"long"})+'</span></div>'+
  '<div class="kpi"><div><small>Tržby za 30 dní</small><b>'+eur(t30)+'</b><i>'+(t30>=t60?"+":"")+Math.round((t30/t60-1)*100)+' % oproti minulým 30 dňom</i></div><div><small>Objednávky za 30 dní</small><b>'+o30.length+'</b><i>'+nove+' čaká na vybavenie</i></div>'+
  '<div><small>Priemerná objednávka</small><b>'+eur(t30/(o30.length||1))+'</b></div><div><small>Konverzný pomer</small><b>'+(1.6+rnd()*1.4).toFixed(1).replace(".",",")+' %</b><i>z '+(o30.length*48+Math.floor(rnd()*400))+' návštev</i></div></div>'+
  '<div class="dve"><section class="kr"><h2>Tržby za posledných 30 dní</h2><svg class="graf" viewBox="0 0 100 200" preserveAspectRatio="none" style="height:200px">'+bary+'</svg></section>'+
  '<section class="kr"><h2>Treba vybaviť</h2><div class="riadky"><dt>Nové objednávky</dt><dd><b>'+nove+'</b></dd><dt>Produkty s nízkym skladom</dt><dd><b>'+mal+'</b></dd><dt>Neodpovedané otázky</dt><dd><b>'+Math.floor(rnd()*4)+'</b></dd></div>'+
  '<a class="bt" href="#objednavky" style="width:100%">Prejsť na objednávky</a></section></div>'+
  '<section class="kr"><h2>Posledné objednávky <a href="#objednavky">Všetky</a></h2>'+tabObj(OBJ.slice(0,6))+'</section>';
},
objednavky:function(){return '<div class="top"><h1>Objednávky</h1><button class="bt sv" data-export>Export do CSV</button></div><div class="filtre">'+
  '<button aria-pressed="true" data-f="">Všetky</button>'+STAVY.map(function(s){return '<button aria-pressed="false" data-f="'+s[0]+'">'+s[1]+'</button>'}).join("")+'</div><section class="kr" data-t>'+tabObj(OBJ)+'</section>'},
produkty:function(){return '<div class="top"><h1>Produkty</h1><button class="bt" data-novy>Pridať produkt</button></div><div class="filtre"><input placeholder="Hľadať produkt" data-hl></div>'+
  '<section class="kr"><div class="obal"><table class="tab"><thead><tr><th></th><th>Názov</th><th class="skry">Kategória</th><th class="r">Sklad</th><th class="r">Cena</th><th>Viditeľný</th></tr></thead><tbody data-pr>'+
  P.map(function(p){return '<tr data-p="'+p.id+'"><td><img src="'+esc(foto(p.f[0]))+'" alt="" loading="lazy" referrerpolicy="no-referrer"></td><td class="n">'+esc(p.n)+'</td><td class="skry">'+esc(p.kn)+'</td><td class="r" style="color:'+(p.sklad<5?"var(--warn)":"inherit")+'">'+p.sklad+' ks</td><td class="r">'+eur(p.c)+'</td><td>'+(p.skryt?"Skrytý":"Áno")+'</td></tr>'}).join("")+'</tbody></table></div></section>'},
zakaznici:function(){var z=ZAK.filter(function(z){return z.ob}).sort(function(a,b){return b.s-a.s});return '<div class="top"><h1>Zákazníci</h1><span style="color:var(--muted)">'+z.length+' zákazníkov</span></div><section class="kr"><div class="obal"><table class="tab"><thead><tr><th>Meno</th><th class="skry">E-mail</th><th class="skry">Mesto</th><th class="r">Objednávky</th><th class="r">Spolu</th><th class="r skry">Posledná</th></tr></thead><tbody>'+
  z.map(function(x){return '<tr><td>'+esc(x.m)+'</td><td class="skry">'+x.e+'</td><td class="skry">'+x.mesto+'</td><td class="r">'+x.ob+'</td><td class="r">'+eur(x.s)+'</td><td class="r skry">'+(x.posl?dat(x.posl):"")+'</td></tr>'}).join("")+'</tbody></table></div></section>'},
statistiky:function(){
  var pk={},pp={};OBJ.forEach(function(o){if(o.st==="zrus")return;o.pol.forEach(function(x){var p=P.find(function(y){return y.id===x.id});if(!p)return;pk[p.kn]=(pk[p.kn]||0)+p.c*x.q;pp[p.id]=(pp[p.id]||0)+x.q})});
  var kat=Object.keys(pk).sort(function(a,b){return pk[b]-pk[a]}),mk=pk[kat[0]]||1,top=Object.keys(pp).sort(function(a,b){return pp[b]-pp[a]}).slice(0,8),mp=pp[top[0]]||1;
  var dopr={};OBJ.forEach(function(o){dopr[o.dop]=(dopr[o.dop]||0)+1});var plat={};OBJ.forEach(function(o){plat[o.pl]=(plat[o.pl]||0)+1});
  function pruhy(o){var k=Object.keys(o).sort(function(a,b){return o[b]-o[a]}),m=o[k[0]]||1,sp=k.reduce(function(a,x){return a+o[x]},0);return k.map(function(x){return '<div class="pruh"><span class="n">'+esc(x)+'</span><span class="b"><span style="width:'+(o[x]/m*100)+'%"></span></span><span class="r" style="text-align:right">'+Math.round(o[x]/sp*100)+' %</span></div>'}).join("")}
  return '<div class="top"><h1>Štatistiky</h1><span style="color:var(--muted)">posledných 60 dní</span></div><div class="dve"><section class="kr"><h2>Tržby podľa kategórií</h2>'+
  kat.map(function(k){return '<div class="pruh"><span class="n">'+esc(k)+'</span><span class="b"><span style="width:'+(pk[k]/mk*100)+'%"></span></span><span style="text-align:right">'+eur(pk[k]).replace(/,\d\d/,"")+'</span></div>'}).join("")+'</section>'+
  '<section class="kr"><h2>Doprava</h2>'+pruhy(dopr)+'<h2 style="margin-top:20px">Platba</h2>'+pruhy(plat)+'</section></div>'+
  '<section class="kr"><h2>Najpredávanejšie produkty</h2>'+top.map(function(id){var p=P.find(function(y){return y.id===id});return '<div class="pruh"><span class="n">'+esc(p.n)+'</span><span class="b"><span style="width:'+(pp[id]/mp*100)+'%"></span></span><span style="text-align:right">'+pp[id]+' ks</span></div>'}).join("")+'</section>';
},
nastavenia:function(){return '<div class="top"><h1>Nastavenia obchodu</h1></div><section class="kr"><h2>Obchod</h2><div class="riadky"><dt>Názov</dt><dd>'+esc(E.nazov)+'</dd><dt>Firma</dt><dd>'+esc(E.firma)+'</dd><dt>E-mail pre objednávky</dt><dd>'+esc(E.email)+'</dd><dt>Telefón</dt><dd>'+esc(E.telefon)+'</dd></div></section>'+
  '<section class="kr"><h2>Doprava a platby</h2><div style="display:flex;flex-direction:column;gap:10px">'+["Kuriér na adresu, 4,90 €","Z-BOX a výdajné miesta, 2,90 €","Osobný odber, zadarmo","Platba kartou cez Stripe (Visa, Mastercard, Maestro)","Apple Pay a Google Pay cez Stripe","Bankový prevod s QR kódom","Dobierka, 1,50 €"].map(function(t){return '<label class="prep"><input type="checkbox" checked> '+t+'</label>'}).join("")+'</div></section>'+
  '<section class="kr"><h2>Napojenia</h2><div style="display:flex;flex-direction:column;gap:10px">'+["Faktúry automaticky (SuperFaktúra / iKros)","Export produktov pre Google Nákupy a Heureku","Zásielkovňa / Packeta","Newsletter pri objednávke (so súhlasom)"].map(function(t,i){return '<label class="prep"><input type="checkbox"'+(i<2?" checked":"")+'> '+t+'</label>'}).join("")+'</div></section>'}
};
function modal(html,po){var m=document.createElement("div");m.className="modal";m.innerHTML='<div role="dialog" aria-modal="true">'+html+'</div>';document.body.appendChild(m);
  m.addEventListener("click",function(e){if(e.target===m||e.target.closest("[data-zavri]"))m.remove()});if(po)po(m);return m}
var PO={
prehlad:function(M){M.querySelectorAll("tr[data-o]").forEach(detObj)},
objednavky:function(M){M.querySelectorAll("tr[data-o]").forEach(detObj);
  M.querySelectorAll("[data-f]").forEach(function(b){b.addEventListener("click",function(){M.querySelectorAll("[data-f]").forEach(function(x){x.setAttribute("aria-pressed",x===b)});
    var f=b.getAttribute("data-f");M.querySelector("[data-t]").innerHTML=tabObj(OBJ.filter(function(o){return !f||o.st===f}));M.querySelectorAll("tr[data-o]").forEach(detObj)})});
  M.querySelector("[data-export]").addEventListener("click",function(){var csv="cislo;datum;zakaznik;stav;suma\n"+OBJ.map(function(o){return [o.c,o.dt.toISOString().slice(0,10),o.z.m,o.st,o.s.toFixed(2).replace(".",",")].join(";")}).join("\n");
    var a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["﻿"+csv],{type:"text/csv"}));a.download="objednavky.csv";a.click()})},
produkty:function(M){
  M.querySelector("[data-hl]").addEventListener("input",function(){var q=this.value.toLowerCase();M.querySelectorAll("tr[data-p]").forEach(function(r){r.hidden=r.children[1].textContent.toLowerCase().indexOf(q)<0})});
  M.querySelectorAll("tr[data-p]").forEach(function(r){r.addEventListener("click",function(){uprav(P.find(function(p){return p.id===r.getAttribute("data-p")}))})});
  M.querySelector("[data-novy]").addEventListener("click",function(){modal('<h2>Nový produkt</h2><label>Názov<input></label><label>Cena s DPH (€)<input inputmode="decimal"></label><label>Popis<textarea></textarea></label><label>Fotky<input type="file" multiple accept="image/*" style="height:auto;padding:10px"></label><div class="ak"><button class="bt sv" data-zavri>Zrušiť</button><button class="bt" data-zavri>Uložiť (ukážka)</button></div>')})}
};
function detObj(r){r.addEventListener("click",function(){var o=OBJ.find(function(x){return x.c===r.getAttribute("data-o")});
  modal('<h2>Objednávka '+o.c+'</h2><dl class="riadky"><dt>Zákazník</dt><dd>'+esc(o.z.m)+(o.z.mesto?", "+o.z.mesto:"")+'</dd><dt>E-mail</dt><dd>'+esc(o.z.e)+'</dd><dt>Dátum</dt><dd>'+o.dt.toLocaleString("sk-SK")+'</dd><dt>Doprava</dt><dd>'+o.dop+'</dd><dt>Platba</dt><dd>'+o.pl+'</dd></dl>'+
  '<table class="tab" style="margin-bottom:14px"><tbody>'+o.pol.map(function(x){var p=P.find(function(y){return y.id===x.id});return '<tr><td><img src="'+esc(foto(p.f[0]))+'" alt="" referrerpolicy="no-referrer"></td><td class="n" style="max-width:240px">'+esc(p.n)+'</td><td class="r">'+x.q+' ks</td><td class="r">'+eur(p.c*x.q)+'</td></tr>'}).join("")+'</tbody></table>'+
  '<label>Stav objednávky<select data-st>'+STAVY.map(function(s){return '<option value="'+s[0]+'"'+(s[0]===o.st?" selected":"")+'>'+s[1]+'</option>'}).join("")+'</select></label>'+
  '<p style="color:var(--muted);font-size:13px;margin:0 0 6px">Pri zmene stavu dostane zákazník e-mail (v ukážke sa neodosiela).</p><div class="ak"><button class="bt sv" data-zavri>Zavrieť</button><button class="bt" data-ulozst>Uložiť</button></div>',
  function(m){m.querySelector("[data-ulozst]").addEventListener("click",function(){o.st=m.querySelector("[data-st]").value;var a=citaj(KA,{});a.stavy=a.stavy||{};a.stavy[o.c]=o.st;uloz(KA,a);m.remove();kresli()})})})}
function uprav(p){modal('<h2>Upraviť produkt</h2><label>Názov<input data-n value="'+esc(p.n)+'"></label><label>Cena s DPH (€)<input data-c inputmode="decimal" value="'+p.c.toFixed(2).replace(".",",")+'"></label>'+
  '<label>Sklad (ks)<input data-s inputmode="numeric" value="'+p.sklad+'"></label><label class="prep" style="flex-direction:row"><input type="checkbox" data-v'+(p.skryt?"":" checked")+'> Zobrazovať v obchode</label>'+
  '<div class="ak"><a class="bt sv" href="'+PRE+'p/'+p.s+'/" target="_blank">Zobraziť v obchode</a><button class="bt" data-ul>Uložiť</button></div>',function(m){m.querySelector("[data-ul]").addEventListener("click",function(){
    var a=citaj(KA,{});a.produkty=a.produkty||{};var c=parseFloat(m.querySelector("[data-c]").value.replace(",","."));
    a.produkty[p.id]={n:m.querySelector("[data-n]").value.trim()||p.n,c:c>0?c:p.c,sklad:parseInt(m.querySelector("[data-s]").value)||0,skryt:!m.querySelector("[data-v]").checked};uloz(KA,a);
    p.n=a.produkty[p.id].n;p.c=a.produkty[p.id].c;p.sklad=a.produkty[p.id].sklad;p.skryt=a.produkty[p.id].skryt;m.remove();kresli()})})}
var prihl=false;try{prihl=!!sessionStorage.getItem("adm:"+E.slug)}catch(x){}
if(prihl)aplikacia();else prihlasenie();
})();
