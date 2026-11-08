// 協會小角色「小松」：戴學士帽的小松樹（原創）
(function(){
const css=`.msc{display:inline-block;transform-origin:50% 90%}
.msc.bob{animation:mscBob 2.2s ease-in-out infinite}
.msc.flyin{animation:mscFly 1.1s cubic-bezier(.2,1.4,.4,1) both,mscBob 2.2s ease-in-out 1.1s infinite}
.msc.hop{animation:mscHop .7s cubic-bezier(.3,1.6,.5,1),mscBob 2.2s ease-in-out .7s infinite}
.msc .arm{transform-origin:84px 84px;animation:mscWave 1s ease-in-out infinite}
.msc .tassel{transform-origin:92px 26px;animation:mscTassel 1.6s ease-in-out infinite}
.msc .eyes{transform-origin:60px 70px;animation:mscBlink 4s infinite}
.msc .cheek{animation:mscCheek 2.2s ease-in-out infinite}
@keyframes mscBob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-6px) rotate(2deg)}}
@keyframes mscFly{0%{transform:translate(70vw,-60vh) rotate(-260deg) scale(.3);opacity:0}60%{opacity:1}100%{transform:translate(0,0) rotate(0) scale(1)}}
@keyframes mscHop{0%{transform:translateY(0) scale(1,1)}25%{transform:translateY(2px) scale(1.08,.9)}55%{transform:translateY(-22px) scale(.95,1.06) rotate(-8deg)}80%{transform:translateY(0) scale(1.04,.96)}100%{transform:translateY(0) scale(1)}}
@keyframes mscWave{0%,100%{transform:rotate(0)}50%{transform:rotate(-28deg)}}
@keyframes mscTassel{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(14deg)}}
@keyframes mscBlink{0%,46%,50%,100%{transform:scaleY(1)}48%{transform:scaleY(.1)}}
@keyframes mscCheek{50%{opacity:.95}}
@media(prefers-reduced-motion:reduce){.msc,.msc *{animation:none!important}}`;
const st=document.createElement('style');st.textContent=css;(document.head||document.documentElement).appendChild(st);
window.MASCOT=function(size,mode){size=size||88;
return`<span class="msc ${mode==='fly'?'flyin':'bob'}"><svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
<ellipse cx="60" cy="114" rx="28" ry="4.5" fill="#000" opacity=".12"/>
<rect x="55" y="96" width="10" height="14" rx="3" fill="#b9874f"/>
<path d="M60 30 C70 44 80 52 86 62 C80 63 78 63 76 64 C84 74 92 84 96 98 C80 100 40 100 24 98 C28 84 36 74 44 64 C42 63 40 63 34 62 C40 52 50 44 60 30Z" fill="#8fd14f" stroke="#5f9f2e" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M60 34 C66 44 72 50 76 58 C66 56 54 56 44 58 C48 50 54 44 60 34Z" fill="#b6e58a"/>
<g class="eyes"><ellipse cx="50" cy="72" rx="5" ry="6" fill="#1e3020"/><ellipse cx="70" cy="72" rx="5" ry="6" fill="#1e3020"/>
<circle cx="51.8" cy="70" r="1.8" fill="#fff"/><circle cx="71.8" cy="70" r="1.8" fill="#fff"/></g>
<path d="M53 81 Q60 88 67 81" stroke="#1e3020" stroke-width="2.8" fill="#e85d5d" stroke-linecap="round" stroke-linejoin="round"/>
<g class="cheek" opacity=".65"><ellipse cx="42" cy="80" rx="4.5" ry="3" fill="#ff9a9a"/><ellipse cx="78" cy="80" rx="4.5" ry="3" fill="#ff9a9a"/></g>
<g class="arm"><path d="M84 84 Q98 78 100 64" stroke="#8fd14f" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="100" cy="62" r="5" fill="#8fd14f" stroke="#5f9f2e" stroke-width="2"/></g>
<path d="M36 86 Q24 84 20 74" stroke="#8fd14f" stroke-width="7" fill="none" stroke-linecap="round"/>
<g>
 <path d="M44 30 L44 38 Q60 46 76 38 L76 30 Z" fill="#26364a"/>
 <path d="M24 24 L60 10 L96 24 L60 38 Z" fill="#1f2d40" stroke="#0f1824" stroke-width="1.5" stroke-linejoin="round"/>
 <path d="M24 24 L60 10 L96 24" fill="none" stroke="#3b5578" stroke-width="2" stroke-linejoin="round"/>
 <circle cx="60" cy="24" r="3" fill="#f2c94c"/>
 <g class="tassel"><path d="M60 24 L92 26 L92 42" stroke="#f2c94c" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M88 42 L96 42 L94 52 L90 52 Z" fill="#f2c94c"/></g>
</g>
</svg></span>`};
window.MASCOT_HOP=function(root){const m=(root||document).querySelector('.msc');if(!m)return;m.classList.remove('hop','flyin','bob');void m.offsetWidth;m.classList.add('hop')};
})();
