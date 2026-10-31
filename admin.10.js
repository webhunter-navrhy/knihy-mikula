/* Administrácia e-shopu: skutočné prihlásenie a objednávky (API WebHunter administrácie). */
(function(){
"use strict";
var E=window.ESHOP,PRE=document.body.getAttribute("data-pre")||"../",R=document.getElementById("adm");
var API="https://webhunter-admin.webhunter.workers.dev/api/knihy-mikula/",TK="adm:"+E.slug+":t";
var STAVY={nova:"Nová – čaká na platbu",zaplacena:"Zaplatená",pripravena:"Odoslaná",vyrizena:"Vybavená",zrusena:"Zrušená"};
var token="";try{token=sessionStorage.getItem(TK)||""}catch(e){}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function eur(x){var s=(Math.round(x*100)/100).toFixed(2).split("."),c=s[0].replace(/\B(?=(\d{3})+(?!\d))/g," ");return c+","+s[1]+" €"}
function dat(i){var d=new Date(i);return d.getDate()+". "+(d.getMonth()+1)+". "+d.getFullYear()+" "+("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2)}
function logo(){return E.logo?'<img src="'+esc(PRE+E.logo)+'" alt="'+esc(E.nazov)+'">':'<b>'+esc(E.nazov)+'</b>'}
function api(p,body){var o={headers:{"Authorization":"Bearer "+token}};if(body){o.method="POST";o.headers["Content-Type"]="application/json";o.body=JSON.stringify(body)}
  return fetch(API+p,o).then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(r.status===401&&token&&p!=="login"){odhlas();throw new Error("Prihlásenie vypršalo.")}if(!r.ok)throw new Error(j.error||"Chyba "+r.status);return j})})}
function odhlas(){token="";try{sessionStorage.removeItem(TK)}catch(e){}prihlasenie()}
function modal(html,po){var m=document.createElement("div");m.className="modal";m.innerHTML='<div role="dialog" aria-modal="true">'+html+'</div>';document.body.appendChild(m);
  m.addEventListener("click",function(e){if(e.target===m||e.target.closest("[data-zavri]"))m.remove()});if(po)po(m);return m}
function stav(s){return '<span class="st st-'+esc(s)+'">'+esc(STAVY[s]||s)+'</span>'}

