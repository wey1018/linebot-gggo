const axios = require("axios")
const { spawn } = require('child_process');
const { cseconfig, ytkey, fbkey } = require("../config");
const { getYtchList, getYtchByUserId } = require("./dbTool");
const { randNum } = require("./common")

module.exports.searchImg = searchImg;
module.exports.searchBeauty = searchBeauty;
module.exports.searchTrain = searchTrain;
module.exports.searchAvgle = searchAvgle;
module.exports.getAvgle = getAvgle;


function searchImg(qmsg, imgsize = "xlarge", num = 10) {
  return new Promise(function(resolve, reject) {
    axios
      .get("https://content.googleapis.com/customsearch/v1", {
        params: {
          cx: cseconfig.cseid,
          searchType: "image",
          imgSize: imgsize,
          num: num,
          q: qmsg,
          key: cseconfig.apikey
        }
      })
      .then(function(response) {
        try {
          const result = response.data;
          let r = result.items.filter(g => /^https:/.test(g.link));
          r = r[Math.round(Math.random() * (r.length - 1))];
          if (/facebook/.test(r.displayLink)) {
            const photoid = r.link.match(/media_id=(\d+)/g)[0].split("=")[1];
            axios
              .get(
                `https://graph.facebook.com/v2.11/${photoid}?access_token=${fbkey}&fields=images&format=json&method=get`
              )
              .then(function(response1) {
                const result1 = response1.data;
                resolve({
                  type: "image",
                  originalContentUrl: result1.images[0].source,
                  previewImageUrl: r.image.thumbnailLink
                });
              })
              .catch(function(error) {
                resolve({
                  type: "image",
                  originalContentUrl: r.link,
                  previewImageUrl: r.image.thumbnailLink
                });
              });
          } else {
            resolve({
              type: "image",
              originalContentUrl: r.link,
              previewImageUrl: r.image.thumbnailLink
            });
          }
        } catch (err) {
          throw new Error(err);
        }
      })
      .catch(function(error) {
        reject(error);
      });
  });
}

function searchBeauty(msg, key) {
  let tmp = [];
  const regex = new RegExp(key, "g");
  msg.match(regex).forEach(() => {
    const beauty = spawn("node", ["./assets/beauty.js", msg, regex]);

    const p = new Promise((resolve, reject) => {
      beauty.stdout.on("data", data => {
        resolve(JSON.parse(data.toString()));
      });
      beauty.stderr.on("data", data => {
        reject(data.toString());
      });
    });

    tmp.push(p);
  });

  return Promise.all(tmp)
    .then(v => {
      return v;
    })
    .catch(err => {
      throw new Error(err);
    });
}

function searchTrain(msg) {
  return new Promise((resolve, reject) => {
    try {
      const train = spawn("node", ["./assets/train.js", msg]);

      train.stdout.on("data", data => {
        resolve(JSON.parse(data.toString()))
      });

      train.stderr.on("data", err => {
        reject(err)
      });

    } catch (err) {
      reject(err)
    }
  });
}

function getAvgle(orderBy = 'mv', limit = 5) {
  return new Promise(function(resolve, reject) {
    axios
      .get(`https://api.avgle.com/v1/videos/0`, {
        params: {
          o: orderBy,
          limit: limit
        }
      })
      .then(function(response) {
        try {
          const result = response.data;
          if (!result.success) {
            throw new Error("not found");
            return;
          }
          let r = randNum(result.response.limit);
          let {
            title,
            video_url,
            preview_url,
            preview_video_url
          } = result.response.videos[r];
          resolve([
            {
              type: "text",
              text: `${title}\n預覽=>${preview_video_url}\n嘿嘿=>${video_url}`
            }]
          );
        } catch (err) {
          throw new Error(err);
        }
      })
      .catch(function(error) {
        reject(error);
      });
  });
}

function searchAvgle(msg, limit = 1) {
  return new Promise(function(resolve, reject) {
    axios
      .get(`https://api.avgle.com/v1/search/${encodeURIComponent(msg)}/0`, {
        params: {
          limit: limit
        }
      })
      .then(function(response) {
        try {
          const result = response.data;
          if (!result.success) {
            throw new Error("not found");
            return;
          }
          if (result.response.videos.length === 0) {
            throw new Error("not found");
            return;
          }
          let {
            title,
            video_url,
            preview_url,
            preview_video_url
          } = result.response.videos[0];
          resolve(
            {
              type: "text",
              text: `${title}\n預覽=>${preview_video_url}\n嘿嘿=>${video_url}`
            }
          );
        } catch (err) {
          throw new Error(err);
        }
      })
      .catch(function(error) {
        reject(error);
      });
  });
}