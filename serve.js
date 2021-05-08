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
    maxAge: (1000*60)*15
  }
}));
let redirect = false;
let tempsgame = {
  compteur : 0,
  secondes : 0,
  minutes : 0,
  heure : 0
}

require('./models/dbConfig');

const servePort = process.env.PORT || 8080;
let startgame = false;

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
  dx : 1.3,
  dy : -1.3,
}

app.use('/static', express.static(__dirname + '/public'));
app.use('/account/static', express.static(__dirname + '/public'));
app.use('/socket.io', express.static(__dirname + '/socket.io'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());
let pseudo;

//const postsRoutes = require('./routes/postsControler');-------
//------------------------------------------------------
const { UsersPlayGame } = require("./models/users_play_game");
const { PostsModel } = require("./models/postsModels");

app.get('/', (req,res)=>{
    console.log("109 ACCOUNT 2 req.session.nameplayeur : ", req.session.nameplayeur);
    console.log("110 ACCOUNT 2 req.session.nbofpart : ", req.session.nbofpart);
    
      PostsModel.find()
      .exec()
      .then(result =>{
        if(result){
          res.render('account.ejs',{pseudoid: req.session.nameplayeur, result: result, erreurpseudo: ''});
        }
      })
      .catch(err =>{
        res.status(404).json({
          error: err,
        })
      });
});

app.post("/", (req, res) => {
  pseudo = req.body.pseudo.toLowerCase();
  console.log('PSEUDO '+pseudo);
    customer.customergame = true;

    UsersPlayGame.findOne({nameplayer : pseudo})
    .exec()
    .then(result => {
      var result = result;
      if(result != null ){
      PostsModel.find()
      .exec()
      .then(result =>{
        if(result){
          res.render("account.ejs",{result: result, pseudoid: req.session.nameplayeur, erreurpseudo : " Pseudo déjà utilisé " });
        }
      })
      .catch(err =>{
        res.status(404).json({
          error: err,
        })
      });
      }else{
        console.log("85 POST req.session.nameplayeur : ", req.session.nameplayeur);
        console.log("86 POST req.session.nbofpart : ", req.session.nbofpart);
        req.session.nameplayeur = pseudo.toLowerCase();
        req.session.nbofpart = 0;

        let newSave = new UsersPlayGame({
          nameplayer: pseudo.toLowerCase(), 
        });
        newSave.save(function (err, data) {
          if(err){console.log('PAS INSCRIT')}
          })
        res.redirect(301,`/account/game`);  
      }
    })
    .catch(err =>{
      res.status(404).json({
        error: err,
      })
    });
});

app.get("/account/game/", (req, res, next) => {

  if(redirect){
    console.log('REDIRECTION account/game 142');

    UsersPlayGame.deleteOne({nameplayer : pseudo },function(err){
      if(err){
        console.log("ERRERU");
      }
    }).where('okplay').equals(0);
    req.session.destroy();
    redirect = false;
    res.set('Content-Type', 'text/html');
    res.redirect(302,'/');
    res.end();
    return next();

  }

  if(req.session.nameplayeur){

    console.log("143 ACCOUNT/GAME req.session.nameplayeur 142 : ", req.session.nameplayeur);
    console.log("144 ACCOUNT/GAME req.session.nbofpart 143 : ", req.session.nbofpart);

    res.set('Content-Type', 'text/html');
    res.render("game.ejs", { client: req.session.nameplayeur});
    res.end();
  }
  
});

io.on('connection', socket => {

  if(customer.customergame){
    players[socket.id] = {};
    players[socket.id].name = pseudo.toLowerCase();
    players[socket.id].name_pos_y = 25;
    players[socket.id].win = false;
    players[socket.id].y = 10;
    players[socket.id].x = (Object.keys(players).indexOf(socket.id) === 0) ? 10 : 285 ;
    players[socket.id].score = 0;
    players[socket.id].scoreY = 15;
    players[socket.id].scoreX = (Object.keys(players).indexOf(socket.id) === 0) ? 120 : 170 ;
    
    var peint = setInterval(function(){
 
      /*Verif numb players connected if player is egal one player on start the parti*/
      if(Object.keys(players).length === 1){
        io.emit("right", 0);
        // console.log("Attente du second joueur..");
      }
      
      /*Verif numb players if there is more one player we start the game */
      if(Object.keys(players).length != 1){

          io.emit('ball',ball);
        /*Compteur de tour par seconde 60*/
        tempsgame.compteur += 1;

        if(tempsgame.compteur == 31){
          tempsgame.compteur = 0;
          tempsgame.secondes = tempsgame.secondes + 1;
          if(tempsgame.secondes === 60){
            tempsgame.secondes = 0;
            tempsgame.minutes += 1;
            if(tempsgame.minutes === 60){
              tempsgame.minutes = 0;
              tempsgame.heure += 1;
            }
          }
        }

        socket.emit('tempsgame', tempsgame);

        socket.on('startgame', data => {
          startgame = data;
        })

        if(players[socket.id]){
          if(players[`${Object.keys(players)[0]}`].win === true || players[`${Object.keys(players)[1]}`].win === true){
            clearInterval(peint);
          }{
            if(startgame === 1){
              ball.x += ball.dx;
              ball.y += ball.dy;
            }
          }
        }
        
      }

      //Envoyer les joueurs
      io.emit('players',players);

      /*FAIRE REBONDIRE LA BALLE SUR LES MURS DE DROITE ET DE GAUCHE*/
      if(ball.x + ball.dx > 300 || ball.x + ball.dx < ball.ballRadius) {
        ball.dx = -ball.dx;
      }
      
      /*VERIFIE SI LA BALLE TAPE A GAUCHE*/
      if(ball.x + ball.dx < 3 || ball.x + ball.dx < ball.ballRadius){
        //console.log('JE SUIS A GAUCHE');
          if(startgame === 1){
              ball.x = 300/2;
              startgame = false;
          }

        //console.log('LES CLES ', Object.keys(players)[0]);
        players[`${Object.keys(players)[1]}`].score += 1;

        //CHECK IF THE RIGHT PLAYER HAS WIN
        if(players[`${Object.keys(players)[1]}`].score === 5){

          console.log('SESSION FINI 290 : ', pseudo);
          
          players[`${Object.keys(players)[1]}`].win = true;

          
          //inscription dans la base de donnee du score et de la validation que le jeu et bien fini
        
          
          let newRecord = new PostsModel({
            playerone: [
              players[`${Object.keys(players)[0]}`].name.toLowerCase(),
              players[`${Object.keys(players)[0]}`].win,
              players[`${Object.keys(players)[0]}`].score,
              ,
            ],
            playertwo: [
              players[`${Object.keys(players)[1]}`].name.toLowerCase(),
              players[`${Object.keys(players)[1]}`].win,
              players[`${Object.keys(players)[1]}`].score,
            ],
            tempsgame : tempsgame.minutes +" : "+tempsgame.secondes, 
          });
          newRecord.save((err, docs) => {
            if(err){
              console.log(err);
            }
          });
          
          UsersPlayGame.updateOne({ nameplayer : players[`${Object.keys(players)[0]}`].name},{okplay:1}, function(data){});
          
          UsersPlayGame.updateOne({ nameplayer : players[`${Object.keys(players)[1]}`].name},{okplay:1}, function(data){});
          
          //Message annonce partie terminé
          io.emit('affichemessage',1);
        }
      }


      /*VERIFIE SI LA BALLE TAPE A DROITE*/
      if(ball.x + ball.dx > 299 || ball.x + ball.dx < ball.ballRadius){

        //console.log('JE SUIS A DROITE');
        players[`${Object.keys(players)[0]}`].score += 1;

          if(startgame === 1){
              ball.x = 300/2;
              startgame = false;
          }
        
        //CHECK IF THE PLAYER IS WINNER
        if(players[`${Object.keys(players)[0]}`].score === 5){

          console.log('SESSION FINI 319 : ', pseudo);

          players[`${Object.keys(players)[0]}`].win = true;
          //LE PLAYER IS WINNER
          //Message annonce partie terminé
          
          
          //inscription dans la base de donnee du score et de la validation que le jeu et bien fini
          
          let newRecord = new PostsModel({
            playerone: [
              players[`${Object.keys(players)[0]}`].name.toLowerCase(),
              players[`${Object.keys(players)[0]}`].win,
              players[`${Object.keys(players)[0]}`].score,
            ],
            playertwo: [
              players[`${Object.keys(players)[1]}`].name.toLowerCase(),
              players[`${Object.keys(players)[1]}`].win,
              players[`${Object.keys(players)[1]}`].score,
            ],
            tempsgame : tempsgame.minutes +" : "+tempsgame.secondes, 
          });
          newRecord.save((err, docs) => {
            if(err){
              console.log("Error creating new data : " + err);
            }
          });
          
          UsersPlayGame.updateOne({ nameplayer : players[`${Object.keys(players)[0]}`].name},{okplay:1}, function(data){});
          
          UsersPlayGame.updateOne({ nameplayer : players[`${Object.keys(players)[1]}`].name},{okplay:1}, function(data){});
          
          io.emit('affichemessage',1);
        }


      }

      /*FAIRE REBONDIRE LA BALLE SUR LES MURS DU HAUT ET DU BAS*/
      if(ball.y + ball.dy > 150 || ball.y + ball.dy < ball.ballRadius) {
        ball.dy = -ball.dy;
      }

      /*DETECTION  COLISSIONS PlAYERS ON BALL*/

      if(players[socket.id]){
        if(players[socket.id].x < ball.x + ball.ballRadius &&
          players[socket.id].x + 2.5 > ball.x &&
          players[socket.id].y < ball.y + ball.ballRadius &&
          players[socket.id].y + 20 > ball.y + ball.ballRadius){
          ball.dx = -ball.dx;
        }
      }
    },60);

    socket.on('playeur bas',data => {
      players[socket.id].y+=data;
    });

    socket.on('playeur haut',data => {
      players[socket.id].y-=data;
    });
    
  }
  socket.on('disconnect', function(){
    ball.x = 300/2;
    ball.y = 100;
    redirect = true;

    customer.customergame = false;
    delete players[socket.id];
    

    console.log('DECONNEXION ! ');
  });
});



app.get("*", (req, res) => {
  var title = "ERREUR";
  res.render("404.ejs", { title: title });
});


//------------------------------------------------------------

//app.use('/',postsRoutes);-------------------------

server.listen(servePort);
 
