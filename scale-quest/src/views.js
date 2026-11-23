/* ===== Practice, LLD, planner, trophies, library ===== */
(function(){
"use strict";
const {V,esc}=window.SQ;const S=()=>window.SQ.state;
const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const today=window.SQ.today;

V.practice=function(el){
  const due=CARDS.filter(c=>{const s=S().cards[c.id];return !s||s.due<=today();}).length;
  const tiles=[
    ["quiz","Quiz blitz","10 random questions from topics you've opened. Build combos for bonus XP.","10–15 XP each","var(--w2)"],
    ["cards","Flashcards","Spaced repetition over "+CARDS.length+" rapid-fire interview questions. "+due+" due now.","2 XP each","var(--w4)"],
    ["gym","Estimation gym","Back-of-envelope drills: QPS, storage, bandwidth, cache size, servers.","15 XP per hit","var(--w3)"],
    ["mock","Mock interview","A random problem, a 45-minute clock with phase checkpoints, and a scorecard.","150+ XP","var(--w5)"],
    ["scores","Scorecards","Every mock and attempt you've graded, so you can watch the trend.","Track","var(--w6)"],
    ["board","Whiteboard","Excalidraw with an architecture stencil and starter templates for every problem.","40 XP per save","var(--w1)"]
  ];
  el.innerHTML=`<div class="page-head"><div><div class="eyebrow">Practice gym</div><h1>Reps beat reading</h1><p>Short, repeatable drills. Do at least one every day; they feed your daily quests.</p></div></div>
  <div class="grid g3">${tiles.map(([h,t,d,x,c])=>`<a class="card pcard" href="#${h}" style="border-top:4px solid ${c}"><h3>${t}</h3><p>${d}</p><span class="tag" style="align-self:flex-start">${x}</span></a>`).join("")}</div>`;
};

/* Quiz blitz */
V.quiz=function(el){
  const opened=TOPICS.filter(t=>S().topics[t.id]);
  const pool=(opened.length>=3?opened:TOPICS).flatMap(t=>t.quiz.map((q,i)=>({q,id:"t:"+t.id+":"+i,t})));
  const pick=window.SQ.shuffle(pool).slice(0,10);
  el.innerHTML=`<div class="row"><a class="small" href="#practice">← Gym</a></div><div class="page-head"><div><div class="eyebrow">Quiz blitz</div><h1>10 questions. Keep the combo alive.</h1><p>${opened.length>=3?`Drawn from your ${opened.length} cleared topics.`:"Drawn from every topic (clear 3 topics to focus it on what you've studied)."} Combo of 5+ gives 15 XP per answer.</p></div><div class="card" style="padding:10px 16px"><span class="combo" id="cb">Combo x${S().stats.combo}</span></div></div><div id="qz"></div><div class="row" style="margin-top:14px"><button class="btn primary" id="again">New round</button></div>`;
  const box=$("#qz");
  box.innerHTML=pick.map((p,i)=>`<div class="q" data-i="${i}"><div class="eyebrow" style="margin-bottom:4px">${esc(p.t.title)}</div><div class="qt">${i+1}. ${p.q.q}</div><div class="opts">${p.q.o.map((o,j)=>`<button class="opt" data-j="${j}">${o}</button>`).join("")}</div><div class="why hidden">${p.q.why||""} <a href="#topic-${p.t.id}">Review topic</a></div></div>`).join("");
  window.SQ.wireQuiz(box,pick.map(p=>p.q),"",null,pick.map(p=>p.id));
  box.addEventListener("click",()=>setTimeout(()=>{$("#cb").textContent="Combo x"+S().stats.combo;},0));
  $("#again").onclick=()=>window.SQ.render();
};

/* Flashcards (Leitner) */
const INTERVAL=[0,1,2,4,8,16];
V.cards=function(el){
  const due=window.SQ.shuffle(CARDS.filter(c=>{const s=S().cards[c.id];return !s||s.due<=today();})).slice(0,20);
  let i=0,done=0;
  el.innerHTML=`<div class="row"><a class="small" href="#practice">← Gym</a></div><div class="page-head"><div><div class="eyebrow">Flashcards</div><h1>Rapid-fire recall</h1><p>Say the answer out loud, then flip. "Again" brings the card back today; "Good" and "Easy" push it out by 1–16 days.</p></div><span class="chip" id="fcount"></span></div><div id="fc"></div>`;
  const box=$("#fc");
  function show(){
    $("#fcount").textContent=`${Math.max(0,due.length-i)} left`;
    if(i>=due.length){const nextDue=CARDS.map(c=>S().cards[c.id]).filter(Boolean).map(s=>s.due).sort()[0];box.innerHTML=`<div class="card" style="text-align:center;padding:30px"><h2>Deck cleared for today</h2><p class="muted">${done} cards reviewed this session.${nextDue?` Next card due ${nextDue}.`:""}</p><a class="btn primary" href="#quiz">Try a quiz blitz</a></div>`;return;}
    const c=due[i];const st=S().cards[c.id]||{box:0};
    box.innerHTML=`<div class="flash" id="fl"><div class="flash-in" tabindex="0" role="button" aria-label="Flip card"><div class="face front"><div class="eyebrow">${esc(c.cat)} · box ${st.box}</div><div class="big">${c.q}</div><div class="small muted">Tap or press space to flip</div></div><div class="face back"><div class="eyebrow">Answer</div><div>${c.a}</div></div></div></div>
    <div class="row" style="justify-content:center;margin-top:14px"><button class="btn" data-r="0">Again</button><button class="btn primary" data-r="1">Good</button><button class="btn gold" data-r="2">Easy</button></div>`;
    const fl=$("#fl");const flip=()=>fl.classList.toggle("flip");$(".flash-in",fl).onclick=flip;$(".flash-in",fl).onkeydown=e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();flip();}};
    $$("[data-r]",box).forEach(b=>b.onclick=()=>{
      const r=+b.dataset.r;const s=S().cards[c.id]||{box:0};
      s.box=r===0?0:Math.min(5,s.box+r);s.due=window.SQ.addDays(today(),INTERVAL[s.box]||0);if(r===0)s.due=today();
      S().cards[c.id]=s;S().stats.cards++;done++;window.SQ.bump("cards");window.SQ.addXP(2,"Card reviewed",true);
      if(r===0)due.push(c);i++;show();
    });
  }
  show();
};

