
const video = document.getElementById("video");
const startbutton = document.getElementById("start-button");

const statusElement = document.getElementById("status");
const bodyElement = document.getElementById("main-out");

let canvas = null;
let run = null;
let intervalRun = null;
const alarmAudio = document.getElementById("alarm-audio")
const drowsyAudio = document.getElementById("drowsy-audio")

let localStream;


Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
faceapi.nets.faceRecognitionNet.loadFromUri('./models'),

]).then(console.log("Everything set!"))


function startVideo() {
  console.log("startVideo")
  let mediaDevice=navigator.mediaDevices
    if (!mediaDevice || !mediaDevice.getUserMedia) {
      alert("Camera not supported.");
    return;
    }
    mediaDevice.getUserMedia({ video: true, audio: false })
    .then((stream) => {
      localStream = stream;
      video.srcObject = stream;

    })
    .catch((err) => {
      console.error(`An error occurred: ${err}`);
    });
}



function compute(one, two) {
  return Math.sqrt(Math.pow(one._x - two._x, 2) + Math.pow(one._y - two._y, 2))
}


function blinkedL(a, b, c, f, e, d) {
  const up = compute(b, d) + compute(c, e)
  const down = compute(a, f)
  const ratio = up / (2.0 * down)

if (ratio > 0.30180612477512125) {
    return 2;
  } else {
    return 0;
  }
}


function blinkedR(a, b, c, f, e, d) {
  const up = compute(b, d) + compute(c, e)
  const down = compute(a, f)
  const ratio = up / (2.0 * down)
if (ratio > 0.30413958388747586) {
    return 2;
  } else {
    return 0;
  }
}




function yawn(a, b, c, d, e, f, g, h) {
  const den = compute(a, e)
  const num = compute(b, h) + compute(c, g) + compute(d, f)
  const ratio = num / (3.0 * den)
  if (ratio >= 0.41) {
    return 2
  }
  else {
    return 0
  }
}


video.addEventListener("play", () => {

   
  let sleep = 0;
  let drowsy = 0;
  let active = 0;
  intervalRun = setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video,
      new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    const landmarks = detections[0].landmarks._positions;

    const ratioL = blinkedL(landmarks[36], landmarks[37],
      landmarks[38], landmarks[39], landmarks[40], landmarks[41])
    const ratioR = blinkedR(landmarks[42], landmarks[43],
      landmarks[44], landmarks[45], landmarks[46], landmarks[47])

    const yawnned = yawn(landmarks[60], landmarks[61], landmarks[62], landmarks[63], landmarks[64], landmarks[65],
      landmarks[66], landmarks[67])
    let status = "Active";
    if (yawnned == 2) {
      sleep = 0;
      drowsy += 1;
      active = 0;
      if (drowsy > 10) {
        status = "Drowsy";
        console.log(status)
        statusElement.textContent = status
        statusElement.style.backgroundColor = "Orange";
        statusElement.style.border = "Orange";
        statusElement.style.paddingLeft = "23vw";
        statusElement.style.paddingRight = "23vw";
        bodyElement.style.backgroundColor = "Orange";
        drowsyAudio.play()
      }

    } else if (ratioL == 0 && ratioR == 0) {
      sleep += 1;
      drowsy = 0;
      active = 0;
      if (sleep > 15) {
        status = "Sleeping!!";
        console.log(status)
        statusElement.textContent = status
        statusElement.style.backgroundColor = "rgb(254, 39, 39)";
        statusElement.style.border = "rgb(254, 39, 39)";
        statusElement.style.paddingLeft = "19.5vw";
        statusElement.style.paddingRight = "19.5vw";
        bodyElement.style.backgroundColor = "rgb(254, 39, 39)";
        alarmAudio.play()
      }

    } else {
      sleep = 0;
      drowsy = 0;
      active += 1;
      if (active > 5) {
        status = "Active";
        console.log(status)
        statusElement.textContent = status
        statusElement.style.backgroundColor = "greenyellow";
        statusElement.style.border = "greenyellow";
        bodyElement.style.backgroundColor = "greenyellow";
        statusElement.style.paddingLeft = "25vw";
        statusElement.style.paddingRight = "25vw";
      }
    }
  }, 100)
})


startbutton.addEventListener("click", () => {
  if (run == null) {
    startVideo()
    run = true;
    startbutton.textContent = "Stop";
    startbutton.style.paddingLeft="4vw";
    startbutton.style.paddingRight="4vw";
  } else {
    startbutton.textContent = "Start";
    statusElement.textContent = "Drowsiness Detector"
    statusElement.style.paddingLeft="2vw";
    statusElement.style.paddingRight="2vw";
    statusElement.style.backgroundColor = "rgb(47, 227, 255)";
    statusElement.style.border = "rgb(47, 227, 255)";
    bodyElement.style.backgroundColor = "rgb(47, 227, 255)";
    statusElement.style.fontSize = "6vw";
    clearInterval(intervalRun);
    video.srcObject = null;
    run = null;
    localStream.getTracks()[0].stop();
  }
})


