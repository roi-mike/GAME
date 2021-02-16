const jeuencours = document.getElementById('jeuencours');
const alerinformationauclique = document.getElementById('alerinformationauclique');
const quitter = document.getElementById('quitter');

jeuencours.addEventListener("click", function(){
    alerinformationauclique.style.opacity = 1;
});

quitter.addEventListener("click", function(){
    alerinformationauclique.style.opacity = 0;
});