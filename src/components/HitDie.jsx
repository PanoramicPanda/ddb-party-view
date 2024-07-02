import React from 'react';
import { Box, Typography } from '@mui/material';

const getHitDieColor = (percentage) => {
    if (percentage === 100) return 'grey';
    if (percentage > 50) return 'firebrick';
    if (percentage > 0) return 'goldenrod';
    return 'green';
};

const getHitDieHeight = (percentage) => {
    if (percentage === 100) return '100%';
    if (percentage > 50) return '50%';
    if (percentage > 0) return '25%';
    return '0%';
};

const HitDie = ({ totalHitDie, isDMMode }) => {
    const hitDiePercentage = totalHitDie ? Math.floor((totalHitDie[0] / totalHitDie[1]) * 100) : 0;
    const hitDieColor = getHitDieColor(hitDiePercentage);
    const hitDieHeight = getHitDieHeight(hitDiePercentage);

    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="body1" align="center"><b>Hit Die</b></Typography>
            <Box className="hit-die-icon" sx={{ margin: '0 auto', width: '45px', height: '45px' }}>
                <svg width="50" height="50" viewBox="0 0 24 24">
                    <defs>
                        <clipPath id="clip-path">
                            <polygon points="12,2 19,9 12,16 5,9 12,2"/>
                        </clipPath>
                        <linearGradient id="shine-hit-die" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor: 'white', stopOpacity: 0.8}}/>
                            <stop offset="50%" style={{stopColor: 'white', stopOpacity: 0}}/>
                        </linearGradient>
                    </defs>
                    <rect width="24" height="24" fill="darkslategray" clipPath="url(#clip-path)"/>
                    <rect width="24" height="24" fill={hitDieColor} clipPath="url(#clip-path)" y={hitDieHeight}/>
                    <polygon points="12,2 19,9 12,16 5,9 12,2" fill={`url(#shine-hit-die)`} clipPath="url(#clip-path)"/>
                    <polygon points="12,2 19,9 12,16 5,9 12,2" stroke="dimgrey" fill="none"/>
                    {isDMMode && (
                        <text x="12" y="12" textAnchor="middle" fontSize="8" fill="white">
                            {totalHitDie[1] - totalHitDie[0]}
                        </text>
                    )}
                </svg>
            </Box>
        </Box>
    );
};

export default HitDie;
