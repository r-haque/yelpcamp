if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const ejs = require("ejs");
const mongoose = require("mongoose");
var methodOverride = require('method-override')

const Camp = require(__dirname + "/models/campground.js");
const Comment = require(__dirname + "/models/comment.js");
const User = require(__dirname + "/models/user.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);

const flash = require("connect-flash");

const campgroundRoutes = require(__dirname + "/routes/campgrounds.js");
const commentRoutes = require(__dirname + "/routes/comments.js");
const indexRoutes = require(__dirname + "/routes/index.js");

const app = express();

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelpcampDB';
const secret = process.env.SECRET || "i dont know what to do";

app.set('view engine', 'ejs');

const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on("error", function(err){
    console.log("session store error", err);
})

app.use(session({
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 *24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.locals.moment = require('moment');
app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
    res.locals.user = req.user;
    res.locals.failure = req.flash("failure");
    res.locals.success = req.flash("success");
    next();
});

app.use(methodOverride("_method"));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

app.use(indexRoutes);
app.use("/campgrounds/:campId/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

app.listen(process.env.PORT || 3000, function () {
    console.log("YelpCamp server has started");
});