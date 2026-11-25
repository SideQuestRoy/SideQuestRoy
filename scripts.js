/* SideQuestRoy — shared enhancements. Core navigation works without this file. */
document.documentElement.classList.add('js');
(function(){
"use strict";
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- TOAST ---------------- */
let toastTimer=null;
function toast(msg){
  const t=$('#toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2400);
}

/* ---------------- CURSOR SPARKLE TRAIL ---------------- */
if(!RM){
  let last=0; const colors=['#FFE459','#F43B86','#ffffff'];
  document.addEventListener('pointermove',e=>{
    const t=performance.now(); if(t-last<48)return; last=t;
    if(document.querySelectorAll('.spark').length>26)return;
    const s=document.createElement('span'); s.className='spark'; s.textContent=Math.random()<.3?'✦':'·';
    s.style.left=(e.clientX-4)+'px'; s.style.top=(e.clientY-4)+'px';
    s.style.setProperty('--c',colors[Math.floor(Math.random()*colors.length)]);
    s.style.setProperty('--fs',(9+Math.random()*8)+'px');
    document.body.appendChild(s); setTimeout(()=>s.remove(),820);
  });
}

/* ---------------- SCROLL REVEAL ---------------- */
const io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} }),{threshold:.15});
$$('.rv').forEach(el=>io.observe(el));

/* ---------------- MISC BUTTONS ---------------- */
$$('#wishList button').forEach(b=>b.addEventListener('click',()=>b.classList.toggle('lit')));
$$('.dl-fake').forEach(b=>b.addEventListener('click',()=>toast('nice try!! the full track lives in the player above ★')));
const topBtn=$('#topBtn'); if(topBtn) topBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:RM?'auto':'smooth'}));
const yrEl=$('#yr'); if(yrEl) yrEl.textContent=new Date().getFullYear();

/* ---------------- GUESTBOOK (home only) ---------------- */
if($('#gbList')){
  const KEY='sr_guest'; let entries=[];
  try{ entries=JSON.parse(localStorage.getItem(KEY)||'null')||[]; }catch(e){}
  const listEl=$('#gbList');
  function makeGB(n,d,m){
    const el=document.createElement('div'); el.className='gb-entry';
    const b=document.createElement('b'); b.textContent=n;
    const dspan=document.createElement('span'); dspan.className='d'; dspan.textContent=d;
    const p=document.createElement('p'); p.textContent=m;
    el.append(b,dspan,p); return el;
  }
  entries.slice(-5).forEach(e=>listEl.prepend(makeGB(e.n, e.d, e.m)));
  $('#gbForm').addEventListener('submit',ev=>{
    ev.preventDefault();
    const n=$('#gName').value.trim(), m=$('#gMsg').value.trim();
    if(!n||!m) return;
    entries.push({n,m,d:fmtJP(Date.now())});
    try{localStorage.setItem(KEY,JSON.stringify(entries));}catch(e){}
    listEl.prepend(makeGB(n,fmtJP(Date.now()),m));
    $('#gName').value='';$('#gMsg').value='';
    toast('signed!! welcome to the site ★');
  });
}

/* ---------------- DIARY / BLOG (diary page only) ---------------- */
if($('#dForm')){
  const DKEY='sr_diary'; let saved=[];
  try{ saved=JSON.parse(localStorage.getItem(DKEY)||'null')||[]; }catch(e){}
  const listEl=$('#diaryList');

  function makeEntry(p,isNew){
    const art=document.createElement('article'); art.className='entry'; art.dataset.ts=p.dateISO;
    const head=document.createElement('div'); head.className='entry-head';
    const chip=document.createElement('span'); chip.className='dchip'; chip.textContent=fmtJP(p.ts);
    const b=document.createElement('b'); b.textContent=p.t;
    head.append(chip,b);
    if(isNew){ const nb=document.createElement('span'); nb.className='new-badge blink'; nb.textContent='NEW!'; head.appendChild(nb); }
    const body=document.createElement('div'); body.className='entry-body'; body.textContent=p.b;
    art.append(head,body); return art;
  }

  /* user's saved posts appear above the built-in entries */
  saved.forEach(p=>listEl.prepend(makeEntry(p,true)));

  function updateStats(){
    const all=listEl.querySelectorAll('.entry');
    $('#stTotal').textContent=all.length;
    const m=new Date().getMonth(), y=new Date().getFullYear(); let c=0;
    all.forEach(e=>{ if(!e.dataset.ts) return; const d=new Date(e.dataset.ts); if(d.getMonth()===m&&d.getFullYear()===y)c++; });
    $('#stMonth').textContent=c;
  }
  updateStats();

  const today=new Date(), dDate=$('#dDate');
  dDate.value=today.toISOString().slice(0,10);

  $('#dForm').addEventListener('submit',ev=>{
    ev.preventDefault();
    const t=$('#dTitle').value.trim(), b=$('#dBody').value.trim(), msg=$('#dMsg');
    if(!t||!b){ msg.textContent='!! need a title AND some words'; msg.className='fmsg err'; $('#dForm').classList.add('shake'); setTimeout(()=>$('#dForm').classList.remove('shake'),350); return; }
    let ts=Date.now(); const dv=dDate.value?new Date(dDate.value+'T12:00:00'):null;
    if(dv && !isNaN(dv)) ts=dv.getTime();
    const p={t,b,ts,dateISO:new Date(ts).toISOString().slice(0,10)};
    saved.push(p);
    try{localStorage.setItem(DKEY,JSON.stringify(saved));}catch(e){}
    listEl.prepend(makeEntry(p,true));
    $('#dTitle').value='';$('#dBody').value=''; dDate.value=today.toISOString().slice(0,10);
    msg.textContent='★ posted!! scroll down ↓'; msg.className='fmsg ok';
    updateStats(); toast('diary entry saved to this browser ★');
  });
}

