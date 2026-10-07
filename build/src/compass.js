/* ================= Compass: interactive career profiling =================
   Self-report instrument. Five parts: interests, day-in-the-life choices, values,
   skills, open questions. Scores eight career paths open to an EE graduate in KSA.
   Results are a conversation starter for Adnan and his advisor, not a verdict. */

const DIMS={H:'Hands-on hardware',C:'Coding',A:'Analysis & maths',S:'Systems integration',P:'People & persuasion',R:'Research & novelty',O:'Order & rigour'};

const SKILLS=[['cpp','C / C++'],['py','Python'],['mcu','Microcontrollers & peripherals'],['pcb','PCB design (Altium)'],['analog','Analog & power circuits'],['dsp','Signal processing'],['ctrl','Control systems'],['hdl','Digital design (Verilog / VHDL)'],['net','Networking & security'],['ml','ML / computer vision'],['linux','Linux & scripting'],['comm','Presenting & writing'],['jp','Japanese']];
const SKL=['None','Aware','Coursework','Project-level','Confident'];

const PATHS=[
 {id:'emb',name:'Embedded & firmware engineer',what:'Writes the software that runs on the hardware: drivers, real-time code, communication stacks on microcontrollers and embedded Linux.',w:{C:3,H:2,S:1,A:1},need:['cpp','mcu','linux'],sectors:'Defence electronics, industrial automation, IoT, automotive, medical devices',roles:'Embedded Software Engineer, Firmware Engineer, Embedded Systems Engineer',track:'emb'},
 {id:'per',name:'Perception & autonomy engineer',what:'Makes machines sense and understand the world: LiDAR, radar and cameras, point clouds, sensor fusion, robotics and UAV/AV navigation.',w:{A:3,C:2,S:2,R:1,H:1},need:['cpp','py','dsp','ml'],sectors:'UAV and defence, automotive, robotics, smart infrastructure, mapping',roles:'Perception Engineer, Robotics Software Engineer, Sensor Fusion Engineer',track:'per'},
 {id:'hw',name:'Electronics & PCB design engineer',what:'Designs the boards: schematics, component selection, power stages, layout, bring-up and EMC.',w:{H:3,A:1,S:1,O:1},need:['pcb','analog'],sectors:'Defence electronics, telecom equipment, power electronics, consumer and industrial products',roles:'Hardware Design Engineer, Electronics Engineer, PCB Design Engineer',track:'emb'},
 {id:'semi',name:'Semiconductor & digital design engineer',what:'Designs or verifies chips and FPGAs: RTL, verification testbenches, timing, physical design.',w:{A:2,R:2,C:1,O:2},need:['hdl','py'],sectors:'Semiconductor design houses, FPGA-based defence and telecom, national semiconductor initiatives',roles:'FPGA Engineer, Design Verification Engineer, ASIC Design Engineer',track:'ind'},
 {id:'test',name:'Test, validation & reliability engineer',what:'Proves that systems work and keep working: test plans, environmental and qualification testing, integration, failure analysis.',w:{O:3,H:2,S:2,A:1},need:['py','analog','comm'],sectors:'Defence and aerospace, automotive, telecom, energy',roles:'Test Engineer, Validation Engineer, Reliability Engineer, Systems Integration Engineer',track:'emb'},
 {id:'net',name:'Telecom, networks & security engineer',what:'Builds and protects communication systems: networks, wireless, industrial (OT) security.',w:{C:2,S:2,A:1,O:2},need:['net','linux','py'],sectors:'Telecom operators, cybersecurity firms, energy and utilities, government',roles:'Network Engineer, OT Security Engineer, Telecom Engineer',track:'ind'},
 {id:'tech',name:'Technical solutions & product engineer',what:'Bridges customers and engineering: understands the product deeply and explains, adapts and sells it; often with foreign partners.',w:{P:3,S:2,H:1},need:['comm','mcu'],sectors:'Foreign OEMs entering KSA (incl. Japanese), distributors, system integrators',roles:'Applications Engineer, Solutions Engineer, Technical Product Engineer',track:'launch'},
 {id:'grad',name:'Graduate study, then research',what:'A master\'s (and possibly a PhD) to specialise deeply, in KSA or abroad, leading to R&D roles.',w:{R:3,A:3,C:1},need:['py','dsp','comm'],sectors:'Universities, national research centres, corporate R&D labs',roles:'Graduate Researcher, R&D Engineer',track:'ind'}
];
const PATH=Object.fromEntries(PATHS.map(p=>[p.id,p]));

