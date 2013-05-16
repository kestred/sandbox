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
                jQuery.each(argo.players, function(id, player) {
                    mods['webRTC'].connectToPeer(id);
                    mods['gui'].addStatusUtilities(player);
                    mods['gui'].elements['statusList']
                                              .append(player.statusBar);
                    player.setStatus(player.status);
                });
            }
        );
        argo.onconnect = function() {};
    };
    argo.onplayerjoined = function(playerId) {
        if(playerId in argo.players) {
            var player = argo.players[playerId];
            mods['gui'].addStatusUtilities(player);
            mods['gui'].elements['statusList'].append(player.statusBar);
            player.setStatus(player.status);
        } else {
            argo.stderr('(onplayerjoined) No player with given id.');
        }
    };
    argo.onplayerleft = function(playerId) {
        if(playerId in argo.players) {
            argo.players[playerId].setStatus('disconnected');
            mods['gui'].detachVideoById(playerId);
            delete mods['webRTC'].peers[playerId];
        } else {
            argo.stderr('(onplayerleft) No player with given id.');
        }
    };
    argo.connect();
});
