(function(){
  'use strict';
  const app=document.getElementById('app');
  const subtitle=document.getElementById('subtitle');
  const toast=document.getElementById('toast');
  const btnOffice=document.getElementById('btn-office');
  const btnWall=document.getElementById('btn-wall');
  const btnSettings=document.getElementById('btn-settings');
  const CONTENT=window.GSW_CONTENT;
  const SAVE_KEY='guaishiwu-save-v10', LEGACY_KEY_9='guaishiwu-save-v9', LEGACY_KEY_8='guaishiwu-save-v8', LEGACY_KEY_7='guaishiwu-save-v7', LEGACY_KEY_6='guaishiwu-save-v6', LEGACY_KEY_5='guaishiwu-save-v5', LEGACY_KEY_4='guaishiwu-save-v4', LEGACY_KEY_3='guaishiwu-save-v3', LEGACY_KEY='guaishiwu-save-v2', LEGACY_KEY_1='guaishiwu-save-v1';
  let currentView='street', replayMode=false, audioCtx=null, ambientAudio=null, ambientName='', audioSystem=null, officeFresh=false, activeEvent=null, speechAnchor=null;

  const defaults=()=>({
    save_version:10,started:false,current_event:1,completed:[],outcomes:{},flags:{},
    stats:{chair_spins:0,fridge_first_streak:0,unplug_count:0,rest_choice:0,literal_count:0,remember_help:0,office_found_early:0,office_found_before_hint:0,office_returns:0},
    achievements:[],settings:{fx:true,ambience:true,music:true,lowMotion:false,largeText:false},play_seconds:0,last_saved:Date.now()
  });
  function migrate(raw){
    const d=defaults(),r=(raw&&typeof raw==='object')?raw:{},s=Object.assign({},d,r);
    s.flags=(r.flags&&typeof r.flags==='object')?Object.assign({},r.flags):{};
    s.stats=Object.assign({},d.stats,(r.stats&&typeof r.stats==='object')?r.stats:{});
    const old=(r.settings&&typeof r.settings==='object')?r.settings:{};s.settings=Object.assign({},d.settings,old);
    if(typeof old.sound==='boolean'){s.settings.fx=old.sound;s.settings.ambience=old.sound;s.settings.music=old.sound}
    s.completed=[...new Set((Array.isArray(r.completed)?r.completed:[]).map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=20))].sort((a,b)=>a-b);
    s.achievements=[...new Set(Array.isArray(r.achievements)?r.achievements.filter(x=>typeof x==='string'):[])];
    s.outcomes=(r.outcomes&&typeof r.outcomes==='object'&&!Array.isArray(r.outcomes))?Object.assign({},r.outcomes):{};
    s.current_event=Math.max(1,Math.min(21,Number(r.current_event)||1));s.started=!!r.started;s.play_seconds=Math.max(0,Number(r.play_seconds)||0);
    s.save_version=10;return s;
  }
  function load(){
    try{
      const raw10=localStorage.getItem(SAVE_KEY);if(raw10)return migrate(JSON.parse(raw10));
      const raw9=localStorage.getItem(LEGACY_KEY_9);if(raw9){const s=migrate(JSON.parse(raw9));localStorage.setItem(SAVE_KEY,JSON.stringify(s));return s}
      const raw8=localStorage.getItem(LEGACY_KEY_8);if(raw8){const s=migrate(JSON.parse(raw8));localStorage.setItem(SAVE_KEY,JSON.stringify(s));return s}
      const raw7=localStorage.getItem(LEGACY_KEY_7);if(raw7){const s=migrate(JSON.parse(raw7));localStorage.setItem(SAVE_KEY,JSON.stringify(s));return s}
      const raw6=localStorage.getItem(LEGACY_KEY_6);if(raw6){const s=migrate(JSON.parse(raw6));localStorage.setItem(SAVE_KEY,JSON.stringify(s));return s}
      const raw5=localStorage.getItem(LEGACY_KEY_5);if(raw5){const s=migrate(JSON.parse(raw5));localStorage.setItem(SAVE_KEY,JSON.stringify(s));return s}
      const raw4=localStorage.getItem(LEGACY_KEY_4);if(raw4){const s=migrate(JSON.parse(raw4));localStorage.setItem(SAVE_KEY,JSON.stringify(s));return s}
      const raw3=localStorage.getItem(LEGACY_KEY_3);if(raw3){const s=migrate(JSON.parse(raw3));localStorage.setItem(SAVE_KEY,JSON.stringify(s));return s}
      const raw2=localStorage.getItem(LEGACY_KEY);if(raw2){const s=migrate(JSON.parse(raw2));localStorage.setItem(SAVE_KEY,JSON.stringify(s));return s}
      const raw1=localStorage.getItem(LEGACY_KEY_1);if(raw1){const s=migrate(JSON.parse(raw1));localStorage.setItem(SAVE_KEY,JSON.stringify(s));return s}
    }catch(_e){}
    return defaults();
  }
  let state=load();
  audioSystem=window.GSW_AUDIO?.create?.(()=>state.settings)||null;
  function save(){state.last_saved=Date.now();try{localStorage.setItem(SAVE_KEY,JSON.stringify(state))}catch(_e){}}
  function applySettings(){document.body.classList.toggle('low-motion',!!state.settings.lowMotion);document.body.classList.toggle('large-text',!!state.settings.largeText)}
  applySettings();

  function positionSpeech(){
    if(currentView!=='event'||!speechAnchor||!speechAnchor.isConnected||innerWidth<760){subtitle.classList.remove('anchored');subtitle.style.removeProperty('--sx');subtitle.style.removeProperty('--sy');return}
    const r=speechAnchor.getBoundingClientRect(),bw=Math.min(440,innerWidth*.54),x=Math.max(bw/2+24,Math.min(innerWidth-bw/2-24,r.left+r.width/2)),topSpace=r.top>190,y=topSpace?r.top-14:r.bottom+14;
    subtitle.classList.add('anchored');subtitle.style.setProperty('--sx',`${x}px`);subtitle.style.setProperty('--sy',`${Math.max(100,Math.min(innerHeight-70,y))}px`);subtitle.classList.toggle('below',!topSpace);
  }
  function say(text,ms=5400){subtitle.textContent=text;positionSpeech();if(audioSystem)audioSystem.duck(ms);else if(ambientAudio&&state.settings.ambience!==false){clearTimeout(say._duck);try{ambientAudio.volume=Math.min(ambientAudio.volume,.075)}catch(_e){};say._duck=setTimeout(()=>{if(ambientAudio){try{ambientAudio.volume=.13}catch(_e){}}},Math.min(ms,4600))}clearTimeout(say._t);say._t=setTimeout(()=>{if(subtitle.textContent===text){subtitle.textContent='';subtitle.classList.remove('anchored','below')}},ms)}
  function showToast(text){toast.textContent=text;toast.classList.add('show');clearTimeout(showToast._t);showToast._t=setTimeout(()=>toast.classList.remove('show'),2700)}
  const AUDIO_SAMPLES={paper:'paper_v103.wav',printer:'printer_v103.wav',lift:'lift_v103.wav',marble:'marble_v103.wav',bike:'bike_v103.wav',bus:'bus_v103.wav',rain:'rain_v103.wav',moon:'moon_v103.wav',cat:'cat_v103.wav',vending:'vending_v103.wav',chat:'chat_v103.wav',door:'door_v103.wav',kettle:'kettle_v103.wav',plate:'plate_v103.wav',stamp:'stamp_v103.wav',tape:'tape_v103.wav'};
  const AMBIENCE_SAMPLES={street:'street_room_v103.wav',office:'office_room_v103.wav',building:'building_night_v103.wav',machine:'machine_room_v103.wav',meeting:'meeting_room_v103.wav',elevator:'elevator_room_v103.wav',warehouse:'warehouse_room_v103.wav',breakfast:'breakfast_room_v103.wav',rainroom:'rain_room_v103.wav',busroom:'bus_room_v103.wav',hotel:'hotel_room_v103.wav',roof:'roof_room_v103.wav'};
  function setAmbience(name='office'){
    if(audioSystem){ambientName=name;audioSystem.setAmbience(name);return}
    if(ambientName===name&&ambientAudio)return;ambientName=name;
    const previous=ambientAudio;ambientAudio=null;
    if(state.settings.ambience===false){if(previous){try{previous.pause()}catch(_e){}}return}
    const f=AMBIENCE_SAMPLES[name];if(!f){if(previous){try{previous.pause()}catch(_e){}}return}
    try{
      const a=new Audio(`assets/audio_v103/${f}`);a.loop=true;a.preload='auto';a.volume=0;ambientAudio=a;a.play().catch(()=>{});
      let step=0;const steps=8;const timer=setInterval(()=>{step++;const t=step/steps;if(ambientAudio===a)a.volume=.13*t;if(previous){try{previous.volume=.13*(1-t)}catch(_e){}}if(step>=steps){clearInterval(timer);if(previous){try{previous.pause()}catch(_e){}}}},55);
    }catch(_e){if(previous){try{previous.pause()}catch(__e){}}}
  }
  function syncAmbience(){if(audioSystem){audioSystem.sync();return}if(state.settings.ambience===false){if(ambientAudio){ambientAudio.pause();ambientAudio=null}}else if(ambientName){const n=ambientName;ambientName='';setAmbience(n)}}
  function setSceneAudio(view,eventId=0,name='office'){if(audioSystem)audioSystem.setScene(view,eventId,name);else setAmbience(name)}
  function sound(kind='tap',channel='fx'){
    if(state.settings[channel]===false)return;if(audioSystem){audioSystem.sound(kind,channel);return}
    try{
      if((location.protocol==='http:'||location.protocol==='https:'||location.protocol==='file:')&&AUDIO_SAMPLES[kind]){
        const sample=new Audio(`assets/audio_v103/${AUDIO_SAMPLES[kind]}`);sample.preload='auto';sample.volume=channel==='ambience'?.16:channel==='music'?.12:.24;if(['paper','stamp','tape','plate','marble','bike','door'].includes(kind))sample.playbackRate=.97+Math.random()*.06;sample.play().catch(()=>{});
      }
      if(!audioCtx){const AC=window.AudioContext||window.webkitAudioContext;try{audioCtx=new AC({latencyHint:'interactive',sampleRate:48000})}catch(_e){audioCtx=new AC()}}
      if(audioCtx.state==='suspended')audioCtx.resume();
      const now=audioCtx.currentTime;
      const tone=(f,d,v=.025,type='sine',delay=0)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(f,now+delay);o.connect(g);g.connect(audioCtx.destination);g.gain.setValueAtTime(v,now+delay);g.gain.exponentialRampToValueAtTime(.0001,now+delay+d);o.start(now+delay);o.stop(now+delay+d+.01)};
      const noise=(d=.08,v=.018,cut=1600,delay=0)=>{const n=Math.max(1,Math.floor(audioCtx.sampleRate*d)),buf=audioCtx.createBuffer(1,n,audioCtx.sampleRate),data=buf.getChannelData(0);for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*(1-i/n);const src=audioCtx.createBufferSource(),f=audioCtx.createBiquadFilter(),g=audioCtx.createGain();src.buffer=buf;f.type='lowpass';f.frequency.value=cut;g.gain.value=v;src.connect(f);f.connect(g);g.connect(audioCtx.destination);src.start(now+delay)};
      switch(kind){
        case 'paper':noise(.12,.022,2300);tone(210,.05,.01,'triangle',.03);break;
        case 'printer':tone(92,.16,.025,'square');tone(126,.08,.018,'square',.12);noise(.18,.015,1200,.04);break;
        case 'wrong':tone(118,.14,.035,'sawtooth');break;
        case 'lift':tone(760,.12,.028,'sine');tone(1040,.16,.016,'triangle',.08);break;
        case 'marble':tone(910,.055,.023,'sine');tone(1260,.045,.014,'sine',.045);break;
        case 'bike':tone(740,.045,.025,'sine');tone(980,.07,.016,'sine',.04);break;
        case 'bus':tone(350,.09,.021,'triangle');tone(270,.11,.013,'triangle',.08);break;
        case 'wind':noise(.28,.008,620);break;
        case 'success':tone(650,.1,.024,'sine');tone(870,.14,.018,'triangle',.09);break;
        case 'office':tone(292,.16,.012,'sine');tone(390,.17,.009,'triangle',.09);break;
        case 'street':tone(392,.11,.011,'sine');tone(523,.14,.008,'triangle',.07);break;
        case 'scene':tone(330,.08,.008,'sine');tone(440,.1,.006,'triangle',.06);break;
        case 'weather':tone(520,.045,.012,'sine');tone(780,.04,.009,'triangle',.035);noise(.06,.004,2400);break;
        case 'rain':noise(.42,.016,3400);tone(310,.09,.006,'sine',.05);break;
        case 'moon':tone(420,.22,.012,'sine');tone(630,.28,.008,'sine',.08);tone(840,.34,.004,'sine',.15);break;
        case 'cat':tone(760,.07,.018,'triangle');tone(920,.05,.012,'triangle',.06);break;
        case 'vending':tone(130,.08,.018,'square');tone(168,.06,.015,'square',.07);tone(84,.12,.01,'square',.13);break;
        case 'chat':tone(880,.035,.012,'sine');tone(1040,.03,.008,'triangle',.04);break;
        case 'door':tone(92,.1,.016,'triangle');noise(.09,.01,850,.03);break;
        case 'kettle':tone(510,.04,.010,'sine');noise(.08,.008,2100,.02);break;
        case 'plate':tone(1140,.035,.012,'triangle');tone(760,.05,.007,'sine',.025);break;
        case 'stamp':noise(.055,.016,1250);tone(160,.045,.010,'triangle',.015);break;
        case 'tape':noise(.09,.012,1850);tone(260,.035,.006,'triangle',.045);break;
        default:tone(440,.035,.028,'sine');
      }
    }catch(_e){}
  }
  const getEvent=id=>CONTENT.events[id-1]; const has=flag=>!!state.flags[flag];
  function bump(key,n=1){state.stats[key]=(state.stats[key]||0)+n;save();checkAchievements()}
  function markInteraction(key){state.stats['i_'+key]=(state.stats['i_'+key]||0)+1}
  function setControls(show=true){const n=document.getElementById('system-controls');n.style.display=show?'flex':'none';btnOffice.style.display=(currentView==='event'&&activeEvent!==1)||currentView==='wall'||currentView==='archive'?'block':'none';btnWall.style.display=currentView==='office'?'block':'none'}

  function clearSpeechAnchor(){speechAnchor=null;subtitle.classList.remove('anchored','below');subtitle.style.removeProperty('--sx');subtitle.style.removeProperty('--sy')}
  function bindSceneMotion(scene){
    if(!scene)return;const move=e=>{if(state.settings.lowMotion)return;const x=(e.clientX/innerWidth-.5),y=(e.clientY/innerHeight-.5);scene.style.setProperty('--mx',x.toFixed(3));scene.style.setProperty('--my',y.toFixed(3))};scene.addEventListener('pointermove',move,{passive:true});scene.addEventListener('pointerleave',()=>{scene.style.setProperty('--mx',0);scene.style.setProperty('--my',0)});
  }
  function transitionIn(scene){if(!scene)return;scene.classList.add('scene-entering');requestAnimationFrame(()=>requestAnimationFrame(()=>scene.classList.remove('scene-entering')))}

  function renderStreet(){
    document.body.classList.remove('choosing');document.body.dataset.scene='street';delete document.body.dataset.event;currentView='street';activeEvent=null;replayMode=false;clearSpeechAnchor();setControls(false);subtitle.textContent='';
    app.innerHTML=`<section class="scene street-start"><img class="scene-art" src="assets/scenes_v9/street.jpg" alt="" aria-hidden="true"><div class="street-cloud"></div><div class="wire-bird">⌁⌁</div><div class="neighbor left" data-label="宠物店"></div><div class="neighbor right" data-label="五金店"></div><div class="storefront"><div class="awning"></div><div class="shop-sign">怪事屋</div><div class="shop-sub">承接各类解释不清，但又不太值得报警的事情<br><small>特别严重的请先报警。</small></div><button class="shop-door" id="enterShop" aria-label="推门进入怪事屋"><i class="door-knob"></i></button></div></section>`;
    const streetScene=app.querySelector('.street-start');bindSceneMotion(streetScene);transitionIn(streetScene);setSceneAudio('street',0,'street');document.getElementById('enterShop').addEventListener('click',()=>{sound('door','fx');sound('street','music');state.started=true;save();renderOffice(true)});
    say('街角夹着一家很小的事务所。老板说你今天开始试用，门没锁。',6500);
  }

  const triggerMap={1:'printer',2:'phone',3:'door',4:'phone',5:'paper',6:'door',7:'phone',8:'mail',9:'door',10:'paper',11:'phone',12:'door',13:'phone',14:'phone',15:'door',16:'computer',17:'paper',18:'door',19:'phone',20:'mail'};
  const triggerWords={printer:'桌上的打印机在装死。入职表还卡在里面。',phone:'固定电话正在响。',door:'门外有人，已经敲了第三次。',mail:'门缝下面滑进来一份新东西。',paper:'老板在你桌上留了一张东西。',computer:'电脑自己亮了，而且已经加入一个群。'};
  const paperTriggerText={5:'物业传真：电梯 6½',10:'客户留下的快递箱说明',17:'委托人：怪事屋'};
  function officeDecor(){
    const d=[];
    if(has('vending_friend'))d.push('<span class="office-deco deco-drink">饮料</span>');
    if(has('cat_signed'))d.push('<span class="office-deco deco-paw">爪</span>');
    if(has('tuesday_stored'))d.push('<span class="office-deco deco-tuesday">星期二</span>');
    if(has('ghost_bad_review'))d.push('<span class="office-deco deco-review">★☆☆☆☆<br>偏袒商家</span>');
    if(has('ending_registered'))d.push('<span class="office-deco deco-license">经营性怪事<br>No.020</span>');
    if(has('breakfast_kept'))d.push('<span class="office-deco deco-breakfast">豆浆券</span>');
    if(has('rain_reassigned'))d.push('<span class="office-deco deco-plant">长得很快</span>');
    return d.join('');
  }
  function renderOffice(first=false){
    document.body.classList.remove('choosing');document.body.dataset.scene='office';delete document.body.dataset.event;currentView='office';activeEvent=null;replayMode=false;clearSpeechAnchor();officeFresh=true;state.stats.office_returns++;setControls(true);btnOffice.style.display='none';subtitle.textContent='';
    const next=state.current_event<=20?state.current_event:null,trig=next?triggerMap[next]:null;
    app.innerHTML=`<section class="scene office"><img class="scene-art" src="assets/scenes_v9/office.jpg" alt="" aria-hidden="true"><div class="office-room"><div class="ceiling-lamp"></div><div class="office-window ${has('moon_explained')||has('moon_warned')?'has-moon':''}"><i class="moon-peek"></i></div><div class="coat-hook"><i></i><i></i><i></i></div><div class="pinboard"><span>报销别夹在怪事档案里</span><b>本周值日：老板（划掉）</b></div><button class="office-door ${trig==='door'?'office-trigger':''}" id="officeDoor" aria-label="办公室门"></button><div class="archive" id="archive" role="button" tabindex="0" aria-label="档案柜"></div><div class="office-note">${next?'营业中。':'试用期结束。继续营业。'}</div><button class="boss-chair" id="chair" aria-label="老板的椅子"></button><div class="boss-desk"><i class="boss-mug"></i><i class="paper-pile"></i></div><div class="player-desk"></div><button class="office-printer ${trig==='printer'?'office-trigger':''}" id="printer" aria-label="打印机"></button><button class="office-phone ${trig==='phone'?'office-trigger ringing':''}" id="phone" aria-label="固定电话"></button><button class="office-computer ${trig==='computer'?'office-trigger':''}" id="computer" aria-label="电脑"></button><button class="office-mail ${trig==='mail'?'office-trigger':''}" id="mail" aria-label="来件"></button><button class="desk-trigger ${trig==='paper'?'office-trigger':''}" id="deskTrigger">${next?(paperTriggerText[next]||'老板留下的便条'):'下一件事还没来'}</button><button class="office-fridge" id="fridge" aria-label="冰箱"></button><button class="honor-wall-object" id="wall" aria-label="荣誉墙"></button><div class="floor-paper">不要把“会动”写成报销理由</div>${officeDecor()}<div class="trigger-label">${next?triggerWords[trig]:''}</div><div class="office-progress">${state.completed.length}/20 · 自动存档</div>${!next?'<div class="continue-sign">电话总会再响。第 21 号怪事以后可以直接接在这里。</div>':''}</div></section>`;
    const officeScene=app.querySelector('.office');bindSceneMotion(officeScene);transitionIn(officeScene);setSceneAudio('office',0,'office');sound('office','music');
    const goTrigger=kind=>{noteOfficeAction(kind);if(!next){say('现在没有新的委托。老板说：“这句话一般维持不了多久。”');return}if(kind===trig)startEvent(next,false);else idleOffice(kind)};
    ['printer','phone','computer','mail'].forEach(k=>document.getElementById(k).addEventListener('click',()=>goTrigger(k)));
    document.getElementById('officeDoor').addEventListener('click',()=>goTrigger('door'));document.getElementById('deskTrigger').addEventListener('click',()=>goTrigger('paper'));
    document.getElementById('wall').addEventListener('click',()=>{noteOfficeAction('wall');renderWall()});
    const ar=document.getElementById('archive');ar.addEventListener('click',()=>{noteOfficeAction('archive');renderArchive()});ar.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();renderArchive()}});
    document.getElementById('chair').addEventListener('click',()=>{noteOfficeAction('chair');state.stats.chair_spins++;document.getElementById('chair').style.transform=`rotate(${state.stats.chair_spins*180}deg)`;sound('tap');say(state.stats.chair_spins===5?'椅子转完第五圈，老板刚好进门。他看了你一眼，什么都没说。':'老板椅很顺滑。这不是工作内容。');checkAchievements();save()});
    document.getElementById('fridge').addEventListener('click',()=>{if(officeFresh)state.stats.fridge_first_streak=(state.stats.fridge_first_streak||0)+1;else state.stats.fridge_first_streak=0;officeFresh=false;sound('paper');const foods=['半瓶汽水。瓶盖写着“谁的？”','一个贴着“星期四再吃”的饭盒。今天不是星期四。','两根葱。没有别的。',has('vending_friend')?'售货机送来的饮料，标签上写“新员工”。':'一瓶你不记得是谁买的汽水。','空。老板从后面问：“检查完了吗？”'];say(foods[(state.completed.length+state.stats.fridge_first_streak)%foods.length]);checkAchievements();save()});
    if(first)say('老板指了指工位：“先把那边打印机哄好，入职表才能打出来。”',6800);else if(next)say(triggerWords[trig],4700);else say('转正表已经签完。怪事屋没有“通关冻结”这回事。',5200);save();
  }
  function noteOfficeAction(kind){if(kind!=='fridge'&&officeFresh){officeFresh=false;if(state.stats.fridge_first_streak<5)state.stats.fridge_first_streak=0;save()}}
  function idleOffice(kind){const m={printer:(has('weird_meetup_allowed')||has('weird_online_only')||has('group_muted'))?'打印机吐出群聊代打的一小条纸：“线下发言：插线板谁带？”':(has('printer_friend')?'打印机吐出一小条纸：“今天报告别太长。”':'打印机假装没看见你。'),phone:'电话没有来电。你拿起听筒，只听见很职业的忙音。',computer:'电脑桌面上唯一未关闭的窗口是“本月报销”。',mail:'这是一张上个月的水费单，异常程度有限。',door:'门外是五金店老板。他只是路过。',paper:'纸上是老板的字：“别忘了下班。”'};say(m[kind]||'没什么特别的。')}

  const ambienceByEvent={1:'office',2:'building',3:'machine',4:'meeting',5:'elevator',6:'street',7:'warehouse',8:'building',9:'breakfast',10:'office',11:'office',12:'rainroom',13:'busroom',14:'hotel',15:'roof',16:'office',17:'office',18:'meeting',19:'street',20:'office'};
  function startEvent(id,replay=false){
    document.body.classList.remove('choosing');document.body.dataset.scene='event';document.body.dataset.event=String(id);const event=getEvent(id);if(!event)return;currentView='event';activeEvent=id;replayMode=replay;clearSpeechAnchor();setControls(true);subtitle.textContent='';
    const ctx={event,state,has,say,toast:showToast,sound,bump,markInteraction,complete:outcomeId=>completeEvent(id,outcomeId),flags:state.flags};
    app.innerHTML='';const scene=window.GSW_EVENTS.render(ctx,id);app.appendChild(scene);bindSceneMotion(scene);transitionIn(scene);
    scene.addEventListener('pointerdown',e=>{const a=e.target.closest('button,[role="button"],input,.prop,.anomaly,.evidence');if(a){speechAnchor=a;positionSpeech()}},{capture:true});
    scene.addEventListener('focusin',e=>{const a=e.target.closest('button,[role="button"],input');if(a){speechAnchor=a;positionSpeech()}});
    setSceneAudio('event',id,ambienceByEvent[id]||'office');sound('scene','music');say(replay?`回看档案：${event.title}。本次操作不会覆盖原处理记录。`:event.trigger,6500);
  }
  function applyOutcomeFlags(eventId,outcome){
    Object.entries(outcome.flags||{}).forEach(([k,v])=>{if(typeof v==='number'){if(k==='unplug_count'||k==='rest_choice')state.stats[k]=(state.stats[k]||0)+v;else state.flags[k]=(state.flags[k]||0)+v}else state.flags[k]=v});
    if(eventId===12&&outcome.id==='plant')state.stats.literal_count++;if(eventId===13&&outcome.id==='name')state.stats.literal_count++;if(eventId===19&&outcome.id==='lostfound')state.stats.literal_count++;if(eventId===7&&outcome.id==='comp')state.flags.nothing_solved=true;
  }
  function completeEvent(id,outcomeId){
    document.body.classList.remove('choosing');const event=getEvent(id),outcome=event.outcomes.find(o=>o.id===outcomeId);if(!outcome)return;sound('success','fx');let newAch=[];
    if(!replayMode){applyOutcomeFlags(id,outcome);if(!state.completed.includes(id))state.completed.push(id);state.completed.sort((a,b)=>a-b);state.outcomes[id]=outcomeId;if(state.current_event===id)state.current_event=Math.min(21,id+1);newAch=checkAchievements(true);save()}
    const existing=app.querySelector(`.event-scene[data-event="${id}"]`);
    if(existing){
      currentView='event';document.body.dataset.scene='event';document.body.dataset.event=String(id);existing.classList.add('resolved');existing.querySelector('.outcomes')?.remove();existing.querySelectorAll('button,input,[role="button"]').forEach(el=>{if(!el.closest('.scene-resolution')){el.disabled=true;el.setAttribute('aria-disabled','true')}});
      const panel=document.createElement('div');panel.className=`scene-resolution resolution-${String(id).padStart(2,'0')} tone-${outcome.tone||'odd'}`;panel.innerHTML=`<div class="result-mark">已处理</div><p>${outcome.result}</p>${replayMode?'<small>回看模式：未覆盖原处理记录。</small>':''}${newAch.length?`<small>荣誉墙新增：${newAch.join('、')}</small>`:''}${id===20&&!replayMode?'<span class="ending-stamp">试用期通过</span>':''}<button class="return-tab" id="returnOffice">${id===20&&!replayMode?'签完字，继续营业':'回怪事屋'}</button>`;existing.appendChild(panel);speechAnchor=panel;positionSpeech();transitionIn(panel);document.getElementById('returnOffice').addEventListener('click',()=>renderOffice(false));
    }else{
      document.body.dataset.scene='resolve';delete document.body.dataset.event;currentView='resolve';clearSpeechAnchor();app.innerHTML=`<section class="scene resolve-scene"><div class="resolve-sheet"><h2>${event.title}</h2><p>${outcome.result}</p>${replayMode?'<p><small>回看模式：未覆盖原处理记录。</small></p>':''}${newAch.length?`<p><small>荣誉墙新增：${newAch.join('、')}</small></p>`:''}${id===20&&!replayMode?'<span class="ending-stamp">试用期通过</span>':''}<br><button class="return-tab" id="returnOffice">${id===20&&!replayMode?'签完字，继续营业':'回怪事屋'}</button></div></section>`;document.getElementById('returnOffice').addEventListener('click',()=>renderOffice(false));
    }
    if(id===20&&!replayMode)say('电话已经在响了。老板看你一眼：“转正第一天。”',7200);else say('事情处理完了。至少今天的记录可以先这么写。',5200);
  }

  function renderWall(){
    document.body.classList.remove('choosing');document.body.dataset.scene='wall';delete document.body.dataset.event;currentView='wall';clearSpeechAnchor();setControls(true);subtitle.textContent='';const unlocked=new Set(state.achievements);
    const positions=CONTENT.achievements.map((_,i)=>({x:3+(i*19)%82,y:7+(i*31)%82,r:-7+(i*5)%15}));
    app.innerHTML=`<section class="scene achievement-wall"><img class="scene-art" src="assets/scenes_v9/office.jpg" alt="" aria-hidden="true"><div class="wall-space">${CONTENT.achievements.map((a,i)=>{const u=unlocked.has(a.id),hidden=a.type==='隐藏'&&!u;if(hidden)return '';return `<div class="award type-${a.type} ${u?'unlocked':''}" style="left:${positions[i].x}%;top:${positions[i].y}%;--r:${positions[i].r}deg"><b>${u?a.name:'尚未获得'}</b><small>${u?a.desc:a.type}</small></div>`}).join('')}</div><button class="wall-back" id="wallBack">回办公室</button></section>`;
    document.getElementById('wallBack').addEventListener('click',()=>renderOffice(false));say(`墙上已经挂了 ${state.achievements.length} 件东西。老板坚持这不叫“游戏成就”。`);
  }
  function renderArchive(){
    document.body.classList.remove('choosing');document.body.dataset.scene='archive';delete document.body.dataset.event;currentView='archive';clearSpeechAnchor();setControls(true);subtitle.textContent='';
    app.innerHTML=`<section class="scene archive-scene"><img class="scene-art" src="assets/scenes_v9/office.jpg" alt="" aria-hidden="true"><div class="archive-drawer"><h2>档案柜里塞过的东西</h2>${CONTENT.events.map((e,i)=>state.completed.includes(e.id)?`<button class="file-row pile-${i%3}" style="--fi:${i%5};--ix:${i}" data-replay="${e.id}"><strong>${String(e.id).padStart(2,'0')} · ${e.title}</strong><span>上次写的是：${(e.outcomes.find(o=>o.id===state.outcomes[e.id])||{}).label||'已处理'}</span></button>`:`<div class="file-row empty-file pile-${i%3}" style="--fi:${i%5};--ix:${i}"><strong>${String(e.id).padStart(2,'0')} · （空档）</strong><span>这一格现在还是空的。</span></div>`).join('')}</div></section>`;
    app.querySelectorAll('[data-replay]').forEach(b=>b.addEventListener('click',()=>startEvent(+b.dataset.replay,true)));say('抽屉按事件编号塞纸。没有缩略图，也没有关卡卡片。');
  }
  function renderSettings(){
    app.insertAdjacentHTML('beforeend',`<section class="settings-curtain" id="settings"><div class="settings-paper"><h2>暂停一下</h2><div class="setting-row"><span>物件 / 角色声</span><button data-set="fx">${state.settings.fx?'开':'关'}</button></div><div class="setting-row"><span>环境声</span><button data-set="ambience">${state.settings.ambience?'开':'关'}</button></div><div class="setting-row"><span>轻音乐提示</span><button data-set="music">${state.settings.music?'开':'关'}</button></div><div class="setting-row"><span>低动态模式</span><button data-set="lowMotion">${state.settings.lowMotion?'开':'关'}</button></div><div class="setting-row"><span>大字号</span><button data-set="largeText">${state.settings.largeText?'开':'关'}</button></div><div class="setting-row"><span>存档</span><button id="saveNow">立即保存</button></div><div class="setting-row"><span>重新开始</span><button class="danger-link" id="resetGame">清空本地存档</button></div><button class="return-tab" id="closeSettings">回去</button><small>关键谜题均有视觉/文字反馈，不依赖声音。低动态模式关闭弹簧、视差和大范围形变，但不删除线索。存档只保存在当前浏览器。</small></div></section>`);
    const pane=document.getElementById('settings');pane.querySelectorAll('[data-set]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.set;state.settings[k]=!state.settings[k];b.textContent=state.settings[k]?'开':'关';applySettings();if(k==='ambience'||k==='music')syncAmbience();save()}));document.getElementById('saveNow').addEventListener('click',()=>{save();showToast('已保存')});document.getElementById('closeSettings').addEventListener('click',()=>pane.remove());let armed=false;document.getElementById('resetGame').addEventListener('click',e=>{if(!armed){armed=true;e.target.textContent='再点一次确认';return}try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem(LEGACY_KEY_9);localStorage.removeItem(LEGACY_KEY_8);localStorage.removeItem(LEGACY_KEY_7);localStorage.removeItem(LEGACY_KEY_6);localStorage.removeItem(LEGACY_KEY_5);localStorage.removeItem(LEGACY_KEY_4);localStorage.removeItem(LEGACY_KEY_3);localStorage.removeItem(LEGACY_KEY);localStorage.removeItem(LEGACY_KEY_1)}catch(_e){}state=defaults();applySettings();pane.remove();renderStreet()});
  }
  function unlock(id,newly){if(!state.achievements.includes(id)){state.achievements.push(id);if(newly)newly.push(CONTENT.achievements.find(a=>a.id===id)?.name||id)}}
  function checkAchievements(returnNames=false){
    const n=[],c=state.completed.length,f=state.flags,s=state.stats;if(c>=1)unlock('first',n);if(c>=10)unlock('ten',n);if(c>=20)unlock('all',n);if(c>=5)unlock('field',n);
    const friendly=['printer_friend','marble_padded','vending_friend','cat_respected','bike_compromise','rain_apology','ghost_review_fixed','moon_explained'].filter(k=>f[k]).length;if(friendly>=5)unlock('nonhuman',n);
    if(f.breakfast_kept)unlock('breakfast',n);if(state.completed.includes(15))unlock('moon',n);if(f.ending_registered)unlock('registered',n);if((s.unplug_count||0)>=3&&f.bus_unplug_success)unlock('repair',n);if(f.cat_signed)unlock('process',n);if(f.room404_found)unlock('found404',n);if(f.parcel_note_added)unlock('future',n);if(f.tuesday_comp_off)unlock('hr',n);if(f.marble_confiscated)unlock('overkill',n);if(f.ghost_bad_review)unlock('badreview',n);if(f.group_muted)unlock('mute',n);if(f.day8_rest)unlock('day8',n);if(f.ending_pending)unlock('pending',n);if((s.chair_spins||0)>=5)unlock('chair',n);if((s.fridge_first_streak||0)>=5)unlock('fridge',n);if((s.remember_help||0)>=1)unlock('remembers',n);if((s.rest_choice||0)>=3)unlock('rest',n);if((s.literal_count||0)>=3)unlock('literal',n);if(f.cat_respected&&(s.remember_help||0)>=2)unlock('catfriend',n);if((s.office_found_before_hint||0)>=1)unlock('observer',n);if(f.nothing_solved)unlock('nothing',n);if(n.length&&!returnNames){save();showToast('荣誉墙新增：'+n.join('、'))}return n;
  }
  btnOffice.addEventListener('click',()=>renderOffice(false));btnWall.addEventListener('click',renderWall);btnSettings.addEventListener('click',renderSettings);window.addEventListener('beforeunload',()=>{save();audioSystem?.destroy?.()});setInterval(()=>{if(document.visibilityState==='visible'){state.play_seconds+=10;save()}},10000);
  // Test hooks are opt-in. Keeping them off in release prevents visual systems from
  // mistaking a production session for a test session.
  const TEST_MODE=new URLSearchParams(location.search).get('gswTest')==='1';
  if(TEST_MODE){
    document.documentElement.dataset.gswTest='1';
    window.__GSW_TEST__={getState:()=>JSON.parse(JSON.stringify(state)),reset:()=>{try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem(LEGACY_KEY_9);localStorage.removeItem(LEGACY_KEY_8);localStorage.removeItem(LEGACY_KEY_7);localStorage.removeItem(LEGACY_KEY_6);localStorage.removeItem(LEGACY_KEY_5);localStorage.removeItem(LEGACY_KEY_4);localStorage.removeItem(LEGACY_KEY_3);localStorage.removeItem(LEGACY_KEY);localStorage.removeItem(LEGACY_KEY_1)}catch(_e){}state=defaults();renderStreet()},office:()=>renderOffice(false),event:id=>startEvent(id,false),complete:(id,outcome)=>{activeEvent=id;replayMode=false;completeEvent(id,outcome)},wall:renderWall,settings:renderSettings,save};
  }
  if(state.started)renderOffice(false);else renderStreet();
})();
