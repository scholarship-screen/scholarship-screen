// ===== 欄位定義 =====
const FIELDS=[
 {k:'id',l:'編號'},
 {k:'name',l:'姓名'},
 {k:'level',l:'學制',opt:['大學部','碩士班','博士班']},
 {k:'div',l:'部別',opt:['日間部','進修部','夜間部','推廣教育','空中大學']},
 {k:'dept',l:'系所'},
 {k:'grade',l:'年級'},
 {k:'nation',l:'國籍',opt:['本國','外籍']},
 {k:'family',l:'家庭型態',opt:['雙親','單親']},
 {k:'fatherName',l:'父親姓名'},
 {k:'motherName',l:'母親姓名'},
 {k:'guardianName',l:'監護人姓名',hint:'單親家庭才填'},
 {k:'incSelf',l:'申請人年所得',num:1},
 {k:'incF',l:'父親年所得',num:1},
 {k:'incM',l:'母親年所得',num:1},
 {k:'incG',l:'監護人年所得',num:1,hint:'單親家庭才填'},
 {k:'score',l:'前學期學業成績',num:1},
 {k:'rankPct',l:'班級排名百分比',num:1,hint:'例：前 30% 填 30'},
 {k:'conduct',l:'前學期操行成績',num:1,hint:'甲乙丙也可'},
 {k:'demerit',l:'懲處紀錄',opt:['無','警告','小過','大過以上'],hint:'因故意行為'},
 {k:'gov',l:'公費生',opt:['否','是']},
 {k:'otherAid',l:'其他獎學金每學期金額',num:1},
 {k:'d_id',l:'文件-學生證或在學證明',opt:['已附','未附'],doc:1},
 {k:'d_tr',l:'文件-前學期成績單（含班排）',opt:['已附','未附'],doc:1},
 {k:'d_hh',l:'文件-全戶戶籍謄本',opt:['已附','未附'],doc:1},
 {k:'d_prop',l:'文件-財產稅總歸戶清單',opt:['已附','未附'],doc:1},
 {k:'d_inc',l:'文件-綜合所得稅資料清單',opt:['已附','未附'],doc:1,ex:1},
 {k:'d_rec',l:'文件-導師或系主任推薦函',opt:['已附','未附'],doc:1,ex:1},
 {k:'d_wel',l:'文件-低收中低收或特殊境遇證明',opt:['無須','已附','未附'],doc:2,need:'welfare'},
 {k:'d_dis',l:'文件-身障手冊或重大傷病卡',opt:['無須','已附','未附'],doc:2,need:'disab'},
 {k:'d_unemp',l:'文件-失業家庭證明',opt:['無須','已附','未附'],doc:3},
 {k:'docNote',l:'文件備註'},
 {k:'prev',l:'上學期已獲本助學金',opt:['否','是']},
 {k:'welfare',l:'福利身分',opt:['無','低收入戶','中低收入戶','特殊境遇家庭']},
 {k:'disab',l:'身障手冊或重大傷病卡',opt:['無','本人','二等親內']},
 {k:'house',l:'家戶房產',opt:['有','無']},
 {k:'fam',l:'家戶代號',hint:'同一家庭的兄弟姊妹填相同代號'},
 {k:'memo',l:'自傳／推薦函重點',area:1},
 {k:'studentNo',l:'學號'},
 {k:'phone',l:'手機'},
 {k:'email',l:'Email'},
 {k:'override',l:'評審決議',opt:['依系統','評審排除','評審追加']},
 {k:'overNote',l:'決議說明'}
];
const DEF={org:'清寒及弱勢助學金',quotaU:29,quotaG:4,incomeLimit:600000,spotPct:10,kwX:'資訊工程,資工',scoreMin:70,rankPct:50,aRatio:'2/3',groups:5,
 conductMin:75,otherMax:50000,penalty:'警告',
 kwA:'電子,電機,光電,物理,通訊,生物,機電,自動化,半導體',kwB:'紡織,材料,機械,工業工程,工業管理',backfill:'是'};
let S=Object.assign({},DEF), APPS=[], R=[];
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function load(){try{const d=JSON.parse(localStorage.getItem('sch_screen')||'null');if(d){APPS=d.apps||[];S=Object.assign({},DEF,d.s||{})}}catch(e){}}
function save(){try{localStorage.setItem('sch_screen',JSON.stringify({apps:APPS,s:S}))}catch(e){}}

// ===== 解析 =====
function num(v){if(v==null||v==='')return 0;let s=String(v).replace(/[,\s元]/g,'');let m=1;if(s.includes('萬')){m=10000;s=s.replace('萬','')}const n=parseFloat(s);return isNaN(n)?0:n*m}
const yes=v=>/^(是|有|y|yes|1|v|✓|true|○)$/i.test(String(v??'').trim());
function gradeNum(v){const s=String(v??'');const m=s.match(/\d+/);if(m)return+m[0];const c='一二三四五六七'.indexOf((s.match(/[一二三四五六七]/)||[''])[0]);return c>=0?c+1:0}
function ratio(){const s=String(S.aRatio).trim();if(s.includes('/')){const[a,b]=s.split('/').map(Number);return a/b}const n=parseFloat(s);return n>1?n/100:n}
function cat(dept){const d=String(dept||'');if(String(S.kwX||'').split(/[,，、]/).some(k=>k.trim()&&d.includes(k.trim())))return null;if(S.kwA.split(/[,，、]/).some(k=>k.trim()&&d.includes(k.trim())))return'A';if(S.kwB.split(/[,，、]/).some(k=>k.trim()&&d.includes(k.trim())))return'B';return null}
const lvl=a=>/碩|博|研究/.test(a.level||'')?'G':'U';
const wan=n=>(n/10000).toFixed(1)+' 萬';

// ===== 核心計算 =====
function compute(){
 const lim=num(S.incomeLimit),smin=+S.scoreMin,rp=+S.rankPct;
 R=APPS.map((a,i)=>{
  const x={a,i,L:lvl(a),cat:cat(a.dept),reasons:[],notes:[]};
  x.single=/單/.test(a.family||'');
  x.house=x.single?num(a.incSelf)+num(a.incG):num(a.incSelf)+num(a.incF)+num(a.incM);
  x.score=parseFloat(a.score)||0; x.rank=a.rankPct===''||a.rankPct==null?100:parseFloat(a.rankPct);
  x.grade=gradeNum(a.grade);
  const w=String(a.welfare||'');x.welfare=/低收|特殊/.test(w);
  x.disab=/本人|親/.test(a.disab||'');
  x.noHouse=/無|否/.test(a.house||'');
  x.prev=yes(a.prev);
  x.p1=x.prev&&x.welfare;
  if(/外/.test(a.nation||''))x.reasons.push('非本國籍｜國籍：'+a.nation);
  if(!x.cat)x.reasons.push('科系不符｜'+(a.dept||'未填系所')+' 不在補助科系範圍');
  if(x.house>lim)x.reasons.push(`所得超標｜家戶年所得 ${wan(x.house)}，上限 ${wan(lim)}`);
  if(x.score<smin&&!(x.rank<=rp))x.reasons.push(`成績未達｜成績 ${x.score} 分（需 ${smin} 分），班排 ${x.rank<100?'前 '+x.rank+'%':'未提供'}（需前 ${rp}%）`);
  const PL=['無','警告','小過','大過以上'],pv=yes(a.demerit)?3:Math.max(0,PL.indexOf(String(a.demerit||'無').replace('大過','大過以上').replace('以上以上','以上'))),pt=Math.max(1,PL.indexOf(S.penalty));
  if(pv>=pt)x.reasons.push(`懲處紀錄｜曾記${PL[pv]}`);
  if(/進修|夜間|推廣|空中/.test(a.div||''))x.reasons.push(`非日間部｜${a.div}不在補助範圍`);
  const cd=String(a.conduct??'').trim(),cn=/甲|優/.test(cd)?85:/乙/.test(cd)?75:/丙|丁/.test(cd)?65:parseFloat(cd);
  if(cd&&!isNaN(cn)&&cn<+S.conductMin)x.reasons.push(`操行未達｜操行 ${cd}（需 ${S.conductMin} 分以上）`);
  if(yes(a.gov))x.reasons.push('公費生｜已享公費待遇');
  if(num(a.otherAid)>=num(S.otherMax))x.reasons.push(`他項獎學金超額｜每學期已領 ${wan(num(a.otherAid))}（須低於 ${wan(num(S.otherMax))}）`);
  const legacyOK=yes(a.docs)&&FIELDS.filter(f=>f.doc===1).every(f=>!a[f.k]);
  const has=v=>/已附|^是$|^有$|^v$|✓|○/i.test(String(v??'').trim());
  x.missing=legacyOK?[]:FIELDS.filter(f=>f.doc===1&&!(f.ex&&x.prev)&&!has(a[f.k])&&!/待核/.test(a[f.k]||'')).map(f=>f.l.replace('文件-',''));
  x.pend=FIELDS.filter(f=>f.doc&&/待核/.test(a[f.k]||'')).length;
  if(x.pend)x.notes.push(`待核對｜有 ${x.pend} 份上傳文件尚未人工核對`);
  const rej=FIELDS.filter(f=>f.doc&&/退回/.test(a[f.k]||'')).map(f=>f.l.replace('文件-',''));
  if(rej.length)x.reasons.push('文件退回｜'+rej.join('、')+' 內容不符，需重新繳交');
  const mm=x.missing.filter(m=>!rej.includes(m));if(mm.length)x.reasons.push('文件不全｜缺：'+mm.join('、')+(a.docNote?'（'+a.docNote+'）':''));
  if(x.welfare&&/未附|無須/.test(a.d_wel||'')){x.welfare=false;x.p1=false;x.notes.push('福利身分未附證明｜不列入優先條件')}
  if(x.disab&&/未附|無須/.test(a.d_dis||'')){x.disab=false;x.notes.push('身障未附證明｜不列入優先條件')}
  if(a.override==='評審排除')x.reasons.push('評審排除｜'+(a.overNote||'評審會議決議'));
  x.hold=x.reasons.length>0&&x.reasons.every(r=>/^文件(不全|退回)/.test(r));
  if(x.score<smin&&x.rank<=rp&&!x.reasons.length)x.notes.push(`班排補足｜成績未達 ${smin}，以班排前 ${x.rank}% 符合`);
  return x;
 });
 // 同一家庭：都可以通過，只加註標籤
 const fams={};R.forEach(x=>{const f=String(x.a.fam||'').trim();if(f)(fams[f]=fams[f]||[]).push(x)});
 Object.values(fams).filter(g=>g.length>1).forEach(g=>g.forEach(x=>x.notes.push('同家庭｜與 '+g.filter(y=>y!==x).map(y=>(y.a.id?y.a.id+' ':'')+y.a.name).join('、')+' 同一家庭')));
 const pastSup=S.supDeadline&&Date.now()>new Date(S.supDeadline+'T23:59:59+08:00').getTime();
 const key=x=>[x.p1?1:0,x.welfare?1:0,x.disab?1:0,x.noHouse?1:0,-x.house,x.grade,x.score];
 const cmp=(p,q)=>{const a=key(p),b=key(q);for(let i=0;i<a.length;i++)if(a[i]!==b[i])return b[i]-a[i];return 0};
 const out={};
 for(const L of['U','G']){
  const N=+(L==='U'?S.quotaU:S.quotaG);
  let el=R.filter(x=>x.L===L&&!x.reasons.length).sort(cmp);
  el.forEach((x,k)=>x.rk=k+1);
  const aMin=Math.ceil(N*ratio()-1e-9),bMax=Math.max(0,N-aMin);
  let a=0,b=0;const ch=new Set();
  for(const x of el){if(ch.size>=N)break;if(x.cat==='A'){ch.add(x);a++}else if(b<bMax){ch.add(x);b++}else x.notes.push('類別名額已滿｜機械／紡織／工工類名額 '+bMax+' 名已滿')}
  let bf=0;
  if(ch.size<N&&S.backfill==='是'){for(const x of el){if(ch.size>=N)break;if(!ch.has(x)){ch.add(x);bf++;x.notes.push('名額回流｜電子電機類人數不足，名額回流')}}}
  let w=0;
  el.forEach(x=>{if(ch.has(x))x.st='ok';else{x.st='wait';x.wn=++w;if(!x.notes.some(n=>n.startsWith('類別')))x.notes.push(`名額已滿｜排名第 ${x.rk}，名額 ${N} 名已滿`)}});
  R.filter(x=>x.L===L&&x.reasons.length).forEach(x=>{x.st=x.hold?(pastSup?'late':'hold'):'no';if(x.st==='late')x.notes.push('逾期未補件｜補件期限 '+S.supDeadline+' 已過，請委員會議決定')});
  R.filter(x=>x.L===L&&x.a.override==='評審追加'&&x.st!=='ok').forEach(x=>{x.st='add';x.reasons=x.reasons.filter(r=>!r.startsWith('評審'));x.overrode=x.reasons.slice();x.reasons=[];x.notes.push('評審追加｜'+(x.a.overNote||'評審會議決議追加'))});
  out[L]={N,aMin,bMax,a:[...ch].filter(x=>x.cat==='A').length,b:[...ch].filter(x=>x.cat==='B').length,bf,el};
 }
 // 分組：依學制、排名輪流分配
 const G=Math.max(1,+S.groups||1);
 const ord=[...R].sort((p,q)=>(p.L>q.L?-1:p.L<q.L?1:0)||((p.rk||999)-(q.rk||999))||(String(p.a.id).localeCompare(String(q.a.id),'zh-Hant',{numeric:true})));
 ord.forEach((x,k)=>x.grp=(k%G)+1);
 return out;
}

