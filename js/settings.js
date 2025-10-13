const currentUser = localStorage.getItem('currentUser');
const settingsUser = document.getElementById('settingsUser');
const musicPrefSelect = document.getElementById('musicPreference');
const adviceTypeSelect = document.getElementById('adviceType');
const saveBtn = document.getElementById('saveSettingsBtn');

let usersData = JSON.parse(localStorage.getItem('faceUsers')) || {};

if (!currentUser) {
  window.location.href = 'index.html';
} else {
  settingsUser.textContent = currentUser;
}

function loadUserSettings() {
  if (!usersData[currentUser]) return;

  const prefs = usersData[currentUser].preferences || {
    music: 'relaxing',
    advice: 'motivational'
  };

  musicPrefSelect.value = prefs.music;
  adviceTypeSelect.value = prefs.advice;
}

saveBtn.addEventListener('click', () => {
  if (!usersData[currentUser]) return;

  usersData[currentUser].preferences = {
    music: musicPrefSelect.value,
    advice: adviceTypeSelect.value
  };

  localStorage.setItem('faceUsers', JSON.stringify(usersData));
  alert("✅ Тохиргоо амжилттай хадгалагдлаа!");
});

loadUserSettings();
