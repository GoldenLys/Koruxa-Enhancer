/// ==UserScript==
// @name          Koruxa Enhanced
// @namespace     Koruxa Enhanced
// @author        Nebulys
// @version       2.1
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
// @run-at        document-idle
// @require       https://goldenlys.github.io/Koruxa-Enhancer/assets/libs/lodash.min.js
// ==/UserScript==

/* TODO & Ideas List
 - (Maybe) add "Stats" tab with more stats
 - Make the plus button generate a formula to reach the desired level with the less amount of time 
*/

const KX = unsafeWindow;
// Additional global variables for easier access, mostly based on HTML elements
KX.KORUXA_GLOBALS = {
    "forced-current-skill": "none",
    "target-level": 0,
    "sidebar-state": "lsb-locked-closed"
};
KX.KORUXA_CONFIGS = {};
KX.KORUXA_STATS = {};
KX.KORUXA_TOOLS = {};
KX.KORUXA_FARMS = {};
//KX.KORUXA_SKILL_CONFIGS = {}; // DEBUG ENV ONLY
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

    var isKXReady = false;
    var isReadyFuncRunOnce = false;

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

    //KX.KORUXA_SKILL_CONFIGS = KORUXA_CONFIGS; // DEBUG ENV ONLY

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
        const text = el.textContent.trim();

        switch (selector) {
            case "#topbar-total-level": {
                const num = el.childNodes[0]?.textContent.match(/\d+/);
                return num ? num[0] : "(no number)";
            }

            case "#topbar-coins-text": {
                const num = text.match(/[\d.]+/);
                return num ? num[0] : "(no number)";
            }

            case "#session-cycles-row2": {
                const m = text.match(/(\d+)\s*\/\s*(\d+)/);
                return m ? { current: m[1], total: m[2] } : "(invalid format)";
            }

            case "#session-action-row2": {
                const s = text.match(/([^:]+):\s*(.+)/);
                return s ? key === "current-skill" ? s[1] : s[2] : "(invalid format)";
            }

            case "#hp-text": {
                const hpv = text.match(/(\d+)\/(\d+)/);
                return hpv ? (key === "current-hp" ? hpv[1] : hpv[2]) : "(invalid format)";
            }
        }
        return el.value || text;
    }

    async function simulateSkillHover(duration = 500) {
        const skills = document.querySelectorAll('.skill-item[data-skill], .skill-link[data-skill]');

        for (const skill of skills) {
            const skillName = skill.getAttribute('data-skill') || skill.innerText.trim().toLowerCase();

            if (typeof showSkillTooltip === 'function') {
                showSkillTooltip(skill, skillName);
            }

            await new Promise(r => setTimeout(r, duration));
            if (typeof hideSkillTooltip === 'function') { hideSkillTooltip(); }

        }
    }

    // Extracts all skills data
    async function EXTRACT_SKILLS() {
        await simulateSkillHover(10);

        document.querySelectorAll(".skill-tooltip").forEach(tip => {
            let name = tip.id.replace("stt-", "").toLowerCase();
            if (name === "alt.magic") name = "alchemy"; // not required anymore i think, keeping it just in case

            const level = parseInt(document.getElementById("sl-" + name)?.textContent) || 1;
            const totalXP = parseInt(tip.querySelector(".skill-tt-total strong")
                ?.textContent.replace(/,/g, "")) || 0;

            const baseXPForLevel = GET_XP(level, "Total");
            const currentXPInLevel = totalXP - baseXPForLevel;
            const requiredXPForNext = xpToNext[level - 1] || 0;

            KX.KORUXA_STATS[name] = {
                level: level,
                xp_current: currentXPInLevel,
                xp_needed: requiredXPForNext,
                xp_total: totalXP
            };
        });
        if (typeof hideSkillTooltip === 'function') hideSkillTooltip();
        isKXReady = true;
    }

    // Updates values and create new html elements
    function UPDATE_DATA() {
        for (const key in KX.mapping) {
            const entry = KX.mapping[key];
            const result = EXTRACT_DATA(entry.selector, key);
            KX.KORUXA_GLOBALS[key] = entry.value;
            if (key === "cycle" && typeof result === "object") entry.value = result;
            else entry.value = result;
        }
        EXTRACT_SKILLS();
        //SET_CURRENT_SKILL_CLASS();
        LOAD_TOOL_STATS();
        LOAD_FARM_STATS();
        AUTO_CLAN_BOSS();
        REPLACE_IMAGES(imageOverrides);
        if (isKXReady) DISPLAY_COMBAT_LEVEL(KORUXA_STATS.attack.level,
            KORUXA_STATS.strength.level,
            KORUXA_STATS.defence.level,
            KORUXA_STATS.hitpoints.level,
            KORUXA_STATS.magic.level,
            KORUXA_STATS.ranged.level);
        if (isKXReady && KX.KORUXA_GLOBALS["current-skill"] !== "Doing") NEH();
        if (isKXReady && !isReadyFuncRunOnce) { isReadyFuncRunOnce = true; GET_BEST_XP_EFFICIENCY(); }
    }
