function Chat (io, core) { this.init('chat-server', io, core); }
Chat.prototype.constructor = Chat;
Chat.prototype.init = function(type, io, core) {
    this.type = type;
    this.core = core;
    this.io = io;
    this.sockets = io.of('/rtc').on('connection', this.buildSocket);
};
Chat.prototype.buildSocket = function(socket) {
    socket.on('message', function(msg) {});
}

/* Export chat */
module.exports = Chat;
