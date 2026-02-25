/// ==UserScript==
// @name          Koruxa Enhanced
// @namespace     Koruxa Enhanced
// @author        Nebulys
// @version       1.18
// @homepageURL   https://github.com/GoldenLys/Koruxa-Enhancer/
// @supportURL    hhttps://github.com/GoldenLys/Koruxa-Enhancer/issues/
// @downloadURL   https://github.com/GoldenLys/Koruxa-Enhancer/raw/refs/heads/main/mod.user.js
// @updateURL     https://github.com/GoldenLys/Koruxa-Enhancer/raw/refs/heads/main/mod.user.js
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
        arcana: KORUXA_ARCANA_CONFIG,
        thieving: {},
        farming: {}
    };

    const xpTable = [
        { level: 1, xpToNext: 4, totalXp: 0 },
        { level: 2, xpToNext: 11, totalXp: 4 },
        { level: 3, xpToNext: 20, totalXp: 15 },
        { level: 4, xpToNext: 31, totalXp: 35 },
        { level: 5, xpToNext: 44, totalXp: 66 },
        { level: 6, xpToNext: 60, totalXp: 110 },
        { level: 7, xpToNext: 79, totalXp: 170 },
        { level: 8, xpToNext: 101, totalXp: 249 },
        { level: 9, xpToNext: 126, totalXp: 350 },
        { level: 10, xpToNext: 155, totalXp: 476 },
        { level: 11, xpToNext: 188, totalXp: 631 },
        { level: 12, xpToNext: 226, totalXp: 819 },
        { level: 13, xpToNext: 269, totalXp: 1045 },
        { level: 14, xpToNext: 318, totalXp: 1314 },
        { level: 15, xpToNext: 373, totalXp: 1632 },
        { level: 16, xpToNext: 435, totalXp: 2005 },
        { level: 17, xpToNext: 505, totalXp: 2440 },
        { level: 18, xpToNext: 584, totalXp: 2945 },
        { level: 19, xpToNext: 672, totalXp: 3529 },
        { level: 20, xpToNext: 771, totalXp: 4201 },
        { level: 21, xpToNext: 882, totalXp: 4972 },
        { level: 22, xpToNext: 1005, totalXp: 5854 },
        { level: 23, xpToNext: 1143, totalXp: 6859 },
        { level: 24, xpToNext: 1296, totalXp: 8002 },
        { level: 25, xpToNext: 1467, totalXp: 9298 },
        { level: 26, xpToNext: 1657, totalXp: 10765 },
        { level: 27, xpToNext: 1867, totalXp: 12422 },
        { level: 28, xpToNext: 2101, totalXp: 14289 },
        { level: 29, xpToNext: 2360, totalXp: 16390 },
        { level: 30, xpToNext: 2647, totalXp: 18750 },
        { level: 31, xpToNext: 2965, totalXp: 21397 },
        { level: 32, xpToNext: 3317, totalXp: 24362 },
        { level: 33, xpToNext: 3705, totalXp: 27679 },
        { level: 34, xpToNext: 4135, totalXp: 31384 },
        { level: 35, xpToNext: 4609, totalXp: 35519 },
        { level: 36, xpToNext: 5131, totalXp: 40128 },
        { level: 37, xpToNext: 5708, totalXp: 45259 },
        { level: 38, xpToNext: 6343, totalXp: 50967 },
        { level: 39, xpToNext: 7043, totalXp: 57310 },
        { level: 40, xpToNext: 7813, totalXp: 64353 },
        { level: 41, xpToNext: 8661, totalXp: 72166 },
        { level: 42, xpToNext: 9593, totalXp: 80827 },
        { level: 43, xpToNext: 10619, totalXp: 90420 },
        { level: 44, xpToNext: 11745, totalXp: 101039 },
        { level: 45, xpToNext: 12982, totalXp: 112784 },
        { level: 46, xpToNext: 14341, totalXp: 125766 },
        { level: 47, xpToNext: 15832, totalXp: 140107 },
        { level: 48, xpToNext: 17468, totalXp: 155939 },
        { level: 49, xpToNext: 19262, totalXp: 173407 },
        { level: 50, xpToNext: 21230, totalXp: 192669 },
        { level: 51, xpToNext: 23386, totalXp: 213899 },
        { level: 52, xpToNext: 25749, totalXp: 237285 },
        { level: 53, xpToNext: 28337, totalXp: 263034 },
        { level: 54, xpToNext: 31171, totalXp: 291371 },
        { level: 55, xpToNext: 34273, totalXp: 322542 },
        { level: 56, xpToNext: 37668, totalXp: 356815 },
        { level: 57, xpToNext: 41383, totalXp: 394483 },
        { level: 58, xpToNext: 45446, totalXp: 435866 },
        { level: 59, xpToNext: 49888, totalXp: 481312 },
        { level: 60, xpToNext: 54745, totalXp: 531200 },
        { level: 61, xpToNext: 60054, totalXp: 585945 },
        { level: 62, xpToNext: 65854, totalXp: 645999 },
        { level: 63, xpToNext: 72191, totalXp: 711853 },
        { level: 64, xpToNext: 79112, totalXp: 784044 },
        { level: 65, xpToNext: 86669, totalXp: 863156 },
        { level: 66, xpToNext: 94920, totalXp: 949825 },
        { level: 67, xpToNext: 103925, totalXp: 1044745 },
        { level: 68, xpToNext: 113752, totalXp: 1148670 },
        { level: 69, xpToNext: 124475, totalXp: 1262422 },
        { level: 70, xpToNext: 136171, totalXp: 1386897 },
        { level: 71, xpToNext: 148927, totalXp: 1523068 },
        { level: 72, xpToNext: 162837, totalXp: 1671995 },
        { level: 73, xpToNext: 178002, totalXp: 1834832 },
        { level: 74, xpToNext: 194533, totalXp: 2012834 },
        { level: 75, xpToNext: 212549, totalXp: 2207367 },
        { level: 76, xpToNext: 232181, totalXp: 2419916 },
        { level: 77, xpToNext: 253569, totalXp: 2652097 },
        { level: 78, xpToNext: 276869, totalXp: 2905666 },
        { level: 79, xpToNext: 302246, totalXp: 3182535 },
        { level: 80, xpToNext: 329881, totalXp: 3484781 },
        { level: 81, xpToNext: 359971, totalXp: 3814662 },
        { level: 82, xpToNext: 392728, totalXp: 4174633 },
        { level: 83, xpToNext: 428386, totalXp: 4567361 },
        { level: 84, xpToNext: 467193, totalXp: 4995747 },
        { level: 85, xpToNext: 509424, totalXp: 5462940 },
        { level: 86, xpToNext: 555374, totalXp: 5972364 },
        { level: 87, xpToNext: 605364, totalXp: 6527738 },
        { level: 88, xpToNext: 659742, totalXp: 7133102 },
        { level: 89, xpToNext: 718886, totalXp: 7792844 },
        { level: 90, xpToNext: 783205, totalXp: 8511730 },
        { level: 91, xpToNext: 853144, totalXp: 9294935 },
        { level: 92, xpToNext: 929185, totalXp: 10148079 },
        { level: 93, xpToNext: 1011850, totalXp: 11077264 },
        { level: 94, xpToNext: 1101706, totalXp: 12089114 },
        { level: 95, xpToNext: 1199369, totalXp: 13190820 },
        { level: 96, xpToNext: 1305503, totalXp: 14390189 },
        { level: 97, xpToNext: 1420833, totalXp: 15695692 },
        { level: 98, xpToNext: 1546140, totalXp: 17116525 },
        { level: 99, xpToNext: 1682274, totalXp: 18662665 },
        { level: 100, xpToNext: 1830156, totalXp: 20344939 },
        { level: 101, xpToNext: 1990782, totalXp: 22175095 },
        { level: 102, xpToNext: 2165234, totalXp: 24165877 },
        { level: 103, xpToNext: 2354683, totalXp: 26331111 },
        { level: 104, xpToNext: 2560400, totalXp: 28685794 },
        { level: 105, xpToNext: 2783760, totalXp: 31246194 },
        { level: 106, xpToNext: 3026253, totalXp: 34029954 },
        { level: 107, xpToNext: 3289495, totalXp: 37056207 },
        { level: 108, xpToNext: 3575236, totalXp: 40345702 },
        { level: 109, xpToNext: 3885371, totalXp: 43920938 },
        { level: 110, xpToNext: 4221954, totalXp: 47806309 },
        { level: 111, xpToNext: 4587210, totalXp: 52028263 },
        { level: 112, xpToNext: 4983547, totalXp: 56615473 },
        { level: 113, xpToNext: 5413575, totalXp: 61599020 },
        { level: 114, xpToNext: 5880121, totalXp: 67012595 },
        { level: 115, xpToNext: 6386245, totalXp: 72892716 },
        { level: 116, xpToNext: 6935261, totalXp: 79278961 },
        { level: 117, xpToNext: 7530760, totalXp: 86214222 },
        { level: 118, xpToNext: 8176626, totalXp: 93744982 },
        { level: 119, xpToNext: 8877068, totalXp: 101921608 },
        { level: 120, xpToNext: 9636642, totalXp: 110798676 }
    ];

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

        "a[href='game.php?page=news']": { // News
            icon: "fa-solid fa-newspaper",
            text: ""
        },

        "a[href='game.php?page=settings']": { // News
            icon: "fa-solid fa-gear",
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

        ".skill-category[data-category='other'] .skill-category-header .category-icon": { // Miscs
            icon: "fa-solid fa-screwdriver-wrench",
            text: ""
        },

    };

    // Extracts data from the given selector from .mapping {}
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
        CHECK_SKILLS_LEVELS();
        EXTRACT_SKILLS();
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
    const xpByLevel = Object.fromEntries(xpTable.map(e => [e.level, e])); // Get a skill required xp manually, usage: xpByLevel[level].xpToNext

    // Generates a globals for each farm stats
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

    // Generates a globals for each tool stats
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

    function CHECK_SKILLS_LEVELS() {
        for (const skill in KORUXA_STATS) {
            if (KORUXA_ALL_SKILL_LEVELS[skill] > KORUXA_STATS[skill].level) location.reloa(); // Refresh page if skill level changed, to update the sidebar xp values
        }
    }

    // Displays a helper for the current skill or the skill in the current session
    function ENHANCED_HELPER() {
        const skill = unsafeWindow.KORUXA_GLOBALS["current-skill"]?.toLowerCase();
        if (!skill) return;
        const data = CALC_SKILL_LEVEL_UP(skill);
        if (!data) return;
        const level = unsafeWindow.KORUXA_STATS[skill].level;
        const phrase =
            `Level up ${data.skill} with <b>${data.required}</b> XP<br>` +
            `Do <b>${data.label} x${data.loops}</b> (<b>${data.time}</b>)`;
        let el = document.querySelector("#enhanced-helper");

        if (el) {
            el.querySelector(".enhanced-helper-item").innerHTML = phrase;
            el.querySelector(".enhanced-helper-subtitle").textContent = `${data.skill} ${level}`;
            return;
        }

        el = document.createElement("div");
        el.id = "enhanced-helper";
        el.className = "enhanced-helper";
        el.innerHTML = `
        <div class="enhanced-helper-title">
            <i class="ra ra-crown-coin"></i> Koruxa Helper
            <span class="enhanced-helper-subtitle">${data.skill} ${level}</span>
        </div>
        <div class="enhanced-helper-item">${phrase}</div>`;

        document.querySelector(".sidebar-right")?.prepend(el);
    }

    function GET_LAST_UNLOCK_SKILL(skill) {
        const config = KORUXA_CONFIGS[skill];
        if (!config) return null;

        const lvl = KORUXA_ALL_SKILL_LEVELS?.[skill] ?? 0;
        let best = null;
        let bestReq = -1;

        for (const key in config) {
            const entry = config[key];
            const reqField = entry?.min_level !== undefined ? "min_level" : entry?.level_required !== undefined ? "level_required" : null;

            // Skills without categories
            if (reqField) {
                const req = entry[reqField];
                if (req <= lvl && req > bestReq) {
                    best = key;
                    bestReq = req;
                }
                continue;
            }

            // Skills with categories
            if (entry && typeof entry === "object") {
                for (const action in entry) {
                    const sub = entry[action];
                    const subReqField = sub?.min_level !== undefined ? "min_level" : sub?.level_required !== undefined ? "level_required" : null;
                    if (!subReqField) continue;
                    const req = sub[subReqField];
                    if (req <= lvl && req > bestReq) {
                        best = action;
                        bestReq = req;
                    }
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

                const ratio = (entry.xp || 0) / (entry.duration_ms || 1);
                if (ratio > bestRatio) {
                    best = entry;
                    bestRatio = ratio;
                }
            }

            data = best;
            if (!data) return null;
        }

        var label = data.label ?? action;
        if (skill === "herblore") label = data.name;

        // Calculate Bonuses
        const tool = KORUXA_TOOLS?.[skill] || {};
        const farm = KORUXA_FARMS?.[skill] || {};

        const premium = KORUXA_IS_PREMIUM ? 20 : 0; // premium bonus of 20% speed and xp
        const speedBonus = (tool.speed ?? 0) + (farm.speed ?? 0) + premium;
        const xpBonus = (tool.xp ?? 0) + (farm.xp ?? 0) + premium;

        console.log("speed bonus %", speedBonus, "xp bonus %", xpBonus);

        // Calculate XP + time
        const xpPerLoop = (data.xp || 0) * (1 + xpBonus / 100);
        const timePerLoop = (data.duration_ms || 0) * (1 - speedBonus / 100);

        const stats = KORUXA_STATS[skill];
        const xpLeft = (stats.xp_needed ?? 0) - (stats.xp_current ?? 0);

        if (xpLeft < 0 || xpPerLoop < 0)
            return { skill, action, label, loops: 0, time: "0s" };

        const loops = Math.ceil(xpLeft / xpPerLoop);
        const time = loops === 1 ? toHHMMSS(timePerLoop / 1000) : toHHMMSS((loops * timePerLoop) / 1000);

        return {
            skill,
            action,
            label,
            required: Math.round(xpPerLoop * loops),
            loops,
            time
        };
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

    if (document.querySelector('#food-bar')) document.querySelector('#sidebar-hp-bar').after(document.querySelector('#food-bar'));

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