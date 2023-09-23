import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CharacterMainSection from './CharSheetContent';
import './CharSheet.css';

const RACE_LANGUAGES: { [key: string]: string[] | undefined } = {
  "Human": ["Common", "Any one language of choice"],
  "Elf": ["Common", "Elvish"],
  "Hill Dwarf": ["Common", "Dwarvish"],
  "High Elf": ["Common", "Elvish"],
  "Dragonborn": ["Common", "Draconic"],
  "Rock Gnome": ['Common', "Gnomish"],
  "Half-Elf": ["Common", "Elvish"],
  "Half-Orc": ["Common", "Orc"],
  "Halfling": ["Common", "Halfling"],
  "Tiefling": ["Common", "Infernal"]
}

const ABILITY_MAP: { [key: string]: string } = {
  'STR': 'strength',
  'DEX': 'dexterity',
  'CON': 'constitution',
  'INT': 'intelligence',
  'WIS': 'wisdom',
  'CHA': 'charisma'
};


const PROFICIENCY_SKILL_MAP: { [key: number]: string } = {
  1: 'Acrobatics',
  2: 'Animal Handling',
  3: 'Arcana',
  4: 'Athletics',
  5: 'Deception',
  6: 'History',
  7: 'Insight',
  8: 'Intimidation',
  9: 'Investigation',
  10: 'Medicine',
  11: 'Nature',
  12: 'Perception',
  13: 'Performance',
  14: 'Persuasion',
  15: 'Religion',
  16: 'Sleight of Hand',
  17: 'Stealth',
  18: 'Survival'
};


interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}


interface CharacterData {
  id: number;
  name: string;
  race_name: string;
  class: string;
  level: number;
  abilityScores: AbilityScores;
  abilityModifiers: {
    [key: string]: number;
  };
  prof_bonus?: number;
  imageUrl?: string;
  background?: string;
  alignment?: string;
  experiencePoints?: number;
  defaultProficiencies: string[];
  proficiency_ids: number[];
  current_hp?: number;
  max_hp?: number;
  temp_hp?: number;
  saving_throws: string[];
}


// This function can be placed outside the component
function calculateTotalModifier(modifier: number, isProficient: boolean, proficiencyBonus: number): number {
  return modifier + (isProficient ? proficiencyBonus : 0);
}

// This function can be placed outside the component
function determineSign(value: number): string {
  return value >= 0 ? '+' : '';
}

