import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CharacterMainSection from './CharSheetContent';
import './CharSheet.css';
import axios from 'axios';


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
  inspiration?: number;
  imageUrl?: string;
  background?: string;
  alignment?: string;
  defaultProficiencies: string[];
  proficiency_ids: number[];
  current_hp?: number;
  max_hp?: number;
  temp_hp?: number;
  defenses?: string;
  conditions?: string;
  saving_throws: string[];
}


function calculateTotalModifier(modifier: number, isProficient: boolean, proficiencyBonus: number): number {
  return modifier + (isProficient ? proficiencyBonus : 0);
}


function determineSign(value: number): string {
  return value >= 0 ? '+' : '';
}


const CharacterSheet: React.FC = () => {
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const { characterId } = useParams<{ characterId: string }>();
  const [currentHP, setCurrentHP] = useState<number | null>(null);
  const validCurrentHP = currentHP !== null ? currentHP : 0;
  const [abilityModifiers, setAbilityModifiers] = useState<{ [key: string]: number }>({});
  const [maxHP, setMaxHP] = useState<number | null>(null);
  const validMaxHP = maxHP as number;
  const [tempHP, setTempHP] = useState<number | null>(null);
  const [skillProficiencies, setSkillProficiencies] = useState<string[]>([]);
  const [rawInitiative, setRawInitiative] = useState<number | null>(null);
  const [totalInitiative, setTotalInitiative] = useState<number | null>(null);
  const [inspiration, setInspiration] = useState<number | null>(null);
  const [showSaveInspiration, setShowSaveInspiration] = useState<boolean>(false);
  const [showSaveCurrent, setShowSaveCurrent] = useState<boolean>(false);
  const [showSaveTemp, setShowSaveTemp] = useState<boolean>(false);
  const [showSaveDefenses, setShowSaveDefenses] = useState<boolean>(false);
  const [showSaveConditions, setShowSaveConditions] = useState<boolean>(false);
  const [localInspiration, setLocalInspiration] = useState<number | string>('');
  const [localDefenses, setLocalDefenses] = useState<string>('');
  const [localConditions, setLocalConditions] = useState<string>('');
  const [initialDefenses, setInitialDefenses] = useState<string>('');
  const [initialConditions, setInitialConditions] = useState<string>('');
  const [localBackground, setLocalBackground] = useState(character?.background || 'No background set');
  const [showSaveBackground, setShowSaveBackground] = useState(false);
  const [localAlignment, setLocalAlignment] = useState(character?.alignment || 'Neutral');
  const [showSaveAlignment, setShowSaveAlignment] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  
  useEffect(() => {
    if (character) {
      setCurrentHP(character.current_hp || null);
      setMaxHP(character.max_hp || null);
      setTempHP(character.temp_hp || null);
      setLocalInspiration(character.inspiration || '');
      setLocalDefenses(character.defenses || '');
      setLocalConditions(character.conditions || '');
      setInitialDefenses(character.defenses || '');
      setInitialConditions(character.conditions || '');
      setLocalBackground(character?.background || 'No background set');
      setLocalAlignment(character?.alignment || 'Neutral');
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


  const handleFileChangeAndUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
        uploadImage();
    }
};


  const uploadImage = async () => {
    if (!selectedFile || !characterId) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('character_id', characterId);

    try {
        const response = await axios.post('http://localhost:5000/api/character-avatar-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.url && character) {
          const updatedCharacter = { ...character, imageUrl: response.data.url };
          setCharacter(updatedCharacter);
          alert("Image uploaded successfully!");
      }
      
    } catch (error) {
        console.error("Error uploading the image:", error);
    }
};



  const handleSaveBackground = async () => {
    try {
        const response = await axios.post(`http://localhost:5000/api/edit-character/${characterId}`, {
            background: localBackground,
        });
        if (response.data.message) {
            alert(response.data.message);
        }

        setShowSaveBackground(false);
    } catch (error) {
        // Handle errors from the Axios request
        console.error("Error saving background:", error);
        alert("An error occurred while saving the background. Please try again.");
    }
};


  const handleSaveInspiration = async () => {
    const response = await axios.post(`http://localhost:5000/api/edit-character/${characterId}`, {
      inspiration: inspiration,
    });

    if (response.data.message) {
      alert(response.data.message);
    }
    setShowSaveInspiration(false); // Hide the save button after saving
  };


  const handleCurrentHPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setCurrentHP(value);
    setShowSaveCurrent(true);
  };
  

  const handleTempHPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setTempHP(value);
    setShowSaveTemp(true);
  };
  

  const handleSaveCurrentHP = async () => {
    if (validCurrentHP > validMaxHP) {
      alert("Current HP cannot exceed Max HP.");
      return;
  }
  const response = await axios.post(`http://localhost:5000/api/edit-character/${characterId}`, {
    currentHP: currentHP,
  });

  // Handle the response (e.g., notify the user of success or error)
  if (response.data.message) {
    alert(response.data.message);
  }
    setShowSaveCurrent(false); // Hide the save button after saving
  };
  

  const handleSaveTempHP = async () => {
    const response = await axios.post(`http://localhost:5000/api/edit-character/${characterId}`, {
      tempHP: tempHP,
    });

    // Handle the response (e.g., notify the user of success or error)
    if (response.data.message) {
      alert(response.data.message);
    }
    setShowSaveTemp(false); // Hide the save button after saving
  };


  const handleDefensesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalDefenses(value);
    setShowSaveDefenses(value !== character?.defenses);
  };

  const handleDefensesBlur = () => {
    if (!showSaveDefenses) {
      setLocalDefenses(initialDefenses);
    }
  };  
  

  const handleConditionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalConditions(value);
    setShowSaveConditions(value !== character?.conditions);
  };


  const handleConditionsBlur = () => {
    if (!showSaveConditions) {
      setLocalDefenses(initialConditions);
    }
  };
  


  const handleSaveDefenses = async () => {
    try {
        const response = await axios.post(`http://localhost:5000/api/edit-character/${characterId}`, {
            defenses: localDefenses,
        });

        // Check for a successful response
        if (response.status === 200 && response.data.message) {
            alert(response.data.message);
        } else {
            // Handle other statuses or unexpected responses
            alert("Failed to save defenses. Please try again.");
        }
    } catch (error) {
        // Handle errors from the Axios request
        console.error("Error saving defenses:", error);
        alert("An error occurred while saving defenses. Please try again.");
    }

    setShowSaveDefenses(false); // Hide the save button after saving
};


  const handleSaveConditions = async () => {
    const response = await axios.post(`http://localhost:5000/api/edit-character/${characterId}`, {
      conditions: localConditions,
    });

    // Handle the response (e.g., notify the user of success or error)
    if (response.data.message) {
      alert(response.data.message);
    }
    setShowSaveConditions(false); // Hide the save button after saving
  };
  

  const handleInspirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || value === '0' || value === '1') {
      setLocalInspiration(value);
      setShowSaveInspiration(true);
    } else {
      setShowSaveInspiration(false);
    }
  };


  const handleSaveAlignment = async () => {
    const response = await axios.post(`http://localhost:5000/api/edit-character/${characterId}`, {
      alignment: localAlignment,
    });
    if (response.data.message) {
      alert(response.data.message);
    }
    setShowSaveAlignment(false);
  };


  if (!character) {
    return <div>Loading...</div>; 
  }

  const armorClass = 10 + (abilityModifiers['dexterity'] || 0);
  const characterLanguages = RACE_LANGUAGES[character.race_name] || [];
  const characterProficientSkills = character.proficiency_ids.map(id => PROFICIENCY_SKILL_MAP[id]);


  return (
    <div className="p-3 bg-gray-500 rounded-lg shadow-lg w-full mx-auto min-h-full character-sheet-container">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
        <label htmlFor="imageUpload" className="cursor-pointer">
            <img 
                src={character.imageUrl || "default_image_url"} 
                alt="Character" 
                className="w-32 h-32 rounded-full"
            />
        </label>
        <input 
            id="imageUpload" 
            type="file" 
            className="hidden-input" 
            onChange={handleFileChangeAndUpload}
        />


            <h1 className="text-2xl font-bold mb-4 text-slate-100">{character.name || "Unnamed"}</h1>
            
            <div className="grid grid-cols-2 gap-4 w-full text-slate-100">
                {/* Left Column */}
                <div>
                    <div>Class: {character.class || "Unknown"}</div>
                    <div>Level: {character.level || "?"}</div>
                    <div>
                        Alignment: 
                        <select 
                            value={localAlignment} 
                            onChange={(e) => {
                                setLocalAlignment(e.target.value);
                                setShowSaveAlignment(true);
                            }}
                            className="bg-gray-500 text-white border-none text-center ml-2"
                        >
                            <option value="Lawful Good">Lawful Good</option>
                            <option value="Neutral Good">Neutral Good</option>
                            <option value="Chaotic Good">Chaotic Good</option>
                            <option value="Lawful Neutral">Lawful Neutral</option>
                            <option value="Neutral">Neutral</option>
                            <option value="Chaotic Neutral">Chaotic Neutral</option>
                            <option value="Lawful Evil">Lawful Evil</option>
                            <option value="Neutral Evil">Neutral Evil</option>
                            <option value="Chaotic Evil">Chaotic Evil</option>
                        </select>
                    </div>
                    {showSaveAlignment && (
                        <div>
                            <button 
                                onClick={handleSaveAlignment}
                                className="mt-2 p-1 bg-indigo-900 text-white text-xs rounded"
                            >
                                Save Alignment
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div>
                    <div>Race: {character.race_name || "Unknown"}</div>
                    <div>
                        Background: 
                        <select 
                            value={localBackground} 
                            onChange={(e) => {
                                setLocalBackground(e.target.value);
                                setShowSaveBackground(true);
                            }}
                            className="bg-gray-500 text-white border-none text-center ml-2"
                        >
                            <option value="No background set">No background set</option>
                            <option value="Acolyte">Acolyte</option>
                            <option value="Charlatan">Charlatan</option>
                            <option value="Criminal">Criminal</option>
                            <option value="Entertainer">Entertainer</option>
                            <option value="Folk Hero">Folk Hero</option>
                            <option value="Guild Artisan">Guild Artisan</option>
                            <option value="Hermit">Hermit</option>
                            <option value="Noble">Noble</option>
                            <option value="Outlander">Outlander</option>
                            <option value="Sage">Sage</option>
                            <option value="Sailor">Sailor</option>
                            <option value="Soldier">Soldier</option>
                            <option value="Urchin">Urchin</option>
                        </select>
                    </div>
                    {showSaveBackground && (
                        <div>
                            <button 
                                onClick={handleSaveBackground}
                                className="mt-2 p-1 bg-indigo-900 text-white text-xs rounded"
                            >
                                Save Background
                            </button>
                        </div>
                    )}
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
            <input
              type="number"
              placeholder="0"
              value={localInspiration}
              onChange={handleInspirationChange}
              className="text-center w-16 p-2 mb-2 border rounded"
              min="0"
              max="1"
            />

            {showSaveInspiration && (
              <button onClick={handleSaveInspiration} className="mt-2 p-1 bg-indigo-900 text-white text-sm rounded">
                Save
              </button>
            )}
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
                  onChange={handleCurrentHPChange}
                  className="text-center w-16 p-2 mb-2 border rounded" 
                />
                {showSaveCurrent && (
                  <button onClick={handleSaveCurrentHP} className="mt-2 p-1 bg-indigo-900 text-white text-sm rounded">
                    Save
                  </button>
                )}
              </div>
              <div className="flex flex-col items-center">
                <label className="text-sm mb-1">Max</label>
                <span className="text-center w-16 p-2 border rounded">
                  {maxHP || '-'}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <label className="text-sm mb-1" htmlFor="tempHP">Temp</label>
                <input 
                  id="tempHP" 
                  type="text" 
                  value={tempHP || ''}
                  onChange={handleTempHPChange}
                  className="text-center w-16 p-2 mb-2 border rounded" 
                />
                {showSaveTemp && (
                  <button onClick={handleSaveTempHP} className="mt-2 p-1 bg-indigo-900 text-white text-sm rounded">
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="flex space-x-10 p-6 mb-6 ml-10">

          {/* Saving Throws */}
          <div className="flex flex-col space-y-2 bg-indigo-100 p-4 ml-8 rounded">
            <span className="text-sm font-semibold mb-2">Saving Throws</span>
            <div className="grid grid-cols-2 gap-4">
                {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability, index) => {
                    const abilityKeys: (keyof AbilityScores)[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
                    const modifier = abilityModifiers[abilityKeys[index].toLowerCase()] || 0;
                    const isAbilityProficient = character?.saving_throws.includes(ability);
                    const totalModifier = calculateTotalModifier(modifier, isAbilityProficient, character?.prof_bonus || 0);
                    const sign = determineSign(totalModifier);

                    return (
                        <div key={ability} className="flex flex-col items-center mr-4">
                            <span className='text-sm mb-1'>{ability}</span>
                            <span className={`text-center text-sm w-14 p-1 rounded ${isAbilityProficient ? 'bg-green-200 border-2 border-green-800' : ''}`}>
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
            <textarea
              placeholder="Defenses" 
              className="w-full p-2 mb-2 border rounded" 
              rows={2}
              value={localDefenses}
              onChange={handleDefensesChange}
              onBlur={handleDefensesBlur}
              maxLength={255}
            />
            {showSaveDefenses && (
              <button onClick={handleSaveDefenses} className="mt-2 p-1 bg-indigo-900 text-white text-sm rounded">
                Save Defenses
              </button>
            )}
            <textarea 
              placeholder="Conditions" 
              className="w-full p-2 mb-2 border rounded" 
              rows={2}
              value={localConditions}
              onChange={handleConditionsChange}
              onBlur={handleConditionsBlur}
              maxLength={255}
            />
            {showSaveConditions && (
              <button onClick={handleSaveConditions} className="mt-2 p-1 bg-indigo-900 text-white text-sm rounded">
                Save Conditions
              </button>
            )}
          </div>


          <div className="flex flex-col space-y-2 bg-indigo-100 p-4 gap-4 rounded">
            <h2 className="text-sm font-semibold -mb-2">Initiative</h2>
            <div className="flex space-x-2 items-center justify-around">
              <input
                type="text"
                placeholder="Roll d20"
                className="w-1/2 p-2 border rounded"
                value={rawInitiative || ''}
                onChange={(e) => {
                  // If the input is empty, reset rawInitiative and totalInitiative
                  if (e.target.value.length === 0) {
                    setRawInitiative(null);
                    setTotalInitiative(null);
                    return;
                }
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
            <div className="flex-grow bg-indigo-100 p-4 rounded">
            <h2 className="text-base font-semibold mb-20">Skills</h2>
              <div className="grid grid-cols-3 ml-8 gap-4">
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
                      const isSkillProficient = characterProficientSkills.includes(skill);
                  
                      if (isSkillProficient) {
                          skillModifier += character.prof_bonus || 0;
                      }
                      
                      return (
                          <div key={skill} className="flex flex-col items-center">
                              <span className="text-sm font-semibold mb-1">{skill}</span>
                              <span className="text-xs font-medium mb-1">{mod}</span>
                              <span className={`text-center text-sm w-14 p-1 rounded ${isSkillProficient ? 'bg-green-200 border-2 border-green-800' : ''}`}>
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
