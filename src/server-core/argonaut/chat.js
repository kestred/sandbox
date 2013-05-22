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
            chat.sockets.in('main').emit('chat',
                              {room: 'main'
							 , playerId: socket.client.publicId
                             , message: message});
        }
    });
}
Chat.getInstance = function() {
    return Chat.instance;
};

/* Export chat */
module.exports = Chat;