const CharacterSheet: React.FC = () => {
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const { characterId } = useParams<{ characterId: string }>();
  const [currentHP, setCurrentHP] = useState<number | null>(null);
  const [abilityModifiers, setAbilityModifiers] = useState<{ [key: string]: number }>({});
  const [maxHP, setMaxHP] = useState<number | null>(null);
  const [tempHP, setTempHP] = useState<number | null>(null);
  const [skillProficiencies, setSkillProficiencies] = useState<string[]>([]);
  const [rawInitiative, setRawInitiative] = useState<number | null>(null);
  const [totalInitiative, setTotalInitiative] = useState<number | null>(null);
 

  useEffect(() => {
    if (character) {
      setCurrentHP(character.current_hp || null);
      setMaxHP(character.max_hp || null);
      setTempHP(character.temp_hp || null);
    }
  }, [character]);
  

  useEffect(() => {
    if (rawInitiative !== null) {
        const dexMod = abilityModifiers['dexterity'] || 0;
        setTotalInitiative(dexMod + rawInitiative);
    }
  }, [rawInitiative, abilityModifiers]);


  useEffect(() => {
    async function fetchCharacter() {
      const response = await fetch(`http://localhost:5000/api/get-character/${characterId}`);
      
      const data: CharacterData = await response.json();
      setCharacter(data);
      setAbilityModifiers(data.abilityModifiers);
    }

    fetchCharacter();
  }, [characterId]);



  if (!character) {
    return <div>Loading...</div>; 
  }

  const armorClass = 10 + (abilityModifiers['dexterity'] || 0);
  const characterLanguages = RACE_LANGUAGES[character.race_name] || [];
  const characterProficientSkills = character.proficiency_ids.map(id => PROFICIENCY_SKILL_MAP[id]);
  console.log('abilityModifiers:', character.abilityModifiers);
  console.log(characterProficientSkills)


  return (
      <div className="p-3 bg-gray-500 rounded-xl shadow-lg w-full mx-auto min-h-full">
    
          {/* Header */}
          <div className="flex mb-6">
            <img src={character.imageUrl || "default_image_url"} alt="Character" className="w-32 h-32 rounded-full mr-6" />
            <div className="flex-grow">
              <h1 className="text-2xl font-bold mb-2 text-slate-100">{character.name || "Unnamed"}</h1>
              <div className="grid grid-cols-2 gap-2 text-slate-100">
                <span>Class: {character.class || "Unknown"}</span>
                <span>Background: {character.background || "Unknown"}</span>
                <span>Level: {character.level || "?"}</span>
                <span>Race: {character.race_name || "Unknown"}</span>
                <span>Alignment: {character.alignment || "Unknown"}</span>
                <span>Experience Points: {character.experiencePoints || 0}</span>
              </div>
            </div>
          </div>


      <div className="flex space-x-8 -space-y-4 mb-10">

        <div className="flex-grow grid grid-cols-6 gap-2">
        {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability, index) => {
          const abilityKeys: (keyof AbilityScores)[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
          const abilityScore = character.abilityScores && character.abilityScores[abilityKeys[index]] || 10;
          const modifier = abilityModifiers[abilityKeys[index].toLowerCase()] || 0;
          const sign = modifier >= 0 ? '+' : '';

          return (
            <div key={ability} className="flex flex-col items-center bg-indigo-100 p-3 rounded">
              <span className="text-sm font-semibold mb-4">{ability}</span>
              <span className="text-center text-sm w-16 p-2 mb-1 border-2 border-indigo-900 rounded-full">{sign}{modifier}</span>
              <span className="text-center w-16">{abilityScore}</span>
            </div>
          );
        })}
        </div>


          {/* Right Side: Proficiency, Inspiration, HP */}
        <div className="flex flex-row space-y-4 gap-4">
          <div className="flex flex-col h-auto items-center mt-4 bg-indigo-100 p-3 rounded">
              <span className="text-sm font-semibold mb-4">Proficiency Bonus</span>
              <span className="text-center text-sm w-14 p-2 mb-0 border-2 border-indigo-900 rounded-full">
                  {character.prof_bonus ? `+${character.prof_bonus}` : '?'}
              </span>
          </div>



            <div className="flex flex-col h-auto items-center mt-4 bg-indigo-100 p-3 rounded">
              <span className="text-sm font-semibold mb-6">Inspiration</span>
              <input type="number" placeholder="0" className="text-center w-16 p-2 mb-2 border rounded" />
            </div>

            <div className="flex flex-col items-center bg-indigo-100 p-4 rounded">
              <span className="text-sm font-semibold mb-4 -mt-1">Hit Points</span>
              <div className="flex space-x-2">
              <div className="flex flex-col items-center">
                <label className="text-sm mb-1" htmlFor="currentHP">Current</label>
                <input 
                  id="currentHP" 
                  type="text" 
                  value={currentHP || ''}
                  onChange={(e) => setCurrentHP(Number(e.target.value))}
                  className="text-center w-16 p-2 border rounded" 
                />
              </div>
              <div className="flex flex-col items-center">
                <label className="text-sm mb-1" htmlFor="maxHP">Max</label>
                <input 
                  id="maxHP" 
                  type="text" 
                  value={maxHP || ''}
                  onChange={(e) => setMaxHP(Number(e.target.value))}
                  className="text-center w-16 p-2 border rounded" 
                />
              </div>
              <div className="flex flex-col items-center">
                <label className="text-sm mb-1" htmlFor="tempHP">Temp</label>
                <input 
                  id="tempHP" 
                  type="text" 
                  value={tempHP || ''}
                  onChange={(e) => setTempHP(Number(e.target.value))}
                  className="text-center w-16 p-2 border rounded" 
                />
              </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-10 p-6 mb-6 ml-10">

          {/* Saving Throws */}
          <div className="flex flex-col space-y-2 bg-indigo-100 p-4 rounded">
            <span className="text-sm font-semibold mb-2">Saving Throws</span>
            <div className="grid grid-cols-2 gap-4">
                {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability, index) => {
                    const abilityKeys: (keyof AbilityScores)[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
                    const modifier = abilityModifiers[abilityKeys[index].toLowerCase()] || 0;
                    const isProficient = character?.saving_throws.includes(ability);
                    const totalModifier = calculateTotalModifier(modifier, isProficient, character?.prof_bonus || 0);
                    const sign = determineSign(totalModifier);

                    return (
                        <div key={ability} className="flex flex-col items-center mr-4">
                            <span className='text-sm mb-1'>{ability}</span>
                            <span className={`text-center text-sm w-14 p-1 rounded ${isProficient ? 'bg-green-200 border-2 border-green-800' : ''}`}>
                                {sign}{totalModifier}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>


          {/* Senses */}
          <div className="flex flex-col space-y-2 bg-indigo-100 p-4 rounded items-center">
            <h2 className="text-sm font-semibold mb-2 w-full">Senses</h2>
            {[
                {
                    name: 'Perception',
                    ability: 'wisdom',
                },
                {
                    name: 'Investigation',
                    ability: 'intelligence',
                },
                {
                    name: 'Insight',
                    ability: 'wisdom',
                },
            ].map(({ name, ability }) => {
                // Directly use the modifier from the state
                const modifier = abilityModifiers[ability] || 0;
                const proficiencyBonus = skillProficiencies.includes(name) ? character.prof_bonus || 0 : 0;
                // We add 10 as a base value for passive checks in D&D 5E
                const finalScore = 10 + modifier + proficiencyBonus;

                return (
                    <div key={name} className="flex flex-col space-y-1 items-center w-full">
                        <span className="text-sm mb-1">{name}</span>
                        <span className="text-sm font-bold">{finalScore}</span>
                    </div>
                );
            })}
        </div>


          {/* Defenses/Conditions */}
          <div className="flex flex-col space-y-2 bg-indigo-100 p-4 rounded">
              <h2 className="text-sm font-semibold mb-2">Defenses/Conditions</h2>
              <textarea placeholder="Defenses" className="w-full p-2 mb-2 border rounded" rows={2}></textarea>
              <textarea placeholder="Conditions" className="w-full p-2 border rounded" rows={2}></textarea>
          </div>


          <div className="flex flex-col space-y-2 bg-indigo-100 p-4 gap-4 rounded">
            <h2 className="text-sm font-semibold -mb-2">Initiative</h2>
            <div className="flex space-x-2 items-center justify-around">
              <input
                type="text"
                placeholder="Roll"
                className="w-1/3 p-2 border rounded"
                value={rawInitiative || ''}
                onChange={(e) => {
                    // Convert the entered text to a number
                    const roll = Number(e.target.value);
                    // Only update state if it's a valid number
                    if (!isNaN(roll)) {
                        setRawInitiative(roll);
                    }
                }}
              />

            <div className="flex justify-between w-1/5">
                <span className="text-sm -ml-8">=</span>
                <span className="text-lg mr-4">{totalInitiative || ''}</span>
            </div>

            </div>
              <h2 className="text-sm font-semibold mb-2">Armor Class</h2>
            <div className="flex flex-col text-xl space-y-1 items-center w-full">
                {armorClass}
            </div>
          </div>

        </div>

          <div className="w-full mb-6">
            <CharacterMainSection />
          </div>
            
          <div className="flex space-x-6">

            {/* Left Section: Proficiencies, Armor, etc. */}
            <div className="flex flex-col space-y-6 w-1/3">
              
              <div className="bg-indigo-100 p-4 rounded">
                  <h3 className="text-sm font-semibold mb-2">Proficiencies</h3>
                  <ul>
                      {character.defaultProficiencies.map((proficiency, idx) => (
                          <li key={idx} className="mb-2">{proficiency}</li>
                      ))}    
                  </ul>
              </div>

              <div className="bg-indigo-100 p-4 rounded">
                  <h3 className="text-sm font-semibold mb-2">Languages</h3>
                  <ul>
                      {characterLanguages.map(language => (
                          <li key={language} className="mb-2">{language}</li>
                      ))}
                  </ul>
              </div>
          </div>





            {/* Right Section: Skills */}
            <div className="flex-grow bg-indigo-100 p-12 rounded">
              <h2 className="text-base font-semibold mb-20">Skills</h2>
              <div className="grid grid-cols-3 ml-20 gap-4">
                  {[
                      ['Acrobatics', 'DEX'], ['Animal Handling', 'WIS'], ['Arcana', 'INT'],
                      ['Athletics', 'STR'], ['Deception', 'CHA'], ['History', 'INT'],
                      ['Insight', 'WIS'], ['Intimidation', 'CHA'], ['Investigation', 'INT'],
                      ['Medicine', 'WIS'], ['Nature', 'INT'], ['Perception', 'WIS'], 
                      ['Performance', 'CHA'], ['Persuasion', 'CHA'], ['Religion', 'INT'], 
                      ['Sleight of Hand', 'DEX'], ['Stealth', 'DEX'], ['Survival', 'WIS']
                    ].map(([skill, mod]) => {
                      const ability = ABILITY_MAP[mod];
                      const abilityModifier = character.abilityModifiers[ability] || 0;
                      
                      let skillModifier = abilityModifier;
                      const isProficient = characterProficientSkills.includes(skill);
                  
                      if (isProficient) {
                          skillModifier += character.prof_bonus || 0;
                      }
                  
                      return (
                          <div key={skill} className="flex flex-col items-start">
                              <span className="text-sm font-semibold mb-1">{skill}</span>
                              <span className="text-xs font-medium mb-1">{mod}</span>
                              <span className={`text-center text-sm w-14 p-1 rounded ${isProficient ? 'bg-green-200 border-2 border-green-800' : ''}`}>
                                  {skillModifier >= 0 ? `+${skillModifier}` : skillModifier}
                              </span>
                          </div>
                      );
                  })}
              </div>
          </div>
          </div>
      </div>
  );
};

export default CharacterSheet;
