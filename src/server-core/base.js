var Argonaut = {}; // namespace for class|methods definitions & access
var argo = Argonaut; // short alias for namespace globals access


/* Start server up */
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(6058); //randomly chosen port number not registerd in IANA

/* Serve static files */
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/client.html');
});
app.get('/core.css', function (req, res) {
    res.sendfile(__dirname + '/core.css');
});
app.get('/core.js', function (req, res) {
    res.sendfile(__dirname + '/core.js');
});
app.use('/vendor', express.static(__dirname + '/vendor'));