// ===== 畫面 =====
function tab(t){document.querySelectorAll('nav>button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));document.querySelectorAll('main>section').forEach(s=>s.classList.toggle('hidden',s.id!=='t-'+t));window.scrollTo(0,0)}
document.querySelectorAll('nav>button').forEach(b=>b.onclick=()=>tab(b.dataset.t));

function chips(x){let h='';if(x.p1)h+='<span class="chip p1">續領＋福利身分</span>';else if(x.welfare)h+=`<span class="chip p2">${esc(x.a.welfare)}</span>`;if(x.disab)h+=`<span class="chip p3">身障／重傷（${esc(x.a.disab)}）</span>`;if(x.noHouse)h+='<span class="chip p4">無房產</span>';return h||'<span class="muted">—</span>'}
const TAGTIP={'所得超標':'申請人＋父母年所得合計超過上限','成績未達':'前學期成績未達門檻，且班排不在範圍內','操行未達':'操行未達乙等','科系不符':'非電子電機、機械、工工、紡織材料相關','非日間部':'限日間部學生','非本國籍':'限本國籍','懲處紀錄':'曾因故意行為受懲處','公費生':'已享公費待遇者不得申請','他項獎學金超額':'已獲其他獎學金達上限','文件不全':'文件不全視為無效','同家庭限一人':'同一家庭同學制限一人','評審排除':'評審會議決議','文件退回':'上傳文件經核對內容不符'};
const tagOf=r=>String(r).split('｜')[0],detOf=r=>String(r).split('｜')[1]||'';
function rTags(x,detail=true){
 const bad=x.reasons.map(r=>`<span class="rtag bad" title="${esc(TAGTIP[tagOf(r)]||'')}">✕ ${esc(tagOf(r))}</span>`).join('');
 const nt=x.notes.map(r=>`<span class="rtag ${/評審追加/.test(r)?'add':/名額|回流/.test(r)?'wait':'info'}">${esc(tagOf(r))}</span>`).join('');
 const dt=detail?[...x.reasons,...x.notes].filter(detOf).map(r=>`<div class="rdet">${esc(tagOf(r))}：${esc(detOf(r))}</div>`).join(''):'';
 return (bad+nt)?`<div>${bad}${nt}</div>${dt}`:'<span class="rtag ok">✓ 全部符合</span>';
}
function stTag(x){return{ok:'<span class="st ok">正取</span>',add:'<span class="st add">追加正取</span>',wait:`<span class="st wait">備取 ${x.wn||''}</span>`,hold:'<span class="st hold">待補件</span>',late:'<span class="st late">逾期未補件</span>',no:'<span class="st no">不符合</span>'}[x.st]}

function render(){
 const O=compute();save();
 $('#orgName').textContent=S.org||'';
 const c=s=>R.filter(x=>s.includes(x.st)).length;
 const go=st=>`onclick="$('#fStatus').value='${st}';TF='';tab('result');render()"`;
 $('#stats').innerHTML=`
  <button class="stat" ${go('all')}><div class="n">${R.length}</div><div class="l">申請人</div></button>
  <button class="stat ok" ${go('ok')}><div class="n">${c(['ok','add'])}</div><div class="l">正取${c(['add'])?`（含追加 ${c(['add'])}）`:''}</div></button>
  <button class="stat warn" ${go('wait')}><div class="n">${c(['wait'])}</div><div class="l">備取</div></button>
  <button class="stat hold" ${go(c(['late'])?'late':'hold')}><div class="n">${c(['hold','late'])}</div><div class="l">待補件${c(['late'])?`（逾期 ${c(['late'])}）`:''}</div></button>
  <button class="stat bad" ${go('no')}><div class="n">${c(['no'])}</div><div class="l">不符合資格</div></button>`;
 $('#provHome').innerHTML=CLOUD?'':provHtml();
 renderHello();
 const tc=tagCounts();
 $('#reasonStat').innerHTML=tc.length?`<h2>不符合原因統計</h2><p class="note">一人可能有多個原因。點標籤直接看名單。</p><div class="tagbar">${tc.map(([t,n])=>`<span class="rtag bad" onclick="TF='';setTF('${t}')">✕ ${esc(t)}　${n} 人</span>`).join('')}</div>`:'';
 $('#reasonStat').classList.toggle('hidden',!tc.length);
 $('#ruleList').innerHTML=`<li>本國籍、日間部學生（不含進修部、夜間部、推廣教育、空大）</li><li>科系：電子、電機相關（至少 ${esc(S.aRatio)} 名額）；紡織材料、機械、工業工程（其餘名額）</li><li>未享公費，其他獎學金每學期未達 ${wan(num(S.otherMax))}</li><li>申請人＋父母年所得合計 ${wan(num(S.incomeLimit))} 以下（單親：申請人＋監護人）</li><li>前學期成績 ${S.scoreMin} 分以上，或班排前 ${S.rankPct}%；操行 ${S.conductMin} 分（乙等）以上</li><li>無因故意行為遭記「${esc(S.penalty)}」以上懲處</li><li>必要文件齊全：學生證、成績單、戶籍謄本、財產清單、所得清單、推薦函（續領者免附後兩項）。不全視為無效</li><li>勾選福利身分或身障者，須附證明才列入優先條件</li><li>同一家庭的兄弟姊妹都可以通過，系統會加註「同家庭」標籤供委員參考</li><li>資訊工程（資工）系不列入電子電機類</li>`;
 renderData();renderResult(O);renderGroups();renderDocs();
}

function renderData(){
 const q=$('#q').value.trim();
 const rows=R.filter(x=>!q||[x.a.id,x.a.name,x.a.dept].join(' ').includes(q));
 $('#cnt').textContent=APPS.length;
 $('#dataTable').innerHTML=`<tr><th>編號</th><th>姓名</th><th>學制</th><th>系所</th><th>年級</th><th>家戶所得</th><th>成績</th><th>班排</th><th>優先條件</th><th>初篩</th><th class="noprint"></th></tr>`+
  (rows.length?rows.map(x=>`<tr><td>${esc(x.a.id)}</td><td><b>${esc(x.a.name)}</b></td><td>${esc(x.a.level)}</td><td>${esc(x.a.dept)}</td><td>${x.grade||''}</td><td>${wan(x.house)}</td><td>${esc(x.a.score)}</td><td>${x.rank<100?x.rank+'%':''}</td><td>${chips(x)}</td><td>${stTag(x)}<div>${x.reasons.map(r=>`<span class="rtag bad">✕ ${esc(tagOf(r))}</span>`).join('')}</div></td><td class="noprint"><button class="btn sm" onclick="openFiles(${x.i},'*')">看文件</button> <button class="btn sm" onclick="openEdit(${x.i})">編輯</button></td></tr>`).join('')
  :`<tr><td colspan="11" class="muted" style="text-align:center;padding:40px">尚無資料，請匯入 Excel 或載入示範資料</td></tr>`);
}

let TF='';
function tagCounts(){const c={};R.forEach(x=>x.reasons.forEach(r=>{const t=tagOf(r);c[t]=(c[t]||0)+1}));return Object.entries(c).sort((a,b)=>b[1]-a[1])}
function setTF(t){TF=TF===t?'':t;if(TF){$('#fStatus').value='all'}tab('result');render()}
function renderResult(O){
 const tc=tagCounts();
 $('#tagBar').innerHTML=tc.length?tc.map(([t,n])=>`<span class="rtag bad ${TF===t?'sel':''}" onclick="setTF('${t}')" title="${esc(TAGTIP[t]||'')}">✕ ${esc(t)}　${n} 人</span>`).join('')+(TF?`<span class="rtag info" onclick="setTF('')">顯示全部</span>`:''):'<span class="muted">目前沒有不符合的申請人</span>';
 const fl=$('#fLevel').value,fs=$('#fStatus').value;let h='';
 for(const L of['U','G']){
  if(fl!=='all'&&fl!==L)continue;
  const o=O[L],nm=L==='U'?'大學部':'碩博士班';
  const all=R.filter(x=>x.L===L);if(!all.length)continue;
  const order={ok:0,add:1,wait:2,hold:3,late:3.5,no:4};
  let list=all.sort((p,q)=>order[p.st]-order[q.st]||((p.rk||999)-(q.rk||999)));
  if(fs!=='all')list=list.filter(x=>fs==='ok'?['ok','add'].includes(x.st):x.st===fs);
  if(TF)list=list.filter(x=>[...x.reasons,...x.notes].some(r=>tagOf(r)===TF));
  const fq=$('#fq').value.trim();if(fq)list=list.filter(x=>(x.a.name+' '+x.a.id).includes(fq));
  const ok=all.filter(x=>x.st==='ok').length,add=all.filter(x=>x.st==='add').length;
  h+=`<div class="card ${L==='G'?'pagebreak':''}"><h2>${nm}　申請 ${all.length} 位 → 正取 ${ok} 位${add?`＋追加 ${add} 位`:''}</h2>
  <p class="note">名額 ${o.N}：電子電機類至少 ${o.aMin} 名、其他類最多 ${o.bMax} 名。本次錄取 電子電機 ${o.a} 名／其他類 ${o.b} 名。</p>
  ${o.bf?`<div class="alert">電子電機類合格人數不足，${o.bf} 個名額已回流給其他類科。</div>`:''}
  ${ok<o.N?`<div class="alert">合格人數不足，名額未滿（缺 ${o.N-ok} 名）。</div>`:''}
  <div class="tablewrap"><table><tr><th>排名</th><th>結果</th><th>編號</th><th>姓名</th><th>系所</th><th>年級</th><th class="num">家戶所得</th><th class="num">成績</th><th>優先條件</th><th>原因／備註</th><th>審查組</th><th class="noprint"></th></tr>
  ${list.map(x=>`<tr><td>${x.rk||'—'}</td><td>${stTag(x)}</td><td>${esc(x.a.id)}</td><td><b>${esc(x.a.name)}</b></td><td>${esc(x.a.dept)}</td><td>${x.grade||''}</td><td class="num">${wan(x.house)}</td><td class="num">${esc(x.a.score)}</td><td>${chips(x)}</td><td class="wrap">${rTags(x)}${x.a.memo?`<div class="note">自述：${esc(x.a.memo)}</div>`:''}</td><td>第 ${x.grp} 組</td><td class="noprint"><button class="btn sm" onclick="openEdit(${x.i})">複核</button></td></tr>`).join('')}
  </table></div></div>`;
 }
 $('#resultBox').innerHTML=provHtml()+(h||'<div class="card muted">尚無資料</div>');
}

const DOCF=()=>FIELDS.filter(f=>f.doc);
function docState(x,f){const v=String(x.a[f.k]??'').trim();
 if(/待核/.test(v))return'pend';if(/退回/.test(v))return'no';
 if(f.ex&&x.prev&&!/已附/.test(v))return'na';
 if(f.doc===1)return /已附|^是$|^有$|^v$|✓|○/i.test(v)||(yes(x.a.docs)&&!v)?'ok':'no';
 if(f.need){const claim=f.need==='welfare'?/低收|特殊/.test(x.a.welfare||''):/本人|親/.test(x.a.disab||'');if(!claim)return'na';return /已附/.test(v)||!v?'ok':'no'}
 if(/已附/.test(v))return'ok';if(/未附/.test(v))return'no';return'na'}
function toggleDoc(i,k){const a=APPS[i],f=FIELDS.find(f=>f.k===k),x=R.find(r=>r.i===i),cur=docState(x,f);
 if((FIDX[fkey(a,k)]||[]).length){openFiles(i,k);return}
 if(cur==='ok')a[k]=(f.doc===3)?'無須':'未附';else a[k]='已附';
 render()}
function allDocs(){const show=$('#dShow').value;R.forEach(x=>{if(show==='miss'&&!(x.missing||[]).length)return;DOCF().filter(f=>f.doc===1).forEach(f=>x.a[f.k]='已附')});render()}
const DSHORT={d_id:'學生證',d_tr:'成績單',d_hh:'戶籍謄本',d_prop:'財產清單',d_inc:'所得清單',d_rec:'推薦函',d_wel:'福利證明',d_dis:'身障證明',d_unemp:'失業證明'};
function cellClick(i,k){if((FIDX[fkey(APPS[i],k)]||[]).length||CLOUD)openFiles(i,k);else toggleDoc(i,k)}
async function markDoc(v){const{i,k}=FCUR;const a=APPS[i];
 if(CLOUD){const rv={...a._review,docs:{...(a._review.docs||{}),[k]:v}};if(!await wrote(await SBC.from('applicants').update({review:rv}).eq('id',a._cid).select('id'),'儲存'))return;a._review=rv}
 a[k]=v;fdlg.close();render()}
function renderDocs(){
 const fs=DOCF(),show=$('#dShow').value;
 const rows=R.filter(x=>show==='all'||(show==='auto'?FALL.some(r=>r.by==='auto'&&r.k.startsWith(fkey(x.a,''))):show==='pend'?x.pend:((x.missing||[]).length||x.reasons.some(r=>/^文件/.test(r))||fs.some(f=>f.doc===2&&docState(x,f)==='no'))));
 $('#docTable').innerHTML=`<tr><th style="text-align:left">編號</th><th style="text-align:left">姓名</th>${fs.map(f=>`<th title="${esc(f.l.replace('文件-',''))}">${DSHORT[f.k]}${f.doc===1?'':'<span style="font-weight:400">*</span>'}</th>`).join('')}<th style="text-align:left">結果</th></tr>`+
 (rows.length?rows.map(x=>`<tr><td>${esc(x.a.id)}</td><td><b>${esc(x.a.name)}</b>${x.prev?'<div class="note">續領</div>':''}${CLOUD&&show!=='all'?`<div class="contact">${esc(x.a.phone||'')}<br>${esc(x.a.email||'')}</div>`:''}</td>${fs.map(f=>{const st=docState(x,f),n=(FIDX[fkey(x.a,f.k)]||[]).length;return`<td class="c"><span class="dk ${st}" role="button" tabindex="0" title="${esc(DOCNAME(f.k))}：${{ok:'已繳',no:'缺件或退回',pend:'待核對',na:'免附'}[st]}${n?'，'+n+' 個檔案':''}" onclick="cellClick(${x.i},'${f.k}')" onkeydown="if(event.key==='Enter')cellClick(${x.i},'${f.k}')">${st==='ok'?'✓':st==='no'?'✕':st==='pend'?'?':'—'}${n?`<small>${n}</small>`:''}</span></td>`}).join('')}<td style="white-space:normal;min-width:200px">${x.reasons.some(r=>/^文件/.test(r))?x.reasons.filter(r=>/^文件/.test(r)).map(r=>`<div><span class="rtag bad">✕ ${esc(tagOf(r))}</span></div>`).join('')+badNotes(x):x.pend?'':'<span class="rtag ok">✓ 必要文件齊全</span>'}${x.pend?`<div><span class="rtag wait">待核對 ${x.pend} 份</span></div>`:''}${fs.filter(f=>f.need&&docState(x,f)==='no').map(f=>`<div><span class="rtag wait">${f.need==='welfare'?'福利身分':'身障'}缺證明，不列優先</span></div>`).join('')}</td></tr>`).join('')
 :`<tr><td colspan="${fs.length+3}" class="muted" style="text-align:center;padding:30px">${APPS.length?'沒有缺件的申請人':'尚無資料'}</td></tr>`);
}
// ===== 文件電子檔（IndexedDB，只存本機）=====
let DB=null,FIDX={};
function idb(){return new Promise((ok,no)=>{try{const r=indexedDB.open('sch_files',1);r.onupgradeneeded=()=>r.result.createObjectStore('f',{keyPath:'id',autoIncrement:true}).createIndex('k','k');r.onsuccess=()=>{DB=r.result;ok(DB)};r.onerror=()=>no(r.error)}catch(e){no(e)}})}
const fkey=(a,dk)=>(String(a.id||a.name).trim())+'|'+dk;
let FALL=[];
async function loadIdx(){try{await idb();const all=await new Promise(ok=>{const q=DB.transaction('f').objectStore('f').getAll();q.onsuccess=()=>ok(q.result)});FALL=all.map(({blob,...r})=>r);FIDX={};FALL.forEach(r=>(FIDX[r.k]=FIDX[r.k]||[]).push(r))}catch(e){FIDX={};FALL=[]}
 const pn=document.getElementById('pendN');const np=FALL.filter(r=>(r.st||'pend')==='pend').length;if(pn)pn.textContent=np;const nb=document.getElementById('navPend');if(nb){nb.textContent=np;nb.classList.toggle('hidden',!np)}}
async function sha(file){try{const b=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return''}}
const DOCNAME=k=>(FIELDS.find(f=>f.k===k)||{l:k}).l.replace('文件-','');
async function putFile(k,file){await idb();
 const flags=[];const h=await sha(file);
 if(!/pdf|image\//i.test(file.type)&&!/\.(pdf|jpe?g|png|heic|webp)$/i.test(file.name))flags.push('檔案格式不是 PDF 或圖片');
 if(file.size<15000)flags.push(`檔案很小（${Math.round(file.size/1024)}KB），可能是空白或縮圖`);
 if(h){FALL.filter(r=>r.h===h&&r.k!==k).forEach(r=>{const[who,dk]=r.k.split('|');flags.push(`與 ${who} 的「${DOCNAME(dk)}」是同一個檔案`)});
  if(FALL.some(r=>r.h===h&&r.k===k))flags.push('這份文件已經上傳過相同檔案')}
 if(/image\//.test(file.type)){const d=await imgDim(file);if(d&&Math.max(d.w,d.h)<800)flags.push(`圖片解析度太低（${d.w}×${d.h}），可能看不清楚`)}
 await new Promise((ok,no)=>{const t=DB.transaction('f','readwrite');t.objectStore('f').add({k,name:file.name,type:file.type,size:file.size,h,flags,st:'pend',blob:file,ts:Date.now()});t.oncomplete=ok;t.onerror=()=>no(t.error)});
 FALL.push({k,h})}
function imgDim(file){return new Promise(ok=>{try{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{ok({w:im.naturalWidth,h:im.naturalHeight});URL.revokeObjectURL(u)};im.onerror=()=>ok(null);im.src=u}catch(e){ok(null)}})}
async function setSt(id,st,note){const r=await getFile(id);if(!r)return;r.st=st;r.note=note||'';await new Promise(ok=>{const t=DB.transaction('f','readwrite');t.objectStore('f').put(r);t.oncomplete=ok});
 await loadIdx();syncDoc(r.k)}
function syncDoc(k){const[who,dk]=k.split('|');const a=APPS.find(a=>String(a.id||a.name).trim()===who);if(!a)return;const L=FIDX[k]||[];
 if(!L.length){if(/待核|退回/.test(a[dk]||''))a[dk]='未附';return}
 a[dk]=L.some(r=>r.st==='ok')?'已附':L.some(r=>(r.st||'pend')==='pend')?'待核對':'退回'}
async function delFile(id){await new Promise(ok=>{const t=DB.transaction('f','readwrite');t.objectStore('f').delete(id);t.oncomplete=ok})}
async function getFile(id){return new Promise(ok=>{const q=DB.transaction('f').objectStore('f').get(id);q.onsuccess=()=>ok(q.result)})}
function fileBtn(x,f){const L=FIDX[fkey(x.a,f.k)]||[],n=L.length,w=L.some(r=>(r.flags||[]).length&&r.st!=='ok');return`<button class="fa ${n?'has':''}" onclick="openFiles(${x.i},'${f.k}')">${n?(w?'⚠ ':'📎 ')+n:'＋'}</button>`}
const DOCKW=[['d_prop',/財產|歸戶|房產/],['d_unemp',/失業/],['d_dis',/身障|身心|手冊|重大傷病|傷病卡/],['d_wel',/低收|中低|特殊境遇|福利/],['d_inc',/所得|綜所|扣繳|稅/],['d_rec',/推薦/],['d_tr',/成績/],['d_hh',/戶籍|謄本|戶口/],['d_id',/學生證|在學|註冊/]];
function matchFile(fn){const n=fn.replace(/\.[^.]+$/,'');let app=null;
 const ids=APPS.map((a,i)=>[i,String(a.id||'').trim()]).filter(([,id])=>id).sort((p,q)=>q[1].length-p[1].length);
 for(const[i,id]of ids){if(n.toUpperCase().includes(id.toUpperCase())){app=i;break}}
 if(app===null){const hit=APPS.map((a,i)=>[i,a.name]).filter(([,nm])=>nm&&n.includes(nm));if(hit.length===1)app=hit[0][0]}
 const d=(DOCKW.find(([,re])=>re.test(n))||[])[0];return{app,d}}
async function uploadMany(files){
 if(!APPS.length){alert('請先匯入申請資料，再上傳文件');return}
 let ok=0;const bad=[];
 for(const f of files){const m=matchFile(f.name);if(m.app===null||!m.d){bad.push(f.name+(m.app===null?'（找不到對應的編號或姓名）':'（看不出是哪一種文件）'));continue}
  try{await putFile(fkey(APPS[m.app],m.d),f);APPS[m.app][m.d]='待核對';ok++}catch(e){bad.push(f.name+'（儲存失敗）')}}
 await loadIdx();render();
 $('#fmsg').innerHTML=`<div class="alert" style="background:var(--okbg);color:var(--ok)">✓ 已歸檔 ${ok} 個檔案，目前標為「待核對」。請按上方「逐一核對上傳文件」確認內容。</div>`+(bad.length?`<div class="alert">以下 ${bad.length} 個檔案無法自動歸檔，請改檔名後再傳，或在表格中按「＋」手動上傳：<br>${bad.map(esc).join('<br>')}</div>`:'');
}
let FCUR=null;const fdlg=$('#fdlg');
function openFiles(i,k){FCUR={i,k};const f=FIELDS.find(f=>f.k===k);$('#fdlgTitle').textContent=k==='*'?`${APPS[i].id||''} ${APPS[i].name}｜全部文件`:`${APPS[i].name}｜${f.l.replace('文件-','')}`;$('#fdlgUp').classList.toggle('hidden',k==='*');listFiles();fdlg.showModal()}
function listFiles(){const who=fkey(APPS[FCUR.i],'');const L=FCUR.k==='*'?FALL.filter(r=>r.k.startsWith(who)):FIDX[fkey(APPS[FCUR.i],FCUR.k)]||[];
 $('#fdlgList').innerHTML=L.length?L.map(r=>`<div style="flex-wrap:wrap"><span>${FCUR.k==='*'?`<b>${esc(DOCNAME(r.k.split('|')[1]))}</b><br>`:''}${esc(r.name)} ${stBadge(r)}${r.lockBy?`<span class="rtag wait">${esc(r.lockBy)} 核對中</span>`:''}${(r.flags||[]).map(f=>`<div class="reason" style="border:0;padding:2px 0">⚠ ${esc(f)}</div>`).join('')}${r.summary?`<div class="note" style="border:0;padding:2px 0">初步檢查：${esc(r.summary)}</div>`:''}${r.note?`<div class="note" style="border:0;padding:2px 0">退回原因：${esc(r.note)}</div>`:''}</span><button class="btn sm" onclick="viewFile('${r.id}')">開啟</button><button class="btn sm" onclick="setSt('${r.id}','ok').then(()=>{listFiles();render()})">✓ 符合</button><button class="btn sm danger" onclick="rejectFile('${r.id}').then(()=>{listFiles();render()})">✕ 退回</button><button class="btn sm danger adminonly" onclick="rmFile('${r.id}')">刪除</button></div>`).join(''):(FCUR.k==='*'?'<p class="muted">這位學生還沒有上傳任何檔案。</p>':`<p class="muted">這項文件沒有上傳檔案。</p><p class="note">如果學生是交紙本，可以直接標記：</p><div class="row"><button class="btn" onclick="markDoc('已附')">標為已繳（紙本）</button><button class="btn" onclick="markDoc('${(FIELDS.find(f=>f.k===FCUR.k)||{}).doc===3?'無須':'未附'}')">標為${(FIELDS.find(f=>f.k===FCUR.k)||{}).doc===3?'免附':'未繳'}</button></div>`)}
function stBadge(r){const s=r.st||'pend';return s==='ok'?(r.by==='auto'?'<span class="rtag ok">✓ 系統通過</span>':'<span class="rtag ok">✓ 已核對符合</span>'):s==='bad'?'<span class="rtag bad">✕ 已退回</span>':'<span class="rtag wait">? 待核對</span>'}
const BREASONS=['不是這份文件','看不清楚／模糊','缺頁或拍不完整','姓名不是申請人或家人','日期過期（超過三個月）','與申請表填的資料不符','缺少簽名或印章'];
const bdlg=$('#bdlg');
function askReason(hint){return new Promise(ok=>{let done=false;const sel=new Set();
 const pre=(hint||[]).join(' ');
 if(/不是「/.test(pre))sel.add('不是這份文件');if(/不清楚|模糊/.test(pre))sel.add('看不清楚／模糊');if(/不完整|裁切/.test(pre))sel.add('缺頁或拍不完整');if(/姓名/.test(pre))sel.add('姓名不是申請人或家人');if(/超過|過期/.test(pre))sel.add('日期過期（超過三個月）');if(/不同|高於|勾「無/.test(pre))sel.add('與申請表填的資料不符');
 const draw=()=>{$('#bChips').innerHTML=BREASONS.map((r,i)=>`<button type="button" aria-pressed="${sel.has(r)}" class="rtag ${sel.has(r)?'on':''}" data-i="${i}">${sel.has(r)?'✓ ':''}${esc(r)}</button>`).join('')};
 $('#bChips').onclick=e=>{const t=e.target.closest('[data-i]');if(!t)return;const r=BREASONS[+t.dataset.i];sel.has(r)?sel.delete(r):sel.add(r);draw()};
 $('#bNote').value='';draw();
 $('#bOk').onclick=()=>{const txt=[...sel].join('、')+($('#bNote').value.trim()?(sel.size?'。':'')+$('#bNote').value.trim():'');if(!txt){alert('請至少選一個原因，或寫補充說明');return}done=true;bdlg.close();ok(txt)};
 bdlg.onclose=()=>{if(!done)ok(null)};
 bdlg.showModal()})}
async function rejectFile(id){const r=FALL.find(x=>String(x.id)===String(id));const n=await askReason(r&&r.flags);if(n===null)return;await setSt(id,'bad',n)}
// 逐一核對
let SPOT=false,RQ=[],RI=0,RURL=null,RS={},RALL={},DIR=1,VZ=1,VR=0,BUSY=false;const rdlg=$('#rdlg');
function startReview(){SPOT=false;RQ=FALL.filter(r=>(r.st||'pend')==='pend').map(r=>r.id);RI=0;RS={};RALL={};DIR=1;if(!RQ.length){alert('目前沒有待核對的文件 👍');return}rdlg.showModal();showReview()}
function stripHtml(){return'<b>進度</b>'+RQ.map((id,i)=>{const v=RS[id];const c=v==='ok'?'ok':v==='bad'?'bad':v==='skip'?'skip':v==='lock'||v==='other'?'lock':'';return`<span role="button" tabindex="0" onkeydown="if(event.key==='Enter')revJump(${i})" class="${c} ${i===RI?'cur':''}" title="${v==='ok'?'符合':v==='bad'?'退回':v==='skip'?'略過':v==='lock'?'其他委員核對中':v==='other'?'其他委員已完成':'未看'}" onclick="revJump(${i})">${v==='ok'?'✓':v==='bad'?'✕':v==='skip'?'…':v==='lock'||v==='other'?'鎖':i+1}</span>`}).join('')+'<span class="lg">✓ 符合　✕ 退回　… 略過　鎖＝其他委員核對中</span>'}
function vz(d){VZ=d===0?1:Math.max(.4,Math.min(4,VZ*(d>0?1.3:1/1.3)));vApply()}
function vr(){VR=(VR+90)%360;vApply()}
function vApply(){const im=$('#rView img');if(!im)return;im.style.width=(VZ*100)+'%';im.style.maxWidth='none';im.style.transform=`rotate(${VR}deg)`;im.style.margin=VR%180?`${VZ*15}% auto`:'0 auto'}
async function showReview(){
 if(RI<0)RI=0;
 if(RI>=RQ.length){finishReview();return}
 setLoading(true);
 const id=RQ[RI];const r=await getFile(id);
 if(RURL){URL.revokeObjectURL(RURL);RURL=null}if(!r){RS[id]=RS[id]||'skip';RI+=DIR;return showReview()}
 const[who,dk]=r.k.split('|');const a=APPS.find(a=>String(a.id||a.name).trim()===who)||{};
 RURL=URL.createObjectURL(r.blob);VZ=1;VR=0;
 const done=Object.values(RALL).length;
 $('#rTitle').textContent=`${SPOT?'抽查':'核對'}文件　第 ${RI+1} 份，共 ${RQ.length} 份（已完成 ${done}）`;
 $('#rStrip').innerHTML=stripHtml();
 const st=SPOT&&!RS[id]&&r.by==='auto'?'':RS[id]==='ok'||r.st==='ok'?'ok':RS[id]==='bad'||r.st==='bad'?'bad':'';
 $('#rInfo').innerHTML=`<div style="font-size:22px;font-weight:700">${esc(who)}　${esc(a.name||'')}</div>${a.dept?`<div class="note">${esc(a.dept)}　${esc(a.level||'')}</div>`:''}<div style="font-size:20px;margin:8px 0 4px">這份應該是：<br><b style="color:var(--pri)">${esc(DOCNAME(dk))}</b></div><div class="note">檔名：${esc(r.name)}</div>
  ${SPOT&&!RS[id]&&r.by==='auto'?'<div class="decided" style="background:var(--info-bg);color:var(--info)">抽查：系統已判定通過，請確認是否正確</div>':''}
  ${st?`<div class="decided" style="background:var(--${st}bg);color:var(--${st})">${st==='ok'?'✓ 已標為「符合」':'✕ 已標為「退回」：'+esc(r.note||'')}　（可以重新選）</div>`:''}
  ${r.summary?`<div class="alert" style="margin:8px 0;background:#e8f0fa;color:#1d3f8a">初步檢查：${esc(r.summary)}</div>`:''}${(r.flags||[]).map(f=>`<div class="alert" style="margin:6px 0">⚠ ${esc(f)}</div>`).join('')}
  ${(r.summary||(r.flags||[]).length)?'<div class="note">初步檢查只是提醒，可能會錯，請以您的判斷為準。</div>':''}
  <div class="checklist"><b>請確認：</b><br>① 是這份文件嗎？<br>② 姓名是申請人或家人嗎？<br>③ 日期在期限內嗎？<br>④ 姓名、數字、日期看得清楚嗎？</div>`;
 const isImg=/image\//.test(r.type),isPdf=/pdf/.test(r.type)||/\.pdf$/i.test(r.name);
 $('#vOpen').href=RURL;$('#vTool').querySelectorAll('button').forEach(b=>b.classList.toggle('hidden',!isImg));
 $('#rView').innerHTML=isImg?`<img src="${RURL}" alt="文件" style="width:100%">`:isPdf?`<iframe src="${RURL}" style="width:100%;height:100%;border:0"></iframe>`:`<p style="padding:40px"><a class="btn" href="${RURL}" download="${esc(r.name)}">下載檔案查看</a></p>`;
 setLoading(false);$('#rOk').focus()}
function setLoading(on){LOADING=on;if(on){$('#rView').innerHTML='<p style="padding:60px;font-size:19px;color:var(--mute)">文件載入中…</p>';$('#rTitle').textContent='載入中…'}['rOk','rBad','rSkip'].forEach(i=>$('#'+i).disabled=on||BUSY);$('#rPrev').disabled=on||BUSY||RI===0}
function finishReview(byUser){
 const va=Object.values(RALL),ok=va.filter(x=>x==='ok').length,bad=va.filter(x=>x==='bad').length,v=Object.values(RS),lock=v.filter(x=>x==='lock').length,other=v.filter(x=>x==='other').length;
 const left=RQ.filter(id=>!RS[id]||RS[id]==='skip');
 if(byUser){
  if(left.length&&!confirm(`本次已核對：符合 ${ok} 份、退回 ${bad} 份。\n還有 ${left.length} 份略過或還沒看，下次按「逐一核對」會再出現。\n\n確定先結束嗎？`))return;
  rdlg.close();render();return}
 if(left.length&&confirm(`已經看到最後一份了。\n本次核對：符合 ${ok} 份、退回 ${bad} 份。\n\n還有 ${left.length} 份您按了「略過」，要現在回去看嗎？`)){RQ=left;RS={};RI=0;DIR=1;showReview();return}
 rdlg.close();render();
 alert((left.length?`本次核對：符合 ${ok} 份、退回 ${bad} 份。\n還有 ${left.length} 份略過，下次按「逐一核對」會再出現。`:`全部核對完成。\n符合 ${ok} 份、退回 ${bad} 份。\n辛苦了，謝謝您！`)+(lock?`\n\n另有 ${lock} 份正由其他委員核對中，已自動跳過。`:'')+(other?`\n${other} 份已由其他委員完成。`:''));
}
let LOADING=false;
function guard(){if(BUSY||LOADING)return false;BUSY=true;['rOk','rBad','rSkip','rPrev'].forEach(i=>$('#'+i).disabled=true);return true}
function unguard(){BUSY=false;setLoading(LOADING)}
async function revAct(t){if(!guard())return;const id=RQ[RI];
 try{
  if(t==='ok'){await setSt(id,'ok')}
  else{const r=FALL.find(x=>String(x.id)===String(id));const n=await askReason(r&&r.flags);if(n===null)return;await setSt(id,'bad',n)}
  const cur=FALL.find(x=>String(x.id)===String(id));if(!cur||cur.st!==(t==='ok'?'ok':'bad'))return;
  RS[id]=t;RALL[id]=t;RI++;DIR=1;BUSY=false;await showReview()
 }finally{unguard()}}
async function revSkip(){if(!guard())return;try{const id=RQ[RI];if(!RS[id])RS[id]='skip';RI++;DIR=1;BUSY=false;await showReview()}finally{unguard()}}
async function revPrev(){if(RI===0||!guard())return;try{RI--;DIR=-1;BUSY=false;await showReview()}finally{unguard()}}
async function revJump(i){if(i===RI||!guard())return;try{DIR=i>RI?1:-1;RI=i;BUSY=false;await showReview()}finally{unguard()}}
async function viewFile(id){const r=await getFile(id);if(!r)return;const u=URL.createObjectURL(r.blob);const w=window.open(u,'_blank');if(!w){const a=document.createElement('a');a.href=u;a.download=r.name;a.click()}}
async function rmFile(id){if(!confirm('刪除這個檔案？'))return;const r=await getFile(id);await delFile(id);await loadIdx();if(r)syncDoc(r.k);listFiles();render()}
$('#fdlgIn').onchange=async e=>{const fs=[...e.target.files];e.target.value='';const a=APPS[FCUR.i];
 for(const f of fs){try{await putFile(fkey(a,FCUR.k),f)}catch(err){alert('儲存失敗：'+f.name)}}
 await loadIdx();syncDoc(fkey(a,FCUR.k));listFiles();render()};
const fdrop=$('#fdrop'),ffile=$('#ffile');
fdrop.onclick=()=>ffile.click();
fdrop.ondragover=e=>{e.preventDefault();fdrop.classList.add('over')};
fdrop.ondragleave=()=>fdrop.classList.remove('over');
fdrop.ondrop=e=>{e.preventDefault();fdrop.classList.remove('over');uploadMany([...e.dataTransfer.files])};
ffile.onchange=()=>{uploadMany([...ffile.files]);ffile.value=''};

function renderGroups(){
 const G=Math.max(1,+S.groups||1);let h='';
 for(let g=1;g<=G;g++){
  const l=R.filter(x=>x.grp===g).sort((p,q)=>(p.L>q.L?-1:1)||((p.rk||999)-(q.rk||999)));
  if(!l.length)continue;
  h+=`<div class="card ${g>1?'pagebreak':''}"><h2>第 ${g} 組　共 ${l.length} 件（大學部 ${l.filter(x=>x.L==='U').length}／碩博 ${l.filter(x=>x.L==='G').length}）</h2>
  <div class="tablewrap"><table><tr><th>編號</th><th>姓名</th><th>學制</th><th>系所</th><th>系統初篩</th><th>優先條件</th><th style="min-width:200px">評審意見</th></tr>
  ${l.map(x=>`<tr><td>${esc(x.a.id)}</td><td><b>${esc(x.a.name)}</b></td><td>${esc(x.a.level)}</td><td>${esc(x.a.dept)}</td><td>${stTag(x)}${x.rk?` <span class="note">#${x.rk}</span>`:''}<div>${x.reasons.map(r=>`<span class="rtag bad">✕ ${esc(tagOf(r))}</span>`).join('')}</div></td><td>${chips(x)}</td><td></td></tr>`).join('')}
  </table></div></div>`;
 }
 $('#groupBox').innerHTML=h||'<div class="card muted">尚無資料</div>';
}

// ===== 編輯 =====
let editIdx=null;const dlg=$('#dlg');
function openEdit(i){
 editIdx=(i===undefined)?null:i;const a=editIdx===null?{}:APPS[editIdx];
 $('#dlgTitle').textContent=editIdx===null?'新增申請人':`申請人：${a.name||''}`;
 $('#delBtn').classList.toggle('hidden',editIdx===null);
 $('#editForm').innerHTML=FIELDS.map(f=>{const v=a[f.k]??'';
  const inp=f.opt?`<select data-k="${f.k}">${f.opt.map(o=>`<option ${String(v)===o?'selected':''}>${o}</option>`).join('')}</select>`
   :f.area?`<textarea data-k="${f.k}">${esc(v)}</textarea>`:`<input data-k="${f.k}" value="${esc(v)}" ${f.num?'inputmode="decimal"':''}>`;
  return`${f.k==='d_id'?'<h3 style="grid-column:1/-1;margin:10px 0 0;color:var(--ink)">文件檢核（續領者免附所得清單與推薦函）</h3>':''}<label class="f" ${f.area?'style="grid-column:1/-1"':''}>${f.l.replace('文件-','')}${f.hint?`<span style="font-size:15px">（${f.hint}）</span>`:''}${inp}</label>`}).join('');
 dlg.showModal();
}
function saveEdit(){const a={};document.querySelectorAll('#editForm [data-k]').forEach(e=>a[e.dataset.k]=e.value.trim());if(!a.name){alert('請填姓名');return}
 if(editIdx===null)APPS.push(a);else APPS[editIdx]=a;dlg.close();render()}
$('#delBtn').onclick=()=>{if(confirm('確定刪除這位申請人？')){APPS.splice(editIdx,1);dlg.close();render()}};

// ===== 匯入匯出 =====
const drop=$('#drop'),fileIn=$('#file');
drop.onclick=()=>fileIn.click();
drop.ondragover=e=>{e.preventDefault();drop.classList.add('over')};
drop.ondragleave=()=>drop.classList.remove('over');
drop.ondrop=e=>{e.preventDefault();drop.classList.remove('over');if(e.dataTransfer.files[0])readFile(e.dataTransfer.files[0])};
fileIn.onchange=()=>{if(fileIn.files[0])readFile(fileIn.files[0]);fileIn.value=''};

function parseCSV(t){const rows=[];let r=[],c='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch==='"'){if(t[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}else if(ch==='"')q=true;else if(ch===','){r.push(c);c=''}else if(ch==='\n'){r.push(c);rows.push(r);r=[];c=''}else if(ch!=='\r')c+=ch}if(c||r.length){r.push(c);rows.push(r)}return rows}
async function readFile(f){await loadXLSX();
 const rd=new FileReader();
 const isCsv=/\.csv$/i.test(f.name);
 rd.onload=e=>{let rows;
  try{if(isCsv||typeof XLSX==='undefined'){rows=parseCSV(isCsv?e.target.result:new TextDecoder().decode(e.target.result))}
   else{const wb=XLSX.read(e.target.result,{type:'array'});rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:''})}}
  catch(err){alert('檔案讀取失敗，請確認格式');return}
  const hi=rows.findIndex(r=>r.some(c=>String(c).trim()==='姓名'));
  if(hi<0){alert('找不到「姓名」欄，請使用範本格式');return}
  const head=rows[hi].map(h=>String(h).trim());
  const map=head.map(h=>(FIELDS.find(f=>f.l===h||h.startsWith(f.l)||f.l.startsWith(h)&&h.length>=2)||{}).k);
  const list=rows.slice(hi+1).map(r=>{const a={};map.forEach((k,j)=>{if(k)a[k]=String(r[j]??'').trim()});return a}).filter(a=>a.name);
  if(!list.length){alert('沒有讀到任何申請人');return}
  const mode=APPS.length?(confirm(`讀到 ${list.length} 位申請人。\n\n按「確定」= 取代現有資料\n按「取消」= 加在現有資料後面`)?'r':'a'):'r';
  APPS=mode==='r'?list:APPS.concat(list);render();tab('result');
 };
 isCsv?rd.readAsText(f,'utf-8'):rd.readAsArrayBuffer(f);
}
function loadXLSX(){return window.XLSX?Promise.resolve():new Promise(ok=>{const t=document.createElement('script');t.src='https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';t.onload=ok;t.onerror=ok;document.head.appendChild(t)})}
async function sheetOut(name,aoa,fname){await loadXLSX();
 if(typeof XLSX!=='undefined'){const wb=XLSX.utils.book_new();(Array.isArray(name)?name:[[name,aoa]]).forEach(([n,d])=>{const ws=XLSX.utils.aoa_to_sheet(d);ws['!cols']=d[0].map(()=>({wch:16}));XLSX.utils.book_append_sheet(wb,ws,n)});XLSX.writeFile(wb,fname+'.xlsx')}
 else{const d=Array.isArray(name)?name[0][1]:aoa;const csv='﻿'+d.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=fname+'.csv';a.click()}
}
function downloadTemplate(){
 const h=FIELDS.filter(f=>!['override','overNote'].includes(f.k)).map(f=>f.l);
 const E1={id:'U001',name:'王小明',level:'大學部',div:'日間部',dept:'電子工程系',grade:'3',nation:'本國',family:'雙親',incSelf:'120000',incF:'350000',incM:'280000',score:'82',rankPct:'25',conduct:'82',demerit:'無',gov:'否',otherAid:'0',prev:'否',welfare:'中低收入戶',disab:'無',house:'無',fam:'F001',d_id:'已附',d_tr:'已附',d_hh:'已附',d_prop:'已附',d_inc:'已附',d_rec:'未附',d_wel:'已附',d_dis:'無須',d_unemp:'已附',docNote:'推薦函待補',memo:'父親失業，課餘打工負擔家計'};
 const E2={id:'G001',name:'林小華',level:'碩士班',div:'日間部',dept:'電機工程系碩士班',grade:'1',nation:'本國',family:'單親',incSelf:'80000',incG:'300000',score:'88',conduct:'乙',demerit:'無',gov:'否',otherAid:'0',prev:'是',welfare:'低收入戶',disab:'二等親內',house:'無',fam:'F002',d_id:'已附',d_tr:'已附',d_hh:'已附',d_prop:'已附',d_inc:'',d_rec:'',d_wel:'已附',d_dis:'已附',d_unemp:'無須'};
 const ks=FIELDS.filter(f=>!['override','overNote'].includes(f.k)).map(f=>f.k);const ex=ks.map(k=>E1[k]||''),ex2=ks.map(k=>E2[k]||'');
 const note=[['欄位','填寫方式'],['（文件欄）','填「已附」或「未附」；續領者所得清單、推薦函可留空。福利證明、身障證明有該身分才需要附'],...FIELDS.filter(f=>!['override','overNote'].includes(f.k)).map(f=>[f.l,f.opt?'請填：'+f.opt.join(' / '):f.num?'數字（元），可含逗號'+(f.hint?'；'+f.hint:''):(f.hint||'文字')])];
 sheetOut([['申請資料',[h,ex,ex2]],['填寫說明',note]],null,'松樑助學金_申請資料範本');
}
function exportResults(){
 if(!R.length){alert('尚無資料');return}
 const st=x=>({ok:'正取',add:'追加正取',wait:'備取'+(x.wn||''),hold:'待補件',late:'逾期未補件',no:'不符合'}[x.st]);
 const pr=x=>[x.p1?'續領＋福利身分':x.welfare?x.a.welfare:'',x.disab?'身障／重傷':'',x.noHouse?'無房產':''].filter(Boolean).join('、');
 const head=['排名','結果','編號','姓名','學制','系所','年級','家戶年所得(元)','成績','班排%','優先條件','不符合標籤','不符合說明','備註','審查組'];
 const row=x=>[x.rk||'',st(x),x.a.id,x.a.name,x.a.level,x.a.dept,x.grade||'',x.house,x.a.score,x.rank<100?x.rank:'',pr(x),x.reasons.map(tagOf).join('、'),x.reasons.map(r=>tagOf(r)+'：'+detOf(r)).join('；'),x.notes.map(r=>tagOf(r)+(detOf(r)?'：'+detOf(r):'')).join('；'),x.grp];
 const order={ok:0,add:1,wait:2,hold:3,late:3.5,no:4};
 const part=L=>[head,...R.filter(x=>x.L===L).sort((p,q)=>order[p.st]-order[q.st]||((p.rk||999)-(q.rk||999))).map(row)];
 const sheets=[['大學部',part('U')],['碩博士班',part('G')],['不符合資格',[head,...R.filter(x=>x.st==='no').map(row)]]];
 for(let g=1;g<=(+S.groups||1);g++)sheets.push([`第${g}組`,[['編號','姓名','學制','系所','系統初篩（原因）','優先條件','評審意見'],...R.filter(x=>x.grp===g).map(x=>[x.a.id,x.a.name,x.a.level,x.a.dept,st(x)+(x.reasons.length?'（'+x.reasons.map(tagOf).join('、')+'）':''),pr(x),''])]]);
 sheetOut(sheets,null,'松樑助學金_初篩結果_機密_'+today()+(provCount().docs||provCount().hold||provCount().late?'_暫定':''));
}
async function clearAll(){if(confirm('確定清空全部申請資料與已上傳的文件電子檔？此動作無法復原。')){APPS=[];try{await idb();await new Promise(ok=>{const t=DB.transaction('f','readwrite');t.objectStore('f').clear();t.oncomplete=ok})}catch(e){}FIDX={};render()}}

// ===== 設定 =====
const SET=[['deadline','本年度申請截止日（過了就不能送新申請）','date'],['supDeadline','本年度補件期限（過了學生就不能補傳；逾期的人會集中列出提醒委員）','date'],['spotPct','抽查比例 %（系統自動通過的文件要抽查多少，例：10）'],['announce','預計公告結果時間（例：12 月中旬）'],['contact','承辦聯絡方式（學生頁會顯示，例：王小姐 02-1234-5678）'],['org','單位名稱（顯示在標題下方）'],['quotaU','大學部名額'],['quotaG','碩博士班名額'],['incomeLimit','家戶年所得上限（元，申請人＋父母合計；單親為申請人＋扶養家長）'],['scoreMin','學業成績門檻（分）'],['rankPct','成績未達時，班排前幾 %'],['aRatio','電子電機類最低比例（如 2/3）'],['groups','評審分組數'],['conductMin','操行成績門檻（分）'],['otherMax','其他獎學金每學期上限（元，達此金額即不符）'],['penalty','懲處排除門檻（記到這個等級以上就不符合）',['警告','小過','大過以上']],['kwA','電子電機類 系所關鍵字（逗號分隔）'],['kwB','紡織材料／機械／工工類 關鍵字'],['kwX','不列入的系所關鍵字（例：資訊工程,資工）'],['backfill','電子電機不足時，名額回流其他類',['是','否']]];
function renderSettings(){
 const G1=['deadline','supDeadline','announce','contact','spotPct'],G3=['kwA','kwB','kwX','aRatio','backfill'];
 const one=([k,l,t])=>{const m=String(l).match(/^([^（]+)（(.+)）$/);const lab=m?m[1]:l,hint=m?m[2]:'';return`<label class="f" ${k.startsWith('kw')||k==='contact'?'style="grid-column:1/-1"':''}>${esc(lab)}${hint?`<span class="hint">${esc(hint)}</span>`:''}${Array.isArray(t)?`<select data-s="${k}">${t.map(o=>`<option ${String(S[k])===o?'selected':''}>${o}</option>`).join('')}</select>`:`<input data-s="${k}" ${t==='date'?'type="date"':''} value="${esc(S[k]??'')}">`}</label>`};
 $('#setForm1').innerHTML=SET.filter(r=>G1.includes(r[0])).map(one).join('');
 $('#setForm3').innerHTML=SET.filter(r=>G3.includes(r[0])).map(one).join('');
 $('#setForm').innerHTML=SET.filter(r=>!G1.includes(r[0])&&!G3.includes(r[0])).map(one).join('');
 $('#setDirty').classList.add('hidden');
 document.querySelectorAll('[data-s]').forEach(e=>e.oninput=e.onchange=()=>$('#setDirty').classList.remove('hidden'))}
function saveSettings(){document.querySelectorAll('[data-s]').forEach(e=>S[e.dataset.s]=e.value.trim());render();alert('已儲存，結果已重新計算')}
function resetSettings(){if(confirm('把名額與門檻恢復成預設值？（截止日、聯絡方式不變）')){const keep={deadline:S.deadline,supDeadline:S.supDeadline,announce:S.announce,contact:S.contact};S=Object.assign({},DEF,keep);renderSettings();if(CLOUD)saveSettings();else render()}}

// ===== 示範資料 =====
function loadDemo(){
 if(APPS.length&&!confirm('載入示範資料會取代目前資料，確定？'))return;
 let sd=20261108;const r=()=>(sd=(sd*1664525+1013904223)%4294967296)/4294967296;const pick=a=>a[Math.floor(r()*a.length)];
 const sur='陳林黃張李王吳劉蔡楊許鄭謝郭洪曾邱廖賴周徐蘇葉莊呂江何蕭羅高'.split('');
 const gn='家豪 志明 俊傑 建宏 冠宇 宗翰 承恩 柏翰 宇軒 品睿 詩涵 雅婷 怡君 欣妤 佳穎 子晴 思妤 庭瑜 昱廷 彥廷 宥辰 哲瑋 育誠 政霖 冠廷'.split(' ');
 const dU=['電子工程系','電子工程系','電機工程系','電機工程系','光電工程系','機械與電腦輔助工程系','工業工程與管理系','企業管理系'];
 const dG=['電子工程系碩士班','電機工程系碩士班','光電工程系碩士班','機械與電腦輔助工程系碩士班','工業工程與管理系碩士班'];
 const L=[];
 for(let i=0;i<83;i++){const U=i<55;const single=r()<.3;
  const a={id:(U?'U':'G')+String(U?i+1:i-54).padStart(3,'0'),name:pick(sur)+pick(gn),level:U?'大學部':(r()<.9?'碩士班':'博士班'),div:r()<.03?'進修部':'日間部',conduct:String(Math.round(72+r()*20)),gov:'否',otherAid:r()<.05?'50000':'0',d_id:'已附',d_tr:r()<.03?'未附':'已附',d_hh:'已附',d_prop:r()<.04?'未附':'已附',d_inc:'已附',d_rec:r()<.05?'未附':'已附',d_wel:'已附',d_dis:r()<.25?'未附':'已附',d_unemp:'無須',docNote:'',dept:pick(U?dU:dG),
   grade:String(U?1+Math.floor(r()*4):1+Math.floor(r()*2)),nation:r()<.04?'外籍':'本國',family:single?'單親':'雙親',
   incSelf:String(Math.round(r()*180)*1000),incF:single?'':String(Math.round(r()*560)*1000),incM:single?'':String(Math.round(r()*420)*1000),
   incG:single?String(Math.round(r()*500)*1000):'',score:String(Math.round(62+r()*33)),rankPct:String(Math.round(5+r()*80)),
   demerit:r()<.04?pick(['警告','小過','大過以上']):'無',prev:r()<.25?'是':'否',welfare:r()<.35?pick(['低收入戶','中低收入戶','中低收入戶','特殊境遇家庭']):'無',
   disab:r()<.18?pick(['本人','二等親內','二等親內']):'無',house:r()<.6?'無':'有',fam:'F'+String(i+1).padStart(3,'0'),memo:'',override:'依系統',overNote:''};
  L.push(a)}
 L[12].fam=L[13].fam;L[30].fam=L[31].fam; // 兄弟姊妹示範
 L[5].memo='父親重病無法工作，母親兼兩份工';L[20].memo='導師推薦：課業積極、擔任班代';
 APPS=L;render();tab('result');
}

// ===== 雲端模式（審查人員登入後，讀寫雲端申請資料與文件）=====
const CFG=window.SB_CONFIG||{};
let RVN={},LOCKED=null,ISADMIN=false;
let SBC=null,CLOUD=false,CAPPS=[],CDOCS=[],CUSER='',LOCAL_BAK=null,BLOBS={};
const tfetch=(u,o={})=>{const ac=new AbortController();const t=setTimeout(()=>ac.abort(),/storage\/v1\/object/.test(String(u))?120000:30000);if(o.signal)o.signal.addEventListener('abort',()=>ac.abort());return fetch(u,{...o,signal:ac.signal}).catch(e=>{if(e.name==='AbortError')throw new Error('網路太慢，請檢查連線後再試一次');throw new Error('網路連線失敗，請檢查連線後再試一次')}).finally(()=>clearTimeout(t))};
try{if(CFG.key&&!/^__/.test(CFG.key)&&window.supabase)SBC=window.supabase.createClient(CFG.url,CFG.key,{global:{fetch:tfetch}})}catch(e){}
// 寫入後沒有任何資料被更新，多半是登入過期或已被移出審查名單
async function wrote(res,what){if(res.error){alert(what+'失敗：'+res.error.message);return false}if(Array.isArray(res.data)&&!res.data.length){await sessionLost();return false}return true}
async function sessionLost(){alert('登入已過期，或您的帳號已不在審查人員名單內。\n剛剛的變更沒有存到，請重新登入後再做一次。');try{await SBC.auth.signOut()}catch(e){}location.reload()}
const DOCKEYS=['d_id','d_tr','d_hh','d_prop','d_inc','d_rec','d_wel','d_dis','d_unemp'];
const nid=id=>typeof id==='string'&&/^\d+$/.test(id)?+id:id;
const _load=load,_save=save,_loadIdx=loadIdx,_getFile=getFile,_setSt=setSt,_delFile=delFile,_putFile=putFile,_syncDoc=syncDoc,_toggleDoc=toggleDoc,_saveEdit=saveEdit,_saveSettings=saveSettings,_clearAll=clearAll,_loadDemo=loadDemo,_allDocs=allDocs;
save=function(){if(!CLOUD)_save()};
getFile=async function(id){
 if(!CLOUD)return _getFile(nid(id));
 const d=CDOCS.find(x=>x.id===id);if(!d)return null;
 if(!BLOBS[id]){const{data,error}=await SBC.storage.from('docs').download(d.path);if(error){alert('檔案讀取失敗：'+error.message);return null}BLOBS[id]=data}
 const r=FALL.find(x=>x.id===id)||{};return{...r,blob:BLOBS[id]};
};
function cRec(d){const a=CAPPS.find(x=>x._cid===d.applicant_id);const ai=d.ai||{};
 const stuck=(d.ai_status==='pending'||d.ai_status==='running')&&Date.now()-Date.parse(d.created_at)>5*60e3;
 const flags=stuck?['初步檢查沒有完成，請人工核對']:d.ai_status==='pending'||d.ai_status==='running'?['系統還在做初步檢查，可以稍後按「重新整理」再看']:(ai.issues||[]);
 const lk=d.locked_by&&d.locked_by!==CUSER.toLowerCase()&&d.locked_at&&Date.now()-Date.parse(d.locked_at)<6e5?(RVN[d.locked_by]||d.locked_by):'';
 return{lockBy:lk,id:d.id,k:(a?a.id:'?')+'|'+d.doc_type,name:d.file_name||d.path.split('/').pop(),type:d.mime||'',size:d.size,h:d.sha256,flags,summary:ai.summary||'',st:d.review_status||'pend',note:d.review_note||'',by:d.reviewed_by||''}}
loadIdx=async function(){
 if(!CLOUD)return _loadIdx();
 FALL=CDOCS.map(cRec);FIDX={};FALL.forEach(r=>(FIDX[r.k]=FIDX[r.k]||[]).push(r));
 const pn=document.getElementById('pendN');const np=FALL.filter(r=>r.st==='pend').length;if(pn)pn.textContent=np;const nb=document.getElementById('navPend');if(nb){nb.textContent=np;nb.classList.toggle('hidden',!np)}};
function mapDocs(a){
 for(const f of FIELDS.filter(f=>f.doc)){
  const L=CDOCS.filter(d=>d.applicant_id===a._cid&&d.doc_type===f.k);
  if(L.length){a[f.k]=L.some(d=>d.review_status==='ok')?'已附':L.some(d=>d.review_status==='pend')?'待核對':'退回';continue}
  const m=(a._review.docs||{})[f.k];
  a[f.k]=m||(f.doc===3?'無須':'未附');
 }}
function mapApp(r){const f=r.form||{};
 const rv=r.review||{};const a={...f,id:r.app_no,_cid:r.id,_review:rv,_at:r.created_at,override:rv.override||'依系統',overNote:rv.overNote||''};if(rv.fam)a.fam=rv.fam;
 if(!a.fam){const k=[f.fatherName,f.motherName,f.guardianName].filter(Boolean).join('/');if(k)a.fam=k}
 mapDocs(a);return a}
syncDoc=function(k){if(!CLOUD)return _syncDoc(k);CAPPS.forEach(mapDocs)};
setSt=async function(id,st,note){
 if(!CLOUD)return _setSt(nid(id),st,note);
 if(LOCKED!==id){const c=await lockDoc(id);if(!c.ok){alert((RVN[c.by]||c.by||'其他審查人員')+' 正在核對這份文件，請稍後再試');return}}
 const patch={review_status:st,review_note:note||null,reviewed_by:CUSER,reviewed_at:new Date().toISOString(),locked_by:null,locked_at:null};
 if(!await wrote(await SBC.from('documents').update(patch).eq('id',id).select('id'),'儲存'))return;
 Object.assign(CDOCS.find(d=>d.id===id)||{},patch);if(LOCKED===id)LOCKED=null;await loadIdx();syncDoc()};
async function lockDoc(id){const{data,error}=await SBC.rpc('claim_document',{p_id:id});if(error)return{ok:false,by:'',err:error.message};if(data.ok)LOCKED=id;return data}
async function unlockDoc(){if(CLOUD&&LOCKED){const id=LOCKED;LOCKED=null;await SBC.rpc('release_document',{p_id:id})}}
const _showReview=showReview,_startReview=startReview;
showReview=async function(){
 if(!CLOUD)return _showReview();
 await unlockDoc();
 while(RI>=0&&RI<RQ.length){const id=RQ[RI];const c=await lockDoc(id);
  if(c.ok&&(c.status==='pend'||SPOT||RS[id]==='ok'||RS[id]==='bad'))break;
  if(c.ok){await unlockDoc();RS[id]='other'}else RS[id]='lock';
  RI+=DIR}
 if(RI<0){RI=0;DIR=1;if(RS[RQ[0]]==='lock'||RS[RQ[0]]==='other'){RI=1;return showReview()}}
 return _showReview()};
startReview=async function(){if(CLOUD)await cloudLoad();return _startReview()};
rdlg.addEventListener('close',()=>{unlockDoc()});
window.addEventListener('pagehide',()=>{unlockDoc()});
delFile=async function(id){
 if(!CLOUD)return _delFile(nid(id));
 const d=CDOCS.find(x=>x.id===id);if(!d)return;
 if(!await wrote(await SBC.from('documents').delete().eq('id',id).select('id'),'刪除'))return;
 await SBC.storage.from('docs').remove([d.path]);
 CDOCS=CDOCS.filter(x=>x.id!==id)};
putFile=async function(k,file){
 if(!CLOUD)return _putFile(k,file);
 const[who,dk]=k.split('|');const a=CAPPS.find(x=>String(x.id)===who);if(!a)throw new Error('找不到申請人');
 const ext=(file.name.match(/\.([a-z0-9]+)$/i)||[,'bin'])[1].toLowerCase();
 const path=`${a._cid}/${dk}/${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`;
 const mime=file.type||(ext==='pdf'?'application/pdf':'image/jpeg');
 const up=await SBC.storage.from('docs').upload(path,file,{contentType:mime});if(up.error)throw up.error;
 const h=await sha(file);
 const{data,error}=await SBC.from('documents').insert({applicant_id:a._cid,doc_type:dk,path,file_name:file.name,mime,size:file.size,sha256:h||null}).select().single();
 if(error){await SBC.storage.from('docs').remove([path]);throw error}
 CDOCS.push(data);
 SBC.functions.invoke('analyze',{body:{document_id:data.id}}).then(()=>refreshDoc(data.id));
};
async function refreshDoc(id){const{data}=await SBC.from('documents').select('*').eq('id',id).single();if(!data)return;const i=CDOCS.findIndex(d=>d.id===id);if(i>=0)CDOCS[i]=data;else CDOCS.push(data);syncDoc();await loadIdx();render()}
toggleDoc=async function(i,k){
 if(!CLOUD)return _toggleDoc(i,k);
 const a=APPS[i],f=FIELDS.find(f=>f.k===k),x=R.find(r=>r.i===i),cur=docState(x,f);
 if((FIDX[fkey(a,k)]||[]).length){openFiles(i,k);return}
 const v=cur==='ok'?(f.doc===3?'無須':'未附'):'已附';
 const rv={...a._review,docs:{...(a._review.docs||{}),[k]:v}};
 if(!await wrote(await SBC.from('applicants').update({review:rv}).eq('id',a._cid).select('id'),'儲存'))return;
 a._review=rv;a[k]=v;render()};
const FORMSKIP=new Set(['id',...DOCKEYS]);
saveEdit=async function(){
 if(!CLOUD)return _saveEdit();
 const e={};document.querySelectorAll('#editForm [data-k]').forEach(el=>e[el.dataset.k]=el.value.trim());if(!e.name){alert('請填姓名');return}
 const form={};for(const[k,v]of Object.entries(e))if(!FORMSKIP.has(k))form[k]=v;
 if(editIdx===null){
  form.consent=true;form.source='審查人員建檔';
  const{data,error}=await SBC.rpc('submit_application',{p_form:form});if(error){alert('新增失敗：'+error.message);return}
  dlg.close();await cloudLoad();return}
 const a=APPS[editIdx];
 const cur=await SBC.from('applicants').select('form,review').eq('id',a._cid).single();if(cur.error||!cur.data){await sessionLost();return}
 const rvPart={},fmPart={};for(const[k,v]of Object.entries(form))(REVKEYS.includes(k)?rvPart:fmPart)[k]=v;
 const old=cur.data.form||{},chg={};for(const[k,v]of Object.entries(fmPart))if(String(old[k]??'')!==String(v)&&!(k==='fam'&&!old.fam))chg[k]=v;
 const newForm={...old,...chg},newRev={...(cur.data.review||{}),...rvPart};
 if(!await wrote(await SBC.from('applicants').update({form:newForm,review:newRev}).eq('id',a._cid).select('id'),'儲存'))return;
 CAPPS_RAW[a._cid].form=newForm;CAPPS_RAW[a._cid].review=newRev;a._review=newRev;Object.assign(a,chg,rvPart);dlg.close();render()};
const REVKEYS=['override','overNote','fam'];
$('#delBtn').onclick=async()=>{
 if(!confirm('確定刪除這位申請人？'+(CLOUD?'\n（雲端上的資料與文件都會一併刪除，無法復原）':'')))return;
 if(!CLOUD){APPS.splice(editIdx,1);dlg.close();render();return}
 const a=APPS[editIdx];const paths=CDOCS.filter(d=>d.applicant_id===a._cid).map(d=>d.path);
 if(!await wrote(await SBC.from('applicants').delete().eq('id',a._cid).select('id'),'刪除'))return;
 if(paths.length)await SBC.storage.from('docs').remove(paths);
 dlg.close();await cloudLoad()};
saveSettings=async function(){
 if(!CLOUD)return _saveSettings();
 document.querySelectorAll('[data-s]').forEach(e=>S[e.dataset.s]=e.value.trim());
 if(!await wrote(await SBC.from('settings').upsert({id:1,data:S,updated_at:new Date().toISOString()}).select('id'),'儲存'))return;
 render();alert('已儲存到雲端，所有審查人員都會套用新規則')};
clearAll=function(){if(CLOUD)return alert('雲端模式不能一次清空。要刪除申請人，請在「申請資料」按「編輯」→「刪除」。');return _clearAll()};
loadDemo=function(){if(CLOUD)return alert('雲端模式不能載入示範資料。請先按右上角「登出」回到本機模式。');return _loadDemo()};
allDocs=function(){if(CLOUD)return alert('雲端模式請逐一核對文件，不能一次全部設為已附。');return _allDocs()};
const _readFile=readFile;readFile=function(f){if(CLOUD)return alert('雲端模式的申請資料來自學生線上申請，不能匯入 Excel。要匯入請先登出。');return _readFile(f)};

let CAPPS_RAW={};
async function cloudLoad(){
 const bar=$('#cloudInfo');if(bar)bar.textContent='讀取中…';
 const [ap,dc,st]=await Promise.all([
  SBC.from('applicants').select('*').order('app_no').range(0,4999),
  SBC.from('documents').select('*').order('created_at').range(0,19999),
  SBC.from('settings').select('*').eq('id',1).maybeSingle()]);
 const rv=await SBC.from('reviewers').select('email,name');RVN={};(rv.data||[]).forEach(r=>RVN[r.email.toLowerCase()]=r.name||r.email);
 const err=ap.error||dc.error||st.error;if(err){alert('讀取雲端資料失敗：'+err.message);return false}
 CAPPS_RAW={};ap.data.forEach(r=>CAPPS_RAW[r.id]=r);
 CDOCS=dc.data.filter(d=>!d.withdrawn_at);CAPPS=ap.data.map(mapApp);APPS=CAPPS;BLOBS={};
 S=Object.assign({},DEF,(st.data&&st.data.data)||{});
 await loadIdx();renderSettings();render();if(ISADMIN)loadReviewers();
 if(bar)bar.textContent=`${new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false})} 更新`;
 return true}
async function enterCloud(){
 const{data:s}=await SBC.auth.getSession();if(!s.session)return false;
 const{data:ok,error}=await SBC.rpc('is_reviewer');
 if(error||!ok){alert('這個帳號（'+s.session.user.email+'）不在審查人員名單內，請洽管理者。');await SBC.auth.signOut();return false}
 if(!CLOUD)LOCAL_BAK={APPS,S};
 CLOUD=true;CUSER=s.session.user.email;document.body.classList.add('cloud');document.body.classList.remove('gated');
 const ra=await SBC.rpc('is_admin');ISADMIN=!!(ra&&ra.data);document.body.classList.toggle('admin',ISADMIN);
 
 await cloudLoad();if(ISADMIN)checkKey();$('#userBtn').textContent=(RVN[CUSER.toLowerCase()]||CUSER.split('@')[0])+' ▾';$('#userInfo').innerHTML=`${esc(CUSER)}<br>${ISADMIN?'管理者':'審查委員'}`;maybeTour();return true}
let LEAVING=false;
async function leaveCloud(){
 if(DEMO){location.reload();return}
 if(!confirm('確定登出嗎？'))return;
 LEAVING=true;await SBC.auth.signOut();location.reload();return;CLOUD=false;CUSER='';ISADMIN=false;document.body.classList.remove('cloud','admin');
 
 if(LOCAL_BAK){APPS=LOCAL_BAK.APPS;S=LOCAL_BAK.S}else{APPS=[];S=Object.assign({},DEF);_load()}
 await _loadIdx();renderSettings();render()}
function cloudBtnClick(){if(CLOUD)leaveCloud();else{$('#lgErr').textContent='';ldlg.showModal()}}
const ldlg=$('#ldlg');
async function doLogin(e){e.preventDefault();const em=$('#lgEmail').value.trim(),pw=$('#lgPw').value;$('#lgErr').textContent='登入中…';
 const{error}=await SBC.auth.signInWithPassword({email:em,password:pw});
 if(error){$('#lgErr').textContent=/Invalid login/i.test(error.message)?'Email 或密碼錯誤':'登入失敗：'+error.message;return}
 ldlg.close();$('#lgPw').value='';await enterCloud()}
function copyApply(){const u=$('#applyUrl').textContent;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>alert('已複製，可以貼給學生或學校承辦人'),()=>prompt('請複製這個網址：',u))}
if(SBC){if(SBC.auth.onAuthStateChange)SBC.auth.onAuthStateChange(ev=>{if(ev==='SIGNED_OUT'&&CLOUD&&!LEAVING)sessionLost()});$('#cloudBtn').classList.remove('hidden');$('#applyUrl').textContent=new URL('apply.html',location.href).href}

// ===== 使用導覽（第一次登入自動出現；右上角「使用說明」可再看）=====
const TOUR_STEPS=()=>{const nm=RVN[CUSER.toLowerCase()];const L=[
 {title:`歡迎${nm?'，'+nm:''}！`,body:'謝謝您擔任助學金審查委員。<br>接下來用 1 分鐘，帶您看一遍要做的事。<br><br>放心，按錯都可以改，不會一按就無法挽回。'},
 {sel:'#hello',tab:'home',title:'您的工作只有一件：核對文件',body:'首頁會告訴您還有幾份文件要看。<br>按「<b>開始核對</b>」，系統就一份一份帶您看。<br><br>其他分頁可以參考，不用動。'},
 {sel:'#startReviewBtn',tab:'docs',title:'三個按鈕',body:'<b style="color:var(--ok)">✓ 符合</b>：這份文件可以用<br><b style="color:var(--bad)">✕ 退回</b>：學生要重交，點選原因就好，不用打字<br><b>略過</b>：晚點再看，<u>不算完成</u>，下次會再出現'},
 {sel:'#startReviewBtn',tab:'docs',title:'按錯了怎麼辦？',body:'按「<b>◀ 上一份</b>」回去重新選；<br>或點視窗上方的小方格，直接跳到那一份。<br><br>您正在看的文件會鎖住，其他委員會自動跳過，不會撞在一起。'},
 {sel:'#startReviewBtn',tab:'docs',title:'初步檢查只是提醒',body:'大部分文件系統已經先看過、自動通過。<br>標 ⚠ 的才需要您確認，例如：<br>・是不是這份文件<br>・姓名是不是學生或家人<br>・日期是否在 3 個月內<br>・分數和申請表一不一樣<br><br>系統可能會錯，<b>以您的判斷為準</b>。'},
 {sel:'#docTable',tab:'docs',title:'每個人的文件一覽',body:'<span class="dk ok">✓</span> 已繳　<span class="dk pend">?</span> 待核對　<span class="dk no">✕</span> 缺件或退回<br><br>點任何一格，就能看這位學生上傳的檔案。'},
 {sel:'nav button[data-t="result"]',tab:'result',title:'初篩結果自動算好',body:'資格、優先順序、正取／備取都依協會規則自動排好。<br><br>文件還沒核對完時，名單是<b>暫定</b>的；被退回文件的學生會列為「<b>待補件</b>」，不是不符合。'}];
 if(ISADMIN)L.push({sel:'nav button[data-t="settings"]',tab:'settings',title:'管理者專用：規則設定',body:'這裡可以設定<b>截止日</b>和<b>聯絡方式</b>（學生頁會顯示）、新增或移除審查人員，也可以查看<b>異動紀錄</b>：誰在什麼時候改了什麼。'});
 L.push({sel:'#tourBtn',tab:'home',title:'隨時可以再看一次',body:'忘記怎麼用，按右上角「<b>使用說明</b>」就能重看。<br>中途離開沒關係，進度都已經存好了。<br><br>辛苦您了，謝謝！'});
 return L};
let TI=0,TS=[];
function tourKey(){return'sch_tour_done_'+(CUSER||'local').toLowerCase()}
function startTour(){TS=TOUR_STEPS();TI=0;$('#tour').classList.remove('hidden');document.body.style.overflow='hidden';showTour()}
function endTour(){$('#tour').classList.add('hidden');document.body.style.overflow='';try{localStorage.setItem(tourKey(),'1')}catch(e){}tab('home')}
function showTour(){
 const st=TS[TI];if(st.tab)tab(st.tab);
 const el=st.sel?document.querySelector(st.sel):null;
 const hole=$('#tourHole'),card=$('#tourCard');hole.style.display='block';
 $('#tourTitle').innerHTML=st.title;$('#tourBody').innerHTML=st.body;
 $('#tourStep').textContent=`${TI+1} / ${TS.length}`;
 $('#tourPrev').classList.toggle('hidden',TI===0);
 $('#tourNext').textContent=TI===TS.length-1?'開始使用':'下一步 →';
 const mob=window.innerWidth<700;
 if(mob)Object.assign(card.style,{left:'12px',right:'12px',width:'auto',top:'auto',bottom:'12px',transform:'none'});
 if(el&&el.offsetParent!==null){
  if(mob){const r0=el.getBoundingClientRect();window.scrollBy(0,r0.top-90)}else el.scrollIntoView({block:'center',behavior:'instant'});
  const r=el.getBoundingClientRect(),pad=8;
  const room=mob?window.innerHeight-card.offsetHeight-40-r.top:window.innerHeight*0.45;
  const maxH=Math.max(40,Math.min(r.height,room));
  Object.assign(hole.style,{left:Math.max(4,r.left-pad)+'px',top:(r.top-pad)+'px',width:Math.min(window.innerWidth-8,r.width+pad*2)+'px',height:(maxH+pad*2)+'px'});
  if(!mob){
   const below=r.top+maxH+pad+16,cw=Math.min(460,window.innerWidth-24);
   Object.assign(card.style,{width:cw+'px',right:'auto',bottom:'auto',transform:'none',left:Math.max(12,Math.min(r.left,window.innerWidth-cw-12))+'px'});
   const ch=card.offsetHeight||260;
   card.style.top=(below+ch<window.innerHeight?below:Math.max(12,r.top-pad-16-ch))+'px';
  }
 }else{
  Object.assign(hole.style,{left:'50%',top:'50%',width:'0px',height:'0px'});
  if(!mob)Object.assign(card.style,{width:Math.min(480,window.innerWidth-24)+'px',right:'auto',bottom:'auto',left:'50%',top:'50%',transform:'translate(-50%,-50%)'});
 }
 $('#tourNext').focus();
}
function tourNext(){if(TI<TS.length-1){TI++;showTour()}else endTour()}
function tourPrev(){if(TI>0){TI--;showTour()}}
window.addEventListener('resize',()=>{if(!$('#tour').classList.contains('hidden'))showTour()});
document.addEventListener('keydown',e=>{if($('#tour').classList.contains('hidden'))return;if(e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();tourNext()}else if(e.key==='ArrowLeft')tourPrev();else if(e.key==='Escape')endTour()});
function maybeTour(){let done=false;try{done=!!localStorage.getItem(tourKey())}catch(e){}if(!done)startTour()}

// ===== 承辦用：未定案提示、補件名單、規則、名單、紀錄 =====
const today=()=>{const d=new Date();return`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`};
function provCount(){return{docs:FALL.filter(r=>(r.st||'pend')==='pend').length,hold:R.filter(x=>x.st==='hold').length,late:R.filter(x=>x.st==='late').length}}
function provHtml(){const c=provCount();if(!R.length||(!c.docs&&!c.hold&&!c.late))return'';if(!c.docs&&!c.hold)return`<div class="prov late noprint"><b>補件期限已過</b>：${c.late} 位逾期未補件，已集中列在「初篩結果」的「逾期未補件」，請委員會議決定是否受理。</div>`;return`<div class="prov noprint"><b>初篩尚未定案</b>：還有 ${c.docs} 份文件待核對${c.hold?`、${c.hold} 位待補件`:''}${c.late?`、${c.late} 位逾期未補件（請委員會議決定）`:''}。目前的正取／備取是<b>暫定</b>，匯出的檔名會加上「暫定」。</div>`}
function badNotes(x){const who=fkey(x.a,'');return FALL.filter(r=>r.k.startsWith(who)&&r.st==='bad').map(r=>`<div class="note">${esc(DOCNAME(r.k.split('|')[1]))}：${esc(r.note||'')}</div>`).join('')}
function renderHello(){if(!CLOUD){$('#hello').innerHTML='';return}
 const nm=RVN[CUSER.toLowerCase()]||'',n=FALL.filter(r=>(r.st||'pend')==='pend').length;
 const c=provCount();
 $('#hello').innerHTML=n?`<div class="next"><div><h2>${esc(nm||'您')}好，目前有 <span class="big">${n} 份</span>文件等您核對</h2><p>每份大約 30 秒。全部核對完，初篩結果才會定案。</p></div><button class="btn pri lg" onclick="tab('docs');startReview()">開始核對</button></div>`
  :c.late?`<div class="next late"><div><h2>${esc(nm||'您')}好，文件都核對完了</h2><p>${c.late} 位學生逾期未補件，請在委員會議決定是否受理。</p></div><button class="btn lg" onclick="tab('result');$('#fStatus').value='late';render()">查看逾期名單</button></div>`
  :`<div class="next"><div><h2>${esc(nm||'您')}好，目前沒有待核對的文件</h2><p>${c.hold?`還有 ${c.hold} 位學生在補件中，補交後會再出現在這裡。`:'辛苦了，謝謝您。'}</p></div><button class="btn lg" onclick="tab('result')">查看初篩結果</button></div>`}
function exportFollowup(){
 const list=R.filter(x=>(x.missing||[]).length||FALL.some(r=>r.k.startsWith(fkey(x.a,''))&&r.st==='bad'));
 if(!list.length){alert('目前沒有需要補件的申請人');return}
 const dl=S.deadline?S.deadline:'';
 const rows=[['編號','姓名','手機','Email','缺少的文件','被退回的文件與原因','補件截止日'],...list.map(x=>{const who=fkey(x.a,'');const bad=FALL.filter(r=>r.k.startsWith(who)&&r.st==='bad');const badT=bad.map(r=>DOCNAME(r.k.split('|')[1]));
  return[x.a.id,x.a.name,x.a.phone||'',x.a.email||'',(x.missing||[]).filter(m=>!badT.includes(m)).join('、'),bad.map(r=>DOCNAME(r.k.split('|')[1])+'：'+(r.note||'')).join('；'),dl]})];
 sheetOut('補件通知',rows,'松樑助學金_補件通知名單_'+today())}
async function loadReviewers(){if(!CLOUD)return;const{data}=await SBC.from('reviewers').select('*').order('created_at');RVL=data||[];
 $('#rvTable').innerHTML='<tr><th>Email</th><th>姓名</th><th>身分</th><th></th></tr>'+RVL.map(r=>`<tr><td>${esc(r.email)}</td><td>${esc(r.name||'')}</td><td>${r.role==='admin'?'管理者':'審查委員'}</td><td>${r.email.toLowerCase()===CUSER.toLowerCase()?'<span class="note">（您）</span>':`<button class="btn sm danger" onclick="rvDel('${esc(r.email)}')">移除</button>`}</td></tr>`).join('')}
let RVL=[];
async function rvAdd(){const email=$('#rvEmail').value.trim().toLowerCase(),name=$('#rvName').value.trim(),role=$('#rvRole').value;
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){alert('請輸入正確的 Email');return}
 const{error}=await SBC.from('reviewers').upsert({email,name,role});if(error){alert('新增失敗：'+error.message);return}
 $('#rvEmail').value='';$('#rvName').value='';await loadReviewers();alert(`已加入 ${name||email}。\n請通知系統管理員開通他的登入帳號（同一個 Email）。`)}
async function rvDel(email){if(!confirm(`確定移除 ${email}？移除後他就看不到任何資料。`))return;const{error}=await SBC.from('reviewers').delete().eq('email',email);if(error){alert('移除失敗：'+error.message);return}loadReviewers()}
const AUDF={name:'姓名',score:'成績',incSelf:'本人所得',incF:'父所得',incM:'母所得',incG:'家長所得',override:'評審決議',overNote:'決議說明',memo:'自述',review_status:'核對結果',review_note:'退回原因',house:'房產',welfare:'福利身分',disab:'身障'};
function auditDiff(r){
 if(r.action==='刪除')return'刪除：'+esc((r.before&&(r.before.app_no||r.before.file_name||r.before.doc_type))||r.row_id);
 if(r.action==='新增')return'新增：'+esc((r.after&&(r.after.app_no+' '+((r.after.form||{}).name||'')))||'');
 const b=r.before||{},a=r.after||{},out=[];
 const cmp=(o,n,pre)=>{for(const k of new Set([...Object.keys(o||{}),...Object.keys(n||{})])){if(['editedAt','locked_by','locked_at','reviewed_at','ai','ai_status','updated_at','verdict'].includes(k))continue;const ov=o?o[k]:undefined,nv=n?n[k]:undefined;if(JSON.stringify(ov)===JSON.stringify(nv))continue;if(typeof nv==='object'&&nv&&!Array.isArray(nv)&&typeof ov==='object'){cmp(ov,nv,pre+k+'.');continue}out.push(`${esc(AUDF[k]||pre+k)}：${esc(ov??'（空）')} → <b>${esc(nv??'（空）')}</b>`)}};
 cmp(b,a,'');return out.join('<br>')||'—'}
async function loadAudit(){const{data,error}=await SBC.from('audit_log').select('*').order('id',{ascending:false}).limit(200);if(error){alert('讀取失敗：'+error.message);return}
 const nameOf=r=>{const id=(r.after||r.before||{}).applicant_id||r.row_id;const a=CAPPS.find(x=>x._cid===id);return a?a.id+' '+a.name:''};
 $('#auditTable').innerHTML='<tr><th>時間</th><th>誰</th><th>對象</th><th>內容</th></tr>'+(data||[]).map(r=>`<tr><td>${new Date(r.at).toLocaleString('zh-TW',{hour12:false})}</td><td>${esc(RVN[(r.who||'').toLowerCase()]||r.who)}</td><td>${esc({applicants:'申請人',documents:'文件',settings:'規則'}[r.tbl]||r.tbl)} ${esc(nameOf(r))}${r.tbl==='documents'?'<br><span class="note">'+esc(DOCNAME(((r.after||r.before)||{}).doc_type||''))+'</span>':''}</td><td>${auditDiff(r)}</td></tr>`).join('')}

async function startSpot(){
 await cloudLoad();const auto=FALL.filter(r=>r.st==='ok'&&r.by==='auto');
 if(!auto.length){alert('目前沒有需要抽查的系統通過文件');return}
 const must=auto.filter(r=>/\|(d_wel|d_dis)$/.test(r.k)),rest=auto.filter(r=>!must.includes(r)).sort(()=>Math.random()-.5);
 const pct=Math.max(0,Math.min(100,parseFloat(S.spotPct)||10)),pick=rest.slice(0,Math.ceil(rest.length*pct/100));
 RQ=[...must,...pick].map(r=>r.id);
 if(!confirm(`本次抽查 ${RQ.length} 份：\n・福利身分、身障證明 ${must.length} 份（影響優先順序，全部看）\n・其他文件隨機抽 ${pct}%：${pick.length} 份\n\n看過按「符合」就會改成「已核對符合」，下次不會再抽到。開始嗎？`))return;
 SPOT=true;RI=0;RS={};RALL={};DIR=1;rdlg.showModal();showReview()}
const mask=n=>{n=String(n||'');return n.length<=1?n:n.length===2?n[0]+'○':n[0]+'○'.repeat(n.length-2)+n[n.length-1]};
function exportReviewers(){
 if(!R.length){alert('尚無資料');return}
 const st=x=>({ok:'正取',add:'追加正取',wait:'備取'+(x.wn||''),hold:'待補件',late:'逾期未補件',no:'不符合'}[x.st]);
 const pr=x=>[x.p1?'①':'',x.welfare&&!x.p1?'②':'',x.disab?'③':'',x.noHouse?'④':''].filter(Boolean).join('');
 const head=['排名','初篩結果','編號','姓名','學制','系所','年級','成績','優先條件（對照規則第幾項）','不符合原因','備註','自述／推薦重點','審查組','評審意見'];
 const row=x=>[x.rk||'',st(x),x.a.id,mask(x.a.name),x.a.level,x.a.dept,x.grade||'',x.a.score,pr(x),x.reasons.map(tagOf).join('、'),x.notes.map(tagOf).join('、'),x.a.memo||'',x.grp,''];
 const order={ok:0,add:1,wait:2,hold:3,late:3.5,no:4};
 const part=L=>[head,...R.filter(x=>x.L===L).sort((p,q)=>order[p.st]-order[q.st]||((p.rk||999)-(q.rk||999))).map(row)];
 const note=[['使用須知'],['本名單僅供本年度助學金評審使用，請勿轉寄、複製或上傳到其他地方。'],['會議結束後請將紙本交回承辦人員統一銷毀，電子檔請刪除（含下載資料夾與資源回收筒）。'],['優先條件：①續領且具福利身分 ②低收／中低收／特殊境遇 ③本人或二等親身障／重大傷病 ④無房產'],['匯出時間：'+new Date().toLocaleString('zh-TW',{hour12:false})]];
 sheetOut([['使用須知',note],['大學部',part('U')],['碩博士班',part('G')]],null,'松樑助學金_評審用_機密_'+today()+(provCount().docs||provCount().hold||provCount().late?'_暫定':''))}

async function checkKey(){try{const{data}=await SBC.functions.invoke('analyze',{body:{ping:true}});const bad=!data||data.key===false;
 const box=$('#keyWarn');box.classList.toggle('hidden',!bad)}catch(e){}}
let DEMO=false;
function loadDemoJs(){return window.DemoClient?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='demo.js?v=2';s.onload=ok;s.onerror=()=>no(new Error('示範載入失敗，請檢查網路'));document.head.appendChild(s)})}

