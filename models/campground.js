const mongoose = require("mongoose");
const campSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    price: Number,
    formattedPrice: String,
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    stars: {
        type: Number,
        default: 0
    },
    numStars: String,
    longitude: Number,
    latitude: Number
});

module.exports = mongoose.model("Camp", campSchema);