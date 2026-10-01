(function(){
  const pad=n=>String(n).padStart(2,'0');
  const q=(r,s)=>r.querySelector(s), qa=(r,s)=>[...r.querySelectorAll(s)];
  const AMBIENT={
    1:'<i class="amb a-coffee"></i><i class="amb a-pencil"></i><i class="amb a-tape"></i><i class="amb a-clip"></i><i class="amb a-cable"></i>',
    2:'<i class="amb a-pipe"></i><i class="amb a-clock"></i><i class="amb a-slippers"></i><i class="amb a-plant"></i>',
    3:'<i class="amb a-vsign">文明购买，禁止拍打</i><i class="amb a-trash"></i><i class="amb a-carton"></i><i class="amb a-shadow-zhao"></i>',
    4:'<i class="amb a-bottles"></i><i class="amb a-wallclock"></i><i class="amb a-chairs"></i><i class="amb a-cable"></i>',
    5:'<i class="amb a-handrail"></i><i class="amb a-safety">年检合格</i><i class="amb a-light"></i><i class="amb a-gum"></i>',
    6:'<i class="amb a-streetlamp"></i><i class="amb a-leaves"></i><i class="amb a-cart"></i><i class="amb a-helmet"></i>',
    7:'<i class="amb a-tag">待认领</i><i class="amb a-umbrella"></i><i class="amb a-shoe"></i><i class="amb a-clipboard"></i>',
    8:'<i class="amb a-extinguisher"></i><i class="amb a-flyers"></i><i class="amb a-meter"></i>',
    9:'<i class="amb a-stools"></i><i class="amb a-chopsticks"></i><i class="amb a-condiment"></i><i class="amb a-fan"></i><i class="amb a-calendar">1998</i>',
    10:'<i class="amb a-taperoll"></i><i class="amb a-scissors"></i><i class="amb a-waybills"></i>',
    11:'<i class="amb a-stageclock"></i><i class="amb a-footprints"></i><i class="amb a-curtain left"></i><i class="amb a-curtain right"></i>',
    12:'<i class="amb a-puddle"></i><i class="amb a-sun"></i><i class="amb a-pigeons">⌁  ⌁</i><i class="amb a-umbrellastand"></i>',
    13:'<i class="amb a-handles"></i><i class="amb a-busad">今天也要记得下班</i><i class="amb a-stoplight"></i><i class="amb a-seatbacks"></i>',
    14:'<i class="amb a-slippers2"></i><i class="amb a-tissues"></i><i class="amb a-wallart">欢迎入住</i><i class="amb a-no-smoke">禁烟</i>',
    15:'<i class="amb a-laundry"></i><i class="amb a-antenna"></i><i class="amb a-roofchair"></i><i class="amb a-cat-sil"></i>',
    16:'<i class="amb a-router"></i><i class="amb a-mug"></i><i class="amb a-sticky one">群主：猫</i><i class="amb a-sticky two">别@人类</i>',
    17:'<i class="amb a-cable2"></i><i class="amb a-clock2"></i><i class="amb a-umbrella2"></i><i class="amb a-dustbin"></i>',
    18:'<i class="amb a-fan2"></i><i class="amb a-fileboxes"></i><i class="amb a-placard">请依次陈述</i>',
    19:'<i class="amb a-car"></i><i class="amb a-tree"></i><i class="amb a-wires"></i>',
    20:'<i class="amb a-inspection">现场检查中</i><i class="amb a-clipboards"></i><i class="amb a-coat"></i>'
  };
  const KICKERS={
    1:'办公室 / 入职第一天',2:'居民楼 / 03:00',3:'街角自动售货机',4:'社区业主大会',5:'老楼电梯',
    6:'坡道共享单车停放点',7:'地铁失物招领处',8:'四层老楼',9:'旧早餐铺 / 06:20',10:'客户家 / 来自明天的包裹',
    11:'地铁口 / 影子离职申请',12:'晴天 / 局部阵雨 1 人',13:'末班公交 / 终点之后',14:'民宿 203 / 卫生复检',15:'楼顶 / 月亮投诉',
    16:'怪事屋电脑 / 非人类群聊',17:'怪事屋 / 自查',18:'怪事屋 / 身份听证',19:'本街道 / 星期八',20:'怪事屋 / 现场登记'
  };
  function shell(ctx,id,html){
    const root=document.createElement('section');
    root.className=`scene event-scene ev${pad(id)}`;
    root.setAttribute('data-event',id);
    root.innerHTML=`<img class="scene-art" src="assets/scenes_v9/event-${pad(id)}.jpg" alt="" aria-hidden="true"><div class="scene-paint" aria-hidden="true"></div><h1 class="scene-title"><span class="scene-kicker">${KICKERS[id]||`记录 ${pad(id)}`}</span>${ctx.event.title}</h1><div class="case-stamp" aria-hidden="true">GSW ${pad(id)}</div><div class="scene-ambience" aria-hidden="true">${AMBIENT[id]||''}</div>${html}<div class="outcomes outcome-scene-${pad(id)}" aria-label="处理方式"></div>`;
    return root;
  }
  function sayStep(ctx,el,text){
    if(el && el.classList.contains('done')) return false;
    if(el) el.classList.add('done');
    ctx.sound('tap'); ctx.say(text); return true;
  }
  function finishable(ctx,root,seen,need,lead){
    if(need.every(x=>seen.has(x))){
      ctx.say(lead||'情况已经足够清楚。接下来决定怎么处理。');
      showOutcomes(ctx,root);return true;
    }return false;
  }
  function showOutcomes(ctx,root){
    const zone=q(root,'.outcomes'); if(!zone || zone.classList.contains('ready')) return;
    zone.classList.add('ready');document.body.classList.add('choosing');
    zone.innerHTML='';
    ctx.event.outcomes.forEach((o,i)=>{
      const b=document.createElement('button');b.className=`outcome-prop action-${o.id}`;b.dataset.choice=String.fromCharCode(65+i);b.style.setProperty('--r',`${[-2,1.5,-1][i]||0}deg`);b.innerHTML=`<span class="outcome-mark" aria-hidden="true">处置 ${String.fromCharCode(65+i)}</span><span class="outcome-label">${o.label}</span>`;
      b.setAttribute('aria-label',`处置 ${String.fromCharCode(65+i)}：${o.label}`);b.addEventListener('click',()=>ctx.complete(o.id));zone.appendChild(b);
    });
  }
  function wireSimple(ctx,root,need,messages,lead){
    const seen=new Set();
    qa(root,'[data-step]').forEach(el=>el.addEventListener('click',()=>{
      const k=el.dataset.step; if(!sayStep(ctx,el,messages[k]||'你检查了一下。')) return;
      seen.add(k); ctx.markInteraction(k); finishable(ctx,root,seen,need,lead);
    }));
    return seen;
  }

  function makeDraggable(el,{onMove,onDrop,onStart}={}){
    let active=false,sx=0,sy=0,ox=0,oy=0,moved=false,lastX=0,lastY=0,lastT=0,vx=0,vy=0;
    const down=e=>{if(e.button!==undefined&&e.button!==0)return;window.GSW_PHYSICS?.cancel?.(el);active=true;moved=false;sx=e.clientX;sy=e.clientY;lastX=e.clientX;lastY=e.clientY;lastT=performance.now();vx=vy=0;ox=parseFloat(el.dataset.dragX||0);oy=parseFloat(el.dataset.dragY||0);el.classList.remove('v10-release','v101-inertia','v101-spring');el.classList.add('dragging');el.setPointerCapture?.(e.pointerId);onStart?.(e);};
    const move=e=>{if(!active)return;const dx=e.clientX-sx,dy=e.clientY-sy,now=performance.now(),dt=Math.max(8,now-lastT);if(Math.abs(dx)+Math.abs(dy)>8)moved=true;vx=(e.clientX-lastX)/dt;vy=(e.clientY-lastY)/dt;lastX=e.clientX;lastY=e.clientY;lastT=now;let x=ox+dx,y=oy+dy;const c=window.GSW_PHYSICS?.constrain?.(el,x,y,8);if(c){x=c.x;y=c.y}el.dataset.dragX=x;el.dataset.dragY=y;el.style.setProperty('--drag-x',`${x}px`);el.style.setProperty('--drag-y',`${y}px`);el.style.setProperty('--drag-r',`${Math.max(-6,Math.min(6,vx*2.4))}deg`);el.style.setProperty('--drag-lift',`${Math.min(1.04,1.012+Math.hypot(vx,vy)*.013)}`);onMove?.(e,x,y);};
    const up=e=>{if(!active)return;active=false;el.classList.remove('dragging');el.classList.add('v10-release');try{el.releasePointerCapture?.(e.pointerId)}catch(_e){};const d={moved,x:+(el.dataset.dragX||0),y:+(el.dataset.dragY||0),vx,vy};onDrop?.(e,d);const afterX=+(el.dataset.dragX||0),afterY=+(el.dataset.dragY||0);if(el.dataset.physicsFree==='1'&&Math.abs(afterX-d.x)<.5&&Math.abs(afterY-d.y)<.5)window.GSW_PHYSICS?.release?.(el,d);el.style.removeProperty('--drag-r');el.style.removeProperty('--drag-lift');setTimeout(()=>el.classList.remove('v10-release'),360);};
    el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
    return ()=>moved;
  }
  function near(a,b,pad=36){const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return !(x.right<y.left-pad||x.left>y.right+pad||x.bottom<y.top-pad||x.top>y.bottom+pad)}
  function makeHold(el,ms,done,progress){let t=null,start=0,raf=0;const clear=()=>{clearTimeout(t);cancelAnimationFrame(raf);el.classList.remove('holding');el.style.removeProperty('--hold');};const tick=()=>{const v=Math.min(1,(performance.now()-start)/ms);el.style.setProperty('--hold',v);progress?.(v);if(v<1)raf=requestAnimationFrame(tick)};el.addEventListener('pointerdown',e=>{start=performance.now();el.classList.add('holding');raf=requestAnimationFrame(tick);t=setTimeout(()=>{clear();done(e)},ms)});['pointerup','pointercancel','pointerleave'].forEach(n=>el.addEventListener(n,clear));}

  function e01(ctx){
    const root=shell(ctx,1,`<div class="desk-plane"></div>
      <button class="prop paper p1" data-step="long">《上月事件总结》<br>共 47 页。<br><small>“背景情况详见背景情况。”</small><i class="drag-corner">拖给打印机</i></button>
      <button class="prop paper p2" data-step="short">《插座冒烟处理记录》<br>共 2 页。<br><small>“拔了。好了。”</small><i class="drag-corner">拖给打印机</i></button>
      <button class="prop paper form" data-step="form">新员工入职表<br><small>等待打印</small><i class="drag-corner">拖给打印机</i></button>
      <div class="prop printer-big" data-step="printer" role="button" tabindex="0" aria-label="打印机"><i class="printer-mouth"></i><i class="printer-eye e1"></i><i class="printer-eye e2"></i></div>
      <button class="prop power" data-step="power" aria-label="电源键">⏻</button>
      <div class="print-speech" id="printSpeech">打印机正在用沉默表达意见。</div>
      <label class="report-lab locked" id="reportLab">报告压缩试验 <output id="pageCount">47 页</output><input id="pageSlider" type="range" min="6" max="47" value="47" disabled aria-label="调整测试报告页数"><small id="labNote">先给它一份长报告和一份短报告，找出拒绝阈值。</small></label>`);
    const seen=new Set(),speech=q(root,'#printSpeech'),printer=q(root,'.printer-big'),lab=q(root,'#reportLab'),slider=q(root,'#pageSlider'),count=q(root,'#pageCount'),note=q(root,'#labNote');
    let thresholdFound=false;
    const maybeEnableLab=()=>{if(seen.has('long')&&seen.has('short')&&seen.has('printer')&&slider.disabled){slider.disabled=false;lab.classList.remove('locked');note.textContent='把同一份测试报告逐步压短。打印机只反馈“打 / 不打”。';ctx.say('长的拒绝、短的接受，机器本身也正常。你现在可以用同一份报告逐步减页，找它真正的阈值。')}};
    const maybeFinish=()=>{if(seen.has('long')&&seen.has('short')&&seen.has('form')&&seen.has('printer')&&seen.has('threshold'))finishable(ctx,root,seen,['long','short','form','printer','threshold'],'测试把“态度问题”变成了可复现条件：10 页以内打印，11 页起拒绝。它不是坏了，是在执行自己的编辑标准。')};
    const action=(k,el,via='click')=>{if(el.classList.contains('done')&&k!=='power')return;el.classList.add('done');seen.add(k);ctx.markInteraction(k);ctx.sound(k==='printer'?'printer':'paper');
      const msg={long:'47 页进去三秒，又完整吐出来。纸角多了一行：“太长，不打。”',short:'2 页报告被顺利复印。打印机甚至主动把纸对齐了。',form:'入职表只有一页，文件本身没问题；它拒绝的是当前打印队列。',printer:'纸仓、墨盒、滚轮、网络都正常。硬件健康，拒绝是有条件的。',power:'你摸到电源键。老板在后面提醒：“如果能复现，就先别用重启掩盖条件。”'}[k];speech.textContent=msg;ctx.say(msg);printer.classList.add('react');setTimeout(()=>printer.classList.remove('react'),650);if(via==='drag')el.classList.add('fed');maybeEnableLab();maybeFinish();};
    slider.addEventListener('input',()=>{const pages=+slider.value;count.value=`${pages} 页`;if(pages<=10){note.textContent=`${pages} 页：接受。把它调回 11 页以上又会拒绝。`;printer.classList.add('accepting');ctx.sound('printer');if(!thresholdFound){thresholdFound=true;seen.add('threshold');ctx.markInteraction('printer-threshold');root.classList.add('threshold-found');ctx.say('10 页：打印。你把滑杆推回 11 页：拒绝。再回 10 页：打印。阈值稳定复现，编辑意见终于变成了证据。');}maybeFinish();}else{note.textContent=`${pages} 页：拒绝。继续减。`;printer.classList.remove('accepting');}});
    qa(root,'.paper').forEach(el=>{let dragged=false;makeDraggable(el,{onDrop:(_e,d)=>{dragged=d.moved;if(d.moved&&near(el,printer,70)){action(el.dataset.step,el,'drag');el.style.setProperty('--drag-x','0px');el.style.setProperty('--drag-y','0px');el.dataset.dragX=0;el.dataset.dragY=0;}else if(d.moved)ctx.say('纸在桌面上滑了一圈。打印机只接受送到进纸口的测试。')}});el.addEventListener('click',()=>{if(!dragged)action(el.dataset.step,el);dragged=false;});});
    [printer,q(root,'.power')].forEach(el=>{el.addEventListener('click',()=>action(el.dataset.step,el));if(el.getAttribute('role')==='button')el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action(el.dataset.step,el)}})});
    return root;
  }

  function e02(ctx){
    const root=shell(ctx,2,`<div class="building-cut"><div class="roof"></div><div class="floor f4"></div><div class="floor f3"></div><div class="floor f2"></div><div class="floor f1"></div>
      <button class="sound-node n1 ico-bed" data-step="bed" aria-label="客户卧室听声"><i></i></button><button class="sound-node n2 ico-pipe" data-step="pipe" aria-label="二楼管道听声"><i></i></button><button class="sound-node n3 ico-door" data-step="empty" aria-label="空房听声"><i></i></button><button class="sound-node n4 ico-tool" data-step="hatch" aria-label="检修口"><i></i></button><div class="marble" aria-hidden="true"></div>
      <div class="timeline"><span>客户卧室</span><span>空置楼层</span><span>屋顶夹层</span></div></div>
      <div class="acoustic-map"><b>声路定位 · 延迟采样</b><span class="route-dot" data-dot="0"></span>0ms <span class="route-dot" data-dot="1"></span>82ms <span class="route-dot" data-dot="2"></span>163ms <span class="route-dot" data-dot="3"></span>244ms<br><button id="traceReplay" disabled>回放声路</button><small id="traceNote">从客户卧室开始，沿延迟增加的方向追。</small></div>`);
    let seq=0,replayed=false;const order=['bed','pipe','empty','hatch'],trace=q(root,'#traceReplay'),note=q(root,'#traceNote');
    const messages=['卧室录到第一声，0ms。不是天花板随机撞击，它每晚都从同一方向出现。','暖气管晚 82ms 共振，能量沿管道向上。','空房地板再晚约 81ms。房间没人，声源还在继续向上。','检修口晚 244ms：一颗玻璃珠沿管道坡度跑完一圈，又回到起点。'];
    qa(root,'[data-step]').forEach(el=>el.addEventListener('click',()=>{const k=el.dataset.step;if(el.classList.contains('done'))return;if(k!==order[seq]){ctx.say('这个采样点的时间对不上。按延迟从小到大追，别被楼层位置骗了。');ctx.sound('wrong');return}el.classList.add('done');q(root,`[data-dot="${seq}"]`)?.classList.add('on');ctx.sound('marble');ctx.markInteraction(k);ctx.say(messages[seq]);seq++;note.textContent=`已定位 ${seq}/4 个节点${seq===4?'。现在回放整条声路，确认闭环。':''}`;if(seq===4)trace.disabled=false;}));
    trace.addEventListener('click',()=>{if(seq<4||replayed)return;replayed=true;root.classList.add('trace-replay');trace.disabled=true;ctx.markInteraction('acoustic-replay');ctx.say('回放把四个时间点连成一条连续路线：卧室上方 → 管道 → 空房地板 → 屋顶检修口。最后一段又回到起点，所以每天三点只听见“一颗”珠子。');[0,1,2,3].forEach((_,i)=>setTimeout(()=>ctx.sound('marble'),i*180));setTimeout(()=>{if(root.isConnected)showOutcomes(ctx,root)},760)});
    return root;
  }

  function e03(ctx){
    const bottles='<i class="bottle"></i>'.repeat(5);
    const root=shell(ctx,3,`<div class="vending"><div class="shelf s1">${bottles}</div><div class="shelf s2">${bottles}</div><div class="shelf s3">${bottles}</div><div class="screen" id="vscreen">12.00</div><button class="machine-face" data-machine aria-label="轻拍自动售货机"></button><button class="prop scan" data-step="you">你扫码</button><button class="prop receipt" data-step="receipt">历史小票<br>老赵 × 18</button><button class="prop slot" data-step="zhao" aria-label="让老赵购买"></button></div>`);
    const seen=new Set();let taps=0,tapTimer=0;const vending=q(root,'.vending'),screen=q(root,'#vscreen');
    const check=()=>{if(finishable(ctx,root,seen,['you','zhao','receipt','pattern'],'机器没坏，付款也没问题。你甚至复现了它为什么讨厌老赵：它记住的是“付款后被拍两下”这个动作。'))screen.textContent='别拍';};
    qa(root,'[data-step]').forEach(el=>el.addEventListener('click',()=>{const k=el.dataset.step;if(el.classList.contains('done'))return;el.classList.add('done');seen.add(k);ctx.markInteraction(k);
      if(k==='zhao'){vending.classList.add('rebuff');qa(root,'.bottle').forEach((b,i)=>b.style.transform=`translateX(${i%2?6:-6}px) translateY(-5px)`);screen.textContent='售罄';ctx.sound('vending');ctx.say('老赵一扫码，三排饮料非常整齐地往后退了半格。老赵：“你看，它针对我。”');}
      if(k==='you'){screen.textContent='支付成功';ctx.sound('vending');ctx.say('你买水完全正常。机器甚至很快。');}
      if(k==='receipt'){ctx.sound('paper');ctx.say('小票背面有一排浅浅的手掌印。老赵承认自己每次付款后都会拍机器两下，“鼓励它快点”。现在可以试着复现这个动作。');}
      check();
    }));
    q(root,'[data-machine]').addEventListener('click',()=>{clearTimeout(tapTimer);taps++;vending.classList.remove('tap-once','tap-twice');void vending.offsetWidth;vending.classList.add(taps>=2?'tap-twice':'tap-once');ctx.sound('vending');
      if(taps===1){screen.textContent='…';ctx.say(seen.has('receipt')?'一下。机器亮了一下，但还没有后退。':'机器被你拍了一下，屏幕短暂闪了个省略号。');}
      if(taps>=2){taps=0;if(!seen.has('pattern')){seen.add('pattern');ctx.markInteraction('pattern');screen.textContent='别拍';ctx.say('第二下刚落，饮料立刻整体后退。你没有付款，它仍然做出了和老赵购买时一样的反应——触发条件找到了。');check();}else ctx.say('机器记得这个节奏。第二下仍会让最前排饮料往后缩。');}
      tapTimer=setTimeout(()=>{taps=0},900);
    });
    return root;
  }

  function e04(ctx){
    const root=shell(ctx,4,`<div class="meeting-room"><div class="resident r1"></div><div class="resident r2"></div><div class="resident r3"></div><div class="table"></div>
      <button class="prop cat" data-step="cat" aria-label="坐在业主席的猫"></button><button class="prop agenda" data-step="agenda">议题 07<br>取消地下车库喂食点</button><button class="prop mic" data-step="mic">话筒</button><button class="prop signsheet" data-step="sign">签到表</button></div>
      <div class="meeting-procedure"><span class="procedure-step" data-proc="interest">确认利益相关</span><span class="procedure-step" data-proc="sign">登记身份</span><span class="procedure-step" data-proc="speak">正式发言</span><small id="meetingNote">先确认它为什么坚持坐在这里。</small></div>`);
    const seen=new Set(),cat=q(root,'[data-step="cat"]'),agenda=q(root,'[data-step="agenda"]'),sign=q(root,'[data-step="sign"]'),mic=q(root,'[data-step="mic"]'),note=q(root,'#meetingNote');let micDragged=false;
    const proc=k=>q(root,`[data-proc="${k}"]`)?.classList.add('done');
    const maybeInterest=()=>{if(seen.has('cat')&&seen.has('agenda')&&!seen.has('interest')){seen.add('interest');proc('interest');note.textContent='诉求明确。下一步：让参会身份留下可核验记录。';ctx.say('猫不是来蹭空调：它一直压着“取消喂食点”这项。它是直接利益相关者，只是会议制度没有给它分类。')}};
    cat.addEventListener('click',()=>{if(!seen.has('cat')){seen.add('cat');ctx.sound('cat');ctx.markInteraction('cat');ctx.say('你试着把猫抱离业主席。它落地后绕桌一圈，又回到同一把椅子。');maybeInterest()}else ctx.sound('cat')});
    agenda.addEventListener('click',()=>{if(seen.has('agenda'))return;seen.add('agenda');ctx.sound('paper');ctx.markInteraction('agenda');ctx.say('议题 07：取消地下车库喂食点。猫的爪子正压在“取消”两个字上。');maybeInterest()});
    const doSign=()=>{if(seen.has('sign'))return;if(!seen.has('interest')){ctx.say('签到表需要先知道它以什么身份参会。先确认它和议题的关系。');return}seen.add('sign');sign.classList.add('pawed','done');proc('sign');ctx.bump('cat_sign_attempts',1);ctx.sound('stamp');ctx.sound('cat');ctx.markInteraction('sign');note.textContent='身份记录完成。最后让它在议题 07 下正式发言。';ctx.say('你把“业主 / 租户 / 其他”中的“其他”圈出来。猫很配合地按下爪印。会议记录第一次有了可追溯的非人类参会身份。')};
    sign.addEventListener('click',doSign);
    const doMic=()=>{if(seen.has('mic'))return;if(!seen.has('sign')){ctx.say('话筒已经开着，但记录员提醒：先签到，发言才能写进正式纪要。');return}seen.add('mic');mic.classList.add('at-cat','done');proc('speak');ctx.sound('cat');ctx.markInteraction('mic');note.textContent='流程完整：利益相关 → 身份登记 → 正式发言。';ctx.say('话筒推到猫面前。猫：“喵。”记录员写下：“反对，意见明确，情绪稳定。”这次它的意见不是气氛，是正式记录。');showOutcomes(ctx,root)};
    makeDraggable(mic,{onDrop:(_e,d)=>{micDragged=d.moved;if(d.moved&&near(mic,cat,90))doMic();else if(d.moved)ctx.say('话筒要交给已登记的发言者。');mic.style.setProperty('--drag-x','0px');mic.style.setProperty('--drag-y','0px');mic.dataset.dragX=0;mic.dataset.dragY=0;}});mic.addEventListener('click',()=>{if(!micDragged)doMic();micDragged=false});
    return root;
  }

  function e05(ctx){
    const btns=[1,2,3,4,5,6,7,8].map(n=>`<button class="floor-btn" data-floor="${n}" aria-label="${n}楼">${n}</button>`).join('');
    const root=shell(ctx,5,`<div class="lift"><div class="doors"><div class="half-hall">半条走廊<br><small>快递请写清楚楼层</small></div><div class="door left"></div><div class="door right"></div></div><div class="display" id="liftDisplay">1</div><div class="panel">${btns}<button class="floor-btn open-btn" data-floor="open" aria-label="长按开门键进入检修测试">开</button><button class="floor-btn half-btn" data-floor="half" aria-label="六楼半">6½</button></div><div class="lift-hint" aria-live="polite">先确认 6 楼和 7 楼，再试试长按“开”。</div></div>`);
    let six=false,seven=false,service=false,unlocked=false,openTaps=0,openTapTimer=0,holdJustFired=false;
    const lift=q(root,'.lift'),disp=q(root,'#liftDisplay'),half=q(root,'[data-floor="half"]'),open=q(root,'[data-floor="open"]'),hint=q(root,'.lift-hint');
    half.style.opacity='.06';
    const enterService=()=>{
      holdJustFired=true;setTimeout(()=>holdJustFired=false,120);
      if(service)return;
      service=true;lift.classList.add('service-mode');half.style.opacity='.35';disp.textContent='检修';
      hint.textContent='检修记录已开启：依次确认相邻楼层。';
      ctx.sound('lift');ctx.say('你长按开门键。电梯没有开门，反而进入了检修记录模式：它开始认真记录“6”和“7”之间发生的事。');
      if(six&&seven)unlockHalf();
    };
    const unlockHalf=()=>{
      if(unlocked||!service||!six||!seven)return;
      unlocked=true;half.style.opacity='1';half.classList.add('discovered');disp.textContent='6↔7';
      hint.textContent='记录里多了一次没有编号的停靠。';
      ctx.sound('stamp');ctx.say('检修记录把 6 楼和 7 楼之间单独标出一次停靠。面板上慢慢亮起“6½”。这不是按钮故障，而是电梯承认那里确实有一层。');
    };
    makeHold(open,900,enterService);
    open.addEventListener('click',()=>{
      if(holdJustFired){holdJustFired=false;return}
      openTaps++;clearTimeout(openTapTimer);openTapTimer=setTimeout(()=>openTaps=0,900);
      if(openTaps>=2){openTaps=0;enterService();return}
      if(!service){ctx.sound('lift');ctx.say('短按“开”只会正常开门。按钮边缘有一行很淡的检修字样：长按。')}
      else ctx.say('检修模式还开着。现在去确认 6 楼和 7 楼。');
    });
    qa(root,'[data-floor]').filter(b=>b!==open).forEach(b=>b.addEventListener('click',()=>{
      const f=b.dataset.floor;ctx.sound('lift');
      if(f==='6'){
        six=true;disp.textContent='6';b.classList.add('tested');ctx.say(service?'六楼停靠正常，检修记录记下一条标准数据。':'六楼正常。门外是很普通的办公楼。');
        unlockHalf();
      }else if(f==='7'){
        seven=true;disp.textContent='7';b.classList.add('tested');ctx.say(service?'七楼停靠正常，但记录在到站前多了一次极短的减速。':'七楼也正常。电梯在经过中间时明显犹豫了一下。');
        unlockHalf();
      }else if(f==='half'){
        if(!unlocked){ctx.say(service?'“6½”还没真正亮起来。先把 6 和 7 的检修记录都跑一遍。':'这个位置看上去像一块普通面板。');return}
        disp.textContent='6½';lift.classList.add('open');hint.textContent='门外：半条走廊。';
        ctx.say('门外真的只有半条走廊。保洁阿姨在尽头抬头：“又坐错了？”你已经用检修记录证明：它不是幻觉，也不是面板贴纸。');showOutcomes(ctx,root);
      }else{disp.textContent=f;ctx.say(`${f} 楼没有异常。`);}
    }));
    return root;
  }
  function e06(ctx){
    const bikes=Array.from({length:7},(_,i)=>`<button class="bike" data-step="bike${i}" aria-label="共享单车 ${i+1}"><i class="wheel w1"></i><i class="wheel w2"></i><i class="frame"></i><i class="handle"></i><i class="bike-bell"></i></button>`).join('');
    const root=shell(ctx,6,`<div class="hill"></div><div class="bike-line">${bikes}</div><button class="hill-target" id="hillTarget" aria-label="坡顶停车点">坡顶停车点</button><button class="prop toolbox" data-step="scan">扫码 / 解锁测试</button><button class="prop slope-sign" data-step="slope">坡度 17°<br><small>上坡请自觉</small></button><div class="slope-meter">回运压力 <b id="loadText">7 辆都在坡底</b><div class="slope-track"></div><i class="slope-pin" id="loadPin"></i><small id="slopeNote">先确认平台锁是否正常，再做位置对照。</small></div>`);
    const seen=new Set(),target=q(root,'#hillTarget'),scan=q(root,'[data-step="scan"]'),note=q(root,'#slopeNote'),loadText=q(root,'#loadText'),pin=q(root,'#loadPin');let selected=null,topBike=null,scanCount=0;
    const updateLoad=n=>{pin.style.setProperty('--load',String((7-n)*14));loadText.textContent=n===6?'1 辆在坡顶 · 6 辆在坡底':'7 辆都在坡底'};
    const maybeFinish=()=>finishable(ctx,root,seen,['scan1','slope','bike','top','scan2'],'同一辆车在坡底会重新锁、搬到坡顶却保持解锁。平台、车锁都正常；罢工针对的是“每天都被骑下坡、却只能由运维搬回来”的单向工作。');
    const touchBike=el=>{selected=el;if(!seen.has('bike')){seen.add('bike');qa(root,'.bike').forEach(x=>x.classList.add('refuse'));ctx.sound('bike');ctx.markInteraction('bike-test');ctx.say('你推一辆车，它的前轮总往坡下偏。车锁没坏，阻力像是在拒绝被继续放回坡底。');note.textContent='选中的车可以搬去坡顶做 A/B 对照。'}else ctx.say('这辆车被选中。把它移到坡顶，再重新扫码。')};
    qa(root,'.bike').forEach(el=>{let dragged=false;makeDraggable(el,{onDrop:(_e,d)=>{dragged=d.moved;if(d.moved){touchBike(el);if(near(el,target,95)){topBike=el;seen.add('top');el.classList.add('at-top');updateLoad(6);ctx.sound('bike');ctx.say('同一辆车被搬到坡顶。它没有往回偏，车铃反而轻轻响了一声。现在重新扫码，比较锁的反应。');note.textContent='位置变量已改变。再做一次解锁测试。';maybeFinish()}el.style.setProperty('--drag-x','0px');el.style.setProperty('--drag-y','0px');el.dataset.dragX=0;el.dataset.dragY=0;}}});el.addEventListener('click',()=>{if(!dragged)touchBike(el);dragged=false})});
    target.addEventListener('click',()=>{if(!selected){ctx.say('先选一辆坡底的车作为对照样本。');return}if(topBike===selected){ctx.say('这辆已经在坡顶。现在重新扫码。');return}topBike=selected;seen.add('top');selected.classList.add('at-top');updateLoad(6);ctx.sound('bike');ctx.say('你让运维把选中的同一辆车搬到坡顶。位置变了，车没换。现在可以重复扫码。');note.textContent='A/B 对照就绪：同一辆车，不同停放位置。';maybeFinish()});
    scan.addEventListener('click',()=>{scanCount++;ctx.sound('bike');if(!seen.has('scan1')){seen.add('scan1');ctx.markInteraction('scan-bottom');qa(root,'.bike').forEach(x=>x.classList.add('refuse'));ctx.say('第一次扫码：七把车锁都能通信，但解锁后马上又“咔哒”锁回。不是服务器掉线。');note.textContent='通信正常。继续检查坡度，再把同一辆车移到坡顶。'}else if(seen.has('top')&&!seen.has('scan2')){seen.add('scan2');ctx.markInteraction('scan-top');topBike?.classList.add('accept');ctx.say('第二次扫码：坡顶那辆保持解锁，坡底六辆仍然集体重新上锁。唯一改变的变量就是停放位置。');note.textContent='对照成立：车锁服从位置，不服从“继续被搬回坡底”。';maybeFinish()}else ctx.say(seen.has('top')?'坡顶样本已经就位。再确认坡度信息后，这组对照就完整了。':'重复扫码结果一样。需要改变一个变量，不是多按几次。')});
    q(root,'[data-step="slope"]').addEventListener('click',()=>{if(seen.has('slope'))return;seen.add('slope');ctx.markInteraction('slope');ctx.say('17°。每天大量用户骑下坡，几乎没人骑回来；上坡补车全靠运维人工搬。它们拒绝的不是骑行，是永远单向的回运安排。');note.textContent='坡度解释了动机，但还需要“同车换位置”的对照。';maybeFinish()});
    updateLoad(7);return root;
  }

  function e07(ctx){
    const itemNames=['伞','钥匙','手套','水杯','帽子','旧书','围巾','耳机','眼镜','工牌','玩偶','手表','袜子','手提袋','插头','车票','回形针','硬币','灭火器','牙刷','纸箱','扫帚','果汁','另一只手套','拼图'];
    const root=shell(ctx,7,`<div class="locker">${itemNames.map((x,i)=>`<button class="cub cub-${i%8}" data-cub="${i}" aria-label="${x}"><i></i><small>${x}</small></button>`).join('')}<button class="tuesday" data-step="tuesday"><b>星期二</b><small>日期类？拖到时间缺口</small></button><div class="timeline"><button data-step="monday">周一进站</button><button class="timeline-gap" data-step="blank">空白 24h</button><button data-step="wednesday">周三出站</button></div></div>`);
    const seen=new Set(),tuesday=q(root,'.tuesday'),gap=q(root,'.timeline-gap');let placed=false,dragged=false;
    const inspect=k=>{if(seen.has(k))return;seen.add(k);ctx.markInteraction(k);
      if(k==='monday')ctx.say('记录显示：失主周一 22:48 进站。');
      else if(k==='wednesday')ctx.say('下一条记录已经是周三 07:11 出站。');
      else if(k==='blank')ctx.say('中间缺的不是一段监控，是整整一个星期二。时间轴上正好空着一天。');
      else if(k==='tuesday')ctx.say('“星期二”从纸制品格自己滑出来。它更像一段时间，不像一件东西。');
      finishable(ctx,root,seen,['tuesday','monday','blank','wednesday','placed'],'失主找到了。他说自己只记得睡了一觉——而你已经证明这张“星期二”正好嵌进他丢失的 24 小时。');
    };
    qa(root,'[data-step]').forEach(el=>el.addEventListener('click',()=>{const k=el.dataset.step;if(k==='tuesday'&&dragged){dragged=false;return}if(k==='tuesday'&&seen.has('monday')&&seen.has('blank')&&seen.has('wednesday')&&!placed){placed=true;seen.add('placed');gap.classList.add('filled');tuesday.classList.add('placed');ctx.sound('tape');ctx.say('你把“星期二”沿时间轴推到空白处。周一和周三之间的间距刚好合上。');inspect('tuesday');finishable(ctx,root,seen,['tuesday','monday','blank','wednesday','placed']);return}inspect(k)}));
    makeDraggable(tuesday,{onDrop:(_e,d)=>{dragged=d.moved;if(d.moved&&near(tuesday,gap,80)){placed=true;seen.add('placed');gap.classList.add('filled');tuesday.classList.add('placed');ctx.sound('tape');ctx.say('“星期二”贴进那段空白，时间轴像少了一颗齿终于重新咬合。');inspect('tuesday');finishable(ctx,root,seen,['tuesday','monday','blank','wednesday','placed']);}else if(d.moved)ctx.say('它不属于普通失物格。时间轴上的空白更像它该去的位置。');tuesday.style.setProperty('--drag-x','0px');tuesday.style.setProperty('--drag-y','0px');tuesday.dataset.dragX=0;tuesday.dataset.dragY=0;}});
    qa(root,'.cub').forEach((el,i)=>el.addEventListener('click',()=>{if(i%6===2)ctx.say(`格子里是${itemNames[i]}。普通得令人安心。`)}));
    return root;
  }

  function e08(ctx){
    const cat=ctx.has('cat_respected')?'<button class="cat-helper" id="catHelper" aria-label="那只参加过业主大会的猫"><i></i></button>':'';
    // V10.2: the production scene art contains four actual door positions (101/102/103/104)
    // plus the wandering 404 marker. Keep the hit map faithful to that photographed scene
    // instead of retaining the old 12-door CSS prototype that extended below the viewport.
    const levels=`<button class="plate plate-101" data-plate="101" aria-label="101号门牌">101</button><button class="plate plate-102" data-plate="102" aria-label="102号门牌">102</button><button class="plate plate-103" data-plate="103" aria-label="103号门牌">103</button><button class="plate plate-404" data-plate="404" aria-label="404号门牌">404</button>`;
    const root=shell(ctx,8,`<div class="stairwell">${levels}${cat}</div><button class="address-slip" data-ref aria-label="快递员手里的地址核对单">核对单</button><div class="plate-note" aria-live="polite">先找一个不会跟着整体错位的参照。</div>`);
    let corrected=0,found404=false,refSeen=false;const stair=q(root,'.stairwell'),note=q(root,'.plate-note');
    q(root,'[data-ref]').addEventListener('click',()=>{
      if(refSeen){ctx.say('核对单没变：401、402 都能在旧住户记录里对应，只有 404 的历史位置一直空着。');return}
      refSeen=true;ctx.sound('paper');note.textContent='旧快递记录：401、402 有固定收件人；404 的签收位置总在变化。';
      ctx.say('快递员的旧签收单提供了参照：普通门牌只是整体错了一户，只有 404 没有稳定位置。先把几块普通门牌复位，看看谁还会动。');
    });
    const inspect=p=>{
      if(p.dataset.touched)return;
      if(!refSeen){ctx.say('只盯着门牌会越看越乱。快递员手里那张旧地址核对单更适合先当参照。');return}
      p.dataset.touched='1';ctx.sound('tap');
      if(p.dataset.plate==='404'){
        found404=true;p.classList.add('wander');note.textContent='404：在你修正其他门牌后仍会自己挪动。';
        ctx.say(corrected>=3?'其他门牌都能按旧记录复位，只有 404 趁你转身又挪了一点。异常源终于被单独留下。':'404 号牌在你看别处时又挪了一点。先修正几块普通门牌，排除“整栋楼一起错位”。');
      }else{
        corrected++;p.classList.add('nudged','corrected');stair.classList.remove('cascade');void stair.offsetWidth;stair.classList.add('cascade');
        ctx.say(`${p.dataset.plate} 按旧签收记录复位成功。楼上随即传来“啪”的一声——还有别的牌在补位。`);
      }
      if(corrected>=3&&!found404)note.textContent='普通门牌可复位。现在找那块仍在自行补位的牌。';
      if(corrected>=3&&found404){
        if(ctx.has('cat_respected')){
          const helper=q(root,'#catHelper');if(helper){helper.classList.add('show');ctx.bump('remember_help',1);ctx.sound('cat');ctx.say('那只参加过业主大会的猫蹲在真正的 404 门口，没有跟着门牌移动。它给了你最后一个固定参照。');}
        }
        showOutcomes(ctx,root);
      }
    };
    qa(root,'.plate').forEach(p=>{let dragged=false;makeDraggable(p,{onDrop:(_e,d)=>{dragged=d.moved;if(d.moved){inspect(p);p.style.setProperty('--drag-x','0px');p.style.setProperty('--drag-y','0px');p.dataset.dragX=0;p.dataset.dragY=0;}}});p.addEventListener('click',()=>{if(!dragged)inspect(p);dragged=false;});});
    return root;
  }
  function e09(ctx){
    const root=shell(ctx,9,`<div class="shop"><div class="counter"></div><button class="prop pot" data-step="pot" aria-label="豆浆锅"></button><div class="steam">〰〰</div><button class="prop menu" data-step="menu" aria-label="旧菜单">豆浆 1.2<br>油条 0.5<br>每天 06:20—06:35</button><button class="prop oldman" data-step="oldman" aria-label="门口老人"></button><button class="prop bowl" data-step="bowl" aria-label="唯一的一只碗"></button><button class="shop-shutter" data-shutter aria-label="尝试提前拉下卷帘门"></button><div class="shop-clock" aria-live="polite">06:20</div></div>`);
    const seen=new Set();let served=false,cycle=false,bowlDragged=false;
    const shop=q(root,'.shop'),bowl=q(root,'.bowl'),oldman=q(root,'.oldman'),clock=q(root,'.shop-clock'),shutter=q(root,'[data-shutter]');
    const maybeFinish=()=>{
      if(seen.has('pot')&&seen.has('menu')&&seen.has('oldman')&&served&&cycle){
        ctx.say('你已经复现完整流程：06:20 自动开火，只准备一只碗；老人喝完；06:35 后它才愿意关门。它维持的不是“营业”，而是一段每天十五分钟的固定服务。');
        showOutcomes(ctx,root);
      }
    };
    const inspect=(el,k)=>{
      if(seen.has(k))return;seen.add(k);el.classList.add('done');ctx.markInteraction(k);
      if(k==='pot'){shop.classList.add('cooking');ctx.sound('kettle');ctx.say('锅自己开火、舀豆浆、关小火。动作熟练得像每天都没停过。')}
      if(k==='menu'){ctx.sound('paper');ctx.say('旧菜单背面写着：“老陈：一碗豆浆，一根油条。06:20 留。”营业时间旁边又手写了“06:35 关”。')}
      if(k==='oldman'){ctx.say('老人说以前每天和老伴来。他没问店为什么还会开，只问今天豆浆是不是又淡了。')}
      if(k==='bowl'){ctx.say('整个店只准备这一只碗。它每次都停在老人常坐的位置前。把它递过去，看看流程会不会继续。')}
      maybeFinish();
    };
    const serveBowl=()=>{if(served)return;served=true;seen.add('bowl');bowl.classList.add('served');ctx.sound('plate');clock.textContent='06:34';ctx.markInteraction('serve-bowl');ctx.say('你把唯一的碗递到老人面前。老人顺手把筷子摆正，吃完后把碗推回原位。店里的灯开始一盏盏熄。');maybeFinish()};
    qa(root,'[data-step]').forEach(el=>el.addEventListener('click',()=>{
      if(el===bowl&&bowlDragged){bowlDragged=false;return}
      if(el===bowl&&seen.has('bowl')&&!served){serveBowl();return}
      inspect(el,el.dataset.step);
    }));
    makeDraggable(bowl,{onDrop:(_e,d)=>{
      bowlDragged=d.moved;
      if(d.moved&&near(bowl,oldman,95))serveBowl();
      else if(d.moved)ctx.say('碗被你挪开后，锅没有继续盛第二份。它只等门口那位老人。');
      bowl.style.setProperty('--drag-x','0px');bowl.style.setProperty('--drag-y','0px');bowl.dataset.dragX=0;bowl.dataset.dragY=0;maybeFinish();
    }});
    shutter.addEventListener('click',()=>{
      ctx.sound('door');
      if(!served){shop.classList.add('reopen');ctx.say('你提前拉卷帘门。门刚到底，锅“咔”地重新点火，卷帘门自己弹回去。流程还没完成。');setTimeout(()=>shop.classList.remove('reopen'),600);return}
      if(!seen.has('menu')){ctx.say('门愿意往下走，但你还不知道它为什么偏偏等到这个时间。旧菜单上有营业时段。');return}
      if(!cycle){cycle=true;clock.textContent='06:35';shop.classList.add('closed-cycle');ctx.sound('stamp');ctx.say('06:35。卷帘门这次顺利到底，锅断火，招牌熄灭。十五分钟的循环完整结束。');maybeFinish();}
    });
    return root;
  }
  function e10(ctx){
    const root=shell(ctx,10,`<div class="packing-table"><div class="labels" id="parcelLabel">寄件人：本人<br>寄出时间：明天下午<br><br>“今天不要打开。”</div><button class="box" id="box" data-layer="1" aria-label="时间快递箱">点击拆第一层</button><button class="prop marker" data-step="marker" aria-label="记号笔"></button><div class="loop-rebuild" aria-live="polite"><button class="tomorrow-label" id="tomorrowLabel" aria-label="明天的快递单">明天的快递单</button><div class="outbound-slot" id="outboundSlot">明天下午 · 寄出</div><small>把最里面的快递单放回它应该出现的位置</small></div></div>`);
    let layer=1,reconstructed=false,selected=false;const box=q(root,'#box'),lab=q(root,'#parcelLabel'),tag=q(root,'#tomorrowLabel'),slot=q(root,'#outboundSlot');
    const revealLoop=()=>{root.classList.add('parcel-open');ctx.say('箱子最里面只剩同款胶带和一张“明天下午寄出”的快递单。现在可以把这张单和外层时间关系重新拼起来。')};
    const finish=()=>{
      if(reconstructed)return;reconstructed=true;tag.classList.add('snapped');slot.classList.add('filled');ctx.sound('tape');
      ctx.say('快递单嵌进“明天下午寄出”的位置后，外层“今天收到”和内层“明天寄出”首尾闭合。循环不是预言：它需要客户明天亲手把同一个箱子寄回今天。');
      showOutcomes(ctx,root);
    };
    box.addEventListener('click',()=>{
      ctx.sound(layer===1?'tape':'paper');
      if(layer===1){layer=2;box.dataset.layer='2';box.innerHTML='<div class="box layer2">第二层<br><small>“如果已经打开，继续。”</small></div>';lab.innerHTML+=' <br><br>里面的字迹和客户完全一样。';ctx.say('第二层的说明非常体贴地考虑到了你已经不听劝的情况。');}
      else if(layer===2){layer=3;box.dataset.layer='3';box.innerHTML='<div class="box layer3">最里面<br><small>同款胶带 + 明天的快递单</small></div>';ctx.say('最里面没有危险物。只有同款胶带和一张明天的快递单。');revealLoop();}
      else ctx.say(reconstructed?'循环关系已经拼清楚了。接下来只剩决定要不要严格照做。':'箱子拆完了。真正关键的是把“今天收到”和“明天寄出”接成同一条因果链。');
    });
    q(root,'[data-step="marker"]').addEventListener('click',()=>ctx.say('你拿起记号笔。客户立刻紧张：“你别给明天添乱。”如果真要加东西，那会改变下一轮收到的内容。'));
    let dragged=false;makeDraggable(tag,{onDrop:(_e,d)=>{dragged=d.moved;if(d.moved&&root.classList.contains('parcel-open')&&near(tag,slot,80))finish();else if(d.moved)ctx.say('这张单不是普通附件。它唯一合理的位置，是“明天下午寄出”。');tag.style.setProperty('--drag-x','0px');tag.style.setProperty('--drag-y','0px');tag.dataset.dragX=0;tag.dataset.dragY=0;}});
    tag.addEventListener('click',()=>{if(dragged){dragged=false;return}if(!root.classList.contains('parcel-open')){ctx.say('还没拆到这张单。');return}selected=!selected;tag.classList.toggle('selected',selected);ctx.say(selected?'你拿起明天的快递单。现在把它放到寄出时间槽。':'你把快递单先放回桌面。')});
    slot.addEventListener('click',()=>{if(selected&&root.classList.contains('parcel-open')){selected=false;finish()}else ctx.say('这里写着“明天下午 · 寄出”。需要一张能和今天收到的箱子对应上的快递单。')});
    return root;
  }
  function e11(ctx){
    const root=shell(ctx,11,`<div class="stage"><div class="person" data-physics-obstacle="1" data-physics-obstacle-pad="8"></div><div class="shadow" id="shadow"></div><button class="prop lamp" data-step="lamp" data-physics-free="1" data-physics-mass=".82" data-physics-bounce=".32" data-physics-friction=".925" data-physics-angular-friction=".91" data-physics-spin="1" aria-label="拖动灯源改变入射方向"></button><input class="speed" id="speed" type="range" min="1" max="10" value="9" aria-label="客户步速"><div class="retiree" data-physics-obstacle="1" data-physics-obstacle-pad="8"></div></div>
      <div class="shadow-lab"><b>影子延迟对照</b><output id="lagReadout">步速 9 · 延迟约 360 ms</output><button id="sampleShadow">记录当前样本</button><small id="shadowNote">先移动灯源到不同方向，排除单一光源造成的错位；再比较快走和慢走。</small><div class="sample-strip"><i data-sample="lightL">左光</i><i data-sample="lightR">右光</i><i data-sample="fast">快走</i><i data-sample="slow">慢走</i></div></div>`);
    const sh=q(root,'#shadow'),spd=q(root,'#speed'),lamp=q(root,'.lamp'),stage=q(root,'.stage'),readout=q(root,'#lagReadout'),note=q(root,'#shadowNote'),sample=q(root,'#sampleShadow');
    const lightSeen=new Set();let fast=false,slow=false,dragged=false,lastLampX=0;
    const mark=k=>q(root,`[data-sample="${k}"]`)?.classList.add('done');
    const lag=()=>Math.max(0,Math.round((+spd.value-3.4)*64));
    const updateShadow=(x=lastLampX)=>{lastLampX=x;const v=+spd.value,skew=Math.max(-18,Math.min(18,-x*.045));const delay=Math.max(0,(v-4)*3.2);sh.style.transform=`translateX(${Math.max(-58,Math.min(58,-x*.16-delay))}px) skewX(${skew}deg)`;readout.value=`步速 ${v} · 延迟约 ${lag()} ms`;root.style.setProperty('--walk-speed',String(v));};
    const lightSample=x=>{if(Math.abs(x)<45)return;const side=x<0?'lightL':'lightR';if(!lightSeen.has(side)){lightSeen.add(side);mark(side);ctx.markInteraction(`shadow-${side}`);ctx.say(side==='lightL'?'灯移到左侧。影子几何方向立刻改变，但仍故意慢半拍。光源位置会改变“往哪边”，不会改变“晚多久”。':'灯移到右侧。影子马上换方向，延迟量却几乎没变。单一灯位造成的光学错觉可以排除了。')}};
    const check=()=>{if(lightSeen.size===2&&fast&&slow){note.textContent='控制变量完成：换灯只改方向；降低步速才消除延迟。';ctx.say('两组控制实验对上了：左右换灯只改变影子方向，快走时延迟约三百多毫秒；慢到步速 4 以下，延迟趋近于零。它不是光学异常，是影子主动跟不上加班速度。');showOutcomes(ctx,root)}};
    makeDraggable(lamp,{onMove:(_e,x)=>{dragged=true;updateShadow(x);lightSample(x)},onDrop:(_e,d)=>{dragged=d.moved;lightSample(d.x);check()}});
    lamp.addEventListener('gswphysicsmove',e=>{updateShadow(e.detail.x);lightSample(e.detail.x)});
    lamp.addEventListener('gswphysicscollision',()=>{ctx.sound('tap');note.textContent='灯具碰到人形遮挡，运动轨迹被截断；物理碰撞和影子延迟是两件事。'});
    lamp.addEventListener('click',()=>{if(dragged){dragged=false;return}const target=lastLampX<=0?115:-115;window.GSW_PHYSICS?.spring?.(lamp,target,0,330);updateShadow(target);lightSample(target);ctx.sound('tap');check()});
    spd.addEventListener('input',()=>{updateShadow(lastLampX);if(+spd.value<=4)root.classList.add('shadow-near-sync');else root.classList.remove('shadow-near-sync')});
    sample.addEventListener('click',()=>{const v=+spd.value,l=lag();ctx.sound('paper');if(v>=8){if(!fast){fast=true;mark('fast');ctx.markInteraction('shadow-fast');ctx.say(`快走样本：步速 ${v}，影子约晚 ${l}ms。先别下结论，再把人走慢。`)}else ctx.say('快走样本已经记录。现在需要一个明显更慢的对照。')}else if(v<=4){if(!slow){slow=true;mark('slow');ctx.markInteraction('shadow-slow');ctx.say(`慢走样本：步速 ${v}，延迟降到约 ${l}ms。影子终于基本同步。`)}else ctx.say('慢走样本已经记录。')}else{ctx.say('这个速度在中间，不能把两种解释拉开。至少取一个步速 8 以上和一个 4 以下的样本。');ctx.sound('wrong')}check()});
    updateShadow(0);
    return root;
  }

  function e12(ctx){
    const root=shell(ctx,12,`<div class="streetline"></div><button class="client rain-client" aria-label="移动客户位置"></button><button class="cloud" id="cloud" aria-label="局部雨云"></button><div class="rain"></div><button class="prop radio" data-step="radio">城市天气广播<br><b>晴</b><br><small>局部阵雨：1 人</small></button><button class="prop fan" data-step="fan" aria-label="大风扇">◎</button><button class="prop flower" data-step="flower" aria-label="阳台花盆"><i class="pot"></i><i class="sprout"></i></button><div class="rain-note" aria-live="polite">验证它到底是在跟地点，还是跟人。</div>`);
    const seen=new Set(),cloud=q(root,'#cloud'),flower=q(root,'.flower'),client=q(root,'.rain-client'),note=q(root,'.rain-note');let clientDragged=false,cloudDragged=false,flowerHint=false;
    const maybeFinish=()=>finishable(ctx,root,seen,['radio','fan','follow','transfer'],'四个实验结果一致：天气系统正常；风只能暂时推开云；客户移动时云会跟；把云暂时移给缺水花盆也能下雨。它不是自然降水，而是在执行“只下我一个”的字面任务。');
    q(root,'[data-step="radio"]').addEventListener('click',()=>{if(seen.has('radio'))return;seen.add('radio');ctx.sound('weather');ctx.say('城市天气系统没有故障。它甚至准确统计了“降水覆盖人口：1”。');maybeFinish()});
    q(root,'[data-step="fan"]').addEventListener('click',()=>{if(!seen.has('fan'))seen.add('fan');cloud.classList.add('pushed');ctx.sound('wind');ctx.say('风把云推开了几米。三秒后它绕过风口，又回到客户头顶——目标不是这个地点。');setTimeout(()=>cloud.classList.remove('pushed'),700);maybeFinish()});
    flower.addEventListener('click',()=>{flowerHint=true;ctx.say('花盆明显缺水。客户想起自己昨天对天说过：“有本事只下我一个。”如果这句话真被当成任务，也许目标可以被临时改派。')});
    makeDraggable(client,{onDrop:(_e,d)=>{
      clientDragged=d.moved;
      if(d.moved){
        if(!seen.has('follow')){seen.add('follow');ctx.markInteraction('rain-follow');}
        const follow=Math.max(-120,Math.min(120,d.x*.72));cloud.style.setProperty('--follow-x',`${follow}px`);root.style.setProperty('--follow-x',`${follow}px`);root.classList.add('cloud-following');ctx.sound('rain');
        note.textContent='客户换位置，云同步跟了过去。';
        ctx.say('客户往旁边走了几步。云没有留在原地，而是几乎同步横移——它跟的是这个人。');maybeFinish();
      }
    }});
    client.addEventListener('click',()=>{if(clientDragged){clientDragged=false;return}if(!seen.has('follow')){seen.add('follow');client.style.setProperty('--drag-x','72px');cloud.style.setProperty('--follow-x','52px');root.style.setProperty('--follow-x','52px');root.classList.add('cloud-following');ctx.sound('rain');ctx.say('客户走到街的另一侧，云也跟着挪过去。目标锁定在人，不在坐标。');maybeFinish()}});
    makeDraggable(cloud,{onDrop:(_e,d)=>{
      cloudDragged=d.moved;if(!d.moved)return;
      if(near(cloud,flower,90)){
        if(!seen.has('transfer')){seen.add('transfer');ctx.markInteraction('rain-transfer');}
        cloud.classList.add('over-plant');ctx.sound('rain');note.textContent='云能接受临时改派，但会回到原目标。';
        ctx.say('你把云拖到花盆上方。它很配合地下了三秒雨；任务结束后又飘回客户头顶。说明“只下我一个”更像一条可重新指派的工作指令。');maybeFinish();
      }else ctx.say('云被挪开后仍然想回客户头顶。它非常坚持“只下一个”的目标。');
      cloud.style.setProperty('--drag-x','0px');cloud.style.setProperty('--drag-y','0px');cloud.dataset.dragX=0;cloud.dataset.dragY=0;
    }});
    cloud.addEventListener('click',()=>{if(cloudDragged){cloudDragged=false;return}if(flowerHint&&!seen.has('transfer')){seen.add('transfer');cloud.classList.add('over-plant');ctx.sound('rain');ctx.say('你示意客户把那句“只下我一个”改成“先给花浇三秒”。云真的转过去下了三秒，又回来待命。');maybeFinish()}else ctx.say('雨云悬在客户头顶，边缘很小，几乎只够覆盖一个人。')});
    return root;
  }
  function e13(ctx){
    const root=shell(ctx,13,`<div class="bus-shell"><div class="bus-window"><div class="moving-city" id="city"></div></div><div class="route-display" id="route">终点站</div><div class="prop driver"></div><button class="prop bell" data-step="bell" aria-label="停车铃">铃</button><button class="prop routepaper" data-step="route" aria-label="线路牌">线路牌：<br>…… → 终点 → ______</button><button class="depot-target" id="depot" aria-label="回场站"></button><div class="route-note" aria-live="polite">把“终点后仍在行驶”的那段路和回场路线对上。</div></div>`);
    let loops=0,routeSeen=false,depotSeen=false,reconstructed=false,routeDragged=false;const city=q(root,'#city'),display=q(root,'#route'),routepaper=q(root,'[data-step="route"]'),depot=q(root,'#depot'),note=q(root,'.route-note');
    const maybeFinish=()=>{
      if(loops>=2&&routeSeen&&depotSeen&&reconstructed){
        ctx.say('你把线路牌空白段和回场地图对上：公交不是在寻找不存在的终点，而是拒绝承认“终点→场站”这二十分钟不算路线。它缺的是一个能被报站器承认的下班状态。');showOutcomes(ctx,root);
      }
    };
    q(root,'[data-step="bell"]').addEventListener('click',()=>{
      loops++;city.style.transform=`translateX(-${(loops%3)*28}%)`;display.textContent=loops<3?'终点站之后':'便利店又来了';ctx.sound('bus');
      ctx.say(loops===1?'正常终点已经到了。车门关上后，它继续往前开。':loops===2?'同一家便利店、银行和住宅楼再次从窗外经过。你已经能确认这不是“多开一站”，而是在绕回场站。':'第三次经过那家便利店，一名乘客终于抬头。');
      if(loops>=2)note.textContent='循环地标已确认。现在核对线路牌空白段和回场站。';maybeFinish();
    });
    const inspectRoute=()=>{routeDragged=false;if(routeSeen)return;routeSeen=true;ctx.sound('paper');ctx.say('线路牌末尾真有一小段空白。司机解释：终点后还要开二十分钟回场站，“那段不算运营”。公交车显然不同意。');maybeFinish()};
    routepaper.addEventListener('click',inspectRoute);
    depot.addEventListener('click',()=>{depotSeen=true;ctx.sound('door');ctx.say('回场站的值班表显示司机必须把车开回这里才能下班。也就是说，现实里这段路存在，只是乘客系统把它删掉了。');if(routeSeen&&loops>=2&&!reconstructed){reconstructed=true;routepaper.classList.add('matched');depot.classList.add('matched');ctx.sound('stamp');ctx.say('你把线路牌的空白段按回场地图补齐，长度正好对应那二十分钟。');}maybeFinish()});
    makeDraggable(routepaper,{onDrop:(_e,d)=>{routeDragged=d.moved;if(!d.moved)inspectRoute();else if(near(routepaper,depot,95)){routeSeen=true;depotSeen=true;reconstructed=true;routepaper.classList.add('matched');depot.classList.add('matched');ctx.sound('stamp');ctx.say('你把线路牌空白段拖到回场站位置，二十分钟的里程正好接上。终点之后并不是“无路线”，只是“无运营名称”。');maybeFinish()}routepaper.style.setProperty('--drag-x','0px');routepaper.style.setProperty('--drag-y','0px');routepaper.dataset.dragX=0;routepaper.dataset.dragY=0;}});
    return root;
  }
  function e14(ctx){
    const root=shell(ctx,14,`<div class="dollhouse"><button class="room bed" data-step="bed">床底<br><small>灰尘：很多</small></button><button class="room" data-step="kettle">热水壶<br><small>里面：不建议看</small></button><button class="room" data-step="drain">浴室地漏<br><small>状态：有意见</small></button><button class="ghost ghost-tool" aria-label="拖动白手套卫生检查员"><i class="ghost-sheet"></i><i class="ghost-glove"></i><small>卫生检查员 · 可拖动</small></button></div><div class="checklist" id="check">卫生检查表<br>□ 床底<br>□ 热水壶<br>□ 地漏<br>□ 墙内声音</div>`);
    const seen=new Set(),ck=q(root,'#check'),ghost=q(root,'.ghost-tool');let dragging=false;
    const update=()=>{ck.innerHTML=`卫生检查表<br>${seen.has('bed')?'☑':'□'} 床底<br>${seen.has('kettle')?'☑':'□'} 热水壶<br>${seen.has('drain')?'☑':'□'} 地漏<br>□ 墙内声音`};
    const inspect=(el,k,physical=false)=>{if(seen.has(k))return;seen.add(k);el.classList.add('done');ctx.markInteraction(k);ctx.sound(k==='kettle'?'kettle':k==='drain'?'plate':'paper');ctx.say({bed:physical?'你把白手套带到床底。抹出来的灰足够让老板主动移开视线。':'鬼戴上白手套擦了一下床底。老板沉默了。',kettle:physical?'白手套在壶口停了两秒。水垢把投诉证据直接留在了指尖上。':'热水壶里的水垢基本支持投诉。',drain:physical?'手套靠近地漏，鬼立刻在表上打勾。这个问题甚至不需要灵异能力。':'地漏确实该清。鬼在检查表上非常认真地打了一个勾。'}[k]);update();if(seen.size===3){ctx.say('你们最后沿墙听了一圈。“墙里半夜有人说话”确认是隔壁电视；其余三项投诉全部能被现场证据支持。');showOutcomes(ctx,root)}};
    qa(root,'[data-step]').forEach(el=>el.addEventListener('click',()=>inspect(el,el.dataset.step,false)));
    makeDraggable(ghost,{onStart:()=>{dragging=true},onDrop:(_e,d)=>{if(d.moved){const target=qa(root,'[data-step]').find(el=>near(ghost,el,46)&&!seen.has(el.dataset.step));if(target)inspect(target,target.dataset.step,true);else ctx.say('白手套在房间里绕了一圈。它只对能留下实际痕迹的地方停下来。')}ghost.style.setProperty('--drag-x','0px');ghost.style.setProperty('--drag-y','0px');ghost.dataset.dragX=0;ghost.dataset.dragY=0;setTimeout(()=>dragging=false,0)}});
    ghost.addEventListener('click',()=>{if(!dragging)ctx.say('幽灵把白手套举起来：它希望你按现场证据逐项检查，不接受“闹鬼所以都算怪事”。')});
    return root;
  }

  function e15(ctx){
    const cloud=ctx.has('rain_blown_away')?'<div class="return-cloud" aria-hidden="true"><i></i></div>':'';
    const root=shell(ctx,15,`<div class="skyline"></div>${cloud}<button class="moon" data-step="moon" aria-label="月亮"></button><div class="observation-points"><button data-obs="A" aria-label="屋顶东侧观察点"></button><button data-obs="B" aria-label="水箱旁观察点"></button><button data-obs="C" aria-label="楼梯间观察点"></button></div><button class="prop photo-stack" data-step="photos" aria-label="一个月照片">一个月照片<br><small>每张都有月亮</small></button><button class="prop block" data-step="block" aria-label="用建筑遮挡月亮"></button><div class="bearing-meter" aria-live="polite">方位测量：等待三个观察点</div>`);
    const seen=new Set(),obs=new Set(),meter=q(root,'.bearing-meter'),moon=q(root,'.moon');let dragged=false;
    const bearings={A:'117.2°',B:'117.0°',C:'117.3°'};
    const maybeFinish=()=>{
      if(obs.size===3&&seen.has('photos')&&seen.has('block')){
        ctx.say('三个相隔很远的屋顶观察点得到几乎相同的远距离方位；遮挡只改变视线，不改变月亮；一个月照片也只是证明客户每天都在主动寻找它。没有任何“定向跟随”证据。');showOutcomes(ctx,root);
      }
    };
    qa(root,'[data-obs]').forEach(el=>el.addEventListener('click',()=>{
      const k=el.dataset.obs;if(obs.has(k))return;obs.add(k);el.classList.add('measured');ctx.sound('moon');meter.textContent=`方位测量：${[...obs].map(x=>`${x} ${bearings[x]}`).join(' · ')}`;
      ctx.say(obs.size===1?`观察点 ${k}：月亮方位 ${bearings[k]}。先记下，不下结论。`:obs.size===2?`第二个观察点仍是 ${bearings[k]}。如果它真在跟某个人，近距离横移应该让方位差更大。`:`第三个观察点 ${bearings[k]}。三次结果几乎不变，更像远处天体，而不是贴着客户移动的东西。`);
      maybeFinish();
    }));
    q(root,'[data-step="photos"]').addEventListener('click',()=>{if(seen.has('photos'))return;seen.add('photos');ctx.sound('paper');ctx.say('你把照片按日期排开。月亮大小和相位都在正常变化；唯一稳定的是——客户每天都抬头拍了一张。');maybeFinish()});
    q(root,'[data-step="block"]').addEventListener('click',()=>{if(seen.has('block'))return;seen.add('block');ctx.say('你让客户站到水箱后面。月亮被挡住；客户横走两步又能看见。遮挡关系完全正常。');maybeFinish()});
    makeDraggable(moon,{onDrop:(_e,d)=>{dragged=d.moved;if(d.moved){moon.classList.add('snapback');ctx.sound('moon');ctx.say('你把月亮图像拖到视野另一边做“错误假设”演示。松手后它回到真实方位——观测对象不会配合投诉人的叙事。');setTimeout(()=>{moon.style.setProperty('--drag-x','0px');moon.style.setProperty('--drag-y','0px');moon.dataset.dragX=0;moon.dataset.dragY=0;moon.classList.remove('snapback')},420);}}});
    moon.addEventListener('click',()=>{if(!dragged)ctx.say('月亮没有躲，也没有靠近。最好用不同位置的方位数据，而不是凭“它还在”判断。');dragged=false;});
    return root;
  }
  function e16(ctx){
    const history=[];
    history.push('<div class="message catmsg">猫（管理员）：群公告第一条，禁止讨论谁更怪。</div>');
    history.push(ctx.has('vending_grudge')?'<div class="message numeric">9999　9999　9999</div>':'<div class="message numeric">0001　给新员工留的水</div>');
    history.push('<div class="message print">打印机：售货机刚才那串是在骂人。</div>');
    if(ctx.has('cat_offended'))history.push('<div class="message catmsg">猫（管理员）把你的群名片改成了：抱猫的</div>');
    if(ctx.has('printer_friend'))history.push('<div class="message print">打印机：公平地说，新员工后来有改短报告。</div>');
    if(ctx.has('bike_forced'))history.push('<div class="message">共享单车群体：叮。叮。叮。叮。叮。</div>');
    const root=shell(ctx,16,`<div class="monitor"><div class="chat-space" id="chat">${history.join('')}</div></div>
      <div class="printer-side" data-thread="printer" role="button" tabindex="0" aria-label="查看打印机线下发言"></div>
      <button class="prop rules" data-thread="rules">群规草案<br><br>1. 不讨论谁更怪<br>2. 不半夜艾特人类<br>3. 线下聚会自带插线板</button>
      <button class="prop fee-slip" data-thread="fee">收费透明度<br><small>群内争议 17 条</small></button>
      <button class="prop meetup-note" data-thread="meet">线下聚会申请<br><small>预计到场：不确定</small></button>
      <div class="identity-strip" aria-label="成员身份核验"><button class="identity-chip" data-idcheck="cat">猫管理员</button><button class="identity-chip" data-idcheck="printer">打印机</button><button class="identity-chip" data-idcheck="vending">售货机</button><button class="identity-chip" data-idcheck="bike">共享单车</button></div>`);
    const seen=new Set(),verified=new Set();
    const maybeFinish=()=>{if(seen.size===4&&verified.size>=3){if(ctx.has('cat_respected')){ctx.bump('remember_help',1);ctx.say('三名以上成员都能和你以前处理过的现场证据对应。猫管理员最后给群规盖了一个爪印——这不是匿名怪谈群，是你自己的历史客户真的在互相联系。');}else ctx.say('身份交叉核验完成：这不是匿名恶作剧群，至少三名成员都能对应到你亲手处理过的对象。');showOutcomes(ctx,root)}};
    const inspect=key=>{if(seen.has(key))return;seen.add(key);ctx.sound(key==='printer'?'paper':'tap');if(key==='fee')ctx.say(ctx.has('ghost_bad_review')?'群里有人贴出了怪事屋的一星评价截图。猫管理员提醒：“讨论收费，先别讨论卫生。”':'群聊认真讨论了两分钟“怪事屋收费是否透明”，然后开始争论谁算非人类客户。');if(key==='printer')ctx.say('屏幕里的打印机发完消息，现实里的打印机也吐出同一句。它提供了一条可现场复验的身份签名。');if(key==='rules')ctx.say('群规没有人反对第一条。第二条下面出现了售货机发来的“0000”，格式和事件 03 的屏幕习惯一致。');if(key==='meet')ctx.say('真正的议题出现：它们想借办公室办线下聚会，而且已经开始讨论谁负责带插线板。');maybeFinish()};
    const idTexts={cat:ctx.has('cat_signed')?'管理员资料里留着事件 04 的爪印签到图。爪垫缺口位置和群头像一致。':'猫管理员发来一张桌角照片，背景正是怪事屋门口。',printer:'你让现实打印机打印校验码，群里的“打印机”在同一秒发出完全相同的六码。',vending:ctx.has('vending_grudge')?'成员发出的 9999 排列和事件 03 断电后价格屏完全一致。':'“0001 给新员工留的水”能和办公室里那瓶饮料的标签对应。',bike:ctx.has('bike_forced')?'共享单车成员的铃声节奏与事件 06 强制解锁后的集体鸣铃完全一致。':'单车成员上传的锁编号能和运维记录对上。'};
    qa(root,'[data-idcheck]').forEach(el=>el.addEventListener('click',()=>{const k=el.dataset.idcheck;if(verified.has(k)){ctx.say('这名成员已经核验过。');return}verified.add(k);el.classList.add('verified');ctx.sound(k==='cat'?'cat':k==='printer'?'printer':k==='vending'?'vending':'bike');ctx.markInteraction(`group-id-${k}`);ctx.say(idTexts[k]);maybeFinish()}));
    qa(root,'[data-thread]').forEach(el=>{el.addEventListener('click',()=>inspect(el.dataset.thread));el.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&el.getAttribute('role')==='button'){e.preventDefault();inspect(el.dataset.thread)}})});
    return root;
  }

  function e17(ctx){
    const dynamic6=ctx.has('rain_reassigned')?'plant':ctx.has('tuesday_stored')?'calendar':'kettle';
    const root=shell(ctx,17,`<div class="reverse-office"><button class="anomaly a1 ico-chair" data-a="1" aria-label="会自己转的老板椅"><i></i></button><button class="anomaly a2 ico-kettle" data-a="2" aria-label="从不见底的水壶"><i></i></button><button class="anomaly a3 ico-calendar" data-a="3" aria-label="偶尔跳过周一的日历"><i></i></button><button class="anomaly a4 ico-printer" data-a="4" aria-label="有编辑意见的打印机"><i></i></button><button class="anomaly a5 ico-water" data-a="5" aria-label="晚上少半杯水的饮水机"><i></i></button><button class="anomaly a6 ico-${dynamic6}" data-a="6" aria-label="受之前事件影响的物品"><i></i></button></div><div class="form-sheet" id="selfForm">自查项目：0 / 7<br><small>“本单位近期存在异常，请尽快上门。”</small></div>`);
    const seen=new Set();const form=q(root,'#selfForm');let hintShown=false,resolved=false;
    const hintTimer=setTimeout(()=>{if(!root.isConnected||resolved||seen.size>=5)return;hintShown=true;form.innerHTML=`自查项目：${seen.size} / 7<br><small>提示：别只找“会动”的东西。习惯到不再被记录，也是一种异常。</small>`;ctx.say('委托单背面慢慢浮出一行自查提示：有些异常之所以难找，只是因为你已经每天都在用它。')},14000);
    const texts=['老板椅每天下班后会自己转半圈。大家一直当它轴松。','水壶从来没有真正空过。没人问过为什么。','日历偶尔自己把周一翻过去。员工都很支持。','打印机当然算，但它强烈要求写成“沟通能力较强”。','饮水机晚上会偷偷少半杯。',ctx.has('rain_reassigned')?'事件 12 以后，窗边这盆花长得快得有点不讲道理。':ctx.has('tuesday_stored')?'档案柜里夹着一个真正的星期二。大家已经学会绕着它排班。':'老板桌上的水壶自己保持温热。这件事似乎从你入职前就开始了。'];
    qa(root,'[data-a]').forEach(el=>el.addEventListener('click',()=>{const k=+el.dataset.a;if(seen.has(k)||resolved)return;seen.add(k);el.classList.add('found');ctx.sound('tap');ctx.say(texts[k-1]);if(seen.size===5&&!hintShown)ctx.bump('office_found_before_hint',1);form.innerHTML=`自查项目：${seen.size} / 7<br><small>${seen.size>=5?'越找越像是你以前根本没把这些当异常。':'这些东西以前就在这里。'}</small>`;if(seen.size===6){resolved=true;clearTimeout(hintTimer);setTimeout(()=>{if(!root.isConnected)return;form.innerHTML='自查项目：7 / 7<br><small>第 7 项自己打了勾：“员工已经习惯。”</small>';ctx.say('老板刚好回来。你还没找到第七项，委托单已经自己勾上：“员工已经习惯。”');showOutcomes(ctx,root)},250)}}));
    return root;
  }

  function e18(ctx){
    const root=shell(ctx,18,`<div class="tribunal"><button class="boss real" data-boss="real" aria-label="现在的老板"></button><button class="boss shadow" data-boss="shadow" aria-label="老板的影子"></button><button class="boss photo" data-boss="photo" aria-label="十年前证件照里的老板"></button><div class="evidence-table"><button class="evidence ev-cup" data-ev="cup" aria-label="老板的杯子"><i></i></button><button class="evidence ev-key" data-ev="key" aria-label="办公室钥匙"><i></i></button><button class="evidence ev-chair" data-ev="chair" aria-label="老板椅"><i></i></button><button class="evidence ev-printer" data-ev="printer" aria-label="打印机"><i></i></button></div><div class="hearing-note">先拿一件证据，再让一位“老板”解释。</div></div>`);
    const tested=new Set(),heard=new Set();let selected=null;const note=q(root,'.hearing-note');
    const names={cup:'杯子',key:'钥匙',chair:'老板椅',printer:'打印机'},whoNames={real:'本人',shadow:'影子',photo:'证件照'};
    const replies={
      cup:{real:'本人喝了一口：“这个当然是我的。”',shadow:'影子同步端起不存在的杯子。它认为“使用习惯”也算所有权。',photo:'照片没有杯子。十年前的他还没买这一只。'},
      key:{real:'本人掏出门钥匙：“房租也是我交。”',shadow:'影子把加班记录推到桌前：它每天最后一个离开，却从来不需要钥匙。',photo:'证件照指向档案编号：旧系统登记的负责人姓名和它完全一致。'},
      chair:{real:'椅子只让本人坐下。这个证据对他很有利。',shadow:'本人一坐下，影子也正好落在椅背里。它拒绝承认自己没有坐。',photo:'照片里的老板从没坐过这把新椅子，却比现在的人更像门口营业执照上的头像。'},
      printer:{real:'本人说“按我说的格式打”。打印机立刻卡纸。',shadow:'影子把手压在纸上，打印机吐出：“加班意见已收到。”',photo:'照片靠近扫描区时，打印机自动识别出十年前的员工编号。'}
    };
    qa(root,'[data-ev]').forEach(el=>el.addEventListener('click',()=>{qa(root,'[data-ev]').forEach(x=>x.classList.remove('selected'));selected=el.dataset.ev;el.classList.add('selected');note.textContent=`手里：${names[selected]}。现在问谁？`;ctx.sound('tap');ctx.say(`你把${names[selected]}放到听证桌中央。三位“老板”都等着解释。`)}));
    qa(root,'[data-boss]').forEach(el=>el.addEventListener('click',()=>{const who=el.dataset.boss;if(!selected){ctx.say({real:'现在的老板：“先拿证据。光看脸这事说不清。”',shadow:'影子把“请出示证据”几个字压得更黑。',photo:'证件照保持十年前最像老板的表情。'}[who]);return}const key=`${selected}:${who}`;if(tested.has(key)){ctx.say('这组证据已经问过，口供没有变化。');return}tested.add(key);heard.add(who);ctx.sound(selected==='printer'?'printer':selected==='key'?'stamp':'paper');ctx.say(replies[selected][who]);note.textContent=`桌上：${names[selected]} · 已核对 ${tested.size} 组证据 · 已听取 ${heard.size}/3 位陈述（可继续问同一证据）`;if(tested.size>=4&&heard.size===3){ctx.say('四组证据和三份口供互相冲突，却都不是假的。问题不是谁冒充谁，而是“老板”这个身份被本人、影子和档案分别占了一部分。');showOutcomes(ctx,root)}}));
    return root;
  }

  function e19(ctx){
    const names=['怪事屋','便利店','学校','早餐店','街道办'];
    const root=shell(ctx,19,`<div class="day8-street">${names.map((n,i)=>`<button class="building b${i+1}" data-building="${i}" aria-label="${n}">${n}</button>`).join('')}</div><div class="day-sign">星期八</div><button class="prop switch" id="daySwitch" aria-label="切换星期八的试行规则">先按工作日试行</button><div class="day8-note" aria-live="polite">先给星期八套用一种现成规则，再听街上怎么反应。</div>`);
    let mode='work';const workSeen=new Set(),restSeen=new Set(),compared=new Set(),street=q(root,'.day8-street'),sw=q(root,'#daySwitch'),note=q(root,'.day8-note');
    const replies={
      work:['怪事屋照常营业。老板问：“那工资按第几天算？”','便利店愿意开门，但收银系统把日期写成“无效字段”。','学校系统自动生成课表，老师群里同时出现二十七条问号。','早餐店说可以营业，但进货单无法落日期。','街道办自己先卡在考勤系统里。'],
      rest:['怪事屋老板表示强烈支持，然后强调“只是试行”。','便利店想半天营业，系统问“半个不存在的日期怎么算”。','学校立刻关闭，家长群第一次没有意见。','早餐店愿意只开十五分钟——这点它很熟。','街道办问：既然是休息日，谁来批准这个休息日？']
    };
    const maybeFinish=()=>{
      if(workSeen.size>=2&&restSeen.size>=2&&compared.size>=1){
        note.textContent='同一个地点在两套规则下都能提出合理但互相冲突的要求。';
        ctx.say(ctx.has('tuesday_returned')?'你把同一栋楼在“工作日”和“休息日”两套规则下的反应对照起来。星期八不是多出来的周一或周日；它像之前那个丢失的星期二一样，需要先被赋予一个明确用途。':'对照结果说明：无论硬套工作日还是周末，总有一部分系统自相矛盾。星期八需要一个独立用途，而不是冒充现有七天中的任何一天。');
        showOutcomes(ctx,root);
      }
    };
    const inspect=el=>{
      const i=+el.dataset.building,set=mode==='work'?workSeen:restSeen,other=mode==='work'?restSeen:workSeen;if(set.has(i)){ctx.say('这家在当前规则下的意见已经记录了。');return}
      set.add(i);el.classList.add(`seen-${mode}`);if(other.has(i))compared.add(i);ctx.sound('tap');ctx.say(replies[mode][i]);
      note.textContent=`工作日样本 ${workSeen.size}/2 · 休息日样本 ${restSeen.size}/2 · 同地点对照 ${compared.size}/1`;maybeFinish();
    };
    qa(root,'[data-building]').forEach(el=>el.addEventListener('click',()=>inspect(el)));
    sw.addEventListener('click',()=>{
      mode=mode==='work'?'rest':'work';street.classList.toggle('work',mode==='work');street.classList.toggle('restmode',mode==='rest');sw.dataset.mode=mode;sw.setAttribute('aria-label',mode==='work'?'当前按工作日规则试行；点击切换为休息日':'当前按休息日规则试行；点击切换为工作日');ctx.sound('stamp');
      ctx.say(mode==='work'?'把星期八重新按工作日处理。记得回访同一个地点，才能做对照。':'切到休息日逻辑。现在最好回访刚才问过的某一栋楼，比较同一对象在两套规则下的反应。');
    });
    street.classList.add('work');
    return root;
  }
  function e20(ctx){
    const checks=[
      {tag:'equipment',text:'是否长期与会表达意见的设备共同办公'},
      {tag:'date',text:ctx.has('tuesday_stored')?'是否长期收留无主日期':'是否曾经处理过无主日期'},
      {tag:'moon',text:ctx.has('moon_explained')||ctx.has('moon_warned')?'是否与月亮保持稳定业务联系':'是否接受过天体类投诉'},
      {tag:'ghost',text:ctx.has('ghost_bad_review')?'是否存在非人类客户一星评价':'是否服务过非人类住宿客户'},
      {tag:'group',text:ctx.has('weird_meetup_allowed')?'是否允许异常对象在营业场所聚会':'是否建立异常对象沟通群'},
      {tag:'office',text:'是否存在会自己归档、自己打印或自己改时间的办公用品'}
    ];
    if((ctx.state.stats.unplug_count||0)>=2)checks.push({tag:'unplug',text:'是否存在高频断电式问题处理记录'});
    checks.push({tag:'cat',text:'是否与社区非人类代表保持业务往来'});
    checks.push({tag:'breakfast',text:'是否协助无证早餐时段继续营业'});
    const witnessData=[
      ['printer','打印机','打印机主动打印了一份“本机意见，仅供参考”。',['equipment','group','office']],
      ['cat','猫代表',ctx.has('cat_offended')?'猫把你的群名片“抱猫的”压在检查表上。':'猫把爪子按在检查表边缘，像准备再次签到。',['cat']],
      ['cloud','雨云',ctx.has('rain_reassigned')?'那朵云现在主要负责给盆栽浇水。':'远处一小块云路过，没有下雨。',[]],
      ['ghost','白手套',ctx.has('ghost_bad_review')?'检查员真的把“一星评价”夹进了材料。':'鬼寄来的卫生整改复检单被当作正式附件。',['ghost']],
      ['bus','公交',ctx.has('bus_after_terminal_named')?'报站器在门外非常正式地报：“下一站，下班。”':'公交司机递来一张写着“终于停了”的证明。',ctx.has('bus_unplug_success')?['unplug']:[]],
      ...((ctx.state.stats.unplug_count||0)>=2?[['repair','断电处理记录',`维修日志把本月“拔电源/断电重启”记了 ${ctx.state.stats.unplug_count||0} 次。`,['unplug']]]:[]),
      ['date','星期二档案',ctx.has('tuesday_stored')?'日期类物品拒绝回答是否属于固定资产。':'失物招领记录证明你确实处理过一个完整的星期二。',['date']],
      ['moon','月亮记录','三点方位测量和一个月照片都被装进了同一只证物袋。',['moon']],
      ['chair','老板椅','老板椅在没有人坐的时候轻轻转了半圈。',['office']],
      ['breakfast','早餐店旧菜单','菜单背面那行“06:20 留一碗”仍然清楚。',['breakfast']]
    ];
    const root=shell(ctx,20,`<div class="final-office"><div class="long-form"><h3>异常事物登记处 · 现场检查</h3>${checks.map((c,i)=>`<button class="checkitem" data-check="${i}" data-tag="${c.tag}" aria-label="检查项：${c.text}">□ ${c.text}</button>`).join('')}</div><div class="witnesses">${witnessData.map((x,i)=>`<button class="witness" style="--wr:${[-3,2,-1,4,-2,1,3,-4,2][i%9]}deg" data-w="${i}" data-kind="${x[0]}" aria-label="证物：${x[1]}">${x[1]}</button>`).join('')}</div><div class="turn-form">试用期转正表<br><small>老板已经签字，只差你的。</small></div><div class="audit-note" aria-live="polite">先选一条检查项，再用现场证物核验。不是把方框全部点亮。</div></div>`);
    const verified=new Set();let selected=null;const note=q(root,'.audit-note');
    const selectClaim=el=>{
      if(verified.has(+el.dataset.check)){ctx.say('这一项已经有证物核验。');return}
      qa(root,'[data-check]').forEach(x=>x.classList.remove('selected'));selected=+el.dataset.check;el.classList.add('selected');ctx.sound('paper');note.textContent=`待核验：${checks[selected].text}`;
      ctx.say('检查员把这一条单独圈出来：“给我一件能直接支持它的现场证物。”');
    };
    const verifyWitness=el=>{
      const w=witnessData[+el.dataset.w];
      if(selected===null){ctx.say(`${w[1]}在桌上。先圈一条它能证明的检查项。`);return}
      const claim=checks[selected];
      if(!w[3].includes(claim.tag)){
        el.classList.add('rejected');setTimeout(()=>el.classList.remove('rejected'),420);ctx.sound('wrong');
        ctx.say(`${w[2]}但它不能直接证明“${claim.text}”。检查员把证物推了回来：别靠气氛凑证据。`);return
      }
      verified.add(selected);const item=q(root,`[data-check="${selected}"]`);item.classList.remove('selected');item.classList.add('verified');item.textContent=item.textContent.replace(/^□\s*/,'✓ ');el.classList.add('used');ctx.sound(claim.tag==='equipment'?'printer':claim.tag==='cat'?'cat':claim.tag==='moon'?'moon':'stamp');
      ctx.say(`${w[2]}检查员在“${claim.text}”后面盖章：证物成立。`);
      selected=null;note.textContent=`已核验 ${verified.size}/${checks.length} 项 · 每项都需要独立证物`;
      if(verified.size===checks.length){
        ctx.say('最后一项也有了证物。检查员没有再问“怪事屋算不算怪事”，而是问：“你们准备登记成哪一种？”老板把转正表一起推过来。');showOutcomes(ctx,root);
      }
    };
    qa(root,'[data-check]').forEach(el=>el.addEventListener('click',()=>selectClaim(el)));
    qa(root,'[data-w]').forEach(el=>{
      let dragged=false;
      makeDraggable(el,{onDrop:(_e,d)=>{
        dragged=d.moved;
        if(d.moved){
          const target=qa(root,'[data-check]').find(c=>near(el,c,54));
          if(target){selectClaim(target);verifyWitness(el)}else ctx.say('证物要放到具体检查项旁边，不能只堆在桌上。');
          el.style.setProperty('--drag-x','0px');el.style.setProperty('--drag-y','0px');el.dataset.dragX=0;el.dataset.dragY=0;
        }
      }});
      el.addEventListener('click',()=>{if(!dragged)verifyWitness(el);dragged=false;});
    });
    return root;
  }
  const renderers={1:e01,2:e02,3:e03,4:e04,5:e05,6:e06,7:e07,8:e08,9:e09,10:e10,11:e11,12:e12,13:e13,14:e14,15:e15,16:e16,17:e17,18:e18,19:e19,20:e20};
  window.GSW_EVENTS={render(ctx,id){const f=renderers[id];if(!f)throw new Error('Unknown event '+id);return f(ctx)}};
})();
