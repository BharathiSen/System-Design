/* ===== Learn path: ONE game map (14-week plan + every topic + every problem) =====
   Each plan day is a level. A topic lesson appears once, at the first day that teaches it;
   later days that revisit it are "missions" with their own task. Topics and problems the
   plan never names are added as side quests / bonus bosses in the week they fit. */
(function(){
"use strict";
const {V,esc}=window.SQ;const S=()=>window.SQ.state;
const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

const EXTRA_T={1:["what-is-sd","availability","latency"],2:["http-caching"],4:["security","deployment","architecture","streaming"],5:["estimation","tradeoffs","ids-clocks","cloud-map"],7:["blob","special-db","prob-ds"],8:["dist-txn","consensus"],9:["lld-round","concurrency"]};
const EXTRA_P={3:["kv-store"],5:["unique-id"],6:["uber","food-delivery","google-docs"],7:["youtube","web-crawler","nearby"],8:["leaderboard","ad-click","checkout","hotel-booking"],9:["parking-lot-hld"]};
const EXTRA_L={9:["k:lru","k:parking","k:vending","k:bucket","k:splitwise","k:eventbus"],3:["s:library","s:instagram","q:A"],4:["q:B"],6:["s:chat","s:ride"],7:["s:food-delivery","s:ecommerce","q:C"],8:["s:booking","s:ledger"]};
const ROUTE_NAME={quiz:"Quiz blitz",gym:"Estimation gym",mock:"Mock interview",lld:"LLD dojo",board:"Whiteboard",cards:"Flashcards"};
const KIND={lab:"Lab",lesson:"Lesson",mission:"Mission",boss:"Boss problem",practice:"Practice",check:"Checkpoint",side:"Side quest",bonus:"Bonus boss"};
const ICON={
  lab:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
  lesson:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21a2 2 0 0 1 2-2h13"/>',
  mission:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8"/>',
  boss:'<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>',
  practice:'<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  check:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  side:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  bonus:'<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>',
  done:'<path d="M5 12.5l4.5 4.5L19 7.5"/>'
};
const ZIG=[0,.55,.9,.55,0,-.55,-.9,-.55];

/* ---------- build the level list once ---------- */
const LEVELS=[];const STAGES=[];
(function build(){
  const seenT=new Set(),seenP=new Set();
  WEEKS.forEach((w,wi)=>{
    const st={n:w.n,wi,title:w.title,goal:w.goal,p:w.p,levels:[]};STAGES.push(st);
    w.days.forEach((d,j)=>{
      const i=wi*7+j,link=PLAN_LINKS[i]||"";let lv={key:"d"+i,day:i,stage:w.n,title:d.t,desc:d.d,u:d.u,s:d.s,link};
      if(link.startsWith("topic-")){const id=link.slice(6);const t=TOPICS.find(x=>x.id===id);
        if(t&&!seenT.has(id)){seenT.add(id);Object.assign(lv,{type:"lesson",topic:id,title:t.title,task:d.t});}
        else Object.assign(lv,{type:"mission",topic:id});}
      else if(link.startsWith("problem-")){const id=link.slice(8);
        if(!seenP.has(id)){seenP.add(id);Object.assign(lv,{type:"boss",prob:id,title:PROBLEMS.find(p=>p.id===id).title,task:d.t});}
        else Object.assign(lv,{type:"mission",prob:id});}
      else if(link)Object.assign(lv,{type:"practice",route:link});
      else lv.type=/review|buffer|fix the gaps|polish/i.test(d.t)?"check":"mission";
      st.levels.push(lv);
    });
    (EXTRA_T[w.n]||[]).forEach(id=>{const t=TOPICS.find(x=>x.id===id);if(!t||seenT.has(id))return;seenT.add(id);const lv={key:"t"+id,stage:w.n,type:"side",topic:id,title:t.title,desc:t.tldr.replace(/<[^>]+>/g,"")};st.levels.push(lv);});
    (EXTRA_P[w.n]||[]).forEach(id=>{const p=PROBLEMS.find(x=>x.id===id);if(!p||seenP.has(id))return;seenP.add(id);const lv={key:"p"+id,stage:w.n,type:"bonus",prob:id,title:p.title,desc:p.pitch};st.levels.push(lv);});    (EXTRA_L[w.n]||[]).forEach(k=>{const [t,id]=k.split(":");if(t==="k"){const x=KATAS.find(s=>s.id===id);if(x)st.levels.push({key:"l"+k,stage:w.n,type:"lab",lab:k,kata:id,href:"#lld",title:"Code: "+x.title,desc:"Write it in Python and make the tests pass, right in your browser."});}
      else if(t==="s"){const x=SCHEMAS.find(s=>s.id===id);if(x)st.levels.push({key:"l"+k,stage:w.n,type:"lab",lab:k,href:"#schema-"+id,title:"Schema: "+x.title,desc:x.prompt});}else{const x=SQL_SETS.find(s=>s.id===id);if(x)st.levels.push({key:"l"+k,stage:w.n,type:"lab",lab:k,href:"#sql-"+id,title:"SQL set "+id+": "+x.title,desc:"Write "+x.qs.length+" real queries against a food-delivery database that runs in your browser."});}});
    if(w.n===1){const side=st.levels.filter(l=>l.type==="side");st.levels=st.levels.filter(l=>l.type!=="side");side.forEach(l=>l.type="lesson");st.levels.splice(1,0,...side);} // foundations right after Kickoff
    LEVELS.push(...st.levels);
  });
  // safety net: anything still unplaced goes to the last matching stage
  TOPICS.forEach(t=>{if(!seenT.has(t.id)){const st=STAGES[STAGES.length-1];const lv={key:"t"+t.id,stage:st.n,type:"side",topic:t.id,title:t.title,desc:t.tldr.replace(/<[^>]+>/g,"")};st.levels.push(lv);LEVELS.push(lv);}});
  PROBLEMS.forEach(p=>{if(!seenP.has(p.id)){const st=STAGES[STAGES.length-1];const lv={key:"p"+p.id,stage:st.n,type:"bonus",prob:p.id,title:p.title,desc:p.pitch};st.levels.push(lv);LEVELS.push(lv);}});
  // LEVELS must follow stage order (extras were pushed inside each stage loop, so it already does)
})();
window.SQ.PATH_TOPICS=LEVELS.filter(l=>l.type==="lesson"||l.type==="side").map(l=>TOPICS.find(t=>t.id===l.topic));
window.SQ.LEVELS=LEVELS;

function attempted(id){const pr=S().prob[id];return !!(pr&&pr.attempts);}
function isDone(lv){
  if(lv.type==="lesson"||lv.type==="side")return !!S().topics[lv.topic]||(lv.day!=null&&!!S().plan[lv.day]);
  if(lv.type==="boss"||lv.type==="bonus")return attempted(lv.prob)||(lv.day!=null&&!!S().plan[lv.day]);
  if(lv.type==="lab"){const [t,id]=lv.lab.split(":");return t==="k"?window.SQ.kataSolved(id):t==="s"?window.SQ.schemaSolved(id):window.SQ.sqlSetDone(id);}
  return !!S().plan[lv.day];
}
/* clearing a lesson also completes its planned day (for quests and the "Week Shipped" badge) */
window.SQ.onTopicClear=function(id){
  LEVELS.filter(l=>l.type==="lesson"&&l.topic===id&&l.day!=null&&!S().plan[l.day]).forEach(l=>{S().plan[l.day]=window.SQ.today();if(l.day===window.SQ.planIndex())window.SQ.bump("plan");});
  window.SQ.save();
};
function syncPlan(){let ch=false;LEVELS.forEach(l=>{if(l.day!=null&&!S().plan[l.day]&&((l.topic&&l.type==="lesson"&&S().topics[l.topic])||(l.type==="boss"&&attempted(l.prob)))){S().plan[l.day]=S().topics[l.topic]||window.SQ.today();ch=true;}});if(ch)window.SQ.save();}

const fmt=k=>window.SQ.dateOf(k).toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"});
let openKey=null,scrolled="";

V.path=function(el){
  syncPlan();if(!S().chests)S().chests={};
  const pi=window.SQ.planIndex();
  const doneN=LEVELS.filter(isDone).length;const cur=LEVELS.find(l=>!isDone(l));
  const todayLv=LEVELS.find(l=>l.day===pi);
  if(openKey===null&&cur)openKey=cur.key;
  const worlds=WORLDS.map(w=>{const ts=TOPICS.filter(t=>t.w===w.n);const d=ts.filter(t=>S().topics[t.id]).length;return `<div class="wprog" style="--wc:${w.c}" title="${esc(w.name)}: ${d}/${ts.length} topics"><span>${w.n}</span><div><b>${esc(w.name)}</b><div class="bar"><i style="width:${d/ts.length*100}%;background:${w.c}"></i></div></div><small>${d}/${ts.length}</small></div>`;}).join("");
  el.innerHTML=`<div class="page-head"><div><div class="eyebrow">Learn path · one map, 14 stages</div><h1>From zero to offer</h1><p>Your 14-week plan and all ${TOPICS.length} topics and ${PROBLEMS.length} problems on one trail of ${LEVELS.length} levels, from ${fmt(window.SQ.PLAN_START)} to ${fmt(window.SQ.addDays(window.SQ.PLAN_START,WEEKS.length*7-1))}. Tap a level to play it. Finish every level in a stage to open its chest.</p></div>
  <div class="card jstats"><div><b>${doneN}/${LEVELS.length}</b><span>levels done</span></div><div><b>${Object.keys(S().topics).length}/${TOPICS.length}</b><span>topics cleared</span></div><div class="bar" style="grid-column:1/-1"><i style="width:${doneN/LEVELS.length*100}%"></i></div></div></div>
  <div class="row" style="margin-bottom:12px">${cur?`<button class="btn primary" id="goCur">${doneN?"Continue":"Start"}: ${esc(cur.title)}</button>`:`<span class="tag easy">Every level complete</span>`}${todayLv&&todayLv!==cur?`<button class="btn" id="goToday">Today's plan: ${esc(todayLv.title)}</button>`:""}</div>
  <details class="card wworlds"><summary><b>World progress</b><span class="small muted">${WORLDS.filter(w=>TOPICS.filter(t=>t.w===w.n).every(t=>S().topics[t.id])).length}/${WORLDS.length} worlds cleared · lessons on the map carry their world's colour</span></summary><div class="wgrid">${worlds}</div></details>
  <div class="legend">${["lesson","mission","boss","practice","lab","check","side","bonus"].map(k=>`<span><i><svg viewBox="0 0 24 24">${ICON[k]}</svg></i>${KIND[k]}</span>`).join("")}</div>
  ${PHASES_P.map((ph,phi)=>`<div class="act"><span>${esc(ph.name.split(" · ")[0])}</span><b>${esc(ph.name.split(" · ")[1]||ph.name)}</b><small>${esc(ph.weeks)}</small></div>`+STAGES.filter(s=>s.p===phi).map(s=>stageHTML(s,cur,pi,phi)).join("")).join("")}`;
  wire(el);
  if(cur&&scrolled!==window.SQ.today()&&doneN>0){scrolled=window.SQ.today();setTimeout(()=>{const n=$(`[data-k="${cur.key}"]`,el);if(n)n.scrollIntoView({block:"center",behavior:"smooth"});},60);}
};

function stageHTML(s,cur,pi,phi){
  const dn=s.levels.filter(isDone).length,all=dn===s.levels.length;const chest=S().chests[s.n];
  const sc=`var(--w${phi+1})`;
  let k=0;
  return `<section class="stage" style="--sc:${sc}"><div class="stage-head"><span class="sn">${s.n}</span><div><div class="eyebrow">Stage ${s.n} · Week ${s.n}</div><h2>${esc(s.title)}</h2><p>${esc(s.goal)}</p></div><div class="sp"><b>${dn}/${s.levels.length}</b><div class="bar"><i style="width:${dn/s.levels.length*100}%;background:${sc}"></i></div></div></div>
  <div class="trailmap">${s.levels.map(lv=>{const d=isDone(lv),c=cur&&cur.key===lv.key,o=openKey===lv.key;const t=lv.topic&&TOPICS.find(x=>x.id===lv.topic);const wc=t?WORLDS.find(w=>w.n===t.w).c:sc;const x=ZIG[(k++)%ZIG.length];
    return `<div class="lvrow" style="--x:${x}"><button class="lv ${lv.type} ${d?"done":""} ${c?"cur":""} ${o?"open":""}" data-k="${lv.key}" style="--lc:${wc}" aria-expanded="${o}" aria-label="${KIND[lv.type]}: ${esc(lv.title)}${d?" (done)":""}">${c?`<span class="here">${isDone(LEVELS[0])||LEVELS.indexOf(lv)?"You are here":"Start here"}</span>`:""}<i><svg viewBox="0 0 24 24">${d?ICON.done:ICON[lv.type]}</svg></i></button><div class="lvl-lab"><b>${esc(lv.title)}</b><span>${KIND[lv.type]}${lv.day!=null?` · Day ${lv.day%7+1}`:""}${lv.day===pi?' · <em>Today</em>':""}</span></div></div>${o?detailHTML(lv,d,wc):""}`;}).join("")}
  <div class="lvrow" style="--x:0"><button class="chest ${all?(chest?"opened":"ready"):""}" data-chest="${s.n}" ${all&&!chest?"":"disabled"} aria-label="Stage ${s.n} chest">${chestSvg(all&&chest)}</button><div class="lvl-lab"><b>${chest?"Chest opened":all?"Open your chest! +100 XP":"Stage chest"}</b><span>${chest?"Opened "+chest:all?"Stage complete":`${s.levels.length-dn} level${s.levels.length-dn===1?"":"s"} to go`}</span></div></div></div></section>`;
}
function chestSvg(open){return `<svg viewBox="0 0 48 40" aria-hidden="true"><rect x="5" y="${open?17:15}" width="38" height="21" rx="3" style="fill:var(--xp)"/><path d="${open?"M5 15 L9 3 H39 L43 15Z":"M5 16 Q5 4 24 4 Q43 4 43 16Z"}" style="fill:color-mix(in srgb,var(--xp) 75%,#000)"/><rect x="20" y="${open?20:13}" width="8" height="9" rx="2" style="fill:#fff8dc"/></svg>`;}

function detailHTML(lv,d,wc){
  const t=lv.topic&&TOPICS.find(x=>x.id===lv.topic);const p=lv.prob&&PROBLEMS.find(x=>x.id===lv.prob);
  const date=lv.day!=null?fmt(window.SQ.addDays(window.SQ.PLAN_START,lv.day)):"";
  let main="",rule="";
  if(lv.type==="lesson"||lv.type==="side"){main=`<a class="btn primary" href="#topic-${t.id}">${S().topics[t.id]?"Revisit lesson":"Play lesson"}</a>`;rule=S().topics[t.id]?"Lesson cleared.":"Clear it by finishing the lesson's quiz (+50 XP). It then joins your review queue.";}
  else if(lv.type==="boss"||lv.type==="bonus"){main=`<a class="btn primary" href="#problem-${p.id}">${attempted(p.id)?"Fight again":"Fight the boss"}</a>`;rule=attempted(p.id)?`Beaten. Best score ${S().prob[p.id].best}/16.`:"Beat it by submitting one graded attempt (+100 XP + rubric).";}
  else if(lv.type==="lab"){main=`<a class="btn primary" href="${lv.href}"${lv.kata?` data-kata-go="${lv.kata}"`:""}>Open the lab</a>`;rule=isDone(lv)?"Lab complete.":lv.lab.startsWith("k:")?"Make every test pass (+60 XP).":lv.lab.startsWith("s:")?"Draft the tables, compare with the model answer, and mark it solved (+40 XP).":"Solve every query in the set (+20 XP each).";}
  else if(lv.type==="practice"){main=`<a class="btn primary" href="#${lv.route}">Open ${ROUTE_NAME[lv.route]||lv.route}</a>`;rule="Do the practice, then mark the level complete.";}
  else if(t||p){main=`<a class="btn" href="${t?"#topic-"+t.id:"#problem-"+p.id}">Open ${esc(t?t.title:p.title)}</a>`;rule="Do the task, then mark the level complete.";}
  else rule="Do the task, then mark the level complete.";
  const tick=lv.day!=null&&!(d&&!S().plan[lv.day])?`<button class="btn ${S().plan[lv.day]?"":"gold"}" data-tick="${lv.day}">${S().plan[lv.day]?"Completed ✓ (undo)":"Mark complete +30 XP"}</button>`:"";
  return `<div class="lvcard" style="--lc:${wc}"><div class="row" style="gap:6px"><span class="tag" style="background:var(--lc);color:#fff">${KIND[lv.type]}</span>${t?`<span class="tag">World ${t.w} · ${esc(WORLDS.find(w=>w.n===t.w).name)}</span><span class="tag">${t.mins} min</span>`:""}${p?`<span class="tag ${p.diff.toLowerCase()}">${p.diff}</span>`:""}${date?`<span class="tag">${date}</span>`:""}</div>
  <h3>${esc(lv.title)}</h3>${lv.task&&lv.task!==lv.title?`<div class="small muted" style="margin-top:-4px">Plan task: ${esc(lv.task)}</div>`:""}
  <p>${esc(lv.desc||"")}</p>${lv.u?`<p class="small"><a href="${lv.u}" target="_blank" rel="noopener">${esc(lv.s||"Resource")} ↗</a></p>`:""}
  <p class="small muted">${rule}</p><div class="row">${main}${tick}</div></div>`;
}

function wire(el){
  $$(".lv",el).forEach(b=>b.onclick=()=>{openKey=openKey===b.dataset.k?"":b.dataset.k;const y=b.getBoundingClientRect().top;window.SQ.render();const nb=$(`[data-k="${b.dataset.k}"]`);if(nb)window.scrollBy(0,nb.getBoundingClientRect().top-y);});
  $$("[data-tick]",el).forEach(b=>b.onclick=()=>{const i=+b.dataset.tick;const y=b.getBoundingClientRect().top;const was=!!S().plan[i];window.SQ.togglePlan(i);
    if(!was){const lv=LEVELS.find(l=>l.day===i);const nx=LEVELS[LEVELS.indexOf(lv)+1];if(nx&&!isDone(nx))openKey=nx.key;}
    window.SQ.render();const k=openKey&&$(`[data-k="${openKey}"]`);if(k&&!was)k.scrollIntoView({block:"center",behavior:"smooth"});else window.scrollBy(0,0*y);});
  $$("[data-chest]",el).forEach(b=>b.onclick=()=>{const n=+b.dataset.chest;if(S().chests[n])return;S().chests[n]=window.SQ.today();window.SQ.addXP(100,`Stage ${n} chest`);window.SQ.confetti(120);window.SQ.modal(`<div class="eyebrow">Stage ${n} complete</div><h2>Chest opened: +100 XP</h2><p>${esc(STAGES[n-1].title)} is done. ${n<STAGES.length?`Stage ${n+1}: <b>${esc(STAGES[n].title)}</b> is next.`:"That was the final stage. You're interview-ready: keep the review queue and mocks going."}</p>`);window.SQ.render();});
  $$("[data-kata-go]",el).forEach(a=>a.onclick=()=>{V.lld.tab="code";V.lld.kata=a.dataset.kataGo;});
  const gc=$("#goCur",el);if(gc)gc.onclick=()=>{const c=LEVELS.find(l=>!isDone(l));openKey=c.key;window.SQ.render();const n=$(`[data-k="${c.key}"]`);if(n)n.scrollIntoView({block:"center",behavior:"smooth"});};
  const gt=$("#goToday",el);if(gt)gt.onclick=()=>{const l=LEVELS.find(x=>x.day===window.SQ.planIndex());openKey=l.key;window.SQ.render();const n=$(`[data-k="${l.key}"]`);if(n)n.scrollIntoView({block:"center",behavior:"smooth"});};
}

/* topic pages: previous / next follow the path order */
const origTopic=V.topic;
V.topic=function(el,id){
  origTopic(el,id);
  const order=window.SQ.PATH_TOPICS;const i=order.findIndex(t=>t.id===id);if(i<0)return;
  const rows=$$(".row",el);const last=rows[rows.length-1];if(!last)return;
  const prev=order[i-1],nxt=order[i+1];
  last.innerHTML=`${prev?`<a class="btn ghost" href="#topic-${prev.id}">← ${esc(prev.title)}</a>`:`<a class="btn ghost" href="#path">← Learn path</a>`}${nxt?`<a class="btn" href="#topic-${nxt.id}">Next lesson: ${esc(nxt.title)} →</a>`:""}`;
};

/* chest badge */
window.SQ.BADGES.push({id:"chest1",n:"Loot Found",d:"Open your first stage chest",g:"▣",tier:"b",t:()=>Object.keys(S().chests||{}).length>=1},{id:"chestall",n:"Treasure Hunter",d:"Open all 14 stage chests",g:"14",tier:"g",t:()=>Object.keys(S().chests||{}).length>=14});

/* the separate planner page is gone: old links land on the Learn path */
V.plan=function(){location.replace("#path");};
})();
