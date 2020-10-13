// const mongoose = require("mongoose");
const Camp = require(__dirname + "/models/campground.js");
const Comment = require(__dirname + "/models/comment.js");

const camp1 = new Camp({
    name: "Indian Line",
    image: "https://images.pexels.com/photos/699558/pexels-photo-699558.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260",
    description: "Beautiful campground",
    comments: []
});

const camp2 = new Camp({
    name: "Glen Rouge",
    image: "https://images.pexels.com/photos/2422265/pexels-photo-2422265.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    description: "Stunning views throughout the trail",
    comments: []
});

const camp3 = new Camp({
    name: "Bronte Creek",
    image: "https://images.pexels.com/photos/2662816/pexels-photo-2662816.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260",
    description: "Gorgeous creek teeming with wildlife",
    comments: []
});

const camps = [camp1, camp2, camp3];

module.exports = function(){
    Comment.deleteMany(function(err){});
    Camp.deleteMany(function(err){
        if(err){
            console.log(err);
        } 
        console.log("removed camps");
        camps.forEach(function(camp){
            camp.save(function(err){
                if(err){
                    console.log(err);
                } else{
                    var comment = new Comment({
                        text: "no internet",
                        author: "john"
                    });
                    comment.save(function(err){
                        if(err){
                            console.log(err);
                        } else {
                            camp.comments.push(comment._id);
                            camp.save();
                        }
                    })
                }
            })
        })
    })
}

