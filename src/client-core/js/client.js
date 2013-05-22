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
                    mods['gui'].elements['statusList'].list
                                              .append(player.statusBar);
                    player.setStatus(player.status);
                });
				mods['gui'].resizeAfter();
            }
        );
        argo.onconnect = function() {};
    };
    argo.onplayerjoined = function(playerId) {
        if(playerId in argo.players) {
            var player = argo.players[playerId];
            mods['gui'].addStatusUtilities(player);
            mods['gui'].elements['statusList'].list
											  .append(player.statusBar);
            player.setStatus(player.status);
			mods['gui'].resizeAfter();
        } else {
            argo.stderr('(onplayerjoined) No player with given id.');
        }
    };
    argo.onplayerleft = function(playerId) {
        if(playerId in argo.players) {
            argo.players[playerId].setStatus('disconnected');
			mods['gui'].detachVideoById(playerId);
            // TODO, detach after timeout, grey-out before-hand
            argo.players[playerId].closeTimeout = setTimeout(
				function() {
					argo.players[playerId].statusBar.remove();
					delete mods['webRTC'].peers[playerId];
					delete argo.players[playerId];
					mods['gui'].resizeAfter();
				}
			, 4000);
        } else {
            argo.stderr('(onplayerleft) No player with given id.');
        }
    };
    argo.connect();
});
