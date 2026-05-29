"use strict";

const body = document.body;

const singleView = document.getElementById("view-single");
const lightbox = document.getElementById("lighthouse");
const lightboxBg = document.getElementById("lighthouse-bg");

const closeBtn = document.getElementById("close-modal");

const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

const imageContainer = document.getElementById("image-container");

const views = [singleView, lightbox];

const imgData = window.imgData

function getCurrentView() {

  const params = new URLSearchParams(
    window.location.search
  );

  return Number(
    params.get("view") || 0
  );
}


// --------------------
// View Management
// --------------------

function showView(index) {
  const params = new URLSearchParams(
    window.location.search
  );

  if (index === -1) {
    window.location.href = "/photos"
    return
  }
  
  views.forEach(view => {
    view?.classList.add("hidden");
  });

  views[index]?.classList.remove("hidden");

  if (index === 1) {
    body.style.overflow = "hidden";
    params.set("view", "1");
  } else {
    body.style.overflow = "auto";
    params.set("view", "0");
  }

  const url = new URL(window.location);

  url.search = params.toString();

  window.history.replaceState(
    {},
    "",
    url
  );
}

window.showView = showView;


// --------------------
// Navigation
// --------------------

function navigatePhoto(direction) {
  const params = new URLSearchParams(
    window.location.search
  );

  if (!imgData) return;

  const current = window.location.pathname;

  const index = imgData.findIndex(
    img => img.route === current
  );

  if (index === -1) return;

  const nextIndex =
    (index + direction + imgData.length)
    % imgData.length;

  window.location.href =
    imgData[nextIndex].route +
    "?" +
    params.toString();
}

window.navigatePhoto = navigatePhoto;


// --------------------
// Keyboard Controls
// --------------------

document.addEventListener("keydown", (e) => {

  const key = e.key;

  if (key === "ArrowLeft" || key === "a") {
    navigatePhoto(-1);
  }

  if (key === "ArrowRight" || key === "d") {
    navigatePhoto(1);
  }

  if (key === "Escape") {

    if (!helpPopup?.classList.contains("hidden")) {
      closeHelp();
      return;
    }

    if (getCurrentView() === 0) {
      showView(-1);
    } else {
      showView(0);
    }
  }

  if (key === "f") {

    if (getCurrentView() === 1) {
      showView(0);
    } else {
      showView(1);
    }
  }
});

// --------------------
// Close Lightbox
// --------------------

closeBtn.addEventListener("click", () => {
  showView(0);
});

lightboxBg.addEventListener("click", () => {
  showView(0);
});

window.addEventListener(
  "DOMContentLoaded",
  () => {
    showView(getCurrentView());
  }
);

// Support for swiping on mobile
// Source - https://stackoverflow.com/a/23230280
// Posted by givanse, modified by community. See post 'Timeline' for change history
// Retrieved 2026-05-10, License - CC BY-SA 4.0

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;                                                        
var yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}                                                     
                                                                         
function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                
                                                                         
function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
                                                                         
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            /* right swipe */ 
            navigatePhoto(1)
        } else {
            /* left swipe */
            navigatePhoto(-1)
        }                       
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};
