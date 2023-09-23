import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CharacterMainSection from './CharSheetContent';
import './CharSheet.css';


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
  prof_bonus?: number;
  imageUrl?: string;
  background?: string;
  alignment?: string;
  experiencePoints?: number;
  current_hp?: number;
  max_hp?: number;
  temp_hp?: number;
  saving_throws: string[];
}


const CharacterSheet: React.FC = () => {
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const { characterId } = useParams<{ characterId: string }>();
  const [currentHP, setCurrentHP] = useState<number | null>(null);
  const [maxHP, setMaxHP] = useState<number | null>(null);
  const [tempHP, setTempHP] = useState<number | null>(null);

  useEffect(() => {
    if (character) {
      setCurrentHP(character.current_hp || null);
      setMaxHP(character.max_hp || null);
      setTempHP(character.temp_hp || null);
    }
  }, [character]);

  useEffect(() => {
    async function fetchCharacter() {
      const response = await fetch(`http://localhost:5000/api/get-character/${characterId}`);
      
      const data: CharacterData = await response.json();
      setCharacter(data);
    }

    fetchCharacter();
  }, [characterId]);

  if (!character) {
    return <div>Loading...</div>; 
  }


  return (
      <div className="p-3 bg-gray-500 rounded-xl shadow-lg w-full mx-auto min-h-full">
    
          {/* Header */}
          <div className="flex mb-6">
            <img src={character.imageUrl || "default_image_url"} alt="Character" className="w-32 h-32 rounded-full mr-6" />
            <div className="flex-grow">
              <h1 className="text-2xl font-bold mb-2 text-slate-100">{character.name || "Unnamed"}</h1>
              <div className="grid grid-cols-2 gap-2 text-slate-100">
                <span>Class & Level: {character.class || "Unknown"} {character.level || "?"}</span>
                <span>Background: {character.background || "Unknown"}</span>
                <span></span>
                <span>Race: {character.race_name || "Unknown"}</span>
                <span>Alignment: {character.alignment || "Unknown"}</span>
                <span>Experience Points: {character.experiencePoints || 0}</span>
              </div>
            </div>
          </div>


        <div className="flex space-x-8 -space-y-4 mb-10">

        <div className="flex-grow grid grid-cols-6 gap-2">
          {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability, index) => {
            // Extract the ability score value
            const abilityKeys: (keyof AbilityScores)[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
            const abilityScore = character.abilityScores && character.abilityScores[abilityKeys[index]] || 10;
                        // Calculate the modifier
            const modifier = Math.floor((abilityScore - 10) / 2);
            // Determine the sign for the modifier
            const sign = modifier >= 0 ? '+' : '';

            return (
      <div key={ability} className="flex flex-col items-center bg-indigo-100 p-3 rounded">
        <span className="text-sm font-semibold mb-4">{ability}</span>
        <span className="text-center text-sm w-16 p-2 mb-1 border-2 border-indigo-900 rounded-full">{sign}{modifier}</span> {/* rounded-full makes the border circular */}
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
              const abilityScore = character?.abilityScores?.[abilityKeys[index]] || 10;

              const modifier = Math.floor((abilityScore - 10) / 2);

              // Checking proficiency using the includes method
              const isProficient = character?.saving_throws.includes(ability);

              const totalModifier = modifier + (isProficient ? character?.prof_bonus || 0 : 0);

              const sign = totalModifier >= 0 ? '+' : '';

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
            {['Perception', 'Investigation', 'Insight'].map((sense) => (
              <div key={sense} className="flex flex-col space-y-1 items-center w-full">
                <span className="text-sm mb-1">{sense}</span>
                <input type="number" className="w-1/2 p-2 border rounded" />
              </div>
            ))}
          </div>

          {/* Defenses/Conditions */}
          <div className="flex flex-col space-y-2 bg-indigo-100 p-4 rounded">
              <h2 className="text-sm font-semibold mb-2">Defenses/Conditions</h2>
              <textarea placeholder="Defenses" className="w-full p-2 mb-2 border rounded" rows={2}></textarea>
              <textarea placeholder="Conditions" className="w-full p-2 border rounded" rows={2}></textarea>
          </div>


          {/* Initiative and Armor Class */}
          <div className="flex flex-col space-y-2 bg-indigo-100 p-4 gap-4 rounded">
            <h2 className="text-sm font-semibold -mb-2">Initiative</h2>
            <input type="number" placeholder="+0" className="w-full p-2 border rounded mb-4" />
            <h2 className="text-sm font-semibold mb-2">Armor Class</h2>
            <input type="number" placeholder="AC" className="w-full p-2 border rounded" />
          </div>
        </div>

          <div className="w-full mb-6">
            <CharacterMainSection />
          </div>
            
          <div className="flex space-x-6">

            {/* Left Section: Proficiencies, Armor, etc. */}
            <div className="flex flex-col space-y-6 w-1/3">
                <h2 className="text-sm text-slate-100 font-semibold mb-2">Proficiencies and Languages</h2>
              {['Armor', 'Weapons', 'Tools', 'Languages'].map((item) => (
                <div key={item} className="bg-indigo-100 p-4 rounded">
                  <h2 className="text-sm font-semibold mb-2">{item}</h2>
                  <textarea className="w-full p-2 border rounded" rows={2}></textarea>
                </div>
              ))}
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
                ].map(([skill, mod]) => (
                  <div key={skill} className="flex flex-col items-start">
                    <span className="text-sm font-semibold mb-1">{skill}</span>
                    <span className="text-xs font-medium mb-1">{mod}</span>
                    <input type="number" placeholder="+0" className="text-center w-14 p-1 border rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
  );
};

export default CharacterSheet;
