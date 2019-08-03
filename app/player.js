'use strict';

const skipSwitchLayout = false;

const useRTC = false;

const urlParams = new URLSearchParams(window.location.search);

const mode = urlParams.get('mode'); // student or teacher
if (mode !== 'student' && mode !== 'teacher') {
    console.log(`INVALID MODE ${mode}`);
}

const extensionID = urlParams.get('extensionID');
var workoutName = urlParams.get('workout');

window.addEventListener('load', async () => {

    /** @type HTMLVideoElement */
    const videoElement = document.querySelector('.video');
    /** @type HTMLDivElement */
    const infoboxElement = document.querySelector('#infobox');
    /** @type HTMLButtonElement */
    const buttonNext = document.querySelector('#buttonNext');
    /** @type HTMLInputElement */
    const checkboxCycle = document.querySelector('#checkboxCycle');

    if (mode === 'teacher') {
        videoElement.muted = true;
    }

    document.addEventListener('myCustomEvent', ev => {
        console.log(`myCustomEvent arrived ${JSON.stringify(ev.detail)}`);
    });

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

    let workout = await loadWorkout(workoutName);
    let workoutIndex = -1;

    buttonNext.addEventListener('click', () => {
        workoutIndex = nextWorkout(workout, workoutIndex);
    });

    videoElement.addEventListener('play', onPlay);
    videoElement.addEventListener('pause', onPause);
    videoElement.addEventListener('seeking', onSeeking);
    videoElement.addEventListener('seeked', onSeeked);
    videoElement.addEventListener('timeupdate', onTimeUpdate);

    let userInitiated = true;

    function onPlay() {
        if (userInitiated) {
            console.log('play');
            sendData({ command: 'play', currentTime: videoElement.currentTime });
        }
        userInitiated = true;
    }

    function onPause() {
        if (userInitiated) {
            console.log('pause');
            sendData({ command: 'pause', currentTime: videoElement.currentTime });
        }
        userInitiated = true;
    }

    function onSeeking() {
        seeking = true;
    }

    function onSeeked() {
        workoutIndex = getWorkoutIndex(workout, videoElement.currentTime);
        if (userInitiated) {
            console.log(`seeked to ${videoElement.currentTime}`);
            sendData({ command: 'seek', currentTime: videoElement.currentTime, playerPaused: videoElement.paused });
        }
        userInitiated = seeking;
        seeking = false;
    }

    function onData(event) {
        console.log(`Received data: ${event.data}`);
        var data = typeof(event.data) === 'string' ? JSON.parse(event.data) : event.data;

        userInitiated = false;

        switch (data.command) {
            case 'settings':
                setSettings(data.settings);
            case 'play':
                videoElement.currentTime = data.currentTime;
                videoElement.play();
                break;
            case 'pause':
                videoElement.pause();
                videoElement.currentTime = data.currentTime;
                break;
            case 'seek':
                if (data.playerPaused && !videoElement.playerPaused) videoElement.pause();
                if (!data.playerPaused && videoElement.playerPaused) videoElement.play();
                videoElement.currentTime = data.currentTime;
                break;
            case 'layout':
                if (mode === 'student') {
                    const layout = data.layout;
                    displayInfobox(`layout: ${layout}`);
                    switch (layout) {
                        case 'group':
                            videoElement.muted = false;
                            hangountsMuteMyself(true, 'Student.*');
                            switchScreenLayout(mode, 'video');
                            break;
                        case 'Student - 1':
                        case 'Student - 2':
                        case 'Student - 3':
                            // who am I? - ask layout extension
                            whoAmI().then(response => {
                                const me = response.layout;
                                console.log(`Me is ${me}`);
                                if (layout === me) {
                                    videoElement.muted = true;
                                    hangountsMuteMyself(false, layout);
                                    switchScreenLayout(mode, 'teacher');
                                } else {
                                    videoElement.muted = false;
                                    hangountsMuteMyself(true, 'Student.*');
                                    switchScreenLayout(mode, 'video');
                                }
                            });
                            break;
                        default:
                            videoElement.muted = false;
                            hangountsMuteMyself(true, 'Student.*');
                            break;
                    }
                }
                break;
        }        
    }

    window.onData = onData; // for debugging

    function hangountsMuteMyself(mute, titleRegex) {
        sendData({ command: 'hangountsMuteMyself', mute: mute, titleRegex: titleRegex }, true);
    }

    function whoAmI() {
        return sendData({ command: 'whoAmI' }, true);
    }

    function switchScreenLayout(mode, layout) {
        if (skipSwitchLayout) return;
        sendData({ command: 'switchScreenLayout', mode: mode, layout: layout }, true);
    }

    // will resolve to promise with response, in case request has response
    function sendData(data, local) {
        return new Promise(resolve => {

            let serialized = JSON.stringify(data);
            console.log(`Sending data ${local ? 'locally' : 'remotely'} ${serialized}`);

            if (!useRTC) {
                if (!local) socket.emit('player', serialized);
                if (chrome && local) {
                    chrome.runtime.sendMessage(extensionID, data, response => {
                        if (chrome.runtime.lastError) {
                            console.log(`Could not connect to extension`);
                        }
                        resolve(response);
                        return;
                    });
                } else {
                    resolve();
                }
                return;
            }

            if (!dataChannel) {
                trace('Connection has not been initiated. ' + 'Get two peers in the same room first');
                resolve();
                return;
            } else if (dataChannel.readyState === 'closed') {
                trace('Connection was lost. Peer closed the connection.');
                resolve();
                return;
            }

            dataChannel.send(serialized);

            resolve();
            
        });
    }



    var configuration = {
      'iceServers': [{
        'urls': 'stun:stun.l.google.com:19302'
      }]
    };
    //let configuration = null;

    var socket = io.connect();
    let isInitiator = false;

    var room = window.location.hash.substring(1);
    if (!room) {
        //room = window.location.hash = randomToken();
        room = window.location.hash = "room1";
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
        //alert('Room ' + room + ' is full. We will create a new room for you.');
        //window.location.hash = '';
        //window.location.reload();
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
            //window.location.reload();
        }
    });

    if (!useRTC) {
        socket.on('player', data => {
            let event = new Event('player');
            event.data = data;
            onData(event);
        });
    }

    window.addEventListener('unload', function () {
        console.log(`Unloading window. Notifying peers in ${room}.`);
        //socket.emit('bye', room);
    });

    const switchLayoutToStudent = layout => {
        sendData({ command: 'layout', layout: layout });
        hangountsMuteMyself(true, 'Student.*'); // mute all
        hangountsMuteMyself(false, layout); // unmute active student
    };

    const switchLayout = layout => {
        if (layout === 'group') {
            sendData({ command: 'layout', layout: 'group' });
            hangountsMuteMyself(true, 'Student.*');
        } else {
            switchLayoutToStudent(layout);    
        }
    }

    window.switchLayout = switchLayout; // for debugging

    let windowHeight = window.innerHeight;
    let windowWidth = window.innerWidth;

    window.addEventListener('resize', function (event) {
        if (mode === 'student') {
            // Will toggle audio if size changes for 1 px

            // let newWindowHeight = window.outerHeight;
            // let newWindowWidth = window.outerWidth;
        
            // if (Math.abs(newWindowHeight - windowHeight) === 1 || Math.abs(newWindowWidth - windowWidth) === 1) {
            //     videoElement.muted = !videoElement.muted;
            // }

            // windowHeight = newWindowHeight;
            // windowWidth = newWindowWidth;
        } else if (mode === 'teacher') {
            const width = window.outerWidth;
            
            if (width % 10 === 0) {
                switchLayout('group');
            } else if (width % 10 === 1) {
                switchLayout('Student - 1');
            } else if (width % 10 === 2) {
                switchLayout('Student - 2');
            } else if (width % 10 === 3) {
                switchLayout('Student - 3');
            }

            
        }
    });

    function sendMessage(message) {
        console.log('Client sending message: ', message);
        socket.emit('message', message);
    }

    var peerConn;
    var dataChannel;

    function signalingMessageCallback(message) {
        if (useRTC) {
            if (message.type === 'offer') {
                console.log('Got offer. Sending answer to peer.');
                peerConn.setRemoteDescription(new RTCSessionDescription(message), function () { },
                    trace);
                peerConn.createAnswer(onLocalSessionCreated, trace);

            } else if (message.type === 'answer') {
                console.log('Got answer.');
                peerConn.setRemoteDescription(new RTCSessionDescription(message), function () { },
                    trace);

            } else if (message.type === 'candidate') {
                peerConn.addIceCandidate(new RTCIceCandidate({
                    candidate: message.candidate
                }));
            }
        }
    }

    function createPeerConnection(isInitiator, config) {
        if (!useRTC) return;

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

    function displayInfobox(msg) {
        infoboxElement.innerHTML = msg;
        // infoboxElement.classList.remove('on');
        // setTimeout(() => {
        //     infoboxElement.classList.add('on');    
        // }, 0);
    }

    async function loadWorkout(workoutName) {
        if (!workoutName) return;

        const jsonName = `workouts/${workoutName}.json`;

        const response = await fetch(jsonName);
        const workout = await response.json();
        
        videoElement.src = `workouts/${workout.fileName}`;

        workout.timing = workout.timing.map(x => (
            {
                start: moment.duration(x.start).asSeconds(),
                end: moment.duration(x.end).asSeconds(),
                cycle: moment.duration(x.cycle).asSeconds()
            }
        )).sort((a, b) => a.end - b.end);

        return workout;
    }

    function nextWorkout(workout, workoutIndex) {
        if (workoutIndex < 0) return workoutIndex;

        const currentTime = videoElement.currentTime;
        let nextTime;
        if (!workout.timing[workoutIndex + 1]) {
            nextTime = workout.timing[workoutIndex].end;
        } else {
            workoutIndex += 1;
            nextTime = workout.timing[workoutIndex].start;
        }
        videoElement.currentTime = nextTime;
        return workoutIndex;
    }

    function getWorkoutIndex(workout, time) {
        time = time + 0.00001; // epsilon that in case [a,b] and [b,c], b will return second workout.
        return workout.timing.findIndex(t => t.start <= time && t.end >= time);
    }

    var settings = {
        shouldCycle: true
    };
    var seeking = true;
    function onTimeUpdate() {
        if (seeking || !userInitiated) return;
        if (settings.shouldCycle) {
            if (workoutIndex >= 0) {
                const currentTime = videoElement.currentTime;
                const currentWorkout = workout.timing[workoutIndex];
                if (currentTime > currentWorkout.end) {
                    userInitiated = false;
                    videoElement.currentTime = currentWorkout.cycle;
                }
            }
        } else {
            workoutIndex = getWorkoutIndex(workout, videoElement.currentTime);
        }
    }
    
    setSettings(settings);
    checkboxCycle.addEventListener('change', function() {
        settings.shouldCycle = this.checked;
        updateSettings(settings);
    });

    function setSettings(newSettings) {
        settings = newSettings;
        checkboxCycle.checked = newSettings.shouldCycle;
    }

    function updateSettings(newSettings) {
        setSettings(newSettings);
        sendData({ command: 'settings', settings: newSettings });
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