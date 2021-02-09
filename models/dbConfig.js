const mongoose = require('mongoose');
mongoose.connect(
    "mongodb+srv://Maboza:pusha@cluster0.zscur.mongodb.net/pong-ificop?retryWrites=true&w=majority",
    {useNewUrlParser:true, useUnifiedTopology:true},
    (err) => {
        if(!err)console.log('MongoDB connected');
        else console.log("Connection error : "+err);
    }
)