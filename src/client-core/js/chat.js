/*! === Chat Component === */

mods['chat'] = new Argonaut.Module('chat', priority.CORE, 'gui');
(function() { // Begin anonymous namespace
    var chat = mods['chat'];
    chat.start = util.extend(chat.start, function() {
        argo.loader.update('Connecting to Chat');
        var socket = io.connect(document.URL + 'chat');
        argo.sockets.chat = chat.socket = socket;
        socket.on('chat', function(data) {
            var name = 'SYSTEM';
            if(data.playerId == argo.localPlayer.id) {
                name = argo.localPlayer.name;
            } else if(data.playerId == argo.gamemaster.id) {
                name = argo.gamemaster.name;
            } else if(data.playerId in argo.players) {
                name = argo.players[data.playerId].name;
            }
            chat.mainChat.logMessage(data.message, name);
        });
        socket.on('pm', function(data) {
            var player = argo.players[data.senderId];
            var visible = jQuery.contains(document.documentElement
                                        , player.chatWindow[0]);
            if(!visible) {
                player.chatWindow.find('.btn-danger').click(
                    function() { button.button('toggle'); }
                );
                player.chatWindow.appendTo('body');
                player.chatWindow.show();
            }
            player.chatWindow.chat.logMessage(data.message, player.name);
        });

        socket.emit('authenticate', {publicId: argo.publicId
                                   , privateId: argo.privateId});
        return true;
    }, {order: 'prepend'});
    chat.stop = util.extend(chat.stop, function() {
        var p = Argonaut.Player.prototype;
        p.init = util.baseFn(p.init);
        p.destroy = util.baseFn(p.init);
        if(chat.socket.connected) { chat.socket.disconnect(); }
        chat.socket = null;
    }, {order: 'prepend'});

    chat.sendMessage = function(message) {
        chat.socket.send(message);
    };

    chat.privateMessage = function(target, message) {
        var name = argo.localPlayer.name;
        target.chatWindow.chat.logMessage(message, name);
        chat.socket.emit('pm', {targetId: target.id, message: message});
    };
})(); // Close anonymous namespace
