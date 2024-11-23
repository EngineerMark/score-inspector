import { Box, Grid2, Tooltip, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { getGradeIcon, getModIcon } from "../Helpers/Assets.js";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { grey, orange, red } from "@mui/material/colors";
import { getModString, mod_strings_long, mods } from "../Helpers/Osu.js";
import { toFixedNumber } from "../Helpers/Misc.js";
import Mods from "../Helpers/Mods.js";
import WarningIcon from '@mui/icons-material/Warning';

function ScoreRow(props) {
    const theme = useTheme();
    const [score, setScore] = useState(null);
    const [beatmap, setBeatmap] = useState(null);

    useEffect(() => {
        setScore(props.data.score);
        setBeatmap(props.data.score.beatmap);
        console.log(props.data.score);
    }, [props.data]);


    return (
        <>
            {
                score !== null ?
                    <>
                        <Box
                            sx={{
                                margin: 0,
                                width: '100%',
                                height: '2.5rem',
                                bgcolor: theme.palette.background.default,
                                borderRadius: theme.shape.borderRadius,
                            }} >
                            <Grid2 container>
                                <Grid2 size={0.3}>
                                    <Box sx={{
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <img src={getGradeIcon(score.rank)} alt={score.rank} />
                                    </Box>
                                    {/* {getGradeIcon(score.rank)} */}
                                </Grid2>

                                <Grid2 size={4}>
                                    <Box sx={{
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        textOverflow: 'ellipsis',
                                    }}>
                                        <Tooltip title={`${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.diffname}]`}>
                                            <Typography sx={{ fontSize: '0.8rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {score.beatmap.artist} - {score.beatmap.title}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.7rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                <span style={{ color: '#ea0' }}>{score.beatmap.diffname}</span> <span style={{ opacity: '0.7' }}>{score.date_played_moment.fromNow()}</span>
                                            </Typography>
                                        </Tooltip>
                                    </Box>
                                </Grid2>

                                <Grid2 size={0.3}>
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                                        <Typography sx={{ fontSize: '0.8rem', maxWidth: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                            {score.top_score?.pos ? `#${score.top_score?.pos.toLocaleString('en-US')}` : ''}
                                        </Typography>
                                    </Box>
                                </Grid2>

                                <Grid2 size={1}>
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '0.9rem', maxWidth: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                                {score.score.toLocaleString('en-US')}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.75rem', maxWidth: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                                {score.scoreLazerStandardised.toLocaleString('en-US')} (lazer)
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid2>

                                <Grid2 size={0.8}>
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                                        <Typography sx={{ fontSize: '0.8rem', maxWidth: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                            {score.combo}/{beatmap.maxcombo}x
                                        </Typography>
                                    </Box>
                                </Grid2>

                                <Grid2 size={0.3}>
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '0.8rem', maxWidth: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                                AR: {toFixedNumber(beatmap.difficulty_data.approach_rate ?? -1, 1)}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.8rem', maxWidth: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                                CS: {toFixedNumber(beatmap.difficulty_data.circle_size ?? -1, 1)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid2>

                                <Grid2 size={0.3}>
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '0.8rem', maxWidth: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                                OD: {toFixedNumber(beatmap.difficulty_data.overall_difficulty ?? -1, 1)}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.8rem', maxWidth: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                                HP: {toFixedNumber(beatmap.difficulty_data.drain_rate ?? -1, 1)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid2>

                                <Grid2 size={0.2}>
                                    {
                                        score.beatmap.approved === 4 ?
                                            <>
                                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
                                                    <Tooltip title="Loved">
                                                        <FavoriteIcon sx={{ color: red[500] }} />
                                                    </Tooltip>
                                                </Box>
                                            </> : <></>
                                    }
                                </Grid2>

                                <Grid2 size={0.4}>
                                    <Box sx={{ height: '100%', alignContent: 'right', display: 'flex', alignItems: 'center', justifyContent: 'right', pr: 0.3 }}>
                                        {
                                            score.beatmap.difficulty_data.star_rating && (Math.round(score.beatmap.difficulty_data.star_rating * 100) / 100) !== (Math.round(score.beatmap.stars * 100) / 100) ?
                                                <>
                                                    <Typography variant="subtitle2" sx={{ opacity: 0.4 }}>
                                                        {score.beatmap.stars.toFixed(2)}*
                                                    </Typography>
                                                </> : <></>
                                        }
                                    </Box>
                                </Grid2>
                                <Grid2 size={0.1}>
                                    <Box sx={{ height: '100%', alignContent: 'right', display: 'flex', alignItems: 'center' }}>
                                        {
                                            score.beatmap.difficulty_data.star_rating && (Math.round(score.beatmap.difficulty_data.star_rating * 100) / 100) !== (Math.round(score.beatmap.stars * 100) / 100) ?
                                                <>
                                                    <Typography variant="subtitle2" sx={{ opacity: 0.4 }}>{"-> "}</Typography>
                                                </> : <></>
                                        }
                                    </Box>
                                </Grid2>
                                <Grid2 size={0.4}>
                                    <Box sx={{ height: '100%', alignContent: 'right', display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                                        <Tooltip title={
                                            `Aim: ${score.beatmap.difficulty_data.aim_difficulty.toFixed(2)}, Speed: ${score.beatmap.difficulty_data.speed_difficulty.toFixed(2)}, Flashlight: ${(score.beatmap.difficulty_data.flashlight_rating ?? 0).toFixed(2)}*`
                                        }>
                                            <Typography sx={{ ml: 0.4 }} variant="subtitle2"> {(score.beatmap.difficulty_data.star_rating ?? 0).toFixed(2)}*</Typography>
                                        </Tooltip>
                                    </Box>
                                </Grid2>

                                <Grid2 size={1.7}>
                                    <Box sx={{ height: '100%', alignContent: 'right', display: 'flex', alignItems: 'center' }}>
                                        {
                                            Mods.getModElements(score.mods)
                                        }
                                    </Box>
                                </Grid2>

                                <Grid2 size={0.6}>
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="subtitle2">{score.accuracy.toFixed(2)}%</Typography>
                                    </Box>
                                </Grid2>

                                <Grid2 size={0.6}>
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'left', pr: 1, color: grey[500] }}>
                                        {
                                            !score.is_fc && score.recalc['fc'] ?
                                                <Typography variant="caption">If FC:<br/>{Math.round(score.recalc['fc']?.total).toLocaleString('en-US')}pp</Typography>
                                                : <></>
                                        }
                                    </Box>
                                </Grid2>

                                <Grid2 size={1}>
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                                        {
                                            score.beatmap.difficulty_data.is_legacy ?
                                                <Tooltip title="This score uses old star ratings and may cause incorrect mod and/or pp values">
                                                    <WarningIcon sx={{ color: orange[500] }} />
                                                </Tooltip>
                                                : <></>
                                        }
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: props.data.hide_diff ? 'center' : 'right',
                                                bgcolor: theme.palette.background.paper,
                                                borderTopRightRadius: theme.shape.borderRadius,
                                                borderBottomRightRadius: theme.shape.borderRadius,
                                                position: 'relative',
                                                pr: 1,
                                                '&:before': {
                                                    bgcolor: theme.palette.background.default,
                                                    clipPath: 'polygon(0 0,100% 50%,0 100%)',
                                                    WebkitClipPath: 'polygon(0 0,100% 50%,0 100%)',
                                                    content: '""',
                                                    height: '100%',
                                                    width: '10px',
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0
                                                }
                                            }}>
                                            <Typography variant="subtitle1">
                                                {toFixedNumber(score.pp > 0 ? score.pp : score.estimated_pp, 2).toLocaleString('en-US')}pp
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid2>
                            </Grid2>
                        </Box>
                    </>
                    : <></>
            }
        </>
    )
}

export default ScoreRow;