/* Estimation gym */
function genDrill(){
  const R=Math.random;const pickN=a=>a[Math.floor(R()*a.length)];
  const kinds=[
    ()=>{const dau=pickN([10,50,100,200,500]);const r=pickN([5,10,20,50]);const v=dau*1e6*r/86400;return{q:`${dau}M daily active users each make ${r} requests a day. What's the <b>average QPS</b>?`,unit:"requests/sec",ans:v,work:`${dau}M × ${r} = ${(dau*r).toLocaleString()}M requests/day. ÷ 86,400 s ≈ <b>${Math.round(v).toLocaleString()}/s</b>. Shortcut: ÷ 10⁵ gives ${Math.round(dau*r*10).toLocaleString()}/s. Peak ≈ 2–3× that.`};},
    ()=>{const n=pickN([1,5,10,50,100]);const kb=pickN([1,2,5,100,500]);const y=pickN([1,5,10]);const tb=n*1e6*kb*1e3*365*y/1e12;return{q:`You store ${n}M new records a day, ${kb} KB each, for ${y} year${y>1?"s":""}. How much storage in <b>TB</b> (no replication)?`,unit:"TB",ans:tb,work:`${n}M × ${kb} KB = ${(n*kb).toLocaleString()} GB/day. × 365 × ${y} = ${(n*kb*365*y).toLocaleString()} GB ≈ <b>${tb.toFixed(tb<10?2:0)} TB</b>. With 3× replication, triple it.`};},
    ()=>{const qps=pickN([1000,5000,20000,100000]);const kb=pickN([10,50,200,1000]);const v=qps*kb*8/1e6;return{q:`A service serves ${qps.toLocaleString()} requests/sec with ${kb} KB responses. Egress bandwidth in <b>Gbps</b>?`,unit:"Gbps",ans:v,work:`${qps.toLocaleString()} × ${kb} KB = ${(qps*kb/1000).toLocaleString()} MB/s. × 8 bits = <b>${v.toFixed(v<10?2:0)} Gbps</b>.`};},
    ()=>{const reads=pickN([100,500,1000]);const kb=pickN([1,2,5]);const v=reads*1e6*0.2*kb*1e3/1e9;return{q:`You serve ${reads}M reads a day of ${kb} KB objects. Using the 80/20 rule (cache the hottest 20% of a day's reads), how big is the cache in <b>GB</b>?`,unit:"GB",ans:v,work:`${reads}M × 20% = ${reads*0.2}M objects × ${kb} KB = <b>${v.toFixed(0)} GB</b>. That fits in a few Redis nodes (or one big one).`};},
    ()=>{const peak=pickN([20000,50000,100000,300000]);const per=pickN([1000,2000,5000]);const v=Math.ceil(peak/per);return{q:`Peak load is ${peak.toLocaleString()} QPS and one app server handles ~${per.toLocaleString()} QPS. How many <b>servers</b> at minimum?`,unit:"servers",ans:v,work:`${peak.toLocaleString()} ÷ ${per.toLocaleString()} = <b>${v}</b>. In an interview add 20–30% headroom and N+1 for failure: about ${Math.ceil(v*1.3)+1}.`};},
    ()=>{const urls=pickN([100,500,1000]);const v=urls*1e6*365*5;const chars=Math.ceil(Math.log(v)/Math.log(62));return{q:`A URL shortener creates ${urls}M links per day, kept for 5 years. How many <b>base62 characters</b> do the short codes need?`,unit:"characters",ans:chars,exact:true,work:`${urls}M × 365 × 5 ≈ ${(v/1e9).toFixed(0)} billion links. 62⁶ ≈ 56.8 billion, 62⁷ ≈ 3.5 trillion, 62⁸ ≈ 218 trillion. Smallest that fits: <b>${chars}</b>.`};}
  ];
  return pickN(kinds)();
}
V.gym=function(el){
  let d=genDrill();
  el.innerHTML=`<div class="row"><a class="small" href="#practice">← Gym</a></div><div class="page-head"><div><div class="eyebrow">Estimation gym</div><h1>Napkin math reps</h1><p>Interviewers want the right order of magnitude and clear steps, not decimals. Within ±30% counts as a hit.</p></div><span class="chip">${S().stats.drillsRight} hits so far</span></div>
  <div class="grid g2"><div class="card" id="dr"></div><div class="card"><h3>Cheat numbers</h3><table class="tbl"><tr><td>Seconds/day</td><td>86,400 ≈ 10⁵</td></tr><tr><td>1M req/day</td><td>≈ 12 req/s</td></tr><tr><td>Peak</td><td>2–3× average</td></tr><tr><td>1 KB × 1M</td><td>1 GB</td></tr><tr><td>1 MB × 1M</td><td>1 TB</td></tr><tr><td>Bytes → bits</td><td>× 8</td></tr><tr><td>Redis node</td><td>~100k simple ops/s</td></tr><tr><td>Postgres node</td><td>~thousands–10k simple writes/s</td></tr><tr><td>Base62, 7 chars</td><td>≈ 3.5 trillion codes</td></tr></table></div></div>`;
  function draw(){
    $("#dr").innerHTML=`<div class="eyebrow">Drill</div><p style="font-size:1.05rem">${d.q}</p><label class="small muted" for="dans">Your answer (${d.unit})</label><input id="dans" type="number" step="any" inputmode="decimal"><div class="row" style="margin-top:10px"><button class="btn primary" id="dgo">Check</button><button class="btn" id="dnext">Skip</button></div><div id="dres"></div>`;
    $("#dans").focus();
    $("#dans").onkeydown=e=>{if(e.key==="Enter")$("#dgo").click();};
    $("#dgo").onclick=()=>{
      const v=parseFloat($("#dans").value);if(isNaN(v)){window.SQ.toast("Type a number first");return;}
      const ok=d.exact?Math.round(v)===d.ans:Math.abs(v-d.ans)<=Math.abs(d.ans)*0.3;
      S().stats.drills++;if(ok){S().stats.drillsRight++;window.SQ.bump("gym");window.SQ.addXP(15,"Estimation hit");}else window.SQ.save();
      $("#dres").innerHTML=`<div class="callout ${ok?"say":"trap"}"><div class="ct">${ok?"Hit":"Off target"}</div>${d.work}</div><button class="btn primary" id="dn2">Next drill</button>`;
      $("#dgo").disabled=true;$("#dn2").onclick=()=>{d=genDrill();draw();};
    };
    $("#dnext").onclick=()=>{d=genDrill();draw();};
  }
  draw();
};