const CQ_INT=[
 ['Soldering, probing and bringing up a new board for the first time',{H:2},{hw:1}],
 ['Writing C that talks directly to hardware registers',{C:1,H:1},{emb:1}],
 ['Hunting a bug that only appears once a day',{C:1,A:1,O:1},{}],
 ['Working through the maths behind an algorithm, such as a filter',{A:2,R:1},{}],
 ['Making several subsystems work together for the first time',{S:2},{test:1}],
 ['Explaining a technical product to a client and answering hard questions',{P:2},{tech:1}],
 ['Designing a careful test plan and running it step by step',{O:2},{test:1}],
 ['Reading research papers about a new technique',{R:2,A:1},{grad:1}],
 ['Laying out a PCB and routing it cleanly',{H:1,O:1},{hw:1}],
 ['Writing Python to analyse and plot sensor data',{C:1,A:1},{}],
 ['Visualising and filtering a LiDAR point cloud',{A:1,C:1,R:1},{per:1}],
 ['Configuring a network and analysing packets in Wireshark',{S:1,C:1},{net:1}],
 ['Leading a small team to a hard deadline',{P:2,O:1},{}],
 ['Writing clear specifications and documentation',{O:2},{}],
 ['Designing digital logic in Verilog or VHDL',{A:1,O:1},{semi:1}],
 ['Taking a prototype outdoors to test it in heat and dust',{H:2},{test:1}],
 ['Presenting results to senior people',{P:2},{}],
 ['Learning Japanese language and culture for work',{P:1},{tech:1,grad:1}],
 ['Squeezing code to fit tight memory and timing limits',{C:2},{emb:1}],
 ['Making a drone or robot navigate on its own',{S:1,A:1},{per:1}]
];
const CQ_SCN=[
 [['Bring up firmware on a new radar control board',['emb','hw']],['Tune a sensor-fusion algorithm so a drone holds position',['per']]],
 [['Run a 72-hour thermal qualification and write the report',['test']],['Design the power stage for the board under test',['hw']]],
 [['Verify a chip block with a SystemVerilog testbench',['semi']],['Harden a factory network against intrusion',['net']]],
 [['Demo the product to a Japanese partner\'s engineers in Tokyo',['tech']],['Write a paper on a new point-cloud method',['grad','per']]],
 [['Fit a detection algorithm onto a microcontroller with 64 KB of RAM',['emb']],['Train a model on a GPU to classify objects',['per','grad']]],
 [['Lead the integration day where five subsystems meet',['test','tech']],['Spend a week alone perfecting one module',['semi','emb','hw']]]
];
const CQ_VAL=[
 ['Large, stable employer','Fast-moving startup or small company',{test:1,semi:1,net:1,hw:1},{per:1,emb:1,tech:1}],
 ['Become a deep specialist','Stay broad and move across areas',{semi:1,per:1,grad:1,emb:1},{tech:1,test:1,net:1}],
 ['Work in a lab or the field with hardware','Work mostly at a screen',{hw:1,test:1,emb:1},{net:1,semi:1,per:1}],
 ['Start earning and gaining experience now','Invest one to two more years in a master\'s',{grad:-1},{grad:2}],
 ['Clear structure and defined tasks','Ambiguity and inventing new things',{test:1,net:1,hw:1},{per:1,grad:1,tech:1}],
 ['Stay in Riyadh','Open to relocate (another city or abroad)',{},{}],
 ['Defence and national-security work appeals to me','I prefer civilian, commercial work',{},{}]
];
const CQ_OPEN=['Which project or task so far made you lose track of time? What exactly were you doing?','What do you want your working life to look like in three years?','What would you not want to do, even if it paid well?','Any constraints we should plan around (location, timing, other commitments)?','Where would you like your advisor\'s help most right now?'];
const CPARTS=[['int','Interests'],['scn','A day in the life'],['val','Values'],['skl','Skills'],['open','In your words']];

