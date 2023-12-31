import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { auth } from './firebaseConfig';


interface ExtendedUser {
    uid: string;
    email: string | null;
    username?: string;
    dateCreated?: string;
    timezone?: string;
    location?: string;
    bio?: string;
    profilePicURL?: string;
}

interface AuthContextType {
    currentUser: ExtendedUser | null;
}

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>({
    currentUser: null
});


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
    const [loading, setLoading] = useState(true);

    const isUserDataEqual = (a: ExtendedUser, b: ExtendedUser): boolean => {
        return JSON.stringify(a) === JSON.stringify(b);
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async user => {
            if (user) {
                const extendedInfo = await fetchUserFromDatabase(user.uid);
    
                if (extendedInfo) {
                    const newUserData = {
                        uid: user.uid,
                        email: user.email,
                        username: extendedInfo.username,
                        dateCreated: extendedInfo.dateCreated,
                        timezone: extendedInfo.timezone,
                        location: extendedInfo.location,
                        bio: extendedInfo.bio,
                        profilePicURL: extendedInfo.profile_image,
                    };
    
                    setCurrentUser(prevUser => {
                        if (!prevUser || !isUserDataEqual(newUserData, prevUser)) {
                            return newUserData;
                        }
                        return prevUser;
                    });
                }
    
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
    
        return () => unsubscribe();
    }, []);
    


    const contextValue = useMemo(() => ({ currentUser }), [currentUser]);


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};


async function fetchUserFromDatabase(uid: string): Promise<any> {
    const endpoint = `http://localhost:5000/api/get-profile`;

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'uid': uid,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 404) {
                console.log("User profile not found. This is expected for new users.");
                return null;
            } else {
                throw new Error('Failed to fetch user from database.');
            }
        }

        return data;

    } catch (error) {
        console.error("There was an error fetching the user's data:", error);
        throw error;
    }
}
