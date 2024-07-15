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
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                animation: 'blink 2s infinite'
            }}
        />
    );
};

const renderCircles = (count, total, color) => {
    return Array.from({ length: total }, (_, i) => (
        <Box key={i} sx={{ width: 30, height: 30, marginRight: 1 }}>
            <svg width="30" height="30" viewBox="0 0 30 30">
                <defs>
                    <clipPath id={`clip-path-${i}`}>
                        <circle cx="15" cy="15" r="14" />
                    </clipPath>
                    <linearGradient id={`shine-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.8 }} />
                        <stop offset="50%" style={{ stopColor: 'white', stopOpacity: 0 }} />
                    </linearGradient>
                </defs>
                <circle cx="15" cy="15" r="14" stroke="dimgrey" strokeWidth="2" fill="darkslategray" />
                <rect width="30" height="30" fill={i < count ? color : 'darkslategray'} clipPath={`url(#clip-path-${i})`} y="0%" />
                <circle cx="15" cy="15" r="14" fill={`url(#shine-${i})`} clipPath={`url(#clip-path-${i})`} />
                <circle cx="15" cy="15" r="14" stroke="dimgrey" strokeWidth="2" fill="none" />
            </svg>
        </Box>
    ));
};

const renderSavesAndFails = (deathSaves, deathFails) => {
    return (
        <Box mt={1}>
            <Typography align="center" variant="body2"><b>Death Saves</b></Typography>
            <Box display="flex" justifyContent="center" mb={1}>
                <Box display="flex" flexDirection="row" alignItems="center" marginRight={'20px'}>
                    {renderCircles(deathSaves, 3, 'green')}
                </Box>
                <Box display="flex" flexDirection="row" alignItems="center">
                    {renderCircles(deathFails, 3, 'red')}
                </Box>
            </Box>
        </Box>
    );
};

const HealthBar = ({ currentHp, maxHp, hpStatus, hpBarPercentage, isDMMode, dying, deathSaves, deathFails }) => (
    <Box mt={2}>
        {isDMMode && dying ? (
            deathFails <= 2 ? (
                <Typography align="center" variant="body2"><b>Status:</b> Dying</Typography>
            ) : (
                <Typography align="center" variant="body2"><b>Status:</b> Dead</Typography>
            )
        ) : (
            <Typography align="center" variant="body2"><b>Status:</b> {hpStatus}</Typography>
        )}
        {isDMMode && dying && renderSavesAndFails(deathSaves, deathFails)}
        <Box className="hp-bar-container">
            <Box
                className="hp-bar"
                sx={{
                    width: isDMMode ? `${currentHp / maxHp * 100}%` : `${hpBarPercentage}%`,
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
