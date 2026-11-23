/* ===== Whiteboard: Excalidraw + architecture stencil ===== */
(function(){
"use strict";
const {V,esc}=window.SQ;const S=()=>window.SQ.state;
const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const LIBS=["https://unpkg.com/react@18.2.0/umd/react.production.min.js","https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js","https://unpkg.com/@excalidraw/excalidraw@0.17.6/dist/excalidraw.production.min.js"];
let loading=null,root=null,api=null,saveT=null,curId=null,mountedId=null;
function loadScript(src){return new Promise((ok,bad)=>{const s=document.createElement("script");s.src=src;s.crossOrigin="anonymous";s.onload=ok;s.onerror=()=>bad(new Error("Could not load "+src));document.head.appendChild(s);});}
function loadLibs(){if(window.ExcalidrawLib)return Promise.resolve();if(!loading){window.EXCALIDRAW_ASSET_PATH="https://unpkg.com/@excalidraw/excalidraw@0.17.6/dist/";loading=LIBS.reduce((p,u)=>p.then(()=>loadScript(u)),Promise.resolve());}return loading;}

const COLORS={client:["#1971c2","#a5d8ff"],edge:["#0c8599","#96f2d7"],svc:["#e8590c","#ffec99"],db:["#6741d9","#d0bfff"],cache:["#c2255c","#fcc2d7"],queue:["#e67700","#ffd8a8"],ext:["#0b7285","#99e9f2"],note:["#495057","#f1f3f5"]};
const STENCIL=[["Client","web / mobile","client","ellipse"],["Load balancer","L7","edge","diamond"],["API gateway","auth · rate limit","edge"],["CDN","edge cache","edge"],["Service","stateless","svc"],["Worker","async jobs","svc"],["SQL DB","Postgres","db"],["NoSQL DB","Cassandra / Dynamo","db"],["Cache","Redis","cache"],["Queue","Kafka / SQS","queue"],["Object store","S3","db"],["Search index","Elasticsearch","db"],["WebSocket gw","persistent conns","edge"],["LLM","via gateway","ext"],["Vector DB","pgvector","db"],["External API","PSP / SMS","ext"]];

/* storage: board scenes live under their own keys so the main state stays small */
const sceneKey=id=>"scalequest.board."+id;
function loadScene(id){try{return JSON.parse(localStorage.getItem(sceneKey(id))||"null");}catch(e){return null;}}
function storeScene(id,data){try{localStorage.setItem(sceneKey(id),JSON.stringify(data));return true;}catch(e){window.SQ.toast("Couldn't save: browser storage is full or blocked");return false;}}

function uid(){return Math.random().toString(36).slice(2,9);}
function center(){if(!api)return{x:0,y:0};const a=api.getAppState();const z=(a.zoom&&a.zoom.value)||1;return{x:-a.scrollX+a.width/2/z,y:-a.scrollY+a.height/2/z};}
function skel(kind,label,sub,x,y,shape,id){const [st,bg]=COLORS[kind]||COLORS.svc;return{type:shape||"rectangle",id:id||("s"+uid()),x,y,width:shape==="diamond"?170:170,height:shape==="diamond"?90:72,strokeColor:st,backgroundColor:bg,fillStyle:"solid",strokeWidth:2,roughness:1,roundness:shape?null:{type:3},label:{text:sub?label+"\n"+sub:label,fontSize:16,strokeColor:"#1e1e1e"}};}
function addElements(skels){
  if(!api||!window.ExcalidrawLib)return;
  const conv=window.ExcalidrawLib.convertToExcalidrawElements(skels,{regenerateIds:false});
  api.updateScene({elements:[...api.getSceneElements(),...conv]});
}
function addStencil(i){const [l,s,k,sh]=STENCIL[i];const c=center();addElements([skel(k,l,s,c.x-85+(Math.random()-.5)*80,c.y-36+(Math.random()-.5)*80,sh)]);}
function specToSkels(spec,ox,oy){
  const p="r"+uid()+"_";const out=[];const sx=1.55,sy=1.6;
  spec.n.forEach(([id,x,y,label,sub,kind])=>out.push(Object.assign(skel(kind,label,sub,ox+x*sx-85,oy+y*sy-36,kind==="client"?"ellipse":null,p+id),{customData:{sq:"ref"}})));
  (spec.e||[]).forEach(([a,b,label,dash])=>{const A=spec.n.find(n=>n[0]===a),B=spec.n.find(n=>n[0]===b);if(!A||!B)return;
    out.push({type:"arrow",customData:{sq:"ref"},x:ox+A[1]*sx,y:oy+A[2]*sy,width:(B[1]-A[1])*sx,height:(B[2]-A[2])*sy,strokeColor:"#495057",strokeStyle:dash?"dashed":"solid",start:{id:p+a},end:{id:p+b},label:label?{text:label,fontSize:14}:undefined});});
  return out;
}
function templateSkels(p,c){
  const x=c.x-700,y=c.y-320;const out=[];
  out.push({type:"text",x,y:y-70,text:p?p.title:"Design practice",fontSize:36,strokeColor:"#1e1e1e"});
  const cols=[["1 · Requirements","Functional:\n- \n- \n- \nNon-functional:\n- scale:\n- latency:\n- consistency:"],["2 · Estimates","DAU:\nQPS avg / peak:\nStorage / year:\nRead:write ="],["3 · Entities + 4 · API","Entities:\n\nPOST /v1/...\nGET  /v1/..."]];
  cols.forEach(([h,b],i)=>{out.push({type:"rectangle",x,y:y+i*210,width:380,height:190,strokeColor:"#868e96",backgroundColor:"#f8f9fa",fillStyle:"solid",roundness:{type:3},strokeStyle:"dashed"});out.push({type:"text",x:x+14,y:y+i*210+10,text:h,fontSize:20,strokeColor:"#1971c2"});out.push({type:"text",x:x+14,y:y+i*210+44,text:b,fontSize:16,strokeColor:"#495057"});});
  out.push({type:"rectangle",x:x+420,y,width:980,height:610,strokeColor:"#868e96",backgroundColor:"transparent",strokeStyle:"dashed",roundness:{type:3}});
  out.push({type:"text",x:x+436,y:y+10,text:"5 · High-level design  (walk one request end to end)",fontSize:20,strokeColor:"#1971c2"});
  out.push({type:"text",x:x+420,y:y+630,text:"6 · Deep dives:  1)            2)            3)\n7 · Bottlenecks + monitoring:",fontSize:18,strokeColor:"#495057"});
  return out.map(o=>Object.assign(o,{customData:{sq:"frame"}}));
}

function currentProblem(){const id=V.board.pid;return PROBLEMS.find(p=>p.id===id)||null;}

V.board=function(el){
  if(window.SQ.boardProblem){V.board.pid=window.SQ.boardProblem;window.SQ.boardProblem=null;}
  const boards=S().boards;let ids=Object.keys(boards).sort((a,b)=>(boards[b].updated||"")>(boards[a].updated||"")?1:-1);
  if(!curId||!boards[curId]){curId=ids[0]||null;}
  if(!curId){curId="b"+uid();const p0=PROBLEMS.find(x=>x.id===V.board.pid);boards[curId]={name:p0?p0.title:"My first board",pid:V.board.pid||"",updated:new Date().toISOString(),fresh:!!p0};window.SQ.save();}
  if(V.board.pid&&boards[curId].pid!==V.board.pid&&!V.board.keep){
    // jumped here from a problem: open (or create) that problem's board
    const existing=ids.find(i=>boards[i].pid===V.board.pid);
    if(existing)curId=existing;else{curId="b"+uid();const p=PROBLEMS.find(x=>x.id===V.board.pid);boards[curId]={name:p?p.title:"New board",pid:V.board.pid,updated:new Date().toISOString(),fresh:true};window.SQ.save();}
  }
  V.board.keep=false;
  ids=Object.keys(boards).sort((a,c)=>(boards[c].updated||"")>(boards[a].updated||"")?1:-1);
  const b=boards[curId];V.board.pid=b.pid||"";const p=currentProblem();
  el.innerHTML=`<div class="page-head"><div><div class="eyebrow">Whiteboard · Excalidraw</div><h1>Draw it like the interview</h1><p>Practise architecture diagrams the way you will on the day: boxes, arrows, labels and a running narration. Drop components from the stencil, load a practice frame, then compare against the reference.</p></div>
  <div class="row"><select id="wbPick" aria-label="Choose board" style="width:auto;margin:0">${ids.map(i=>`<option value="${i}" ${i===curId?"selected":""}>${esc(boards[i].name)}</option>`).join("")}</select><button class="btn sm" id="wbNew">New board</button></div></div>
  <div class="wb-shell">
    <div class="wb-canvas" id="wbHost"><div class="wb-loading" id="wbLoad"><b>Loading Excalidraw…</b><span class="small">First load downloads the editor (~2 MB) and is cached after that.</span></div></div>
    <aside class="wb-side">
      <div class="card"><div class="row" style="justify-content:space-between"><b>Board</b><span class="small muted" id="wbSaved">${b.updated?"Saved "+new Date(b.updated).toLocaleString():""}</span></div>
        <label for="wbName" class="small muted">Name</label><input id="wbName" type="text" value="${esc(b.name)}">
        <label for="wbProb" class="small muted" style="display:block;margin-top:8px">Problem</label><select id="wbProb"><option value="">Free practice</option>${PROBLEMS.map(x=>`<option value="${x.id}" ${x.id===b.pid?"selected":""}>${esc(x.title)}</option>`).join("")}</select>
        <div class="row" style="margin-top:10px"><button class="btn gold sm" id="wbSave">Save +40 XP</button><button class="btn sm" id="wbPng">Export PNG</button><button class="btn sm ghost" id="wbDel" style="color:var(--bad)">Delete</button></div></div>
      <div class="card"><b>Architecture stencil</b><p class="small muted" style="margin:2px 0 8px">Click to drop at the centre of your view, then drag. Draw arrows with <span class="kbd">A</span>, text with <span class="kbd">T</span>.</p>
        <div class="stencil">${STENCIL.map((s,i)=>{const [st,bg]=COLORS[s[2]];return `<button data-s="${i}" style="--sc:${st};--sb:${bg};color:#1e1e1e">${esc(s[0])}</button>`;}).join("")}</div></div>
      <div class="card"><b>Templates</b><div class="row" style="margin-top:8px"><button class="btn sm" id="wbFrame">Practice frame</button><button class="btn sm" id="wbRef" ${p&&p.sol.dia?"":"disabled"}>Reference diagram</button></div><p class="small muted" style="margin:6px 0 0">Draw yours first. The reference lands to the right of your drawing so you can compare.</p></div>
      <div class="card"><div class="row" style="justify-content:space-between"><b>Timer</b><span class="timer" id="wbTimer" style="font-size:1.2rem">40:00</span></div><div class="row" style="margin-top:6px"><button class="btn sm" data-m="10">10 min</button><button class="btn sm" data-m="25">25 min</button><button class="btn sm primary" data-m="40">40 min</button></div></div>
      ${p?`<div class="card"><b>${esc(p.title)}</b><p class="small" style="margin:4px 0">${p.prompt}</p><a class="small" href="#problem-${p.id}">Open problem</a></div>`:""}
      <div class="card"><b>A good diagram has…</b><ul class="check small">${["Client → edge (LB/gateway/CDN) → services → data","Every functional requirement traceable to a path","Read path and write path both visible","Async work behind a queue","Caches labelled with what they cache","Databases labelled with type and key","No single point of failure left unexplained","Arrows labelled with the call or event"].map((t,i)=>`<li><label><input type="checkbox" style="accent-color:var(--accent)"> ${t}</label></li>`).join("")}</ul></div>
      <div class="card small"><b>Shortcuts</b><div class="muted" style="margin-top:4px"><span class="kbd">R</span> rectangle · <span class="kbd">O</span> ellipse · <span class="kbd">A</span> arrow · <span class="kbd">T</span> text · <span class="kbd">V</span> select · <span class="kbd">H</span> hand · <span class="kbd">Ctrl Z</span> undo · <span class="kbd">Shift 1</span> fit to screen · double-click a shape to type a label</div></div>
    </aside></div>`;
  $("#wbPick").onchange=e=>{flush();curId=e.target.value;V.board.keep=true;V.board.pid=boards[curId].pid;window.SQ.render();};
  $("#wbNew").onclick=()=>{flush();curId="b"+uid();boards[curId]={name:"Board "+(Object.keys(boards).length+1),pid:"",updated:new Date().toISOString()};V.board.pid="";V.board.keep=true;window.SQ.save();window.SQ.render();};
  $("#wbName").oninput=e=>{b.name=e.target.value||"Untitled";window.SQ.save();const o=$(`#wbPick option[value="${curId}"]`);if(o)o.textContent=b.name;};
  $("#wbProb").onchange=e=>{b.pid=e.target.value;V.board.pid=b.pid;V.board.keep=true;window.SQ.save();flush();window.SQ.render();};
  $("#wbSave").onclick=()=>doSave(true);
  $("#wbPng").onclick=exportPng;
  let delArmed=false;$("#wbDel").onclick=e=>{if(!delArmed){delArmed=true;e.target.textContent="Click again to delete";setTimeout(()=>{delArmed=false;if(e.target)e.target.textContent="Delete";},2500);return;}
    try{localStorage.removeItem(sceneKey(curId));}catch(x){}delete boards[curId];curId=null;window.SQ.save();api=null;window.SQ.render();};
  $$("[data-s]",el).forEach(bt=>bt.onclick=()=>addStencil(+bt.dataset.s));
  $("#wbFrame").onclick=()=>addElements(templateSkels(p,center()));
  $("#wbRef").onclick=()=>{if(!p||!p.sol.dia)return;const els=api?api.getSceneElements():[];let maxX=0;els.forEach(e=>{maxX=Math.max(maxX,e.x+(e.width||0));});const c=center();addElements([{type:"text",x:(els.length?maxX+120:c.x-500),y:c.y-330,text:"Reference: "+p.title,fontSize:24,strokeColor:"#2f9e44",customData:{sq:"ref"}},...specToSkels(p.sol.dia,(els.length?maxX+120:c.x-500),c.y-280)]);window.SQ.toast("Reference added. Compare it with yours.");};
  $$("[data-m]",el).forEach(bt=>bt.onclick=()=>window.SQ.startTimer("wbTimer",+bt.dataset.m));
  mount(b);
};

function mount(b){
  loadLibs().then(()=>{
    const host=$("#wbHost");if(!host)return;
    const L=window.ExcalidrawLib;const R=window.React;
    mountedId=curId;const saved=loadScene(curId);
    const dark=document.documentElement.getAttribute("data-theme")==="dark"||(document.documentElement.getAttribute("data-theme")!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);
    host.innerHTML="";
    root=window.ReactDOM.createRoot(host);
    root.render(R.createElement(L.Excalidraw,{
      excalidrawAPI:a=>{api=a;if(b.fresh){delete b.fresh;window.SQ.save();setTimeout(()=>{const p=currentProblem();addElements(templateSkels(p,center()));},300);}},
      initialData:saved?{elements:saved.elements,files:saved.files||{},appState:{viewBackgroundColor:saved.bg||"#ffffff"},scrollToContent:true}:{appState:{viewBackgroundColor:"#ffffff"}},
      theme:dark?"dark":"light",
      onChange:()=>{clearTimeout(saveT);saveT=setTimeout(()=>doSave(false),1500);},
      UIOptions:{canvasActions:{loadScene:true,saveToActiveFile:false,export:{saveFileToDisk:true}}}
    }));
  }).catch(err=>{
    const l=$("#wbLoad");if(l)l.innerHTML=`<b>The Excalidraw editor couldn't load here.</b><span class="small">${esc(err.message)}. You may be offline, or this viewer blocks the editor's files. Open the downloaded HTML file in Chrome, or use <a href="https://excalidraw.com/" target="_blank" rel="noopener">excalidraw.com</a> directly. The stencil and templates need the embedded editor.</span>`;
  });
}
function flush(){if(api){clearTimeout(saveT);doSave(false);}}
function doSave(manual){
  const bid=mountedId;if(!api||!bid||!S().boards[bid])return;
  const els=api.getSceneElements();const files=api.getFiles?api.getFiles():{};
  const ok=storeScene(bid,{elements:els,files,bg:api.getAppState().viewBackgroundColor});
  if(!ok)return;
  const b=S().boards[bid];b.updated=new Date().toISOString();
  const s=$("#wbSaved");if(s)s.textContent="Saved "+new Date(b.updated).toLocaleTimeString();
  if(manual){
    if(els.length<3){window.SQ.toast("Draw at least a few components before claiming XP");window.SQ.save();return;}
    const k=window.SQ.today();
    if(b.xpDay!==k){b.xpDay=k;S().stats.boardsSaved++;window.SQ.bump("board");window.SQ.addXP(40,"Diagram saved");}
    else{window.SQ.save();window.SQ.toast("Saved (XP for this board already claimed today)");}
  }else window.SQ.save();
}
window.SQ.wbElements=()=>api?api.getSceneElements():[];
window.SQ.wbPngUrl=()=>{if(!api||!window.ExcalidrawLib)return Promise.resolve(null);const els=api.getSceneElements();if(!els.length)return Promise.resolve(null);
  return window.ExcalidrawLib.exportToBlob({elements:els,files:api.getFiles(),appState:{...api.getAppState(),exportBackground:true,exportWithDarkMode:false},mimeType:"image/png"}).then(b=>URL.createObjectURL(b)).catch(()=>null);};
window.SQ.wbProblem=()=>currentProblem();window.SQ.wbBoardId=()=>curId;
function exportPng(){
  if(!api||!window.ExcalidrawLib)return;
  const els=api.getSceneElements();if(!els.length){window.SQ.toast("Nothing to export yet");return;}
  window.ExcalidrawLib.exportToBlob({elements:els,files:api.getFiles(),appState:{...api.getAppState(),exportBackground:true,exportWithDarkMode:false},mimeType:"image/png",exportPadding:24}).then(blob=>{
    const url=URL.createObjectURL(blob);const name=(S().boards[curId].name||"board").replace(/[^\w-]+/g,"_")+".png";
    const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    window.SQ.modal(`<div class="eyebrow">Export</div><h2 style="font-size:1.2rem">${esc(name)}</h2><img src="${url}" alt="Exported diagram" style="max-height:50vh;border:1px solid var(--line);border-radius:10px;background:#fff"><p class="small muted">If the download didn't start, right-click the image and choose "Save image as".</p>`);
  }).catch(()=>window.SQ.toast("Export failed"));
}
window.SQ.leaveBoard=function(){if(root){flush();try{root.unmount();}catch(e){}root=null;api=null;}};
addEventListener("beforeunload",()=>flush());
})();
