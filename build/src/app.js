/* ================= Adnan's Launchpad — app shell (forked from the Launchpad kit) ================= */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(n,d=0)=>(n==null||!isFinite(n))?'—':Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const pct=(n,d=1)=>(n==null||!isFinite(n))?'—':(n*100).toFixed(d)+'%';
const DAY=864e5;
const perm=n=>{const p=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[p[i],p[j]]=[p[j],p[i]]}return p};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dkey=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function weekStart(t){const d=new Date(t||Date.now());d.setHours(0,0,0,0);const dow=(d.getDay()+6)%7;d.setDate(d.getDate()-dow);return d.getTime()} // Monday
const weekKey=t=>dkey(weekStart(t));
const FOLLOW=!!window.FOLLOW;
/* reading-link helpers shared by all track files */
const HBRS=t=>'https://hbr.org/search?term='+encodeURIComponent(t);
const INV=t=>'https://www.investopedia.com/terms/'+t;
const OCW=q=>'https://ocw.mit.edu/search/?q='+encodeURIComponent(q);
const DAMO='https://pages.stern.nyu.edu/~adamodar/';
const WIKI=t=>'https://en.wikipedia.org/wiki/'+t;

/* ---------- registry (filled by track data files) ---------- */
const TRACKS=[
 {id:'launch',ico:'➶',name:'Career Launch',sub:'Market map, CV, story, network, interviews, offers',batch:1,titles:['Map the market: where electronics engineers work','Choose a direction: from Compass to a decision','A CV that gets interviews','LinkedIn and a GitHub portfolio','Your story: the 30-second pitch and the timeline question','Networking and informational interviews','Reading job ads and passing the screen','Behavioural interviews: STAR stories','Technical interviews for embedded and hardware roles','Offers and choosing the first job']},
 {id:'emb',ico:'⌁',name:'Embedded Depth',sub:'Firmware, buses, RTOS, embedded Linux, boards, test',batch:2,titles:['Embedded C: memory, pointers and volatile','Interrupts, timers and real-time thinking','Buses: UART, SPI, I2C and CAN','RTOS fundamentals','Embedded Linux essentials','Power and low-power design','From schematic to a working PCB','Debugging hardware: scope and logic analyser','Test, validation and qualification','Reliability and safety standards']},
 {id:'per',ico:'◎',name:'Perception & Autonomy',sub:'LiDAR, point clouds, fusion, ROS 2, capstone build',batch:3,titles:['Sensors for autonomous systems','LiDAR principles: time of flight to point cloud','Point-cloud processing','Coordinate frames and transforms','The Kalman filter','Sensor fusion','ROS 2 in practice','Computer vision essentials','Localisation and SLAM concepts','Capstone: a LiDAR-equipped rover']},
 {id:'ind',ico:'◇',name:'Industry & Japan',sub:'Saudi localisation, sectors, Japanese partners, JLPT, study abroad',batch:4,titles:['Localisation and Vision 2030: why your job exists','Defence and aerospace electronics','Automotive and EV','Semiconductors','Telecom, networks and security','Working with Japanese companies','The JLPT path to business Japanese','Graduate study: Japan and beyond']}
];
const PFX={launch:'l',emb:'e',per:'p',ind:'i'};
const TOTAL=()=>TRACKS.reduce((n,t)=>n+t.titles.length,0);
const M={};          // mission id -> mission object
const LABS={};       // lab key -> fn(el, mission, done)
function addMissions(list){list.forEach(m=>{if(m.sets)m.quiz=m.sets.flatMap(st=>st.qs.map(q=>Object.assign({stem:st.v,setT:st.t},q))).concat(m.quiz||[]);M[m.id]=m})}
const mid=(t,i)=>PFX[t]+String(i+1).padStart(2,'0');

/* ---------- state defaults ---------- */
function ensure(){const d={progress:{},custom:{},time:{},log:[],xp:0,srs:{},goals:{},days:{},mins:{},conf:{},cow:{},compass:null,checkins:{},apps:[],contacts:[],stories:[],cv:{},advRead:{},advReply:{},taskDone:{},settings:{shareRefl:false},refl:{},badges:{},reviews:0,name:profName(USER)};for(const k in d)if(state[k]==null)state[k]=d[k];if(USER)state.name=profName(USER);if(!state.settings)state.settings={shareRefl:false}}
const profName=u=>'Adnan';
ensure();
const P=id=>state.progress[id]||(state.progress[id]={status:'new',steps:{},best:0,attempts:0,xp:0});

/* ---------- reflections: private (device) or shared (synced) ---------- */
const RKEY='adl-refl';
function reflStore(){if(state.settings.shareRefl)return state.refl;try{return JSON.parse(localStorage.getItem(RKEY)||'{}')}catch(e){return{}}}
function reflSave(id,obj){if(state.settings.shareRefl){state.refl[id]=obj}else{const r=reflStore();r[id]=obj;try{localStorage.setItem(RKEY,JSON.stringify(r))}catch(e){}}save()}
function setShareRefl(on){const cur=reflStore();state.settings.shareRefl=on;if(on){state.refl=Object.assign({},cur,state.refl)}else{try{localStorage.setItem(RKEY,JSON.stringify(Object.assign({},state.refl,cur)))}catch(e){}state.refl={}}save()}

