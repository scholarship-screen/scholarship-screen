// 示範模式：用瀏覽器裡的假資料跑真正的畫面，什麼都不會存到雲端，重新整理就恢復原狀
(function(){
const uid=()=>crypto.randomUUID?crypto.randomUUID():'d'+Math.random().toString(36).slice(2)+Date.now();
const NAMES={d_id:'學生證',d_tr:'成績單',d_merit:'獎懲紀錄',d_hh:'全戶戶籍謄本',d_prop:'全國財產稅總歸戶財產查詢清單',d_inc:'綜合所得稅各類所得資料清單',d_rec:'推薦函',d_wel:'中低收入戶證明',d_dis:'身心障礙證明'};
function docSvg(type,name,extra,blur){
 if(type==='scenery')return`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec5f0"/><stop offset="1" stop-color="#e8f4ff"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><path d="M0 560 L260 330 L470 520 L690 280 L1000 540 L1200 420 L1200 800 L0 800Z" fill="#5d8a4e"/><circle cx="980" cy="160" r="70" fill="#fff6c9"/></svg>`;
 const rows=(extra||[]).map((t,i)=>`<text x="90" y="${330+i*58}" font-size="30" fill="#333">${t}</text>`).join('');
 const lines=Array.from({length:8},(_,i)=>`<rect x="90" y="${640+i*44}" width="${700-((i*97)%260)}" height="14" rx="4" fill="#d9dde3"/>`).join('');
 return`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200"><rect width="900" height="1200" fill="#fff"/><g ${blur?'filter="url(#b)"':''}><defs><filter id="b"><feGaussianBlur stdDeviation="4"/></filter></defs><rect x="40" y="40" width="820" height="1120" fill="none" stroke="#999" stroke-width="2"/><text x="450" y="150" font-size="46" text-anchor="middle" font-weight="bold" fill="#222">${NAMES[type]||type}</text><text x="90" y="250" font-size="32" fill="#222">姓名：${name}</text>${rows}${lines}</g><text x="450" y="1120" font-size="24" text-anchor="middle" fill="#b42318">示範用假文件</text></svg>`}
const svgBlob=s=>new Blob([s],{type:'image/svg+xml'});

function seed(){
 const DB={applicants:[],documents:[],files:{},reviewers:[{email:'demo@example.tw',name:'示範承辦',role:'admin'}],settings:[{id:1,data:{deadline:'2026-12-15',supDeadline:'2026-12-31',announce:'2027 年 1 月中旬',contact:'協會承辦 王小姐 02-2345-6789',incomeLimit:'1000000',penalty:'大過以上',kwX:'資訊工程,資工'}}],audit_log:[]};
 const P=[
  ['U001','林怡君','電子工程系','3','單親',{guardianName:'林美華',guardianRel:'母親',incG:'260000'},'86','中低收入戶','無','無','否',{d_id:['ok'],d_merit:['ok'],d_tr:['ok',['學期平均：86.0','操行：甲']],d_hh:['bad',[],[],'戶籍謄本','照片右半部缺漏，請重新拍攝完整頁面'],d_prop:['pend',[],[],'財產清單，名下無房屋土地'],d_inc:['pend',[],[],'所得清單，母親 26 萬'],d_wel:['pend',['有效期限：2027-06-30'],[],'中低收入戶證明']}],
  ['U002','陳冠宇','電機工程系','2','雙親',{fatherName:'陳建國',motherName:'張淑芬',incF:'320000',incM:'180000'},'78','無','無','無','否',{d_id:['ok'],d_merit:['ok'],d_tr:['scenery',[],['看起來不是「前學期成績單」，而是「無關的圖片或文件」'],'一張山景照片'],d_hh:['ok'],d_prop:['pend'],d_inc:['pend'],d_rec:['ok']}],
  ['U003','黃詩涵','光電工程系','4','雙親',{fatherName:'黃志強',motherName:'吳雅婷',incF:'280000',incM:'150000'},'64','低收入戶','二等親內','無','否',{d_id:['ok'],d_merit:['ok'],d_tr:['pend',['學期平均：64.2'],['成績單平均 64.2 分，與申請表填的 68 分不同'],'成績單，學期平均 64.2 分'],d_hh:['blur',[],['文字不清楚'],'戶籍謄本，畫面模糊'],d_prop:['pend'],d_inc:['pend'],d_rec:['ok'],d_wel:['pend'],d_dis:['pend']}],
  ['U004','張宗翰','機械工程系','3','雙親',{fatherName:'張文雄',motherName:'李秀英',incF:'300000',incM:'200000'},'88','無','無','有','否',{d_id:['ok'],d_merit:['ok'],d_tr:['ok'],d_hh:['bad',[],[],'戶籍謄本','列印日期超過三個月。請重新申請三個月內的謄本'],d_prop:['ok'],d_inc:['ok'],d_rec:['ok']}],
  ['U005','吳佳穎','電子工程系','1','雙親',{fatherName:'吳俊傑',motherName:'許美玲',incF:'250000',incM:'120000'},'91','無','本人','無','否',{d_id:['ok'],d_merit:['ok'],d_tr:['ok'],d_hh:['ok'],d_prop:['ok'],d_inc:['ok'],d_dis:['ok']}],
  ['U006','劉柏翰','資訊工程系','2','雙親',{fatherName:'劉正雄',motherName:'楊秀英',incF:'260000',incM:'190000'},'84','無','無','無','否',{d_id:['ok'],d_merit:['ok'],d_tr:['ok'],d_hh:['ok'],d_prop:['ok'],d_inc:['ok'],d_rec:['ok']}],
  ['G001','楊承恩','電機工程系碩士班','1','雙親',{fatherName:'楊明德',motherName:'謝麗華',incF:'350000',incM:'210000'},'90','無','無','無','是',{d_id:['ok'],d_merit:['ok'],d_tr:['ok'],d_hh:['ok'],d_prop:['ok'],d_inc:['ok'],d_rec:['ok']}],
  ['U007','蔡欣妤','電機工程系','2','單親',{guardianName:'蔡淑貞',guardianRel:'母親',incG:'230000'},'80','低收入戶','無','無','否',{d_id:['ok'],d_merit:['ok'],d_tr:['ok'],d_hh:['ok'],d_wel:['ok']}],
 ];
 for(const[no,name,dept,grade,fam,par,score,wel,dis,house,prev,docs]of P){
  const id=uid();
  DB.applicants.push({id,app_no:no,code:'DEMO2026',created_at:'2026-11-20T10:00:00Z',review:{},form:{name,studentNo:'B11'+no.slice(1)+'001',phone:'0912345678',email:'student@example.tw',nation:'本國',level:no[0]==='G'?'碩士班':'大學部',div:'日間部',dept,grade,family:fam,...par,incSelf:'40000',score,rankPct:'20',conduct:'85',demerit:'無',gov:'否',otherAid:'0',prev,house,welfare:wel,disab:dis,unemp:'否',siblings:'0',memo:no==='U001'?'母親做清潔工作，家中還有一位弟弟在念高中，課餘在超商打工負擔生活費。':''}});
  for(const[t,v]of Object.entries(docs)){
   const[kind,extra=[],issues=[],summary=NAMES[t]+'，'+name,note=null]=v;const did=uid(),path=`${id}/${t}/${did.slice(0,6)}.svg`;
   DB.files[path]=docSvg(kind==='scenery'?'scenery':t,name,extra,kind==='blur');
   const st=kind==='ok'?'ok':kind==='bad'?'bad':'pend';
   DB.documents.push({id:did,applicant_id:id,doc_type:t,path,file_name:kind==='scenery'?'IMG_2041.jpg':`${NAMES[t]}.jpg`,mime:'image/svg+xml',size:180000,ai_status:'done',verdict:st==='ok'?'pass':'check',review_status:st,review_note:st==='ok'?'系統自動核對通過':note,reviewed_by:st==='ok'?'auto':st==='bad'?'demo@example.tw':null,ai:{issues,summary},created_at:'2026-11-20T10:05:00Z'});
  }
 }
 return DB}

window.DemoClient=function(){
 const DB=seed();let session=null;
 const clone=o=>JSON.parse(JSON.stringify(o));
 function q(table){
  const st={filters:[],op:'select',patch:null,single:false,maybe:false,ret:false,order:null,desc:false,lim:null};
  const run=async()=>{await new Promise(r=>setTimeout(r,60));let rows=DB[table]||(DB[table]=[]);const match=r=>st.filters.every(([k,v])=>String(r[k])===String(v));
   if(st.op==='select'){let out=rows.filter(match);if(st.order)out=[...out].sort((a,b)=>String(a[st.order]).localeCompare(String(b[st.order]))*(st.desc?-1:1));if(st.lim)out=out.slice(0,st.lim);
    if(st.single||st.maybe)return{data:out[0]?clone(out[0]):null,error:out[0]||st.maybe?null:{message:'找不到資料'}};return{data:clone(out),error:null}}
   if(st.op==='update'){const hit=rows.filter(match);hit.forEach(r=>Object.assign(r,clone(st.patch)));return{data:st.ret?clone(hit):null,error:null}}
   if(st.op==='delete'){const hit=rows.filter(match);DB[table]=rows.filter(r=>!match(r));if(table==='applicants')DB.documents=DB.documents.filter(d=>DB.applicants.some(a=>a.id===d.applicant_id));return{data:st.ret?clone(hit):null,error:null}}
   if(st.op==='insert'){const r={id:uid(),ai_status:'pending',review_status:'pend',created_at:new Date().toISOString(),...clone(st.patch)};rows.push(r);return{data:st.single?clone(r):[clone(r)],error:null}}
   if(st.op==='upsert'){const key=st.patch.id!==undefined?'id':'email';const i=rows.findIndex(r=>r[key]===st.patch[key]);if(i>=0)rows[i]={...rows[i],...clone(st.patch)};else rows.push(clone(st.patch));return{data:st.ret?[clone(st.patch)]:null,error:null}}};
  const b={select(){if(st.op!=='select')st.ret=true;return b},order(k,o){st.order=k;st.desc=!!(o&&o.ascending===false);return b},range(){return b},limit(n){st.lim=n;return b},eq(k,v){st.filters.push([k,v]);return b},
   single(){st.single=true;return b},maybeSingle(){st.maybe=true;return b},update(p){st.op='update';st.patch=p;return b},delete(){st.op='delete';return b},insert(p){st.op='insert';st.patch=p;return b},upsert(p){st.op='upsert';st.patch=p;return b},
   then(ok,no){return run().then(ok,no)}};
  return b}
 const appBy=(no,code)=>DB.applicants.find(a=>a.app_no===String(no||'').toUpperCase()&&a.code===String(code||'').toUpperCase());
 const statusOf=a=>({id:a.id,app_no:a.app_no,form:clone(a.form),open:true,docs:DB.documents.filter(d=>d.applicant_id===a.id&&!d.withdrawn_at).map(d=>({id:d.id,type:d.doc_type,name:d.file_name,status:d.review_status,note:d.review_note,check:d.verdict==='check'&&d.review_status==='pend'?(d.ai||{}).issues:null}))});
 return{
  from:q,
  async rpc(fn,a){await new Promise(r=>setTimeout(r,80));const me=session&&session.user.email;
   switch(fn){
    case'is_reviewer':case'is_admin':return{data:!!me,error:null};
    case'public_info':{const d=DB.settings[0].data;return{data:{deadline:d.deadline,supDeadline:d.supDeadline,contact:d.contact,announce:d.announce},error:null}}
    case'claim_document':{const d=DB.documents.find(x=>x.id===a.p_id);d.locked_by=me;d.locked_at=new Date().toISOString();return{data:{ok:true,status:d.review_status},error:null}}
    case'release_document':{const d=DB.documents.find(x=>x.id===a.p_id);if(d){d.locked_by=null;d.locked_at=null}return{data:null,error:null}}
    case'submit_application':{const f={...a.p_form};delete f.consent;delete f.clientToken;const pre=/碩|博/.test(f.level||'')?'G':'U';const n=DB.applicants.filter(x=>x.app_no[0]===pre).length+1;const id=uid(),no=pre+String(n).padStart(3,'0');DB.applicants.push({id,app_no:no,form:f,review:{},code:'DEMO2026',created_at:new Date().toISOString()});return{data:{id,app_no:no,code:'DEMO2026'},error:null}}
    case'add_document':{const id=uid();DB.documents.push({id,applicant_id:a.p_app,doc_type:a.p_type,path:a.p_path,file_name:a.p_name,mime:a.p_mime,size:a.p_size,ai_status:'pending',review_status:'pend',ai:{},created_at:new Date().toISOString()});return{data:id,error:null}}
    case'student_status':{const x=appBy(a.p_no,a.p_code);return{data:x?statusOf(x):{error:'申請編號或查詢碼不正確（示範請用 U001 和 DEMO2026）'},error:null}}
    case'student_save':{const x=appBy(a.p_no,a.p_code);if(!x)return{data:'申請編號或查詢碼不正確',error:null};const f={...a.p_form};delete f.consent;x.form={...x.form,...f};return{data:null,error:null}}
    case'student_remove':{const x=appBy(a.p_no,a.p_code);const d=x&&DB.documents.find(d=>d.id===a.p_doc&&d.applicant_id===x.id);if(!d||d.review_status==='ok')return{data:'這份文件已審核通過，無法刪除',error:null};d.withdrawn_at=new Date().toISOString();return{data:null,error:null}}
   }
   return{data:null,error:{message:'示範模式不支援這個功能'}}},
  storage:{from(){return{
   async upload(path,file){DB.files[path]=file;return{data:{path},error:null}},
   async download(path){const f=DB.files[path];if(!f)return{data:null,error:{message:'找不到檔案'}};return{data:typeof f==='string'?svgBlob(f):f,error:null}},
   async remove(ps){ps.forEach(p=>delete DB.files[p]);return{error:null}}}}},
  functions:{async invoke(name,{body}){await new Promise(r=>setTimeout(r,900));if(body.ping)return{data:{ok:true,key:true},error:null};
   const d=DB.documents.find(x=>x.id===body.document_id);if(!d||d.ai_status!=='pending')return{data:{skipped:true},error:null};
   const nm=String(d.file_name||'');const bad=/風景|scenery|IMG_\d+/i.test(nm)&&!/成績|謄本|證/.test(nm);
   const manual=['d_inc','d_prop','d_wel','d_dis'].includes(d.doc_type);
   const issues=bad?['文件種類疑似不符，請確認是否上傳錯誤']:[];
   Object.assign(d,{ai_status:'done',verdict:bad||manual?'check':'pass',review_status:bad||manual?'pend':'ok',reviewed_by:bad||manual?null:'auto',review_note:bad||manual?null:'系統自動核對通過',ai:{issues,summary:bad?'看起來是一般照片':'收到的文件'}});
   return{data:{ok:true,verdict:d.verdict,issues},error:null}}},
  auth:{onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},
   async getSession(){return{data:{session}}},
   async signInWithPassword(){session={user:{email:'demo@example.tw'}};return{error:null}},
   async signOut(){session=null;return{error:null}},
   _demoLogin(){session={user:{email:'demo@example.tw'}}}}
 }};
})();

