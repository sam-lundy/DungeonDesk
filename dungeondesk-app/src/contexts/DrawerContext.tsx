import { FC, createContext, useContext, useState } from 'react';

type DrawerContextType = {
    drawerOpen: boolean;
    setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  };

interface DrawerProviderProps {
    children: React.ReactNode;
}
  
const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

// Create a context
export const DrawerProvider: FC<DrawerProviderProps> = ({ children }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
  
    return (
        <DrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
            {children}
        </DrawerContext.Provider>
    );
};

// Custom hook to use the context
export const useDrawer = () => {
    const context = useContext(DrawerContext);
    if (!context) {
      throw new Error("useDrawer must be used within a DrawerProvider");
    }
    return context;
  };
  
