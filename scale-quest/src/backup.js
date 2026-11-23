/* ===== Backups (file download/restore + weekly reminder) and install-as-app ===== */
(function(){
"use strict";
const {V,esc}=window.SQ;const S=()=>window.SQ.state;
const $=(s,r=document)=>r.querySelector(s);
const today=()=>window.SQ.today();
const inArtifact=!!(window.claude&&typeof window.claude.use==="function");

function snapshot(){
  const boards={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith("scalequest.board."))boards[k]=localStorage.getItem(k);}}catch(e){}
  return {app:"scale-quest",format:1,savedAt:new Date().toISOString(),state:S(),boards};
}
async function download(){
  const data=JSON.stringify(snapshot());
  const r=await window.SQ.saveFile(`scale-quest-backup-${today()}.json`,data);
  if(r==="saved"){S().lastBackup=today();window.SQ.save();window.SQ.toast("Backup saved. Keep the file somewhere safe (Drive, email to yourself).");}
  else if(r==="declined")window.SQ.toast("Backup cancelled");
  else window.SQ.toast("Couldn't save a file here. Use 'Copy backup code' instead.");
  return r;
}
function restoreFrom(text){
  let o;try{o=JSON.parse(text);}catch(e){window.SQ.toast("That file isn't a Scale Quest backup");return;}
  const state=o&&o.app==="scale-quest"?o.state:o;
  if(!state||typeof state.xp!=="number"){window.SQ.toast("That file isn't a Scale Quest backup");return;}
  try{localStorage.setItem("scalequest.v1",JSON.stringify(state));if(o.boards)Object.entries(o.boards).forEach(([k,v])=>{if(k.startsWith("scalequest.board."))localStorage.setItem(k,v);});}
  catch(e){window.SQ.toast("Couldn't write to browser storage");return;}
  location.reload();
}
window.SQ.downloadBackup=download;

/* install as an app (browsers that support it, outside the artifact viewer) */
let installEvt=null;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvt=e;const b=document.getElementById("installBtn");if(b)b.hidden=false;});

/* Trophies: backup + install controls */
const origTrophies=V.trophies;
V.trophies=function(el){
  origTrophies(el);
  const card=$("#exp",el)&&$("#exp",el).closest(".card");if(!card)return;
  card.insertAdjacentHTML("beforeend",`<div class="row" style="margin-top:10px"><button class="btn sm primary" id="dlBackup">Download backup file</button><label class="btn sm" for="rsFile" style="cursor:pointer">Restore from file</label><input type="file" id="rsFile" accept=".json,application/json" hidden></div>
  <p class="small muted" style="margin:6px 0 0">${S().lastBackup?`Last file backup: ${S().lastBackup}.`:"No file backup yet."} The file includes your whiteboards.</p>
  ${inArtifact?"":`<div class="row" style="margin-top:10px"><button class="btn sm" id="installBtn" ${installEvt?"":"hidden"}>Install as an app</button></div><p class="small muted" style="margin:4px 0 0">On your phone, open the site in Chrome and choose <b>Add to Home screen</b> (Safari: Share → Add to Home Screen). It then works offline.</p>`}`);
  $("#dlBackup",el).onclick=download;
  $("#rsFile",el).onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;f.text().then(restoreFrom);};
  const ib=$("#installBtn",el);if(ib)ib.onclick=async()=>{if(!installEvt)return;installEvt.prompt();await installEvt.userChoice.catch(()=>null);installEvt=null;ib.hidden=true;};
};

/* Home: weekly reminder */
const origHome=V.home;
V.home=function(el){
  origHome(el);
  const last=S().lastBackup;const days=last?Math.round((window.SQ.dateOf(today())-window.SQ.dateOf(last))/864e5):null;
  if(S().xp<100||(days!==null&&days<7))return;
  const hero=$(".hero",el);if(!hero)return;
  hero.insertAdjacentHTML("afterend",`<div class="card rv-banner calm" style="border-left-color:var(--w2);background:linear-gradient(90deg,color-mix(in srgb,var(--w2) 12%,var(--panel)),var(--panel) 55%)"><span class="rv-ico"><svg viewBox="0 0 24 24" style="stroke:var(--w2)"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg></span><span><b>${last?`Last backup was ${days} days ago`:"Back up your progress"}</b><span class="small muted" style="display:block">Progress lives only in this browser. A backup file takes a second and survives a cleared browser or a new phone.</span></span><button class="btn sm" id="homeBackup">Download backup</button></div>`);
  $("#homeBackup",el).onclick=async()=>{const r=await download();if(r==="saved")window.SQ.render();};
};
})();
