const mongoose = require("mongoose");

const UsersPlayGameCollection = new mongoose.Schema({
    nameplayer : {
        type: String,
        required : true,
        default : "NC"
    },
    okplay : {
        type: Number,
        required : true,
        default :0
    }
});

const UsersPlayGame = mongoose.model("usersplaygame", UsersPlayGameCollection);

module.exports =  { UsersPlayGame };