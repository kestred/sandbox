/* Imports */
var Client = require('./client.js');
var util = require('./util.js');

/* Primary Core definition */
function Core(io) { this.init('core-server', io); }
Core.prototype.constructor = Core;
Core.prototype.init = function(type, io) {
    Core.instance = this;
    this.type = type;
    this.io = io;
    this.clients = {};
    this.sockets = io.of('/core').on('connection', this.buildSocket);
};
Core.prototype.buildSocket = function(socket) {
    var core = Core.getInstance();
    /* Socket.io "/core" endpoint definition */
    socket.on('authenticate', function(data) {
        if(!('publicId' in data)) {
            util.socketError(socket, 'Missing public key.');
            return;
        }
        if(!util.validPublicId(data.publicId)) {
            util.socketError(socket, 'Invalid public key.');
            return;
        }
        if(data.publicId in core.clients) {
            if(!core.validIdPair(data)) {
                socket.emit('authenticate', {status: 'fail'});
                return;
            }
            core.clients[data.publicId].sockets.core = socket;
            socket.emit('authenticate', {status: 'success'});
            return;
        }
        var secret = '';
        if('privateId' in data &&
           util.validPrivateId(data.privateId)) {
            secret = data.privateId;
        } else {
            secret = util.randomKey(32);
        }
        core.clients[data.publicId] = new Client(data.publicId,
                                                      secret);
        core.clients[data.publicId].sockets.core = socket;
        socket.client = core.clients[data.publicId];
        socket.emit('authenticate', {status: 'success',
                                     privateId: secret});
    });
    socket.on('status', function(data) {
        var playerId = socket.client.publicId;
        socket.broadcast.emit('player-status', {playerId: playerId
                                              , status: data.status});
    });
    socket.on('sessionInfo', function() {
        var clients = Object.keys(core.clients);
        var selfIndex = clients.indexOf(socket.client.publicId);
        clients.splice(selfIndex, 1);
        socket.emit('sessionInfo', {players: clients
                                  , gamemaster: null});
    });
    socket.on('ready', function() {
        core.io.of('/core').emit('player-joined'
                                 , {id: socket.client.publicId});
    });
    socket.on('disconnect', function() {
        var publicId = socket.client.publicId;
        delete core.clients[publicId];
        core.io.of('/core').emit('player-left', {id: publicId});
    });

    socket.emit('ready');
};
Core.prototype.stderr = function(message, client) {
    var socket = null;  // TODO: Default to gamemaster
    if(typeof client === 'string') {
        socket = this.clients[client].sockets.core;
    } else if(typeof client === 'client') {
        socket = client.sockets.core;
    }
    util.socketError(socket, message);
};
Core.prototype.validIdPair = function(data) {
    if(!('publicId' in data)) { return false; }
    if(!('privateId' in data)) { return false; }
    if(!util.validPublicId(data.publicId)) { return false; }
    if(!util.validPrivateId(data.privateId)) { return false; }
    if(!(data.publicId in this.clients)) { return false; }
    return this.clients[data.publicId].privateId == data.privateId;
};
Core.getInstance = function() {
    return Core.instance;
};

/* Export core */
module.exports = Core;
