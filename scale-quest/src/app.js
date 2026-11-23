/* ===== Scale Quest engine ===== */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const DAY=86400000;
function keyOf(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function dateOf(k){const [y,m,d]=k.split("-").map(Number);return new Date(y,m-1,d);}
function addDays(k,n){const d=dateOf(k);d.setDate(d.getDate()+n);return keyOf(d);}
const today=()=>keyOf(new Date());
function hash(str){let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let s=seed||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return ((s>>>0)%100000)/100000;};}
function shuffle(a,r=Math.random){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

/* ---------- state ---------- */
const KEY="scalequest.v1";
function fresh(){return{xp:0,log:{},frozen:{},freezes:0,lastFreezeStreak:0,goal:50,topics:{},revised:{},srs:{},sheets:{},qDay:{},day:{},prob:{},mocks:[],cards:{},plan:{},lld:{},boards:{},badges:{},stats:{quizRight:0,quizAns:0,combo:0,maxCombo:0,cards:0,drills:0,drillsRight:0,attempts:0,boardsSaved:0,revPass:0,revMiss:0},theme:"system",created:today()};}
let S;
try{S=Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)||"{}"));S.stats=Object.assign(fresh().stats,S.stats||{});}catch(e){S=fresh();}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
window.SQ={get state(){return S;},save,esc,keyOf,today,addDays};

/* ---------- spaced review: topics return after 1, 3, 7, 16, 35 days ---------- */
const SRS_STEPS=[1,3,7,16,35];
function srsEnroll(id,from){if(!S.srs[id])S.srs[id]={step:0,due:addDays(from||today(),SRS_STEPS[0]),hist:[]};}
function srsSync(){Object.keys(S.topics).forEach(id=>{if(TOPICS.some(t=>t.id===id))srsEnroll(id,S.topics[id]);});}
function srsDue(){const t=today();return TOPICS.filter(x=>{const r=S.srs[x.id];return r&&!r.done&&r.due<=t;});}
function srsGrade(id,pass){
  const r=S.srs[id];if(!r)return;const t=today();r.hist.push({d:t,p:pass?1:0,s:r.step});r.last=t;
  if(pass){S.stats.revPass++;if(r.step>=SRS_STEPS.length-1){r.done=t;r.due=null;r.step=SRS_STEPS.length;}else{r.step++;r.due=addDays(t,SRS_STEPS[r.step]);}}
  else{S.stats.revMiss++;r.step=0;r.due=addDays(t,1);}
  save();
}
Object.assign(window.SQ,{SRS_STEPS,srsEnroll,srsDue,srsGrade});

/* ---------- levels ---------- */
const TITLES=["","Hello-World Intern","Request Rookie","Cache Cadet","Index Initiate","Load Balancer","Queue Ranger","Replica Knight","Shard Strategist","Consensus Sage","Scale Architect","Staff Engineer","Principal Wizard","Distributed Legend"];
const need=L=>75*(L-1)*L; // xp to reach level L
function levelOf(xp){let L=1;while(xp>=need(L+1))L++;return L;}
function titleOf(L){return TITLES[Math.min(L,TITLES.length-1)];}

/* ---------- streak ---------- */
const active=k=>(S.log[k]||0)>=S.goal;
function streakInfo(){
  const t=today();let d=active(t)?t:addDays(t,-1);let n=0,guard=0;
  while((active(d)||S.frozen[d])&&guard<4000){if(active(d))n++;d=addDays(d,-1);guard++;}
  return{n,todayDone:active(t)};
}
function applyFreezes(){
  const t=today();let d=addDays(t,-1);const gap=[];
  while(!active(d)&&!S.frozen[d]&&gap.length<5){gap.push(d);d=addDays(d,-1);}
  if(!gap.length||gap.length>S.freezes)return;
  // only spend freezes if there was a streak before the gap
  if(!active(d))return;
  gap.forEach(g=>S.frozen[g]=1);S.freezes-=gap.length;save();
  setTimeout(()=>toast(`Streak freeze used for ${gap.length} missed day${gap.length>1?"s":""}. Your streak survived.`),600);
}

/* ---------- day counters + quests ---------- */
function dayC(){const t=today();if(S.day.date!==t)S.day={date:t,topic:0,quiz:0,cards:0,gym:0,problem:0,board:0,plan:0,bonus:false};return S.day;}
const QUEST_POOL={
  topic:{t:"Clear, revise or review 1 topic",n:1,href:"#review"},
  quiz:{t:"Answer 10 quiz questions right",n:10,href:"#quiz"},
  cards:{t:"Review 15 flashcards",n:15,href:"#cards"},
  gym:{t:"Solve 3 estimation drills",n:3,href:"#gym"},
  problem:{t:"Attempt 1 design problem or mock",n:1,href:"#arena"},
  board:{t:"Save 1 whiteboard diagram",n:1,href:"#board"},
  plan:{t:"Tick today's planner task",n:1,href:"#plan"}
};
function questsToday(){
  const r=rng(hash(today()));const keys=shuffle(["topic","quiz","cards","gym","problem","board"],r).slice(0,2);
  return ["plan",...keys];
}
function checkQuests(){
  const c=dayC();const qs=questsToday();
  if(!c.bonus&&qs.every(k=>c[k]>=QUEST_POOL[k].n)){c.bonus=true;addXP(75,"All daily quests done",true);toast("Daily quests complete! +75 XP bonus","gold");confetti();}
}
function bump(k,n=1){dayC()[k]+=n;save();checkQuests();}

/* ---------- XP ---------- */
let lastLevel=null;
function addXP(n,why,silent){
  const before=levelOf(S.xp);const wasDone=active(today());
  S.xp+=n;S.log[today()]=(S.log[today()]||0)+n;
  // freeze rewards each 7-day milestone
  const st=streakInfo();
  if(st.n>0&&st.n%7===0&&S.lastFreezeStreak!==st.n&&S.freezes<2){S.freezes++;S.lastFreezeStreak=st.n;toast("7-day milestone: you earned a streak freeze","gold");}
  save();
  if(!silent)toast(`+${n} XP · ${why}`);
  if(!wasDone&&active(today())){toast(`Daily goal hit! Streak: ${st.n} day${st.n===1?"":"s"}`,"gold");confetti(80);}
  const after=levelOf(S.xp);
  if(after>before)levelUp(after);
  checkBadges();renderHud();
}
window.SQ.addXP=addXP;window.SQ.bump=bump;