/* Mock interview */
const PHASES=[["Requirements",5],["Estimates",3],["Entities",2],["API",5],["High-level design",10],["Deep dives",15],["Wrap-up",5]];
V.mock=function(el){
  const p=V.mock.p?PROBLEMS.find(x=>x.id===V.mock.p):PROBLEMS[Math.floor(Math.random()*PROBLEMS.length)];V.mock.p=p.id;
  el.innerHTML=`<div class="row"><a class="small" href="#practice">← Gym</a></div><div class="page-head"><div><div class="eyebrow">Mock interview · 45 minutes</div><h1>${esc(p.title)}</h1><p>${p.prompt}</p></div><div class="row"><button class="btn" id="reroll">Different problem</button></div></div>
  <div class="card sticky-timer"><div><div class="eyebrow" id="phase">Ready</div><div class="timer" id="mtimer">45:00</div></div><div class="row"><button class="btn primary" id="mstart">Start the clock</button><a class="btn" href="#board" id="mboard">Open whiteboard</a></div></div>
  <div class="card" style="margin-top:12px"><div class="row" style="gap:6px">${PHASES.map(([n,m],i)=>`<span class="tag" data-ph="${i}">${n} · ${m}m</span>`).join("")}</div>
  <textarea id="mnotes" style="min-height:220px;margin-top:12px" placeholder="Talk out loud. Jot the key points of each phase here, and draw on the whiteboard."></textarea></div>
  <div class="card" style="margin-top:12px"><h3>Scorecard</h3>${window.SQ.rubricHTML()}<label for="mlearn" class="small" style="font-weight:700;display:block;margin-top:10px">One thing to fix next time</label><input id="mlearn" type="text" placeholder="e.g. I forgot to estimate storage before choosing the DB"><div class="row" style="margin-top:12px"><button class="btn gold" id="msave">Finish mock and save scorecard</button><a class="btn" href="#problem-${p.id}">Open reference solution</a></div></div>`;
  $("#reroll").onclick=()=>{V.mock.p=null;window.SQ.render();};
  $("#mboard").onclick=()=>{window.SQ.boardProblem=p.id;};
  $("#mstart").onclick=()=>{let acc=[];let s=0;PHASES.forEach(([n,m])=>{acc.push([n,s,s+m]);s+=m;});
    window.SQ.startTimer("mtimer",45,ms=>{const min=ms/60000;const i=acc.findIndex(([,a,b])=>min>=a&&min<b);const ph=$("#phase");if(!ph)return;ph.textContent=i>=0?`Now: ${acc[i][0]}`:"Wrap up";$$("[data-ph]").forEach(t=>{const k=+t.dataset.ph;t.className="tag"+(k===i?" co":k<i?" easy":"");});});};
  const sc=window.SQ.wireRubric(el);
  $("#msave").onclick=()=>{
    if(window.SQ.RUBRIC.some(([k])=>!sc[k])){window.SQ.toast("Rate all four rubric rows first");return;}
    const total=window.SQ.RUBRIC.reduce((a,[k])=>a+sc[k],0);
    S().mocks.push({d:today(),p:p.id,title:p.title,sc:Object.assign({},sc),total,learn:$("#mlearn").value});
    const pr=S().prob[p.id]=S().prob[p.id]||{notes:{},attempts:0,best:0};pr.attempts++;pr.best=Math.max(pr.best,total);
    S().stats.attempts++;window.SQ.bump("problem");window.SQ.addXP(150+total*5,`Mock finished (${total}/16)`);V.mock.p=null;location.hash="#scores";
  };
};

