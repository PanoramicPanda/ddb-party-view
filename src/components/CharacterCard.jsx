import React, { useEffect, useState } from "react";
import StatGrabber from "../scripts/grabber.js";
import { Box, Paper, Grid, IconButton, Badge, Avatar, Typography } from "@mui/material";
import Refresh from "@mui/icons-material/Refresh";
import HealthBar from './HealthBar';
import HitDie from './HitDie';
import SpellSlots from './SpellSlots';
import Conditions from './Conditions';
import Senses from './Senses';
import KiPoints from './KiPoints';
import Passives from "./Passives.jsx";
import { LightMode, ShieldTwoTone } from "@mui/icons-material";
import "../css/characterCard.css";
import hpStatusCalc from "../scripts/hpStatusCalc.js";

const CharacterCard = ({ characterId, refreshKey, isDMMode }) => {
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

    const currentHp = character ? character.getCurrentHP() : 0;
    const maxHp = character ? character.getMaxHP() : 0;
    const { status: hpStatus, percentage: hpBarPercentage } = hpStatusCalc(currentHp, maxHp);
    const canCastSpells = character ? character.canCastSpells() : false;

    const conditions = character ? character.getConditions() : [];
    const isMonk = character ? character.isClass('Monk') : false;

    const handleRefresh = () => {
        setRefreshCharacter((prev) => prev + 1);
    };


    return (
        <Box p={2} component={Paper} sx={{
            width: '100%',
            borderRadius: '15px',
            marginBottom: '15px',
            position: 'relative'
        }}>
            {character && (
                <>
                    <IconButton
                        onClick={handleRefresh}
                        variant="outlined"
                        color="secondary"
                        sx={{ position: 'absolute', top: '0px', left: '0px' }}
                    >
                        <Refresh />
                    </IconButton>
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
                                <HitDie totalHitDie={character.calcHitDieUsedAndMax()} isDMMode={isDMMode} />
                            </Box>
                        </Grid>
                    </Grid>

                    {isDMMode && (
                        <Senses
                            darkvision={character.getDarkvision()}
                            truesight={character.getTruesight()}
                            customSenses={character.getCustomSenses()}
                        />
                    )}

                    <HealthBar
                        currentHp={currentHp}
                        maxHp={maxHp}
                        hpStatus={hpStatus}
                        hpBarPercentage={hpBarPercentage}
                        isDMMode={isDMMode}
                    />
                    {conditions && conditions.length !== 0 && (
                        <Conditions conditions={conditions} />
                    )}
                    {canCastSpells && <SpellSlots character={character} isDMMode={isDMMode} />}
                    {isMonk && <KiPoints kiPointsUsed={character.getKiPointsUsedAndMax()} isDMMode={isDMMode} />}
                    {isDMMode && <Passives character={character} />}
                </>
            )}
        </Box>
    );
};

export default CharacterCard;
