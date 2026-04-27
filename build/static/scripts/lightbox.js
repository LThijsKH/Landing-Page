"use strict";
const body = document.querySelector("body");
const modal = document.getElementById("lighthouse");
const slides = document.getElementsByClassName("slide");
const caption = document.getElementById("caption");
const slideCounter = document.getElementById("slide-counter");
const totalI = slides.length;
const single = document.getElementById("view-single");
const grid = document.getElementById("view-grid");
const views = [single, grid, modal];
let i = 1;
showSlides(1);

function showView(index) {
  views.forEach((v) => {
    v.classList.add("hidden");
    v.classList.add("md:hidden");
  });

  views[index].classList.remove("hidden");
  views[index].classList.remove("md:hidden");
}

function openModal() {
  modal.classList.remove("hidden");
  body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  body.style.overflow = "auto";
  if (
    single.classList.contains("hidden") &&
    grid.classList.contains("hidden")
  ) {
    grid.classList.remove("hidden");
  }
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
  // Hide unwanted images
  let n = 0;
  for (n = 0; n < slides.length; n++) {
    slides[n].classList.add("hidden");
  }

  // Show requested image
  slides[i - 1].classList.remove("hidden");
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
    closeModal();
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
