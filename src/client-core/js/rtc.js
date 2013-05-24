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
    rtc.peers = {};

    rtc.run = util.extend(rtc.run, function() {
        argo.loader.update('Starting video conferencing');
        rtc.requestLocalVideo();
        var socket = io.connect(document.URL + 'rtc');
		argo.sockets.rtc = rtc.socket = socket;

        socket.emit('authenticate', {publicId: argo.publicId
                                   , privateId: argo.privateId});

        /* On recieve rtc-syn */
        socket.on('syn', function(data) {
            rtc.recieveConnection(data.callerId, data.callerDesc);
        });

        /* On recieve rtc-ack */
        socket.on('ack', function(data) {
            var desc = new RTCSessionDescription(data.calleeDesc);
            rtc.peers[data.calleeId].setRemoteDescription(desc);
        });

        /* On recieve rtc-ice */
        socket.on('ice', function(data) {
            if(data.candidateId in rtc.peers) {
                var peer = rtc.peers[data.candidateId];
                if('candidate' in data && data.candidate !== null) {
                    var candidate = new RTCIceCandidate(data.candidate);
                    peer.addIceCandidate(candidate);
                }
            }
        });

        /* On player-joined, send rtc-synchronize packaet */
        var proto = Argonaut.Player.prototype;
        proto.init = util.extend(proto.init, function() {
            rtc.connectToPeer(this.id);
        });
        proto.destroy = util.extend(proto.destroy, function() {
            delete this['rtcPeer'];
            delete rtc.peers[this.id];
        });
        return true;
    }, {order: 'prepend'});

    /* Ask web-browser for Webcam access, load into 'video' element */
    rtc.requestLocalVideo = function() {
        navigator.getUserMedia({'audio': true, 'video': true},
            function(stream) {
                rtc.localStream = stream;
                rtc.localVideo = argo.localPlayer.videoContainer.video;
                rtc.localVideo.attachStream(stream);
                rtc.localVideo[0].muted = true;
            },
            // TODO: Generate blank localStream on fail
            function() { argo.stderr('(requestLocalVideo)'
                                   + 'Video capture failed'); }
        );
    };

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

    /* Negotiate a new WebRTC audio/video connection to 'peerId' */
    rtc.connectToPeer = function(peerId) {
        if(!('localStream' in rtc)) {
            setTimeout(function() {
                rtc.connectToPeer(peerId);
            }, 500);
            return;
        }
        var peer = new RTCPeerConnection(null);
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
        peer.addStream(rtc.localStream);
        peer.createOffer(sendCallerDescription);
        function sendCallerDescription(desc) {
            peer.setLocalDescription(desc);
            rtc.socket.emit('syn', {targetId: peerId
                                     , callerDesc: desc});
        }
    };

    /* Recieve a request for WebRTC audio/video connection */
    rtc.recieveConnection = function(peerId, remote) {
        if(!('localStream' in rtc)) {
            setTimeout(function() {
                rtc.recieveConnection(peerId, remote);
            }, 500);
            return;
        }
        var peer = new RTCPeerConnection(null);
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
        peer.addStream(rtc.localStream);
        peer.setRemoteDescription(new RTCSessionDescription(remote));
        peer.createAnswer(sendCallerDescription);
        function sendCallerDescription(desc) {
            peer.setLocalDescription(desc);
            rtc.socket.emit('ack', {publicId: argo.publicId
                                     , privateId: argo.privateId
                                     , targetId: peerId
                                     , calleeDesc: desc});
        }
    };
})(); // Close anonymous namespace
