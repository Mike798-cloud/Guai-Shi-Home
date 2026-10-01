(function(){
'use strict';
const POS={
1:[[31,64],[56,72],[79,60]],2:[[24,60],[54,72],[78,54]],3:[[25,69],[55,77],[78,57]],4:[[30,62],[59,72],[80,56]],5:[[25,65],[57,72],[79,56]],
6:[[24,65],[53,75],[80,61]],7:[[24,61],[54,73],[79,58]],8:[[29,66],[58,74],[79,57]],9:[[25,62],[57,72],[78,57]],10:[[25,64],[55,73],[80,59]],
11:[[27,64],[56,72],[79,58]],12:[[25,65],[56,75],[80,58]],13:[[23,64],[54,73],[82,59]],14:[[24,64],[57,73],[80,57]],15:[[26,62],[56,73],[80,56]],
16:[[24,64],[55,73],[79,58]],17:[[25,63],[54,73],[80,58]],18:[[27,65],[58,73],[80,57]],19:[[25,65],[55,74],[81,59]],20:[[24,63],[55,73],[81,57]]
};
/* Tiny real-time light pass. It does not replace the authored image; it gives the
   miniature set a moving key/fill response so interaction no longer feels pasted on. */
const LIGHTS={
  default:[{x:.27,y:.24,r:.56,c:[255,207,129],a:.032},{x:.78,y:.34,r:.48,c:[124,178,199],a:.018}],
  2:[{x:.52,y:.15,r:.46,c:[132,171,201],a:.030}],3:[{x:.66,y:.30,r:.44,c:[118,211,198],a:.026},{x:.22,y:.58,r:.38,c:[255,183,91],a:.018}],
  5:[{x:.72,y:.34,r:.38,c:[190,219,208],a:.030}],9:[{x:.30,y:.34,r:.44,c:[255,184,92],a:.040},{x:.76,y:.54,r:.42,c:[255,221,160],a:.018}],
  12:[{x:.52,y:.12,r:.64,c:[190,222,236],a:.040}],13:[{x:.50,y:.26,r:.58,c:[92,144,188],a:.030},{x:.72,y:.62,r:.35,c:[255,182,84],a:.018}],
  15:[{x:.73,y:.16,r:.43,c:[188,213,255],a:.052},{x:.22,y:.66,r:.46,c:[89,127,171],a:.020}],19:[{x:.50,y:.17,r:.60,c:[173,209,221],a:.026}],
  20:[{x:.38,y:.28,r:.48,c:[255,196,108],a:.034},{x:.72,y:.38,r:.40,c:[116,183,174],a:.021}]
};
let current=null,raf=0,particles=[],ctx2d=null,canvas=null,last=0,seed=9,hoverDepth=0,burst=[],sceneObserver=null,outcomeObserver=null,resizeObserver=null;
let pointerLight={x:.5,y:.5,a:0};
const app=document.getElementById('app');
const testMode=()=>document.documentElement.dataset.gswTest==='1';
const v10Mode=()=>document.documentElement.dataset.v10==='1';
const lowMotion=()=>document.body.classList.contains('low-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function eventId(){return +(document.body.dataset.event||0)}
function setupParticles(id,w,h){
  particles=[];seed=900+id;const compact=w<760;
  const add=(n,type)=>{n=compact?Math.ceil(n*.58):n;for(let i=0;i<n;i++)particles.push({type,x:rnd()*w,y:rnd()*h,vx:(rnd()-.5)*.18,vy:.12+rnd()*.32,s:.5+rnd()*1.7,a:.08+rnd()*.22,t:rnd()*8})};
  if(id===12)add(38,'rain');else if(id===9)add(10,'steam');else if(id===15)add(24,'star');else if(id===13)add(12,'city');else if(id===1||id===10||id===20)add(9,'paper');else if(id===2)add(1,'marble');else if(id===6)add(4,'ring');else if(id===16)add(10,'ping');else add(10,'dust');
}
function resize(){
  if(!canvas||!current||!current.isConnected)return;
  const r=current.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);
  canvas.width=Math.max(1,Math.floor(r.width*d));canvas.height=Math.max(1,Math.floor(r.height*d));canvas.style.width=r.width+'px';canvas.style.height=r.height+'px';
  ctx2d=testMode()?null:canvas.getContext('2d');setupParticles(eventId(),r.width,r.height);if(!ctx2d)return;ctx2d.setTransform(d,0,0,d,0,0);startLoop();
}
function iHash(v){return Math.abs(Math.sin(v*12.9898)*43758.5453)%1}
function radial(x,y,r,c,a,w,h){
  const g=ctx2d.createRadialGradient(x*w,y*h,0,x*w,y*h,r*Math.max(w,h));
  g.addColorStop(0,`rgba(${c[0]},${c[1]},${c[2]},${a})`);g.addColorStop(.45,`rgba(${c[0]},${c[1]},${c[2]},${a*.42})`);g.addColorStop(1,`rgba(${c[0]},${c[1]},${c[2]},0)`);ctx2d.fillStyle=g;ctx2d.fillRect(0,0,w,h);
}
function drawLighting(now,w,h){
  const id=eventId(),preset=LIGHTS[id]||LIGHTS.default,pulse=.92+.08*Math.sin(now*.00043);
  ctx2d.save();ctx2d.globalCompositeOperation='screen';
  for(const l of preset)radial(l.x,l.y,l.r,l.c,l.a*pulse,w,h);
  if(pointerLight.a>.004){radial(pointerLight.x,pointerLight.y,.18,[255,218,153],.052*pointerLight.a,w,h);pointerLight.a*=.90}
  ctx2d.restore();
}
function renderFrame(t){
  if(!current||!current.isConnected||!ctx2d||document.hidden||lowMotion()){raf=0;return}
  const now=t||0;if(last&&now-last<32){raf=requestAnimationFrame(renderFrame);return}
  const dt=Math.min(48,now-last||32);last=now;const r=current.getBoundingClientRect(),w=r.width,h=r.height;ctx2d.clearRect(0,0,w,h);drawLighting(now,w,h);
  for(const p of particles){p.t+=dt*.001;
    if(p.type==='rain'){p.y+=dt*.65;p.x+=dt*.08;if(p.y>h+20){p.y=-20;p.x=rnd()*w}ctx2d.strokeStyle='rgba(176,211,232,.22)';ctx2d.lineWidth=.7;ctx2d.beginPath();ctx2d.moveTo(p.x,p.y);ctx2d.lineTo(p.x-4,p.y+17);ctx2d.stroke()}
    else if(p.type==='steam'){p.y-=dt*.018;p.x+=Math.sin(p.t*1.6)*.08;if(p.y<h*.28){p.y=h*.68+rnd()*h*.08;p.x=w*(.30+rnd()*.35)}ctx2d.fillStyle=`rgba(255,238,201,${p.a})`;ctx2d.beginPath();ctx2d.arc(p.x,p.y,4+p.s*4,0,Math.PI*2);ctx2d.fill()}
    else if(p.type==='star'){const a=.08+.16*(.5+.5*Math.sin(p.t*1.6));ctx2d.fillStyle=`rgba(240,232,203,${a})`;ctx2d.beginPath();ctx2d.arc(p.x,p.y*.48,Math.max(.5,p.s*.75),0,Math.PI*2);ctx2d.fill()}
    else if(p.type==='city'){p.x-=dt*(.025+.03*p.s);if(p.x<0)p.x=w;ctx2d.fillStyle=`rgba(245,190,91,${p.a})`;ctx2d.fillRect(p.x,h*(.38+.22*(iHash(p.t)%1)),2+p.s*2,1+p.s)}
    else if(p.type==='paper'){p.y+=dt*.005*Math.sin(p.t);p.x+=Math.sin(p.t*1.2)*.06;ctx2d.save();ctx2d.translate(p.x,p.y);ctx2d.rotate(Math.sin(p.t)*.12);ctx2d.fillStyle=`rgba(226,215,184,${p.a*.7})`;ctx2d.fillRect(-3,-2,6,4);ctx2d.restore()}
    else if(p.type==='marble'){const x=w*(.22+.56*((p.t*.09)%1)),y=h*(.60-.06*Math.abs(Math.sin(p.t*2.7)));ctx2d.fillStyle='rgba(161,201,224,.55)';ctx2d.beginPath();ctx2d.arc(x,y,3.4,0,Math.PI*2);ctx2d.fill()}
    else if(p.type==='ring'){const rr=7+((p.t*22)%32);ctx2d.strokeStyle=`rgba(232,195,103,${Math.max(0,.15-rr/300)})`;ctx2d.beginPath();ctx2d.arc(w*(.20+p.x/w*.55),h*.64,rr,0,Math.PI*2);ctx2d.stroke()}
    else if(p.type==='ping'){const y=h*(.30+.42*((p.t*.045+p.y/h)%1));ctx2d.fillStyle=`rgba(108,216,205,${p.a})`;ctx2d.beginPath();ctx2d.arc(w*.50+Math.sin(p.t)*w*.16,y,1.5+p.s,0,Math.PI*2);ctx2d.fill()}
    else{p.y-=dt*.004;if(p.y<0)p.y=h;ctx2d.fillStyle=`rgba(235,222,190,${p.a*.55})`;ctx2d.beginPath();ctx2d.arc(p.x,p.y,Math.max(.5,p.s*.7),0,Math.PI*2);ctx2d.fill()}
  }
  for(let i=burst.length-1;i>=0;i--){const b=burst[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=.0008*dt;b.life-=dt*.0028;if(b.life<=0){burst.splice(i,1);continue}ctx2d.fillStyle=`rgba(255,220,150,${.34*b.life})`;ctx2d.beginPath();ctx2d.arc(b.x,b.y,b.s*(.6+b.life*.5),0,Math.PI*2);ctx2d.fill()}
  raf=requestAnimationFrame(renderFrame);
}
function startLoop(){if(raf||!ctx2d||document.hidden||lowMotion())return;last=0;raf=requestAnimationFrame(renderFrame)}
function stopLoop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0}
function setFocus(el,zoom=1.095){if(!current||lowMotion())return;const r=current.getBoundingClientRect(),q=el.getBoundingClientRect(),nx=((q.left+q.width/2-r.left)/r.width-.5),ny=((q.top+q.height/2-r.top)/r.height-.5);current.style.setProperty('--v9-tx',`${(-nx*22).toFixed(1)}px`);current.style.setProperty('--v9-ty',`${(-ny*14).toFixed(1)}px`);current.style.setProperty('--v9-zoom',String(zoom))}
function resetFocus(){if(!current)return;hoverDepth=Math.max(0,hoverDepth-1);if(hoverDepth)return;current.style.setProperty('--v9-tx','0px');current.style.setProperty('--v9-ty','0px');current.style.setProperty('--v9-zoom','1.055')}
function trackPointer(e){if(!current)return;const r=current.getBoundingClientRect();pointerLight.x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));pointerLight.y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}
function freeParallax(e){trackPointer(e);if(!current||hoverDepth||lowMotion())return;const r=current.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;current.style.setProperty('--v9-tx',`${(-nx*6).toFixed(1)}px`);current.style.setProperty('--v9-ty',`${(-ny*4).toFixed(1)}px`)}
function addBurst(e){if(!current||!ctx2d||lowMotion())return;const r=current.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;pointerLight.x=x/r.width;pointerLight.y=y/r.height;pointerLight.a=1;for(let i=0;i<7;i++){const a=(Math.PI*2*i/7)+rnd()*.35;burst.push({x,y,vx:Math.cos(a)*(0.25+rnd()*.35),vy:Math.sin(a)*(0.25+rnd()*.35),life:1,s:1+rnd()*1.7})}startLoop()}
function labelFor(el){return (el.getAttribute('aria-label')||el.dataset.label||el.textContent||'检查').replace(/\s+/g,' ').trim().slice(0,28)}
function bindInteraction(el,scene){if(!el||el.dataset.v9Bound==='1')return;el.dataset.v9Bound='1';el.addEventListener('pointerenter',e=>{trackPointer(e);hoverDepth++;setFocus(el,el.classList.contains('outcome-prop')?1.075:1.105)});el.addEventListener('focus',()=>{hoverDepth++;setFocus(el,1.09)});el.addEventListener('pointerleave',resetFocus);el.addEventListener('blur',resetFocus);el.addEventListener('pointerdown',e=>{trackPointer(e);addBurst(e);scene.classList.add('v9-react');setTimeout(()=>scene.isConnected&&scene.classList.remove('v9-react'),260)})}
function makeHotspot(el){if(!el||el.classList.contains('outcome-prop')||el.classList.contains('return-tab')||el.classList.contains('v8-hotspot'))return;el.classList.add('v8-hotspot');if(getComputedStyle(el).position==='static')el.style.position='relative';const ring=document.createElement('i');ring.className='v8-hotspot-ring';ring.setAttribute('aria-hidden','true');ring.style.left='50%';ring.style.top='50%';el.appendChild(ring);const lab=document.createElement('span');lab.className='v8-object-label';lab.textContent=labelFor(el);lab.setAttribute('aria-hidden','true');el.appendChild(lab)}
function tuneOutcomes(scene){const id=eventId(),zone=scene.querySelector('.outcomes');if(!zone)return;const apply=()=>{if(!zone.classList.contains('ready'))return;[...zone.querySelectorAll('.outcome-prop')].forEach((b,i)=>{const p=(POS[id]||[[25,66],[55,76],[80,62]])[i]||[50,70];b.style.setProperty('left',p[0]+'%','important');b.style.setProperty('top',p[1]+'%','important');b.style.setProperty('right','auto','important');b.style.setProperty('bottom','auto','important');b.style.setProperty('transform','translate(-50%,-50%)','important');b.dataset.actionIndex=String(i+1);if(!b.getAttribute('aria-label'))b.setAttribute('aria-label',b.textContent.trim());bindInteraction(b,scene)});scene.classList.add('v9-choosing')};outcomeObserver?.disconnect();outcomeObserver=new MutationObserver(apply);outcomeObserver.observe(zone,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});apply()}
function decorate(){
  const s=document.querySelector('.scene');if(!s||s===current)return;stopLoop();resizeObserver?.disconnect();outcomeObserver?.disconnect();particles=[];burst=[];hoverDepth=0;pointerLight={x:.5,y:.5,a:0};current=s;s.classList.add('v9-stage');
  const art=s.querySelector('.scene-art');if(art){art.loading='eager';art.decoding='async'}
  s.querySelectorAll('button,[role="button"],.prop,.anomaly,.evidence,.sound-node').forEach(makeHotspot);
  if(!v10Mode()){canvas=document.createElement('canvas');canvas.className='v9-fx';if(testMode())canvas.dataset.testMode='1';canvas.setAttribute('aria-hidden','true');s.appendChild(canvas);resize()}else{canvas=null;ctx2d=null;}
  const obsTargets=s.querySelectorAll('button,[role="button"],.prop,.anomaly,.evidence,.sound-node,.outcome-prop');obsTargets.forEach(el=>bindInteraction(el,s));s.addEventListener('pointermove',freeParallax,{passive:true});s.addEventListener('pointerleave',()=>{hoverDepth=0;resetFocus()});
  tuneOutcomes(s);resetFocus();if('ResizeObserver' in window){resizeObserver=new ResizeObserver(resize);resizeObserver.observe(s)}setTimeout(()=>s.isConnected&&s.classList.add('v9-settled'),2200);startLoop();
}
let decorateQueued=false;sceneObserver=new MutationObserver(()=>{if(decorateQueued)return;decorateQueued=true;requestAnimationFrame(()=>{decorateQueued=false;decorate()})});sceneObserver.observe(app,{childList:true,subtree:true});window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>document.hidden?stopLoop():startLoop());new MutationObserver(()=>{if(lowMotion())stopLoop();else startLoop()}).observe(document.body,{attributes:true,attributeFilter:['class']});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate);else decorate();window.addEventListener('beforeunload',()=>{stopLoop();sceneObserver?.disconnect();outcomeObserver?.disconnect();resizeObserver?.disconnect()});
})();
