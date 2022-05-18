require("dotenv").config();

const express = require("express"); // server software
const bodyParser = require("body-parser"); // parser middleware
const session = require("express-session"); // session middleware
const passport = require("passport"); // authentication
const connectEnsureLogin = require("connect-ensure-login"); //authorization
const LocalStrategy = require("passport-local");
const port = process.env.PORT || 3000;
const app = express();
const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const ejs = require("ejs");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const shortid = require('shortid');

//MongoDB
mongoose.connect(
  "mongodb+srv://rajit:1234@ghs-outpass.w9u6y.mongodb.net/Requests?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const passportLocalMongoose = require("passport-local-mongoose");
const urlencoded = require("body-parser/lib/types/urlencoded");
const { addAbortSignal } = require("stream");
app.set("view engine", "ejs");
app.use(express.static("Public"));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: mongoose.on,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

const information = new mongoose.Schema({
  id: String,
  name: String,
  registration: Number,
  email: String,
  warden: String,
  block: String,
  reason: String,
  permission: Boolean,
  remark: String,
});
//Strategy
const User = new mongoose.Schema({
  username: String,
  password: String,
});
User.plugin(passportLocalMongoose);

const Info = mongoose.model("Info", information);
const UserDetails = mongoose.model("User", User);

passport.use(UserDetails.createStrategy());
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

//HOME PAGE ROUTE
app.get("/", (req, res) => {
  res.render("home");
});

//BLOCK WARDENS PAGE 
app.get("/blockwarden",(req,res)=>{
  res.render('blockwarden');
})

//Login Page route
app.get("/login", (req, res) => {
  req.logout();
  res.render("login");
});

//Home page form validation and mongodb data save
app.post(
  "/submit",
  body("name", "Name must is not valid").isAlpha("en-US", { ignore: " " }),
  body("email", "Email is not valid").isEmail().normalizeEmail(),
  body("reg", "Registration Number is not valid").isNumeric().isLength(9),
  (req, res) => {
    const id = shortid.generate();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(422).jsonp(errors.array())
      const alert = errors.array();
      res.render("home", {
        alert,
      });
    } else {
      let val = new Info({
        id: id,
        name: req.body.name,
        registration: req.body.reg,
        email: req.body.email,
        warden: req.body.warden,
        block: req.body.block,
        reason: req.body.reason,
        permission: false,
        remark: "Pending",
      });

      val.save(function (err) {
        if (err) {
          console.log(err);
        }
      });
      res.render("success", { id });
    }
  }
);
//for viewing the submissions
app.get("/access", connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  Info.find({}, function (err, reqs) {
    res.render("requests.ejs", { data: reqs });
  });
});

//for viewing the request details
app.get("/access/:id", (req, res) => {
  Info.findOne({ id: req.params.id }, function (err, data) {
    res.render("approval", { val: data });
  });
});

//For allow reject status update
app.post("/access/:id/remark", (req, res) => {
  Info.findOneAndUpdate(
    { id: req.params.id },
    { $set: { remark: req.body.remark,permission: req.body.answer}},
    { new: true },
    (err, doc) => {
      if (err) {
        console.log("Something wrong when updating data!");
      }
      //For logging the document
      // console.log(doc);
    }
  );
  res.redirect("/access");
});
//Status check 
app.get("/status",(req,res)=>{
  res.render('status',{data:""});
})

//Status check - post
app.post("/status",(req,res)=>{
  Info.findOne({id:req.body.id},(err,data)=>{
    res.render('status',{data:data});
  })
})

//Closing outpass request 
app.get("/return",(req,res)=>{
  res.render('return',{data:""});
});

app.post("/return/search",(req,res)=>{
  Info.findOne({id:req.body.id},(err,data)=>{
    res.render('return',{data:data});
  })
})

app.post("/return/search/:id",(req,res)=>{
  Info.findOneAndDelete({id:req.params.id},(err,data)=>{
    res.render('success',{id:"Closed"});
  })
})
//Passport js login logout
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/access",
  }),
  (req, res) => {
    console.log(req.user);
  }
);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// UserDetails.register({ username: 'Rajit', active: false }, '6969');
