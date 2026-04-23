/// ==UserScript==
// @name          Koruxa Enhanced
// @namespace     Koruxa Enhanced
// @author        Nebulys
// @version       2.71
// @homepageURL   https://github.com/GoldenLys/Koruxa-Enhancer/
// @supportURL    https://github.com/GoldenLys/Koruxa-Enhancer/issues/
// @downloadURL   https://github.com/GoldenLys/Koruxa-Enhancer/raw/refs/heads/main/mod.user.js
// @updateURL     https://github.com/GoldenLys/Koruxa-Enhancer/raw/refs/heads/main/mod.user.js
// @description   A script that adds QoL features and enhanced UI to Koruxa
// @match         https://koruxa.com/*
// @match         https://www.koruxa.com/*
// @exclude       https://koruxa.com/testing*
// @icon          https://www.google.com/s2/favicons?domain=https://koruxa.com
// @license       MIT License
// @grant         unsafeWindow
// @run-at        document-end
// @require       https://goldenlys.github.io/Koruxa-Enhancer/assets/libs/lodash.min.js
// ==/UserScript==

/* TODO & Ideas List
 - (Maybe) add "Stats" tab with more stats
 - Make the plus button generate a formula to reach the desired level with the less amount of time 
*/

const KX = unsafeWindow;
KX.KORUXA_GLOBALS = {
    "forced-current-skill": "none",
    "target-level": 0,
    "sidebar-state": "lsb-locked-closed",
    "clan-xp-bonus": 0,
    Institute: {
        // Gathering researches - 6 available
        WoodcuttersEdge: { name: "Woodcutter's Edge", effect: { category: "gathering", type: "xp_bonus", value: 1.14, skill: "woodcutting" }, level: 0, maxLevel: 50, },
        MinersEye: { name: "Miner's Eye", effect: { category: "gathering", type: "xp_bonus", value: 1.14, skill: "mining" }, level: 0, maxLevel: 50, },
        FishersPatience: { name: "Fisher's Patience", effect: { category: "gathering", type: "xp_bonus", value: 1.14, skill: "fishing" }, level: 0, maxLevel: 50 },
        GatherersTrove: { name: "Gatherer's Trove", effect: { category: "gathering", type: "double_drop", value: 0.15, skill: "all_gathering" }, level: 0, maxLevel: 50 },
        RareInsight: { name: "Rare Insight", effect: { category: "gathering", type: "rare_drop_bonus", value: 0.1, skill: "all_gathering" }, level: 0, maxLevel: 50 },
        EfficientHarvest: { name: "Efficient Harvest", effect: { category: "gathering", type: "max_speed_cap", value: 0.06, skill: "all_gathering" }, level: 0, maxLevel: 50 }, // max base speed cap is 95%, at level 50 with this it's 98%

        // Artisan researches - 6 available
        MasterCrafter: { name: "Master Crafter", effect: { category: "artisan", type: "xp_bonus", value: 1.14, skills: ["cooking", "smithing", "crafting", "fletching", "herblore"] }, level: 0, maxLevel: 50 },
        ResourceFrugality: { name: "Resource Frugality", effect: { category: "artisan", type: "crafting_materials_reduction", value: -0.1, skill: "all_artisan" }, level: 0, maxLevel: 50 },
        BonusYield: { name: "Bonus Yield", effect: { category: "artisan", type: "double_drop", value: 0.1, skill: "all_artisan" }, level: 0, maxLevel: 50 },
        FireControl: { name: "Fire Control", effect: { category: "artisan", type: "firemaking_success_rate_bonus", value: -0.15, skill: "firemaking" }, level: 0, maxLevel: 50 },
        EnchantersLuck: { name: "Enchanter's Luck", effect: { category: "artisan", type: "enchanting_success_rate_bonus", value: 0.1, skill: "enchanting" }, level: 0, maxLevel: 50 },
        StableBonds: { name: "Stable Bonds", effect: { category: "artisan", type: "enchanting_destroy_rate_bonus", value: -0.1, skill: "enchanting" }, level: 0, maxLevel: 50 },

        // Combat researches - 6 available
        StrikeTraining: { name: "Strike Training", effect: { category: "combat", type: "melee_power_bonus", value: 0.2 }, level: 0, maxLevel: 50 },
        Marksmanship: { name: "Marksmanship", effect: { category: "combat", type: "ranged_power_bonus", value: 0.2 }, level: 0, maxLevel: 50 },
        ArcaneFocus: { name: "Arcane Focus", effect: { category: "combat", type: "magic_power_bonus", value: 0.2 }, level: 0, maxLevel: 50 },
        IronHide: { name: "Iron Hide", effect: { category: "combat", type: "defence_bonus", value: 0.15 }, level: 0, maxLevel: 50 },
        KillerInstinct: { name: "Killer Instinct", effect: { category: "combat", type: "crit_chance_bonus", value: 0.1 }, level: 0, maxLevel: 50 },
        ClanWarfare: { name: "Clan Warfare", effect: { category: "combat", type: "clan_boss_damage_bonus", value: 0.2 }, level: 0, maxLevel: 50 },

        // Global researches - 6 available
        GoldenTouch: { name: "Golden Touch", effect: { category: "global", type: "gold_find_bonus", value: 0.3 }, level: 0, maxLevel: 50 },
        ScholarsMind: { name: "Scholar's Mind", effect: { category: "global", type: "xp_bonus", value: 0.15 }, level: 0, maxLevel: 50 },
        FortunesFavor: { name: "Fortune's Favor", effect: { category: "global", type: "drop_rate_bonus", value: 0.1 }, level: 0, maxLevel: 50 },
        DailyFocus: { name: "Daily Focus", effect: { category: "global", type: "daily_quest_reward_bonus", value: 0.5 }, level: 0, maxLevel: 50 },
        FirstHourFocus: { name: "First Hour Focus", effect: { category: "global", type: "first_hour_xp_bonus", value: 0.5 }, level: 0, maxLevel: 50 },
        ExtendedSlumber: { name: "Extended Slumber", effect: { category: "global", type: "afk_time_bonus", value: 10 }, level: 0, maxLevel: 50 },

        // Meta researches - 3 available
        ResearchVelocity: { name: "Research Velocity", effect: { category: "meta", type: "research_speed_bonus", value: 1.0 }, level: 0, maxLevel: 75 },
        CostReduction: { name: "Cost Reduction", effect: { category: "meta", type: "research_cost_reduction", value: -0.3 }, level: 0, maxLevel: 50 },
        ApprenticeTraining: { name: "Apprentice Training", effect: { category: "meta", type: "research_materials_reduction", value: -0.5 }, level: 0, maxLevel: 50 }
    }
};
KX.KORUXA_CONFIGS = {};
KX.KORUXA_STATS = {};
KX.KORUXA_TOOLS = {};
KX.KORUXA_FARMS = {};
KX.GET_XP_MULTIPLIER = null;
KX.KORUXA_ENHANCED = {
    isKXLoaded: false,
    isKXReady: false,
    isReadyFuncRunOnce: false,
    isUpdating: false,
    isInstituteSynced: false
};
KX.__koruxa_intervals = KX.__koruxa_intervals || [];
KX.__koruxa_updater_started = KX.__koruxa_updater_started || false;
KX.mapping = { // Mappings of game data
    coins: { selector: "#topbar-coins-text", value: "0" },
    username: { selector: "#topbar-username", value: "" },
    "total-level": { selector: "#topbar-total-level", value: "0" },
    //"total-xp": { selector: ".user-total-level .total-level-tooltip", value: "0" },
    credits: { selector: "#topbar-credits-text", value: "0" },
    sealpoints: { selector: "#topbar-seal-text", value: "0" },
    //"online-players": { selector: ".online-count", value: "0" },
    "current-skill": { selector: "#session-action-row2", value: "" },
    "current-item": { selector: "#session-action-row2", value: "" },
    "current-hp": { selector: "#hp-text", value: "0" },
    "max-hp": { selector: "#hp-text", value: "0" },
    "session-time-left": { selector: "#session-time-row2", value: "" },
    cycle: { selector: "#session-cycles-row2", value: { current: "0", total: "0" } },
    "session-xp-rate": { selector: "#topbar-xph", value: "0" },
};

