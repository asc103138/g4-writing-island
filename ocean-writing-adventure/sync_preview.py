# -*- coding: utf-8 -*-
"""一鍵從 index.html 同步產生教師／開發者快速檢核副本 preview-dev.html"""
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
src_path = os.path.join(base_dir, "index.html")
dst_path = os.path.join(base_dir, "preview-dev.html")

with open(src_path, "r", encoding="utf-8") as f:
    s = f.read()

# 1. 標題與醒目檢核模式標記
s = s.replace(
    "<title>海底探險・《我最○○的人》3D 作文潛水站與大白鯊神殿</title>",
    "<title>🧪 [檢核副本] 海底探險・《我最○○的人》免驗證全解鎖版</title>"
)
dev_badge = '''      <span style="background:#ef4444; color:#fff; font-size:12px; font-weight:900; padding:4px 10px; border-radius:999px; white-space:nowrap; letter-spacing:0.5px;">🧪 檢核副本・全站免驗證</span>
      <button class="btn-top" style="background:#10b981; color:#fff; border-color:#059669; font-weight:900;" onclick="window.islandApp.devAutoFillCurrent()" title="一鍵填入當前站點示範作答，方便立即測試 Step 2 與大白鯊全文抄寫">⚡ 一鍵填示範</button>
'''
s = s.replace(
    '<button class="btn-top" id="ooTopicBtn"',
    dev_badge + '      <button class="btn-top" id="ooTopicBtn"'
)

# 2. 獨立 localStorage key 並停用雲端同步（避免汙染正式試算表）
s = s.replace("g4_ocean_person_state_v1", "g4_ocean_preview_dev_v1")
s = s.replace("if (!skipCloud && this.currentUser && this.gasApiUrl) {", "if (false && !skipCloud && this.currentUser && this.gasApiUrl) {")

# 3. 預設全站解鎖、迷霧全散、教師模式開啟
s = s.replace("this.teacherMode = false;", "this.teacherMode = true;")
s = s.replace(
    "this.teacherApprovals = [false, false, false, false];",
    "this.teacherApprovals = [true, true, true, true];"
)
s = s.replace(
    "this.teacherApprovals = data.teacherApprovals || [false, false, false, false];",
    "this.teacherApprovals = [true, true, true, true];"
)
s = s.replace(
    "this.teacherMode = data.teacherMode !== undefined ? data.teacherMode : false;",
    "this.teacherMode = true;"
)

# 4. Step 1、Step 2 與 Step 3 全面免驗證直通，並新增 devAutoFillCurrent() 一鍵示範填寫
s = s.replace(
    "      validateStep1Required() {",
    "      validateStep1Required() {\n        return true; // 🧪 檢核副本：略過必填與詞組限制，自由切換各步驟檢查\n      }\n      _origValidateStep1Required() {"
)
s = s.replace(
    "      validateStep2Required() {",
    "      validateStep2Required() {\n        return true; // 🧪 檢核副本：略過 Step 2 修辭必選限制，自由切換步驟檢查\n      }\n      _origValidateStep2Required() {"
)
s = s.replace(
    "      validateStep3Required() {",
    "      validateStep3Required() {\n        return true; // 🧪 檢核副本：略過段落必填限制\n      }\n      devAutoFillCurrent() {\n        const idx = this.currentIsland ?? 0;\n        const d = CURRICULUM_DATA[idx];\n        if (!d || idx >= 4) return;\n        if (!state.elementSelections[idx]) state.elementSelections[idx] = { time: 0, place: 0, person: 0, object: 0, event: 0 };\n        ['time', 'place', 'person', 'object', 'event'].forEach(k => {\n          const opt = (d.elementOptions && d.elementOptions[k] && d.elementOptions[k].options && d.elementOptions[k].options[0]) || '示範內容';\n          state.elementSelections[idx][`${k}_custom`] = opt;\n          const el = document.getElementById(`masterInput_${k}`);\n          if (el) el.value = opt;\n        });\n        if (!state.step2ExplicitChosen) state.step2ExplicitChosen = [[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]];\n        state.step2ExplicitChosen[idx] = [true, true, true, true];\n        if (!state.pirlsCheckedState) state.pirlsCheckedState = [[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]];\n        state.pirlsCheckedState[idx] = [true, true, true, true];\n        if (state.step2EditedSentences) state.step2EditedSentences[idx] = {};\n        if (d.peer) state.paragraphs[idx] = d.peer.replace(/^[「」]|[「」]$/g, '');\n        state.saveState(true);\n        this.renderStep2Sentences(d);\n        this.renderStep3Editor(d);\n        this.showToast(`⚡ 已一鍵填入【${d.shortName}】示範作答、修辭挑選與 PIRLS 檢核！`);\n      }\n      _origValidateStep3Required() {"
)

# 5. 關閉啟動自動彈出大綱視窗與首次點擊強制全螢幕（方便檢核切換視窗）
s = s.replace("this.openOutlineModal();", "// 🧪 檢核副本：啟動不自動彈出大綱視窗")
s = s.replace("this.setupAutoFullscreenAndScaleLock();", "// 🧪 檢核副本：不強制鎖定全螢幕")

with open(dst_path, "w", encoding="utf-8") as f:
    f.write(s)

print("Generated preview-dev.html successfully!")
