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

mods['webRTC'] = new Argonaut.Module('webRTC');
(function() { // Begin anonymous namespace
    var webRTC = mods['webRTC'];
    webRTC.peers = {};

    webRTC.run = function() {
        argo.loader.update('Connecting to RTC signaler');
        var socket = io.connect(document.URL + 'rtc');
		argo.sockets.webRTC = webRTC.socket = socket;

        socket.emit('authenticate', {publicId: argo.publicId
                                   , privateId: argo.privateId});

        /* On recieve rtc-syn */
        socket.on('syn', function(data) {
            webRTC.recieveConnection(data.callerId, data.callerDesc);
        });

        /* On recieve rtc-ack */
        socket.on('ack', function(data) {
            var desc = new RTCSessionDescription(data.calleeDesc);
            webRTC.peers[data.calleeId].setRemoteDescription(desc);
        });

        /* On recieve rtc-ice */
        socket.on('ice', function(data) {
            if(data.candidateId in webRTC.peers) {
                var peer = webRTC.peers[data.candidateId];
                if('candidate' in data && data.candidate !== null) {
                    var candidate = new RTCIceCandidate(data.candidate);
                    peer.addIceCandidate(candidate);
                }
            }
        });

        return true;
    };

    /* Ask web-browser for Webcam access, load into 'video' element */
    webRTC.startVideoService = function(videoById, callback) {
        webRTC.videoById = videoById;
        navigator.getUserMedia({'audio': true, 'video': true},
            function(stream) {
                webRTC.localStream = stream;
                webRTC.localVideo = webRTC.videoById(argo.publicId);
                webRTC.localVideo.attr('src', URL.createObjectURL(stream));
                webRTC.localVideo[0].muted = true;
                callback();
            },
            function() { alert('Video capture failed'); }
        );
    };

    /* Negotiate a new WebRTC audio/video connection to 'peerId' */
    webRTC.connectToPeer = function(peerId) {
        var peer = new RTCPeerConnection(null);
        peer.onicecandidate = function(event) {
            webRTC.socket.emit('ice', {candidate: event.candidate});
        };
        peer.onaddstream = function (event) {
            var video = webRTC.videoById(peerId);
            video.attr('src', URL.createObjectURL(event.stream));
        };

        if(peerId in argo.players) {
            argo.players[peerId].rtcPeer = peer;
        }
        webRTC.peers[peerId] = peer;
        peer.addStream(webRTC.localStream);
        peer.createOffer(sendCallerDescription);
        function sendCallerDescription(desc) {
            peer.setLocalDescription(desc);
            webRTC.socket.emit('syn', {targetId: peerId
                                     , callerDesc: desc});
        }
    };

    /* Recieve a request for WebRTC audio/video connection */
    webRTC.recieveConnection = function(peerId, remote) {
        var peer = new RTCPeerConnection(null);
        peer.onicecandidate = function(event) {
            webRTC.socket.emit('ice', {candidate: event.candidate});
        };
        peer.onaddstream = function (event) {
            var video = webRTC.videoById(peerId);
            video.attr('src', URL.createObjectURL(event.stream));
        };

        if(peerId in argo.players) {
            argo.players[peerId].rtcPeer = peer;
        }
        webRTC.peers[peerId] = peer;
        peer.addStream(webRTC.localStream);
        peer.setRemoteDescription(new RTCSessionDescription(remote));
        peer.createAnswer(sendCallerDescription);
        function sendCallerDescription(desc) {
            peer.setLocalDescription(desc);
            webRTC.socket.emit('ack', {publicId: argo.publicId
                                     , privateId: argo.privateId
                                     , targetId: peerId
                                     , calleeDesc: desc});
        }
    };
})(); // Close anonymous namespace
