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
 */

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
  var sheet = ss.getSheetByName("學生作文進度總表");
  if (!sheet) {
    sheet = ss.insertSheet("學生作文進度總表");
    var headers = [
      "學生帳號 / 信箱",
      "學生姓名",
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
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#dcfce7")
      .setFontColor("#14532d");
    sheet.setFrozenRows(1);
  }
  return sheet;
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

  var rowData = [
    userId,
    payload.user_name || userId.split("@")[0],
    new Date(),
    payload.tier || "intermediate",
    p[0] || "",
    p[1] || "",
    p[2] || "",
    p[3] || "",
    totalChars,
    approvals,
    comments,
    JSON.stringify(payload)
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}
