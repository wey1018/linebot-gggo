const request = require("request");
const moment = require("moment");
const htmlparser = require("htmlparser2");
const trainstation = require("../assets/trainstation");

const msg = process.argv[2].replace(/台/g, "臺");

const now = moment()
  .utc()
  .add(8, "h");
const nowArr = [
  now.year(),
  now.month() + 1,
  now.date(),
  now.hour(),
  now.minutes()
];
let msgArr = msg.split(" ");
let stop1 = trainstation.find(function(g) {
  return g.Station_Name == msgArr[1];
});
let stop2 = trainstation.find(function(g) {
  return g.Station_Name == msgArr[2];
});
if (stop1.length == 0 || stop2.length == 0) {
  console.error(false);
  return;
}
request.post(
  {
    url: "http://twtraffic.tra.gov.tw/twrail/TW_SearchResult.aspx",
    form: {
      FromCity: stop1.City_Code,
      FromStation: stop1.IDCode,
      FromStationName: "0",
      ToCity: stop2.City_Code,
      ToStation: stop2.IDCode,
      ToStationName: "0",
      TrainClass: "2",
      searchdate: `${nowArr[0]}-${nowArr[1]}-${nowArr[2]}`,
      FromTimeSelect: `${nowArr[3]}${nowArr[4]}`,
      ToTimeSelect: `${nowArr[3] + 5}${nowArr[4]}`,
      Timetype: "1"
    }
  },
  function(err, httpResponse, body) {
    var parser = new htmlparser.Parser(
      {
        ontext: function(text) {
          if (/var JSONData=/.test(text)) {
            let result = JSON.parse(
              text.replace("var JSONData=", "").replace(";", "")
            );
            let txt = `${stop1.Station_Name} - ${stop2.Station_Name}\n`;
            result.forEach(function(g, i) {
              if (i > 5) {
                return;
              }
              txt += `${g.From_Departure_Time.slice(0,2)}:${g.From_Departure_Time.slice(2,4)} - ${g.To_Arrival_Time.slice(0,2)}:${g.To_Arrival_Time.slice(2,4)}\n`;
            });

            const txtObj = {
              type: "text",
              text: txt
            };
            console.log(JSON.stringify(txtObj));
            return;
          }
        }
      },
      { decodeEntities: true }
    );
    parser.write(body);
    parser.end();
  }
);