/* ---------- XP, levels, streak ---------- */
const LEVELS=[[0,'Graduate'],[500,'Engineer I'],[1200,'Engineer II'],[2200,'Senior Engineer'],[3500,'Lead Engineer'],[5000,'Principal']];
function level(x){let i=0;while(i<LEVELS.length-1&&x>=LEVELS[i+1][0])i++;const nx=LEVELS[i+1];return{name:LEVELS[i][1],i,frac:nx?(x-LEVELS[i][0])/(nx[0]-LEVELS[i][0]):1,next:nx}}
function addXP(n,id){if(FOLLOW)return;state.xp=(state.xp||0)+n;if(id){P(id).xp=(P(id).xp||0)+n}state.days[today()]=true;const before=level(state.xp-n).i;save();renderTop();if(level(state.xp).i>before){confetti();toast(`🎖️ Promoted to <b>${level(state.xp).name}</b>`)}checkBadges()}
function streak(){let s=0;const d=new Date();if(!state.days[today()])d.setDate(d.getDate()-1);while(state.days[dkey(d)]){s++;d.setDate(d.getDate()-1)}return s}

/* keep a newly shown button clear of the fixed bottom navigation */
function reveal(e){if(!e)return;(f=>f())(()=>{const r=e.getBoundingClientRect(),nav=$('#tabs'),nb=nav&&getComputedStyle(nav).position==='fixed'&&nav.getBoundingClientRect().top>innerHeight/2?nav.offsetHeight:0;const lim=innerHeight-nb-12;if(r.bottom>lim)scrollBy(0,r.bottom-lim)})}
/* ---------- toast & confetti ---------- */
let toastT;function toast(h){const t=$('#toast');t.innerHTML=h;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2600)}
function confetti(){const c=$('#confetti');if(!c)return;const x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const cols=['#C9A227','#E2C25A','#0B1F3A','#5B7DB1','#ffffff'];const ps=Array.from({length:110},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.4,vx:(Math.random()-.5)*3,vy:2+Math.random()*3,r:3+Math.random()*4,c:cols[Math.floor(Math.random()*cols.length)],a:Math.random()*6}));let f=0;(function tick(){x.clearRect(0,0,c.width,c.height);ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.a+=.1;x.fillStyle=p.c;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillRect(-p.r,-p.r/2,p.r*2,p.r);x.restore()});if(++f<150)requestAnimationFrame(tick);else x.clearRect(0,0,c.width,c.height)})()}

/* ---------- badges ---------- */
const BADGES=[
 ['compass','🧭','Compass complete',s=>!!(s.compass&&s.compass.done)],
 ['first','🚀','First mission',s=>done().length>=1],
 ['five','🎯','Five missions',s=>done().length>=5],
 ['launch','➶','Career Launch complete',s=>trackDone('launch')],
 ['emb','⌁','Embedded Depth complete',s=>trackDone('emb')],
 ['per','◎','Perception & Autonomy complete',s=>trackDone('per')],
 ['ind','◇','Industry & Japan complete',s=>trackDone('ind')],
 ['pulse4','📈','Four weekly check-ins',s=>Object.keys(s.checkins||{}).length>=4],
 ['apply5','📮','Five applications sent',s=>(s.apps||[]).filter(a=>a.stage!=='Target').length>=5],
 ['interview','🎤','First interview',s=>(s.apps||[]).some(a=>['Interview','Offer'].includes(a.stage))],
 ['offer','🏆','First offer',s=>(s.apps||[]).some(a=>a.stage==='Offer')],
 ['network5','🤝','Five conversations logged',s=>(s.contacts||[]).filter(c=>c.status==='Talked').length>=5],
 ['perfect','💯','Perfect test score',s=>Object.values(s.progress).some(p=>p.best>=1)],
 ['streak7','🔥','7-day streak',s=>streak()>=7],
 ['review50','🧠','50 reviews',s=>(s.reviews||0)>=50],
 ['photo','📷','First build photo',s=>(s.photos||[]).length>0],
 ['goals','✅','Hit all weekly targets',s=>!!s.badges.goals]
];
const done=()=>Object.keys(state.progress).filter(id=>state.progress[id].status==='completed'&&M[id]);
const trackDone=t=>{const tr=TRACKS.find(x=>x.id===t);return tr.titles.every((_,i)=>(state.progress[mid(t,i)]||{}).status==='completed')};
function checkBadges(){if(FOLLOW)return;let got=[];BADGES.forEach(([k,e,n,f])=>{if(!state.badges[k]){try{if(f(state)){state.badges[k]=Date.now();got.push(e+' '+n)}}catch(err){}}});if(got.length){save();setTimeout(()=>{confetti();toast('🏅 Badge: <b>'+got.join(', ')+'</b>')},700)}}

