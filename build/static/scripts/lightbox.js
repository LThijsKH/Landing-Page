"use strict"
const body = document.querySelector("body");
const modal = document.getElementById("lighthouse")
const slides = document.getElementsByClassName("slide");
const caption = document.getElementById("caption")
const totalI = slides.length
let i = 1;

function openModal() {
	modal.style.display = "block";
	body.style.overflow = "hidden";
};

function closeModal() {
	modal.style.display = "none";
	body.style.overflow = "auto";
};

function changeSlides(i_change) {
	i = (((i-1+i_change+10)%totalI)+1) // Converting to index (starting from 0) to calculate new slide and then back to couting from 1
	showSlides(i);
};

function currentSlide(slidesIndex) {
	i = slidesIndex
	showSlides(i);
};

function showSlides(i) {
	// Hide unwanted images
	let n = 0
	for (n = 0; n < slides.length; n++) {
    slides[n].style.display = "none";
};

	// Show requested image
	slides[i-1].style.display = "flex";
	caption.innerText = document.querySelectorAll(".modal .slide img.photo")[i-1].getAttribute("alt");
};

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
	let key = event.key;
	if (key === "ArrowLeft" || key === "a") {
		changeSlides(-1)
	}; if (key === "ArrowRight" || key === "d") {
		changeSlides(1)
	}; if (key === "Escape") {
		closeModal()
	};
};

// TODO: add event listener to background of modal to close if clicked
Array.from(slides).forEach(slide => {
	slide.addEventListener("click", handleClick);
});

function handleClick(event) {
	if (event.target === event.currentTarget) {
		closeModal()
	};
};