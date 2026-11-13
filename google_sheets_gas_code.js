/**
 * ==============================================================================
 * 115四上作文《考試前後》- 學生 Google 帳號作文進度試算表資料庫 API (Google Apps Script)
 * ==============================================================================
 * 
 * 📋 快速部署教學（只需 3 分鐘）：
 * 
 * 1. 打開 Google 雲端硬碟 (https://drive.google.com/)。
 * 2. 點擊左上角「＋新增」➔「Google 試算表」，將試算表命名為：
 *    《115四上作文學生雲端進度庫》
 * 3. 點選頂部功能表的「擴充功能」➔「Apps Script」。
 * 4. 把 Apps Script 編輯器內原本預設的程式碼全部刪除，貼上本檔案全部程式碼。
 * 5. 點擊右上角藍色按鈕「部署」➔「新增部署」。
 * 6. 在左側齒輪選擇類型「網頁應用程式 (Web App)」：
 *    - 說明：可填「學生作文自動儲存 API」
 *    - 執行身分：選擇「我 (您的 Google 帳號)」
 *    - 存取權限：選擇「任何人 (Anyone)」  <--- 【關鍵！必須選任何人，學生才能免驗證直接存檔】
 * 7. 點擊「部署」，若出現授權畫面，點擊「審查權限」➔ 選擇您的 Google 帳號 ➔ 點「進階」➔「前往 (不安全)」➔ 點「允許」。
 * 8. 複製產生的「網頁應用程式網址 (Web App URL)」（格式如：https://script.google.com/macros/s/AKfycb.../exec）。
 * 9. 將該網址貼入《考試前後》網頁頂部的「Google 雲端同步」設定中即可！
 * 
 * ✨ 教師批閱排版升級（2026-11-13）：
 * - 若您先前已建立試算表，更新貼上本程式碼並「部署新版本」後，
 *   可於試算表上方選單點選「🏝️ 作文試算表工具」➔「✨ 一鍵整理所有排版與批閱分頁」，
 *   立即將舊資料全面套用自動換行、最適欄寬／列高，並產生「教師批閱閱讀版」分頁！
 */

var MAIN_SHEET_NAME = "學生作文進度總表";
var REVIEW_SHEET_NAME = "教師批閱閱讀版";
var ROSTER_SHEET_NAME = "學生名冊對照";

// 4年3班 帳號 ↔ 班級座號對照表（僅記錄班級座號，不儲存真實姓名與密碼）
var ACCOUNT_SEAT_MAP = {
  "359991": "4年3班 01號 (40301)", "112-112003": "4年3班 01號 (40301)",
  "344351": "4年3班 02號 (40302)", "112-112029": "4年3班 02號 (40302)",
  "976225": "4年3班 03號 (40303)", "112-112111": "4年3班 03號 (40303)",
  "548271": "4年3班 04號 (40304)", "112-112191": "4年3班 04號 (40304)",
  "735831": "4年3班 05號 (40305)", "112-112084": "4年3班 05號 (40305)",
  "588430": "4年3班 06號 (40306)", "112-112085": "4年3班 06號 (40306)",
  "854580": "4年3班 07號 (40307)", "112-112224": "4年3班 07號 (40307)",
  "533272": "4年3班 08號 (40308)", "112-112033": "4年3班 08號 (40308)",
  "086025": "4年3班 09號 (40309)", "112-112088": "4年3班 09號 (40309)",
  "553023": "4年3班 10號 (40310)", "112-112060": "4年3班 10號 (40310)",
  "972137": "4年3班 11號 (40311)", "112-112115": "4年3班 11號 (40311)",
  "585099": "4年3班 12號 (40312)", "112-112169": "4年3班 12號 (40312)",
  "189573": "4年3班 13號 (40313)", "112-112037": "4年3班 13號 (40313)",
  "786339": "4年3班 14號 (40314)", "112-112146": "4年3班 14號 (40314)",
  "799530": "4年3班 15號 (40315)", "112-112015": "4年3班 15號 (40315)",
  "593180": "4年3班 16號 (40316)", "112-112016": "4年3班 16號 (40316)",
  "356249": "4年3班 17號 (40317)", "112-112097": "4年3班 17號 (40317)",
  "577547": "4年3班 18號 (40318)", "112-112204": "4年3班 18號 (40318)",
  "561382": "4年3班 19號 (40319)", "112-112125": "4年3班 19號 (40319)",
  "890861": "4年3班 20號 (40320)", "112-112205": "4年3班 20號 (40320)",
  "365962": "4年3班 21號 (40321)", "112-112070": "4年3班 21號 (40321)",
  "372424": "4年3班 22號 (40322)", "112-112050": "4年3班 22號 (40322)",
  "194665": "4年3班 23號 (40323)", "112-112078": "4年3班 23號 (40323)",
  "098586": "4年3班 24號 (40324)", "112-112025": "4年3班 24號 (40324)",
  "394375": "4年3班 25號 (40325)", "112-112185": "4年3班 25號 (40325)",
  "532259": "4年3班 26號 (40326)", "112-112187": "4年3班 26號 (40326)",
  "339489": "4年3班 27號 (40327)", "112-112214": "4年3班 27號 (40327)",
  "276252": "4年3班 28號 (40328)", "112-112237": "4年3班 28號 (40328)"
};

