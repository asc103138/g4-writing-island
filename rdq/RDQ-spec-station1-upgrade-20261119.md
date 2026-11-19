---
rdq_version: 1
task: 依 station_1_progress.png 優化第 2 站（承之站）3D 場景與動效
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

# RDQ 需求規格：第 2 站（承之站）1:1 概念設計圖優化

## 一句話任務
依 [station_1_progress.png](file:///g:/我的雲端硬碟/115四上作文/ocean-writing-adventure/assets/art/station_1_progress.png) 將 [ocean-writing-adventure/index.html](file:///g:/我的雲端硬碟/115四上作文/ocean-writing-adventure/index.html) 第 **2** 站（`buildOceanStation1`）1:1 補齊薄荷沙地、生態珊瑚與小生物，並加入輕量化動效與鏡頭對焦優化。

## ✅ 已確認
- **色彩與生態補齊**：將第 **2** 站沙地改為 **薄荷水藍綠**，並依設計圖補齊 **薄荷綠＆粉紫管狀海綿珊瑚叢、粉紫泡泡球珊瑚、薄荷綠海帶葉片**，以及 **小海龜、刺刺黃色小河豚、右側粉紅小水母**（Ⅲ）
- **NPC 共存**：保留現有 **彩繪海龜・阿慢** 與 **藍倒吊・多莉** 兩位 NPC，微調座標避開新生物與放大鏡／潛望鏡，維持點擊聽大綱與警示氣泡功能（Ⅲ）
- **雙軌驗證**：實作後執行 `node --check` ＋ **Playwright** 實機對焦第 **2** 站截圖比對確認（Ⅲ）

## ❓ 假設（未確認，已採預設值，隨時可推翻）
- 薄荷沙地色碼 → 預設採 `#a7f3d0`（搭配暗灰玄武岩底座 `#1e293b` 與天藍玻璃罩肋骨）
- 小河豚刺刺做法 → 預設以低多邊形小圓錐點綴於球體表面並加上 `addComicOutline`，兼顧可愛感與平板效能

## ➕ 已採納（象限Ⅳ）
- 加入輕量化動態效果：**黃銅潛望鏡緩慢左右巡視轉動、粉紅小水母輕微上下漂浮、放大鏡鏡片帶柔和青藍微光**
- 微調第 **2** 站預設對焦鏡頭（`flyToIsland(1)`），一次完整呈現「海龜＋放大鏡＋潛望鏡＋小河豚」英雄構圖
- 檢查並清除第 **2** 站外圍可能穿刺進玻璃罩的海草或珊瑚裝飾

## ❌ 排除項（明確不做）
- 不更動第 **1** 站、第 **3** 站、第 **4** 站與大白鯊神殿的現有結構
- 不移除或取代原本的兩位 NPC 精靈角色

## 📋 一段式需求規格
針對 [ocean-writing-adventure/index.html](file:///g:/我的雲端硬碟/115四上作文/ocean-writing-adventure/index.html) 的第 **2** 站（`id: 1` 承之站・外貌與優點），對照概念設計圖 [station_1_progress.png](file:///g:/我的雲端硬碟/115四上作文/ocean-writing-adventure/assets/art/station_1_progress.png) 進行 1:1 視覺與動效優化：將站內沙地調整為 **薄荷水藍綠**（`0xa7f3d0`），保留雙層圓形大理石台階、翠綠海龜、黃金放大鏡與黃銅 L 型潛望鏡，補齊左側 **薄荷綠＆粉紫管狀海綿珊瑚、粉紫泡泡球珊瑚、薄荷綠海帶葉片**，以及前方 **小海龜、刺刺黃色小河豚、右側粉紅小水母**；同時微調 `ISLAND_NPCS[1]` 兩位精靈位置避免遮擋或重疊，清除外圍穿刺進玻璃罩的雜物，並加入潛望鏡緩慢轉動、粉紅水母漂浮與放大鏡微光動效，最後優化 `flyToIsland(1)` 對焦鏡頭，完成 `node --check` 與 **Playwright** 實機截圖驗證。

## ✔ 驗收條件
- [ ] 第 2 站沙地、珊瑚海綿、海帶、小海龜、小河豚、粉紅小水母與設計圖 `station_1_progress.png` 高度一致
- [ ] NPC 精靈位置不與新物件重疊，玻璃罩內外乾淨無穿模
- [ ] 潛望鏡轉動、水母漂浮、放大鏡微光與 `flyToIsland(1)` 對焦正常運作
- [ ] `node --check` 0 錯誤，Playwright Console 0 錯誤且截圖確認通過
