# 每日巡檢作業說明

對象：社團法人台灣松樑教育公益促進協會 助學金初審系統
- 正式網站：https://scholarship-screen.github.io/scholarship-screen/（後台）、…/apply.html（學生）
- 程式庫：GitHub `vivianwh03-netizen/scholarship-screen`（main 分支即正式網站）
- 後端：Supabase 專案 `wrxvsaptmmodowvcwkeo`（資料表、RPC、Edge Function `analyze`）

## 鐵則
1. **不碰正式資料**：測試只用本機伺服器＋示範模式或 `?offline`，Playwright 一律攔截非 localhost 請求。資料庫只做 SELECT；唯一允許的寫入是：重新觸發卡住的文件檢查、用 pg_net 讀取正式網站。
2. **修 A 不能壞 B**：任何修改後必須 `python3 qa/run_all.py` 全數通過，才可推上 GitHub。
3. **不自動改的事**（只寫進日報，等 Vivian 決定）：辦法規則與名額、權限與 RLS 政策、刪除任何資料、個資告知內容的實質變更、資料庫結構變更。
4. 對外文字不可出現禁用字樣（清單見 run_all.py 的 BANNED）。
5. 修好的新問題，一定要加進 `qa/REGRESSION.md` 與 `qa/run_all.py`。

## 每日流程
1. 取得最新程式：`git pull`。
2. **自動回歸**：`pip install playwright pdfplumber --break-system-packages`（如缺），執行 `python3 qa/run_all.py`。
3. **歷次問題清單**：逐項檢查 `qa/REGRESSION.md` 的 A–G（〔自動〕已由上一步涵蓋；〔腳本〕〔資料庫〕〔線上〕項目要實際檢查）。
4. **正式網站比對**：用 Supabase `execute_sql` 執行 `select net.http_get('https://scholarship-screen.github.io/scholarship-screen/<檔名>?nc=<時間戳>')`，再讀 `net._http_response` 比對 md5 與 repo 檔案；狀態碼必須 200。
5. **後端健康**：
   - `get_advisors`（security、performance）有無新增項目。
   - Edge Function 近 24 小時錯誤（`query_logs` 或 documents 中 ai_status='error' 數量）。
   - 卡住的文件：`ai_status in ('pending','running') and created_at < now()-interval '30 minutes'` → 把 running 改回 pending 後，用 `net.http_post` 呼叫 `https://wrxvsaptmmodowvcwkeo.supabase.co/functions/v1/analyze`（body `{"document_id":"…"}`）重新觸發。
   - 今日送件數、上傳數、登入失敗鎖定數是否異常（與前 7 日平均比較，超過 3 倍要警示）。
   - 申請截止日／補件期限是否將到（7 天內提醒）。
6. **深入測試**（每天輪替一個主題，週一到週日依序）：學生手機全流程／委員核對（平板、手機、長者慢速與手抖雙擊）／承辦設定與匯入匯出列印／規則邊界值／安全（XSS、越權、檔案偽裝）／示範導覽三種尺寸／亂點測試 600 動作。
7. **修正**：發現問題就修（規則、權限等見鐵則 3 的除外），加回歸測試，`run_all.py` 全過後推上 GitHub，再做第 4 步確認正式網站已更新。
8. **優化**：每天至少找一項可以讓學生或委員更順手的小改進（字太小、按鈕難按、說明不清楚、速度慢），在不改規則的前提下完成並測試。

## 日報格式（繁體中文，用手機看得完）
- 標題：「助學金系統巡檢日報 YYYY/MM/DD」
- 一句話結論：正常／有問題已修好／有問題需要您決定
- 數字：自動測試通過幾項／共幾項、正式網站比對結果、今日送件數與上傳數
- 今天修好的問題（每項一行：問題 → 怎麼修）
- 今天的優化（一行）
- 需要 Vivian 決定的事（沒有就寫「無」）
- 明天的深入測試主題
