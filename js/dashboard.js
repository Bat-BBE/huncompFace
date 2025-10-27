// ==== DOM ====
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const loading = document.getElementById('loading');
const dashboardUser = document.getElementById('dashboardUser');
const emotionDisplay = document.getElementById('emotionDisplay');
const adviceBox = document.getElementById('adviceBox');
const historyList = document.getElementById('emotionHistoryList');

const leaderboardBtn = document.getElementById('leaderboardBtn');
const leaderboardSection = document.getElementById('leaderboardSection');
const leaderboardContent = document.getElementById('leaderboardContent');

const logoutBtn = document.getElementById('logoutBtn');

// Control Center
const thrSlider = document.getElementById('thrSlider');
const thrVal = document.getElementById('thrVal');
const difficultySel = document.getElementById('difficulty');
const badgesBox = document.getElementById('badgesBox');

// ==== State ====
let currentUser = localStorage.getItem('currentUser');
let emotionHistoryData = JSON.parse(localStorage.getItem('emotionHistory')) || {};
let detectLoopReq = null;

// ==== Guards ====
if (!currentUser) {
  window.location.href = 'index1.html';
}
dashboardUser.textContent = `👤 ${currentUser}`;

// ==== Storage helpers ====
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
    renderBadges(); // refresh
  }
}

// ==== Theme ====
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}
function markActiveTheme(theme) {
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

// ==== Logout ====
logoutBtn?.addEventListener('click', () => {
  localStorage.removeItem('currentUser');
});

// ==== Control Center Init ====
function initControlCenterInline() {
  const prefs = getPrefs();

  // Theme buttons
  markActiveTheme(prefs.theme);
  applyTheme(prefs.theme);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = getPrefs();
      p.theme = btn.dataset.theme;
      setPrefs(p);
      applyTheme(p.theme);
      markActiveTheme(p.theme);
    });
  });

  // Threshold slider
  thrSlider.value = prefs.threshold;
  thrVal.textContent = Number(prefs.threshold).toFixed(2);
  thrSlider.addEventListener('input', () => {
    thrVal.textContent = parseFloat(thrSlider.value).toFixed(2);
  });
  thrSlider.addEventListener('change', () => {
    const p = getPrefs();
    p.threshold = parseFloat(thrSlider.value);
    setPrefs(p);
  });

  // Difficulty
  difficultySel.value = prefs.difficulty;
  difficultySel.addEventListener('change', () => {
    const p = getPrefs();
    p.difficulty = difficultySel.value;
    setPrefs(p);
  });

  // Badges render
  renderBadges();

  // Reset
  document.getElementById('resetData')?.addEventListener('click', () => {
    if (confirm('Бүх өгөгдлийг (оноо, түүх, тохиргоо) устгах уу?')) {
      localStorage.removeItem('emotionHistory');
      localStorage.removeItem('leaderboard');
      localStorage.removeItem(`prefs_${currentUser}`);
      localStorage.removeItem(`badges_${currentUser}`);
      alert('Цэвэрлэлээ!');
      window.location.reload();
    }
  });
}

function renderBadges() {
  badgesBox.innerHTML = '';
  getBadges().forEach(b => {
    const span = document.createElement('span');
    span.className = 'badge';
    span.textContent = b.label;
    badgesBox.appendChild(span);
  });
}

// ==== Emotion tips ====
function getAdviceForEmotion(emotion) {
  let emoji = '😐';
  let advice = 'Тайван дундаж байна.';
  switch (emotion) {
    case 'happy':     emoji = '😊'; advice = 'Сэтгэл сайхан! Ийм байгаарай.'; break;
    case 'sad':       emoji = '😢'; advice = 'Гунигтай. Дуртай зүйлээ хий, амар.'; break;
    case 'angry':     emoji = '😡'; advice = 'Ууртай. Гүн амьсгаа аваад тайвшир.'; break;
    case 'surprised': emoji = '😮'; advice = 'Гайхсан! Сайн зүйл байгаасай.'; break;
    case 'fearful':   emoji = '😨'; advice = 'Айдастай. Тайван бодоод шийд.'; break;
    case 'disgusted': emoji = '🤢'; advice = 'Таагүй. Богинохон завсарлага ав.'; break;
  }
  return { emoji, advice };
}

// ==== History ====
function saveEmotionHistory(emotion, emoji) {
  if (!emotionHistoryData[currentUser]) emotionHistoryData[currentUser] = [];
  emotionHistoryData[currentUser].push({ emotion, emoji, time: new Date().toISOString() });
  if (emotionHistoryData[currentUser].length > 10) emotionHistoryData[currentUser].shift();
  localStorage.setItem('emotionHistory', JSON.stringify(emotionHistoryData));
}
function renderHistory() {
  const userHistory = emotionHistoryData[currentUser] || [];
  if (userHistory.length === 0) {
    historyList.textContent = 'Түүх алга.';
    return;
  }
  historyList.innerHTML = '';
  userHistory.slice().reverse().forEach(item => {
    const div = document.createElement('div');
    const date = new Date(item.time);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    div.textContent = `${item.emoji} ${item.emotion} — ${hh}:${mm}`;
    historyList.appendChild(div);
  });
}

