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
        if (character.canCastSpells()){
            console.log('Used Level 1 Spell Slots: ' + character.getUsedSpellSlots(1));
            console.log('Total Level 1 Spell Slots: ' + character.getTotalSpellSlots(1));
            console.log('Used Level 2 Spell Slots: ' + character.getUsedSpellSlots(2));
            console.log('Total Level 2 Spell Slots: ' + character.getTotalSpellSlots(2));
            console.log('Used Level 3 Spell Slots: ' + character.getUsedSpellSlots(3));
            console.log('Total Level 3 Spell Slots: ' + character.getTotalSpellSlots(3));
            console.log('Used Level 4 Spell Slots: ' + character.getUsedSpellSlots(4));
            console.log('Total Level 4 Spell Slots: ' + character.getTotalSpellSlots(4));
            console.log('Used Level 5 Spell Slots: ' + character.getUsedSpellSlots(5));
            console.log('Total Level 5 Spell Slots: ' + character.getTotalSpellSlots(5));
            console.log('Used Level 6 Spell Slots: ' + character.getUsedSpellSlots(6));
            console.log('Total Level 6 Spell Slots: ' + character.getTotalSpellSlots(6));
            console.log('Used Level 7 Spell Slots: ' + character.getUsedSpellSlots(7));
            console.log('Total Level 7 Spell Slots: ' + character.getTotalSpellSlots(7));
            console.log('Used Level 8 Spell Slots: ' + character.getUsedSpellSlots(8));
            console.log('Total Level 8 Spell Slots: ' + character.getTotalSpellSlots(8));
            console.log('Used Level 9 Spell Slots: ' + character.getUsedSpellSlots(9));
            console.log('Total Level 9 Spell Slots: ' + character.getTotalSpellSlots(9));
        }
        console.log('==========');
    } catch (error) {
        console.error(`Error processing character ID ${charId}:`, error);
    }
});