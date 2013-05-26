/*! === Tabletop GUI === */
mods['gui'] = new Argonaut.Module('gui', priority.CORE);
(function() { // Begin anonymous namespace
    var gui = mods['gui'];

    /* Dictionary of GUI elements that are drag/drop-able */
    gui.elements = {};

    /* Dictionary of functions that build HTML structures */
    gui.create = {};
    gui.create['errorAlert'] = function(message) {
        var alert = jQuery('<div class="alert alert-error"></div>');
        var close = jQuery('<button type="button" class="close" '
                         + 'data-dismiss="alert">&times;</button>');
        alert.append(close);
        alert.append(message);
        return alert;
    };
    gui.create['warningAlert'] = function(message) {
        var alert = jQuery('<div class="alert"></div>');
        var close = jQuery('<button type="button" class="close" '
                         + 'data-dismiss="alert">&times;</button>');
        alert.append(close);
        alert.append(message);
        return alert;
    };
    gui.create['successAlert'] = function(message) {
        var alert = jQuery('<div class="alert alert-success"></div>');
        var close = jQuery('<button type="button" class="close" '
                         + 'data-dismiss="alert">&times;</button>');
        alert.append(close);
        alert.append(message);
        return alert;
    };
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
    gui.create['swapButton'] = function(options) {
        if(typeof options === 'undefined') { options = {}; }
        var button = jQuery('<button></button>');
        var icon = jQuery('<i></i>');
        icon.addClass('icon-white icon-retweet');
        button.addClass('btn btn-inverse').append(icon);
        button.icon = icon;
        if('tooltip' in options) {
            if(options.tooltip !== false) {
                button.tooltip({placement: 'top', html: 'true'
                              , title: options.tooltip});
            }
        } else { button.tooltip({placement: 'top', title: 'Swap'}); }
        return button;
    }
    gui.create['shrinkButton'] = function(options) {
        if(typeof options === 'undefined') { options = {}; }
        var button = jQuery('<button></button>');
        var icon = jQuery('<i></i>');
        icon.addClass('icon-white icon-resize-small');
        button.addClass('btn btn-inverse').append(icon);
        button.icon = icon;
        if('tooltip' in options) {
            if(options.tooltip !== false) {
                button.tooltip({placement: 'top', html: 'true'
                              , title: options.tooltip});
            }
        } else { button.tooltip({placement: 'top', title: 'Minimize'}); }
        if('target' in options) {
            button.click(function() {
                options.target.toggleClass('minimized');
                icon.toggleClass('icon-resize-small');
                icon.toggleClass('icon-resize-full');
                button.tooltip('destroy');
                button.tooltip(
                    {title: function() {
                         if(options.target.hasClass('minimized')) {
                             return 'Maximize';
                         } else {
                             return 'Minimize';
                         }
                     }
                   , placement: function() {
                         if(options.target.offset().top > 40) {
                             return 'top';
                         } else { return 'bottom'; } 
                     }
                    });
                gui.resizeAfter();
            });
        }

        return button;
    }
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
    gui.create['videoWidget'] = function(options) {
        var container = jQuery('<div class="video-container"></div>');
        var video = jQuery('<video autoplay></video>');
        container.append(video);
        container.video = video;
        container.video.attachStream = function(stream) {
            video.attr('src', URL.createObjectURL(stream));
            gui.resizeAfter();
            return video;
        };
        if('controls' in options) {
            container.append(options.controls);
            container.videoControls = options.controls;
        }
        return container;
    };
    gui.create['windowWidget'] = function(options) {
        var modal = jQuery('<div class="modal hide fade"></div>');
        var header = jQuery('<div class="modal-header"></div>');
        var content = jQuery('<div class="modal-body"></div');
        modal.addClass('subwindow snap-target');
        modal.body = content;
        modal.header = header;
        modal.append(header);
        modal.append(content);
        modal.spawnOffset = {};
        if('top' in options) {
            modal.spawnOffset.top = options.top;
        } else if('bottom' in options) {
            modal.spawnOffset.bottom = options.bottom;
        }
        if('left' in options) {
            modal.spawnOffset.left = options.left;
        } else if('right' in options) {
            modal.spawnOffset.right = option.right;
        }
        if('title' in options) {
            header.html('<h3>' + options.title + '</h3>');
        }
        if('width' in options) { modal.width(options.width); }
        if('height' in options) { content.height(options.height); }
        if(options.draggable !== false) {
            modal.draggable({handle: '.modal-header'
                           , stack: '.subwindow'
                           , snap: '.snap-target'
                           , snapMode: 'outer'
                           , containment: '#layout'});
            modal.on('show', function(event) {
                if(event.target == this) {
                    function resolve(fn) {
                        if(fn instanceof Function) { return fn(); }
                        else { return fn; }
                    }
                    var pos = modal.spawnOffset;
                    if('left' in pos) {
                        modal.css('left', resolve(pos.left) + 'px');
                    } else if('right' in pos) {
                        var right = resolve(pos.right);
                        var left = jQuery(window).width() - right;
                        modal.css('left', left + 'px');
                    }
                    if('top' in pos) {
                        modal.css('top', resolve(pos.top) + 'px');
                    } else if('bottom' in pos) {
                        var bottom = resolve(pos.bottom);
                        var top = jQuery(window).height() - bottom;
                        top -= modal.height();
                        modal.css('top', top + 'px');
                    }
                    if('left' in options) {
                        modal.css('left', options.left + 'px');
                    } else if('right' in options) {
                        var left = jQuery(window).width() - options.right;
                        modal.css('left', left + 'px');
                    }
                }
            });
            modal.on('shown', function(event) {
                if(event.target == this) {
                    modal.css('-webkit-transition', 'all 0 ease 0');
                    modal.css('-moz-transition', 'all 0 ease 0');
                    modal.css('-o-transition', 'all 0 ease 0');
                    modal.css('transition', 'all 0 ease 0');
                }
            });
            modal.on('hide', function() {
                if(event.target == this) {
                    modal.css('-webkit-transition', '');
                    modal.css('-moz-transition', '');
                    modal.css('-o-transition', '');
                    modal.css('transition', '');
                    if(modal.attr('style') === '') {
                        modal.removeAttr('style');
                    }
                }
            });
        }
        if(options.controls !== false) {
            var controlGroup = jQuery('<div class="btn-group"></div>');
            var minimize = jQuery('<button class="btn btn-inverse">');
            var miniIcon = jQuery('<i class="icon-chevron-up">');
            var closeBtn = jQuery('<button class="btn btn-danger">');
            var closeIcon = jQuery('<i class="icon-remove">');
            miniIcon.addClass('icon-white');
            minimize.append(miniIcon);
            closeIcon.addClass('icon-white');
            closeBtn.append(closeIcon);
            controlGroup.append(minimize);
            controlGroup.append(closeBtn);
            header.append(controlGroup);
            if(options.onMinimize == 'hide') {
                minimize.click(function() {
                    modal.hide();
                });
            } else {
                content.addClass('collapse in');
                content.collapse({'toggle': false});
                content.on('shown', function(event) {
                    if(event.target == this) {
                        content.css('-webkit-transition', 'all 0 ease 0');
                        content.css('-moz-transition', 'all 0 ease 0');
                        content.css('-o-transition', 'all 0 ease 0');
                        content.css('transition', 'all 0 ease 0');
                        content.css('height', options.height);
                    }
                });
                content.on('hide', function(event) {
                    if(event.target == this) {
                        content.css('-webkit-transition', '');
                        content.css('-moz-transition', '');
                        content.css('-o-transition', '');
                        content.css('transition', '');
                        if(content.attr('style') === '') {
                            content.removeAttr('style');
                        }
                    }
                });
                minimize.click(function() {
                    if(content.hasClass('in')) {
                        content.collapse('hide');
                        miniIcon.removeClass('icon-chevron-up');
                        miniIcon.addClass('icon-chevron-down');
                    } else {
                        content.collapse('show');
                        miniIcon.removeClass('icon-chevron-down');
                        miniIcon.addClass('icon-chevron-up');
                    }
                });
            }
            if(options.onClose == 'hide') {
                closeBtn.click(function() { modal.hide(); });
            } else {
                closeBtn.click(function() { modal.detach(); });
            }
        }
        modal.modal({backdrop: false
                   , keyboard: false
                   , show: false});
        modal.show = function() { modal.modal('show'); return modal; };
        modal.hide = function() { modal.modal('hide'); return modal; };
        return modal;
    }
    gui.create['queueWidget'] = function() {
        var queue = jQuery('<ol class="queue unstyled"></ol>');
        queue.enqueue = function(element) {
            var listItem = jQuery('<li></li>');
            listItem.prependTo(queue).append(element);
            return queue;
        };
        queue.dequeue = function() {
            queue.foals().last().remove();
            return queue;
        };
        queue.clear = function() {
            queue.html('');
            return queue;
        };
        return queue;
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
        } var chatWindow = gui.create['windowWidget'](options); var 
        chatPanel = gui.create['chatWidget'](); chatWindow.body.append
        (chatPanel); chatWindow.chat = chatPanel; chatWindow.addClass
        ('subwindow-chat'); return chatWindow;
    };
    gui.create['playerActionBar'] = function() {
        var controls = jQuery('<div class="navbar navbar-inverse">'
                            + '<div class="navbar-inner">'
                            + '<ul class="nav pull-right">'
                            + '<li class="btn-group">'
                            + '</li></ul></div></div>');
        controls.setName = function(name) {
            var brand = this.find('.brand');
            if(!!brand.length) { brand.html(name); }
            else {
                brand = jQuery('<span class="brand">'
                               + name + '</span>');
                this.find('.navbar-inner').prepend(brand);
            }
            return controls; // function chaining
        };
        controls.append = function(element) {
            var ctrlGroup = this.find('.btn-group');
            ctrlGroup.append(element);
            return controls; // function chaining
        };
        controls.prepend = function(element) {
            var ctrlGroup = this.find('.btn-group');
            ctrlGroup.prepend(element);
            return controls; // function chaining
        };
        return controls;
    };
    gui.create['playerStatusBar'] = function() {
        var bar = jQuery('<li></li>');
        bar.name = jQuery('<span class="player-name"></span>');
        bar.badge = jQuery('<span class="badge"></span>');
        bar.icon = jQuery('<i class="icon-white icon-user"></i>');
        bar.icon.clear = function() {
            bar.icon.removeClass('icon-user'
                           + ' icon-bullhorn'
                           + ' icon-flag'
                           + ' icon-warning-sign'
                           + ' icon-pencil');
            return bar.icon; // function chaining
        };
        bar.badge.clear = function() {
            bar.badge.removeClass('badge-success'
                            + ' badge-info'
                            + ' badge-warning');
            return bar.badge; // function chaining
        };
        bar.badge.append(bar.icon);
        bar.append(bar.badge);
        bar.append(bar.name);
        return bar;
    };

    /* Dictionary of GUI setup functions (using Module names as keys) */
    gui.routines = {}; // Core routines are built-in
    gui.routines['base'] = function() {
        var div = gui.elements;

        /* Change argonaut.stderr to display errors on the gui */
        div['stderr'] = gui.create['queueWidget']();
        div['stderr'].addClass('stderr-queue').appendTo('body');
        argo.stderr = util.extend(argo.stderr, function(message) {
            var html = '<strong>[stderr]</strong> ' + message;
            var alert = gui.create['errorAlert'](html);
            div['stderr'].enqueue(alert);
        });

        /* Build Player Status Menu */
        div['statusMenu'] = jQuery('<div class="status-menu"></div>');
        div['statusList'] = jQuery('<div class="status-list"></div>');
        div['statusList'].list = jQuery('<ol class="unstyled"></ol>');
        div['statusList'].append(div['statusList'].list);
        div['statusMenu'].append(div['statusList']);

        /* Player function to add player-based GUI elements */
        var proto = Argonaut.Player.prototype;
        proto.setupGUI = function() {
            var player = this;
            this.controls = gui.create['playerActionBar']();
            this.statusBar = gui.create['playerStatusBar']();
            this.statusBar.icon.tooltip({
                placement: function() {
                    var top = player.statusBar.icon.offset().top;
                    var bottom = (jQuery(window).height() - 40);
                    if(top < bottom) { return 'bottom'; }
                    else { return 'right'; }
                }
              , title: function() {
                    return util.ucwords(player.status);
                }
            });
            div['statusList'].list.append(this.statusBar);
            mods['gui'].resizeAfter();
            this.setName = util.extend(this.setName, function(name) {
                this.statusBar.name.html(this.getLongName());
            });
            this.setName(this.name);
            this.setStatus = util.extend(this.setStatus,
                function(status) {
                    this.statusBar.badge.clear();
                    this.statusBar.icon.clear();
                    if(status == 'connected') {
                        this.statusBar.icon.addClass('icon-user');
                    } else if(status == 'speaking') {
                        this.statusBar.icon.addClass('icon-bullhorn');
                        this.statusBar.badge.addClass('badge-success');
                    } else if(status == 'typing') {
                        this.statusBar.icon.addClass('icon-pencil');
                        this.statusBar.badge.addClass('badge-success');
                    } else if(status == 'disconnected') {
                        this.statusBar.icon.addClass('icon-warning-sign');
                        this.statusBar.badge.addClass('badge-warning');
                    } else if(status == 'active') {
                        this.statusBar.icon.addClass('icon-flag');
                        this.statusBar.badge.addClass('badge-info');
                    }
                }
            );
            this.setStatus(this.status);
            this.toggleConnected = function() {
                if(this.status != 'disconnected') {
                    this.setStatus('disconnected');
                } else { this.setStatus('connected'); }
            };
            this.toggleSpeaking = function() {
                if(this.status != 'speaking') {
                    if(this.status !=  'typing') {
                        this.previousStatus = this.status;
                    }
                    this.setStatus('speaking');
                } else {
                    this.setStatus(this.previousStatus);
                }
            };
            this.toggleTyping = function() {
                if(this.status != 'typing') {
                    if(this.status !=  'speaking') {
                        this.previousStatus = this.status;
                    }
                    this.previousStatus = this.status;
                    this.setStatus('typing');
                } else {
                    this.setStatus(this.previousStatus);
                }
            };
            this.toggleInitiative = function() {
                if(this.previousStatus != 'active') {
                    if(this.status == 'connected') {
                        this.setStatus('active');
                    } else if(this.status == 'speaking') {
                        this.previousStatus = 'active';
                    } else if(this.status == 'active') {
                        this.setStatus('connected');
                    } // else status == disconnected SO do nothing
                } else { this.previousStatus = 'connected'; }
            };
        }

        /* Expand Player constructor/destroy
         *   - Intentionally doesn't effect Gamemaster & LocalPlayer
         */
        proto.init = util.extend(proto.init, proto.setupGUI);
        proto.destroy = util.extend(proto.destroy, function() {
            this.controls.remove();
            this.statusBar.remove();
            delete this['controls'];
            delete this['statusBar'];
        });

        /* Apply GUI to default players */
        var self = argo.localPlayer, gm = argo.gamemaster;
        if(self.id != gm.id) {
            gm.getLongName = function() { return this.name + ' (GM)'; };
            var fnShortName = gm.getShortName;
            gm.getShortName = function() {
                var name = fnShortName.apply(this);
                name = name.replace('P-', 'GM-');
                return '<strong>' + name + '</strong>';
            };
            proto.setupGUI.apply(gm);
        }
        self.getLongName = function() {
            return '<em>' + this.name + '</em> (You)';
        };
        proto.setupGUI.apply(self);
        jQuery.each(argo.players, function(id, player) {
            proto.setupGUI.apply(player);
        });
    };
    gui.routines['rtc'] = function() {
        var div = gui.elements;

        /* Local feedback, gamemaster video, and players video-group */
        var self = argo.localPlayer, gm = argo.gamemaster;
        div['rtcFeedback'] = gui.create['videoWidget'](
                                             {controls: self.controls});
        div['rtcFeedback'].addClass('big').addClass('feedback');
        self.videoContainer = div['rtcFeedback'];
        var hideFeedback = gui.create['shrinkButton'](
                                          {target: div['rtcFeedback']});
        self.controls.append(hideFeedback);
        if(self.id != gm.id) {
            div['rtcGamemaster'] = gui.create['videoWidget'](
                                               {controls: gm.controls});
            div['rtcGamemaster'].addClass('big');
            gm.controls.setName('Gamemaster');
            gm.videoContainer = div['rtcGamemaster'];
            function swap() {
                var placeholder = jQuery('<div></div>');
                placeholder.insertBefore(div['rtcGamemaster']);
                div['rtcGamemaster'].insertBefore(div['rtcFeedback']);
                div['rtcFeedback'].insertAfter(placeholder);
                div['rtcGamemaster'].video[0].play();
                div['rtcFeedback'].video[0].play();
                placeholder.remove();
                gui.resizeAfter();
            }
            var gmVideoSwap = gui.create['swapButton'](
                            {tooltip: 'Swap with<br />Video Feedback'});
            gmVideoSwap.click(swap);
            gm.controls.prepend(gmVideoSwap);
            var selfVideoSwap = gui.create['swapButton'](
                                   {tooltip: 'Swap with<br />GM Video'});
            selfVideoSwap.click(swap);
            self.controls.prepend(selfVideoSwap);
        }
        div['rtcPlayers'] = jQuery('<div class="video-group"></div>');

        /* Update (Non-GM/LP) player init/destroy for video elements */
        var proto = Argonaut.Player.prototype;
        proto.setupVideo = function() {
            this.videoContainer = gui.create['videoWidget'](
                                             {controls: this.controls});
            div['rtcPlayers'].append(this.videoContainer);
        }
        proto.init = util.extend(proto.init, proto.setupVideo);
        proto.destroy = util.extend(proto.destroy, function() {
            if('videoContainer' in this) {
                this.videoContainer.detach();
                delete this['videoContainer'];
            }
        });

        /* Update video elements | destroy for existing players */
        var self = argo.localPlayer, gm = argo.gamemaster;
        self.videoContainer = div['rtcFeedback'];
        self.destroy = util.extend(self.destroy, function() {
            div['rtcFeedback'].video.attr('src', '');
            gui.resizeAfter();
        });
        if(self.id != gm.id) {
            gm.videoContainer = div['rtcGamemaster'];
            gm.destroy = util.extend(gm.destroy, function() {
                div['rtcGamemaster'].video.attr('src', '');
                gui.resizeAfter();
            });
        }
        jQuery.each(argo.players, function(id, player) {
            proto.setupVideo.apply(player);
        });
    };
    gui.routines['chat'] = function() {
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
                    mods['chat'].sendMessage(message);
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
                mods['chat'].sendMessage(message);
            }
        });
        mods['chat'].mainChat = div['mainChat'];

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
            var chat = player.chatWindow.chat;
            chat.form.input.attr('placeholder',
                                 '/whisper ' + player.name);
            chat.form.input.keydown(function(event) {
                if(event.keyCode === 13) {
                    var message = chat.form.input.val();
                    if(message.length > 0) {
                        chat.form.input.val('');
                        mods['chat'].privateMessage(player.id, message);
                    }
                    return false; // Stops form submit
                }
            });
            chat.form.send.click(function() {
                var message = chat.form.input.val();
                if(message.length > 0) {
                    chat.form.input.val('');
                    mods['chat'].privateMessage(player, message);
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

    /* Layout class definitions */
    gui.Layout = function() {
        this.init('layout');
    };
    gui.Layout.prototype.constructor = gui.Layout;
    gui.Layout.prototype.destroy = function() {};
    gui.Layout.prototype.init = function(type) {
        this.type = type;
        this.applyTo = function(element, options) {};
    };

    /* Dictionary of apply-able layouts */
    gui.layout = {};
    gui.layout['page'] = (function() {
        var layout = new gui.Layout();
        layout.applyTo = function(container, options) {
            container.attr('resizable', 'true');
            /* Parse options */
            if(options.width) { container.width(options.width); }
            if(options.height) { container.height(options.height); }
            function paneOptions(dir) {
                var pane = container.children('.' + dir);
                if(pane.length) {
                    container[dir] = pane;
                    if(options[dir]) {
                        var opt = options[dir];
                        if(opt.size) { pane.paneSize = opt.size; }
                        else { pane.paneSize = '20%'; }
                        if(opt.minPx) { pane.minSize = opt.minPx; }
                        else { pane.minSize = 0; }
                    }
                    pane.container = container;
                    pane.collapse = function() {
                        if(!this.isCollapsed) {
                            this.isCollapsed = true;
                            this.addClass('collapsed');
                            this.container.relayout();
                        }
                    };
                    pane.expand = function() {
                        if(this.isCollapsed) {
                            this.isCollapsed = false;
                            this.removeClass('collapsed');
                            this.container.relayout();
                        }
                    };
                }
            }
            var center = container.children('.center');
            if(center.length) { container.center = center; }
            paneOptions('west');
            paneOptions('east');
            paneOptions('north');
            paneOptions('south');

            /* Setup layout functions */
            container.setBounds = function(width, height) {
                this.width(width).height(height);
            };
            container.resize(function() { container.relayout(); })
            container.relayout = function() {
                var width = this.width();
                var height = this.height();
                var sumHeight = 0, sumWidth = 0;
                var topHeight = 0, leftWidth = 0;;
                function paneSize(pane, dim, dimSum) {
                    var size = pane.paneSize;
                    if(size.indexOf) {
                        if(size.indexOf('px') > 0) {
                            size = size.substring(0, size.indexOf('px'));
                        }
                        if(size.indexOf('%') > 0) {
                            size = size.substring(0, size.indexOf('%'));
                            size = dim * size / 100.0;
                            if(size < pane.minSize) {
                                size = pane.minSize;
                            }
                        }
                    }
                    if(pane.isCollapsed) { size = 0; }
                    else if(pane.paneSize > dim - dimSum) {
                        size = Math.max(dim - dimSum, 0);
                    }
                    return size;
                }
                if(this.north) {
                    var size = paneSize(this.north, height, sumHeight);
                    topHeight = size;
                    sumHeight += size;
                    this.north.css(
                             {position: 'absolute'
                            , width: width + 'px'
                            , height: size + 'px'
                            , top: '0', left: '0'});
                }
                if(this.south) {
                    var size = paneSize(this.south, height, sumHeight);
                    sumHeight += size;
                    this.south.css(
                             {position: 'absolute'
                            , width: width + 'px'
                            , height: size + 'px'
                            , bottom: '0', left: '0'});
                }
                if(this.west) {
                    var size = paneSize(this.west, width, sumWidth);
                    leftWidth = size;
                    sumWidth += size;
                    this.west.css(
                             {position: 'absolute'
                            , width: size + 'px'
                            , height: (height - sumHeight) + 'px'
                            , top: topHeight + 'px'
                            , left: '0'});
                }
                if(this.east) {
                    var size = paneSize(this.east, width, sumWidth);
                    sumWidth += size;
                    this.east.css(
                             {position: 'absolute'
                            , width: size + 'px'
                            , height: (height - sumHeight) + 'px'
                            , top: topHeight + 'px'
                            , right: '0'});
                }
                if(this.center) {
                    var dX = Math.max(width - sumWidth, 0);
                    var dY = Math.max(height - sumHeight, 0);
                    this.center.css(
                             {position: 'absolute'
                            , width: dX + 'px'
                            , height: dY + 'px'
                            , top: topHeight + 'px'
                            , left: leftWidth + 'px'});
                }
            };
        }; // Close layout.applyTo
        return layout;
    })();

    /* Utility functions for arranging GUI elements */
    gui.hide = function(elementName) {
        var e = gui.elements[elementName];
        if(e) { jQuery('hidden').append(e); }
    };
    gui.place = function(elementName, query) {
        var e = gui.elements[elementName];
        if(e) {
            jQuery(query).append(e);

            // Fix for paused video on append()
            if(e.hasClass('video-container')) {
                e.find('video')[0].play();
            } else if(e.hasClass('video-group')) {
                var videos = e.find('video');
                for(var i=0; i<videos.length; ++i) {
                    videos[i].play();
                }
            }
        }
    };

    /* Dictionary of screen arrangements */
    gui.arrange = {};
    gui.arrange['hidden'] = function() {
        gui.elements['outer'].west.collapse();
        gui.elements['outer'].east.collapse();
        gui.elements['inner'].west.collapse();
        gui.elements['inner'].east.collapse();
        gui.elements['inner'].north.collapse();
    };
    gui.arrange['playerContentView'] = function() {
        gui.arrange['hidden']();

        gui.elements['outer'].west.expand();
        gui.place('rtcFeedback', '#outer-west');
        gui.place('statusMenu', '#outer-west');
        gui.place('mainChat', '#outer-west');

        gui.elements['inner'].north.expand();
        gui.place('rtcPlayers', '#inner-north');

        gui.elements['inner'].west.expand();
        gui.place('mainMenu', '#inner-west');

        gui.place('rtcGamemaster', '#inner-center');
        gui.place('mainContent', '#inner-center');

        gui.hide('gmControls');
        gui.resizeAfter();
    };
    gui.arrange['gamemasterContentView'] = function() {
        gui.arrange['hidden']();

        gui.elements['outer'].west.expand();
        gui.place('gmControls', '#outer-west');
        gui.place('statusMenu', '#outer-west');
        gui.place('mainChat', '#outer-west');

        gui.elements['inner'].north.expand();
        gui.place('rtcPlayers', '#inner-north');

        gui.elements['inner'].west.expand();
        gui.place('mainMenu', '#inner-west');

        gui.place('rtcFeedback', '#inner-center');
        gui.place('mainContent', '#inner-center');

        gui.hide('rtcGamemaster');
        gui.resizeAfter();
    };
    gui.arrange['playerConferenceView'] = function() {
        gui.arrange['hidden']();

        gui.elements['outer'].west.expand();
        gui.place('mainMenu', '#outer-west');
        gui.place('statusMenu', '#outer-west');
        gui.place('mainChat', '#outer-west');

        gui.place('rtcPlayers', '#inner-center');

        gui.elements['inner'].east.expand();
        gui.place('rtcGamemaster', '#inner-east');
        gui.place('rtcFeedback', '#inner-east');

        gui.hide('gmControls');
        gui.resizeAfter();
    };
    gui.arrange['gamemasterConferenceView'] = function() {
        gui.arrange['hidden']();

        gui.elements['outer'].west.expand();
        gui.place('mainMenu', '#outer-west');
        gui.place('statusMenu', '#outer-west');
        gui.place('mainChat', '#outer-west');

        gui.place('rtcPlayers', '#inner-center');

        gui.elements['outer'].east.expand();
        gui.place('gmControls', '#outer-east');
        gui.place('rtcFeedback', '#outer-east');

        gui.hide('rtcGamemaster');
        gui.resizeAfter();
    };

    gui.resizeAfter = function(time) {
        if(typeof time === 'undefined') { time = 250; }
        if(gui.resizeTimeout !== false) {
            clearTimeout(gui.resizeTimeout);
        }
        gui.resizeTimeout = setTimeout(function() {
            jQuery(window).triggerHandler('resize');
        }, time);
    }

    gui.start = util.extend(gui.start, function() {
        argo.loader.update('Preparing user interface');

        gui.elements['outer'] = jQuery('#layout');
        gui.elements['inner'] = jQuery('#outer-center');
        var outerOptions = {width: jQuery(window).width()
                          , height: jQuery(window).height()
                          , west: {size: '20%', minPx: 220}
                          , east: {size: '20%'}};
        var innerOptions = {north: {size: '20%', minPx: 182}
                          , west: {size: '16%'}
                          , east: {size: '40%'}};
        gui.layout['page'].applyTo(gui.elements['outer'], outerOptions);
        gui.layout['page'].applyTo(gui.elements['inner'], innerOptions);

        jQuery(window).resize(function() {
            gui.elements['outer'].setBounds(jQuery(window).width(),
                                jQuery(window).height());
            for(var name in gui.elements) {
                gui.elements[name].triggerHandler('resize');
            }
            if(gui.elements['outer'].height()
               != jQuery(window).height()
               || gui.elements['outer'].width()
               != jQuery(window).width()) {
                gui.resizeAfter(500);
            }
        });

        gui.routines['base']();
        jQuery.each(gui.routines, function(key, module) {
            if(argo.modules[key]) { module(); }
        });

        if(argo.localPlayer.id == argo.gamemaster.id) {
            gui.arrange['gamemasterContentView']();
        } else {
            gui.arrange['playerContentView']();
        }
    }, {order: 'prepend'});
    gui.stop = util.extend(gui.stop, function() {
        var p = Argonaut.Player.prototype;
        p.init = util.baseFn(p.init);
        p.destroy = util.baseFn(p.init);
        argo.stderr = util.baseFn(argo.stderr);
        jQuery(window).unbind('resize');
        clearTimeout(gui.resizeTimeout);
        gui.elements['outer'].setBounds(0,0);
        gui.elements['outer'].triggerHandler('resize');
        gui.elements['inner'].triggerHandler('resize');
        delete gui.elements['outer']; delete gui.elements['inner'];
        delete gui.elements['stderr']; // Keep stderr attached to DOM
        for(var name in gui.elements) { gui.elements[name].remove(); }
        gui.elements = {};
    }, {order: 'prepend'});
})(); // Close anonymous namespace
