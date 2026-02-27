/// ==UserScript==
// @name          Koruxa Enhanced
// @namespace     Koruxa Enhanced
// @author        Nebulys
// @version       1.23
// @homepageURL   https://github.com/GoldenLys/Koruxa-Enhancer/
// @supportURL    https://github.com/GoldenLys/Koruxa-Enhancer/issues/
// @downloadURL   https://github.com/GoldenLys/Koruxa-Enhancer/raw/refs/heads/main/mod.user.js
// @updateURL     https://github.com/GoldenLys/Koruxa-Enhancer/raw/refs/heads/main/mod.user.js
// @description   Redesign of the game
// @match         https://koruxa.com/*
// @match         https://www.koruxa.com/*
// @icon          https://www.google.com/s2/favicons?domain=https://koruxa.com
// @license       MIT License
// @grant         unsafeWindow
// @run-at        document-idle
// ==/UserScript==

/* TODO & Ideas List
 - (Maybe) add "Stats" tab with more stats
 - Add a + button to the helper to select which level to reach 
 - With the plus button, make it generate a formula to reach the desired level with the less amount of time 
*/

const KX = unsafeWindow;
// Additional global variables for easier access, mostly based on HTML elements
KX.KORUXA_GLOBALS = {
    "forced-current-skill": "none",
    "target-level": "none",
    "sidebar-state": "lsb-unlocked"
};
KX.KORUXA_STATS = {};
KX.KORUXA_TOOLS = {};
KX.KORUXA_FARMS = {};
KX.KORUXA_ALL_SKILL_LEVELS = KX.KORUXA_ALL_SKILL_LEVELS || {};
KX.__koruxa_intervals = KX.__koruxa_intervals || [];
KX.__koruxa_updater_started = KX.__koruxa_updater_started || false;

KX.mapping = { // Mappings of game data
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
    //"session-current-skill": { selector: "#session-skill-name", value: "" },
};