/* ---------- toasts, confetti, modal ---------- */
function toast(msg,kind){const el=document.createElement("div");el.className="toast"+(kind?" "+kind:"");el.textContent=msg;$("#toasts").appendChild(el);setTimeout(()=>el.remove(),3400);}
window.SQ.toast=toast;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
function confetti(count=140){
  if(reduce)return;const c=$("#confetti");const x=c.getContext("2d");c.width=innerWidth;c.height=innerHeight;
  const cols=["#0f8f85","#2f6fdb","#e3a008","#f2542d","#7c3aed","#db2777","#1a8f4c"];
  const P=Array.from({length:count},()=>({x:innerWidth/2+(Math.random()-.5)*200,y:innerHeight*.35,vx:(Math.random()-.5)*14,vy:-Math.random()*13-4,s:Math.random()*7+4,c:cols[Math.floor(Math.random()*cols.length)],r:Math.random()*6,vr:(Math.random()-.5)*.3}));
  let f=0;(function tick(){x.clearRect(0,0,c.width,c.height);P.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore();});if(++f<130)requestAnimationFrame(tick);else x.clearRect(0,0,c.width,c.height);})();
}
window.SQ.confetti=confetti;
function modal(html){const m=$("#modal");m.innerHTML=`<div class="modal-bg"><div class="modal">${html}<div class="row" style="justify-content:center;margin-top:16px"><button class="btn primary" id="mclose">Keep going</button></div></div></div>`;$("#mclose").onclick=()=>m.innerHTML="";$(".modal-bg").onclick=e=>{if(e.target.classList.contains("modal-bg"))m.innerHTML="";};$("#mclose").focus();}
function levelUp(L){confetti(200);modal(`<div class="eyebrow">Level up</div><h2>Level ${L}</h2><p style="font-size:1.1rem;margin:0">You are now a <b>${esc(titleOf(L))}</b>.</p><p class="muted small">Next level at ${need(L+1).toLocaleString()} XP.</p>`);}

/* ---------- badges ---------- */
const worldDone=w=>TOPICS.filter(t=>t.w===w).every(t=>S.topics[t.id]);
const BADGES=[
  {id:"first",n:"First Packet",d:"Clear your first topic",g:"1",tier:"b",t:()=>Object.keys(S.topics).length>=1},
  {id:"t10",n:"Ten Hops",d:"Clear 10 topics",g:"10",tier:"s",t:()=>Object.keys(S.topics).length>=10},
  {id:"tall",n:"Full Stack Mind",d:"Clear every topic",g:"∞",tier:"g",t:()=>TOPICS.every(t=>S.topics[t.id])},
  ...WORLDS.map(w=>({id:"w"+w.n,n:w.badge,d:`Clear World ${w.n}: ${w.name}`,g:"W"+w.n,tier:"w",hue:w.c,t:()=>worldDone(w.n)})),
  {id:"s3",n:"Warm Cache",d:"3-day streak",g:"3",tier:"b",t:()=>streakInfo().n>=3},
  {id:"s7",n:"Week of Uptime",d:"7-day streak",g:"7",tier:"s",t:()=>streakInfo().n>=7},
  {id:"s30",n:"Five Nines",d:"30-day streak",g:"30",tier:"g",t:()=>streakInfo().n>=30},
  {id:"s100",n:"Zero Downtime",d:"100-day streak",g:"100",tier:"g",t:()=>streakInfo().n>=100},
  {id:"q50",n:"Quick Lookup",d:"50 quiz answers right",g:"50",tier:"b",t:()=>S.stats.quizRight>=50},
  {id:"q250",n:"Index Scan",d:"250 quiz answers right",g:"250",tier:"g",t:()=>S.stats.quizRight>=250},
  {id:"combo10",n:"Hot Path",d:"10 right in a row",g:"x10",tier:"s",t:()=>S.stats.maxCombo>=10},
  {id:"p1",n:"First Blueprint",d:"Submit your first design attempt",g:"P",tier:"b",t:()=>S.stats.attempts>=1},
  {id:"p10",n:"Battle Tested",d:"Attempt 10 different problems",g:"P10",tier:"s",t:()=>Object.values(S.prob).filter(p=>p.attempts).length>=10},
  {id:"pall",n:"Arena Champion",d:"Attempt every problem in the Arena",g:"★",tier:"g",t:()=>PROBLEMS.every(p=>S.prob[p.id]&&S.prob[p.id].attempts)},
  {id:"m1",n:"Under the Clock",d:"Finish a timed mock",g:"M",tier:"b",t:()=>S.mocks.length>=1},
  {id:"m5",n:"Mock Machine",d:"Finish 5 timed mocks",g:"M5",tier:"s",t:()=>S.mocks.length>=5},
  {id:"hire",n:"Strong Hire",d:"Score 13+/16 on a mock",g:"SH",tier:"g",t:()=>S.mocks.some(m=>m.total>=13)},
  {id:"c100",n:"Spaced Out",d:"Review 100 flashcards",g:"100",tier:"s",t:()=>S.stats.cards>=100},
  {id:"g10",n:"Napkin Math",d:"Get 10 estimation drills right",g:"≈",tier:"s",t:()=>S.stats.drillsRight>=10},
  {id:"b1",n:"First Sketch",d:"Save a whiteboard diagram",g:"✎",tier:"b",t:()=>S.stats.boardsSaved>=1},
  {id:"b10",n:"Diagram Artist",d:"Save 10 whiteboard diagrams",g:"✎10",tier:"g",t:()=>S.stats.boardsSaved>=10},
  {id:"lld5",n:"Class Act",d:"Finish 5 LLD problems",g:"LLD",tier:"s",t:()=>Object.keys(S.lld).length>=5},
  {id:"week",n:"Week Shipped",d:"Tick all 7 days of a planner week",g:"7d",tier:"s",t:()=>WEEKS.some((w,i)=>w.days.every((_,j)=>S.plan[i*7+j]))},
  {id:"rv1",n:"Recall Ready",d:"Pass your first spaced review",g:"R",tier:"b",t:()=>S.stats.revPass>=1},
  {id:"rv25",n:"Long-Term Storage",d:"Pass 25 spaced reviews",g:"R25",tier:"s",t:()=>S.stats.revPass>=25},
  {id:"rvm",n:"Persisted to Disk",d:"A topic survives its 35-day review",g:"35d",tier:"g",t:()=>Object.values(S.srs).some(r=>r.done)},
  {id:"sheets",n:"Cheat Sheet",d:"Mark all 8 revision modules revised",g:"8/8",tier:"s",t:()=>WORLDS.every(w=>S.sheets[w.n])},
  {id:"x1k",n:"Kilo XP",d:"Earn 1,000 XP",g:"1K",tier:"b",t:()=>S.xp>=1000},
  {id:"x10k",n:"Ten Thousand Requests",d:"Earn 10,000 XP",g:"10K",tier:"g",t:()=>S.xp>=10000},
  {id:"owl",n:"Night Owl",d:"Study after 11 pm",g:"☾",tier:"b",t:()=>new Date().getHours()>=23},
  {id:"lark",n:"Early Bird",d:"Study before 7 am",g:"☀",tier:"b",t:()=>new Date().getHours()<7}
];
function checkBadges(){
  BADGES.forEach(b=>{if(!S.badges[b.id]){let ok=false;try{ok=b.t();}catch(e){}if(ok){S.badges[b.id]=today();save();setTimeout(()=>{toast(`Badge unlocked: ${b.n}`,"gold");confetti(90);},300);}}});
}
function badgeSvg(b,locked){
  const fills={b:["#d08a4e","#9c5a28"],s:["#c9d1de","#7d8aa0"],g:["#f5c84a","#c48a00"],w:[b.hue||"#0f8f85",b.hue||"#0f8f85"]};
  const [a,c]=fills[b.tier]||fills.b;const id="bg"+b.id;
  return `<svg viewBox="0 0 64 72" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><path d="M32 3 59 18v36L32 69 5 54V18z" fill="url(#${id})" stroke="rgba(0,0,0,.15)" stroke-width="1.5"/><path d="M32 11 52 22v28L32 61 12 50V22z" fill="rgba(255,255,255,.18)"/><text x="32" y="41" text-anchor="middle" font-family="Bricolage Grotesque,system-ui,sans-serif" font-weight="800" font-size="${b.g.length>2?13:17}" fill="#fff">${esc(locked?"?":b.g)}</text></svg>`;
}