function resolveStudentSeatLabel(ss, userId, fallbackName) {
  var raw = String(userId || "").trim().toLowerCase();
  var prefix = raw.replace(/@st\.tc\.edu\.tw$/i, "");

  // 1. 優先讀取教師私人試算表內的「學生名冊對照」分頁（若教師自行匯入名冊）
  if (ss) {
    var rosterSheet = ss.getSheetByName(ROSTER_SHEET_NAME);
    if (rosterSheet) {
      var rData = rosterSheet.getDataRange().getValues();
      if (rData.length > 1) {
        var hdr = rData[0].map(function(h) { return String(h || "").trim(); });
        var idxSeat = hdr.indexOf("座號");
        var idxCls = hdr.indexOf("班級");
        var idxAcct = hdr.indexOf("帳號");
        var idxGLearn = hdr.indexOf("Google學習帳號");
        var idxGFull = hdr.indexOf("Google帳號(完整)");
        for (var i = 1; i < rData.length; i++) {
          var row = rData[i];
          var candidates = [
            idxAcct >= 0 ? String(row[idxAcct] || "").trim().toLowerCase() : "",
            idxGLearn >= 0 ? String(row[idxGLearn] || "").trim().toLowerCase() : "",
            idxGFull >= 0 ? String(row[idxGFull] || "").trim().toLowerCase() : ""
          ];
          if (candidates.indexOf(raw) >= 0 || candidates.indexOf(prefix) >= 0) {
            var seatNum = idxSeat >= 0 ? Number(row[idxSeat]) : 0;
            var clsNum = idxCls >= 0 ? Number(row[idxCls]) : 3;
            if (seatNum > 0) {
              var sPad = seatNum < 10 ? "0" + seatNum : String(seatNum);
              return "4年" + clsNum + "班 " + sPad + "號 (40" + clsNum + sPad + ")";
            }
          }
        }
      }
    }
  }

  // 2. 內建 4-3 帳號對應座號表（含試算表吃掉前導零之 6 碼補零備援）
  if (ACCOUNT_SEAT_MAP[raw]) return ACCOUNT_SEAT_MAP[raw];
  if (ACCOUNT_SEAT_MAP[prefix]) return ACCOUNT_SEAT_MAP[prefix];
  if (/^\d{1,5}$/.test(prefix)) {
    var padded6 = ("000000" + prefix).slice(-6);
    if (ACCOUNT_SEAT_MAP[padded6]) return ACCOUNT_SEAT_MAP[padded6];
  }

  return String(fallbackName !== undefined && fallbackName !== null && fallbackName !== "" ? fallbackName : (prefix || raw));
}

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("🏝️ 作文試算表工具")
      .addItem("✨ 一鍵整理所有排版與批閱分頁", "formatAllRowsForGrading")
      .addItem("📋 檢查全班 28 人登入狀態", "checkClassLoginStatus")
      .addToUi();
  } catch (e) {
    // Web App 背景執行時無 UI 上下文，忽略即可
  }
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "check";
  var userId = e && e.parameter && e.parameter.user_id;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss);

  if (action === "load" && userId) {
    var result = loadUserData(sheet, userId);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    appName: "115四上作文《考試前後》學生雲端進度庫",
    time: new Date()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss);

  try {
    var rawText = e.postData.contents;
    var postData = JSON.parse(rawText);
    var userId = postData.user_id;

    if (!userId) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "缺少 user_id 學生識別" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (postData.action === "save") {
      saveUserData(sheet, userId, postData);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        updated_at: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    } else if (postData.action === "load") {
      var loadRes = loadUserData(sheet, userId);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: loadRes
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "未知的 action" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss) {
  var sheet = ss.getSheetByName(MAIN_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(MAIN_SHEET_NAME);
    var headers = [
      "學生帳號 / 信箱",
      "學生代號",
      "最後更新時間",
      "難度層級",
      "第一段（起）",
      "第二段（承）",
      "第三段（轉）",
      "第四段（合）",
      "全文總字數",
      "教師過關進度",
      "教師評語紀錄",
      "完整狀態JSON"
    ];
    sheet.appendRow(headers);
    applyMainSheetLayout(sheet);
  }
  return sheet;
}

function formatTierLabel(tier) {
  if (tier === "beginner") return "初探者";
  if (tier === "master") return "大師級";
  return "挑戰者";
}

function applyMainSheetLayout(sheet) {
  var headerRange = sheet.getRange(1, 1, 1, 12);
  headerRange
    .setFontWeight("bold")
    .setBackground("#dcfce7")
    .setFontColor("#14532d")
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("center")
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);

  // 設定各欄最適閱覽寬度（E~H 四段落欄寬設為 360px 並自動折行，方便教師逐段閱讀）
  var widths = [200, 100, 145, 95, 360, 360, 360, 360, 85, 190, 260, 110];
  for (var i = 0; i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }
}

