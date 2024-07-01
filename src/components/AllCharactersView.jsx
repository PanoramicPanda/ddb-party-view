import { CHARACTER_IDS } from '../scripts/config.js';
import { useState, useCallback, useEffect } from 'react';
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Button, Box } from "@mui/material";
import { CharacterCard } from './CharacterCard.jsx';
import darkTheme from "../scripts/theme";

const AllCharactersView = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [isDMMode, setIsDMMode] = useState(false);

    const refreshCharacters = useCallback(() => {
        setRefreshKey((prevKey) => prevKey + 1);
    }, []);

    useEffect(() => {
        const cheatCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
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
            <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                <Button variant="contained" color="primary" onClick={refreshCharacters}>
                    Refresh Characters
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
