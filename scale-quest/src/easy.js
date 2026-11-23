/* ===== Beginner layer: plain-English boxes + tap-to-explain jargon ===== */
(function(){
"use strict";
const {V,esc}=window.SQ;
const $=(s,r=document)=>r.querySelector(s);

/* ---- glossary matcher ---- */
const ALIASES=[];
/* words whose meaning changes with context: listed in the glossary, never auto-explained */
const NOAUTO=new Set(["Strategy","State","Factory","Observer","Singleton","Node","Table / row / column","Query","Event","Request","Response","Client","Log","Lock","Window","Push","Burst","Peak","Composition","Resource","Container","Consistency (in CAP)","Partition","Hashing","Token","Interface / abstract class","Commit / rollback","Workflow","Entity","Session","Batching","Chunk","Weights","Metric","Alert","Eval","Tool / function calling","Class / object","Join"]);
Object.entries(GLOSSARY).forEach(([k,d])=>{if(NOAUTO.has(k))return;
  const vs=new Set();
  k.split(" / ").forEach(part=>{const m=part.match(/^(.*?)\s*\((.*?)\)\s*$/);if(m){vs.add(m[1]);vs.add(m[2]);}else vs.add(part);});
  vs.forEach(v=>{v=v.trim();if(v.length<2||!/^[A-Za-z0-9][A-Za-z0-9 .'-]*$/.test(v))return;
    const cs=(v.match(/[A-Z]/g)||[]).length>=2||/\d/.test(v);
    const src=v.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/ /g,"\\s+");
    ALIASES.push({key:k,d,re:new RegExp("(^|[^A-Za-z0-9])("+src+")(?![A-Za-z0-9])",cs?"":"i"),len:v.length});});
});
ALIASES.sort((a,b)=>b.len-a.len);
const SKIP=new Set(["A","CODE","PRE","ABBR","BUTTON","TEXTAREA","INPUT","SELECT","OPTION","H1","H2","H3","SUMMARY","SCRIPT","STYLE","svg","SVG","LABEL"]);
function glossify(root){
  if(!root)return;const used=new Set();
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){
    for(let p=n.parentNode;p&&p!==root;p=p.parentNode){if(SKIP.has(p.nodeName)||(p.classList&&(p.classList.contains("bx")||p.classList.contains("opts")||p.classList.contains("diagram"))))return NodeFilter.FILTER_REJECT;}
    return n.nodeValue.trim().length>1?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
    let cur=node;
    for(let guard=0;guard<12&&cur;guard++){
      const text=cur.nodeValue;let best=null;
      for(const a of ALIASES){if(used.has(a.key))continue;const m=a.re.exec(text);if(m){const idx=m.index+m[1].length;if(!best||idx<best.idx)best={a,idx,word:m[2]};}}
      if(!best)break;
      used.add(best.a.key);
      const after=cur.splitText(best.idx);const rest=after.splitText(best.word.length);
      const ab=document.createElement("abbr");ab.className="gl";ab.tabIndex=0;ab.dataset.t=best.a.key;ab.dataset.d=best.a.d;ab.textContent=after.nodeValue;
      after.parentNode.replaceChild(ab,after);cur=rest;
    }
  });
}
window.SQ.glossify=glossify;

/* ---- tooltip ---- */
const tip=document.createElement("div");tip.id="gltip";tip.setAttribute("role","tooltip");tip.hidden=true;document.body.appendChild(tip);
let pinned=null;
function show(el){tip.innerHTML=`<b>${esc(el.dataset.t)}</b>${esc(el.dataset.d)}`;tip.hidden=false;
  const r=el.getBoundingClientRect();const w=Math.min(300,innerWidth-24);tip.style.width=w+"px";
  let left=Math.max(12,Math.min(r.left+r.width/2-w/2,innerWidth-w-12));tip.style.left=left+"px";
  const h=tip.offsetHeight;let top=r.bottom+8;if(top+h>innerHeight-8)top=r.top-h-8;tip.style.top=Math.max(8,top)+"px";}
function hide(){tip.hidden=true;pinned=null;}
document.addEventListener("mouseover",e=>{const g=e.target.closest&&e.target.closest("abbr.gl");if(g&&!pinned)show(g);});
document.addEventListener("mouseout",e=>{const g=e.target.closest&&e.target.closest("abbr.gl");if(g&&!pinned)tip.hidden=true;});
document.addEventListener("click",e=>{const g=e.target.closest&&e.target.closest("abbr.gl");if(g){e.preventDefault();if(pinned===g){hide();}else{pinned=g;show(g);}}else hide();});
document.addEventListener("focusin",e=>{if(e.target.matches&&e.target.matches("abbr.gl"))show(e.target);});
document.addEventListener("focusout",e=>{if(e.target.matches&&e.target.matches("abbr.gl")&&!pinned)tip.hidden=true;});
addEventListener("scroll",()=>{if(!tip.hidden)hide();},{passive:true});
addEventListener("hashchange",hide);

/* ---- plain-English box ---- */
function wordsHTML(w){return `<div class="bx-w"><div class="bx-wt">New words in this topic</div><dl>${w.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div>`;}
window.SQ.EASY=EASY;

const origTopic=V.topic;
V.topic=function(el,id){
  origTopic(el,id);
  const e=EASY[id];const notes=$(".notes",el);if(!notes)return;
  const tl=$(".tldr",el);if(tl)tl.insertAdjacentHTML("beforebegin",`<div class="eyebrow" style="margin-top:6px">The one-line interview version</div>`);
  if(e)notes.insertAdjacentHTML("beforebegin",`<section class="bx"><div class="bx-h"><span class="bx-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21v-8M12 13c0-4 3-7 8-7 0 4-3 7-8 7zM12 15c0-3-2.5-5.5-7-5.5 0 3 2.5 5.5 7 5.5z"/></svg></span>Start here · in plain English</div>${e.p}${wordsHTML(e.w)}<p class="bx-f">Got the idea? The notes below are the interview-depth version. Words with a dotted underline explain themselves when you tap or hover.</p></section>`);
  glossify(notes);
};

const origProblem=V.problem;
V.problem=function(el,id){
  origProblem(el,id);
  const box=$("#ptab",el);if(!box)return;
  if(PEASY[id]&&$(".step",box)===null&&/The prompt/.test(box.textContent))box.insertAdjacentHTML("afterbegin",`<section class="bx" style="margin-bottom:14px"><div class="bx-h"><span class="bx-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21v-8M12 13c0-4 3-7 8-7 0 4-3 7-8 7zM12 15c0-3-2.5-5.5-7-5.5 0 3 2.5 5.5 7 5.5z"/></svg></span>What you're building, in plain words</div><p>${PEASY[id]}</p><p class="bx-f">New to this? Read the plain-English intro of the topics it uses first. Hover or tap any dotted word for its meaning.</p></section>`);
  glossify(box);
};

const origPath=V.path;
V.path=function(el){
  origPath(el);
  const ph=$(".page-head",el);const html=`<div class="card bx-path"><b>New to system design?</b> Go in order. Every topic opens with a <b>plain-English intro</b> and the new words it uses, then the interview-depth notes. Dotted words explain themselves when you tap them, and the <a href="#revise" onclick="window.SQ.V.revise.tab='glossary'">glossary</a> has them all.</div>`;
  if(ph)ph.insertAdjacentHTML("afterend",html);else el.insertAdjacentHTML("afterbegin",html);
};
})();
