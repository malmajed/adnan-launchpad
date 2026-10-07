/* ============================================================
   Launchpad core (from the launchpad kit)
   1) Cloud sync (Google Sheet via Apps Script web app)
   2) Photo upload to Google Drive (lab notebook)
   3) Online rooms: DUEL (seeded duels + live scores) — turn-based games use DUEL.post/get
   Requirements: a global `state` object, save()/logEvent() helpers, and
   small DOM hooks: #syncStat, #syncDot (status), #photoIn/#photoBtn/#photoMsg/#thumbs (notebook).
   ============================================================ */
/* ---------- profiles (one Sheet, one state per person) ---------- */
const USERS=[{id:'adnan',name:'Adnan'}];
const USER='adnan';
const LSKEY='adl-state';
/* ---------- state helpers ---------- */
let state={progress:{},custom:{},time:{},log:[]};try{state=Object.assign(state,JSON.parse(localStorage.getItem(LSKEY)||'{}'))}catch(e){}
function save(){state.savedAt=Date.now();try{localStorage.setItem(LSKEY,JSON.stringify(state))}catch(e){}schedulePush()}
function logEvent(type,mod,detail){state.log=state.log||[];state.log.push({t:Date.now(),type,mod,detail});if(state.log.length>200)state.log=state.log.slice(-200)}
// App must define renderTop(), renderMap(), renderParent() (can be no-ops) and parentMode.
/* ---------- cloud sync (Google Sheet via Apps Script) ---------- */
const SYNC_DEFAULT={url:'',key:'',akey:''}; // set via the device link or Settings; akey (advisor key) only on the advisor's devices
/* ---------- advisor channel: written only from the Advisor view, read by Adnan's app ---------- */
const ADV0={name:'Dr. Mohammed',notes:[],focus:'',updated:0};
let ADV=Object.assign({},ADV0);try{const a=JSON.parse(localStorage.getItem('adl-advisor')||'null');if(a)ADV=Object.assign({},ADV0,a)}catch(e){}
function setADV(a){if(!a)return;ADV=Object.assign({},ADV0,a);try{localStorage.setItem('adl-advisor',JSON.stringify(ADV))}catch(e){}}
async function advPush(){if(!SYNC.url||!SYNC.akey)throw new Error('Advisor key missing');ADV.updated=Date.now();setADV(ADV);const r=await fetch(SYNC.url,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({key:SYNC.key,akey:SYNC.akey,advisor:ADV})});const j=await r.json();if(j.error)throw new Error(j.error);return j}
let SYNC=Object.assign({},SYNC_DEFAULT);try{const o=JSON.parse(localStorage.getItem('adl-sync')||'null');if(o&&o.url)SYNC=o}catch(e){}
let pushT=null,syncStatus='off',parentMode=false;
function setSyncStatus(s,msg){syncStatus=s;const el=document.getElementById('syncStat');if(el)el.innerHTML=msg;const dot=document.getElementById('syncDot');if(dot)dot.className='syncDot '+s}
function schedulePush(){if(!SYNC.url||!USER)return;clearTimeout(pushT);pushT=setTimeout(pushState,1500)}
async function pushState(){if(!SYNC.url)return;try{setSyncStatus('busy','Saving to Drive…');const r=await fetch(SYNC.url,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({key:SYNC.key,state,device:navigator.platform,user:USER})});const j=await r.json();if(j.error)throw new Error(j.error);setSyncStatus('ok','Saved to Drive '+new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}))}catch(e){setSyncStatus('err','Not saved to Drive: '+e.message)}}
async function pullState(){if(!SYNC.url||!USER)return false;try{setSyncStatus('busy','Loading from Drive…');const r=await fetch(SYNC.url+'?key='+encodeURIComponent(SYNC.key)+'&user='+USER+'&t='+Date.now());const j=await r.json();if(j.error)throw new Error(j.error);if(j.advisor)setADV(j.advisor);
  if(j.state&&(j.state.savedAt||0)>(state.savedAt||0)){state=Object.assign({progress:{},custom:{},time:{},log:[]},j.state);try{localStorage.setItem(LSKEY,JSON.stringify(state))}catch(e){}renderTop();renderMap();if(parentMode)renderParent();setSyncStatus('ok','Loaded from Drive (saved '+new Date(state.savedAt).toLocaleString('en-GB')+')');return true}
  setSyncStatus('ok','Drive is up to date');if((state.savedAt||0)>(j.state?j.state.savedAt||0:0))pushState();return false}catch(e){setSyncStatus('err','Could not reach Drive: '+e.message);return false}}
