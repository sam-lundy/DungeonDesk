import React, { FC, useContext, useState, useEffect, ChangeEvent } from 'react';
import { AuthContext } from '../firebase/firebase.auth.tsx';
import { auth } from '../firebase/firebaseConfig.ts';
import { 
    Container, Typography, TextField, Button, Avatar, Box
} from '@mui/material';
import './UserProfile.css';
import { sendPasswordResetEmail } from "firebase/auth";


const UserProfile: FC<{}> = () => {
    console.log("Rendering UserProfile");
    const [timezone, setTimezone] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const authContext = useContext(AuthContext);
    const currentUser = authContext?.currentUser;
    const defaultProfilePicURL = "https://exionweb.s3.amazonaws.com/default_user_icon.png";
    const [profilePicURL, setProfilePicURL] = useState<string>(defaultProfilePicURL);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    

    useEffect(() => {
        async function fetchUserData() {
            try {
                const headers: Record<string, string> = {};

                if (currentUser?.uid) {
                    headers.uid = currentUser.uid;
                }

                const response = await fetch('http://localhost:5000/api/get-profile', {
                    headers: headers
                });
                
                const data = await response.json();
                if (data.success) {
                    setProfilePicURL(data.profile_image);
                    setTimezone(data.timezone || '');
                    setLocation(data.location || '');
                    setBio(data.bio || '');
                }
            } catch (error) {
                console.error("There was an error fetching the user data:", error);
            }
        }

        if (!currentUser) return;
        fetchUserData();
    }, [currentUser]);


    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 5000);
    
            return () => clearTimeout(timer);
        } else {
            setIsVisible(true);
        }
    }, [message]);
    

    const handleUpdate = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!currentUser?.uid) {
            console.error("No UID found for the current user.");
            return;
        }

        const updateData = {
            timezone: timezone,
            location: location,
            bio: bio,
            profile_pic: profilePicURL === defaultProfilePicURL ? 'default' : profilePicURL
        };

        try {
            const response = await fetch('http://localhost:5000/api/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'uid': currentUser.uid
                },
                body: JSON.stringify(updateData)
            });
            const data = await response.json();
    
            if (data.success) {
                console.log("Profile updated successfully");
            } else {
                console.error("Failed to update profile:", data.error);
            }
        } catch (error) {
            console.error("There was an error updating the profile:", error);
        }
    };


    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0];
        setSelectedFile(file);
    };


    const handleFileUpload = async () => {
        if (!selectedFile) return;
    
        // File type validation
        const validTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!validTypes.includes(selectedFile.type)) {
            alert("Please select a valid image type (png, jpeg, jpg).");
            return;
        }
    
        // File size validation
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (selectedFile.size > maxSize) {
            alert("File size should not exceed 2MB.");
            return;
        }
    
        const formData = new FormData();
        formData.append('file', selectedFile);
    
        try {
            const response = await fetch('http://localhost:5000/api/avatar-upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            setProfilePicURL(data.url);
        } catch (error) {
            console.error("There was an error uploading the file:", error);
        }
    };


    const handleResetPassword = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (currentUser && currentUser.email) {
            const emailToReset = currentUser.email;

        try {
          await sendPasswordResetEmail(auth, currentUser.email);
          setMessage("Password reset email sent!");

        } catch (error) {
          setMessage(`Error: ${(error as Error).message}`);
        }
        
        } else {
            console.error("No email found for the current user.");
        }
      };
    

    const handleChangeUsername = () => {
        console.log('Change username clicked');
        // Implement the logic or navigate to a change username page.
    };
    
    const handleDeleteAccount = () => {
        console.log('Delete account clicked');
        // Implement the logic to delete the user's account.
    };
    
    

    return (
        <div className="flex flex-wrap items-center mt-12 w-full">
            <h4 className="w-full mb-12 text-center text-2xl">Edit Profile</h4>


            <div className="w-1/2 border border-gray-700 rounded p-10 mt-4">
                <h6 className="text-center">Username: {currentUser?.username}</h6>
                <p className="text-center">Email: {currentUser?.email}</p>
                <p className="text-center text-sm">Member since: {currentUser?.dateCreated}</p>
            </div>


            {/* Profile Picture Box */}
            <div className="w-1/2 p-5">
                <div className="flex flex-col items-center p-4 border border-gray-700 rounded mt-4">
                    <img 
                        alt="User Profile Picture" 
                        src={profilePicURL} 
                        className="w-20 h-20 mb-5"
                    />
                    <input type="file" onChange={handleFileChange} />
                    {selectedFile && (
                        <button 
                            className="mt-2 bg-purple-900 text-white hover:bg-gray-600"
                            onClick={handleFileUpload}
                        >
                            Upload
                        </button>
                    )}
                </div>
            </div>
    
            {/* Account Settings Box */}
            <div className="w-1/2 p-5">
                <div className="p-5 border border-gray-700 rounded mt-5">
                    <h6 className="mb-5 text-center">Account Settings</h6>
                    <button 
                        className="w-full border rounded mb-2 py-2 px-4"
                        onClick={handleResetPassword}
                    >
                        Reset Password
                    </button>
                    <button 
                        className="w-full border rounded mb-2 py-2 px-4"
                        onClick={handleChangeUsername}
                    >
                        Change Username
                    </button>
                    <button 
                        className="w-full border rounded py-2 px-4 text-red-500"
                        onClick={handleDeleteAccount}
                    >
                        Delete Account
                    </button>
                    <div className="flex items-center p-6 justify-center">
                        {message && isVisible && <div className="alert">{message}</div>}
                    </div>
                </div>
            </div>


            <div className="w-1/2 p-5">
                <input 
                    id="timezone-outlined" 
                    className="border rounded w-full py-2 px-3 mb-2 text-sm bg-white" 
                    placeholder="Timezone" 
                    value={timezone} 
                    onChange={(e) => setTimezone(e.target.value)}
                />
                <input 
                    id="timezone-outlined" 
                    className="border rounded w-full py-2 px-3 mb-2 text-sm bg-white" 
                    placeholder="Location" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                />
                <button 
                    className="mt-2 bg-[#0c0a26] p-2 text-white rounded-md hover:bg-[#444654] transition-colors"
                    onClick={handleUpdate}
                >
                    Update Timezone & Location
                </button>
            </div>


            <div className="flex flex-wrap justify-end items-center w-full">
            {/* Bio Box */}
                <div className="w-1/2 p-5">
                    <textarea 
                        id="bio-outlined" 
                        className="border rounded w-full py-2 px-3 mb-2 text-sm bg-white" 
                        placeholder="Bio" 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)}
                    ></textarea>
                    <button 
                        className="mt-2 bg-[#0c0a26] p-2 text-white rounded-md hover:bg-[#444654] transition-colors"
                        onClick={handleUpdate}
                    >
                        Update Bio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(UserProfile);
