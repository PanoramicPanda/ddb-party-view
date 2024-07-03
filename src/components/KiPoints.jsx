import React from 'react';
import { Box, Typography } from '@mui/material';

const kiPointsStatusCalc = (currentKi, maxKi) => {
    const kiPercentage = Math.floor((currentKi / maxKi) * 100);
    if (kiPercentage > 90) {
        return { status: 'Overflowing', percentage: 100 };
    } else if (kiPercentage > 70) {
        return { status: 'Abundant', percentage: 90 };
    } else if (kiPercentage > 30) {
        return { status: 'Moderate', percentage: 70 };
    } else if (kiPercentage > 10) {
        return { status: 'Low', percentage: 30 };
    } else {
        return { status: 'Depleted', percentage: 10 };
    }
};

const kiStatusColor = (status) => {
    switch (status) {
        case 'Overflowing':
            return '#00BFFF';
        case 'Abundant':
            return '#1E90FF';
        case 'Moderate':
            return '#7B68EE';
        case 'Low':
            return '#9370DB';
        case 'Depleted':
            return '#B0C4DE';
        default:
            return '#696969';
    }
};

const KiPoints = ({ kiPointsUsed, isDMMode }) => {
    const { status: kiStatus, percentage: kiBarPercentage } = kiPointsStatusCalc(kiPointsUsed[1] - kiPointsUsed[0], kiPointsUsed[1]);

    return (
        <Box mt={2}>
            <Typography align="center" variant="body2"><b>Ki Points:</b> {kiStatus}</Typography>
            <Box className="ki-bar-container">
                <Box
                    className="ki-bar"
                    sx={{
                        width: `${kiBarPercentage}%`,
                        backgroundColor: kiStatusColor(kiStatus),
                        height: '100%', // Ensure height is set here
                        borderRadius: '7.5px', // Half of the container height for rounded ends
                        backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.2) 0, rgba(0,0,0,0.2) 10px, transparent 10px, transparent 20px)'
                    }}
                />
            </Box>
        </Box>
    );
};

export default KiPoints;
