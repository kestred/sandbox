/*! === Tabletop GUI === */
mods['gui'] = new Argonaut.Module('gui');
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
    gui.create['videoContainer'] = function() {
        var container = jQuery('<div class="video-container"></div>');
        container.append(
            '<video autoplay></video>' +
            '<div class="navbar navbar-inverse">' +
            '<div class="navbar-inner">' +
            '<ul class="nav pull-right"></ul>' +
            '</div></div>');
        container.videoElement = container.find('video');
        container.videoControls = container.find('.navbar');
        container.videoControls.setName = function(name) {
            var brand = this.find('.brand');
            if(!!brand.length) { brand.html(name); }
            else {
                brand = jQuery('<span class="brand">'
                               + name + '</span>');
                this.find('.navbar-inner').prepend(brand);
            }
            return this; // function chaining
        };
        container.videoControls.appendControl = function(element) {
            var ctrlList = this.find('ul');
            var ctrlItem = jQuery('<li></li>');
            ctrlItem.append(element);
            ctrlList.append('<li class="divider-vertical"></li>');
            ctrlList.append(ctrlItem);
            return this; // function chaining
        };
        return container;
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
    gui.create['privateButton'] = function() {
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
        argo.stderr = function(message) {
            var html = '<strong>[stderr]</strong> ' + message;
            var alert = gui.create['errorAlert'](html);
            div['stderr'].enqueueAlert(alert);
            console.log('[stderr] ' + message);
        };

        /* Called on a player object, shows gui player functions */
        gui.addStatusUtilities = function(player) {
            player.statusBar = gui.create['playerStatusBar']();
            player.statusBar.name.html(player.name);
            player.setName = function(name) {
                this.name = name;
                this.statusBar.name.html(name);
            };
            player.setStatus = function(status) {
                this.status = status;
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
            player.toggleConnected = function() {
                if(player.status != 'disconnected') {
                    this.setStatus('disconnected');
                } else { this.setStatus('connected'); }
            };
            player.toggleSpeaking = function() {
                if(this.status != 'speaking') {
                    if(this.status !=  'typing') {
                        this.previousStatus = this.status;
                    }
                    this.setStatus('speaking');
                } else {
                    this.setStatus(this.previousStatus);
                }
            };
            player.toggleTyping = function() {
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
            player.toggleInitiative = function() {
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

        /* Add status utilities to default players */
        var self = argo.localPlayer, gm = argo.gamemaster;
        gui.addStatusUtilities(self);
        self.setStatus(self.status);
        self.statusBar.name.html('<em>' + self.name + '</em> (You)');
        if(self.id != gm.id) {
            gui.addStatusUtilities(gm);
            gm.statusBar.name.html(gm.name + ' (GM)');
            gm.setStatus(gm.status);
        }

        /* Build Player Status Menu */
        div['statusMenu'] = jQuery('<div class="status-menu"></div>');
        div['statusList'] = jQuery('<div class="status-list"></div>');
        var list = jQuery('<ol class="unstyled"></ol>');
        if(argo.localPlayer.id != argo.gamemaster.id) {
            list.append(argo.gamemaster.statusBar);
        }
        list.append(argo.localPlayer.statusBar);
        div['statusList'].list = list;
        div['statusList'].append(list);
        div['statusMenu'].append(div['statusList']);
    };
    gui.routines['webRTC'] = function() {
        var div = gui.elements;

        /* Local feedback, gamemaster video, and players video-group */
        div['rtcFeedback'] = gui.create['videoContainer']();
        div['rtcFeedback'].addClass('big').addClass('feedback');
        div['rtcFeedback'].videoControls.hide();
        argo.localPlayer.videoContainer = div['rtcFeedback'];
        if(argo.localPlayer.id != argo.gamemaster.id) {
            div['rtcGamemaster'] = gui.create['videoContainer']();
            div['rtcGamemaster'].addClass('big');
            div['rtcGamemaster'].videoControls.setName('Gamemaster');
            div['rtcGamemaster'].videoControls.appendControl(
                                    gui.create['privateButton']());
            argo.gamemaster.videoContainer = div['rtcGamemaster'];
        }
        div['rtcPlayers'] = jQuery('<div class="video-group"></div>');

        /* GUI manipulation functions required by the VideoService */
        gui.getVideoById = function(playerId) {
            if(playerId == argo.localPlayer.id) {
                return div['rtcFeedback'].videoElement;
            }
            if(playerId == argo.gamemaster.id) {
                return div['rtcGamemaster'].videoElement;
            }
            if(playerId in argo.players) {
                var player = argo.players[playerId];
                if('videoContainer' in player) {
                    return player.videoContainer.videoElment;
                } else {
                    var container = gui.create['videoContainer']();
                    container.videoControls.appendControl(
                                    gui.create['privateButton']());
                    div['rtcPlayers'].append(container);
                    player.videoContainer = container;
                    return container.videoElement;
                }
            }
            argo.stderr('(getVideoById) No player with given id.');
            return jQuery('<video>');
        };
        gui.detachVideoById = function(playerId) {
            if(playerId == argo.gamemaster.id) {
                div['rtcGamemaster'].videoElement.attr('src', '');
            } else if(playerId in argo.players) {
                var player = argo.players[playerId];
                if('videoContainer' in player) {
                    player.videoContainer.remove();
                    delete player['videoContainer'];
                }
            } else {
                argo.stderr('(detachVideoById) No player with given id.');
            }
        };
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
                input.blur();
                if(argo.localPlayer.status == 'typing') {
                    argo.localPlayer.toggleTyping();
                }
                input.val('');
                mods['chat'].sendMessage(message);
            }
        }
        var input = jQuery('<input type="text" />');
        input.attr('placeholder', "Type message and hit 'enter'");
        input.focus(function() {
            if(argo.localPlayer.status != 'typing') {
                argo.localPlayer.toggleTyping();
            }
        });
        input.blur(function() {
            if(argo.localPlayer.status == 'typing') {
                argo.localPlayer.toggleTyping();
            }
        });
        input.keydown(function(event) {
            if(event.keyCode == 13) {
                sendMessage();
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

    gui.run = function() {
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
               != jQuery(window).height()) {
                gui.resizeAfter(125)
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
    };
})(); // Close anonymous namespace
