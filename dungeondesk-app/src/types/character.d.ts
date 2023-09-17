interface CharacterData {
    name: string;
    class: string;
    level: number;
    background: string;
    playerName: string;
    race: string;
    alignment: string;
    experiencePoints: number;
  
    abilityScores: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
  
    proficiencyBonus: number;
    inspiration: number;
    armorClass: number;
    initiative: number;
    speed: number;
    hitPoints: number;
    temporaryHP: number;
    hitDice: string;
    deathSaves: {
      successes: number;
      failures: number;
    };
  
    attacks: Array<{
      name: string;
      bonus: number;
      damage: string;
    }>;
  
    equipment: string[];
    traits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  
    featuresAndTraits: string[];
  }
  