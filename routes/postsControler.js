const express = require('express');
route = express();

route.get('/',(req,res)=>{
    var title = "INDEX";
    res.render('index.ejs',{title:title})
});

route.get('/tchat',(req,res)=>{
    var title = "TCHAT";
    res.render('tchat.ejs',{title:title})
});

route.get('/game',(req,res)=>{
    var title = "GAME";
    res.render('game.ejs',{title:title})
});

route.get('*',(req,res)=>{
    var title = "ERREUR";
    res.render('erreur.ejs',{title:title})
});



module.exports = route;