const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const loading = document.getElementById('loading');
const dashboardUser = document.getElementById('dashboardUser');
const emotionDisplay = document.getElementById('emotionDisplay');
const adviceBox = document.getElementById('adviceBox');
const historyList = document.getElementById('emotionHistoryList');
const logoutBtn = document.getElementById('logoutBtn');

let currentUser = localStorage.getItem('currentUser');
let emotionHistoryData = JSON.parse(localStorage.getItem('emotionHistory')) || {};

if (!currentUser) {
  window.location.href = 'index1.html';
}
dashboardUser.textContent = `👤 ${currentUser}`;

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('currentUser');
});

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

video.addEventListener('play', () => {
  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;

  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  faceapi.matchDimensions(overlay, displaySize);

  async function detectEmotion() {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    if (detections) {
      const expressions = detections.expressions;
      const maxExp = Object.keys(expressions).reduce((a, b) =>
        expressions[a] > expressions[b] ? a : b
      );
      const confidence = Math.max(...Object.values(expressions));

      const { emoji, advice } = getAdviceForEmotion(maxExp);

      emotionDisplay.textContent = `${emoji} Илэрсэн эмоци: ${maxExp} (${(confidence * 100).toFixed(1)}%)`;
      adviceBox.textContent = advice;

      saveEmotionHistory(maxExp, emoji);
      renderHistory();
    }
    requestAnimationFrame(detectEmotion);
  }

  detectEmotion();
});

function getAdviceForEmotion(emotion) {
  let emoji = '😐';
  let advice = 'Тайван дундаж байна.';

  switch (emotion) {
    case 'happy':
      emoji = '😊';
      advice = 'Сэтгэгдэл сайхан байна! Ийм байгаарай.';
      break;
    case 'sad':
      emoji = '😢';
      advice = 'Гунигтай мэдрэгдэж байна. Тайвшраад дуртай зүйлээ хий.';
      break;
    case 'angry':
      emoji = '😡';
      advice = 'Ууртай байна. Гүнзгий амьсгаа аваад өөрийгөө тайвшруул.';
      break;
    case 'surprised':
      emoji = '😮';
      advice = 'Гайхсан байна! Энэ хувирал сайн зүйл байгаасай.';
      break;
    case 'fearful':
      emoji = '😨';
      advice = 'Айдастай байна. Юу ч болсон тайван бодож шийд.';
      break;
    case 'disgusted':
      emoji = '🤢';
      advice = 'Таагүй мэдрэмж байна. Түр амарч завсарла.';
      break;
    default:
      break;
  }
  return { emoji, advice };
}

function saveEmotionHistory(emotion, emoji) {
  if (!emotionHistoryData[currentUser]) {
    emotionHistoryData[currentUser] = [];
  }
  emotionHistoryData[currentUser].push({
    emotion,
    emoji,
    time: new Date().toISOString()
  });

  if (emotionHistoryData[currentUser].length > 10) {
    emotionHistoryData[currentUser].shift();
  }

  localStorage.setItem('emotionHistory', JSON.stringify(emotionHistoryData));
}

function renderHistory() {
  const userHistory = emotionHistoryData[currentUser] || [];
  if (userHistory.length === 0) {
    historyList.textContent = 'Түүх алга.';
    return;
  }

  historyList.innerHTML = '';
  userHistory
    .slice()
    .reverse()
    .forEach(item => {
      const div = document.createElement('div');
      const date = new Date(item.time);
      const hh = date.getHours();
      const mm = String(date.getMinutes()).padStart(2, '0');
      div.textContent = `${item.emoji} ${item.emotion} - ${hh}:${mm}`;
      historyList.appendChild(div);
    });
}

const startGameBtn = document.getElementById('startGameBtn');
const gameStatus = document.getElementById('gameStatus');
let gameRunning = false;
let gameTimer = null;

startGameBtn.addEventListener('click', () => {
  if (gameRunning) return;
  startTryNotToLaugh();
});

function startTryNotToLaugh() {
  gameStatus.textContent = "⏳ Тоглоом эхэллээ! Инээж болохгүй инээвэл та хожигдоно...";
  gameRunning = true;
  let timeLeft = 7;
  gameTimer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      endGame(true);
    }
  }, 7000);
}