/* ---------- diagrams ---------- */
const KIND={client:"client",edge:"edge",svc:"svc",db:"db",cache:"cache",queue:"queue",ext:"ext"};
function diagram(spec,cap){
  if(!spec)return"";
  const W=spec.w||760,H=spec.h||340,bw=spec.bw||128;const nodes={};
  spec.n.forEach(([id,x,y,label,sub,kind])=>nodes[id]={x,y,label,sub,kind:KIND[kind]||"svc",h:sub?48:38});
  let out=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cap||"Architecture diagram")}"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" style="fill:var(--muted)"/></marker></defs>`;
  (spec.e||[]).forEach(([a,b,label,dash,both])=>{
    const A=nodes[a],B=nodes[b];if(!A||!B)return;
    const dx=B.x-A.x,dy=B.y-A.y;
    const clip=(N,sx,sy)=>{const hw=bw/2+3,hh=N.h/2+3;const t=Math.min(Math.abs(sx)>1e-6?hw/Math.abs(sx):1e9,Math.abs(sy)>1e-6?hh/Math.abs(sy):1e9);return[sx*t,sy*t];};
    const [ax,ay]=clip(A,dx,dy),[bx,by]=clip(B,-dx,-dy);
    const x1=A.x+ax,y1=A.y+ay,x2=B.x+bx,y2=B.y+by;
    out+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" style="stroke:var(--muted);stroke-width:1.5${dash?";stroke-dasharray:5 4":""}" marker-end="url(#ah)"${both?' marker-start="url(#ah)"':""}/>`;
    if(label){const mx=(x1+x2)/2,my=(y1+y2)/2;out+=`<text x="${mx.toFixed(1)}" y="${(my-4).toFixed(1)}" text-anchor="middle" style="font:600 10.5px Figtree,system-ui,sans-serif;fill:var(--muted);paint-order:stroke;stroke:var(--panel);stroke-width:4px;stroke-linejoin:round">${esc(label)}</text>`;}
  });
  Object.values(nodes).forEach(N=>{
    const x=N.x-bw/2,y=N.y-N.h/2,k=N.kind;
    const fill=`var(--n-${k})`,stroke=`var(--n-${k}-s)`;
    if(k==="db"){out+=`<path d="M${x} ${y+7} q0 -7 ${bw/2} -7 q${bw/2} 0 ${bw/2} 7 v${N.h-14} q0 7 ${-bw/2} 7 q${-bw/2} 0 ${-bw/2} -7z" style="fill:${fill};stroke:${stroke};stroke-width:1.5"/><path d="M${x} ${y+7} q${bw/2} 9 ${bw} 0" style="fill:none;stroke:${stroke};stroke-width:1.2;opacity:.7"/>`;}
    else if(k==="queue"){out+=`<rect x="${x}" y="${y}" width="${bw}" height="${N.h}" rx="6" style="fill:${fill};stroke:${stroke};stroke-width:1.5"/>`;for(let i=1;i<4;i++)out+=`<line x1="${x+bw-8*i}" y1="${y+5}" x2="${x+bw-8*i}" y2="${y+N.h-5}" style="stroke:${stroke};stroke-width:1;opacity:.45"/>`;}
    else out+=`<rect x="${x}" y="${y}" width="${bw}" height="${N.h}" rx="${k==="client"?19:10}" style="fill:${fill};stroke:${stroke};stroke-width:1.5"/>`;
    out+=`<text x="${N.x}" y="${N.y+(N.sub?-3:4)}" text-anchor="middle" style="font:700 12px Figtree,system-ui,sans-serif;fill:var(--ink)">${esc(N.label)}</text>`;
    if(N.sub)out+=`<text x="${N.x}" y="${N.y+13}" text-anchor="middle" style="font:500 10px Figtree,system-ui,sans-serif;fill:var(--muted)">${esc(N.sub)}</text>`;
  });
  out+="</svg>";
  const used=[...new Set(Object.values(nodes).map(n=>n.kind))];
  const names={client:"Client",edge:"Edge / routing",svc:"Service / worker",db:"Database / storage",cache:"Cache",queue:"Queue / stream",ext:"External / AI"};
  return `<figure class="diagram" style="margin:12px 0">${out}<div class="legend">${used.map(k=>`<span><i style="background:var(--n-${k});border:1.5px solid var(--n-${k}-s)"></i>${names[k]}</span>`).join("")}</div>${cap?`<figcaption class="cap">${esc(cap)}</figcaption>`:""}</figure>`;
}
window.SQ.diagram=diagram;

