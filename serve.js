const express = require('express');
const app = express();

const servePort = process.env.PORT || 8080;
app.use('/static', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

const postsRoutes = require('./routes/postsControler');

app.use('/',postsRoutes);

var serveport = app.listen(servePort , ()=>{
    console.log('http://',serveport.address().address,':',serveport.address().port);
});
 
