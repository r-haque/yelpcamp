const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.js");

router.get("/", function (req, res) {
    res.render("landing");
});

///////////////////////////// AUTHENTICATION ////////////////////////////////

router.get("/register", function (req, res) {
    res.render("register");
})

router.post("/register", function (req, res) {
    const newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function (err) {
        if (err) {
            console.log(err.message);
            req.flash("failure", err.message + ".");
            res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "You have successfully signed up! We're happy to have you, " + newUser.username + "!");
            res.redirect("/campgrounds");
        })
    })
})

/////////////////////////////// LOGIN ////////////////////////////////////////

router.get("/login", function (req, res){
    res.render("login");
});

router.post("/login", passport.authenticate("local", 
{
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: { type: 'failure', message: 'Invalid username or password.' }
}));

router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You've been successfully logged out.");
    res.redirect("/campgrounds");
})


module.exports = router;