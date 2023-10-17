import { mods } from "../Osu";

export function getPerformance2019(data, debug = false) {
    const sr_model = '2019';
    const score = data.score;
    data.objects = score.beatmap.objects;
    data.circles = score.beatmap.circles;
    data.sliders = score.beatmap.sliders;
    data.spinners = score.beatmap.spinners;
    const count300 = data.count300 ?? score.count300;
    const count100 = data.count100 ?? score.count100;
    const count50 = data.count50 ?? score.count50;
    const countmiss = Math.min(data.countmiss ?? score.countmiss, data.objects);

    data.modded_sr = score.beatmap.modded_sr[sr_model] ?? score.beatmap.modded_sr;
    data.effectiveMissCount = getEffectiveMissCount(data);

    data.count300 = count300;
    data.count100 = count100;
    data.count50 = count50;
    data.countmiss = countmiss;

    const max300 = data.objects - countmiss;

    data.accuracy = getAccuracy(count300, count100, count50, data.countmiss, data.objects);

    data.count50 = 0;
    data.count100 = Math.round(-3.0 * ((data.accuracy - 1.0) * data.objects + data.countmiss) / 2.0);

    if (data.count100 > data.objects - data.countmiss) {
        data.count100 = 0;
        data.count50 = Math.round(-6.0 * ((data.accuracy - 1.0) * data.objects + data.countmiss) * 0.2);
        data.count50 = Math.min(max300, data.count50);
    } else {
        data.count100 = Math.min(max300, data.count100);
    }

    data.combo = data.combo ?? score.combo;
    data.totalhits = data.count300 + data.count100 + data.count50 + data.countmiss;
    data.count300 = data.objects - data.count100 - data.count50 - data.countmiss;

    data.count50 = 0;

    if (score.beatmap.modded_sr[sr_model]) {
        data.aim = getAimValue(data);
        data.speed = getSpeedValue(data);
        data.acc = getAccuracyValue(data);
        data.total = getTotalValue(data);
    } else {
        data.aim = 0;
        data.speed = 0;
        data.acc = 0;
        data.total = 0;
    }

    data.score = undefined;

    if (debug) {
        console.log(data);
    }

    const output = {
        aim: data.aim,
        speed: data.speed,
        acc: data.acc,
        total: data.total,
        version: '2019',
        model: sr_model,
        accuracy: data.accuracy,
        count300: data.count300,
        count100: data.count100,
        count50: data.count50,
        countmiss: data.countmiss,
    }

    return output;
}

function getTotalValue(data) {
    if (data.score.enabled_mods & mods.RX || data.score.enabled_mods & mods.AP) {
        return 0;
    }

    let mul = 1.12;

    if (data.score.enabled_mods & mods.NF) {
        mul *= 0.90;
    }

    if (data.score.enabled_mods & mods.SO) {
        mul *= 0.95;
    }

    const total = Math.pow(
        Math.pow(data.aim, 1.1) +
        Math.pow(data.speed, 1.1) +
        Math.pow(data.acc, 1.1),
        1.0 / 1.1
    ) * mul;

    return total;
}

function getAimValue(data) {
    let raw_aim = data.modded_sr.aim_diff;

    if (data.score.enabled_mods & mods.TD) {
        raw_aim = Math.pow(raw_aim, 0.8); // TD nerf
    }

    let aim = Math.pow(5.0 * Math.max(1.0, raw_aim / 0.0675) - 4.0, 3.0) / 100000.0; // aim difficulty

    // aim *= 1.0 + 0.1 * Math.min(data.totalhits / 1500, 1.0);
    let length_bonus = 0.95 + 0.4 * Math.min(data.totalhits / 2000, 1) +
        (data.totalhits > 2000 ? 1 : 0) * (0.5 * Math.log10(data.totalhits / 2000)); // length bonus
    aim *= length_bonus;

    // if (data.effectiveMissCount > 0) {
    //     aim *= 0.97 * Math.pow(1 - Math.pow(data.effectiveMissCount / data.totalhits, 0.775), data.effectiveMissCount);
    // }
    aim *= Math.pow(0.97, data.countmiss);

    let maxCombo = data.score.beatmap.maxcombo;
    if (maxCombo > 0) {
        aim *= Math.min(Math.pow(data.combo / data.score.beatmap.maxcombo, 0.8), 1.0);
        // aim *= Math.min(Math.pow(data.combo, 0.8) / Math.pow(maxCombo, 0.8), 1.0);
    }

    let approachRateFactor = 0.0;
    let ar = data.modded_sr.modded_ar;

    if (ar > 10.33) {
        approachRateFactor += 0.3 * (ar - 10.33);
    } else if (ar < 8.0) {
        approachRateFactor += 0.01 * (8.0 - ar);
    }

    aim *= 1.0 + Math.min(approachRateFactor, approachRateFactor * (data.totalhits / 1000.0));

    if ((data.score.enabled_mods & mods.HD) !== 0) {
        aim *= 1.0 + 0.04 * (12.0 - ar);
    }

    if ((data.score.enabled_mods & mods.FL) !== 0) {
        aim *= 1.0 +
            0.35 * Math.min(data.totalhits / 200, 1) +
            (data.totalhits > 200 ? 1 : 0) * ((0.3 * Math.min((data.totalhits - 200) / 300, 1)) +
            (data.totalhits > 500 ? 1 : 0) * ((data.totalhits - 500) / 1200));
    }

    aim *= 0.5 + data.accuracy * 0.5;

    aim *= 0.98 + (Math.pow(data.modded_sr.modded_od, 2) / 2500.0);

    return aim;
}

