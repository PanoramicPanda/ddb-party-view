import { CHARACTER_IDS } from '../scripts/config.js';
import { ThemeProvider, CssBaseline } from "@mui/material";
import { CharacterCard } from './CharacterCard.jsx';
import darkTheme from "../scripts/theme";

const AllCharactersView = () => {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <div style={{ width: '100%' }}>
                {CHARACTER_IDS.map((id) => (
                    <CharacterCard key={id} characterId={id} />
                ))}
            </div>
        </ThemeProvider>
    );
}

export default AllCharactersView;
