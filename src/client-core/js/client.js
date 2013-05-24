/*! === Client === */
// Runs position independent on page load
jQuery(function() {
    argo.connect(function() {
        mods['rtc'].startVideoService(function() {
            jQuery.each(argo.players, function(id, player) {
                mods['rtc'].connectToPeer(id);
            });
        });
    });
});