function saveSyncSettings(){SYNC={url:document.getElementById('syncUrl').value.trim(),key:document.getElementById('syncKey').value.trim(),akey:SYNC.akey||''};try{localStorage.setItem('adl-sync',JSON.stringify(SYNC))}catch(e){}if(SYNC.url)pullState().then(()=>pushState());else setSyncStatus('off','Cloud sync is off')}

/* ---------- lab notebook ---------- */
function setupNotebook(m){const inp=document.getElementById('photoIn'),btn=document.getElementById('photoBtn'),msg=document.getElementById('photoMsg');const draw=()=>{document.getElementById('thumbs').innerHTML=(state.photos||[]).filter(p=>p.mod===m.id).map(p=>`<a href="${p.url}" target="_blank" rel="noopener" title="${new Date(p.t).toLocaleString('en-GB')}"><img src="${p.thumb||''}" alt=""></a>`).join('')};draw();
  btn.onclick=()=>inp.click();inp.onchange=async()=>{const f=inp.files[0];if(!f)return;msg.textContent='Uploading…';try{const [big,thumb]=await Promise.all([shrink(f,1000,0.72),shrink(f,160,0.6)]);const r=await fetch(SYNC.url,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({key:SYNC.key,photo:big,mission:m.id,name:(USER||'')+' '+m.title,user:USER})});const j=await r.json();if(j.error)throw new Error(j.error);(state.photos=state.photos||[]).push({t:Date.now(),mod:m.id,url:j.url,thumb});if(state.photos.length>40)state.photos=state.photos.slice(-40);logEvent('photo',m.id,'Notebook photo');save();draw();msg.textContent='Saved to Drive ✓';toast('📷 Saved to your notebook on Drive')}catch(e){msg.textContent='Could not upload: '+e.message}inp.value=''}}
