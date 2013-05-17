/*! === Chat Component === */

mods['chat'] = new Argonaut.Module('chat');
(function() { // Begin anonymous namespace
    var chat = mods['chat'];
    chat.run = function() {
        argo.loader.update('Connecting to Chat');
        var socket = io.connect(document.URL + 'chat');
		argo.sockets.chat = chat.socket = socket;
        socket.on('chat', function(data) {
            var line = jQuery('<ul>');
            var name = argo.players[data.playerId].name;
            line.html('<strong>' + name + '</strong> ' + data.message);
            chat.chatBox.append(line);
        });

        socket.emit('authenticate', {publicId: argo.publicId
                                   , privateId: argo.privateId});
        return true;
    };

    chat.sendMessage = function(message) {
        chat.socket.send(message);
    };
})(); // Close anonymous namespace
