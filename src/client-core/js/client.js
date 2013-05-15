/*! === Client === */
// Runs position independent on page load
jQuery(function() {
    argo.onconnect = function() {
        argo.loadModules();
        jQuery('#loading-message').html('Loaded!');
        jQuery('#loading-progress').width('100%');
    };
    argo.connect();

    mods['webRTC'].startLocalVideo(
        mods['gui'].elements['rtcFeedback'].videoElement,
        function() { jQuery('#loading-modal').modal('hide'); }
    );
});
