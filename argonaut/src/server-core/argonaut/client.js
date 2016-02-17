/* Imports */
var util = require('./util.js');

/* Client class */
Client = function(publicId, privateId) {
    this.init('client', publicId, privateId);
}
Client.prototype.constructor = Client;
Client.prototype.init = function(type, publicId, privateId) {
    this.type = type;
    this.publicId = publicId;
    this.privateId = privateId;
    this.sockets = {};
    this.name = 'Player' + publicId.substr(0, 4).toUpperCase();
};
Client.prototype.authenticate = function(privateId) {
    if(!util.validPrivateId(privateId)) { return false; }
    return this.privateId == privateId;
};

/* Export Client */
module.exports = Client;
