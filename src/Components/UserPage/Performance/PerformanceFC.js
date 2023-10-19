import { Button, Grid, Typography } from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import { toFixedNumber } from "../../../Helpers/Misc";
import { getGrade } from "../../../Helpers/Osu";
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import TopplaysModal from "../../Modals/TopplaysModal";
import GlowBar from "../../UI/GlowBar";
var _ = require('lodash');

function PerformanceFC(props) {
    const [modalData, setModalData] = useState({ active: false });
    const [ppDiff, setPPDiff] = useState(0);

    const openModal = async () => {
        let scores = props.data.scores;
        scores.sort((a, b) => {
            if (a.recalc['fc'].total > b.recalc['fc'].total) { return -1; }
            if (a.recalc['fc'].total < b.recalc['fc'].total) { return 1; }
            return 0;
        });
        
        var _scores = _.cloneDeep(props.data.scores.slice(0, 2000));
        _scores.forEach(score => {
            score.pp = score.recalc['fc'].total;
            score.accuracy = score.recalc['fc'].accuracy * 100;
            score.count300 = score.recalc['fc'].count300;
            score.count100 = score.recalc['fc'].count100;
            score.count50 = score.recalc['fc'].count50;
            score.countmiss = score.recalc['fc'].countmiss;
            score.combo = score.beatmap.maxcombo;
            score.weight = score.recalc['fc'].weight;
            score.rank = getGrade(score);
            score.score = -1;
            score.displayed_pp = structuredClone(score.recalc['fc']);
        })
        setModalData({
            scores: _scores,
            active: true,
            pp_version: 'fc'
        })
    }

    useEffect(() => {
        setPPDiff(props.data.data.performance.weighted['fc'] - props.data.osu.statistics.pp);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Grid container sx={{ justifyContent: 'space-between' }}>
                <Grid item>
                    <Grid sx={{position:'relative'}}>
                        <GlowBar />
                        <Typography component="div" color="textPrimary" variant="body1">
                            {toFixedNumber(props.data.data.performance.weighted['fc'], 0).toLocaleString('en-US')}pp <Typography sx={{ fontSize: '0.7rem' }} color={'' + (ppDiff >= 0 ? '#11cb5f' : 'error')} variant='subtitle2' display="inline">{(ppDiff >= 0 ? '+' : '')}{ppDiff.toFixed(1)}pp</Typography>
                        </Typography>
                    </Grid>
                    <Typography color="textSecondary">all FC</Typography>
                    <Button size='small' startIcon={<AutoGraphIcon />} onClick={openModal} variant='contained' sx={{ mt: 2 }}>Top plays</Button>
                </Grid>
            </Grid>
            <TopplaysModal data={modalData} />
        </>
    );
}
export default PerformanceFC;