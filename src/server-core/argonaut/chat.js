/* Imports */
var util = require('./util.js');

/* Define Chat service */
function Chat (io, core) { this.init('chat-server', io, core); }
Chat.prototype.constructor = Chat;
Chat.prototype.init = function(type, io, core) {
    Chat.instance = this;
    this.type = type;
    this.core = core;
    this.io = io;
    this.sockets = io.of('/chat').on('connection', this.buildSocket);
};
Chat.prototype.buildSocket = function(socket) {
    var chat = Chat.getInstance();
    var core = chat.core;

    socket.on('authenticate', function(data) {
        if(core.validIdPair(data)) {
            core.clients[data.publicId].sockets['chat'] = socket;
            socket.client = core.clients[data.publicId];
            socket.join('main')
        }
    });

    socket.on('message', function(message) {
        if('client' in socket) {
            var cleanMessage = util.htmlspecialchars(message);
            chat.sockets.in('main').emit('chat',
                              {room: 'main'
							 , playerId: socket.client.publicId
                             , message: message});
        }
    });

    socket.on('pm', function(data) {
        if('client' in socket && 'targetId' in data
           && data.targetId in core.clients
           && 'chat' in core.clients[data.targetId].sockets) {
            var senderId = socket.client.publicId;
            var cleanMessage = util.htmlspecialchars(data.message);
            core.clients[data.targetId].sockets['chat'].emit('pm',
                                               {senderId: senderId
                                              , message: cleanMessage});
        }
    });
}
Chat.getInstance = function() {
    return Chat.instance;
};

/* Export chat */
module.exports = Chat;
