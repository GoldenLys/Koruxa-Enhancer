/// ==UserScript==
// @name          Koruxa Enhanced
// @namespace     Koruxa Enhanced
// @author        Nebulys
// @version       1.13
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

// Additional global variables for easier access, mostly based on HTML elements
unsafeWindow.KORUXA_GLOBALS = {};
unsafeWindow.KORUXA_STATS = {};
unsafeWindow.KORUXA_TOOLS = {};
unsafeWindow.KORUXA_FARMS = {};

unsafeWindow.mapping = { // Mappings of game data
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

(function () {
    'use strict';

    const KORUXA_CONFIGS = {
        woodcutting: KORUXA_WOODCUT_CONFIG,
        mining: KORUXA_MINING_CONFIG,
        fishing: KORUXA_FISHING_CONFIG,
        cooking: KORUXA_COOKING_CONFIG,
        fletching: KORUXA_FLETCHING_CONFIG,
        crafting: KORUXA_CRAFTING_CONFIG,
        herblore: KORUXA_HERBLORE_CONFIG,
        smithing: KORUXA_SMITHING_CONFIG,
        firemaking: KORUXA_FIREMAKING_CONFIG,
        arcana: KORUXA_ARCANA_CONFIG
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
        "a[href='game.php?page=messages']": { // Messages
            icon: "fa-solid fa-message",
            text: ""
        },

        // Gathering Skills

        "a[href='game.php?skill=woodcutting'] .skill-icon": { // Woodcutting
            icon: "ra ra-pine-tree",
            text: ""
        },

        "a[href='game.php?skill=mining'] .skill-icon": { // Mining
            icon: "ra ra-stone-pile",
            text: ""
        },

        "a[href='game.php?skill=fishing'] .skill-icon": { // Fishing
            icon: "ra ra-fishing-pole", // or ra-fish
            text: ""
        },

        "a[href='game.php?skill=farming'] .skill-icon": { // Farming
            icon: "fa-solid fa-seedling",
            text: ""
        },

        "a[href='game.php?skill=thieving'] .skill-icon": { // Thieving
            icon: "ra ra-hand", // or ra-balaclava
            text: ""
        },

        "a[href='game.php?skill=arcana'] .skill-icon": { // Arcana
            icon: "ra ra-spell-book",
            text: ""
        },

        // Artisan skills

        "a[href='game.php?skill=cooking'] .skill-icon": { // Cooking
            icon: "ra ra-meat",
            text: ""
        },

        "a[href='game.php?skill=fletching'] .skill-icon": { // Fletching
            icon: "ra ra-arrowhead",
            text: ""
        },

        "a[href='game.php?skill=crafting'] .skill-icon": { // Crafting
            icon: "ra ra-hammer", // or ra-hand-saw
            text: ""
        },

        "a[href='game.php?skill=herblore'] .skill-icon": { // Herblore
            icon: "ra ra-potion-ball", // or ra-corked-tube
            text: ""
        },

        "a[href='game.php?skill=smithing'] .skill-icon": { // Smithing
            icon: "ra ra-armor-blueprint",
            text: ""
        },

        "a[href='game.php?skill=firemaking'] .skill-icon": { // Firemaking
            icon: "ra ra-campfire",
            text: ""
        },

        // Combat skills

        "a[href='game.php?skill=slayer'] .skill-icon": { // Slayer
            icon: "ra ra-skull",
            text: ""
        },

        "a[href='game.php?skill=attack'] .skill-icon": { // Attack
            icon: "ra ra-relic-blade", // or ra-sword
            text: ""
        },

        "a[href='game.php?skill=strength'] .skill-icon": { // Strength
            icon: "ra ra-biceps",
            text: ""
        },

        "a[href='game.php?skill=defence'] .skill-icon": { // Defence
            icon: "ra ra-heavy-shield",
            text: ""
        },

        "a[href='game.php?skill=hitpoints'] .skill-icon": { // Hitpoints
            icon: "ra ra-health-increase", // or ra-glass-heart
            text: ""
        },

        "a[href='game.php?skill=magic'] .skill-icon": { // Magic
            icon: "ra ra-wizard-staff",
            text: ""
        },

        "a[href='game.php?skill=ranged'] .skill-icon": { // Ranged
            icon: "ra ra-crossbow",
            text: ""
        },

        // Skill categories

        ".skill-category[data-category='gathering'] .skill-category-header .category-icon": { // Gathering
            icon: "ra ra-dig-dug",
            text: ""
        },

        ".skill-category[data-category='artisan'] .skill-category-header .category-icon": { // Artisan
            icon: "ra ra-gear-hammer",
            text: ""
        },

        ".skill-category[data-category='combat'] .skill-category-header .category-icon": { // Combat
            icon: "ra ra-knight-helmet",
            text: ""
        },

    };

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

            const titleEl = tip.querySelector(".skill-tooltip-title");
            if (!titleEl) return;

            const name = titleEl.textContent.trim().toLowerCase().replace(/\s+/g, "");
            if (!name) return;

            const level = tip.querySelector(".skill-tooltip-level")
                ?.textContent.match(/\d+/)?.[0] || "(no level)";

            const xpText = tip.querySelector(".skill-tooltip-xp")?.textContent || "";
            const xpMatch = xpText.match(/([\d.]+)\s*\/\s*([\d.]+)/);

            const currentXP = xpMatch ? xpMatch[1].replace(/\./g, "") : "(no xp)";
            const levelUpXP = xpMatch ? xpMatch[2].replace(/\./g, "") : "(no xp)";

            const totalXPraw = tip.querySelector(".skill-tooltip-total")
                ?.textContent.match(/[\d.]+/)?.[0] || "(no total xp)";
            const totalXP = totalXPraw.replace(/\./g, "");

            unsafeWindow.KORUXA_STATS[name] = {
                level,
                xp_current: currentXP,
                xp_needed: levelUpXP,
                xp_total: totalXP
            };
        });
    }

    // Updates values and create new html elements
    function UPDATE_DATA() {
        for (const key in unsafeWindow.mapping) {
            const entry = unsafeWindow.mapping[key]; // { selector, value }
            const result = EXTRACT_DATA(entry.selector);
            unsafeWindow.KORUXA_GLOBALS[key] = entry.value;

            // Special case: cycle
            if (key === "cycle" && typeof result === "object") {
                entry.value = result;                // { current, total }
            } else {
                entry.value = result;                // normal case
            }
        }
        EXTRACT_SKILLS(unsafeWindow.mapping);
        SET_CURRENT_SKILL_CLASS();
        LOAD_TOOL_STATS();
        LOAD_FARM_STATS();
        if (KORUXA_GLOBALS["current-skill"] !== "Doing") ENHANCED_HELPER();
        //console.table(unsafeWindow.mapping); // Debug output
    }

    function SET_CURRENT_SKILL_CLASS() {
        const url = window.location.href;
        const match = url.match(/skill=([^&]+)/);
        if (!match) return;

        const skill = match[1].trim().toLowerCase();
        const gameArea = document.querySelector(".game-area");
        if (!gameArea) return;

        gameArea.classList.forEach(cls => {
            if (cls !== "game-area") {
                gameArea.classList.remove(cls);
            }
        });
        gameArea.classList.add(skill);
        unsafeWindow.KORUXA_GLOBALS["current-skill"] = skill;
    }

    function loadCSS(url) {
        if (document.querySelector(`link[href="${url}"]`)) return;

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        document.head.appendChild(link);
    }

    function toHHMMSS(sec) {
        sec = parseInt(sec, 10);

        const hours = Math.floor(sec / 3600);
        const minutes = Math.floor((sec % 3600) / 60);
        const seconds = sec % 60;
        const parts = [];

        if (hours > 0) parts.push(hours + "h");
        if (minutes > 0) parts.push(minutes + "m");
        if (seconds > 0 || parts.length === 0) parts.push(seconds + "s");

        return parts.join(" ");
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

    const cleanName = str => str.replace(/[^\w\s]/g, "").trim(); // Remove emojis + trim
    const cleanValue = str => Number(str.replace(/[^\d.-]/g, "")); // Convert "+15%" → 15

    function LOAD_FARM_STATS() {
        const FARMS = [
            'woodcutting', 'mining', 'fishing', 'farming', 'cooking', 'thieving',
            'fletching', 'crafting', 'herblore', 'smithing', 'firemaking', 'arcana'
        ];
        const result = Object.create(null);
        const SPEED = [0, 2, 4, 6, 8, 10, 12, 14, 16];
        const XP = [0, 1, 2, 4, 6, 8, 10, 15, 20];

        FARMS.forEach(farm => {
            const el = document.querySelector(`.farm-card[data-skill="${farm}"] .farm-level`);
            if (!el) return;

            let lvl = 0;
            const txt = el.textContent.trim().toLowerCase();

            if (txt !== "not built") {
                const m = txt.match(/\d+/);
                if (m) lvl = Number(m[0]);
            }

            result[farm] = {
                level: lvl,
                speed: SPEED[lvl] || 0,
                xp: XP[lvl] || 0
            };
        });

        unsafeWindow.KORUXA_FARMS = result;
    }

    function LOAD_TOOL_STATS() {
        const TOOL_SKILLS = [
            'woodcutting', 'mining', 'fishing',
            'farming', 'cooking', 'thieving',
            'fletching', 'crafting', 'herblore',
            'smithing', 'firemaking', 'arcana',
            'slayer'
        ];

        const TOOL_STAT_FORMAT = {
            "XP Gain": "xp",
            "Speed": "speed",
            /*"Attack": "attack",
            "Defence": "defence",
            "Strength": "strength",
            "Hitpoints": "hitpoints",
            "Ranged": "ranged",
            "Crit": "crit",
            "Magic": "magic", WIP */
        }

        const result = Object.create(null);

        TOOL_SKILLS.forEach(skill => {
            const root = document.querySelector(
                `.equipment-slot[data-slot="tool_${skill}"]`
            );

            if (!root) {
                result[skill] = {};
                return;
            }

            const stats = Object.create(null);

            root.querySelectorAll(".tooltip-stat").forEach(stat => {
                const nameRaw = stat.children[0]?.textContent || "";
                const valueRaw = stat.querySelector(".tooltip-stat-value")?.textContent || "";

                let name = cleanName(nameRaw);
                let value = cleanValue(valueRaw);

                if (TOOL_STAT_FORMAT[name]) name = TOOL_STAT_FORMAT[name];

                stats[name] = value;
            });

            result[skill] = stats;
        });

        unsafeWindow.KORUXA_TOOLS = result;
    }

    function ENHANCED_HELPER() {
        const skill = unsafeWindow.KORUXA_GLOBALS["current-skill"]?.toLowerCase();
        if (!skill) return;

        const data = CALC_SKILL_LEVEL_UP(skill);
        if (!data) return;

        const phrase =
            `Level up ${data.skill} with <b>${data.required}</b> XP<br>` +
            `Do <b>${data.action} x${data.loops}</b> (<b>${data.time}</b>)`;

        const el = document.querySelector("#enhanced-helper");
        if (el) {
            el.querySelector(".enhanced-helper-item").innerHTML = phrase;
            el.querySelector(".enhanced-helper-subtitle").textContent = `${data.skill} ${unsafeWindow.KORUXA_STATS[skill].level}`;
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "enhanced-helper";
        wrapper.id = "enhanced-helper";

        wrapper.innerHTML = `
        <div class="enhanced-helper-title">
            <i class="ra ra-crown-coin"></i> Koruxa Helper
            <span class="enhanced-helper-subtitle">${data.skill} ${unsafeWindow.KORUXA_STATS[skill].level}</span>
        </div>

        <div class="enhanced-helper-item">${phrase}</div>`;

        document.querySelector(".sidebar-right")?.prepend(wrapper);
    }

    function GET_LAST_UNLOCK_SKILL(skill) {
        const config = KORUXA_CONFIGS[skill];
        if (!config) return null;

        const lvl = KORUXA_STATS?.[skill]?.level ?? 0;
        let best = null, bestReq = -1;

        for (const key in config) {
            const entry = config[key];

            // Skills without categories
            if (entry?.min_level !== undefined) {
                const req = entry.min_level;
                if (req <= lvl && req > bestReq) best = key, bestReq = req;
                continue;
            }

            // Skills with categories
            if (entry && typeof entry === "object") {
                for (const action in entry) {
                    const req = entry[action]?.min_level ?? 0;
                    if (req <= lvl && req > bestReq) best = action, bestReq = req;
                }
            }
        }

        return best;
    }

    function CALC_SKILL_LEVEL_UP(skill) {
        const action = GET_LAST_UNLOCK_SKILL(skill);
        if (!action) return null;
        const config = KORUXA_CONFIGS[skill];
        let data = config[action];

        if (!data) {
            let best = null;
            let bestRatio = -1;

            for (const category of Object.values(config)) {
                const entry = category?.[action];
                if (!entry) continue;

                const ratio = (entry.xp || 0) / ((entry.duration_ms || 1));
                if (ratio > bestRatio) {
                    best = entry;
                    bestRatio = ratio;
                }
            }

            data = best;
            if (!data) return null;
        }

        // --- Bonuses ---
        const tool = KORUXA_TOOLS?.[skill] || { speed: 0, xp: 0 };
        const farm = KORUXA_FARMS?.[skill] || { speed: 0, xp: 0 };

        const speedBonus = (tool.speed + farm.speed) / 100;
        const xpBonus = (tool.xp + farm.xp) / 100;

        // --- Loop stats ---
        const xpPerLoop = (data.xp || 0) * (1 + xpBonus);
        const timePerLoop = (data.duration_ms || 0) / (1 + speedBonus);

        const stats = KORUXA_STATS[skill];
        const xpLeft = stats.xp_needed - stats.xp_current;

        if (xpLeft <= 0 || xpPerLoop <= 0) return { skill, action, loops: 0, time: "0s" };

        const loops = Math.ceil(xpLeft / xpPerLoop);
        const time = toHHMMSS((loops * timePerLoop) / 1000);

        return { skill, action, required: Math.round(xpPerLoop * loops), loops, time };
    }

    // Detect if the left-sidebar is hovered, if yes then it adds an hover class to the game layout
    const sidebarLeft = document.querySelector('.sidebar-left');
    const gameLayout = document.querySelector('.game-layout');

    if (sidebarLeft && gameLayout) {
        sidebarLeft.addEventListener('mouseenter', () => {
            gameLayout.classList.add('lside-hover');
        });

        sidebarLeft.addEventListener('mouseleave', () => {
            gameLayout.classList.remove('lside-hover');
        });
    }

    document.querySelector('#sidebar-hp-bar').after(document.querySelector('#food-bar'));

    // Auto-update current skill name on server update

    const observer = new MutationObserver(() => SET_CURRENT_SKILL_CLASS());
    observer.observe(document.body, { childList: true, subtree: true });

    // Load miscs CSS and icons
    REPLACE_ICONS();
    loadCSS("https://fonts.googleapis.com/css2?family=Saira:ital,wght@0,100..900;1,100..900&display=swap"); // Add Saira font
    loadCSS("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"); // Font Awesome Free (latest stable)
    loadCSS("https://goldenlys.github.io/Koruxa-Enhancer/css/rpg-awesome.min.css"); // RPG Awesome (custom version with more icons)
    loadCSS("https://goldenlys.github.io/Koruxa-Enhancer/css/style.css"); // Let the magic begin

    // console.table(unsafeWindow.mapping); // Debug output
    setInterval(UPDATE_DATA, 1000);
})();