V.scores=function(el){
  const mocks=S().mocks.slice().reverse();
  const att=PROBLEMS.map(p=>({p,pr:S().prob[p.id]})).filter(x=>x.pr&&x.pr.attempts);
  const pts=S().mocks.map(m=>m.total);
  let chart="";if(pts.length>1){const W=600,H=160,px=i=>30+i*(W-50)/(pts.length-1),py=v=>H-20-(v-4)/12*(H-40);
    chart=`<div class="diagram"><svg viewBox="0 0 ${W} ${H}" style="min-width:320px">${[4,8,12,16].map(v=>`<line x1="30" x2="${W-20}" y1="${py(v)}" y2="${py(v)}" style="stroke:var(--line)"/><text x="22" y="${py(v)+4}" text-anchor="end" style="font:11px Figtree;fill:var(--muted)">${v}</text>`).join("")}<polyline points="${pts.map((v,i)=>px(i)+","+py(v)).join(" ")}" style="fill:none;stroke:var(--accent);stroke-width:2.5"/>${pts.map((v,i)=>`<circle cx="${px(i)}" cy="${py(v)}" r="${i===pts.length-1?5:3.5}" style="fill:var(--accent)"/>`).join("")}</svg><div class="cap">Mock scores out of 16, oldest to newest</div></div>`;}
  el.innerHTML=`<div class="row"><a class="small" href="#practice">← Gym</a></div><div class="page-head"><div><div class="eyebrow">Scorecards</div><h1>Your interview trend</h1><p>13+/16 is a strong-hire signal. Below 9, redo the problem from a blank page in a week.</p></div><a class="btn gold" href="#mock">New mock</a></div>${chart}
  <div class="sect"><h2>Mocks</h2></div>${mocks.length?`<div class="tscroll"><table class="tbl"><tr><th>Date</th><th>Problem</th>${window.SQ.RUBRIC.map(r=>`<th>${r[1]}</th>`).join("")}<th>Total</th><th>Fix next</th></tr>${mocks.map(m=>`<tr><td>${m.d}</td><td><a href="#problem-${m.p}">${esc(m.title)}</a></td>${window.SQ.RUBRIC.map(r=>`<td>${m.sc[r[0]]}</td>`).join("")}<td><b>${m.total}</b>/16</td><td>${esc(m.learn||"")}</td></tr>`).join("")}</table></div>`:`<p class="muted">No mocks yet. Your first one unlocks the "Under the Clock" badge.</p>`}
  <div class="sect"><h2>Practice attempts</h2></div>${att.length?`<div class="tscroll"><table class="tbl"><tr><th>Problem</th><th>Attempts</th><th>Best</th><th>Last</th></tr>${att.map(({p,pr})=>`<tr><td><a href="#problem-${p.id}">${esc(p.title)}</a></td><td>${pr.attempts}</td><td>${pr.best}/16</td><td>${pr.lastDay||"–"}</td></tr>`).join("")}</table></div>`:`<p class="muted">No attempts yet.</p>`}`;
};

