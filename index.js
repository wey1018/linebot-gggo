const express = require("express");
const path = require("path");
const linewebhook = require('./routes/linewebhook');
const schedule = require('./assets/schedule');
const dbTool = require('./assets/dbTool');

const app = express();

app.use(express.static(path.join(__dirname, "public"), { maxAge: 43200000 }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use('/linewebhook', linewebhook);

app.get("/", function(req, res) {
  res.render("index");
});

app.post("/", function(req, res) {
  res.send("Hello World!");
});

var port = process.env.PORT || 80;
app.listen(port, function() {
  console.log(`LineBot is running on ${port}.`);
});
