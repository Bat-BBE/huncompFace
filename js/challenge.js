const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const loading = document.getElementById('loading');

const startChallengeBtn = document.getElementById('startChallengeBtn');
const taskTitle = document.getElementById('taskTitle');
const timerBox = document.getElementById('timerBox');
const scoreBox = document.getElementById('scoreBox');

let currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
  window.location.href = 'index1.html';
}

let emotionsList = ['😊 happy', '😢 sad', '😡 angry', '😮 surprised', '😨 fearful', '🤢 disgusted', '😐 neutral'];
let currentTask = null;
let score = 0;
let round = 0;
let maxRounds = 5;
let gameRunning = false;
let timerInterval = null;

async function loadModels() {
  const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
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
startChallengeBtn.addEventListener('click', () => {
  if (gameRunning) return;
  startChallenge();
});

function startChallenge() {
  score = 0;
  round = 0;
  gameRunning = true;
  startChallengeBtn.style.display = 'none';
  scoreBox.textContent = `Оноо: ${score}`;
  nextRound();
}

function nextRound() {
  if (round >= maxRounds) {
    endGame();
    return;
  }
  round++;
  currentTask = emotionsList[Math.floor(Math.random() * emotionsList.length)];
  taskTitle.textContent = `Илэрхийл: ${currentTask.toUpperCase()} гаргана уу!!!`; 
  let timeLeft = 6;
  timerBox.textContent = `Үлдсэн хугацаа: ${timeLeft}с`;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerBox.textContent = `Үлдсэн хугацаа: ${timeLeft}с`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      nextRound();
    }
  }, 1000);
}

video.addEventListener('play', () => {
  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;

  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  faceapi.matchDimensions(overlay, displaySize);

  async function detect() {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    if (detections && gameRunning && currentTask) {
      const exp = detections.expressions;
      const maxExp = Object.keys(exp).reduce((a, b) =>
        exp[a] > exp[b] ? a : b
      );

      if (maxExp === currentTask) {
        score++;
        scoreBox.textContent = `Оноо: ${score}`;
        clearInterval(timerInterval);
        nextRound();
      }
    }
    requestAnimationFrame(detect);
  }

  detect();
});

function endGame() {
  gameRunning = false;
  taskTitle.textContent = `Дууслаа! Нийт оноо: ${score}/${maxRounds}`;
  updateLeaderboard(currentUser, 'challenge', score);
  timerBox.textContent = '';
  startChallengeBtn.style.display = 'block';
  startChallengeBtn.textContent = 'Дахин тоглох';
}
function updateLeaderboard(username, gameKey, newScore) {
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || {};
  if (!leaderboard[username]) {
    leaderboard[username] = { laugh: 0, memory: 0, challenge: 0 };
  }
  if (newScore > leaderboard[username][gameKey]) {
    leaderboard[username][gameKey] = newScore;
  }

  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

loadModels();
