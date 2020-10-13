const Comment = require("../models/comment.js");
const Camp = require("../models/campground.js");

module.exports.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("failure", "You need to log in to do that.");
    res.redirect("/login");
}

module.exports.isAuthorizedCamps = function(req, res, next) {
    if (req.isAuthenticated()) {
        Camp.findById(req.params.campId, function (err, found) {
            if (err) {
                req.flash("failure", "It looks like something's gone wrong with this campground.");
                res.redirect("back");
            } else {
                if(!found){
                    return res.status(400).render("error", {error: "It looks like this campground doesn't exist."});
                }

                if (found.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("failure", "It looks like you don't own this campground.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("failure", "You need to be logged in to do that.");
        res.redirect("back");
    }
}

module.exports.isAuthorizedComments = function(req, res, next) {
    if (req.isAuthenticated()) {
        Camp.findById(req.params.campId, function (err, foundCamp) {
            if (err) {
                req.flash("failure", "It looks like something's gone wrong with this campground.");
                res.redirect("back");
            } else {
                if(!foundCamp){
                    return res.status(400).render("error", {error: "It looks like this campground doesn't exist."});
                }
                Comment.findById(req.params.commentId, function (err, foundComment) {
                    if (err) {
                        req.flash("failure", "It looks like something's gone wrong with this comment.");
                        res.redirect("back");
                    } else {
                        if(!foundComment){
                            return res.status(400).render("error", {error: "It looks like this comment doesn't exist."});
                        }

                        if (foundComment.author.id.equals(req.user._id)) {
                            next();
                        } else {
                            req.flash("failure", "It seems that this isn't your comment.");
                            res.redirect("back");
                        }
                    }

                });
            }
        })
    } else {
        req.flash("failure", "You need to be logged in to do that.");
        res.redirect("back");
    }
}