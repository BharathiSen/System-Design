/* ===== Kata runner: Python in a Web Worker (Pyodide) ===== */
(function(){
"use strict";
const {V,esc}=window.SQ;const S=()=>window.SQ.state;
const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const K=()=>{if(!S().kata)S().kata={};return S().kata;};
const PY="https://cdn.jsdelivr.net/npm/pyodide@0.26.4/";
window.SQ.kataSolved=id=>!!(K()[id]&&K()[id].solved);

let worker=null,ready=null,pending=null;
function boot(){
  if(worker)return ready;
  const src=`importScripts("${PY}pyodide.js");
let py=null;
loadPyodide({indexURL:"${PY}"}).then(p=>{py=p;postMessage({type:"ready"});}).catch(e=>postMessage({type:"fail",error:String(e&&e.message||e)}));
onmessage=async e=>{let out="";py.setStdout({batched:s=>{out+=s+"\\n";}});py.setStderr({batched:s=>{out+=s+"\\n";}});
  const ns=py.globals.get("dict")();
  try{const r=await py.runPythonAsync(e.data.code,{globals:ns});postMessage({type:"done",ok:true,out,result:r===undefined||r===null?null:String(r)});}
  catch(err){postMessage({type:"done",ok:false,out,error:String(err&&err.message||err)});}
  finally{ns.destroy();}};`;
  worker=new Worker(URL.createObjectURL(new Blob([src],{type:"text/javascript"})));
  ready=new Promise((res,rej)=>{worker.onmessage=e=>{const m=e.data;if(m.type==="ready")res();else if(m.type==="fail"){rej(new Error(m.error));kill();}else if(m.type==="done"&&pending){const p=pending;pending=null;clearTimeout(p.t);p.res(m);}};worker.onerror=e=>{rej(new Error(e.message||"Python failed to load"));kill();};});
  return ready;
}
function kill(){if(worker)worker.terminate();worker=null;ready=null;if(pending){const p=pending;pending=null;clearTimeout(p.t);p.res({ok:false,out:"",error:"Stopped: the code ran for more than 10 seconds (an infinite loop?)."});}}
function runPy(code){return boot().then(()=>new Promise(res=>{pending={res,t:setTimeout(kill,10000)};worker.postMessage({code});}));}

const HARNESS=`
import json as _json, traceback as _tb
_results=[]
for _name,_fn in list(globals().items()):
    if _name.startswith("test_") and callable(_fn):
        try:
            _fn(); _results.append([_name,True,""])
        except AssertionError as _e:
            _results.append([_name,False,str(_e) or "assertion failed"])
        except Exception as _e:
            _results.append([_name,False,type(_e).__name__+": "+str(_e)])
_json.dumps(_results)
`;

window.SQ.kataTab=function(box){
  const cur=V.lld.kata||KATAS[0].id;const k=KATAS.find(x=>x.id===cur)||KATAS[0];
  const rec=K()[k.id]=K()[k.id]||{draft:k.starter,solved:null};
  box.innerHTML=`<p class="muted">Machine-coding practice that actually runs. Write Python in the editor, press <b>Run tests</b>, and make every test pass (+60 XP each kata). Python runs inside your browser; the first run downloads it once (~12 MB).</p>
  <div class="wchips">${KATAS.map(x=>`<button class="wchip ${x.id===k.id?"on":""}" data-kata="${x.id}" style="--wc:var(--w7)"><span>${window.SQ.kataSolved(x.id)?"✓":KATAS.indexOf(x)+1}</span>${esc(x.title)}<small>${x.diff}</small></button>`).join("")}</div>
  <div class="grid g2" style="align-items:start"><div class="card"><div class="row" style="justify-content:space-between"><h3>${esc(k.title)}</h3><span class="tag">${esc(k.pattern)}</span></div><div class="kspec">${k.spec}</div>
    <h3 style="margin-top:12px">Hints</h3>${k.hints.map((h,i)=>`<details class="dd"><summary>Hint ${i+1}</summary><div>${esc(h)}</div></details>`).join("")}
    <details class="dd"><summary>Tests your code must pass</summary><div><pre><code>${esc(k.tests)}</code></pre></div></details>
    <details class="dd" id="ksol"><summary>Reference solution${rec.solved?"":" (try first!)"}</summary><div><pre><code>${esc(k.solution)}</code></pre></div></details></div>
  <div><textarea id="kcode" class="code" spellcheck="false" style="min-height:360px">${esc(rec.draft)}</textarea>
    <div class="row" style="margin-top:10px"><button class="btn primary" id="krun">Run tests ▶</button><button class="btn ghost sm" id="kreset">Reset to starter</button><span class="small muted">Ctrl+Enter runs · Tab indents</span></div>
    <div id="kout" class="card" style="margin-top:10px"><p class="small muted">${rec.solved?"Solved ✓ on "+rec.solved+". Run it again any time.":"Results appear here."}</p></div></div></div>`;
  $$("[data-kata]",box).forEach(b=>b.onclick=()=>{V.lld.kata=b.dataset.kata;window.SQ.render();});
  const ta=$("#kcode",box),out=$("#kout",box);
  ta.oninput=()=>{rec.draft=ta.value;window.SQ.save();};
  ta.onkeydown=e=>{if(e.key==="Tab"){e.preventDefault();const s=ta.selectionStart,en=ta.selectionEnd;ta.value=ta.value.slice(0,s)+"    "+ta.value.slice(en);ta.selectionStart=ta.selectionEnd=s+4;ta.oninput();}else if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();$("#krun",box).click();}};
  $("#kreset",box).onclick=()=>{ta.value=k.starter;ta.oninput();};
  $("#krun",box).onclick=async()=>{
    const btn=$("#krun",box);btn.disabled=true;out.innerHTML=`<p class="small muted">${worker?"Running…":"Loading Python (first run only, ~12 MB)…"}</p>`;
    let m;try{m=await runPy(ta.value+"\n\n"+k.tests+"\n"+HARNESS);}catch(e){m={ok:false,out:"",error:"Couldn't load Python: "+e.message+". Check your internet connection."};}
    btn.disabled=false;if(!document.body.contains(out))return;
    if(!m.ok){out.innerHTML=`<p style="color:var(--bad)"><b>Your code raised an error</b></p><pre><code>${esc((m.error||"").split("\n").slice(-8).join("\n"))}</code></pre>${m.out?`<div class="eyebrow">Printed output</div><pre><code>${esc(m.out)}</code></pre>`:""}`;return;}
    let res=[];try{res=JSON.parse(m.result||"[]");}catch(e){}
    const pass=res.filter(r=>r[1]).length,all=res.length&&pass===res.length;
    out.innerHTML=`<p style="color:${all?"var(--good)":"var(--bad)"}"><b>${pass}/${res.length} tests passed</b></p><ul class="ktests">${res.map(r=>`<li class="${r[1]?"ok":"bad"}">${r[1]?"✓":"✗"} ${esc(r[0].replace(/^test_/,"").replace(/_/g," "))}${r[1]?"":` <span class="small">${esc(r[2])}</span>`}</li>`).join("")}</ul>${m.out?`<div class="eyebrow">Printed output</div><pre><code>${esc(m.out)}</code></pre>`:""}`;
    if(all&&!rec.solved){rec.solved=window.SQ.today();window.SQ.addXP(60,`Kata solved: ${k.title}`);window.SQ.confetti(80);$$("[data-kata]",box).find(b=>b.dataset.kata===k.id).querySelector("span").textContent="✓";}
  };
};
window.SQ.BADGES.push({id:"kata3",n:"It Compiles",d:"Pass all tests on 3 coding katas",g:"</>",tier:"s",t:()=>KATAS.filter(x=>window.SQ.kataSolved(x.id)).length>=3},{id:"kataall",n:"Machine Coder",d:"Pass every coding kata",g:"py",tier:"g",t:()=>KATAS.every(x=>window.SQ.kataSolved(x.id))});
})();