function endGame(won) {
  clearInterval(gameTimer);
  gameRunning = false;
  if (won) {
    gameStatus.textContent = "✅ Та яллаа! Одоо инээгээгүй!";
    updateLeaderboard(currentUser, 'laugh', 1);
  } else {
    gameStatus.textContent = "❌ Та хожигдсон! Инээсэн байна 😆";
  }
}
const challengeGameBtn = document.getElementById('challengeGameBtn');
if (challengeGameBtn) {
  challengeGameBtn.addEventListener('click', () => {
    window.location.href = 'challenge.html';
  });
}
const leaderboardBtn = document.getElementById('leaderboardBtn');
const leaderboardSection = document.getElementById('leaderboardSection');
const leaderboardContent = document.getElementById('leaderboardContent');

leaderboardBtn.addEventListener('click', () => {
  leaderboardSection.classList.toggle('hidden');
  renderLeaderboard();
});

function renderLeaderboard() {
  const data = JSON.parse(localStorage.getItem('leaderboard')) || {};
  if (Object.keys(data).length === 0) {
    leaderboardContent.innerHTML = 'Одоогоор оноо алга.';
    return;
  }

  let html = `
    <table>
      <tr>
        <th>Хэрэглэгч</th>
        <th>TryNotToLaugh</th>
        <th>Challenge</th>
      </tr>
  `;

  for (const user in data) {
    const { laugh = 0, challenge = 0 } = data[user];
    html += `
      <tr>
        <td>${user}</td>
        <td>${laugh}</td>
        <td>${challenge}</td>
      </tr>
    `;
  }

  html += '</table>';
  leaderboardContent.innerHTML = html;
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
function getPrefs() {
  const key = `prefs_${currentUser}`;
  return JSON.parse(localStorage.getItem(key)) || {
    theme: 'auto',      
    threshold: 0.6,      
    difficulty: 'normal' 
  };
}

function setPrefs(p) {
  const key = `prefs_${currentUser}`;
  localStorage.setItem(key, JSON.stringify(p));
}

function getBadges() {
  const key = `badges_${currentUser}`;
  return JSON.parse(localStorage.getItem(key)) || [];
}
function addBadge(slug, label) {
  const key = `badges_${currentUser}`;
  const badges = getBadges();
  if (!badges.find(b => b.slug === slug)) {
    badges.push({ slug, label, time: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(badges));
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}
const openCC = document.getElementById('openCC');
const closeCC = document.getElementById('closeCC');
const thrSlider = document.getElementById('thrSlider');
const thrVal = document.getElementById('thrVal');
const difficultySel = document.getElementById('difficulty');
const badgesBox = document.getElementById('badgesBox');

(openCC && closeCC) && (openCC.addEventListener('click', ()=>controlCenterOpen(true)),
closeCC.addEventListener('click', ()=>controlCenterOpen(false)));

function controlCenterOpen(v) {
  const panel = document.getElementById('controlCenter');
  if (!panel) return;
  panel.classList.toggle('hidden', !v);
}

function initControlCenter() {
  const prefs = getPrefs();
  thrSlider.value = prefs.threshold;
  thrVal.textContent = prefs.threshold.toFixed(2);
  difficultySel.value = prefs.difficulty;

  document.querySelectorAll('.theme-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const theme = btn.dataset.theme;
      const p = getPrefs();
      p.theme = theme; setPrefs(p); applyTheme(theme);
    });
  });

  thrSlider.addEventListener('input', ()=>{
    thrVal.textContent = parseFloat(thrSlider.value).toFixed(2);
  });
  thrSlider.addEventListener('change', ()=>{
    const p = getPrefs();
    p.threshold = parseFloat(thrSlider.value);
    setPrefs(p);
  });

  difficultySel.addEventListener('change', ()=>{
    const p = getPrefs();
    p.difficulty = difficultySel.value;
    setPrefs(p);
  });

  badgesBox.innerHTML = '';
  getBadges().forEach(b=>{
    const span = document.createElement('span');
    span.className = 'badge';
    span.textContent = b.label;
    badgesBox.appendChild(span);
  });

  applyTheme(prefs.theme);

  const resetBtn = document.getElementById('resetData');
  resetBtn.addEventListener('click', ()=>{
    if (confirm('Бүх өгөгдлийг ( оноо, түүх, тохиргоо ) устгах уу?')) {
      localStorage.removeItem('emotionHistory');
      localStorage.removeItem('leaderboard');
      localStorage.removeItem(`prefs_${currentUser}`);
      localStorage.removeItem(`badges_${currentUser}`);
      alert('Цэвэрлэлээ!');
      window.location.reload();
    }
  });
}
initControlCenter();
loadModels();
renderHistory();
