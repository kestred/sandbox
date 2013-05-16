/*! === Tabletop GUI === */
mods['gui'] = new Argonaut.Module('gui');
(function() { // Begin anonymous namespace
    var gui = mods['gui'];

    /* Dictionary of GUI elements that are drag/drop-able */
    gui.elements = {};

    /* Dictionary of functions that build HTML structures */
    gui.create = {};
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
    gui.create['playerStatus'] = function() {
        var player = jQuery('<li></li>');
        var title = jQuery('<span class="player-name"></span>');
        var badge = jQuery('<span class="badge"></span>');
        var icon = jQuery('<i class="icon-user"></i>');
        badge.append(icon);
        player.append(badge);
        player.append(title);
        player.setName = function(name) {
            player.find('.player-name').html(name);
        };
        badge.clear = function() {
            badge.removeClass('badge-success'
                            , 'badge-info'
                            , 'badge-warning');
        };
        icon.clear = function() {
            icon.removeClass('icon-user'
                           , 'icon-asterisk'
                           , 'icon-volume-up'
                           , 'icon-remove');
        };
        player.setStatus = function(status) {
            player.status = status;
            badge.clear(); icon.clear();
            if(status == 'connected') {
                icon.addClass('icon-user');
            } else if(status == 'speaking') {
                icon.addClass('icon-volume-up');
                badge.addClass('badge-success');
            } else if(status == 'disconnected') {
                icon.addClass('icon-remove');
                badge.addClass('badge-warning');                
            }
        }
        player.toggleConnected = function() {
            if(player.status != 'disconnected') {
                player.setStatus('disconnected');
            } else { player.setStatus('connected'); }
        };
        player.toggleSpeaking = function() {
            if(player.status != 'speaking') {
                player.untoggler = player.status;
                player.setStatus('speaking');
            } else { player.setStatus(player.untoggler); }
        };
        player.toggleInitiative = function() {
            if(player.untoggler != 'active') {
                if(player.status == 'connected') {
                    player.setStatus('active');
                } else if(player.status == 'speaking') {
                    player.untoggler = 'active';
                } else if(player.status == 'active') {
                    player.setStatus('connected');
                } // else status == disconnected SO do nothing
            } else { player.untoggler = 'connected'; }
        };
        player.status = 'connected';
        return player;
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
    gui.routines['webRTC'] = function() {
        var div = gui.elements;
        div['rtcFeedback'] = gui.create['videoContainer']();
        div['rtcFeedback'].addClass('big').addClass('feedback');
        div['rtcFeedback'].attr('data-playerid', argo.publicId);
        div['rtcFeedback'].videoControls.hide();
        div['rtcGamemaster'] = gui.create['videoContainer']();
        div['rtcGamemaster'].addClass('big');
        div['rtcGamemaster'].attr('data-playerid', argo.gamemaster);
        div['rtcGamemaster'].videoControls.setName('Gamemaster');
        div['rtcGamemaster'].videoControls.appendControl(
                                gui.create['privateButton']());
        div['rtcPlayers'] = jQuery('<div class="video-group"></div>');
        gui.getVideoById = function(playerId) {
            var video = jQuery(".video-container[data-playerid='"
                                          + playerId + "'] video");
            if(!video.length) {
                var container = gui.create['videoContainer']();
                container.attr('data-playerid', playerId);
                container.videoControls.appendControl(
                                gui.create['privateButton']());
                div['rtcPlayers'].append(container);
                video = container.videoElement;
            }
            return video;
        };
        gui.detachVideoById = function(playerId) {
            jQuery(".video-container[data-playerid='"
                            + playerId + "']").remove();
        };
    };
    gui.routines['chat'] = function() {
        var div = gui.elements;
        div['chatPanel'] = jQuery('<div class="chat-panel"></div>');
        var chatMenu = jQuery('<div class="chat-menu"></div>');
        var playerStatus = jQuery('<ol id="player-status"></ol>');
        playerStatus.addClass('unstyled');
        var chatStatusSelf = gui.create['playerStatus']();
        chatStatusSelf.attr('data-playerid', argo.publicId);
        chatStatusSelf.setName('Local user');
        var chatStatusGm = gui.create['playerStatus']();
        chatStatusGm.setName('Gamemaster');
        chatStatusGm.attr('data-playerid', argo.gamemaster);
        chatStatusGm.toggleConnected(); // for display purposes for now
        playerStatus.append(chatStatusGm);
        playerStatus.append(chatStatusSelf);
        chatMenu.append(playerStatus);
        div['chatPanel'].append(chatMenu);
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
                            if(pane.minSize != 0) { console.log('Size: '+size + ', Min-Pixels:'+pane.minSize); }
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
        gui.outer.west.collapse();
        gui.outer.east.collapse();
        gui.inner.west.collapse();
        gui.inner.east.collapse();
        gui.inner.north.collapse();
    };
    gui.arrange['playerContentView'] = function() {
        gui.arrange['hidden']();

        gui.outer.west.expand();
        gui.place('rtcFeedback', '#outer-west');
        gui.place('mainMenu', '#outer-west');
        gui.place('chatPanel', '#outer-west');

        gui.inner.north.expand();
        gui.place('rtcPlayers', '#inner-north');

        gui.place('rtcGamemaster', '#inner-center');
        gui.place('mainContent', '#inner-center');

        // Hidden Content
        gui.hide('gmControls');
    };
    gui.arrange['gmContentView'] = function() {
        gui.arrange['hidden']();

        gui.outer.west.expand();
        gui.place('mainMenu', '#outer-west');
        gui.place('gmControls', '#outer-west');
        gui.place('chatPanel', '#outer-west');

        gui.inner.north.expand();
        gui.place('rtcPlayers', '#inner-north');

        gui.place('rtcFeedback', '#inner-center');
        gui.place('mainContent', '#inner-center');

        // Hidden Content
        gui.hide('rtcGamemaster');
    };
    gui.arrange['playerConferenceView'] = function() {
        gui.arrange['hidden']();

        gui.outer.west.expand();
        gui.place('mainMenu', '#outer-west');
        gui.place('chatPanel', '#outer-west');

        gui.place('rtcPlayers', '#inner-center');

        gui.inner.east.expand();
        gui.place('rtcGamemaster', '#inner-east');
        gui.place('rtcFeedback', '#inner-east');

        // Hidden Content
        gui.hide('gmControls');
    };
    gui.arrange['gmConferenceView'] = function() {
        gui.arrange['hidden']();

    //    gui.outer.open('west');
        gui.place('mainMenu', '#outer-west');
        gui.place('chatPanel', '#outer-west');

        gui.place('rtcPlayers', '#inner-center');

    //    gui.outer.open('east');
        gui.place('gmControls', '#outer-east');
        gui.place('rtcFeedback', '#outer-east');

        // Hidden Content
        gui.hide('rtcGamemaster');
    };

    gui.run = function() {
        argo.loader.update('Preparing user interface');

        gui.outer = jQuery('#layout');
        gui.inner = jQuery('#outer-center');
        var outerOptions = {width: jQuery(window).width()
                          , height: jQuery(window).height()
                          , west: {size: '20%', minPx: 200}
                          , east: {size: '20%'}};
        var innerOptions = {north: {size: '20%'}
                          , west: {size: '16%'}
                          , east: {size: '40%'}};
        gui.layout['page'].applyTo(gui.outer, outerOptions);
        gui.layout['page'].applyTo(gui.inner, innerOptions);

        jQuery(window).resize(function() {
            gui.outer.setBounds(jQuery(window).width(),
                                jQuery(window).height());
            gui.outer.relayout();
            gui.inner.relayout();
        });

        jQuery.each(gui.routines, function(key, module) {
            if(argo.modules[key]) { module(); }
        });
        
        // TODO: Check user status and arrange elements appropriately
        //         DEFAULT to 'gmConferenceView'
        gui.arrange['playerContentView']();
    };
})(); // Close anonymous namespace
