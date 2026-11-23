/* ===== Speaking practice: record your walkthrough + interviewer interruptions ===== */
(function(){
"use strict";
const {V,esc}=window.SQ;const S=()=>window.SQ.state;
const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const inArtifact=!!(window.claude&&typeof window.claude.use==="function");
const use=name=>inArtifact?window.claude.use(name).catch(()=>null):Promise.resolve(null);

/* shared helper: offer a file to the viewer (artifact downloads capability, else a normal download) */
window.SQ.saveFile=async function(filename,data){
  const d=await use("downloads");
  if(d){try{await d.save({filename,data});return "saved";}catch(e){return e&&e.code==="declined"?"declined":"failed";}}
  if(inArtifact)return "unavailable";
  try{const blob=data instanceof Blob?data:new Blob([data],{type:"application/octet-stream"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},3000);return "saved";}catch(e){return "failed";}
};

const FILLERS=["um","uh","umm","like","basically","actually","you know","sort of","kind of"];
function fillerCount(t){const s=" "+t.toLowerCase().replace(/[^a-z' ]/g," ")+" ";return FILLERS.reduce((n,f)=>n+(s.split(" "+f+" ").length-1),0);}
const CHECK=["I stated requirements and scope first","I gave at least one number (QPS, storage)","I explained why, not just what, for my main choices","I named one trade-off or bottleneck","I didn't go silent for long stretches"];

/* ---------- recorder panel ---------- */
function recorderHTML(){return `<div class="card rec" id="rec"><div class="row" style="justify-content:space-between;align-items:flex-start;gap:10px"><div><div class="eyebrow">Speaking practice</div><b>Record your walkthrough</b><div class="small muted" id="recHint">Explain your design out loud as if the interviewer were listening. Then play it back and grade yourself.</div></div>
<div class="row"><span class="timer" id="recT" style="font-size:1.2rem">0:00</span><button class="btn primary" id="recBtn" disabled>Checking microphone…</button></div></div><div id="recOut"></div></div>`;}

function wireRecorder(root,pid){
  const btn=$("#recBtn",root),hint=$("#recHint",root),out=$("#recOut",root),tEl=$("#recT",root);
  let mode=null,dict=null,mr=null,chunks=[],stream=null,t0=0,tick=null,text="",partial="";
  const fmt=ms=>{const s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");};
  const startTick=()=>{t0=Date.now();tick=setInterval(()=>{if(!document.body.contains(tEl)){clearInterval(tick);stopAll();return;}tEl.textContent=fmt(Date.now()-t0);},500);};
  const ready=(label,m)=>{mode=m;btn.disabled=false;btn.textContent=label;};
  if(inArtifact){
    use("dictation").then(d=>{if(!d){btn.textContent="Not available here";hint.textContent="Recording isn't available in this view. Open the site from your GitHub Pages link or the local file to record audio, or just talk through it with the timer.";return;}
      dict=d;hint.textContent="Here your words are transcribed as you speak (no audio is kept), so you can read back what you said, your pace and your filler words.";ready("● Start talking","dict");
      d.onPartial(e=>{partial=e.text;render();});d.onFinal(e=>{text+=text?e.text:e.text.replace(/^\s+/,"");partial="";render();});
      d.onState(e=>{if(e.state==="idle"&&mode==="dict"&&tick){finish();if(e.reason&&!["stopped","viewer_stopped"].includes(e.reason))window.SQ.toast(e.reason==="not_granted"?"Microphone not allowed for this page.":"Dictation stopped ("+e.reason+").");}});});
  }else if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder){ready("● Record","audio");}
  else{btn.textContent="Not supported";hint.textContent="This browser can't record audio. Try Chrome or Edge.";}
  function render(){if(mode!=="dict")return;out.innerHTML=`<div class="transcript">${esc(text)}<span class="muted">${esc(partial?" "+partial:"")}</span></div>`;}
  function stopAll(){try{if(mr&&mr.state!=="inactive")mr.stop();}catch(e){}if(stream)stream.getTracks().forEach(t=>t.stop());if(dict&&dict.active())dict.stop().catch(()=>{});}
  function finish(){
    clearInterval(tick);tick=null;const ms=Date.now()-t0;btn.textContent=mode==="dict"?"● Start talking":"● Record";btn.classList.remove("rec-on");
    const mins=Math.max(ms/60000,0.01);let stats="";
    if(mode==="dict"){const words=(text.match(/\S+/g)||[]).length;const wpm=Math.round(words/mins);const fill=fillerCount(text);
      stats=`<div class="grid g4" style="margin:10px 0"><div class="card stat"><b>${fmt(ms)}</b><span>length</span></div><div class="card stat"><b>${words}</b><span>words</span></div><div class="card stat"><b>${wpm}</b><span>words / min ${wpm>170?"(slow down)":wpm<90&&words>30?"(a bit slow)":""}</span></div><div class="card stat"><b>${fill}</b><span>filler words</span></div></div>`;
      const pr=S().prob[pid];if(pr&&text.trim()){pr.spoken=(pr.spoken||[]).concat([{d:window.SQ.today(),text,ms}]).slice(-5);window.SQ.save();}
      out.innerHTML=`<div class="transcript">${esc(text)||'<span class="muted">Nothing was transcribed.</span>'}</div>${stats}`;}
    out.insertAdjacentHTML("beforeend",`<div class="eyebrow" style="margin-top:10px">Grade yourself while you ${mode==="dict"?"read it back":"listen"}</div>${CHECK.map((c,i)=>`<label class="chk"><input type="checkbox" data-rc="${i}"> ${esc(c)}</label>`).join("")}<div class="row" style="margin-top:8px"><button class="btn gold sm" id="recDone">Done reviewing +20 XP</button></div>`);
    $("#recDone",out).onclick=()=>{const n=$$("[data-rc]",out).filter(c=>c.checked).length;if(ms<60000){window.SQ.toast("Talk for at least a minute to earn the XP");return;}
      const k="rec:"+pid+":"+window.SQ.today();if(!S().revised)S().revised={};if(S().revised[k]){window.SQ.toast("Already counted today for this problem");return;}S().revised[k]=1;S().stats.recordings=(S().stats.recordings||0)+1;window.SQ.addXP(20,`Spoken walkthrough reviewed (${n}/${CHECK.length})`);$("#recDone",out).disabled=true;};
  }
  btn.onclick=()=>{
    if(mode==="dict"){
      if(tick){dict.stop().catch(()=>{});return;}
      text="";partial="";out.innerHTML="";
      dict.start().then(()=>{btn.textContent="■ Stop";btn.classList.add("rec-on");startTick();}).catch(e=>{window.SQ.toast(e&&e.code==="not_granted"?"Microphone not allowed for this page.":e&&e.code==="no_gesture"?"Click the button again.":"Couldn't start dictation"+(e&&e.code?" ("+e.code+")":""));});
      return;}
    if(mode==="audio"){
      if(tick){try{mr.stop();}catch(e){}return;}
      navigator.mediaDevices.getUserMedia({audio:true}).then(st=>{stream=st;chunks=[];mr=new MediaRecorder(st);mr.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
        mr.onstop=()=>{st.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type:mr.mimeType||"audio/webm"});const url=URL.createObjectURL(blob);
          finish();out.insertAdjacentHTML("afterbegin",`<audio controls src="${url}" style="width:100%;margin-top:10px"></audio><div class="row" style="margin:6px 0"><button class="btn sm" id="recSave">Save recording (.webm)</button><span class="small muted">Recordings stay on this device; nothing is uploaded.</span></div>`);
          $("#recSave",out).onclick=async()=>{const r=await window.SQ.saveFile(`walkthrough-${pid}-${window.SQ.today()}.webm`,blob);window.SQ.toast(r==="saved"?"Recording saved":r==="declined"?"Save cancelled":"Couldn't save here");};};
        mr.start();btn.textContent="■ Stop";btn.classList.add("rec-on");startTick();
      }).catch(()=>{window.SQ.toast("Microphone access was blocked. Allow it in the browser's site settings.");});
    }
  };
}

/* ---------- interviewer interruptions ---------- */
const GENERIC=["What happens if traffic suddenly doubles?","Why not use a NoSQL database here?","What's the single point of failure in your design?","How would you make this cheaper to run?","What happens if the cache goes down?","How do you handle one extremely popular user or item (a hot key)?","What does the user see if this service is slow?","Which part would you build first with two engineers?","How do you know this is working in production? What do you monitor?","What happens during a deploy of this service?","Estimate the storage you'll need for five years.","Where would you put a queue, and why?","How would you shard this data?","What consistency does this feature need, and why?","What happens if a client retries this request?","How do you protect this API from abuse?","How would this work across two regions?","What's the read:write ratio, and how does it change your design?","Walk me through one request end to end.","What would you change if latency had to be under 50 ms?"];
let intTimer=null;
function scheduleInterruptions(p,anchorSel){
  clearTimeout(intTimer);if(S().noInterrupt)return;
  const pool=window.SQ.shuffle((p&&p.sol&&p.sol.follow||[]).concat(GENERIC));let k=0;
  const next=()=>{const gap=window.SQ._intMs||((4+Math.random()*3)*60000);intTimer=setTimeout(()=>{if(!document.querySelector(anchorSel)){hideCard();return;}showCard(pool[k++%pool.length]);next();},gap);};
  next();
}
function hideCard(){const c=document.getElementById("interrupt");if(c)c.remove();}
function showCard(q){
  hideCard();const c=document.createElement("div");c.id="interrupt";c.setAttribute("role","alert");
  c.innerHTML=`<div class="eyebrow">The interviewer interrupts</div><p>${esc(q)}</p><div class="small muted">Answer out loud in under a minute, then carry on.</div><div class="row" style="margin-top:8px"><button class="btn primary sm" id="intOk">Answered +5 XP</button><button class="btn ghost sm" id="intSkip">Skip</button></div>`;
  document.body.appendChild(c);
  $("#intOk",c).onclick=()=>{S().stats.interrupts=(S().stats.interrupts||0)+1;window.SQ.addXP(5,"Handled an interruption",true);hideCard();};$("#intSkip",c).onclick=hideCard;
}
addEventListener("hashchange",()=>{clearTimeout(intTimer);hideCard();});
function toggleHTML(){return `<label class="chk small" style="margin-top:6px"><input type="checkbox" id="intOn" ${S().noInterrupt?"":"checked"}> Interviewer interruptions every few minutes once the timer starts</label>`;}
function wireToggle(root){const t=$("#intOn",root);if(t)t.onchange=()=>{S().noInterrupt=!t.checked;window.SQ.save();if(!t.checked){clearTimeout(intTimer);hideCard();}};}

const origProblem=V.problem;
V.problem=function(el,id){
  origProblem(el,id);
  const timerCard=$("#ptimer",el)&&$("#ptimer",el).closest(".card");if(!timerCard)return;
  timerCard.insertAdjacentHTML("afterend",recorderHTML());wireRecorder(el,id);
  timerCard.insertAdjacentHTML("beforeend",toggleHTML());wireToggle(el);
  const st=$("#pstart",el);if(st)st.addEventListener("click",()=>scheduleInterruptions(PROBLEMS.find(x=>x.id===id),"#ptimer"));
};
const origMock=V.mock;
V.mock=function(el){
  origMock(el);
  const tm=$("#mtimer",el);if(!tm)return;const card=tm.closest(".card")||tm.parentElement;
  const pid=V.mock.p;card.insertAdjacentHTML("afterend",recorderHTML());wireRecorder(el,pid);
  card.insertAdjacentHTML("beforeend",toggleHTML());wireToggle(el);
  const st=$("#mstart",el);if(st)st.addEventListener("click",()=>scheduleInterruptions(PROBLEMS.find(x=>x.id===pid),"#mtimer"));
};
/* keep V.mock's own state property working through the wrapper */
Object.defineProperty(V.mock,"p",{get(){return origMock.p;},set(v){origMock.p=v;}});

window.SQ.BADGES.push({id:"voice",n:"Thinking Out Loud",d:"Review 5 spoken walkthroughs",g:"🎙",tier:"s",t:()=>(S().stats.recordings||0)>=5});
})();
