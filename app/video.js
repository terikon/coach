'use strict';

window.addEventListener('load', () => {

    let videoElement = document.querySelector('.video');

    videoElement.addEventListener('dragover', function (ev) {
        ev.preventDefault();
    });

    videoElement.addEventListener('drop', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        console.log('drop ' + JSON.stringify(this));

        let file = [...ev.dataTransfer.items].find(x => x.kind === 'file').getAsFile();
        console.log('... file.name = ' + file.name);

        // https://www.w3schools.com/tags/ref_av_dom.asp

        videoElement.src = URL.createObjectURL(file);
    });

    videoElement.addEventListener('play', onPlay);
    videoElement.addEventListener('pause', onPause);
    videoElement.addEventListener('seeked', onSeeked);

    let userInitiated = true;

    function onPlay() {
        if (userInitiated) {
            console.log('play');
            sendData({ command: 'play' });
        }
        userInitiated = true;
    }

    function onPause() {
        if (userInitiated) {
            console.log('pause');
            sendData({ command: 'pause' });
        }
        userInitiated = true;
    }

    function onSeeked() {
        if (userInitiated) {
            console.log(`seeked to ${videoElement.currentTime}`);
            sendData({ command: 'seek', currentTime: videoElement.currentTime });
        }
        userInitiated = true;
    }

    function onData(event) {
        console.log(`Received data: ${event.data}`);
        var data = JSON.parse(event.data);

        userInitiated = false;

        switch (data.command) {
            case 'play':
                videoElement.play();
                break;
            case 'pause':
                videoElement.pause();
                break;
            case 'seek':
                videoElement.currentTime = data.currentTime;
                break;
        }        
    }

    function sendData(data) {
        console.log(`Sending data ${data}`);

        if (!dataChannel) {
            trace('Connection has not been initiated. ' + 'Get two peers in the same room first');
            return;
        } else if (dataChannel.readyState === 'closed') {
            trace('Connection was lost. Peer closed the connection.');
            return;
        }

        dataChannel.send(JSON.stringify(data));
    }



    // var configuration = {
    //   'iceServers': [{
    //     'urls': 'stun:stun.l.google.com:19302'
    //   }]
    // };
    let configuration = null;

    let socket = io.connect();
    let isInitiator = false;

    var room = window.location.hash.substring(1);
    if (!room) {
        room = window.location.hash = randomToken();
    }

    socket.on('ipaddr', function (ipaddr) {
        console.log('Server IP address is: ' + ipaddr);
        // updateRoomURL(ipaddr);
    });

    socket.on('created', function (room, clientId) {
        console.log('Created room', room, '- my client ID is', clientId);
        isInitiator = true;
        //grabWebCamVideo();
    });

    socket.on('joined', function (room, clientId) {
        console.log('This peer has joined room', room, 'with client ID', clientId);
        isInitiator = false;
        createPeerConnection(isInitiator, configuration);
        //grabWebCamVideo();
    });

    socket.on('full', function (room) {
        alert('Room ' + room + ' is full. We will create a new room for you.');
        window.location.hash = '';
        window.location.reload();
    });

    socket.on('ready', function () {
        console.log('Socket is ready');
        createPeerConnection(isInitiator, configuration);
    });

    socket.on('log', function (array) {
        console.log.apply(console, array);
    });

    socket.on('message', function (message) {
        console.log('Client received message:', message);
        signalingMessageCallback(message);
    });

    // Joining a room.
    socket.emit('create or join', room);

    if (location.hostname.match(/localhost|127\.0\.0/)) {
        socket.emit('ipaddr');
    }

    // Leaving rooms and disconnecting from peers.
    socket.on('disconnect', function (reason) {
        console.log(`Disconnected: ${reason}.`);
        //sendBtn.disabled = true;
        //snapAndSendBtn.disabled = true;
    });

    socket.on('bye', function (room) {
        console.log(`Peer leaving room ${room}.`);
        //sendBtn.disabled = true;
        //snapAndSendBtn.disabled = true;
        // If peer did not create the room, re-enter to be creator.
        if (!isInitiator) {
            window.location.reload();
        }
    });

    window.addEventListener('unload', function () {
        console.log(`Unloading window. Notifying peers in ${room}.`);
        socket.emit('bye', room);
    });

    function sendMessage(message) {
        console.log('Client sending message: ', message);
        socket.emit('message', message);
    }

    var peerConn;
    var dataChannel;

    function signalingMessageCallback(message) {
        if (message.type === 'offer') {
            console.log('Got offer. Sending answer to peer.');
            peerConn.setRemoteDescription(new RTCSessionDescription(message), function () {},
                trace);
            peerConn.createAnswer(onLocalSessionCreated, trace);

        } else if (message.type === 'answer') {
            console.log('Got answer.');
            peerConn.setRemoteDescription(new RTCSessionDescription(message), function () {},
                trace);

        } else if (message.type === 'candidate') {
            peerConn.addIceCandidate(new RTCIceCandidate({
                candidate: message.candidate
            }));

        }
    }

    function createPeerConnection(isInitiator, config) {
        console.log('Creating Peer connection as initiator?', isInitiator, 'config:', config);
        peerConn = new RTCPeerConnection(config);

        // send any ice candidates to the other peer
        peerConn.onicecandidate = function (event) {
            console.log('icecandidate event:', event);
            if (event.candidate) {
                sendMessage({
                    type: 'candidate',
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                });
            } else {
                console.log('End of candidates.');
            }
        };

        if (isInitiator) {
            console.log('Creating Data Channel');
            dataChannel = peerConn.createDataChannel('photos');
            onDataChannelCreated(dataChannel);

            console.log('Creating an offer');
            peerConn.createOffer(onLocalSessionCreated, trace);
        } else {
            peerConn.ondatachannel = function (event) {
                console.log('ondatachannel:', event.channel);
                dataChannel = event.channel;
                onDataChannelCreated(dataChannel);
            };
        }
    }

    function onLocalSessionCreated(desc) {
        console.log('local session created:', desc);
        peerConn.setLocalDescription(desc, function () {
            console.log('sending local desc:', peerConn.localDescription);
            sendMessage(peerConn.localDescription);
        }, trace);
    }

    function onDataChannelCreated(channel) {
        console.log('onDataChannelCreated:', channel);

        channel.onopen = function () {
            console.log('CHANNEL opened!!!');
            //sendBtn.disabled = false;
            //snapAndSendBtn.disabled = false;
        };

        channel.onclose = function () {
            console.log('Channel closed.');
            //sendBtn.disabled = true;
            //snapAndSendBtn.disabled = true;
        }

        channel.onmessage = onData;
    }

    /*

    if (location.hostname !== 'localhost') {
        requestTurn(
            'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
        );
    }

    function requestTurn(turnURL) {
        var turnExists = false;
        for (var i in pcConfig.iceServers) {
            if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
                turnExists = true;
                turnReady = true;
                break;
            }
        }
        if (!turnExists) {
            console.log('Getting TURN server from ', turnURL);
            // No TURN server. Get one from computeengineondemand.appspot.com:
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var turnServer = JSON.parse(xhr.responseText);
                    console.log('Got TURN server: ', turnServer);
                    pcConfig.iceServers.push({
                        'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
                        'credential': turnServer.password
                    });
                    turnReady = true;
                }
            };
            xhr.open('GET', turnURL, true);
            xhr.send();
        }
    }

    const servers = null; // Allows for RTC server configuration.
    const pcConstraint = null;
    const dataConstraint = null;
    let receiveChannel;

    // Create peer connections and add behavior.
    let localPeerConnection = new RTCPeerConnection(servers, pcConstraint);
    localPeerConnection.addEventListener('icecandidate', handleConnection);
    localPeerConnection.addEventListener('iceconnectionstatechange', handleConnectionChange);
    trace('Created local peer connection object localPeerConnection.');
    let sendChannel = localPeerConnection.createDataChannel('sendDataChannel', dataConstraint);
    sendChannel.addEventListener('open', onSendChannelStateChange);
    sendChannel.addEventListener('close', onSendChannelStateChange);
    trace('Created send data channel');

    //localPeerConnection.addStream();

    let remotePeerConnection = new RTCPeerConnection(servers, pcConstraint);
    trace('Created remote peer connection object remotePeerConnection.');
    remotePeerConnection.addEventListener('icecandidate', handleConnection);
    remotePeerConnection.addEventListener('iceconnectionstatechange', handleConnectionChange);
    remotePeerConnection.addEventListener('datachannel', receiveChannelCallback);

    localPeerConnection.createOffer().then(
        gotDescription1,
        onCreateSessionDescriptionError
    );

    function sendData(data) {
        sendChannel.send(data);
        trace('Sent Data: ' + data);
    }

    function closeDataChannels() {
        trace('Closing data channels');
        sendChannel.close();
        trace('Closed data channel with label: ' + sendChannel.label);
        receiveChannel.close();
        trace('Closed data channel with label: ' + receiveChannel.label);
        localPeerConnection.close();
        remotePeerConnection.close();
        localPeerConnection = null;
        remotePeerConnection = null;
        trace('Closed peer connections');
    }

    function handleConnection(event) {
        const peerConnection = event.target;
        const iceCandidate = event.candidate;

        if (iceCandidate) {
            const newIceCandidate = new RTCIceCandidate(iceCandidate);
            const otherPeer = getOtherPeer(peerConnection);

            otherPeer.addIceCandidate(newIceCandidate)
                .then(() => {
                    handleConnectionSuccess(peerConnection);
                }).catch((error) => {
                    handleConnectionFailure(peerConnection, error);
                });

            trace(`${getPeerName(peerConnection)} ICE candidate:\n${event.candidate.candidate}.`);
        }
    }

    function handleConnectionSuccess(peerConnection) {
        trace(`${getPeerName(peerConnection)} addIceCandidate success.`);
    };

    // Logs that the connection failed.
    function handleConnectionFailure(peerConnection, error) {
        trace(`${getPeerName(peerConnection)} failed to add ICE Candidate:\n${error.toString()}.`);
    }

    function handleConnectionChange(event) {
        const peerConnection = event.target;
        console.log('ICE state change event: ', event);
        trace(`${getPeerName(peerConnection)} ICE state: ${peerConnection.iceConnectionState}.`);
    }

    function onSendChannelStateChange() {
        var readyState = sendChannel.readyState;
        trace(`Send channel state is: ${readyState}`);
        if (readyState === 'open') {
            //dataChannelSend.disabled = false;
            //dataChannelSend.focus();
            //sendButton.disabled = false;
            //closeButton.disabled = false;
        } else {
            //dataChannelSend.disabled = true;
            //sendButton.disabled = true;
            //closeButton.disabled = true;
        }
    }

    function gotDescription1(desc) {
        localPeerConnection.setLocalDescription(desc);
        trace(`Offer from localPeerConnection \n${desc.sdp}`);
        remotePeerConnection.setRemoteDescription(desc);
        remotePeerConnection.createAnswer().then(
            gotDescription2,
            onCreateSessionDescriptionError
        );
    }

    function gotDescription2(desc) {
        remotePeerConnection.setLocalDescription(desc);
        trace(`Answer from remotePeerConnection \n${desc.sdp}`);
        localPeerConnection.setRemoteDescription(desc);
    }

    function onCreateSessionDescriptionError(error) {
        trace(`Failed to create session description: ${error.toString()}`);
    }

    function receiveChannelCallback(event) {
        trace('Receive Channel Callback');
        receiveChannel = event.channel;
        receiveChannel.addEventListener('message', onReceiveMessageCallback);
        receiveChannel.addEventListener('open', onReceiveChannelStateChange);
        receiveChannel.addEventListener('close', onReceiveChannelStateChange);
    }

    function onReceiveMessageCallback(event) {
        trace(`Received Message: ${event.data}`);
        //dataChannelReceive.value = event.data;
    }

    function onReceiveChannelStateChange() {
        var readyState = receiveChannel.readyState;
        trace(`Receive channel state is: ${readyState}`);
    }

    function getPeerName(peerConnection) {
        return (peerConnection === localPeerConnection) ? 'localPeerConnection' : 'remotePeerConnection';
    }

    function getOtherPeer(peerConnection) {
        return (peerConnection === localPeerConnection) ? remotePeerConnection : localPeerConnection;
    }
*/
});

function trace(text) {
    if (!text) return;
    if (typeof err === 'string') text = text.trim();
    const now = (window.performance.now() / 1000).toFixed(3);

    console.log(now, text);
}

function randomToken() {
    return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}