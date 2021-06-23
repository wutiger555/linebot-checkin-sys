function doPost(e) {

  var CHANNEL_ACCESS_TOKEN = '';
  var msg = JSON.parse(e.postData.contents);
  console.log(msg);

  // 取出 replayToken 和發送的訊息文字
  var replyToken = msg.events[0].replyToken;
  var userMessage = msg.events[0].message.text;
  var userId = msg.events[0].source.userId; // 取得個人userId
  var groupId = msg.events[0].source.groupId; // 取得群組Id
  var timeStamp = msg.events[0].timestamp;
  if (typeof replyToken === 'undefined') {
    return;
  }

  var url = 'https://api.line.me/v2/bot/message/reply';
  var text = ''
  switch(userMessage)
{
    case '上班':  
    text = "User: "+userId+"\n上班時間紀錄: "+getCurrentTime()
    sendToSheet(userId,getCurrentTime(),"上班")
    break;
    case '下班':
    text = "User: "+userId+"\n下班時間紀錄: "+getCurrentTime()
    sendToSheet(userId,getCurrentTime(),"下班")
    break;
    case '紀錄':
    text = searchSheet(userId)
    break;
}
  UrlFetchApp.fetch(url, {
      'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': text
      }],
    }),
  });
}

function getCurrentTime() {
  timezone = "GMT+8"
  var date = Utilities.formatDate(new Date(), timezone, "yyyy-MM-dd HH:mm:ss");
  return date
}
function searchSheet(userId) {
  let SpreadSheet = SpreadsheetApp.openById("");
  let sheet = SpreadSheet.getSheets()[0]; // 指定第一張試算表
  var data = sheet.getDataRange().getValues();
  var text = ""
  for(var i = 1; i<data.length;i++){
    if(userId===data[i][0]){
      text += "["+data[i][2]+"]"+data[i][1]+"\n-----------------\n"
    }
  }
  return text
}
function sendToSheet(user, time, status) {
  // 初始化試算表
  let SpreadSheet = SpreadsheetApp.openById("");
  let Sheet = SpreadSheet.getSheets()[0]; // 指定第一張試算表
  let LastRow = Sheet.getLastRow(); // 取得最後一列有值的索引值

  // 寫入試算表
  Sheet.getRange(LastRow+1, 1).setValue(user);
  Sheet.getRange(LastRow+1, 2).setValue(time);
  if (status === '上班') {
    Sheet.getRange(LastRow+1, 3).setValue("上班");
  }else if (status === '下班') {
    Sheet.getRange(LastRow+1, 3).setValue("下班");
  }
}
