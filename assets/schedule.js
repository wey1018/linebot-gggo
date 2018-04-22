const schedule = require("node-schedule");
const {top10, LatestVideo} = require("../routes/multicast");

const timeLag = 60*60

// top10(timeLag);
// LatestVideo(timeLag);
setInterval(()=>{
    top10(timeLag);
    LatestVideo(timeLag);
}, timeLag*1000)
// var j = schedule.scheduleJob("30 * * * * *", function() {
//   top10();
// });
