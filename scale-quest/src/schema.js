/* ===== Schema & SQL lab ===== */
(function(){
"use strict";
const {V,esc}=window.SQ;const S=()=>window.SQ.state;
const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const st=()=>{const s=S();if(!s.schema)s.schema={};if(!s.sql)s.sql={};return s;};
const ALLQ=SQL_SETS.flatMap(x=>x.qs);
window.SQ.schemaSolved=id=>!!(st().schema[id]&&st().schema[id].solved);
window.SQ.sqlSetDone=id=>SQL_SETS.find(x=>x.id===id).qs.every(q=>st().sql[q.id]);

/* hub */
V.schema=function(el){
  const sd=SCHEMAS.filter(x=>window.SQ.schemaSolved(x.id)).length,qd=ALLQ.filter(q=>st().sql[q.id]).length;
  el.innerHTML=`<div class="row"><a class="small" href="#practice">← Gym</a></div>
  <div class="page-head"><div><div class="eyebrow">Schema & SQL lab</div><h1>Design the tables. Write the queries.</h1><p>Fresher rounds often ask "design the tables for…" or include a SQL round. Sketch the schema yourself first, then compare with the model answer. The SQL practice runs a real database in your browser.</p></div>
  <div class="card jstats"><div><b>${sd}/${SCHEMAS.length}</b><span>schemas solved</span></div><div><b>${qd}/${ALLQ.length}</b><span>queries solved</span></div></div></div>
  <div class="sect"><h2>Schema design</h2><span class="small muted">+40 XP each</span></div>
  <div class="grid g3">${SCHEMAS.map(x=>`<a class="card pcard" href="#schema-${x.id}" style="border-top:4px solid var(--w3)"><div class="row" style="justify-content:space-between"><h3>${esc(x.title)}</h3>${window.SQ.schemaSolved(x.id)?'<span class="tag easy">Solved</span>':`<span class="tag ${x.diff.toLowerCase()}">${x.diff}</span>`}</div><p>${esc(x.prompt)}</p></a>`).join("")}</div>
  <div class="sect"><h2>SQL practice</h2><span class="small muted">+20 XP per query · runs SQLite in your browser</span></div>
  <div class="grid g3">${SQL_SETS.map(x=>{const n=x.qs.filter(q=>st().sql[q.id]).length;return `<a class="card pcard" href="#sql-${x.id}" style="border-top:4px solid var(--w2)"><div class="row" style="justify-content:space-between"><h3>Set ${x.id}: ${esc(x.title)}</h3><span class="tag ${n===x.qs.length?"easy":""}">${n}/${x.qs.length}</span></div><p>${x.qs.map(q=>q.q.replace(/<[^>]+>/g,"")).slice(0,2).join(" · ")}…</p></a>`;}).join("")}</div>`;
};

/* one schema exercise */
V.schema_x=function(el,id){
  const x=SCHEMAS.find(s=>s.id===id);if(!x){location.hash="#schema";return;}
  const rec=st().schema[id]=st().schema[id]||{draft:"",checks:{},solved:null,revealed:false};
  el.innerHTML=`<div class="row"><a class="small" href="#schema">← Schema & SQL lab</a></div>
  <div class="page-head"><div><div class="row"><span class="tag ${x.diff.toLowerCase()}">${x.diff}</span>${rec.solved?'<span class="tag easy">Solved</span>':""}</div><h1 style="margin-top:8px">${esc(x.title)}</h1><p>${esc(x.prompt)}</p></div></div>
  <div class="grid g2"><div class="card"><h3>Must support</h3><ul>${x.reqs.map(r=>`<li>${esc(r)}</li>`).join("")}</ul>
    <h3 style="margin-top:12px">Hints</h3>${x.hints.map((h,i)=>`<details class="dd"><summary>Hint ${i+1}</summary><div>${esc(h)}</div></details>`).join("")}</div>
  <div class="card"><h3>Your schema</h3><p class="small muted" style="margin:2px 0 8px">Write tables, columns, keys and indexes in any style: SQL or plain lists. It saves as you type.</p><textarea id="draft" class="code" spellcheck="false" placeholder="users(id PK, name, email UNIQUE)&#10;posts(id PK, user_id FK → users, created_at)&#10;index: posts(user_id, created_at)">${esc(rec.draft)}</textarea></div></div>
  <div class="row" style="margin-top:14px"><button class="btn ${rec.revealed?"":"primary"}" id="reveal">${rec.revealed?"Model answer shown":"I've drafted it · show the model answer"}</button></div>
  <div id="ans" class="${rec.revealed?"":"hidden"}">
   <div class="sect"><h2>Model answer</h2><span class="small muted">PostgreSQL syntax</span></div><div class="card">${x.answer}</div>
   <div class="sect"><h2>Why it's designed this way</h2></div><div class="callout say"><ul>${x.why.map(w=>`<li>${w}</li>`).join("")}</ul></div>
   <div class="sect"><h2>Grade yourself</h2><span class="small muted">Tick what your draft had</span></div>
   <div class="card">${x.check.map((c,i)=>`<label class="chk"><input type="checkbox" data-c="${i}" ${rec.checks[i]?"checked":""}> ${esc(c)}</label>`).join("")}
   <div class="row" style="margin-top:12px"><button class="btn gold" id="solve">${rec.solved?"Solved ✓":"Mark solved +40 XP"}</button><span class="small muted" id="sc"></span></div></div></div>`;
  const ta=$("#draft");ta.oninput=()=>{rec.draft=ta.value;window.SQ.save();};
  $("#reveal").onclick=()=>{if(!ta.value.trim()&&!rec.revealed){window.SQ.toast("Draft something first. Even a rough list of tables counts.");ta.focus();return;}rec.revealed=true;window.SQ.save();$("#ans").classList.remove("hidden");$("#reveal").textContent="Model answer shown";$("#reveal").classList.remove("primary");$("#ans").scrollIntoView({behavior:"smooth"});};
  const upd=()=>{const n=Object.values(rec.checks).filter(Boolean).length;$("#sc").textContent=`${n}/${x.check.length} key ideas in your draft${n<3?" · rework it before marking solved":""}`;};
  $$("[data-c]",el).forEach(c=>c.onchange=()=>{rec.checks[c.dataset.c]=c.checked;window.SQ.save();upd();});upd();
  $("#solve").onclick=()=>{if(rec.solved){window.SQ.toast("Already solved");return;}const n=Object.values(rec.checks).filter(Boolean).length;if(n<3){window.SQ.toast("Get at least 3 of the key ideas into your draft first");return;}rec.solved=window.SQ.today();window.SQ.addXP(40,`Schema solved: ${x.title}`);window.SQ.confetti(60);window.SQ.render();};
};

/* SQL engine (lazy) */
let dbP=null;
function loadSQL(){
  if(dbP)return dbP;
  dbP=new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-wasm.js";s.onload=()=>window.initSqlJs({locateFile:f=>"https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/"+f}).then(res,rej);s.onerror=()=>rej(new Error("Couldn't load the SQL engine. Check your internet connection."));document.head.appendChild(s);});
  dbP.catch(()=>{dbP=null;});
  return dbP;
}
function freshDB(SQL){const db=new SQL.Database();db.run(SQL_SEED);return db;}
function run(db,sql){const out=db.exec(sql);return out.length?out[out.length-1]:{columns:[],values:[]};}
const norm=v=>v===null?"NULL":typeof v==="number"?(Math.round(v*100)/100).toString():String(v);
function same(a,b,ordered){
  if(a.columns.length!==b.columns.length||a.values.length!==b.values.length)return false;
  const A=a.values.map(r=>r.map(norm).join("\u0001")),B=b.values.map(r=>r.map(norm).join("\u0001"));
  if(ordered)return A.every((r,i)=>r===B[i]);
  return A.slice().sort().join("\n")===B.slice().sort().join("\n");
}
function table(r){if(!r.columns.length)return `<p class="small muted">Query ran. No rows returned.</p>`;return `<div class="tscroll"><table class="tbl"><tr>${r.columns.map(c=>`<th>${esc(c)}</th>`).join("")}</tr>${r.values.slice(0,50).map(row=>`<tr>${row.map(v=>`<td>${v===null?'<span class="muted">NULL</span>':esc(v)}</td>`).join("")}</tr>`).join("")}</table></div>${r.values.length>50?`<p class="small muted">Showing 50 of ${r.values.length} rows.</p>`:""}`;}

V.sql_x=function(el,id){
  const set=SQL_SETS.find(x=>x.id===id);if(!set){location.hash="#schema";return;}
  const i=Math.min(V.sql_x.i&&V.sql_x.set===id?V.sql_x.i:0,set.qs.length-1);V.sql_x.set=id;V.sql_x.i=i;
  const q=set.qs[i];const draftKey="d_"+q.id;
  el.innerHTML=`<div class="row"><a class="small" href="#schema">← Schema & SQL lab</a></div>
  <div class="page-head"><div><div class="eyebrow">SQL set ${set.id}</div><h1>${esc(set.title)}</h1><p>A small food-delivery database runs right here (SQLite). Write a query, press Run, then Check. Column names don't matter; the rows do.</p></div></div>
  <div class="tabs">${set.qs.map((x,j)=>`<button data-j="${j}" class="${j===i?"on":""}">${st().sql[x.id]?"✓ ":""}Q${j+1}</button>`).join("")}</div>
  <div class="grid g2" style="align-items:start"><div>
    <div class="card"><div class="eyebrow">Question ${i+1}</div><p style="font-size:1.05rem;margin:6px 0 10px">${q.q}</p>
    <textarea id="sqlin" class="code" spellcheck="false" placeholder="SELECT ... FROM ...">${esc(st().sql[draftKey]||"")}</textarea>
    <div class="row" style="margin-top:10px"><button class="btn primary" id="runq">Run ▶</button><button class="btn gold" id="chk">Check answer</button><button class="btn ghost sm" id="hint">Hint</button><button class="btn ghost sm" id="showsol">Show solution</button><span class="small muted">Ctrl+Enter runs</span></div>
    <div id="hintbox" class="small muted hidden" style="margin-top:8px">${esc(q.hint)}</div></div>
    <div id="sqlout" class="card" style="margin-top:12px"><p class="small muted">Results show here.</p></div></div>
  <div class="card"><h3>Tables</h3><div id="schemaBox" class="small muted">Loading the database…</div></div></div>`;
  $$(".tabs button",el).forEach(b=>b.onclick=()=>{V.sql_x.i=+b.dataset.j;window.SQ.render();});
  const ta=$("#sqlin"),out=$("#sqlout");
  ta.oninput=()=>{st().sql[draftKey]=ta.value;window.SQ.save();};
  ta.onkeydown=e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();$("#runq").click();}};
  $("#hint").onclick=()=>$("#hintbox").classList.toggle("hidden");
  $("#showsol").onclick=()=>{out.innerHTML=`<h3>One correct solution</h3><pre><code>${esc(q.sol)}</code></pre><p class="small muted">Type it yourself (don't paste) and run it to earn the XP. There are usually several correct ways.</p>`;};
  let SQLlib=null;
  loadSQL().then(L=>{SQLlib=L;const db=freshDB(L);const t=run(db,"SELECT name, sql FROM sqlite_master WHERE type='table'");
    $("#schemaBox").innerHTML=t.values.map(([n,sql])=>`<div style="margin-bottom:8px"><b class="mono">${esc(n)}</b><div class="mono">${esc(sql.replace(/^CREATE TABLE \w+ \(|\)$/g,""))}</div></div>`).join("")+`<p>Dates are text like <code>2026-11-03 21:15</code>; use <code>DATE(created_at)</code> for the day. <code>amount</code> and prices are in rupees.</p>`;
    db.close();}).catch(e=>{$("#schemaBox").textContent=e.message;});
  const exec=()=>{if(!SQLlib){out.innerHTML=`<p class="small muted">The SQL engine is still loading…</p>`;return null;}const db=freshDB(SQLlib);try{return {db,res:run(db,ta.value)};}catch(e){db.close();out.innerHTML=`<p style="color:var(--bad)"><b>Error:</b> ${esc(e.message)}</p>`;return null;}};
  $("#runq").onclick=()=>{if(!ta.value.trim())return;const r=exec();if(!r)return;out.innerHTML=table(r.res);r.db.close();};
  $("#chk").onclick=()=>{if(!ta.value.trim())return;const r=exec();if(!r)return;const exp=run(r.db,q.sol);const ok=same(r.res,exp,!!q.ordered);r.db.close();
    if(ok){const first=!st().sql[q.id];if(first){st().sql[q.id]=window.SQ.today();window.SQ.addXP(20,`SQL ${q.id} solved`);}
      out.innerHTML=`<p style="color:var(--good)"><b>Correct!</b> ${first?"+20 XP.":"Already solved."}</p>${table(r.res)}${i<set.qs.length-1?`<button class="btn primary" id="nextq">Next question →</button>`:`<a class="btn primary" href="#schema">Back to the lab</a>`}`;
      const nb=$("#nextq");if(nb)nb.onclick=()=>{V.sql_x.i=i+1;window.SQ.render();};
      $$(".tabs button",el)[i].textContent="✓ Q"+(i+1);}
    else out.innerHTML=`<p style="color:var(--bad)"><b>Not quite.</b> Expected ${exp.values.length} row${exp.values.length===1?"":"s"} × ${exp.columns.length} column${exp.columns.length===1?"":"s"}; you returned ${r.res.values.length} × ${r.res.columns.length}.${q.ordered?" Order matters for this one.":""}</p>${table(r.res)}`;};
};

/* badges */
window.SQ.BADGES.push(
  {id:"schema4",n:"Table Setter",d:"Solve 4 schema design exercises",g:"⊞",tier:"s",t:()=>SCHEMAS.filter(x=>window.SQ.schemaSolved(x.id)).length>=4},
  {id:"sqlall",n:"Query Master",d:"Solve every SQL practice question",g:"SQL",tier:"g",t:()=>ALLQ.every(q=>st().sql[q.id])});
})();
