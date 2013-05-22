/*! === Chat Component === */

mods['chat'] = new Argonaut.Module('chat');
(function() { // Begin anonymous namespace
    var chat = mods['chat'];
    chat.run = function() {
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
            chat.chatHistory.logMessage(data.message, name);
        });

        socket.emit('authenticate', {publicId: argo.publicId
                                   , privateId: argo.privateId});
        return true;
    };

    chat.sendMessage = function(message) {
        chat.socket.send(message);
    };
})(); // Close anonymous namespace
