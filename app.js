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
const { v1: uuidv1 } = require('uuid');

//MongoDB
mongoose.connect(
  "mongodb+srv://rajit:1234@ghs-outpass.w9u6y.mongodb.net/Requests?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const passportLocalMongoose = require("passport-local-mongoose");
const urlencoded = require("body-parser/lib/types/urlencoded");
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

//Login Page route
app.get("/login", (req, res) => {
  req.logout();
  res.render("login");
});

app.post(
  "/submit",
  body("name", "Name must is not valid").isAlpha('en-US', {ignore: ' '}),
  body("email", "Email is not valid").isEmail().normalizeEmail(),
  body("reg", "Registration Number is not valid").isNumeric().isLength(9),
  (req, res) => {
    const id = uuidv1();
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
        registration: req.body.registration,
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
    
    }
    res.render('success',{id});

  }
);

app.get("/secret", connectEnsureLogin.ensureLoggedIn(), (req, res) =>
  res.render("requests.ejs")
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/secret",
  }),
  (req, res) => {
    console.log(req.user);
  }
);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// UserDetails.register({ username: 'Rajit', active: false }, '6969');
