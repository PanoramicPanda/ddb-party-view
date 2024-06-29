import StatGrabber from './grabber.js';
import { CHARACTER_IDS} from "./config.js";

CHARACTER_IDS.forEach(async (charId) => {
    let character = new StatGrabber(charId);
    try {
        let characterData = await character.getCharacter();
        character.setCharacter(characterData);
        console.log(character.character['name']);
        console.log('STR ' + character.getAbilityScore('STR'));
        console.log('DEX ' + character.getAbilityScore('DEX'));
        console.log('CON ' + character.getAbilityScore('CON'));
        console.log('INT ' + character.getAbilityScore('INT'));
        console.log('WIS ' + character.getAbilityScore('WIS'));
        console.log('CHA ' + character.getAbilityScore('CHA'));
        console.log('Level ' + character.getTotalLevel());
        console.log('Max HP ' + character.getMaxHP());
        console.log('Current HP ' + character.getCurrentHP());
        console.log('AC ' + character.calcAC());
        console.log('Has Inspiration: ' + character.getInspiration());
        console.log('==========');
    } catch (error) {
        console.error(`Error processing character ID ${charId}:`, error);
    }
});