/* ---------- quiz widget ---------- */
function quizHTML(qs,prefix){
  return qs.map((q,i)=>`<div class="q" data-q="${prefix}${i}"><div class="qt">${i+1}. ${q.q}</div><div class="opts">${q.o.map((o,j)=>`<button class="opt" data-j="${j}">${o}</button>`).join("")}</div><div class="why hidden">${q.why||""}</div></div>`).join("");
}
function wireQuiz(root,qs,prefix,onDone,ids){
  let answered=0;
  $$(".q",root).forEach((box,i)=>{
    const q=qs[i];
    $$(".opt",box).forEach(b=>b.onclick=()=>{
      const j=+b.dataset.j;const right=j===q.a;
      $$(".opt",box).forEach(x=>{x.disabled=true;if(+x.dataset.j===q.a)x.classList.add("right");});
      if(!right)b.classList.add("wrong");
      $(".why",box).classList.remove("hidden");
      $(".why",box).insertAdjacentHTML("afterbegin",right?`<b style="color:var(--good)">Correct.</b> `:`<b style="color:var(--bad)">Not quite.</b> `);
      S.stats.quizAns++;
      if(right){S.stats.quizRight++;S.stats.combo++;S.stats.maxCombo=Math.max(S.stats.maxCombo,S.stats.combo);
        const id=ids?ids[i]:prefix+i;const t=today();if(S.qDay.date!==t)S.qDay={date:t,ids:{}};
        bump("quiz");
        if(!S.qDay.ids[id]){S.qDay.ids[id]=1;addXP(S.stats.combo>=5?15:10,S.stats.combo>=3?`Correct · combo x${S.stats.combo}`:"Correct answer");}else{save();checkBadges();renderHud();}
      }else{S.stats.combo=0;save();}
      answered++;if(answered===qs.length&&onDone)onDone();
    });
  });
}
window.SQ.quizHTML=quizHTML;window.SQ.wireQuiz=wireQuiz;

