const express = require("express");
const router = express.Router();
const Camp = require("../models/campground.js");
const Comment = require("../models/comment.js");
const middleware = require("../middleware/index.js");
const { response } = require("express");
const https = require("https");
const access_token = "pk.eyJ1IjoicmhhcXVlIiwiYSI6ImNrZzcxM29zeDAyeGkyeW16aDd2bGxyNGQifQ.Qbe6Xi9ym_Kd5YJJk9MJBw";

///////////////////////////////////////////CAMPGROUNDS/////////////////////////////////////

//Index
router.get("/", function(req, res) {
    Camp.find().sort([["stars", -1]]).exec(function(err, allCamps) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { camps: allCamps });
        }
    })
});

//Create
router.post("/", middleware.isLoggedIn, function(req, res) {
    const price = parseFloat(req.body.price);
    const newCamp = new Camp({
        name: req.body.name,
        image: req.body.image,
        description: req.body.description,
        price: price,
        formattedPrice: price.toFixed(2).toString(),
        author: {
            id: req.user._id,
            username: req.user.username
        },
        longitude: req.body.longitude,
        latitude: req.body.latitude
    });
    newCamp.save(function(err) {
        if (err) {
            req.flash("failure", "It looks like something's gone wrong.");
        } else {
            req.flash("success", "Your camp has been added!");
        }
        res.redirect("/campgrounds");
    });
});

//New
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

//Show
router.get("/:campId", getAverageRating, updateCampRating, function(req, res) {
    var classes = "";
    var placeName = ""
    Camp.findById(req.params.campId).populate("comments").exec(function(err, found) {
        if (err) {
            console.log(err);
        } else {
            if (!found) {
                return res.status(400).render("error", { error: "It looks like this campground doesn't exist." });
            }
            if(found.comments.length !== 0){
                classes += "value-" + found.stars;
            }
            const url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + found.longitude + "," + found.latitude + ".json?types=poi&access_token=" + access_token;
            
            https.get(url, function(response){
                response.on("data", function(data){                    
                    const location = JSON.parse(data);
                    if(location.features.length !== 0){
                        placeName = location.features[0].place_name;
                    }
                    res.render("campgrounds/show", { camp: found, classes: classes, placeName: placeName });
                })
            })
        }
    });
});

//Edit
router.get("/:campId/edit", middleware.isAuthorizedCamps, function(req, res) {
    Camp.findById(req.params.campId, function(err, found) {
        res.render("campgrounds/edit", { camp: found });
    });
});

//Update
router.put("/:campId", middleware.isAuthorizedCamps, function(req, res) {
    const price = parseFloat(req.body.price);
    Camp.findByIdAndUpdate(req.params.campId, {
        name: req.body.name,
        image: req.body.image,
        price: price,
        formattedPrice: price.toFixed(2).toString(),
        description: req.body.description,
        longitude: req.body.longitude,
        latitude: req.body.latitude
    }, function(err) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Your camp has been successfully updated.");
            res.redirect("/campgrounds/" + req.params.campId);
        }
    })
});

//Delete
router.delete("/:campId", middleware.isAuthorizedCamps, function(req, res) {
    Camp.findById(req.params.campId, function(err, found) {
        if (err) {
            console.log(err);
        } else {
            found.comments.forEach(function(comment) {
                Comment.findByIdAndDelete(comment, function(err) {
                    if (err) {
                        console.log(err);
                    }
                })
            });
        }
    });
    Camp.findByIdAndDelete(req.params.campId, function(err) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Your camp has been successfully deleted.");
            res.redirect("/campgrounds");
        }
    })
});

var average = 0;
function getAverageRating(req, res, next){
    const campId = req.params.campId;
    var total = 0;
    var numComments = 0;
    Camp.findById(campId).populate("comments").exec(function(err, found) {
        if (err) {
            console.log(err);
        } else {
            if (!found) {
                return res.status(400).render("error", { error: "It looks like this campground doesn't exist." });
            }
            else{
                found.comments.forEach(function(comment){
                    total += comment.stars;
                    numComments += 1;
                })
                if(numComments === 0){
                    average = 0;
                } else{ 
                    average = total/numComments; 
                }
                next();
            }
        }
    })
}

function updateCampRating(req, res, next){
    const avg = average.toFixed(1);
    const numStars = avg.toString();
    const stars = Math.round(avg);
    Camp.findByIdAndUpdate(req.params.campId, {
        stars: stars,
        numStars: numStars
    }, function(err) {
        if (err) {
            console.log(err);
        } else {
            next();
        }
    });
}

module.exports = router;