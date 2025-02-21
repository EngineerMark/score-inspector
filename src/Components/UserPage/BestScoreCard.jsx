import { Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import moment from "moment";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useState } from "react";
import ScoreModal from "../ScoreModal";
import Marquee from "react-fast-marquee";

function BestScoreCard(props) {
    const [modalData, setModalData] = useState({ active: false });

    // If the score is undefined, return an empty grey card with text "No score found"
    if(!props.score) return (
        <>
            <Card sx={{ height: '100%', borderRadius: '11px', backgroundPosition: 'center', backgroundSize: 'auto', backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <CardContent sx={{ height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '10px' }}>
                    <Stack spacing={1}>
                        <Typography variant='h6' sx={{ fontSize: '0.9em' }}>{props.valueTitle} play</Typography>
                        <Typography variant='title' sx={{ fontSize: '1em' }}>No score found</Typography>
                    </Stack>
                </CardContent>
            </Card>
        </>
    )

    return (
        <>
            <ScoreModal data={modalData} />
            <Card sx={{ height: '100%', borderRadius: '11px', backgroundPosition: 'center', backgroundSize: 'auto', backgroundImage: `url(https://assets.ppy.sh/beatmaps/${props.score.beatmap.set_id}/covers/cover@2x.jpg)` }}>
                <CardContent sx={{ height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '11px' }}>
                    <Stack spacing={1}>
                        <Typography variant='h6' sx={{ fontSize: '0.9em' }}>{props.valueTitle} play</Typography>
                        <Marquee speed={40} gradient={false}>
                            <Typography variant='title' sx={{ fontSize: '1em' }}>{props.score.beatmap.artist} - {props.score.beatmap.title} [{props.score.beatmap.diffname}]&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </Typography>
                        </Marquee>
                        <Typography variant='h5' sx={{ fontSize: '1.1em' }}>{props.valueLabel}</Typography>
                        <Typography sx={{ fontSize: '1em' }}>Played <Chip color="primary" label={moment(props.score.date_played).fromNow()} size="small"></Chip></Typography>
                        <Button startIcon={<VisibilityIcon />} onClick={() => { setModalData({ active: true, score: props.score }) }} variant='contained'>View score</Button>
                    </Stack>
                </CardContent>
            </Card>
        </>
    )
}

export default BestScoreCard;