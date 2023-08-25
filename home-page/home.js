//added a preloader to the website
const load = document.querySelector(".loader");

window.addEventListener("load", function(){
    load.style.display = "none" 
})

// Getting elements from HTML
const textDiv = document.getElementById("textDiv");
const joinButton = document.getElementById("spanIcon");
const toggleMicButton = document.getElementById("toggleMic");
const toggleCameraButton = document.getElementById("toggleCamera");

let localStream;
let peerConnection;
let socket;

// Connect to the WebSocket server
function connectWebSocket() {
  socket = new WebSocket("ws://localhost:8080"); // Update with your WebSocket server URL

  socket.addEventListener("open", () => {
    console.log("WebSocket connection established");
  });

  socket.addEventListener("message", async (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "offer") {
      await handleOffer(data.offer);
    } else if (data.type === "answer") {
      await handleAnswer(data.answer);
    } else if (data.type === "iceCandidate") {
      handleIceCandidate(data.candidate);
    }
  });
}

// Create a new peer connection
function createPeerConnection() {
  peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.onicecandidate = handleIceCandidate;

  // Set up remote video display
  const remoteVideo = document.getElementById("remoteVideo");
  peerConnection.ontrack = (event) => {
    if (event.streams && event.streams[0]) {
      remoteVideo.srcObject = event.streams[0];
    }
  };
 
}


// Create an offer and send it to the remote peer
function startCall() {
   //changing the call button after call has been placed
   document.getElementById("spanIcon").style.display = "none";
   document.getElementById("spanText").style.display = "inline";
   document.getElementById("remoteVideo").style.display = "block";

  connectWebSocket();
  createPeerConnection();

  peerConnection
    .createOffer()
    .then((offer) => peerConnection.setLocalDescription(offer))
    .then(() => {
      // Send offer to the remote peer via WebSocket
      socket.send(JSON.stringify({ type: "offer", offer: peerConnection.localDescription }));
    })
    .catch((error) => console.error("Error creating offer:", error));
}

// Handle incoming offer from the remote peer
async function handleOffer(offer) {
  createPeerConnection();

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  // Create answer and send it to the remote peer
  peerConnection
    .createAnswer()
    .then((answer) => peerConnection.setLocalDescription(answer))
    .then(() => {
      // Send answer to the remote peer via WebSocket
      socket.send(JSON.stringify({ type: "answer", answer: peerConnection.localDescription }));
    })
    .catch((error) => console.error("Error creating answer:", error));
}

// Handle incoming answer from the remote peer
async function handleAnswer(answer) {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

// Handle ICE candidate events
function handleIceCandidate(candidate) {
  // Send ICE candidate to the remote peer via WebSocket
  socket.send(JSON.stringify({ type: "iceCandidate", candidate: candidate }));
}

// Initialize the app
function initApp() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localStream = stream;
      const localVideo = document.getElementById("localVideo");
      localVideo.srcObject = localStream;

      connectWebSocket();

      joinButton.addEventListener("click", startCall);
    })
    .catch((error) => {
      console.error("Error accessing media devices:", error);
    });

  // Toggle microphone
  toggleMicButton.addEventListener("click", () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        toggleMicButton.innerText = track.enabled ? "Mute" : "Unmute";
      });
    }
  });

  // Toggle camera
  toggleCameraButton.addEventListener("click", () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        toggleCameraButton.innerText = track.enabled ? "Camera Off" : "Camera On";
      });
    }
  });
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);
