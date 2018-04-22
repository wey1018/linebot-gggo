const linebot = require("linebot");
const request = require("request");
const moment = require("moment");
const { botconfig, ytkey } = require("../config");
const { getYtchSubscription, getNBATop10U } = require("../assets/dbTool");

const bot = linebot(botconfig);

module.exports.LatestVideo = LatestVideo;
module.exports.top10 = top10;

function top10(timeLag) {
  request(
    {
      url: "https://api.nba.net/0/league/video",
      qs: {
        count: 1
      }
    },
    function(error, response, body) {
      try {
        const result = JSON.parse(body);
        const now = moment();
        const upload = result.response.result.find(function(g) {
          const publishAt = moment(g.published);
          return (
            now.diff(publishAt, "seconds") < timeLag
          );
          
        });
        if (!upload) {
          return;
        }

        getNBATop10U()
          .then(r => {
            return new Promise((resolve, reject) => {
              const arr = r.map(g => {
                return g.USER_ID;
              });
              resolve(arr);
            });
          })
          .then(r => {
            bot.multicast(r[0], [
              {
                type: "text",
                text: `${result.meta.domain}${upload.url}`
              },
              {
                type: "template",
                altText: "o(^▽^)o",
                template: {
                  type: "carousel",
                  columns: [
                    {
                      thumbnailImageUrl: upload.listImage.tile,
                      imageBackgroundColor: "#FFFFFF",
                      text: upload.title,
                      actions: [
                        {
                          type: "uri",
                          label: "前往",
                          uri: `${result.meta.domain}${upload.url}`
                        }
                      ],
                      imageAspectRatio: "rectangle",
                      imageSize: "cover"
                    }
                  ]
                }
              }
            ]);
          });
      } catch (err) {
        console.error(err);
      }
    }
  );
}

function LatestVideo(timeLag) {
  getYtchSubscription()
    // .then(result => {
    //   return new Promise((resolve, reject) => {
    //     resolve(result);
    //   });
    // })
    .then(r => {
      for (let o in r) {
        request(
          {
            url: "https://content.googleapis.com/youtube/v3/activities",
            qs: {
              maxResults: 10,
              channelId: o,
              part: "snippet,contentDetails",
              key: ytkey
            }
          },
          function(error, response, body) {
            const result = JSON.parse(body);
            const now = moment();
            let upload = result.items.filter(function(g) {
              const publishAt = moment(g.snippet.publishedAt);
              return (
                g.snippet.type == "upload" &&
                now.diff(publishAt, "seconds") < timeLag
              );
            });
            if (upload.length == 0) {
              return;
            }
            upload = upload.slice(0, 4);

            const txt = upload.reduce((a, b) => {
              return `${a}${b.snippet
                .title}\nhttps://www.youtube.com/watch?v=${b.contentDetails
                .upload.videoId}\n`;
            }, `${upload[0].snippet.channelTitle}\n`);

            const carousel = upload.map(g => {
              return {
                thumbnailImageUrl: g.snippet.thumbnails.high.url,
                imageBackgroundColor: "#FFFFFF",
                text: g.snippet.title.slice(0, 40),
                actions: [
                  {
                    type: "uri",
                    label: "前往",
                    uri: `https://www.youtube.com/watch?v=${g.contentDetails
                      .upload.videoId}`
                  }
                ]
              };
            });

            bot.multicast(r[o], [
              { type: "text", text: txt },
              {
                type: "template",
                altText: "o(^▽^)o",
                template: {
                  type: "carousel",
                  columns: carousel,
                  imageAspectRatio: "rectangle",
                  imageSize: "cover"
                }
              }
            ]);
          }
        );
      }
    });
}
