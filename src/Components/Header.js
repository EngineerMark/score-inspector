import { AppBar, Box, Button, Container, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import UserSearch from './UserSearch';

function Header() {
    const searchElement = useRef(null);
    return (
        <>
            <UserSearch ref={searchElement} />
            <Box>
                <AppBar position="static">
                    <Container>
                        <Toolbar disableGutters>
                            <Typography variant='h6' noWrap component={Link} to={`/`} sx={{
                                mr: 2,
                                color: 'inherit',
                                textDecoration: 'none',
                            }}>osu! scores inspector</Typography>
                            <Box sx={{ flexGrow: 1 }}>
                                <Button onClick={() => searchElement.current.setOpen(true)} variant='contained'>Search</Button>
                            </Box>
                        </Toolbar>
                    </Container>
                </AppBar>
            </Box>
        </>
    );
}

export default Header;