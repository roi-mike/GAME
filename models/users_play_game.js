const mongoose = require("mongoose");

const UsersPlayGameCollection = new mongoose.Schema({
    nameplayer : {
        type: String,
        required : true,
        default : "NC"
    }
});

const UsersPlayGame = mongoose.model("usersplaygame", UsersPlayGameCollection);

module.exports =  { UsersPlayGame };