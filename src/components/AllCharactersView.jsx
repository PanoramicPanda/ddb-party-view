import React, { useState, useCallback, useEffect } from 'react';
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Button, Box, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Paper } from "@mui/material";
import CharacterCard from './CharacterCard.jsx';
import darkTheme from "../scripts/theme";
import SelectedCreatureCard from "./SelectedCreatureCard";

const AllCharactersView = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [isDMMode, setIsDMMode] = useState(false);
    const [isGM, setIsGM] = useState(false);
    const [selectedCreature, setSelectedCreature] = useState(null);
    const [openSettings, setOpenSettings] = useState(false);
    const [apiEndpoint, setApiEndpoint] = useState('');
    const [characterIds, setCharacterIds] = useState('');
    const [manualACBonuses, setManualACBonuses] = useState('');
    const [error, setError] = useState('');

    // Temporary state variables
    const [tempApiEndpoint, setTempApiEndpoint] = useState('');
    const [tempCharacterIds, setTempCharacterIds] = useState('');
    const [tempManualACBonuses, setTempManualACBonuses] = useState('');

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
        loadSettings();
    }, []);

    const handleDMModeToggle = (event) => {
        setIsDMMode(event.target.checked);
    };

    const handleOpenSettings = () => {
        // Initialize temporary state with current values
        setTempApiEndpoint(apiEndpoint);
        setTempCharacterIds(characterIds);
        setTempManualACBonuses(manualACBonuses);
        setError('');
        setOpenSettings(true);
    };

    const handleCloseSettings = () => {
        setOpenSettings(false);
    };

    const handleSaveSettings = async () => {
        // Validate and apply settings
        let isValid = true;
        let validationMessage = "";

        // Perform basic validation
        try {
            // Example of URL validation (basic)
            new URL(tempApiEndpoint);
        } catch (_) {
            isValid = false;
            validationMessage += "Invalid API URL. ";
        }

        // Check character IDs (ensure they are numbers and not empty)
        const idsArray = tempCharacterIds.split(',').map(id => id.trim());
        if (idsArray.some(id => isNaN(id) || id === "")) {
            isValid = false;
            validationMessage += "Invalid Character IDs. ";
        }

        // Validate manual AC bonuses (ensure correct format)
        let parsedManualACBonuses = [];
        if (tempManualACBonuses.trim() !== "") {
            try {
                parsedManualACBonuses = JSON.parse(tempManualACBonuses);
                if (!Array.isArray(parsedManualACBonuses) || parsedManualACBonuses.some(item => !Array.isArray(item) || item.length !== 2 || typeof item[0] !== "string" || typeof item[1] !== "number")) {
                    throw new Error();
                }
            } catch (error) {
                isValid = false;
                validationMessage += "Invalid Manual AC Bonuses format. ";
            }
        }

        if (isValid) {
            const settings = {
                apiEndpoint: tempApiEndpoint,
                characterIds: tempCharacterIds,
                manualACBonuses: tempManualACBonuses.trim() === "" ? "[]" : JSON.stringify(parsedManualACBonuses),
            };
            try {
                await TS.localStorage.campaign.setBlob(JSON.stringify(settings));
                setApiEndpoint(tempApiEndpoint);
                setCharacterIds(tempCharacterIds);
                setManualACBonuses(settings.manualACBonuses);
                setOpenSettings(false);
                refreshCharacters(); // Refresh characters to apply new settings
            } catch (error) {
                console.error("Failed to save settings:", error);
                setError(`Failed to save settings: ${error.message}`);
            }
        } else {
            console.error("Failed to save settings:", validationMessage);
            setError(`Failed to save settings: ${validationMessage}`);
        }
    };

    const loadSettings = async () => {
        try {
            const settingsBlob = await TS.localStorage.campaign.getBlob();
            if (settingsBlob) {
                const settings = JSON.parse(settingsBlob);
                setApiEndpoint(settings.apiEndpoint || '');
                setCharacterIds(settings.characterIds || '');
                setManualACBonuses(settings.manualACBonuses || '');
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
        }
    };

    const parsedManualACBonuses = manualACBonuses.trim() === "" ? [] : JSON.parse(manualACBonuses);

    const idsArray = characterIds.split(',').map(id => id.trim()).filter(id => id !== "");

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
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
                        <>
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
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                onClick={handleOpenSettings}
                                sx={{ marginLeft: 2 }}
                            >
                                Settings
                            </Button>
                        </>
                    )}
                </Box>
                {selectedCreature && isDMMode && (
                    <SelectedCreatureCard
                        isDMMode={isDMMode}
                        creatureName={selectedCreature.name}
                        creatureId={selectedCreature.id}
                        currHp={selectedCreature.currHp}
                        maxHp={selectedCreature.maxHp}
                    />
                )}
                <Box mt={2} width="100%">
                    {idsArray.length > 0 ? (
                        idsArray.map((id) => (
                            <CharacterCard
                                key={id}
                                characterId={id}
                                refreshKey={refreshKey}
                                isDMMode={isDMMode}
                                apiEndpoint={apiEndpoint}
                                manualACBonuses={parsedManualACBonuses}
                            />
                        ))
                    ) : (
                        <Box p={2} component={Paper} sx={{
                            width: '100%', // Adjust width as needed
                            borderRadius: '15px',
                            marginBottom: '15px',
                            textAlign: 'center'
                        }}>
                            <Typography variant="h6">Please add creature IDs in settings</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
            <Dialog open={openSettings} onClose={handleCloseSettings}>
                <DialogTitle>Settings</DialogTitle>
                <DialogContent>
                    <TextField
                        label="API Redirect URL (should be able to accept a ?characterId= query parameter)"
                        value={tempApiEndpoint}
                        onChange={(e) => setTempApiEndpoint(e.target.value)}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="Character IDs (comma separated)"
                        value={tempCharacterIds}
                        onChange={(e) => setTempCharacterIds(e.target.value)}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label='Manual AC Overrides (comma separated arrays ["character name", ac_bonus])'
                        value={tempManualACBonuses}
                        onChange={(e) => setTempManualACBonuses(e.target.value)}
                        fullWidth
                        margin="dense"
                    />
                    {error && (
                        <Typography color="error" variant="body2" sx={{ marginTop: 2 }}>
                            {error}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSaveSettings} variant="contained" color="primary">
                        Save
                    </Button>
                    <Button onClick={handleCloseSettings} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}

export default AllCharactersView;
