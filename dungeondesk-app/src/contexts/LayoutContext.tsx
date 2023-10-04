import React, { createContext, useContext, useState, FC } from 'react';

// Define the shape of the context
interface LayoutContextType {
    drawerOpen: boolean;
    setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type LayoutProviderProps = {
    children: React.ReactNode;
};

// Create a context for the layout
const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const LayoutProvider: FC<LayoutProviderProps> = ({ children }) => {
    const [drawerOpen, setDrawerOpen] = useState<boolean>(true);

    return (
        <LayoutContext.Provider value={{ drawerOpen, setDrawerOpen }}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayoutContext() {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error("useLayoutContext must be used within a LayoutProvider");
    }
    return context;
}

export { LayoutProvider };
