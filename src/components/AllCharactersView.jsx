import { CHARACTER_IDS } from '../scripts/config.js';
import { useState, useCallback, useEffect } from 'react';
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Button, Box } from "@mui/material";
import { CharacterCard } from './CharacterCard.jsx';
import darkTheme from "../scripts/theme";
import SelectedCreatureCard from "./SelectedCreatureCard";

const AllCharactersView = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [isDMMode, setIsDMMode] = useState(false);
    const [selectedCreature, setSelectedCreature] = useState(null);

    window.setSelectedCreature = setSelectedCreature;

    const refreshCharacters = useCallback(() => {
        setRefreshKey((prevKey) => prevKey + 1);
    }, []);

    useEffect(() => {
        const cheatCode = ['w', 'w', 's', 's', 'a', 'd', 'a', 'd'];
        let cheatCodePosition = 0;

        const handleKeyDown = (event) => {
            if (event.key === cheatCode[cheatCodePosition]) {
                cheatCodePosition++;
                if (cheatCodePosition === cheatCode.length) {
                    setIsDMMode((prevMode) => !prevMode);
                    cheatCodePosition = 0;
                }
            } else {
                cheatCodePosition = 0;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

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
                <Button variant="outlined"
                        color="primary"
                        size="small"
                        onClick={refreshCharacters}>
                    Refresh All Characters
                </Button>
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
