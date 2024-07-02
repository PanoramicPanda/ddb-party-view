import { CHARACTER_IDS, API_ENDPOINT, MANUAL_AC_BONUSES } from '../scripts/config.js';
import { useState, useCallback, useEffect } from 'react';
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Button, Box, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, TextField } from "@mui/material";
import CharacterCard from './CharacterCard.jsx';
import darkTheme from "../scripts/theme";
import SelectedCreatureCard from "./SelectedCreatureCard";

const AllCharactersView = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [isDMMode, setIsDMMode] = useState(false);
    const [isGM, setIsGM] = useState(false);
    const [selectedCreature, setSelectedCreature] = useState(null);

    window.setSelectedCreature = setSelectedCreature;

    const refreshCharacters = useCallback(() => {
        setRefreshKey((prevKey) => prevKey + 1);
    }, []);

    const checkDMMode = async () => {
        try {
            const clientMe = await TS.clients.whoAmI();
            const clientInfo = await TS.players.getMoreInfo([clientMe.player.id]);
            if (clientInfo[0].rights.canGm === true) {
                setIsGM(true);
            } else {
                setIsGM(false);
            }
        } catch (error) {
            console.error("Failed to get client info:", error);
        }
    };

    useEffect(() => {
        checkDMMode();
    }, []);

    const handleDMModeToggle = (event) => {
        setIsDMMode(event.target.checked);
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            {selectedCreature && isDMMode && (
                <SelectedCreatureCard
                    isDMMode={isDMMode}
                    creatureName={selectedCreature.name}
                    currHp={selectedCreature.currHp}
                    maxHp={selectedCreature.maxHp}
                />
            )}
            <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                <Box display="flex" flexDirection="row" alignItems="center">
                    <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={refreshCharacters}
                    >
                        Refresh All Characters
                    </Button>
                    {isGM && (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isDMMode}
                                    onChange={handleDMModeToggle}
                                    color="primary"
                                />
                            }
                            label="DM Mode"
                            sx={{ marginLeft: 2 }}
                        />
                    )}
                </Box>
                <Box mt={2} width="100%">
                    {CHARACTER_IDS.map((id) => (
                        <CharacterCard key={id} characterId={id} refreshKey={refreshKey} isDMMode={isDMMode} />
                    ))}
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default AllCharactersView;
