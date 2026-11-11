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
 {k:'guardianName',l:'扶養家長姓名',hint:'單親家庭才填'},
 {k:'guardianRel',l:'扶養家長與申請人關係',hint:'單親家庭才填，例：母親'},
 {k:'incSelf',l:'申請人年所得',num:1},
 {k:'incF',l:'父親年所得',num:1},
 {k:'incM',l:'母親年所得',num:1},
 {k:'incG',l:'扶養家長年所得',num:1,hint:'單親家庭才填'},
 {k:'score',l:'前學期學業成績',num:1},
 {k:'rankPct',l:'班級或系排名百分比',num:1,hint:'例：前 30% 填 30'},
 {k:'conduct',l:'前學期操行成績',num:1,hint:'2026 年版辦法已不審查，可免填'},
 {k:'demerit',l:'懲處紀錄',opt:['無','警告','小過','大過以上'],hint:'因故意行為'},
 {k:'gov',l:'公費生',opt:['否','是']},
 {k:'otherAid',l:'其他獎學金每學期金額',num:1},
 {k:'d_id',l:'文件-學生證或在學證明',opt:['已附','未附'],doc:1},
 {k:'d_tr',l:'文件-前學期成績單（含班排或系排）',opt:['已附','未附'],doc:1},
 {k:'d_merit',l:'文件-前學期獎懲紀錄',opt:['已附','未附'],doc:1},
 {k:'d_hh',l:'文件-全戶戶籍謄本',opt:['已附','未附'],doc:1},
 {k:'d_prop',l:'文件-財產稅總歸戶清單',opt:['已附','未附'],doc:1},
 {k:'d_inc',l:'文件-綜合所得稅資料清單',opt:['已附','未附'],doc:1},
 {k:'d_rec',l:'文件-導師或系主任推薦函',opt:['已附','未附'],doc:1},
 {k:'d_wel',l:'文件-低收中低收或特殊境遇證明',opt:['無須','已附','未附'],doc:2,need:'welfare'},
 {k:'d_dis',l:'文件-身心障礙證明或重大傷病證明',opt:['無須','已附','未附'],doc:2,need:'disab'},
 {k:'d_unemp',l:'文件-失業家庭證明',opt:['無須','已附','未附'],doc:3},
 {k:'docNote',l:'文件備註'},
 {k:'prev',l:'上學期已獲本助學金',opt:['否','是']},
 {k:'welfare',l:'福利身分',opt:['無','低收入戶','中低收入戶','特殊境遇家庭']},
 {k:'disab',l:'身心障礙證明或重大傷病證明',opt:['無','本人','二親等內']},
 {k:'house',l:'家戶房產',opt:['有','無']},
 {k:'addr',l:'戶籍地址',hint:'用來判斷同一家庭'},
 {k:'fam',l:'家戶代號',hint:'同一家庭的兄弟姊妹填相同代號（未填則依戶籍地址判斷）'},
 {k:'memo',l:'自傳／推薦函重點',area:1},
 {k:'studentNo',l:'學號'},
 {k:'phone',l:'手機'},
 {k:'email',l:'Email'},
 {k:'override',l:'評審決議',opt:['依系統','評審排除','評審追加']},
 {k:'overNote',l:'決議說明'}
];
const DEF={org:'清寒及弱勢助學金',quotaU:26,quotaG:4,incomeLimit:1000000,spotPct:10,kwX:'資訊工程,資工,電子商務,電子物理,生物,物理',scoreMin:70,rankPct:50,aRatio:'2/3',groups:5,
 conductMin:'',otherMax:50000,penalty:'大過以上',
 kwA:'電子,電機,電資,電控,光電,通訊,機電,自動化,半導體',kwB:'紡織,材料,機械,工業工程',backfill:'是'};
let S=Object.assign({},DEF), APPS=[], R=[];
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function load(){try{const d=JSON.parse(localStorage.getItem('sch_screen')||'null');if(d){APPS=d.apps||[];S=Object.assign({},DEF,d.s||{})}}catch(e){}}
function save(){try{localStorage.setItem('sch_screen',JSON.stringify({apps:APPS,s:S}))}catch(e){}}

// ===== 解析 =====
const half=s=>String(s??'').replace(/[\uff01-\uff5e]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0)).replace(/\u3000/g,' ');
function parseMoney(v){if(typeof v==='number')return isFinite(v)?v:NaN;if(/^\s*(無|沒有|否|免|—)\s*$/.test(half(v)))return 0;let s=half(v).replace(/万/g,'萬').replace(/[,，\s元]/g,'').replace(/^(NT\$|NTD|\$|約|大約)/i,'');if(!s)return 0;
 if(/^\d+(\.\d+)?$/.test(s))return+s;
 const m=s.match(/^(?:(\d+(?:\.\d+)?)萬)?(?:(\d+(?:\.\d+)?)千)?(\d+(?:\.\d+)?)?$/);if(!m||(!m[1]&&!m[2]))return NaN;
 let n=(+(m[1]||0))*10000+(+(m[2]||0))*1000;const t=m[3];
 if(t){if(m[1]&&!m[2]&&/^\d$/.test(t))n+=+t*1000;else if(m[2]&&/^\d$/.test(t))n+=+t*100;else n+=+t}
 return n}
function aidNum(v){let s=half(v).replace(/\s/g,'');const yr=/學年|每年|一年|全年/.test(s);s=s.replace(/[\/／]?(每)?(學期|學年|一年|全年|年)/g,'').replace(/^每/,'');const n=parseMoney(s);return yr&&isFinite(n)?n/2:n}
function num(v){if(v==null||v==='')return 0;return parseMoney(v)}
const yes=v=>/^(是|有|y|yes|1|v|✓|true|○)$/i.test(String(v??'').trim());
function gradeNum(v){const s=half(v);if(/延畢|延修/.test(s))return 6;if(/^\d{3,}$/.test(s.trim()))return 0;const m=s.match(/\d+/);if(m)return+m[0];const c='一二三四五六七'.indexOf((s.match(/[一二三四五六七]/)||[''])[0]);return c>=0?c+1:0}
function ratio(){const s=half(S.aRatio).trim().replace(/%$/,'');let v;if(s.includes('/')){const[a,b]=s.split('/').map(Number);v=a/b}else{const n=parseFloat(s);v=n>1?n/100:n}if(!isFinite(v))return 2/3;if(Math.abs(v-2/3)<0.01)return 2/3;return Math.max(0,Math.min(1,v))}
function cat(dept){const d=half(dept).replace(/\s/g,'').replace(/^.*學院(?=.)/,'');const ks=k=>String(k||'').split(/[,，、]/).map(x=>x.trim()).filter(Boolean);const X=ks(S.kwX).filter(k=>d.includes(k));
 if(X.length&&!(X.every(k=>/資訊工程|資工/.test(k))&&/電子|電機/.test(d.replace(/電子商務/g,''))))return null;if(S.kwA.split(/[,，、]/).some(k=>k.trim()&&d.includes(k.trim())))return'A';if(S.kwB.split(/[,，、]/).some(k=>k.trim()&&d.includes(k.trim())))return'B';return null}
const lvl=a=>/碩|博|研究/.test(a.level||'')?'G':'U';
const wan=n=>(Math.round(n/1000)/10)+' 萬';

// ===== 核心計算 =====
// 電子電機 2/3 以總名額計：某學制電子電機人數不足時，由另一學制的電子電機備取者遞補，換下該學制排名最後的其他類正取
const normAddr=v=>half(v||'').replace(/\s|臺/g,m=>m==='臺'?'台':'').replace(/[之\-－]/g,'-').replace(/(\d+)樓.*$/,'$1樓').trim();
const famK=x=>String(x.a.fam||normAddr(x.a.addr)||'').trim();
// 內規：學士以下（大學部）同一家庭限一人
const famBlock=(x,ch)=>x.L==='U'&&famK(x)&&[...ch].some(y=>y!==x&&y.L==='U'&&famK(y)===famK(x));
function rebalance(out,AT){
 const tot=()=>['U','G'].reduce((s,L)=>s+(out[L]?[...out[L].ch].filter(x=>x.cat==='A').length:0),0);
 let guard=0;
 while(tot()<AT&&guard++<200){let done=false;
  for(const L of['U','G']){const o=out[L];if(!o)continue;
   const outB=[...o.ch].filter(x=>x.cat==='B').sort((p,q)=>q.rk-p.rk)[0];const rest=outB?new Set([...o.ch].filter(y=>y!==outB)):o.ch;const inA=o.el.find(x=>x.cat==='A'&&!o.ch.has(x)&&!famBlock(x,rest));
   if(inA&&outB){o.ch.delete(outB);o.ch.add(inA);outB.notes.push('類別名額已滿｜電子電機類須保留全體名額 2/3，由電子電機類遞補');done=true;break}}
  if(!done)break}
}
function compute(){
 const lim=num(S.incomeLimit),smin=+S.scoreMin,rp=+S.rankPct;
 R=APPS.map((a,i)=>{
  const x={a,i,L:lvl(a),cat:cat(a.dept),reasons:[],notes:[]};
  x.single=/單/.test(a.family||'');
  // 單親：申請人＋扶養家長（家長所得若填在父或母欄位也算入）；雙親：申請人＋父＋母
  const gEmpty=a.incG===''||a.incG==null;
  x.house=x.single?num(a.incSelf)+(gEmpty?Math.max(num(a.incF)||0,num(a.incM)||0):num(a.incG)):num(a.incSelf)+num(a.incF)+num(a.incM);
  if(x.single&&gEmpty&&a.incF&&a.incM&&num(a.incF)&&num(a.incM))x.notes.push('扶養家長待確認｜單親但父母所得都有填，已以較高者 '+Math.round(Math.max(num(a.incF),num(a.incM))).toLocaleString()+' 元計算，請委員確認');
  x.score=parseFloat(half(a.score))||0;{const rr=half(a.rankPct).match(/(\d+)\s*[\/／]\s*(\d+)/);const rs=rr&&+rr[2]>0?String(Math.ceil(+rr[1]*100/+rr[2])):half(a.rankPct).replace(/[^\d.]/g,'');let rv=rs===''?NaN:parseFloat(rs);if(rv>0&&rv<=1&&!/%/.test(String(a.rankPct))&&String(a.rankPct).includes('.'))rv=rv*100;x.rank=isFinite(rv)&&rv>0?rv:100}
  x.grade=gradeNum(a.grade);
  const w=String(a.welfare||'');x.welfare=/低收|特殊/.test(w);
  x.disab=/本人|親/.test(a.disab||'');
  x.noHouse=/無|否/.test(a.house||'');
  x.prev=yes(a.prev);
  x.p1=x.prev&&x.welfare;
  {const nt=half(a.nation||'').trim();if(/外|僑|陸|港|澳|大陸|中國(?!民國)/.test(nt)||(nt&&!/本國|中華民國|台灣|臺灣|國人/.test(nt)))x.reasons.push('非本國籍｜國籍：'+nt);else if(!nt)x.notes.push('國籍未填｜請委員確認是否為本國籍')}
  const badMoney=['incSelf','incF','incM','incG','otherAid'].filter(k=>a[k]!==''&&a[k]!=null&&!isFinite(k==='otherAid'?aidNum(a[k]):num(a[k])));
  if(badMoney.length)x.reasons.push('金額格式有誤｜'+badMoney.map(k=>({incSelf:'本人所得',incF:'父親所得',incM:'母親所得',incG:'扶養家長所得',otherAid:'其他獎學金'})[k]+'「'+a[k]+'」').join('、')+'，請改成阿拉伯數字（例：300000 或 30萬）');
  if(!x.cat)x.reasons.push('科系不符｜'+(a.dept||'未填系所')+' 不在補助科系範圍');
  if(isFinite(x.house)&&x.house>lim)x.reasons.push(`所得超標｜家戶年所得 ${Math.round(x.house).toLocaleString()} 元，上限 ${Math.round(lim).toLocaleString()} 元`);
  if(x.score<smin&&!(x.rank<=rp))x.reasons.push(`成績未達｜成績 ${x.score} 分（需 ${smin} 分），班排或系排 ${x.rank<100?'前 '+x.rank+'%':'未提供'}（需前 ${rp}%）`);
  const PL=['無','警告','小過','大過以上'],dm=half(a.demerit||'無').trim(),pt=Math.max(1,PL.indexOf(S.penalty));
  const lv=c=>/大過|留校|退學|開除/.test(c)?3:/小過/.test(c)?2:/警告/.test(c)?1:0;
  const cls=dm.split(/[，,、；;。\s]+/).filter(Boolean);let pv=0;for(const c of cls){if(/^(無|否|沒有|未曾|未|不曾)/.test(c)&&!/^無故/.test(c))continue;pv=Math.max(pv,lv(c)||(yes(c)?3:0))}
  if(pv>=pt&&/銷過|非故意|過失|撤銷/.test(dm))x.notes.push('懲處待確認｜申請表寫「'+dm+'」，請委員確認是否屬「因故意行為」且未銷過');
  else if(pv>=pt)x.reasons.push(`懲處紀錄｜曾記${PL[pv]}`);
  if(!String(a.div||'').trim())x.notes.push('部別未填｜請委員確認是否為日間部');
  {const dv=[a.div,a.level,a.dept].join(' ');if(/進修|夜間|推廣|空中|在職專班/.test(dv))x.reasons.push(`非日間部｜${(dv.match(/進修[^ ]*|夜間[^ ]*|推廣[^ ]*|空中[^ ]*|[^ ]*在職專班/)||[a.div])[0]}不在補助範圍`)}
  const cd=String(a.conduct??'').trim(),cn=/甲|優/.test(cd)?85:/乙/.test(cd)?75:/丙|丁/.test(cd)?65:parseFloat(cd);
  if(+S.conductMin>0&&cd&&!isNaN(cn)&&cn<+S.conductMin)x.reasons.push(`操行未達｜操行 ${cd}（需 ${S.conductMin} 分以上）`);
  {const gv=half(a.gov||'').trim();if(yes(gv)||(/公費|是/.test(gv)&&!/^(否|無|非|不是)/.test(gv)))x.reasons.push('公費生｜已享公費待遇')}
  {const ad=aidNum(a.otherAid??'');if(isFinite(ad)&&ad>=num(S.otherMax))x.reasons.push(`他項獎學金超額｜每學期已領 ${wan(ad)}（須低於 ${wan(num(S.otherMax))}）`)}
  const legacyOK=yes(a.docs)&&FIELDS.filter(f=>f.doc===1).every(f=>!a[f.k]);
  const has=v=>/已附|^是$|^有$|^v$|✓|○/i.test(String(v??'').trim());
  x.missing=legacyOK?[]:FIELDS.filter(f=>f.doc===1&&!(f.ex&&x.prev)&&!has(a[f.k])&&!/待核/.test(a[f.k]||'')).map(f=>f.l.replace('文件-',''));
  x.pend=FIELDS.filter(f=>f.doc&&/待核/.test(a[f.k]||'')).length;
  if(x.pend)x.notes.push(`待核對｜有 ${x.pend} 份上傳文件尚未人工核對`);
  const rej=FIELDS.filter(f=>f.doc===1&&/退回/.test(a[f.k]||'')).map(f=>f.l.replace('文件-',''));
  if(rej.length)x.reasons.push('文件退回｜'+rej.join('、')+' 內容不符，需重新繳交');
  const mm=x.missing.filter(m=>!rej.includes(m));if(mm.length)x.reasons.push('文件不全｜缺：'+mm.join('、')+(a.docNote?'（'+a.docNote+'）':''));
  if(x.welfare&&/未附|無須|退回/.test(a.d_wel||'')){x.welfare=false;x.p1=false;x.notes.push(/退回/.test(a.d_wel||'')?'福利身分證明退回｜證明經退回，暫不列入優先條件':'福利身分未附證明｜不列入優先條件')}
  if(x.disab&&/未附|無須|退回/.test(a.d_dis||'')){x.disab=false;x.notes.push(/退回/.test(a.d_dis||'')?'身心障礙證明退回｜證明經退回，暫不列入優先條件':'身心障礙證明未附｜不列入優先條件')}
  if(a.override==='評審排除')x.reasons.push('評審排除｜'+(a.overNote||'評審會議決議'));
  x.hold=x.reasons.length>0&&x.reasons.every(r=>/^文件(不全|退回)/.test(r));
  if(x.score<smin&&x.rank<=rp&&!x.reasons.length)x.notes.push(`班排補足｜成績未達 ${smin}，以班排或系排前 ${x.rank}% 符合`);
  return x;
 });
 // 同一家庭：加註標籤；大學部同一家庭限一人正取（排名較前者優先）
 const fams={};R.forEach(x=>{const f=famK(x);if(f)(fams[f]=fams[f]||[]).push(x)});
 Object.values(fams).filter(g=>g.length>1).forEach(g=>g.forEach(x=>x.notes.push('同家庭｜與 '+g.filter(y=>y!==x).map(y=>(y.a.id?y.a.id+' ':'')+y.a.name).join('、')+' 同一家庭')));
 {const gs={};R.forEach(x=>{const k=String(x.a.famGuess||'').trim();if(k)(gs[k]=gs[k]||[]).push(x)});Object.values(gs).filter(g=>g.length>1).forEach(g=>g.forEach(x=>{if(g.every(y=>famK(y)&&famK(y)===famK(x)))return;x.notes.push('疑似同家庭｜與 '+g.filter(y=>y!==x).map(y=>(y.a.id?y.a.id+' ':'')+y.a.name).join('、')+' 家長姓名相同，請委員確認；確認為同家庭請在「家戶代號」填相同代號')}))}
 const pastSup=S.supDeadline&&Date.now()>new Date(S.supDeadline+'T23:59:59+08:00').getTime();
 const key=x=>[x.p1?1:0,x.welfare?1:0,x.disab?1:0,x.noHouse?1:0,-x.house,x.grade,x.score];
 const cmp=(p,q)=>{const a=key(p),b=key(q);for(let i=0;i<a.length;i++)if(a[i]!==b[i])return b[i]-a[i];return 0};
 const out={};
 const NQ={U:Math.max(0,parseInt(S.quotaU)||0),G:Math.max(0,parseInt(S.quotaG)||0)},NT=NQ.U+NQ.G,AT=Math.ceil(NT*ratio()-1e-9);
 const AQ={U:Math.floor(NT?AT*NQ.U/NT:0),G:Math.floor(NT?AT*NQ.G/NT:0)};
 if(AQ.U+AQ.G<AT){const fr=L=>NT?AT*NQ[L]/NT-AQ[L]:0;const L1=fr('G')>fr('U')?'G':'U';AQ[L1]=Math.min(NQ[L1],AQ[L1]+AT-AQ.U-AQ.G)}
 for(const L of['U','G']){
  const N=NQ[L];
  let el=R.filter(x=>x.L===L&&!x.reasons.length).sort(cmp);
  el.forEach((x,k)=>x.rk=k+1);
  const aMin=Math.min(N,AQ[L]),bMax=Math.max(0,N-aMin);
  let a=0,b=0;const ch=new Set();
  for(const x of el){if(ch.size>=N)break;if(famBlock(x,ch)){x.famOut=1;continue}if(x.cat==='A'){ch.add(x);a++}else if(b<bMax){ch.add(x);b++}else x.notes.push('類別名額已滿｜機械／紡織／工業工程類名額 '+bMax+' 名已滿')}
  let bf=0;
  if(ch.size<N&&S.backfill==='是'){for(const x of el){if(ch.size>=N)break;if(!ch.has(x)&&!famBlock(x,ch)){ch.add(x);bf++;x.notes=x.notes.filter(n=>!n.startsWith('類別'));x.notes.push('名額回流｜電子電機類人數不足，名額回流')}}}

  out[L]={N,aMin,bMax,a:[...ch].filter(x=>x.cat==='A').length,b:[...ch].filter(x=>x.cat==='B').length,bf,el,ch};
 }
 // 委員會決定（2026/11/09）：大學部 26／碩博 4 各自計算，電子電機名額不跨學制遞補
 for(const L of['U','G']){const o=out[L];if(!o)continue;let w=0;
  o.el.forEach(x=>{x.notes=x.notes.filter(n=>!/^名額已滿/.test(n));if(o.bf)x.notes=x.notes.filter(n=>!n.startsWith('類別'));
   if(o.ch.has(x)){x.st='ok';x.notes=x.notes.filter(n=>!n.startsWith('類別'))}else if(famBlock(x,o.ch)){x.st='no';const sib=[...o.ch].find(y=>y.L==='U'&&famK(y)===famK(x));x.reasons.push('同家庭限一人｜學士以下同一家庭限一人，'+(sib?(sib.a.id?sib.a.id+' ':'')+sib.a.name:'家人')+' 已列正取')}else{x.st='wait';x.wn=++w;if(!x.notes.some(n=>n.startsWith('類別')))x.notes.push(`名額已滿｜排名第 ${x.rk}，名額 ${o.N} 名已滿`)}});
  R.filter(x=>x.L===L&&x.reasons.length).forEach(x=>{x.st=x.hold?(pastSup?'late':'hold'):'no';if(x.st==='late'&&!x.notes.some(n=>n.startsWith('逾期')))x.notes.push('逾期未補件｜補件期限 '+S.supDeadline+' 已過，請委員會議決定')});
  R.filter(x=>x.L===L&&x.a.override==='評審追加'&&x.st!=='ok').forEach(x=>{x.st='add';x.reasons=x.reasons.filter(r=>!r.startsWith('評審'));x.overrode=x.reasons.slice();x.reasons=[];x.notes.push('評審追加｜'+(x.a.overNote||'評審會議決議追加'));if(x.overrode.length)x.notes.push('原不符原因｜'+x.overrode.map(r=>tagOf(r)+(detOf(r)?'：'+detOf(r):'')).join('；'))});
 }
 for(const L of['U','G']){const o=out[L];if(!o)continue;const sel=x=>o.ch.has(x);o.a=[...o.ch].filter(x=>x.cat==='A').length;o.b=[...o.ch].filter(x=>x.cat==='B').length}
 // 分組：依學制、排名輪流分配
 const G=Math.max(1,+S.groups||1);
 const ord=[...R].sort((p,q)=>(p.L>q.L?-1:p.L<q.L?1:0)||((p.rk||999)-(q.rk||999))||(String(p.a.id).localeCompare(String(q.a.id),'zh-Hant',{numeric:true})));
 ord.forEach((x,k)=>x.grp=(k%G)+1);
 return out;
}