// ==== Leaderboard ====
leaderboardBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  leaderboardSection.classList.toggle('hidden');
  renderLeaderboard();
});
function updateLeaderboard(username, gameKey, newScore) {
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || {};
  if (!leaderboard[username]) leaderboard[username] = { laugh: 0, challenge: 0 };
  if (newScore > (leaderboard[username][gameKey] || 0)) {
    leaderboard[username][gameKey] = newScore;
  }
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}
function renderLeaderboard() {
  const data = JSON.parse(localStorage.getItem('leaderboard')) || {};
  if (Object.keys(data).length === 0) {
    leaderboardContent.innerHTML = 'Одоогоор оноо алга.';
    return;
  }
  let html = `
    <table>
      <tr><th>Хэрэглэгч</th><th>TryNotToLaugh</th><th>Challenge</th></tr>
  `;
  for (const user in data) {
    const { laugh = 0, challenge = 0 } = data[user];
    html += `<tr><td>${user}</td><td>${laugh}</td><td>${challenge}</td></tr>`;
  }
  html += '</table>';
  leaderboardContent.innerHTML = html;
}

// ==== Games ====
const startGameBtn = document.getElementById('startGameBtn');
const gameStatus = document.getElementById('gameStatus');
const challengeGameBtn = document.getElementById('challengeGameBtn');

let gameRunning = false;
let gameCountdownTimer = null;
let emotionLaughDetected = false;

startGameBtn?.addEventListener('click', () => {
  if (gameRunning) return;
  startTryNotToLaugh();
});

function startTryNotToLaugh() {
  const prefs = getPrefs();
  let seconds = (prefs.difficulty === 'easy') ? 12 : (prefs.difficulty === 'hard') ? 6 : 9;

  gameRunning = true;
  emotionLaughDetected = false;
  gameStatus.textContent = `⏳ Тоглоом эхэллээ! ${seconds} сек тэсээрэй…`;

  clearInterval(gameCountdownTimer);
  gameCountdownTimer = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      endGame(!emotionLaughDetected); // инээгээгүй бол ялна
    } else {
      gameStatus.textContent = `⏳ Үлдсэн: ${seconds} сек`;
    }
  }, 1000);
}

function endGame(won) {
  clearInterval(gameCountdownTimer);
  gameRunning = false;
  if (won) {
    gameStatus.textContent = "✅ Та яллаа! Инээгээгүй!";
    updateLeaderboard(currentUser, 'laugh', 1);
    addBadge('steel-face', 'Steel Face 😐');
  } else {
    gameStatus.textContent = "❌ Та хожигдсон! Инээсэн байна 😆";
  }
}

challengeGameBtn?.addEventListener('click', () => {
  window.location.href = 'challenge.html';
});

// ==== Face API ====
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

  // Lightweight loop with rAF
  const loop = async () => {
    const prefs = getPrefs();
    const thr = Number(prefs.threshold) || 0.6;

    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    if (detections?.expressions) {
      // draw box/landmarks (optional minimal)
      const resized = faceapi.resizeResults(detections, displaySize);
      faceapi.draw.drawDetections(overlay, resized);

      const expressions = detections.expressions;
      const entries = Object.entries(expressions);
      entries.sort((a, b) => b[1] - a[1]);
      const [maxExp, confidence] = entries[0];

      // only update UI if passes threshold
      if (confidence >= thr) {
        const { emoji, advice } = getAdviceForEmotion(maxExp);
        emotionDisplay.textContent = `${emoji} Илэрсэн эмоци: ${maxExp} (${(confidence * 100).toFixed(1)}%)`;
        adviceBox.textContent = advice;

        saveEmotionHistory(maxExp, emoji);
        renderHistory();

        // Game hook: if laughing detected, mark loss
        if (gameRunning && (maxExp === 'happy' || maxExp === 'surprised') && confidence >= Math.max(thr, 0.8)) {
          emotionLaughDetected = true;
          endGame(false);
        }

        // fun badges
        if (maxExp === 'happy' && confidence > 0.95) addBadge('sunny', 'Sunny 😊');
        if (maxExp === 'angry' && confidence > 0.9) addBadge('rage-proof', 'Rage Proof 💢');
      } else {
        emotionDisplay.textContent = `😐 Итгэлцүүр хүрээгүй (${(confidence * 100).toFixed(1)}%)`;
      }
    }
    detectLoopReq = requestAnimationFrame(loop);
  };
  loop();
});

// ==== Boot ====
(function boot() {
  initControlCenterInline();
  loadModels();
  renderHistory();
})();
