const express = require('express');
route = express();

const { PostsModel }  = require('../models/postsModels');

route.get('/',(req,res)=>{
    res.render('index.ejs');
});

route.post('/checkinscription', (req,res)=>{
    const pseudo = req.body.pseudo;
    if(pseudo){
        console.log('VOTRE PSEUDO', pseudo);
        const newRecord = new PostsModel({
            pseudoID:pseudo
        });
        newRecord.save((err,docs) => {
            if(!err) res.send(docs);
            else console.log('Error creating new data : '+err);
        });
        res.redirect('/game');
    }
});

route.get('/tchat',(req,res)=>{
    var title = "TCHAT";
    res.render('tchat.ejs',{title:title})
});

route.get('/game',(req,res)=>{
    var title = "GAME";
    res.render('game.ejs',{title:title});
});

route.get('*',(req,res)=>{
    var title = "ERREUR";
    res.render('404.ejs',{title:title});
});



module.exports = route;