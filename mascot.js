// 協會小角色「小松」：戴學士帽的小松苗（原創）
window.MASCOT=function(size,mood){size=size||88;const blink=mood==='wave'?'<animateTransform attributeName="transform" type="rotate" values="0 70 70;-18 70 70;0 70 70" dur="1.4s" repeatCount="indefinite"/>':'';
return`<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
<ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity=".12"/>
<path d="M60 108 L60 86" stroke="#6b4a2b" stroke-width="6" stroke-linecap="round"/>
<path d="M60 22 L88 70 L76 70 L94 96 L26 96 L44 70 L32 70 Z" fill="#5d9a3c"/>
<path d="M60 22 L74 46 L46 46 Z" fill="#7bb34f"/>
<circle cx="50" cy="74" r="4.2" fill="#1e3020"/><circle cx="70" cy="74" r="4.2" fill="#1e3020"/>
<circle cx="51.5" cy="72.6" r="1.3" fill="#fff"/><circle cx="71.5" cy="72.6" r="1.3" fill="#fff"/>
<path d="M53 82 Q60 88 67 82" stroke="#1e3020" stroke-width="2.6" fill="none" stroke-linecap="round"/>
<circle cx="44" cy="81" r="3.6" fill="#f4a3a0" opacity=".7"/><circle cx="76" cy="81" r="3.6" fill="#f4a3a0" opacity=".7"/>
<g><path d="M86 84 Q100 76 98 64" stroke="#5d9a3c" stroke-width="6" fill="none" stroke-linecap="round"/>${blink}</g>
<g transform="translate(0,-2)"><path d="M36 22 L60 12 L84 22 L60 32 Z" fill="#1e3020"/><path d="M46 26 L46 33 Q60 40 74 33 L74 26 L60 32 Z" fill="#2f5524"/>
<path d="M84 22 L84 36" stroke="#9bbb45" stroke-width="2"/><circle cx="84" cy="38" r="3" fill="#9bbb45"/></g>
</svg>`};
