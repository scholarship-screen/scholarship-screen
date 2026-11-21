#!/usr/bin/env python3
"""助學金初審系統 自動回歸測試（每日巡檢與每次修改後都要跑）

用法：python3 qa/run_all.py            # 在 repo 根目錄執行
需求：pip install playwright（瀏覽器用 /usr/bin/google-chrome，或設定 CHROME=路徑）
結果：全部通過 exit 0；任何一項失敗 exit 1，並列出失敗項目。
"""
import os, sys, time, json, socket, threading, http.server, functools, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
RESULTS = []
import base64 as _b64
BANNED = _b64.b64decode('QUl8Q2xhdWRlfEFudGhyb3BpY3zkurrlt6Xmmbrmhad8R1BUfOWIpOiugOmHkemRsHzlpKflnovoqp7oqIDmqKHlnos=').decode().split('|')  # 對外禁用字樣



def check(name, ok, detail=''):
    RESULTS.append((name, bool(ok), detail))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(detail)[:300]) if detail and not ok else ''))


def serve():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    H = functools.partial(Q, directory=ROOT)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{port}'


def new_page(b, base, w=1400, h=900):
    pg = b.new_page(viewport={'width': w, 'height': h})
    errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('dialog', lambda d: (errs.append('dialog: ' + d.message[:120]) if any(k in d.message for k in ('TypeError', 'undefined', 'Error:', 'NaN')) else None, d.accept()))
    # 只允許本機與本機 vendor；擋掉正式後端與外部 CDN，確保測試不碰正式資料
    pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
    return pg, errs


