"use strict";
const body = document.querySelector("body");
const modal = document.getElementById("lighthouse");
const slides = document.getElementsByClassName("slide");
const infoSlides = document.getElementsByClassName("info-slide")
const caption = document.getElementById("caption");
const slideCounter = document.getElementById("slide-counter");
const totalI = slides.length;
const single = document.getElementById("view-single");
const grid = document.getElementById("view-grid");
const views = [grid, single, modal];
let i = 1;
let currentView = 0;
showSlides(1);

function showView(index) {
  views.forEach((v) => {
    v.classList.add("hidden");
  });

  views[index].classList.remove("hidden");

  currentView = index
}

function openModal() {
  modal.classList.remove("hidden");
  body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  body.style.overflow = "auto";
  
  showView(0);
}

function changeSlides(i_change) {
  i = ((i - 1 + i_change + 10) % totalI) + 1; // Converting to index (starting from 0) to calculate new slide and then back to couting from 1
  showSlides(i);
}

function currentSlide(slidesIndex) {
  i = slidesIndex;
  showSlides(i);
}

function showSlides(i) {
  for (let n = 0; n < slides.length; n++) {
    slides[n].classList.add("hidden");
  }

  for (let n = 0; n < infoSlides.length; n++) {
    infoSlides[n].classList.add("hidden");
  }

  slides[i - 1].classList.remove("hidden");
  infoSlides[i - 1].classList.remove("hidden");
}

document.addEventListener("keydown", handleKeyPress);

function handleKeyPress(event) {
  let key = event.key;
  if (key === "ArrowLeft" || key === "a") {
    changeSlides(-1);
  }
  if (key === "ArrowRight" || key === "d") {
    changeSlides(1);
  }
  if (key === "Escape") {
    if (!helpPopup.classList.contains("hidden")) {
      closeHelp();
    } else {
      if (currentView == 0) {
        currentView = 1
      }
      showView(currentView-1);
    }
  }
  if (key === "f") {
    if (currentView == 2) {
      currentView = -1
    }
    showView(currentView+1);
  }
}

// Close modal when clicking on the overlay background
modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    closeModal();
  }
});

// Show/hide controls based on mouse position
const imageContainer = document.getElementById("image-container");
const prevContainer = document.getElementById("prev-container");
const nextContainer = document.getElementById("next-container");
const closeBtn = document.getElementById("close-btn");

if (imageContainer && prevContainer && nextContainer) {
  imageContainer.addEventListener("mouseenter", function () {
    prevContainer.classList.add("opacity-0");
    nextContainer.classList.add("opacity-0");
  });

  imageContainer.addEventListener("mouseleave", function () {
    prevContainer.classList.remove("opacity-0");
    nextContainer.classList.remove("opacity-0");
  });
}

// Help Pop Up
const helpTrigger = document.getElementById("help-trigger");
const helpPopup = document.getElementById("help-popup");

function initHelp() {
  if (!localStorage.getItem("seenHelp")) {
    helpTrigger.classList.remove("hidden");
  }
}

function openHelp() {
  helpPopup.classList.remove("hidden");
}

function closeHelp() {
  helpPopup.classList.add("hidden");
  helpTrigger.classList.add("hidden");
  localStorage.setItem("seenHelp", "true");
}

document.addEventListener("DOMContentLoaded", initHelp);