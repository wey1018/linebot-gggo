const axios = require("axios");
const request = require("request");
const { subscripeYtch, poYtch, getYtch, dbDelYtch } = require("./dbTool");
const { ytkey } = require("../config");

module.exports.ytchSubscription = ytchSubscription;
module.exports.addYtch = addYtch;
module.exports.delYtch = delYtch;

function ytchSubscription(msg, regex, userId) {
  return new Promise((resolve, reject) => {
    const ytch_zh = msg.replace(regex, "");
    subscripeYtch(ytch_zh, userId).then(r=>{
        resolve(r)
    }, err=>{
      reject(err)
    });
  });
}

function addYtch(uname, unameZh) {
  var p = new Promise((resolve, reject) => {
    axios
      .get(`https://www.googleapis.com/youtube/v3/channels`, {
        params: {
          id: uname,
          part: "id",
          key: "AIzaSyAQr66Iel1AmG7HLy5Gde-4YzPc45kaKfI"
        }
      })
      .then(function(response) {
        resolve(response.data);
      })
      .catch(function(error) {
        reject(error);
      });
  });

  return p
    .then(
      r => {
        return new Promise((resolve, reject) => {
          if (r.items.length === 1) {
            resolve({
              channel_id: r.items[0].id,
              channel_name: uname,
              channel_name_zh: unameZh
            });
          } else {
            axios
              .get(`https://www.googleapis.com/youtube/v3/channels`, {
                params: {
                  forUsername: uname,
                  part: "id",
                  key: ytkey
                }
              })
              .then(function(response) {
                const result = response.data;
                if (result.items.length !== 1) {
                  throw new Error({ msg: "找不到唯一ID" });
                }
                resolve({
                  channel_id: result.items[0].id,
                  channel_name: uname,
                  channel_name_zh: unameZh
                });
              })
              .catch(function(error) {
                reject(error);
              });
          }
        });
      },
      err => {
        reject(err);
      }
    )
    .then(
      r => {
        return poYtch(r.channel_id, r.channel_name, r.channel_name_zh);
      },
      err => {
        reject(err);
      }
    )
    .then(r => {
      return new Promise((resolve, reject) => {
        if (r.affectedRows === 1) {
          resolve({ type: "text", text: "Youtube頻道新增成功" });
        } else {
          getYtch(r.id).then(rr => {
            resolve({
              type: "text",
              text: `Youtube頻道已在清單中，趕快訂閱 ytch ${rr[0].CHANNEL_NAME_ZH}`
            });
          });
        }
      });
    });
}

function delYtch(msg, regex, userId) {
  return new Promise((resolve, reject) => {
    const ytch_zh = msg.replace(regex, "");
    dbDelYtch(ytch_zh, userId).then(
      r => {
        if (r.affectedRows !== 0) {
          resolve({ type: "text", text: "刪!!都刪" });
        }
      },
      err => {
        reject(err);
      }
    );
  });
}