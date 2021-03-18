const express = require('express');
const cookie_parser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.set('trust proxy', 1) // trust first proxy
app.use(cookie_parser());

app.use(session({
  secret: 'playeur',
  resave: false,
  saveUninitialized: false,
  cookie:{
    maxAge: (1000*60)*2
  }
}));

require('./models/dbConfig');

const servePort = process.env.PORT || 8080;

// ajout de socket.io
const server = require('http').createServer(app);
const io = require('socket.io')(server);
let customer = {
  customergame: false,
 };
let players = {
  
}
let ball = {
  ballRadius: 1.6,
  x : 300/2,
  y : 100,
  dx : 1.8,
  dy : -1.8,
}

app.use('/static', express.static(__dirname + '/public'));
app.use('/account/static', express.static(__dirname + '/public'));
app.use('/socket.io', express.static(__dirname + '/socket.io'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());

//const postsRoutes = require('./routes/postsControler');-------
//------------------------------------------------------
const { PostsModel } = require("./models/postsModels");
const { connected } = require('process');

app.get("/", (req, res) => {
  res.render("index.ejs", {erreurpseudo: false});
});

app.post("/", (req, res) => {
  let pseudo = req.body.pseudo;
  if (pseudo) {
    customer.customergame = true;
    PostsModel.findOne({pseudoID : pseudo}, " pseudoID ")
    .exec()
    .then(result =>{
      if(result != null ){
        res.render("index.ejs",{ erreurpseudo : " Deja inscrit " });
      }else{
        req.session.nameplayeur = pseudo;
        console.log("PREMIERE INFO : ", pseudo);
  
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

app.get('/account', (req,res)=>{
  if(req.session.nameplayeur){
    res.render('account.ejs',{pseudoid: req.session.nameplayeur})
  }else{
    res.redirect('/');
  }
});

app.get('/account/', (req,res)=>{
  if(req.session.nameplayeur){
    res.render('account.ejs',{pseudoid: req.session.nameplayeur})
  }else{
    res.redirect('/');
  }
});

app.get("/tchat", (req, res) => {
  var title = "TCHAT";
  res.render("tchat.ejs", { title: title });
});

app.get("/game", (req, res) => {
  if(req.session.nameplayeur){
    console.log(req.session)
    console.log('VOTRE SESSION ', req.session.nameplayeur);
    var title = "GAME SAMUEL";
    res.render("game.ejs", { client: req.session.nameplayeur ,title: title });
  }else{
    res.redirect('/');
  }
  
});

app.get("/account/game/:idgame", (req, res) => {
  if(req.session.nameplayeur){
    //console.log(req.session)
    console.log('VOTRE SESSION ', req.session.nameplayeur);
    let numbPlayeurs = [];
    let numb = 0;  
    res.render("game.ejs", { client: req.session.nameplayeur});
    // établissement de la connexion SOCKET.IO
  }else{
    res.redirect('/');
  }
  
});


// function peint(){
//   io.emit('ball',ball);
//   io.emit('players',players);

//   ball.x += ball.dx;
//   ball.y += ball.dy;

//   /*FAIRE REBONDIRE LA BALLE SUR LES MURS DE DROITE ET DE GAUCHE*/
//   if(ball.x + ball.dx > 300 || ball.x + ball.dx < ball.ballRadius) {
//     ball.dx = -ball.dx;
    
//   }
  
//   /*VERIFIE SI LA BALLE TAPE A GAUCHE OU A DROITE*/
//   if(ball.x + ball.dx < 3 || ball.x + ball.dx < ball.ballRadius){
//     //console.log('JE SUIS A GAUCHE');
//   }
//   if(ball.x + ball.dx > 299 || ball.x + ball.dx < ball.ballRadius){
//     //console.log('JE SUIS A DROITE');
//   }

//   /*FAIRE REBONDIRE LA BALLE SUR LES MURS DU HAUT ET DU BAS*/
//   if(ball.y + ball.dy > 150 || ball.y + ball.dy < ball.ballRadius) {
//     ball.dy = -ball.dy;
//   }

//   /*detection colisions JOUEUR VS BALL*/


// }



io.on('connection', socket => {
  if(customer.customergame){
    players[socket.id] = {};
    players[socket.id].win = false;
    players[socket.id].y = 10;
    console.log('IL Y A ',Object.keys(players).length);
    var cptplayers = 0;
    for(let cpt in players){
      console.log(`2 iNFORMATION  PLAY ${players[cpt]}`);
      console.log(`3 INFORMATION ${cptplayers} ID ${cpt}`);
      if(players[socket.id]){
        players[socket.id].x = (cptplayers === 0) ? 10 : 285 ;
      }
      cptplayers++;
    }
    var peint = setInterval(function(){

      /*Verif numb players connected if player is egal one player*/
      if(Object.keys(players).length === 1){
        io.emit("right", 0);
        // console.log("Attente du second joueur..");
      }
      
      /*Verif numb players if there is more one player we start the game */
      if(Object.keys(players).length != 1){
        io.emit('ball',ball);
      }
      
      io.emit('players',players);

      ball.x += ball.dx;
      ball.y += ball.dy;

      /*FAIRE REBONDIRE LA BALLE SUR LES MURS DE DROITE ET DE GAUCHE*/
      if(ball.x + ball.dx > 300 || ball.x + ball.dx < ball.ballRadius) {
        ball.dx = -ball.dx;
      }
      
      /*VERIFIE SI LA BALLE TAPE A GAUCHE OU A DROITE*/
      if(ball.x + ball.dx < 3 || ball.x + ball.dx < ball.ballRadius){
        //console.log('JE SUIS A GAUCHE');
      }
      if(ball.x + ball.dx > 299 || ball.x + ball.dx < ball.ballRadius){
        //console.log('JE SUIS A DROITE');
      }

      /*FAIRE REBONDIRE LA BALLE SUR LES MURS DU HAUT ET DU BAS*/
      if(ball.y + ball.dy > 150 || ball.y + ball.dy < ball.ballRadius) {
        ball.dy = -ball.dy;
      }

      /*DETECTION DES COLLISION JOUEUR VS BALL*/

      if(players[socket.id].x < ball.x + ball.ballRadius &&
        players[socket.id].x + 2.5 > ball.x &&
        players[socket.id].y < ball.y + ball.ballRadius &&
        players[socket.id].y + 20 > ball.y + ball.ballRadius){
        ball.dx = -ball.dx;
      }
    },1000/10);

    socket.on('playeur bas',data => {
      players[socket.id].y+=data;
    });

    socket.on('playeur haut',data => {
      players[socket.id].y-=data;
    });

    console.log('IL Y A UNE CONNECTION', players);
    
  }
  socket.on('disconnect', function(){
    ball.x = 300/2;
    ball.y = 100;
    customer.customergame = false;
    delete players[socket.id];
    console.log('DECONNECT : ', Object.keys(players))
    console.log('DECONNECTION !');
  });
});

app.get("*", (req, res) => {
  var title = "ERREUR";
  res.render("404.ejs", { title: title });
});


//------------------------------------------------------------

//app.use('/',postsRoutes);-------------------------

server.listen(servePort);
 