function formatMainRowRange(sheet, rowIndex) {
  if (rowIndex < 2) return;
  var rowRange = sheet.getRange(rowIndex, 1, 1, 12);
  var bg = (rowIndex % 2 === 0) ? "#ffffff" : "#f8fafc";

  rowRange
    .setBackground(bg)
    .setVerticalAlignment("top")
    .setFontSize(10.5)
    .setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);

  // A~D：基本資料
  sheet.getRange(rowIndex, 1, 1, 4).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  sheet.getRange(rowIndex, 3).setNumberFormat("yyyy/mm/dd hh:mm");
  sheet.getRange(rowIndex, 4).setHorizontalAlignment("center");

  // E~H：四段作文內容（自動換行＋舒適閱讀行高）
  sheet.getRange(rowIndex, 5, 1, 4)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
    .setHorizontalAlignment("left");

  // I：總字數置中
  sheet.getRange(rowIndex, 9).setHorizontalAlignment("center").setFontWeight("bold");

  // J~K：過關進度與教師評語（自動換行）
  sheet.getRange(rowIndex, 10, 1, 2).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

  // L：完整狀態 JSON（截斷顯示＋淡灰小字，避免撐爆版面）
  sheet.getRange(rowIndex, 12)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP)
    .setFontColor("#94a3b8")
    .setFontSize(9);

  sheet.autoResizeRows(rowIndex, 1);
}

function formatParagraphReadingText(p) {
  var labels = ["【第一段・起】", "【第二段・承】", "【第三段・轉】", "【第四段・合】"];
  var blocks = [];
  for (var i = 0; i < 4; i++) {
    var content = String((p && p[i]) || "").trim();
    blocks.push(labels[i] + "\n" + (content || "（尚未填寫）"));
  }
  return blocks.join("\n\n");
}

