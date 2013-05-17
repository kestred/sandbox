function Chat (io, core) { this.init('chat-server', io, core); }
Chat.prototype.constructor = Chat;
Chat.prototype.init = function(type, io, core) {
    this.type = type;
    this.core = core;
    this.io = io;
    this.sockets = io.of('/rtc').on('connection', this.buildSocket);
};
Chat.prototype.buildSocket = function(socket) {
    var chat = Chat.getInstance();
    var core = chat.core;

    socket.on('authenticate', function(data) {
        if(core.validIdPair(data)) {
            core.clients[data.publicId].sockets['chat'] = socket;
            socket.client = core.clients[data.publicId];
        }
    });

    socket.on('message', function(message) {
        if('client' in socket) {
            chat.sockets.emit('chat',
                              {'playerId': socket.client.publicId
                             , 'message': message});
        }
    });
}

/* Export chat */
module.exports = Chat;
