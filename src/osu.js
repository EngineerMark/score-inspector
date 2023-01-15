import axios from "axios";
import config from "./config.json";
import { getAltAPIURL, getAPIURL, getUnix, mods } from "./helper";

export async function getRegisteredUsers() {
    let _users = [];
    try {
        const url = `${getAltAPIURL()}users/registered`;
        const res = await axios.get(url, { headers: { "Access-Control-Allow-Origin": "*" } });
        _users = res.data;
    } catch (err) {
        _users = [];
    }
    return _users;
}

export async function getUserScores(id, allowLoved) {
    let _scores = null;
    try {
        const url = `${getAltAPIURL()}scores/${id}${allowLoved ? "?loved=true" : ""}`;
        const res = await axios.get(url, { headers: { "Access-Control-Allow-Origin": "*" } });
        _scores = res.data;
    } catch (err) {
        return null;
    }
    return _scores;
}

export async function getBeatmapPackMaps(pack, sets_only = false) {
    let maps = null;
    try {
        const res = await axios.get(`${getAPIURL()}beatmaps/${sets_only ? 'allsets' : 'all'}?pack=${pack}`);
        maps = res.data;
        if (maps.error !== undefined) {
            throw Error('Unable to get beatmap pack data right now');
        }
    } catch (err) {
        return null;
    }

    return maps;
}

export async function getBeatmapStats(){
    let data = null;
    try {
        const res = await axios.get(`${getAPIURL()}beatmaps/stats?include_loved=true`);
        data = res.data;
    } catch (err) {
        return null;
    }
    return data;
}

export async function getUser(id) {
    let _user = null;
    try {
        const res = await axios.get(`${getAPIURL()}users/${id}`, { headers: { "Access-Control-Allow-Origin": "*" } });
        _user = res.data;
        if (_user.error !== undefined) {
            throw Error('Unable to get user at this time');
        }
    } catch (err) {
        return null;
    }

    try {
        let _scoreRank = await fetch(`${config.SCORE_API}${_user.id}`).then((res) => res.json());
        if (_scoreRank !== undefined) {
            _user.scoreRank = _scoreRank[0].rank;
        }
    } catch (err) {
        _user.scoreRank = null;
    }

    try {
        let _dailyUser = await axios.get(`${getAPIURL()}daily/${_user.id}`, { headers: { "Access-Control-Allow-Origin": "*" } });
        if(_dailyUser !== undefined && _dailyUser.data.error===undefined) {
            _user.daily = _dailyUser.data;
        }else{
            _user.daily = null;
            console.log(_dailyUser.data);
        }
    }catch (err) {
        _user.daily = null;
    }

    return _user;
}

export async function getBeatmap(beatmap_id) {
    let beatmap;
    try {
        beatmap = await axios.get(`${getAPIURL()}beatmaps/${beatmap_id}`, { headers: { "Access-Control-Allow-Origin": "*" } });
    } catch (err) {
        return null;
    }
    if (beatmap === undefined || beatmap.length === 0) {
        throw Error('Beatmap not found');
    }
    return beatmap[0];
}

export async function getBeatmapMaxscore(beatmap_id) {
    let beatmap;
    try {
        const url = `${getAPIURL()}beatmaps/${beatmap_id}/maxscore`;
        beatmap = await axios.get(url, { headers: { "Access-Control-Allow-Origin": "*" } });
    } catch (err) {
        return null;
    }
    if (beatmap === undefined || beatmap.data === undefined || beatmap.data.length === 0) {
        throw Error('Beatmap not found');
    }
    return beatmap.data;
}

export async function getBeatmapPacks(include_loved = false) {
    let packs;
    try {
        packs = await axios.get(`${getAPIURL()}beatmaps/packs?include_loved=${include_loved ? 'true' : 'false'}`, { headers: { "Access-Control-Allow-Origin": "*" } });
    } catch (err) {
        return null;
    }
    if (packs === undefined || packs.data === undefined || packs.data.length === 0) {
        throw Error('Beatmap packs not found');
    }
    return packs.data;
}

const MAX_SCORE = 1000000;
export function getLazerScore(score, classic = true) {
    const mul = getModMultiplier(score.enabled_mods);
    let val = ((((
        (50 * score.count50 + 100 * score.count100 + 300 * score.count300) / (300 * score.count50 + 300 * score.count100 + 300 * score.count300 + 300 * score.countmiss)) *
        300000) + ((score.combo / score.maxcombo) * 700000)) * mul);

    if (classic) {
        val = Math.pow(((val / MAX_SCORE) * score.objects), 2) * 36;
    }
    return val;
}

export function getModMultiplier(enabled_mods) {
    let multiplier = 1.0;
    if (enabled_mods & mods.HD) {
        multiplier *= 1.06;
    }
    if (enabled_mods & mods.FL) {
        multiplier *= 1.12;
    }
    if (enabled_mods & mods.EZ) {
        multiplier *= 0.50;
    }
    if (enabled_mods & mods.NF) {
        multiplier *= 0.90;
    }
    if (enabled_mods & mods.HT) {
        multiplier *= 0.30;
    }
    if (enabled_mods & mods.HR) {
        multiplier *= 1.12;
    }
    if (enabled_mods & mods.DT || enabled_mods & mods.NC) {
        multiplier *= 1.06;
    }
    return multiplier;
}

const ACTIVITY_THRESHOLD = 60 * 60 * 1.5; //this value dictates a new activity region
export function getSessions(scores) {
    scores.sort((a, b) => a.date_played_object - b.date_played_object);

    let activities = [];
    let currentActivity = {
        start: null,
        end: null,
        done: false
    }
    scores.forEach((score, index) => {
        if (currentActivity.start === null) {
            currentActivity.start = getUnix(score.date_played) - score.modded_length;
        }

        currentActivity.end = getUnix(score.date_played);

        if (index < scores.length - 1) {
            const diff = Math.abs(getUnix(score.date_played) - getUnix(scores[index + 1].date_played));

            if (diff >= ACTIVITY_THRESHOLD) {
                currentActivity.end = getUnix(score.date_played);
                currentActivity.done = true;
            }
        } else if (index === scores.length - 1) {
            currentActivity.end = getUnix(score.date_played);
            currentActivity.done = true;
        }

        if (currentActivity.done) {
            currentActivity.length = Math.ceil(Math.abs(currentActivity.end - currentActivity.start));
            activities.push(currentActivity);
            if (index < scores.length - 1) {
                currentActivity = {
                    start: getUnix(scores[index + 1].date_played) - score.modded_length,
                    end: null,
                    length: null,
                    done: false
                }
            }
        }
    });
    return activities;
}

export function getAverageAccuracy(scores) {
    if (scores===undefined || scores===null || !Array.isArray(scores) || scores.length === 0) {
        return 0;
    }
    let a = 0;
    let b = 0;
    scores.forEach(score => {
        a += (score.count300 + score.count100 * 0.3333 + score.count50 * 0.1667);
        b += (score.count300 + score.count100 + score.count50 + score.countmiss);
    });
    return a * Math.pow(b, -1) * 100;
}