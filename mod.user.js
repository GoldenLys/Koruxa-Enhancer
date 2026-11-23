/// ==UserScript==
// @name          Koruxa Enhanced
// @namespace     Koruxa Enhanced
// @author        Nebulys
// @version       4.0.0
// @homepageURL   https://github.com/GoldenLys/Koruxa-Enhancer/
// @supportURL    https://github.com/GoldenLys/Koruxa-Enhancer/issues/
// @downloadURL   https://github.com/GoldenLys/Koruxa-Enhancer/raw/refs/heads/main/mod.user.js
// @updateURL     https://github.com/GoldenLys/Koruxa-Enhancer/raw/refs/heads/main/mod.user.js
// @description   A script that enhances the UI of Koruxa
// @match         https://koruxa.com/*
// @match         https://www.koruxa.com/*
// @exclude       https://koruxa.com/testing*
// @icon          https://www.google.com/s2/favicons?domain=https://koruxa.com
// @license       MIT License
// @grant         unsafeWindow
// @run-at        document-end
// @require       https://goldenlys.github.io/Koruxa-Enhancer/assets/libs/lodash.min.js
// ==/UserScript==

(function () {
  "use strict";

  function LOAD_CSS(url) {
    if (document.querySelector(`link[href="${url}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }

  const init = () => {
    const r = document.querySelector(".topbar-right");
    r.addEventListener(
      "wheel",
      (e) => {
        const max = r.scrollWidth - r.clientWidth;
        if (max <= 0) return;
        const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        const delta = e.deltaMode === 1 ? d * 32 : d;
        if (delta < 0 && r.scrollLeft <= 0) return;
        if (delta > 0 && r.scrollLeft >= max - 1) return;
        e.preventDefault();
        r.scrollLeft += delta;
      },
      { passive: false },
    );
  };

  init();
  LOAD_CSS("https://goldenlys.github.io/Koruxa-Enhancer/assets/css/fa-7.2.0.min.css");
  LOAD_CSS("https://goldenlys.github.io/Koruxa-Enhancer/assets/css/rpg-awesome.min.css");
  LOAD_CSS("https://goldenlys.github.io/Koruxa-Enhancer/assets/css/redesign.css");

})();
