/*! === Chat Component === */

mods['chat'] = new Argonaut.Module('chat');
(function() { // Begin anonymous namespace
    var chat = mods['chat'];
    chat.run = function() {
        argo.loader.update('Connecting to Chat');
        chat.socket = io.connect(document.URL + 'chat');
		var socket = chat.socket;
        return true;
    };

    chat.sendMessage = function(message) {/* TODO: Implement chat */};
})(); // Close anonymous namespace
