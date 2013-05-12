var argo = require('./core.js')
exports.buildSocket = function(socket) {
    // argo./* thisUser? */./* rtcSocket? */ = socket;
    socket.on('syn', function(data) {});
    socket.on('rtc-ack', function(data) {});
    socket.on('rtc-ice', function(data) {});
    socket.on('disconnect', function () {});
}
