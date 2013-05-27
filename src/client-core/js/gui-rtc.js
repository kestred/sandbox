/*! === WebRTC GUI Components === */
(function() { // Begin anonymous namespace
    var gui = mods['gui'];
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
                gui.resizeAfter(0);
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

    var div = gui.elements;
    function playAll() {
        if(argo.localPlayer.id != argo.gamemaster.id) {
            div['rtcGamemaster'].video[0].play();
        }
        div['rtcFeedback'].video[0].play();
        div['rtcPlayers'].find('video').each(
                              function(index, video) { video.play(); });
    }
    gui.arrange['playerContentView'] = util.extend(
        gui.arrange['playerContentView']
      , function() {
            jQuery('#outer-west').prepend(div['rtcFeedback']);
            jQuery('#inner-north').append(div['rtcPlayers']);
            jQuery('#inner-center').append(div['rtcGamemaster']);
            playAll();
        }
    );
    gui.arrange['gamemasterContentView'] = util.extend(
        gui.arrange['gamemasterContentView']
      , function() {
            jQuery('#inner-north').append(div['rtcPlayers']);
            jQuery('#inner-center').append(div['rtcFeedback']);
            playAll();
        }
    );
    gui.arrange['playerConferenceView'] = util.extend(
        gui.arrange['playerConferenceView']
      , function() {
            jQuery('#inner-center').append(div['rtcPlayers']);
            jQuery('#inner-east').append(div['rtcGamemaster']);
            jQuery('#inner-east').append(div['rtcFeedback']);
            playAll();
        }
    );
    gui.arrange['gamemasterConferencView'] = util.extend(
        gui.arrange['gamemasterConferenceView']
      , function() {
            jQuery('#inner-center').append(div['rtcPlayers']);
            jQuery('#outer-east').append(div['rtcFeedback']);
            playAll();
        }
    );
})(); // Close anonymous namespace

