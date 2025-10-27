const video = document.getElementById('video');
const loading = document.getElementById('loading');
const registerBtn = document.getElementById('registerBtn');
const usernameInput = document.getElementById('usernameInput');

let usersData = JSON.parse(localStorage.getItem('faceUsers')) || {};

async function loadModels() {
  const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
  ]);
  startVideo();
}

async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
    video.addEventListener('loadeddata', () => {
      loading.style.display = 'none';
    });
  } catch (err) {
    loading.textContent = 'Камер олдсонгүй: ' + err.message;
  }
}

registerBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  if (!username) {
    alert("Хэрэглэгчийн нэр оруулна уу!");
    return;
  }

  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    alert("Нүүр илрээгүй. Камер руу харна уу!");
    return;
  }

  if (usersData[username]) {
    alert("Энэ нэртэй хэрэглэгч аль хэдийн байна!");
    return;
  }

  usersData[username] = {
    descriptor: Array.from(detection.descriptor),
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('faceUsers', JSON.stringify(usersData));
  alert(`✅ ${username} амжилттай бүртгэгдлээ!`);
});

loadModels();
