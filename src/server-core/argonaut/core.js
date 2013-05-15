/* Primary Core definition */
function Core(io) { this.init('core-server', io); }
Core.prototype.constructor = Core;
Core.prototype.init = function(type, io) {
    this.type = type;
    this.io = io;
    this.clients = {};
    this.sockets = io.of('/core').on('connection', this.buildSocket);
};
Core.prototype.buildSocket = function(socket) {
    /* Socket.io "/core" endpoint definition */
    var core = this;
    socket.on('authenticate', function(data) {
        if(!('publicId' in data)) {
            util.socketError(socket, 'Missing public key.');
            return;
        }
        if(!util.validPublicId(data.publicId)) {
            util.socketError(socket, 'Invalid public key.');
            return;
        }
        if(data.publicId in clients) {
            if(!('privateId' in data)) {
                util.socketError(socket, 'Missing private key.');
                return;
            }
            if(!core.clients[publicId].authenticate(data.privateId)) {
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
        core.clients[data.publicId] = new Core.Client(data.publicId,
                                                      secret);
        core.clients[data.publicId].sockets.core = socket;
        socket.client = this;
        socket.emit('authenticate', {status: 'success',
                                     privateId: secret});
    });

    socket.on('sessionInfo', function() {
        var clients = Object.keys(core.clients);
        var selfIndex = clients.indexOf(socket.client.publicId);
        clients = clients.splice(selfIndex, 1);
        socket.emit('sessionInfo', {players: clients
                                  , gamemaster: 'none'});
    });

    socket.on('ready', function() {
       core.sockets.emit('player-joined', {id: socket.client.publicId});
    });

    socket.on('disconnect', function() {
        core.sockets.emit('player-left', {id: socket.client.publicId})
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
Core.prototype.validLogin = function(data) {
    if(!('publicId' in data)) { return false; }
    if(!('privateId' in data)) { return false; }
    if(!util.validPublicId(data.publicId)) { return false; }
    if(!util.validPrivateId(data.privateId)) { return false; }
    return this.clients[data.publicId].privateId == data.privateId;
};

/* Client class */
Core.Client = function(publicId, privateId) {
    this.init('client', publicId, privateId);
}
Core.Client.prototype.constructor = Core.Client;
Core.Client.prototype.init = function(type, publicId, privateId) {
    this.type = type;
    this.publicId = publicId;
    this.privateId = privateId;
    this.sockets = {};
};
Core.Client.prototype.authenticate = function(privateId) {
    if(!util.validPrivateId(privateId)) { return false; }
    return this.privateId == privateId;
};

/* Utility functions */
Core.Util = {};
Core.Util.socketError = function(socket, message) {};
Core.Util.randomKey = function(length) {
    var str = '';
    while(str.length < length) {
        str += Math.floor((Math.random()*16)).toString(16);
    }
    return str.substr(0, length);
};
Core.Util.validPublicId = function(publicId) {
    return (typeof publicId == 'string'
         && publicId.match(/[a-z0-9]{16}/);
};
Core.Util.validPrivateId = function(privateId) {
    return (typeof privateId == 'string'
         && privateId.match(/[a-z0-9]{32}/);
};
var util = Core.Util;

/* Export core */
module.exports = Core;
