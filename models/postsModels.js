const mongoose = require("mongoose");


const pongCollection = new mongoose.Schema({
    playerone:{
        type:Array,
        required:true,
    },
    playertwo:{
        type:Array,
        required: true,
    },
    tempsgame : {
        type: String,
        required : true,
    }
})


const PostsModel = mongoose.model("pong", pongCollection);




module.exports =  { PostsModel } ;
