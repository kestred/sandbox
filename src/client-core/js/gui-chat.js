/*! === Chat GUI Components === */
(function() { // Begin anonymous namespace
    var gui = mods['gui']
    gui.create['chatButton'] = function(options) {
        var button = jQuery('<button></button>');
        var icon = jQuery('<i></i>');
        icon.addClass('icon-white icon-comment');
        button.addClass('btn btn-inverse').append(icon);
        button.icon = icon;
        if('tooltip' in options) {
            if(options.tooltip !== false) {
                button.tooltip({placement: 'top', html: 'true'
                              , title: options.tooltip});
            }
        } else { button.tooltip({placement: 'top', title: 'Chat'}); }
        return button;
    };
    gui.create['chatWidget'] = function() {
        var panel = jQuery('<div class="chat-panel"></div>');

        var history = jQuery('<div class="chat-history"></div>');
        panel.append(history);
        panel.history = history;

        var log = jQuery('<dl class="dl-horizontal"></div>');
        history.append(log);
        history.log = log;
        panel.logMessage = function(message, name) {
            var previous = log.find('dt').last();
            var line = '<dd>' + message + '</dd>';
            if(previous.html() != name) {
                line = '<dt>' + name + '</dt>' + line;
            }
            log.append(line);
            log.scrollTop(log.scrollHeight);
            return panel; // Chaining
        };
        panel.announce = function(message) {
            var block = '<p class="chat-announcement">';
            block += message + '</p>';
            log.append(block);
            return panel; // Chaining
        };

        var form = jQuery('<form class="chat-input"></form>');
        panel.append(form);
        panel.form = form;

        var input = jQuery('<input type="text" />');
        form.append(input);
        form.input = input;

        var send = jQuery('<input type="button" class="btn"></input>');
        form.append(send);
        form.send = send;

        send.val('Send');
        return panel;
    };
    gui.create['chatWindow'] = function(options) {
        options.width = 256; options.height = 320;
        if(!('title' in options)) { options.title = 'Chat'; }
        if(!('top' in options || 'bottom' in options)) {
            options.bottom = 0;
        }
        if(!('left' in options || 'right' in options)) {
            options.left = function() {
                if('mainChat' in gui.elements) {
                    var mainChat = gui.elements['mainChat'];
                    var windowLeft = mainChat.offset().left;
                    if(mainChat.parents('.east').length) {
                        /* Place to left of main chat */
                        return windowLeft - 256;
                    } else {
                        /* Place to right of main chat */
                        return windowLeft + mainChat.width();
                    }
                }
            }
        }
        var chatWindow = gui.create['windowWidget'](options);
        var chatPanel = gui.create['chatWidget'](); 
        chatWindow.body.append(chatPanel);
        chatWindow.chat = chatPanel;
        chatWindow.addClass('subwindow-chat');
        return chatWindow;
    };
    gui.routines['chat'] = function() {
        var chat = mods['chat'];
        var div = gui.elements;

        /* Setup Main Chat panel */
        div['mainChat'] = gui.create['chatWidget']();
        div['mainChat'].resize(function() {
            var height = div['mainChat'].parent().innerHeight();
            var sibs = div['mainChat'].siblings();
            for(var i=0; i < sibs.length; ++i) {
                height -= jQuery(sibs[i]).outerHeight(true);
            }
            div['mainChat'].height(height);
            height -= div['mainChat'].form.outerHeight(true);
            div['mainChat'].history.css('height', height + 'px');
        });
        div['mainChat'].form.input.attr('placeholder',
                                        "Type message and hit 'enter'");
        div['mainChat'].form.input.focus(function() {
            if(argo.localPlayer.status != 'typing'
               && div['mainChat'].form.input.val().length > 0) {
                argo.localPlayer.toggleTyping();
            }
        });
        div['mainChat'].form.input.blur(function() {
            if(argo.localPlayer.status == 'typing') {
                argo.localPlayer.toggleTyping();
            }
        });
        div['mainChat'].form.input.keydown(function(event) {
            var player = argo.localPlayer;
            var length = div['mainChat'].form.input.val().length;
            if(event.keyCode === 13) {
                var message = div['mainChat'].form.input.val();
                if(message.length > 0) {
                    div['mainChat'].form.input.val('');
                    if(argo.localPlayer.status == 'typing') {
                        argo.localPlayer.toggleTyping();
                    }
                    chat.sendMessage(message);
                }
                return false; // Stops form submit
            } else if((event.keyCode === 8 || event.keyCode === 46)
                      && length === 1 && player.status == 'typing') {
                player.toggleTyping();
            } else if(((event.keyCode >= 48 && event.keyCode <= 90)
                       || length > 0) && player.status != 'typing') {
                player.toggleTyping();
            } else if(length == 0 && player.status == 'typing') {
                player.toggleTyping();
            }
        });
        div['mainChat'].form.send.click(function() {
            var message = div['mainChat'].form.input.val();
            if(message.length > 0) {
                div['mainChat'].form.input.val('');
                if(argo.localPlayer.status == 'typing') {
                    argo.localPlayer.toggleTyping();
                }
                chat.sendMessage(message);
            }
        });
        chat.mainChat = div['mainChat'];

        /* Add Private Chat */
        var proto = Argonaut.Player.prototype;
        proto.setupPrivateChat = function() {
            var player = this;
            player.chatWindow = gui.create['chatWindow'](
                                        {title: player.getShortName()});
            player.chatWindow.detach();

            player.chatWindow.find('.btn-danger').click(
                function() {
                    button.button('toggle');
                    player.chatWindow.hide();
                }
            );
            player.chatWindow.toggle = function() {
                button.button('toggle');
                var visible = jQuery.contains(document.documentElement
                                            , player.chatWindow[0]);
                if(visible) {
                    player.chatWindow.hide();
                    player.chatWindow.detach();
                } else {
                    player.chatWindow.appendTo('body');
                    player.chatWindow.show();
                }
            }
            var chatBox = player.chatWindow.chat;
            chatBox.form.input.attr('placeholder',
                                    '/to ' + player.name);
            chatBox.form.input.keydown(function(event) {
                if(event.keyCode === 13) {
                    var message = chatBox.form.input.val();
                    if(message.length > 0) {
                        chatBox.form.input.val('');
                        chat.privateMessage(player.id, message);
                    }
                    return false; // Stops form submit
                }
            });
            chatBox.form.send.click(function() {
                var message = chatBox.form.input.val();
                if(message.length > 0) {
                    chatBox.form.input.val('');
                    chat.privateMessage(player, message);
                }
            });

            var button = gui.create['chatButton'](
                                             {tooltip: 'Private Chat'});
            button.click(player.chatWindow.toggle);
            player.controls.append(button);
        };
        proto.init = util.extend(proto.init, proto.setupPrivateChat);
        if(argo.localPlayer.id != argo.gamemaster.id) {
            proto.setupPrivateChat.apply(argo.gamemaster);
        }
        jQuery.each(argo.players, function(id, player) {
            proto.setupPrivateChat.apply(player);
        });
    };

    var west = jQuery('#outer-west');
    function placeChat() { west.append(mods['chat'].mainChat); }
    for(var key in gui.arrange) {
        gui.arrange[key] = util.extend(gui.arrange[key], placeChat);
    }
})(); // Close anonymous namespace
