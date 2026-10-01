(function(){
'use strict';
const FX={paper:'paper_v103.wav',printer:'printer_v103.wav',lift:'lift_v103.wav',marble:'marble_v103.wav',bike:'bike_v103.wav',bus:'bus_v103.wav',rain:'rain_v103.wav',moon:'moon_v103.wav',cat:'cat_v103.wav',vending:'vending_v103.wav',chat:'chat_v103.wav',door:'door_v103.wav',kettle:'kettle_v103.wav',plate:'plate_v103.wav',stamp:'stamp_v103.wav',tape:'tape_v103.wav'};
const AMBIENCE={street:'street_room_v103.wav',office:'office_room_v103.wav',building:'building_night_v103.wav',machine:'machine_room_v103.wav',meeting:'meeting_room_v103.wav',elevator:'elevator_room_v103.wav',warehouse:'warehouse_room_v103.wav',breakfast:'breakfast_room_v103.wav',rainroom:'rain_room_v103.wav',busroom:'bus_room_v103.wav',hotel:'hotel_room_v103.wav',roof:'roof_room_v103.wav'};
const SCORES={office:'score_office_v103.wav',field:'score_field_v103.wav',night:'score_night_v103.wav',final:'score_final_v103.wav'};
const EVENT_SCORE={1:'office',2:'night',3:'field',4:'office',5:'night',6:'field',7:'night',8:'night',9:'office',10:'night',11:'night',12:'field',13:'night',14:'night',15:'night',16:'office',17:'office',18:'office',19:'field',20:'final'};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
class AudioSystem{
  constructor(getSettings){this.getSettings=getSettings||(()=>({}));this.ctx=null;this.master=null;this.fxBus=null;this.musicBus=null;this.ambBus=null;this.comp=null;this.reverb=null;this.buffers=new Map();this.media=new Map();this.oneshots=new Set();this.currentAmb='';this.currentScore='';this.unlocked=false;this.duckToken=0;this.generation=0;this.pan=0;this._unlock=()=>this.unlock();this._pointer=e=>{this.pan=clamp((e.clientX/Math.max(1,innerWidth)-.5)*1.35,-.78,.78)};this._visibility=()=>{if(!this.ctx)return;if(document.hidden)this.ctx.suspend().catch(()=>{});else if(this.unlocked)this.ctx.resume().catch(()=>{})};addEventListener('pointerdown',this._unlock,{once:false,passive:true});addEventListener('keydown',this._unlock,{once:false,passive:true});addEventListener('pointermove',this._pointer,{passive:true});document.addEventListener('visibilitychange',this._visibility);}
  settings(){return this.getSettings()||{}}
  ensure(){
    if(this.ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
    try{
      let c;try{c=new AC({latencyHint:'interactive',sampleRate:48000});}catch(_e){c=new AC()}this.ctx=c;
      const master=this.master=c.createGain(),fx=this.fxBus=c.createGain(),amb=this.ambBus=c.createGain(),music=this.musicBus=c.createGain(),comp=this.comp=c.createDynamicsCompressor(),rev=this.reverb=c.createConvolver(),revGain=c.createGain(),tone=c.createBiquadFilter(),lim=c.createDynamicsCompressor();
      this.masterTone=tone;this.limiter=lim;master.gain.value=.90;fx.gain.value=1;amb.gain.value=1;music.gain.value=1;comp.threshold.value=-21;comp.knee.value=15;comp.ratio.value=2.5;comp.attack.value=.006;comp.release.value=.24;revGain.gain.value=.13;
      tone.type='highshelf';tone.frequency.value=5200;tone.gain.value=-.7;lim.threshold.value=-2.2;lim.knee.value=0;lim.ratio.value=18;lim.attack.value=.002;lim.release.value=.09;
      rev.buffer=this.makeImpulse(c,1.18,2.45);fx.connect(comp);fx.connect(rev);rev.connect(revGain);revGain.connect(comp);amb.connect(comp);music.connect(comp);comp.connect(tone);tone.connect(lim);lim.connect(master);master.connect(c.destination);
      return true;
    }catch(_e){return false}
  }
  makeImpulse(c,seconds,decay){const len=Math.floor(c.sampleRate*seconds),b=c.createBuffer(2,len,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<len;i++){const x=1-i/len;d[i]=(Math.random()*2-1)*Math.pow(x,decay)*.48}}return b}
  unlock(){this.unlocked=true;if(this.ensure()&&this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});for(const x of this.media.values()){if(x.wanted)x.audio.play().catch(()=>{})}}
  routeMedia(audio,bus){
    if(!this.ensure())return null;try{const src=this.ctx.createMediaElementSource(audio);const gain=this.ctx.createGain();gain.gain.value=0;src.connect(gain);gain.connect(bus);return gain}catch(_e){return null}
  }
  getMedia(path,busName){const key=`${busName}:${path}`;if(this.media.has(key))return this.media.get(key);const audio=new Audio(path);audio.loop=true;audio.preload='auto';const ready=this.ensure(),bus=busName==='music'?this.musicBus:this.ambBus;const gain=ready&&bus?this.routeMedia(audio,bus):null;const entry={audio,gain,wanted:false,level:0,timer:0};if(!gain)audio.volume=0;this.media.set(key,entry);return entry}
  ramp(entry,to,ms=700){clearInterval(entry.timer);const from=entry.level||0,steps=Math.max(1,Math.round(ms/45));let i=0;entry.wanted=to>0;if(entry.wanted&&this.unlocked)entry.audio.play().catch(()=>{});entry.timer=setInterval(()=>{i++;const t=i/steps,e=t*t*(3-2*t),v=from+(to-from)*e;entry.level=v;if(entry.gain){const now=this.ctx.currentTime;entry.gain.gain.cancelScheduledValues(now);entry.gain.gain.setTargetAtTime(v,now,.045)}else entry.audio.volume=clamp(v,0,1);if(i>=steps){clearInterval(entry.timer);entry.timer=0;entry.level=to;if(to<=.001){entry.wanted=false;entry.audio.pause()}}},45)}
  setAmbience(name='office'){
    const next=name||'office',s=this.settings(),f=AMBIENCE[next],path=f?`assets/audio_v103/${f}`:'',key=path?`ambience:${path}`:'';
    if(s.ambience===false){this.currentAmb=next;for(const [k,e] of this.media)if(k.startsWith('ambience:'))this.ramp(e,0,250);return}
    if(!f){this.currentAmb=next;for(const [k,e] of this.media)if(k.startsWith('ambience:'))this.ramp(e,0,320);return}
    if(this.currentAmb===next&&this.media.get(key)?.wanted)return
    this.currentAmb=next;for(const [k,e] of this.media){if(k.startsWith('ambience:')&&k!==key)this.ramp(e,0,420)}
    const e=this.getMedia(path,'ambience');this.ramp(e,.125,850)
  }
  setScore(key){
    const next=key||'',s=this.settings(),f=SCORES[next],path=f?`assets/audio_v103/${f}`:'',mediaKey=path?`music:${path}`:'';
    if(s.music===false||!next||!f){this.currentScore=next;for(const [k,e] of this.media)if(k.startsWith('music:'))this.ramp(e,0,360);return}
    if(this.currentScore===next&&this.media.get(mediaKey)?.wanted)return
    this.currentScore=next;for(const [k,e] of this.media){if(k.startsWith('music:')&&k!==mediaKey)this.ramp(e,0,700)}
    const e=this.getMedia(path,'music');this.ramp(e,next==='final'?.085:.055,1200)
  }
  setScene(view,eventId=0,ambienceName=''){
    if(ambienceName)this.setAmbience(ambienceName);
    let score='';if(view==='street')score='field';else if(view==='office'||view==='archive'||view==='wall')score='office';else if(view==='event')score=EVENT_SCORE[eventId]||'office';else if(view==='resolve')score='office';this.setScore(score)
  }
  sync(){const s=this.settings();if(s.ambience===false){for(const [k,e] of this.media)if(k.startsWith('ambience:'))this.ramp(e,0,250)}else if(this.currentAmb)this.setAmbience(this.currentAmb);if(s.music===false){for(const [k,e] of this.media)if(k.startsWith('music:'))this.ramp(e,0,250)}else if(this.currentScore)this.setScore(this.currentScore)}
  duck(ms=3200){const token=++this.duckToken;if(this.ensure()){const now=this.ctx.currentTime;this.ambBus.gain.cancelScheduledValues(now);this.musicBus.gain.cancelScheduledValues(now);this.ambBus.gain.setTargetAtTime(.48,now,.07);this.musicBus.gain.setTargetAtTime(.36,now,.08);setTimeout(()=>{if(token!==this.duckToken||!this.ctx)return;const n=this.ctx.currentTime;this.ambBus.gain.setTargetAtTime(1,n,.18);this.musicBus.gain.setTargetAtTime(1,n,.24)},Math.min(ms,4600))}else{
      for(const [k,e] of this.media){if(!e.wanted)continue;const base=e.level;e.audio.volume=base*(k.startsWith('music:')?.38:.52);setTimeout(()=>{if(token===this.duckToken)e.audio.volume=base},Math.min(ms,4600))}
    }}
  async loadBuffer(path){if(this.buffers.has(path))return this.buffers.get(path);if(!this.ensure())throw new Error('no audio context');const p=fetch(path).then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer()}).then(ab=>this.ctx.decodeAudioData(ab));this.buffers.set(path,p);try{return await p}catch(e){this.buffers.delete(path);throw e}}
  playBuffer(buffer,channel='fx',rate=1,level=.22,pan=this.pan){if(!this.ensure())return;const src=this.ctx.createBufferSource(),g=this.ctx.createGain(),bus=channel==='music'?this.musicBus:channel==='ambience'?this.ambBus:this.fxBus;src.buffer=buffer;src.playbackRate.value=rate;g.gain.value=level;src.connect(g);if(this.ctx.createStereoPanner&&channel==='fx'){const p=this.ctx.createStereoPanner();p.pan.value=clamp(pan,-.82,.82);g.connect(p);p.connect(bus)}else g.connect(bus);src.start()}
  htmlSample(path,rate=1,level=.22){try{const a=new Audio(path);a.preload='auto';a.volume=level;a.playbackRate=rate;a.play().catch(()=>{})}catch(_e){}}
  mediaSample(path,rate=1,level=.22,pan=this.pan){try{const a=new Audio(path);a.preload='auto';a.playbackRate=rate;if(!this.ensure()){a.volume=level;a.play().catch(()=>{});return}const src=this.ctx.createMediaElementSource(a),g=this.ctx.createGain();g.gain.value=level;src.connect(g);let tail=g;if(this.ctx.createStereoPanner){const p=this.ctx.createStereoPanner();p.pan.value=clamp(pan,-.82,.82);g.connect(p);tail=p}tail.connect(this.fxBus);const rec={a,src,g,tail};this.oneshots.add(rec);const cleanup=()=>{this.oneshots.delete(rec);try{a.pause();src.disconnect();g.disconnect();if(tail!==g)tail.disconnect()}catch(_e){}};a.addEventListener('ended',cleanup,{once:true});a.addEventListener('error',cleanup,{once:true});a.play().catch(()=>{cleanup();this.htmlSample(path,rate,level)})}catch(_e){this.htmlSample(path,rate,level)}}
  synth(kind){if(!this.ensure())return;const c=this.ctx,now=c.currentTime,bus=this.fxBus;
    const out=()=>{if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=clamp(this.pan+(.04*(Math.random()-.5)),-.82,.82);p.connect(bus);return p}return bus};
    const tone=(f,d,v=.018,type='sine',delay=0)=>{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,now+delay);o.connect(g);g.connect(out());g.gain.setValueAtTime(v,now+delay);g.gain.exponentialRampToValueAtTime(.0001,now+delay+d);o.start(now+delay);o.stop(now+delay+d+.02)};
    const noise=(d=.08,v=.012,cut=1600,delay=0)=>{const n=Math.max(1,Math.floor(c.sampleRate*d)),b=c.createBuffer(1,n,c.sampleRate),data=b.getChannelData(0);for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=cut;g.gain.value=v;s.connect(f);f.connect(g);g.connect(out());s.start(now+delay)};
    switch(kind){case'wrong':tone(116,.16,.027,'sawtooth');tone(89,.19,.014,'triangle',.04);break;case'success':tone(650,.11,.020);tone(870,.15,.015,'triangle',.08);break;case'wind':noise(.31,.009,680);break;case'weather':tone(520,.05,.010);tone(780,.05,.008,'triangle',.04);break;case'office':tone(292,.16,.009);tone(390,.18,.007,'triangle',.09);break;case'street':tone(392,.12,.008);tone(523,.14,.006,'triangle',.07);break;case'scene':tone(330,.09,.006);tone(440,.11,.005,'triangle',.06);break;default:tone(440,.035,.016)}}
  sound(kind='tap',channel='fx'){
    const s=this.settings();if(s[channel]===false)return;this.unlock();const rate=['paper','stamp','tape','plate','marble','bike','door'].includes(kind)?.965+Math.random()*.07:1;const file=FX[kind];if(file){const path=`assets/audio_v103/${file}`;this.loadBuffer(path).then(b=>this.playBuffer(b,'fx',rate,.23)).catch(()=>this.mediaSample(path,rate,.22))}this.synth(kind)
  }
  destroy(){removeEventListener('pointerdown',this._unlock);removeEventListener('keydown',this._unlock);removeEventListener('pointermove',this._pointer);document.removeEventListener('visibilitychange',this._visibility);for(const e of this.media.values()){clearInterval(e.timer);e.audio.pause()}for(const r of this.oneshots){try{r.a.pause();r.src.disconnect();r.g.disconnect();if(r.tail!==r.g)r.tail.disconnect()}catch(_e){}}this.oneshots.clear();try{this.ctx?.close()}catch(_e){}}
}
window.GSW_AUDIO={create:getter=>new AudioSystem(getter),EVENT_SCORE,version:'10.3.0'};
})();
