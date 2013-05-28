/* Import library modules */
var Http = require('http');
var Express = require('express');
var SocketIO = require('socket.io');
var Optimist = require('optimist');

/* Import local modules */
var Core = require('./argonaut/core.js');
var Chat = require('./argonaut/chat.js');
var Wrtc = require('./argonaut/rtc.js');

/* Parse command line arguments */
var args = Optimist.argv;
var help = (
"Usage: node server.js [OPTION]... \n" +
"Options:\n" +
"\t-h, --help\tShow this help dialog.\n" +
"\t-d, --debug\tIncrease the socket.io logging-level\n");

var debug = false;
if((args.h) || (args.help)) {
    console.log(help);
    process.exit(0);
}
if((args.d) || (args.debug)) { debug = true; }

/* Startup server */
var app = new Express();
var server = Http.createServer(app);
var io = SocketIO.listen(server);
server.listen(6058); //randomly chosen port number not registerd in IANA
if(!debug) { io.set('log level', 1); }

/* Serve static files */
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/client.html');
});
app.use('/js', Express.static(__dirname + '/js'));
app.use('/css', Express.static(__dirname + '/css'));
app.use('/img', Express.static(__dirname + '/img'));
app.use('/font', Express.static(__dirname + '/font'));
app.use('/vendor', Express.static(__dirname + '/vendor'));

/* Setup argonaut */
var core = new Core(io);
var chat = new Chat(io, core);
var wrtc = new Wrtc(io, core);

console.log('[Argonaut] Server ready.');

