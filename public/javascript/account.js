const { text } = require("body-parser");

const randongame = document.querySelector("#playgame>a");
const gamepang = document.querySelector("#gamepang>a");
const idgamerandom = Math.floor(Math.random()*100);
randongame.setAttribute('href',`/account/game/${idgamerandom}`)
gamepang.setAttribute('href',`/account/game/${idgamerandom}`);

listescore.style.overflow = "scroll";