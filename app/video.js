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

    function onPlay() {
        console.log('play');
        sendData('play');
    }

    function onPause() {
        console.log('pause');
        sendData('pause');
    }

    function onSeeked() {
        console.log(`seeked to ${videoElement.currentTime}`);
    }

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

});

function trace(text) {
    text = text.trim();
    const now = (window.performance.now() / 1000).toFixed(3);

    console.log(now, text);
}