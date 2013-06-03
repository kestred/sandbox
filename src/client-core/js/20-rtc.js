/*! === WebRTC Component === */
/* Fetch functions from vendor-specific aliases */
window.RTCPeerConnection = window.RTCPeerConnection
                        || window.webkitRTCPeerConnection
                        || window.mozRTCPeerConnection;
window.RTCSessionDescription = window.RTCSessionDescription
                            || window.webkitRTCSessionDescription
                            || window.mozRTCSessionDescription;
window.RTCIceCandidate = window.RTCIceCandidate
                      || window.webkitRTCIceCandidate
                      || window.mozRTCIceCandidate;
navigator.getUserMedia = navigator.getUserMedia
                      || navigator.webkitGetUserMedia
                      || navigator.mozGetUserMedia;

mods['rtc'] = new Argonaut.Module('rtc', priority.CORE, 'gui');
(function() { // Begin anonymous namespace
    var rtc = mods['rtc'];
    rtc.start = util.extend(rtc.start, function() {
        argo.loader.update('Starting video conferencing');
        rtc.peers = {};
        rtc.sdpConstraints = {'mandatory': {
                              'OfferToReceiveAudio': true,
                              'OfferToReceiveVideo': true }};
        rtc.iceServers = {iceServers:
                          [{url: 'stun:stun.l.google.com:19302'}]};
        rtc.useVideo = true;
        rtc.useAudio = true;
        rtc.videoStatus = 'visible';
        rtc.audioStatus = 'audible';
        rtc.requestLocalVideo();
        var socket = io.connect(document.URL + 'rtc');
		argo.sockets.rtc = rtc.socket = socket;

        socket.emit('authenticate', {publicId: argo.publicId
                                   , privateId: argo.privateId});

        /* On recieve rtc-syn */
        socket.on('syn', function(data) {
            console.log('recieved syn');
            rtc.recieveConnection(data.callerId, data.callerDesc);
        });

        /* On recieve rtc-ack */
        socket.on('ack', function(data) {
            console.log('recieved ack');
            var desc = new RTCSessionDescription(data.calleeDesc);
            rtc.peers[data.calleeId].setRemoteDescription(desc);
        });

        /* On recieve rtc-ice */
        socket.on('ice', function(data) {
            console.log('recieved ice');
            if(data.candidateId in rtc.peers) {
                var peer = rtc.peers[data.candidateId];
                console.log('candidate in peers');
                if('candidate' in data && data.candidate !== null) {
                    console.log(data.candidate);
                    var candidate = new RTCIceCandidate(data.candidate);
                    peer.addIceCandidate(candidate);
                }
            }
        });

        /* On player-soft-mute request */
        socket.on('mute', function(data) {
            if(data.playerId in argo.players) {
                var player = argo.players[data.playerId];
                player.videoContainer.video[0].muted = true;
                player.videoContainer.video.softMute = true;
            }
        });

        /* On player-unmute request */
        socket.on('unmute', function(data) {
            if(data.playerId in argo.players) {
                var player = argo.players[data.playerId];
                player.videoContainer.video[0].muted = false;
                player.videoContainer.video.softMute = false;
            }
        });

        /* On player-soft-hide request */
        socket.on('hide', function(data) {
            if(data.playerId in argo.players) {
                var player = argo.players[data.playerId];
                player.videoContainer.screen.show();
                player.videoContainer.video.softHide = true;
            }
        });

        /* On player-soft-unhide request */
        socket.on('unhide', function(data) {
            if(data.playerId in argo.players) {
                var player = argo.players[data.playerId];
                player.videoContainer.screen.hide();
                player.videoContainer.video.softHide = false;
            }
        });

        /* On player-joined, send rtc-synchronize packaet */
        var proto = Argonaut.Player.prototype;
        proto.init = util.extend(proto.init, function() {
            console.log('Connecting: '+this.id);
            rtc.connectToPeer(this.id);
        });
        proto.destroy = util.extend(proto.destroy, function() {
            delete this['rtcPeer'];
            delete rtc.peers[this.id];
        });

		/* Create peerConnection objects for existing players */
		for(var id in argo.players) { rtc.createPeerConnection(id); }

        return true;
    }, {order: 'prepend'});
    rtc.stop = util.extend(rtc.stop, function() {
        var p = Argonaut.Player.prototype;
        p.init = util.baseFn(p.init);
        p.destroy = util.baseFn(p.init);
        for(var id in rtc.peers) { rtc.peers[id].close(); }
        rtc.peers = null;
        if(rtc.socket.connected) { rtc.socket.disconnect(); }
        rtc.socket = null;
        rtc.localVideo.remove();
        rtc.localVideo = null;
        rtc.localStream = null;
    }, {order: 'prepend'});


    /* Ask web-browser for Webcam access, load into 'video' element */
    rtc.requestLocalVideo = function(callback) {
        constraints = {'video': rtc.useVideo, 'audio': rtc.useAudio};
        navigator.getUserMedia(constraints,
            function(stream) {
                if('localStream' in rtc) { rtc.localStream.stop(); }
                rtc.localStream = stream;
                rtc.localVideo = argo.localPlayer.videoContainer.video;
                rtc.localVideo.attachStream(stream);
                rtc.localVideo[0].muted = true;
                if(typeof callback !== 'undefined') { callback(); }
                for(var id in argo.players) {
                	if(!rtc.peers[id].getLocalStreams().length) {
                		rtc.peers[id].addStream(stream)
                	}
                }
            },
            // TODO: Generate blank localStream on fail
            function() { argo.stderr('(requestLocalVideo)'
                                   + 'Video capture failed'); }
        );
    };

    rtc.unmute = function() {
        rtc.audioStatus = 'audible';
        if(!rtc.useAudio) {
            rtc.useAudio = true;
            rtc.requestLocalVideo(function() {
                for(var id in argo.players) {
                    rtc.connectToPeer(id);
                }
            });
        } else { rtc.socket.emit('unmute'); }
    }
    rtc.softMute = function() {
        if(rtc.useAudio) {
            rtc.audioStatus = 'muted';
            rtc.socket.emit('mute');
        }
    }
    rtc.hardMute = function() {
        if(rtc.useAudio) {
            rtc.useAudio = false;
            rtc.audioStatus = 'disconnected';
            rtc.requestLocalVideo(function() {
                for(var id in argo.players) {
                    rtc.connectToPeer(id);
                }
            });
        }
    }
    rtc.unhide = function() {
        rtc.videoStatus = 'visible';
        if(!rtc.useVideo) {
            rtc.useVideo = true;
            rtc.requestLocalVideo(function() {
                for(var id in argo.players) {
                    rtc.connectToPeer(id);
                }
            });
        } else { rtc.socket.emit('unhide'); }
    }
    rtc.softHide = function() {
        if(rtc.useVideo) {
            rtc.videoStatus = 'hidden';
            rtc.socket.emit('hide');
        }
    }
    rtc.hardHide = function() {
        if(rtc.useVideo) {
            rtc.useVideo = false;
            rtc.videoStatus = 'disconnected';
            rtc.requestLocalVideo(function() {
                for(var id in argo.players) {
                    rtc.connectToPeer(id);
                }
            });
        }
    }

    rtc.getVideoById = function(id) {
        if(id == argo.localPlayer.id) {
            return argo.localPlayer.videoContainer.video;
        } else if(id == argo.gamemaster.id) {
            return argo.gamemaster.videoContainer.video;
        } else if(id in argo.players) {
            return argo.players[id].videoContainer.video;
        } else {
            argo.stderr('(rtc.getVideoById) No player with id: ' + id);
            return jQuery('<video>');
        }
    };


    rtc.createPeerConnection = function(peerId) {
        var peer = new RTCPeerConnection(rtc.iceServers);
        peer.onicecandidate = function(event) {
            rtc.socket.emit('ice', {candidate: event.candidate});
        };
        peer.onaddstream = function (event) {
            var video = rtc.getVideoById(peerId);
            video.attachStream(event.stream);
        };
        if(peerId in argo.players) {
            argo.players[peerId].rtcPeer = peer;
        }
        rtc.peers[peerId] = peer;
        peer.playerId = peerId;
        if('localStream' in rtc) { peer.addStream(rtc.localStream); }
        return peer;
    }
    /* Negotiate a new WebRTC audio/video connection to 'peerId' */
    rtc.connectToPeer = function(peer) {
        if(!('localStream' in rtc)) {
            setTimeout(function() {
                rtc.connectToPeer(peer);
            }, 500);
            return;
        }
        peer.createOffer(sendCallerDescription, null, rtc.sdpConstraints);
        function sendCallerDescription(desc) {
            peer.setLocalDescription(desc);
            rtc.socket.emit('syn', {targetId: peer.playerId
                                     , callerDesc: desc});
        }
    };

    /* Recieve a request for WebRTC audio/video connection */
    rtc.recieveConnection = function(peer, remote) {
        if(!('localStream' in rtc)) {
            setTimeout(function() {
                rtc.recieveConnection(peer, remote);
            }, 500);
            return;
        }
        peer.setRemoteDescription(new RTCSessionDescription(remote));
        peer.createAnswer(sendCalleeDescription, null, rtc.sdpConstraints);
        function sendCalleeDescription(desc) {
            peer.setLocalDescription(desc);
            rtc.socket.emit('ack', {publicId: argo.publicId
                                     , privateId: argo.privateId
                                     , targetId: peer.playerId
                                     , calleeDesc: desc});
        }
    };
})(); // Close anonymous namespace
