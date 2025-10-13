const loginBtn = document.getElementById('loginBtn');

loginBtn.addEventListener('click', async () => {
  const usersData = JSON.parse(localStorage.getItem('faceUsers')) || {};
  const usernames = Object.keys(usersData);
  if (usernames.length === 0) {
    alert("Ядаж нэг хэрэглэгч бүртгэх шаардлагатай!");
    return;
  }

  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    alert("Нүүр илрээгүй. Камерлуу харна уу!");
    return;
  }

  const labeledDescriptors = [];
  for (const name in usersData) {
    const floatDesc = new Float32Array(usersData[name].descriptor);
    labeledDescriptors.push(
      new faceapi.LabeledFaceDescriptors(name, [floatDesc])
    );
  }

  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
  const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

  if (bestMatch.label === 'unknown') {
    alert("Хэрэглэгч олдсонгүй!");
    return;
  }

  alert(`✅ ${bestMatch.label} амжилттай нэвтэрлээ!`);
  localStorage.setItem('currentUser', bestMatch.label);
  window.location.href = 'dashboard.html';
});
