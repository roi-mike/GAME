const socket = io();

var canvas = document.querySelector('canvas');
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.backgroundColor = "gray";
var ctx = canvas.getContext("2d");

const ballRadius = 2.5;
let x = canvas.width/2;
let y = canvas.height-30;



        // //SIZE CANVAS
        // socket.emit('canvas size', {
        //         canvaswidth: x,
        //         canvasheight: y
        // })


        //PLAYER 1 et 2
        socket.on('players', data => {
                        for(let id in data){
                                if(data[id].x != undefined){
                                        ctx.fillStyle = 'rgb(256, 256, 256)';
                                        ctx.fillRect(data[id].x, data[id].y, 2.5, 20);
                                }
                        }
        });

        //BALL
        socket.on('ball', data => { 
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if(data != undefined){
                        ctx.beginPath();
                        ctx.arc(data.x, data.y, data.ballRadius, 0, Math.PI*2);
                        ctx.fillStyle = "rgb(256, 256, 256)";
                        ctx.fill();
                        ctx.closePath();
                }
        });

        /*DROITE DE JOUER OU PAS */
        socket.on("right", data => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if(data !== undefined){
                ctx.font = "10px serif";
                ctx.fillText("Attente du second joueur..",10,10);
                }
        });

        
        

        //MOVE PLAYERS
        document.addEventListener('keydown', function(evt){
                if(evt.code === "ArrowUp"){
                        console.log('EN HAUT 1');
                        socket.emit("playeur haut", 5);
                }
                if(evt.code === "ArrowDown"){
                        console.log('EN BAS 2');
                        socket.emit("playeur bas", 5);
                }
        });









        
