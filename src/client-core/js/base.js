/*! === Argonaut Base Classes === */
jQuery('#loading-modal').modal('show');
jQuery('#loading-message').html('Reading core.js ...');
jQuery('#loading-progress').width('1%');

var util = {};
util.randomKey = function(length) {
    var str = '';
    while(str.length < length) {
        str += Math.floor((Math.random()*16)).toString(16);
    }
    return str.substr(0, length);
}

var Argonaut = function() { this.init('argonaut'); };
Argonaut.prototype.constructor = Argonaut;
Argonaut.prototype.init = function(type) {
    this.type = type;
    this.status = 'created';
    this.loader = new Argnaut.Loader();
    this.publicId = util.randomKey(16);
    this.modules = {};
    this.sockets = {};
    this.players = {};
    this.onconnect = function() {};
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
Argonaut.prototype.connect = function() {
    this.status = 'connecting';
    this.loader.update('Connecting to server', 4);
    var argo = this, socket = io.connect(document.URL + 'core');
    socket.authenticate = function() {
        socket.emit('authenticate', {publicId: argo.publicId});
    };
    socket.on('ready', function() { socket.authenticate(); });
    socket.on('authenticate', function(data) {
        if(data.status == 'fail') {
            argo.stderr('Server connection failed. Retrying ...');
            argo.publicId = util.randomKey(16);
            socket.emit('authenticate', {publicId: argo.publicId});
        } else {
            argo.privateId = data.privateId;
            socket.emit('sessionInfo', {publicId: argo.publicId
                                      , privateId: argo.privateId});
        }
    });
    socket.on('sessionInfo', function(data) {
        argo.gamemaster = data.gamemaster;
        argo.players = data.players;
        argo.status = 'connected';
        argo.onconnect();
    });
    this.sockets.core = socket;
};
Argonaut.prototype.loadModules = function() {
    this.status = 'loading';
    jQuery.each(this.modules, function(index, module) { module.run(); });
    this.status = 'ready';
}

/* Module definition, optional variables "core" and "requiredMods" */
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

/* Loader definition */
Argonaut.Loader = function() { this.init('loader'); };
Argonaut.Loader.prototype.constructor = Argonaut.Loader;
Argonaut.Loader.prototype.init = function(type) {
    this.type = type;
    this.progress = 0;
    this.update = function(message, progress) {};
}


var argo = new Argonaut();
var mods = argo.modules;
argo.loader.progress = 1;
argo.loader.update = function(message, progress) {
    /* Currently, counts arbitrarily as an example to see progress */
    if(!progress) { progress = 10; }
    this.progress = this.progress + progress;
    if(this.progress > 85) { this.progress = 85; }
    jQuery('#loading-message').html(message + '...');
    jQuery('#loading-progress').width(this.progress + '%');
};