// ===== 畫面 =====
function tab(t){document.querySelectorAll('nav>button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));document.querySelectorAll('main>section').forEach(s=>s.classList.toggle('hidden',s.id!=='t-'+t));window.scrollTo(0,0)}
document.querySelectorAll('nav>button').forEach(b=>b.onclick=()=>tab(b.dataset.t));

function chips(x){let h='';if(x.p1)h+='<span class="chip p1">續領＋福利身分</span>';else if(x.welfare)h+=`<span class="chip p2">${esc(x.a.welfare)}</span>`;if(x.disab)h+=`<span class="chip p3">身心障礙／重大傷病（${esc(x.a.disab)}）</span>`;if(x.noHouse)h+='<span class="chip p4">無房產</span>';return h||'<span class="muted">—</span>'}
const TAGTIP={'原不符原因':'評審追加前，系統判定的不符原因','所得超標':'申請人＋父母年所得合計超過上限','成績未達':'前學期成績未達門檻，且班排不在範圍內','操行未達':'操行未達乙等','科系不符':'非電子電機、機械、工業工程、紡織材料相關','非日間部':'限日間部學生','非本國籍':'限本國籍','懲處紀錄':'曾因故意行為受懲處','公費生':'已享公費待遇者不得申請','他項獎學金超額':'已獲其他獎學金達上限','文件不全':'文件不全視為無效','同家庭':'與其他申請人為同一家庭，供委員參考','同家庭限一人':'學士以下同一家庭限一人，由排名較前者正取','評審排除':'評審會議決議','文件退回':'上傳文件經核對內容不符'};
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
 $('#ruleList').innerHTML=`<li>本國籍、日間部學生（不含進修部、夜間部、推廣教育、空大）</li><li>科系：電子、電機相關（至少 ${esc(S.aRatio)} 名額）；紡織材料、機械、工業工程（其餘名額）</li><li>未享公費，其他獎學金每學期未達 ${wan(num(S.otherMax))}</li><li>申請人＋父母年所得合計 ${wan(num(S.incomeLimit))} 以下（單親：申請人＋扶養家長）</li><li>前學期成績 ${S.scoreMin} 分以上，或班級／系排名前 ${S.rankPct}%${+S.conductMin>0?`；操行 ${S.conductMin} 分以上`:''}</li><li>未曾因故意行為遭記「${esc(String(S.penalty).replace('以上',''))}」以上懲處</li><li>必要文件齊全：學生證、成績單、獎懲紀錄、戶籍謄本、財產清單、所得清單、推薦函。不全視為無效</li><li>勾選福利身分或身心障礙／重大傷病者，須附證明才列入優先條件</li><li>學士以下同一家庭限一人：兄弟姊妹同時申請時，由排名較前者正取，其餘列為不符（「同家庭限一人」），委員會可評審追加</li><li>資訊工程（資工）系不列入電子電機類</li>`;
 renderData();renderResult(O);renderGroups();renderDocs();
}

function renderData(){
 const q=$('#q').value.trim();
 const rows=R.filter(x=>!q||[x.a.id,x.a.name,x.a.dept].join(' ').includes(q));
 $('#cnt').textContent=APPS.length;const qi=$('#qInfo');if(qi){qi.classList.toggle('hidden',!q);qi.textContent=q?`搜尋「${q}」：找到 ${rows.length} 位`:''}
 $('#dataTable').innerHTML=`<tr><th>編號</th><th>姓名</th><th>學制</th><th>系所</th><th>年級</th><th>家戶所得</th><th>成績</th><th>班排</th><th>優先條件</th><th>初篩</th><th class="noprint"></th></tr>`+
  (rows.length?rows.map(x=>`<tr><td>${esc(x.a.id)}</td><td><b>${esc(x.a.name)}</b></td><td>${esc(x.a.level)}</td><td>${esc(x.a.dept)}</td><td>${x.grade||''}</td><td>${wan(x.house)}</td><td>${esc(x.a.score)}</td><td>${x.rank<100?x.rank+'%':''}</td><td>${chips(x)}</td><td>${stTag(x)}<div>${x.reasons.map(r=>`<span class="rtag bad">✕ ${esc(tagOf(r))}</span>`).join('')}</div></td><td class="noprint"><button class="btn sm" onclick="openFiles(${x.i},'*')">看文件</button> <button class="btn sm" onclick="openEdit(${x.i})">編輯</button></td></tr>`).join('')
  :`<tr><td colspan="11" class="muted" style="text-align:center;padding:40px">${q&&R.length?'沒有符合搜尋條件的申請人，請改用其他關鍵字':CLOUD?'目前還沒有申請人':'尚無資料，請匯入 Excel 或載入示範資料'}</td></tr>`);
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
  <div class="tablewrap"><table class="stickyact"><tr><th>排名</th><th>結果</th><th>編號</th><th>姓名</th><th>系所</th><th>年級</th><th class="num">家戶所得</th><th class="num">成績</th><th>優先條件</th><th>原因／備註</th><th>審查組</th><th class="noprint"></th></tr>
  ${list.map(x=>`<tr><td>${x.rk||'—'}</td><td>${stTag(x)}</td><td>${esc(x.a.id)}</td><td><b>${esc(x.a.name)}</b></td><td>${esc(x.a.dept)}</td><td>${x.grade||''}</td><td class="num">${wan(x.house)}</td><td class="num">${esc(x.a.score)}</td><td>${chips(x)}</td><td class="wrap">${rTags(x)}${x.a.memo?`<div class="note">自述：${esc(x.a.memo)}</div>`:''}</td><td>第 ${x.grp} 組</td><td class="noprint"><button class="btn sm" onclick="openEdit(${x.i})">複核</button></td></tr>`).join('')}
  ${list.length?'':'<tr><td colspan="12" class="muted" style="text-align:center;padding:24px">沒有符合篩選條件的申請人</td></tr>'}
  </table></div></div>`;
 }
 const fdesc=[fl!=='all'?($('#fLevel').selectedOptions[0]||{}).textContent:'',fs!=='all'?($('#fStatus').selectedOptions[0]||{}).textContent:'',TF?'原因：'+TF:'',$('#fq').value.trim()?'搜尋：'+$('#fq').value.trim():''].filter(Boolean);
 $('#resultBox').innerHTML=provHtml()+(fdesc.length?`<div class="onlyprint" style="font-size:16px;margin-bottom:8px"><b>本頁為篩選後名單</b>：${esc(fdesc.join('、'))}</div>`:'')+(h||'<div class="card muted">尚無資料</div>');
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
const DSHORT={d_id:'學生證',d_tr:'成績單',d_merit:'獎懲紀錄',d_hh:'戶籍謄本',d_prop:'財產清單',d_inc:'所得清單',d_rec:'推薦函',d_wel:'福利證明',d_dis:'身障證明',d_unemp:'失業證明'};
function cellClick(i,k){if((FIDX[fkey(APPS[i],k)]||[]).length||CLOUD)openFiles(i,k);else toggleDoc(i,k)}
async function markDoc(v){const{i,k}=FCUR;const a=APPS[i];
 if(CLOUD){const{data:rv,error}=await SBC.rpc('review_patch',{p_id:a._cid,p_patch:{docs:{[k]:v}}});if(error){alert('儲存失敗：'+error.message);return}a._review=rv;if(CAPPS_RAW[a._cid])CAPPS_RAW[a._cid].review=rv}
 a[k]=v;fdlg.close();render()}
function renderDocs(){
 const fs=DOCF(),show=$('#dShow').value;
 const rows=R.filter(x=>show==='all'||(show==='auto'?FALL.some(r=>r.by==='auto'&&r.k.startsWith(fkey(x.a,''))):show==='pend'?x.pend:((x.missing||[]).length||x.reasons.some(r=>/^文件/.test(r))||fs.some(f=>f.doc===2&&docState(x,f)==='no'))));
 $('#docTable').innerHTML=`<tr><th style="text-align:left">編號</th><th style="text-align:left">姓名</th>${fs.map(f=>`<th title="${esc(f.l.replace('文件-',''))}">${DSHORT[f.k]}${f.doc===1?'':'<span style="font-weight:400">*</span>'}</th>`).join('')}<th style="text-align:left">結果</th></tr>`+
 (rows.length?rows.map(x=>`<tr><td>${esc(x.a.id)}</td><td><b>${esc(x.a.name)}</b>${x.prev?'<div class="note">續領</div>':''}${CLOUD&&show!=='all'?`<div class="contact">${esc(x.a.phone||'')}<br>${esc(x.a.email||'')}</div>`:''}</td>${fs.map(f=>{const st=docState(x,f),n=(FIDX[fkey(x.a,f.k)]||[]).length;return`<td class="c"><span class="dk ${st}" role="button" tabindex="0" title="${esc(DOCNAME(f.k))}：${{ok:'已繳',no:'缺件或退回',pend:'待核對',na:'免附'}[st]}${n?'，'+n+' 個檔案':''}" onclick="cellClick(${x.i},'${f.k}')" onkeydown="if(event.key==='Enter')cellClick(${x.i},'${f.k}')">${st==='ok'?'✓':st==='no'?'✕':st==='pend'?'?':'—'}${n?`<small>${n}</small>`:''}</span></td>`}).join('')}<td style="white-space:normal;min-width:200px">${x.reasons.some(r=>/^文件/.test(r))?x.reasons.filter(r=>/^文件/.test(r)).map(r=>`<div><span class="rtag bad">✕ ${esc(tagOf(r))}</span></div>`).join('')+badNotes(x):x.pend?'':'<span class="rtag ok">✓ 必要文件齊全</span>'}${x.pend?`<div><span class="rtag wait">待核對 ${x.pend} 份</span></div>`:''}${fs.filter(f=>f.need&&docState(x,f)==='no').map(f=>`<div><span class="rtag wait">${f.need==='welfare'?'福利身分':'身心障礙證明'}缺證明，不列優先</span></div>`).join('')}</td></tr>`).join('')
 :`<tr><td colspan="${fs.length+3}" class="muted" style="text-align:center;padding:30px">${APPS.length?'沒有缺件的申請人':'尚無資料'}</td></tr>`);
}
// ===== 文件電子檔（IndexedDB，只存本機）=====
let DB=null,FIDX={};
function idb(){return new Promise((ok,no)=>{try{const r=indexedDB.open('sch_files',1);r.onupgradeneeded=()=>r.result.createObjectStore('f',{keyPath:'id',autoIncrement:true}).createIndex('k','k');r.onsuccess=()=>{DB=r.result;ok(DB)};r.onerror=()=>no(r.error)}catch(e){no(e)}})}
const fkey=(a,dk)=>(String(a.id||a.name).trim())+'|'+dk;
let FALL=[];
async function loadIdx(){try{await idb();const all=await new Promise(ok=>{const q=DB.transaction('f').objectStore('f').getAll();q.onsuccess=()=>ok(q.result);q.onerror=()=>ok([])});FALL=all.map(({blob,...r})=>r);FIDX={};FALL.forEach(r=>(FIDX[r.k]=FIDX[r.k]||[]).push(r))}catch(e){FIDX={};FALL=[]}
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
const DOCKW=[['d_prop',/財產|歸戶|房產/],['d_unemp',/失業/],['d_dis',/身障|身心|手冊|重大傷病|傷病卡/],['d_wel',/低收|中低|特殊境遇|福利/],['d_inc',/所得|綜所|扣繳|稅/],['d_rec',/推薦/],['d_merit',/獎懲/],['d_tr',/成績/],['d_hh',/戶籍|謄本|戶口/],['d_id',/學生證|在學|註冊/]];
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
 $('#fmsg').innerHTML=`<div class="alert" style="background:var(--okbg);color:var(--ok)">✓ 已歸檔 ${ok} 個檔案，目前標為「待核對」。請按上方「開始核對上傳文件」確認內容。</div>`+(bad.length?`<div class="alert">以下 ${bad.length} 個檔案無法自動歸檔，請改檔名後再傳，或在表格中按「＋」手動上傳：<br>${bad.map(esc).join('<br>')}</div>`:'');
}
async function fAct(btn,fn){if(btn.disabled)return;const sib=[...(btn.parentElement?btn.parentElement.querySelectorAll('button'):[btn])];sib.forEach(b=>b.disabled=true);try{await fn()}finally{try{listFiles()}catch(e){}render()}}
function toast(t){let el=document.getElementById('toast');if(!el){el=document.createElement('div');el.id='toast';el.setAttribute('role','status');el.style.cssText='position:fixed;left:50%;top:18px;transform:translateX(-50%);background:#1e3020;color:#fff;padding:12px 22px;border-radius:12px;font-size:18px;font-weight:700;z-index:2147483646;box-shadow:0 8px 24px rgba(0,0,0,.25)';document.body.appendChild(el)}el.textContent='✓ '+t;el.style.display='block';clearTimeout(el._t);el._t=setTimeout(()=>el.style.display='none',2500)}
let FCUR=null;const fdlg=$('#fdlg');
function openFiles(i,k){FCUR={i,k};const f=FIELDS.find(f=>f.k===k);$('#fdlgTitle').textContent=k==='*'?`${APPS[i].id||''} ${APPS[i].name}｜全部文件`:`${APPS[i].name}｜${f.l.replace('文件-','')}`;$('#fdlgUp').classList.toggle('hidden',k==='*');listFiles();fdlg.showModal()}
function listFiles(){const who=fkey(APPS[FCUR.i],'');const L=FCUR.k==='*'?FALL.filter(r=>r.k.startsWith(who)):FIDX[fkey(APPS[FCUR.i],FCUR.k)]||[];
 $('#fdlgList').innerHTML=L.length?L.map(r=>`<div style="flex-wrap:wrap"><span>${FCUR.k==='*'?`<b>${esc(DOCNAME(r.k.split('|')[1]))}</b><br>`:''}${esc(r.name)} ${stBadge(r)}${r.lockBy?`<span class="rtag wait">${esc(r.lockBy)} 核對中</span>`:''}${(r.flags||[]).map(f=>`<div class="reason" style="border:0;padding:2px 0">⚠ ${esc(f)}</div>`).join('')}${r.summary?`<div class="note" style="border:0;padding:2px 0">初步檢查：${esc(r.summary)}</div>`:''}${r.note&&r.st==='bad'?`<div class="note" style="border:0;padding:2px 0">退回原因：${esc(r.note)}</div>`:''}</span><button class="btn sm" onclick="viewFile('${r.id}')">開啟</button><button class="btn sm" onclick="fAct(this,()=>setSt('${r.id}','ok'))">✓ 符合</button><button class="btn sm danger" onclick="fAct(this,()=>rejectFile('${r.id}'))">✕ 退回</button><button class="btn sm danger adminonly" onclick="rmFile('${r.id}')">刪除</button></div>`).join(''):(FCUR.k==='*'?'<p class="muted">此申請人尚未上傳任何檔案。</p>':`<p class="muted">此項文件無上傳檔案。</p><p class="note">紙本繳交者，可直接標記：</p><div class="row"><button class="btn" onclick="markDoc('已附')">標為已繳（紙本）</button><button class="btn" onclick="markDoc('${(FIELDS.find(f=>f.k===FCUR.k)||{}).doc===3?'無須':'未附'}')">標為${(FIELDS.find(f=>f.k===FCUR.k)||{}).doc===3?'免附':'未繳'}</button></div>`)}
function stBadge(r){const s=r.st||'pend';return s==='ok'?(r.by==='auto'?'<span class="rtag ok">✓ 初步檢查通過</span>':'<span class="rtag ok">✓ 已核對符合</span>'):s==='bad'?'<span class="rtag bad">✕ 已退回</span>':'<span class="rtag wait">? 待核對</span>'}
const BREASONS=['不是這份文件','看不清楚／模糊','缺頁或拍不完整','姓名不是申請人或家人','日期過舊或證明已過期','與申請表填的資料不符','缺少簽名或印章'];
const bdlg=$('#bdlg');
function askReason(hint){return new Promise(ok=>{let done=false;const sel=new Set();
 const pre=(hint||[]).join(' ');
 if(/不是「/.test(pre))sel.add('不是這份文件');if(/不清楚|模糊/.test(pre))sel.add('看不清楚／模糊');if(/不完整|裁切/.test(pre))sel.add('缺頁或拍不完整');if(/姓名/.test(pre))sel.add('姓名不是申請人或家人');if(/超過|過期/.test(pre))sel.add('日期過舊或證明已過期');if(/不同|高於|勾「無/.test(pre))sel.add('與申請表填的資料不符');
 const draw=()=>{$('#bChips').innerHTML=BREASONS.map((r,i)=>`<button type="button" aria-pressed="${sel.has(r)}" class="rtag ${sel.has(r)?'on':''}" data-i="${i}">${sel.has(r)?'✓ ':''}${esc(r)}</button>`).join('')};
 $('#bChips').onclick=e=>{const t=e.target.closest('[data-i]');if(!t)return;const r=BREASONS[+t.dataset.i];sel.has(r)?sel.delete(r):sel.add(r);draw()};
 $('#bNote').value='';const be=$('#bErr');if(be)be.textContent='';draw();
 $('#bOk').onclick=()=>{const txt=[...sel].join('、')+($('#bNote').value.trim()?(sel.size?'。':'')+$('#bNote').value.trim():'');if(!txt){const be=$('#bErr');if(be){be.textContent='請至少點選一個退回原因，或填寫補充說明。';be.scrollIntoView({block:'nearest'})}else alert('請至少選一個原因，或寫補充說明');return}done=true;bdlg.close();ok(txt)};
 bdlg.onclose=()=>{if(!done)ok(null)};
 bdlg.showModal()})}
async function rejectFile(id){const r=FALL.find(x=>String(x.id)===String(id));const n=await askReason(r&&r.flags);if(n===null)return;await setSt(id,'bad',n)}
// 逐一核對
let SPOT=false,RQ=[],RI=0,RURL=null,RS={},RALL={},DIR=1,VZ=1,VR=0,BUSY=false;const rdlg=$('#rdlg');
function startReview(){SPOT=false;RQ=FALL.filter(r=>(r.st||'pend')==='pend').map(r=>r.id);RI=0;RS={};RALL={};DIR=1;if(!RQ.length){alert('目前無待核對文件');return}rdlg.showModal();showReview()}
function stripHtml(){return'<b>進度</b>'+RQ.map((id,i)=>{const v=RS[id];const c=v==='ok'?'ok':v==='bad'?'bad':v==='skip'?'skip':v==='lock'||v==='other'?'lock':'';return`<span role="button" tabindex="0" onkeydown="if(event.key==='Enter')revJump(${i})" class="${c} ${i===RI?'cur':''}" title="${v==='ok'?'符合':v==='bad'?'退回':v==='skip'?'略過':v==='lock'?'其他委員核對中':v==='other'?'其他委員已完成':'未看'}" onclick="revJump(${i})">${v==='ok'?'✓':v==='bad'?'✕':v==='skip'?'…':v==='lock'||v==='other'?'鎖':i+1}</span>`}).join('')+'<span class="lg">✓ 符合　✕ 退回　… 略過　鎖＝其他委員核對中</span>'}
function vz(d){VZ=d===0?1:Math.max(.4,Math.min(4,VZ*(d>0?1.3:1/1.3)));vApply()}
function vr(){VR=(VR+90)%360;vApply()}
function vApply(){const im=$('#rView img');if(!im)return;const box=$('#rView');im.style.maxWidth='none';im.style.transform=`rotate(${VR}deg)`;
 if(VR%180&&im.naturalWidth){const bw=box.clientWidth,ratio=im.naturalWidth/im.naturalHeight,h=bw*VZ,w=h*ratio;im.style.width=w+'px';im.style.margin=`${Math.max(0,(w-h)/2)}px 0 ${Math.max(0,(w-h)/2)}px ${(Math.max(bw,h)-w)/2}px`}
 else{im.style.width=(VZ*100)+'%';im.style.margin='0 auto'}}
async function showReview(){
 if(RI<0)RI=0;
 if(RI>=RQ.length){finishReview();return}
 setLoading(true);
 const id=RQ[RI];const r=await getFile(id);
 if(RURL){URL.revokeObjectURL(RURL);RURL=null}if(!r){RS[id]=RS[id]||'skip';RI+=DIR;return showReview()}
 const[who,dk]=r.k.split('|');const a=APPS.find(a=>String(a.id||a.name).trim()===who)||{};
 const SB=await safeBlob(r.blob);RURL=SB?URL.createObjectURL(SB):null;VZ=1;VR=0;logAccess('view_doc',id,(a.id||'')+' '+DOCNAME(dk));
 const done=Object.values(RALL).length;
 $('#rTitle').textContent=`${SPOT?'抽查':'核對'}文件　第 ${RI+1} 份，共 ${RQ.length} 份（已完成 ${done}）`;
 $('#rStrip').innerHTML=stripHtml();
 const st=SPOT&&!RS[id]&&r.by==='auto'?'':RS[id]==='ok'||r.st==='ok'?'ok':RS[id]==='bad'||r.st==='bad'?'bad':'';
 $('#rInfo').innerHTML=`<div style="font-size:22px;font-weight:700">${esc(who)}　${esc(a.name||'')}</div>${a.dept?`<div class="note">${esc(a.dept)}　${esc(a.level||'')}</div>`:''}<div style="font-size:20px;margin:8px 0 4px">這份應該是：<br><b style="color:var(--pri)">${esc(DOCNAME(dk))}</b></div><div class="note">檔名：${esc(r.name)}</div>
  ${SPOT&&!RS[id]&&r.by==='auto'?'<div class="decided" style="background:var(--info-bg);color:var(--info)">抽查：系統已判定通過，請確認是否正確</div>':''}
  ${st?`<div class="decided" style="background:var(--${st}bg);color:var(--${st})">${st==='ok'?'✓ 已標為「符合」':'✕ 已標為「退回」：'+esc(r.note||'')}　（可重新選擇）</div>`:''}
  ${r.summary?`<div class="alert" style="margin:8px 0;background:#e8f0fa;color:#1d3f8a">初步檢查：${esc(r.summary)}</div>`:''}${(r.flags||[]).map(f=>`<div class="alert" style="margin:6px 0">⚠ ${esc(f)}</div>`).join('')}
  ${(r.summary||(r.flags||[]).length)?'<div class="note">初步檢查僅供參考，以審查人員判斷為準。</div>':''}
  <div class="checklist"><b>請確認：</b><br>① 文件種類是否正確<br>② 姓名是否為申請人或其家屬<br>③ 日期是否在有效期限內<br>④ 姓名、數字、日期是否清晰</div>`;
 const isImg=!!SB&&/image\//.test(SB.type),isPdf=!!SB&&SB.type==='application/pdf';
 $('#vOpen').href=RURL||'#';$('#vOpen').classList.toggle('hidden',!RURL);$('#vTool').querySelectorAll('button').forEach(b=>b.classList.toggle('hidden',!isImg));
 $('#rView').innerHTML=isImg?`<img src="${RURL}" alt="文件" style="width:100%">`:isPdf?(matchMedia('(pointer:coarse)').matches?`<div style="padding:40px 16px;font-size:18px"><p>手機與平板無法在此直接顯示 PDF。</p><a class="btn pri lg" href="${RURL}" target="_blank" rel="noopener">開啟 PDF 查看</a><p class="note">看完請回到這個頁面按「符合」或「退回」。</p></div>`:`<iframe src="${RURL}" title="PDF 文件" style="width:100%;height:100%;border:0"></iframe>`):`<div style="padding:40px 16px;font-size:18px"><p>⚠ 這個檔案不是 PDF 或圖片，為了安全不直接開啟。</p><p>請按「不符，退回」，請申請人改傳 PDF 或照片。</p></div>`;
 setLoading(false);SHOWNAT=Date.now();const t=$('#rTitle');try{t.setAttribute('tabindex','-1');t.focus({preventScroll:true})}catch(e){}const rb=rdlg.querySelector('.rbody');if(rb)rb.scrollTop=0;rdlg.scrollTop=0;const ri=$('#rInfo');if(ri)ri.scrollTop=0}
function setLoading(on){LOADING=on;if(on){$('#rView').innerHTML='<p style="padding:60px;font-size:19px;color:var(--mute)">文件載入中…</p>';$('#rTitle').textContent='載入中…'}['rOk','rBad','rSkip'].forEach(i=>$('#'+i).disabled=on||BUSY);$('#rPrev').disabled=on||BUSY||RI===0}
function finishReview(byUser){
 const va=Object.values(RALL),ok=va.filter(x=>x==='ok').length,bad=va.filter(x=>x==='bad').length,v=Object.values(RS),lock=v.filter(x=>x==='lock').length,other=v.filter(x=>x==='other').length;
 const left=RQ.filter(id=>!RS[id]||RS[id]==='skip');
 if(byUser){
  if(left.length&&!confirm(`本次已核對：符合 ${ok} 份、退回 ${bad} 份。\n還有 ${left.length} 份略過或尚未核對，下次開始核對時將再次列出。\n\n確定結束？`))return;
  rdlg.close();render();return}
 if(left.length&&confirm(`已至最後一份。\n本次核對：符合 ${ok} 份、退回 ${bad} 份。\n\n還有 ${left.length} 份已略過，是否返回核對？`)){RQ=left;RS={};RI=0;DIR=1;showReview();return}
 rdlg.close();render();
 alert((left.length?`本次核對：符合 ${ok} 份、退回 ${bad} 份。\n還有 ${left.length} 份略過，下次開始核對時將再次列出。`:`全部核對完成。\n符合 ${ok} 份、退回 ${bad} 份。\n感謝協助。`)+(lock?`\n\n另有 ${lock} 份由其他委員核對中，已自動略過。`:'')+(other?`\n${other} 份已由其他委員完成核對。`:''));
}
let LOADING=false;
// 長者手抖或按兩下：新文件出現未滿 0.6 秒的點按一律忽略，避免未看就通過下一份（網路較慢時尤其容易發生）
let LASTACT=0,SHOWNAT=0;function guard(first){if(BUSY||LOADING||Date.now()-LASTACT<700)return false;if(first&&Date.now()-SHOWNAT<600)return false;LASTACT=Date.now();BUSY=true;['rOk','rBad','rSkip','rPrev'].forEach(i=>$('#'+i).disabled=true);return true}
function unguard(){BUSY=false;setLoading(LOADING)}
async function revAct(t){if(!guard(true))return;const id=RQ[RI];
 try{
  if(t==='ok'){await setSt(id,'ok')}
  else{const r=FALL.find(x=>String(x.id)===String(id));const n=await askReason(r&&r.flags);if(n===null)return;await setSt(id,'bad',n)}
  if(CONFLICT===id){CONFLICT=null;BUSY=false;await showReview();return}
  const cur=FALL.find(x=>String(x.id)===String(id));if(!cur||cur.st!==(t==='ok'?'ok':'bad'))return;
  RS[id]=t;RALL[id]=t;RI++;DIR=1;BUSY=false;await showReview()
 }finally{unguard()}}
async function revSkip(){if(!guard())return;try{const id=RQ[RI];if(!RS[id])RS[id]='skip';RI++;DIR=1;BUSY=false;await showReview()}finally{unguard()}}
async function revPrev(){if(RI===0||!guard())return;try{RI--;DIR=-1;BUSY=false;await showReview()}finally{unguard()}}
async function revJump(i){if(i===RI||!guard())return;try{DIR=i>RI?1:-1;RI=i;BUSY=false;await showReview()}finally{unguard()}}
async function sniff(blob){try{const b=new Uint8Array(await blob.slice(0,12).arrayBuffer());const h=[...b].map(x=>x.toString(16).padStart(2,'0')).join('');if(h.startsWith('25504446'))return'application/pdf';if(h.startsWith('ffd8ff'))return'image/jpeg';if(h.startsWith('89504e47'))return'image/png';if(h.startsWith('52494646')&&h.slice(16,24)==='57454250')return'image/webp';if(h.startsWith('47494638'))return'image/gif'}catch(e){}return null}
async function safeBlob(blob){const t=await sniff(blob);if(t)return new Blob([blob],{type:t});if(typeof DEMO!=='undefined'&&DEMO){try{if(/^\s*<svg/i.test(await blob.slice(0,300).text()))return new Blob([blob],{type:'image/svg+xml'})}catch(e){}}return null}
async function viewFile(id){let r;try{r=await getFile(id)}catch(e){alert('檔案下載失敗，請確認網路後再試。');return}if(!r){alert('找不到這個檔案，可能已被刪除。');return}
 logAccess('open_file',id,r.name);const sb=await safeBlob(r.blob);if(!sb){alert('這個檔案不是 PDF 或圖片，為了安全不會直接開啟。請改為下載後以防毒軟體檢查，或退回請申請人重新上傳。');return}
 const u=URL.createObjectURL(sb);setTimeout(()=>URL.revokeObjectURL(u),60000);const w=window.open(u,'_blank');if(!w){const a=document.createElement('a');a.href=u;a.download=r.name;a.click()}}
let RMING=false;async function rmFile(id){if(RMING)return;RMING=true;try{await _rmFile(id)}finally{RMING=false}}
async function _rmFile(id){if(!confirm('刪除這個檔案？'))return;let r=null;try{r=await getFile(id)}catch(e){}await delFile(id);await loadIdx();if(r)syncDoc(r.k);listFiles();render()}
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
let editIdx=null,EDINIT={};const dlg=$('#dlg');
let EDDIRTY=false;dlg.addEventListener('input',()=>EDDIRTY=true);dlg.addEventListener('change',()=>EDDIRTY=true);dlg.addEventListener('cancel',e=>{if(EDDIRTY&&!confirm('修改尚未儲存，確定要關閉嗎？'))e.preventDefault()});dlg.addEventListener('close',()=>EDDIRTY=false);
function openEdit(i){
 editIdx=(i===undefined)?null:i;const a=editIdx===null?{}:APPS[editIdx];
 $('#dlgTitle').textContent=editIdx===null?'新增申請人':`申請人：${a.name||''}`;
 $('#delBtn').classList.toggle('hidden',editIdx===null);
 const FF=FIELDS.filter(f=>!(CLOUD&&f.doc));const FO=editIdx===null?FF:[...FF.filter(f=>['override','overNote'].includes(f.k)),...FF.filter(f=>!['override','overNote'].includes(f.k))];
 $('#editForm').innerHTML=(editIdx===null?'':'<h3 style="grid-column:1/-1;margin:0;color:var(--ink)">評審決議</h3>')+FO.map(f=>{const v=a[f.k]??'';
  const inp=f.opt?`<select data-k="${f.k}">${f.opt.map(o=>`<option ${String(v)===o?'selected':''}>${o}</option>`).join('')}</select>`
   :f.area?`<textarea data-k="${f.k}">${esc(v)}</textarea>`:`<input data-k="${f.k}" value="${esc(v)}" ${f.num?'inputmode="decimal"':''}>`;
  return`${f.k==='id'&&editIdx!==null?'<h3 style="grid-column:1/-1;margin:10px 0 0;color:var(--ink)">申請資料</h3>':''}${f.k==='d_id'?'<h3 style="grid-column:1/-1;margin:10px 0 0;color:var(--ink)">文件檢核</h3>':''}${CLOUD&&f.k==='docNote'?'<p class="note" style="grid-column:1/-1;margin:10px 0 0">文件狀態請到「文件核對」點選該格修改（紙本補件可在該格標記「已附」）。</p>':''}<label class="f" data-fk="${f.k}" ${f.area?'style="grid-column:1/-1"':''}>${f.l.replace('文件-','')}${f.hint?`<span style="font-size:16px">（${f.hint}）</span>`:''}${inp}</label>`}).join('');
 const famSel=$('#editForm [data-k="family"]');const famUI=()=>{const one=/單/.test(famSel.value);['fatherName','motherName','incF','incM'].forEach(k=>{const l=$(`#editForm [data-fk="${k}"]`);if(l)l.classList.toggle('hidden',one)});['guardianName','guardianRel','incG'].forEach(k=>{const l=$(`#editForm [data-fk="${k}"]`);if(l)l.classList.toggle('hidden',!one)})};if(famSel){famSel.onchange=famUI;famUI()}
 EDINIT={};document.querySelectorAll('#editForm [data-k]').forEach(el=>EDINIT[el.dataset.k]=el.value.trim());dlg.showModal();
}
function famClean(o){if(/單/.test(o.family||'')){if(!o.incG&&(o.incF||o.incM)){const useF=!!o.incF;o.incG=useF?o.incF:o.incM;if(!o.guardianName)o.guardianName=useF?(o.fatherName||''):(o.motherName||'');if(!o.guardianRel)o.guardianRel=useF?'父親':'母親'}['fatherName','motherName','incF','incM'].forEach(k=>{if(k in o)o[k]=''})}else if(o.family)['guardianName','guardianRel','incG'].forEach(k=>{if(k in o)o[k]=''})}
function needNote(a){if(a.override&&a.override!=='依系統'&&!String(a.overNote||'').trim()){alert('選擇「'+a.override+'」時，請在「決議說明」填寫委員會的決議理由（會留存紀錄）。');const el=document.querySelector('#editForm [data-k=overNote]');if(el)el.focus();return true}return false}
function saveEdit(){const a={};document.querySelectorAll('#editForm [data-k]').forEach(e=>a[e.dataset.k]=e.value.trim());if(!a.name){alert('請填姓名');return}if(needNote(a))return;famClean(a);
 if(editIdx===null)APPS.push(a);else APPS[editIdx]=a;dlg.close();render();toast('已儲存')}
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
  const dec=b=>{try{return new TextDecoder('utf-8',{fatal:true}).decode(b).replace(/^\ufeff/,'')}catch(_){try{return new TextDecoder('big5').decode(b)}catch(__){return new TextDecoder().decode(b)}}};
  try{if(isCsv||typeof XLSX==='undefined'){rows=parseCSV(dec(e.target.result))}
   else{const wb=XLSX.read(e.target.result,{type:'array'});rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:''})}}
  catch(err){alert('檔案讀取失敗，請確認格式');return}
  const hi=rows.findIndex(r=>r.some(c=>String(c).trim()==='姓名'));
  if(hi<0){alert('找不到「姓名」欄，請使用範本格式');return}
  const head=rows[hi].map(h=>String(h).trim());
  const alias=h=>h.replace(/^監護人/,'扶養家長');
  const used=new Set();const map=head.map(h0=>{const h=alias(h0);if(!h||/英文|English/i.test(h))return undefined;
   let f=FIELDS.find(f=>f.l===h&&!used.has(f.k))||FIELDS.find(f=>!used.has(f.k)&&h.startsWith(f.l)&&/^[（(\s]/.test(h.slice(f.l.length)))||FIELDS.find(f=>!used.has(f.k)&&f.l.startsWith(h)&&h.length>=2);
   if(f){used.add(f.k);return f.k}return undefined});
  const unknown=head.filter((h,j)=>h&&!map[j]);
  const raw=rows.slice(hi+1).map(r=>{const a={};map.forEach((k,j)=>{if(k)a[k]=String(r[j]??'').trim()});if(a.phone&&/^9\d{8}$/.test(a.phone))a.phone='0'+a.phone;return a}).filter(a=>Object.values(a).some(v=>v));
  let list=raw.filter(a=>a.name),noName=raw.length-list.length;
  const ex=list.filter(a=>(a.name==='王小明'&&a.id==='U001')||(a.name==='林小華'&&a.id==='G001'));list=list.filter(a=>!ex.includes(a));
  if(!list.length){alert('沒有讀到任何申請人（「姓名」欄是空的'+(ex.length?'，或只有範本的範例資料':'')+'）');return}
  const need=[['incSelf','申請人本人年所得'],['score','前學期學業成績'],['dept','系所'],['level','學制']].filter(([k])=>!used.has(k)).map(x=>x[1]);
  if(!used.has('incF')&&!used.has('incM')&&!used.has('incG'))need.push('父母或扶養家長年所得');
  const seen={},dup=[];list.forEach(a=>{if(!a.id)return;if(seen[a.id])dup.push(a.id);seen[a.id]=1});
  const dupOld=list.filter(a=>a.id&&APPS.some(b=>b.id===a.id)).map(a=>a.id);
  const warn=(need.length?`\n・⚠ 缺少重要欄位：${need.join('、')}。這些欄位會被當成空白或 0，可能造成錯誤的初篩結果`:'')+(noName?`\n・有 ${noName} 列沒有填姓名，已略過`:'')+(ex.length?`\n・已略過範本的範例資料 ${ex.length} 筆（王小明、林小華）`:'')+(dup.length?`\n・檔案內編號重複：${[...new Set(dup)].slice(0,8).join('、')}`:'')+(unknown.length?`\n・無法辨識的欄位（已略過）：${unknown.slice(0,8).join('、')}`:'');
  if(!confirm(`讀到 ${list.length} 位申請人。${warn||'\n・欄位檢查正常'}\n\n要繼續匯入嗎？（取消＝不匯入）`))return;
  let mode='r';if(APPS.length){const rep=confirm(`目前已有 ${APPS.length} 位申請人。${dupOld.length?`\n其中 ${dupOld.length} 位編號與這份檔案相同（例：${dupOld.slice(0,5).join('、')}）。`:''}\n\n・確定：「取代」——刪除現有 ${APPS.length} 位，改用這份檔案\n・取消：「附加」——保留現有資料，加入這份檔案${dupOld.length?'（編號相同者以新檔案為準，不會重複）':''}`);mode=rep?'r':'a'}
  if(mode==='a'){const ids=new Set(list.map(a=>a.id).filter(Boolean));APPS=APPS.filter(b=>!b.id||!ids.has(b.id)).concat(list);render();tab('result');return}
  APPS=mode==='r'?list:APPS.concat(list);render();tab('result');
 };
 rd.readAsArrayBuffer(f);
}
function loadScript(src){return new Promise(ok=>{const t=document.createElement('script');t.src=src;t.onload=ok;t.onerror=ok;document.head.appendChild(t)})}
async function loadXLSX(){if(window.XLSX)return;await loadScript('vendor/xlsx.full.min.js?v=1')}
const safeCell=c=>typeof c==='string'&&/^[=@\t\r]/.test(c)?"'"+c:c;
async function sheetOut(name,aoa,fname){logAccess('export',null,String(fname||(Array.isArray(name)?'名單':name)));await loadXLSX();
 if(typeof XLSX==='undefined'){alert('Excel 元件載入失敗，請確認網路後重新整理頁面再匯出。');return}
 const wb=XLSX.utils.book_new();(Array.isArray(name)?name:[[name,aoa]]).forEach(([n,d])=>{const ws=XLSX.utils.aoa_to_sheet(d.map(r=>r.map(safeCell)));ws['!cols']=d[0].map(()=>({wch:16}));XLSX.utils.book_append_sheet(wb,ws,n)});XLSX.writeFile(wb,fname+'.xlsx')
}
function downloadTemplate(){
 const h=FIELDS.filter(f=>!['override','overNote'].includes(f.k)).map(f=>f.l);
 const E1={id:'U001',name:'王小明',level:'大學部',div:'日間部',dept:'電子工程系',grade:'3',nation:'本國',family:'雙親',incSelf:'120000',incF:'350000',incM:'280000',score:'82',rankPct:'25',conduct:'82',demerit:'無',gov:'否',otherAid:'0',prev:'否',welfare:'中低收入戶',disab:'無',house:'無',fam:'F001',d_id:'已附',d_tr:'已附',d_merit:'已附',d_hh:'已附',d_prop:'已附',d_inc:'已附',d_rec:'未附',d_wel:'已附',d_dis:'無須',d_unemp:'已附',docNote:'推薦函待補',memo:'父親失業，課餘打工負擔家計'};
 const E2={id:'G001',name:'林小華',level:'碩士班',div:'日間部',dept:'電機工程系碩士班',grade:'1',nation:'本國',family:'單親',incSelf:'80000',incG:'300000',score:'88',conduct:'乙',demerit:'無',gov:'否',otherAid:'0',prev:'是',welfare:'低收入戶',disab:'二親等內',house:'無',fam:'F002',d_id:'已附',d_tr:'已附',d_merit:'已附',d_hh:'已附',d_prop:'已附',d_inc:'已附',d_rec:'已附',d_wel:'已附',d_dis:'已附',d_unemp:'無須'};
 const ks=FIELDS.filter(f=>!['override','overNote'].includes(f.k)).map(f=>f.k);const ex=ks.map(k=>E1[k]||''),ex2=ks.map(k=>E2[k]||'');
 const note=[['欄位','填寫方式'],['（文件欄）','填「已附」或「未附」。福利證明、身心障礙證明有該身分才需要附'],...FIELDS.filter(f=>!['override','overNote'].includes(f.k)).map(f=>[f.l,f.opt?'請填：'+f.opt.join(' / '):f.num?'數字（元），可含逗號'+(f.hint?'；'+f.hint:''):(f.hint||'文字')])];
 sheetOut([['申請資料',[h,ex,ex2]],['填寫說明',note]],null,'松樑助學金_申請資料範本');
}
function exportResults(){
 if(!R.length){alert('尚無資料');return}
 const st=x=>({ok:'正取',add:'追加正取',wait:'備取'+(x.wn||''),hold:'待補件',late:'逾期未補件',no:'不符合'}[x.st]);
 const pr=x=>[x.p1?'續領＋福利身分':x.welfare?x.a.welfare:'',x.disab?'身心障礙／重大傷病':'',x.noHouse?'無房產':''].filter(Boolean).join('、');
 const head=['排名','結果','編號','姓名','學制','系所','年級','家戶年所得(元)','成績','班排%','優先條件','不符合標籤','不符合說明','備註','審查組'];
 const row=x=>[x.rk||'',st(x),x.a.id,x.a.name,x.a.level,x.a.dept,x.grade||'',x.house,x.a.score,x.rank<100?x.rank:'',pr(x),x.reasons.map(tagOf).join('、'),x.reasons.map(r=>tagOf(r)+'：'+detOf(r)).join('；'),x.notes.map(r=>tagOf(r)+(detOf(r)?'：'+detOf(r):'')).join('；'),x.grp];
 const order={ok:0,add:1,wait:2,hold:3,late:3.5,no:4};
 const part=L=>[head,...R.filter(x=>x.L===L).sort((p,q)=>order[p.st]-order[q.st]||((p.rk||999)-(q.rk||999))).map(row)];
 const sheets=[['大學部',part('U')],['碩博士班',part('G')],['不符合資格',[head,...R.filter(x=>x.st==='no').map(row)]]];
 for(let g=1;g<=(+S.groups||1);g++)sheets.push([`第${g}組`,[['編號','姓名','學制','系所','系統初篩（原因）','優先條件','評審意見'],...R.filter(x=>x.grp===g).map(x=>[x.a.id,x.a.name,x.a.level,x.a.dept,st(x)+(x.reasons.length?'（'+x.reasons.map(tagOf).join('、')+'）':''),pr(x),''])]]);
 sheetOut(sheets,null,'松樑助學金_初篩結果_機密_'+today()+(provCount().docs||provCount().hold||provCount().late?'_暫定':''));
}
async function clearAll(){if(confirm('確定清空全部申請資料與已上傳的文件電子檔？此動作無法復原。')){APPS=[];try{await idb();await new Promise(ok=>{const t=DB.transaction('f','readwrite');t.objectStore('f').clear();t.oncomplete=ok})}catch(e){}FIDX={};FALL=[];await loadIdx();render()}}