/* LLD dojo */
V.lld=function(el){
  const tab=V.lld.tab||"solid";
  el.innerHTML=`<div class="page-head"><div><div class="eyebrow">LLD dojo</div><h1>Low-level design</h1><p>The machine-coding / OOD round: clean classes, SOLID, the right pattern, and working code. Python throughout, matching your stack.</p></div></div>
  <div class="tabs">${[["solid","OOP + SOLID"],["patterns","Design patterns"],["approach","How to run the round"],["worked","Worked problems"],["list","Problem ladder"]].map(([k,n])=>`<button data-t="${k}" class="${tab===k?"on":""}">${n}</button>`).join("")}</div><div id="lt"></div>`;
  $$(".tabs button",el).forEach(b=>b.onclick=()=>{V.lld.tab=b.dataset.t;window.SQ.render();});
  const box=$("#lt");
  if(tab==="solid")box.innerHTML=LLD.solid;
  else if(tab==="approach")box.innerHTML=LLD.approach;
  else if(tab==="patterns")box.innerHTML=`<p class="muted">The patterns that actually come up in fresher LLD rounds are marked <span class="tag easy">core</span>. Learn those first.</p><div class="tscroll"><table class="tbl"><tr><th>Pattern</th><th>Type</th><th>Problem it solves</th><th>Where you'd use it</th></tr>${LLD.patterns.map(p=>`<tr><td><b>${p[0]}</b> ${p[4]?'<span class="tag easy">core</span>':""}</td><td>${p[1]}</td><td>${p[2]}</td><td>${p[3]}</td></tr>`).join("")}</table></div>${LLD.patternCode}`;
  else if(tab==="worked")box.innerHTML=LLD.worked.map(w=>`<details class="dd"><summary>${w.t} <span class="tag ${w.d.toLowerCase()}">${w.d}</span></summary><div>${w.body}</div></details>`).join("");
  else{
    box.innerHTML=`<p class="muted">From the awesome-low-level-design ladder. Solve each in 45 minutes with classes + a small demo, then tick it for +30 XP.</p>`+["Easy","Medium","Hard","Concurrency"].map(d=>`<div class="sect"><h2>${d}</h2></div><div class="grid g3">${LLD.ladder.filter(x=>x[1]===d).map(x=>`<label class="card row" style="cursor:pointer;gap:10px;flex-wrap:nowrap"><input type="checkbox" data-l="${esc(x[0])}" ${S().lld[x[0]]?"checked":""} style="width:18px;height:18px;accent-color:var(--accent);flex:none"><span><b>${esc(x[0])}</b><span class="small muted" style="display:block">${x[2]}</span></span></label>`).join("")}</div>`).join("");
    $$("[data-l]",box).forEach(c=>c.onchange=()=>{const k=c.dataset.l;if(c.checked){S().lld[k]=today();window.SQ.addXP(30,"LLD problem: "+k);}else{delete S().lld[k];window.SQ.save();}});
  }
};

