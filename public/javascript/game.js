const socket = io();

var canvas = document.querySelector("canvas");
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.backgroundColor = "gray";
var ctx = canvas.getContext("2d");
const finnalgamemessage = document.querySelector(".finnal");
const messageforfinnal = document.createElement("p");
messageforfinnal.innerHTML = "C'est Fini ";
messageforfinnal.style.fontSize = "40px";
const retourligne = document.createElement("br");
const retouraccueil = document.createElement("a");
retouraccueil.style.backgroundColor = "gray";
retouraccueil.style.borderRadius = "5px";
retouraccueil.style.padding = "5px";
retouraccueil.setAttribute("href","/");
retouraccueil.innerHTML = "retour à l'acceuil";
finnalgamemessage.appendChild(messageforfinnal);
finnalgamemessage.appendChild(retourligne);
finnalgamemessage.appendChild(retouraccueil);


const ballRadius = 2.5;
let x = canvas.width / 2;
let y = canvas.height - 30;

// //SIZE CANVAS
// socket.emit('canvas size', {
//         canvaswidth: x,
//         canvasheight: y
// })

//PLAYER 1 et 2
socket.on("players", (data) => {
  for (let id in data) {
    if (data[id].x != undefined) {
      ctx.fillStyle = "rgb(256, 256, 256)";
      ctx.fillRect(data[id].x, data[id].y, 2.5, 20);

      ctx.font = "20px serif";
      ctx.fillText(data[id].score, data[id].scoreX, data[id].scoreY);
    }
  }
});

//BALL
socket.on("ball", (data) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (data != undefined) {
    ctx.beginPath();
    ctx.arc(data.x, data.y, data.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgb(256, 256, 256)";
    ctx.fill();
    ctx.closePath();
  }
});

socket.on("affichemessage", data => {
        if(data){
                finnalgamemessage.style.visibility = "visible";
                finnalgamemessage.style.opacity = "1";
        }
});

/*DROITE DE JOUER OU PAS */
socket.on("right", (data) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (data !== undefined) {
    ctx.font = "25px serif";
    ctx.fillText("Attente du second joueur...", 5, canvas.height/2);
  }
});

socket.on("winright", (data) => {
  console.log(data);
});

socket.on("winleft", (data) => {
  console.log(data);
});

//MOVE PLAYERS
document.addEventListener("keydown", function (evt) {
  if (evt.code === "ArrowUp") {
    socket.emit("playeur haut", 5);
  }
  if (evt.code === "ArrowDown") {
    socket.emit("playeur bas", 5);
  }
  if (evt.code === "ArrowRight") {
    socket.emit("startgame", 1);
  }
});
