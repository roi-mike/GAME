const socket = io();

var canvas = document.querySelector('canvas');
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.backgroundColor = "gray";
var ctx = canvas.getContext("2d");

const ballRadius = 2.5;
let x = canvas.width/2;
let y = canvas.height-30;
let dx = 1.8;
let dy = -1.8;

console.log(canvas.width+" "+canvas.height);

//ENVOYER TAILLE CANVAS
var canvaswidth = canvas.width;
var canvasheight = canvas.height;

        //PLAYER 1
function play1(){
        ctx.fillStyle = 'rgb(256, 256, 256)';
        ctx.fillRect(10, 10, 2.5, 20);
}

        //PLAYERS 2
function play2(){
        ctx.fillStyle = 'rgb(256, 256, 256)';
        ctx.fillRect(285, 50, 2.5, 20);
}

function draw(){
        
        //BALL GAME
        // x += dx;
        // y += dy;

        // if(x + dx > canvas.width || x + dx < 0) {
        //         dx = -dx;
        // }
        // if(y + dy > canvas.height || y + dy < 0) {
        //         dy = -dy;
        // }



        socket.emit('canvas size', {
                canvaswidth: x,
                canvasheight: y
        })

        socket.on('ball', data => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.arc(data.x, data.y, data.ballRadius, 0, Math.PI*2);
                ctx.fillStyle = "rgb(256, 256, 256)";
                ctx.fill();
                ctx.closePath();
                socket.on('players', data => {
                        for(const elements in data){
                                ctx.fillStyle = 'rgb(256, 256, 256)';
                                ctx.fillRect(data[elements].x, data[elements].y, 2.5, 20);
                        }
                });
        });


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


        


        

        //                 ctx.clearRect(0, 0, canvas.width, canvas.height);
        //                 ctx.beginPath();
        //                 ctx.arc(data.x, data.y, data.ballRadius, 0, Math.PI*2);
        //                 ctx.fillStyle = "rgb(256, 256, 256)";
        //                 ctx.fill();
        //                 ctx.closePath();

        //PLAYER 1
        //play1()
        

        //PLAYERS 2
        play2()
        
}



draw()








        
