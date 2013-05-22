/*! === Argonaut Base Classes === */
WEB_SOCKET_SWF_LOCATION = "/socket.io/websocket.swf";
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
    this.loader = new Argonaut.Loader();
    this.publicId = util.randomKey(16);
    this.localPlayer = new Argonaut.Player(this.publicId);
    this.players = {};
    this.modules = {};
    this.sockets = {};
    this.gamemaster = new Argonaut.Player(null);
    this.onconnect = function() {};
    this.onplayerleft = function(id) {};
    this.onplayerjoined = function(id) {};
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
    socket.on('authenticate', function(data) {
        if(data.status == 'fail') {
            argo.stderr('Server connection failed. Retrying ...');
            socket.authenticate();
        } else {
            argo.privateId = data.privateId;
            socket.emit('sessionInfo');
        }
    });
    socket.on('sessionInfo', function(data) {
        if(data.gamemaster == argo.localPlayerId
           && data.gamemaster != null) {
            argo.gamemaster = argo.localPlayer;
        } else {
            argo.gamemaster = new Argonaut.Player(data.gamemaster);
        }
        for(var i=0; i < data.players.length; ++i) {
            var player = new Argonaut.Player(data.players[i]);
            argo.players[data.players[i]] = player;
        }
        argo.status = 'connected';
        argo.onconnect();
    });
    socket.on('player-joined', function(data) {
        if(!(data.id in argo.players)
           && data.id != argo.publicId) {
            argo.players[data.id] = new Argonaut.Player(data.id);
            argo.onplayerjoined(data.id);
        }
    });
    socket.on('player-status', function(data) {
        if(data.id in argo.players) {
            argo.players[data.id].setStatus(data.status);
        }
    });
    socket.on('player-left', function(data) {
        argo.onplayerleft(data.id);
    });
    socket.on('ready', function() { socket.authenticate(); });
    this.sockets.core = socket;
};
Argonaut.prototype.loadModules = function() {
    this.status = 'loading';
    jQuery.each(this.modules, function(index, module) { module.run(); });
    this.sockets.core.emit('ready');
    this.status = 'ready';
}
Argonaut.prototype.stderr = function(message) {
    console.log("[stderr] " + message);
};

/* Player class definition */
Argonaut.Player = function(id) { this.init('player', id); };
Argonaut.Player.prototype.constructor = Argonaut.Player;
Argonaut.Player.prototype.init = function(type, id) {
    this.type = type;
    this.status = 'connected';
    if(id == null) {
        id = "null";
        this.status = 'disconnected';
    }
    this.id = id;
    this.name = 'Player' + id.substr(0, 4).toUpperCase();
};
Argonaut.Player.prototype.setName = function(name) {
    this.name = name;
};
Argonaut.Player.prototype.setStatus = function(status) {
    this.status = status;
};

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

