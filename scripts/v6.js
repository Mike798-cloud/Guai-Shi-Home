(function(){
'use strict';
/* V9 keeps the old V6 diegetic-hotspot enhancer, but ambient audio is now owned
   exclusively by app.js. This avoids two simultaneous loops and keeps settings
   synchronized with the current V9 save key. */
function enhanceScene(){
  const scene=document.querySelector('.scene');
  if(!scene||scene.dataset.v6fx)return;
  scene.dataset.v6fx='1';
  const hideable='.paper,.agenda,.signsheet,.receipt,.rules,.fee-slip,.meetup-note,.routepaper,.checklist,.form-sheet,.radio,.photo-stack,.slope-sign,.toolbox,.tuesday,.timeline button,.labels,.menu,.scan,.long-form,.box,.room,.turn-form,.witness,.checkitem';
  scene.querySelectorAll(hideable).forEach(el=>el.classList.add('v6-diegetic-hotspot'));
  scene.querySelectorAll('button,[role=button]').forEach(el=>{
    if(el.closest('.outcomes')||el.classList.contains('floor-btn')||el.classList.contains('checkitem')||el.classList.contains('witness')||el.classList.contains('switch'))return;
    el.classList.add('v6-hotzone');
  });
  const fx=document.createElement('div');fx.className='v6-fx';fx.setAttribute('aria-hidden','true');
  for(let i=0;i<7;i++){const p=document.createElement('i');p.className='v6-dust';p.style.setProperty('--x',`${8+(i*17)%84}%`);p.style.setProperty('--y',`${14+(i*19)%70}%`);p.style.setProperty('--d',`${6+(i%3)*1.8}s`);p.style.setProperty('--dl',`${-(i%4)*1.4}s`);fx.appendChild(p)}
  const beam=document.createElement('i');beam.className='v6-light-sweep';fx.appendChild(beam);scene.appendChild(fx);
}
new MutationObserver(enhanceScene).observe(document.getElementById('app'),{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhanceScene);else enhanceScene();
})();
