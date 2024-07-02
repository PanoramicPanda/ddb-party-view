import React from 'react';
import { Box, Typography } from '@mui/material';

const hpStatusRanges = {
    'Healthy': { min: 91, max: 100 },
    'Lightly Wounded': { min: 71, max: 90 },
    'Moderately Wounded': { min: 31, max: 70 },
    'Severely Wounded': { min: 11, max: 30 },
    'Near Death': { min: 0, max: 10 }
};

const getStatusRangeHighlight = (status) => {
    const range = hpStatusRanges[status];
    if (!range) return null;
    const rangeMinWidth = `${range.min}%`;
    const rangeMaxWidth = `${range.max}%`;

    return (
        <Box
            className="hp-bar-highlight"
            sx={{
                position: 'absolute',
                left: rangeMinWidth,
                width: `calc(${rangeMaxWidth} - ${rangeMinWidth})`,
                height: '100%',
                borderRadius: '7.5px',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                animation: 'blink 2s infinite'
            }}
        />
    );
};

const HealthBar = ({ currentHp, maxHp, hpStatus, hpBarPercentage, isDMMode }) => (
    <Box mt={2}>
        <Typography align="center" variant="body2"><b>Status:</b> {hpStatus}</Typography>
        <Box className="hp-bar-container">
            <Box
                className="hp-bar"
                sx={{
                    width: `${hpBarPercentage}%`,
                    backgroundColor: hpStatusColor(hpStatus),
                    height: '100%',
                    borderRadius: '7.5px',
                    backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.2) 0, rgba(0,0,0,0.2) 10px, transparent 10px, transparent 20px)'
                }}
            />
            {getStatusRangeHighlight(hpStatus)}
            {isDMMode && (
                <Typography
                    variant="body2"
                    align="center"
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'white'
                    }}
                >
                    {currentHp} / {maxHp}
                </Typography>
            )}
        </Box>
    </Box>
);

const hpStatusColor = (status) => {
    switch (status) {
        case 'Healthy':
            return 'seagreen';
        case 'Lightly Wounded':
            return 'yellowgreen';
        case 'Moderately Wounded':
            return 'goldenrod';
        case 'Severely Wounded':
            return 'tomato';
        case 'Near Death':
            return 'firebrick';
        default:
            return 'darkgrey';
    }
};

export default HealthBar;
