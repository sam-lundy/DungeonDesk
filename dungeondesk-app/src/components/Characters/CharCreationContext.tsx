import { createContext, useState, useContext, ReactNode } from "react";

interface CharacterData {
    name: string;
    hitpointType: string;
    race: string;
    class: string;
    abilities: number[];
    equipment: string[]
}

const defaultCharacterData: CharacterData = {
    name: '',
    hitpointType: '',
    race: '',
    class: '',
    abilities: [],
    equipment: []
  };

interface CharacterCreationProviderProps {
    children: ReactNode;
}

const CharacterCreationContext = createContext<{ characterData: CharacterData, setCharacterData: React.Dispatch<React.SetStateAction<CharacterData>> } | undefined>(undefined);

export const useCharacterCreation = () => {
  const context = useContext(CharacterCreationContext);
  if (!context) {
    throw new Error("useCharacterCreation must be used within a CharacterCreationProvider");
  }
  return context;
};

export const CharacterCreationProvider: React.FC<CharacterCreationProviderProps> = ({ children }) => {
  const [characterData, setCharacterData] = useState<CharacterData>(defaultCharacterData);

  return (
    <CharacterCreationContext.Provider value={{ characterData, setCharacterData }}>
      {children}
    </CharacterCreationContext.Provider>
  );
};