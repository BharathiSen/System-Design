/* ===== Whiteboard self-check: your diagram vs the reference ===== */
(function(){
"use strict";
const {V,esc}=window.SQ;const S=()=>window.SQ.state;
const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const KIND_WORDS={cache:["cache","redis","memcache","memcached"],db:["db","database","postgres","mysql","sql","dynamo","cassandra","mongo","store","storage","s3","table"],queue:["queue","kafka","sqs","rabbit","stream","bus","pubsub","pub/sub","topic"],edge:["load balancer","lb","gateway","cdn","proxy","nginx","alb","edge","waiting room"],client:["client","user","browser","app","mobile","web"],ext:["provider","stripe","payment","external","apns","fcm","email","sms","psp","third"],svc:[]};
const STOP=new Set(["service","services","server","servers","the","and","for","app","api","worker","workers","layer","system","with","per","+","/","·"]);
const GENERIC=["Read path and write path are both visible","Arrows are labelled with the call or event","No single point of failure is left unexplained","Async or slow work sits behind a queue (if the design has any)"];

function drawnText(){const els=window.SQ.wbElements().filter(e=>!e.isDeleted);const tagged=new Set(els.filter(e=>e.customData&&e.customData.sq).map(e=>e.id));
  /* only what you drew: skip the practice frame, the reference, and labels inside them */
  return els.filter(e=>typeof e.text==="string"&&!(e.customData&&e.customData.sq)&&!(e.containerId&&tagged.has(e.containerId))).map(e=>e.text.toLowerCase()).join(" \n ");}
function found(node,text){
  const [,, ,label,sub,kind]=node;
  const toks=(label+" "+(sub||"")).toLowerCase().split(/[^a-z0-9]+/).filter(t=>t.length>=3&&!STOP.has(t));
  const words=(KIND_WORDS[kind]||[]).concat(toks);
  return words.some(w=>new RegExp("(^|[^a-z])"+w.replace(/[.*+?^${}()|[\]\\/]/g,"\\$&")+"([^a-z]|$)").test(text));
}
function open(){
  const p=window.SQ.wbProblem();
  if(!p||!p.sol.dia){window.SQ.toast("Pick a problem that has a reference diagram first");return;}
  const text=drawnText();const nodes=p.sol.dia.n;
  const key="wbc:"+window.SQ.wbBoardId()+":"+window.SQ.today();const done=(S().revised||{})[key];
  const ov=document.createElement("div");ov.id="wbcheck";ov.setAttribute("role","dialog");ov.setAttribute("aria-label","Diagram self-check");
  ov.innerHTML=`<div class="wbc-in"><div class="row" style="justify-content:space-between"><div><div class="eyebrow">Self-check</div><h2 style="margin:2px 0">${esc(p.title)}</h2></div><button class="btn ghost sm" id="wbcClose">Close</button></div>
  <div class="grid g2" style="margin-top:10px"><div class="card"><b>Your diagram</b><div id="wbcMine" class="wbc-img"><span class="small muted">Rendering your drawing…</span></div></div><div class="card"><b>Reference</b>${window.SQ.diagram(p.sol.dia,"")}</div></div>
  <div class="card" style="margin-top:12px"><b>Does your diagram have…</b><p class="small muted" style="margin:2px 0 8px">Items marked <span class="tag easy">spotted</span> were found in your drawing's text. Tick only what you really drew. +5 XP per item, once per board per day.</p>
  ${nodes.map((n,i)=>{const hit=text&&found(n,text);return `<label class="chk"><input type="checkbox" data-w="${i}" ${hit?"checked":""}> <span><b>${esc(n[3])}</b>${n[4]?` <span class="small muted">(${esc(n[4])})</span>`:""} ${hit?'<span class="tag easy">spotted</span>':""}</span></label>`;}).join("")}
  ${GENERIC.map((g,i)=>`<label class="chk"><input type="checkbox" data-g="${i}"> ${esc(g)}</label>`).join("")}
  <div class="row" style="margin-top:10px"><button class="btn gold" id="wbcDone" ${done?"disabled":""}>${done?"Counted today ✓":"Score my diagram"}</button><span class="small muted" id="wbcScore"></span></div></div></div>`;
  document.body.appendChild(ov);
  const close=()=>{ov.remove();document.removeEventListener("keydown",esc_);};const esc_=e=>{if(e.key==="Escape")close();};document.addEventListener("keydown",esc_);
  $("#wbcClose",ov).onclick=close;ov.onclick=e=>{if(e.target===ov)close();};
  window.SQ.wbPngUrl().then(u=>{const m=$("#wbcMine",ov);if(!m)return;m.innerHTML=u?`<img src="${u}" alt="Your current whiteboard drawing">`:`<span class="small muted">Nothing drawn yet.</span>`;});
  const upd=()=>{const n=$$("input[type=checkbox]",ov).filter(c=>c.checked).length,t=$$("input[type=checkbox]",ov).length;$("#wbcScore",ov).textContent=`${n}/${t} · ${Math.round(n/t*100)}% of the reference covered`;};
  $$("input[type=checkbox]",ov).forEach(c=>c.onchange=upd);upd();
  $("#wbcDone",ov).onclick=()=>{const n=$$("input[type=checkbox]",ov).filter(c=>c.checked).length;if(!S().revised)S().revised={};if(S().revised[key])return;S().revised[key]=1;
    const xp=Math.min(50,n*5);if(xp)window.SQ.addXP(xp,`Diagram self-check: ${n} items`);else window.SQ.save();
    const missed=nodes.filter((_,i)=>!$(`[data-w="${i}"]`,ov).checked).map(x=>x[3]);
    $("#wbcDone",ov).disabled=true;$("#wbcDone",ov).textContent="Counted ✓";$("#wbcScore",ov).textContent=missed.length?`Add next time: ${missed.join(", ")}`:"Every reference component covered. Nice.";};
}
const orig=V.board;
V.board=function(el){
  orig(el);
  const ref=$("#wbRef",el);if(!ref)return;
  ref.insertAdjacentHTML("afterend",`<button class="btn sm primary" id="wbCheck" ${ref.disabled?"disabled":""}>Self-check vs reference</button>`);
  $("#wbCheck",el).onclick=open;
};
for(const k of ["pid","keep"])Object.defineProperty(V.board,k,{get(){return orig[k];},set(v){orig[k]=v;}});
})();
