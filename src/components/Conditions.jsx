import React from 'react';
import { Typography } from '@mui/material';

const Conditions = ({ conditions }) => (
    conditions.length > 0 && (
        <Typography variant="body2" align="center"><b>Conditions:</b> {conditions.join(', ')}</Typography>
    )
);

export default Conditions;
