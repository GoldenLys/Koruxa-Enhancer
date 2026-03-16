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
| Power           | ×1.00 (base)                    | x1.24 per level     | Unlimited  | Infinite       | 12              | Multiplies total damage output              |
| Devastation     | ×1.00 crit damage mult          | +0.15× per level    | 3.00×      | 20             | 12              | Increases critical hit damage               |
| Rage            | +0% bonus from consecutive hits | +5% per Rage level  | 75%        | 15             | 12              | Hitting same body repeatedly builds up Rage |
 
This table shows how each stat impacts your damage potential as you invest more points.
***/

function FORMAT_NUMBER(num, decimals = 0) {
    if (typeof num !== "number" || isNaN(num)) return "0";
    const fixed = num.toFixed(decimals);
    let [intPart, decPart] = fixed.split(".");
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return decPart ? `${intPart},${decPart}` : intPart;
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

        // Constants & Base Stats
        const baseMaxDmg = 5 + lvlDmg;
        const totalTime = 30 + Math.min(lvlTime, 30);
        const powerMult = Math.pow(1.24, lvlPower);
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
    }

    Object.values(inputs).forEach(input => { input.addEventListener('input', calculateResults); });
    calculateResults();
});
