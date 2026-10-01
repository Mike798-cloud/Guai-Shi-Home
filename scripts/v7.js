(function(){
'use strict';
let scene=null,settleTimer=0,raf=0,tx=0,ty=0,cx=0,cy=0;
function decorate(){
  const s=document.querySelector('.scene'); if(!s||s===scene)return; scene=s;
  clearTimeout(settleTimer); cancelAnimationFrame(raf); tx=ty=cx=cy=0;
  if(!s.querySelector('.v7-stage-depth')){
    const d=document.createElement('div'); d.className='v7-stage-depth'; d.setAttribute('aria-hidden','true');
    d.innerHTML='<i class="v7-foreground"></i><i class="v7-lens-glow"></i><i class="v7-grain"></i>'; s.appendChild(d);
  }
  s.classList.remove('v7-settled'); settleTimer=setTimeout(()=>s.classList.add('v7-settled'),4800);
  const art=s.querySelector('.scene-art');
  const move=e=>{if(document.body.classList.contains('low-motion'))return;const r=s.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5);ty=((e.clientY-r.top)/r.height-.5);};
  s.addEventListener('pointermove',move,{passive:true}); s.addEventListener('pointerleave',()=>{tx=ty=0});
  function tick(){cx+=(tx-cx)*.075;cy+=(ty-cy)*.075;s.style.setProperty('--cam-x',cx.toFixed(4));s.style.setProperty('--cam-y',cy.toFixed(4));raf=requestAnimationFrame(tick)} tick();
  if(art){art.addEventListener('load',()=>s.classList.add('v7-loaded'),{once:true}); if(art.complete)s.classList.add('v7-loaded')}
  observeOutcomes(s);
}
function observeOutcomes(s){
  const zone=s.querySelector('.outcomes');if(!zone)return;
  const refine=()=>{if(!zone.classList.contains('ready'))return;[...zone.querySelectorAll('.outcome-prop')].forEach((b,i)=>{b.setAttribute('data-action-index',i+1);b.setAttribute('aria-describedby','v7-action-help')});if(!document.getElementById('v7-action-help')){const x=document.createElement('span');x.id='v7-action-help';x.hidden=true;x.textContent='选择现场处理动作';document.body.appendChild(x)}};
  new MutationObserver(refine).observe(zone,{childList:true,attributes:true,attributeFilter:['class']}); refine();
}
const mo=new MutationObserver(decorate);mo.observe(document.getElementById('app'),{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate);else decorate();
window.addEventListener('beforeunload',()=>cancelAnimationFrame(raf));
})();
