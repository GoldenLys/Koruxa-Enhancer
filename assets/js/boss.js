/***
*
* Koruxa Boss Damage Stat Table
* 
* Shows default values and increases per point invested

| Stat Name       | Default value                   | Increase per Point  | Maximum    | Maximum points | Price per point | Notes                                       |
|-----------------|---------------------------------|---------------------|------------|----------------|-----------------|---------------------------------------------|
| Damage Boost    | +5 max damage                   | +1 per level        | Unlimited  | Infinite       | 5               | Increases base attack power                 |
| Time Extension  | 30s time per attempt            | +1 second per level | Unlimited  | 30             | 8               | Extends each attack attempt duration        |
| Critical Strike | 5% chance                       | +1% per level       | 25%        | 25             | 8               | Higher crit chance means more damage procs  |
| Power           | ×1.00 (base)                    | x1.28 per level     | Unlimited  | Infinite       | 12              | Multiplies total damage output              |
| Devastation     | ×1.00 crit damage mult          | +0.15× per level    | 3.00×      | 20             | 12              | Increases critical hit damage               |
| Rage            | +0% bonus from consecutive hits | +5% per Rage level  | 75%        | 15             | 12              | Hitting same body repeatedly builds up Rage |
 
This table shows how each stat impacts your damage potential as you invest more scrolls.
***/

const cachedKoruxaData = localStorage.getItem('koruxa_boss_upgrades');

