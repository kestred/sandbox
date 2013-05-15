/*! === Client === */
// Runs position independent on page load
jQuery(function() {
    argo.onconnect = function() {
        argo.loadModules();
        jQuery('#loading-message').html('Loaded!');
        jQuery('#loading-progress').width('100%');

        mods['webRTC'].startVideoService(
            mods['gui'].getVideoById,
            function() {
                jQuery('#loading-modal').modal('hide');
                jQuery.each(argo.players, function(index, player) {
                    mods['webRTC'].connectToPeer(player);
                });
            }
        );
        argo.onconnect = function() {};
    };
    argo.connect();
});
