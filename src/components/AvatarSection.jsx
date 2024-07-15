import React from 'react';
import { Badge, Avatar, Typography, Grid } from '@mui/material';
import { LightMode } from '@mui/icons-material';

const AvatarSection = ({ character }) => (
    <Grid container alignItems="center" spacing={2}>
        <Grid item>
            <Badge
                badgeContent={character.getInspiration() ? <LightMode /> : null}
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{ color: 'orange' }}
            >
                <Avatar src={character.character?.decorations['avatarUrl'] || ''} alt={character.character?.name || 'Unknown'} sx={{ height: 65, width: 65, border: '3.5px solid dimgrey' }} />
            </Badge>
        </Grid>
        <Grid item>
            <Typography variant="h5" noWrap>{character.character?.name || 'Unknown'}</Typography>
            <Typography variant="body1" align="left"><b>Level:</b> {character.getTotalLevel()}</Typography>
        </Grid>
    </Grid>
);

export default AvatarSection;