(function () {
    'use strict';

    const KORUXA_CONFIGS = {
        woodcutting: (typeof KORUXA_WOODCUT_CONFIG !== 'undefined') ? KORUXA_WOODCUT_CONFIG : {},
        mining: (typeof KORUXA_MINING_CONFIG !== 'undefined') ? KORUXA_MINING_CONFIG : {},
        fishing: (typeof KORUXA_FISHING_CONFIG !== 'undefined') ? KORUXA_FISHING_CONFIG : {},
        cooking: (typeof KORUXA_COOKING_CONFIG !== 'undefined') ? KORUXA_COOKING_CONFIG : {},
        fletching: (typeof KORUXA_FLETCHING_CONFIG !== 'undefined') ? KORUXA_FLETCHING_CONFIG : {},
        crafting: (typeof KORUXA_CRAFTING_CONFIG !== 'undefined') ? KORUXA_CRAFTING_CONFIG : {},
        herblore: {
            attack_potion: {
                key: 'attack_potion',
                label: 'Attack Potion',
                min_level: 1,
                xp: 8,
                duration_ms: 14000,
            },
            defence_potion: {
                key: 'defence_potion',
                label: 'Defence Potion',
                min_level: 5,
                xp: 12,
                duration_ms: 16000,
            },
            health_potion: {
                key: 'health_potion',
                label: 'Health Potion',
                min_level: 12,
                xp: 18,
                duration_ms: 18000,
            },
            thieving_potion: {
                key: 'thieving_potion',
                label: 'Thieving Potion',
                min_level: 18,
                xp: 24,
                duration_ms: 21000,
            },
            wisdom_potion: {
                key: 'wisdom_potion',
                label: 'Wisdom Potion',
                min_level: 25,
                xp: 32,
                duration_ms: 24000,
            },
            haste_potion: {
                key: 'haste_potion',
                label: 'Haste Potion',
                min_level: 30,
                xp: 38,
                duration_ms: 26000,
            },
            super_attack_potion: {
                key: 'super_attack_potion',
                label: 'Super Attack Potion',
                min_level: 38,
                xp: 45,
                duration_ms: 30000,
            },
            super_defence_potion: {
                key: 'super_defence_potion',
                label: 'Super Defence Potion',
                min_level: 43,
                xp: 52,
                duration_ms: 33000,
            },
            fortune_potion: {
                key: 'fortune_potion',
                label: 'Fortune Potion',
                min_level: 48,
                xp: 58,
                duration_ms: 35000,
            },
            super_health_potion: {
                key: 'super_health_potion',
                label: 'Super Health Potion',
                min_level: 53,
                xp: 65,
                duration_ms: 38000,
            },
            super_thieving_potion: {
                key: 'super_thieving_potion',
                label: 'Super Thieving Potion',
                min_level: 58,
                xp: 72,
                duration_ms: 41000,
            },
            combat_potion: {
                key: 'combat_potion',
                label: 'Combat Potion',
                min_level: 63,
                xp: 78,
                duration_ms: 44000,
            },
            super_wisdom_potion: {
                key: 'super_wisdom_potion',
                label: 'Super Wisdom Potion',
                min_level: 68,
                xp: 85,
                duration_ms: 46000,
            },
            super_haste_potion: {
                key: 'super_haste_potion',
                label: 'Super Haste Potion',
                min_level: 73,
                xp: 95,
                duration_ms: 50000,
            },
            skiller_potion: {
                key: 'skiller_potion',
                label: 'Skiller Potion',
                min_level: 75,
                xp: 100,
                duration_ms: 52000,
            },
            super_fortune_potion: {
                key: 'super_fortune_potion',
                label: 'Super Fortune Potion',
                min_level: 78,
                xp: 105,
                duration_ms: 55000,
            },
            master_potion: {
                key: 'master_potion',
                label: 'Master Potion',
                min_level: 88,
                xp: 140,
                duration_ms: 65000,
            },
            overload_potion: {
                key: 'overload_potion',
                label: 'Overload',
                min_level: 96,
                xp: 200,
                duration_ms: 80000,
            },
        },
        smithing: (typeof KORUXA_SMITHING_CONFIG !== 'undefined') ? KORUXA_SMITHING_CONFIG : {},
        firemaking: (typeof KORUXA_FIREMAKING_CONFIG !== 'undefined') ? KORUXA_FIREMAKING_CONFIG : {},
        arcana: (typeof KORUXA_ARCANA_CONFIG !== 'undefined') ? KORUXA_ARCANA_CONFIG : {},
        thieving: {
            farmer: {
                key: 'farmer',
                label: 'Farmer',
                min_level: 1,
                xp: 10,
                coins: 0,
                success_chance: 95,
                duration_ms: 4000,
            },
            market_stall: {
                key: 'market_stall',
                label: 'Market Stall',
                min_level: 10,
                xp: 20,
                coins: 0,
                success_chance: 95,
                duration_ms: 6000,
            },
            wealthy_citizen: {
                key: 'wealthy_citizen',
                label: 'Wealthy Citizen',
                min_level: 25,
                xp: 25,
                coins: 0,
                success_chance: 88,
                duration_ms: 7000,
            },
            traveling_merchant: {
                key: 'traveling_merchant',
                label: 'Traveling Merchant',
                min_level: 40,
                xp: 40,
                coins: 0,
                success_chance: 59,
                duration_ms: 9000,
            },
            noble: {
                key: 'noble',
                label: 'Noble',
                min_level: 55,
                xp: 0,
                coins: 0,
                success_chance: 0,
                duration_ms: 0,
            },
            treasure_chest: {
                key: 'treasure_chest',
                label: 'Treasure Chest',
                min_level: 70,
                xp: 0,
                coins: 0,
                success_chance: 0,
                duration_ms: 0,
            },
            royal_guard: {
                key: 'royal_guard',
                label: 'Royal Guard',
                min_level: 85,
                xp: 0,
                coins: 0,
                success_chance: 0,
                duration_ms: 0,
            },
            bank_vault: {
                key: 'bank_vault',
                label: 'Bank Vault',
                min_level: 95,
                xp: 0,
                coins: 0,
                success_chance: 0,
                duration_ms: 0,
            },
        },
        farming: {
            herbs: {
                glowroot_seed: {
                    key: 'glowroot_seed',
                    label: 'Glowroot Seed',
                    min_level: 1,
                    xp: 35,
                    duration_ms: 900000,
                },
                emberstem_seed: {
                    key: 'emberstem_seed',
                    label: 'Emberstem Seed',
                    min_level: 10,
                    xp: 70,
                    duration_ms: 1800000,
                },
                frostleaf_seed: {
                    key: 'frostleaf_seed',
                    label: 'Frostleaf Seed',
                    min_level: 20,
                    xp: 115,
                    duration_ms: 2700000,
                },
                shadowmoss_seed: {
                    key: 'shadowmoss_seed',
                    label: 'Shadowmoss Seed',
                    min_level: 32,
                    xp: 175,
                    duration_ms: 3600000,
                },
                spiritbloom_seed: {
                    key: 'spiritbloom_seed',
                    label: 'Spiritbloom Seed',
                    min_level: 45,
                    xp: 255,
                    duration_ms: 5400000,
                },
                voidpetal_seed: {
                    key: 'voidpetal_seed',
                    label: 'Voidpetal Seed',
                    min_level: 60,
                    xp: 370,
                    duration_ms: 7200000,
                },
                celestine_seed: {
                    key: 'celestine_seed',
                    label: 'Celestine Seed',
                    min_level: 75,
                    xp: 525,
                    duration_ms: 10800000,
                },
                elderbloom_seed: {
                    key: 'elderbloom_seed',
                    label: 'Elderbloom Seed',
                    min_level: 90,
                    xp: 750,
                    duration_ms: 14400000,
                },
            },
            crops: {
                dustwheat_seed: {
                    key: 'dustwheat_seed',
                    label: 'Dustwheat Seed',
                    min_level: 1,
                    xp: 20,
                    duration_ms: 600000,
                },
                crimson_corn_seed: {
                    key: 'crimson_corn_seed',
                    label: 'Crimson Corn Seed',
                    min_level: 15,
                    xp: 80,
                    duration_ms: 1200000,
                },
                moonpotato_seed: {
                    key: 'moonpotato_seed',
                    label: 'Moonpotato Seed',
                    min_level: 28,
                    xp: 130,
                    duration_ms: 2400000,
                },
                starmelon_seed: {
                    key: 'starmelon_seed',
                    label: 'Starmelon Seed',
                    min_level: 42,
                    xp: 205,
                    duration_ms: 3600000,
                },
                voidberry_seed: {
                    key: 'voidberry_seed',
                    label: 'Voidberry Seed',
                    min_level: 58,
                    xp: 295,
                    duration_ms: 5400000,
                },
                soulgrape_seed: {
                    key: 'soulgrape_seed',
                    label: 'Soulgrape Seed',
                    min_level: 72,
                    xp: 420,
                    duration_ms: 7200000,
                },
            },
            trees: {
                ashling_sapling: {
                    key: 'ashling_sapling',
                    label: 'Ashling Sapling',
                    min_level: 15,
                    xp: 200,
                    duration_ms: 14400000,
                },
                duskwood_sapling: {
                    key: 'duskwood_sapling',
                    label: 'Duskwood Sapling',
                    min_level: 30,
                    xp: 400,
                    duration_ms: 21600000,
                },
                crystalbark_sapling: {
                    key: 'crystalbark_sapling',
                    label: 'Crystalbark Sapling',
                    min_level: 50,
                    xp: 675,
                    duration_ms: 28800000,
                },
                spiritoak_sapling: {
                    key: 'spiritoak_sapling',
                    label: 'Spiritoak Sapling',
                    min_level: 70,
                    xp: 1025,
                    duration_ms: 43200000,
                },
                worldtree_sapling: {
                    key: 'worldtree_sapling',
                    label: 'Worldtree Sapling',
                    min_level: 90,
                    xp: 1400,
                    duration_ms: 86400000,
                },
            },
            flowers: {
                sunpetal_seed: {
                    key: 'sunpetal_seed',
                    label: 'Sunpetal Seed',
                    min_level: 5,
                    xp: 42,
                    duration_ms: 1200000,
                },
                nightshade_seed: {
                    key: 'nightshade_seed',
                    label: 'Nightshade Seed',
                    min_level: 25,
                    xp: 110,
                    duration_ms: 2700000,
                },
                stardust_rose_seed: {
                    key: 'stardust_rose_seed',
                    label: 'Stardust Rose Seed',
                    min_level: 50,
                    xp: 155,
                    duration_ms: 5400000,
                },
                voidorchid_seed: {
                    key: 'voidorchid_seed',
                    label: 'Voidorchid Seed',
                    min_level: 75,
                    xp: 475,
                    duration_ms: 10800000,
                },
            }
        }
    };

    // Mappings for REPLACE_ICONS()
    const iconReplacements = {

        // General
        ".topbar a[href='logout.php']": { // Log out
            icon: "fa-solid fa-right-from-bracket", text: ""
        },
        ".topbar a[href='character_select.php']": { // Change character
            icon: "fa-solid fa-person-walking-dashed-line-arrow-right", text: ""
        },
        ".topbar a[href='game.php?page=leaderboard']": { // Leaderboard
            icon: "ra ra-trophy", text: ""
        },
        ".topbar a[href='game.php?page=shop']": { // Buy credits
            icon: "fa-solid fa-plus", text: "Buy"
        },
        ".topbar #session-stop": { // Session stop
            icon: "fa-solid fa-xmark", text: ""
        },
        ".topbar #session-renew": { // Session Renew
            icon: "fa-solid fa-arrows-rotate", text: ""
        },
        ".topbar .progress-badge-icon": { // Session XP Rate
            icon: "ra ra-progression", text: ""
        },
        ".topbar a[href='game.php?page=messages']": { // Messages
            icon: "ra ra-speech-bubble", text: ""
        },

        "a[href='game.php?page=news']": { // News
            icon: "fa-solid fa-newspaper", text: ""
        },

        "a[href='game.php?page=settings']": { // News
            icon: "fa-solid fa-gear", text: ""
        },

        ".dm-reward-icon": { // Daily Quests Reward
            icon: "fa-solid fa-gift", text: " Reward"
        },

        ".dm-reroll-btn": { // Daily Quests Reroll
            icon: "fa-solid fa-redo", text: ""
        },

        ".dm-bonus-locked": { // Daily Quests Locked
            icon: "ra ra-padlock", text: ""
        },

        ".premium-badge>.premium-icon": { // PTopbar Premium Badge
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

        ".sidebar-inventory-title .inv-sort-btn": { // Inventory Sort
            icon: "fa-solid fa-sort", text: ""
        },

        ".sidebar-inventory-title a[href='game.php?page=bank']": { // Bank
            icon: "ra ra-strongbox", text: " Bank"
        },

        // Gathering Skills
        "a[href='game.php?skill=woodcutting'] .skill-icon": { // Woodcutting
            icon: "ra ra-fire-axe", text: ""
        },

        "a[href='game.php?skill=mining'] .skill-icon": { // Mining
            icon: "ra ra-war-pick", text: ""
        },

        "a[href='game.php?skill=fishing'] .skill-icon": { // Fishing
            icon: "ra ra-fishing-pole", // or ra-fish
            text: ""
        },

        "a[href='game.php?skill=farming'] .skill-icon": { // Farming
            icon: "ra ra-wheat", text: ""
        },

        "a[href='game.php?skill=thieving'] .skill-icon": { // Thieving
            icon: "ra ra-balaclava", // or ra-balaclava
            text: ""
        },

        "a[href='game.php?skill=arcana'] .skill-icon": { // Arcana
            icon: "ra ra-spell-book", text: ""
        },

        // Artisan skills
        "a[href='game.php?skill=cooking'] .skill-icon": { // Cooking
            icon: "ra ra-meat", text: ""
        },

        "a[href='game.php?skill=fletching'] .skill-icon": { // Fletching
            icon: "ra ra-arrowhead", text: ""
        },

        "a[href='game.php?skill=crafting'] .skill-icon": { // Crafting
            icon: "ra ra-claw-hammer", // or ra-hand-saw
            text: ""
        },

        "a[href='game.php?skill=herblore'] .skill-icon": { // Herblore
            icon: "ra ra-potion-ball", // or ra-corked-tube
            text: ""
        },

        "a[href='game.php?skill=smithing'] .skill-icon": { // Smithing
            icon: "ra ra-anvil-impact", text: ""
        },

        "a[href='game.php?skill=firemaking'] .skill-icon": { // Firemaking
            icon: "ra ra-campfire", text: ""
        },

        // Combat skills
        "a[href='game.php?skill=slayer'] .skill-icon": { // Slayer
            icon: "ra ra-daemon-skull", text: ""
        },

        "a[href='game.php?skill=attack'] .skill-icon": { // Attack
            icon: "ra ra-relic-blade", // or ra-sword
            text: ""
        },

        "a[href='game.php?skill=strength'] .skill-icon": { // Strength
            icon: "ra ra-biceps", text: ""
        },

        "a[href='game.php?skill=defence'] .skill-icon": { // Defence
            icon: "ra ra-slashed-shield", text: ""
        },

        "a[href='game.php?skill=hitpoints'] .skill-icon": { // Hitpoints
            icon: "ra ra-health-increase", // or ra-glass-heart
            text: ""
        },

        "a[href='game.php?skill=magic'] .skill-icon": { // Magic
            icon: "ra ra-wizard-staff", text: ""
        },

        "a[href='game.php?skill=ranged'] .skill-icon": { // Ranged
            icon: "ra ra-crossbow", text: ""
        },

        // Skill categories
        ".skill-category[data-category='gathering'] .skill-category-header .category-icon": { // Gathering
            icon: "ra ra-dig-dug", text: ""
        },

        ".skill-category[data-category='artisan'] .skill-category-header .category-icon": { // Artisan
            icon: "ra ra-gear-hammer", text: ""
        },

        ".skill-category[data-category='combat'] .skill-category-header .category-icon": { // Combat
            icon: "ra ra-knight-helmet", text: ""
        },

        ".skill-category[data-category='other'] .skill-category-header .category-icon": { // Miscs
            icon: "fa-solid fa-screwdriver-wrench", text: ""
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

            KX.KORUXA_STATS[name] = {
                level,
                xp_current: currentXP,
                xp_needed: levelUpXP,
                xp_total: totalXP
            };
        });
    }

    // Updates values and create new html elements
    function UPDATE_DATA() {
        for (const key in KX.mapping) {
            const entry = KX.mapping[key]; // { selector, value }
            const result = EXTRACT_DATA(entry.selector);
            KX.KORUXA_GLOBALS[key] = entry.value;

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
        if (KX.KORUXA_GLOBALS["current-skill"] !== "Doing") ENHANCED_HELPER();
        //console.table(KX.mapping); // Debug output
    }

    function SET_CURRENT_SKILL_CLASS() {
        const url = window.location.href;
        const match = url.match(/skill=([^&]+)/);
        if (!match) return;

        const skill = match[1].trim().toLowerCase();
        let bg_el = document.querySelector("#skill-background");

        if (!bg_el) {
            bg_el = document.createElement("div");
            bg_el.id = "skill-background";
            document.body.prepend(bg_el);
        }

        const skillBlacklist = ["slayer", "attack", , "strength", "defence", "hitpoints", "magic", "ranged"];
        if (skillBlacklist.includes(skill)) return;

        bg_el.className = `bg-skill ${skill}`;
        KX.KORUXA_GLOBALS["current-skill"] = skill;
    }

    function LOAD_CSS(url) {
        if (document.querySelector(`link[href="${url}"]`)) return;

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        document.head.appendChild(link);
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

                const iconHTML = `<i class="${cfg.icon}"></i>`;
                const textHTML = cfg.text ? `<span class="icon-text">${cfg.text}</span>` : "";

                el.innerHTML = iconHTML + textHTML;
                el.dataset.iconified = "1";
            });
        }
    }

    const cleanName = str => str.replace(/[^\w\s]/g, "").trim(); // Remove emojis + trim
    const cleanValue = str => Number(str.replace(/[^\d.-]/g, "")); // Convert "+15%" → 15

    function GET_XP(level, type = "ExpToNext") { // Usage : GET_XP(level, type)
        const xpToNext = [
            4, 11, 20, 31, 44, 60, 79, 101, 126, 155, 188, 226, 269, 318, 373, 435, 505, 584, 672, 771, 882, 1005, 1143, 1296, 1467, 1657, 1867, 2101, 2360, 2647,
            2965, 3317, 3705, 4135, 4609, 5131, 5708, 6343, 7043, 7813, 8661, 9593, 10619, 11745, 12982, 14341, 15832, 17468, 19262, 21230, 23386, 25749,
            28337, 31171, 34273, 37668, 41383, 45446, 49888, 54745, 60054, 65854, 72191, 79112, 86669, 94920, 103925, 113752, 124475, 136171, 148927,
            162837, 178002, 194533, 212549, 232181, 253569, 276869, 302246, 329881, 359971, 392728, 428386, 467193, 509424, 555374, 605364, 659742, 718886,
            783205, 853144, 929185, 1011850, 1101706, 1199369, 1305503, 1420833, 1546140, 1682274, 1830156, 1990782, 2165234, 2354683, 2560400, 2783760,
            3026253, 3289495, 3575236, 3885371, 4221954, 4587210, 4983547, 5413575, 5880121, 6386245, 6935261, 7530760, 8176626, 8877068, 9636642
        ];
        if (level < 1 || level > xpToNext.length) return null;

        let total = 0;
        for (let i = 0; i < level - 1; i++) { total += xpToNext[i]; }

        if (type === "ExpToNext") return (level - 1);
        else return total;
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
        const KNOWN = ['woodcutting', 'mining', 'fishing', 'farming', 'cooking', 'thieving', 'fletching', 'crafting', 'herblore', 'smithing', 'firemaking', 'arcana', 'slayer'];
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

    function CHECK_SKILLS_LEVELS() {
        const allLevels = KX.KORUXA_ALL_SKILL_LEVELS || {};
        for (const skill in KX.KORUXA_STATS) {
            const pageLevel = Number(allLevels[skill] ?? 0);
            const localLevel = Number(KX.KORUXA_STATS[skill]?.level ?? 0);

            if (pageLevel > localLevel) location.reload();
        }
    }

    function GET_LAST_UNLOCK_SKILL(skill) {
        const config = KORUXA_CONFIGS?.[skill];
        if (!config) return [];

        const lvl = (KX.KORUXA_ALL_SKILL_LEVELS || {})[skill] || 0;
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

    function CALC_SKILL_LEVEL_UP(skill, level = 0) {
        const actions = GET_LAST_UNLOCK_SKILL(skill);
        if (!actions || actions.length === 0) return null;

        const config = KORUXA_CONFIGS?.[skill] || {};
        const tools = KX.KORUXA_TOOLS || {};
        const farms = KX.KORUXA_FARMS || {};
        const stats = KX.KORUXA_STATS?.[skill] || {};
        const ExpToNext = level !== 0 ? Number(stats.xp_current) : GET_XP(level, "total");
        const premiumBonus = (KX.KORUXA_IS_PREMIUM ? 20 : 0);

        const compute = (action, e) => {
            const label = (e.label ?? action);
            const tool = tools[skill] || {};
            const farm = farms[skill] || {};

            const speed = (tool.speed || 0) + (farm.speed || 0) + premiumBonus;
            const xpBonus = (tool.xp || 0) + (farm.xp || 0) + premiumBonus;

            const xpPerLoop = (e.xp || 0) * (1 + xpBonus / 100);
            const msPerLoop = (e.duration_ms || 0) * Math.max(0, 1 - speed / 100);

            const xpLeft = Math.max(0, (Number(stats.xp_needed) || 0) - ExpToNext || 0);
            if (xpLeft <= 0 || xpPerLoop <= 0) return { skill, action, label, loops: 0, time: "0s", required: 0 };

            const loops = Math.ceil(xpLeft / xpPerLoop);
            return {
                skill,
                action,
                label,
                required: Math.round(xpPerLoop * loops),
                loops,
                time: FORMAT_TIME(Math.round((loops * msPerLoop) / 1000))
            };
        };

        const candidates = [];
        const pushEntry = (action, e) => {
            if (!e) return;
            const ratio = (e.xp || 0) / Math.max(1, (e.duration_ms || 1));
            candidates.push({ action, entry: e, ratio });
        };

        for (const action of actions) {
            const entry = config[action];
            if (entry && entry.xp) { pushEntry(action, entry); continue; }

            for (const cat of Object.values(config)) {
                const e = cat?.[action];
                if (e) { pushEntry(action, e); break; }
            }
        }

        if (candidates.length === 0) return null;
        candidates.sort((a, b) => b.ratio - a.ratio);

        // compute top 3 (if available)
        const results = [];
        for (let i = 0; i < 3 && i < candidates.length; i++) {
            results.push(compute(candidates[i].action, candidates[i].entry));
        }

        return results;
    }

    // Displays a helper for the current skill or forced skill
    function ENHANCED_HELPER() {
        const SKILL_ICONS = {
            woodcutting: "ra ra-fire-axe", mining: "ra ra-war-pick",
            fishing: "ra ra-fishing-pole", farming: "ra ra-wheat",
            thieving: "ra ra-balaclava", arcana: "ra ra-spell-book",
            cooking: "ra ra-meat", fletching: "ra ra-arrowhead",
            crafting: "ra ra-claw-hammer", herblore: "ra ra-potion-ball",
            smithing: "ra ra-anvil-impact", firemaking: "ra ra-campfire",
            default: "fa-solid fa-star"
        };

        const forced = (KX.KORUXA_GLOBALS?.["forced-current-skill"] || "").toLowerCase();
        const current = (KX.KORUXA_GLOBALS?.["current-skill"] || "").toLowerCase();
        const skill = (forced && forced !== "none") ? forced : (current || null);
        if (!skill) return;

        const result = CALC_SKILL_LEVEL_UP(skill); // optionnal arg is the current level
        if (!result?.length) return;

        const [first, second, third] = result;
        const level = KX.KORUXA_STATS?.[skill]?.level ?? 0;
        const approx = skill === "thieving" ? "~" : "";
        const phrase = [
            `Level up ${first.skill} with <b>${FORMAT_NUMBER(first.required)}</b> XP`,
            `1. <b>${first.label} ${approx}x${FORMAT_NUMBER(first.loops, 0)}</b> — <b>${first.time}</b>`,
            second && `2. <b>${second.label} ${approx}x${FORMAT_NUMBER(second.loops, 0)}</b> — <b>${second.time}</b>`,
            third && `3. <b>${third.label} ${approx}x${FORMAT_NUMBER(third.loops, 0)}</b> — <b>${third.time}</b>`
        ].filter(Boolean).join("<br>");

        let el = document.querySelector("#enhanced-helper");
        if (!el) {
            el = document.createElement("div");
            el.id = "enhanced-helper";
            el.className = "enhanced-helper";
            el.innerHTML = `
      <div class="enhanced-helper-buttons"></div>
      <div class="enhanced-helper-title"><i class="ra ra-crown-coin"></i> Koruxa Helper <span class="enhanced-helper-subtitle"></span></div>
      <div class="enhanced-helper-item"></div>`;
            document.querySelector(".sidebar-right")?.prepend(el);
        }

        const buttonsContainer = el.querySelector(".enhanced-helper-buttons") ?? (() => {
            const c = document.createElement("div");
            c.className = "enhanced-helper-buttons";
            el.prepend(c);
            return c;
        })();

        if (!buttonsContainer.hasChildNodes()) {
            const skills = (typeof KORUXA_CONFIGS === "object" && KORUXA_CONFIGS) ? Object.keys(KORUXA_CONFIGS) : [skill];
            buttonsContainer.append(...skills.map(k => {
                const key = k.toLowerCase();
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "enhanced-helper-btn";
                btn.dataset.skill = key;
                btn.innerHTML = `<i class="${SKILL_ICONS[key] || SKILL_ICONS.default}" aria-hidden="true"></i>`;
                return btn;
            }));
        }

        if (!buttonsContainer._enhancedHelperDelegated) {
            buttonsContainer.addEventListener("click", e => {
                const btn = e.target.closest("button.enhanced-helper-btn");
                if (!btn) return;
                const clicked = (btn.dataset.skill || "").toLowerCase();
                if (!clicked) return;
                KX.KORUXA_GLOBALS["forced-current-skill"] = clicked;
                ENHANCED_HELPER();
            });
            buttonsContainer._enhancedHelperDelegated = true;
        }

        const activeTarget = (KX.KORUXA_GLOBALS?.["forced-current-skill"] || "").toLowerCase();
        const target = (activeTarget && activeTarget !== "none") ? activeTarget : skill;
        buttonsContainer.querySelectorAll("button.enhanced-helper-btn").forEach(b =>
            b.classList.toggle("active", (b.dataset.skill || "").toLowerCase() === target)
        );

        el.querySelector(".enhanced-helper-item").innerHTML = phrase;
        el.querySelector(".enhanced-helper-subtitle").textContent = `Reach ${skill} Lv. ${Number(level) + 1}`;
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

    function TRANSFORM_DROPS() {
        const box = document.querySelector(".chatbox-messages");
        if (!box) return;

        box.querySelectorAll(".chat-drop-text").forEach(t => {
            if (t.dataset.transformed === "1") return;

            const u =
                t.closest(".chat-drop-content")?.querySelector(".chat-username.drop") ||
                t.closest(".chat-message")?.querySelector(".chat-username.drop");
            if (!u) return;

            const raw = t.textContent.trim();
            const username = u.textContent.trim();

            let emoji = "🌙";
            if (raw.includes("⭐") || raw.includes("Star")) emoji = "⭐";
            else if (raw.includes("☀️") || raw.includes("Sun")) emoji = "☀️";
            else if (raw.includes("🌙") || raw.includes("Moon")) emoji = "🌙";

            const mCombat = raw.match(/found\s+(.+?)\s+from\s+(.+?)\s+\(monster lvl\s+(\d+)\)!?$/);
            const mSkill = raw.match(/found\s+(.+?)\s+from\s+(.+?)\s+at level\s+(\d+)!?$/);
            const m = mCombat || mSkill;
            if (!m) return;

            let item = m[1].replace(/\s+(Star|Moon|Sun)$/, "").trim();
            const action = m[2];
            const level = m[3];

            t.innerHTML =
                `<div class="chat-drop-emoji">${emoji}</div> ` +
                `${username} found a ${emoji} ${item} from ${action} at level ${level}!`;
            t.dataset.transformed = "1";
        });
    }

    function LOCK_SIDEBAR() {
        const sts = ['lsb-unlocked', 'lsb-locked-open', 'lsb-locked-closed'],
            ics = ['fas fa-arrows-left-right', 'fas fa-lock', 'fas fa-lock'],
            sL = document.querySelector('.sidebar-left'),
            gL = document.querySelector('.game-layout'),
            f = document.querySelector('.sidebar-footer');

        if (!f || document.getElementById('sidebar-lock-btn')) return;

        const b = document.createElement('div');
        b.id = 'sidebar-lock-btn';
        b.className = 'sidebar-footer-btn';

        const updateUI = (state = "lsb-unlocked") => {
            const idx = sts.indexOf(state);
            b.innerHTML = `<i class="${ics[idx]}"></i>`;

            if (gL) {
                b.className = `sidebar-footer-btn ${state.replace('lsb-', '')}`;
                sts.forEach(s => gL.classList.toggle(s, s === state));
                if (state !== 'lsb-unlocked') gL.classList.remove('lsb-hover');
            }
        };

        b.onclick = () => {
            const cur = KX.KORUXA_GLOBALS["sidebar-state"];
            const next = sts[(sts.indexOf(cur) + 1) % 3];
            KX.KORUXA_GLOBALS["sidebar-state"] = next;
            updateUI(next);
        };

        if (sL && gL && window.innerWidth > 1024) {
            sL.onmouseenter = () => {
                if (KX.KORUXA_GLOBALS["sidebar-state"] === 'lsb-unlocked') {
                    gL.classList.add('lsb-hover');
                }
            };
            sL.onmouseleave = () => gL.classList.remove('lsb-hover');
        }

        f.prepend(b);
        updateUI(KX.KORUXA_GLOBALS["sidebar-state"]);
    }

    const sidebarRight = document.querySelector('.sidebar-right');
    if (document.querySelector('#food-bar')) document.querySelector('#sidebar-hp-bar').after(document.querySelector('#food-bar'));
    const observer = new MutationObserver(() => { REPLACE_ICONS(); TRANSFORM_DROPS(); SET_CURRENT_SKILL_CLASS(); });
    observer.observe(document.body, { childList: true, subtree: true });

    // Update REPLACE_ICONS on sort-menu button click
    const sortMenu = document.querySelector('.inv-sort-menu');
    if (sortMenu && sidebarRight) sortMenu.addEventListener('click', e => {
        setTimeout(() => { REPLACE_ICONS(); }, 1500);
    });

    REPLACE_ICONS();
    TRANSFORM_DROPS();
    LOCK_SIDEBAR();
    LOAD_CSS("https://fonts.googleapis.com/css2?family=Saira:ital,wght@0,100..900;1,100..900&display=swap");
    LOAD_CSS("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css");
    LOAD_CSS("https://goldenlys.github.io/Koruxa-Enhancer/css/rpg-awesome.min.css");
    LOAD_CSS("https://goldenlys.github.io/Koruxa-Enhancer/css/style.css");

    // console.table(KX.mapping); // Debug output
    try {
        // start with a 1.5s initial delay and 2s interval
        startKoruxaUpdater({ initialDelayMs: 1500, intervalMs: 2000 });
    } catch (err) { console.error('Koruxa Enhanced error', err); }
})();