const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const config = require("./config/database");
const port = process.env.PORT || 8000;

mongoose.connect(
  config.database,
  { useNewUrlParser: true },
  { useUnifiedTopology: true }
);

let db = mongoose.connection;

db.on("error", function(err) {
  console.log(err);
});

db.once("open", () =>
  console.log("*************** Connected to MongoDb ***************")
);

const app = express();

let Article = require("./models/article");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);

app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

require("./config/passport")(passport);

app.use(passport.initialize());
app.use(passport.session());
app.get("*", function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});

app.get("/", function(req, res) {
  Article.find({}, function(err, articles) {
    console.log(articles);
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        title: "Home",
        articles: articles
      });
    }
  });
});



let articles = require("./routes/articles");
app.use("/articles", articles);

let users = require("./routes/users");
app.use("/users", users);

app.listen(port, () => {
  console.log("App is running on port " + port);
});