// ===== 設定 =====
const SET=[['deadline','本年度申請截止日（逾期不受理新申請）','date'],['supDeadline','本年度補件期限（逾期不受理補件；逾期者集中列出供委員會議決定）','date'],['spotPct','抽查比例 %（系統通過文件之抽查比例，例：10）'],['announce','預計公告結果時間（例：12 月中旬）'],['contact','承辦聯絡方式（顯示於學生申請頁，例：王小姐 02-1234-5678）'],['org','單位名稱（顯示在標題下方）'],['quotaU','大學部名額'],['quotaG','碩博士班名額'],['incomeLimit','家戶年所得上限（元，申請人＋父母合計；單親為申請人＋扶養家長）'],['scoreMin','學業成績門檻（分）'],['rankPct','成績未達時，班排前幾 %'],['aRatio','電子電機類最低比例（如 2/3）'],['groups','評審分組數'],['conductMin','操行成績門檻（分；2026 年版辦法已取消，留空即不檢查）'],['otherMax','其他獎學金每學期上限（元，達此金額即不符）'],['penalty','懲處排除門檻（達此等級以上即不符資格）',['警告','小過','大過以上']],['kwA','電子電機類 系所關鍵字（逗號分隔）'],['kwB','紡織材料／機械／工業工程類 關鍵字'],['kwX','不列入的系所關鍵字（例：資訊工程,資工,電子商務）'],['backfill','電子電機不足時，名額回流其他類',['是','否']]];
function renderSettings(){
 const G1=['deadline','supDeadline','announce','contact','spotPct'],G3=['kwA','kwB','kwX','aRatio','backfill'];
 const one=([k,l,t])=>{const m=String(l).match(/^([^（]+)（(.+)）$/);const lab=m?m[1]:l,hint=m?m[2]:'';return`<label class="f" ${k.startsWith('kw')||k==='contact'?'style="grid-column:1/-1"':''}>${esc(lab)}${hint?`<span class="hint">${esc(hint)}</span>`:''}${Array.isArray(t)?`<select data-s="${k}">${t.map(o=>`<option ${String(S[k])===o?'selected':''}>${o}</option>`).join('')}</select>`:`<input data-s="${k}" ${t==='date'?'type="date"':''} value="${esc(S[k]??'')}">`}</label>`};
 $('#setForm1').innerHTML=SET.filter(r=>G1.includes(r[0])).map(one).join('');
 $('#setForm3').innerHTML=SET.filter(r=>G3.includes(r[0])).map(one).join('');
 $('#setForm').innerHTML=SET.filter(r=>!G1.includes(r[0])&&!G3.includes(r[0])).map(one).join('');
 $('#setDirty').classList.add('hidden');
 document.querySelectorAll('[data-s]').forEach(e=>e.oninput=e.onchange=()=>$('#setDirty').classList.remove('hidden'))}
