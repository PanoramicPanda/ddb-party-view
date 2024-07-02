import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

const getCircleHeight = (percentage) => {
    if (percentage === 100) return '0%';
    if (percentage > 50) return '45%';
    if (percentage > 0) return '65%';
    return '100%';
};

const getCircleColor = (percentage) => {
    if (percentage === 100) return 'green';
    if (percentage > 50) return 'goldenrod';
    if (percentage > 0) return 'firebrick';
    return 'firebrick';
};

const SpellSlots = ({ character, isDMMode }) => {
    const spellSlots = [];
    const spellSlotCircles = [];

    if (character.canCastSpells()) {
        for (let i = 1; i <= 9; i++) {
            const totalSpellSlots = character.getTotalSpellSlots(i);
            const usedAndMax = totalSpellSlots > 0 ? character.getSpellSlotsUsedAndMax(i) : [0, 0];
            const percentage = totalSpellSlots > 0 ? Math.floor(((totalSpellSlots - usedAndMax[0]) / totalSpellSlots) * 100) : 0;
            const color = getCircleColor(percentage);
            const height = getCircleHeight(percentage);

            spellSlotCircles.push(
                <TableCell key={i} align="center" sx={{ width: '50px' }}>
                    {totalSpellSlots > 0 && (
                        <svg width="30" height="30" viewBox="0 0 30 30">
                            <defs>
                                <clipPath id={`clip-path-${i}`}>
                                    <circle cx="15" cy="15" r="14"/>
                                </clipPath>
                                <linearGradient id={`shine-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{stopColor: 'white', stopOpacity: 0.8}}/>
                                    <stop offset="50%" style={{stopColor: 'white', stopOpacity: 0}}/>
                                </linearGradient>
                            </defs>
                            <circle cx="15" cy="15" r="14" stroke="dimgrey" strokeWidth="2" fill="darkslategray"/>
                            <rect width="30" height="30" fill={color} clipPath={`url(#clip-path-${i})`} y={height}/>
                            <circle cx="15" cy="15" r="14" fill={`url(#shine-${i})`} clipPath={`url(#clip-path-${i})`} />
                            <circle cx="15" cy="15" r="14" stroke="dimgrey" strokeWidth="2" fill="none" />
                            {isDMMode && (
                                <text x="15" y="20" textAnchor="middle" fontSize="10" fill="white">
                                    {totalSpellSlots - usedAndMax[0]}
                                </text>
                            )}
                        </svg>
                    )}
                </TableCell>
            );
        }
    }

    return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Typography variant="body2" align="center"><b>Spell Slots</b></Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        {Array.from({ length: 9 }, (_, i) => (
                            <TableCell key={i + 1} align="center" sx={{ width: '50px' }}>
                                {i + 1}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>{spellSlotCircles}</TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SpellSlots;
