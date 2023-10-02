import { createContext, useContext, FC } from 'react';
import { ref, push } from 'firebase/database';
import { getDatabase } from 'firebase/database';


type SystemMessageContextType = {
    sendSystemMessage: (message: string) => void;
};


interface SystemMessageProviderProps {
    children: React.ReactNode;
}


export const SystemMessageContext = createContext<SystemMessageContextType | undefined>(undefined);


export const useSystemMessage = () => {
    const context = useContext(SystemMessageContext);
    if (!context) {
        throw new Error('useSystemMessage must be used within a SystemMessageProvider');
    }
    return context;
};


export const SystemMessageProvider: FC<SystemMessageProviderProps> = ({ children }) => {
    const db = getDatabase();
    
    const sendSystemMessage = (message: string) => {
        console.log('sendSystemMessage called with message:', message);
        const messagesRef = ref(db, 'messages');
        const systemMessage = {
            text: message,
            userId: 'SYSTEM',
        };
        push(messagesRef, systemMessage);
    };

    return (
        <SystemMessageContext.Provider value={{ sendSystemMessage }}>
            {children}
        </SystemMessageContext.Provider>
    );
};
