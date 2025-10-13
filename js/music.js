const currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
  window.location.href = 'index1.html';
}

const emotionHistoryData = JSON.parse(localStorage.getItem('emotionHistory')) || {};
const playlistContainer = document.getElementById('playlistContainer');
const musicTitle = document.getElementById('musicTitle');

const playlists = {
  happy: [
    { name: "Happy Vibes Mix", src: "https://www.youtube.com/embed/Y66j_BUCBMY" },
    { name: "Good Mood Songs", src: "https://www.youtube.com/embed/ZbZSe6N_BXs" },
    { name: "Positive Energy", src: "https://www.youtube.com/embed/cmSbXsFE3l8" },
    { name: "Joyful Beats", src: "https://www.youtube.com/embed/ru0K8uYEZWw" },
    { name: "Feel Good Hits", src: "https://www.youtube.com/embed/OPf0YbXqDm0" }
  ],
  sad: [
    { name: "Relaxing Piano", src: "https://www.youtube.com/embed/jhExwQfi28s" },
    { name: "Lofi Rain", src: "https://www.youtube.com/embed/qH2-TGUlwu4" },
    { name: "Soft Guitar", src: "https://www.youtube.com/embed/5DiMoehAeOU" },
    { name: "Emotional Calm", src: "https://www.youtube.com/embed/z7e7gtU3PHY" },
    { name: "Deep Chill", src: "https://www.youtube.com/embed/MJnk5TlmW58" }
  ],
  angry: [
    { name: "Chill & Focus", src: "https://www.youtube.com/embed/7NOSDKb0HlU" },
    { name: "Relax & Breathe", src: "https://www.youtube.com/embed/4GnVDPD01Ww" },
    { name: "Calm Down Mix", src: "https://www.youtube.com/embed/wAPCSnAhhC8" },
    { name: "LoFi Peace", src: "https://www.youtube.com/embed/21qNxnCS8WU" },
    { name: "Deep Focus", src: "https://www.youtube.com/embed/DWcJFNfaw9c" }
  ],
  surprised: [
    { name: "Energetic Vibes", src: "https://www.youtube.com/embed/1y6smkh6c-0" },
    { name: "Surprise Hits", src: "https://www.youtube.com/embed/PMivT7MJ41M" },
    { name: "Upbeat Mix", src: "https://www.youtube.com/embed/w5tWYmIOWGk" },
    { name: "Fun Mode", src: "https://www.youtube.com/embed/mWRsgZuwf_8" },
    { name: "Energy Boost", src: "https://www.youtube.com/embed/CGyEd0aKWZE" }
  ],
  fearful: [
    { name: "Meditation Calm", src: "https://www.youtube.com/embed/2OEL4P1Rz04" },
    { name: "Deep Relax", src: "https://www.youtube.com/embed/2J2XedT7dAw" },
    { name: "Mind Rest", src: "https://www.youtube.com/embed/1ZYbU82GVz4" },
    { name: "Zen Mode", src: "https://www.youtube.com/embed/1E1sL5jMiZo" },
    { name: "Breathing Peace", src: "https://www.youtube.com/embed/FAwZ2dlH2VE" }
  ],
  disgusted: [
    { name: "Focus Beats", src: "https://www.youtube.com/embed/jfKfPfyJRdk" },
    { name: "Clean Mindset", src: "https://www.youtube.com/embed/Qo5ZxNHB9jw" },
    { name: "Mind Refresh", src: "https://www.youtube.com/embed/7NOSDKb0HlU" },
    { name: "LoFi Chill", src: "https://www.youtube.com/embed/5qap5aO4i9A" },
    { name: "Mental Detox", src: "https://www.youtube.com/embed/jfKfPfyJRdk" }
  ],
  neutral: [
    { name: "Chill Lo-Fi", src: "https://www.youtube.com/embed/jfKfPfyJRdk" },
    { name: "Work Smooth", src: "https://www.youtube.com/embed/7NOSDKb0HlU" },
    { name: "Coffee Beats", src: "https://www.youtube.com/embed/5yx6BWlEVcY" },
    { name: "Calm Flow", src: "https://www.youtube.com/embed/DWcJFNfaw9c" },
    { name: "Study Mode", src: "https://www.youtube.com/embed/1ZYbU82GVz4" }
  ]
};

function getLastEmotion(user) {
  const history = emotionHistoryData[user] || [];
  if (history.length === 0) return 'neutral';
  return history[history.length - 1].emotion || 'neutral';
}

window.addEventListener('DOMContentLoaded', () => {
  const userEmotion = getLastEmotion(currentUser);

  musicTitle.textContent = `🎧 "${userEmotion}" эмоцид тохирсон дуунууд`;

  const list = playlists[userEmotion] || playlists['neutral'];

  let html = '';
  list.forEach(item => {
    html += `
      <div class="video-box">
        <h4>${item.name}</h4>
        <iframe
          width="100%"
          height="300"
          src="${item.src}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
    `;
  });

  playlistContainer.innerHTML = html;
});
