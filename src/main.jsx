import React from 'react'
import ReactDOM from 'react-dom/client'
// import './index.css'
import AllCharactersView from "./components/AllCharactersView.jsx";

async function handleCreatureSelectionChange(selectedCreaturesObject) {
    try {
        // Access the creatures array from the payload
        const selectedCreatures = selectedCreaturesObject.payload.creatures;

        // Check if there are selected creatures
        if (selectedCreatures.length > 0) {
            // Get more information about the first selected creature
            const creatureInfo = await TS.creatures.getMoreInfo([selectedCreatures[0].id]);

            // Extract current and max HP
            const currHp = creatureInfo[0].hp.value;
            const maxHp = creatureInfo[0].hp.max;
            const creatureName = creatureInfo[0].name;

            // Assuming you have a way to update the state from outside React
            console.log({ name: creatureName, currHp, maxHp })
            window.setSelectedCreature({ name: creatureName, currHp, maxHp });
        } else {
            window.setSelectedCreature(null);
        }
    } catch (error) {
        // Handle any errors that occur during the promise resolution
        console.error('Error getting creature info:', error);
    }
}

window.handleCreatureSelectionChange = handleCreatureSelectionChange;


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AllCharactersView />
  </React.StrictMode>,
)
