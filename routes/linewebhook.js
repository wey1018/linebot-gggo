const express = require("express");
const fs = require('fs');
const fileType = require('file-type');
const router = express.Router();
const linebot = require("linebot");
const { botconfig } = require("../config");
const { searchImg, searchBeauty, searchTrain, searchAvgle, getAvgle } = require("../assets/search");
const { searchYt, listYtch, listMyytch, addYtch, delYtch, subYtch } = require("../assets/youtube");
const { ytchSubscription } = require("../assets/subscription");
const { LatestVideo } = require("../routes/multicast");
const bot = linebot(botconfig);
const linebotParser = bot.parser();

router.post("/", linebotParser);

bot.on("message", function(event) {
  const {userId} = event.source;
  const {type, text} = event.message
  switch (true) {
    //V
    case /^#\s*/.test(text): {
      const qmsg = text.replace(/^#\s*/, "");
      searchImg(qmsg).then(function(result) {
          event.reply(result);
        }, function(reject) {
          res404(event, reject);
        });
      break;
    }
    //V
    case text === "ytch": {
      listYtch().then(function(result) {
          event.reply(result);
        }, function(reject) {
          res404(event, reject);
        });
      break;
    }
    //V
    case text === "myytch": {
      listMyytch(userId).then(function(result) {
          event.reply(result);
        }, function(reject) {
          res404(event, reject);
        });
      break;
    }
    case text === "臭GG教我": {
      event.reply({ type: "text", text: `朕不給的你不能搶ㄎㄎ\n• 火車 出發 抵達：火車時刻表\n• #圖片：搜尋圖片\n• yt 影片：搜尋影片\n• ytch：查詢頻道列表\n• ytch 頻道名稱：訂閱頻道\n• ytcha 頻道ID 頻道名稱：新增頻道列表\n` });
      break;
    }
    //V
    case /^ytcha\s*/.test(text): {
      const [uname, ...unameZh] = text.replace(/^ytcha\s*/, "").split(" ");
      addYtch(uname, unameZh.join(" ")).then(function(result) {
          event.reply(result);
        }, function(reject) {
          res404(event, reject);
        });
      break;
    }
    //V
    case /^ytchd\s*/.test(text): {
      const name = text.replace(/^ytchd\s*/, "");
      delYtch(name).then(function(result) {
          event.reply(result);
        }, function(reject) {
          res404(event, reject);
        });
      break;
    }
    //V
    case /^ytch\s*/.test(text):{
      const ytch_zh = text.replace(/^ytch\s*/, "");
      subYtch(ytch_zh, userId).then(function(result) {
          event.reply(result);
        }, function(reject) {
          res404(event, reject);
        });
      break;
    }
    //V
    case /^yt\s*/.test(text):
      const qmsg = text.replace(/^yt\s*/, "");
      searchYt(qmsg).then(function(result) {
          event.reply(result);
        }, function(reject) {
          res404(event, reject);
        });
      break;
    //V
    case /^火車\s*/.test(text):
      searchTrain(text).then(function(result) {
          event.reply(result);
        }, function(reject) {
          res404(event, reject);
        });
      break;
    case /^呵+$/.test(text):
      searchBeauty(text, "呵").then(function(result) {
          event.reply(result);
        }, function(reject) {
          res404(event, reject);
        });
      break;
    case text === 'ag':{
        getAvgle('mv', 10).then(function(result) {
            event.reply(result);
          }, function(reject) {
            res404(event, reject);
          });
        break;
      }
    case /^ag\s*/.test(text):{
      const qmsg = text.replace(/^ag\s*/, "");
      searchAvgle(qmsg).then(function(result) {
          event.reply(result);
        }, function(reject) {
          res404(event, reject);
        });
      break;
    }
    case /^schedule\s{1}\d+$/.test(text):{
      if(userId === 'U664b2ed942423006a6935237e790b641'){
        const timeLag = parseInt(text.replace(/^schedule\s{1}/, ""));
        LatestVideo(timeLag)
      }
      break;
    }
    // case /image/.test(type):
    //   const id = event.message.id;
    //   const stream = bot.getMessageContent(id);
    //   stream.then(chunk => {
    //     const ext = fileType(chunk).ext;
    //     fs.appendFile(`./upload/image/${id}.${ext}`, new Buffer(chunk), function(err) {
    //       if (err) {
    //         res404(event, err);
    //       } else {
    //         event.reply({ type: "text", text: "Gotcha" });
    //       }
    //     });
    //   });
    //   break;
    default:
      // res404(event);
      break;
  }
});

function res404(event, reject) {
  console.error(reject);
  event.reply("看不懂啦~~咚!!");
}

module.exports = router;
