"use strict"
function rebalanceForMobile() {
  if (window.innerWidth < 768) {
    const col1 = document.querySelectorAll(".col")[0];
    const col2 = document.querySelectorAll(".col")[1];
    const col3 = document.querySelectorAll(".col")[2];

    if (!col3) return;

    const items = Array.from(col3.children);

    items.forEach((el, i) => {
      (i % 2 === 0 ? col1 : col2).appendChild(el);
    });
  }
}

window.addEventListener("load", rebalanceForMobile);
window.addEventListener("resize", rebalanceForMobile);