import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import hpStatusCalc from "../scripts/hpStatusCalc.js";

export function SelectedCreatureCard({ isDMMode, creatureName, currHp, maxHp }) {
    if (!isDMMode) {
        return null;
    }

    const { status: hpStatus, percentage: hpBarPercentage } = hpStatusCalc(currHp, maxHp);

    return (
        <Box p={2} component={Paper} sx={{
            width: '100%', // Adjust width as needed
            borderRadius: '15px',
            marginBottom: '15px'
        }}>
            <Typography align="center"  variant="h5" noWrap>{creatureName}</Typography>
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
                        {currHp} / {maxHp}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

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

export default SelectedCreatureCard;