/* ---------- HUD + nav ---------- */
const ICONS={
  home:'<path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  path:'<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
  arena:'<path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/>',
  practice:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  board:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  lld:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="8.5" y="14" width="7" height="7" rx="1"/><path d="M6.5 10v2h11v-2M12 12v2"/>',
  plan:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 15l2 2 4-4"/>',
  trophies:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  revise:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  review:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  library:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>'
};
const NAV=[["home","Home"],["path","Learn path"],["revise","Fast revision"],["review","Review queue"],["arena","Design arena"],["practice","Practice gym"],["board","Whiteboard"],["lld","LLD dojo"],["plan","My 14-week plan"],["trophies","Trophies"],["library","Library"]];
const TABS=[["home","Home"],["path","Learn"],["arena","Arena"],["review","Review"],["practice","Gym"],["trophies","Me"]];
const svgI=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;
function sectionOf(r){if(r.startsWith("topic-"))return"path";if(r.startsWith("problem-"))return"arena";if(["quiz","cards","gym","mock","scores"].includes(r))return"practice";return r;}
function navLink(k,t,r){const n=k==="review"?srsDue().length:0;return `<a href="#${k}" class="${r===k?"on":""}">${svgI(k)}${t}${n?`<span class="nb" aria-label="${n} due">${n}</span>`:""}</a>`;}
function renderHud(){
  const L=levelOf(S.xp),lo=need(L),hi=need(L+1),pct=Math.round((S.xp-lo)/(hi-lo)*100);
  const st=streakInfo();const tx=S.log[today()]||0;
  const C=2*Math.PI*18;
  $("#hud").innerHTML=`<div class="lvl"><svg class="lvl-ring" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" style="fill:none;stroke:var(--line);stroke-width:5"/><circle cx="22" cy="22" r="18" transform="rotate(-90 22 22)" style="fill:none;stroke:var(--accent);stroke-width:5;stroke-linecap:round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct/100)}"/><text x="22" y="27" text-anchor="middle" style="font:800 14px Bricolage Grotesque,system-ui;fill:var(--ink)">${L}</text></svg><div><b>${esc(titleOf(L))}</b><span>${S.xp.toLocaleString()} XP · ${(hi-S.xp).toLocaleString()} to L${L+1}</span></div></div>
  <div class="bar"><i style="width:${pct}%"></i></div>
  <div class="hud-row"><span class="chip flame" title="Daily streak">${flameSvg(14)} ${st.n} day${st.n===1?"":"s"}</span><span class="chip xp" title="XP today vs goal">${Math.min(tx,S.goal)}/${S.goal} today</span>${S.freezes?`<span class="chip ice" title="Streak freezes">❄ ${S.freezes}</span>`:""}</div>`;
  $("#topchips").innerHTML=`<span class="chip flame">${flameSvg(13)} ${st.n}</span><span class="chip xp">${Math.min(tx,S.goal)}/${S.goal}</span><span class="chip">L${L}</span>`;
  const r=sectionOf(route());
  $("#nav").innerHTML=NAV.map(([k,t])=>navLink(k,t,r)).join("");
  $("#tabbar").innerHTML=TABS.map(([k,t])=>navLink(k,t,r)).join("");
}
function flameSvg(s){return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5.5 1-8.5z" fill="currentColor"/></svg>`;}

/* ---------- views ---------- */
const V={};window.SQ.V=V;
function route(){return (location.hash||"#home").slice(1)||"home";}
function render(){
  const r=route();const view=$("#view");
  let fn=V[r];let arg;
  if(!fn&&r.startsWith("topic-")){fn=V.topic;arg=r.slice(6);}
  if(!fn&&r.startsWith("problem-")){fn=V.problem;arg=r.slice(8);}
  if(!fn)fn=V.home;
  if(window.SQ.leaveBoard)window.SQ.leaveBoard();
  view.innerHTML="";fn(view,arg);renderHud();
  window.scrollTo(0,0);
}
window.SQ.render=render;

/* planner helpers */
const PLAN_START="2026-11-16";
function planIndex(k=today()){return Math.round((dateOf(k)-dateOf(PLAN_START))/DAY);}

V.home=function(el){
  const st=streakInfo(),tx=S.log[today()]||0,pct=Math.min(1,tx/S.goal);const C=2*Math.PI*40;
  const L=levelOf(S.xp);
  const next=TOPICS.find(t=>!S.topics[t.id]);
  const pi=planIndex();const wk=Math.floor(pi/7),dd=pi%7;const plan=(pi>=0&&WEEKS[wk])?WEEKS[wk].days[dd]:null;
  const qs=questsToday();const c=dayC();
  // week dots (Mon..Sun of this week)
  const t=today();const dow=(dateOf(t).getDay()+6)%7;const mon=addDays(t,-dow);
  const dots=["M","T","W","T","F","S","S"].map((l,i)=>{const k=addDays(mon,i);return `<span><i class="${active(k)?"on":S.frozen[k]?"frz":""} ${k===t?"today":""}"></i>${l}</span>`;}).join("");
  // heatmap 18 weeks
  let heat="";const start=addDays(mon,-17*7);for(let i=0;i<18*7;i++){const k=addDays(start,i);const v=S.log[k]||0;const lv=k>t?"":S.frozen[k]?"fz":v===0?"":v<S.goal*.5?"l1":v<S.goal?"l2":v<S.goal*2?"l3":"l4";heat+=`<i class="${lv}" title="${k}: ${v} XP"></i>`;}
  const recent=BADGES.filter(b=>S.badges[b.id]).sort((a,b)=>S.badges[b.id]<S.badges[a.id]?-1:1).slice(0,4);
  const doneTopics=Object.keys(S.topics).length,attempted=Object.values(S.prob).filter(p=>p.attempts).length;
  el.innerHTML=`
  <div class="hero">
    <section class="card hero-main">
      <div class="eyebrow">${new Date().toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"})}</div>
      <h1>${tx>=S.goal?"Goal smashed. Want a bonus round?":tx>0?"Nice start. Finish today's goal.":"Your servers are idle. Boot up today's session."}</h1>
      <p class="muted" style="margin:0">Level ${L} ${esc(titleOf(L))}. Earn ${S.goal} XP a day to keep the streak alive.</p>
      <div class="goal">
        <div class="ring"><svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="40" style="fill:none;stroke:var(--line);stroke-width:9"/><circle cx="48" cy="48" r="40" style="fill:none;stroke:url(#gg);stroke-width:9;stroke-linecap:round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct)}"/><defs><linearGradient id="gg"><stop offset="0" stop-color="var(--xp)"/><stop offset="1" stop-color="var(--flame)"/></linearGradient></defs></svg><div class="lbl">${tx}<small>of ${S.goal} XP</small></div></div>
        <div class="row">
          ${next?`<a class="btn primary" href="#topic-${next.id}">Continue: ${esc(next.title)}</a>`:`<a class="btn primary" href="#mock">Run a mock interview</a>`}
          <a class="btn" href="#quiz">Quiz blitz</a><a class="btn" href="#board">Whiteboard</a>
        </div>
      </div>
    </section>
    <section class="card">
      <div class="streak-big" style="color:var(--flame)">${flameSvg(40)}<div><div class="num">${st.n}</div><div class="small muted" style="font-weight:600">day streak${st.todayDone?" · today counted":" · study today to extend"}</div></div></div>
      <div class="week-dots">${dots}</div>
      <p class="small muted" style="margin:10px 0 0">Streak freezes: <b>${S.freezes}</b>/2. Earn one at every 7-day milestone; it covers a missed day automatically.</p>
    </section>
  </div>
  ${(()=>{const due=srsDue();const enrolled=Object.keys(S.srs).length;return due.length?`<a class="card rv-banner" href="#review"><span class="rv-ico">${svgI("review")}</span><span><b>${due.length} topic${due.length>1?"s":""} due for review</b><span class="small muted" style="display:block">${due.slice(0,3).map(t=>esc(t.title)).join(" · ")}${due.length>3?" …":""}</span></span><span class="btn primary sm">Review now</span></a>`:enrolled?`<div class="card rv-banner calm"><span class="rv-ico">${svgI("review")}</span><span><b>Review queue clear</b><span class="small muted" style="display:block">Nothing due today. Next review ${(()=>{const d=Object.values(S.srs).filter(r=>!r.done).map(r=>r.due).sort()[0];return d?"on "+dateOf(d).toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"}):"none scheduled";})()}.</span></span><a class="btn sm" href="#revise">Fast revision</a></div>`:"";})()}
  <div class="grid g2" style="margin-top:14px">
    <section class="card"><div class="sect" style="margin:0 0 6px"><h2>Daily quests</h2><span class="tag ${c.bonus?"easy":""}">${c.bonus?"Bonus claimed":"+75 XP bonus"}</span></div>
      ${qs.map((k,i)=>{const q=QUEST_POOL[k];const v=Math.min(c[k],q.n);const ok=v>=q.n;return `<a class="quest ${ok?"done":""}" href="${q.href}" style="text-decoration:none;color:inherit"><span class="qi">${ok?"✓":i+1}</span><span><b>${q.t}</b><span class="bar gold" style="display:block;margin-top:5px"><i style="width:${v/q.n*100}%"></i></span></span><span class="small muted" style="font-variant-numeric:tabular-nums">${v}/${q.n}</span></a>`;}).join("")}
    </section>
    <section class="card"><div class="sect" style="margin:0 0 6px"><h2>Today in your plan</h2><a class="small" href="#plan">Open plan</a></div>
      ${plan?`<div class="eyebrow">Week ${wk+1} · Day ${dd+1} · ${esc(WEEKS[wk].title)}</div><h3 style="font-size:1.1rem;margin:6px 0 4px">${esc(plan.t)}</h3><p class="small" style="margin:0 0 10px">${esc(plan.d)}</p><div class="row"><button class="btn ${S.plan[pi]?"":"gold"} sm" id="tickToday">${S.plan[pi]?"Done ✓ (untick)":"Mark done +30 XP"}</button>${plan.u?`<a class="btn sm" href="${plan.u}" target="_blank" rel="noopener">${esc(plan.s||"Resource")} ↗</a>`:""}</div>`:pi<0?`<p class="muted">Your plan starts on ${dateOf(PLAN_START).toDateString()}.</p>`:`<p class="muted">You finished the 14-week plan. Keep the streak with mocks and revision.</p>`}
    </section>
  </div>
  <div class="grid g4" style="margin-top:14px">
    <div class="card stat"><b>${doneTopics}/${TOPICS.length}</b><span>Topics cleared</span></div>
    <div class="card stat"><b>${attempted}/${PROBLEMS.length}</b><span>Problems attempted</span></div>
    <div class="card stat"><b>${S.stats.quizAns?Math.round(S.stats.quizRight/S.stats.quizAns*100):0}%</b><span>Quiz accuracy</span></div>
    <div class="card stat"><b>${Object.keys(S.badges).length}/${BADGES.length}</b><span>Badges</span></div>
  </div>
  <section class="card" style="margin-top:14px"><div class="sect" style="margin:0 0 10px"><h2>Study heatmap</h2><span class="small muted">Last 18 weeks · darker = more XP</span></div><div class="heat">${heat}</div></section>
  ${recent.length?`<div class="sect"><h2>Recent badges</h2><a class="small" href="#trophies">All badges</a></div><div class="badges">${recent.map(b=>`<div class="badge">${badgeSvg(b)}<b>${esc(b.n)}</b><span>${esc(b.d)}</span></div>`).join("")}</div>`:""}
  `;
  const tb=$("#tickToday");if(tb)tb.onclick=()=>{togglePlan(pi);render();};
};
function togglePlan(i){
  if(S.plan[i]){delete S.plan[i];save();toast("Unticked");return;}
  S.plan[i]=today();if(i===planIndex())bump("plan");addXP(30,"Planner task done");
}

/* Learn path */
V.path=function(el){
  const next=TOPICS.find(t=>!S.topics[t.id]);
  el.innerHTML=`<div class="page-head"><div><div class="eyebrow">Learn path</div><h1>From zero to offer</h1><p>${WORLDS.length} worlds, ${TOPICS.length} topics. Each node is a 10–20 minute lesson with notes, a diagram where it helps, real-world examples, interview traps and a quiz. Clear a node for +50 XP.</p></div><a class="btn primary" href="#topic-${(next||TOPICS[0]).id}">${next?"Next lesson":"Revise from the start"}</a></div>`+
  WORLDS.map(w=>{const ts=TOPICS.filter(t=>t.w===w.n);const d=ts.filter(t=>S.topics[t.id]).length;
    return `<section class="world" style="--wc:${w.c}"><div class="world-head"><div class="wn">${w.n}</div><div><h2>${esc(w.name)}</h2><p>${esc(w.blurb)}</p></div><div class="wp">${d}/${ts.length}<div class="bar" style="margin-top:4px"><i style="width:${d/ts.length*100}%;background:${w.c}"></i></div></div></div>
    <div class="trail">${ts.map((t,i)=>`<a class="node ${S.topics[t.id]?"done":""} ${next&&next.id===t.id?"next":""}" href="#topic-${t.id}"><span class="dot">${S.topics[t.id]?"✓":i+1}</span><span class="nt"><b>${esc(t.title)}</b><span>${t.mins} min · ${t.quiz.length} questions${S.topics[t.id]?" · cleared":""}</span></span></a>`).join("")}</div></section>`;}).join("");
};

/* Topic */
V.topic=function(el,id){
  const i=TOPICS.findIndex(t=>t.id===id);if(i<0){location.hash="#path";return;}
  const t=TOPICS[i],w=WORLDS.find(x=>x.n===t.w);const prev=TOPICS[i-1],nxt=TOPICS[i+1];
  const done=!!S.topics[t.id];
  el.style.setProperty("--wc",w.c);
  el.innerHTML=`<div style="--wc:${w.c}">
   <div class="topic-hero"><div class="row"><a class="small" href="#path">← Path</a><span class="tag" style="background:${w.c};color:#fff">World ${w.n} · ${esc(w.name)}</span><span class="tag">${t.mins} min</span>${done?'<span class="tag easy">Cleared</span>':""}</div>
   <h1>${esc(t.title)}</h1><p class="tldr">${t.tldr}</p></div>
   <article class="notes">${t.notes}
   ${t.diagram?diagram(t.diagram,t.dcap):""}
   ${t.real?`<div class="callout real"><div class="ct">In the real world</div>${t.real}</div>`:""}
   ${t.say?`<div class="callout say"><div class="ct">Say this in the interview</div><ul>${t.say.map(s=>`<li>${s}</li>`).join("")}</ul></div>`:""}
   ${t.traps?`<div class="callout trap"><div class="ct">Traps interviewers set</div><ul>${t.traps.map(s=>`<li>${s}</li>`).join("")}</ul></div>`:""}
   ${t.src?`<p class="small muted">Go deeper: ${t.src.map(([n,u])=>`<a href="${u}" target="_blank" rel="noopener">${esc(n)}</a>`).join(" · ")}</p>`:""}
   </article>
   <div class="sect"><h2>Boss check</h2><span class="small muted">Answer all ${t.quiz.length} to unlock the clear</span></div>
   <div id="tq">${quizHTML(t.quiz,"t:"+t.id+":")}</div>
   <div class="card row" style="justify-content:space-between;margin-top:14px">
     <span class="small muted" id="clearHint">${done?`Already cleared. ${S.srs[t.id]?(S.srs[t.id].done?"Mastered in the review queue.":`Next spaced review: ${S.srs[t.id].due}.`):""} Revising gives +10 XP once a day.`:"Finish the quiz to clear this topic. It then joins your review queue."}</span>
     <button class="btn primary" id="clearBtn" ${done?"":"disabled"}>${done?"Mark revised +10 XP":"Clear topic +50 XP"}</button>
   </div>
   <div class="row" style="justify-content:space-between;margin-top:16px">${prev?`<a class="btn ghost" href="#topic-${prev.id}">← ${esc(prev.title)}</a>`:"<span></span>"}${nxt?`<a class="btn" href="#topic-${nxt.id}">${esc(nxt.title)} →</a>`:""}</div></div>`;
  wireQuiz($("#tq"),t.quiz,"t:"+t.id+":",()=>{const b=$("#clearBtn");b.disabled=false;if(!done)$("#clearHint").textContent="Quiz finished. Claim your clear.";});
  $("#clearBtn").onclick=()=>{
    if(!S.topics[t.id]){S.topics[t.id]=today();srsEnroll(t.id);bump("topic");toast("Added to your review queue: back tomorrow");addXP(50,`Cleared ${t.title}`);confetti(70);
      if(worldDone(t.w))modal(`<div class="eyebrow">World ${w.n} cleared</div><h2>${esc(w.badge)}</h2><p>You finished <b>${esc(w.name)}</b>. Badge unlocked.</p>`);
      render();}
    else{const k=t.id+today();if(S.revised[k]){toast("Already revised today");return;}S.revised[k]=1;bump("topic");addXP(10,"Topic revised");}
  };
};

/* Arena */
V.arena=function(el){
  let f=V.arena.f||"all";
  const diffs=["all","easy","medium","hard","ai"];
  const list=PROBLEMS.filter(p=>f==="all"||(f==="ai"?p.tags.includes("AI"):p.diff.toLowerCase()===f));
  el.innerHTML=`<div class="page-head"><div><div class="eyebrow">Design arena</div><h1>Real interview problems</h1><p>Problems that come up again and again in fresher and SDE-1 rounds. Attempt alone first (timer + framework), then open the reference solution and grade yourself. Company tags are a rough guide based on commonly shared interview experiences, not verified per company. "Capstone" marks problems picked for your portfolio capstones.</p></div><a class="btn gold" href="#mock">Random timed mock</a></div>
  <div class="row" style="margin-bottom:14px">${diffs.map(d=>`<button class="btn sm ${f===d?"primary":""}" data-f="${d}">${d==="ai"?"AI systems":d[0].toUpperCase()+d.slice(1)}</button>`).join("")}</div>
  <div class="grid g3">${list.map(p=>{const pr=S.prob[p.id]||{};const stars=pr.best?(pr.best>=13?3:pr.best>=9?2:1):0;
    return `<a class="card pcard" href="#problem-${p.id}"><div class="row" style="justify-content:space-between"><span class="tag ${p.diff.toLowerCase()}">${p.diff}</span><span class="stars">${[1,2,3].map(s=>`<span class="${s<=stars?"":"off"}">★</span>`).join("")}</span></div><h3>${esc(p.title)}</h3><p>${esc(p.pitch)}</p><div class="row" style="gap:5px">${p.cos.slice(0,4).map(c=>`<span class="tag co">${esc(c)}</span>`).join("")}</div><span class="small muted">${pr.attempts?`${pr.attempts} attempt${pr.attempts>1?"s":""} · best ${pr.best}/16`:"Not attempted"}</span></a>`;}).join("")}</div>`;
  $$("[data-f]",el).forEach(b=>b.onclick=()=>{V.arena.f=b.dataset.f;render();});
};

const STEPS=[["req","Requirements","5 min · functional + non-functional"],["est","Estimates","3 min · only numbers that change a decision"],["ent","Core entities","2 min · the nouns"],["api","API","5 min · endpoints, request/response"],["hld","High-level design","10 min · boxes and arrows per requirement"],["deep","Deep dives","10 min · 2–3 hard parts from the NFRs"],["wrap","Wrap-up","5 min · bottlenecks, trade-offs, monitoring"]];
const RUBRIC=[["nav","Problem navigation","Clarified scope, picked the right focus, managed time"],["design","Solution design","Working end-to-end design that meets every requirement"],["tech","Technical depth","Correct trade-offs, numbers, failure handling"],["comm","Communication","Thought out loud, structured, handled hints"]];
function rubricHTML(){return `<div class="rubric">${RUBRIC.map(([k,n,d])=>`<div class="rub" data-k="${k}"><div><b>${n}</b><div class="small muted">${d}</div></div><div class="pips">${[1,2,3,4].map(v=>`<button data-v="${v}" aria-label="${n} ${v} of 4">${v}</button>`).join("")}</div></div>`).join("")}</div><p class="small muted">1 = missing · 2 = partly · 3 = solid · 4 = would impress a senior</p>`;}
function wireRubric(root){const sc={};$$(".rub",root).forEach(r=>$$("button",r).forEach(b=>b.onclick=()=>{sc[r.dataset.k]=+b.dataset.v;$$("button",r).forEach(x=>x.classList.toggle("on",+x.dataset.v<=sc[r.dataset.k]));}));return sc;}

let timerInt=null;
function startTimer(elId,mins,onTick){
  clearInterval(timerInt);const end=Date.now()+mins*60000;
  const f=()=>{const left=Math.max(0,end-Date.now());const m=Math.floor(left/60000),s=Math.floor(left%60000/1000);const el=document.getElementById(elId);if(!el){clearInterval(timerInt);return;}el.textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;el.style.color=left<300000?"var(--flame)":"";if(onTick)onTick(mins*60000-left);if(!left){clearInterval(timerInt);toast("Time! Wrap up and grade yourself.","gold");}};
  f();timerInt=setInterval(f,1000);
}
window.SQ.startTimer=startTimer;

V.problem=function(el,id){
  const p=PROBLEMS.find(x=>x.id===id);if(!p){location.hash="#arena";return;}
  const pr=S.prob[p.id]=S.prob[p.id]||{notes:{},attempts:0,best:0};
  let tab=V.problem.tab&&V.problem.tab.id===id?V.problem.tab.t:"brief";
  el.innerHTML=`<div class="row"><a class="small" href="#arena">← Arena</a></div>
  <div class="page-head"><div><div class="row"><span class="tag ${p.diff.toLowerCase()}">${p.diff}</span>${p.cos.map(c=>`<span class="tag co">${esc(c)}</span>`).join("")}</div><h1 style="margin-top:8px">${esc(p.title)}</h1><p>${esc(p.pitch)}</p></div><a class="btn" href="#board" id="toBoard">Draw it on the whiteboard</a></div>
  <div class="tabs" role="tablist">${[["brief","Brief"],["practice","Practice space"],["solution","Reference solution"]].map(([k,n])=>`<button role="tab" data-t="${k}" class="${tab===k?"on":""}">${n}</button>`).join("")}</div>
  <div id="ptab"></div>`;
  $("#toBoard").onclick=()=>{window.SQ.boardProblem=p.id;};
  $$(".tabs button",el).forEach(b=>b.onclick=()=>{V.problem.tab={id,t:b.dataset.t};render();});
  const box=$("#ptab");
  if(tab==="brief"){
    box.innerHTML=`<div class="grid g2"><div class="card"><h3>The prompt</h3><p>${p.prompt}</p><h3 style="margin-top:12px">What the interviewer is really testing</h3><ul>${p.tests.map(x=>`<li>${x}</li>`).join("")}</ul></div>
    <div class="card"><h3>How to play</h3><ol class="small"><li>Open <b>Practice space</b>, start the 40-minute timer, and fill each framework step out loud.</li><li>Sketch the architecture on the <a href="#board">Whiteboard</a> (it can load a starter stencil for this problem).</li><li>Submit and grade yourself honestly with the rubric. You earn XP and stars.</li><li>Only then open the <b>Reference solution</b> and note what you missed.</li></ol>
    <h3 style="margin-top:12px">Hints if you're stuck</h3>${p.hints.map((h,i)=>`<details class="dd"><summary>Hint ${i+1}</summary><div>${h}</div></details>`).join("")}</div></div>`;
  }else if(tab==="practice"){
    box.innerHTML=`<div class="card sticky-timer"><div><div class="eyebrow">Practice timer</div><div class="timer" id="ptimer">40:00</div></div><div class="row"><button class="btn primary sm" id="pstart">Start 40 min</button><button class="btn sm" id="pclear">Clear my notes</button></div></div>
    ${STEPS.map(([k,n,d])=>`<div class="step"><label for="st-${k}">${n}<span>${d}</span></label><textarea id="st-${k}" data-k="${k}" placeholder="Type as if you're talking to the interviewer…">${esc(pr.notes[k]||"")}</textarea></div>`).join("")}
    <div class="card" style="margin-top:14px"><h3>Grade this attempt</h3>${rubricHTML()}<div class="row" style="margin-top:12px"><button class="btn gold" id="psubmit">Submit attempt</button><span class="small muted">+100 XP + 5 XP per rubric point (full XP once a day per problem)</span></div></div>`;
    $$("textarea",box).forEach(t=>t.oninput=()=>{pr.notes[t.dataset.k]=t.value;save();});
    $("#pstart").onclick=()=>startTimer("ptimer",40);
    let armed=false;$("#pclear").onclick=e=>{if(!armed){armed=true;e.target.textContent="Click again to clear";setTimeout(()=>{armed=false;if(e.target)e.target.textContent="Clear my notes";},2500);return;}pr.notes={};save();render();};
    const sc=wireRubric(box);
    $("#psubmit").onclick=()=>{
      if(RUBRIC.some(([k])=>!sc[k])){toast("Rate all four rubric rows first");return;}
      const total=RUBRIC.reduce((a,[k])=>a+sc[k],0);
      const first=pr.lastDay!==today();pr.attempts++;pr.best=Math.max(pr.best,total);pr.lastDay=today();pr.hist=(pr.hist||[]).concat([{d:today(),total}]);
      S.stats.attempts++;bump("problem");
      addXP(first?100+total*5:20,`Attempt: ${p.title} (${total}/16)`);
      clearInterval(timerInt);V.problem.tab={id,t:"solution"};render();
    };
  }else{
    const s=p.sol;
    box.innerHTML=`<div class="grid g2"><div class="card"><h3>Functional requirements</h3><ul>${s.fr.map(x=>`<li>${x}</li>`).join("")}</ul></div><div class="card"><h3>Non-functional requirements</h3><ul>${s.nfr.map(x=>`<li>${x}</li>`).join("")}</ul></div></div>
    <div class="grid g2" style="margin-top:14px"><div class="card"><h3>Back-of-envelope</h3><div class="small">${s.est}</div></div><div class="card"><h3>Core entities and API</h3><p class="small" style="margin:4px 0">${s.ent}</p><pre><code>${esc(s.api.join("\n"))}</code></pre></div></div>
    <div class="sect"><h2>High-level design</h2></div>${diagram(s.dia,s.flow)}
    <div class="sect"><h2>Deep dives</h2><span class="small muted">Where the interview is won</span></div>
    ${s.deep.map(([q,a])=>`<details class="dd"><summary>${q}</summary><div>${a}</div></details>`).join("")}
    <div class="grid g2" style="margin-top:14px"><div class="callout trap"><div class="ct">Common mistakes</div><ul>${s.mistakes.map(x=>`<li>${x}</li>`).join("")}</ul></div><div class="callout say"><div class="ct">Follow-ups to expect</div><ul>${s.follow.map(x=>`<li>${x}</li>`).join("")}</ul></div></div>
    ${s.real?`<div class="callout real"><div class="ct">How real companies do it</div>${s.real}</div>`:""}`;
  }
};

/* boot */
function boot(){
  if(S.theme&&S.theme!=="system")document.documentElement.setAttribute("data-theme",S.theme);
  applyFreezes();dayC();srsSync();save();
  addEventListener("hashchange",render);render();checkBadges();
}
window.SQ.boot=boot;window.SQ.BADGES=BADGES;window.SQ.badgeSvg=badgeSvg;window.SQ.levelOf=levelOf;window.SQ.titleOf=titleOf;window.SQ.need=need;window.SQ.streakInfo=streakInfo;window.SQ.planIndex=planIndex;window.SQ.togglePlan=togglePlan;window.SQ.rubricHTML=rubricHTML;window.SQ.wireRubric=wireRubric;window.SQ.RUBRIC=RUBRIC;window.SQ.STEPS=STEPS;window.SQ.shuffle=shuffle;window.SQ.flameSvg=flameSvg;window.SQ.modal=modal;window.SQ.dateOf=dateOf;window.SQ.PLAN_START=PLAN_START;window.SQ.checkBadges=checkBadges;window.SQ.renderHud=renderHud;
})();
