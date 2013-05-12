/*! === Argonaut Base Classes === */
jQuery('#loading-modal').modal('show');
jQuery('#loading-message').html('Reading core.js ...');
jQuery('#loading-progress').width('1%');

var Argonaut = function() { this.init('argonaut'); };
Argonaut.prototype.constructor = Argonaut;
Argonaut.prototype.init = function(type) {
    this.type = type;
    this.status = 'created';
    this.modules = {};
    this.stderr = function(message) {
        console.log("[stderr] " + message);
    };
};
Argonaut.prototype.addModule = function(name, module) {
    if(this.modules[name]) {
        this.stderr("Module with name '" + name + "' already exists.");
    } else {
        this.modules[name] = module;
    }
}
Argonaut.prototype.start = function() {
    this.status = 'loading';
    this.socket = io.connect(document.URL + 'core');
    jQuery.each(this.modules,
        function(index, module) { module.run(); });
    this.status = 'ready';
};

/* Module definition, optional variables "core" and "requirements" */
Argonaut.Module = function(name, core, requiredModules) {
    this.init('module', name, core, requiredModules);
}
Argonaut.Module.prototype.constructor = Argonaut.Module;
Argonaut.Module.prototype.init = function(type, name, core, reqs) {
    this.type = type;
    this.core = core;
    this.name = name;
    this.requiredModules = reqs;
    this.run = function() {};
};
Argonaut.Module.prototype.checkRequirements = function() {
    for(var i=0; i < this.requiredModules.length; ++i) {
        if(!core.modules[this.requiredModules[i]]) {
            return this.requiredModules[i];
        }
    }
};

var argo = new Argonaut();
var mods = argo.modules;
argo.loader = {};
argo.loader.progress = 1;
argo.loader.update = function(message, progress) {
    /* Currently, counts arbitrarily as an example to see progress */
    if(!progress) { progress = 10; }
    this.progress = this.progress + progress;
    if(this.progress > 85) { this.progress = 85; }
    jQuery('#loading-message').html(message + '...');
    jQuery('#loading-progress').width(this.progress + '%');
};