function readSettings(){const T={};document.querySelectorAll('[data-s]').forEach(e=>T[e.dataset.s]=half(e.value).trim());
 const bad=[],int=(k,lab,min)=>{const v=T[k];if(v===undefined)return;if(!/^\d+$/.test(v)||+v<min)bad.push(`${lab}：請填 ${min} 以上的整數`)};
 int('quotaU','大學部名額',0);int('quotaG','碩博士班名額',0);int('groups','評審分組數',1);
 if(+T.quotaU>500||+T.quotaG>500)bad.push('名額：每一學制最多 500 名');if(+T.groups>30)bad.push('評審分組數：最多 30 組');
 ['kwA','kwB'].forEach(k=>{if(T[k]&&!T[k].split(/[,，、]/).some(x=>x.trim().length>=2))bad.push(({kwA:'電子電機類系所關鍵字',kwB:'機械／紡織／工業工程類關鍵字'})[k]+'：至少要有一個 2 字以上的關鍵字，以逗號分隔')});
 ['aRatio','scoreMin','rankPct','kwA','kwB'].forEach(k=>{if(T[k]!==undefined&&T[k]==='')bad.push(({aRatio:'電子電機類最低比例',scoreMin:'學業成績門檻',rankPct:'班排百分比',kwA:'電子電機類系所關鍵字',kwB:'機械／紡織／工業工程類關鍵字'})[k]+'：不可空白')});
 if(T.quotaU!==undefined&&T.quotaG!==undefined&&+T.quotaU+ +T.quotaG<1)bad.push('名額：大學部與碩博士班合計至少 1 名');
 const money=(k,lab)=>{const v=T[k];if(v===undefined)return;const n=parseMoney(v);if(!v||!isFinite(n)||!(n>0))bad.push(`${lab}：請填大於 0 的金額，例如 1000000 或 100萬`)};
 money('incomeLimit','家戶年所得上限');money('otherMax','其他獎學金每學期上限');
 const pct=(k,lab,mn,mx)=>{const v=T[k];if(v===undefined||v==='')return;if(isNaN(+v)||+v<mn||+v>mx)bad.push(`${lab}：請填 ${mn}～${mx} 的數字`)};
 pct('scoreMin','學業成績門檻',0,100);pct('rankPct','班排百分比',1,100);pct('spotPct','抽查比例',0,100);pct('conductMin','操行成績門檻',0,100);
 if(T.aRatio){const raw=String(T.aRatio).trim(),isP=/%$/.test(raw),r=raw.replace(/%$/,'');const v=/^\d+\s*\/\s*\d+$/.test(r)?(([a,b])=>b?a/b:NaN)(r.split('/').map(Number)):(/^\d+(\.\d+)?$/.test(r)?(isP?+r/100:(+r>1?+r/100:+r)):NaN);if(v>0&&v<0.3)bad.push('電子電機類最低比例：'+raw+' 太低，辦法規定為三分之二（2/3）');if(!(v>=0&&v<=1))bad.push('電子電機類最低比例：請填 2/3、67% 或 0.67 這類寫法（三種寫法都代表三分之二）')}
 if(T.deadline&&T.supDeadline&&T.supDeadline<T.deadline)bad.push('補件期限不能早於申請截止日');
 if(bad.length){alert('設定有誤，尚未儲存：\n\n・'+bad.join('\n・'));return null}
 if(T.deadline!==undefined&&!T.deadline&&!confirm('尚未設定申請截止日，學生將可一直送出申請。確定要儲存嗎？'))return null;
 if(T.supDeadline&&new Date(T.supDeadline+'T23:59:59+08:00')<new Date()&&!confirm('補件期限 '+T.supDeadline+' 已經過了，儲存後所有待補件者會立即變成「逾期未補件」。確定要儲存嗎？'))return null;
 if(T.quotaU!==undefined&&T.quotaG!==undefined&&+T.quotaU+ +T.quotaG!==30&&!confirm(`名額合計 ${+T.quotaU+ +T.quotaG} 名，辦法規定每學期 30 名為原則。確定要儲存嗎？`))return null;
 return T}
