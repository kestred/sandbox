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
            '<div class="navbar">' +
            '<div class="navbar-inner">' +
            '<ul class="nav pull-right"></ul>' +
            '</div></div>');
        container.videoElement = container.find('video');
        container.videoControls = container.find('ul');
        container.videoControls.appendControl = function(element) {
            var ctrlItem = jQuery('<li></li>');
            ctrlItem.append(element);
            this.append('<li class="divider-vertical"></li>');
            this.append(ctrlItem);
        };
        return container;
    }
    gui.create['videoGroup'] = function() {
        var group = jQuery('<div class="video-group"></div>');
        // TODO: Figure out best context to add containers to group
    }

    /* Dictionary of GUI setup functions (using Module names as keys) */
    gui.routines = {};
    gui.routines['webRTC'] = function() {
        var div = gui.elements;
        div['rtcFeedback'] = gui.create['videoContainer']();
        div['rtcFeedback'].addClass('big').addClass('feedback');
        div['rtcGamemaster'] = gui.create['videoContainer']();
        div['rtcGamemaster'].addClass('big');
        div['rtcPlayers'] = gui.create['videoGroup']();
    };

    /* Utility functions for arranging GUI elements */
    gui.hide = function(elementName) {
        if(gui.elements[elementName]) {
            jQuery('hidden').append(gui.elements[elementName]);
        }
    };
    gui.place = function(elementName, query) {
        if(gui.elements[elementName]) {
            jQuery(query).append(gui.elements[elementName]);
        }
    };

    /* Dictionary of screen arrangements */
    gui.arrange = {};
    gui.arrange['playerContentView'] = function() {
        // Primary Panel (left-major)
        gui.place('rtcFeedback', '#lft-major');
        gui.place('mainMenu', '#lft-major');
        gui.place('chatPanel', '#lft-major');

        // Content Column
        gui.place('rtcPlayers', '#top-major');
        gui.place('rtcGamemaster', '#mid-minor');
        gui.place('mainContent', '#mid-major');

        // Hidden Content
        gui.hide('gmControls');
    };
    gui.arrange['gmContentView'] = function() {
        // Primary Panel (left-major)
        gui.place('mainMenu', '#lft-major');
        gui.place('gmControls', '#lft-major');
        gui.place('chatPanel', '#lft-major');

        // Content Column
        gui.place('rtcPlayers', '#top-major');
        gui.place('rtcFeedback', '#mid-minor');
        gui.place('mainContent', '#mid-major');

        // Hidden Content
        gui.hide('rtcGamemaster');
    };
    gui.arrange['playerConferenceView'] = function() {
        // Primary Panel (left-major)
        gui.place('mainMenu', '#lft-major');
        gui.place('chatPanel', '#lft-major');

        // Content Column
        gui.place('rtcPlayers', '#mid-minor');
        gui.place('rtcGamemaster', '#rgt-minor');
        gui.place('rtcFeedback', '#rgt-minor');

        // Hidden Content
        gui.hide('gmControls');
    };
    gui.arrange['gmConferenceView'] = function() {
        // Primary Panel (left-major)
        gui.place('mainMenu', '#lft-major');
        gui.place('chatPanel', '#lft-major');

        // Content Column
        gui.place('rtcPlayers', '#mid-minor');

        // Secondary Panel (right-major)
        gui.place('gmControls', '#rgt-major');
        gui.place('rtcFeedback', '#rgt-major');

        // Hidden Content
        gui.hide('rtcGamemaster');
    };

    gui.run = function() {
        argo.loader.update('Preparing user interface');
        jQuery.each(gui.routines, function(key, module) {
            if(argo.modules[key]) { module(); }
        });
        // TODO: Foreach gui.routines, if the Module is loaded,
        //         run the provided routine
        // TODO: Check user status and arrange elements appropriately
        //         DEFAULT to 'gmConferenceView'
        gui.arrange['gmConferenceView']();
    };
})(); // Close anonymous namespace
