/* ===== Weekly report card ===== */
(function(){
"use strict";
const {V,esc}=window.SQ;const S=()=>window.SQ.state;
const $=(s,r=document)=>r.querySelector(s);
const today=()=>window.SQ.today();const add=(k,n)=>window.SQ.addDays(k,n);const dateOf=k=>window.SQ.dateOf(k);
const mondayOf=k=>add(k,-((dateOf(k).getDay()+6)%7));
const fmt=k=>dateOf(k).toLocaleDateString(undefined,{day:"numeric",month:"short"});

function weekStats(mon){
  const days=Array.from({length:7},(_,i)=>add(mon,i));const inW=d=>d&&d>=days[0]&&d<=days[6];
  const s=S();const goal=s.goal;
  const xp=days.reduce((n,d)=>n+(s.log[d]||0),0);
  const goalDays=days.filter(d=>(s.log[d]||0)>=goal).length;
  const topics=Object.entries(s.topics).filter(([,d])=>inW(d)).map(([id])=>id);
  const planDays=Object.values(s.plan).filter(inW).length;
  const attempts=Object.values(s.prob).reduce((n,p)=>n+((p.hist||[]).filter(h=>inW(h.d)).length),0);
  const mocks=(s.mocks||[]).filter(m=>inW(m.d));
  const revs=Object.entries(s.srs||{}).flatMap(([id,r])=>(r.hist||[]).filter(h=>inW(h.d)).map(h=>({id,p:h.p})));
  const pass=revs.filter(r=>r.p).length;
  const chests=Object.values(s.chests||{}).filter(inW).length;
  const labs=Object.values(s.schema||{}).filter(x=>inW(x.solved)).length+Object.entries(s.sql||{}).filter(([k,d])=>!k.startsWith("d_")&&inW(d)).length+Object.values(s.kata||{}).filter(x=>inW(x.solved)).length;
  // weakest world: review misses this week + open weak spots, per world
  const score={};revs.filter(r=>!r.p).forEach(r=>{const t=TOPICS.find(x=>x.id===r.id);if(t)score[t.w]=(score[t.w]||0)+2;});
  const wb=window.SQ.weakByWorld?window.SQ.weakByWorld():{};Object.entries(wb).forEach(([w,n])=>score[w]=(score[w]||0)+n);
  let weakest=null;const ranked=Object.entries(score).sort((a,b)=>b[1]-a[1]);
  if(ranked.length)weakest={w:WORLDS.find(x=>x.n===+ranked[0][0]),why:"most missed reviews and open weak spots"};
  else{const started=WORLDS.map(w=>{const ts=TOPICS.filter(t=>t.w===w.n);const d=ts.filter(t=>s.topics[t.id]).length;return {w,pct:d/ts.length,d};}).filter(x=>x.d>0&&x.pct<1).sort((a,b)=>a.pct-b.pct);
    if(started.length)weakest={w:started[0].w,why:`only ${Math.round(started[0].pct*100)}% of its topics cleared`};}
  const grade=goalDays>=6?"A":goalDays>=4?"B":goalDays>=2?"C":"D";
  return {days,xp,goalDays,topics,planDays,attempts,mocks,revs:revs.length,pass,chests,labs,weakest,grade};
}

function nextFocus(){
  const L=window.SQ.LEVELS||[];const isDoneTopic=l=>l.topic?!!S().topics[l.topic]:false;
  // first stage that still has an unfinished day or lesson
  const pending=L.filter(l=>!(l.day!=null?S().plan[l.day]:false)&&!(l.topic&&(l.type==="lesson"||l.type==="side")&&isDoneTopic(l)));
  if(!pending.length)return null;const st=pending[0].stage;const stage=WEEKS[st-1];
  return {stage:st,title:stage?stage.title:"",items:pending.filter(l=>l.stage===st).slice(0,4)};
}

V.report=function(el){
  const off=V.report.off||0;const mon=add(mondayOf(today()),-7*off);const r=weekStats(mon);const f=nextFocus();
  const cur=off===0;const gradeColor={A:"var(--good)",B:"var(--accent)",C:"var(--xp)",D:"var(--bad)"}[r.grade];
  const tile=(v,l)=>`<div class="card stat"><b>${v}</b><span>${l}</span></div>`;
  el.innerHTML=`<div class="row"><a class="small" href="#home">← Home</a></div>
  <div class="page-head"><div><div class="eyebrow">Weekly report card</div><h1>${fmt(r.days[0])} – ${fmt(r.days[6])}${cur?" (this week)":""}</h1><p>${cur&&dateOf(today()).getDay()!==0?"The week isn't over yet: this is your report so far. The full report is ready on Sunday.":"How the week went, where you're weakest, and what to do next."}</p></div>
  <div class="row"><button class="btn sm" id="prevW">← Previous week</button><button class="btn sm" id="nextW" ${cur?"disabled":""}>Next week →</button></div></div>
  <div class="report-top card"><div class="grade" style="--gc:${gradeColor}">${r.grade}</div><div><b>${r.goalDays}/7 days hit your ${S().goal} XP goal</b><p class="small muted" style="margin:2px 0 0">${r.grade==="A"?"Outstanding consistency. Keep the streak alive.":r.grade==="B"?"Solid week. One or two more study days makes it an A.":r.grade==="C"?"Some progress. Aim for a short session every day, even 15 minutes.":"A quiet week. Restart small: one lesson or ten flashcards a day."}</p>
    <div class="week-dots" style="margin-top:8px">${r.days.map(d=>`<span><i class="${(S().log[d]||0)>=S().goal?"on":S().frozen[d]?"frz":""} ${d===today()?"today":""}"></i>${dateOf(d).toLocaleDateString(undefined,{weekday:"narrow"})}</span>`).join("")}</div></div></div>
  <div class="grid g4" style="margin-top:14px">${tile(r.xp.toLocaleString(),"XP earned")}${tile(r.topics.length,"lessons cleared")}${tile(r.planDays,"path days ticked")}${tile(r.attempts,"problem attempts")}${tile(r.mocks.length,"mocks"+(r.mocks.length?` (best ${Math.max(...r.mocks.map(m=>m.total))}/16)`:""))}${tile(r.revs?Math.round(r.pass/r.revs*100)+"%":"–",`review pass rate (${r.revs})`)}${tile(r.labs,"labs and katas solved")}${tile(r.chests,"stage chests opened")}</div>
  <div class="grid g2" style="margin-top:14px">
   <div class="card"><div class="eyebrow">Weakest world</div>${r.weakest?`<h3 style="margin:4px 0">World ${r.weakest.w.n}: ${esc(r.weakest.w.name)}</h3><p class="small muted" style="margin:0 0 10px">Why: ${esc(r.weakest.why)}.</p><div class="row"><a class="btn sm primary" href="#revise" id="goMod" data-w="${r.weakest.w.n}">Fast-revise this module</a><a class="btn sm" href="#weak">Drill weak spots</a></div>`:`<p class="muted">Not enough data yet. Clear a few lessons and reviews first.</p>`}</div>
   <div class="card"><div class="eyebrow">Next week's focus</div>${f?`<h3 style="margin:4px 0">Stage ${f.stage}: ${esc(f.title)}</h3><ul class="small" style="margin:4px 0 10px;padding-left:1.1rem">${f.items.map(l=>`<li>${esc(l.title)}</li>`).join("")}</ul><a class="btn sm primary" href="#path">Open the Learn path</a>`:`<p class="muted">Every level is done. Keep the review queue and mocks going.</p>`}</div></div>
  ${r.topics.length?`<div class="sect"><h2>Lessons cleared this week</h2></div><div class="row" style="flex-wrap:wrap;gap:6px">${r.topics.map(id=>{const t=TOPICS.find(x=>x.id===id);return t?`<a class="tag" href="#topic-${id}">${esc(t.title)}</a>`:"";}).join("")}</div>`:""}`;
  $("#prevW",el).onclick=()=>{V.report.off=off+1;window.SQ.render();};
  $("#nextW",el).onclick=()=>{V.report.off=Math.max(0,off-1);window.SQ.render();};
  const gm=$("#goMod",el);if(gm)gm.onclick=()=>{V.revise.tab="topics";V.revise.w=+gm.dataset.w;};
  if(cur){S().reportSeen=today();window.SQ.save();}
};

/* Home: on Sunday show this week's card; on Monday show last week's */
const origHome=V.home;
V.home=function(el){
  origHome(el);
  const dow=dateOf(today()).getDay();if(dow!==0&&dow!==1)return;
  if(S().xp<50)return;
  const off=dow===1?1:0;const r=weekStats(add(mondayOf(today()),-7*off));
  const hero=$(".hero",el);if(!hero)return;
  hero.insertAdjacentHTML("afterend",`<a class="card rv-banner" href="#report" id="repCard" style="border-left-color:var(--xp);background:linear-gradient(90deg,var(--xp-soft),var(--panel) 55%)"><span class="grade sm" style="--gc:var(--xp)">${r.grade}</span><span><b>${off?"Last week's":"This week's"} report card is ready</b><span class="small muted" style="display:block">${r.xp.toLocaleString()} XP · ${r.goalDays}/7 goal days · ${r.topics.length} lessons${r.weakest?` · weakest: ${esc(r.weakest.w.name)}`:""}</span></span><span class="btn sm gold">Open</span></a>`);
  const c=$("#repCard",el);if(c)c.onclick=()=>{V.report.off=off;};
};

/* Trophies: link to the report */
const origTrophies=V.trophies;
V.trophies=function(el){origTrophies(el);const h=$(".page-head",el);if(h)h.insertAdjacentHTML("beforeend",`<a class="btn gold" href="#report" onclick="window.SQ.V.report.off=0">Weekly report card</a>`);};
})();
