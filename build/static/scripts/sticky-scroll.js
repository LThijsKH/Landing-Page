"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const imagesData = window.imagesData || [];
  if (!imagesData.length) return;

  const panel = document.getElementById("sticky-panel");
  const sections = document.querySelectorAll("[data-index]");
  const firstSection = sections[0];
  const lastSection = sections[sections.length - 1];
  if (!panel || !sections.length) return;

  let currentIndex = -1;
  let scrollTimeout;
  let isSnapping = false;

  /* -------- BUILD PANEL -------- */
  panel.innerHTML = `
    <div id="text-container" class="max-w-md w-full transition-opacity duration-300 flex flex-col gap-3">
      <h2 id="text-title" class="text-3xl font-medium leading-tight min-h-[3.5rem]"></h2>

      <div id="meta-location-wrap" class="mt-1 text-sm text-muted space-y-1 min-h-[3.5rem]">
        <div id="meta-location" class="text-text dark:text-d-text font-medium h-5"></div>
        <a id="meta-coords" class="text-xs opacity-70 underline h-4 block hover:text-text dark:hover:text-d-text" target="_blank" rel="noopener"></a>
      </div>

      <div class="mt-6 text-sm text-muted space-y-2 min-h-[5rem]">
        <div id="meta-camera" class="font-medium text-text dark:text-d-text h-5"></div>
        <div id="meta-lens" class="text-xs h-4"></div>

        <div class="flex gap-6 text-xs mt-2 min-h-[1.25rem]">
          <span id="meta-iso" class="min-w-[3rem]"></span>
          <span id="meta-focal" class="min-w-[4rem]"></span>
          <span id="meta-aperture" class="min-w-[4rem]"></span>
          <span id="meta-shutter" class="min-w-[5rem]"></span>
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

  /* -------- NUMBER SCRAMBLE -------- */
  function scrambleNumber(el, finalText, duration = 400) {
    if (!finalText) {
      el.textContent = "";
      return;
    }

    const chars = "0123456789";
    const length = finalText.length;

    let start = null;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);

      let output = "";

      for (let i = 0; i < length; i++) {
        if (progress > i / length) {
          output += finalText[i];
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      el.textContent = output;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  /* -------- UPDATE TEXT -------- */
  function updateText(index) {
    if (index === currentIndex) return;
    currentIndex = index;

    const data = imagesData[index];
    if (!data) return;

    container.style.opacity = 0;

    setTimeout(() => {
      titleEl.textContent = data.title || `Photo ${index}`;

      if (data.location) {
        locationEl.textContent = data.location;
        locationEl.style.visibility = "visible";
      } else {
        locationEl.style.visibility = "hidden";
      }

      if (data.coords) {
        const [lat, lng] = data.coords.split(",");
        const formatted = `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
        scrambleNumber(coordsEl, formatted);
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

      scrambleNumber(isoEl, data.iso ? `ISO ${data.iso}` : "");
      scrambleNumber(focalEl, data.focal || "");
      scrambleNumber(apertureEl, data.aperture || "");
      scrambleNumber(shutterEl, data.shutter || "");

      container.style.opacity = 1;
    }, 180);
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

    if (minDist < 40) {
      updateText(closest);
      return;
    }

    isSnapping = true;

    sections[closest].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    updateText(closest);

    setTimeout(() => {
      isSnapping = false;
    }, 600);
  }

  /* -------- MOBILE-SAFE GALLERY CHECK -------- */
  function isInGallery() {
    const firstRect = firstSection.getBoundingClientRect();
    const lastRect = lastSection.getBoundingClientRect();

    return (
      firstRect.top < window.innerHeight * 0.5 &&
      lastRect.bottom > window.innerHeight * 0.5
    );
  }

  /* -------- SCROLL -------- */
  window.addEventListener("scroll", () => {
    if (isSnapping) return;

    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {
      if (!isInGallery()) return;
      snapToClosest();
    }, 20); // slower for mobile
  });

  /* -------- INIT -------- */
  updateText(0);
});
