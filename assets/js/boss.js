/***
*
* Koruxa Boss Damage Stat Table
* 
* Shows default values and increases per point invested

| Stat Name       | Default value                   | Increase per Point  | Maximum    | Maximum points | Price per point | Notes                                       |
|-----------------|---------------------------------|---------------------|------------|----------------|-----------------|---------------------------------------------|
| Damage          | +5 max damage                   | +1 per level        | Unlimited  | Infinite       | 5               | Increases base attack power                 |
| Time Extension  | 30s time per attempt            | +1 second per level | Unlimited  | 30             | 8               | Extends each attack attempt duration        |
| Critical Chance | 5% crit chance                  | +1% per level       | 25%        | 25             | 8               | Higher crit chance means more damage procs  |
| Power           | ×1.00 damage                    | ^1.28 per level     | Unlimited  | Infinite       | 12              | Multiplies total damage output              |
| Devastation     | ×1.00 crit damage mult          | +0.15× per level    | 3.00×      | 20             | 12              | Increases critical hit damage               |
| Rage            | +0% bonus from consecutive hits | +5% per Rage level  | 75%        | 15             | 12              | Hitting same body repeatedly builds up Rage |
| Precision       | +0% bonus to min damage         | +1% per level       | 40%        | 40             | 25              | Raises minimum hit damage per level         |
|-----------------|---------------------------------|---------------------|------------|----------------|-----------------|---------------------------------------------|
| Institute Researches (not using scrolls)
|-----------------|---------------------------------|---------------------|------------|----------------|-----------------|---------------------------------------------|
| Clan Warfare    | +0% bonus to damage             | +0.2% per level     | 25%        | 50             | 0 (no scrolls)  | Coordinated strikes against the great beasts. +0.2% clan boss damage per level.          |
| Lethal Study    | +0% crit chance                 | +0.1% per level     | 5%         | 50             | 0 (no scrolls)  | Learn where the great beasts are soft. +0.1% crit chance against the clan boss per level (also above the 75% cap).|
| Practiced Form  | +0% bonus to min damage         | +0.1% per level     | 5%         | 50             | 0 (no scrolls)  | Drilled until every swing counts. +0.1% minimum hit against the clan boss per level, on top of Precision and cards (also above the 40% cap). |
| Siegecraft      | +0% damage bonus                | +0.1% per level     | 5%         | 50             | 0 (no scrolls)  | Know how to crack a ward. +0.1% damage to clan boss shields per level. |
| Kindled Fury    | +0% bonus rage speed build-up   | +1% per level       | 25%        | 25             | 0 (no scrolls)  | Anger comes quicker. Your rage against the clan boss builds 1% faster per level. |
| Deep Wrath      | +0 bonus rage level             | +1 per level        | +10        | 10             | 0 (no scrolls)  | Room for more fury. +1 rage cap against the clan boss per level (max +10). Cannot be prestiged. |

This table shows how each stat impacts your damage potential as you invest more scrolls.

In-Game WIKI 

⚔️ How It Works
The Clan Boss is a shared boss that all clan members fight together. Each player gets a limited number of attempts per window. Deal as much damage as possible within your fight timer!

💪 Damage Calculation
Base Hit: Random 1 to (5 + Damage Level)
Power: Multiplied by 1.28power level
Crit: 5% + Crit Level. Crits multiply damage by 1.5 + (0.15 x Devastation Level)
Rage: +10% per consecutive hit on same part, capped at Rage Level x 5% (+ up to 10 from the Institute)
🛡️ Shields & Parts
From Tier 50+, boss parts gain shields. Shields must be destroyed before damaging the part HP. Target specific parts to focus your damage!

📜 Scrolls & Upgrades
When the boss is killed, ALL clan members receive scrolls. Use scrolls in the Clan Shop to upgrade your stats. Higher tiers = more scrolls.

⚡ Clan Boosts (Leaders only)
Extra Attempt: +1 attempt for all players (50 clan credits, max 3)
Cooldown Skip: Skip 1h of boss cooldown (50 cc/hr)
Scroll Multiplier: 2x scrolls on next kill (200 cc)
🔄 Respec
Remove 1 level from any upgrade for 50 credits. Scrolls are refunded. 12-hour cooldown between respecs.

***/

