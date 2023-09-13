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

    // Helper function to check if two user objects are the same
    const isUserDataEqual = (a: ExtendedUser, b: ExtendedUser): boolean => {
        return JSON.stringify(a) === JSON.stringify(b);
    };

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = auth.onAuthStateChanged(async user => {
            if (user) {
                // If currentUser is null (indicating no user was previously logged in during this session)
                if (!currentUser) {
                    const extendedInfo = await fetchUserFromDatabase(user.uid);
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
                    setCurrentUser(newUserData);
                } 
                // If you still want to check if user data has changed and then update, you can do so here
                // else if (!isUserDataEqual(newUserData, currentUser)) {
                //     setCurrentUser(newUserData);
                // }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
    
        return () => unsubscribe();
    }, []);


    const contextValue = useMemo(() => ({ currentUser }), [currentUser]);


    if (loading) {
        return <div>Loading...</div>; // or return a spinner or other loading indicator
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

        if (!response.ok) {
            throw new Error('Failed to fetch user from database.');
        }


        const data = await response.json();
        return data;

    } catch (error) {
        console.error("There was an error fetching the user's data:", error);
        return {};
    }
}
