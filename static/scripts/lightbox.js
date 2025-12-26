"use strict"

const slides = document.getElementsByClassName("slide");
const caption = document.getElementById("caption")
const totalI = slides.length
let i = 1;

function openModal() {
	document.getElementById("lighthouse").style.display = "block";
};

function closeModal() {
	document.getElementById("lighthouse").style.display = "none";
};

function changeSlides(i_change) {
	i = ((i-1+i_change)%totalI)+1 // Converting to index (starting from 0) to calculate new slide and then back to couting from 1
	showSlides(i);
};

function currentSlide(i) {
	showSlides(i);
};

function showSlides(i) {
	// Hide unwanted images
	let n = 0
	for (n = 0; n < slides.length; n++) {
    slides[n].style.display = "none";
	};

	// Show requested image
	slides[i-1].style.display = "block";
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