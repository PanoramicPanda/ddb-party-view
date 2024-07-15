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
import AvatarSection from "./AvatarSection.jsx";
import { LightMode, ShieldTwoTone } from "@mui/icons-material";
import "../css/characterCard.css";
import hpStatusCalc from "../scripts/hpStatusCalc.js";

const CharacterCard = ({ characterId, refreshKey, isDMMode, apiEndpoint, manualACBonuses = [] }) => {
    const [character, setCharacter] = useState(null);
    const [refreshCharacter, setRefreshCharacter] = useState(0);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (characterId) {
                let characterStats = new StatGrabber(characterId, apiEndpoint, manualACBonuses);
                try {
                    const characterData = await characterStats.getCharacter();
                    const jsonData = await characterData.json();
                    characterStats.setCharacter(jsonData);
                    setCharacter(characterStats);
                    setFetchError(null);
                } catch (error) {
                    console.error("Failed to fetch character data:", error);
                    setFetchError("Failed to fetch character data");
                    // Keep the previous character state to ensure the component doesn't break
                    setCharacter(null);
                }
            }
        };

        fetchData();
    }, [characterId, refreshKey, refreshCharacter, apiEndpoint, manualACBonuses]);

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
            {fetchError ? (
                <Typography color="error">{fetchError}</Typography>
            ) : character ? (
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
                            <AvatarSection character={character} />
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
                        currentHp={character.getCurrentHP()}
                        maxHp={character.getMaxHP()}
                        hpStatus={hpStatusCalc(character.getCurrentHP(), character.getMaxHP()).status}
                        hpBarPercentage={hpStatusCalc(character.getCurrentHP(), character.getMaxHP()).percentage}
                        isDMMode={isDMMode}
                    />
                    {character.getConditions() && character.getConditions().length !== 0 && (
                        <Conditions conditions={character.getConditions()} />
                    )}
                    {character.canCastSpells() && <SpellSlots character={character} isDMMode={isDMMode} />}
                    {character.isClass('Monk') && <KiPoints kiPointsUsed={character.getKiPointsUsedAndMax()} isDMMode={isDMMode} />}
                    {isDMMode && <Passives character={character} />}
                </>
            ) : (
                <Typography>Loading...</Typography>
            )}
        </Box>
    );
};

export default CharacterCard;
