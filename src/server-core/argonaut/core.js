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
        if(!data.publicId.match(/[a-z0-9]{16}/)) {
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
        var privId = util.randomKey(32);
        core.clients[data.publicId] = new Client(data.publicId, privId);
        core.clients[data.publicId].sockets.core = socket;
        socket.emit('authenticate', {status: 'success',
                                     privateId: privId});
    });

    socket.on('sessionInfo', function(data) {
        var clients = Object.keys(core.clients);
        clients = clients.splice(clients.indexOf(data.publicId), 1);
        socket.emit('sessionInfo', {players: clients
                                  , gamemaster: 'none'});
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


/* Client class */
function Client(publicId, privateId) {
    this.init('client', publicId, privateId);
}
Client.prototype.constructor = Client;
Client.prototype.init = function(type, publicId, privateId) {
    this.type = type;
    this.publicId = publicId;
    this.privateId = privateId;
    this.sockets = {};
};
Client.prototype.authenticate = function(privateId) {
    if(!privateId.match(/[a-z0-9]{32}/)) { return false; }
    if(this.privateId !== privateId) { return false; }
    return true;
};


/* Utility functions */
var util = {};
util.socketError = function(socket, message) {};
util.randomKey = function(length) {
    var str = '';
    while(str.length < length) {
        str += Math.floor((Math.random()*16)).toString(16);
    }
    return str.substr(0, length);
};

/* Export core */
module.exports = Core;
