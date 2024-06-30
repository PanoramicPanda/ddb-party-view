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
                throw new Error('Response is not JSON');
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
        let maxHP = baseHP + (level * conMod);
        return maxHP;
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
        let hpRemaining = maxHP - removedHP + this.tempHP + bonusHP;
        return hpRemaining;
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
                            let dexBonus = Math.min(dexMod, 2);
                            AC += item.definition.armorClass + dexBonus;
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
        const modifiers = this.character['modifiers'];
        for (let mod in modifiers){
            for (let entry of modifiers[mod]){
                if (entry['type'] === 'bonus' && entry['subType'] === 'armor-class' && entry['isGranted']){
                    if (this.seenGrantedModifiers.includes(entry['id'])){
                        continue;
                    }
                    bonusAC += entry['value'];
                }
            }
        }

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
}

export default StatGrabber;