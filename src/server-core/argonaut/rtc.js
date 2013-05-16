function Wrtc (io, core) { this.init('webrtc-server', io, core); }
Wrtc.prototype.constructor = Wrtc;
Wrtc.prototype.init = function(type, io, core) {
    Wrtc.instance = this;
    this.type = type;
    this.core = core;
    this.io = io;
    this.sockets = io.of('/rtc').on('connection', this.buildSocket);
};
Wrtc.prototype.buildSocket = function(socket) {
    var webRTC = Wrtc.getInstance();
    var core = webRTC.core;

    socket.on('authenticate', function(data) {
        if(core.validIdPair(data)) {
            core.clients[data.publicId].sockets.rtc = socket;
            socket.client = core.clients[data.publicId];
        }
    });

    /* on-rtc-syn event */
    socket.on('syn', function(data) {
        if('targetId' in data && data.targetId in core.clients) {
            var target = core.clients[data.targetId].sockets.rtc;
            target.emit('syn', {callerId: socket.client.publicId
                              , callerDesc: data.callerDesc});
        }
    });

    /* on-rtc-ack event */
    socket.on('ack', function(data) {
        if('targetId' in data && data.targetId in core.clients) {
            var target = core.clients[data.targetId].sockets.rtc;
            target.emit('ack', {calleeId: socket.client.publicId
                              , calleeDesc: data.calleeDesc});
        }
    });

    /* on-rtc-ice event */
    socket.on('ice', function(data) {
        webRTC.sockets.emit('ice', {candidateId: socket.client.publicId
                                  , candidate: data.candidate});
    });
}
Wrtc.getInstance = function() {
    return Wrtc.instance;
};

/* Export webrtc */
module.exports = Wrtc;
