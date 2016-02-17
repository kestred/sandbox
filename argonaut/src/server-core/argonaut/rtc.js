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
    var rtc = Wrtc.getInstance();
    var core = rtc.core;

    socket.on('authenticate', function(data) {
        if(core.validIdPair(data)) {
            core.clients[data.publicId].sockets.rtc = socket;
            socket.client = core.clients[data.publicId];
        }
    });

    /* on-rtc-syn event */
    socket.on('syn', function(data) {
        if('client' in socket
           && 'targetId' in data
           && 'callerDesc' in data) {
            if(data.targetId in core.clients
               && 'rtc' in core.clients[data.targetId].sockets) {
                var target = core.clients[data.targetId].sockets.rtc;
                target.emit('syn', {callerId: socket.client.publicId
                                  , callerDesc: data.callerDesc});
            } else {
                socket.emit('syn-failure', {reason: 'bad-target'});
            }
        } else {
            socket.emit('syn-failure', {reason: 'bad-syn-packet'});
        }
    });

    /* on-rtc-ack event */
    socket.on('ack', function(data) {
        if('client' in socket
           && 'targetId' in data
           && 'calleeDesc' in data) {
            if(data.targetId in core.clients
               && 'rtc' in core.clients[data.targetId].sockets) {
                var target = core.clients[data.targetId].sockets.rtc;
                target.emit('ack', {calleeId: socket.client.publicId
                                  , calleeDesc: data.calleeDesc});
            } else {
                socket.emit('ack-failure', {reason: 'bad-target'});
            }
        } else {
            socket.emit('ack-failure', {reason: 'bad-ack-packet'});
        }
    });

    /* on-rtc-ice event */
    socket.on('ice', function(data) {
        if('client' in socket) {
            socket.broadcast.emit('ice',
                                  {candidateId: socket.client.publicId
                                 , candidate: data.candidate});
        }
    });

    /* on-mute-event */
    socket.on('mute', function() {
        socket.broadcast.emit('mute',
                              {playerId: socket.client.publicId});
    });

    /* on-unmute-event */
    socket.on('unmute', function() {
        socket.broadcast.emit('unmute',
                              {playerId: socket.client.publicId});
    });

    /* on-hide-event */
    socket.on('hide', function() {
        socket.broadcast.emit('hide',
                              {playerId: socket.client.publicId});
    });

    /* on-unhide-event */
    socket.on('unhide', function() {
        socket.broadcast.emit('unhide',
                              {playerId: socket.client.publicId});
    });
}
Wrtc.getInstance = function() {
    return Wrtc.instance;
};

/* Export webrtc */
module.exports = Wrtc;