/* ---------------- AUDIO ENGINE — chiptunes (music page only) ---------------- */
if($('#tracklist')){
  const TRACKS={
    'menu-loop-v3':{bpm:126,wave:'square',lead:[[76,1],[79,1],[81,.75],[79,.25],[84,1.5],[81,.5],[79,1],[76,1],[null,1]],bass:[[48,2],[53,2],[55,2],[48,2]]},
    'side-quest-theme':{bpm:138,wave:'square',lead:[[74,1],[77,1],[81,1],[83,.5],[81,.5],[79,1],[77,.5],[74,.5]],bass:[[48,2],[53,2],[55,2],[57,2]]},
    'rainy-save-point':{bpm:76,wave:'triangle',lead:[[69,2],[72,1],[76,1.5],[74,.5],[71,2],[null,1],[67,2],[69,1],[72,1.5],[74,.5],[null,3]],bass:[[36,2],[39,2],[41,2],[43,2],[36,2],[39,2],[41,2],[43,2]]},
    'first-demo':{bpm:90,wave:'square',lead:[[72,.5],[72,.5],[76,.5],[76,.5],[79,.5],[79,.5],[81,.5],[81,.5],[81,.5],[79,.5],[76,.5],[76,.5],[72,1.5],[null,.5]],bass:[[48,8]]}
  };

  let AC=null, MASTER=null;
  function ac(){ if(!AC){ const C=window.AudioContext||window.webkitAudioContext; AC=new C(); MASTER=AC.createGain(); MASTER.gain.value=.9; MASTER.connect(AC.destination);} if(AC.state==='suspended')AC.resume(); return AC; }
  const m2f=m=>440*Math.pow(2,(m-69)/12);
  function note(ctx,freq,t,dur,wave,peak,nodes){
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type=wave; o.frequency.value=freq;
    g.gain.setValueAtTime(0.0001,t);
    g.gain.linearRampToValueAtTime(peak,t+.02);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur*.95);
    o.connect(g); g.connect(MASTER); o.start(t); o.stop(t+dur+.06);
    nodes.push({o,g});
  }
  function schedulePass(ctx,seq,bass,bpm,wave,nodes){
    const beat=60/bpm, t0=ctx.currentTime+.05; let off=0;
    (seq||[]).forEach(n=>{ const m=n[0],d=n[1]; if(m!=null) note(ctx,m2f(m),t0+off*beat,Math.max(.1,d*.9)*beat,wave,.13,nodes); off+=d; });
    off=0;
    (bass||[]).forEach(n=>{ const m=n[0],d=n[1]; if(m!=null) note(ctx,m2f(m),t0+off*beat,Math.max(.15,d*.85)*beat,'triangle',.1,nodes); off+=d; });
  }

  let cur={id:null,startedAt:0,total:0,nodes:[],timer:null}, progRAF=null;
  function fmtLen(s){const m=Math.floor(s/60),ss=Math.round(s%60);return '0:'+String(ss).padStart(2,'0');}
  function stopAll(){
    if(cur.timer)clearTimeout(cur.timer);
    cur.nodes.forEach(n=>{ try{n.g.gain.setTargetAtTime(0.0001,AC.currentTime,.02); n.o.stop(AC.currentTime+.1);}catch(e){} });
    cur={id:null,startedAt:0,total:0,nodes:[],timer:null};
    $$('.trow').forEach(r=>r.classList.remove('on'));
    $('#npTitle').textContent='— nothing yet, pick a track below —'; $('#npTime').textContent='';
    $('#progFill').style.width='0%'; $('#eq').classList.remove('on');
  }
  function toggleTrack(id){
    const t=TRACKS[id]; if(!t)return;
    if(cur.id===id){ stopAll(); return; }
    const ctx=ac(); stopAll();
    const total=t.lead.reduce((s,n)=>s+n[1],0)*(60/t.bpm);
    cur={id,startedAt:ctx.currentTime+.05,total,nodes:[],timer:null};
    schedulePass(ctx,t.lead,t.bass,t.bpm,t.wave,cur.nodes);
    const loop=()=>{ if(cur.id===id) toggleTrack(id); };
    cur.timer=setTimeout(loop, total*1000-60);
    $$('.trow').forEach(r=>r.classList.toggle('on',r.dataset.id===id));
    $('#npTitle').textContent='♪ playing: '+id.replace(/-/g,' ');
    $('#eq').classList.add('on');
    const tick=()=>{
      if(!cur.id)return;
      const el=Math.min(1,(ctx.currentTime-cur.startedAt)/cur.total);
      $('#progFill').style.width=(el*100)+'%';
      const e=Math.max(0,Math.floor(ctx.currentTime-cur.startedAt));
      $('#npTime').textContent=fmtLen(e)+' / '+fmtLen(cur.total);
      progRAF=requestAnimationFrame(tick);
    };
    if(progRAF)cancelAnimationFrame(progRAF); tick();
  }

  $$('#tracklist .trow').forEach(row=>{
    const act=()=>toggleTrack(row.dataset.id);
    row.addEventListener('click',act);
    row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act();}});
  });
  $('#bigPlay').addEventListener('click',()=>{ if(cur.id) stopAll(); else toast('pick a track from the list below ↓'); });
  $$('.playlink').forEach(b=>b.addEventListener('click',()=>toggleTrack(b.dataset.id)));
}

