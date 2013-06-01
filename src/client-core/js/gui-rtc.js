/*! === WebRTC GUI Components === */
(function() { // Begin anonymous namespace
    var gui = mods['gui'];
    gui.create['videoWidget'] = function(options) {
        var container = jQuery('<div class="video-container"></div>');
        var video = jQuery('<video autoplay></video>');
        container.append(video);
        container.video = video;
        container.video.attachStream = function(stream) {
            video.attr('src', URL.createObjectURL(stream));
            video[0].play();
            video[0].muted = false;
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
        var rtc = mods['rtc'];
        var div = gui.elements;

        /* Local feedback, gamemaster video, and players video-group */
        var self = argo.localPlayer, gm = argo.gamemaster;
        div['rtcFeedback'] = gui.create['videoWidget'](
                                             {controls: self.controls});
        div['rtcFeedback'].addClass('big').addClass('feedback');
        self.videoContainer = div['rtcFeedback'];
        var hideFeedback = gui.create['minimizeButton'](
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
            var gmVideoSwap = gui.create['buttonWidget'](
                            {icon: 'retweet'
                           , tooltip: 'Swap with<br />Video Feedback'});
            gmVideoSwap.click(swap);
            gm.controls.prepend(gmVideoSwap);
            var selfVideoSwap = gui.create['buttonWidget'](
                                  {icon: 'retweet'
                                 , tooltip: 'Swap with<br />GM Video'});
            selfVideoSwap.click(swap);
            self.controls.prepend(selfVideoSwap);
        }
        div['rtcPlayers'] = jQuery('<div class="video-group"></div>');
        div['rtcPlayers'].addClass('pane');

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

        /* Video-Connection Control */
        var eyeButton = gui.create['buttonWidget']({icon: 'eye-open'});
        var eyeControl = gui.create['buttonWidget']({icon: 'eye-open'});
        var eyeMenu = gui.create['splitDropdownButton']({
                                                     button: eyeButton});
        function guiSoftHide() {
            rtc.softHide();
            eyeButton.addClass('text-warning');
            eyeControl.addClass('text-warning');
            eyeButton.icon.removeClass('icon-eye-open');
            eyeControl.icon.removeClass('icon-eye-open');
            eyeButton.icon.addClass('icon-eye-close');
            eyeControl.icon.addClass('icon-eye-close');
            softEye.hide();
            uneye.show();
        }
        function guiHardHide() {
            rtc.hardHide();
            eyeButton.addClass('text-error');
            eyeControl.addClass('text-error');
            eyeButton.icon.removeClass('icon-eye-open');
            eyeControl.icon.removeClass('icon-eye-open');
            eyeButton.icon.addClass('icon-eye-close');
            eyeControl.icon.addClass('icon-eye-close');
            softEye.hide();
            hardEye.hide();
            uneye.show();
        }
        function guiUnhide() {
            rtc.unhide();
            eyeButton.removeClass('text-warning');
            eyeControl.removeClass('text-warning');
            eyeButton.removeClass('text-error');
            eyeControl.removeClass('text-error');
            eyeButton.icon.removeClass('icon-eye-close');
            eyeControl.icon.removeClass('icon-eye-close');
            eyeButton.icon.addClass('icon-eye-open');
            eyeControl.icon.addClass('icon-eye-open');
            uneye.hide();
            softEye.show();
            hardEye.show();
        }
        eyeMenu.primary.addClass('btn-mini');
        eyeMenu.caret.addClass('btn-mini');
        eyeButton.append(' Hide');
        var uneye = jQuery('<a href="">Unhide</a>').hide();
        var softEye = jQuery('<a href="">Soft Hide</a>');
        var hardEye = jQuery('<a href="">Hard Hide</a>');
        eyeButton.click(function() {
            if(rtc.videoStatus == 'visible') { guiSoftHide(); }
            else { guiUnhide(); }
        });
        eyeControl.click(function() {
            if(rtc.videoStatus == 'visible') { guiSoftHide(); }
            else { guiUnhide(); }
        });
        softEye.click(function(event) {
            event.preventDefault();
            if(rtc.videoStatus == 'visible') { guiSoftHide(); }
        });
        hardEye.click(function(event) {
            event.preventDefault();
            if(rtc.videoStatus != 'disconnected') { guiHardHide(); }
        });
        uneye.click(function(event) {
            event.preventDefault();
            if(rtc.videoStatus != 'visible') { guiUnhide(); }
        });
        eyeMenu.menu.append(uneye).append(softEye).append(hardEye);
        eyeMenu.appendTo(div['mainMenu']);
        argo.localPlayer.controls.prepend(eyeControl);

        /* Audio-Connection Control */
        var muteButton = gui.create['buttonWidget']({icon: 'microphone'});
        var muteControl = gui.create['buttonWidget']({icon: 'microphone'});
        var muteMenu = gui.create['splitDropdownButton']({
                                                      button: muteButton});
       function guiSoftMute() {
            rtc.softMute();
            muteButton.addClass('text-warning');
            muteControl.addClass('text-warning');
            muteButton.icon.removeClass('icon-microphone');
            muteControl.icon.removeClass('icon-microphone');
            muteButton.icon.addClass('icon-microphone-off');
            muteControl.icon.addClass('icon-microphone-off');
            softMute.hide();
            unmute.show();
        }
        function guiHardMute() {
            rtc.hardMute();
            muteButton.addClass('text-error');
            muteControl.addClass('text-error');
            muteButton.icon.removeClass('icon-microphone');
            muteControl.icon.removeClass('icon-microphone');
            muteButton.icon.addClass('icon-microphone-off');
            muteControl.icon.addClass('icon-microphone-off');
            softMute.hide();
            hardMute.hide();
            unmute.show();
        }
        function guiUnmute() {
            rtc.unmute();
            muteButton.removeClass('text-warning');
            muteControl.removeClass('text-warning');
            muteButton.removeClass('text-error');
            muteControl.removeClass('text-error');
            muteButton.icon.removeClass('icon-microphone-off');
            muteControl.icon.removeClass('icon-microphone-off');
            muteButton.icon.addClass('icon-microphone');
            muteControl.icon.addClass('icon-microphone');
            unmute.hide();
            softMute.show();
            hardMute.show();
        }
        muteMenu.primary.addClass('btn-mini');
        muteMenu.caret.addClass('btn-mini');
        muteButton.append(' Mute');
        var unmute = jQuery('<a href="">Unmute</a>').hide();
        var softMute = jQuery('<a href="">Soft Mute</a>');
        var hardMute = jQuery('<a href="">Hard Mute</a>');
        muteButton.click(function() {
            if(rtc.audioStatus == 'audible') { guiSoftMute(); }
            else { guiUnmute(); }
        });
        muteControl.click(function() {
            if(rtc.audioStatus == 'audible') { guiSoftMute(); }
            else { guiUnmute(); }
        });
        softMute.click(function(event) {
            event.preventDefault();
            if(rtc.audioStatus == 'audible') { guiSoftMute(); }
        });
        hardMute.click(function(event) {
            event.preventDefault();
            if(rtc.audioStatus != 'disconnected') { guiHardMute(); }
        });
        unmute.click(function(event) {
            event.preventDefault();
            if(rtc.videoStatus != 'audible') { guiUnmute(); }
        });
        muteMenu.menu.append(unmute).append(softMute).append(hardMute);
        muteMenu.appendTo(div['mainMenu']);
        argo.localPlayer.controls.prepend(muteControl);
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

