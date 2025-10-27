function showToast(message, type = "info", duration = 4000) {
  const toastContainer = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  
  toast.classList.add("toast", type);
  toast.innerText = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
  }, duration - 500);

  setTimeout(() => {
    toast.remove();
  }, duration);
}