function FORMAT_NUMBER(num, decimals = 0) {
    if (typeof num !== "number" || isNaN(num)) return "0";
    return num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function GET_SCROLL_COST(currentLevel, baseCost) {
    const targetLevel = currentLevel + 1;
    if (targetLevel <= 50) return targetLevel * baseCost;

    // May need to adjust this post-50 multiplier once we can verify the exact acceleration rate.
    return targetLevel * baseCost * 2;
}

function GET_TOTAL_SCROLLS_SPENT(currentLevel, baseCost) {
    let total = 0;
    for (let i = 1; i <= currentLevel; i++) {
        total += i <= 50 ? i * baseCost : i * baseCost * 2;
    }
    return total;
}

function GET_AVG_DPS_PER_SCROLL(globalDPS, currentLevel, baseCost) {
    const totalSpent = GET_TOTAL_SCROLLS_SPENT(currentLevel, baseCost);
    return totalSpent > 0 ? globalDPS / totalSpent : 0;
}

function GET_DAMAGE_PER_LEVEL(statName, currentLevel, globalDPS, totalTime) {
    if (currentLevel === 0) return 0;

    let multiplier = 0;

    if (statName === 'damage') {
        const lvlDmg = parseInt(document.getElementById('lvlDamage').value) || 0;
        multiplier = 1 / (5 + lvlDmg);
    } else if (statName === 'power') {
        multiplier = 0.28;
    } else if (statName === 'crit') {
        const lvlCrit = parseInt(document.getElementById('lvlCrit').value) || 0;
        const lvlDev = parseInt(document.getElementById('lvlDevastation').value) || 0;
        const critMult = 1.5 + (lvlDev * 0.15);
        const currentCritFactor = 1 + (Math.min((5 + lvlCrit) / 100, 1) * (critMult - 1));
        multiplier = (0.01 * (critMult - 1)) / currentCritFactor;
    } else if (statName === 'devastation') {
        const lvlCrit = parseInt(document.getElementById('lvlCrit').value) || 0;
        const lvlDev = parseInt(document.getElementById('lvlDevastation').value) || 0;
        const critChance = Math.min((5 + lvlCrit) / 100, 1);
        const currentCritFactor = 1 + (critChance * (0.5 + (lvlDev * 0.15)));
        multiplier = (critChance * 0.15) / currentCritFactor;
    } else if (statName === 'time') {
        const lvlTime = parseInt(document.getElementById('lvlTime').value) || 0;
        multiplier = 1 / (30 + Math.min(lvlTime, 30));
    } else if (statName === 'rage') {
        multiplier = 0.05;
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
        lvlRage: document.getElementById('lvlRage')
    };

    const rangeHitValueDisplay = document.getElementById('rangeHitValue');
    const rangeHitDescDisplay = document.getElementById('rangeHitDesc');
    const rangeCritHitValueDisplay = document.getElementById('rangeCritHitValue');
    const rangeCritHitDescDisplay = document.getElementById('rangeCritHitDesc');
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

        // Calculate costs for each stat
        const costDamage = GET_SCROLL_COST(lvlDmg, 5);
        const costTime = GET_SCROLL_COST(lvlTime, 8);
        const costCrit = GET_SCROLL_COST(lvlCrit, 8);
        const costPower = GET_SCROLL_COST(lvlPower, 12);
        const costDev = GET_SCROLL_COST(lvlDev, 12);
        const costRage = GET_SCROLL_COST(lvlRage, 12);

        // Constants & Base Stats
        const baseMaxDmg = 5 + lvlDmg;
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
        const avgBaseRoll = (1 + baseMaxDmg) / 2;
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

        // 5. Single Stat Efficiencies (Avg Damage gained per scroll spent)
        const effDmg = GET_DAMAGE_PER_LEVEL('damage', lvlDmg, globalDPS, totalTime);
        const effTime = GET_DAMAGE_PER_LEVEL('time', lvlTime, globalDPS, totalTime);
        const effCrit = GET_DAMAGE_PER_LEVEL('crit', lvlCrit, globalDPS, totalTime);
        const effPower = GET_DAMAGE_PER_LEVEL('power', lvlPower, globalDPS, totalTime);
        const effDev = GET_DAMAGE_PER_LEVEL('devastation', lvlDev, globalDPS, totalTime);
        const effRage = GET_DAMAGE_PER_LEVEL('rage', lvlRage, globalDPS, totalTime);

        //6. Calculate the real-time efficiency (dmg gained / cost of next upgrade)
        const scrollEffDmg = costDamage > 0 ? effDmg / costDamage : 0;
        const scrollEffTime = costTime > 0 ? effTime / costTime : 0;
        const scrollEffCrit = costCrit > 0 ? effCrit / costCrit : 0;
        const scrollEffPower = costPower > 0 ? effPower / costPower : 0;
        const scrollEffDev = costDev > 0 ? effDev / costDev : 0;
        const scrollEffRage = costRage > 0 ? effRage / costRage : 0;

        // UI Updates
        rangeHitValueDisplay.innerHTML = `1 - ${FORMAT_NUMBER(baseMaxDmg * powerMult, 0)} <div class="marked small red">(${FORMAT_NUMBER(baseMaxDmg * powerMult * critMult, 0)} Crit)</div>`;
        rangeHitDescDisplay.innerHTML = `with a <div class="marked">x${FORMAT_NUMBER(powerMult, 2)}</div> damage multiplier`;
        rangeAttemptDisplay.textContent = `${FORMAT_NUMBER(totalTime)} - ${FORMAT_NUMBER(totalMaxDamage, 0)}`;
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

        document.getElementById('boostCost').textContent = `Cost: ${FORMAT_NUMBER(costDamage, 0)} scrolls`;
        document.getElementById('timeCost').textContent = `Cost: ${FORMAT_NUMBER(costTime, 0)} scrolls`;
        document.getElementById('critCost').textContent = `Cost: ${FORMAT_NUMBER(costCrit, 0)} scrolls`;
        document.getElementById('powerCost').textContent = `Cost: ${FORMAT_NUMBER(costPower, 0)} scrolls`;
        document.getElementById('devastationCost').textContent = `Cost: ${FORMAT_NUMBER(costDev, 0)} scrolls`;
        document.getElementById('rageCost').textContent = `Cost: ${FORMAT_NUMBER(costRage, 0)} scrolls`;

        document.getElementById('boostAvgDmgPerLevel').innerHTML = `dmg/level ${FORMAT_NUMBER(effDmg, 1)}`;
        document.getElementById('timeAvgDmgPerLevel').innerHTML = `dmg/level ${FORMAT_NUMBER(effTime, 1)}`;
        document.getElementById('critAvgDmgPerLevel').innerHTML = `dmg/level ${FORMAT_NUMBER(effCrit, 1)}`;
        document.getElementById('powerAvgDmgPerLevel').innerHTML = `dmg/level ${FORMAT_NUMBER(effPower, 1)}`;
        document.getElementById('devastationAvgDmgPerLevel').innerHTML = `dmg/level ${FORMAT_NUMBER(effDev, 1)}`;
        document.getElementById('rageAvgDmgPerLevel').innerHTML = `dmg/level ${FORMAT_NUMBER(effRage, 1)}`;

        document.getElementById('boostDmgPerScroll').innerHTML = `dmg/scroll ${FORMAT_NUMBER(scrollEffDmg, 1)}`;
        document.getElementById('timeDmgPerScroll').innerHTML = `dmg/scroll ${FORMAT_NUMBER(scrollEffTime, 1)}`;
        document.getElementById('critDmgPerScroll').innerHTML = `dmg/scroll ${FORMAT_NUMBER(scrollEffCrit, 1)}`;
        document.getElementById('powerDmgPerScroll').innerHTML = `dmg/scroll ${FORMAT_NUMBER(scrollEffPower, 1)}`;
        document.getElementById('devastationDmgPerScroll').innerHTML = `dmg/scroll ${FORMAT_NUMBER(scrollEffDev, 1)}`;
        document.getElementById('rageDmgPerScroll').innerHTML = `dmg/scroll ${FORMAT_NUMBER(scrollEffRage, 1)}`;;

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

async function cleanDataInBrowser() {
    const response = await fetch('./assets/js/data.json');
    const rawData = await response.json();

    // Safely removes keys from objects regardless of how deep they are nested
    function recursiveClean(obj) {
        if (typeof obj !== 'object' || obj === null) return;

        if (Array.isArray(obj)) {
            obj.forEach(item => recursiveClean(item));
        } else {
            delete obj.image;
            delete obj.reward_label;
            delete obj.seed_drops;

            for (const key in obj) {
                recursiveClean(obj[key]);
            }
        }
    }

    recursiveClean(rawData);

    const blob = new Blob([JSON.stringify(rawData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'data.json';
    a.click();
}

cleanDataInBrowser();