/* Planner */
V.plan=function(el){
  const pi=window.SQ.planIndex();const cw=Math.floor(pi/7);
  const total=WEEKS.length*7;const done=Object.keys(S().plan).length;
  el.innerHTML=`<div class="page-head"><div><div class="eyebrow">Your planner</div><h1>14-week plan</h1><p>Your day-by-day plan from Mon 16 Nov 2026 to Sun 21 Feb 2027, with each day linked to the matching lesson here. Every tick is +30 XP. Dates can slide around exams.</p></div><div class="card stat" style="min-width:160px"><b>${done}/${total}</b><span>days done</span><div class="bar" style="margin-top:6px"><i style="width:${done/total*100}%"></i></div></div></div>
  ${PHASES_P.map((ph,phi)=>`<div class="sect"><h2>${esc(ph.name)}</h2><span class="small muted">${esc(ph.weeks)}</span></div>`+WEEKS.map((w,wi)=>w.p!==phi?"":(()=>{const dn=w.days.filter((_,j)=>S().plan[wi*7+j]).length;return `<details class="card pweek ${wi===cw?"cur":""}" style="padding:0" ${wi===cw?"open":""}><summary><span class="wk">${w.n}</span><span><b>${esc(w.title)}</b><span class="small muted" style="display:block">${esc(w.goal)}</span></span><span class="small muted">${dn}/7</span></summary>${w.days.map((d,j)=>{const i=wi*7+j;const date=window.SQ.addDays(window.SQ.PLAN_START,i);const link=PLAN_LINKS[i];return `<div class="pday ${i===pi?"today":""}"><input type="checkbox" data-i="${i}" ${S().plan[i]?"checked":""} aria-label="Done: ${esc(d.t)}"><div><b>${esc(d.t)}</b>${i===pi?' <span class="tag co">Today</span>':""}<div class="small">${esc(d.d)}</div><div class="meta">${window.SQ.dateOf(date).toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})}${d.u?` · <a href="${d.u}" target="_blank" rel="noopener">${esc(d.s||"Resource")} ↗</a>`:""}${link?` · <a href="#${link}">Open lesson here</a>`:""}</div></div></div>`;}).join("")}</details>`;})()).join("")).join("")}`;
  $$("[data-i]",el).forEach(c=>c.onchange=()=>{const i=+c.dataset.i;if(c.checked!==!!S().plan[i])window.SQ.togglePlan(i);});
};