function saveSettings(){const T=readSettings();if(!T)return;Object.assign(S,T);render();$('#setDirty').classList.add('hidden');alert('已儲存，結果已重新計算')}
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
  const a={id:(U?'U':'G')+String(U?i+1:i-54).padStart(3,'0'),name:pick(sur)+pick(gn),level:U?'大學部':(r()<.9?'碩士班':'博士班'),div:r()<.03?'進修部':'日間部',conduct:String(Math.round(72+r()*20)),gov:'否',otherAid:r()<.05?'50000':'0',d_id:'已附',d_tr:r()<.03?'未附':'已附',d_merit:r()<.03?'未附':'已附',d_hh:'已附',d_prop:r()<.04?'未附':'已附',d_inc:'已附',d_rec:r()<.05?'未附':'已附',d_wel:'已附',d_dis:r()<.25?'未附':'已附',d_unemp:'無須',docNote:'',dept:pick(U?dU:dG),
   grade:String(U?1+Math.floor(r()*4):1+Math.floor(r()*2)),nation:r()<.04?'外籍':'本國',family:single?'單親':'雙親',
   incSelf:String(Math.round(r()*180)*1000),incF:single?'':String(Math.round(r()*560)*1000),incM:single?'':String(Math.round(r()*420)*1000),
   incG:single?String(Math.round(r()*500)*1000):'',score:String(Math.round(62+r()*33)),rankPct:String(Math.round(5+r()*80)),
   demerit:r()<.04?pick(['警告','小過','大過以上']):'無',prev:r()<.25?'是':'否',welfare:r()<.35?pick(['低收入戶','中低收入戶','中低收入戶','特殊境遇家庭']):'無',
   disab:r()<.18?pick(['本人','二親等內','二親等內']):'無',house:r()<.6?'無':'有',fam:'F'+String(i+1).padStart(3,'0'),memo:'',override:'依系統',overNote:''};
  L.push(a)}
 L[12].fam=L[13].fam;L[30].fam=L[31].fam; // 兄弟姊妹示範
 L[5].memo='父親重病無法工作，母親兼兩份工';L[20].memo='導師推薦：課業積極、擔任班代';
 APPS=L;render();tab('result');
}

// ===== 雲端模式（審查人員登入後，讀寫雲端申請資料與文件）=====
const CFG=window.SB_CONFIG||{};
let RVN={},LOCKED=null,ISADMIN=false;
let SBC=null,CLOUD=false,CAPPS=[],CDOCS=[],CUSER='',LOCAL_BAK=null,BLOBS={},BORD=[];
const tfetch=(u,o={})=>{const ac=new AbortController();const t=setTimeout(()=>ac.abort(),/storage\/v1\/object/.test(String(u))?120000:30000);if(o.signal)o.signal.addEventListener('abort',()=>ac.abort());return fetch(u,{...o,signal:ac.signal}).catch(e=>{if(e.name==='AbortError')throw new Error('網路太慢，請檢查連線後再試一次');throw new Error('網路連線失敗，請檢查連線後再試一次')}).finally(()=>clearTimeout(t))};
try{if(CFG.key&&!/^__/.test(CFG.key)&&window.supabase)SBC=window.supabase.createClient(CFG.url,CFG.key,{global:{fetch:tfetch}})}catch(e){}
// 寫入後沒有任何資料被更新，多半是登入過期或已被移出審查名單
async function wrote(res,what){if(res.error){alert(what+'失敗：'+res.error.message);return false}if(Array.isArray(res.data)&&!res.data.length){let ok=false;try{const{data}=await SBC.auth.getSession();ok=!!(data&&data.session)}catch(e){}if(!ok){await sessionLost();return false}alert(what+'沒有完成：資料可能已被刪除或修改，或您沒有這項權限（刪除與設定限管理者）。畫面將重新整理。');try{await cloudLoad()}catch(e){}return false}return true}
let LOST=false;async function sessionLost(){if(LOST)return;LOST=true;alert('登入已逾時，或此帳號已不在審查人員名單內。\n本次變更未儲存，請重新登入後再操作。');try{await SBC.auth.signOut()}catch(e){}scrollTo(0,0);location.reload()}
const DOCKEYS=['d_id','d_tr','d_merit','d_hh','d_prop','d_inc','d_rec','d_wel','d_dis','d_unemp'];
const nid=id=>typeof id==='string'&&/^\d+$/.test(id)?+id:id;
const _load=load,_save=save,_loadIdx=loadIdx,_getFile=getFile,_setSt=setSt,_delFile=delFile,_putFile=putFile,_syncDoc=syncDoc,_toggleDoc=toggleDoc,_saveEdit=saveEdit,_saveSettings=saveSettings,_clearAll=clearAll,_loadDemo=loadDemo,_allDocs=allDocs;
save=function(){if(!CLOUD)_save()};
getFile=async function(id){
 if(!CLOUD)return _getFile(nid(id));
 const d=CDOCS.find(x=>x.id===id);if(!d)return null;
 if(!BLOBS[id]){let res;try{res=await SBC.storage.from('docs').download(d.path)}catch(e){throw new Error('NET')}const{data,error}=res;if(error&&/not.?found|404|Object not found/i.test(String(error.message||error.statusCode||'')))return null;if(error||!data)throw new Error('NET');BLOBS[id]=data;BORD.push(id);while(BORD.length>25){const o=BORD.shift();if(o!==id)delete BLOBS[o]}}
 const r=FALL.find(x=>x.id===id)||{};return{...r,blob:BLOBS[id]};
};
function cRec(d){const a=CAPPS.find(x=>x._cid===d.applicant_id);const ai=d.ai||{};
 const stuck=(d.ai_status==='pending'||d.ai_status==='running')&&Date.now()-Date.parse(d.created_at)>5*60e3;
 const flags=stuck?['初步檢查未完成，請人工核對']:d.ai_status==='pending'||d.ai_status==='running'?['系統初步檢查中，請稍後重新整理']:(ai.issues||[]).map(x=>/金鑰/.test(String(x))?'系統初步檢查暫停，請人工核對':x);
 const lk=d.locked_by&&d.locked_by!==CUSER.toLowerCase()&&d.locked_at&&Date.now()-Date.parse(d.locked_at)<6e5?(RVN[d.locked_by]||d.locked_by):'';
 return{lockBy:lk,id:d.id,k:(a?a.id:'?')+'|'+d.doc_type,name:d.file_name||d.path.split('/').pop(),type:d.mime||'',size:d.size,h:d.sha256,flags,summary:ai.summary||'',st:d.review_status||'pend',note:d.review_note||'',by:d.reviewed_by||''}}