/* ---------------- COMPARE SLIDER (art page only) ---------------- */
if($('#cmpBox')){
  const box=$('#cmpBox'), h=$('#cmpHandle'); let dragging=false;
  function setSplit(pct){ pct=Math.max(5,Math.min(95,pct)); box.style.setProperty('--split',pct+'%'); h.setAttribute('aria-valuenow',Math.round(pct)); }
  function fromEvent(e){ const r=box.getBoundingClientRect(); setSplit((e.clientX-r.left)/r.width*100); }
  h.addEventListener('pointerdown',e=>{dragging=true;h.setPointerCapture(e.pointerId);});
  box.addEventListener('pointerdown',fromEvent);
  window.addEventListener('pointermove',e=>{if(dragging)fromEvent(e);});
  window.addEventListener('pointerup',()=>dragging=false);
  h.addEventListener('keydown',e=>{
    const cur=parseFloat(getComputedStyle(box).getPropertyValue('--split'))||55;
    if(e.key==='ArrowLeft'){setSplit(cur-3);e.preventDefault();}
    if(e.key==='ArrowRight'){setSplit(cur+3);e.preventDefault();}
  });
}

/* ---------------- LIGHTBOX (art page only) ---------------- */
if($('#galGrid')){
  const cards=$$('#galGrid .gcard');
  const items=cards.map(c=>({seed:c.dataset.seed,title:c.dataset.title,meta:c.dataset.meta}));
  const lb=$('#lb'), img=$('#lbImg'); let idx=0,lastFocus=null;
  function show(i){ idx=(i+items.length)%items.length; const it=items[idx];
    img.src='https://picsum.photos/seed/'+it.seed+'/860/580'; img.alt=it.title;
    $('#lbCap').textContent=it.title; $('#lbMeta').textContent=it.meta.toUpperCase(); }
  function open(i){ lastFocus=document.activeElement; show(i); lb.classList.add('show'); document.body.style.overflow='hidden'; $('#lbClose').focus(); }
  function close(){ lb.classList.remove('show'); document.body.style.overflow=''; if(lastFocus)lastFocus.focus(); }
  cards.forEach((c,i)=>c.addEventListener('click',()=>open(i)));
  $('#lbClose').addEventListener('click',close);
  $('#lbPrev').addEventListener('click',e=>{e.stopPropagation();show(idx-1);});
  $('#lbNext').addEventListener('click',e=>{e.stopPropagation();show(idx+1);});
  lb.addEventListener('click',e=>{if(e.target===lb)close();});
  document.addEventListener('keydown',e=>{ if(!lb.classList.contains('show'))return;
    if(e.key==='Escape')close(); if(e.key==='ArrowLeft')show(idx-1); if(e.key==='ArrowRight')show(idx+1); });
}

/* ---------------- shared date formatting (JP style) ---------------- */
function fmtJP(ts){const d=new Date(ts),DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return d.getFullYear()+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+String(d.getDate()).padStart(2,'0')+' ['+DOW[d.getDay()]+']';}
})();
