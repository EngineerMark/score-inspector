import { useEffect, useState } from "react";
import Loader from "./Loader";
import { Box, Chip, Tooltip, Typography, useTheme } from "@mui/material";

function WordCloud(props) {
    const [wordData, setWordData] = useState(null);
    const [maxFrequency, setMaxFrequency] = useState(0);
    const theme = useTheme();
    //mui word cloud

    useEffect(() => {
        if (props.data) {
            //shuffle based on word hash or something, but not random (so it's consistent)
            const shuffled = props.data.sort((a, b) => {
                //convert to base 64 hash
                const a_hash = btoa(a.word).split('').reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                }, 0);
                const b_hash = btoa(b.word).split('').reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                }, 0);
                return a_hash - b_hash;
            });
            setWordData(shuffled);
            setMaxFrequency(Math.max(...shuffled.map(w => w.frequency)));
        }
    }, [props.data]);

    if (!wordData || !maxFrequency) {
        return <Loader />
    }

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    justifyContent: 'center',
                    padding: '16px',
                    textAlign: 'center',
                }}
            >
                {wordData.map(({ word, frequency }, index) => {
                    // Scale font size based on frequency
                    const fontSize = (frequency / maxFrequency) * 1 + 0.8; // Base size + scale
                    const color = `${theme.palette.primary.main}${Math.round(100 + (frequency / maxFrequency) * 105).toString(16)}`;

                    return (
                        <Tooltip key={index} title={`Frequency: ${frequency}`}>
                            <Typography
                                key={index}
                                sx={{
                                    fontSize: `${fontSize}rem`,
                                    fontWeight: 500,
                                    color: color,
                                }}
                            >
                                {word}
                            </Typography>
                        </Tooltip>
                    );
                })}
            </Box>
        </>
    )
}

export default WordCloud;