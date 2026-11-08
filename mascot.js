// 協會小角色「小松」：戴學士帽的小松樹（原創）
(function(){
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const css=`.msc{display:inline-block;transform-origin:50% 90%;position:relative}
.msc.bob{animation:mscBob 2.2s ease-in-out infinite}
.msc.flyin{animation:mscFly 1.1s cubic-bezier(.2,1.4,.4,1) both}
.msc .arm{transform-origin:84px 84px;animation:mscWave 1.2s ease-in-out infinite}
.msc .arm2{transform-origin:36px 86px}
.msc .tassel{transform-origin:92px 26px;animation:mscTassel 1.6s ease-in-out infinite}
.msc .eyes{transform-origin:60px 72px;animation:mscBlink 4s infinite}
.msc .cap{transform-origin:60px 30px}
.msc.a-jump{animation:mscJump .9s cubic-bezier(.3,1.6,.5,1)}
.msc.a-spin{animation:mscSpin 1s cubic-bezier(.5,0,.3,1.2)}
.msc.a-wiggle{animation:mscWiggle .9s ease-in-out}
.msc.a-dance{animation:mscDance 1.4s ease-in-out}
.msc.a-nod{animation:mscNod 1s ease-in-out}
.msc.a-cap .cap{animation:mscCap 1.1s cubic-bezier(.3,1.3,.5,1)}
.msc.a-wave .arm{animation:mscWave .35s ease-in-out 4}
.msc.a-wave2 .arm2{animation:mscWave2 .4s ease-in-out 3}
.msc.a-peek{animation:mscPeek 1.3s ease-in-out}
@keyframes mscBob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-6px) rotate(2deg)}}
@keyframes mscFly{0%{transform:translate(70vw,-60vh) rotate(-260deg) scale(.3);opacity:0}60%{opacity:1}100%{transform:translate(0,0) rotate(0) scale(1)}}
@keyframes mscJump{0%{transform:translateY(0) scale(1)}20%{transform:translateY(3px) scale(1.12,.86)}50%{transform:translateY(-30px) scale(.94,1.08) rotate(-6deg)}75%{transform:translateY(0) scale(1.06,.94)}100%{transform:none}}
@keyframes mscSpin{0%{transform:rotate(0) scale(1)}50%{transform:rotate(200deg) scale(1.1) translateY(-10px)}100%{transform:rotate(360deg) scale(1)}}
@keyframes mscWiggle{0%,100%{transform:rotate(0)}20%{transform:rotate(-14deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-9deg)}80%{transform:rotate(6deg)}}
@keyframes mscDance{0%,100%{transform:translateX(0) rotate(0)}20%{transform:translateX(-8px) rotate(-10deg) translateY(-4px)}40%{transform:translateX(8px) rotate(10deg)}60%{transform:translateX(-8px) rotate(-10deg) translateY(-4px)}80%{transform:translateX(8px) rotate(10deg)}}
@keyframes mscNod{0%,100%{transform:rotate(0)}25%,75%{transform:rotate(8deg) translateY(2px)}50%{transform:rotate(-2deg)}}
@keyframes mscCap{0%{transform:none}35%{transform:translateY(-26px) rotate(-200deg)}70%{transform:translateY(-8px) rotate(-360deg)}100%{transform:rotate(-360deg)}}
@keyframes mscPeek{0%,100%{transform:none}30%{transform:translateY(14px) scale(1,.9)}60%{transform:translateY(-8px) scale(1,1.05)}}
@keyframes mscWave{0%,100%{transform:rotate(0)}50%{transform:rotate(-30deg)}}
@keyframes mscWave2{0%,100%{transform:rotate(0)}50%{transform:rotate(28deg)}}
@keyframes mscTassel{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(14deg)}}
@keyframes mscBlink{0%,46%,50%,100%{transform:scaleY(1)}48%{transform:scaleY(.1)}}
.mscfx{position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:2147483647}
.mscfx i{position:absolute;display:block;will-change:transform,opacity}
@media(prefers-reduced-motion:reduce){.msc,.msc *{animation:none!important}}`;
const st=document.createElement('style');st.textContent=css;(document.head||document.documentElement).appendChild(st);

window.MASCOT=function(size,mode){size=size||88;
return`<span class="msc ${mode==='fly'?'flyin':'bob'}" data-msc="${mode==='fly'?'fly':''}"><svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true" focusable="false" style="overflow:visible">
<ellipse cx="60" cy="114" rx="28" ry="4.5" fill="#000" opacity=".12"/>
<rect x="55" y="96" width="10" height="14" rx="3" fill="#b9874f"/>
<path d="M60 30 C70 44 80 52 86 62 C80 63 78 63 76 64 C84 74 92 84 96 98 C80 100 40 100 24 98 C28 84 36 74 44 64 C42 63 40 63 34 62 C40 52 50 44 60 30Z" fill="#8fd14f" stroke="#5f9f2e" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M60 34 C66 44 72 50 76 58 C66 56 54 56 44 58 C48 50 54 44 60 34Z" fill="#b6e58a"/>
<g class="eyes"><ellipse cx="50" cy="72" rx="5" ry="6" fill="#1e3020"/><ellipse cx="70" cy="72" rx="5" ry="6" fill="#1e3020"/>
<circle cx="51.8" cy="70" r="1.8" fill="#fff"/><circle cx="71.8" cy="70" r="1.8" fill="#fff"/></g>
<path d="M53 81 Q60 88 67 81" stroke="#1e3020" stroke-width="2.8" fill="#e85d5d" stroke-linecap="round" stroke-linejoin="round"/>
<g opacity=".65"><ellipse cx="42" cy="80" rx="4.5" ry="3" fill="#ff9a9a"/><ellipse cx="78" cy="80" rx="4.5" ry="3" fill="#ff9a9a"/></g>
<g class="arm"><path d="M84 84 Q98 78 100 64" stroke="#8fd14f" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="100" cy="62" r="5" fill="#8fd14f" stroke="#5f9f2e" stroke-width="2"/></g>
<g class="arm2"><path d="M36 86 Q24 84 20 74" stroke="#8fd14f" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="20" cy="72" r="5" fill="#8fd14f" stroke="#5f9f2e" stroke-width="2"/></g>
<g class="cap">
 <path d="M44 30 L44 38 Q60 46 76 38 L76 30 Z" fill="#26364a"/>
 <path d="M24 24 L60 10 L96 24 L60 38 Z" fill="#1f2d40" stroke="#0f1824" stroke-width="1.5" stroke-linejoin="round"/>
 <path d="M24 24 L60 10 L96 24" fill="none" stroke="#3b5578" stroke-width="2" stroke-linejoin="round"/>
 <circle cx="60" cy="24" r="3" fill="#f2c94c"/>
 <g class="tassel"><path d="M60 24 L92 26 L92 42" stroke="#f2c94c" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M88 42 L96 42 L94 52 L90 52 Z" fill="#f2c94c"/></g>
</g>
</svg></span>`};

// ===== 銀色亮片、彩帶特效 =====
const METAL=['linear-gradient(135deg,#ffffff,#b9c1cc 45%,#f4f6f9 60%,#8d97a5)','linear-gradient(135deg,#f7f9fb,#9aa4b2 50%,#e6eaef)','linear-gradient(135deg,#fff8dc,#e5b93a 50%,#fff2b8)','linear-gradient(135deg,#ffffff,#c8cfd8 40%,#7f8a99)'];
const SILVER=METAL;
function layerFor(el){const host=el.closest('dialog[open]')||document.body;let L=host.querySelector(':scope > .mscfx');if(!L){L=document.createElement('div');L.className='mscfx';host.appendChild(L)}return L}
function piece(L,x,y,kind){const i=document.createElement('i');const c=SILVER[Math.floor(Math.random()*SILVER.length)];
 if(kind==='ribbon'){const w=5+Math.random()*3,h=22+Math.random()*18;Object.assign(i.style,{width:w+'px',height:h+'px',background:c,borderRadius:'3px',boxShadow:'0 0 0 1px rgba(80,92,108,.35),0 0 8px rgba(255,255,255,.9)'})}
 else if(kind==='star'){const z=16+Math.random()*8;Object.assign(i.style,{width:z+'px',height:z+'px',background:c,clipPath:'polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%)',filter:'drop-shadow(0 0 1px rgba(60,70,85,.6)) drop-shadow(0 0 5px #fff)'})}
 else{const s=7+Math.random()*7;Object.assign(i.style,{width:s+'px',height:s*0.6+'px',background:c,borderRadius:'1px',boxShadow:'0 0 0 1px rgba(80,92,108,.3),0 0 6px rgba(255,255,255,.9)'})}
 i.style.left=x+'px';i.style.top=y+'px';L.appendChild(i);return i}
function burst(el,n,power){if(RM||!el||!el.isConnected)return;const r=el.getBoundingClientRect();if(!r.width)return;const L=layerFor(el);const cx=r.left+r.width/2,cy=r.top+r.height*0.45;
 for(let k=0;k<n;k++){const kind=k%5===0?'star':k%3===0?'ribbon':'dot';const p=piece(L,cx,cy,kind);
  const a=Math.random()*Math.PI*2,v=(power||1)*(60+Math.random()*120),dx=Math.cos(a)*v,dy=Math.sin(a)*v-60*(power||1),rot=(Math.random()-.5)*900,dur=1100+Math.random()*900;
  p.animate([{transform:'translate(-50%,-50%) rotate(0) scale(.4)',opacity:1},{transform:`translate(calc(-50% + ${dx*.7}px),calc(-50% + ${dy*.7}px)) rotate(${rot*.6}deg) scale(1)`,opacity:1,offset:.45},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy+140}px)) rotate(${rot}deg) scale(.8)`,opacity:0}],{duration:dur,easing:'cubic-bezier(.2,.7,.4,1)'}).onfinish=()=>p.remove()}}
function ring(el){if(RM||!el||!el.isConnected)return;const r=el.getBoundingClientRect();const L=layerFor(el);const i=document.createElement('i');
 Object.assign(i.style,{left:(r.left+r.width/2)+'px',top:(r.top+r.height/2)+'px',width:r.width*1.3+'px',height:r.width*1.3+'px',borderRadius:'50%',border:'4px solid #c3cad4',boxShadow:'0 0 0 2px #fff,0 0 22px 8px rgba(190,200,214,.85)'});L.appendChild(i);
 i.animate([{transform:'translate(-50%,-50%) scale(.2)',opacity:1},{transform:'translate(-50%,-50%) scale(1.6)',opacity:0}],{duration:900,easing:'ease-out'}).onfinish=()=>i.remove()}
function trail(el){if(RM||!el||!el.isConnected)return;const r=el.getBoundingClientRect();if(!r.width)return;const L=layerFor(el);
 for(let k=0;k<6;k++)setTimeout(()=>{const p=piece(L,r.left+Math.random()*r.width,r.top+Math.random()*r.height*.6,k%2?'star':'dot');
  p.animate([{transform:'translate(-50%,-50%) scale(0)',opacity:0},{transform:'translate(-50%,-50%) scale(1.1)',opacity:1,offset:.3},{transform:`translate(-50%,calc(-50% + 40px)) scale(.3) rotate(180deg)`,opacity:0}],{duration:1200,easing:'ease-out'}).onfinish=()=>p.remove()},k*120)}

// ===== 隨機動作，避免每次都一樣 =====
const ACTS=['a-jump','a-spin','a-wiggle','a-dance','a-nod','a-cap','a-wave','a-wave2','a-peek'];
const last=new WeakMap();
function act(m,name){if(!m||RM)return;const prev=last.get(m);let a=name;while(!a||a===prev)a=ACTS[Math.floor(Math.random()*ACTS.length)];last.set(m,a);
 ACTS.forEach(x=>m.classList.remove(x));m.classList.remove('bob','flyin');void m.offsetWidth;m.classList.add(a);
 if(a==='a-jump'||a==='a-spin'||a==='a-cap'||a==='a-dance')setTimeout(()=>burst(m,14,.6),a==='a-jump'?380:250);else trail(m);
 clearTimeout(m._t);m._t=setTimeout(()=>{m.classList.remove(a);m.classList.add('bob')},1500)}
window.MASCOT_HOP=function(root){act((root||document).querySelector('.msc'))};
window.MASCOT_ACT=act;
// 出場特效：飛入落地時爆出銀色亮片、光圈，然後淡出
function arrive(m){if(m._arr)return;m._arr=1;setTimeout(()=>{ring(m);burst(m,48,1.25);m.classList.remove('flyin');m.classList.add('bob');setTimeout(()=>act(m,'a-wave'),500)},1050)}
new MutationObserver(ms=>{for(const x of ms)for(const n of x.addedNodes){if(n.nodeType!==1)continue;const list=n.matches&&n.matches('.msc[data-msc="fly"]')?[n]:[...(n.querySelectorAll?n.querySelectorAll('.msc[data-msc="fly"]'):[])];list.forEach(arrive)}}).observe(document.documentElement,{childList:true,subtree:true});
// 閒置時每隔幾秒做不同的小動作，吸引注意
setInterval(()=>{if(document.hidden)return;document.querySelectorAll('.msc').forEach(m=>{if(!m.isConnected||!m.getBoundingClientRect().width)return;if(Math.random()<.55)act(m)})},4200);
})();
