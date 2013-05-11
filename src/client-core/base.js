/*! === Argonaut Base - Core Classes and Variables === */
var Argonaut = {}; // namespace for class|methods definitions & access
var argo = Argonaut; // short alias for namespace globals access

Argonaut.Tabletop = function() { this.init('tabletop'); };
Argonaut.Tabletop.prototype.constructor = Argonaut.Tabletop;
Argonaut.Tabletop.prototype.init = function(type) {
    this.type = type;
    this.status = 'created';
    this.components = [];
};
Argonaut.Tabletop.prototype.addComponent = function(component) {
    this.components.push(component);
    if(this.status == 'ready') { this.runComponent(component); }
}
Argonaut.Tabletop.prototype.runComponent = function(component) {
    component.run();
}
Argonaut.Tabletop.prototype.start = function() {
    this.status = 'loading';
    this.socket = io.connect(document.URL + '/core');
    for(var i=0; i < this.components.length; ++i) {
        this.runComponent(this.components[i]);
    }
    this.status = 'ready';
}

Argonaut.Component = function(name) { this.init('component', name); }
Argonaut.Component.prototype.constructor = Argonaut.Component;
Argonaut.Component.prototype.init = function(type, name) {
    this.type = type;
    this.name = name;
    this.hookEvents = function() {};
    this.run = function() {};
}

argo.tabletop = new Argonaut.Tabletop();
jQuery(function() { argo.tabletop.start(); });
