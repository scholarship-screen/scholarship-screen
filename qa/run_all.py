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
        check('系所分類（電控、系名後附學院）', cats2[0] == 'A', cats2)
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
        check('本機模式無程式錯誤', not errs, errs)
        pg.close()

        # 3. 學生頁：金額與登入檢查
        pg, errs = new_page(b, base, 390, 844)
        pg.goto(f'{base}/apply.html'); pg.wait_for_timeout(1200)
        m = pg.evaluate("['30萬','３萬','100万','NT$30萬','-5','30萬500','3萬5','無'].map(money)")
        check('學生頁金額換算', m == ['300000', '30000', '1000000', '300000', None, '300500', '35000', '0'], m)
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
