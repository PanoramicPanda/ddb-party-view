import React, { useEffect, useState } from "react";
import StatGrabber from "../scripts/grabber.js";
import hpStatusCalc from "../scripts/hpStatusCalc.js";
import {
    Badge,
    Box,
    Button,
    IconButton,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Paper,
    Grid
} from "@mui/material";
import { LightMode, ShieldTwoTone, Refresh } from "@mui/icons-material";
import "../css/characterCard.css";

export function CharacterCard({ characterId, refreshKey, isDMMode }) {
    const [character, setCharacter] = useState();
    const [refreshCharacter, setRefreshCharacter] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (characterId) {
                let characterStats = new StatGrabber(characterId);
                try {
                    const characterData = await characterStats.getCharacter();
                    const jsonData = await characterData.json();
                    characterStats.setCharacter(jsonData);
                    setCharacter(characterStats);
                } catch (error) {
                    console.error("Failed to fetch character data:", error);
                }
            }
        };

        fetchData();
    }, [characterId, refreshKey, refreshCharacter]);

    const handleRefresh = () => {
        setRefreshCharacter((prev) => prev + 1);
    };

    const canCastSpells = character && character.canCastSpells();
    const spellSlots = [];
    const spellSlotCircles = [];

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

    if (canCastSpells) {
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
                                    <circle cx="15" cy="15" r="14" />
                                </clipPath>
                                <linearGradient id={`shine-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.8 }} />
                                    <stop offset="50%" style={{ stopColor: 'white', stopOpacity: 0 }} />
                                </linearGradient>
                            </defs>
                            <circle cx="15" cy="15" r="14" stroke="dimgrey" strokeWidth="2" fill="darkslategray" />
                            <rect width="30" height="30" fill={color} clipPath={`url(#clip-path-${i})`} y={height} />
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

    const totalHitDie = character && character.calcHitDieUsedAndMax();
    const hitDiePercentage = totalHitDie ? Math.floor((totalHitDie[0] / totalHitDie[1]) * 100) : 0;

    const getHitDieColor = (percentage) => {
        if (percentage === 100) return 'grey';
        if (percentage > 50) return 'tomato';
        if (percentage > 0) return 'yellowgreen';
        return 'seagreen';
    };

    const getHitDieHeight = (percentage) => {
        if (percentage === 100) return '100%';
        if (percentage > 50) return '50%';
        if (percentage > 0) return '25%';
        return '0%';
    };

    const hitDieColor = getHitDieColor(hitDiePercentage);
    const hitDieHeight = getHitDieHeight(hitDiePercentage);

    let kiPoints = '';
    const isMonk = character && character.isClass('Monk');
    if (isMonk) {
        const kiPointsUsed = character.getKiPointsUsedAndMax();
        const { status: kiStatus, percentage: kiBarPercentage } = kiPointsStatusCalc(kiPointsUsed[1] - kiPointsUsed[0], kiPointsUsed[1]);

        kiPoints = (
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
                            {kiPointsUsed[1] - kiPointsUsed[0]}
                        </Typography>
                    )}
                </Box>
            </Box>
        );
    }

    const conditions = character && character.getConditions();
    let conditionList = '';
    if (conditions) {
        for (let i = 0; i < conditions.length; i++) {
            conditionList += conditions[i] + '';
            if (i < conditions.length - 1) {
                conditionList += ', ';
            }
        }
    }

    const currentHp = character ? character.getCurrentHP() : 0;
    const maxHp = character ? character.getMaxHP() : 0;
    const { status: hpStatus, percentage: hpBarPercentage } = hpStatusCalc(currentHp, maxHp);

    return (
        <Box p={2} component={Paper} sx={{
            width: '100%',
            borderRadius: '15px',
            marginBottom: '15px',
            position: 'relative'
        }}>
            <IconButton
                onClick={handleRefresh}
                variant="outlined"
                color="secondary"
                sx={{ position: 'absolute', top: '0px', left: '0px' }}
            >
                <Refresh />
            </IconButton>
            {character && (
                <>
                    <Grid container justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                        <Grid item>
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item>
                                    <Badge
                                        badgeContent={character.getInspiration() ? <LightMode /> : null}
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        sx={{ color: 'orange' }}
                                    >
                                        <Avatar src={character.character['avatarUrl']} alt={character.character['name']} sx={{ height: 65, width: 65, border: '3.5px solid dimgrey' }} />
                                    </Badge>
                                </Grid>
                                <Grid item>
                                    <Typography variant="h5" noWrap>{character.character['name']}</Typography>
                                    <Typography variant="body1" align="left"><b>Level:</b> {character.getTotalLevel()}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item>
                            <Box display="flex" flexDirection="row" alignItems="center">
                                <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
                                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ShieldTwoTone sx={{ color: 'slategray', fontSize: 45 }} />
                                        <Typography variant="body1" align="center" sx={{ position: 'absolute' }}>
                                            <b>{character.calcAC()}</b>
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" flexDirection="column" alignItems="center">
                                    <Typography variant="body1" align="center"><b>Hit Die</b></Typography>
                                    <Box className="hit-die-icon" sx={{ margin: '0 auto', width: '45px', height: '45px' }}>
                                        <svg width="50" height="50" viewBox="0 0 24 24">
                                            <defs>
                                                <clipPath id="clip-path">
                                                    <polygon points="12,2 19,9 12,16 5,9 12,2"/>
                                                </clipPath>
                                            </defs>
                                            <rect width="24" height="24" fill="darkslategray" clipPath="url(#clip-path)"/>
                                            <rect width="24" height="24" fill={hitDieColor} clipPath="url(#clip-path)" y={hitDieHeight}/>
                                            <polygon points="12,2 19,9 12,16 5,9 12,2" stroke="dimgrey" fill="none"/>
                                            {isDMMode && (
                                                <text x="12" y="12" textAnchor="middle" fontSize="8" fill="white">
                                                    {totalHitDie[1] - totalHitDie[0]}
                                                </text>
                                            )}
                                        </svg>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    {isDMMode && (
                        <Box mt={2}>
                            <Typography variant="body2" align="left">
                                <b>Senses:</b> Darkvision: {character.getDarkvision()}ft. | Truesight: {character.getTruesight()}ft.
                                {character.getCustomSenses().map((sense, index) => (
                                    <span key={index}> | {sense[0]}: {sense[1]}ft.</span>
                                ))}
                            </Typography>
                        </Box>
                    )}



                    <Box mt={2}>
                        <Typography align="center" variant="body2"><b>Status:</b> {hpStatus}</Typography>
                        <Box className="hp-bar-container">
                            <Box
                                className="hp-bar"
                                sx={{
                                    width: `${hpBarPercentage}%`,
                                    backgroundColor: hpStatusColor(hpStatus),
                                    height: '100%', // Ensure height is set here
                                    borderRadius: '7.5px',
                                    backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.2) 0, rgba(0,0,0,0.2) 10px, transparent 10px, transparent 20px)'
                                }}
                            />
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

                    {conditions && conditions.length !== 0 && (
                        <Typography variant="body2" align="center"><b>Conditions:</b> {conditionList}</Typography>
                    )}

                    {canCastSpells && (
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
                    )}

                    {kiPoints}

                    {isDMMode && (
                        <Grid>
                            <Grid item>
                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center"><b>Passive Perception</b></TableCell>
                                                <TableCell align="center"><b>Passive Investigation</b></TableCell>
                                                <TableCell align="center"><b>Passive Insight</b></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="center">{character.getPassivePerception()}</TableCell>
                                                <TableCell align="center">{character.getPassiveInvestigation()}</TableCell>
                                                <TableCell align="center">{character.getPassiveInsight()}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    )}
                </>
            )}
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

const kiPointsStatusCalc = (currentKi, maxKi) => {
    const kiPercentage = Math.floor((currentKi / maxKi) * 100);
    if (kiPercentage > 90) {
        return { status: 'Overflowing', percentage: 100 };
    } else if (kiPercentage > 70) {
        return { status: 'Abundant', percentage: 90 };
    } else if (kiPercentage > 40) {
        return { status: 'Moderate', percentage: 70 };
    } else if (kiPercentage > 10) {
        return { status: 'Low', percentage: 40 };
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

export default CharacterCard;
