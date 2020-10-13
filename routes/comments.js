const express = require("express");
const router = express.Router({ mergeParams: true });
const Comment = require("../models/comment.js");
const Camp = require("../models/campground.js");
const middleware = require("../middleware/index.js");

/////////////////////////////////////COMMENTS/////////////////////////////////////////////

//Comments Create
router.post("/", middleware.isLoggedIn, function (req, res) {
    const newComment = new Comment({
        text: req.body.review,
        stars: req.body.starrating
    });
    Camp.findById(req.params.campId, function (err, found) {
        if (err) {
            req.flash("failure", "It looks like something's gone wrong with this campground.");
        } else {
            newComment.author.id = req.user._id;
            newComment.author.username = req.user.username;
            newComment.save();
            found.comments.push(newComment._id);
            found.save();
            req.flash("success", "Your review has been added!");
        }
    });
    res.redirect("/campgrounds/" + req.params.campId);
});

//Comments New
router.get("/new", middleware.isLoggedIn, function (req, res) {
    Camp.findById(req.params.campId, function (err, found) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { camp: found });
        }
    });
});

//Comments Edit
router.get("/:commentId/edit", middleware.isAuthorizedComments, function (req, res) {

    Camp.findById(req.params.campId, function (err, foundCamp) {
        Comment.findById(req.params.commentId, function (err, foundComment) {
            res.render("comments/edit", { camp: foundCamp, oldComment: foundComment });
        });
    })

});

//Comments Update
router.put("/:commentId", middleware.isAuthorizedComments, function (req, res) {
    Comment.findByIdAndUpdate(req.params.commentId,
        {
            text: req.body.review,
            stars: req.body.starrating
        }, function (err) {
            if (err) {
                console.log(err);
                res.redirect("/campgrounds");
            } else {
                req.flash("success", "Your comment has been successfully updated.");
                res.redirect("/campgrounds/" + req.params.campId);
            }
        });
});

//Comments Delete
router.delete("/:commentId", middleware.isAuthorizedComments, function (req, res) {
    Camp.findByIdAndUpdate(req.params.campId, {$pull: {comments: {$in: [req.params.commentId]}}}, function (err, foundCamp) {
        if(err){
            res.redirect("back");
        } else{
            Comment.findByIdAndDelete(req.params.commentId, function (err) {
                if (err) {
                    res.redirect("/campgrounds");
                } else {
                    req.flash("success", "Your comment has been successfully deleted.");
                    res.redirect("/campgrounds/" + req.params.campId);
                }
            });
        }
    })
});

module.exports = router;