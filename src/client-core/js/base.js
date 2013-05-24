/*! === Argonaut Base Classes === */
WEB_SOCKET_SWF_LOCATION = "/socket.io/websocket.swf";
jQuery('#loading-modal').modal({backdrop: 'static', keyboard: 'false'});
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
util.extend = function(fn, extension, options) {
    if(typeof options === 'undefined') { options = {}; }
    if('order' in options && options.order == 'prepend') {
        return function() {
            extension.apply(this, arguments);
            fn.apply(this, arguments);
        };
    } else {
        return function() {
            fn.apply(this, arguments);
            extension.apply(this, arguments);
        };
    }
};

var Argonaut = function() { this.init('argonaut'); };
Argonaut.prototype.constructor = Argonaut;
Argonaut.prototype.destroy = function() {};
Argonaut.prototype.init = function(type) {
    this.type = type;
    this.status = 'created';
    this.loader = new Argonaut.Loader();
    this.publicId = util.randomKey(16);
    this.localPlayer = new Argonaut.Player(this.publicId);
	this.localPlayer.setStatus = util.extend(
		this.localPlayer.setStatus,
		function(status) {
			argo.sockets.core.emit('status', {status: status});
		}
	);
    this.players = {};
    this.modules = {};
    this.sockets = {};
    this.gamemaster = new Argonaut.Player(null);
};
Argonaut.prototype.addModule = function(name, module) {
    if(this.modules[name]) {
        this.stderr("Module with name '" + name + "' already exists.");
    } else {
        this.modules[name] = module;
    }
}
Argonaut.prototype.start = function() {
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
        argo.loadModules();
        argo.loader.finish()
    });
    socket.on('player-joined', function(data) {
        if(!(data.id in argo.players)
           && data.id != argo.publicId) {
            argo.players[data.id] = new Argonaut.Player(data.id);
        }
    });
    socket.on('player-status', function(data) {
        if(data.playerId in argo.players) {
            argo.players[data.playerId].setStatus(data.status);
        }
    });
    socket.on('player-left', function(data) {
        if(data.id in argo.players) {
            argo.players[data.id].destroy();
            delete argo.players[data.id];
        }
    });
    socket.on('disconnect', function(data) { argo.stop(); });
    socket.on('ready', function(data) {
        if('sessionId' in argo) {
            if(data.sessionId != argo.sessionId) {
                argo.stderr('(start) Session has been disconnected\n'
                          + '\t Please reload the page.');
                argo.stop();
                return;
            }
        } else {
            argo.sessionId = data.sessionId;
        }
        socket.authenticate();
    });
    this.sockets.core = socket;
};
Argonaut.prototype.stop = function() {
    this.sockets.core.disconnect();
    // TODO: Display "Stopped" dialog
}
Argonaut.prototype.loadModules = function() {
    if(status == 'loading' || status == 'ready') { return; }
    this.status = 'loading';
    var modsListed = [];
    for(var name in this.modules) { modsListed.push(this.modules[name]); }
    var modsSorted = modsListed.sort(function(a,b) {
        return a.priority - b.priority;
    });
    function loadModule(module) {
        if(module.status != 'active') {
            if(module.status == 'waiting') {
                this.stderr('(argo.loadModules)'
                          + 'Circular dependency detected:\n'
                          + '\t Argonaut may have unexpected behavior.');
            } else {
                for(var i=0; i < module.requiredModules.length; ++i) {
                    if(module.requiredModules[i].status == 'active') {
                        module.status = 'waiting';
                        module.loadModule(module.requiredModules[i]);
                        if(module.status == 'active') { return; }
                        module.status = 'inactive';
                    }
                }
            }
            module.run();
            if(module.status != 'active') {
                argo.stderr('(argo.loadModules) Module \'' + module.name
                          + '\' may not have started properly.');
                module.status = 'active';
            }
        }
    }
    for(var i=0; i < modsSorted.length; ++i) { loadModule(modsSorted[i]); }
    this.sockets.core.emit('ready');
    this.status = 'ready';
}
Argonaut.prototype.stderr = function(message) {
    console.log("[stderr] " + message);
};

/* Player class definition */
Argonaut.Player = function(id) { this.init('player', id); };
Argonaut.Player.prototype.constructor = Argonaut.Player;
Argonaut.Player.prototype.destroy = function() {};
Argonaut.Player.prototype.init = function(type, id) {
    this.type = type;
    this.status = 'connected';
    if(id == null) {
        id = 'null';
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
Argonaut.Player.prototype.getShortName = function(name) {
    if(this.name.substr(0, 6) == 'Player') {
        return 'P-' + this.id.substr(0, 4).toUpperCase();
    } else {
        return this.name.susbtr(0, 6);
    }
};
Argonaut.Player.prototype.getLongName = function(name) {
    return this.name;
};

/* Module definition, optional variable "requiredModules" */
Argonaut.Module = function(name, priority, requiredModules) {
    this.init('module', name, priority, requiredModules);
}
Argonaut.Module.prototype.constructor = Argonaut.Module;
Argonaut.Module.prototype.destroy = function() {};
Argonaut.Module.prototype.init = function(type, name, priority, reqs) {
    if(typeof reqs === 'undefined') { reqs = []; }
    if(typeof priority === "undefined") {
        priority = Argonaut.Module.Types.RULESYSTEM;
    }
    this.type = type;
    this.name = name;
    this.requiredModules = reqs;
    this.priority = priority;
    this.status = 'inactive';
};
Argonaut.Module.prototype.run = function() { this.status = 'active'; };
Argonaut.Module.prototype.checkRequirements = function() {
    for(var i=0; i < this.requiredModules.length; ++i) {
        if(!core.modules[this.requiredModules[i]]) {
            return this.requiredModules[i];
        }
    }
};

/* Argonaut Priority Dictionary */
Argonaut.Module.Types = {
            CORE: 0
  ,   CORE_ADDON: 10
  ,   RULESYSTEM: 20
  , SETTING_PACK: 40
  ,   RULE_ADDON: 80
  ,   THEME_PACK: 100
};

/* Loader definition */
Argonaut.Loader = function() { this.init('loader'); };
Argonaut.Loader.prototype.constructor = Argonaut.Loader;
Argonaut.Loader.prototype.destroy = function() {};
Argonaut.Loader.prototype.init = function(type) {
    this.type = type;
    this.progress = 0;
    this.update = function(message, progress) {};
    this.finish = function() {};
}

var argo = new Argonaut();
var mods = argo.modules;
var priority = Argonaut.Module.Types;

/* Start Argonaut after scripts are finished loading */
jQuery(function() { argo.start(); });

/* Setup loader modal */
argo.loader.progress = 1;
argo.loader.update = function(message, progress) {
    /* Currently, counts arbitrarily as an example to see progress */
    if(!progress) { progress = 10; }
    this.progress = this.progress + progress;
    if(this.progress > 85) { this.progress = 85; }
    jQuery('#loading-message').html(message + '...');
    jQuery('#loading-progress').width(this.progress + '%');
};
argo.loader.finish = function() {
    jQuery('#loading-message').html('Loaded!');
    jQuery('#loading-progress').width('100%');
    jQuery('#loading-modal').modal('hide');
};
