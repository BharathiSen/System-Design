/* ===== Problem redo reviews: each attempted problem returns after 7, then 21 days ===== */
(function(){
"use strict";
const {V,esc}=window.SQ;const S=()=>window.SQ.state;
const $=(s,r=document)=>r.querySelector(s);
const today=()=>window.SQ.today();
const STEPS=[7,21],PASS=10;
const P=()=>{if(!S().psrs)S().psrs={};return S().psrs;};
const fmt=k=>window.SQ.dateOf(k).toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"});

/* called after every graded attempt or mock */
window.SQ.onAttempt=function(id,total){
  const r=P()[id];const t=today();
  if(!r){P()[id]={step:0,due:window.SQ.addDays(t,STEPS[0]),hist:[{d:t,total}]};window.SQ.save();window.SQ.toast(`Redo scheduled: back on ${fmt(P()[id].due)}`);return;}
  r.hist=(r.hist||[]).concat([{d:t,total}]);
  if(r.done||r.due>t){window.SQ.save();return;}            // early practice doesn't move the schedule
  if(total>=PASS){r.step++;if(r.step>=STEPS.length){r.done=t;r.due=null;window.SQ.addXP(50,"Problem mastered: survived the 21-day redo");window.SQ.confetti(100);}else{r.due=window.SQ.addDays(t,STEPS[r.step]);window.SQ.toast(`Redo passed. Next redo on ${fmt(r.due)}`);}}
  else{r.step=0;r.due=window.SQ.addDays(t,STEPS[0]);window.SQ.toast(`Below ${PASS}/16, so it comes back in 7 days`);}
  window.SQ.save();
};
const due=()=>PROBLEMS.filter(p=>{const r=P()[p.id];return r&&!r.done&&r.due<=today();});
window.SQ.redoDue=due;

/* review queue section */
const origReview=V.review;
V.review=function(el){
  origReview(el);
  if(el.querySelector(".rv-session")||!el.querySelector(".page-head"))return;
  const ds=due(),all=PROBLEMS.filter(p=>P()[p.id]);
  const html=`<div class="sect"><h2>Problem redos</h2><span class="small muted">Every problem you attempt returns after 7 days, then 21. Redo it from a blank page; ${PASS}+/16 passes.</span></div>
  ${all.length?`<div class="grid g2">${all.sort((a,b)=>String(P()[a.id].due||"z").localeCompare(String(P()[b.id].due||"z"))).map(p=>{const r=P()[p.id];const isDue=!r.done&&r.due<=today();const last=r.hist[r.hist.length-1];
    return `<div class="card row" style="justify-content:space-between;gap:10px;${isDue?"border-left:5px solid var(--flame)":""}"><div><b>${esc(p.title)}</b><div class="small muted">${r.done?`Mastered ${r.done}`:isDue?`Redo due${r.due<today()?" (overdue)":""}`:`Next redo ${fmt(r.due)} (${STEPS[r.step]}-day)`} · last score ${last?last.total:"–"}/16</div></div>${isDue?`<a class="btn primary sm" href="#problem-${p.id}" data-redo="${p.id}">Redo from blank</a>`:r.done?'<span class="tag easy">Mastered</span>':`<a class="btn sm ghost" href="#problem-${p.id}">Open</a>`}</div>`;}).join("")}</div>`:`<p class="muted">Attempt a problem in the Design arena and it joins this schedule.</p>`}`;
  const anchor=[...el.querySelectorAll(".sect")].find(s=>/How a review works/.test(s.textContent));
  if(anchor)anchor.insertAdjacentHTML("beforebegin",html);else el.insertAdjacentHTML("beforeend",html);
  el.querySelectorAll("[data-redo]").forEach(a=>a.onclick=()=>{const id=a.dataset.redo;const pr=S().prob[id];if(pr&&Object.keys(pr.notes||{}).length){pr.prevNotes=pr.notes;pr.notes={};}window.SQ.save();V.problem.tab={id,t:"practice"};});
  if(ds.length){const h=el.querySelector(".page-head h1");if(h&&/Nothing due|starts here/.test(h.textContent))h.textContent=`${ds.length} problem redo${ds.length>1?"s":""} due`;}
};

/* problem page: show the redo status */
const origProblem=V.problem;
V.problem=function(el,id){
  origProblem(el,id);
  const r=P()[id];if(!r)return;const row=el.querySelector(".page-head .row");if(!row)return;
  const isDue=!r.done&&r.due<=today();
  row.insertAdjacentHTML("beforeend",r.done?'<span class="tag easy">Redo mastered</span>':isDue?'<span class="tag due">Redo due: from a blank page</span>':`<span class="tag">Next redo ${fmt(r.due)}</span>`);
};

window.SQ.BADGES.push({id:"redo",n:"Muscle Memory",d:"Pass a problem's 21-day redo",g:"21d",tier:"g",t:()=>Object.values(P()).some(r=>r.done)});
})();
