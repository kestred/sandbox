

/* Root object of atropos, represents the client's tabletop (the app) */
function Tabletop() {
    /* Public (aka. Reliable) variables */
    this.status = 'created';
    this.hostname = ;
    this.components = [];
}
function Component(name) {
    this.name = name;
    this.hookEvents = function() {};
}
Tabletop.prototype.addComponent(component) {
    this.components.push(component);
    if(this.status === 'ready') { this.runComponent(component); }
}
Tabletop.prototype.runComponent(component) {
    component.hookEvents(this.socket);
}
Tabletop.prototype.start() {
    this.status = 'loading';
    this.socket = io.connect('http://'+/* Hostname */+':6058/');
    for(var i=0; i < components.length; ++i) {
        this.loadComponent(this.components[i]);
    }
    this.status = 'ready';
}

var atropos = new Tabletop();
atropos.start();
