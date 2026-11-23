/* ===== Fast revision + spaced review queue ===== */
(function(){
"use strict";
const {V,esc}=window.SQ;const S=()=>window.SQ.state;
const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const today=window.SQ.today;
const fmt=k=>window.SQ.dateOf(k).toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"});
const heads=html=>(html.match(/<h3>(.*?)<\/h3>/g)||[]).map(h=>h.replace(/<\/?h3>/g,""));
function srsTag(id){
  const r=S().srs[id];if(!r)return `<span class="tag">Not in queue</span>`;
  if(r.done)return `<span class="tag easy">Mastered</span>`;
  if(r.due<=today())return `<span class="tag due">Review due</span>`;
  return `<span class="tag">Review ${fmt(r.due)}</span>`;
}
/* pull one h3 section (heading + following nodes) out of any topic's notes */
function section(title){
  for(const t of TOPICS){const d=document.createElement("div");d.innerHTML=t.notes;
    const h=$$("h3",d).find(x=>x.textContent.trim().startsWith(title));
    if(h){let out=`<h3>${h.innerHTML}</h3>`;let n=h.nextElementSibling;while(n&&n.tagName!=="H3"){out+=n.outerHTML;n=n.nextElementSibling;}return {html:out,t};}}
  return null;
}

/* ---------- Fast revision ---------- */
V.revise=function(el){
  const tab=V.revise.tab||"topics";const wn=V.revise.w||1;const hide=!!V.revise.hide;
  el.innerHTML=`<div class="page-head"><div><div class="eyebrow">Fast revision</div><h1>Every module on one screen</h1><p>The crisp version of the whole course: TL;DR, key ideas, lines to say, and traps. Read a module in 5–10 minutes the night before, or switch on self-test and recall each card before you peek.</p></div>
  <label class="card row" style="padding:10px 14px;cursor:pointer;gap:10px"><input type="checkbox" id="hideT" ${hide?"checked":""} style="width:18px;height:18px;accent-color:var(--accent)"><span><b>Self-test mode</b><span class="small muted" style="display:block">Blur answers; tap a card to reveal</span></span></label></div>
  <div class="tabs">${[["topics","Topics by module"],["problems","Design problems"],["lld","LLD"],["numbers","Numbers to know"],["glossary","Glossary A–Z"]].map(([k,n])=>`<button data-t="${k}" class="${tab===k?"on":""}">${n}</button>`).join("")}</div><div id="rvb" class="${hide?"selftest":""}"></div>`;
  $$(".tabs button",el).forEach(b=>b.onclick=()=>{V.revise.tab=b.dataset.t;window.SQ.render();});
  $("#hideT").onchange=e=>{V.revise.hide=e.target.checked;$("#rvb").classList.toggle("selftest",e.target.checked);$$(".rv-card.shown",el).forEach(c=>c.classList.remove("shown"));};
  const box=$("#rvb");
  if(tab==="topics"){
    const w=WORLDS.find(x=>x.n===wn);const ts=TOPICS.filter(t=>t.w===wn);const mins=ts.length*2;
    const marked=S().sheets[wn];
    box.innerHTML=`<div class="wchips">${WORLDS.map(x=>{const n=TOPICS.filter(t=>t.w===x.n).length;return `<button data-w="${x.n}" class="wchip ${x.n===wn?"on":""}" style="--wc:${x.c}"><span>${x.n}</span>${esc(x.name)}<small>${n}</small>${S().sheets[x.n]?" ✓":""}</button>`;}).join("")}</div>
    <div class="card rv-mod" style="--wc:${w.c}"><div><div class="eyebrow" style="color:${w.c}">Module ${w.n} · ${ts.length} topics · ~${mins} min</div><h2>${esc(w.name)}</h2><p class="small muted" style="margin:2px 0 0">${esc(w.blurb)}</p></div>
    <button class="btn ${marked===today()?"":"gold"}" id="markMod">${marked===today()?"Revised today ✓":"Mark module revised +20 XP"}</button></div>
    <div class="rv-grid">${ts.map(t=>{const h=heads(t.notes);return `<article class="card rv-card" style="--wc:${w.c}">
      <div class="rv-top"><a href="#topic-${t.id}"><b>${esc(t.title)}</b></a>${srsTag(t.id)}</div>
      <div class="rv-body">${EASY[t.id]?`<details class="rv-plain"><summary>In plain English</summary>${EASY[t.id].p}</details>`:""}<p class="rv-tldr">${t.tldr}</p>
      ${h.length?`<div class="rv-k"><span>Key ideas</span>${h.map(x=>`<i>${x}</i>`).join("")}</div>`:""}
      ${t.say&&t.say.length?`<div class="rv-l say"><span>Say</span><ul>${t.say.map(x=>`<li>${x}</li>`).join("")}</ul></div>`:""}
      ${t.traps&&t.traps.length?`<div class="rv-l trap"><span>Traps</span><ul>${t.traps.map(x=>`<li>${x}</li>`).join("")}</ul></div>`:""}</div>
      <div class="rv-peek">Recall the TL;DR and one trade-off, then tap to check</div></article>`;}).join("")}</div>
    <div class="row" style="justify-content:space-between;margin-top:16px">${wn>1?`<button class="btn ghost" data-go="${wn-1}">← Module ${wn-1}</button>`:"<span></span>"}${wn<WORLDS.length?`<button class="btn" data-go="${wn+1}">Module ${wn+1}: ${esc(WORLDS[wn].name)} →</button>`:""}</div>`;
    $$("[data-w]",box).forEach(b=>b.onclick=()=>{V.revise.w=+b.dataset.w;window.SQ.render();});
    $$("[data-go]",box).forEach(b=>b.onclick=()=>{V.revise.w=+b.dataset.go;window.SQ.render();});
    $("#markMod").onclick=()=>{if(S().sheets[wn]===today()){window.SQ.toast("Already marked today");return;}S().sheets[wn]=today();window.SQ.bump("topic");window.SQ.addXP(20,`Revised module ${wn}: ${w.name}`);window.SQ.render();};
  }else if(tab==="problems"){
    box.innerHTML=`<p class="muted">For each problem: what it tests, the numbers, the deep dives you must name, and the mistakes that sink people. Open the full solution from the title.</p>
    <div class="rv-grid">${PROBLEMS.map(p=>{const s=p.sol;return `<article class="card rv-card" style="--wc:var(--w${(PROBLEMS.indexOf(p)%8)+1})">
      <div class="rv-top"><a href="#problem-${p.id}"><b>${esc(p.title)}</b></a><span class="tag ${p.diff.toLowerCase()}">${p.diff}</span></div>
      <div class="rv-body"><p class="rv-tldr">${p.pitch}</p>
      <div class="rv-l"><span>Tests</span><ul>${p.tests.map(x=>`<li>${x}</li>`).join("")}</ul></div>
      ${s.est?`<div class="rv-l"><span>Numbers</span><p>${s.est}</p></div>`:""}
      ${s.deep&&s.deep.length?`<div class="rv-l say"><span>Deep dives to name</span><ul>${s.deep.map(d=>`<li>${d[0]}</li>`).join("")}</ul></div>`:""}
      ${s.mistakes&&s.mistakes.length?`<div class="rv-l trap"><span>Avoid</span><ul>${s.mistakes.map(x=>`<li>${x}</li>`).join("")}</ul></div>`:""}</div>
      <div class="rv-peek">Say the components and one deep dive, then tap to check</div></article>`;}).join("")}</div>`;
  }else if(tab==="lld"){
    const solid=[["S","Single responsibility","A class has one reason to change. Split \"Invoice\" from \"InvoicePrinter\"."],["O","Open/closed","Open for extension, closed for modification. Add a new PaymentMethod subclass instead of editing an if-else chain."],["L","Liskov substitution","A subclass must work anywhere its parent does. If Square breaks Rectangle's setWidth, the hierarchy is wrong."],["I","Interface segregation","Many small interfaces beat one fat one. A Printer shouldn't be forced to implement fax()."],["D","Dependency inversion","Depend on abstractions, not concrete classes. Inject a NotificationSender, don't new up EmailSender inside."]];
    const core=LLD.patterns.filter(p=>p[4]);
    box.innerHTML=`<div class="rv-grid">${solid.map(([l,n,d])=>`<article class="card rv-card" style="--wc:var(--w7)"><div class="rv-top"><b><span class="solid-l">${l}</span> ${n}</b></div><div class="rv-body"><p class="rv-tldr">${d}</p></div><div class="rv-peek">Explain it with an example, then tap</div></article>`).join("")}</div>
    <div class="sect"><h2>Core patterns</h2><a class="small" href="#lld">Full table + code in the LLD dojo</a></div>
    <div class="rv-grid">${core.map(p=>`<article class="card rv-card" style="--wc:var(--w4)"><div class="rv-top"><b>${p[0]}</b><span class="tag">${p[1]}</span></div><div class="rv-body"><p class="rv-tldr">${p[2]}</p><div class="rv-l"><span>Use it for</span><p>${p[3]}</p></div></div><div class="rv-peek">Name the problem it solves, then tap</div></article>`).join("")}</div>
    <div class="sect"><h2>Running the round in 45 minutes</h2></div>
    <div class="card"><ol class="rv-steps"><li><b>Clarify (5 min):</b> list the use cases and what's out of scope.</li><li><b>Entities (5 min):</b> nouns become classes, verbs become methods. Draw the relationships.</li><li><b>Interfaces + patterns (5 min):</b> spot the strategy, state, observer or factory before coding.</li><li><b>Code (25 min):</b> core classes first, then the main flow, then a small demo/driver.</li><li><b>Extend (5 min):</b> show how a new requirement plugs in without rewriting, and mention thread safety.</li></ol></div>`;
  }else if(tab==="glossary"){
    const all=Object.entries(GLOSSARY).sort((a,b)=>a[0].localeCompare(b[0],undefined,{sensitivity:"base"}));
    const where={};Object.entries(EASY).forEach(([id,e])=>e.w.forEach(([k])=>{(where[k]=where[k]||[]).push(id);}));
    box.innerHTML=`<div class="row" style="margin-bottom:12px"><input id="glq" type="search" placeholder="Search ${all.length} terms, e.g. cache, shard, token" style="flex:1;min-width:0"><span class="small muted" id="glc"></span></div><div class="gl-list">${all.map(([k,d])=>{const ids=(where[k]||[]).map(id=>TOPICS.find(t=>t.id===id)).filter(Boolean);return `<div class="gl-item" data-s="${esc((k+" "+d).toLowerCase())}"><dt>${esc(k)}</dt><dd>${esc(d)}${ids.length?` <span class="small">${ids.map(t=>`<a href="#topic-${t.id}">${esc(t.title)}</a>`).join(" · ")}</span>`:""}</dd></div>`;}).join("")}</div>`;
    const q=$("#glq"),c=$("#glc");const f=()=>{const v=q.value.trim().toLowerCase();let n=0;$$(".gl-item",box).forEach(it=>{const ok=!v||it.dataset.s.includes(v);it.hidden=!ok;if(ok)n++;});c.textContent=n+" terms";};q.oninput=f;f();
  }else{
    const parts=["The nines","Latency numbers","Capacity rules of thumb","Powers of two and ten","Template"].map(section).filter(Boolean);
    box.innerHTML=`<div class="grid g2">
    <div class="card rv-num"><h3>Conversions to memorise</h3><table><tr><th>Fact</th><th>Value</th></tr>
      <tr><td>Seconds in a day</td><td>86,400 ≈ 10⁵</td></tr><tr><td>1 million per day</td><td>≈ 12 per second</td></tr><tr><td>1 billion per day</td><td>≈ 12,000 per second</td></tr><tr><td>Peak vs average traffic</td><td>2–3×</td></tr><tr><td>Seconds in a month</td><td>≈ 2.6 million</td></tr><tr><td>Base62, 7 characters</td><td>62⁷ ≈ 3.5 trillion</td></tr><tr><td>Bandwidth</td><td>bytes × 8 = bits</td></tr></table></div>
    ${parts.map(p=>`<div class="card rv-num">${p.html}<p class="small muted" style="margin:6px 0 0">From <a href="#topic-${p.t.id}">${esc(p.t.title)}</a></p></div>`).join("")}</div>`;
  }
  $$(".rv-card",box).forEach(c=>c.addEventListener("click",e=>{if(!$("#rvb").classList.contains("selftest")||e.target.closest("a"))return;c.classList.toggle("shown");}));
};

/* ---------- Spaced review queue ---------- */
const STEP_NAME=["1-day","3-day","7-day","16-day","35-day"];
V.review=function(el){
  const SR=S().srs,steps=window.SQ.SRS_STEPS;
  const ids=Object.keys(SR).filter(id=>TOPICS.some(t=>t.id===id));
  const due=window.SQ.srsDue();
  const mastered=ids.filter(id=>SR[id].done).length;
  const pass=S().stats.revPass,miss=S().stats.revMiss;
  const sess=V.review.s;
  if(sess&&sess.i<sess.q.length){runSession(el);return;}
  if(sess){V.review.s=null;}
  // 14-day forecast
  const t=today();const fc=Array.from({length:14},(_,i)=>{const k=window.SQ.addDays(t,i);const n=ids.filter(id=>!SR[id].done&&(i===0?SR[id].due<=k:SR[id].due===k)).length;return {k,n};});
  const mx=Math.max(1,...fc.map(f=>f.n));
  const rows=ids.map(id=>({t:TOPICS.find(x=>x.id===id),r:SR[id]})).sort((a,b)=>(a.r.done?1:0)-(b.r.done?1:0)||String(a.r.due).localeCompare(String(b.r.due)));
  el.innerHTML=`<div class="page-head"><div><div class="eyebrow">Review queue</div><h1>${due.length?`${due.length} topic${due.length>1?"s":""} due today`:ids.length?"Nothing due. Memory intact.":"Your review queue starts here"}</h1><p>Topics come back after <b>1, 3, 7, 16 and 35 days</b>. Passing pushes a topic further out; missing brings it back tomorrow. This is how the material stays with you after today.</p></div>
  ${due.length?`<button class="btn primary" id="startRv">Start review · ${due.length}</button>`:`<a class="btn" href="#revise">Fast revision</a>`}</div>
  <div class="ladder card">${steps.map((d,i)=>`<div class="lstep"><b>Day ${d}</b><span>${(n=>n+" topic"+(n===1?"":"s"))(ids.filter(id=>!SR[id].done&&SR[id].step===i).length)}</span></div>`).join('<i class="larr">→</i>')}<i class="larr">→</i><div class="lstep gold"><b>Mastered</b><span>${mastered} topic${mastered===1?"":"s"}</span></div></div>
  <div class="grid g4" style="margin-top:14px"><div class="card stat"><b>${due.length}</b><span>Due now</span></div><div class="card stat"><b>${ids.length-mastered}</b><span>On the ladder</span></div><div class="card stat"><b>${mastered}</b><span>Mastered</span></div><div class="card stat"><b>${pass+miss?Math.round(pass/(pass+miss)*100)+"%":"–"}</b><span>Pass rate (${pass+miss} reviews)</span></div></div>
  <div class="sect"><h2>Next 14 days</h2><span class="small muted">Today includes anything overdue</span></div>
  <div class="card forecast">${fc.map((f,i)=>`<div class="fc ${i===0?"today":""}" title="${f.k}: ${f.n} due"><span class="fn">${f.n||""}</span><i style="height:${f.n?Math.max(10,f.n/mx*100):3}%"></i><small>${i===0?"Today":window.SQ.dateOf(f.k).toLocaleDateString(undefined,{weekday:"narrow"})}</small></div>`).join("")}</div>
  <div class="sect"><h2>How a review works</h2></div>
  <div class="grid g3"><div class="card"><b>1. Recall</b><p class="small muted" style="margin:4px 0 0">See only the title. Say the TL;DR and one trade-off out loud, then reveal the summary.</p></div><div class="card"><b>2. Prove it</b><p class="small muted" style="margin:4px 0 0">Answer up to 3 questions from that topic. Pass with at most one wrong.</p></div><div class="card"><b>3. Reschedule</b><p class="small muted" style="margin:4px 0 0">Pass: next gap (+15 XP). Miss: back tomorrow at the 1-day step (+5 XP). Overdue topics wait for you; they're not counted as misses.</p></div></div>
  <div class="sect"><h2>Every topic on the ladder</h2><span class="small muted">${ids.length} of ${TOPICS.length} topics enrolled · clear topics in the Learn path to add more</span></div>
  ${rows.length?`<div class="card tscroll"><table class="tbl"><tr><th>Topic</th><th>Progress</th><th>Next review</th><th>Last result</th></tr>${rows.map(({t:x,r})=>{const last=r.hist[r.hist.length-1];return `<tr><td><a href="#topic-${x.id}">${esc(x.title)}</a></td><td><span class="pips">${steps.map((_,i)=>`<i class="${r.done||i<r.step?"on":i===r.step?"cur":""}"></i>`).join("")}</span></td><td>${r.done?`<span class="tag easy">Mastered ${r.done}</span>`:r.due<=t?`<span class="tag due">Due${r.due<t?" (overdue)":""}</span>`:fmt(r.due)}</td><td>${last?(last.p?`<span style="color:var(--good)">Passed</span>`:`<span style="color:var(--bad)">Missed</span>`)+` <span class="small muted">${last.d}</span>`:`<span class="small muted">First review pending</span>`}</td></tr>`;}).join("")}</table></div>`:`<div class="card" style="text-align:center;padding:28px"><h3>Your queue is empty</h3><p class="muted">Clear a topic in the Learn path and it shows up here tomorrow.</p><a class="btn primary" href="#path">Open the Learn path</a></div>`}`;
  const sb=$("#startRv");if(sb)sb.onclick=()=>{V.review.s={q:due.map(x=>x.id),i:0,pass:0,miss:0};window.SQ.render();};
};

function runSession(el){
  const s=V.review.s;const t=TOPICS.find(x=>x.id===s.q[s.i]);const w=WORLDS.find(x=>x.n===t.w);const r=S().srs[t.id];
  const rnd=window.SQ.shuffle(t.quiz.map((q,i)=>i)).slice(0,3);const qs=rnd.map(i=>t.quiz[i]);
  const allowed=qs.length>=3?1:0;
  const h=heads(t.notes);
  el.innerHTML=`<div class="row" style="justify-content:space-between"><button class="btn ghost sm" id="quitRv">← End session</button><span class="small muted">Topic ${s.i+1} of ${s.q.length} · ${s.pass} passed · ${s.miss} missed</span></div>
  <div class="bar" style="margin:10px 0 16px"><i style="width:${s.i/s.q.length*100}%"></i></div>
  <div class="card rv-session" style="--wc:${w.c}">
    <div class="row"><span class="tag" style="background:${w.c};color:#fff">Module ${w.n} · ${esc(w.name)}</span><span class="tag">${STEP_NAME[Math.min(r.step,4)]} review</span>${r.due<today()?'<span class="tag due">Overdue</span>':""}</div>
    <h1 style="margin:10px 0 4px">${esc(t.title)}</h1>
    <div id="rcl"><p class="muted">Before you look: say the TL;DR out loud and name one trade-off or trap.</p><button class="btn primary" id="reveal">I've said it · reveal</button></div>
    <div id="sum" class="hidden"><p class="rv-tldr">${t.tldr}</p>${h.length?`<div class="rv-k"><span>Key ideas</span>${h.map(x=>`<i>${x}</i>`).join("")}</div>`:""}${t.traps&&t.traps.length?`<div class="rv-l trap"><span>Traps</span><ul>${t.traps.map(x=>`<li>${x}</li>`).join("")}</ul></div>`:""}</div>
  </div>
  <div id="rq" class="hidden"><div class="sect"><h2>Prove it</h2><span class="small muted">${qs.length} question${qs.length>1?"s":""} · pass with ${allowed?"at most one wrong":"all right"}</span></div>
  ${qs.map((q,i)=>`<div class="q" data-i="${i}"><div class="qt">${i+1}. ${q.q}</div><div class="opts">${q.o.map((o,j)=>`<button class="opt" data-j="${j}">${o}</button>`).join("")}</div><div class="why hidden">${q.why||""}</div></div>`).join("")}</div>
  <div id="verdict"></div>`;
  $("#quitRv").onclick=()=>{V.review.s=null;window.SQ.render();};
  $("#reveal").onclick=()=>{$("#rcl").classList.add("hidden");$("#sum").classList.remove("hidden");$("#rq").classList.remove("hidden");$("#rq").scrollIntoView({behavior:"smooth",block:"start"});};
  let answered=0,wrong=0;
  $$("#rq .q",el).forEach((box,i)=>{const q=qs[i];$$(".opt",box).forEach(b=>b.onclick=()=>{
    const right=+b.dataset.j===q.a;$$(".opt",box).forEach(x=>{x.disabled=true;if(+x.dataset.j===q.a)x.classList.add("right");});
    if(!right){b.classList.add("wrong");wrong++;}
    const why=$(".why",box);why.classList.remove("hidden");why.insertAdjacentHTML("afterbegin",right?`<b style="color:var(--good)">Correct.</b> `:`<b style="color:var(--bad)">Not quite.</b> `);
    answered++;if(answered===qs.length)finish(wrong<=allowed);
  });});
  function finish(ok){
    window.SQ.srsGrade(t.id,ok);const nr=S().srs[t.id];
    if(ok)s.pass++;else s.miss++;
    window.SQ.bump("topic");window.SQ.addXP(ok?15:5,ok?`Review passed: ${t.title}`:`Review attempted: ${t.title}`);
    if(ok&&nr.done){window.SQ.confetti(90);}
    const last=s.i+1>=s.q.length;
    $("#verdict").innerHTML=`<div class="card verdict ${ok?"pass":"miss"}"><div><h2>${ok?(nr.done?"Mastered! It survived 35 days.":"Passed"):"Missed: back tomorrow"}</h2><p class="small" style="margin:4px 0 0">${ok?(nr.done?"This topic leaves the queue. Revisit it in Fast revision before interviews.":`Next review in ${window.SQ.SRS_STEPS[nr.step]} days, on ${fmt(nr.due)}.`):`It restarts at the 1-day step. Skim the <a href="#topic-${t.id}">full notes</a> tonight.`}</p></div><button class="btn primary" id="nextRv">${last?"Finish session":"Next topic →"}</button></div>`;
    $("#verdict").scrollIntoView({behavior:"smooth",block:"nearest"});
    $("#nextRv").onclick=()=>{s.i++;if(last){const p=s.pass,m=s.miss;V.review.s=null;if(p+m)window.SQ.modal(`<div class="eyebrow">Review session done</div><h2>${p} passed · ${m} missed</h2><p>${m?"Missed topics come back tomorrow. ":""}Come back when the queue fills up again. The badge on the sidebar shows what's due.</p>`);if(!m&&p>=3)window.SQ.confetti(80);}
      window.SQ.render();};
  }
}
})();