(function () {
    'use strict';

    fetch('https://goldenlys.github.io/Koruxa-Enhancer/assets/js/data.json').then(response => response.json()).then(data => { KX.KORUXA_CONFIGS = data; })
        .catch(error => console.error('Error loading gamedata JSON:', error));

    const imageOverrides = {
        "/logs/log_basic.png": "https://goldenlys.github.io/Koruxa-Enhancer/assets/images/items/log_basic.webp",
        "/logs/log_oak.png": "https://goldenlys.github.io/Koruxa-Enhancer/assets/images/items/log_oak.webp",
        "/logs/log_ironbark.png": "https://goldenlys.github.io/Koruxa-Enhancer/assets/images/items/log_ironbark.webp",
        "/logs/log_ancient.png": "https://goldenlys.github.io/Koruxa-Enhancer/assets/images/items/log_ancient.webp",
        "/logs/log_frostwood.png": "https://goldenlys.github.io/Koruxa-Enhancer/assets/images/items/log_frostwood.webp",
        "/logs/log_emberwood.png": "https://goldenlys.github.io/Koruxa-Enhancer/assets/images/items/log_emberwood.webp",
        "/logs/log_moonwood.png": "https://goldenlys.github.io/Koruxa-Enhancer/assets/images/items/log_moonwood.webp",
        "/logs/log_spirit.png": "https://goldenlys.github.io/Koruxa-Enhancer/assets/images/items/log_spirit.webp",
        "/logs/log_void.png": "https://goldenlys.github.io/Koruxa-Enhancer/assets/images/items/log_void.webp",
        "/logs/log_worldtree.png": "https://goldenlys.github.io/Koruxa-Enhancer/assets/images/items/log_worldtree.webp",
        "/bars/dustite_bar.png": "https://goldenlys.github.io/Koruxa-Enhancer/assets/images/items/dustite_bar.webp",
    };

    // Mappings for REPLACE_ICONS()
    const iconReplacements = {

        // General
        "a[href='/logout']": { // Log out
            icon: "fa-solid fa-right-from-bracket", text: " Logout"
        },
        "a[href='/characters']": { // Change character
            icon: "fa-solid fa-person-walking-dashed-line-arrow-right", text: "Switch"
        },
        "a[href='game.php?page=leaderboard']": { // Leaderboard
            icon: "ra ra-trophy", text: ""
        },
        "a[href='game.php?page=shop']": { // Buy credits
            icon: "fa-solid fa-plus", text: "Buy"
        },
        "session-stop[title='Stop']": { // Session stop
            icon: "fa-solid fa-xmark", text: ""
        },
        "#session-renew-btn-row2": { // Session renew
            icon: "fa-solid fa-arrows-rotate", text: ""
        },
        ".notif-bell-icon[title='Messages']": { // Messages
            icon: "ra ra-speech-bubble", text: ""
        },

        // Daily Quests
        ".dm-reward-icon": { // Daily Quests reward
            icon: "fa-solid fa-gift", text: " Reward"
        },

        ".dm-reroll-btn": { // Daily Quests reroll
            icon: "fa-solid fa-redo", text: ""
        },

        ".dm-bonus-locked": { // Daily Quests rocked
            icon: "ra ra-padlock", text: ""
        },

        // Topbar
        "#topbar-premium>span:not([id])": { // Topbar Premium Badge
            icon: "ra ra-jewel-crown", text: ""
        },

        ".prf-premium-badge": { // User Premium Badge
            icon: "ra ra-jewel-crown", text: ""
        },

        ".quest-tracker-icon": { // Quest Tracker
            icon: "ra ra-stabbed-note", text: ""
        },

        ".sidebar-inventory-title>span:not([class])": { // Inventory
            icon: "ra ra-light-backpack", text: " Inventory"
        },

        ".sidebar-inventory-title a[href='game.php?page=bank']": { // Bank
            icon: "ra ra-strongbox", text: " Bank"
        },

        "a[onclick*='news']": { // Footer news
            icon: "fa-solid fa-newspaper", text: ""
        },

        "a[onclick*='settings']": { // Footer settings
            icon: "fa-solid fa-gear", text: ""
        },

        "a[onclick*='institute']": { // Institute
            icon: "fa-solid fa-building-columns", text: ""
        },

    };

    const xpToNext = [
        4, 11, 20, 31, 44, 60, 79, 101, 126, 155, 188, 226, 269, 318, 373, 435, 505, 584, 672, 771, 882, 1005, 1143, 1296, 1467, 1657, 1867, 2101, 2360, 2647,
        2965, 3317, 3705, 4135, 4609, 5131, 5708, 6343, 7043, 7813, 8661, 9593, 10619, 11745, 12982, 14341, 15832, 17468, 19262, 21230, 23386, 25749,
        28337, 31171, 34273, 37668, 41383, 45446, 49888, 54745, 60054, 65854, 72191, 79112, 86669, 94920, 103925, 113752, 124475, 136171, 148927,
        162837, 178002, 194533, 212549, 232181, 253569, 276869, 302246, 329881, 359971, 392728, 428386, 467193, 509424, 555374, 605364, 659742, 718886,
        783205, 853144, 929185, 1011850, 1101706, 1199369, 1305503, 1420833, 1546140, 1682274, 1830156, 1990782, 2165234, 2354683, 2560400, 2783760,
        3026253, 3289495, 3575236, 3885371, 4221954, 4587210, 4983547, 5413575, 5880121, 6386245, 6935261, 7530760, 8176626, 8877068, 9636642
    ];

    // Extracts data from the given selector from .mapping {}
    function EXTRACT_DATA(selector, key = "") {
        const el = document.querySelector(selector);
        if (!el) return "(not found)";
        let text = el.textContent.trim();

        switch (selector) {
            case "#topbar-total-level": {
                if (!text) return "(no text)";
                const num = el.childNodes[0]?.textContent.match(/\d+/);
                return num ? num[0] : "(no number)";
            }

            case "#topbar-coins-text": {
                if (!text) return "(no text)";
                const num = text.match(/[\d.]+/);
                return num ? num[0] : "(no number)";
            }

            case "#session-cycles-row2": {
                if (!text || text == "0 ticks") text = "0/0 ticks · 0s/tick";
                const m = text.replace("~", "").match(/(\d+)\s*\/\s*(\d+)/);
                if (m[1] !== KORUXA_GLOBALS.cycle?.current || m[2] !== KORUXA_GLOBALS.cycle?.total) {
                    EXTRACT_SKILLS(KX.KORUXA_GLOBALS["current-skill"]);
                }
                return m ? { current: m[1], total: m[2] } : "(invalid format)";
            }

            case "#session-action-row2": {
                if (!text || text == "Idle") text = "Doing: nothing";
                const s = text.match(/([^:]+):\s*(.+)/);
                if (s[1] !== KX.KORUXA_GLOBALS?.["current-skill"] || s[2] !== KX.KORUXA_GLOBALS?.["current-item"]) {
                    EXTRACT_SKILLS();
                }
                return s ? key === "current-skill" ? s[1] : s[2] : "(invalid format)";
            }

            case "#hp-text": {
                if (!text) return "(no text)";
                const hpv = text.match(/(\d+)\/(\d+)/);
                return hpv ? (key === "current-hp" ? hpv[1] : hpv[2]) : "(invalid format)";
            }
        }
        return el.value || text;
    }

    async function simulateSkillHover(type = "all", duration = 10) {
        const selector = type === "all"
            ? '.skill-item[data-skill], .skill-link[data-skill]'
            : `.skill-item[data-skill="${type}"], .skill-link[data-skill="${type}"]`;

        const skills = document.querySelectorAll(selector);

        for (const skill of skills) {
            const skillName = skill.getAttribute('data-skill') || skill.innerText.trim().toLowerCase();

            if (typeof showSkillTooltip === 'function') showSkillTooltip(skill, skillName);
            await new Promise(r => setTimeout(r, duration));
            if (typeof hideSkillTooltip === 'function') hideSkillTooltip();
        }
    }

    function parseAndStoreSkillData(tip) {
        let name = tip.id.replace("stt-", "").toLowerCase();
        if (name === "alt.magic") name = "alchemy"; // ion know if this is still used but just in case lol

        const level = parseInt(document.getElementById(`sl-${name}`)?.textContent) || 1;
        const totalXP = parseInt(tip.querySelector(".skill-tt-total strong")?.textContent.replace(/,/g, "")) || 0;
        const baseXPForLevel = GET_XP(level, "Total");
        const currentXPInLevel = totalXP - baseXPForLevel;
        const requiredXPForNext = xpToNext[level - 1] || 0;

        KX.KORUXA_STATS[name] = {
            level: level,
            xp_current: currentXPInLevel,
            xp_needed: requiredXPForNext,
            xp_total: totalXP
        };
    }
    async function EXTRACT_SKILLS(type = "all") {
        await simulateSkillHover(type, 10);
        const tooltipSelector = type === "all" ? ".skill-tooltip" : `.skill-tooltip#stt-${type}`;

        document.querySelectorAll(tooltipSelector).forEach(parseAndStoreSkillData);

        if (typeof hideSkillTooltip === 'function') hideSkillTooltip();
    }

    // Updates values and create new html elements
    function UPDATE_DATA() {
        for (const key in KX.mapping) {
            const entry = KX.mapping[key];
            const result = EXTRACT_DATA(entry.selector, key);
            KX.KORUXA_GLOBALS[key] = entry.value;
            if (key === "cycle" && typeof result === "object") entry.value = result;
            else entry.value = result;
            if (KX.mapping[key].value !== undefined && !KX.KORUXA_ENHANCED.isKXReady) KX.KORUXA_ENHANCED.isKXReady = true;
        }
        if (!KX.KORUXA_ENHANCED.isKXLoaded && KX.KORUXA_ENHANCED.isKXReady) EXTRACT_SKILLS();
        if (Object.keys(KX.KORUXA_STATS).length > 0 && Object.keys(KX.KORUXA_CONFIGS).length > 0 && KX.mapping["current-skill"].value !== "Doing" && KX.mapping["cycle"].current !== "0") KX.KORUXA_ENHANCED.isKXLoaded = true;

        AUTO_CLAN_BOSS();
        REPLACE_IMAGES(imageOverrides);
        if (KX.KORUXA_ENHANCED.isKXReady && KX.KORUXA_ENHANCED.isKXLoaded && !KX.KORUXA_ENHANCED.isReadyFuncRunOnce) {
            KX.KORUXA_ENHANCED.isReadyFuncRunOnce = true;
            ENHANCED_CHAT_LOG(`Koruxa Enhanced is enabled and ready.`, 'success');
            GET_BEST_XP_EFFICIENCY();
            DISPLAY_THIEVING_GOLD_RANKING();
            HIGHLIGHT_LEADERBOARD();
            LOAD_FARM_STATS();
            LOAD_TOOL_STATS();
            KX.KORUXA_IS_PREMIUM = document.querySelector("#topbar-premium>span:not([id])") ? true : false;
        }
        if (KX.KORUXA_ENHANCED.isKXReady && KX.KORUXA_ENHANCED.isKXLoaded) {
            DISPLAY_COMBAT_LEVEL(KORUXA_STATS.attack?.level, KORUXA_STATS.strength?.level,
                KORUXA_STATS.defence?.level, KORUXA_STATS.hitpoints?.level,
                KORUXA_STATS.magic?.level, KORUXA_STATS.ranged?.level);
            const clanEl = document.querySelector("#page-content>div[style]:not([class]):not([id])>div[style*='font-size:10px;']:not([class]):not([id])");
            if (clanEl) {
                const match = clanEl.textContent.match(/Clan: XP\+(\d+(?:\.\d+)?)%/);
                const extractedXP = match ? parseFloat(match[1]) : 0;

                if (extractedXP > Number(KX.CLAN_XP_BONUS || 0)) {
                    KX.CLAN_XP_BONUS = String(extractedXP);
                    KX.KORUXA_GLOBALS["clan-xp-bonus"] = KX.CLAN_XP_BONUS;
                    NEH_STORAGE('save');
                }
            }

            if (!KX.CLAN_XP_BONUS || KX.CLAN_XP_BONUS === "0") {
                KX.CLAN_XP_BONUS = KX.KORUXA_GLOBALS["clan-xp-bonus"] || "0";
            }

            if (KX.KORUXA_GLOBALS["current-skill"] !== "Doing") NEH();

            const isAtInstitute = document.querySelector('.page-header h1')?.textContent.includes('🏛');
            if (isAtInstitute && !KX.KORUXA_ENHANCED.isInstituteSynced) {
                FIND_INSTITUTE_BONUSES();
                KX.KORUXA_ENHANCED.isInstituteSynced = true;
                ENHANCED_CHAT_LOG('Institute bonuses have been updated for this tab, click on another institute tab to refresh the others.', 'info');
            }
            if (!isAtInstitute) KX.KORUXA_ENHANCED.isInstituteSynced = false;
        }
    }

    function GET_CURRENT_SKILL() {
        KX.KORUXA_GLOBALS["current-skill"] = KX.mapping["current-skill"].value || "";
        const skillBlacklist = ["slayer", "attack", "strength", "defence", "hitpoints", "magic", "ranged"];
        const defaultSkill = "woodcutting";
        let skill = (KX.KORUXA_GLOBALS["forced-current-skill"] || KX.KORUXA_GLOBALS["current-skill"] || "none").toLowerCase().trim();
        if (!skill || skill === "none" || skillBlacklist.includes(skill)) return defaultSkill;
        return skill;
    }

    function LOAD_CSS(url) {
        if (document.querySelector(`link[href="${url}"]`)) return;

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        document.head.appendChild(link);
    }

    function LOAD_JS(url) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${url}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement("script");
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function FORMAT_TIME(sec) {
        sec = parseInt(sec, 10);

        const days = Math.floor(sec / 86400);
        const hours = Math.floor((sec % 86400) / 3600);
        const minutes = Math.floor((sec % 3600) / 60);
        const seconds = sec % 60;

        const parts = [];

        if (days > 0) parts.push(days + "d");
        if (hours > 0) parts.push(hours + "h");
        if (minutes > 0) parts.push(minutes + "m");
        if (seconds > 0 || parts.length === 0) parts.push(seconds + "s");

        return parts.join(" ");
    }

    function REPLACE_ICONS() {
        for (const selector in iconReplacements) {
            const cfg = iconReplacements[selector];
            const elements = document.querySelectorAll(selector);
            if (!elements.length) continue;

            elements.forEach(el => {
                if (el.dataset.iconified === "1") return;
                let iconHTML = "";

                if (Array.isArray(cfg.icon)) cfg.icon.forEach(iconClass => { iconHTML += `<i class="${iconClass}"></i> `; });
                else iconHTML = `<i class="${cfg.icon}"></i> `;

                const textHTML = cfg.text ? `<span class="icon-text">${cfg.text}</span>` : "";
                el.innerHTML = iconHTML + textHTML;
                el.dataset.iconified = "1";
            });
        }
    }

    const cleanName = str => str.replace(/[^\w\s]/g, "").trim(); // Remove emojis + trim
    const cleanValue = str => Number(str.replace(/[^\d.-]/g, "")); // Convert "+15%" → 15
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms)); // Creates a delay for async functions

    function GET_XP(level, type = "ExpToNext") { // Usage : GET_XP(level, type)
        if (level < 1 || level > xpToNext.length) return null;

        let total = 0;
        for (let i = 0; i < level - 1; i++) { total += xpToNext[i]; }

        if (type === "ExpToNext") return (level - 1);
        else return total;
    }

    function GET_LEVEL_FROM_XP(totalXp, skillName) {
        let cumulative = 0;
        for (let i = 0; i < xpToNext.length; i++) {
            cumulative += xpToNext[i];
            if (totalXp < cumulative) return i + 1;
        }
        return xpToNext.length + 1;
    }

    function FORMAT_NUMBER(num, decimals = 0) {
        if (typeof num !== "number" || isNaN(num)) return "0,0";
        const fixed = num.toFixed(decimals);
        let [intPart, decPart] = fixed.split(".");
        intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return decPart ? `${intPart},${decPart}` : intPart;
    }

    // Generates a globals for each farm stats
    function LOAD_FARM_STATS() {
        const SPEED = [0, 2, 4, 6, 8, 10, 12, 14, 16];
        const XP = [0, 1, 2, 4, 6, 8, 10, 15, 20];
        const targetSkills = ['woodcutting', 'mining', 'fishing', 'farming', 'cooking', 'thieving', 'fletching', 'crafting', 'herblore', 'smithing', 'firemaking', 'arcana'];

        const farmElements = document.querySelectorAll('div[onclick^="openFarmModal"]');

        const result = Array.from(farmElements).reduce((acc, el) => {
            const onclickAttr = el.getAttribute('onclick') || "";
            const skillMatch = onclickAttr.match(/'([^']+)'/);
            const skill = skillMatch ? skillMatch[1] : null;

            if (!skill) return acc;

            const levelDiv = Array.from(el.querySelectorAll('div')).find(d => d.textContent.includes('Lvl'));
            const m = levelDiv ? levelDiv.textContent.match(/Lvl\s+(\d+)/) : null;
            const lvl = m ? Math.max(0, Math.min(Number(m[1]), SPEED.length - 1)) : 0;

            acc[skill] = { level: lvl, speed: SPEED[lvl] || 0, xp: XP[lvl] || 0 };
            return acc;
        }, Object.create(null));

        targetSkills.forEach(s => {
            if (!result[s]) result[s] = { level: 0, speed: 0, xp: 0 };
        });

        window.KX = window.KX || {};
        try {
            if (JSON.stringify(KX.KORUXA_FARMS || {}) !== JSON.stringify(result)) {
                KX.KORUXA_FARMS = result;
            }
        } catch (e) {
            KX.KORUXA_FARMS = result;
        }
    }

    // Generates a globals for each tool stats
    async function LOAD_TOOL_STATS() {
        const skills = ['woodcutting', 'mining', 'fishing', 'farming', 'cooking', 'thieving', 'fletching', 'crafting', 'herblore', 'smithing', 'firemaking', 'arcana'/*, 'alchemy', 'slayer'*/];
        for (const skill of skills) {
            KX.KORUXA_TOOLS[skill] = KX.KORUXA_TOOLS[skill] || { speed: 0, xp: 0 };

            try {
                const mockEvent = { clientX: 0, clientY: 0 };
                showToolSlotTooltip(mockEvent, `tool_${skill}`);
                await wait(50);
                const tooltip = document.getElementById('item-tooltip');

                if (tooltip) {
                    const statsElements = tooltip.querySelectorAll('.tooltip-stat');
                    statsElements.forEach(statRow => {
                        const labelSpan = statRow.querySelector('span:first-child');
                        const valueSpan = statRow.querySelector('span:last-child');

                        if (labelSpan && valueSpan) {
                            const labelText = labelSpan.innerText.trim();
                            const valueText = valueSpan.innerText.trim(); // Ex: "+18%"
                            const pureNumber = parseFloat(valueText.replace(/[^\d.-]/g, '')) || 0;
                            if (labelText.includes('Speed')) {
                                KX.KORUXA_TOOLS[skill].speed = pureNumber;
                            } else if (labelText.includes('XP')) {
                                KX.KORUXA_TOOLS[skill].xp = pureNumber;
                            }
                        }
                    });
                }

                if (typeof hideTooltip === 'function') hideTooltip();
            } catch (error) {
                console.warn(`Error loading tool stats for ${skill}:`, error);
            }
        }
    }

    function GET_LAST_UNLOCK_SKILL(skill, level = 0) {
        const config = KX.KORUXA_CONFIGS?.[skill];
        if (!config) return [];
        const currentLvl = ((KX.KORUXA_STATS || {})[skill] || {}).level || 1;
        const lvl = level > 0 ? level : currentLvl;
        const unlocked = [];

        for (const key in config) {
            const entry = config[key];

            if (entry.min_level !== undefined) {
                if (entry.min_level <= lvl) unlocked.push({ action: key, req: entry.min_level });
                continue;
            }

            if (typeof entry === "object") {
                for (const sub in entry) {
                    const e = entry[sub];
                    if (e.min_level !== undefined && e.min_level <= lvl) {
                        unlocked.push({ action: sub, req: e.min_level });
                    }
                }
            }
        }

        return unlocked.sort((a, b) => b.req - a.req).map(x => x.action);
    }

    function CALC_SKILL_LEVEL_UP(skill, targetLevel = 0) {
        const BLACKLISTED_CATEGORIES = ['magic_gear', 'ranged_gear'];

        const actions = GET_LAST_UNLOCK_SKILL(skill);
        if (!actions || actions.length === 0) return null;

        const config = KX.KORUXA_CONFIGS?.[skill] || {};
        const stats = KX.KORUXA_STATS?.[skill] || {};
        const currentLevel = Number(stats.level) || 1;
        const premiumBonus = (KX.KORUXA_IS_PREMIUM ? 20 : 0);
        const currentXP = Number(stats.xp_total) || 0;
        const targetXP = targetLevel > 0 ? GET_XP(targetLevel, "total") : (Number(stats.xp_needed) || 0);
        const xpLeft = Math.max(0, targetXP - currentXP);

        const compute = (action, e) => {
            const label = e.label ?? action;
            const tools = KX.KORUXA_TOOLS?.[skill] || {};
            const farms = KX.KORUXA_FARMS?.[skill] || {};

            let successChance = 100;
            if (skill === 'thieving') {
                successChance = GET_THIEVING_CHANCE(currentLevel, e);
            }

            const speed = (tools.speed || 0) + (farms.speed || 0) + premiumBonus;
            const xpBonus = (tools.xp || 0) + (farms.xp || 0) + premiumBonus + (KX.CLAN_XP_BONUS || 0);
            const effectiveXP = (e.xp || 0) * (successChance / 100);
            const xpPerLoop = effectiveXP * (1 + xpBonus / 100);
            const msPerLoop = (e.duration_ms || 0) * Math.max(0, 1 - speed / 100);
            if (xpLeft <= 0 || xpPerLoop <= 0) return { skill, action, label, loops: 0, time: "0s", required: 0 };
            const loops = Math.ceil(xpLeft / xpPerLoop);
            const rawIng = e.ingredients || e.recipe || e.input || {};

            return {
                skill, action, label,
                success_chance: successChance,
                required: Math.round(xpPerLoop * loops),
                loops,
                ingredients_list: Object.fromEntries(Object.entries(rawIng).map(([k, v]) => [k, v * loops])),
                time: FORMAT_TIME(Math.round((loops * msPerLoop) / 1000))
            };
        };

        const bestActions = _.chain(config)
            .omit(BLACKLISTED_CATEGORIES)
            .flatMap((catContent, catName) => {
                return _.map(actions, (action) => {
                    const e = catContent?.[action] || (catName === action ? catContent : null);
                    if (!e || !e.xp) return null;

                    let chance = 100;
                    if (skill === 'thieving') {
                        chance = GET_THIEVING_CHANCE(currentLevel, e);
                    }

                    const effectiveXP = e.xp * (chance / 100);
                    const ratio = effectiveXP / Math.max(1, e.duration_ms);

                    return { action, entry: e, ratio: ratio };
                });
            })
            .compact()
            .uniqBy('action')
            .orderBy(['ratio'], ['desc'])
            .take(3)
            .value();

        return _.map(bestActions, (c) => compute(c.action, c.entry));
    }

    function GET_THIEVING_PROFIT_STATS(actionId) {
        const thievingConfig = KX.KORUXA_CONFIGS?.thieving || {};
        const data = thievingConfig[actionId];
        if (!data) return null;
        const GoldFindBonus = (KX.KORUXA_GLOBALS.Institute?.["GoldenTouch"]?.effect.value * KX.KORUXA_GLOBALS.Institute?.["GoldenTouch"].level) || 0;
        const stats = KX.KORUXA_STATS?.thieving || {};
        const currentLevel = Number(stats.level) || 1;
        const tools = KX.KORUXA_TOOLS?.thieving || {};
        const farms = KX.KORUXA_FARMS?.thieving || {};
        const premiumBonus = (KX.KORUXA_IS_PREMIUM ? 20 : 0);
        const speedBonus = (tools.speed || 0) + (farms.speed || 0) + premiumBonus;
        const chance = currentLevel >= data.min_level ? GET_THIEVING_CHANCE(currentLevel, data) : 0;
        const coinsRange = data.coins.split('-').map(Number);
        const avgCoins = ((coinsRange[0] + coinsRange[1]) / 2) * (1 + GoldFindBonus / 100); 
        const realDurationMs = data.duration_ms * Math.max(0.1, 1 - speedBonus / 100);
        const goldPerSec = (avgCoins * (chance / 100)) / (realDurationMs / 1000);
        
        return {
            key: actionId,
            label: data.label,
            level: data.min_level,
            successChance: chance,
            goldPerSec: goldPerSec,
            goldPerHour: goldPerSec * 3600,
            isUnlocked: currentLevel >= data.min_level
        };
    }

    function DISPLAY_THIEVING_GOLD_RANKING() {
        const thievingConfig = KX.KORUXA_CONFIGS?.thieving;
        if (!thievingConfig) return;

        const rankings = Object.keys(thievingConfig)
            .map(id => GET_THIEVING_PROFIT_STATS(id))
            .filter(item => item !== null)
            .sort((a, b) => b.goldPerHour - a.goldPerHour);

        var RANKING = "[b]Best Gold Efficiency for Thieving (Gold/h)[/b]";

        if (rankings.length === 0) {
            ENHANCED_CHAT_LOG("No data available to calculate Gold efficiency.", 'error');
        } else {
            rankings.forEach((item, index) => {
                const medal = index === 0 ? "🏆" : (index + 1) + ".";
                const formattedGPH = Math.round(item.goldPerHour).toLocaleString();
                const color = item.isUnlocked ? "#ffffff" : "#888888";

                RANKING += `[newline][normal]${medal} [warning]${formattedGPH} Gold/h[/warning] with ${item.label} [${item.successChance}% success] [Lvl ${item.level}][/normal]`;
                `[normal]${medal} [warning]${formattedGPH} Gold/h[/warning] with ${item.label} [${item.successChance}% success] [Lvl ${item.level}][/normal]`;
            });
            ENHANCED_CHAT_LOG(RANKING, 'info');
        }
    }

    function CALC_SESSION_XP() {
        const skillId = KX.KORUXA_GLOBALS['current-skill']?.trim().toLowerCase();
        const identifier = KX.KORUXA_GLOBALS['current-item'];
        const cycle = KX.KORUXA_GLOBALS.cycle;

        if (!skillId || !identifier || !cycle) return null;

        const config = KX.KORUXA_CONFIGS?.[skillId] || {};
        let itemData = null;
        let finalKey = null;

        const searchStr = identifier.toString().toLowerCase().trim().replace(" ", "_");

        for (const [key, value] of Object.entries(config)) {
            if (!value || typeof value !== 'object') continue;

            const checkMatch = (k, v) => {
                const lowKey = k.toLowerCase();
                const lowLabel = v.label ? v.label.toString().toLowerCase().trim() : "";
                return lowKey === searchStr || lowLabel === searchStr;
            };

            if (value.xp !== undefined) {
                if (checkMatch(key, value)) {
                    itemData = value;
                    finalKey = key;
                    break;
                }
            } else {
                for (const [subKey, subValue] of Object.entries(value)) {
                    if (subValue && typeof subValue === 'object' && checkMatch(subKey, subValue)) {
                        itemData = subValue;
                        finalKey = subKey;
                        break;
                    }
                }
            }
            if (itemData) break;
        }

        if (!itemData) return null;
        const xpBonusTotal = GET_XP_MUTLTIPLIER(skillId);

        const xpPerLoop = (itemData.xp || 0) * (1 + xpBonusTotal / 100);
        const currentLoops = Number(cycle.current) || 0;
        const totalLoops = Number(cycle.total) || 0;

        return {
            skill: skillId,
            itemKey: finalKey,
            xpGained: Math.round(currentLoops * xpPerLoop),
            xpRemaining: Math.round(Math.max(0, totalLoops - currentLoops) * xpPerLoop),
            xpTotalSession: Math.round(totalLoops * xpPerLoop),
            xpPerLoop: xpPerLoop,
            loops: (totalLoops - currentLoops),
            progress: totalLoops > 0 ? Math.min(100, (currentLoops / totalLoops) * 100) : 0
        };
    }

    // Displays a helper for the current skill or forced skill
    function NEH() {
        const SKILL_ICONS = {
            woodcutting: "ra ra-fire-axe", mining: "ra ra-war-pick", fishing: "ra ra-fishing-pole",
            farming: "ra ra-wheat", thieving: "ra ra-balaclava", arcana: "ra ra-spell-book",
            cooking: "ra ra-meat", fletching: "ra ra-arrowhead", crafting: "ra ra-claw-hammer",
            herblore: "ra ra-potion-ball", smithing: "ra ra-anvil-impact", firemaking: "ra ra-campfire",
            alchemy: "ra ra-fizzing-flask", default: "fa-solid fa-star"
        };

        const forced = (KX.KORUXA_GLOBALS?.["forced-current-skill"] || "").toLowerCase();
        const current = (KX.KORUXA_GLOBALS?.["current-skill"] || "").toLowerCase();
        var skill = (forced && forced !== "none") ? forced : (current || null);
        if (skill === "attack" || skill === "strength" || skill === "defence" || skill === "hitpoints" || skill === "magic" || skill === "ranged") skill = "woodcutting"; // skip combat skills
        if (!skill) return;

        const level = Number(KX.KORUXA_STATS?.[skill]?.level ?? 0);
        let tLvl = Number(KX.KORUXA_GLOBALS["target-level"] ?? level);
        if (tLvl < level) tLvl = (level + 1);
        KX.KORUXA_GLOBALS["target-level"] = tLvl;

        const result = tLvl > level ? CALC_SKILL_LEVEL_UP(skill, tLvl) : CALC_SKILL_LEVEL_UP(skill);
        if (!result?.length) return;

        const [first, second, third] = result;
        const approx = skill === "thieving" ? "~" : "";

        const formatIng = (item) => {
            if (!item || !item.ingredients_list) return "";
            const list = Object.entries(item.ingredients_list)
                .map(([name, qty]) => `${FORMAT_NUMBER(qty, 0)} ${name}`)
                .join(", ");
            return list ? `<br><div class="neh-req">Requires: ${list}</div>` : "";
        };

        const phrase = [
            `<div class="neh-summary">Reach ${first.skill} level <b>${tLvl}</b> with <b>${FORMAT_NUMBER(first.required)}</b> XP</div>`,
            `<div class="neh-option-item">1. <b>${first.label} ${approx}x${FORMAT_NUMBER(first.loops, 0)}</b> — <b>${first.time}</b>${formatIng(first)}</div>`,
            second ? `<div class="neh-option-item">2. <b>${second.label} ${approx}x${FORMAT_NUMBER(second.loops, 0)}</b> — <b>${second.time}</b>${formatIng(second)}</div>` : null,
            third ? `<div class="neh-option-item">3. <b>${third.label} ${approx}x${FORMAT_NUMBER(third.loops, 0)}</b> — <b>${third.time}</b>${formatIng(third)}</div>` : null
        ].filter(Boolean).join("");
        let el = document.querySelector("#neh-helper");
        if (!el) {
            el = document.createElement("div");
            el.id = "neh-helper";
            el.className = "neh-helper";
            el.innerHTML = `
            <div class="neh-btns"></div>
            <div class="neh-content">
                <div class="neh-text">
                    <div class="neh-title"><i class="ra ra-crown-coin"></i> Koruxa Helper <span class="neh-subtitle"></span></div>
                    <div class="neh-item"></div>
                </div>
                <div class="neh-right-buttons">
                    <div id="NEH-Plus" class="neh-button"><i class="fa-solid fa-plus"></i></div>
                    <div id="NEH-Minus" class="neh-button"><i class="fa-solid fa-minus"></i></div>
                </div>
            </div><div class="neh-content">
                <div id="neh-footer" class="neh-footer"></div>
            </div>`;
            document.querySelector(".sidebar-right")?.prepend(el);

            el.querySelector("#NEH-Plus").addEventListener('click', function () {
                if (this.hasAttribute("disabled")) return;
                const skill = GET_CURRENT_SKILL();
                const currentLevel = Number(KX.KORUXA_STATS?.[skill]?.level ?? 0);
                const target = Number(KX.KORUXA_GLOBALS["target-level"] || currentLevel);

                if (target < 120) {
                    KX.KORUXA_GLOBALS["target-level"] = target + 1;
                    NEH();
                }
            });

            el.querySelector("#NEH-Minus").addEventListener('click', function () {
                if (this.hasAttribute("disabled")) return;
                const skill = GET_CURRENT_SKILL();
                const currentLevel = Number(KX.KORUXA_STATS?.[skill]?.level ?? 0);
                const target = Number(KX.KORUXA_GLOBALS["target-level"] || currentLevel);

                if (target > currentLevel + 1) {
                    KX.KORUXA_GLOBALS["target-level"] = target - 1;
                    NEH();
                }
            });
        }

        const bP = el.querySelector("#NEH-Plus");
        const bM = el.querySelector("#NEH-Minus");
        const bT = el.querySelector("#neh-footer");

        const session = CALC_SESSION_XP();
        const sessionXP_Current = (KX.KORUXA_GLOBALS["current-skill"] !== "Doing" && session && typeof session?.xpRemaining === "number") ?
            `<b>${FORMAT_NUMBER(session?.xpPerLoop, 0)}</b> XP x<b>${FORMAT_NUMBER(session?.loops, 0)}</b>` : "";

        const sessionXP_Total = (KX.KORUXA_GLOBALS["current-skill"] !== "Doing" && session && typeof session?.xpRemaining === "number") ?
            `<b>${FORMAT_NUMBER(session?.xpRemaining, 0)}</b> XP` : "";

        const sessionLevels = (KX.KORUXA_GLOBALS["current-skill"] !== "Doing" && session && typeof session?.xpRemaining === "number") ?
            `<b>${(GET_LEVEL_FROM_XP((Number(KX.KORUXA_STATS?.[KX.KORUXA_GLOBALS["current-skill"].toLowerCase()].xp_total) + session?.xpRemaining), KX.KORUXA_GLOBALS["current-skill"]))}</b>` : "";

        tLvl == 120 ? bP.setAttribute("disabled", "") : bP.removeAttribute("disabled");
        tLvl <= (level + 1) ? bM.setAttribute("disabled", "") : bM.removeAttribute("disabled");

        el.querySelector(".neh-item").innerHTML = phrase;
        el.querySelector(".neh-subtitle").textContent = `${skill} ${tLvl}`;
        if (typeof session?.xpRemaining === "number" && session?.xpRemaining > 0) {
            bT.innerHTML = `<i class="ra ra-alarm-clock"></i> <b>${sessionXP_Current}</b> <span class="neh-sub-footer">${KX.KORUXA_GLOBALS["current-skill"]} ${sessionLevels} and ${sessionXP_Total} </span>`;
        }

        const bC = el.querySelector(".neh-btns");
        if (!bC.hasChildNodes()) {
            const sks = (typeof KX.KORUXA_CONFIGS === "object") ? Object.keys(KX.KORUXA_CONFIGS) : [skill];
            bC.append(...sks.map(k => {
                const key = k.toLowerCase();
                const b = document.createElement("button");
                b.className = "neh-button";
                b.dataset.skill = key;
                b.innerHTML = `<i class="${SKILL_ICONS[key] || SKILL_ICONS.default}"></i>`;
                return b;
            }));
            bC.onclick = (e) => {
                const b = e.target.closest(".neh-button");
                if (!b) return;
                const ns = b.dataset.skill;
                KX.KORUXA_GLOBALS["forced-current-skill"] = ns;
                KX.KORUXA_GLOBALS["target-level"] = (Number(KX.KORUXA_STATS?.[ns]?.level || 0) + 1);
                NEH();
            };
        }

        bC.querySelectorAll(".neh-button").forEach(b => b.classList.toggle("active", b.dataset.skill === skill));
    }

    function GET_BEST_XP_EFFICIENCY() {
        const allSkills = Object.keys(KX.KORUXA_CONFIGS || {});
        const rankings = [];

        allSkills.forEach(skill => {
            const results = CALC_SKILL_LEVEL_UP(skill);

            if (results && results.length > 0) {
                const bestAction = results[0];
                const config = KX.KORUXA_CONFIGS[skill];
                const stats = KX.KORUXA_STATS?.[skill] || {};
                const premiumBonus = (KX.KORUXA_IS_PREMIUM ? 20 : 0);
                const tool = KX.KORUXA_TOOLS?.[skill] || {};
                const farm = KX.KORUXA_FARMS?.[skill] || {};

                let entry = config[bestAction.action];
                if (!entry) {
                    for (const cat of Object.values(config)) {
                        if (cat?.[bestAction.action]) { entry = cat[bestAction.action]; break; }
                    }
                }

                if (entry) {
                    const speed = (tool.speed || 0) + (farm.speed || 0) + premiumBonus;
                    const xpBonus = GET_XP_MUTLTIPLIER(skill);
                    const xpPerLoop = (entry.xp || 0) * (1 + xpBonus / 100);
                    const msPerLoop = (entry.duration_ms || 0) * Math.max(0.1, 1 - speed / 100);
                    const xpPerHour = msPerLoop > 0 ? (xpPerLoop / (msPerLoop / 1000)) * 3600 : 0;

                    rankings.push({
                        skill: skill,
                        level: stats.level,
                        action: bestAction.label,
                        xph: Math.floor(xpPerHour)
                    });
                }
            }
        });

        rankings.sort((a, b) => b.xph - a.xph);
        var RANKING = "[b]Best XP Efficiency Rankings (XP/h)[/b]";
        if (rankings.length === 0) {
            ENHANCED_CHAT_LOG("No data available to calculate XP efficiency.", 'error');
        } else {
            rankings.forEach((item, index) => {
                const medal = index === 0 ? "🏆" : (index + 1) + ".";
                const formattedXPH = item.xph.toLocaleString(); // Ex: 1,250,000
                RANKING += `[newline][normal]${medal} [${item.skill.toUpperCase()} Lvl ${item.level}] : [info]${formattedXPH} XP/h[/info] | Action: ${item.action}[/normal]`;
            });
            ENHANCED_CHAT_LOG(RANKING, 'info');
        }
    }

    function startKoruxaUpdater({ initialDelayMs = 1500, intervalMs = 2000 } = {}) {
        if (KX.__koruxa_updater_started) return;
        KX.__koruxa_updater_started = true;

        const tick = () => {
            try {
                UPDATE_DATA();
            } catch (err) {
                console.error("Koruxa Enhanced UPDATE_DATA error", err);
            }
        };

        const begin = () => {
            const id = setInterval(tick, intervalMs);
            (KX.__koruxa_intervals = KX.__koruxa_intervals || []).push(id);
            tick();
        };

        if ("requestIdleCallback" in window) {
            requestIdleCallback(begin, { timeout: initialDelayMs });
        } else {
            setTimeout(begin, initialDelayMs);
        }
    }

    function REPLACE_IMAGES(mapping) {
        Object.entries(imageOverrides).forEach(([oldPath, newUrl]) => {
            const images = document.querySelectorAll(`img[src$="${oldPath}"]`);

            images.forEach(img => {
                img.removeAttribute('onerror');
                img.src = newUrl;
            });
        });
    }

    function LOCK_SIDEBAR() {
        const sts = ['lsb-unlocked', 'lsb-locked-open', 'lsb-locked-closed'];
        const icons = { 'lsb-unlocked': 'arrows-left-right', 'lsb-locked-open': 'lock', 'lsb-locked-closed': 'lock' };
        const [sL, gL, f] = ['.sidebar-left', '.game-layout', '.sidebar-footer'].map(s => document.querySelector(s));
        if (!f || document.getElementById('sidebar-lock-btn')) return;
        const b = document.createElement('div');
        b.id = 'sidebar-lock-btn';

        const updateUI = (s = sts[0]) => {
            const stateShort = s.replace('lsb-', '');
            b.className = `sidebar-footer-btn ${stateShort}`;
            b.innerHTML = `<i class="fas fa-${icons[s]}"></i>`;

            if (gL) {
                sts.forEach(cls => gL.classList.toggle(cls, cls === s));
                if (s !== sts[0]) gL.classList.remove('lsb-hover');
            }
        };

        b.onclick = () => {
            const next = sts[(sts.indexOf(KX.KORUXA_GLOBALS["sidebar-state"]) + 1) % 3];
            updateUI(KX.KORUXA_GLOBALS["sidebar-state"] = next);
            NEH_STORAGE('save');
        };

        if (sL && gL && window.innerWidth > 1024) {
            sL.onmouseenter = () => KX.KORUXA_GLOBALS["sidebar-state"] === sts[0] && gL.classList.add('lsb-hover');
            sL.onmouseleave = () => gL.classList.remove('lsb-hover');
        }

        f.prepend(b);
        updateUI(KX.KORUXA_GLOBALS["sidebar-state"]);
        NEH_STORAGE('save');
    }

    function NEH_STORAGE(action) {
        const key = 'KORUXA_ENHANCED';
        if (action === 'save') {
            localStorage.setItem(key, JSON.stringify(KX.KORUXA_GLOBALS));
        } else if (action === 'load') {
            const data = localStorage.getItem(key);
            const parsed_data = JSON.parse(data);
            if (data) {
                KX.KORUXA_GLOBALS["sidebar-state"] = parsed_data["sidebar-state"] || "lsb-locked-closed";
                KX.KORUXA_GLOBALS.Institute = parsed_data.Institute;
            }
        }
    }

    function AUTO_CLAN_BOSS() {
        const header = document.querySelector('.page-header>h1');
        const isOnClanBoss = header ? header.textContent.trim() === '👻 Clan Boss' : false;
        const recapEl = document.querySelector('.cb-recap-modal');
        const FightRecapVisible = !!recapEl;

        const active = document.querySelector('.cb-card button');
        if (!active || !isOnClanBoss) return;
        if (active.textContent === "🚫 No Attempts Left" && !active.hasAttribute('disabled')) {
            active.setAttribute('disabled', true);
            return;
        }

        if (active && active.textContent === "⚔️ Attack Boss" && !active.hasAttribute('disabled') && !FightRecapVisible) {
            active.click();
            ENHANCED_CHAT_LOG("Automatically starting attack on Clan Boss.", 'info');
        }
        if (FightRecapVisible) {
            ENHANCED_CHAT_LOG("Automatically closing Clan Boss fight recap.", 'info');
            closeBossRecap();
        }
    }

    function DISPLAY_COMBAT_LEVEL(ATK, STR, DEF, HP, MAG, RNG) {
        const base = (DEF + HP + ATK / 2) / 4;
        const melee = (ATK + STR) * 0.325;
        const magic = MAG * 0.5;
        const ranged = RNG * 0.5;

        const combat_level = base + Math.max(melee, magic, ranged) | 0;

        const parent = document.querySelector(".topbar-right");
        if (!parent) return;
        let combatLevel = parent.querySelector('.topbar-badge[id="topbar-cb"]');

        if (!combatLevel) {
            const wrapper = document.createElement('div');
            wrapper.className = 'topbar-badge';
            wrapper.id = 'topbar-cb';
            wrapper.title = 'Combat Level';
            wrapper.innerHTML = `CB ${combat_level}`;
            parent.prepend(wrapper);
        } else {
            combatLevel.textContent = `CB ${combat_level}`;
        }
    }

    function HIGHLIGHT_LEADERBOARD() {
        const isPlayerViewingLeaderboard = !!document.querySelector('.skill-link.active[onclick*="leaderboard"]');
        if (!isPlayerViewingLeaderboard) return;

        const targetName = KX.mapping.username.value;
        const rows = document.querySelectorAll('.lb-row');

        rows.forEach(row => {
            const nameElement = row.querySelector('span[onclick*="profile/"]');

            if (nameElement && nameElement.textContent.trim() === targetName) {
                row.classList.add('active');
            }
        });
    }

    function GET_XP_MUTLTIPLIER(skill) {
        const toolsXp = KX.KORUXA_TOOLS?.[skill]?.xp || 0;
        const farmsXp = KX.KORUXA_FARMS?.[skill]?.xp || 0;
        const premiumBonus = KX.KORUXA_IS_PREMIUM ? 20 : 0;
        const clanBonus = Number(KX.CLAN_XP_BONUS) || 0;
        let instituteBonus = 0;

        for (const item of Object.values(KX.KORUXA_GLOBALS.Institute || {})) {
            if (item?.effect?.type === "xp_bonus" && item.effect.skill === skill) {
                instituteBonus += (item.effect.value * item.level);
            }

            if (item?.effect?.category === "global" && item.effect.type === "xp_bonus") {
                instituteBonus += (item.effect.value * item.level);
            }
  
            if (item?.effect?.type === "xp_bonus" && Array.isArray(item.effect.skills) && item.effect.skills.includes(skill)) {
                instituteBonus += (item.effect.value * item.level);
            }
        }

        /*console.log("Tools XP Bonus:", toolsXp);
        console.log("Farms XP Bonus:", farmsXp);
        console.log("Premium Bonus:", premiumBonus);
        console.log("Clan XP Bonus:", clanBonus);
        console.log("Institute Bonus:", instituteBonus);*/
        return parseFloat((toolsXp + farmsXp + premiumBonus + clanBonus + instituteBonus).toFixed(10));
    }
    KX.GET_XP_MUTLTIPLIER = GET_XP_MUTLTIPLIER;

    function GET_THIEVING_CHANCE(currentLevel, base_chance) {
        const { min_level, success_chance } = base_chance;

        if (currentLevel < min_level) return 0;

        const levelDifference = currentLevel - min_level;
        const finalChance = success_chance + levelDifference;
        return Math.min(95, finalChance);
    }

    function CREATE_NEW_CHAT_TAB() {
        const chatTabsContainer = document.querySelector('#chat-tabs');
        if (!chatTabsContainer || document.querySelector('#chat-koruxa-enhanced')) return;

        const newButton = document.createElement('button');
        newButton.className = 'chat-tab';
        newButton.setAttribute('data-channel', 'koruxa-enhanced');
        newButton.textContent = 'Koruxa Enhanced';
        chatTabsContainer.appendChild(newButton);

        chatTabsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.chat-tab');
            if (btn) {
                ENHANCED_CHAT_TOGGLE(btn.getAttribute('data-channel'));
            }
        });

        const newChatContainer = document.createElement('div');
        newChatContainer.id = 'chat-koruxa-enhanced';
        newChatContainer.className = 'chat-messages';
        newChatContainer.style.display = 'none';

        const defaultChat = document.querySelector('#chat-messages');
        if (defaultChat && defaultChat.parentNode) {
            defaultChat.parentNode.insertBefore(newChatContainer, defaultChat.nextSibling);
        }
    }

    function ENHANCED_CHAT_TOGGLE(channel) {
        const activeTab = document.querySelector('.chat-tab.active');
        if (channel === 'koruxa-enhanced' && activeTab?.getAttribute('data-channel') === 'koruxa-enhanced') return;

        const defaultChat = document.querySelector('#chat-messages');
        const enhancedChat = document.querySelector('#chat-koruxa-enhanced');
        const chatMessageBar = document.querySelector('#chat-input-row');
        if (!enhancedChat) return;

        document.querySelectorAll('.chat-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-channel') === channel);
        });

        if (channel === 'koruxa-enhanced') {
            if (defaultChat) defaultChat.style.display = 'none';
            enhancedChat.style.display = '';
            // add class disabled
            chatMessageBar.classList.add('disabled');

        } else {
            if (defaultChat) defaultChat.style.display = '';
            enhancedChat.style.display = 'none';
            chatMessageBar.classList.remove('disabled');
        }
    }

    function ENHANCED_CHAT_LOG(message, type = 'info') {
        const chatContainer = document.querySelector('#chat-koruxa-enhanced');
        if (!chatContainer) return;

        const now = new Date();
        const pad = (num) => String(num).padStart(2, '0');
        const timestamp = `${now.getHours()}:${pad(now.getMinutes())} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

        let safeMessage = typeof _ !== 'undefined' ? _.escape(message) : message;

        safeMessage = safeMessage
            .replace(/\n/g, '<br>')
            .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
            .replace(/\[b\](.*?)\[\/b\]/gi, '<b>$1</b>')
            .replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>')
            .replace(/\[success\](.*?)\[\/success\]/gi, '<span class="message-success">$1</span>')
            .replace(/\[info\](.*?)\[\/info\]/gi, '<span class="message-info">$1</span>')
            .replace(/\[error\](.*?)\[\/error\]/gi, '<span class="message-error">$1</span>')
            .replace(/\[warning\](.*?)\[\/warning\]/gi, '<span class="message-warning">$1</span>')
            .replace(/\[normal\](.*?)\[\/normal\]/gi, '<span class="message-normal">$1</span>')
            .replace(/\[newline\]/gi, '<br>');

        const messageHTML = `
        <div class="chat-msg neh-message chat-type-${type}">
            <span class="chat-time">${timestamp}</span>
            <span class="chat-user chat-user-system">SYSTEM</span>
            <span class="chat-text">${safeMessage}</span>
        </div>`;

        chatContainer.insertAdjacentHTML('beforeend', messageHTML);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function FIND_INSTITUTE_BONUSES(cat = null) {
        if (!document.querySelector('.page-header h1')?.textContent.includes('🏛')) return;
        if (cat) { setResearchCat(cat); await new Promise(r => setTimeout(r, 150)); }

        const current = document.querySelector('button[onclick^="setResearchCat("][style*="background:rgba(139,92,246,.15)"]');
        const match = current?.getAttribute('onclick')?.match(/setResearchCat\(['"]?(\w+)['"]?\)/);
        const currentCat = match ? match[1] : null;
        const grid = document.querySelector('#page-content div[style*="display:grid;grid-template-columns"]');
        if (!grid) return;

        _.forEach(grid.children, item => {
            const name = item.querySelector('div[style*="700"]')?.textContent.trim();
            const lv = parseInt(item.querySelector('strong')?.textContent || 0);
            const res = _.find(KX.KORUXA_GLOBALS.Institute, { name });
            const s = res?.effect?.skill;
            const skill = s || (["all_gathering", "all_combat", "all_artisan"].includes(res?.effect?.category) ? res.effect.category : "global");

            if (res) {
                res.level = lv;
                if (res.effect?.type === "xp_bonus") {
                    res.currentBonus = parseFloat((lv * res.effect.value).toFixed(10));
                    console.log(`[Sync] Found ${res.name} level ${res.level}: +${res.currentBonus}% XP in ${skill}`);
                }
            }
        });
        NEH_STORAGE('save');
    }

    const INJECT_SYNC_BUTTON = () => {
        if (!document.querySelector('.page-header h1')?.textContent.includes('🏛')) return;
        if (document.getElementById('kx-institute-sync') || !document.querySelector('.page-header')) return;

        const btn = document.createElement('button');
        btn.id = 'kx-institute-sync';
        btn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        btn.style.cssText = 'margin-left:10px; padding:4px 8px; cursor:pointer; background:var(--surface); border:1px solid var(--border); color:var(--text); border-radius:4px;';

        btn.onclick = async () => {
            btn.firstChild.classList.add('fa-spin');
            await FIND_INSTITUTE_BONUSES();
            setTimeout(() => btn.firstChild.classList.remove('fa-spin'), 600);
        };

        document.querySelector('.page-header').appendChild(btn);
    };

    const targetSelectors = ['#tab-inventory', '#tab-equipment', '#tab-farms-sidebar'];
    const COOLDOWN_MS = 3000;
    let lastUpdateTimestamp = 0;

    const REFRESH_ENHANCED_DATA = _.throttle(async (isSingle = false) => {
        if (KX.KORUXA_ENHANCED.isUpdating) return;
        KX.KORUXA_ENHANCED.isUpdating = true;
        observer.disconnect();

        try {
            INJECT_SYNC_BUTTON();
            const skill = isSingle ? KX.mapping["current_skill"].value : "all";
            await EXTRACT_SKILLS(skill);
            [REPLACE_ICONS, GET_CURRENT_SKILL, LOAD_FARM_STATS, LOAD_TOOL_STATS, HIGHLIGHT_LEADERBOARD].forEach(f => f());
        } catch (e) { }

        observe();
        KX.KORUXA_ENHANCED.isUpdating = false;
    }, 500, { trailing: false });

    const observer = new MutationObserver((mutations) => {
        const active = targetSelectors.find(s =>
            mutations.some(m => m.target.nodeType === 1 && (m.target.closest(s) || document.querySelector(s)?.contains(m.target)))
        );

        if (active) REFRESH_ENHANCED_DATA(active === '#tab-inventory');
    });

    const observe = () => {
        if (document.body) observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    };

    const init = () => {
        if (!document.body) return setTimeout(init, 100);

        document.addEventListener('click', (e) => {
            if (e.target.closest('.sidebar-left, .sidebar-right')) REFRESH_ENHANCED_DATA(false);
            if (e.target.closest('button[onclick^="setResearchCat("]') || e.target.closest(`#sidebar-institute-btn`)) FIND_INSTITUTE_BONUSES();
            if (e.target.closest('button[onclick^="loadLeaderboard("]')) setTimeout(HIGHLIGHT_LEADERBOARD, 500);
        });

        observe();
        REFRESH_ENHANCED_DATA(false);
    };

    init();
    LOAD_CSS("https://fonts.googleapis.com/css2?family=Saira:ital,wght@0,100..900;1,100..900&display=swap");
    LOAD_CSS("https://goldenlys.github.io/Koruxa-Enhancer/assets/css/fa-7.2.0.min.css");
    LOAD_CSS("https://goldenlys.github.io/Koruxa-Enhancer/assets/css/rpg-awesome.min.css");
    LOAD_CSS("https://goldenlys.github.io/Koruxa-Enhancer/assets/css/style.css");
    NEH_STORAGE('load');
    REPLACE_ICONS();
    LOCK_SIDEBAR();
    UPDATE_DATA();
    LOAD_FARM_STATS();
    LOAD_TOOL_STATS();
    CREATE_NEW_CHAT_TAB();

    try {
        startKoruxaUpdater({ initialDelayMs: 1500, intervalMs: 2000 });
    } catch (err) { console.error('Koruxa Enhanced error', err); }
})();