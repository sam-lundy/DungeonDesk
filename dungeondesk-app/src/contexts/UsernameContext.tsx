import { createContext, useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';


type UsernamesContextType = {
    usernames: { [uid: string]: string };
    setUsernames: React.Dispatch<React.SetStateAction<{ [uid: string]: string }>>;
  };

type UsernamesProviderProps = {
    children: React.ReactNode;
};


export const UsernamesContext = createContext<UsernamesContextType | null>(null);

export const UsernamesProvider: React.FC<UsernamesProviderProps> = ({ children }) => {
const [usernames, setUsernames] = useState<{ [uid: string]: string }>({});
const auth = getAuth();


useEffect(() => {
    if (auth.currentUser) {
    // Fetch the username for the authenticated user from your backend
    fetch(`http://localhost:5000/api/get-username?uid=${auth.currentUser.uid}`)
        .then(res => res.json())
        .then(data => {
        if (data.username) {
            setUsernames(prevUsernames => ({ ...prevUsernames, [auth.currentUser!.uid]: data.username }));
        }
        });
    }
}, [auth.currentUser]);


    return (
        <UsernamesContext.Provider value={{ usernames, setUsernames }}>
        {children}
        </UsernamesContext.Provider>
    );
};
  