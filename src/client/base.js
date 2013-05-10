var Argonaut = {}; // alias for class|library definitions & access
var argo = Argonaut; // short alias for namespace variable access

Argonaut.Tabletop = function() {
    /* "Public" variables */
    this.status = 'created';
    this.hostname = ;
    this.components = [];
};
Argonaut.Tabletop.prototype.addComponent(component) {
    this.components.push(component);
    if(this.status === 'ready') { this.runComponent(component); }
}
Argonaut.Tabletop.prototype.runComponent(component) {
    component.hookEvents(this.socket);
}
Argonaut.Tabletop.prototype.start() {
    this.status = 'loading';
    this.socket = io.connect('http://'+/* Hostname */+':6058/');
    for(var i=0; i < components.length; ++i) {
        this.loadComponent(this.components[i]);
    }
    this.status = 'ready';
}
Argonaut.Component(name) {
    this.name = name;
    this.hookEvents = function() {};
}

argo.tabletop = new Tabletop();
argo.tabletop.start();
