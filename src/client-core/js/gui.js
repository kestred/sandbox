/*! === Tabletop GUI === */
mods['gui'] = new Argonaut.Module('gui', priority.CORE);
(function() { // Begin anonymous namespace
    var gui = mods['gui'];

    /* Dictionary of GUI elements that are drag/drop-able */
    gui.elements = {};

    /* Dictionary of functions that build HTML structures */
    gui.create = {};
    gui.create['alertQueue'] = function() {
        var queue = jQuery('<ol class="alert-queue unstyled"></ol>');
        queue.enqueueAlert = function(alert) {
            var listAlert = jQuery('<li></li>');
            listAlert.attr('id', alert.attr('id'));
            listAlert.attr('class', alert.attr('class'));
            listAlert.html(alert.html());
            listAlert.prependTo(queue);
            alert.remove();
            return listAlert;
        };
        queue.dequeueAlert = function() {
            queue.foals().last().remove();
        };
        queue.clearAlerts = function() {
            queue.html('');
        };
        return queue;
    };
    gui.create['errorAlert'] = function(message) {
        var alert = jQuery('<div class="alert alert-error"></div>');
        var close = jQuery('<button type="button" class="close" '
                         + 'data-dismiss="alert">&times;</button>');
        alert.append(close);
        alert.append(message);
        return alert;
    };

    /* More HTML builders */
    gui.create['warningAlert'] = function() {
        var alert = jQuery('<div class="alert"></div>');
        var close = jQuery('<button type="button" class="close" '
                         + 'data-dismiss="alert">&times;</button>');
        alert.append(close);
        alert.append(message);
        return alert;
    };
    gui.create['successAlert'] = function() {
        var alert = jQuery('<div class="alert alert-success"></div>');
        var close = jQuery('<button type="button" class="close" '
                         + 'data-dismiss="alert">&times;</button>');
        alert.append(close);
        alert.append(message);
        return alert;
    };
    gui.create['videoContainer'] = function(controls) {
        var container = jQuery('<div class="video-container"></div>');
        var video = jQuery('<video autoplay></video>');
        container.append(video);
        container.append(controls);
        container.video = video;
        container.videoControls = controls;
        return container;
    };
    gui.create['playerInteractionControls'] = function() {
        var controls = jQuery('<div class="navbar navbar-inverse">'
                            + '<div class="navbar-inner">'
                            + '<ul class="nav pull-right"></ul>'
                            + '</div></div>');
        controls.setName = function(name) {
            var brand = this.find('.brand');
            if(!!brand.length) { brand.html(name); }
            else {
                brand = jQuery('<span class="brand">'
                               + name + '</span>');
                this.find('.navbar-inner').prepend(brand);
            }
            return this; // function chaining
        };
        controls.appendControl = function(element) {
            var ctrlList = this.find('ul');
            var ctrlItem = jQuery('<li></li>');
            ctrlItem.append(element);
            ctrlList.append('<li class="divider-vertical"></li>');
            ctrlList.append(ctrlItem);
            return this; // function chaining
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
                           + ' icon-asterisk'
                           + ' icon-volume-up'
                           + ' icon-remove'
                           + ' icon-pencil');
        };
        bar.badge.clear = function() {
            bar.badge.removeClass('badge-success'
                            + ' badge-info'
                            + ' badge-warning');
        };
        bar.badge.append(bar.icon);
        bar.append(bar.badge);
        bar.append(bar.name);
        return bar;
    };
    gui.create['subwindow'] = function(options) {
        var modal = jQuery('<div class="modal hide fade"></div>');
        var header = jQuery('<div class="modal-header"></div>');
        var content = jQuery('<div class="modal-body"></div');
        modal.addClass('subwindow snap-target');
        modal.body = content;
        modal.header = header;
        modal.append(header);
        modal.append(content);
        if('title' in options) {
            header.html('<h3>' + options.title + '</h3>');
        }
        if('width' in options) { modal.width(options.width); }
        if('height' in options) { content.height(options.height); }
        if('top' in options) { modal.css('top', options.top + 'px'); }
        else if('right' in options) {
            var left = jQuery(window).width() - options.right;
            modal.css('left', left + 'px');
        }
        if('left' in options) { modal.css('left', options.left + 'px'); }
        else if('bottom' in options) {
            var top = jQuery(window).height() - options.bottom;
            modal.css('top', top + 'px');
        }
        if(options.draggable !== false) {
            modal.draggable({handle: '.modal-header'
                           , stack: '.subwindow'
                           , snap: '.snap-target'
                           , snapMode: 'outer'
                           , containment: '#layout'});
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
                content.on('shown', function() {
                    if(event.target == this) {
                        content.height(options.height);
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
        modal.show = function() { modal.modal('show'); };
        modal.hide = function() { modal.modal('hide'); };
        return modal;
   }
    gui.create['privateChatButton'] = function() {
        var icon = jQuery('<i></i>');
        var button = jQuery('<button></button)');
        icon.addClass('icon-comment').addClass('icon-white');
        button.addClass('btn').addClass('btn-inverse');
        button.attr('data-toggle', 'tooltip');
        button.attr('data-placement', 'top');
        button.attr('data-original-title', 'Private Chat');
        button.append(icon).tooltip();
        return button;
    };

    /* Dictionary of GUI setup functions (using Module names as keys) */
    gui.routines = {}; // Core routines are built-in
    gui.routines['base'] = function() {
        var div = gui.elements;

        /* Change argonaut.stderr to display errors on the gui */
        div['stderr'] = gui.create['alertQueue']();
        div['stderr'].addClass('stderr-queue');
        argo.stderr = util.extend(argo.stderr, function(message) {
            var html = '<strong>[stderr]</strong> ' + message;
            var alert = gui.create['errorAlert'](html);
            div['stderr'].enqueueAlert(alert);
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
            this.controls = gui.create['playerInteractionControls']();
            this.statusBar = gui.create['playerStatusBar']();
            div['statusList'].list.append(this.statusBar);
            mods['gui'].resizeAfter();
            this.setName = util.extend(this.setName, function(name) {
                this.statusBar.name.html(name);
            });
            this.setName(this.getLongName());
            this.setStatus = util.extend(this.setStatus,
                function(status) {
                    this.statusBar.badge.clear();
                    this.statusBar.icon.clear();
                    if(status == 'connected') {
                        this.statusBar.icon.addClass('icon-user');
                    } else if(status == 'speaking') {
                        this.statusBar.icon.addClass('icon-volume-up');
                        this.statusBar.badge.addClass('badge-success');
                    } else if(status == 'typing') {
                        this.statusBar.icon.addClass('icon-pencil');
                        this.statusBar.badge.addClass('badge-success');
                    } else if(status == 'disconnected') {
                        this.statusBar.icon.addClass('icon-remove');
                        this.statusBar.badge.addClass('badge-warning');
                    }
                }
            );
            this.setStatus(this.status);
            this.toggleConnected = function() {
                if(player.status != 'disconnected') {
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
        div['rtcFeedback'] = gui.create['videoContainer'](self.controls);
        div['rtcFeedback'].addClass('big').addClass('feedback');
        self.videoContainer = div['rtcFeedback'];
        self.controls.hide();
        if(self.id != gm.id) {
            var gmCtrl = gm.controls;
            div['rtcGamemaster'] = gui.create['videoContainer'](gmCtrl);
            div['rtcGamemaster'].addClass('big');
            gm.controls.setName('Gamemaster');
            gm.videoContainer = div['rtcGamemaster'];
        }
        div['rtcPlayers'] = jQuery('<div class="video-group"></div>');

        /* Update (Non-GM/LP) player init/destroy for video elements */
        var proto = Argonaut.Player.prototype;
        proto.setupVideo = function() {
            var ctrls = this.controls;
            this.videoContainer = gui.create['videoContainer'](ctrls);
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
        });
        if(self.id != gm.id) {
            gm.videoContainer = div['rtcGamemaster'];
            gm.destroy = util.extend(gm.destroy, function() {
                div['rtcGamemaster'].video.attr('src', '');
            });
        }
        jQuery.each(argo.players, function(id, player) {
            proto.setupVideo.apply(player);
        });
    };
    gui.routines['chat'] = function() {
        var div = gui.elements;

        /* The main chat panel */
        div['chatPanel'] = jQuery('<div class="chat-panel"></div>');

        /* Chat History */
        div['chatHistory'] = jQuery('<div class="chat-history"></div>');
        var chatLog = jQuery('<dl class="dl-horizontal"></div');
        div['chatHistory'].log = chatLog;
        div['chatHistory'].append(chatLog);
        div['chatHistory'].logMessage = function(message, name) {
            var previous = div['chatHistory'].log.find('dt').last();
            var log = '<dd>' + message + '</dd>';
            if(previous.html() != name) {
                log = '<dt>' + name + '</dt>' + log;
            }
            div['chatHistory'].log.append(log);
            var scrollHeight = div['chatHistory'].log.scrollHeight;
            div['chatHistory'].log.scrollTop(scrollHeight);
        };
        div['chatPanel'].append(div['chatHistory']);
        mods['chat'].chatHistory = div['chatHistory'];

        /* Chat Input */
        div['chatInput'] = jQuery('<form class="chat-input"></form>');
        function sendMessage() {
            var message = input.val();
            if(message.length > 0) {
                input.val('');
                if(argo.localPlayer.status == 'typing') {
                    argo.localPlayer.toggleTyping();
                }
                mods['chat'].sendMessage(message);
            }
        }
        var input = jQuery('<input type="text" />');
        input.attr('placeholder', "Type message and hit 'enter'");
        input.focus(function() {
            if(argo.localPlayer.status != 'typing'
               && input.val().length > 0) {
                argo.localPlayer.toggleTyping();
            }
        });
        input.blur(function() {
            if(argo.localPlayer.status == 'typing') {
                argo.localPlayer.toggleTyping();
            }
        });
        input.keydown(function(event) {
            var player = argo.localPlayer;
            var length = input.val().length;
            if(event.keyCode === 13) {
                sendMessage();
                return false;
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
        var send = jQuery('<input type="button" class="btn"></input>');
        send.val('Send');
        send.click(function() { sendMessage(); });
        div['chatInput'].append(input);
        div['chatInput'].append(send);
        div['chatPanel'].append(div['chatInput']);

        /* Set ChatPanel on resize */
        function fillHeight(element, height) {
            height = element.parent().innerHeight();
            var sibs = element.siblings();
            jQuery.each(sibs, function(index, sib) {
                height -= jQuery(sib).outerHeight(true);
            });
            element.height(height);
            return height;
        }
        div['chatPanel'].resize(function() {
            var height = fillHeight(div['chatPanel']);
            height -= div['chatInput'].outerHeight(true);
            div['chatHistory'].css('height', height + 'px');
        });

        /* Add Private Chat Controls */
        var proto = Argonaut.Player.prototype;
        proto.setupPrivateChat = function() {
            var player = this;
            var button = gui.create['privateChatButton']();
            function createChatWindow(name) {
                var windowLeft = div['chatPanel'].offset().left;
                if(div['chatPanel'].parents('.east').length) {
                    windowLeft -= 256; // Move to left of chat panel
                } else { // Move to right of chat panel
                    windowLeft += div['chatPanel'].width();
                }
                var privateChat = gui.create['subwindow'](
                    {width: 256, height: 320, bottom: 0
                   , left: windowLeft, title: name}
                );
                return privateChat;
            };
            button.click(function() {
                button.button('toggle');
                if('privateChat' in player) {
                    var visible = jQuery.contains(
                                              document.documentElement
                                            , player.privateChat[0]);
                    if(visible) {
                        player.privateChat.detach();
                    } else {
                        player.privateChat.appendTo('body');
                    }
                } else {
                    var name = player.getShortName();
                    player.privateChat = createChatWindow(name);
                    player.privateChat.find('.btn-danger').click(
                        function() { button.button('toggle'); }
                    );
                    player.privateChat.show();
                }
            });
            this.controls.appendControl(button);
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
        if(e) {
            jQuery('hidden').append(e);

            // Force paused video on hide()
            if(e.hasClass('video-container')) {
                e.find('video')[0].hide();
            } else if(e.hasClass('video-group')) {
                var videos = e.find('video');
                for(var i=0; i<videos.length; ++i) {
                    videos[i].hide();
                }
            }
         }
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
        gui.place('mainMenu', '#outer-west');
        gui.place('statusMenu', '#outer-west');
        gui.place('chatPanel', '#outer-west');

        gui.elements['inner'].north.expand();
        gui.place('rtcPlayers', '#inner-north');

        gui.place('rtcGamemaster', '#inner-center');
        gui.place('mainContent', '#inner-center');

        // Hidden Content
        gui.hide('gmControls');
    };
    gui.arrange['gamemasterContentView'] = function() {
        gui.arrange['hidden']();

        gui.elements['outer'].west.expand();
        gui.place('mainMenu', '#outer-west');
        gui.place('gmControls', '#outer-west');
        gui.place('statusMenu', '#outer-west');
        gui.place('chatPanel', '#outer-west');

        gui.elements['inner'].north.expand();
        gui.place('rtcPlayers', '#inner-north');

        gui.place('rtcFeedback', '#inner-center');
        gui.place('mainContent', '#inner-center');

        // Hidden Content
        gui.hide('rtcGamemaster');
    };
    gui.arrange['playerConferenceView'] = function() {
        gui.arrange['hidden']();

        gui.elements['outer'].west.expand();
        gui.place('mainMenu', '#outer-west');
        gui.place('statusMenu', '#outer-west');
        gui.place('chatPanel', '#outer-west');

        gui.place('rtcPlayers', '#inner-center');

        gui.elements['inner'].east.expand();
        gui.place('rtcGamemaster', '#inner-east');
        gui.place('rtcFeedback', '#inner-east');

        // Hidden Content
        gui.hide('gmControls');
    };
    gui.arrange['gamemasterConferenceView'] = function() {
        gui.arrange['hidden']();

        gui.elements['outer'].west.expand();
        gui.place('mainMenu', '#outer-west');
        gui.place('statusMenu', '#outer-west');
        gui.place('chatPanel', '#outer-west');

        gui.place('rtcPlayers', '#inner-center');

        gui.elements['outer'].east.expand();
        gui.place('gmControls', '#outer-east');
        gui.place('rtcFeedback', '#outer-east');

        // Hidden Content
        gui.hide('rtcGamemaster');
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

    gui.run = util.extend(gui.run, function() {
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
            jQuery.each(gui.elements, function(name, element) {
                element.triggerHandler('resize');
            });
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
})(); // Close anonymous namespace
