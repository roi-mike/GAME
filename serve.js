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

app.get("/", (req, res, next) => {
  console.log('INFORMATION : '+req.session.nameplayeur);
  if(req.session.nameplayeur){
    res.setHeader('Content-Type', 'text/html');
    res.redirect(302,"/account");
    return next();
  }else{
    res.status(200).render("index.ejs", {erreurpseudo: false});
  }
  // UsersPlayGame.find({},function (err, data) {
  //   //console.log('RESULT ', data);
  //   })
});

app.post("/", (req, res) => {
  pseudo = req.body.pseudo;
  if (pseudo) {
    customer.customergame = true;
    UsersPlayGame.findOne({nameplayer : pseudo.toLowerCase()})
    .exec()
    .then(result => {
      if(result != null ){
        res.render("index.ejs",{ erreurpseudo : " Pseudo déjà utilisé " });
      }else{
        req.session.nameplayeur = pseudo;

        let newSave = new UsersPlayGame({
          nameplayer: pseudo.toLowerCase(), 
        });
        newSave.save(function (err, data) {
          if(err){console.log('PAS INSCRIT')}
          })
        res.redirect(301,`/account`);  
      }
    })
    .catch(err =>{
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
    console.log('SESSION :', req.session.nameplayeur);
      PostsModel.find()
      .exec()
      .then(result =>{
        if(result){
          res.render('account.ejs',{pseudoid: req.session.nameplayeur.toLowerCase(), result: result})
        }
      })
      .catch(err =>{
        res.status(404).json({
          error: err,
        })
      });
  }else{
  res.setHeader('Content-Type', 'text/html');
  res.redirect('/');
  res.end();
  }
});

app.get("/account/game/", (req, res, next) => {
  if(req.session.nameplayeur){
    if(redirect){
      console.log('REDIRECTION');
      res.setHeader('Content-Type', 'text/html');
      res.status(302);
      res.redirect('/account');
      res.end();
      redirect = false;
      return next();
    }
    res.setHeader('Content-Type', 'text/html');
    res.render("game.ejs", { client: req.session.nameplayeur});
    res.end();
  }else{
    res.setHeader('Content-Type', 'text/html');
    res.redirect('/');
    res.end();
    return next();
  }
  
});

app.get('/disconect', (req, res)=>{
  console.log('DECONNEXION SAMUEL');
  if(req.session.nameplayeur){
    req.session.destroy();

    res.setHeader('Content-Type', 'text/html');
    res.redirect('/');
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
          
          players[`${Object.keys(players)[1]}`].win = true;
          //LE PLAYER RIGHT IS WINNER
          console.log('DROITE I LA  GAGNÉ',players[`${Object.keys(players)[1]}`].win);
          //Message annonce partie terminé
          io.emit('affichemessage',1);

          //inscription dans la base de donne
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
            console.log("Error creating new data : " + err);
            });
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
          players[`${Object.keys(players)[0]}`].win = true;
          //LE PLAYER IS WINNER
          //Message annonce partie terminé
          io.emit('affichemessage',1);

          //inscription dans la base de donne
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
              if (!err){

              }else{
                console.log("Error creating new data : " + err);
              } 
             }); 
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
    console.log('DECONNEXION ! ')
  });
});

app.get("*", (req, res) => {
  var title = "ERREUR";
  res.render("404.ejs", { title: title });
});


//------------------------------------------------------------

//app.use('/',postsRoutes);-------------------------

server.listen(servePort);
 
