const axios = require("axios")
const { ytkey } = require("../config");
const { dbsYtch, dbsYtchUid, dbiYtch, dbsYtchCid, dbdYtch, dbiYtsub } = require("./dbTool");

module.exports.searchYt = searchYt;
module.exports.listYtch = listYtch;
module.exports.listMyytch = listMyytch;
module.exports.addYtch = addYtch;
module.exports.delYtch = delYtch;
module.exports.subYtch = subYtch;

function searchYt(qmsg) {
  const num = 1;
  return new Promise(function(resolve, reject) {
    axios
      .get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          type: "video",
          part: "snippet",
          maxResults: 1,
          q: qmsg,
          key: ytkey
        }
      })
      .then(function(response) {
        try {
          const result = response.data;
          resolve({
            type: "text",
            text: `https://www.youtube.com/watch?v=${result.items[0].id
              .videoId}`
          });
        } catch (err) {
          throw new Error(err);
        }
      })
      .catch(function(error) {
        reject(err);
      });
  });
}

function listYtch() {
  return new Promise((resolve, reject) => {
    try {
      dbsYtch().then(result => {
          result = result.reduce((a, b) => {
            let msg = `${a}${b.CHANNEL_NAME_ZH}\n`;
            return msg;
          }, "可訂閱頻道：\n");
          resolve({ type: "text", text: result });
        }, err => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
}

function listMyytch(userId) {
  return new Promise(function(resolve, reject) {
    dbsYtchUid(userId).then(r => {
      r = r.reduce((a, b) => {
        let msg = `${a}${b.CHANNEL_NAME_ZH}\n`;
        return msg;
      }, "已訂閱頻道：\n");
      resolve({ type: "text", text: r });
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
                  throw new Error("找不到唯一ID");
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
    .then(r => {
      return dbiYtch(r.channel_id, r.channel_name, r.channel_name_zh);
    })
    .then(r => {
      return new Promise((resolve, reject) => {
        if (r.affectedRows === 1) {
          resolve({ type: "text", text: "Youtube頻道新增成功" });
        } else {
          dbsYtchCid(r.id).then(rr => {
            resolve({
              type: "text",
              text: `Youtube頻道已在清單中，趕快訂閱 ytch ${rr[0].CHANNEL_NAME_ZH}`
            });
          });
        }
      });
    });
}

function delYtch(name_zh) {
  return new Promise((resolve, reject) => {
    dbdYtch(name_zh).then(
      r => {
        const num = r.reduce((a, b) => {
          return a + b.affectedRows;
        }, 0);
        if (num > 0) {
          resolve({ type: "text", text: "刪!!都刪" });
        } else {
          resolve({ type: "text", text: "沒有這個東西!!不要亂刪" });
        }
      },
      err => {
        reject(err);
      }
    );
  });
}

function subYtch(ytch_zh, userId) {
  return new Promise((resolve, reject) => {
    dbiYtsub(ytch_zh, userId).then(r=>{
      if(r.affectedRows === 1){
        resolve({
          type:"text",
          text: "訂閱OK的唷~o(^▽^)o"
        })
      }else{
        resolve({
          type:"text",
          text: "沒有這個頻道或是你已經訂閱囉 ( ´▽｀)"
        })
      }
    }, err=>{
      reject(err)
    });
  });
}