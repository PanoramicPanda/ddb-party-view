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
        console.log('Hit Dice [used, max]: ' + character.calcHitDieUsedAndMax());
        if (character.isClass('Monk')){
            console.log('Ki Points [used, max]: ' + character.getKiPointsUsedAndMax());
        }
        if (character.canCastSpells()){
            console.log('Level 1 Spell Slots [used, max]: ' + character.getSpellSlotsUsedAndMax(1));
            console.log('Level 2 Spell Slots [used, max]: ' + character.getSpellSlotsUsedAndMax(2));
            console.log('Level 3 Spell Slots [used, max]: ' + character.getSpellSlotsUsedAndMax(3));
            console.log('Level 4 Spell Slots [used, max]: ' + character.getSpellSlotsUsedAndMax(4));
            console.log('Level 5 Spell Slots [used, max]: ' + character.getSpellSlotsUsedAndMax(5));
            console.log('Level 6 Spell Slots [used, max]: ' + character.getSpellSlotsUsedAndMax(6));
            console.log('Level 7 Spell Slots [used, max]: ' + character.getSpellSlotsUsedAndMax(7));
            console.log('Level 8 Spell Slots [used, max]: ' + character.getSpellSlotsUsedAndMax(8));
            console.log('Level 9 Spell Slots [used, max]: ' + character.getSpellSlotsUsedAndMax(9));
        }
        console.log('==========');
    } catch (error) {
        console.error(`Error processing character ID ${charId}:`, error);
    }
});