loadIdx=async function(){
 if(!CLOUD)return _loadIdx();
 FALL=CDOCS.map(cRec);FIDX={};FALL.forEach(r=>(FIDX[r.k]=FIDX[r.k]||[]).push(r));
 const pn=document.getElementById('pendN');const np=FALL.filter(r=>r.st==='pend').length;if(pn)pn.textContent=np;const nb=document.getElementById('navPend');if(nb){nb.textContent=np;nb.classList.toggle('hidden',!np)}};
let DIDX=null;function docIdx(){const m=new Map();for(const d of CDOCS){const k=d.applicant_id+'|'+d.doc_type;let L=m.get(k);if(!L)m.set(k,L=[]);L.push(d)}return m}
const DOCFS=()=>FIELDS.filter(f=>f.doc);
function mapDocs(a,idx){idx=idx||DIDX||(DIDX=docIdx());
 for(const f of DOCFS()){
  const L=idx.get(a._cid+'|'+f.k)||[];
  if(L.length){a[f.k]=L.some(d=>d.review_status==='ok')?'已附':L.some(d=>d.review_status==='pend')?'待核對':'退回';continue}
  const m=(a._review.docs||{})[f.k];
  a[f.k]=m||(f.doc===3?'無須':'未附');
 }}
function mapApp(r){const f=r.form||{};
 const rv=r.review||{};const a={...f,id:r.app_no,_cid:r.id,_review:rv,_at:r.created_at,override:rv.override||'依系統',overNote:rv.overNote||''};if(rv.fam)a.fam=rv.fam;
 if(!a.fam){const ad=normAddr(f.addr);if(ad)a.fam=ad;const k=[f.fatherName,f.motherName,f.guardianName].filter(Boolean).join('/');if(k)a.famGuess=k}
 mapDocs(a);return a}
syncDoc=function(k){if(!CLOUD)return _syncDoc(k);const idx=docIdx();DIDX=idx;CAPPS.forEach(a=>mapDocs(a,idx))};
setSt=async function(id,st,note){
 if(!CLOUD)return _setSt(nid(id),st,note);
 if(LOCKED!==id){const c=await lockDoc(id);if(c.err){netStop();return}if(!c.ok){alert((RVN[c.by]||c.by||'其他審查人員')+' 正在核對這份文件，請稍後再試');return}}
 const cur=CDOCS.find(d=>d.id===id)||{};
 const{data:rd,error:re}=await SBC.rpc('review_document',{p_id:id,p_status:st,p_note:note||'',p_prev:cur.review_status||'pend'});
 if(re){netStop();return}
 if(!rd||!rd.ok){const lk=rd&&rd.lock&&rd.lock!==CUSER.toLowerCase()?rd.lock:'';const who=lk||(rd&&rd.by);
  alert(lk?`${RVN[lk]||lk} 正在核對這份文件，您的結果沒有寫入，請稍後再試。`:`這份文件剛剛已由 ${RVN[who]||who||'其他審查人員'} 核對為「${rd&&rd.status==='ok'?'符合':rd&&rd.status==='bad'?'退回':'待核對'}」，您的結果沒有寫入。\n畫面將顯示最新結果，請確認後再決定。`);
  if(LOCKED===id){LOCKED=null;try{await SBC.rpc('release_document',{p_id:id})}catch(e){}}await refreshDoc(id);CONFLICT=id;return}
 const patch={review_status:st,review_note:note||null,reviewed_by:CUSER.toLowerCase(),reviewed_at:new Date().toISOString(),locked_by:null,locked_at:null};
 Object.assign(CDOCS.find(d=>d.id===id)||{},patch);if(LOCKED===id)LOCKED=null;await loadIdx();syncDoc()};
let CONFLICT=null;
async function lockDoc(id){let r;try{r=await SBC.rpc('claim_document',{p_id:id})}catch(e){return{ok:false,by:'',err:String(e)}}const{data,error}=r;if(error||!data)return{ok:false,by:'',err:error?error.message:'無回應'};if(data.ok)LOCKED=id;return data}
async function unlockDoc(){if(CLOUD&&LOCKED){const id=LOCKED;LOCKED=null;await SBC.rpc('release_document',{p_id:id})}}
const _showReview=showReview,_startReview=startReview;
showReview=async function(){
 if(!CLOUD)return _showReview();
 await unlockDoc();
 while(RI>=0&&RI<RQ.length){const id=RQ[RI];const c=await lockDoc(id);
  if(c.err){netStop();return}
  if(!rdlg.open){await unlockDoc();return}
  if(c.ok&&(c.status==='pend'||SPOT||RS[id]==='ok'||RS[id]==='bad'))break;
  if(c.ok){await unlockDoc();RS[id]='other'}else RS[id]='lock';
  RI+=DIR}
 if(RI<0){RI=0;DIR=1;if(RS[RQ[0]]==='lock'||RS[RQ[0]]==='other'){RI=1;return showReview()}}
 try{return await _showReview()}catch(e){netStop()}};
