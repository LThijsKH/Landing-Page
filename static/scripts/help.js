"use strict";

// Help popup
const helpPopup = document.getElementById("help-popup");


function openHelp() {
  helpPopup?.classList.remove("hidden");
}

function closeHelp() {
  helpPopup?.classList.add("hidden");
  localStorage.setItem("seenPhotoHelp", "true");
}

window.openHelp = openHelp;
window.closeHelp = closeHelp;

document.addEventListener("DOMContentLoaded", initHelp);

document.addEventListener("keydown", (e) => {
  const key = e.key;
  if (key === "Escape") {
      if (!helpPopup?.classList.contains("hidden")) {
        closeHelp();
        return;
      }
  }
});