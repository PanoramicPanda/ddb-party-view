import React from 'react';
import { Box, Typography } from '@mui/material';

const Senses = ({ darkvision, truesight, customSenses }) => (
    <Box mt={2}>
        <Typography variant="body2" align="left"><b>Senses:</b> Darkvision - {darkvision}ft. | Truesight: {truesight}ft.
            {customSenses.map(([source, distance], index) => (
                <span key={index}> | {source} - {distance}ft.</span>
            ))}
        </Typography>
    </Box>
);

export default Senses;
