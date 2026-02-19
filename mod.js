/// ==UserScript==
// @name         Koruxa Redesign
// @namespace    Koruxa redesign
// @author       Nebulys
// @version      1.0
// @description  Redesign of the game
// @match        https://koruxa.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Mappings for EXTRACT_DATA()
    const mapping = {
        "#stat-coins": "coins",
        ".topbar a.user-name": "username",
        ".user-total-level": "total-level",
        ".user-total-level .total-level-tooltip": "total-xp",
        ".user-credits-box .credits-amount": "credits",
        ".user-credits-box .seal-points-amount": "sealpoints",
        ".online-count": "online-players",
        ".topbar #session-skill-name": "current-skill",
        ".topbar #session-tree-name": "current-item",
        "#sidebar-hp-current": "current-hp",
        "#sidebar-hp-max": "max-hp",
        "#session-remaining": "session-time-left",
        "#cycle-counter": "cycle",
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
            icon: "ra ra-crystals",
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

        // SPECIAL CASE: .user-total-level → extract only the number before the nested span
        if (selector === ".user-total-level") {
            const text = el.childNodes[0]?.textContent || "";
            const num = text.match(/\d+/);
            return num ? num[0] : "(no number)";
        }

        // SPECIAL CASE: #stat-coins → extract only the numeric part
        if (selector === "#stat-coins") {
            const text = el.textContent.trim();
            const num = text.match(/[\d.]+/);
            return num ? num[0] : "(no number)";
        }

        // SPECIAL CASE: .total-level-tooltip → extract only the XP number
        if (selector === ".user-total-level .total-level-tooltip") {
            // Example: "Total XP: 140.185"
            const text = el.textContent.trim();
            const num = text.match(/[\d.]+/);
            return num ? num[0] : "(no number)";
        }

        // SPECIAL CASE: #cycle-counter → extract "0" and "100" separately
        if (selector === "#cycle-counter") {
            const text = el.textContent.trim(); // "0/100 ticks"
            const match = text.match(/(\d+)\s*\/\s*(\d+)/);
            if (!match) return "(invalid format)";


            return {
                current: match[1],
                total: match[2]
            };
        }

        // NORMAL CASE → return the text from the mapping definition
        return el.value || el.textContent.trim();
    }

    // Extracts all skills data
    function EXTRACT_SKILLS(vars) {
        const tooltips = document.querySelectorAll(".skill-tooltip");

        tooltips.forEach(tip => {
            const nameEl = tip.querySelector(".skill-tooltip-title");
            const levelEl = tip.querySelector(".skill-tooltip-level");
            const xpEl = tip.querySelector(".skill-tooltip-xp");
            const totalEl = tip.querySelector(".skill-tooltip-total");

            if (!nameEl) return;
            const skill = nameEl.textContent.trim().toLowerCase().replace(/\s+/g, "");
            const level = levelEl?.textContent.match(/\d+/)?.[0] || "(no level)";
            let currentXP = "(no xp)";
            let levelUpXP = "(no xp)";
            if (xpEl) {
                const match = xpEl.textContent.match(/([\d.]+)\s*\/\s*([\d.]+)/);
                if (match) {
                    currentXP = match[1];
                    levelUpXP = match[2];
                }
            }
            const totalXP = totalEl?.textContent.match(/[\d.]+/)?.[0] || "(no total xp)";

            vars[`${skill}-level`] = level;
            vars[`${skill}-currentxp`] = currentXP;
            vars[`${skill}-levelupxp`] = levelUpXP;
            vars[`${skill}-totalxp`] = totalXP;
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

        if (logo && sidebarLeft && logo.parentNode !== sidebarLeft) {
            sidebarLeft.appendChild(logo);
            if (logoText) {
                logoText.innerHTML = `IDLE RPG UNIVERSE <div class="sublogo-text">EARLY ACCESS</div>`;
            }
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

        if (queueBadge && queueBadge.parentNode !== mainBox) mainBox.prepend(queueBadge);

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
        const vars = {};

        for (const selector in mapping) {
            const result = EXTRACT_DATA(selector);

            if (selector === "#cycle-counter" && typeof result === "object") {
                vars["current-cycle"] = result.current;
                vars["current-cycle-total"] = result.total;
            } else {
                vars[mapping[selector]] = result;
            }
        }

        // Update user coins display
        const coinsBox = document.querySelector("#nebs-user-coins");
        console.log(vars["coins"]);
        if (coinsBox && vars["coins"]) {
            coinsBox.innerHTML = `<i class="fa-solid fa-coins"></i> ${vars["coins"]}`;
        }
        EXTRACT_SKILLS(vars);
        let text = "Mapped Variables:\n";
        for (const key in vars) {
            text += `${key}: ${vars[key]}\n`;
        }
        MOVE_ELEMENTS();

        // Debug output
        const gameArea = document.querySelector(".game-area");
        if (gameArea && !document.getElementById("tm-selector-mapper-output")) {
            //output.textContent = text;
            //gameArea.appendChild(output);
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

            // Prevent duplicate replacements
            if (el.dataset.iconified === "1") continue;

            const iconHTML = `<i class="${cfg.icon}"></i>`;
            const textHTML = cfg.text ? `<span class="icon-text">${cfg.text}</span>` : "";

            el.innerHTML = iconHTML + textHTML;
            el.dataset.iconified = "1";
        }
    }

    REPLACE_ICONS();

    // Font Awesome Free (latest stable)
    loadCSS("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css");

    // RPG Awesome
    loadCSS("https://cdnjs.cloudflare.com/ajax/libs/rpg-awesome/0.2.0/css/rpg-awesome.min.css");

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
