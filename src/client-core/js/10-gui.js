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
    gui.create['buttonWidget'] = function(options) {
        if(typeof options === 'undefined') { options = {}; }
        var button = jQuery('<button class="btn"></button>');
        if('type' in options) { button.addClass('btn-' + options.type); }
        if('title' in options) { button.html(options.title); }
        if('icon' in options) { 
            var icon = jQuery('<i></i>');
            icon.addClass('icon-white icon-' + options.icon);
            button.prepend(icon).icon = icon;
        }
        if('tooltip' in options) {
            button.tooltip(
                {title: options.tooltip
               , html: true
               , placement: function() {
                     if(button.offset().top <= 40) {
                         return 'bottom';
                     } else { return 'top'; }
                 }});
        }
        return button;
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
            var minimize = jQuery('<button class="btn">');
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
    gui.create['splitDropdownButton'] = function(options) {
        var dropdownGroup = jQuery('<div class="btn-group"></div>');
        var caretOptions = {};
        caretOptions.title = '<span class="caret"></span>';
        if('button' in options) {
            dropdownGroup.append(options.button);
            dropdownGroup.primary = options.button;
            var types = options.button[0].className.match(/btn-[^\s]+/);
            if(types) { caretOptions.type = types[0].substr(4); }
        } else {
            var primaryOptions = {};
            if('title' in options) { buttonOptions.title = title; }
            if('icon' in options) { buttonOptions.icon = icon; }
            if('type' in options) { buttonOptions.type = type; }
            var primaryButton = gui.create['buttonWidget'](primaryOptions);
            dropdownGroup.append(primaryButton);
            dropdownGroup.primary = primaryButton;
        }
        if('type' in options) { caretOptions.type = type; }
        var caretButton = gui.create['buttonWidget'](caretOptions);
        caretButton.addClass('dropdown-toggle');
        caretButton.attr('data-toggle', 'dropdown');
        var dropdownMenu = jQuery('<ul class="dropdown-menu"></ul>');
        dropdownMenu.append = function(element) {
            var listItem = jQuery('<li></li>');
            listItem.append(element).appendTo(dropdownMenu);
            return dropdownMenu;
        }
        dropdownMenu.prepend = function(element) {
            var listItem = jQuery('<li></li>');
            listItem.append(element).prependTo(dropdownMenu);
            return dropdownMenu;
        }
        dropdownGroup.append(caretButton);
        dropdownGroup.caret = caretButton;
        dropdownGroup.append(dropdownMenu);
        dropdownGroup.menu = dropdownMenu;
        return dropdownGroup;
    };
    gui.create['minimizeButton'] = function(options) {
        if(typeof options === 'undefined') { options = {}; }
        if('target' in options) {
            options.tooltip = function() {
                 if(options.target.hasClass('minimized')) {
                     return 'Maximize';
                 } else {
                     return 'Minimize';
                 }
            };
        } else {
            options.tooltip = 'Minimize';
        }
        options.icon = 'resize-small';
        var button = gui.create['buttonWidget'](options);
        if('target' in options) {
            button.click(function() {
                options.target.toggleClass('minimized');
                button.icon.toggleClass('icon-resize-small');
                button.icon.toggleClass('icon-resize-full');
                gui.resizeAfter();
            });
        }
        return button;
    };
    gui.create['playerActionBar'] = function() {
        var bar = jQuery('<div class="action-bar"></div>');
        var controls = jQuery('<ul class="actions"></ul>');
        bar.setName = function(name) {
            var title = this.find('.title');
            if(!!title.length) { title.html(name); }
            else {
                title = jQuery('<span class="title">'
                               + name + '</span>');
                title.prependTo(bar);
            }
            return bar; // function chaining
        };
        bar.append(controls);
        bar.list = controls;
        bar.append = function(element) {
            var listItem = jQuery('<li></li>');
            listItem.append(element).appendTo(controls);
            return bar; // function chaining
        };
        bar.prepend = function(element) {
            var listItem = jQuery('<li></li>');
            listItem.append(element).prependTo(controls);
            return bar; // function chaining
        };
        return bar;
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

        /* Main Menu */
        div['mainMenu'] = jQuery('<div class="main-menu"></div>');
        div['mainMenu'].addClass('pane');
        var arrangeSelect = jQuery('<select></select>');
        for(var title in gui.arrange) {
            if(title !== 'hidden'
               && (title.indexOf('gamemaster') < 0
                   || argo.localPlayer.id == argo.gamemaster.id)
               && (title.indexOf('player') < 0
                   || argo.localPlayer.id != argo.gamemaster.id)) {
                var option = jQuery('<option></option>');
                var optionName = title.split(/(?=[A-Z])/).join(' ');
                option.html(util.ucwords(optionName));
                option.val(title);
                arrangeSelect.append(option);
            }
        }
        arrangeSelect.appendTo(div['mainMenu']);
        var arrangeLabel = jQuery('<label>Interface Modes</label>');
        arrangeLabel.insertBefore(arrangeSelect);
        arrangeSelect.change(function() {
            gui.arrange[arrangeSelect.val()]();
            gui.resizeAfter(15);
        });
        var themeSelect = jQuery('<select></select>');
        var optionDark = jQuery('<option value="dark"></option>');
        optionDark.html('Classic Dark').appendTo(themeSelect);
        var optionNone = jQuery('<option value="unstyled"></option>');
        optionNone.html('Unstyled').appendTo(themeSelect);
        themeSelect.appendTo(div['mainMenu']);
        var themeLabel = jQuery('<label>Interface Themes</label>');
        themeLabel.insertBefore(themeSelect);
        themeSelect.change(function() {
            jQuery('body').attr('class', '');
            jQuery('body').addClass(themeSelect.val());
        });



        /* GM Menu */
        if(argo.localPlayer.id == argo.gamemaster.id) {
            div['gmMenu'] = jQuery('<div class="gm-menu"></div>');
        }

        /* Build Player Status Menu */
        div['statusMenu'] = jQuery('<div class="status-menu"></div>');
        div['statusMenu'].list = jQuery('<ol class="unstyled"></ol>');
        div['statusMenu'].append(div['statusMenu'].list);
        div['statusMenu'].addClass('pane');
        div['statusMenu'].list.addClass('well');

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
            div['statusMenu'].list.append(this.statusBar);
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
            gui.resizeAfter(125);
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
    gui.layouts = {};
    gui.layouts['page'] = (function() {
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
            container.autoCollapse = function() {
                if('west' in this) {
                    if(this.west.children().length) {
                        this.west.expand();
                    } else { this.west.collapse(); }
                }
                if('east' in this) {
                    if(this.east.children().length) {
                        this.east.expand();
                    } else { this.east.collapse(); }
                }
                if('north' in this) {
                    if(this.north.children().length) {
                        this.north.expand();
                    } else { this.north.collapse(); }
                }
                if('south' in this) {
                    if(this.south.children().length) {
                        this.south.expand();
                    } else { this.south.collapse(); }
                }
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

    /* Dictionary of screen arrangements */
    gui.arrange = {};
    gui.arrange['playerContentView'] = function() {
        jQuery('#outer-west').append(gui.elements['statusMenu']);
        jQuery('#inner-west').append(gui.elements['mainMenu']);
    };
    gui.arrange['gamemasterContentView'] = function() {
        jQuery('#outer-west').append(gui.elements['gamemasterMenu']);
        jQuery('#outer-west').append(gui.elements['statusMenu']);
        jQuery('#inner-west').append(gui.elements['mainMenu']);
    };
    gui.arrange['playerConferenceView'] = function() {
        jQuery('#outer-west').append(gui.elements['mainMenu']);
        jQuery('#outer-west').append(gui.elements['statusMenu']);
    };
    gui.arrange['gamemasterConferenceView'] = function() {
        jQuery('#outer-west').append(gui.elements['statusMenu']);
        jQuery('#outer-east').append(gui.elements['mainMenu']);
        jQuery('#outer-east').append(gui.elements['gamemasterMenu']);
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
                          , west: {size: '16%', minPx: 178}
                          , east: {size: '40%'}};
        gui.layouts['page'].applyTo(gui.elements['outer'], outerOptions);
        gui.layouts['page'].applyTo(gui.elements['inner'], innerOptions);

        jQuery(window).resize(function() {
            gui.elements['outer'].setBounds(jQuery(window).width(),
                                jQuery(window).height());
            gui.elements['outer'].autoCollapse();
            gui.elements['inner'].autoCollapse();
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
            gui.resizeAfter(0);
        } else {
            gui.arrange['playerContentView']();
            gui.resizeAfter(0);
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
