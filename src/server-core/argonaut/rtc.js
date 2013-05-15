function Wrtc (io, core) { this.init('webrtc-server', io, core); }
Wrtc.prototype.constructor = Wrtc;
Wrtc.prototype.init = function(type, io, core) {
    this.type = type;
    this.core = core;
    this.io = io;
    this.sockets = io.of('/rtc').on('connection', this.buildSocket);
};
Wrtc.prototype.buildSocket = function(socket) {
    socket.on('syn', function(data) {});
    socket.on('ack', function(data) {});
    socket.on('ice', function(data) {});
    socket.on('disconnect', function() {});
}

/* Export webrtc */
module.exports = Wrtc;
