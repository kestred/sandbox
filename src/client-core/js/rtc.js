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
    webRTC.run = function() {
        argo.loader.update('Connecting to RTC signaler');
        webRTC.socket = io.connect(document.URL + 'rtc');
		var socket = webRTC.socket;

        /* On recieve rtc-syn */
        socket.on('syn', function(data) {
            webRTC.recieveConnection(data.username, data.caller);
        });

        /* On recieve rtc-ack */
        socket.on('ack', function(data) {
            var desc = new RTCSessionDescription(data.callee);
            webRTC.peers[data.username].setRemoteDescription(desc);
        });

        /* On recieve rtc-ice */
        socket.on('ice', function(data) {
            var peer = webRTC.peers[data.username];
            if(webRTC.peer && !webRTC.peer.rtcIceSuccess) {
                webRTC.peer.rtsIceSuccess = true;
                if(data.candidate) {
                    var candidate = new RTCIceCandidate(data.candidate);
                    webRTC.peer.addIceCandidate(candidate);
                }
            }
        });

        return true;
    };

    /* Ask web-browser for Webcam access, load into 'video' element */
    webRTC.startLocalVideo = function(callback, video) {
        navigator.getUserMedia({'audio': true, 'video': true},
            function(stream) {
                webRTC.localStream = stream;
                video.src = URL.createObjectURL(stream);
                callback();
            },
            function() { alert('Video capture failed'); }
        );
    };

    /* Negotiate a new WebRTC audio/video connection to 'peername' */
    webRTC.connectToPeer = function(peername, video) {
        var peer = new RTCPeerConnection(null);
        peer.onicecandidate = function(event) {
            webRTC.socket.emit('ice', {candidate: event.candidate});
        };
        peer.onaddstream = function (event) {
            video.src = URL.createObjectURL(event.stream);
        };

        if(!webRTC.peers) { webRTC.peers = {}; }
        webRTC.peers[peername] = peer;
        peer.addStream(webRTC.localStream);
        peer.createOffer(sendCallerDescription);
        function sendCallerDescription(desc) {
            peer.setLocalDescription(desc);
            webRTC.socket.emit('syn',
                    {username: peername, caller: desc});
        }
    };

    /* Recieve a request for WebRTC audio/video connection */
    webRTC.recieveConnection = function(peername, video, remote) {
        var peer = new RTCPeerConnection(null);
        peer.onicecandidate = function(event) {
            webRTC.socket.emit('ice', {candidate: event.candidate});
        };
        peer.onaddstream = function (event) {
            video.src = URL.createObjectURL(event.stream);
        };

        if(!webRTC.peers) { webRTC.peers = {}; }
        webRTC.peers[peername] = peer;
        peer.addStream(webRTC.localStream);
        peer.setRemoteDescription(new RTCSessionDescription(remote));
        peer.createAnswer(sendCallerDescription);
        function sendCallerDescription(desc) {
            peer.setLocalDescription(desc);
            webRTC.socket.emit('ack',
                    {username: peername, callee: desc});
        }
    };
})(); // Close anonymous namespace
