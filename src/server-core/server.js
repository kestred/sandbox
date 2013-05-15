/* Import library modules */
var Http = require('http');
var Express = require('express');
var SocketIO = require('socket.io');

/* Import local modules */
var Core = require('./argonaut/core.js');
var Chat = require('./argonaut/chat.js');
var Wrtc = require('./argonaut/rtc.js');

/* Startup server */
var app = new Express();
var server = Http.createServer(app);
var io = SocketIO.listen(server);
server.listen(6058); //randomly chosen port number not registerd in IANA

/* Serve static files */
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/client.html');
});
app.use('/js', Express.static(__dirname + '/js'));
app.use('/css', Express.static(__dirname + '/css'));
app.use('/img', Express.static(__dirname + '/img'));
app.use('/vendor', Express.static(__dirname + '/vendor'));

/* Setup argonaut */
var core = new Core(io);
var chat = new Chat(io, core);
var wrtc = new Wrtc(io, core);

console.log('[Argonaut] Server ready.');

