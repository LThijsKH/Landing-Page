"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const imagesData = window.imagesData || [];
  if (!imagesData.length) return;

  const panel = document.getElementById("sticky-panel");
  const sections = document.querySelectorAll("[data-index]");
  if (!panel || !sections.length) return;

  let currentIndex = -1;
  let scrollTimeout;
  let isSnapping = false;

  /* -------- BUILD PANEL -------- */
  panel.innerHTML = `
    <div id="text-container" class="max-w-md w-full transition-opacity duration-300 flex flex-col gap-6">
      <h2 id="text-title" class="text-3xl font-medium leading-tight min-h-18"></h2>

      <div id="meta-location-wrap" class="mt-4 text-sm text-muted space-y-1 min-h-14">
        <div id="meta-location" class="text-text dark:text-d-text font-medium h-5"></div>
        <a id="meta-coords" class="text-xs opacity-70 underline h-4 block" target="_blank" rel="noopener"></a>
      </div>

      <div class="mt-6 text-sm text-muted space-y-2 min-h-20">
        <div id="meta-camera" class="font-medium text-text dark:text-d-text h-5"></div>
        <div id="meta-lens" class="text-xs h-4"></div>

        <div class="flex gap-6 text-xs mt-2 min-h-5">
          <span id="meta-iso" class="min-w-12"></span>
          <span id="meta-focal" class="min-w-16"></span>
          <span id="meta-aperture" class="min-w-16"></span>
          <span id="meta-shutter" class="min-w-20"></span>
        </div>
      </div>
    </div>
  `;

  /* -------- ELEMENTS -------- */
  const titleEl = document.getElementById("text-title");
  const container = document.getElementById("text-container");

  const locationWrap = document.getElementById("meta-location-wrap");
  const locationEl = document.getElementById("meta-location");
  const coordsEl = document.getElementById("meta-coords");

  const cameraEl = document.getElementById("meta-camera");
  const lensEl = document.getElementById("meta-lens");
  const isoEl = document.getElementById("meta-iso");
  const focalEl = document.getElementById("meta-focal");
  const apertureEl = document.getElementById("meta-aperture");
  const shutterEl = document.getElementById("meta-shutter");

  /* -------- UPDATE TEXT -------- */
  function updateText(index) {
    if (index === currentIndex) return;
    currentIndex = index;

    const data = imagesData[index];
    if (!data) return;

    container.style.opacity = 0;

    setTimeout(() => {
      titleEl.textContent = data.title || `Photo ${index}`;

      // Use visibility instead of display → prevents layout shift
      if (data.location) {
        locationEl.textContent = data.location;
        locationEl.style.visibility = "visible";
      } else {
        locationEl.style.visibility = "hidden";
      }

      if (data.coords) {
        const [lat, lng] = data.coords.split(",");
        coordsEl.textContent = `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
        coordsEl.href = `https://www.google.com/maps?q=${data.coords}`;
        coordsEl.style.visibility = "visible";
      } else {
        coordsEl.style.visibility = "hidden";
      }

      if (!data.location && !data.coords) {
        locationWrap.style.visibility = "hidden";
      } else {
        locationWrap.style.visibility = "visible";
      }

      cameraEl.textContent = data.camera || "";
      lensEl.textContent = data.lens || "";

      isoEl.textContent = data.iso ? `ISO ${data.iso}` : "";
      focalEl.textContent = data.focal || "";
      apertureEl.textContent = data.aperture || "";
      shutterEl.textContent = data.shutter || "";

      container.style.opacity = 1;
    }, 180); // slightly slower fade → smoother
  }

  /* -------- SNAP -------- */
  function snapToClosest() {
    let closest = 0;
    let minDist = Infinity;

    sections.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(window.innerHeight / 2 - center);

      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    // ✅ IMPORTANT: don’t snap if already close (prevents jitter)
    if (minDist < 40) {
      updateText(closest);
      return;
    }

    isSnapping = true;

    sections[closest].scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    updateText(closest);

    setTimeout(() => {
      isSnapping = false;
    }, 600); // longer → less aggressive snapping
  }

  window.addEventListener("scroll", () => {
    if (isSnapping) return;

    clearTimeout(scrollTimeout);

    // ✅ slower trigger → less “twitchy”
    scrollTimeout = setTimeout(snapToClosest, 260);
  });

  /* -------- INIT -------- */
  updateText(0);
});