function syncTeacherReviewSheet(ss, mainSheet) {
  var reviewSheet = ss.getSheetByName(REVIEW_SHEET_NAME);
  if (!reviewSheet) {
    reviewSheet = ss.insertSheet(REVIEW_SHEET_NAME);
  }

  var mainData = mainSheet.getDataRange().getValues();
  var headers = [
    "學生帳號 / 代號",
    "批閱狀態 / 字數",
    "完整四段作文（教師直式批閱版）",
    "教師評語紀錄",
    "最後更新時間"
  ];

  reviewSheet.clearContents();
  reviewSheet.clearFormats();
  reviewSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  var hRange = reviewSheet.getRange(1, 1, 1, headers.length);
  hRange
    .setFontWeight("bold")
    .setBackground("#dbeafe")
    .setFontColor("#1e3a8a")
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("center");

  reviewSheet.setFrozenRows(1);
  reviewSheet.setFrozenColumns(1);

  var colWidths = [180, 155, 680, 260, 145];
  for (var c = 0; c < colWidths.length; c++) {
    reviewSheet.setColumnWidth(c + 1, colWidths[c]);
  }

  if (mainData.length <= 1) return;

  var ss = mainSheet.getParent();
  var rowsOut = [];
  for (var i = 1; i < mainData.length; i++) {
    var r = mainData[i];
    if (!r[0]) continue;
    var seatLabel = String(resolveStudentSeatLabel(ss, r[0], r[1]) || "");
    var userLabel = seatLabel + "\n(" + r[0] + ")";
    var statusLabel = "層級：" + (r[3] || "挑戰者") + "\n總字數：" + (r[8] || 0) + " 字\n" + (r[9] || "");
    var essayText = formatParagraphReadingText([r[4], r[5], r[6], r[7]]);
    var sortKey = (seatLabel.match(/\((\d+)\)/) || ["", "99999"])[1];
    rowsOut.push({ sortKey: sortKey, vals: [userLabel, statusLabel, essayText, r[10] || "", r[2] || ""] });
  }

  rowsOut.sort(function(a, b) {
    return a.sortKey.localeCompare(b.sortKey);
  });
  var sortedVals = rowsOut.map(function(item) { return item.vals; });

  if (sortedVals.length > 0) {
    var bodyRange = reviewSheet.getRange(2, 1, sortedVals.length, 5);
    bodyRange.setValues(sortedVals);
    bodyRange
      .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
      .setVerticalAlignment("top")
      .setFontSize(11)
      .setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);

    for (var j = 0; j < sortedVals.length; j++) {
      var bg = (j % 2 === 0) ? "#ffffff" : "#f8fafc";
      reviewSheet.getRange(j + 2, 1, 1, 5).setBackground(bg);
    }
    reviewSheet.getRange(2, 5, sortedVals.length, 1).setNumberFormat("yyyy/mm/dd hh:mm");
    reviewSheet.autoResizeRows(2, sortedVals.length);
  }
}

/**
 * 教師可於試算表選單「🏝️ 作文試算表工具」➔「✨ 一鍵整理所有排版與批閱分頁」手動執行，
 * 立即為所有既有資料自動對應座號、套用換行、欄寬、自動列高，並依座號排序更新「教師批閱閱讀版」。
 */
function formatAllRowsForGrading() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss);
  applyMainSheetLayout(sheet);
  var lastRow = sheet.getLastRow();
  for (var r = 2; r <= lastRow; r++) {
    var uid = sheet.getRange(r, 1).getValue();
    var curLabel = sheet.getRange(r, 2).getValue();
    if (uid) {
      sheet.getRange(r, 2).setValue(resolveStudentSeatLabel(ss, uid, curLabel));
    }
    formatMainRowRange(sheet, r);
  }
  syncTeacherReviewSheet(ss, sheet);
}

/**
 * 檢查全班 28 位學生是否皆已在試算表留下登入／同步紀錄，
 * 更新「全班登入狀態檢核」分頁並彈出摘要提示。
 */
