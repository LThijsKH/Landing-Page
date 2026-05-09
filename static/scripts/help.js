"use strict";

// Help popup
const helpTrigger = document.getElementById("help-trigger");
const helpPopup = document.getElementById("help-popup");

function initHelp() {
  if (!localStorage.getItem("seenPhotoHelp")) {
    helpTrigger?.classList.remove("hidden");
    openHelp();
  }
}

function openHelp() {
  helpPopup?.classList.remove("hidden");
}

function closeHelp() {
  helpPopup?.classList.add("hidden");
  helpTrigger?.classList.add("hidden");
  localStorage.setItem("seenPhotoHelp", "true");
}

window.openHelp = openHelp;
window.closeHelp = closeHelp;

document.addEventListener("DOMContentLoaded", initHelp);