def main():
    from playwright.sync_api import sync_playwright
    base = serve()
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=CHROME)

        # 1. 頁面載入無錯誤
        for path in ['index.html', 'index.html?offline', 'apply.html']:
            pg, errs = new_page(b, base)
            pg.goto(f'{base}/{path}'); pg.wait_for_timeout(1500)
            check(f'載入 {path} 無程式錯誤', not errs, errs)
            pg.close()

        # 2. 規則計算（本機模式）
        pg, errs = new_page(b, base)
        pg.goto(f'{base}/index.html?offline'); pg.wait_for_timeout(1200)
        money = pg.evaluate("['30萬','3萬5千','１００萬','100万','NT$5萬','1,000,000元','abc','-5'].map(v=>parseMoney(v))")
        exp = [300000, 35000, 1000000, 1000000, 50000, 1000000, None, None]
        got = [None if (m is None or (isinstance(m, float) and m != m) or (isinstance(m, (int, float)) and m < 0)) else m for m in money]
        check('金額解析（萬、全形、NT$、錯誤值）', got == exp, f'{money}')
        cats = pg.evaluate("['電子工程系','電機工程系','光電工程系','電控工程系','機械工程系','工業工程與管理系','紡織材料系','資訊工程系','電機資訊學院資訊工程系','電子商務系','生物科技系','電子物理系'].map(cat)")
        check('系所分類', cats == ['A', 'A', 'A', 'A', 'B', 'B', 'B', None, None, None, None, None], cats)
        r = pg.evaluate("""(()=>{const mk=(id,lv,dept,o)=>Object.assign({id,name:id,level:lv,div:'日間部',dept,grade:'2',nation:'本國',family:'雙親',incSelf:'0',incF:'100000',incM:'100000',score:'80',rankPct:'',demerit:'無',gov:'否',otherAid:'0',prev:'否',welfare:'無',disab:'無',house:'有',d_id:'已附',d_tr:'已附',d_merit:'已附',d_hh:'已附',d_prop:'已附',d_inc:'已附',d_rec:'已附',d_unemp:'無須'},o||{});
          const save=[APPS,S];const A=[];for(let k=0;k<40;k++)A.push(mk('U'+k,'大學部',k%2?'電機工程系':'機械工程系'));for(let k=0;k<8;k++)A.push(mk('G'+k,'碩士班',k%2?'電子工程系碩士班':'機械工程系碩士班'));
          A.push(mk('X1','大學部','生物科技系'));A.push(mk('X2','大學部','電機工程系',{demerit:'記大過一次'}));A.push(mk('X3','大學部','電機工程系',{incSelf:'0',incF:'600000',incM:'500000'}));
          A.push(mk('X4','大學部','電機工程系',{score:'65',rankPct:'40'}));A.push(mk('X5','大學部','電機工程系',{score:'65',rankPct:'60'}));A.push(mk('X6','大學部','電機工程系',{otherAid:'50000'}));
          A.push(mk('X7','大學部','電機工程系',{div:'進修部'}));A.push(mk('X8','大學部','電機工程系',{d_rec:'未附'}));
          A.push(mk('F1','大學部','電機工程系',{fam:'FAM',welfare:'低收入戶',d_wel:'已附'}));A.push(mk('F2','大學部','電機工程系',{fam:'FAM',welfare:'低收入戶',d_wel:'已附'}));
          APPS=A;S=Object.assign({},DEF,{quotaU:26,quotaG:4});const O=compute();const st=id=>R.find(x=>x.a.id===id);
          const ok=R.filter(x=>['ok','add'].includes(x.st));
          const out={total:ok.length,A:ok.filter(x=>x.cat==='A').length,AU:ok.filter(x=>x.cat==='A'&&x.L==='U').length,AG:ok.filter(x=>x.cat==='A'&&x.L==='G').length,U:ok.filter(x=>x.L==='U').length,G:ok.filter(x=>x.L==='G').length,
            X1:st('X1').st,X2:st('X2').st,X3:st('X3').st,X4:st('X4').reasons.length,X5:st('X5').st,X6:st('X6').st,X7:st('X7').st,X8:st('X8').st,
            F:[st('F1').st,st('F2').st].sort().join(',')};APPS=save[0];S=save[1];render();return out})()""")
        check('名額 30（大學部 26／碩博 4）', (r['total'], r['U'], r['G']) == (30, 26, 4), r)
        check('電子電機 2/3 各學制計算（大學部≥17、碩博≥3，不跨學制遞補）', r['AU'] >= 17 and r['AG'] >= 3, r)
        check('科系不符→不符', r['X1'] == 'no', r)
        check('大過→不符', r['X2'] == 'no', r)
        check('所得超過 100 萬→不符', r['X3'] == 'no', r)
        check('成績未達但班排前 50%→合格', r['X4'] == 0, r)
        check('成績未達且班排 60%→不符', r['X5'] == 'no', r)
        check('他項獎學金 5 萬→不符', r['X6'] == 'no', r)
        check('進修部→不符', r['X7'] == 'no', r)
        check('缺推薦函→待補件', r['X8'] in ('hold', 'late'), r)
        check('學士以下同家庭限一人', r['F'] == 'no,ok', r)

        # 2b. 第 30 人測試回報的規則案例（不能再發生）
        r2 = pg.evaluate("""(()=>{const mk=(id,o)=>Object.assign({id,name:id,level:'大學部',div:'日間部',dept:'電機工程系',grade:'2',nation:'本國',family:'雙親',incSelf:'0',incF:'100000',incM:'100000',score:'80',rankPct:'',demerit:'無',gov:'否',otherAid:'0',prev:'否',welfare:'無',disab:'無',house:'有',d_id:'已附',d_tr:'已附',d_merit:'已附',d_hh:'已附',d_prop:'已附',d_inc:'已附',d_rec:'已附',d_unemp:'無須'},o||{});
          const save=[APPS,S];APPS=[mk('D1',{demerit:'無小過，大過1次'}),mk('D2',{demerit:'否，曾記大過'}),mk('D3',{demerit:'大過（已銷過）'}),mk('D4',{demerit:'小過3支'}),
           mk('N1',{nation:'馬來西亞'}),mk('N2',{nation:'中國大陸'}),mk('N3',{nation:''}),mk('N4',{nation:'中華民國'}),
           mk('A1',{otherAid:'無'}),mk('A2',{otherAid:'每學年8萬'}),mk('A3',{otherAid:'4萬/學期'}),mk('A4',{otherAid:'每學期5萬'}),
           mk('R1',{score:'69.9',rankPct:'5/40'}),mk('G1',{gov:'公費生'}),mk('G2',{gov:'否'}),
           mk('S1',{family:'單親',incF:'600000',incM:'500000',incG:''}),mk('M1',{incF:'30萬500'}),
           mk('P1',{fatherName:'王大明',motherName:'李小美'}),mk('P2',{fatherName:'王大明',motherName:'李小美'}),
           mk('H1',{addr:'台北市中山區民生東路1號3樓'}),mk('H2',{addr:'臺北市中山區民生東路1號3樓'})];
          S=Object.assign({},DEF,{quotaU:26,quotaG:4});APPS.forEach(a=>{if(a.fatherName)a.famGuess=a.fatherName+'/'+a.motherName});compute();const g=id=>R.find(x=>x.a.id===id);const tg=x=>[...x.reasons,...x.notes].map(tagOf).join('/');
          const o={};['D1','D2','D3','D4','N1','N2','N3','N4','A1','A2','A3','A4','R1','G1','G2','S1','M1','P1','P2','H1','H2'].forEach(id=>o[id]=g(id).st+'|'+tg(g(id)));o.M1h=g('M1').house;APPS=save[0];S=save[1];render();return o})()""")
        st = lambda k: r2[k].split('|')[0]
        check('懲處「無小過，大過1次」→不符', st('D1') == 'no', r2['D1'])
        check('懲處「否，曾記大過」→不符', st('D2') == 'no', r2['D2'])
        check('懲處「大過（已銷過）」→待確認不直接不符', st('D3') != 'no' and '懲處待確認' in r2['D3'], r2['D3'])
        check('懲處「小過3支」→不影響', st('D4') != 'no', r2['D4'])
        check('國籍馬來西亞／中國大陸→非本國籍', '非本國籍' in r2['N1'] and '非本國籍' in r2['N2'], (r2['N1'], r2['N2']))
        check('國籍空白→標示待確認', '國籍未填' in r2['N3'], r2['N3'])
        check('國籍「中華民國」→合格', '非本國籍' not in r2['N4'], r2['N4'])
        check('他項獎學金「無」「每學年8萬」「4萬/學期」→不扣資格', all('他項獎學金' not in r2[k] and '金額格式' not in r2[k] for k in ('A1', 'A2', 'A3')), (r2['A1'], r2['A2'], r2['A3']))
        check('他項獎學金每學期 5 萬→不符', '他項獎學金超額' in r2['A4'], r2['A4'])
        check('成績 69.9＋班排 5/40→合格', '成績未達' not in r2['R1'], r2['R1'])
        check('公費「公費生」→不符／「否」→合格', '公費生' in r2['G1'] and '公費生' not in r2['G2'], (r2['G1'], r2['G2']))
        check('單親但父母所得都填→標示扶養家長待確認', '扶養家長待確認' in r2['S1'], r2['S1'])
        check('「30萬500」=300500', r2['M1h'] == 300500 + 100000, r2['M1h'])
        check('家長同名→只標疑似同家庭，不自動排除', '疑似同家庭' in r2['P1'] and st('P1') != 'no' and st('P2') != 'no', (r2['P1'], r2['P2']))
        check('戶籍地址相同（台／臺）→同家庭限一人', sorted([st('H1'), st('H2')]) == ['no', 'ok'], (r2['H1'], r2['H2']))
        cats2 = pg.evaluate("['電控工程系','電機工程系（工程學院）'].map(cat)")
        check('系所分類（電控、系名後附學院）', cats2 == ['A', 'A'], cats2)
        # 評審用名單去識別：不可出現金額、家人姓名
        rv = pg.evaluate("""(async()=>{let cap=null;const so=sheetOut;window.sheetOut=async(n,a)=>{cap=a};try{const save=[APPS,S];APPS=[{id:'Z1',name:'王小明',level:'大學部',div:'日間部',dept:'電機工程系',grade:'2',nation:'本國',family:'雙親',incSelf:'0',incF:'1800000',incM:'0',score:'80',fam:'F',memo:'父親王大明肢障中度',d_id:'已附',d_tr:'已附',d_merit:'已附',d_hh:'已附',d_prop:'已附',d_inc:'已附',d_rec:'已附'},{id:'Z2',name:'王小華',level:'大學部',div:'日間部',dept:'電機工程系',grade:'3',nation:'本國',family:'雙親',incSelf:'0',incF:'0',incM:'0',score:'80',fam:'F',d_id:'已附',d_tr:'已附',d_merit:'已附',d_hh:'已附',d_prop:'已附',d_inc:'已附',d_rec:'已附'}];S=Object.assign({},DEF);render();await exportReviewers();APPS=save[0];S=save[1];render()}finally{window.sheetOut=so}return JSON.stringify(cap)})()""")
        check('評審用名單不含所得金額', '1,800,000' not in (rv or '') and '1800000' not in (rv or ''), (rv or '')[:200])
        check('評審用名單不含家人姓名／自述', '王大明' not in (rv or '') and '肢障' not in (rv or '') and '王小華' not in (rv or '').replace('王*華', ''), (rv or '')[:200])
        check('後台不顯示後端「金鑰」訊息（改為請人工核對）', "/金鑰/.test(String(x))?'系統初步檢查暫停" in open(os.path.join(ROOT, 'admin.js'), encoding='utf-8').read())
        # 2c. 規則邊界值（2026/11/12 巡檢）：剛好等於門檻要合格；名次換算百分比不可因小數誤差多 1%
        r3 = pg.evaluate("""(()=>{const mk=(id,o)=>Object.assign({id,name:id,level:'大學部',div:'日間部',dept:'電機工程系',grade:'2',nation:'本國',family:'雙親',incSelf:'0',incF:'100000',incM:'100000',score:'80',rankPct:'',demerit:'無',gov:'否',otherAid:'0',prev:'否',welfare:'無',disab:'無',house:'有',d_id:'已附',d_tr:'已附',d_merit:'已附',d_hh:'已附',d_prop:'已附',d_inc:'已附',d_rec:'已附',d_unemp:'無須'},o||{});
          const save=[APPS,S];const tg=x=>[...x.reasons,...x.notes].map(tagOf).join('/');const run=(apps,s)=>{APPS=apps;S=Object.assign({},DEF,{quotaU:26,quotaG:4},s||{});compute();const o={};apps.forEach(a=>{const x=R.find(y=>y.a.id===a.id);o[a.id]=tg(x)+'|'+x.rank});return o};
          const o=run([mk('I1',{incF:'500000',incM:'500000'}),mk('I2',{incF:'500000',incM:'500001'}),mk('C1',{score:'70'}),mk('C2',{score:'69.99'}),
            mk('K1',{score:'60',rankPct:'20/40'}),mk('K2',{score:'60',rankPct:'21/40'}),mk('K3',{score:'60',rankPct:'50'}),mk('W1',{otherAid:'49999'}),mk('W2',{otherAid:'50000'})]);
          Object.assign(o,run([mk('P1',{score:'60',rankPct:'11/20'}),mk('P2',{score:'60',rankPct:'7/100'})],{rankPct:55}));APPS=save[0];S=save[1];render();return o})()""")
        has = lambda k, t: t in r3[k].split('|')[0]
        check('邊界：家戶所得剛好 100 萬→合格；多 1 元→超標', not has('I1', '所得超標') and has('I2', '所得超標'), (r3['I1'], r3['I2']))
        check('邊界：成績剛好 70→合格；69.99→未達', not has('C1', '成績未達') and has('C2', '成績未達'), (r3['C1'], r3['C2']))
        check('邊界：班排 20/40、50%→合格；21/40→未達', not has('K1', '成績未達') and not has('K3', '成績未達') and has('K2', '成績未達'), (r3['K1'], r3['K2'], r3['K3']))
        check('邊界：他項獎學金 49999→合格；50000→超額', not has('W1', '他項獎學金超額') and has('W2', '他項獎學金超額'), (r3['W1'], r3['W2']))
        check('名次換算不多算 1%（門檻 55% 時 11/20→55% 合格；7/100→7%）', not has('P1', '成績未達') and r3['P1'].endswith('|55') and r3['P2'].endswith('|7'), (r3['P1'], r3['P2']))
        # 2d. 規則邊界值（2026/11/19 規則深測發現）：系名後附「（工程學院）」被整段當學院刪掉而判科系不符；
        #     承辦匯入或修改時班排寫「第5名/共40人」被讀成 540%、成績寫「平均 75」被讀成 0 分，都會誤判不符；「新台幣30萬元整」看不懂
        cats3 = pg.evaluate("['電機工程系（工程學院）','電機工程系(工程學院)','工程學院（電機工程系）','電機資訊學院資訊工程系','資訊工程系（電機資訊學院）'].map(cat)")
        check('系所：系名後附（工程學院）要算電子電機；資工不論括號都不含', cats3 == ['A', 'A', 'A', None, None], cats3)
        r4 = pg.evaluate("""(()=>{const save=[APPS,S];const mk=(id,o)=>Object.assign({id,name:id,level:'大學部',div:'日間部',dept:'電機工程系',grade:'2',nation:'本國',family:'雙親',incSelf:'0',incF:'100000',incM:'100000',score:'60',rankPct:'',demerit:'無',gov:'否',otherAid:'0'},o);
          APPS=[mk('Q1',{rankPct:'第5名/共40人'}),mk('Q2',{rankPct:'5名/40人'}),mk('Q3',{rankPct:'21名/40人'}),mk('Q4',{rankPct:'5-40'}),mk('Q5',{score:'平均 75'}),mk('Q6',{otherAid:'一學年9萬9千'}),mk('Q7',{otherAid:'4萬（學期）'}),mk('Q8',{incF:'新台幣30萬元整'})];S=Object.assign({},DEF);compute();
          const o={};APPS.forEach(a=>{const x=R.find(y=>y.a.id===a.id);o[a.id]=[x.reasons.map(tagOf).join('/'),x.notes.map(tagOf).join('/'),x.rank,x.score]});APPS=save[0];S=save[1];render();return o})()""")
        nr = lambda k, t: t not in r4[k][0]
        check('班排「第5名/共40人」「5名/40人」→前 13% 合格；「21名/40人」→未達', nr('Q1', '成績未達') and nr('Q2', '成績未達') and r4['Q1'][2] == 13 and not nr('Q3', '成績未達'), (r4['Q1'], r4['Q2'], r4['Q3']))
        check('班排看不懂（5-40）不可把數字黏成 540%，要標「班排待確認」', '班排待確認' in r4['Q4'][1] and r4['Q4'][2] == 100, r4['Q4'])
        check('成績「平均 75」→75 分合格', r4['Q5'][3] == 75 and nr('Q5', '成績未達'), r4['Q5'])
        check('他項獎學金「一學年9萬9千」「4萬（學期）」可讀且合格；「新台幣30萬元整」可讀', all(nr(k, '金額格式') and nr(k, '他項獎學金') for k in ('Q6', 'Q7', 'Q8')), (r4['Q6'], r4['Q7'], r4['Q8']))
        check('本機模式無程式錯誤', not errs, errs)
        pg.close()

        # 3. 學生頁：金額與登入檢查
        pg, errs = new_page(b, base, 390, 844)
        pg.goto(f'{base}/apply.html'); pg.wait_for_timeout(1200)
        m = pg.evaluate("['30萬','３萬','100万','NT$30萬','-5','30萬500','3萬5','無'].map(money)")
        check('學生頁金額換算', m == ['300000', '30000', '1000000', '300000', None, '300500', '35000', '0'], m)
        m2 = pg.evaluate("['新台幣30萬元整','新臺幣 1,000,000 元','30萬元整','30萬元左右'].map(money)")
        check('學生頁金額「新台幣30萬元整」可讀（2026/11/19 優化）', m2 == ['300000', '1000000', '300000', None], m2)
        w = pg.evaluate("(()=>{try{startNew()}catch(e){}return document.querySelector('[name=rankNo]').getBoundingClientRect().width})()")
        check('學生頁排名輸入框夠寬（≥80px）', w >= 80, w)
        opts = pg.evaluate("[...document.querySelectorAll('[name=nation] option')].map(o=>o.value).join(',')+'|'+[...document.querySelectorAll('[name=div] option')].map(o=>o.value).join(',')")
        check('國籍有僑生／陸生、部別有在職專班', '僑生' in opts and '陸生' in opts and '在職專班' in opts, opts)
        check('學號、申請編號欄關閉自動校正與拼字檢查', pg.evaluate("['[name=studentNo]','#lgNo'].every(q=>{const e=document.querySelector(q);return e&&e.getAttribute('spellcheck')==='false'&&e.getAttribute('autocorrect')==='off'})"))
        check('申請表有戶籍地址欄', pg.evaluate("!!document.querySelector('[name=addr]')"))
        rp = pg.evaluate("""(()=>{const out=[];for(const [n,c] of [[11,20],[7,100],[20,40],[1,3]]){document.querySelector('[name=rankNo]').value=n;document.querySelector('[name=classSize]').value=c;out.push(collect().f.rankPct)}document.querySelector('[name=rankNo]').value='';document.querySelector('[name=classSize]').value='';return out})()""")
        check('學生頁名次換算百分比無小數誤差（11/20=55、7/100=7）', rp == ['55', '7', '50', '34'], rp)
        pg.evaluate("window.wdlg&&wdlg.open&&wdlg.close()")
        pg.fill('[name=rankNo]', '１１'); pg.fill('[name=classSize]', '20'); pg.wait_for_timeout(100)
        lv = pg.evaluate("(()=>{const e=document.getElementById('rankLive');return e?[e.textContent,parseFloat(getComputedStyle(e).fontSize)]:null})()")
        pg.fill('[name=rankNo]', ''); pg.fill('[name=classSize]', '')
        check('學生頁填名次與人數即時顯示「換算為前 N%」（字級 ≥16px）', lv and lv[0] == '換算為前 55%' and lv[1] >= 16, lv)
        # 2026/11/13 優化：金額欄即時顯示「＝ N 萬元」，避免多打或少打一個 0
        ml = []
        for v in ['300000', '30萬500', '１００萬', '8000', 'abc', '']:
            pg.fill('[name=incF]', v); pg.wait_for_timeout(50)
            ml.append(pg.evaluate("(()=>{const e=document.getElementById('ml-incF');return e?e.textContent:null})()"))
        mfs = pg.evaluate("(()=>{const e=document.getElementById('ml-incF');return e?parseFloat(getComputedStyle(e).fontSize):0})()")
        check('學生頁所得欄即時顯示換算金額（＝ 30 萬元、看不懂要提示，字級 ≥16px）', ml == ['＝ 30 萬元（300,000 元）', '＝ 30 萬 500 元（300,500 元）', '＝ 100 萬元（1,000,000 元）', '＝ 8,000 元', '看不懂這個金額，請只填數字，例：300000', ''] and mfs >= 16, (ml, mfs))
        txt = pg.evaluate("document.body.innerText")
        check('個資告知寫明委託境外文件檢查', '美國' in pg.evaluate("document.getElementById('consentCard').innerText"))
        import re as _re
        for fname in ['index.html', 'apply.html', 'admin.js', 'demo.js', 'mascot.js', 'admin.css']:
            body = open(os.path.join(ROOT, fname), encoding='utf-8').read()
            hits = [w for w in BANNED if (_re.search(r'(?<![A-Za-z])' + w + r'(?![A-Za-z])', body) if w.isascii() else w in body)]
            check(f'{fname} 不含禁用字樣', not hits, hits)
        check('學生頁無程式錯誤', not errs, errs)
        pg.close()

        # 3b. 學生端完整送出申請（示範模式）→ 必須拿到申請編號與查詢碼
        pg, errs = new_page(b, base, 390, 844)
        pg.goto(f'{base}/apply.html'); pg.wait_for_timeout(1500)
        pg.evaluate("startDemo()"); pg.wait_for_timeout(500)
        pg.evaluate("(()=>{const g=document.querySelector('#dpCap .go');if(g)g.click()})()"); pg.wait_for_timeout(800)
        pg.evaluate("go('home');startNew()"); pg.wait_for_timeout(400)
        vals = {'name': '測試生', 'studentNo': 'B1100001', 'phone': '0912345678', 'email': 't@example.com', 'nation': '本國', 'level': '大學部', 'div': '日間部', 'dept': '電機工程系', 'grade': '2', 'score': '82', 'family': '雙親', 'incSelf': '0', 'fatherName': '測父', 'incF': '30萬', 'motherName': '測母', 'incM': '20萬', 'house': '無', 'addr': '台北市測試路1號'}
        pg.evaluate("v=>{const f=document.getElementById('v-form');for(const[k,x]of Object.entries(v)){const e=f.querySelector('[name='+k+']');if(e){e.value=x;e.dispatchEvent(new Event('change',{bubbles:true}))}}f.querySelector('[name=consent]').checked=true;if(typeof famUI==='function')famUI()}", vals)
        pg.evaluate("document.getElementById('sendBtn').click()"); pg.wait_for_timeout(2500)
        got = pg.evaluate("[!document.getElementById('v-code').classList.contains('hidden'),(document.getElementById('cNo')||{}).textContent||'',(document.getElementById('cCode')||{}).textContent||'']")
        check('學生完整送出申請→取得申請編號與查詢碼', got[0] and got[1] and got[2], f'{got} {errs}')
        check('學生送出流程無程式錯誤', not errs, errs)
        # 3c. 送出後「複製兩組號碼」：複製內容含申請編號與查詢碼、按鈕 ≥44px、有成功提示；不支援時改提示截圖（2026/11/22 優化）
        cp = pg.evaluate("""(async()=>{let cap=null;const ow=navigator.clipboard&&navigator.clipboard.writeText;try{Object.defineProperty(navigator,'clipboard',{value:{writeText:async t=>{cap=t}},configurable:true})}catch(e){}
          const b=document.querySelector('#v-code .copyBtn');const h=b?b.getBoundingClientRect().height:0;b.click();await new Promise(r=>setTimeout(r,200));
          const msg=document.querySelector('#v-code .copyMsg').textContent;
          Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('x')}},configurable:true});const ec=document.execCommand;document.execCommand=()=>false;resetCopy();b.click();await new Promise(r=>setTimeout(r,200));document.execCommand=ec;
          const msg2=document.querySelector('#v-code .copyMsg').textContent;return {cap,h,msg,msg2,no:document.getElementById('cNo').textContent,code:document.getElementById('cCode').textContent,fs:parseFloat(getComputedStyle(b).fontSize)}})()""")
        check('送出後「複製兩組號碼」：內容含申請編號與查詢碼、按鈕 ≥44px、字 ≥16px、有成功提示', bool(cp['cap']) and cp['no'] in cp['cap'] and cp['code'] in cp['cap'] and cp['h'] >= 44 and cp['fs'] >= 16 and '已複製' in cp['msg'], cp)
        check('無法複製時改提示「請截圖或抄下」，不出現錯誤字樣', '截圖' in cp['msg2'] and 'Error' not in cp['msg2'], cp)
        pg.evaluate("go('docs')"); pg.wait_for_timeout(300); pg.evaluate("finish()"); pg.wait_for_timeout(1200)
        dn = pg.evaluate("""(async()=>{const v=document.getElementById('v-done');if(v.classList.contains('hidden'))return {shown:false};let cap=null;Object.defineProperty(navigator,'clipboard',{value:{writeText:async t=>{cap=t}},configurable:true});
          const b=v.querySelector('.copyBtn');b.click();await new Promise(r=>setTimeout(r,200));return {shown:true,cap,msg:v.querySelector('.copyMsg').textContent,h:b.getBoundingClientRect().height,ow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()""")
        check('完成頁也可「複製兩組號碼」，手機版面不溢出', dn.get('shown') and dn.get('cap') and '查詢碼' in dn['cap'] and '已複製' in dn['msg'] and dn['h'] >= 44 and dn['ow'] <= 0, dn)
        check('複製號碼流程無程式錯誤', not errs, errs)
        pg.close()

        # 4. 後台導覽完整走完（正常速度與快速連按）
        for gap in (1.2, 0.2):
            pg, errs = new_page(b, base)
            pg.goto(f'{base}/index.html'); pg.wait_for_timeout(1500)
            pg.evaluate('startDemo()'); pg.wait_for_timeout(600)
            for _ in range(14):
                time.sleep(gap); pg.evaluate("document.querySelector('#dpCap .nx') && document.querySelector('#dpCap .nx').click()")
            t0 = time.time(); last = ''
            while time.time() - t0 < 25:
                last = pg.evaluate("(()=>{const c=document.getElementById('dpCap');return c&&!c.dataset.off?c.querySelector('.n').textContent:'END'})()")
                if last.startswith('15 / 15') and not pg.evaluate('rdlg.open||bdlg.open'): break
                time.sleep(0.3)
            check(f'後台導覽走完（間隔 {gap}s）', last.startswith('15 / 15') and not errs, f'{last} {errs}')
            pg.close()

        # 5. 學生頁導覽完整走完
        pg, errs = new_page(b, base, 390, 844)
        pg.goto(f'{base}/apply.html'); pg.wait_for_timeout(1500)
        pg.evaluate('startDemo()'); pg.wait_for_timeout(400)
        for _ in range(8):
            time.sleep(1.2); pg.evaluate("document.querySelector('#dpCap .nx') && document.querySelector('#dpCap .nx').click()")
        time.sleep(3)
        last = pg.evaluate("(()=>{const c=document.getElementById('dpCap');return c&&!c.dataset.off?c.querySelector('.n').textContent:'END'})()")
        check('學生頁導覽走完', last.startswith('9 / 9') and not errs, f'{last} {errs}')
        pg.close()

        # 6. 示範核對：符合／退回寫入且不重複前進
        pg, errs = new_page(b, base)
        pg.goto(f'{base}/index.html'); pg.wait_for_timeout(1500)
        pg.evaluate('startDemo()'); pg.wait_for_timeout(800)
        pg.evaluate("document.querySelector('#dpCap .go').click()"); pg.wait_for_timeout(500)
        pg.evaluate("tab('docs');startReview()"); pg.wait_for_timeout(2500)
        ri0 = pg.evaluate('RI')
        pg.evaluate("document.getElementById('rOk').click();document.getElementById('rOk').click()"); pg.wait_for_timeout(2500)
        check('連按兩次「符合」只前進一份', pg.evaluate('RI') == ri0 + 1, pg.evaluate('RI'))
        check('示範核對無程式錯誤', not errs, errs)
        pg.close()

        # 6a. 網路較慢時長者按兩下：第二下落在新文件剛出現時要忽略，不可未看就通過下一份（2026/11/11 巡檢發現）
        ctx = b.new_context(viewport={'width': 1024, 'height': 768}, has_touch=True, is_mobile=True)
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('dialog', lambda d: d.accept())
        pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
        pg.goto(f'{base}/index.html'); pg.wait_for_timeout(1500)
        pg.evaluate('startDemo()'); pg.wait_for_timeout(800)
        pg.evaluate("document.querySelector('#dpCap .go').click()"); pg.wait_for_timeout(500)
        pg.evaluate("tab('docs');startReview()"); pg.wait_for_timeout(2500)
        pg.evaluate("(()=>{const g=getFile;window.getFile=async(...a)=>{await new Promise(r=>setTimeout(r,700));return g(...a)}})()")
        ri0 = pg.evaluate('RI')
        pg.tap('#rOk'); pg.wait_for_timeout(1000)
        pg.evaluate("document.getElementById('rOk').click()"); pg.wait_for_timeout(2000)
        ri1 = pg.evaluate('RI')
        pg.wait_for_timeout(800); pg.tap('#rOk'); pg.wait_for_timeout(2000)
        ri2 = pg.evaluate('RI')
        check('慢網路下按兩下「符合」不會未看就通過下一份；看過後再按仍可前進', ri1 == ri0 + 1 and ri2 == ri0 + 2 and not errs, f'{ri0}->{ri1}->{ri2} {errs}')
        ctx.close()

        # 6b. 核對視窗：iPad 橫向／筆電 768 高、手機，「符合」「退回」「稍後繼續」不必捲動就看得到（2026/11/10 巡檢發現 iPad 橫向要往下捲才看得到「符合」）
        for (w, h, touch) in [(1024, 768, True), (768, 1024, True), (1366, 768, False), (1280, 720, False), (390, 844, True), (360, 640, True)]:
            ctx = b.new_context(viewport={'width': w, 'height': h}, has_touch=touch, is_mobile=touch)
            pg = ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('dialog', lambda d: d.accept())
            pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
            pg.goto(f'{base}/index.html'); pg.wait_for_timeout(1500)
            pg.evaluate('startDemo()'); pg.wait_for_timeout(800)
            pg.evaluate("document.querySelector('#dpCap .go').click()"); pg.wait_for_timeout(500)
            pg.evaluate("tab('docs');startReview()"); pg.wait_for_timeout(2500)
            bad = []
            for i in range(4):
                v = pg.evaluate("""()=>['#rTitle','#rOk','#rBad','#rdlg .dlg-h .btn'].filter(s=>{const r=document.querySelector(s).getBoundingClientRect();return !(r.height>0&&r.top>=0&&r.bottom<=innerHeight+1&&r.right<=innerWidth+1)})""")
                if v: bad.append((i, v))
                pg.evaluate('revSkip()'); pg.wait_for_timeout(900)
            check(f'核對視窗 {w}×{h} 標題與符合／退回按鈕不必捲動即可見', not bad and not errs, f'{bad} {errs}')
            ctx.close()

        # 6b2. 平板橫直切換：旋轉過的文件要依新寬度重新排版，不可撐破預覽框（2026/11/17 委員核對深測發現 iPad 直轉橫後超出 104px）
        #      長者按「退回」手抖多按一下：退回原因視窗剛出現 0.45 秒內的點按不算（2026/11/17 優化）
        for (w, h) in [(768, 1024), (390, 844)]:
            ctx = b.new_context(viewport={'width': w, 'height': h}, has_touch=True, is_mobile=True)
            pg = ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('dialog', lambda d: d.accept())
            pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
            pg.goto(f'{base}/index.html'); pg.wait_for_timeout(1500)
            pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
            pg.evaluate('startDemo()'); pg.wait_for_timeout(800)
            pg.evaluate("document.querySelector('#dpCap .go').click()"); pg.wait_for_timeout(500)
            pg.evaluate("tab('docs');startReview()"); pg.wait_for_timeout(2500)
            bb = pg.evaluate("(r=>[r.x+r.width/2,r.y+r.height/2])(rBad.getBoundingClientRect())")
            pg.touchscreen.tap(*bb); pg.wait_for_timeout(250); pg.touchscreen.tap(*bb); pg.wait_for_timeout(400)
            pg.evaluate("document.querySelector('#bChips [data-i]').click()"); pg.wait_for_timeout(100)
            dbl = pg.evaluate("[bdlg.open,document.querySelectorAll('#bChips .on').length,document.activeElement&&document.activeElement.id]")
            check(f'退回原因視窗 {w}×{h}：手抖多按一下不會誤選原因或叫出鍵盤，之後可正常點選', dbl[0] and dbl[1] == 1 and dbl[2] != 'bNote', dbl)
            pg.evaluate("bdlg.close()"); pg.wait_for_timeout(1000)
            for i in range(10):
                if pg.evaluate("!!document.querySelector('#rView img')"): break
                pg.wait_for_timeout(750); pg.evaluate('revSkip()'); pg.wait_for_timeout(1200)
            pg.evaluate('vr()'); pg.wait_for_timeout(300)
            pg.set_viewport_size({'width': h, 'height': w}); pg.wait_for_timeout(800)
            o = pg.evaluate("(()=>{const im=rView.querySelector('img');if(!im)return null;const r=im.getBoundingClientRect(),b=rView.getBoundingClientRect();return [Math.round(r.width),Math.round(b.width),rView.scrollWidth-rView.clientWidth]})()")
            check(f'核對視窗 {w}×{h} 旋轉文件後橫直切換，圖片依新寬度排版不撐破', o and o[2] <= 1 and o[0] >= o[1] * 0.85 - 40 and not errs, f'{o} {errs}')
            ctx.close()

        # 6c. 150% 字級（畫面寬 260）學生頁各畫面不可橫向溢出（2026/11/13 巡檢發現申請表與步驟列超出 40px）
        pg, errs = new_page(b, base, 260, 700)
        pg.goto(f'{base}/apply.html'); pg.wait_for_timeout(1500)
        pg.evaluate("startDemo()"); pg.wait_for_timeout(500)
        pg.evaluate("(()=>{const g=document.querySelector('#dpCap .go');if(g)g.click()})()"); pg.wait_for_timeout(800)
        ov = {}
        for v in ['home', 'login', 'form', 'code', 'docs', 'done']:
            pg.evaluate(f"(()=>{{try{{if('{v}'==='form')startNew();else go('{v}')}}catch(e){{}}}})()"); pg.wait_for_timeout(300)
            ov[v] = pg.evaluate('document.documentElement.scrollWidth')
        check('學生頁寬 260（150% 字級）各畫面無橫向溢出', all(x <= 261 for x in ov.values()) and not errs, f'{ov} {errs}')
        pg.close()

        # 6d. 學生上傳：改副檔名的假 PDF／HEIC 要在上傳前擋下並說明；真 PDF 照常上傳（2026/11/13 巡檢發現只看副檔名）
        pg, errs = new_page(b, base, 390, 844)
        pg.goto(f'{base}/apply.html'); pg.wait_for_timeout(1500)
        pg.evaluate("startDemo()"); pg.wait_for_timeout(500)
        pg.evaluate("(()=>{const g=document.querySelector('#dpCap .go');if(g)g.click()})()"); pg.wait_for_timeout(1000)
        up = pg.evaluate("""(async()=>{const pad='x'.repeat(4000);
          const fs=[['d_rec',new File(['<!doctype html><html><body>'+pad+'</body></html>'],'成績單.pdf',{type:'application/pdf'})],
            ['d_merit',new File([new Uint8Array([0x50,0x4b,3,4,...new Array(4000).fill(65)])],'推薦函.pdf',{type:'application/pdf'})],
            ['d_unemp',new File([new Uint8Array([0,0,0,24,...[...'ftypheic'].map(c=>c.charCodeAt(0)),...new Array(4000).fill(0)])],'IMG.jpg',{type:'image/jpeg'})],
            ['d_hh',new File(['%PDF-1.4\\n'+pad],'謄本.pdf',{type:'application/pdf'})]];
          const out=[];for(const[k,f]of fs){await pick(k,{files:[f],set value(v){}});await new Promise(r=>setTimeout(r,600));const u=(UP[k]||[]).slice(-1)[0]||{};out.push(u.st+'|'+u.msg)}return out})()""")
        check('學生上傳：網頁／Word 改成 .pdf 會被擋並說明', all(x.startswith('bad|') and '內容不是 PDF' in x for x in up[:2]), up)
        check('學生上傳：HEIC 改成 .jpg 會提示 iPhone 設定', up[2].startswith('bad|') and 'HEIC' in up[2], up)
        check('學生上傳：真正的 PDF 照常上傳', up[3].startswith('done|') and not errs, f'{up} {errs}')
        pg.evaluate("go('docs')"); pg.wait_for_timeout(400)
        small = pg.evaluate("[...document.querySelectorAll('#v-docs button,#v-docs label.up')].filter(e=>e.offsetParent&&e.getBoundingClientRect().height<44).map(e=>e.textContent.trim().slice(0,10))")
        check('學生文件頁按鈕（含「刪除」）高度至少 44px', not small, small)
        pg.close()

        # 6d2. 同一個檔案重複上傳要提醒（按取消不上傳；不同檔案不提醒）（2026/11/14 優化）
        pg = b.new_page(viewport={'width': 390, 'height': 844}); errs = []; dl = []; ans = {'v': False}
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('dialog', lambda d: (dl.append(d.message), d.accept() if (ans['v'] or d.type != 'confirm') else d.dismiss()))
        pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
        pg.goto(f'{base}/apply.html'); pg.wait_for_timeout(1500)
        pg.evaluate("window.wdlg&&wdlg.open&&wdlg.close()")
        pg.evaluate("startDemo()"); pg.wait_for_timeout(500)
        pg.evaluate("(()=>{const g=document.querySelector('#dpCap .go');if(g)g.click()})()"); pg.wait_for_timeout(1000)
        JS_UP = """async([k,body])=>{const f=new File(['%PDF-1.4\\n'+body+'x'.repeat(4000)],'scan.pdf',{type:'application/pdf'});const n0=(ST.docs||[]).length;await pick(k,{files:[f],set value(v){}});await new Promise(r=>setTimeout(r,600));return (ST.docs||[]).length-n0}"""
        a1 = pg.evaluate(JS_UP, ['d_hh', 'A']); n_d1 = len(dl)
        a2 = pg.evaluate(JS_UP, ['d_prop', 'A']); n_d2 = len(dl)
        a3 = pg.evaluate(JS_UP, ['d_prop', 'B']); n_d3 = len(dl)
        ans['v'] = True
        a4 = pg.evaluate(JS_UP, ['d_prop', 'A'])
        check('學生上傳：同一檔案重複上傳會提醒，按取消不上傳；不同檔案不提醒；確定仍可上傳',
              a1 == 1 and n_d1 == 0 and a2 == 0 and n_d2 == 1 and '剛才已經上傳' in dl[0] and a3 == 1 and n_d3 == 1 and a4 == 1 and not errs,
              f'{[a1, a2, a3, a4]} {dl} {errs}')
        pg.close()

        # 6d3. 上傳中按登出要提醒「還有 N 個檔案正在上傳」，按取消不登出；上傳中關閉／重新整理頁面要攔下（2026/11/20 優化）
        pg = b.new_page(viewport={'width': 390, 'height': 844}); errs = []; dl = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('dialog', lambda d: (dl.append(d.message), d.dismiss()))
        pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
        pg.goto(f'{base}/apply.html'); pg.wait_for_timeout(1500)
        pg.evaluate("window.wdlg&&wdlg.open&&wdlg.close()")
        pg.evaluate("startDemo()"); pg.wait_for_timeout(500)
        pg.evaluate("(()=>{const g=document.querySelector('#dpCap .go');if(g)g.click()})()"); pg.wait_for_timeout(1000)
        BU = "(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})()"
        r0 = pg.evaluate("(()=>{UP.d_hh=[{name:'a.jpg',st:'run',msg:''},{name:'b.jpg',st:'run',msg:''}];logout();return !!ME})()")
        bu1 = pg.evaluate(BU)
        r1 = pg.evaluate("(()=>{for(const k in UP)delete UP[k];logout();return !!ME})()")
        bu0 = pg.evaluate("CURV='docs',FDIRTY=false," + BU)
        check('學生頁：上傳中按登出會提醒「正在上傳」，按取消仍保持登入；沒在上傳時不多提醒',
              r0 and r1 and len(dl) == 2 and '還有 2 個檔案正在上傳' in dl[0] and '正在上傳' not in dl[1] and not errs, f'{r0} {r1} {dl} {errs}')
        check('學生頁：上傳中關閉或重新整理頁面會被攔下確認，沒在上傳時不攔', bu1 and not bu0, f'{bu1} {bu0}')
        pg.close()

        # 6e. 安全：申請資料含惡意字串時，後台各分頁與核對視窗、學生申請表都不可執行（XSS）
        pg, errs = new_page(b, base)
        pg.goto(f'{base}/index.html'); pg.wait_for_timeout(1500)
        pg.evaluate('startDemo()'); pg.wait_for_timeout(800)
        pg.evaluate("document.querySelector('#dpCap .go').click()"); pg.wait_for_timeout(800)
        XP = '"><img src=x onerror="window.__x=1"><svg onload="window.__x=1">\'`<script>window.__x=1</script>'
        pg.evaluate("""P=>{for(const a of APPS){for(const k of Object.keys(a)){if(typeof a[k]==='string'&&!/^(level|div|nation|family|demerit|gov|welfare|disab|house|prev)$/.test(k)&&!/^d_/.test(k))a[k]+=P}a.memo=P;a.overNote=P}render()}""", XP)
        for t in ['data', 'result', 'docs', 'groups', 'settings', 'home']:
            try: pg.evaluate(f"tab('{t}')"); pg.wait_for_timeout(300)
            except Exception: pass
        pg.evaluate("tab('docs');startReview()"); pg.wait_for_timeout(2500)
        xs = pg.evaluate("[window.__x||0, document.querySelectorAll('img[src=x],svg[onload]').length]")
        check('後台：惡意字串不會被執行（XSS）', xs == [0, 0] and not errs, f'{xs} {errs}')
        pg.close()
        # 45c. 文件檔名、檢查說明、退回原因、審查人員、異動紀錄、設定含惡意字串（2026/11/20 安全深測）
        pg, errs = new_page(b, base)
        pg.goto(f'{base}/index.html'); pg.wait_for_timeout(1500)
        pg.evaluate('startDemo()'); pg.wait_for_timeout(800)
        pg.evaluate("document.querySelector('#dpCap .go').click()"); pg.wait_for_timeout(800)
        pg.evaluate("""async P=>{const c=SBC;
          await c.from('documents').update({file_name:P+'.jpg',review_note:P,ai:{summary:P,issues:[P],fields:{name:P},error:P}});
          await c.from('reviewers').update({name:P});
          await c.from('audit_log').insert({at:new Date().toISOString(),who:P,action:P,tbl:'applicants',row_id:P,before:{name:P},after:{name:P+'2',memo:P}});
          const s=await c.from('settings').select('*').eq('id',1).single();const d=s.data.data;for(const k in d)d[k]=String(d[k])+P;await c.from('settings').update({data:d}).eq('id',1)}""", XP)
        for f in ['cloudLoad()', 'loadReviewers()', 'loadAudit()']:
            try: pg.evaluate(f); pg.wait_for_timeout(1000)
            except Exception as e: errs.append(f'{f}: {e}')
        for t in ['home', 'data', 'result', 'docs', 'groups', 'settings']:
            try: pg.evaluate(f"tab('{t}')"); pg.wait_for_timeout(300)
            except Exception: pass
        pg.evaluate("tab('docs');startReview()"); pg.wait_for_timeout(2500)
        xs = pg.evaluate("[window.__x||0, document.querySelectorAll('img[src=x],svg[onload]').length, document.body.innerText.includes('onerror=')]")
        check('後台：文件檔名、檢查說明、審查人員、異動紀錄、設定含惡意字串不會被執行（XSS）', xs == [0, 0, True] and not errs, f'{xs} {errs}')
        pg.close()
        pg, errs = new_page(b, base, 390, 844)
        pg.goto(f'{base}/apply.html'); pg.wait_for_timeout(1500)
        pg.evaluate("startDemo()"); pg.wait_for_timeout(400)
        pg.evaluate("(()=>{const g=document.querySelector('#dpCap .go');if(g)g.click()})()"); pg.wait_for_timeout(600)
        pg.evaluate("go('home');startNew()"); pg.wait_for_timeout(300)
        pg.evaluate("P=>{for(const e of document.querySelectorAll('#v-form input:not([type=checkbox]):not([type=radio]),#v-form textarea')){e.value=P;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}}", XP)
        pg.wait_for_timeout(500)
        xs = pg.evaluate("[window.__x||0, document.querySelectorAll('img[src=x],svg[onload]').length]")
        check('學生頁：惡意字串不會被執行（XSS）', xs == [0, 0] and not errs, f'{xs} {errs}')
        pg.close()

        # 6f. 小手機（320×568、360×640）導覽：說明框不可蓋住標示物、標示物要在畫面內、開始示範後 0 個對外請求（2026/11/14 巡檢發現 320 寬時說明框蓋住標示物 43–100%）
        STEP = """()=>{const c=document.getElementById('dpCap');if(!c||c.dataset.off)return null;const cr=c.getBoundingClientRect();const h=document.querySelector('.dp-hl');let ov=0,vis=true,top=null;
          if(h){const r=h.getBoundingClientRect();top=Math.round(r.top);const x=Math.max(0,Math.min(cr.right,r.right)-Math.max(cr.left,r.left)),y=Math.max(0,Math.min(cr.bottom,r.bottom)-Math.max(cr.top,r.top));ov=r.width*r.height?Math.round(100*x*y/(r.width*r.height)):0;vis=r.bottom>0&&r.top<innerHeight}
          return [c.querySelector('.n').textContent,ov,vis,top,cr.top>=-1&&cr.bottom<=innerHeight+1]}"""
        for path, total in [('index.html', 15), ('apply.html', 9)]:
            for (w, h) in [(320, 568), (360, 640)]:
                ctx = b.new_context(viewport={'width': w, 'height': h}, has_touch=True, is_mobile=True)
                pg = ctx.new_page(); errs = []; ext = []
                pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('dialog', lambda d: d.accept())
                pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else (ext.append(r.request.url[:60]), r.abort()))
                pg.goto(f'{base}/{path}'); pg.wait_for_timeout(1500)
                pg.evaluate("window.wdlg&&wdlg.open&&wdlg.close()"); ext.clear()
                pg.evaluate('startDemo()'); pg.wait_for_timeout(800)
                bad = []
                for k in range(total):
                    t0 = time.time(); s = pg.evaluate(STEP)
                    while s and time.time() - t0 < 12:
                        time.sleep(0.8); s2 = pg.evaluate(STEP)
                        if s2 and s2[0] == s[0] and s2[1] == s[1] and s2[3] == s[3]: s = s2; break
                        s = s2
                    if not s: bad.append(f'{k}: 說明框消失'); break
                    if s[1] > 40 or not s[2] or not s[4]: bad.append(s)
                    if s[0].startswith(f'{total} / {total}'): break
                    pg.evaluate("document.querySelector('#dpCap .nx').click()"); pg.wait_for_timeout(300)
                check(f'{path} 導覽 {w}×{h}：說明框不蓋住標示物、標示物在畫面內', not bad and not errs, f'{bad} {errs}')
                check(f'{path} 導覽 {w}×{h}：開始示範後對正式資料庫 0 請求', not ext, ext[:3])
                ctx.close()

        # 6g. 導覽最後一步（2026/11/21 示範導覽深測發現）：後台最後一步原本標示整條藍色示範列，綠框超出畫面左右、上下被遮，幾乎看不到；
        #     改為標示「離開示範」按鈕，綠框要完整在畫面內。最後一步只留「開始操作」（綠色主按鈕），不再並列功能相同的「結束介紹」。
        LAST = """()=>{const c=document.getElementById('dpCap');if(!c||c.dataset.off)return null;const e=document.querySelector('.dp-hl');const vis=x=>!!x.offsetParent&&getComputedStyle(x).display!='none';
          const nx=c.querySelector('.nx'),go=c.querySelector('.go');let box=null;if(e){const r=e.getBoundingClientRect();box=r.left-7>=0&&r.right+7<=innerWidth&&r.top-7>=0&&r.bottom+7<=innerHeight}
          return [c.querySelector('.n').textContent,e?(e.id||e.tagName):'',box,nx.textContent,vis(go),getComputedStyle(nx).backgroundColor]}"""
        for path, total, want in [('index.html', 15, 'demoExit'), ('apply.html', 9, None)]:
            for (w, h) in [(390, 844), (768, 1024), (1400, 900)]:
                pg, errs = new_page(b, base, w, h)
                pg.goto(f'{base}/{path}'); pg.wait_for_timeout(1500)
                pg.evaluate("window.wdlg&&wdlg.open&&wdlg.close()")
                pg.evaluate('startDemo()'); pg.wait_for_timeout(600)
                first = pg.evaluate(LAST)
                for _ in range(total - 1):
                    pg.wait_for_timeout(250); pg.evaluate("document.querySelector('#dpCap .nx').click()")
                t0 = time.time(); s = None
                while time.time() - t0 < 20:
                    s = pg.evaluate(LAST)
                    if s and s[0].startswith(f'{total} / {total}') and (want is None or s[1] == want) and s[2]: break
                    time.sleep(0.4)
                ok = (first and first[4] and first[3] == '下一步' and s and s[0].startswith(f'{total} / {total}') and s[3] == '開始操作'
                      and not s[4] and s[5] == 'rgb(61, 107, 47)' and (want is None or (s[1] == want and s[2])))
                check(f'{path} 導覽最後一步 {w}×{h}：只留綠色「開始操作」' + ('、標示「離開示範」完整在畫面內' if want else ''), ok and not errs, f'{first} {s} {errs}')
                if ok:
                    pg.keyboard.press('Escape'); pg.wait_for_timeout(600)
                    gone = pg.evaluate("(()=>{const c=document.getElementById('dpCap');return (!c||!!c.dataset.off)&&!document.querySelector('.dp-hl')})()")
                    check(f'{path} 導覽最後一步 {w}×{h}：Esc 仍可結束介紹', gone, '')
                pg.close()

        # 3c. 學生手機：錯誤提示不可殘留（2026/11/16 學生手機深測發現）
        pg, errs = new_page(b, base, 375, 667)
        pg.goto(f'{base}/apply.html'); pg.wait_for_timeout(1200)
        pg.evaluate("window.wdlg&&wdlg.open&&wdlg.close()")
        pg.evaluate("startDemo()"); pg.wait_for_timeout(500)
        pg.evaluate("(()=>{const g=document.querySelector('#dpCap .go');if(g)g.click()})()"); pg.wait_for_timeout(800)
        pg.evaluate("ME=null;go('home')"); pg.click('#startBtn'); pg.click('#sendBtn'); pg.wait_for_timeout(300)
        shown = pg.evaluate("[!err1.classList.contains('hidden'),document.querySelectorAll('#v-form .emsg').length]")
        pg.evaluate("go('home')"); pg.click('#startBtn'); pg.wait_for_timeout(300)
        a = pg.evaluate("[!err1.classList.contains('hidden'),document.querySelectorAll('#v-form .emsg,#v-form .err').length]")
        pg.click('#sendBtn'); pg.wait_for_timeout(300)
        pg.evaluate("(async()=>{ME={no:'U001',code:'DEMO2026'};await refresh(true);go('docs');editForm()})()"); pg.wait_for_timeout(600)
        e = pg.evaluate("[CURV,!err1.classList.contains('hidden'),document.querySelectorAll('#v-form .emsg,#v-form .err').length]")
        check('學生頁：重新開始申請或修改申請時，不可殘留上次的「有 N 處需修正」與紅框', shown[0] and shown[1] > 0 and a == [False, 0] and e == ['form', False, 0], (shown, a, e))
        pg.evaluate("ME=null;go('login')"); pg.fill('#lgNo', 'U001'); pg.fill('#lgCode', 'ABC'); pg.press('#lgCode', 'Enter'); pg.wait_for_timeout(300)
        s1 = pg.evaluate("!lgErr.classList.contains('hidden')")
        pg.evaluate("go('home');go('login')")
        check('學生頁：離開查詢畫面再回來，不殘留上次的登入錯誤訊息', s1 and pg.evaluate("lgErr.classList.contains('hidden')"), s1)
        pg.evaluate("go('form')")
        hs = pg.evaluate("[...document.querySelectorAll('details.help summary')].filter(x=>x.offsetParent).map(x=>Math.round(x.getBoundingClientRect().height))")
        pg.evaluate("go('docs')"); pg.wait_for_timeout(300)
        hs += pg.evaluate("[...document.querySelectorAll('details.help summary')].filter(x=>x.offsetParent).map(x=>Math.round(x.getBoundingClientRect().height))")
        check('學生頁「個資告知全文」「申請方式」展開鈕高度至少 44px', hs and min(hs) >= 44, hs)
        check('學生手機錯誤提示測試無程式錯誤', not errs, errs)
        pg.close()

        # 3d. 承辦設定、匯出、列印（2026/11/18 承辦深測發現）
        pg, errs = new_page(b, base)
        pg.goto(f'{base}/index.html?offline'); pg.wait_for_timeout(1000)
        pg.evaluate("loadDemo()"); pg.click('nav button[data-t=settings]'); pg.wait_for_timeout(300)
        pg.evaluate("window.__d=[];window.__ans=[];window.alert=m=>__d.push('A:'+m);window.confirm=m=>{__d.push('C:'+m);return __ans.length?__ans.shift():true}")
        def try_set(k, v, ans=None):
            return pg.evaluate("([k,v,ans])=>{renderSettings();Object.assign(S,DEF);const e=document.querySelector('[data-s='+k+']');e.value=v;e.dispatchEvent(new Event('input'));__d=[];__ans=ans||[];saveSettings();const r=__d.slice();Object.assign(S,DEF);return r}", [k, v, ans])
        d0 = try_set('aRatio', '0'); d1 = try_set('aRatio', '1', [False])
        check('設定：電子電機比例填 0 要擋下；填 1（＝100%）要確認，取消就不存', not any('已儲存' in m for m in d0) and any(m.startswith('C:') and '100%' in m for m in d1) and not any('已儲存' in m for m in d1), (d0, d1))
        d2 = try_set('incomeLimit', '10000', [False]); d3 = try_set('incomeLimit', '100萬')
        pg.evaluate("renderSettings()"); pg.fill('[data-s=incomeLimit]', '1000000')
        live = pg.evaluate("(document.getElementById('sm-incomeLimit')||{}).textContent")
        check('設定：所得上限填 1 萬要確認是否少打 0，填 100萬 照常儲存；輸入時顯示「＝ 100 萬元」', any(m.startswith('C:') and '1 萬元' in m for m in d2) and not any('已儲存' in m for m in d2) and any('已儲存' in m for m in d3) and live and '100 萬元' in live, (d2, d3, live))
        pg.evaluate("Object.assign(S,DEF);render();APPS[1].score='85.5';render()")
        cell = pg.evaluate("(async()=>{await loadXLSX();let wb;const w=XLSX.writeFile;XLSX.writeFile=x=>{wb=x};exportResults();await new Promise(r=>setTimeout(r,300));XLSX.writeFile=w;const ws=wb.Sheets['大學部'];const hd=XLSX.utils.sheet_to_json(ws,{header:1})[0];const c=hd.indexOf('成績');const r=XLSX.utils.decode_range(ws['!ref']);const t=[];for(let i=1;i<=r.e.r;i++){const x=ws[XLSX.utils.encode_cell({r:i,c})];if(x)t.push(x.t)}return [c,[...new Set(t)]]})()")
        check('匯出初篩結果：成績欄存成數字（不是文字）', cell[0] >= 0 and cell[1] == ['n'], cell)
        try:
            import pdfplumber, logging
            logging.getLogger('pdfminer').setLevel(logging.ERROR)
            small, broken = {}, {}
            for t in ['result', 'data', 'groups', 'docs']:
                pg.click(f'nav button[data-t={t}]'); pg.wait_for_timeout(300)
                pg.evaluate("window.dispatchEvent(new Event('beforeprint'))")
                pg.emulate_media(media='print'); pg.set_viewport_size({'width': 1047, 'height': 700})
                br = pg.evaluate("""[...document.querySelectorAll('main table tr')].filter(r=>r.offsetParent).flatMap(r=>[...r.cells].slice(0,4)).filter(td=>{const b=td.querySelector(':scope>b')||(/^[A-Z]\\d{2,}$/.test(td.textContent.trim())?td:null);if(!b)return false;const n=b.firstChild&&b.firstChild.nodeType==3?b.firstChild:b;const rg=document.createRange();rg.selectNodeContents(n);return new Set([...rg.getClientRects()].map(x=>Math.round(x.top))).size>1}).map(td=>td.textContent.trim().slice(0,8)).slice(0,5)""")
                fn = os.path.join(tempfile.gettempdir(), f'qa_print_{t}.pdf'); pg.pdf(path=fn, prefer_css_page_size=True)
                pg.emulate_media(media='screen'); pg.set_viewport_size({'width': 1400, 'height': 900})
                with pdfplumber.open(fn) as d:
                    land = d.pages[0].width > d.pages[0].height
                    sz = sorted({round(c['size'], 1) for pp in d.pages for c in pp.chars if c['text'].strip() and c['size'] < 11.9})
                if sz or not land: small[t] = (sz, land)
                if br: broken[t] = br
                os.remove(fn)
            check('列印：初篩結果、申請人、審查分組、文件核對都是 A4 橫式且全部文字 ≥12pt（文件核對表不可超出頁寬被縮小）', not small, small)
            check('列印：編號與姓名不可被擠成一字一行', not broken, broken)
        except ImportError:
            check('列印檢查需要 pdfplumber（pip install pdfplumber）', False)
        check('承辦設定／匯出／列印測試無程式錯誤', not errs, errs)
        pg.close()

        # 7. 手機版不橫向溢出
        for path in ['apply.html', 'index.html?offline']:
            pg, errs = new_page(b, base, 390, 844)
            pg.goto(f'{base}/{path}'); pg.wait_for_timeout(1200)
            sw = pg.evaluate('document.documentElement.scrollWidth')
            check(f'{path} 手機寬 390 無橫向溢出', sw <= 391, sw)
            pg.close()
        b.close()

    fails = [r for r in RESULTS if not r[1]]
    print(f'\n共 {len(RESULTS)} 項，通過 {len(RESULTS) - len(fails)}，失敗 {len(fails)}')
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