const cachedKoruxaData = localStorage.getItem('koruxa_boss_upgrades');

function FORMAT_NUMBER(num, decimals = 0) {
    if (typeof num !== "number" || isNaN(num)) return "0";

    const absNum = Math.abs(num);
    const suffixDecimals = decimals === 0 ? 2 : decimals;

    // Define scale thresholds and their abbreviations
    const scales = [
        { threshold: 1e63, suffix: "Vg", exponent: 63 },   // Vigintillion
        { threshold: 1e60, suffix: "Nd", exponent: 60 },   // Novemdecillion
        { threshold: 1e57, suffix: "Od", exponent: 57 },   // Octodecillion
        { threshold: 1e54, suffix: "St", exponent: 54 },   // Septendecillion
        { threshold: 1e51, suffix: "Sd", exponent: 51 },   // Sexdecillion
        { threshold: 1e48, suffix: "Qd", exponent: 48 },   // Quindecillion
        { threshold: 1e45, suffix: "Qt", exponent: 45 },   // Quattuordecillion
        { threshold: 1e42, suffix: "Td", exponent: 42 },   // Tredecillion
        { threshold: 1e39, suffix: "Dd", exponent: 39 },   // Duodecillion
        { threshold: 1e36, suffix: "Ud", exponent: 36 },   // Undecillion
        { threshold: 1e33, suffix: "Dc", exponent: 33 },   // Decillion
        { threshold: 1e30, suffix: "No", exponent: 30 },   // Nonillion
        { threshold: 1e27, suffix: "Oc", exponent: 27 },   // Octillion
        { threshold: 1e24, suffix: "Sp", exponent: 24 },   // Septillion
        { threshold: 1e21, suffix: "Sx", exponent: 21 },   // Sextillion
        { threshold: 1e18, suffix: "Qi", exponent: 18 },   // Quintillion
        { threshold: 1e15, suffix: "Qa", exponent: 15 },   // Quadrillion
        { threshold: 1e12, suffix: "T", exponent: 12 },    // Trillion
        { threshold: 1e9, suffix: "B", exponent: 9 },      // Billion
        { threshold: 1e6, suffix: "M", exponent: 6 }       // Million
    ];

    // Find the appropriate scale
    for (const scale of scales) {
        if (absNum >= scale.threshold) {
            const formatted = (num / scale.threshold).toLocaleString(undefined, {
                minimumFractionDigits: suffixDecimals,
                maximumFractionDigits: suffixDecimals
            });
            return formatted + scale.suffix;
        }
    }

    // For numbers smaller than 1 million
    return num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function GET_SCROLL_COST(currentLevel, baseCost, type = "any") {
    const targetLevel = currentLevel + 1;

    if (type === "power") {
        if (targetLevel <= 50) return targetLevel * baseCost;
        if (targetLevel <= 70) return targetLevel * baseCost * 3;
        if (targetLevel <= 90) return targetLevel * baseCost * 8;
        return targetLevel * baseCost * 20;
    }

    return targetLevel * baseCost;
}

function GET_TOTAL_SCROLLS_SPENT(currentLevel, baseCost) {
    if (currentLevel <= 0) return 0;

    if (currentLevel <= 50) {
        return (currentLevel * (currentLevel + 1) / 2) * baseCost;
    }

    const baseTotal = (50 * 51 / 2) * baseCost;
    const extraLevels = currentLevel - 50;
    const extraTotal = (extraLevels * (51 + currentLevel) / 2) * baseCost * 3;

    return baseTotal + extraTotal;
}

function GET_AVG_DPS_PER_SCROLL(globalDPS, currentLevel, baseCost) {
    const totalSpent = GET_TOTAL_SCROLLS_SPENT(currentLevel, baseCost);
    return totalSpent > 0 ? globalDPS / totalSpent : 0;
}

function GET_DAMAGE_PER_LEVEL(statName, currentLevel, globalDPS, totalTime) {
    if (currentLevel <= 0) return 0;

    let multiplier = 0;

    if (statName === 'damage') {
        const lvlDmg = parseInt(document.getElementById('lvlDamage').value) || 0;
        multiplier = 1 / (5 + lvlDmg);
    } else if (statName === 'power') {
        multiplier = 0.28;
    } else if (statName === 'crit') {
        const lvlCrit = parseInt(document.getElementById('lvlCrit').value) || 0;
        if (lvlCrit > 25) return 0;

        const lvlDev = parseInt(document.getElementById('lvlDevastation').value) || 0;
        const critMult = 1.0 + (lvlDev * 0.15);
        const currentCritFactor = 1 + (Math.min((5 + lvlCrit) / 100, 0.25) * (critMult - 1));
        multiplier = (0.01 * (critMult - 1)) / currentCritFactor;
    } else if (statName === 'devastation') {
        const lvlDev = parseInt(document.getElementById('lvlDevastation').value) || 0;
        if (lvlDev > 20) return 0;

        const lvlCrit = parseInt(document.getElementById('lvlCrit').value) || 0;
        const critChance = Math.min((5 + lvlCrit) / 100, 0.25);
        const currentCritFactor = 1 + (critChance * (lvlDev * 0.15));
        multiplier = (critChance * 0.15) / currentCritFactor;
    } else if (statName === 'time') {
        const lvlTime = parseInt(document.getElementById('lvlTime').value) || 0;
        if (lvlTime > 30) return 0;
        multiplier = 1 / (30 + lvlTime);
    } else if (statName === 'rage') {
        const lvlRage = parseInt(document.getElementById('lvlRage')?.value || currentLevel) || 0;
        if (lvlRage > 15) return 0;
        multiplier = 0.05 / (1 + (lvlRage * 0.05));
    } else if (statName === 'precision') {
        const lvlPrec = parseInt(document.getElementById('lvlPrecision')?.value || currentLevel) || 0;
        if (lvlPrec > 40) return 0;
        multiplier = 0.01 / (1 + (lvlPrec * 0.01));
    } else if (statName === 'warfare') {
        const lvlWar = parseInt(document.getElementById('lvlWarfare')?.value || currentLevel) || 0;
        if (lvlWar > 50) return 0;
        multiplier = 0.002 / (1 + (lvlWar * 0.002));
    }

    return (globalDPS * totalTime) * multiplier;
}

function saveToLocalStorage(inputs) {
    const data = {};
    for (const [key, element] of Object.entries(inputs)) {
        data[key] = element.value;
    }
    localStorage.setItem('koruxa_boss_upgrades', JSON.stringify(data));
}

function loadFromLocalStorage(inputs, rawData) {
    try {
        if (!rawData) return;
        const data = JSON.parse(rawData);
        for (const [key, element] of Object.entries(inputs)) {
            if (data[key] !== undefined) {
                element.value = data[key];
            }
        }
    } catch (e) {
        console.error('Error loading local storage', e);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const inputs = {
        lvlDamage: document.getElementById('lvlDamage'),
        lvlTime: document.getElementById('lvlTime'),
        lvlCrit: document.getElementById('lvlCrit'),
        lvlPower: document.getElementById('lvlPower'),
        lvlDevastation: document.getElementById('lvlDevastation'),
        lvlRage: document.getElementById('lvlRage'),
        lvlPrecision: document.getElementById('lvlPrecision'),
        lvlClanWarfare: document.getElementById('lvlClanWarfare')
    };

    const rangeHitValueDisplay = document.getElementById('rangeHitValue');
    const rangeHitDescDisplay = document.getElementById('rangeHitDesc');
    const rangeAttemptDisplay = document.getElementById('rangeAttemptValue');
    const avgHitDisplay = document.getElementById('avgHitValue');
    const avgAttemptDisplay = document.getElementById('avgAttemptValue');
    const durationDisplay = document.getElementById('combatDuration');
    const durationDisplay2 = document.getElementById('combatDuration2');

    function calculateResults() {
        const lvlDmg = parseInt(inputs.lvlDamage.value) || 0;
        const lvlTime = parseInt(inputs.lvlTime.value) || 0;
        const lvlCrit = parseInt(inputs.lvlCrit.value) || 0;
        const lvlPower = parseInt(inputs.lvlPower.value) || 0;
        const lvlDev = parseInt(inputs.lvlDevastation.value) || 0;
        const lvlRage = parseInt(inputs.lvlRage.value) || 0;
        const lvlPrecision = parseInt(inputs.lvlPrecision.value) || 0;
        const lvlClanWarfare = parseInt(inputs.lvlClanWarfare.value) || 0;

        // Calculate costs for each stat
        const costDamage = GET_SCROLL_COST(lvlDmg, 5);
        const costTime = GET_SCROLL_COST(lvlTime, 8);
        const costCrit = GET_SCROLL_COST(lvlCrit, 8);
        const costPower = GET_SCROLL_COST(lvlPower, 12, "power");
        const costDev = GET_SCROLL_COST(lvlDev, 12);
        const costRage = GET_SCROLL_COST(lvlRage, 12);
        const costPrecision = GET_SCROLL_COST(lvlPrecision, 25);

        // Constants & Base Stats
        const clanWarfareMult = 1 + (lvlClanWarfare * 0.002);
        const baseMaxDmg = (5 + lvlDmg) * clanWarfareMult;
        const totalTime = 30 + Math.min(lvlTime, 30);
        const powerMult = Math.pow(1.28, lvlPower);
        const critChance = Math.min((5 + lvlCrit) / 100, 1);
        const critMult = 1.5 + (lvlDev * 0.15);
        const maxRageBonus = Math.min(lvlRage, 15) * 0.05;

        // 1. Calculate Average Rage Multiplier over time (Ramp-up: +10% per hit/sec until cap)
        let rageAvgMult = 1.0;
        if (maxRageBonus > 0) {
            const rampTime = Math.ceil(maxRageBonus / 0.10);
            const actualRampTime = Math.min(totalTime, rampTime);
            const rampArea = (actualRampTime * (0 + (actualRampTime - 1) * 0.10)) / 2;
            const capArea = Math.max(0, totalTime - actualRampTime) * maxRageBonus;
            rageAvgMult = 1 + ((rampArea + capArea) / totalTime);
        }

        // 2. Damage per Second (DPS) Logic
        const minBaseDmg = Math.max(1, baseMaxDmg * (lvlPrecision * 0.01));
        const avgBaseRoll = (minBaseDmg + baseMaxDmg) / 2;
        const critFactor = 1 + (critChance * (critMult - 1));
        const globalDPS = avgBaseRoll * powerMult * critFactor * rageAvgMult;

        // 3. Peak Performance (Max Hit display)
        const peakNormalHit = baseMaxDmg * powerMult * (1 + maxRageBonus);
        const peakCritHit = peakNormalHit * critMult;
        const totalMaxDamage = peakCritHit * totalTime;

        // 4. Average Damage per Scroll
        const totalSpent =
            GET_TOTAL_SCROLLS_SPENT(lvlDmg, 5) +
            GET_TOTAL_SCROLLS_SPENT(lvlTime, 8) +
            GET_TOTAL_SCROLLS_SPENT(lvlCrit, 8) +
            GET_TOTAL_SCROLLS_SPENT(lvlPower, 12) +
            GET_TOTAL_SCROLLS_SPENT(lvlDev, 12) +
            GET_TOTAL_SCROLLS_SPENT(lvlRage, 12);
        const avgAttemptDamage = globalDPS * totalTime;
        const avgDamagePerScroll = totalSpent > 0 ? avgAttemptDamage / totalSpent : 0;

        //5. Get minimum hit damage
        const minHitDamage = lvlPrecision < 1 ? 1 : peakNormalHit * (lvlPrecision * 0.01);


        // 6. Single Stat Efficiencies (Avg Damage gained per scroll spent)
        const effDmg = GET_DAMAGE_PER_LEVEL('damage', lvlDmg, globalDPS, totalTime);
        const effTime = GET_DAMAGE_PER_LEVEL('time', lvlTime, globalDPS, totalTime);
        const effCrit = GET_DAMAGE_PER_LEVEL('crit', lvlCrit, globalDPS, totalTime);
        const effPower = GET_DAMAGE_PER_LEVEL('power', lvlPower, globalDPS, totalTime);
        const effDev = GET_DAMAGE_PER_LEVEL('devastation', lvlDev, globalDPS, totalTime);
        const effRage = GET_DAMAGE_PER_LEVEL('rage', lvlRage, globalDPS, totalTime);
        const effPrecision = GET_DAMAGE_PER_LEVEL('precision', lvlPrecision, globalDPS, totalTime);
        const effWarfare = GET_DAMAGE_PER_LEVEL('warfare', lvlClanWarfare, globalDPS, totalTime);

        //7. Calculate the real-time efficiency (dmg gained / cost of next upgrade)
        const scrollEffDmg = costDamage > 0 ? effDmg / costDamage : 0;
        const scrollEffTime = costTime > 0 ? effTime / costTime : 0;
        const scrollEffCrit = costCrit > 0 ? effCrit / costCrit : 0;
        const scrollEffPower = costPower > 0 ? effPower / costPower : 0;
        const scrollEffDev = costDev > 0 ? effDev / costDev : 0;
        const scrollEffRage = costRage > 0 ? effRage / costRage : 0;
        const scrollEffPrecision = costPrecision > 0 ? effPrecision / costPrecision : 0;

        // UI Updates
        rangeHitValueDisplay.innerHTML = `${FORMAT_NUMBER(minHitDamage, 0)} - ${FORMAT_NUMBER(baseMaxDmg * powerMult, 0)} <div class="marked small red">(${FORMAT_NUMBER(baseMaxDmg * powerMult * critMult, 0)} Crit)</div>`;
        rangeHitDescDisplay.innerHTML = `with a <div class="marked">x${FORMAT_NUMBER(powerMult, 2)}</div> damage multiplier`;
        rangeAttemptDisplay.textContent = `${FORMAT_NUMBER(minHitDamage * totalTime)} - ${FORMAT_NUMBER(totalMaxDamage, 0)}`;
        avgHitDisplay.textContent = "~" + FORMAT_NUMBER(globalDPS, 0);
        avgAttemptDisplay.textContent = "~" + FORMAT_NUMBER(globalDPS * totalTime, 0);
        durationDisplay.textContent = totalTime;
        durationDisplay2.textContent = totalTime;

        document.getElementById('boostValue').textContent = `${FORMAT_NUMBER(baseMaxDmg * powerMult, 0)} max hit damage`;
        document.getElementById('timeValue').textContent = `${totalTime} seconds`;
        document.getElementById('critValue').textContent = `${FORMAT_NUMBER(critChance * 100, 0)}% critical hit chance`;
        document.getElementById('powerValue').textContent = `x${FORMAT_NUMBER(powerMult, 2)} damage multiplier`;
        document.getElementById('devastationValue').textContent = `x${FORMAT_NUMBER(critMult, 2)} critical hit damage`;
        document.getElementById('rageValue').textContent = `+${FORMAT_NUMBER(maxRageBonus * 100, 0)}% focus damage cap`;
        document.getElementById('precisionValue').textContent = `${FORMAT_NUMBER(minHitDamage, 0)} min hit damage`;
        document.getElementById('instituteWarfareValue').textContent = `+${FORMAT_NUMBER((clanWarfareMult - 1) * 10, 2)}% damage multiplier`;

        document.getElementById('boostCost').textContent = `Cost: ${FORMAT_NUMBER(costDamage, 0)} scrolls`;
        document.getElementById('timeCost').textContent = `Cost: ${FORMAT_NUMBER(costTime, 0)} scrolls`;
        document.getElementById('critCost').textContent = `Cost: ${FORMAT_NUMBER(costCrit, 0)} scrolls`;
        document.getElementById('powerCost').textContent = `Cost: ${FORMAT_NUMBER(costPower, 0)} scrolls`;
        document.getElementById('devastationCost').textContent = `Cost: ${FORMAT_NUMBER(costDev, 0)} scrolls`;
        document.getElementById('rageCost').textContent = `Cost: ${FORMAT_NUMBER(costRage, 0)} scrolls`;
        document.getElementById('precisionCost').textContent = `Cost: ${FORMAT_NUMBER(costPrecision, 0)} scrolls`;
        document.getElementById('instituteWarfareCost').textContent = `Cost: money & slayer skill loot`;

        document.getElementById('boostAvgDmgPerLevel').innerHTML = `dmg/level ${FORMAT_NUMBER(effDmg, 1)}`;
        document.getElementById('timeAvgDmgPerLevel').innerHTML = `dmg/level ${FORMAT_NUMBER(effTime, 1)}`;
        document.getElementById('critAvgDmgPerLevel').innerHTML = `dmg/level ${FORMAT_NUMBER(effCrit, 1)}`;
        document.getElementById('powerAvgDmgPerLevel').innerHTML = `dmg/level ${FORMAT_NUMBER(effPower, 1)}`;
        document.getElementById('devastationAvgDmgPerLevel').innerHTML = `dmg/level ${FORMAT_NUMBER(effDev, 1)}`;
        document.getElementById('rageAvgDmgPerLevel').innerHTML = `dmg/level ${FORMAT_NUMBER(effRage, 1)}`;
        document.getElementById('precisionAvgDmgPerLevel').innerHTML = `dmg/level ${FORMAT_NUMBER(effPrecision, 2)}`;
        document.getElementById('instituteWarfareAvgDmgPerLevel').innerHTML = `dmg/level ${FORMAT_NUMBER(effWarfare, 2)}`;

        document.getElementById('boostDmgPerScroll').innerHTML = `dmg/scroll ${FORMAT_NUMBER(scrollEffDmg, 1)}`;
        document.getElementById('timeDmgPerScroll').innerHTML = `dmg/scroll ${FORMAT_NUMBER(scrollEffTime, 1)}`;
        document.getElementById('critDmgPerScroll').innerHTML = `dmg/scroll ${FORMAT_NUMBER(scrollEffCrit, 1)}`;
        document.getElementById('powerDmgPerScroll').innerHTML = `dmg/scroll ${FORMAT_NUMBER(scrollEffPower, 1)}`;
        document.getElementById('devastationDmgPerScroll').innerHTML = `dmg/scroll ${FORMAT_NUMBER(scrollEffDev, 1)}`;
        document.getElementById('rageDmgPerScroll').innerHTML = `dmg/scroll ${FORMAT_NUMBER(scrollEffRage, 1)}`;
        document.getElementById('precisionDmgPerScroll').innerHTML = `dmg/scroll ${FORMAT_NUMBER(scrollEffPrecision, 2)}`;
        document.getElementById('instituteWarfareDmgPerScroll').innerHTML = `no dmg/scroll`;

        document.getElementById('totalScrollsSpent').textContent = FORMAT_NUMBER(totalSpent, 0);
        document.getElementById('avgDpsPerScroll').textContent = "~" + FORMAT_NUMBER(avgDamagePerScroll, 1);
    }


    setTimeout(() => {
        loadFromLocalStorage(inputs, cachedKoruxaData);
        calculateResults();
    }, 50);

    Object.values(inputs).forEach(input => {
        input.addEventListener('input', function () {
            saveToLocalStorage(inputs);
            calculateResults();
        });
    });
    calculateResults();
});