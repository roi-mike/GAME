const express = require("express");
const cookie_parser = require('cookie-parser');
const session = require('express-session');
route = express();
route.set('trust proxy', 1) // trust first proxy
route.use(cookie_parser());

var sess;
route.use(session({
  secret: 'playeur',
  resave: false,
  saveUninitialized: false,
  cookie:{
    maxAge: (1000*60)*2
  }
}));

const { PostsModel } = require("../models/postsModels");
const { render } = require("ejs");

route.get("/", (req, res) => {
  res.render("index.ejs", {erreurpseudo: false});
});

route.post("/", (req, res) => {
  let pseudo = req.body.pseudo;
  if (pseudo) {
    PostsModel.findOne({pseudoID : pseudo}, " pseudoID ")
    .exec()
    .then(result =>{
      if(result != null ){
        res.render("index.ejs",{ erreurpseudo : " Deja inscrit " })
      }else{
        req.session.nameplayeur = pseudo;
        console.log("PREMIERE INFO : ", pseudo);
        const idgamerandom = Math.floor(Math.random()*100);
        res.redirect(301,`/account`)
        //res.redirect(301, `/game/idgame-${idgamerandom}`)   
      }
    })
    .catch(err =>{
      console.log(err);
      res.status(404).json({
        error: err,
      })
    });
        // const newRecord = new PostsModel({
        //   pseudoID: pseudo,
        // });
        // newRecord.save((err, docs) => {
        //   if (!err) res.send(docs);
        //   else console.log("Error creating new data : " + err);
        // }); 
  }
});

route.get('/account', (req,res)=>{
  if(req.session.nameplayeur){
    res.render('account.ejs',{pseudoid: req.session.nameplayeur})
  }else{
    res.redirect('/');
  }
  
});

route.get("/tchat", (req, res) => {
  var title = "TCHAT";
  res.render("tchat.ejs", { title: title });
});

route.get("/game", (req, res) => {
  if(req.session.nameplayeur){
    console.log(req.session)
    console.log('VOTRE SESSION ', req.session.nameplayeur);
    var title = "GAME SAMUEL";
    res.render("game.ejs", { client: req.session.nameplayeur ,title: title });
  }else{
    res.redirect('/');
  }
  
});

route.get("/game/:idgame", (req, res) => {
  if(req.session.nameplayeur){
    console.log(req.session)
    console.log('VOTRE SESSION ', req.session.nameplayeur);
    var title = "GAME SAMUEL";
    res.render("game.ejs", { client: req.session.nameplayeur ,title: title });
  }else{
    res.redirect('/');
  }
  
});

route.get("*", (req, res) => {
  var title = "ERREUR";
  res.render("404.ejs", { title: title });
});

module.exports = route;