// ===== 自動播放介紹 =====
(function(){
const css=`#dpCap{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);width:min(640px,calc(100vw - 24px));margin:0;background:#1d2733;color:#fff;border:0;border-radius:16px;padding:18px 20px 14px;box-shadow:0 16px 48px rgba(0,0,0,.35);font:18px/1.65 "Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif;z-index:2147483647}
#dpCap b.t{display:block;font-size:21px;margin-bottom:4px;color:#cfe8b8}
@media(max-width:500px){#dpCap .m svg{width:56px;height:56px}}
#dpCap .ctl{display:flex;gap:8px;align-items:center;margin-top:12px}
#dpCap .ctl span{flex:1;font-size:15px;color:#b9c4d0}
#dpCap .ctl button{font:inherit;font-size:16px;font-weight:600;border:1px solid #5b6876;background:#2b3644;color:#fff;border-radius:10px;padding:8px 14px;cursor:pointer}
#dpCap .ctl button.go{background:#3d6b2f;border-color:#3d6b2f}
#dpCap .bar{height:4px;background:#3a4553;border-radius:9px;margin-top:10px;overflow:hidden}#dpCap .bar i{display:block;height:100%;background:#9bbb45;width:0}
.dp-hl{outline:4px solid #9bbb45!important;outline-offset:3px;border-radius:10px;animation:dpPulse 1.2s ease-in-out infinite}
@keyframes dpPulse{50%{outline-color:rgba(155,187,69,.35)}}
.dp-tap{animation:dpTap .5s ease-out}
@keyframes dpTap{0%{box-shadow:0 0 0 0 rgba(155,187,69,.9)}100%{box-shadow:0 0 0 22px rgba(155,187,69,0)}}
@media(prefers-reduced-motion:reduce){.dp-hl{animation:none}.dp-tap{animation:none}#dpCap .bar i{transition:none!important}}`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let chain=Promise.resolve(),onDone=null,steps=[],i=0,paused=false,timer=null,run=0,cap=null;
function ensure(){if(cap)return;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 cap=document.createElement('div');cap.id='dpCap';cap.setAttribute('role','status');cap.setAttribute('aria-live','polite');
 cap.innerHTML='<div style="display:flex;gap:14px;align-items:flex-start"><div class="m" style="flex:none;margin-top:-4px">'+(window.MASCOT?window.MASCOT(72,'fly'):'')+'</div><div style="flex:1"><b class="t"></b><div class="b"></div></div></div><div class="bar"><i></i></div><div class="ctl"><span class="n"></span><button class="pz">暫停</button><button class="nx">下一步</button><button class="go">結束介紹</button></div>';
 document.body.appendChild(cap);
 cap.querySelector('.pz').onclick=()=>{paused=!paused;cap.querySelector('.pz').textContent=paused?'繼續':'暫停';if(!paused)arm()};
 cap.querySelector('.nx').onclick=()=>{if(i>=steps.length-1&&onDone){const f=onDone;stop();f();return}next()};
 cap.querySelector('.go').onclick=()=>{if(onDone){const f=onDone;stop();f();return}stop()}}
function top(){if(cap.dataset.off)return;const ds=[...document.querySelectorAll('dialog[open]')];const host=ds.length?ds[ds.length-1]:document.body;if(cap.parentNode!==host)host.appendChild(cap);cap.style.display='block'}
setInterval(()=>{if(cap&&!cap.dataset.off)top()},400);
function clearHl(){document.querySelectorAll('.dp-hl').forEach(e=>e.classList.remove('dp-hl'))}
function hl(sel){clearHl();const el=typeof sel==='string'?document.querySelector(sel):sel;if(el){el.classList.add('dp-hl');try{el.scrollIntoView({block:'center',behavior:'smooth'})}catch(e){}}return el}
async function tap(sel){const el=typeof sel==='string'?document.querySelector(sel):sel;if(!el)return;hl(el);await sleep(900);el.classList.add('dp-tap');setTimeout(()=>el.classList.remove('dp-tap'),600);await sleep(250);el.click();await sleep(400);top()}
async function type(sel,text){const el=document.querySelector(sel);if(!el)return;hl(el);el.focus();el.value='';for(const ch of text){el.value+=ch;el.dispatchEvent(new Event('input',{bubbles:true}));await sleep(110)}}
async function show(){const my=++run;clearTimeout(timer);const s=steps[i];
 cap.querySelector('.t').textContent=s.t;cap.querySelector('.b').innerHTML=s.b;cap.querySelector('.n').textContent=`${i+1} / ${steps.length}`;
 cap.querySelector('.nx').textContent=i===steps.length-1?'開始操作':'下一步';
 const bar=cap.querySelector('.bar i');bar.style.transition='none';bar.style.width='0';top();if(i>0&&(i===steps.length-1||i%4===0)&&window.MASCOT_HOP)MASCOT_HOP(cap);
 chain=chain.then(async()=>{if(cap.dataset.off)return;try{if(s.do)await s.do({hl,tap,type,sleep,until})}catch(e){console.log(e)}});await chain;
 if(my!==run)return;top();arm()}
function arm(){clearTimeout(timer);if(paused)return;if(i>=steps.length-1&&onDone){const b=cap.querySelector('.bar i');b.style.transition='none';b.style.width='100%';return}const s=steps[i],ms=s.ms||5000;const bar=cap.querySelector('.bar i');
 bar.style.transition='none';bar.style.width='0';requestAnimationFrame(()=>{bar.style.transition=`width ${ms}ms linear`;bar.style.width='100%'});
 timer=setTimeout(()=>next(),ms)}
function next(){if(i>=steps.length-1){stop();return}i++;show()}
function stop(){run++;clearTimeout(timer);clearHl();cap.dataset.off='1';cap.style.display='none';if(window.__dpEnd)window.__dpEnd()}
const until=async(fn,ms=8000)=>{const t=Date.now();while(Date.now()-t<ms){try{if(fn())return true}catch(e){}await sleep(150)}return false};
window.DemoPlayer={play(list,opt){onDone=(opt&&opt.onDone)||null;ensure();delete cap.dataset.off;if(window.MASCOT)cap.querySelector('.m').innerHTML=MASCOT(72,'fly');steps=list;i=0;paused=false;cap.querySelector('.pz').textContent='暫停';top();show()},helpers:{hl,tap,type,sleep,until}};
})();
