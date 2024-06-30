/* eslint-disable no-prototype-builtins */
import {API_ENDPOINT as CONFIG_API_ENDPOINT} from './config.js';
import { MANUAL_AC_BONUSES} from "./config.js";

const API_ENDPOINT = import.meta.env.VITE_ENV === 'development' ? import.meta.env.VITE_API_ENDPOINT : CONFIG_API_ENDPOINT;

class StatGrabber {

    constructor(characterId) {
        this.apiEndpoint = API_ENDPOINT;
        this.characterId = characterId;
        this.tempHp = 0;
        this.scoreLookups = {
            'STR': [0, 'strength-score'],
            'DEX': [1, 'dexterity-score'],
            'CON': [2, 'constitution-score'],
            'INT': [3, 'intelligence-score'],
            'WIS': [4, 'wisdom-score'],
            'CHA': [5, 'charisma-score']
        }
    }

    // perform a get request to a url with the character id as part of the url. It will return a json object
    async getCharacter() {
        let apiUrl = import.meta.env.VITE_ENV === 'development' ? `/api/${this.characterId}` : `${this.apiEndpoint}?character=${this.characterId}`;
        try {
            const response = await fetch(apiUrl);
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json(); // Directly return parsed JSON if content-type is JSON
            } else {
                const text = await response.text();
                console.error('Response is not JSON:', text);
            }
        } catch (error) {
            console.error('Error fetching character:', error);
            throw error; // Rethrow the error to be caught in the calling function
        }
    }

    setCharacter(data){
        this.character = data['data'];
        this.classes = this.getClasses();
        this.seenGrantedModifiers = [];
    }

    getClasses(){
        if (this.character === undefined){
            return [];
        }
        let classes = [];
        for (let charClass of this.character['classes']){
            classes.push([charClass['definition']['name'], charClass['level']]);
        }
        return classes;
    }

    isClass(className){
        if (this.character === undefined){
            return false;
        }
        let classExists = false;
        for (let charClass of this.classes){
            if (charClass[0] === className){
                classExists = true;
            }
        }
        return classExists;
    }

    calculateAbilityModifier(abilityScore) {
        return Math.floor((abilityScore - 10) / 2);
    }
    getAbilityScore(ability) {
        if (this.character === undefined){
            return 0;
        }
        const lookup = this.scoreLookups[ability];
        let scoreBase = this.character['stats'][lookup[0]]['value'];
        let scoreBonusInput = this.character['bonusStats'][lookup[0]]['value'];
        let scoreBonus = Number.isInteger(scoreBonusInput) ? scoreBonusInput : 0;
        let modifiers = this.character['modifiers'];
        let scoreModifier = 0;
        let scoreOverride = 0;
        for (let mod in modifiers){
            for (let item of modifiers[mod]){
                if (item['subType'] === lookup[1] && item['type'] === 'bonus'){
                    scoreModifier += item['value'];
                } else if (item['subType'] === lookup[1] && item['type'] === 'set'){
                    scoreOverride = item['value'];
                }
            }
        }
        return scoreOverride === 0 ? scoreBase + scoreBonus + scoreModifier : scoreOverride;
    }

    getTotalLevel() {
        if (this.character === undefined){
            return 0;
        }
        let level = 0;
        let classList = this.character['classes'];
        for (let charClass of classList){
            level += charClass['level'];
        }
        return level;
    }

    getMaxHP() {
        if (this.character === undefined){
            return 0;
        }
        let baseHP = this.character['baseHitPoints'];
        let conScore = this.getAbilityScore('CON');
        let conMod = this.calculateAbilityModifier(conScore);
        let level = this.getTotalLevel();
        return baseHP + (level * conMod);
    }

    getCurrentHP() {
        if (this.character === undefined){
            return 0;
        }
        let maxHP = this.getMaxHP();
        let removedHP = this.character['removedHitPoints'];
        this.tempHP = this.character['temporaryHitPoints'];
        let bonusHPInput = this.character['bonusHitPoints'];
        let bonusHP = Number.isInteger(bonusHPInput) ? bonusHPInput : 0;
        return maxHP - removedHP + this.tempHP + bonusHP;
    }

    getTotalBonusFromItems(bonusSubType){
        if (this.character === undefined){
            return 0;
        }
        let bonusTotal = 0;

        const modifiers = this.character['modifiers'];
        for (let mod in modifiers){
            for (let entry of modifiers[mod]){
                if (entry['type'] === 'bonus' && entry['subType'] === bonusSubType && entry['isGranted']){
                    if (this.seenGrantedModifiers.includes(entry['id'])){
                        continue;
                    }
                    bonusTotal += entry['value'];
                }
            }
        }

        return bonusTotal;
    }

    calcEquipmentAC() {
        if (this.character === undefined){
            return 0;
        }
        let AC = 0;
        let dexScore = this.getAbilityScore('DEX');
        let dexMod = this.calculateAbilityModifier(dexScore);
        this.character.inventory.forEach((item) => {
            if (item.equipped){
                if (item.definition.filterType === 'Armor'){
                    switch (item.definition.armorTypeId){
                        case 1: // Light Armor
                            AC += item.definition.armorClass + dexMod;
                            break;
                        case 2: // Medium Armor
                            AC += item.definition.armorClass + Math.min(dexMod, 2);
                            break;
                        case 3: // Heavy Armor
                            AC += item.definition.armorClass;
                            break;
                        case 4: // Shield
                            AC += item.definition.armorClass;
                            break;
                    }
                    if (item.definition.hasOwnProperty('grantedModifiers')) {
                        item.definition.grantedModifiers.forEach(modifier => {
                            if (modifier.subType === 'armor-class') {
                                this.seenGrantedModifiers.push(modifier.id);
                                AC += modifier.value;
                            }
                        });
                    }
                }else{
                    if (item.definition.hasOwnProperty('grantedModifiers')){
                        item.definition.grantedModifiers.forEach(modifier => {
                            if (modifier.subType === 'armor-class'){
                                this.seenGrantedModifiers.push(modifier.id);
                                AC += modifier.value;
                            }
                        });
                    }
                }
            }
        });

        if (AC === 0){
            AC = this.calcUnarmoredDefense();
        }
        return AC;

    }

    wearingArmor(){
        let wearingArmor = 0;
        this.character.inventory.forEach((item) => {
            if (item.definition.filterType === 'Armor' && item.equipped && item.description.armorTypeId <= 4){
                wearingArmor += 1;
            }
        });
        return wearingArmor > 0;
    }

    calcBarbarianAC(){
        if (this.wearingArmor()){
            return this.calcEquipmentAC();
        }else{
            let dexScore = this.getAbilityScore('DEX');
            let conScore = this.getAbilityScore('CON');
            let dexMod = this.calculateAbilityModifier(dexScore);
            let conMod = this.calculateAbilityModifier(conScore);
            return 10 + dexMod + conMod;
        }
    }

    calcMonkAC(){
        if (this.wearingArmor()) {
            return this.calcEquipmentAC();
        }else {
            let dexScore = this.getAbilityScore('DEX');
            let wisScore = this.getAbilityScore('WIS');
            let dexMod = this.calculateAbilityModifier(dexScore);
            let wisMod = this.calculateAbilityModifier(wisScore);
            return 10 + dexMod + wisMod;
        }
    }

    calcUnarmoredDefense(){
        if (this.wearingArmor()){
            return 0;
        }
        let unarmoredDefense = 0;

        if (this.isClass('Barbarian')){
            unarmoredDefense = this.calcBarbarianAC();
        } else if (this.isClass('Monk')){
            unarmoredDefense = this.calcMonkAC();
        } else {
            let dexScore = this.getAbilityScore('DEX');
            let dexMod = this.calculateAbilityModifier(dexScore);
            unarmoredDefense = 10 + dexMod;
        }

        this.character.inventory.forEach((item) => {
            if (item.equipped){
                if (item.definition.hasOwnProperty('grantedModifiers')){
                    item.definition.grantedModifiers.forEach(modifier => {
                        if (modifier.subType === 'unarmored-armor-class'){
                            this.seenGrantedModifiers.push(modifier.id);
                            unarmoredDefense += modifier.value;
                        }
                    });
                }
            }
        });

        return unarmoredDefense;
    }

    calcBonusAC(){
        if (this.character === undefined){
            return 0;
        }
        let bonusAC = 0;
        bonusAC += this.getTotalBonusFromItems('armor-class');

        const characterValues = this.character['characterValues'];
        for (let entry of characterValues) {
            if (entry['typeId'] === 3 && Number.isInteger(entry['value'])) {
                bonusAC += entry['value'];
            }
        }

        MANUAL_AC_BONUSES.forEach((manualBonus) => {
            if (this.character['name'] === manualBonus[0]){
                bonusAC += manualBonus[1];
            }
        });

        return bonusAC;
    }

    calcAC(){
        if (this.character === undefined){
            return 0;
        }
        let standardAC = this.calcEquipmentAC();
        let bonusAC = this.calcBonusAC();
        return standardAC + bonusAC;
    }

    getInspiration(){
        if (this.character === undefined){
            return 0;
        }
        return this.character['inspiration'];
    }

    getKiPointsUsedAndMax(){
        if (this.character === undefined){
            return 0;
        }
        if (this.isClass('Monk')){
            let maxKiPoints = 0;
            let spentKiPoints = 0;
            let classActions = this.character.actions.class;
            classActions.forEach(action => {
                if (action.name === 'Ki Points'){
                    maxKiPoints = action.limitedUse.maxUses;
                    spentKiPoints = action.limitedUse.numberUsed;
                }
            });
            return [spentKiPoints, maxKiPoints];
        }
    }

    canCastSpells(){
        if (this.character === undefined){
            return false;
        }
        let canCast = false;
        let classList = this.character['classes'];
        for (let charClass of classList){
            if (charClass.definition.canCastSpells){
                canCast = true;
            }
        }
        return canCast;
    }

    calculateTotalSpellSlots(){
        if (this.character === undefined){
            return 0;
        }
        let classList = this.character.classes;
        let totalEffectiveLevel = 0;
        let nonWarlockCastingClasses = [];
        let totalSpellSlots;

        classList.forEach((charClass) => {
            let name = charClass.definition.name;
            let level = charClass.level;
            let canCastSpells = charClass.definition.canCastSpells;
            if (canCastSpells && name !== 'Warlock'){
                let multiclassDivisor = charClass.definition.spellRules.multiClassSpellSlotDivisor;
                totalEffectiveLevel += Math.floor(level / multiclassDivisor);
                nonWarlockCastingClasses.push(charClass);
            }
        });

        if (nonWarlockCastingClasses.length === 1) {
            let singleClass = nonWarlockCastingClasses[0];
            totalSpellSlots = singleClass.definition.spellRules.levelSpellSlots.slice(1)[singleClass.level - 1];
        }else{
            const multiclassSpellSlotsTable = [
                [2, 0, 0, 0, 0, 0, 0, 0, 0], // Level 1
                [3, 0, 0, 0, 0, 0, 0, 0, 0], // Level 2
                [4, 2, 0, 0, 0, 0, 0, 0, 0], // Level 3
                [4, 3, 0, 0, 0, 0, 0, 0, 0], // Level 4
                [4, 3, 2, 0, 0, 0, 0, 0, 0], // Level 5
                [4, 3, 3, 0, 0, 0, 0, 0, 0], // Level 6
                [4, 3, 3, 1, 0, 0, 0, 0, 0], // Level 7
                [4, 3, 3, 2, 0, 0, 0, 0, 0], // Level 8
                [4, 3, 3, 3, 1, 0, 0, 0, 0], // Level 9
                [4, 3, 3, 3, 2, 0, 0, 0, 0], // Level 10
                [4, 3, 3, 3, 2, 1, 0, 0, 0], // Level 11
                [4, 3, 3, 3, 2, 1, 0, 0, 0], // Level 12
                [4, 3, 3, 3, 2, 1, 1, 0, 0], // Level 13
                [4, 3, 3, 3, 2, 1, 1, 0, 0], // Level 14
                [4, 3, 3, 3, 2, 1, 1, 1, 0], // Level 15
                [4, 3, 3, 3, 2, 1, 1, 1, 0], // Level 16
                [4, 3, 3, 3, 2, 1, 1, 1, 1], // Level 17
                [4, 3, 3, 3, 2, 1, 1, 1, 1], // Level 18
                [4, 3, 3, 3, 2, 2, 1, 1, 1], // Level 19
                [4, 3, 3, 3, 2, 2, 1, 1, 1], // Level 20
            ];

            totalSpellSlots = multiclassSpellSlotsTable[Math.min(totalEffectiveLevel, 20) - 1];
        }

        return totalSpellSlots;
    }

    getTotalSpellSlots(level){
        let totalSpellSlots = this.calculateTotalSpellSlots();
        if (totalSpellSlots === undefined){
            return 0;
        }
        let slotsForLevel = totalSpellSlots[level - 1] || 0;

        let classList = this.character['classes'];
        let warlockLevels = 0;
        classList.forEach((charClass) => {
            if (charClass.definition.name === 'Warlock'){
                warlockLevels += charClass.level;
            }
        });

        if (warlockLevels > 0) {
            const warlockSpellSlots = classList.find((charClass) => charClass.definition.name === 'Warlock').definition.spellRules.levelSpellSlots.slice(1)[warlockLevels - 1];
            slotsForLevel += warlockSpellSlots[level-1];
        }

        return slotsForLevel
    }

    getUsedSpellSlots(level){
        if (this.character === undefined){
            return 0;
        }
        let usedSlots = 0;
        let spellSlots = this.character['spellSlots'];
        for (let slot of spellSlots){
            if (slot['level'] === level){
                usedSlots += slot['used'];
            }
        }
        if (this.character.hasOwnProperty('pactMagic')){
            let pactSlots = this.character['pactMagic'];
            for (let slot of pactSlots){
                if (slot['level'] === level){
                    usedSlots += slot['used'];
                }
            }
        }
        return usedSlots;
    }

    getSpellSlotsUsedAndMax(level){
        if (this.character === undefined){
            return 0;
        }
        let usedSlots = this.getUsedSpellSlots(level);
        let maxSlots = this.getTotalSpellSlots(level);
        return [usedSlots, maxSlots];
    }

    calcHitDieUsedAndMax(){
        if (this.character === undefined){
            return 0;
        }
        let hitDieUsed = 0;
        let hitDieMax = this.getTotalLevel();
        let classList = this.character['classes'];
        for (let charClass of classList) {
            hitDieUsed += charClass.hitDiceUsed
        }
        return [hitDieUsed, hitDieMax];
    }

    checkProficiency(skill){
        if (this.character === undefined){
            return 0;
        }
        let modifiers = this.character['modifiers'];
        let profMultiplier = 0
        for (let mod in modifiers){
            for (let item of modifiers[mod]){
                if (item.subType === skill && item.type === 'proficiency' && profMultiplier !== 2){
                    profMultiplier = 1;
                } else if (item.subType === skill && item.type === 'expertise'){
                    profMultiplier = 2;
                }
            }
        }
        return profMultiplier;
    }

    getProficiencyBonus(){
        let level = this.getTotalLevel();
        let profBonus;
        if (level < 5){
            profBonus = 2;
        } else if (level < 9){
            profBonus = 3;
        } else if (level < 13){
            profBonus = 4;
        } else if (level < 17){
            profBonus = 5;
        } else {
            profBonus = 6;
        }
        return profBonus;
    }

    getPassivePerception(){
        let wisScore = this.getAbilityScore('WIS');
        let wisMod = this.calculateAbilityModifier(wisScore);
        let profMultiplier = this.checkProficiency('perception');
        let profBonus = this.getProficiencyBonus();
        let magicBonus = this.getTotalBonusFromItems('passive-perception');
        return 10 + wisMod + (profMultiplier * profBonus) + magicBonus;
    }

    getPassiveInvestigation(){
        let intScore = this.getAbilityScore('INT');
        let intMod = this.calculateAbilityModifier(intScore);
        let profMultiplier = this.checkProficiency('investigation');
        let profBonus = this.getProficiencyBonus();
        let magicBonus = this.getTotalBonusFromItems('passive-investigation');
        return 10 + intMod + (profMultiplier * profBonus) + magicBonus;
    }

    getPassiveInsight(){
        let wisScore = this.getAbilityScore('WIS');
        let wisMod = this.calculateAbilityModifier(wisScore);
        let profMultiplier = this.checkProficiency('insight');
        let profBonus = this.getProficiencyBonus();
        let magicBonus = this.getTotalBonusFromItems('passive-insight');
        return 10 + wisMod + (profMultiplier * profBonus) + magicBonus;
    }
}

export default StatGrabber;