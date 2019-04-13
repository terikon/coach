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

    const servers = null; // Allows for RTC server configuration.

    // Create peer connections and add behavior.
    localPeerConnection = new RTCPeerConnection(servers);
    trace('Created local peer connection object localPeerConnection.');
    localPeerConnection.addEventListener('icecandidate', handleConnection);
    localPeerConnection.addEventListener('iceconnectionstatechange', handleConnectionChange);

    //localPeerConnection.addStream();

    remotePeerConnection = new RTCPeerConnection(servers);
    trace('Created remote peer connection object remotePeerConnection.');
    remotePeerConnection.addEventListener('icecandidate', handleConnection);
    remotePeerConnection.addEventListener('iceconnectionstatechange', handleConnectionChange);

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