function adminDemoSteps(){
 const pendIdx=(no,k)=>RQ.findIndex(id=>{const r=FALL.find(x=>x.id===id);return r&&r.k===no+'|'+k});
 return[
 {t:'為什麼要做這個系統？',b:'以前每年近百位學生的申請，都是紙本或 Excel：<br>・承辦要一份份對照文件、打電話追補件<br>・委員要對著幾十條規則手算資格與排名，容易出錯<br>・學生的所得、身障等個資散在各處，不好保護',ms:9000,do:async h=>{tab('home')}},
 {t:'這個系統幫大家做了什麼',b:'・學生用手機線上申請、拍照上傳，自己查進度、補件<br>・文件先自動做初步檢查，委員只需要看有疑問的<br>・資格、優先順序、正取備取依協會規則自動算好<br>・資料集中、有權限控管，每一筆修改都有紀錄',ms:9000,do:async h=>{tab('home')}},
 {t:'接下來實際看一次',b:'系統會自動示範審查委員和承辦人員的工作，約 1 分鐘。<br>隨時可以按「暫停」或「結束介紹」。',ms:5000,do:async h=>{tab('home');h.hl('#hello')}},
 {t:'一登入就知道要做什麼',b:'首頁會告訴委員還有幾份文件等著核對，按「開始核對」就開始。',ms:3000,do:async h=>{tab('home');await h.tap('#hello .btn');await h.until(()=>rdlg.open&&!LOADING)}},
 {t:'左邊：這份應該是什麼文件',b:'會顯示學生姓名、這份應該是哪一種文件，還有初步檢查發現的問題。',do:async h=>{await h.until(()=>!LOADING);h.hl('#rInfo')}},
 {t:'右邊：學生上傳的原檔',b:'看不清楚可以放大、旋轉，或用新分頁打開原檔。',do:async h=>{h.hl('#rView');await h.sleep(700);await h.tap('#vTool button:nth-child(2)')}},
 {t:'沒問題，就按「符合」',b:'按下去會自動跳到下一份文件。',ms:3500,do:async h=>{vz(0);await h.tap('#rOk');await h.until(()=>!LOADING&&!BUSY)}},
 {t:'有問題的文件，系統會提醒',b:'例如這份「成績單」，其實是一張風景照。',ms:5000,do:async h=>{const j=pendIdx('U002','d_tr');if(j>=0){await revJump(j);await h.until(()=>!LOADING&&!BUSY)}h.hl(document.querySelector('#rInfo .alert:not([style*="e8f0fa"])')||'#rInfo')}},
 {t:'退回：點選原因就好',b:'系統已經先勾好原因，也可以再寫補充說明。學生登入後會看到這個原因。',ms:5000,do:async h=>{await h.tap('#rBad');await h.until(()=>bdlg.open);await h.sleep(300);h.hl('#bChips')}},
 {t:'確定退回',b:'這位學生會列為「待補件」，不是不符合。',ms:3500,do:async h=>{await h.tap('#bOk');await h.until(()=>!bdlg.open&&!LOADING&&!BUSY)}},
 {t:'上方小方格就是進度',b:'✓ 是符合、✕ 是退回。點任何一格都能回去改，按錯不用怕。<br>您正在看的文件會鎖住，其他委員會自動跳過，不會撞在一起。',ms:6000,do:async h=>{h.hl('#rStrip')}},
 {t:'初篩結果自動排好',b:'資格、優先順序、正取／備取都依協會規則算好，並寫出不符合的原因。',ms:5500,do:async h=>{rdlg.close();await h.sleep(300);tab('result');render();await h.sleep(300);h.hl('#resultBox .card')}},
 {t:'每位學生的文件一覽',b:'綠色是已繳、橘色待核對、紅色缺件或退回。點任何一格就能看檔案。',ms:5000,do:async h=>{tab('docs');await h.sleep(300);h.hl('#docTable')}},
 {t:'承辦專用：設定與匯出',b:'每年在這裡填申請截止日、補件期限、聯絡方式，學生頁會自動顯示。<br>名單可以匯出 Excel，也有給評審的去識別版。',ms:6000,do:async h=>{tab('settings');await h.sleep(300);h.hl('#setForm1')}},
 {t:'示範結束',b:'現在換您自己操作看看。這裡都是假資料，怎麼按都不會影響真正的系統。',ms:6000,do:async h=>{tab('home');h.hl('#hello')}}]}
async function startDemo(){try{await loadDemoJs()}catch(e){alert(e.message);return}
 try{localStorage.setItem('sch_tour_done_demo@example.tw','1')}catch(e){}
 SBC=window.DemoClient();SBC.auth._demoLogin();DEMO=true;$('#demoBar').classList.remove('hidden');$('#demoBar').style.display='flex';if(ldlg.open)ldlg.close();
 $('#applyUrl').textContent=new URL('apply.html',location.href).href;await enterCloud();window.DemoPlayer.play(adminDemoSteps())}
$('#q').oninput=renderData;$('#fLevel').onchange=render;$('#fStatus').onchange=render;$('#fq').oninput=render;$('#dShow').onchange=renderDocs;
if(SBC&&!/[?&]offline\b/.test(location.search))document.body.classList.add('gated');
load();renderSettings();render();loadIdx().then(render).then(async()=>{if(SBC){const ok=await enterCloud();if(ok)document.body.classList.remove('gated')}});