function netStop(){LOADING=false;BUSY=false;try{setLoading(false)}catch(e){}if(rdlg.open)rdlg.close();alert('網路連線中斷，文件無法載入或儲存。\n已完成的核對都已保存。請確認網路後，再按「開始核對」繼續。')}
startReview=async function(){if(CLOUD&&!(await cloudLoad()))return;return _startReview()};
rdlg.addEventListener('cancel',e=>{e.preventDefault();finishReview(true)});
rdlg.addEventListener('close',()=>{unlockDoc();try{render()}catch(e){}});
window.addEventListener('pagehide',()=>{if(!CLOUD||!LOCKED)return;const id=LOCKED;LOCKED=null;try{const tk=JSON.parse(localStorage.getItem('sb-'+new URL(CFG.url).hostname.split('.')[0]+'-auth-token')||'null');fetch(CFG.url+'/rest/v1/rpc/release_document',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json',apikey:CFG.key,Authorization:'Bearer '+((tk&&tk.access_token)||CFG.key)},body:JSON.stringify({p_id:id})})}catch(e){unlockDoc()}});
delFile=async function(id){
 if(!CLOUD)return _delFile(nid(id));
 const d=CDOCS.find(x=>x.id===id);if(!d)return;
 if(!await wrote(await SBC.from('documents').delete().eq('id',id).select('id'),'刪除'))return;
 {const rm=await SBC.storage.from('docs').remove([d.path]);if(rm&&rm.error)alert('紀錄已刪除，但雲端檔案刪除失敗，請稍後通知系統管理者清除。')}
 CDOCS=CDOCS.filter(x=>x.id!==id);DIDX=null};
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
 CDOCS.push(data);DIDX=null;
 SBC.functions.invoke('analyze',{body:{document_id:data.id}}).then(()=>refreshDoc(data.id));
};
async function refreshDoc(id){const{data}=await SBC.from('documents').select('*').eq('id',id).single();if(!data)return;const i=CDOCS.findIndex(d=>d.id===id);if(i>=0)CDOCS[i]=data;else CDOCS.push(data);syncDoc();await loadIdx();render()}
toggleDoc=async function(i,k){
 if(!CLOUD)return _toggleDoc(i,k);
 const a=APPS[i],f=FIELDS.find(f=>f.k===k),x=R.find(r=>r.i===i),cur=docState(x,f);
 if((FIDX[fkey(a,k)]||[]).length){openFiles(i,k);return}
 const v=cur==='ok'?(f.doc===3?'無須':'未附'):'已附';
 const{data:rv,error}=await SBC.rpc('review_patch',{p_id:a._cid,p_patch:{docs:{[k]:v}}});
 if(error){alert('儲存失敗：'+error.message);return}
 a._review=rv;if(CAPPS_RAW[a._cid])CAPPS_RAW[a._cid].review=rv;a[k]=v;render()};
const FORMSKIP=new Set(['id',...DOCKEYS]);
saveEdit=async function(){
 if(!CLOUD)return _saveEdit();
 const e={};document.querySelectorAll('#editForm [data-k]').forEach(el=>e[el.dataset.k]=el.value.trim());if(!e.name){alert('請填姓名');return}if(needNote(e))return;famClean(e);
 const form={};for(const[k,v]of Object.entries(e))if(!FORMSKIP.has(k))form[k]=v;
 if(editIdx===null){
  form.consent=true;form.source='審查人員建檔';
  const{data,error}=await SBC.rpc('submit_application',{p_form:form});if(error){alert('新增失敗：'+error.message);return}
  dlg.close();await cloudLoad();return}
 const a=APPS[editIdx];
 const cur=await SBC.from('applicants').select('form,review').eq('id',a._cid).single();if(cur.error||!cur.data){await sessionLost();return}
 const rvPart={},fmPart={};for(const[k,v]of Object.entries(form))(REVKEYS.includes(k)?rvPart:fmPart)[k]=v;
 // 只寫入本人在視窗中改過的欄位，避免蓋掉其他委員同時的修改
 const touched=k=>String(EDINIT[k]??'')!==String(e[k]??'');
 const old=cur.data.form||{},chg={};for(const[k,v]of Object.entries(fmPart))if(touched(k)&&String(old[k]??'')!==String(v))chg[k]=v;
 const rvChg={};const oldRv=cur.data.review||{};for(const[k,v]of Object.entries(rvPart))if(touched(k)&&String(oldRv[k]??(k==='override'?'依系統':''))!==String(v))rvChg[k]=v;
 const both=Object.keys(chg).filter(k=>String(old[k]??'')!==String(EDINIT[k]??''));if(both.length&&!confirm('您編輯期間，其他人也修改了這位申請人的：'+both.map(k=>(FIELDS.find(f=>f.k===k)||{l:k}).l).join('、')+'。\n按「確定」以您的內容為準；按「取消」放棄您的修改。'))return;
 const newForm={...old,...chg};
 if(Object.keys(chg).length&&!await wrote(await SBC.from('applicants').update({form:newForm}).eq('id',a._cid).select('id'),'儲存'))return;
 let newRev=oldRv;if(Object.keys(rvChg).length){const{data:nr,error:ne}=await SBC.rpc('review_patch',{p_id:a._cid,p_patch:rvChg});if(ne){alert('儲存失敗：'+ne.message);return}newRev=nr}
 CAPPS_RAW[a._cid].form=newForm;CAPPS_RAW[a._cid].review=newRev;a._review=newRev;Object.assign(a,newForm,{override:newRev.override||'依系統',overNote:newRev.overNote||''});if(newRev.fam)a.fam=newRev.fam;dlg.close();render();toast('已儲存')};
const REVKEYS=['override','overNote','fam'];
$('#delBtn').onclick=async()=>{const b=$('#delBtn');if(b.disabled)return;b.disabled=true;try{await delApp()}finally{b.disabled=false}};
async function delApp(){
 if(!confirm('確定刪除這位申請人？'+(CLOUD?'\n（雲端資料及文件將一併刪除，無法復原）':'')))return;
 if(!CLOUD){APPS.splice(editIdx,1);dlg.close();render();return}
 const a=APPS[editIdx];const paths=CDOCS.filter(d=>d.applicant_id===a._cid).map(d=>d.path);
 if(!await wrote(await SBC.from('applicants').delete().eq('id',a._cid).select('id'),'刪除'))return;
 if(paths.length){const rm=await SBC.storage.from('docs').remove(paths);if(rm&&rm.error)alert('申請人已刪除，但部分雲端檔案刪除失敗，請稍後通知系統管理者清除。')}
 dlg.close();await cloudLoad()}
saveSettings=async function(){
 if(!CLOUD)return _saveSettings();
 const T=readSettings();if(!T)return;const NS={...S,...T};
 if(!await wrote(await SBC.from('settings').upsert({id:1,data:NS,updated_at:new Date().toISOString()}).select('id'),'儲存'))return;S=NS;$('#setDirty').classList.add('hidden');
 render();alert('已儲存，所有審查人員將套用新規則')};
clearAll=function(){if(CLOUD)return alert('雲端模式不提供全部清除。刪除申請人請至「申請人」點選「編輯」→「刪除」。');return _clearAll()};
loadDemo=function(){if(CLOUD)return alert('雲端模式不提供載入示範資料。');return _loadDemo()};
allDocs=function(){if(CLOUD)return alert('雲端模式須逐份核對文件。');return _allDocs()};
const _readFile=readFile;readFile=function(f){if(CLOUD)return alert('雲端模式資料來自線上申請，不提供 Excel 匯入。');return _readFile(f)};

let CAPPS_RAW={};
let CLSEQ=0;async function cloudLoad(){const seq=++CLSEQ;
 const bar=$('#cloudInfo');if(bar)bar.textContent='讀取中…';
 const all=async(mk)=>{let out=[],from=0;for(;;){const r=await mk().range(from,from+999);if(r.error)return r;out=out.concat(r.data||[]);if(!r.data||r.data.length<1000)return{data:out,error:null};from+=1000}};
 let ap,dc,st;
 try{[ap,dc,st]=await Promise.all([
  all(()=>SBC.from('applicants').select('*').order('app_no')),
  all(()=>SBC.from('documents').select('*').is('withdrawn_at',null).order('created_at').order('id')),
  SBC.from('settings').select('*').eq('id',1).maybeSingle()])}catch(e){if(bar)bar.textContent='讀取失敗';alert('網路連線中斷，無法讀取資料。請確認網路後按「重新整理」。');return false}
 if(seq!==CLSEQ)return false;
 const rv=await SBC.from('reviewers').select('email,name');if(seq!==CLSEQ)return false;RVN={};(rv.data||[]).forEach(r=>RVN[r.email.toLowerCase()]=r.name||r.email);
 const err=ap.error||dc.error||st.error;if(err){if(bar)bar.textContent='讀取失敗';alert(/fetch|network|網路|Failed/i.test(err.message||'')?'網路連線中斷，無法讀取資料。請確認網路後按「重新整理」。':'讀取資料失敗，請稍後按「重新整理」再試。（'+String(err.message||'').slice(0,60)+'）');return false}
 CAPPS_RAW={};ap.data.forEach(r=>CAPPS_RAW[r.id]=r);
 CDOCS=dc.data.filter(d=>!d.withdrawn_at);DIDX=docIdx();CAPPS=ap.data.map(mapApp);APPS=CAPPS;BLOBS={};BORD=[];
 const stuck=CDOCS.filter(d=>d.ai_status==='pending'&&d.review_status==='pend'&&!d.reviewed_by&&Date.now()-Date.parse(d.created_at)>120e3).slice(0,10);
 stuck.forEach(d=>SBC.functions.invoke('analyze',{body:{document_id:d.id}}).then(()=>refreshDoc(d.id)).catch(()=>{}));
 S=Object.assign({},DEF,(st.data&&st.data.data)||{});
 await loadIdx();renderSettings();render();if(ISADMIN)loadReviewers();
 if(bar)bar.textContent=`${new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false})} 更新`;
 return true}
async function enterCloud(){
 const{data:s}=await SBC.auth.getSession();if(!s.session)return false;
 const{data:ok,error}=await SBC.rpc('is_reviewer');
 if(error){alert('網路連線不穩，無法確認審查人員身分。請確認網路後重新整理頁面。');return false}
 if(!ok){alert('這個帳號（'+s.session.user.email+'）不在審查人員名單內，請洽管理者。');await SBC.auth.signOut();return false}
 if(!CLOUD)LOCAL_BAK={APPS,S};
 CLOUD=true;CUSER=s.session.user.email;document.body.classList.add('cloud');document.body.classList.remove('gated');
 const ra=await SBC.rpc('is_admin');ISADMIN=!!(ra&&ra.data);document.body.classList.toggle('admin',ISADMIN);
 
 await cloudLoad();if(ISADMIN)checkKey();$('#userBtn').textContent=(RVN[CUSER.toLowerCase()]||CUSER.split('@')[0])+' ▾';$('#userInfo').innerHTML=`${esc(CUSER)}<br>${ISADMIN?'管理者':'審查委員'}`;maybeTour();return true}
let LEAVING=false;
async function leaveCloud(){
 if(DEMO){location.reload();return}
 if(!confirm('確定登出？'))return;
 LEAVING=true;await SBC.auth.signOut();location.reload();return;CLOUD=false;CUSER='';ISADMIN=false;document.body.classList.remove('cloud','admin');
 
 if(LOCAL_BAK){APPS=LOCAL_BAK.APPS;S=LOCAL_BAK.S}else{APPS=[];S=Object.assign({},DEF);_load()}
 await _loadIdx();renderSettings();render()}
function cloudBtnClick(){if(CLOUD)leaveCloud();else{$('#lgErr').textContent='';ldlg.showModal()}}
const ldlg=$('#ldlg');
async function doLogin(e){e.preventDefault();const em=$('#lgEmail').value.trim(),pw=$('#lgPw').value;$('#lgErr').textContent='登入中…';
 const{error}=await SBC.auth.signInWithPassword({email:em,password:pw});
 if(error){$('#lgErr').textContent=/Invalid login/i.test(error.message)?'Email 或密碼錯誤':'登入失敗：'+error.message;return}
 ldlg.close();$('#lgPw').value='';await enterCloud()}
function copyApply(){const u=$('#applyUrl').textContent;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>alert('已複製網址'),()=>prompt('請複製這個網址：',u))}
if(SBC){if(SBC.auth.onAuthStateChange)SBC.auth.onAuthStateChange(ev=>{if(ev==='SIGNED_OUT'&&CLOUD&&!LEAVING)sessionLost()});$('#cloudBtn').classList.remove('hidden');$('#applyUrl').textContent=new URL('apply.html',location.href).href}

// ===== 使用導覽（第一次登入自動出現；右上角「使用說明」可再看）=====
const TOUR_STEPS=()=>{const nm=RVN[CUSER.toLowerCase()];const L=[
 {title:`歡迎${nm?'，'+nm:''}！`,body:'感謝擔任助學金審查委員。<br>以下說明審查作業，約 1 分鐘。<br><br>所有核對結果均可修改。'},
 {sel:'#hello',tab:'home',title:'審查工作：核對文件',body:'首頁顯示待核對文件數量。<br>按「<b>開始核對</b>」，系統逐份顯示文件。<br><br>其他分頁供參考，不需操作。'},
 {sel:'#startReviewBtn',tab:'docs',title:'核對按鈕',body:'<b style="color:var(--ok)">✓ 符合</b>：文件審核通過<br><b style="color:var(--bad)">✕ 退回</b>：要求申請人重新繳交，點選退件原因即可<br><b>略過</b>：暫不處理，<u>不計為完成</u>，下次將再次列出'},
 {sel:'#startReviewBtn',tab:'docs',title:'修改核對結果',body:'點選「<b>◀ 上一份</b>」重新選擇；<br>或點選視窗上方進度格，直接跳至該份。<br><br>開啟中的文件會鎖定，其他委員自動跳過，不會重複核對。'},
 {sel:'#startReviewBtn',tab:'docs',title:'初步檢查僅供參考',body:'多數文件已由系統初步檢查並自動通過。<br>標示 ⚠ 之文件須人工確認，例如：<br>・文件種類是否正確<br>・姓名是否為申請人或其家屬<br>・日期是否在 3 個月內<br>・成績是否與申請表相符<br><br>初步檢查可能有誤，<b>以審查人員判斷為準</b>。'},
 {sel:'#docTable',tab:'docs',title:'文件核對',body:'<span class="dk ok">✓</span> 已繳　<span class="dk pend">?</span> 待核對　<span class="dk no">✕</span> 缺件或退回<br><br>點選格子可查看該申請人上傳之檔案。'},
 {sel:'nav button[data-t="result"]',tab:'result',title:'初篩結果',body:'資格、優先順序、正取及備取均依協會規則自動計算。<br><br>文件未核對完成前，名單為<b>暫定</b>；文件經退回者列為「<b>待補件</b>」，非資格不符。'}];
 if(ISADMIN)L.push({sel:'nav button[data-t="settings"]',tab:'settings',title:'管理者功能：設定',body:'設定<b>申請截止日</b>、<b>補件期限</b>及<b>聯絡方式</b>（顯示於學生申請頁）、管理審查人員名單，並可查閱<b>異動紀錄</b>。'});
 L.push({sel:'#tourBtn',tab:'home',title:'使用說明',body:'右上角「<b>使用說明</b>」可再次檢視本導覽。<br>中途離開時，進度均已自動儲存。<br><br>感謝協助。'});
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
function provHtml(){const c=provCount();if(!R.length||(!c.docs&&!c.hold&&!c.late))return'';if(!c.docs&&!c.hold)return`<div class="prov late"><b>補件期限已過</b>：${c.late} 位逾期未補件，已集中列於「初篩結果」之「逾期未補件」，請委員會議決定是否受理。</div>`;return`<div class="prov"><b>初篩尚未定案</b>：還有 ${c.docs} 份文件待核對${c.hold?`、${c.hold} 位待補件`:''}${c.late?`、${c.late} 位逾期未補件（請委員會議決定）`:''}。目前的正取／備取是<b>暫定</b>，匯出檔名將標示「暫定」。</div>`}
function badNotes(x){const who=fkey(x.a,'');return FALL.filter(r=>r.k.startsWith(who)&&r.st==='bad').map(r=>`<div class="note">${esc(DOCNAME(r.k.split('|')[1]))}：${esc(r.note||'')}</div>`).join('')}
function renderHello(){if(!CLOUD){$('#hello').innerHTML='';return}
 const nm=RVN[CUSER.toLowerCase()]||'',n=FALL.filter(r=>(r.st||'pend')==='pend').length;
 const c=provCount();
 $('#hello').innerHTML=n?`<div class="next"><div><h2>${esc(nm||'')}${nm?'，':''}目前有 <span class="big">${n} 份</span>文件待核對</h2><p>每份約 30 秒。全部核對完成後，初篩結果始定案。</p></div><button class="btn pri lg" onclick="tab('docs');startReview()">開始核對</button></div>`
  :c.late?`<div class="next late"><div><h2>${esc(nm||'')}${nm?'，':''}文件已全部核對完成</h2><p>${c.late} 位申請人逾期未補件，請於委員會議決定是否受理。</p></div><button class="btn lg" onclick="tab('result');$('#fStatus').value='late';render()">查看逾期名單</button></div>`
  :`<div class="next"><div><h2>${esc(nm||'')}${nm?'，':''}目前無待核對文件</h2><p>${c.hold?`還有 ${c.hold} 位申請人補件中，補件後將再次列入待核對。`:'感謝協助。'}</p></div><button class="btn lg" onclick="tab('result')">查看初篩結果</button></div>`}
function exportFollowup(){
 const list=R.filter(x=>(x.missing||[]).length||FALL.some(r=>r.k.startsWith(fkey(x.a,''))&&r.st==='bad'));
 if(!list.length){alert('目前無需補件之申請人');return}
 const dl=S.supDeadline||S.deadline||'';
 const rows=[['編號','姓名','手機','Email','缺少的文件','被退回的文件與原因','補件截止日'],...list.map(x=>{const who=fkey(x.a,'');const bad=FALL.filter(r=>r.k.startsWith(who)&&r.st==='bad');const badT=bad.map(r=>DOCNAME(r.k.split('|')[1]));
  return[x.a.id,x.a.name,x.a.phone||'',x.a.email||'',(x.missing||[]).filter(m=>!badT.includes(m)).join('、'),bad.map(r=>DOCNAME(r.k.split('|')[1])+'：'+(r.note||'')).join('；'),dl]})];
 sheetOut('補件通知',rows,'松樑助學金_補件通知名單_'+today())}
async function loadReviewers(){if(!CLOUD)return;const{data}=await SBC.from('reviewers').select('*').order('created_at');RVL=data||[];
 $('#rvTable').innerHTML='<tr><th>Email</th><th>姓名</th><th>身分</th><th></th></tr>'+RVL.map(r=>`<tr><td>${esc(r.email)}</td><td>${esc(r.name||'')}</td><td>${r.role==='admin'?'管理者':'審查委員'}</td><td>${r.email.toLowerCase()===CUSER.toLowerCase()?'<span class="note">（目前登入）</span>':`<button class="btn sm danger" data-email="${esc(r.email)}" onclick="rvDel(this.dataset.email)">移除</button>`}</td></tr>`).join('')}
let RVL=[];
async function rvAdd(){const email=$('#rvEmail').value.trim().toLowerCase(),name=$('#rvName').value.trim(),role=$('#rvRole').value;
 if(!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)){alert('請輸入正確的 Email（只能使用英文、數字及 . _ - 符號）');return}
 if(email===CUSER.toLowerCase()){alert('不能變更自己的帳號與身分，請由其他管理者操作。');return}
 const ex=RVL.find(r=>r.email.toLowerCase()===email);
 if(ex&&!confirm(`${email} 已在名單中（${ex.name||'未填姓名'}，${ex.role==='admin'?'管理者':'審查委員'}）。\n要改成「${name||ex.name||''}，${role==='admin'?'管理者':'審查委員'}」嗎？`))return;
 if(ex&&ex.role==='admin'&&role!=='admin'&&RVL.filter(r=>r.role==='admin').length<=1){alert('系統至少需要保留一位管理者。');return}
 const{error}=await SBC.from('reviewers').upsert({email,name:name||(ex&&ex.name)||'',role});if(error){alert((ex?'修改':'新增')+'失敗：'+error.message);return}
 $('#rvEmail').value='';$('#rvName').value='';await loadReviewers();alert(ex?`已更新 ${name||ex.name||email}。`:`已加入 ${name||email}。\n請通知系統管理員開通此 Email 的登入帳號。`)}
async function rvDel(email){const t=RVL.find(r=>r.email===email);if(t&&t.role==='admin'&&RVL.filter(r=>r.role==='admin').length<=1){alert('系統至少需要保留一位管理者。');return}if(!confirm(`確定移除 ${email}？移除後該帳號將無法查看任何資料。`))return;const{error}=await SBC.from('reviewers').delete().eq('email',email);if(error){alert('移除失敗：'+error.message);return}loadReviewers()}
const AUDF={name:'姓名',score:'成績',incSelf:'本人所得',incF:'父所得',incM:'母所得',incG:'家長所得',override:'評審決議',overNote:'決議說明',memo:'自述',review_status:'核對結果',review_note:'退回原因',house:'房產',welfare:'福利身分',disab:'身障'};
const ACCN={view_doc:'檢視文件',open_file:'開啟／下載原檔',export:'匯出',print:'列印',view_list:'檢視名單',purge:'過期資料刪除'};
function logAccess(action,target,detail){try{if(CLOUD&&!DEMO&&SBC)SBC.rpc('log_access',{p_action:action,p_target:target||null,p_detail:detail||null}).then(()=>{},()=>{})}catch(e){}}
function auditDiff(r){if(r.tbl==='access'||r.tbl==='retention')return esc(ACCN[r.action]||r.action)+(r.after&&r.after.detail?'：'+esc(r.after.detail):'')+(r.tbl==='retention'&&r.after?'：申請人 '+(r.after.applicants||0)+' 位、撤回文件 '+(r.after.withdrawn_docs||0)+' 份、檔案 '+(r.after.files||0)+' 個':'');
 if(r.action==='刪除')return'刪除：'+esc((r.before&&(r.before.app_no||r.before.file_name||r.before.doc_type))||r.row_id);
 if(r.action==='新增')return'新增：'+esc((r.after&&(r.after.app_no+' '+((r.after.form||{}).name||'')))||'');
 const b=r.before||{},a=r.after||{},out=[];
 const cmp=(o,n,pre)=>{for(const k of new Set([...Object.keys(o||{}),...Object.keys(n||{})])){if(['editedAt','locked_by','locked_at','reviewed_at','ai','ai_status','updated_at','verdict'].includes(k))continue;const ov=o?o[k]:undefined,nv=n?n[k]:undefined;if(JSON.stringify(ov)===JSON.stringify(nv))continue;if(typeof nv==='object'&&nv&&!Array.isArray(nv)&&typeof ov==='object'){cmp(ov,nv,pre+k+'.');continue}out.push(`${esc(AUDF[k]||pre+k)}：${esc(ov??'（空）')} → <b>${esc(nv??'（空）')}</b>`)}};
 cmp(b,a,'');return out.join('<br>')||'—'}
async function loadAudit(){const{data,error}=await SBC.from('audit_log').select('*').order('id',{ascending:false}).limit(200);if(error){alert('讀取失敗：'+error.message);return}
 const nameOf=r=>{const id=(r.after||r.before||{}).applicant_id||r.row_id;const a=CAPPS.find(x=>x._cid===id);return a?a.id+' '+a.name:''};
 $('#auditTable').innerHTML='<tr><th>時間</th><th>誰</th><th>對象</th><th>內容</th></tr>'+(data||[]).map(r=>`<tr><td>${new Date(r.at).toLocaleString('zh-TW',{hour12:false})}</td><td>${esc(RVN[(r.who||'').toLowerCase()]||r.who)}</td><td>${esc({applicants:'申請人',documents:'文件',settings:'規則',reviewers:'審查人員',access:'存取',retention:'保存期限'}[r.tbl]||r.tbl)} ${esc(nameOf(r))}${r.tbl==='documents'?'<br><span class="note">'+esc(DOCNAME(((r.after||r.before)||{}).doc_type||''))+'</span>':''}</td><td>${auditDiff(r)}</td></tr>`).join('')}

async function startSpot(){
 await cloudLoad();const auto=FALL.filter(r=>r.st==='ok'&&r.by==='auto');
 if(!auto.length){alert('目前無需抽查之文件');return}
 const must=auto.filter(r=>/\|(d_wel|d_dis)$/.test(r.k)),rest=auto.filter(r=>!must.includes(r)).sort(()=>Math.random()-.5);
 const sp=parseFloat(S.spotPct),pct=Math.max(0,Math.min(100,isFinite(sp)?sp:10)),pick=rest.slice(0,Math.ceil(rest.length*pct/100));
 RQ=[...must,...pick].map(r=>r.id);
 if(!confirm(`本次抽查 ${RQ.length} 份：\n・福利身分、身心障礙證明 ${must.length} 份（影響優先順序，全數抽查）\n・其他文件隨機抽 ${pct}%：${pick.length} 份\n\n核對後標示為「已核對符合」，不再列入抽查。是否開始？`))return;
 SPOT=true;RI=0;RS={};RALL={};DIR=1;rdlg.showModal();showReview()}
const mask=n=>{n=String(n||'');return n.length<=1?n:n.length===2?n[0]+'○':n[0]+'○'.repeat(n.length-2)+n[n.length-1]};
function exportReviewers(){
 if(!R.length){alert('尚無資料');return}
 const st=x=>({ok:'正取',add:'追加正取',wait:'備取'+(x.wn||''),hold:'待補件',late:'逾期未補件',no:'不符合'}[x.st]);
 const pr=x=>[x.p1?'①':'',x.welfare&&!x.p1?'②':'',x.disab?'③':'',x.noHouse?'④':''].filter(Boolean).join('');
 // 去識別：只帶不含金額、家人姓名、障別等個資的說明
 const SAFE=/^(名額已滿|類別名額已滿|名額回流|成績未達|班排補足|文件不全|文件退回|待核對|科系不符|非日間部|部別未填|國籍未填|逾期未補件)/;
 const txt=r=>tagOf(r)+(SAFE.test(r)&&detOf(r)?'：'+detOf(r):'');
 const head=['排名','初篩結果','編號','姓名','學制','系所','年級','成績','優先條件（對照規則第幾項）','不符合原因','備註','審查組','評審意見'];
 const row=x=>[x.rk||'',st(x),x.a.id,mask(x.a.name),x.a.level,x.a.dept,x.grade||'',isFinite(+x.a.score)&&x.a.score!==''?+x.a.score:x.a.score,pr(x),x.reasons.map(txt).join('；'),x.notes.filter(n=>!/^(同家庭｜|疑似同家庭｜)/.test(n)).map(txt).join('；'),x.grp,''];
 const order={ok:0,add:1,wait:2,hold:3,late:3.5,no:4};
 const part=L=>[head,...R.filter(x=>x.L===L).sort((p,q)=>order[p.st]-order[q.st]||((p.rk||999)-(q.rk||999))).map(row)];
 const note=[['使用須知'],['本名單僅供本年度助學金評審使用，請勿轉寄、複製或上傳到其他地方。'],['會議結束後請將紙本交回承辦人員統一銷毀，電子檔請刪除（含下載資料夾與資源回收筒）。'],['優先條件：①續領且具福利身分 ②低收／中低收／特殊境遇 ③本人或二親等身心障礙／重大傷病 ④無房產'],['匯出時間：'+new Date().toLocaleString('zh-TW',{hour12:false})]];
 sheetOut([['使用須知',note],['大學部',part('U')],['碩博士班',part('G')]],null,'松樑助學金_評審用_機密_'+today()+(provCount().docs||provCount().hold||provCount().late?'_暫定':''))}

async function checkKey(){try{const{data,error}=await SBC.functions.invoke('analyze',{body:{ping:true}});if(error||!data)return;const bad=data.key===false;
 const box=$('#keyWarn');box.classList.toggle('hidden',!bad)}catch(e){}}
let DEMO=false;
function loadDemoJs(){return window.DemoClient?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='demo.js?v=14';s.onload=ok;s.onerror=()=>no(new Error('示範載入失敗，請檢查網路'));document.head.appendChild(s)})}