/* Trophies */
V.trophies=function(el){
  const st=window.SQ.streakInfo();const L=window.SQ.levelOf(S().xp);
  const B=window.SQ.BADGES;
  el.innerHTML=`<div class="page-head"><div><div class="eyebrow">Trophies</div><h1>Level ${L} · ${esc(window.SQ.titleOf(L))}</h1><p>${S().xp.toLocaleString()} XP total. Studying since ${S().created}.</p></div></div>
  <div class="grid g4"><div class="card stat"><b>${st.n}</b><span>Current streak</span></div><div class="card stat"><b>${Object.keys(S().log).filter(k=>S().log[k]>=S().goal).length}</b><span>Goal days</span></div><div class="card stat"><b>${S().stats.quizRight}</b><span>Quiz answers right</span></div><div class="card stat"><b>${S().stats.maxCombo}</b><span>Best combo</span></div><div class="card stat"><b>${S().stats.cards}</b><span>Cards reviewed</span></div><div class="card stat"><b>${S().stats.drillsRight}</b><span>Drills hit</span></div><div class="card stat"><b>${S().mocks.length}</b><span>Mocks done</span></div><div class="card stat"><b>${S().stats.boardsSaved}</b><span>Diagrams saved</span></div></div>
  <div class="sect"><h2>Badges</h2><span class="small muted">${Object.keys(S().badges).length} of ${B.length}</span></div>
  <div class="badges">${B.map(b=>{const on=S().badges[b.id];return `<div class="badge ${on?"":"locked"}">${window.SQ.badgeSvg(b,!on)}<b>${esc(b.n)}</b><span>${esc(b.d)}${on?`<br>Earned ${on}`:""}</span></div>`;}).join("")}</div>
  <div class="sect"><h2>Level ladder</h2></div><div class="card tscroll"><table class="tbl"><tr><th>Level</th><th>Title</th><th>XP needed</th></tr>${Array.from({length:13},(_,i)=>i+1).map(l=>`<tr style="${l===L?"background:var(--accent-soft)":""}"><td>${l}</td><td>${esc(window.SQ.titleOf(l))}</td><td>${window.SQ.need(l).toLocaleString()}</td></tr>`).join("")}</table></div>
  <div class="sect"><h2>Settings</h2></div>
  <div class="grid g2"><div class="card"><label for="goalSel"><b>Daily XP goal</b></label><select id="goalSel">${[[30,"Casual · 30 XP"],[50,"Regular · 50 XP"],[100,"Serious · 100 XP"],[150,"Intense · 150 XP"]].map(([v,n])=>`<option value="${v}" ${S().goal===v?"selected":""}>${n}</option>`).join("")}</select>
  <label for="themeSel" style="display:block;margin-top:12px"><b>Theme</b></label><select id="themeSel">${["system","light","dark"].map(v=>`<option ${S().theme===v?"selected":""}>${v}</option>`).join("")}</select></div>
  <div class="card"><b>Back up or move your progress</b><p class="small muted" style="margin:4px 0 8px">Progress lives in this browser only. Copy the code to save it somewhere safe or paste it on another device.</p><div class="row"><button class="btn sm" id="exp">Copy backup code</button><button class="btn sm" id="imp">Restore from code</button><button class="btn sm ghost" id="rst" style="color:var(--bad)">Reset everything</button></div><textarea id="bk" class="hidden" placeholder="Paste your backup code here, then press Restore again"></textarea></div></div>`;
  $("#goalSel").onchange=e=>{S().goal=+e.target.value;window.SQ.save();window.SQ.render();};
  $("#themeSel").onchange=e=>{S().theme=e.target.value;window.SQ.save();if(e.target.value==="system")document.documentElement.removeAttribute("data-theme");else document.documentElement.setAttribute("data-theme",e.target.value);};
  $("#exp").onclick=()=>{const code=JSON.stringify(S());const ta=$("#bk");ta.classList.remove("hidden");ta.value=code;
    (navigator.clipboard?navigator.clipboard.writeText(code):Promise.reject()).then(()=>window.SQ.toast("Backup code copied")).catch(()=>{ta.select();window.SQ.toast("Select-all and copy the code in the box");});};
  let impArmed=false;$("#imp").onclick=()=>{const ta=$("#bk");if(!impArmed){ta.classList.remove("hidden");ta.value="";ta.focus();impArmed=true;$("#imp").textContent="Restore now";return;}
    try{const o=JSON.parse(ta.value);if(typeof o.xp!=="number")throw 0;localStorage.setItem("scalequest.v1",JSON.stringify(o));location.reload();}catch(e){window.SQ.toast("That code isn't valid. Copy the whole thing.");}};
  let rstArmed=false;$("#rst").onclick=e=>{if(!rstArmed){rstArmed=true;e.target.textContent="Click again to wipe all progress";setTimeout(()=>{rstArmed=false;if(e.target)e.target.textContent="Reset everything";},3000);return;}try{localStorage.removeItem("scalequest.v1");}catch(x){}location.reload();};
};

/* Library */
V.library=function(el){
  el.innerHTML=`<div class="page-head"><div><div class="eyebrow">Library</div><h1>Sources and real-world reads</h1><p>Everything here was used to build the lessons. When a lesson isn't enough, go to these.</p></div></div>
  ${RESOURCES.map(g=>`<div class="sect"><h2>${esc(g.g)}</h2></div><div class="grid g3">${g.items.map(([t,u,d])=>`<a class="card pcard" href="${u}" target="_blank" rel="noopener"><h3 style="font-size:.98rem">${esc(t)} ↗</h3><p>${esc(d)}</p></a>`).join("")}</div>`).join("")}`;
};
})();
