/*! === Client === */
jQuery(function() {
    argo.loader.update('Loading components', 4);
    argo.start();

    jQuery('#loading-message').html('Loaded!');
    jQuery('#loading-progress').width('100%');
    jQuery('#loading-modal').modal('hide');
});
