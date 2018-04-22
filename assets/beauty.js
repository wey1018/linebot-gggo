const request = require("request");
const cheerio = require("cheerio");

const msg = process.argv[2];

request("https://www.jkforum.net/forum-736-1.html", function(
  error,
  response,
  body
) {
  try {
    const $ = cheerio.load(body);

    const hrefs = $("#waterfall li h3 a");
    let r = Math.round(Math.random() * (hrefs.length - 1));
    r = r % 2 === 1 ? r - 1 : r;
    const href = hrefs[r].attribs.href;
    request(`https://www.jkforum.net/${href}`, function(
      error2,
      response2,
      body2
    ) {
      const $ = cheerio.load(body2);
      const srcs = $("#postlist td.t_f img");
      const r = Math.round(Math.random() * (srcs.length - 1));
      const src = srcs[r].attribs.zoomfile;
      const result = {
        type: "image",
        originalContentUrl: src,
        previewImageUrl: src
      };
      console.log(JSON.stringify(result));
    });
  } catch (err) {
    console.error(err);
  }
});
