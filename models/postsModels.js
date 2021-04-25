const mongoose = require("mongoose");

const PostsModel = mongoose.model(
    "pong-ificop",
    {
        playerone:{
            type:Array,
            required:true
        },
        playertwo:{
            type:Array,
            required: true
        },
        tempsgame : {
            type: String,
            required : true,
        }
    },
    "pong"
);


module.exports =  { PostsModel } ;
