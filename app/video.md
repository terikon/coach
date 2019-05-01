# server

- connect
- disconnect

- message - just broadcasts
- create or join -> emits joined(to self)+ready(to others) or full
- ipaddr
- bye - just prints

# client

on start, emits 'create or join'

- created - isInitiator=true
- joined - isInitiator=false, creates RTCPeerConnection
- ready - creates RTCPeerConnection
- full - reloads page
- log - logs message
- ipaddr - logs
- message - signalingMessageCallback
- disconnect - just logs
- bye - reloads page if not initiator

closing page emits 'bye'

- sendMessage()
```
sendMessage({
    type: 'candidate',
    label: event.candidate.sdpMLineIndex,
    id: event.candidate.sdpMid,
    candidate: event.candidate.candidate
}

sendMessage(peerConn.localDescription)
```