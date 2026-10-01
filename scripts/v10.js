(function(){
'use strict';
document.documentElement.dataset.v10='1';
document.documentElement.dataset.v101='1';
document.documentElement.dataset.v102='1';
document.documentElement.dataset.v103='1';
const app=document.getElementById('app');
const reduced=()=>document.body.classList.contains('low-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;
const PRESET={
  0:{p:.011,light:[.82,.68,.42],fill:[.32,.55,.58],sat:1.02,con:1.04,exp:1.00},
  1:{p:.013,light:[.94,.72,.42],fill:[.29,.52,.56],sat:1.02,con:1.05,exp:1.01},2:{p:.009,light:[.55,.70,.83],fill:[.28,.40,.46],sat:.97,con:1.08,exp:.96},
  3:{p:.012,light:[.42,.82,.72],fill:[.78,.50,.25],sat:1.04,con:1.06,exp:1.00},4:{p:.010,light:[.90,.70,.38],fill:[.34,.49,.52],sat:1.01,con:1.05,exp:1.01},
  5:{p:.009,light:[.70,.82,.80],fill:[.28,.43,.48],sat:.98,con:1.07,exp:.97},6:{p:.013,light:[.84,.69,.37],fill:[.32,.55,.58],sat:1.04,con:1.05,exp:1.02},
  7:{p:.010,light:[.83,.72,.48],fill:[.29,.43,.48],sat:.99,con:1.06,exp:.98},8:{p:.010,light:[.78,.65,.40],fill:[.30,.45,.50],sat:1.00,con:1.07,exp:.98},
  9:{p:.011,light:[1.00,.70,.34],fill:[.45,.58,.52],sat:1.04,con:1.05,exp:1.04},10:{p:.011,light:[.88,.70,.48],fill:[.30,.45,.52],sat:1.00,con:1.06,exp:.99},
  11:{p:.012,light:[.86,.75,.47],fill:[.31,.43,.50],sat:.98,con:1.08,exp:.98},12:{p:.012,light:[.72,.86,.95],fill:[.38,.50,.56],sat:.98,con:1.05,exp:1.03},
  13:{p:.011,light:[.55,.70,.88],fill:[.88,.58,.28],sat:1.02,con:1.08,exp:.98},14:{p:.010,light:[.82,.74,.55],fill:[.38,.52,.54],sat:.98,con:1.06,exp:1.00},
  15:{p:.009,light:[.72,.82,1.00],fill:[.26,.37,.52],sat:.96,con:1.10,exp:.94},16:{p:.010,light:[.46,.85,.77],fill:[.82,.56,.31],sat:1.03,con:1.07,exp:.99},
  17:{p:.010,light:[.88,.70,.44],fill:[.34,.49,.50],sat:1.00,con:1.06,exp:1.00},18:{p:.010,light:[.82,.66,.42],fill:[.34,.48,.50],sat:.99,con:1.08,exp:.97},
  19:{p:.012,light:[.72,.85,.88],fill:[.41,.52,.52],sat:1.02,con:1.05,exp:1.02},20:{p:.010,light:[.96,.68,.34],fill:[.34,.66,.60],sat:1.03,con:1.08,exp:.98}
};
let profilePromise=null;
function loadProfiles(){if(window.GSW_ASSETS_V103?.profiles)return Promise.resolve(window.GSW_ASSETS_V103.profiles);if(!profilePromise)profilePromise=fetch('assets/material_v103/profiles.json').then(r=>{if(!r.ok)throw new Error('material profiles '+r.status);return r.json()}).then(x=>x.profiles||{}).catch(()=>({}));return profilePromise}
function parseMesh(ab){const u8=new Uint8Array(ab);const magic=String.fromCharCode(...u8.slice(0,7));if(magic!=='GSWM103')throw new Error('mesh magic');const dv=new DataView(ab),cols=dv.getUint16(8,true),rows=dv.getUint16(10,true),vc=dv.getUint32(12,true),ic=dv.getUint32(16,true),off=24,vbytes=vc*5*4,ibytes=ic*2;if(off+vbytes+ibytes>ab.byteLength)throw new Error('mesh truncated');return{cols,rows,vertices:new Float32Array(ab,off,vc*5),indices:new Uint16Array(ab,off+vbytes,ic)}}
function loadMesh(src){const key=src.split('/').pop().replace(/\.gswm$/i,''),b64=window.GSW_ASSETS_V103?.meshes?.[key];if(b64){const raw=atob(b64),u=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);return Promise.resolve(parseMesh(u.buffer))}return fetch(src).then(r=>{if(!r.ok)throw new Error('mesh '+r.status);return r.arrayBuffer()}).then(parseMesh)}

const VS=`attribute vec3 aPos;attribute vec2 aUv;varying vec2 v;uniform vec2 camera;uniform float motion,meshDepth;void main(){v=aUv;vec3 p=aPos;p.z=(p.z-.5)*meshDepth;p.x+=camera.x*p.z*.92*motion;p.y+=camera.y*p.z*.58*motion;float w=max(.90,1.0-p.z*.16);gl_Position=vec4(p.x*1.035,p.y*1.035,0.,w);}`;
const FS=`precision highp float;
varying vec2 v;
uniform sampler2D art,depth,normalMap,ormMap;
uniform vec2 pointer,texel,impulse;
uniform float time,parallax,motion,focusDepth,impulsePower,canvasAspect,imageAspect,sat,con,exposure,roughBias,metalBias,wetness;
uniform vec3 keyColor,fillColor;
float dAt(vec2 p){return texture2D(depth,clamp(p,vec2(.001),vec2(.999))).r;}
vec3 grade(vec3 c){float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,sat);c=(c-.5)*con+.5;return c;}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+time*.071)*43758.5453123);}
vec3 aces(vec3 x){const float a=2.51;const float b=.03;const float c=2.43;const float d=.59;const float e=.14;return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.,1.);}
float shadowTerm(vec2 uv,vec2 ldir,float d0){float occ=0.;for(int i=1;i<=4;i++){float fi=float(i);float sd=dAt(uv+ldir*texel*fi*3.0);occ+=step(d0+.010*fi,sd)*(1.0-fi*.13);}return 1.0-occ*.055;}
void main(){
 vec2 uv=v;
 if(imageAspect>canvasAspect){float s=canvasAspect/imageAspect;uv.x=(uv.x-.5)*s+.5;}else{float s=imageAspect/canvasAspect;uv.y=(uv.y-.5)*s+.5;}
 float baseD=dAt(uv);
 vec2 viewShift=(pointer-.5)*parallax*motion;
 vec2 ray=viewShift*(.24+baseD*.86);
 // Four-layer relief parallax: stable enough for mobile WebGL1, visibly separates foreground edges.
 vec2 puv=uv;float layer=1.0;
 for(int i=0;i<4;i++){float dd=dAt(puv);float stepH=(layer-dd)*.22;puv+=ray*stepH*.30;layer-=.18;}
 uv=clamp(puv,vec2(.002),vec2(.998));
 float d=dAt(uv);
 // Local interaction has mass: contact slightly dents/warps the image plane instead of only drawing a glow.
 vec2 iv=v-impulse;float ir=length(iv);float ig=exp(-ir*ir*145.0)*impulsePower*motion;uv+=normalize(iv+vec2(.00001))*ig*.0035*(.35+d);
 float dd=abs(d-focusDepth);vec2 b=texel*(.35+dd*1.55);
 vec3 c0=texture2D(art,uv).rgb;
 vec3 c=(c0*.66+(texture2D(art,uv+vec2(b.x,0.)).rgb+texture2D(art,uv-vec2(b.x,0.)).rgb+texture2D(art,uv+vec2(0.,b.y)).rgb+texture2D(art,uv-vec2(0.,b.y)).rgb)*.085);
 vec3 nt=texture2D(normalMap,uv).rgb*2.0-1.0;
 float dx=dAt(uv+vec2(texel.x*2.,0.))-dAt(uv-vec2(texel.x*2.,0.));
 float dy=dAt(uv+vec2(0.,texel.y*2.))-dAt(uv-vec2(0.,texel.y*2.));
 vec3 nd=normalize(vec3(-dx*3.3,-dy*3.3,.42));vec3 n=normalize(mix(nd,nt,.72));
 vec3 orm=texture2D(ormMap,uv).rgb;float ao=clamp(orm.r,.58,1.0),rough=clamp(orm.g+roughBias-wetness*.22,.14,.99),metal=clamp(orm.b+metalBias,0.,.42);
 vec3 ldir3=normalize(vec3((pointer.x-v.x)*1.25,(pointer.y-v.y)*1.25,.58));vec3 viewDir=vec3(0.,0.,1.);
 float ndl=max(dot(n,ldir3),0.);vec3 halfV=normalize(ldir3+viewDir);float ndh=max(dot(n,halfV),0.);
 float specPow=mix(78.,5.,rough);float spec=pow(ndh,specPow)*(1.0-rough*.62);
 vec3 F0=mix(vec3(.035),max(c0,vec3(.04)),metal);float fres=pow(1.0-max(dot(n,viewDir),0.),5.0);vec3 F=F0+(1.0-F0)*fres;
 float key=max(0.,1.-distance(v,pointer)*1.48);float fill=max(0.,1.-distance(v,vec2(.78,.32))*1.32);
 float sh=shadowTerm(uv,normalize(pointer-v+vec2(.0001)),d);
 c=grade(c)*exposure;
 vec3 diffuse=c*(.88+ndl*.115*sh)*ao;
 vec3 lit=diffuse+keyColor*(key*.026+ndl*.024)*motion+fillColor*fill*.013;
 lit+=F*spec*(.05+key*.11+wetness*.085)*sh;
 // Fine contact sheen on edges without plasticising rough walls.
 float edge=clamp(length(vec2(dx,dy))*5.0,0.,1.);lit+=keyColor*edge*(1.0-rough)*.018*motion;
 float ring=exp(-pow((distance(v,impulse)-.045-impulsePower*.052)*29.,2.))*impulsePower;lit+=keyColor*ring*.046;
 float vig=smoothstep(.94,.28,distance(v,vec2(.5)));lit*=.825+.175*vig;
 float grain=(hash(gl_FragCoord.xy)-.5)*.009*(.65+rough*.35);lit+=grain;
 gl_FragColor=vec4(aces(max(lit,vec3(0.))),1.);
}`;
function compile(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');return s}
function program(gl){const vs=compile(gl,gl.VERTEX_SHADER,VS),fs=compile(gl,gl.FRAGMENT_SHADER,FS),p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);const ok=gl.getProgramParameter(p,gl.LINK_STATUS),err=gl.getProgramInfoLog(p)||'link';gl.detachShader(p,vs);gl.detachShader(p,fs);gl.deleteShader(vs);gl.deleteShader(fs);if(!ok){gl.deleteProgram(p);throw new Error(err)}return p}
function imgLoad(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('image '+src));i.src=src})}
function neutralImage(rgb){const c=document.createElement('canvas');c.width=c.height=2;const x=c.getContext('2d');x.fillStyle=`rgb(${rgb.join(',')})`;x.fillRect(0,0,2,2);return c}
function buildDepthMesh(image,cols=52,rows=30){
 const c=document.createElement('canvas');c.width=cols;c.height=rows;const x=c.getContext('2d',{willReadFrequently:true});let pix=null;try{x.drawImage(image,0,0,cols,rows);pix=x.getImageData(0,0,cols,rows).data}catch(_e){}
 const d=(ix,iy)=>pix?pix[(iy*cols+ix)*4]/255:.5,verts=[];
 const push=(ix,iy)=>{const u=ix/(cols-1),ty=iy/(rows-1),y=1-ty*2,z=d(ix,iy);verts.push(u*2-1,y,z,u,1-ty)};
 for(let y=0;y<rows-1;y++)for(let x0=0;x0<cols-1;x0++){push(x0,y);push(x0+1,y);push(x0,y+1);push(x0,y+1);push(x0+1,y);push(x0+1,y+1)}
 return new Float32Array(verts)
}
function qualityProfile(){
 const mobile=innerWidth<760,mem=Number(navigator.deviceMemory||4),cores=Number(navigator.hardwareConcurrency||4),low=mem<=2||cores<=2,mid=mem<=4||cores<=4;
 if(mobile)return low?{gx:30,gy:18,dpr:.82,fps:26}:{gx:38,gy:22,dpr:1.0,fps:30};
 if(low)return{gx:34,gy:20,dpr:.90,fps:26};
 if(mid)return{gx:46,gy:26,dpr:1.12,fps:30};
 return{gx:58,gy:34,dpr:1.38,fps:32};
}
class Renderer{
 constructor(scene){this.scene=scene;this.art=scene.querySelector('.scene-art');this.canvas=null;this.gl=null;this.p=null;this.raf=0;this.last=0;this.pointer={x:.5,y:.50,tx:.5,ty:.5};this.imp={x:.5,y:.5,p:0};this.focus=.52;this.focusT=.52;this.ro=null;this.bound=[];this.dead=false;this.textures=[];this.vertCount=0;this.indexCount=0;this.buffer=null;this.indexBuffer=null;this.profile=qualityProfile();this.materialProfile=null;this.programOwned=false}
 async init(){if(!this.art)return false;try{
   const src=this.art.getAttribute('src')||this.art.currentSrc;if(!src)return false;const base=src.split('/').pop();
   // Fail fast before loading depth/material maps: WebGL-disabled devices should not pay the PBR asset cost.
   const c=this.canvas=document.createElement('canvas');c.className='v10-webgl';c.setAttribute('aria-hidden','true');this.scene.insertBefore(c,this.scene.children[1]||null);
   const lost=e=>{e.preventDefault();this.stop();this.scene.classList.remove('v10-ready','v101-materials');this.scene.classList.add('v10-fallback');if(this.canvas)this.canvas.style.display='none'};const restored=()=>{if(current===this){this.destroy(true);current=null;sceneChanged()}};c.addEventListener('webglcontextlost',lost,false);c.addEventListener('webglcontextrestored',restored,false);this.bound.push(()=>{c.removeEventListener('webglcontextlost',lost,false);c.removeEventListener('webglcontextrestored',restored,false)});
   const gl=this.gl=c.getContext('webgl',{alpha:false,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'high-performance'})||c.getContext('experimental-webgl');if(!gl)throw new Error('webgl unavailable');this.p=program(gl);this.programOwned=true;gl.useProgram(this.p);
   const artOverride=window.__GSW_ART_INLINE__?.[base],depthOverride=window.__GSW_DEPTH_INLINE__?.[base],normalOverride=window.__GSW_NORMAL_INLINE__?.[base],ormOverride=window.__GSW_ORM_INLINE__?.[base];
   const imagePromise=artOverride?imgLoad(artOverride):(this.art.complete&&this.art.naturalWidth?Promise.resolve(this.art):imgLoad(src));
   const depthPromise=imgLoad(depthOverride||`assets/depth_v10/${base}`);
   const normalPromise=imgLoad(normalOverride||`assets/normal_v101/${base}`).catch(()=>neutralImage([128,128,255]));
   const ormPromise=imgLoad(ormOverride||`assets/orm_v101/${base}`).catch(()=>neutralImage([240,190,4]));
   const meshPromise=loadMesh(`assets/mesh_v103/${base.replace(/\.jpg$/i,'')}.gswm`).catch(()=>null);
   const [image,dep,norm,orm,meshAsset,profiles]=await Promise.all([imagePromise,depthPromise,normalPromise,ormPromise,meshPromise,loadProfiles()]);if(this.dead)return false;
   this.materialProfile=profiles?.[base]||null;this.profile=qualityProfile();const mesh=meshAsset?.vertices||buildDepthMesh(dep,this.profile.gx,this.profile.gy),buf=this.buffer=gl.createBuffer();this.vertCount=mesh.length/5;gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,mesh,gl.STATIC_DRAW);const lp=gl.getAttribLocation(this.p,'aPos'),lu=gl.getAttribLocation(this.p,'aUv');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,3,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(lu);gl.vertexAttribPointer(lu,2,gl.FLOAT,false,20,12);
   if(meshAsset?.indices){this.indexBuffer=gl.createBuffer();this.indexCount=meshAsset.indices.length;gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,meshAsset.indices,gl.STATIC_DRAW)}
   this.tex('art',image,0);this.tex('depth',dep,1);this.tex('normalMap',norm,2);this.tex('ormMap',orm,3);this.imageAspect=image.naturalWidth/image.naturalHeight;this.cacheUniforms();this.resize();this.bind();this.scene.classList.remove('v10-fallback');this.scene.classList.add('v10-ready','v101-materials');if('ResizeObserver'in window){this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(this.scene)}this.start();return true;
 }catch(e){this.scene.classList.add('v10-fallback');this.destroy(true);return false}}
 tex(name,image,unit){const gl=this.gl,t=gl.createTexture();this.textures.push(t);gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.uniform1i(gl.getUniformLocation(this.p,name),unit);return t}
 cacheUniforms(){const gl=this.gl;this.u={};['pointer','camera','texel','time','parallax','motion','meshDepth','focusDepth','impulse','impulsePower','canvasAspect','imageAspect','sat','con','exposure','roughBias','metalBias','wetness','keyColor','fillColor'].forEach(n=>this.u[n]=gl.getUniformLocation(this.p,n))}
 resize(){if(!this.canvas||!this.gl)return;const r=this.scene.getBoundingClientRect();this.profile=qualityProfile();const d=Math.min(this.profile.dpr,devicePixelRatio||1);this.canvas.width=Math.max(2,Math.floor(r.width*d));this.canvas.height=Math.max(2,Math.floor(r.height*d));this.canvas.style.width=r.width+'px';this.canvas.style.height=r.height+'px';this.gl.viewport(0,0,this.canvas.width,this.canvas.height);this.draw(performance.now(),true)}
 preset(){const fallback=PRESET[+(this.scene.dataset.event||document.body.dataset.event||0)]||PRESET[0];return this.materialProfile?{...fallback,...this.materialProfile}:fallback}
 bind(){const move=e=>{const r=this.scene.getBoundingClientRect();this.pointer.tx=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));this.pointer.ty=1-Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};this.scene.addEventListener('pointermove',move,{passive:true});this.bound.push(()=>this.scene.removeEventListener('pointermove',move));
   const bindTarget=el=>{if(el.dataset.v101Bound)return;el.dataset.v101Bound='1';const enter=()=>{const r=this.scene.getBoundingClientRect(),q=el.getBoundingClientRect(),x=(q.left+q.width/2-r.left)/r.width,y=1-(q.top+q.height/2-r.top)/r.height;this.pointer.tx=x;this.pointer.ty=y;this.focusT=Math.max(.15,Math.min(.88,1-y*.65));};const down=e=>{const r=this.scene.getBoundingClientRect();this.imp.x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));this.imp.y=1-Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));this.imp.p=1;this.contact(el);};el.addEventListener('pointerenter',enter);el.addEventListener('focus',enter);el.addEventListener('pointerdown',down);this.bound.push(()=>{delete el.dataset.v101Bound;el.removeEventListener('pointerenter',enter);el.removeEventListener('focus',enter);el.removeEventListener('pointerdown',down)})};
   const scan=()=>[...this.scene.querySelectorAll('button,[role="button"],input,.prop,.anomaly,.evidence,.sound-node,.witness')].forEach(bindTarget);scan();
   this.mo=new MutationObserver(ms=>{scan();for(const m of ms){if(m.type==='attributes'&&/done|found|matched|verified|selected|ready/.test(m.target.className||''))this.statePulse(m.target)}});this.mo.observe(this.scene,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
 }
 contact(el){if(reduced())return;try{el.animate([{filter:'brightness(1)'},{filter:'brightness(1.18) drop-shadow(0 7px 14px rgba(0,0,0,.18))',offset:.32},{filter:'brightness(1)'}],{duration:280,easing:'cubic-bezier(.2,.9,.2,1)'})}catch(_e){}}
 statePulse(el){if(reduced()||!el.animate)return;try{el.animate([{opacity:.80},{opacity:1,filter:'brightness(1.13)',offset:.45},{opacity:1,filter:'brightness(1)'}],{duration:440,easing:'cubic-bezier(.16,.84,.22,1)'})}catch(_e){}}
 start(){if(this.raf||this.dead)return;if(reduced()){this.draw(performance.now(),true);return}this.raf=requestAnimationFrame(t=>this.loop(t))}
 stop(){if(this.raf)cancelAnimationFrame(this.raf);this.raf=0}
 loop(t){this.raf=0;if(this.dead||document.hidden)return;const minFrame=1000/Math.max(24,this.profile?.fps||30);if(this.last&&t-this.last<minFrame){this.raf=requestAnimationFrame(x=>this.loop(x));return}this.last=t;this.pointer.x+=(this.pointer.tx-this.pointer.x)*.072;this.pointer.y+=(this.pointer.ty-this.pointer.y)*.072;this.focus+=(this.focusT-this.focus)*.06;this.imp.p*=.885;this.draw(t,false);this.raf=requestAnimationFrame(x=>this.loop(x))}
 draw(t){const gl=this.gl;if(!gl||!this.p)return;const p=this.p,pr=this.preset(),motion=reduced()?0:1;gl.useProgram(p);gl.uniform2f(this.u.pointer,this.pointer.x,this.pointer.y);gl.uniform2f(this.u.camera,(this.pointer.x-.5)*1.3,(this.pointer.y-.5)*1.0);gl.uniform2f(this.u.texel,1/Math.max(1,this.canvas.width),1/Math.max(1,this.canvas.height));gl.uniform1f(this.u.time,t*.001);gl.uniform1f(this.u.parallax,pr.p);gl.uniform1f(this.u.motion,motion);gl.uniform1f(this.u.meshDepth,pr.meshDepth??.23);gl.uniform1f(this.u.focusDepth,this.focus);gl.uniform2f(this.u.impulse,this.imp.x,this.imp.y);gl.uniform1f(this.u.impulsePower,this.imp.p*motion);gl.uniform1f(this.u.canvasAspect,this.canvas.width/this.canvas.height);gl.uniform1f(this.u.imageAspect,this.imageAspect);gl.uniform1f(this.u.sat,pr.sat);gl.uniform1f(this.u.con,pr.con);gl.uniform1f(this.u.exposure,pr.exp);gl.uniform1f(this.u.roughBias,pr.roughBias||0);gl.uniform1f(this.u.metalBias,pr.metalBias||0);gl.uniform1f(this.u.wetness,pr.wetness||0);gl.uniform3f(this.u.keyColor,...pr.light);gl.uniform3f(this.u.fillColor,...pr.fill);if(this.indexBuffer&&this.indexCount)gl.drawElements(gl.TRIANGLES,this.indexCount,gl.UNSIGNED_SHORT,0);else gl.drawArrays(gl.TRIANGLES,0,this.vertCount)}
 destroy(remove=true){this.dead=true;this.stop();this.ro?.disconnect();this.mo?.disconnect();this.bound.forEach(f=>{try{f()}catch(_e){}});this.bound=[];if(this.gl){this.textures.forEach(t=>{try{this.gl.deleteTexture(t)}catch(_e){}});if(this.buffer)try{this.gl.deleteBuffer(this.buffer)}catch(_e){};if(this.indexBuffer)try{this.gl.deleteBuffer(this.indexBuffer)}catch(_e){};if(this.p&&this.programOwned)try{this.gl.deleteProgram(this.p)}catch(_e){};if(remove)try{this.gl.getExtension('WEBGL_lose_context')?.loseContext()}catch(_e){}}this.textures=[];this.buffer=null;this.indexBuffer=null;this.scene.classList.remove('v10-ready','v101-materials');if(remove)this.canvas?.remove();this.canvas=null;this.gl=null}
}
let current=null,queued=false;
function sceneChanged(){if(queued)return;queued=true;requestAnimationFrame(async()=>{queued=false;const s=app.querySelector('.scene');if(!s||s===current?.scene)return;current?.destroy();current=new Renderer(s);await current.init()})}
const obs=new MutationObserver(sceneChanged);obs.observe(app,{childList:true,subtree:true});document.addEventListener('visibilitychange',()=>{if(!current)return;if(document.hidden)current.stop();else current.start()});new MutationObserver(()=>{if(!current)return;if(reduced())current.stop();current.draw(performance.now(),true);if(!reduced())current.start()}).observe(document.body,{attributes:true,attributeFilter:['class']});addEventListener('resize',()=>current?.resize(),{passive:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sceneChanged);else sceneChanged();addEventListener('beforeunload',()=>{obs.disconnect();current?.destroy()});
window.GSW_V10={version:'10.3.0',renderer:()=>current,features:['offline-mesh-assets','scene-material-profiles','relief-parallax','normal-map','orm-materials','wet-surface-response','contact-shadow','interaction-deformation','adaptive-quality','explicit-gpu-cleanup']};
})();