function checkClassLoginStatus() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var mainSheet = getOrCreateSheet(ss);
  var data = mainSheet.getDataRange().getValues();

  // 收集全班 28 位標準座號標籤並依代碼排序
  var seatSet = {};
  for (var key in ACCOUNT_SEAT_MAP) {
    if (Object.prototype.hasOwnProperty.call(ACCOUNT_SEAT_MAP, key)) {
      seatSet[ACCOUNT_SEAT_MAP[key]] = true;
    }
  }
  var allSeats = Object.keys(seatSet).sort();

  // 統計試算表內已出現的座號紀錄
  var loggedMap = {};
  for (var i = 1; i < data.length; i++) {
    var uid = String(data[i][0] || "").trim();
    if (!uid) continue;
    var resolved = resolveStudentSeatLabel(ss, uid, data[i][1]);
    loggedMap[resolved] = {
      userId: uid,
      updatedAt: data[i][2] ? String(data[i][2]) : ""
    };
  }

  var loggedInSeats = [];
  var missingSeats = [];
  var reportRows = [["班級座號", "登入狀態", "最後同步時間", "登入帳號"]];

  for (var j = 0; j < allSeats.length; j++) {
    var seatLabel = allSeats[j];
    var rec = loggedMap[seatLabel];
    if (rec) {
      loggedInSeats.push(seatLabel);
      reportRows.push([seatLabel, "✅ 已登入", rec.updatedAt, rec.userId]);
    } else {
      missingSeats.push(seatLabel);
      reportRows.push([seatLabel, "⬜ 尚未登入", "", ""]);
    }
  }

  var statusSheetName = "全班登入狀態檢核";
  var statusSheet = ss.getSheetByName(statusSheetName);
  if (!statusSheet) {
    statusSheet = ss.insertSheet(statusSheetName);
  }
  statusSheet.clear();
  statusSheet.getRange(1, 1, reportRows.length, 4).setValues(reportRows);
  statusSheet.getRange(1, 1, 1, 4)
    .setFontWeight("bold")
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("center");
  statusSheet.setFrozenRows(1);
  statusSheet.setColumnWidth(1, 190);
  statusSheet.setColumnWidth(2, 120);
  statusSheet.setColumnWidth(3, 180);
  statusSheet.setColumnWidth(4, 240);

  // 高亮尚未登入列
  for (var r = 2; r <= reportRows.length; r++) {
    var statusCell = statusSheet.getRange(r, 2);
    if (statusCell.getValue() === "⬜ 尚未登入") {
      statusSheet.getRange(r, 1, 1, 4).setBackground("#fff3cd");
    } else {
      statusSheet.getRange(r, 1, 1, 4).setBackground("#ffffff");
    }
  }

  var summary = "全班共 " + allSeats.length + " 人：\n" +
    "✅ 已登入：" + loggedInSeats.length + " 人\n" +
    "⬜ 尚未登入：" + missingSeats.length + " 人";
  if (missingSeats.length > 0) {
    summary += "\n\n尚未登入名單：\n" + missingSeats.join("\n");
  } else {
    summary += "\n\n🎉 全班 28 位同學皆已登入！";
  }

  try {
    SpreadsheetApp.getUi().alert("📋 全班登入狀態檢查", summary, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    // 非 UI 環境執行時忽略彈窗
  }
  return summary;
}

function loadUserData(sheet, userId) {
  var data = sheet.getDataRange().getValues();
  var cleanId = String(userId).trim().toLowerCase();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === cleanId) {
      var jsonStr = data[i][11];
      try {
        var parsed = JSON.parse(jsonStr);
        return { found: true, state: parsed, lastUpdated: data[i][2] };
      } catch (err) {
        return { found: true, raw: jsonStr, lastUpdated: data[i][2] };
      }
    }
  }
  return { found: false };
}

function saveUserData(sheet, userId, payload) {
  var data = sheet.getDataRange().getValues();
  var cleanId = String(userId).trim().toLowerCase();
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === cleanId) {
      rowIndex = i + 1; // 1-based index
      break;
    }
  }

  var p = payload.paragraphs || ["", "", "", ""];
  var totalChars = p.join("").replace(/[\s\r\n]/g, "").length;
  
  var approvals = (payload.teacherApprovals || []).map(function(appr, idx) {
    var names = ["起", "承", "轉", "合"];
    return names[idx] + ": " + (appr ? "✅過關" : "⏳未過");
  }).join(" | ");

  var comments = (payload.teacherComments || []).filter(function(c) { return !!c; }).join(" ； ");

  var ss = sheet.getParent();
  var resolvedSeatLabel = resolveStudentSeatLabel(ss, userId, payload.user_name);

  var rowData = [
    userId,
    resolvedSeatLabel,
    new Date(),
    formatTierLabel(payload.tier || "intermediate"),
    p[0] || "",
    p[1] || "",
    p[2] || "",
    p[3] || "",
    totalChars,
    approvals,
    comments,
    JSON.stringify(payload)
  ];

  var targetRow = rowIndex;
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
    targetRow = sheet.getLastRow();
  }

  applyMainSheetLayout(sheet);
  formatMainRowRange(sheet, targetRow);
  syncTeacherReviewSheet(sheet.getParent(), sheet);
}
