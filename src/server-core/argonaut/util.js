/* Utility functions */
Util = {};
Util.socketError = function(socket, message) {
    socket.emit('error', {message: '[serverError]' + message});
};
Util.randomKey = function(length) {
    var str = '';
    while(str.length < length) {
        str += Math.floor((Math.random()*16)).toString(16);
    }
    return str.substr(0, length);
};
Util.validPublicId = function(publicId) {
    return (typeof publicId == 'string'
         && publicId.match(/^[a-f0-9]{16}$/));
};
Util.validPrivateId = function(privateId) {
    return (typeof privateId == 'string'
         && privateId.match(/^[a-f0-9]{32}$/));
};
Util.htmlspecialchars = function(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
};

/* Export core */
module.exports = Util;