/* ---------- scoring (pure: works on any saved compass object) ---------- */
function compassScore(c){if(!c)return null;const a=c.a||{};const out={};
  const dim={};Object.keys(DIMS).forEach(d=>{let s=0,n=0;CQ_INT.forEach((q,i)=>{if(q[1][d]&&a['i'+i]){s+=(a['i'+i]-1)/4*q[1][d];n+=q[1][d]}});dim[d]=n?s/n:null});
  PATHS.forEach(p=>{
    let raw=0,mx=0;CQ_INT.forEach((q,i)=>{const r=a['i'+i];let w=0;for(const d in q[1])w+=q[1][d]*(p.w[d]||0);w+=3*(q[2][p.id]||0);if(!w||!r)return;raw+=(r-3)*w;mx+=2*w});
    const fi=mx?50+50*raw/mx:50;
    let sc=0,sn=0;CQ_SCN.forEach((pr,i)=>{const inA=pr[0][1].includes(p.id),inB=pr[1][1].includes(p.id);if(!inA&&!inB)return;sn++;const ch=a['s'+i];if((ch===0&&inA)||(ch===1&&inB))sc++});
    const fs=sn?100*sc/sn:50;
    let vr=0,vm=0;CQ_VAL.forEach((v,i)=>{const ch=a['v'+i];const x=v[2][p.id]||0,y=v[3][p.id]||0;if(!x&&!y)return;vm+=Math.max(Math.abs(x),Math.abs(y));if(ch===0)vr+=x;if(ch===1)vr+=y});
    const fv=vm?50+50*vr/vm:50;
    const rd=p.need.map(k=>(a['k_'+k]||0)/4);const fr=100*rd.reduce((x,y)=>x+y,0)/rd.length;
    const fit=Math.round(.45*fi+.25*fs+.20*fv+.10*fr);
    const why=CQ_INT.map((q,i)=>({t:q[0],r:a['i'+i]||0,w:Object.keys(q[1]).reduce((s,d)=>s+q[1][d]*(p.w[d]||0),0)+3*(q[2][p.id]||0)})).filter(x=>x.r>=4&&x.w>0).sort((x,y)=>y.w*y.r-x.w*x.r).slice(0,3).map(x=>x.t);
    const scn=CQ_SCN.map((pr,i)=>a['s'+i]!=null&&pr[a['s'+i]][1].includes(p.id)?pr[a['s'+i]][0]:null).filter(Boolean);
    const gaps=p.need.filter(k=>(a['k_'+k]||0)<=2).map(k=>SKILLS.find(s=>s[0]===k)[1]);
    out[p.id]={fit,fi:Math.round(fi),fs:Math.round(fs),fv:Math.round(fv),fr:Math.round(fr),why,scn,gaps}});
  const rank=PATHS.map(p=>p.id).sort((x,y)=>out[y].fit-out[x].fit);
  return{paths:out,rank,dim}}
const cAnswered=c=>{const a=(c&&c.a)||{};return{int:CQ_INT.filter((_,i)=>a['i'+i]).length,scn:CQ_SCN.filter((_,i)=>a['s'+i]!=null).length,val:CQ_VAL.filter((_,i)=>a['v'+i]!=null).length,skl:SKILLS.filter(k=>a['k_'+k[0]]!=null).length,open:CQ_OPEN.filter((_,i)=>(a['o'+i]||'').trim().length>10).length}};
const cTotals={int:CQ_INT.length,scn:CQ_SCN.length,val:CQ_VAL.length,skl:SKILLS.length,open:CQ_OPEN.length};

