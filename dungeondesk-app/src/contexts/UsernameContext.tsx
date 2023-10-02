import { FC, createContext, useState, ReactNode } from 'react';

type UsernamesContextType = {
    usernames: { [key: string]: string };
    setUsername: (uid: string, username: string) => void;
};

export const UsernamesContext = createContext<UsernamesContextType | undefined>(undefined);

type UsernamesProviderProps = {
    children: ReactNode;
};

export const UsernamesProvider: FC<UsernamesProviderProps> = ({ children }) => {
    const [usernames, setUsernames] = useState<{ [key: string]: string }>({
        SYSTEM: 'System'
    });
    

    const setUsername = (uid: string, username: string) => {
        setUsernames(prev => ({ ...prev, [uid]: username }));
    };

    return (
        <UsernamesContext.Provider value={{ usernames, setUsername }}>
            {children}
        </UsernamesContext.Provider>
    );
};
