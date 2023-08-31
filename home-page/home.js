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

    if (data.type === "call") {
      const { callerId, calleeId } = parsedData;
      // Find the callee's socket based on their ID
    const calleeSocket = findCalleeSocketById(calleeId);
    
    if (calleeSocket) {
      // Send an alert to the callee
      calleeSocket.send(JSON.stringify({ type: "callAlert" }));
    }

    }

    if (data.type === "callAlert") {
      // Show an alert to the callee
      alert("You are being called!");
  }

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
function startCall(userId) {
   //changing the call button after call has been placed
   const callButton = document.querySelector(`.call-button[data-user-id="${userId}"]`);
   callButton.style.display = "none";

    const hangUpButton = document.querySelector(`.hang-up-button[data-user-id="${userId}"]`);
   hangUpButton.style.display = "block";

  

   document.getElementById("remoteVideo").style.display = "block";

  connectWebSocket();
  createPeerConnection();

  socket.addEventListener("open", () => {
    peerConnection
      .createOffer()
      .then((offer) => peerConnection.setLocalDescription(offer))
      .then(() => {
        // Send offer to the remote peer via WebSocket
        socket.send(JSON.stringify({ type: "offer", offer: peerConnection.localDescription }));
      })
      .catch((error) => console.error("Error creating offer:", error));
  });

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

// Hang up the call and clean up resources
function hangUp(userId) {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  // Close the local stream
  if (localStream) {
    localStream.getTracks().forEach(track => {
      track.stop();
    });
    localStream = null;
  }

  // Hide remote video
  const remoteVideo = document.getElementById("remoteVideo");
  remoteVideo.style.display = "none";


 //changing the hang up button after call has been ended
 const callButton = document.querySelector(`.call-button[data-user-id="${userId}"]`);
 callButton.style.display = "block";

  const hangUpButton = document.querySelector(`.hang-up-button[data-user-id="${userId}"]`);
 hangUpButton.style.display = "none";


  // Send hang-up signal to the remote peer
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "hangUp" }));
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initApp();

 // Call Button click event
 const callButtons = document.querySelectorAll(".call-button");
 callButtons.forEach((button) => {
   button.addEventListener("click", () => {
     const userId = button.getAttribute("data-user-id");

     // Notify the callee through the WebSocket
    socket.send(JSON.stringify({ type: "call", callerId: 10, calleeId: userId }));

     alert(`Calling user with ID ${userId}`);

      // Show the video screen when call button is pressed
      document.getElementById("video-screen").style.display = "block";
      
     startCall(userId);
   });
 });

 // Hang up button click event
 const hangUpButtons = document.querySelectorAll(".hang-up-button");
  hangUpButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const userId = button.getAttribute("data-user-id");
      hangUp(userId);
  });
 });
});