var express = require('express');
var team = require('./team');
var users = require('./users');
var nodemailer = require("nodemailer");

var app = express();//.createServer();
app.configure(function () {
    app.use(express.logger('dev'));  // show messages in the prompt  
    app.use(express.bodyParser());//it will parse json request bodies (as well as others), and place the result in req.body:
});



app.use('/public',express.static(__dirname+'/public')); // use the public prameter. 
app.use('/',express.static(__dirname+'/public')); //use index.html
app.get('/team/:player',team.addPlayer);
app.post('/teamGuest/',team.addGuest);
app.get('/teamDel/:player',team.removePlayer);
app.get('/users/:player',users.logPlayer);
app.get('/teamList/',team.listTeam);
app.get('/usersProf/:player',users.getProfile);
app.get('/bestPlayer/:player',users.bestPlayer);
app.get('/usersGamesPlayed/:player',users.incGamesPlayed);
app.post('/usersEditProf/',users.editProfile);
app.listen(process.env.VCAP_APP_PORT || 3000);


