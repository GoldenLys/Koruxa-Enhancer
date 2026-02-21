/// ==UserScript==
// @name          Koruxa Redesign
// @namespace     Koruxa redesign
// @author        Nebulys
// @version       1.03
// @homepageURL   https://github.com/GoldenLys/Koruxa-Enhancer/
// @supportURL    hhttps://github.com/GoldenLys/Koruxa-Enhancer/issues/
// @downloadURL   https://raw.githubusercontent.com/GoldenLys/Koruxa-Enhancer/master/mod.user.js
// @updateURL     https://raw.githubusercontent.com/GoldenLys/Koruxa-Enhancer/master/mod.user.js
// @description   Redesign of the game
// @match         https://koruxa.com/*
// @icon          https://www.google.com/s2/favicons?domain=https://koruxa.com
// @license       MIT License
// @grant         unsafeWindow
// @run-at        document-idle
// ==/UserScript==

(function () {
    'use strict';

    // Mappings for EXTRACT_DATA()
    window.mapping = {
        coins: { selector: "#stat-coins", value: "0" },
        username: { selector: ".topbar a.user-name", value: "" },
        "total-level": { selector: ".user-total-level", value: "0" },
        "total-xp": { selector: ".user-total-level .total-level-tooltip", value: "0" },
        credits: { selector: ".user-credits-box .credits-amount", value: "0" },
        sealpoints: { selector: ".user-credits-box .seal-points-amount", value: "0" },
        "online-players": { selector: ".online-count", value: "0" },
        "current-skill": { selector: ".topbar #session-skill-name", value: "" },
        "current-item": { selector: ".topbar #session-tree-name", value: "" },
        "current-hp": { selector: "#sidebar-hp-current", value: "0" },
        "max-hp": { selector: "#sidebar-hp-max", value: "0" },
        "session-time-left": { selector: "#session-remaining", value: "" },
        cycle: { selector: "#cycle-counter", value: { current: "0", total: "0" } },
        "session-xp-rate": { selector: "#progress-xp-rate", value: "0" },
    };

    // Mappings for REPLACE_ICONS()
    const iconReplacements = {
        "a[href='logout.php']": { // Log out
            icon: "fa-solid fa-right-from-bracket",
            text: ""
        },
        ".notification-bell-icon": { // Notifications
            icon: "fa-solid fa-envelope",
            text: ""
        },
        "a[href='character_select.php']": { // Change character
            icon: "fa-solid fa-person-walking-dashed-line-arrow-right",
            text: ""
        },
        "a[href='game.php?page=leaderboard']": { // Leaderboard
            icon: "ra ra-trophy",
            text: ""
        },
        "a[href='game.php?page=shop']": { // Buy credits
            icon: "fa-solid fa-plus",
            text: "Buy"
        },
        "#session-stop": { // Session stop
            icon: "fa-solid fa-xmark",
            text: ""
        },
        "#session-renew": { // Session Renew
            icon: "fa-solid fa-arrows-rotate",
            text: ""
        },
        ".progress-badge-icon": { // Session XP Rate
            icon: "ra ra-progression",
            text: ""
        },
    };

    // Output element (for debugging)
    const output = document.createElement("div");
    Object.assign(output.style, {
        padding: "10px",
        marginTop: "10px",
        background: "rgba(0,0,0,0.25)",
        color: "#fff",
        fontFamily: "monospace",
        whiteSpace: "pre",
    });

    // Extracts data from the given selector (for use in new elements)
    function EXTRACT_DATA(selector) {
        const el = document.querySelector(selector);
        if (!el) return "(not found)";

        const text = el.textContent.trim();

        switch (selector) {
            case ".user-total-level": {
                const num = el.childNodes[0]?.textContent.match(/\d+/);
                return num ? num[0] : "(no number)";
            }

            case "#stat-coins":
            case ".user-total-level .total-level-tooltip": {
                const num = text.match(/[\d.]+/);
                return num ? num[0] : "(no number)";
            }

            case "#cycle-counter": {
                const m = text.match(/(\d+)\s*\/\s*(\d+)/);
                return m ? { current: m[1], total: m[2] } : "(invalid format)";
            }
        }

        return el.value || text;
    }

    // Extracts all skills data
    function EXTRACT_SKILLS() {
        document.querySelectorAll(".skill-tooltip").forEach(tip => {
            const name = tip.querySelector(".skill-tooltip-title")
                ?.textContent.trim().toLowerCase().replace(/\s+/g, "");
            if (!name) return;

            const level = tip.querySelector(".skill-tooltip-level")
                ?.textContent.match(/\d+/)?.[0] || "(no level)";

            const xpText = tip.querySelector(".skill-tooltip-xp")?.textContent || "";
            const xpMatch = xpText.match(/([\d.]+)\s*\/\s*([\d.]+)/);

            const currentXP = xpMatch?.[1] || "(no xp)";
            const levelUpXP = xpMatch?.[2] || "(no xp)";

            const totalXP = tip.querySelector(".skill-tooltip-total")
                ?.textContent.match(/[\d.]+/)?.[0] || "(no total xp)";

            // Always produce mapping‑compatible entries
            window.mapping[`${name}-level`] = { selector: null, value: level };
            window.mapping[`${name}-currentxp`] = { selector: null, value: currentXP };
            window.mapping[`${name}-levelupxp`] = { selector: null, value: levelUpXP };
            window.mapping[`${name}-totalxp`] = { selector: null, value: totalXP };
        });
    }

    // Moves some html elements
    function MOVE_ELEMENTS() {
        const sessionStat = document.querySelector("#session-stat");
        const sidebarRight = document.querySelector(".sidebar.sidebar-right");
        const logo = document.querySelector(".topbar>.topbar-left");
        const sidebarLeft = document.querySelector(".sidebar.sidebar-left");
        const logoText = document.querySelector(".logo-text");
        const userInfo = document.querySelector(".user-info");
        const topbarCenter = document.querySelector(".topbar-center");
        const activity = document.querySelector("#topbar-activity");

        if (logo && sidebarLeft && logo.parentNode !== sidebarLeft) {
            sidebarLeft.appendChild(logo);
            if (logoText) {
                logoText.innerHTML = `IDLE RPG UNIVERSE <div class="sublogo-text">EARLY ACCESS</div>`;
            }
        }

        if (activity && topbarCenter) {
            topbarCenter.appendChild(activity);
        }

        if (userInfo && topbarCenter) {

            if (!userInfo.dataset.wrapped) {

                const wrapper = document.createElement("div");
                wrapper.className = "user-info-wrapper";

                const img = document.createElement("img");
                img.className = "user-avatar";
                img.src = "https://koruxa.com/assets/img/avatars/user_409_1771404903.png"; // example
                img.alt = "User Avatar";

                userInfo.parentNode.insertBefore(wrapper, userInfo);

                wrapper.appendChild(img);
                wrapper.appendChild(userInfo);

                userInfo.dataset.wrapped = "1";
            }

            const wrapper = userInfo.closest(".user-info-wrapper");
            if (wrapper && wrapper.parentNode !== topbarCenter) {
                topbarCenter.prepend(wrapper);
            }
        }

        if (!sessionStat || !sidebarRight || !logo) return;

        sessionStat.className = "nebs-container";

        if (sessionStat.parentNode !== sidebarRight) {
            sidebarRight.prepend(sessionStat);
        }

        const timeSpan = sessionStat.querySelector("span.small");
        if (timeSpan) {
            timeSpan.classList.remove("small");
            timeSpan.classList.add("session-time");
        }

        let mainBox = sessionStat.querySelector(".session-main");
        if (!mainBox) {
            mainBox = document.createElement("div");
            mainBox.className = "session-main";
            sessionStat.prepend(mainBox);
        }

        const label = sessionStat.querySelector("span.label");
        const xpBar = sessionStat.querySelector(".xp-bar");
        const cycleBar = sessionStat.querySelector("#cycle-bar-container");
        const queueBadge = sessionStat.querySelector(".queue-badge");

        if (queueBadge && queueBadge.parentNode !== mainBox) {
            mainBox.prepend(queueBadge);
            queueBadge.addEventListener('click', (e) => {
                e.stopPropagation();
                MOVE_ELEMENTS();
            });
        }

        document.addEventListener("click", (e) => {
            const chatbox = document.querySelector("#chatbox");
            if (!chatbox) return;
            if (chatbox.contains(e.target)) chatbox.classList.add("active");
            else chatbox.classList.remove("active");
        });

        if (label && label.parentNode !== mainBox) mainBox.appendChild(label);

        if (xpBar && xpBar.parentNode !== mainBox) mainBox.appendChild(xpBar);

        if (cycleBar && cycleBar.parentNode !== mainBox) mainBox.appendChild(cycleBar);

        const sessionTime = sessionStat.querySelector(".session-time");
        if (sessionTime && sessionTime.parentNode !== mainBox) mainBox.appendChild(sessionTime);

        const renew = document.querySelector("#session-renew");
        const stop = document.querySelector("#session-stop");

        if (!renew || !stop) return;

        renew.removeAttribute("style");
        stop.removeAttribute("style");

        renew.classList.add("session-btn", "session-btn-renew");
        stop.classList.add("session-btn", "session-btn-stop");

        let btnBox = sessionStat.querySelector(".session-buttons");
        if (!btnBox) {
            btnBox = document.createElement("div");
            btnBox.className = "session-buttons";
            sessionStat.appendChild(btnBox);
        }

        if (renew.parentNode !== btnBox) btnBox.appendChild(renew);
        if (stop.parentNode !== btnBox) btnBox.appendChild(stop);
    }

    // Updates values and create new html elements
    function UPDATE_DATA() {
        for (const key in window.mapping) {
            const entry = window.mapping[key];      // { selector, value }
            const result = EXTRACT_DATA(entry.selector);

            // Special case: cycle
            if (key === "cycle" && typeof result === "object") {
                entry.value = result;               // { current, total }
            } else {
                entry.value = result;               // normal case
            }
        }

        // Update user coins display
        const coinsBox = document.querySelector("#nebs-user-coins");
        if (coinsBox && window.mapping.coins?.value != null) {
            coinsBox.innerHTML = `<i class="fa-solid fa-coins"></i> ${window.mapping.coins.value}`;
        }

        EXTRACT_SKILLS(window.mapping);

        let text = "Mapped Variables:\n";
        for (const key in window.mapping) {
            text += `${key}: ${JSON.stringify(window.mapping[key].value)}\n`;
        }

        MOVE_ELEMENTS();

        // Debug output (kept disabled)
        const gameArea = document.querySelector(".game-area");
        if (gameArea && !document.getElementById("tm-selector-mapper-output")) {
            // const output = document.createElement("pre");
            // output.id = "tm-selector-mapper-output";
            // output.textContent = text;
            // gameArea.appendChild(output);
        }
    }

    function loadCSS(url) {
        if (document.querySelector(`link[href="${url}"]`)) return;

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        document.head.appendChild(link);
    }

    function REPLACE_ICONS() {
        for (const selector in iconReplacements) {
            const cfg = iconReplacements[selector];
            const el = document.querySelector(selector);

            if (!el) continue;
            if (el.dataset.iconified === "1") continue; // Prevent duplicate replacements

            const iconHTML = `<i class="${cfg.icon}"></i>`;
            const textHTML = cfg.text ? `<span class="icon-text">${cfg.text}</span>` : "";

            el.innerHTML = iconHTML + textHTML;
            el.dataset.iconified = "1";
        }
    }

    REPLACE_ICONS();
    loadCSS("https://fonts.googleapis.com/css2?family=Saira:ital,wght@0,100..900;1,100..900&display=swap"); // Add Saira font
    loadCSS("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"); // Font Awesome Free (latest stable)
    loadCSS("https://goldenlys.github.io/Koruxa-Enhancer/css/rpg-awesome.min.css"); // RPG Awesome (custom version with more icons)
    loadCSS("https://goldenlys.github.io/Koruxa-Enhancer/css/style.css"); // Let the magic begin

    setTimeout(() => {
        const notifications = document.querySelector("#notification-bell");
        const switch_character = document.querySelector(".char-switch-link");
        const stats = document.querySelector("#progress-stats");
        const target = document.querySelector(".topbar-right");
        let userCoins = document.querySelector("#nebs-user-coins");

        if (!userCoins) {
            userCoins = document.createElement("div");
            userCoins.className = "user-coins";
            userCoins.title = "Coins";
            const userCoinsText = document.createElement("div");
            userCoinsText.className = "user-coins-text";
            userCoinsText.id = "nebs-user-coins";
            userCoins.appendChild(userCoinsText);

            if (target) target.prepend(userCoins);
            if (switch_character && target) target.prepend(switch_character);
            if (notifications && target) target.prepend(notifications);
            if (stats && target) target.prepend(stats);
        }
    }, 500);
    setInterval(UPDATE_DATA, 1000);
})();