function getSpeedValue(data) {
    let speed = Math.pow(5.0 * Math.max(1.0, data.modded_sr.speed_diff / 0.0675) - 4.0, 3.0) / 100000.0;

    // speed *= 0.95 + 0.4 * Math.min(1.0, data.totalhits / 2000.0) + (data.totalhits > 2000 ? Math.log10(data.totalhits / 2000.0) * 0.5 : 0.0); //length bonus
    let length_bonus = 0.95 + 0.4 * Math.min(data.totalhits / 2000, 1) +
        (data.totalhits > 2000 ? 1 : 0) * (0.5 * Math.log10(data.totalhits / 2000));
    speed *= length_bonus;
    if(data.effectiveMissCount>0){
        speed *= 0.97 * Math.pow(1 - Math.pow(data.effectiveMissCount / data.totalhits, 0.775), Math.pow(data.effectiveMissCount, 0.875));
    }

    let maxCombo = data.score.beatmap.maxcombo;
    if (maxCombo > 0) {
        speed *= Math.min(Math.pow(data.combo, 0.8) / Math.pow(maxCombo, 0.8), 1.0);
    }

    let ar_factor = 0.0;
    if (data.modded_sr.modded_ar > 10.33) {
        ar_factor = 0.3 * (data.modded_sr.modded_ar - 10.33);
    }
    speed *= 1.0 + Math.min(ar_factor, ar_factor * (data.totalhits / 1000.0));

    if (data.score.enabled_mods & mods.HD) {
        speed *= 1.0 + 0.04 * (12.0 - data.modded_sr.modded_ar);
    }

    speed *= 0.2 + data.accuracy;
    speed *= 0.96 + (Math.pow(data.modded_sr.modded_od, 2) / 1600.0);

    return speed;
}

function getAccuracyValue(data) {
    let betterAccuracyPercentage = 0;

    let numHitObjectsWithAccuracy = data.score.beatmap.circles;

    if (numHitObjectsWithAccuracy > 0) {
        betterAccuracyPercentage = ((data.count300 - (data.totalhits - numHitObjectsWithAccuracy)) * 6 + data.count100 * 2 + data.count50) / (numHitObjectsWithAccuracy * 6);
    }else{
        betterAccuracyPercentage = 0;
    }

    if (betterAccuracyPercentage < 0) { betterAccuracyPercentage = 0; }

    let acc = Math.pow(1.52163, data.modded_sr.modded_od) * Math.pow(betterAccuracyPercentage, 24) * 2.83;

    acc *= Math.min(Math.pow((numHitObjectsWithAccuracy / 1000.0), 0.3), 1.15);

    if (data.score.enabled_mods & mods.HD) {
        acc *= 1.08;
    }

    if (data.score.enabled_mods & mods.FL) {
        acc *= 1.02;
    }

    return acc;
}

function getAccuracy(count300, count100, count50, countmiss, objects) {

    if (objects === 0) {
        return 0;
    }

    return Math.min(Math.max((count50 * 50 + count100 * 100 + count300 * 300) / (objects * 300), 0.0), 1.0);
}

function getEffectiveMissCount(data) {
    var comboBasedMissCount = 0.0;

    if (data.score.sliders > 0) {
        var fullComboThreshold = data.score.beatmap.maxcombo - 0.1 * data.score.beatmap.sliders;
        if (data.combo < fullComboThreshold) {
            comboBasedMissCount = fullComboThreshold / Math.max(1, data.score.beatmap.maxcombo);
        }
    }

    comboBasedMissCount = Math.min(comboBasedMissCount, data.count100 + data.count50 + data.countmiss);
    return Math.max(data.countmiss, comboBasedMissCount);
}