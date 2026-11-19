---
rdq_version: 1
task: 依 station_4_shark_sanctuary.png 精雕大白鯊神殿紋理、角色與光影
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

# RDQ 需求規格：大白鯊水晶守門神殿 1:1 紋理與細節精雕

## 一句話任務
對照 [station_4_shark_sanctuary.png](file:///g:/我的雲端硬碟/115四上作文/ocean-writing-adventure/assets/art/station_4_shark_sanctuary.png) 透過離線程序化 Canvas 貼圖與立體雕刻，全方位升級大白鯊神殿的角色造型、粉白放射大理石地磚、城堡水晶柱、波浪扇貝、弧頂金框寶箱與光影構圖。

## ✅ 已確認
- **全方位 1:1 精雕範圍**（Ⅲ）：
  1. **大白鯊・波塞頓**：立體鯊魚嘴吻輪廓、圓潤奶油白胸腹交界、側身 **三道鰓裂**、頭頂小背鰭、流線胸鰭與尾鰭、厚實鋸齒黃金皇冠、自然握持 **黃金海王三叉戟**。
  2. **聖殿地磚與貝殼紋理**：程序化離線 Canvas 繪製 **粉白交錯放射狀大理石拼花地磚**（含石縫與大理石脈紋）及 **扇貝放射波浪珠光紋理**（零外部圖檔、零 CORS）。
  3. **城堡與水晶柱**：主塔新增 **深藍拱形小窗與環形腰線**；**6 根水晶柱** 升級為「下段漸層發光柱身＋上段多面體發光鑽石晶冠」，保留 4 根成就印章插槽契約。
  4. **黃金寶藏箱**：升級為 **弧頂半圓蓋＋四角立體金框＋正面金鎖扣＋滿滿金幣珍珠與淺藍作文卷軸**，旁附散落金幣與大白珍珠。
- **光影氛圍**：採用 **柔和暖白＋青紫金水晶補光**，在暗黑深海峽谷中呈現夢幻高光立體對比（Ⅲ）

## ❓ 假設（未確認，已採預設值，隨時可推翻）
- 左側潛水艇碼頭位置 → 維持既有停泊點並微調鏡頭構圖，讓潛水艇停泊於聖殿左前方時自然入鏡
- 同步副本與對比 → 完稿後自動執行 `sync_preview.py` 同步 [preview-dev.html](file:///g:/我的雲端硬碟/115四上作文/ocean-writing-adventure/preview-dev.html) 並更新 [station_comparison.md](file:///C:/Users/ccps/.gemini/antigravity/brain/4f2e3e70-b784-458b-925c-4b4eb28ef8e9/station_comparison.md) 實機截圖

## ➕ 已採納（象限Ⅳ）
- 大白鯊加入 **手持三叉戟呼吸揮動與點頭互動動畫**（隨 4 站過關亮起水晶柱）
- 微調 `flyToIsland(4)` 英雄特寫鏡頭，精準對齊設計圖海報構圖
- 神殿後方左右點綴輕量化 **發光深海小魚與上升氣泡環繞**

## ❌ 排除項（明確不做）
- 不更動前四座潛水站模型、遠景大峽谷與 Step 1～Step 3 引導邏輯

## 📋 一段式需求規格
針對 [ocean-writing-adventure/index.html](file:///g:/我的雲端硬碟/115四上作文/ocean-writing-adventure/index.html) 的 `buildGuardianSanctuary()`，1:1 對照 [station_4_shark_sanctuary.png](file:///g:/我的雲端硬碟/115四上作文/ocean-writing-adventure/assets/art/station_4_shark_sanctuary.png) 進行紋理、雕刻與光影全面精修：使用離線程序化 Canvas 貼圖繪製 **粉白放射狀大理石拼花地磚** 與 **珠光扇貝放射波浪紋**；立體重塑 **大白鯊・波塞頓**（具鯊魚嘴吻輪廓、奶油白胸腹切線、側身三道鰓裂、頭頂背鰭、厚實黃金皇冠與自然握持之黃金三叉戟，並加入輕量化呼吸揮戟動畫）；城堡主塔補上深藍拱窗與腰線，**6 根水晶柱** 升級為下段柱身＋上段發光鑽石多面體晶冠（保留 `guardianSockets.badgePillars` 契約）；右前方寶箱升級為弧頂金框鎖扣寶箱＋散落金幣珍珠；搭配柔和暖白＋青紫金水晶補光與後方發光小魚氣泡，微調 `flyToIsland(4)` 英雄特寫鏡頭。完稿後同步 [preview-dev.html](file:///g:/我的雲端硬碟/115四上作文/ocean-writing-adventure/preview-dev.html)，並以 `node --check` 與 Playwright 實機截圖更新對比報告。

## ✔ 驗收條件
- [ ] 聖殿廣場呈現清晰粉白放射大理石拼花貼圖，左右扇貝具放射波浪珠光紋理
- [ ] 大白鯊具明顯嘴吻、奶油肚皮、三道鰓裂、背鰭、金皇冠與三叉戟呼吸揮動動畫
- [ ] 主塔拱窗、6 根雙段發光水晶柱、弧頂金框寶箱與柔和夢幻補光均與設計圖高度一致
- [ ] `node --check` 0 錯誤，Playwright Console 0 錯誤且實機截圖更新至對比報告