/* ---------- shared renderers (used by Adnan's app and by the Advisor view) ---------- */
function dimBars(dim){return Object.keys(DIMS).map(d=>{const v=dim[d];return`<div style="margin:6px 0"><div class="row" style="font-size:.86rem"><span>${DIMS[d]}</span><span class="spacer"></span><b>${v==null?'—':Math.round(v*100)}</b></div><div class="prog"><i style="width:${v==null?0:v*100}%"></i></div></div>`}).join('')}
function pathRanking(R,n){return R.rank.slice(0,n||8).map((id,i)=>{const p=PATH[id],r=R.paths[id];return`<div style="margin:9px 0"><div class="row" style="font-size:.92rem;flex-wrap:nowrap"><span>${i+1}. ${esc(p.name)}</span><span class="spacer"></span><b>${r.fit}</b></div><div class="prog"><i style="width:${r.fit}%"></i></div></div>`}).join('')}
function pathCard(R,id,rank){const p=PATH[id],r=R.paths[id];return`<div class="card" style="border-left:4px solid var(--gold2)"><div class="eyebrow">Fit ${r.fit} / 100${rank?' · #'+rank:''}</div><h3 style="margin-top:4px">${esc(p.name)}</h3><p class="note">${esc(p.what)}</p>
  ${r.why.length?`<p style="margin:6px 0"><b>Why it fits you</b></p><ul style="margin-top:0">${r.why.map(w=>`<li>You rated highly: ${esc(w.toLowerCase())}</li>`).join('')}${r.scn.map(s=>`<li>You chose: ${esc(s.toLowerCase())}</li>`).join('')}</ul>`:''}
  ${r.gaps.length?`<p style="margin:6px 0"><b>Skills to build</b></p><p class="note" style="margin-top:0">${r.gaps.map(esc).join(' · ')}</p>`:B('skok','<p class="note"><b>Skills:</b> you already rate yourself project-level or better on the core skills.</p>')}
  <p class="note" style="margin:6px 0 0"><b>Typical titles:</b> ${esc(p.roles)}<br><b>Where in KSA:</b> ${esc(p.sectors)}</p>
  <div class="row note" style="margin-top:8px;gap:12px;font-size:.78rem"><span>Interests ${r.fi}</span><span>Day-in-life ${r.fs}</span><span>Values ${r.fv}</span><span>Skills ready ${r.fr}</span></div></div>`}
function compassValuesHTML(c){const a=(c&&c.a)||{};return CQ_VAL.map((v,i)=>a['v'+i]==null?'':`<div class="note">• ${esc(v[a['v'+i]])}</div>`).join('')}
function compassSkillsHTML(c){const a=(c&&c.a)||{};return`<div class="tablewrap"><table class="t">${SKILLS.map(([k,n])=>`<tr><td>${esc(n)}</td><td>${a['k_'+k]==null?'—':SKL[a['k_'+k]]}</td></tr>`).join('')}</table></div>`}
function compassOpenHTML(c){const a=(c&&c.a)||{};return CQ_OPEN.map((q,i)=>(a['o'+i]||'').trim()?`<p><b class="muted" style="font-size:.85rem">${esc(q)}</b><br>${esc(a['o'+i])}</p>`:'').join('')||'<p class="note">Nothing written yet.</p>'}

