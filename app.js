const express = require("express");
const port = 3000;
const app = express();
const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
//EJS
const ejs = require("ejs");
app.set("view engine", "ejs");
//static files
app.use(express.static("Public"));
//MongoDB
mongoose.connect(
  "mongodb+srv://rajit:1234@ghs-outpass.w9u6y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const information = new mongoose.Schema({
  name: String,
  registration: Number,
  email: String,
  warden: Number,
  block: String,
  reason: String
});
const Info = mongoose.model('Info', information);


//HOME PAGE ROUTE
app.get("/", (req, res) => {
  res.render("home");
});

app.post("/submit", (req, res) =>{
let val = new Info({
  name: req.body.name,
  registration: req.body.registration,
  email: req.body.email,
  warden: req.body.warden,
  block: req.body.block,
  reason: req.body.reason
});
val.save();
res.redirect("/");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
