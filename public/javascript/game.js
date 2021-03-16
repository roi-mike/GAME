const socket = io();

var canvas = document.querySelector('canvas');
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.backgroundColor = "gray";
var ctx = canvas.getContext("2d");

const ballRadius = 2.5;
let x = canvas.width/2;
let y = canvas.height-30;

function draw(){

        //SIZE CANVAS
        socket.emit('canvas size', {
                canvaswidth: x,
                canvasheight: y
        })

        //BALL
        socket.on('ball', data => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.arc(data.x, data.y, data.ballRadius, 0, Math.PI*2);
                ctx.fillStyle = "rgb(256, 256, 256)";
                ctx.fill();
                ctx.closePath();
                
        });
        //PLAYER 1 et 2
        socket.on('players', data => {
                for(const elements in data){
                        ctx.fillStyle = 'rgb(256, 256, 256)';
                        ctx.fillRect(data[elements].x, data[elements].y, 2.5, 20);
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
}



draw()








        