/* ---------- Adnan's Compass view ---------- */
function C(){if(!state.compass)state.compass={a:{},part:'int',done:0,hist:[]};if(!state.compass.hist)state.compass.hist=[];return state.compass}
function vCompass(part){const c=C();
  if(part==='results'||(!part&&c.done))return compassResults();
  if(!part&&!Object.keys(c.a).length)return compassIntro();
  part=part||c.part||'int';c.part=part;const n=cAnswered(c);const pi=CPARTS.findIndex(x=>x[0]===part);
  const head=`<div class="row"><a href="#/compass" class="note" onclick="state.compass.part='${part}'">← Compass</a><span class="spacer"></span><small class="muted">Part ${pi+1} of 5</small></div><h1 style="margin-bottom:4px">${CPARTS[pi][1]}</h1>
  <div class="chips" style="margin:8px 0 14px">${CPARTS.map(([k,nm])=>`<button class="chip ${k===part?'on':''}" onclick="go('#/compass/${k}')">${nm} ${n[k]}/${cTotals[k]}</button>`).join('')}</div>`;
  let body='';const a=c.a;
  if(part==='int')body=`<p class="note">${B('int','How much would you <b>enjoy</b> each activity? Not how good you are at it; that comes later. 1 = would avoid, 5 = would love it.')}</p>${CQ_INT.map((q,i)=>`<div class="card" style="padding:12px 14px;margin:8px 0"><div style="font-size:.95rem;margin-bottom:8px">${esc(q[0])}</div><div class="conf">${[1,2,3,4,5].map(v=>`<button data-k="i${i}" data-v="${v}" class="${a['i'+i]===v?'on':''}">${v}</button>`).join('')}</div></div>`).join('')}`;
  if(part==='scn')body=`<p class="note">Two realistic days at work. Pick the one you would rather have, even if both sound fine.</p>${CQ_SCN.map((pr,i)=>`<div class="card" style="padding:12px 14px"><div class="eyebrow">Choice ${i+1}</div>${pr.map((o,j)=>`<button class="qopt ${a['s'+i]===j?'right':''}" data-k="s${i}" data-v="${j}">${esc(o[0])}</button>`).join('')}</div>`).join('')}`;
  if(part==='val')body=`<p class="note">Which is closer to you right now? There are no right answers.</p>${CQ_VAL.map((v,i)=>`<div class="card" style="padding:12px 14px">${[0,1].map(j=>`<button class="qopt ${a['v'+i]===j?'right':''}" data-k="v${i}" data-v="${j}">${esc(v[j])}</button>`).join('')}</div>`).join('')}`;
  if(part==='skl')body=`<p class="note">Be honest: this is for planning, not grading. 0 = none, 1 = aware of it, 2 = coursework, 3 = used it in a real project, 4 = confident.</p>${SKILLS.map(([k,nm])=>`<div class="card" style="padding:12px 14px;margin:8px 0"><div class="row" style="margin-bottom:8px"><span style="font-size:.95rem">${esc(nm)}</span><span class="spacer"></span><small class="muted" id="lbl_${k}">${a['k_'+k]==null?'':SKL[a['k_'+k]]}</small></div><div class="conf">${[0,1,2,3,4].map(v=>`<button data-k="k_${k}" data-v="${v}" class="${a['k_'+k]===v?'on':''}">${v}</button>`).join('')}</div></div>`).join('')}`;
  if(part==='open')body=`<p class="note">A few honest sentences each. Your advisor reads these, so write what is true, not what sounds good.</p>${CQ_OPEN.map((q,i)=>`<label class="f">${esc(q)}</label><textarea data-o="o${i}" placeholder="Write freely…">${esc(a['o'+i]||'')}</textarea>`).join('')}`;
  const next=CPARTS[pi+1];
  view().innerHTML=head+body+`<div class="ctl">${pi?`<button class="sbtn alt" onclick="go('#/compass/${CPARTS[pi-1][0]}')">← Back</button>`:''}<span class="spacer"></span>${next?`<button class="sbtn" id="cnext">Next: ${next[1]} →</button>`:`<button class="sbtn gold" id="cfin">See my results →</button>`}</div><p class="note" id="cmsg"></p>`;
  $$('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k,v=+b.dataset.v;a[k]=v;$$(`[data-k="${k}"]`).forEach(x=>{x.classList.toggle('on',x===b);if(x.classList.contains('qopt'))x.classList.toggle('right',x===b)});const l=$('#lbl_'+k.slice(2));if(l)l.textContent=SKL[v];save();
    const cs=b.closest('.card'),nx=cs&&cs.nextElementSibling;if(nx&&nx.classList.contains('card')&&part==='int'&&!$$('[data-k]',nx).some(x=>x.classList.contains('on')))nx.scrollIntoView({behavior:'smooth',block:'center'})});
  $$('[data-o]').forEach(t=>t.oninput=()=>{a[t.dataset.o]=t.value;clearTimeout(t._t);t._t=setTimeout(save,800)});
  const nb=$('#cnext');if(nb)nb.onclick=()=>{save();go('#/compass/'+next[0])};
  const fb=$('#cfin');if(fb)fb.onclick=()=>{$$('[data-o]').forEach(t=>a[t.dataset.o]=t.value);const k=cAnswered(c);const miss=CPARTS.filter(([p])=>p!=='open'&&k[p]<cTotals[p]).map(x=>x[1]);
    if(miss.length){$('#cmsg').innerHTML=`Almost there. Still unanswered in: <b>${miss.join(', ')}</b>.`;return}
    const R=compassScore(c);const first=!c.done;c.done=Date.now();c.hist.push({t:Date.now(),top:R.rank.slice(0,3).map(id=>[id,R.paths[id].fit])});if(c.hist.length>12)c.hist=c.hist.slice(-12);
    logEvent('compass','compass','Top paths: '+R.rank.slice(0,3).map(id=>PATH[id]._en||PATH[id].name).join(', '));if(first)addXP(60);else save();checkBadges();go('#/compass/results')}}
