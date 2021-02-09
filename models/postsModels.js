const mongoose = require("mongoose");

const PostsModel = mongoose.model(
    "pong-ificop",
    {
        pseudoID:{
            type:String,
            required:true
        },
        date:{
            type:Date,
            default: Date.now
        }
    },
    "pong"
);


module.exports =  { PostsModel } ;