/* ---------- theme ---------- */
function applyTheme(){const t=localStorage.getItem('adl-theme');if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme')}
function toggleTheme(){const cur=document.documentElement.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');const n=cur==='dark'?'light':'dark';try{localStorage.setItem('adl-theme',n)}catch(e){}applyTheme()}

/* ---------- time tracking ---------- */
let current=null;
setInterval(()=>{if(FOLLOW||!USER||document.hidden)return;const id=current&&current.id;const k=today();state.mins[k]=(state.mins[k]||0)+15;if(id)state.time[id]=(state.time[id]||0)+15;if(Object.keys(state.mins).length>120){const ks=Object.keys(state.mins).sort();ks.slice(0,ks.length-120).forEach(x=>delete state.mins[x])}save()},15000);

/* ---------- header ---------- */
function renderTop(){ensure();const br=$('.brand');if(br&&!FOLLOW&&!USER)br.innerHTML='<b>Launchpad</b>';if(br&&!FOLLOW&&USER)br.innerHTML=`${esc(profName(USER))}'s <b>Launchpad</b>`;const ab=$('#meBtn');if(ab&&USER&&!FOLLOW){ab.innerHTML=avatar(USER,30);ab.classList.remove('hide')}const L=level(state.xp||0);$('#lvlTxt').innerHTML=`${L.name} · ${fmt(state.xp||0)} XP${L.next?` <span class="nxtlvl" style="opacity:.7">→ ${L.next[1]} at ${fmt(L.next[0])}</span>`:''}`;$('#xpBar').style.width=Math.min(100,L.frac*100)+'%';const due=dueCards().length;const b=$('#dueBadge');if(b){b.textContent=due;b.classList.toggle('hide',!due||FOLLOW)}}

/* ---------- profiles: picker, lock, family ---------- */
const PCOL={adnan:'#2BB3A3'};
const pinHash=p=>btoa(unescape(encodeURIComponent(USER+'|'+p)));
const locked=()=>!FOLLOW&&state.pin&&(()=>{try{return localStorage.getItem('adl-unlocked-'+USER)!==state.pin}catch(e){return true}})();
function localOf(u){try{return JSON.parse(localStorage.getItem('adl-state')||'null')}catch(e){return null}}
function avatar(u,sz){sz=sz||44;return`<span style="display:inline-grid;place-items:center;width:${sz}px;height:${sz}px;border-radius:50%;background:${PCOL[u]};color:#0B1F3A;font:600 ${sz*.42}px var(--serif);flex:none">${profName(u)[0]}</span>`}
function setUser(u){try{localStorage.setItem('adl-user',u)}catch(e){}location.hash='#/home';location.reload()}
function vLock(){$('#tabs').classList.add('hide');view().innerHTML=`<div style="max-width:360px;margin:8vh auto 0;text-align:center">${avatar(USER,64)}<h2 style="margin-top:12px">${esc(profName(USER))}</h2><p class="note">Enter your PIN</p><input class="tin" id="pin" type="password" inputmode="numeric" maxlength="8" style="text-align:center;font-size:1.4rem;letter-spacing:6px"><div class="ctl" style="justify-content:center"><button class="sbtn" id="ok">Unlock</button><button class="sbtn alt" id="sw">Switch profile</button></div><p class="note" id="pm"></p></div>`;
  const go2=()=>{if(pinHash($('#pin').value)===state.pin){try{localStorage.setItem('adl-unlocked-'+USER,state.pin)}catch(e){}$('#tabs').classList.remove('hide');route()}else{$('#pm').textContent='Wrong PIN.';$('#pin').value=''}};
  $('#ok').onclick=go2;$('#pin').onkeydown=e=>{if(e.key==='Enter')go2()};$('#sw').onclick=()=>{try{localStorage.removeItem('adl-user')}catch(e){}location.reload()};$('#pin').focus()}

/* ---------- router ---------- */
function go(h){location.hash=h}
function renderMap(){route()}
let roomStop=null;

/* ---------- views ---------- */
const view=()=>$('#view');
function trackStats(t){const tr=TRACKS.find(x=>x.id===t);const ids=tr.titles.map((_,i)=>mid(t,i));const d=ids.filter(id=>(state.progress[id]||{}).status==='completed').length;return{d,n:ids.length,ids}}
function nextMission(){for(const tr of TRACKS){for(let i=0;i<tr.titles.length;i++){const id=mid(tr.id,i);if(M[id]&&(state.progress[id]||{}).status!=='completed')return id}}return null}
function inProgress(){return Object.keys(state.progress).filter(id=>M[id]&&state.progress[id].status==='started').sort((a,b)=>(state.progress[b].updated||0)-(state.progress[a].updated||0))[0]}

function trackCard(t){const s=trackStats(t.id),c=tcol(t.id);const avail=t.titles.some((_,i)=>M[mid(t.id,i)]);return`<div class="card tcard trk" style="--tc:${c.c}" onclick="go('#/track/${t.id}')"><div class="trkband" style="background:${c.g}"><span class="tile glass">${ico(c.i,26)}</span><div style="flex:1;min-width:0"><h3>${t.name}</h3><small>${t.sub}</small></div><span class="trkpct">${Math.round(s.d/s.n*100)}%</span></div><div class="trkbody"><div class="icorow">${t.titles.map((_,i)=>{const id=mid(t.id,i),dn=(state.progress[id]||{}).status==='completed';return`<span class="mini ${dn?'on':''} ${M[id]?'':'off'}" data-tip="${i+1}. ${esc(M[id]?M[id].title:t.titles[i])}${dn?' ✓':''}" role="link" aria-label="Mission ${i+1}: ${esc(t.titles[i])}" ${M[id]?`onclick="event.stopPropagation();go('#/m/${id}')"`:''}>${mico(id,15)}</span>`}).join('')}</div><div class="prog"><i style="width:${s.d/s.n*100}%"></i></div><small class="muted">${s.d} of ${s.n} missions${avail?'':' · coming soon'}</small></div></div>`}
function vTracks(){view().innerHTML=`<h1>Tracks</h1><p class="note">Each mission: concept cards → a working lab → a self-test → a reflection. Concepts then join your spaced-review deck.</p>${trackGroups()}`}
function vTrack(t){const tr=TRACKS.find(x=>x.id===t);if(!tr)return vTracks();const s=trackStats(t);
  const c=tcol(t);view().innerHTML=`<div style="--tc:${c.c}"><div class="trackhead" style="background:${c.g};border:0"><div class="row" style="flex-wrap:nowrap"><span class="tile glass" style="width:52px;height:52px">${ico(c.i,30)}</span><div><div class="eyebrow" style="color:rgba(255,255,255,.8)">Track</div><h1 style="margin:0">${tr.name}</h1></div></div><p style="margin-top:8px">${tr.sub}</p><div class="prog" style="background:rgba(255,255,255,.2)"><i style="width:${s.d/s.n*100}%;background:#fff"></i></div><small style="color:rgba(255,255,255,.85)">${s.d} of ${s.n} complete</small>${tr.group==='cfa'&&typeof EXAMS!=='undefined'&&EXAMS[t]?`<div class="ctl" style="margin-bottom:0"><button class="sbtn" style="background:#fff;color:${c.c};border-color:#fff" onclick="go('#/exam/${t}')">Practice simulator</button><button class="sbtn" style="background:transparent;color:#fff;border-color:#fff" onclick="go('#/study/${t}')">Study tracker</button></div>`:''}</div>
  <div class="mlist">${tr.titles.map((ti,i)=>{const id=mid(t,i),m=M[id],p=state.progress[id]||{};const dn=p.status==='completed';
    return`<button class="mitem ${dn?'done':''} ${m?'':'lock'}" ${m?`onclick="go('#/m/${id}')"`:'disabled'}><span class="tile ${dn?'':'soft'}">${mico(id,22)}</span><span class="t"><small class="mnum">Mission ${i+1}${dn?' · ✓ done':''}</small><b>${esc(m?m.title:ti)}</b><small class="muted">${m?esc(m.lab.name):'Coming in batch '+tr.batch}</small></span>${dn?`<span class="pill done">${Math.round((p.best||0)*100)}%</span>`:p.status==='started'?'<span class="pill gold">In progress</span>':''}</button>`}).join('')}</div></div>`}

/* ---------- mission ---------- */
const STEPS=[['learn','Learn'],['lab','Lab'],['test','Test'],['reflect','Reflect'],['read','Read']];
function vMission(id,step){const m=M[id];if(!m)return vTracks();current=m;const p=P(id);if(p.status==='new'){p.status='started';p.updated=Date.now();logEvent('start',id,enTitle(m));save()}
  step=step||(p.steps.learn?(p.steps.lab?(p.steps.test?'reflect':'test'):'lab'):'learn');
  const tr=TRACKS.find(t=>t.id===m.track);const idx=tr.titles.findIndex((_,i)=>mid(m.track,i)===id);
  const c=tcol(m.track);view().innerHTML=`<div style="--tc:${c.c}"><div class="row" style="margin-bottom:4px"><a href="#/track/${m.track}" class="note">← ${tr.name}</a><span class="spacer"></span>${p.status==='completed'?'<span class="pill done">Completed</span>':''}</div>
  <div class="mhead"><span class="tile">${mico(id,28)}</span><div style="min-width:0"><div class="eyebrow" style="color:var(--tc)">${tr.name} · Mission ${idx+1} of ${tr.titles.length}</div><h1 style="margin:2px 0 4px">${esc(m.title)}</h1><p class="note" style="margin:0">${esc(m.blurb)}</p></div></div>
  <div class="steps">${STEPS.map(([k,n])=>`<button class="${k===step?'on':''} ${p.steps[k]?'ok':''}" onclick="go('#/m/${id}/${k}')">${ico(STEPICO[k],16)}<span>${n}</span></button>`).join('')}</div>
  <div id="stepBox"></div></div>`;
  const box=$('#stepBox');({learn:stepLearn,lab:stepLab,test:stepTest,reflect:stepReflect,read:stepRead}[step]||stepLearn)(box,m)}
function markStep(m,k,xp){const p=P(m.id);if(p.steps[k])return false;p.steps[k]=Date.now();p.updated=Date.now();addXP(xp,m.id);logEvent(k,m.id,enTitle(m));maybeComplete(m);save();$$('.steps button').forEach(b=>{if(b.textContent.trim()===STEPS.find(s=>s[0]===k)[1])b.classList.add('ok')});return true}
function maybeComplete(m){const p=P(m.id);if(p.status!=='completed'&&p.steps.learn&&p.steps.lab&&p.steps.test){p.status='completed';p.updated=Date.now();logEvent('complete',m.id,enTitle(m)+' ('+Math.round((p.best||0)*100)+'%)');save();setTimeout(()=>{confetti();toast(`✅ <b>Mission complete:</b> ${esc(m.title)}`)},300)}}
function stepLearn(box,m){let i=0;const n=m.cards.length;
  const draw=()=>{const c=m.cards[i];box.innerHTML=`<div class="card concept"><div class="eyebrow">Concept ${i+1} of ${n}</div><h3 style="margin-top:4px">${c.h}</h3><div>${c.b}</div>${c.en?enT(c.en.h,c.en.b):''}</div><div class="dots">${m.cards.map((_,j)=>`<i class="${j===i?'on':''}"></i>`).join('')}</div><div class="ctl"><button class="sbtn alt" id="prv" ${i?'':'disabled'}>← Back</button><span class="spacer"></span>${i<n-1?'<button class="sbtn" id="nxt">Next →</button>':'<button class="sbtn gold" id="fin">Add to review deck & go to the lab →</button>'}</div>`;
    $('#prv',box).onclick=()=>{i--;draw()};const nx=$('#nxt',box);if(nx)nx.onclick=()=>{i++;draw();box.scrollIntoView({block:'start'})};const f=$('#fin',box);if(f)f.onclick=()=>{addCards(m);markStep(m,'learn',10);go('#/m/'+m.id+'/lab')}};draw()}
function stepLab(box,m){box.innerHTML=`<div class="card"><div class="eyebrow">Lab</div><h3 style="margin-top:4px">${esc(m.lab.name)}</h3><p class="note">${m.lab.intro||''}</p><div id="labBox"></div></div><div class="ctl"><span class="spacer"></span><button class="sbtn alt" onclick="go('#/m/${m.id}/test')">Go to the test →</button></div>`;
  const fn=LABS[m.lab.key];const lb=$('#labBox',box);if(!fn){lb.innerHTML='<p class="note">Lab not found.</p>';return}
  fn(lb,m,()=>{if(markStep(m,'lab',20))toast('🧪 Lab complete +20 XP')})}
function stepTest(box,m){const qs=m.quiz;let i=0,ok=0;const ans=[];
  const draw=()=>{if(i>=qs.length){const sc=ok/qs.length;const p=P(m.id);p.attempts=(p.attempts||0)+1;const first=!p.steps.test;const gain=Math.round(40*sc)-(first?0:Math.round(40*(p.best||0)));if(sc>(p.best||0))p.best=sc;
      box.innerHTML=`<div class="card" style="text-align:center"><div class="eyebrow">Result</div><div class="big" style="font-size:2.6rem">${ok}/${qs.length}</div><p>${sc>=.85?'Excellent. You own this.':sc>=.67?'Solid. Review the explanations you missed.':'Worth another pass. Revisit the concept cards, then retry.'}</p><div class="ctl" style="justify-content:center"><button class="sbtn alt" id="again">Retry</button><button class="sbtn" onclick="go('#/m/${m.id}/reflect')">Reflect →</button></div></div>`;
      $('#again',box).onclick=()=>{i=0;ok=0;draw()};if(m.cr)crPractice(box,m);
      if(first){markStep(m,'test',Math.round(40*sc))}else{if(gain>0)addXP(gain,m.id);logEvent('retest',m.id,Math.round(sc*100)+'%');save()}if(sc>=1)checkBadges();return}
    const q0=qs[i],pm=perm(q0.o.length),q={q:q0.q,w:q0.w,o:pm.map(k=>q0.o[k]),a:pm.indexOf(q0.a)};box.innerHTML=`<div class="card">${q0.stem?`<details ${i===0||qs[i-1].stem!==q0.stem?'open':''} class="exhibit" style="margin-bottom:10px"><summary><b>Item set: ${esc(q0.setT||'Vignette')}</b> <span class="note">(tap to show or hide)</span></summary><div class="casebody" style="margin-top:6px">${q0.stem}</div></details>`:''}<div class="row"><div class="eyebrow">Question ${i+1} of ${qs.length}</div><span class="spacer"></span><small class="muted">${ok} correct</small></div><h3 style="margin-top:6px;font-family:var(--sans);font-size:1.02rem">${q.q}</h3>${q0.en?enT('',q0.en.q+'<ul>'+q0.en.o.map(x=>'<li>'+x+'</li>').join('')+'</ul>'):''}<div id="opts">${q.o.map((o,j)=>`<button class="qopt" data-j="${j}">${o}</button>`).join('')}</div><div id="why"></div></div>`;
    $$('.qopt',box).forEach(b=>b.onclick=()=>{const j=+b.dataset.j;const r=j===q.a;if(r)ok++;logEvent('quiz',m.id,(r?'✓ ':'✗ ')+String(q.q).replace(/<[^>]+>/g,'').slice(0,60));$$('.qopt',box).forEach(x=>{x.disabled=true;if(+x.dataset.j===q.a)x.classList.add('right');else if(x===b)x.classList.add('wrong')});
      $('#why',box).innerHTML=`<div class="readout ${r?'ok':'bad'}"><b>${r?'Correct.':'Not quite.'}</b> ${q.w}</div>${q0.en?enT('',q0.en.w):''}<div class="ctl"><span class="spacer"></span><button class="sbtn" id="nq">${i<qs.length-1?'Next question →':'See result'}</button></div>`;$('#nq',box).onclick=()=>{i++;draw()};reveal($('#nq',box))})};draw()}
function crPractice(box,m){const d=document.createElement('div');d.innerHTML=`<div class="card"><div class="eyebrow">Constructed response</div><h3 style="margin-top:4px">Write it, then mark it</h3><p class="note">Level III rewards short, precise, justified answers. Write as you would on the exam, then reveal the model answer and tick the points you earned.</p>${m.cr.map((c,k)=>`<div style="margin:14px 0;padding-top:10px;border-top:1px solid var(--line)"><p><b>${k+1}. ${c.q}</b> <span class="pill">${c.pts.length} points</span></p><textarea data-ca="${k}" style="min-height:120px" placeholder="Your answer…"></textarea><div class="ctl"><button class="sbtn alt" data-show="${k}">Show model answer</button></div><div data-mod="${k}" hidden><div class="model"><b>Model answer.</b> ${c.model}</div><div class="rubric">${c.pts.map((p2,j)=>`<label><input type="checkbox" data-sc="${k}"><span>${p2}</span></label>`).join('')}</div><div class="note" data-tot="${k}"></div></div></div>`).join('')}</div>`;box.appendChild(d);
  $$('[data-show]',d).forEach(b=>b.onclick=()=>{const k=b.dataset.show;$(`[data-mod="${k}"]`,d).hidden=false;b.remove();logEvent('cr',m.id,'Constructed response attempted')});
  $$('[data-sc]',d).forEach(x=>x.onchange=()=>{const k=x.dataset.sc,all=$$(`[data-sc="${k}"]`,d),n=all.filter(y=>y.checked).length;$(`[data-tot="${k}"]`,d).textContent=`Self-score: ${n} of ${all.length}`})}
function stepRead(box,m){box.innerHTML=`<div class="card reading"><h3>Reading list</h3><p class="note">Short, high-yield sources. Some HBR articles need a subscription; the library or a free monthly article usually covers it.</p>${m.read.map(r=>`<a href="${r.u}" ${r.u.startsWith('#')?'':'target="_blank" rel="noopener"'}><b>${esc(r.t)}</b><small class="muted">${esc(r.s)}${r.n?' · '+esc(r.n):''}</small></a>`).join('')}</div>`}

/* ---------- spaced repetition (Leitner, 7 boxes) ---------- */
const IVL=[0,1,3,7,14,30,60];
function addCards(m){(m.srs||[]).forEach((c,i)=>{const k=m.id+'-'+i;if(!state.srs[k])state.srs[k]={b:0,due:Date.now()}});save()}
function cardOf(k){const [id,i]=k.split('-');const m=M[id];return m&&m.srs&&m.srs[+i]?{m,c:m.srs[+i]}:null}
function dueCards(){const now=Date.now();return Object.keys(state.srs||{}).filter(k=>state.srs[k].due<=now&&cardOf(k))}
function vReview(){const q=dueCards().sort(()=>Math.random()-.5);const total=Object.keys(state.srs).length;let i=0,n=0;
  const draw=()=>{if(i>=q.length){view().innerHTML=`<h1>Review</h1><div class="card" style="text-align:center"><div class="big">${n?'Done for now ✓':'Nothing due'}</div><p class="note">${n?`You reviewed ${n} card${n===1?'':'s'}. `:''}${total} cards in your deck. ${total?'Next due: '+nextDue():'Finish a mission’s concept cards to add some.'}</p></div>${deckTable()}`;renderTop();return}
    const {m,c}=cardOf(q[i]);view().innerHTML=`<h1>Review</h1><p class="note">${q.length-i} left · Leitner spacing: 1, 3, 7, 14, 30, 60 days</p><div class="card flash"><div class="eyebrow">${esc(m.title)}</div><div class="q" style="margin-top:8px">${c.q}</div><div class="a hide" id="ans">${c.a}${c.en?enT(c.en.q,'<br>'+c.en.a):''}</div></div><div class="ctl" id="rc"><button class="sbtn" id="show" style="flex:1">Show answer</button></div>`;
    $('#show').onclick=()=>{$('#ans').classList.remove('hide');$('#rc').innerHTML=[['Again',0],['Hard',1],['Good',2],['Easy',3]].map(([t,g])=>`<button class="sbtn ${g===2?'':'alt'}" style="flex:1" data-g="${g}">${t}</button>`).join('');$$('#rc button').forEach(b=>b.onclick=()=>{grade(q[i],+b.dataset.g);n++;i++;draw()})}};draw()}
function grade(k,g){const s=state.srs[k];if(g===0){s.b=0;s.due=Date.now()+10*60e3}else{s.b=Math.max(1,Math.min(6,s.b+(g===1?0:g===2?1:2)));s.due=Date.now()+IVL[s.b]*DAY*(g===1?.6:1)}state.reviews=(state.reviews||0)+1;logEvent('review',k.split('-')[0],['Again','Hard','Good','Easy'][g]);addXP(2)}
function nextDue(){const ds=Object.values(state.srs).map(s=>s.due).filter(d=>d>Date.now()).sort((a,b)=>a-b);return ds.length?new Date(ds[0]).toLocaleString('en-GB',{weekday:'short',hour:'2-digit',minute:'2-digit'}):'—'}
function deckTable(){const by={};Object.entries(state.srs).forEach(([k,s])=>{by[s.b]=(by[s.b]||0)+1});if(!Object.keys(by).length)return'';return`<div class="card"><h3>Your deck by box</h3><div class="grid g4 g2m">${IVL.map((d,b)=>`<div class="stat"><small>Box ${b} · ${d?d+' d':'new'}</small><b>${by[b]||0}</b></div>`).join('')}</div></div>`}

/* ---------- weekly goals ---------- */
const GDEF={missions:2,reviews:30,minutes:180,actions:3};
function goalsOf(wk){wk=wk||weekKey();if(!state.goals[wk]){const prev=Object.keys(state.goals).sort().pop();state.goals[wk]={t:Object.assign({},GDEF,prev?state.goals[prev].t:{}),items:[]}}return state.goals[wk]}
function weekProgress(){const ws=weekStart(),g=goalsOf();const L=(state.log||[]).filter(l=>l.t>=ws);let mins=0;Object.entries(state.mins||{}).forEach(([d,s])=>{if(new Date(d+'T12:00').getTime()>=ws)mins+=s/60});
  return{g,v:{missions:L.filter(l=>l.type==='complete').length,reviews:L.filter(l=>l.type==='review').length,minutes:Math.round(mins),actions:L.filter(l=>['apply','outreach'].includes(l.type)).length}}}
const GN={missions:'Missions completed',reviews:'Cards reviewed',minutes:'Minutes of focused study',actions:'Career actions (applications, outreach)'};
function goalBars(w){const keys=Object.keys(GN);const all=keys.every(k=>w.v[k]>=w.g.t[k]);if(all&&!FOLLOW&&!state.badges.goals){state.badges.goals=Date.now();setTimeout(()=>{confetti();toast('✅ All weekly targets hit!')},500);save()}
  return keys.map(k=>`<div style="margin:8px 0"><div class="row" style="font-size:.88rem"><span>${GN[k]}</span><span class="spacer"></span><b>${w.v[k]} / ${w.g.t[k]}</b></div><div class="prog"><i style="width:${Math.min(100,w.v[k]/Math.max(1,w.g.t[k])*100)}%"></i></div></div>`).join('')+(w.g.items.length?`<small class="muted">${w.g.items.filter(x=>x.done).length}/${w.g.items.length} personal goals done</small>`:'')}
function vGoals(){const w=weekProgress(),g=w.g;
  view().innerHTML=`<a href="#/more" class="note">← More</a><h1>Weekly goals</h1><p class="note">Week of ${new Date(weekStart()).toLocaleDateString('en-GB',{day:'numeric',month:'long'})}. Targets carry forward to next week.</p>
  <div class="card"><h3>Progress</h3>${goalBars(w)}</div>
  <div class="card"><h3>Targets</h3><div class="grid g2">${Object.keys(GN).map(k=>`<div><label class="f">${GN[k]}</label><input class="tin" type="number" min="0" inputmode="numeric" data-k="${k}" value="${g.t[k]}"></div>`).join('')}</div></div>
  <div class="card"><h3>Personal goals this week</h3><p class="note">E.g. "Rebuild Monday's storyline using the pyramid", "Ask my manager for feedback on one slide".</p><div id="gl">${g.items.map((x,i)=>`<div class="goal ${x.done?'done':''}"><input type="checkbox" data-i="${i}" ${x.done?'checked':''}><span>${esc(x.t)}</span><button class="sbtn alt sm" data-d="${i}">✕</button></div>`).join('')||'<p class="note">No personal goals yet.</p>'}</div><div class="ctl"><input class="tin" id="ng" placeholder="Add a goal" style="flex:1"><button class="sbtn" id="ag">Add</button></div></div>`;
  $$('input[data-k]').forEach(x=>x.onchange=()=>{g.t[x.dataset.k]=Math.max(0,+x.value||0);save();vGoals()});
  $$('#gl input[type=checkbox]').forEach(x=>x.onchange=()=>{g.items[+x.dataset.i].done=x.checked;if(x.checked){addXP(10);logEvent('goal','week',g.items[+x.dataset.i].t)}save();vGoals()});
  $$('#gl [data-d]').forEach(x=>x.onclick=()=>{g.items.splice(+x.dataset.d,1);save();vGoals()});
  const add=()=>{const v=$('#ng').value.trim();if(!v)return;g.items.push({t:v,done:false});save();vGoals()};$('#ag').onclick=add;$('#ng').onkeydown=e=>{if(e.key==='Enter')add()}}

/* ---------- case of the week ---------- */

/* ---------- more, badges, journal ---------- */
function vBadges(){view().innerHTML=`<a href="#/more" class="note">← More</a><h1>Badges</h1><div class="badgegrid">${BADGES.map(([k,e,n])=>`<div class="bdg ${state.badges[k]?'on':''}"><div class="e">${e}</div><small>${n}${state.badges[k]?'<br><span class="muted">'+new Date(state.badges[k]).toLocaleDateString('en-GB')+'</span>':''}</small></div>`).join('')}</div>`}
function vJournal(){const r=reflStore();const ids=Object.keys(r).filter(id=>M[id]).sort((a,b)=>r[b].t-r[a].t);
  view().innerHTML=`<a href="#/more" class="note">← More</a><h1>Reflections</h1><p class="note">${state.settings.shareRefl?'Shared: these sync to your Follow page.':'Private: stored only on this device. Change in Settings.'}</p>${ids.map(id=>{const m=M[id];const p=m.reflect||['Most useful idea','Where I will apply it','Still unclear'];return`<div class="card"><div class="row"><h3 style="margin:0">${esc(m.title)}</h3><span class="spacer"></span><small class="muted">${new Date(r[id].t).toLocaleDateString('en-GB')}</small></div>${r[id].a.map((a,j)=>a?`<p><b class="muted" style="font-size:.85rem">${esc(p[j]||'')}</b><br>${esc(a)}</p>`:'').join('')}</div>`}).join('')||'<p class="note">No reflections yet.</p>'}`}

/* ---------- settings ---------- */
function linkFor(page){const b=btoa(unescape(encodeURIComponent(JSON.stringify({u:SYNC.url,k:SYNC.key}))));return location.origin+location.pathname.replace(/[^/]*$/,'')+page+'#sync='+b}

/* ---------- follow (read-only parent view) ---------- */

/* ---------- small widgets used by labs ---------- */
function numIn(id,label,val,o={}){return`<div><label class="f" for="${id}">${label}</label><input class="tin" type="number" inputmode="decimal" id="${id}" value="${val}" ${o.step?`step="${o.step}"`:'step="any"'} ${o.min!=null?`min="${o.min}"`:''}></div>`}
const V=(id,r=document)=>{const x=$('#'+id,r);return x?parseFloat(x.value)||0:0};
function bars(data,o={}){/* data:[{l,v,c}] */const W=560,H=o.h||220,pad=34,bw=(W-pad*2)/data.length;const mx=Math.max(...data.map(d=>Math.abs(d.v)),1e-9)*1.15;const mn=Math.min(0,...data.map(d=>d.v))*1.15;const y=v=>H-24-(v-mn)/(mx-mn)*(H-40);
  return`<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img"><line x1="${pad}" x2="${W-pad}" y1="${y(0)}" y2="${y(0)}" stroke="var(--line)"/>${data.map((d,i)=>{const x=pad+i*bw+bw*.15,h=Math.abs(y(d.v)-y(0));return`<rect x="${x}" y="${Math.min(y(d.v),y(0))}" width="${bw*.7}" height="${Math.max(1,h)}" rx="3" fill="${d.c||'var(--gold2)'}"/><text x="${x+bw*.35}" y="${Math.min(y(d.v),y(0))-5}" text-anchor="middle" style="fill:var(--ink);font-weight:600">${o.f?o.f(d.v):fmt(d.v)}</text><text x="${x+bw*.35}" y="${H-8}" text-anchor="middle">${esc(d.l)}</text>`}).join('')}</svg></div>`}

/* ---------- boot ---------- */