function adminDemoSteps(){
 const pendIdx=(no,k)=>RQ.findIndex(id=>{const r=FALL.find(x=>x.id===id);return r&&r.k===no+'|'+k});
 return[
 {t:'系統建置緣由',b:'紙本與 Excel 作業的問題：<br>・承辦逐份對照文件、電話追補件<br>・委員依多項規則人工計算資格與排名，容易出錯<br>・所得、身心障礙等個資分散保存，不易控管',ms:9000,do:async h=>{tab('home')}},
 {t:'系統用途',b:'・線上申請：學生以手機填表、拍照上傳，可查進度、補件<br>・文件初步檢查：有疑問的文件才交委員核對<br>・資格自動計算：依協會規則判定資格、優先順序、正取與備取<br>・資料集中管理：權限分級控管，所有修改留存紀錄',ms:9000,do:async h=>{tab('home')}},
 {t:'操作示範',b:'以下自動示範審查委員及承辦人員之作業，約 1 分鐘。<br>可隨時點選「暫停」或「結束介紹」。',ms:5000,do:async h=>{tab('home');h.hl('#hello')}},
 {t:'首頁',b:'登入後首頁顯示待核對文件數量，點選「開始核對」即進入核對作業。',ms:3000,do:async h=>{if(!rdlg.open){tab('home');await h.tap('#hello .btn')}await h.until(()=>rdlg.open&&!LOADING)}},
 {t:'文件資訊',b:(innerWidth<860?'上方':'左側')+'顯示申請人姓名、應繳文件種類及初步檢查結果。',do:async h=>{await h.until(()=>!LOADING);h.hl('#rInfo')}},
 {t:'原始檔案',b:(innerWidth<860?'下方':'右側')+'顯示申請人上傳之原檔，可放大、旋轉，或以新分頁開啟。',do:async h=>{h.hl('#rView');await h.sleep(700);await h.tap('#vTool button:nth-child(2)')}},
 {t:'符合',b:'文件無誤者點選「符合」，系統自動進入下一份。',ms:3500,do:async h=>{vz(0);await h.tap('#rOk');await h.until(()=>!LOADING&&!BUSY)}},
 {t:'疑義提醒',b:'初步檢查發現疑義時顯示提醒，例如此份「成績單」實為風景照片。',ms:5000,do:async h=>{const j=pendIdx('U002','d_tr');if(j>=0){await revJump(j);await h.until(()=>!LOADING&&!BUSY)}h.hl(document.querySelector('#rInfo .alert:not([style*="e8f0fa"])')||'#rInfo')}},
 {t:'退回',b:'系統依初步檢查結果預先勾選退件原因，亦可填寫補充說明；申請人登入後可查閱退件原因。',ms:5000,do:async h=>{if(!rdlg.open)return;const j=pendIdx('U002','d_tr');if(j>=0&&j!==RI){await revJump(j);await h.until(()=>!LOADING&&!BUSY)}if(!bdlg.open){await h.tap('#rBad');await h.until(()=>bdlg.open)}await h.sleep(300);if(!document.querySelector('#bChips .on'))await h.tap('#bChips [data-i]');h.hl('#bChips')}},
 {t:'確定退回',b:'該申請人列為「待補件」，非資格不符。',ms:3500,do:async h=>{if(!bdlg.open)return;if(!document.querySelector('#bChips .on')&&!$('#bNote').value.trim())await h.tap('#bChips [data-i]');await h.tap('#bOk');await h.until(()=>!bdlg.open&&!LOADING&&!BUSY)}},
 {t:'核對進度',b:'上方進度格：✓ 為符合、✕ 為退回，點選可返回修改。<br>開啟中之文件自動鎖定，其他委員將略過，避免重複核對。',ms:6000,do:async h=>{h.hl('#rStrip')}},
 {t:'初篩結果',b:'資格、優先順序、正取及備取依協會規則自動計算，並列出不符資格原因。',ms:5500,do:async h=>{rdlg.close();await h.sleep(300);tab('result');render();await h.sleep(300);document.querySelectorAll('.tablewrap,.tbl-wrap').forEach(e=>e.scrollLeft=0);h.hl('#resultBox .card')}},
 {t:'文件核對',b:'綠色為已繳、橘色為待核對、紅色為缺件或退回；點選格子可查看檔案。',ms:5000,do:async h=>{tab('docs');await h.sleep(300);document.querySelectorAll('.tablewrap,.tbl-wrap').forEach(e=>e.scrollLeft=0);const dt=$('#docTable');if(dt&&dt.parentElement)dt.parentElement.scrollLeft=0;h.hl('#docTable')}},
 {t:'承辦功能：設定及匯出',b:'每年於此設定申請截止日、補件期限及聯絡方式，並同步顯示於學生申請頁。<br>名單可匯出 Excel，並提供評審用去識別版。',ms:6000,do:async h=>{tab('settings');await h.sleep(300);h.hl('#setForm1')}},
 {t:'示範結束',b:'按「開始操作」後說明框會關閉，可在示範資料中自行操作。<br>示範資料均為虛構，不影響正式系統；要離開請按上方藍色列的「離開示範」。',ms:6000,do:async h=>{tab('home');h.hl($('#demoBar')&&$('#demoBar').offsetParent?'#demoBar':'#hello')}}]}
async function startDemo(){try{await loadDemoJs()}catch(e){alert(e.message);return}
 try{localStorage.setItem('sch_tour_done_demo@example.tw','1')}catch(e){}
 SBC=window.DemoClient();SBC.auth._demoLogin();DEMO=true;$('#demoBar').classList.remove('hidden');$('#demoBar').style.display='flex';if(ldlg.open)ldlg.close();
 $('#applyUrl').textContent=new URL('apply.html',location.href).href;await enterCloud();window.DemoPlayer.play(adminDemoSteps())}
function replayDemo(){try{sessionStorage.setItem('sch_replay_demo','1');localStorage.setItem('sch_seen_intro','1')}catch(e){}scrollTo(0,0);location.reload()}
function demoToLogin(){try{sessionStorage.setItem('sch_after_demo','1');localStorage.setItem('sch_seen_intro','1')}catch(e){}scrollTo(0,0);location.reload()}
$('#q').oninput=renderData;$('#fLevel').onchange=render;$('#fStatus').onchange=render;$('#fq').oninput=render;$('#dShow').onchange=renderDocs;
const ONLINE=!/[?&]offline\b/.test(location.search);if(ONLINE&&(SBC||CFG.key))document.body.classList.add('gated');
if(ONLINE&&!SBC&&CFG.key){const g=$('#gateErr');if(g)g.classList.remove('hidden')}
const wdlg=$('#wdlg');if(window.MASCOT){$('#gMascot').innerHTML=MASCOT(96)}
wdlg.addEventListener('close',()=>{try{localStorage.setItem('sch_seen_intro','1')}catch(e){}});
try{load();renderSettings();render()}catch(e){console.error(e)}
const idxP=Promise.race([loadIdx(),new Promise(r=>setTimeout(r,3000))]).then(()=>{try{render()}catch(e){}});
let REPLAY=false;try{REPLAY=!!sessionStorage.getItem('sch_replay_demo');sessionStorage.removeItem('sch_replay_demo')}catch(e){}
idxP.then(async()=>{if(REPLAY){if(wdlg.open)wdlg.close();await startDemo();document.body.classList.remove('gated');return}if(SBC){const ok=await enterCloud();if(ok)document.body.classList.remove('gated');else{let seen=false;try{seen=!!localStorage.getItem('sch_seen_intro')}catch(e){}let after=false;try{after=!!sessionStorage.getItem('sch_after_demo');sessionStorage.removeItem('sch_after_demo')}catch(e){}if(after&&document.body.classList.contains('gated')){cloudBtnClick()}else if(!seen&&document.body.classList.contains('gated')){if(window.MASCOT)$('#wMascot').innerHTML=MASCOT(130,'fly');wdlg.showModal()}}}});

// 列印前：每張表的標題列移入 thead（跨頁自動重複）並加上列印時間
window.addEventListener('beforeprint',()=>{logAccess('print',null,(document.querySelector('nav>button.on')||{}).textContent||'');document.querySelectorAll('table').forEach(t=>{if(!t.tHead&&t.rows[0]&&t.rows[0].querySelector('th')){const h=t.createTHead();h.appendChild(t.rows[0])}});
 let p=document.getElementById('printStamp');if(!p){p=document.createElement('div');p.id='printStamp';const m=document.querySelector('main');if(m)m.prepend(p)}
 const d=new Date();p.textContent='社團法人台灣松樑教育公益促進協會 助學金初審｜列印時間：民國 '+(d.getFullYear()-1911)+' 年 '+(d.getMonth()+1)+' 月 '+d.getDate()+' 日 '+d.toTimeString().slice(0,5)});

// ===== 資料保存期限（個資法：結案後保存 5 年，期滿銷毀；學生撤回的檔案 30 天後刪除）=====
async function retPreview(){const{data,error}=await SBC.rpc('retention_preview',{p_years:5});if(error){alert('讀取失敗：'+error.message);return null}
 $('#retInfo').innerHTML=`保存期限：申請日早於 <b>${new Date(data.cutoff).toLocaleDateString('zh-TW')}</b>（5 年前）的資料<br>・過期申請人：<b>${data.applicants}</b> 位（文件 ${data.docs_expired} 份）<br>・學生撤回超過 30 天的檔案：<b>${data.docs_withdrawn}</b> 份<br>・過期異動紀錄：<b>${data.audit}</b> 筆`;
 $('#retBtn').disabled=!(data.applicants||data.docs_withdrawn||data.audit);return data}
async function retPurge(){const p=await retPreview();if(!p)return;if(!(p.applicants||p.docs_withdrawn||p.audit)){alert('目前沒有需要刪除的資料。');return}
 const t=prompt(`將永久刪除：過期申請人 ${p.applicants} 位、撤回檔案 ${p.docs_withdrawn} 份、異動紀錄 ${p.audit} 筆，無法復原。\n\n確定要刪除請輸入「確定刪除」四個字：`);if(t!=='確定刪除'){if(t!==null)alert('輸入不符，未刪除。');return}
 const{data,error}=await SBC.rpc('retention_purge',{p_years:5,p_confirm:t});if(error){alert('刪除失敗：'+error.message);return}
 const paths=data.paths||[];let fail=0;for(let i=0;i<paths.length;i+=100){const rm=await SBC.storage.from('docs').remove(paths.slice(i,i+100));if(rm&&rm.error)fail+=Math.min(100,paths.length-i)}
 alert(`已刪除：申請人 ${data.applicants} 位、撤回檔案 ${data.withdrawn_docs} 份、異動紀錄 ${data.audit} 筆、雲端檔案 ${paths.length-fail} 個。`+(fail?`\n另有 ${fail} 個檔案刪除失敗，請稍後再按一次。`:''));
 await cloudLoad();retPreview()}