function compassIntro(){view().innerHTML=`<div class="eyebrow">Compass</div><h1>Find the work that fits you</h1>
  <div class="card">${B('cintro','<p>Before choosing a direction, Compass maps what you <b>enjoy</b>, how you like to <b>work</b>, what you <b>value</b>, and what you can <b>already do</b>. It then scores eight career paths open to an electrical engineer in Saudi Arabia.</p><ul><li><b>Five short parts</b>, about 15 minutes. Your answers save as you go.</li><li><b>No right answers.</b> It works only if you answer as you are, not as you think you should be.</li><li><b>It is a starting point.</b> The results open a conversation with your advisor; they do not decide for you.</li><li>You can retake it any time; your advisor sees how your answers change.</li></ul>')}
  <div class="ctl"><button class="sbtn gold" onclick="go('#/compass/int')">Start Compass →</button></div></div>
  <div class="card"><h3>The eight paths</h3>${PATHS.map(p=>`<p style="margin:8px 0"><b>${esc(p.name)}</b><br><span class="note">${esc(p.what)}</span></p>`).join('')}</div>`}
function compassResults(){const c=C();const R=compassScore(c);if(!R){go('#/compass/int');return}const top=R.rank.slice(0,3);const gap=R.paths[top[0]].fit-R.paths[top[1]].fit;const foc=ADV.focus&&PATH[ADV.focus];
  view().innerHTML=`<div class="row"><div class="eyebrow">Compass results · ${new Date(c.done).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div><span class="spacer"></span><button class="sbtn alt sm" onclick="go('#/compass/int')">Edit answers</button></div><h1>Your top paths</h1>
  <p class="note">${gap<5?B('close',`Your top two paths are close (${R.paths[top[0]].fit} vs ${R.paths[top[1]].fit}). That is useful information: talk to people doing both jobs before choosing.`,{a:R.paths[top[0]].fit,b:R.paths[top[1]].fit}):B('clear',`<b>${esc(PATH[top[0]].name)}</b> stands out for you. Test it against reality: speak to two people doing this job.`,{p:esc(PATH[top[0]].name)})}</p>
  ${foc?`<div class="card" style="background:var(--goldsoft);border:0"><div class="eyebrow">Your advisor's suggested focus</div><b>${esc(foc.name)}</b></div>`:''}
  ${top.map((id,i)=>pathCard(R,id,i+1)).join('')}
  <div class="grid g2"><div class="card"><h3>All eight paths</h3>${pathRanking(R)}</div><div class="card"><h3>How you like to work</h3><p class="note" style="margin-top:0">From your interest ratings, 0–100.</p>${dimBars(R.dim)}</div></div>
  <div class="card"><h3>What next</h3>${B('next',`<ol><li>Open <a href="#/m/l02">Choose a direction</a> to turn these results into a decision memo.</li><li>Add two people doing your top path to <a href="#/pipeline/net">Network</a> and ask for a 20-minute call.</li><li>Start the track that closes your biggest skill gap: <a href="#/track/${PATH[top[0]].track}">${esc(TRACKS.find(x=>x.id===PATH[top[0]].track).name)}</a>.</li></ol>`,{tr:PATH[top[0]].track,tn:esc(TRACKS.find(x=>x.id===PATH[top[0]].track).name)})}</div>
  ${c.hist.length>1?`<div class="card"><h3>How your results changed</h3>${c.hist.slice().reverse().map(h=>`<div class="note">${new Date(h.t).toLocaleDateString('en-GB')} · ${h.top.map(([id,f])=>esc(PATH[id].name)+' '+f).join(' · ')}</div>`).join('')}</div>`:''}
  <p class="note">Compass is self-report. It reflects how you see yourself today; experience will sharpen it.</p>`}