//
//
//
// NEEDS AN UPDATE TO WORK WITH THE NEW URL STRUCTURE, CURRENTLY DISABLED
//
//
//
    /*function SET_CURRENT_SKILL_CLASS() {
        const url = window.location.href;
        const skillMatch = url.match(/[?&]skill=([^&]+)/);
        const pageMatch = url.match(/[?&]page=([^&]+)/);

        const blacklist = ["slayer", "attack", "strength", "defence", "hitpoints", "magic", "ranged"];
        let selected = "";
        if (skillMatch) {
            const skill = skillMatch[1];
            if (!blacklist.includes(skill)) selected = skill;
        } else if (pageMatch && pageMatch[1] === "clan_boss") selected = "clan-boss";

        if (selected) {
            let bg = document.getElementById("skill-background");
            if (!bg) {
                document.body.insertAdjacentHTML('afterbegin', '<div id="skill-background"></div>');
                bg = document.getElementById("skill-background");
            }
            bg.className = `bg-skill ${selected}`;
            KX.KORUXA_GLOBALS["current-skill"] = selected;
        }
    }*/

    function GET_CURRENT_SKILL() {
        const url = window.location.href;
        const skillBlacklist = ["slayer", "attack", "strength", "defence", "hitpoints", "magic", "ranged"];
        const defaultSkill = "woodcutting";
        let skill = (KX.KORUXA_GLOBALS["forced-current-skill"] || KX.KORUXA_GLOBALS["current-skill"] || "").toLowerCase().trim();

        if (!skill) {
            const urlMatch = url.match(/skill=([^&]+)/);
            if (urlMatch && urlMatch[1]) skill = urlMatch[1].toLowerCase().trim();
        }

        if (!skill || skillBlacklist.includes(skill)) return defaultSkill;
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
        const SPEED = [0, 2, 4, 6, 8, 10, 12, 14, 16], XP = [0, 1, 2, 4, 6, 8, 10, 15, 20];
        const result = [...document.querySelectorAll('.farm-card[data-skill] .farm-level')].reduce((acc, el) => {
            const skill = el.closest('.farm-card')?.dataset?.skill;
            if (!skill) return acc;
            const m = (el.textContent || '').match(/\d+/);
            const lvl = m ? Math.max(0, Math.min(Number(m[0]), SPEED.length - 1)) : 0;
            acc[skill] = { level: lvl, speed: SPEED[lvl] || 0, xp: XP[lvl] || 0 };
            return acc;
        }, Object.create(null));
        ['woodcutting', 'mining', 'fishing', 'farming', 'cooking', 'thieving', 'fletching', 'crafting', 'herblore', 'smithing', 'firemaking', 'arcana']
            .forEach(s => { if (!result[s]) result[s] = { level: 0, speed: 0, xp: 0 }; });
        try { if (JSON.stringify(KX.KORUXA_FARMS || {}) !== JSON.stringify(result)) KX.KORUXA_FARMS = result; }
        catch (e) { KX.KORUXA_FARMS = result; }
    }

    // Generates a globals for each tool stats
    function LOAD_TOOL_STATS() {
        const KNOWN = ['woodcutting', 'mining', 'fishing', 'farming', 'cooking', 'thieving', 'fletching', 'crafting', 'herblore', 'smithing', 'firemaking', 'arcana', 'alchemy', 'slayer'];
        const MAP = { "XP Gain": "xp", "Speed": "speed" };
        const res = [...document.querySelectorAll('.equipment-slot[data-slot^="tool_"]')].reduce((acc, slot) => {
            const skill = (slot.dataset.slot || '').replace(/^tool_/, '');
            if (!skill) return acc;
            acc[skill] = [...slot.querySelectorAll('.tooltip-stat')].reduce((s, stat) => {
                const raw = cleanName(stat.children[0]?.textContent || '');
                const key = MAP[raw] ?? raw;
                s[key] = cleanValue(stat.querySelector('.tooltip-stat-value')?.textContent || '');
                return s;
            }, Object.create(null));
            return acc;
        }, Object.create(null));
        KNOWN.forEach(k => { if (!res[k]) res[k] = {}; });
        KX.KORUXA_TOOLS = res;
    }

    function GET_LAST_UNLOCK_SKILL(skill, level = 0) {
        const config = KORUXA_CONFIGS?.[skill];
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
        const BLACKLISTED_CATEGORIES = [
            'magic_gear',
            'ranged_gear'
        ];

        const actions = GET_LAST_UNLOCK_SKILL(skill);
        if (!actions || actions.length === 0) return null;

        const config = KORUXA_CONFIGS?.[skill] || {};
        const stats = KX.KORUXA_STATS?.[skill] || {};
        const premiumBonus = (KX.KORUXA_IS_PREMIUM ? 20 : 0);
        const currentXP = Number(stats.xp_total) || 0;
        const targetXP = targetLevel > 0 ? GET_XP(targetLevel, "total") : (Number(stats.xp_needed) || 0);
        const xpLeft = Math.max(0, targetXP - currentXP);

        const compute = (action, e) => {
            const label = e.label ?? action;
            const tools = KX.KORUXA_TOOLS?.[skill] || {};
            const farms = KX.KORUXA_FARMS?.[skill] || {};
            const speed = (tools.speed || 0) + (farms.speed || 0) + premiumBonus;
            const xpBonus = (tools.xp || 0) + (farms.xp || 0) + premiumBonus;
            const xpPerLoop = (e.xp || 0) * (1 + xpBonus / 100);
            const msPerLoop = (e.duration_ms || 0) * Math.max(0, 1 - speed / 100);

            if (xpLeft <= 0 || xpPerLoop <= 0) return { skill, action, label, loops: 0, time: "0s", required: 0 };

            const loops = Math.ceil(xpLeft / xpPerLoop);
            const rawIng = e.ingredients || e.recipe || e.input || {};

            return {
                skill, action, label,
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
                    return { action, entry: e, ratio: e.xp / Math.max(1, e.duration_ms) };
                });
            })
            .compact()
            .uniqBy('action')
            .orderBy(['ratio'], ['desc'])
            .take(3)
            .value();

        return _.map(bestActions, (c) => compute(c.action, c.entry));
    }

    function CALC_SESSION_XP() {
        const skillId = KX.KORUXA_GLOBALS['current-skill']?.trim().toLowerCase();
        const identifier = KX.KORUXA_GLOBALS['current-item'];
        const cycle = KX.KORUXA_GLOBALS.cycle;

        if (!skillId || !identifier || !cycle) return null;

        const config = KORUXA_CONFIGS?.[skillId] || {};
        let itemData = null;
        let finalKey = null;

        const searchStr = identifier.toString().toLowerCase().trim();

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

        const tools = KX.KORUXA_TOOLS || {};
        const farms = KX.KORUXA_FARMS || {};
        const premiumBonus = (KX.KORUXA_IS_PREMIUM ? 20 : 0);

        const tool = tools[skillId] || {};
        const farm = farms[skillId] || {};
        const xpBonusTotal = (tool.xp || 0) + (farm.xp || 0) + premiumBonus;

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
        const skill = (forced && forced !== "none") ? forced : (current || null);
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
        if (typeof session?.xpRemaining === "number" && session?.xpRemaining > 0) bT.innerHTML =
            `<i class="ra ra-alarm-clock"></i> <b>${sessionXP_Current}</b> <span class="neh-sub-footer">${KX.KORUXA_GLOBALS["current-skill"]} ${sessionLevels} and ${sessionXP_Total} </span>`;

        const bC = el.querySelector(".neh-btns");
        if (!bC.hasChildNodes()) {
            const sks = (typeof KORUXA_CONFIGS === "object") ? Object.keys(KORUXA_CONFIGS) : [skill];
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
        const allSkills = Object.keys(KORUXA_CONFIGS || {});
        const rankings = [];

        allSkills.forEach(skill => {
            const results = CALC_SKILL_LEVEL_UP(skill);

            if (results && results.length > 0) {
                const bestAction = results[0];
                const config = KORUXA_CONFIGS[skill];
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
                    const xpBonus = (tool.xp || 0) + (farm.xp || 0) + premiumBonus;
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
        console.log("%c--- Best XP Efficiency Rankings (XP/h) ---", "color: #00ff00; font-weight: bold;");
        if (rankings.length === 0) {
            console.log("Aucune donnée disponible.");
        } else {
            rankings.forEach((item, index) => {
                const medal = index === 0 ? "🏆" : (index + 1) + ".";
                const formattedXPH = item.xph.toLocaleString(); // Ex: 1,250,000
                console.log(`${medal} [${item.skill.toUpperCase()} Lvl ${item.level}] : ${formattedXPH} XP/h | Action: ${item.action}`);
            });
        }
    }

    function startKoruxaUpdater({ initialDelayMs = 1500, intervalMs = 2000 } = {}) {
        if (KX.__koruxa_updater_started) return;
        KX.__koruxa_updater_started = true;

        const tick = () => {
            if (!document.hidden) {
                try { UPDATE_DATA(); }
                catch (err) { console.error("Koruxa Enhanced UPDATE_DATA error", err); }
            }
        };

        const begin = () => {
            const id = setInterval(tick, intervalMs);
            (KX.__koruxa_intervals = KX.__koruxa_intervals || []).push(id);
            tick();
        };

        const startAfterIdle = () => {
            if ("requestIdleCallback" in window) requestIdleCallback(begin, { timeout: initialDelayMs });
            else setTimeout(begin, initialDelayMs);
        };

        if (document.hidden) {
            const onVisible = () => {
                document.removeEventListener("visibilitychange", onVisible);
                startAfterIdle();
            };
            document.addEventListener("visibilitychange", onVisible);
        } else {
            startAfterIdle();
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

        if (active && active.textContent === "⚔️ Attack Boss" && !active.hasAttribute('disabled') && !FightRecapVisible) active.click();
        if (FightRecapVisible) closeBossRecap();
    }

    function DISPLAY_COMBAT_LEVEL(ATK, STR, DEF, HP, MAG, RNG) {
        const base = (DEF + HP + ATK / 2) / 4;
        const melee = (ATK + STR) * 0.325;
        const magic = MAG * 0.5;
        const ranged = RNG * 0.5;

        const combat_level = base + Math.max(melee, magic, ranged);

        const parent = document.querySelector(".equipment-stats-summary");
        if (!parent) return;
        let combatLevel = parent.querySelector('.stat-value[data-stat="combat-level"]');

        if (!combatLevel) {
            const wrapper = document.createElement('div');
            wrapper.className = 'stat-item';
            wrapper.innerHTML = `<span class="stat-icon">CB</span>
            <span class="stat-value " data-stat="combat-level">${combat_level}</span>`;
            parent.append(wrapper);
        } else {
            combatLevel.textContent = combat_level;
        }
    }

    if (document.querySelector('#food-bar')) document.querySelector('#sidebar-hp-bar').after(document.querySelector('#food-bar'));
    const observer = new MutationObserver(() => { REPLACE_ICONS(); /*SET_CURRENT_SKILL_CLASS();*/ });
    observer.observe(document.body, { childList: true, subtree: true });

    LOAD_CSS("https://fonts.googleapis.com/css2?family=Saira:ital,wght@0,100..900;1,100..900&display=swap");
    LOAD_CSS("https://goldenlys.github.io/Koruxa-Enhancer/assets/css/fa-7.2.0.min.css");
    LOAD_CSS("https://goldenlys.github.io/Koruxa-Enhancer/assets/css/rpg-awesome.min.css");
    LOAD_CSS("https://goldenlys.github.io/Koruxa-Enhancer/assets/css/style.css");
    NEH_STORAGE('load');
    REPLACE_ICONS();
    LOCK_SIDEBAR();
    UPDATE_DATA();

    try {
        startKoruxaUpdater({ initialDelayMs: 1500, intervalMs: 2000 });
    } catch (err) { console.error('Koruxa Enhanced error', err); }
})();