---
rdq_version: 1
task: 豐富深海峽谷全景環境（InstancedMesh 峭壁、礁丘、遠景生物、拱門與鳥瞰鈕）
domain: dev
date: 2026-11-19
status: confirmed
telemetry:
  mode: lite
  rounds: 1
  questions: 3
  q4_adopted: 3
  revisions: 0
downstream: self
---

# RDQ 需求規格：深海峽谷全景環境豐富化（平板高效版）

## 一句話任務
以 `THREE.InstancedMesh` 合批技術將 [ocean-writing-adventure/index.html](file:///g:/我的雲端硬碟/115四上作文/ocean-writing-adventure/index.html) 潛水站以外的空曠海域升級為 **層疊六角玄武岩大峽谷＋發光珊瑚礁丘海草林＋遠景悠游生物＋海底發光拱門**，並新增「🌌 深海全景」一鍵鳥瞰鈕。

## ✅ 已確認
- **複合式深海大地形**：外圍築起密集層疊的 **六角玄武岩大峽谷峭壁**（對齊 [ocean_canyon_environment.png](file:///g:/我的雲端硬碟/115四上作文/ocean-writing-adventure/assets/art/ocean_canyon_environment.png)），站與站之間海床鋪設 **發光珊瑚礁丘與深海海草林**（Ⅲ）
- **中遠景動態生態**：加入繞行峽谷的 **發光小魚群與魔鬼魚剪影**、**發光水母群** 與 **海底上升氣泡柱**（Ⅲ）
- **平板高效能策略**：採用 `THREE.InstancedMesh` 將 **180～250 根** 六角岩柱、發光珊瑚管與海床礁石合批渲染，極大幅降低 Draw Calls 確保平板流暢（Ⅲ）

## ❓ 假設（未確認，已採預設值，隨時可推翻）
- 航道安全淨空 → 所有新增六角岩柱、珊瑚礁與拱門皆自動計算與 **5 座潛水站**（半徑 ≥22 單位）及潛水艇下潛航線的安全距離，絕不遮擋站點或造成穿模
- 同步檢核副本 → 實作完成後自動執行 `sync_preview.py` 同步更新 [preview-dev.html](file:///g:/我的雲端硬碟/115四上作文/ocean-writing-adventure/preview-dev.html)

## ➕ 已採納（象限Ⅳ）
- 在潛水站航道間加設 **發光深海岩石拱門**（3～4 座）與 **發光導航浮標鏈**
- 底部 HUD 工具列新增 **「🌌 深海全景」** 一鍵鳥瞰按鈕（飛至全景制高點一覽五站與峽谷全貌）
- 微調深海霧氣密度（由 `0.0078` 調輕至約 `0.0056`，約減 28%），提升遠景水晶城堡與發光峽谷的縱深層次

## ❌ 排除項（明確不做）
- 不更動五座潛水站內部的 3D 模型結構與 Step 1～Step 3 寫作引導邏輯

## 📋 一段式需求規格
針對 [ocean-writing-adventure/index.html](file:///g:/我的雲端硬碟/115四上作文/ocean-writing-adventure/index.html) 潛水站以外海域過於空洞的問題，重構 `buildAbyssalCanyon()` 與全域環境：運用 `THREE.InstancedMesh` 建置 **180～250 根** 錯落層疊的 **六角玄武岩深海大峽谷峭壁**、站間海床的 **發光珊瑚礁丘與海草林**（嚴格避開五站半徑與潛水艇航道）；於航道關鍵節點配置 **3～4 座發光深海岩石拱門** 與連續 **發光導航浮標鏈**；中遠景加入 **悠游魔鬼魚剪影、發光小魚群、發光水母與海底上升氣泡柱**；將深海霧氣密度由 `0.0078` 微調至 `0.0056` 以增強遠景水晶神殿與峽谷縱深層次；並在底部 HUD 工具列新增 **「🌌 深海全景」** 一鍵鳥瞰按鈕。完稿後同步更新 [preview-dev.html](file:///g:/我的雲端硬碟/115四上作文/ocean-writing-adventure/preview-dev.html)，執行 `node --check` 與 Playwright 實機全景鳥瞰截圖驗證。

## ✔ 驗收條件
- [ ] 全景鳥瞰下，潛水站外圍呈現連綿六角玄武岩大峽谷、發光珊瑚礁丘、海草林與航道拱門，不再空洞
- [ ] 使用 `InstancedMesh` 合批渲染，Console 0 錯誤且無物件遮擋或穿刺任一座潛水站
- [ ] 點擊底部「🌌 深海全景」鈕可平滑拉遠欣賞全 5 站與峽谷全貌，遠景魔鬼魚／魚群與上升氣泡正常運作
- [ ] 同步更新 `preview-dev.html` 並通過 `node --check` 與 Playwright 全景截圖驗證