function prihlasenie(){
  R.innerHTML='<div class="prihl"><form>'+logo()+'<h1>Administrácia obchodu</h1><p>Prihláste sa heslom k administrácii.</p>'+
  '<label>Heslo<input type="password" name="pw" required autocomplete="current-password"></label><p class="chyba" role="alert" style="color:#b3261e;margin:0"></p>'+
  '<button class="bt" type="submit">Prihlásiť sa</button><a href="'+PRE+'" style="font-size:13.5px;color:var(--muted);text-align:center">Späť do obchodu</a></form></div>';
  var f=R.querySelector("form");f.addEventListener("submit",function(e){e.preventDefault();var b=f.querySelector("button");b.disabled=true;
    api("login",{password:f.pw.value}).then(function(j){token=j.token;try{sessionStorage.setItem(TK,token)}catch(x){}aplikacia(j.def)}).catch(function(x){f.querySelector(".chyba").textContent=x.message;b.disabled=false})});
}
var MENU=[["objednavky","Objednávky"],["nastavenia","Nastavenia"]];
function aplikacia(def){
  R.innerHTML='<div class="app"><nav class="bok"><div class="lg">'+logo()+'</div>'+MENU.map(function(m){return '<a href="#'+m[0]+'" data-m="'+m[0]+'">'+m[1]+'</a>'}).join("")+
  '<div class="dole"><a href="'+PRE+'" style="padding:0">Zobraziť obchod ↗</a><a href="#" data-von style="padding:0;margin-top:8px;display:block">Odhlásiť sa</a></div></nav><main class="hlavna"></main></div>';
  R.querySelector("[data-von]").addEventListener("click",function(e){e.preventDefault();odhlas()});
  addEventListener("hashchange",kresli);kresli(def);
}
function kresli(def){
  var s=(location.hash||"#objednavky").slice(1);if(!MENU.some(function(m){return m[0]===s}))s="objednavky";
  document.querySelectorAll(".bok a[data-m]").forEach(function(a){a.toggleAttribute("aria-current",a.getAttribute("data-m")===s)});
  var M=document.querySelector(".hlavna");if(!M)return;
  if(s==="objednavky")objednavky(M);else nastavenia(M,def===true);
}
var FIL="";
function objednavky(M){
  M.innerHTML='<div class="top"><h1>Objednávky</h1></div><p>Načítavam…</p>';
  api("orders").then(function(j){
    var Z=(j.orders||[]);
    var h='<div class="top"><h1>Objednávky</h1><span style="color:var(--muted)">'+Z.length+' spolu</span></div>';
    if(j.test)h+='<div class="uk">Skúšobná prevádzka: objednávky zatiaľ prichádzajú z testovacej adresy webu, zákazníci o nich dostávajú upozornenie, že sa nevybavujú.</div>';
    h+='<div class="filtre"><button aria-pressed="'+(FIL===""?"true":"false")+'" data-f="">Všetky</button>'+Object.keys(STAVY).map(function(k){return '<button aria-pressed="'+(FIL===k?"true":"false")+'" data-f="'+k+'">'+esc(STAVY[k])+'</button>'}).join("")+'</div>';
    var L=Z.filter(function(o){return !FIL||o.s===FIL});
    h+='<section class="kr">'+(L.length?'<div class="obal"><table class="tab"><thead><tr><th>Číslo</th><th>Dátum</th><th>Zákazník</th><th>Stav</th><th class="r">Suma</th></tr></thead><tbody>'+
      L.map(function(o){return '<tr data-o="'+esc(o.num)+'" style="cursor:pointer"><td>'+esc(o.num)+(o.x?' <small>(test)</small>':'')+'</td><td>'+dat(o.d)+'</td><td>'+esc(o.n||"")+'</td><td>'+stav(o.s)+'</td><td class="r">'+eur(o.t||0)+'</td></tr>'}).join("")+'</tbody></table></div>':'<p>Zatiaľ tu nie sú žiadne objednávky.</p>')+'</section>';
    M.innerHTML=h;
    M.querySelectorAll("[data-f]").forEach(function(b){b.addEventListener("click",function(){FIL=b.getAttribute("data-f");objednavky(M)})});
    M.querySelectorAll("tr[data-o]").forEach(function(t){t.addEventListener("click",function(){detail(t.getAttribute("data-o"),M)})});
  }).catch(function(x){M.innerHTML='<div class="top"><h1>Objednávky</h1></div><p style="color:#b3261e">'+esc(x.message)+'</p>'});
}
function detail(num,M){
  api("orders?num="+encodeURIComponent(num)).then(function(o){
    var c=o.customer||{},it=(o.items||[]).map(function(x){return '<dt>'+esc(x.name)+' × '+x.q+'</dt><dd>'+eur(x.sum)+'</dd>'}).join("");
    modal('<h2>Objednávka č. '+esc(o.num)+'</h2><p style="color:var(--muted);margin-bottom:12px">'+dat(o.created)+' · '+stav(o.status)+(o.test?' · skúšobná':'')+'</p>'+
      '<div class="riadky">'+it+'<dt>'+esc((o.ship||{}).name||"Doprava")+'</dt><dd>'+((o.ship||{}).tbd?"podľa cenníka":eur((o.ship||{}).price||0))+'</dd><dt><b>Spolu</b></dt><dd><b>'+eur(o.total)+'</b></dd></div>'+
      '<h3 style="margin:18px 0 6px;font-size:16px">Zákazník</h3><p>'+esc(c.name)+'<br><a href="mailto:'+esc(c.email)+'">'+esc(c.email)+'</a>'+(c.phone?'<br>'+esc(c.phone):'')+'<br>'+esc([c.street,[c.zip,c.city].filter(Boolean).join(" ")].filter(Boolean).join(", "))+(c.note?'<br><i>'+esc(c.note)+'</i>':'')+'</p>'+
      '<p style="margin-top:10px;font-size:13.5px;color:var(--muted)">Platba prevodom, variabilný symbol '+esc(o.num)+'</p>'+
      '<label style="margin-top:16px">Stav<select data-st>'+Object.keys(STAVY).map(function(k){return '<option value="'+k+'"'+(k===o.status?" selected":"")+'>'+esc(STAVY[k])+'</option>'}).join("")+'</select></label>'+
      '<label>Interná poznámka<textarea data-pz rows="3">'+esc(o.note||"")+'</textarea></label><p class="chyba" role="alert" style="color:#b3261e"></p>'+
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="bt" data-uloz>Uložiť</button><button class="bt sv" data-zavri>Zavrieť</button></div>',function(m){
        m.querySelector("[data-uloz]").addEventListener("click",function(){var b=this;b.disabled=true;
          api("orders",{num:o.num,status:m.querySelector("[data-st]").value,note:m.querySelector("[data-pz]").value}).then(function(){m.remove();objednavky(M)}).catch(function(x){m.querySelector(".chyba").textContent=x.message;b.disabled=false})})});
  }).catch(function(x){alert(x.message)});
}
function nastavenia(M,def){
  M.innerHTML='<div class="top"><h1>Nastavenia</h1></div>'+(def?'<div class="uk">Stále používate úvodné heslo. Zmeňte ho prosím nižšie.</div>':'')+
  '<section class="kr"><h2>Obchod</h2><div class="riadky"><dt>Názov</dt><dd>'+esc(E.nazov)+'</dd><dt>Firma</dt><dd>'+esc(E.firma)+'</dd><dt>E-mail pre objednávky</dt><dd>'+esc(E.email)+'</dd><dt>Platba</dt><dd>Bankový prevod (QR kód v e-maili)</dd></div></section>'+
  '<section class="kr"><h2>Zmena hesla</h2><form data-pw style="display:flex;flex-direction:column;gap:12px;max-width:380px"><label>Súčasné heslo<input type="password" name="o" required autocomplete="current-password"></label>'+
  '<label>Nové heslo (aspoň 8 znakov)<input type="password" name="n" required minlength="8" autocomplete="new-password"></label><p class="chyba" role="alert" style="color:#b3261e;margin:0"></p><button class="bt" type="submit">Zmeniť heslo</button></form></section>'+
  '<section class="kr"><h2>Produkty a ceny</h2><p>Zmeny produktov, cien, dopravy a čísla účtu zatiaľ robíme my: napíšte na <a href="mailto:info.webhunter@email.cz">info.webhunter@email.cz</a>.</p></section>';
  var f=M.querySelector("[data-pw]");f.addEventListener("submit",function(e){e.preventDefault();var b=f.querySelector("button"),er=f.querySelector(".chyba");b.disabled=true;er.style.color="#b3261e";
    api("password",{old:f.o.value,password:f.n.value}).then(function(j){token=j.token;try{sessionStorage.setItem(TK,token)}catch(x){}er.style.color="#1a7f37";er.textContent="Heslo je zmenené.";f.reset();b.disabled=false}).catch(function(x){er.textContent=x.message;b.disabled=false})});
}
if(token){api("me").then(function(j){aplikacia(j.def)}).catch(prihlasenie)}else prihlasenie();
})();
