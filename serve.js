const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
const app = express();
require('./models/dbConfig');



const servePort = process.env.PORT || 8080;

app.use('/static', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))
// app.use(cors());

const postsRoutes = require('./routes/postsControler');

app.use('/',postsRoutes);

var serveport = app.listen(servePort , ()=>{
    console.log('http://',serveport.address().address,':',serveport.address().port);
});
 
