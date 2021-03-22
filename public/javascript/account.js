const { text } = require("body-parser");

const randongame = document.querySelector("#playgame>a");
const gamepang = document.querySelector("#gamepang>a");
const idgamerandom = Math.floor(Math.random()*100);
const listescore = document.getElementById('scoreplayers');
randongame.setAttribute('href',`/account/game/${idgamerandom}`)
gamepang.setAttribute('href',`/account/game/${idgamerandom}`);

const playersliste = document.createElement("p");
playersliste.style.textTransform = "uppercase";

let text = "HELLO";
let hihih = playersliste.appendChild(text);

listescore.appendChild(hihih);