function shrink(file,max,q){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',q))};img.onerror=rej;img.src=URL.createObjectURL(file)})}

const SHUF=(a,r)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const RNG=seed=>{let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const DUEL={
  code(){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let c='';for(let i=0;i<4;i++)c+=A[Math.floor(Math.random()*A.length)];return c},
  async post(body){const r=await fetch(SYNC.url,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(Object.assign({key:SYNC.key},body))});return r.json()},
  async get(code){const r=await fetch(SYNC.url+'?key='+encodeURIComponent(SYNC.key)+'&game='+code+'&t='+Date.now());return (await r.json()).game},
  async create(game,extra){const code=this.code();const D=Object.assign({},extra||{},{code,game,seed:Math.floor(Math.random()*1e9),names:[(state.name||'Majed'),'?'],guest:false,started:false,p:[{score:0,prog:'',done:false,t:0},{score:0,prog:'',done:false,t:0}],v:0});const r=await this.post({game:code,create:true,data:D});if(!r.ok)throw 'create';return r.game},
  async join(code,name){const g=await this.get(code);if(!g)throw 'Room not found. Check the code.';if(g.guest)throw 'That room is full.';g.names[1]=name||'Player 2';g.guest=true;g.started=true;g.t0=Date.now();const r=await this.post({game:code,v:g.v,data:g});if(!r.ok)throw 'Could not join. Try again.';return r.game},
  // write my slot with conflict retry
  async update(D,me,patch){for(let k=0;k<4;k++){Object.assign(D.p[me],patch);const r=await this.post({game:D.code,v:D.v,data:D});if(r.ok){const mine=D.p[me];Object.assign(D,r.game);D.p[me]=mine;return D}if(r.conflict&&r.game){const mine=Object.assign({},D.p[me]);Object.assign(D,r.game);D.p[me]=mine;continue}throw 'net'}return D},
  poll(D,me,onChange){const id=setInterval(async()=>{try{const g=await this.get(D.code);if(g&&g.v>D.v){const mine=D.p[me];Object.assign(D,g);if(mine&&(mine.score||mine.done))D.p[me]=mine;onChange(D)}}catch(e){}},2500);return()=>clearInterval(id)},
  board(D,me){return`<div class="duelBoard">${[0,1].map(i=>`<div class="${i===me?'me':''}"><b>${i===me?'🧑‍🚀':'🧔'} ${D.names[i]}</b><span class="dsc">${D.p[i].score}</span><small>${D.p[i].done?'✅ finished':(D.p[i].prog||'…')}</small></div>`).join('')}</div>`},
  // lobby UI: renders into box, calls onStart(D,me) on both devices when the game begins
  lobby(box,game,onStart,title,extra){let stop=null;const draw=()=>{box.innerHTML=`<div class="duelLobby"><b>🌐 ${title||'Online duel'}</b> — same challenge, two devices, live scores.<div class="ctl"><button class="sbtn alt" id="dHost">Create a room</button><input id="dCode" class="tin" style="max-width:110px;text-transform:uppercase" maxlength="4" placeholder="CODE"><input id="dName" class="tin" style="max-width:150px" placeholder="your name"><button class="sbtn" id="dJoin">Join</button></div><p class="note" id="dMsg">${SYNC.url?'One player creates the room and shares the 4-letter code.':'Online needs the Drive sync set up.'}</p></div>`;
      box.querySelector('#dHost').onclick=async()=>{try{const D=await DUEL.create(game,typeof extra==='function'?extra():extra);box.innerHTML=`<div class="duelLobby">Room code: <b style="font-size:1.8rem;letter-spacing:4px">${D.code}</b><br>Waiting for the other player to join… <button class="sbtn" id="dCancel">Cancel</button></div>`;box.querySelector('#dCancel').onclick=()=>{if(stop)stop();draw()};stop=DUEL.poll(D,0,g=>{if(g.started){stop();onStart(D,0)}})}catch(e){box.querySelector('#dMsg').textContent='Could not create the room. Check the internet connection.'}};
      box.querySelector('#dJoin').onclick=async()=>{const code=box.querySelector('#dCode').value.trim().toUpperCase(),name=box.querySelector('#dName').value.trim()||'Player 2';if(code.length!==4)return;try{const D=await DUEL.join(code,name);onStart(D,1)}catch(e){box.querySelector('#dMsg').textContent=typeof e==='string'?e:'Could not join. Check the internet connection.'}}};draw();return()=>{if(stop)stop()}},
  // result panel: waits for both, then declares a winner (higher score; tie → lower time)
  result(box,D,me,onAgain){let stop=null;const draw=()=>{const a=D.p[0],b=D.p[1];const both=a.done&&b.done;let txt='';if(both){const w=a.score!==b.score?(a.score>b.score?0:1):(a.t<=b.t?0:1);const tie=a.score===b.score&&a.t===b.t;txt=tie?'🤝 It is a tie!':`🏆 <b>${D.names[w]}</b> wins!`;if(!tie&&w===me&&me===0&&!D._xp){D._xp=1;addXP(30);confetti();toast('🏆 <b>Duel won!</b> +30 XP')}if(!tie&&w===me&&me!==0)confetti();if(!D._log){D._log=1;logEvent('duel',(current&&current.id)||'rooms',D.game+' duel: '+D.names[0]+' '+a.score+' – '+b.score+' '+D.names[1]);save()}}else txt=`⏳ Waiting for <b>${D.names[a.done?1:0]}</b> to finish…`;
      box.innerHTML=`${DUEL.board(D,me)}<div class="readout">${txt}</div><div class="ctl">${both?`<button class="sbtn alt" id="dAgain">Back</button>`:''}</div>`;const ag=box.querySelector('#dAgain');if(ag)ag.onclick=()=>{if(stop)stop();onAgain()};if(both&&stop){stop();stop=null}};draw();if(!(D.p[0].done&&D.p[1].done))stop=DUEL.poll(D,me,draw);return()=>{if(stop)stop()}}
};
