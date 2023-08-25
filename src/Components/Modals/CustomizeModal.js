import { Box, Button, Card, CardContent, Checkbox, Container, FormControlLabel, Grid, Modal, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useImperativeHandle } from "react";
import { forwardRef } from "react";
import { useState } from "react";
import { GetUser as GetInspectorUser, UpdateProfile } from "../../Helpers/Account";
import { showNotification, validateImage } from "../../Helpers/Misc";
import { set } from "lodash";

const style = {
    position: 'absolute',
    top: '50%',
    width: '100%',
    transform: 'translate(0, -50%)',
};

function CustomizeModal(props, ref) {
    const [open, setOpen] = useState(false);
    const [isWorking, setIsWorking] = useState(false);
    const [optionBackgroundUrl, setOptionBackgroundUrl] = useState('');
    const [optionPublicFriends, setOptionPublicFriends] = useState(false);

    useImperativeHandle(ref, () => ({
        setOpen(value) {
            setOpen(value);
        }
    }));

    useEffect(() => {
        if (isWorking || !open) {
            return;
        }

        (async () => {
            setIsWorking(true);
            const user = await GetInspectorUser(props.account.user_id);
            setIsWorking(false);
            if (user === null) {
                showNotification('Error', 'Failed to get user data', 'error');
                setOpen(false);
            }
            setOptionBackgroundUrl(user.background_image);
            setOptionPublicFriends(user.is_friends_public);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const save = () => {
        // setOpen(false);
        if (isWorking) {
            return;
        }
        setIsWorking(false);
        (async () => {
            const validBackground = validateImage(optionBackgroundUrl);
            if (!validBackground) {
                showNotification('Error', 'Invalid background image', 'error');
                return;
            }

            const res = await UpdateProfile({
                background_image: optionBackgroundUrl,
                is_friends_public: optionPublicFriends
            });

            if (res !== null && res.status === 200) {
                showNotification('Success', 'Profile updated', 'success');
                setOpen(false);
            } else {
                showNotification('Error', 'Failed to update profile', 'error');
            }
            setIsWorking(false);
        })();
    }

    return (
        <>
            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={style}>
                    <Container>
                        <Card sx={{ borderRadius: '10px' }}>
                            <CardContent>
                                <Typography variant='h4'>Edit profile</Typography>
                                <Stack spacing={2} direction='column' sx={{ pt: 1 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={3} sx={{height: '200px'}}>
                                            <Box sx={{
                                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                height: '100%',
                                                //align center
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '10px'
                                            }}>
                                                {
                                                    optionBackgroundUrl !== '' && <>
                                                        <img
                                                            src={optionBackgroundUrl}
                                                            alt="Background"
                                                            style={{
                                                                maxWidth: '100%',
                                                                maxHeight: '100%',
                                                                borderRadius: '10px'
                                                            }} />
                                                    </>
                                                }
                                            </Box>
                                        </Grid>
                                        <Grid item xs={9}>
                                            <Stack spacing={2} direction='column' sx={{ pt: 1 }}>
                                                <TextField
                                                    disabled={isWorking}
                                                    onChange={(e) => setOptionBackgroundUrl(e.target.value)}
                                                    value={optionBackgroundUrl}
                                                    label="Background Image (URL)"
                                                    variant="standard" />
                                                <Typography variant='caption'>Feel free to use suggestive content, just don't go over the top with full on naked anime girls.</Typography>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                    <Grid>
                                        <Container>
                                            <FormControlLabel control={
                                                <Checkbox
                                                    disabled={isWorking}
                                                    checked={optionPublicFriends}
                                                    onChange={(e) => setOptionPublicFriends(e.target.checked)}
                                                />
                                            } label='Show friends on profile' />
                                        </Container>
                                    </Grid>
                                    <Button onClick={save}>Save</Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Container>
                </Box>
            </Modal>
        </>
    )
}

export default forwardRef(CustomizeModal);