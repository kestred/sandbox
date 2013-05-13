/*! === Client === */
// Runs position independent on page load
jQuery(function() {
    argo.loader.update('Loading components', 4);
    argo.start();

    jQuery('#loading-message').html('Loaded!');
    jQuery('#loading-progress').width('100%');

    mods['webRTC'].startLocalVideo(
        mods['gui'].elements['rtcFeedback'].videoElement,
        function() { jQuery('#loading-modal').modal('hide'); }
    );
});
