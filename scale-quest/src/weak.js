/* ===== Mistakes notebook: wrong answers become a "weak spots" deck ===== */
(function(){
"use strict";
const {V,esc}=window.SQ;const S=()=>window.SQ.state;
const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const today=()=>window.SQ.today();
const M=()=>{if(!S().miss)S().miss={};return S().miss;};

function resolve(key){
  if(key.startsWith("t:")){const [,tid,ix]=key.split(":");const t=TOPICS.find(x=>x.id===tid);const q=t&&t.quiz[+ix];return q?{kind:"q",t,q}:null;}
  if(key.startsWith("c:")){const c=CARDS.find(x=>String(x.id)===key.slice(2));return c?{kind:"c",c}:null;}
  return null;
}
window.SQ.addMistake=function(key){
  if(!resolve(key))return;
  const m=M()[key]||{added:today(),n:0};
  m.n=(m.n||0)+1;m.streak=0;m.due=window.SQ.addDays(today(),1);m.last=today();
  M()[key]=m;window.SQ.save();
};
const live=()=>Object.keys(M()).filter(k=>resolve(k));
const dueKeys=()=>live().filter(k=>M()[k].due<=today());
window.SQ.weakDueCount=()=>dueKeys().length;
window.SQ.weakByWorld=()=>{const w={};live().forEach(k=>{const r=resolve(k);if(r.kind==="q")w[r.t.w]=(w[r.t.w]||0)+1;});return w;};

function grade(key,ok){
  const m=M()[key];if(!m)return "gone";
  if(ok){m.streak=(m.streak||0)+1;
    if(m.streak>=2){delete M()[key];S().stats.weakFixed=(S().stats.weakFixed||0)+1;window.SQ.addXP(10,"Weak spot fixed");return "fixed";}
    m.due=window.SQ.addDays(today(),3);window.SQ.addXP(3,"Weak spot practised",true);return "later";}
  m.streak=0;m.due=window.SQ.addDays(today(),1);window.SQ.save();return "again";
}

V.weak=function(el){
  const keys=window.SQ.shuffle(dueKeys()).slice(0,15);
  const all=live();
  let i=0,fixed=0,missed=0;
  const byTopic={};all.forEach(k=>{const r=resolve(k);const name=r.kind==="q"?r.t.title:"Flashcards";(byTopic[name]=byTopic[name]||[]).push(k);});
  el.innerHTML=`<div class="row"><a class="small" href="#review">← Review queue</a></div>
  <div class="page-head"><div><div class="eyebrow">Mistakes notebook</div><h1>Weak spots</h1><p>Every question you get wrong and every flashcard you mark "Again" lands here. It comes back the next day; answer it right twice in a row and it's fixed (+10 XP).</p></div>
  <div class="card jstats"><div><b>${dueKeys().length}</b><span>due today</span></div><div><b>${all.length}</b><span>in the notebook</span></div></div></div>
  <div id="wk"></div>
  <div class="sect"><h2>Where your mistakes are</h2><span class="small muted">${S().stats.weakFixed||0} fixed so far</span></div>
  ${all.length?`<div class="card tscroll"><table class="tbl"><tr><th>Topic</th><th>Weak spots</th><th>Next due</th></tr>${Object.entries(byTopic).sort((a,b)=>b[1].length-a[1].length).map(([n,ks])=>{const t=TOPICS.find(x=>x.title===n);return `<tr><td>${t?`<a href="#topic-${t.id}">${esc(n)}</a>`:esc(n)}</td><td>${ks.length}</td><td>${ks.map(k=>M()[k].due).sort()[0]}</td></tr>`;}).join("")}</table></div>`:`<p class="muted">Nothing here yet. Wrong answers in quizzes, reviews and flashcards will collect here automatically.</p>`}`;
  const box=$("#wk",el);
  function next(){
    if(i>=keys.length){box.innerHTML=keys.length?`<div class="card" style="text-align:center;padding:24px"><h2>Drill done</h2><p class="muted">${fixed} fixed · ${missed} still shaky (back tomorrow) · ${keys.length-fixed-missed} come back in 3 days.</p><a class="btn primary" href="#review">Back to the review queue</a></div>`:`<div class="card" style="text-align:center;padding:24px"><h2>No weak spots due today</h2><p class="muted">${all.length?"Everything in your notebook is scheduled for later.":"Keep practising; mistakes you make will show up here."}</p></div>`;window.SQ.renderHud();return;}
    const k=keys[i],r=resolve(k);
    if(!r){i++;next();return;}
    if(r.kind==="q"){
      box.innerHTML=`<div class="card"><div class="row" style="justify-content:space-between"><span class="eyebrow">${esc(r.t.title)}</span><span class="small muted">${i+1} of ${keys.length} · missed ${M()[k].n}×</span></div><div class="q" style="border:0;padding:6px 0;margin:0"><div class="qt">${r.q.q}</div><div class="opts">${r.q.o.map((o,j)=>`<button class="opt" data-j="${j}">${o}</button>`).join("")}</div><div class="why hidden">${r.q.why||""} <a href="#topic-${r.t.id}">Review topic</a></div></div><div class="row hidden" id="wnext" style="margin-top:10px"><button class="btn primary">Next →</button></div></div>`;
      $$(".opt",box).forEach(b=>b.onclick=()=>{const ok=+b.dataset.j===r.q.a;$$(".opt",box).forEach(x=>{x.disabled=true;if(+x.dataset.j===r.q.a)x.classList.add("right");});if(!ok)b.classList.add("wrong");
        const res=grade(k,ok);if(res==="fixed")fixed++;if(res==="again")missed++;
        const w=$(".why",box);w.classList.remove("hidden");w.insertAdjacentHTML("afterbegin",res==="fixed"?`<b style="color:var(--good)">Fixed! Right twice in a row.</b> `:ok?`<b style="color:var(--good)">Correct.</b> One more right answer (in 3 days) fixes it. `:`<b style="color:var(--bad)">Not yet.</b> Back tomorrow. `);
        $("#wnext").classList.remove("hidden");$("#wnext button").onclick=()=>{i++;next();};});
    }else{
      box.innerHTML=`<div class="card"><div class="row" style="justify-content:space-between"><span class="eyebrow">Flashcard · ${esc(r.c.cat)}</span><span class="small muted">${i+1} of ${keys.length}</span></div><h3 style="margin:8px 0">${r.c.q}</h3><div id="wans" class="hidden callout say"><div class="ct">Answer</div>${r.c.a}</div><div class="row" style="margin-top:10px" id="wbtn"><button class="btn primary" id="wshow">Say it out loud, then show the answer</button></div></div>`;
      $("#wshow").onclick=()=>{$("#wans").classList.remove("hidden");$("#wbtn").innerHTML=`<button class="btn" data-ok="0">Missed it</button><button class="btn primary" data-ok="1">Got it</button>`;
        $$("[data-ok]",box).forEach(b=>b.onclick=()=>{const res=grade(k,b.dataset.ok==="1");if(res==="fixed")fixed++;if(res==="again")missed++;i++;next();});};
    }
  }
  next();
};

/* show the notebook on the review queue page */
const origReview=V.review;
V.review=function(el){
  origReview(el);
  if(!el.querySelector(".page-head")||el.querySelector(".rv-session"))return;
  const d=dueKeys().length,n=live().length;
  el.querySelector(".page-head").insertAdjacentHTML("afterend",`<a class="card rv-banner ${d?"":"calm"}" href="#weak" style="margin:0 0 14px"><span class="rv-ico"><svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg></span><span><b>${d?`${d} weak spot${d>1?"s":""} due`:"Mistakes notebook"}</b><span class="small muted" style="display:block">${n?`${n} wrong answer${n>1?"s":""} saved from quizzes, reviews and flashcards. Fix each by getting it right twice.`:"Wrong answers will collect here automatically."}</span></span><span class="btn ${d?"primary":""} sm">${d?"Drill now":"Open"}</span></a>`);
};

window.SQ.BADGES.push({id:"weak10",n:"Bug Squasher",d:"Fix 10 weak spots from your mistakes notebook",g:"✓10",tier:"s",t:()=>(S().stats.weakFixed||0)>=10});
})();
