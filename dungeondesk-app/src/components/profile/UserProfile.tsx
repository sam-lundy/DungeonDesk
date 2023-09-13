import React, { useContext, useState, useEffect, ChangeEvent } from 'react';
import { AuthContext } from '../firebase/firebase.auth.tsx';
import { 
    Container, Typography, TextField, Button, Avatar, 
    Grid, Divider, IconButton, Tooltip, Box
} from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import './UserProfile.css';

console.log("Rendering UserProfile");

interface UserProfileProps {
    // Define any props you expect this component to receive
    // e.g., user: UserType;
}



const UserProfile: React.FC<UserProfileProps> = (props) => {
    const [timezone, setTimezone] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const authContext = useContext(AuthContext);
    const currentUser = authContext?.currentUser;
    const defaultProfilePicURL = "https://exionweb.s3.amazonaws.com/default_user_icon.png";
    const [profilePicURL, setProfilePicURL] = useState<string>(defaultProfilePicURL);
    

    useEffect(() => {
        async function fetchUserData() {
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
                // Similarly, set other states like setTimezone(data.timezone) etc.
            }
        }

        fetchUserData();
    }, []);


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


    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:5000/api/avatar-upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        setProfilePicURL(data.url);
    };

    return (
        <Container 
        sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', mt: 3,
            height: '90vh'
            }}>
            
            <Typography variant="h4" gutterBottom sx={{ marginBottom: '50px' }}>Edit Profile</Typography>
    
            {/* Main Flexbox Container */}
            <Box sx={{ display: 'flex', width: '100%', gap: 5 }}>
    
                {/* Left Section */}
                <Box sx={{ flex: 1, padding: '0 20px', gap: 2, display: 'flex', flexDirection: 'column' }}>
    
                    {/* User Information Box */}
                    <Box sx={{ padding: 2, border: '1px solid #23252b', borderRadius: 1 }}>
                        <Typography variant="h6" align="center">Username: {currentUser?.username}</Typography>
                        <Typography variant="body1" align="center">Email: {currentUser?.email}</Typography>
                        <Typography variant="body2" align="center">Member since: {currentUser?.dateCreated}</Typography>
                    </Box>
    
                    {/* Profile Picture Box */}
                    <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 2, 
                    border: '1px solid #23252b',
                    borderRadius: 2, 
                    mt: 2 
                }}>
                    <Avatar 
                        alt="User Profile Picture" 
                        src={profilePicURL}
                        sx={{ width: 80, height: 80, marginBottom: '20px' }}
                    />
                    <input type="file" onChange={handleFileChange} />
                </Box>

    
                    {/* Bio Box */}
                    <Box sx={{ padding: 2, border: '1px solid #23252b', borderRadius: 2, mt: 2 }}>
                    <TextField
                    id='bio-outlined'
                    label="Bio" 
                    value={bio} 
                    onChange={(e) => setLocation(e.target.value)} 
                    fullWidth
                    multiline
                    variant="outlined"
                    sx={{
                        marginY: 2,
                        '& .MuiInputBase-input': {
                            fontSize: '0.8rem',  // Adjust this value to your liking
                        },
                        '& .MuiInputBase-root': {
                            backgroundColor: '#ffffff',  // Set the background color to white
                        },
                    }}
                />

                        <Button 
                            variant="contained" 
                            type="submit" 
                            onClick={handleUpdate} 
                            sx={{ 
                                mt: 2,
                                backgroundColor: '#0c0a26',
                                color: '#FFFFFF',
                                '&:hover': {
                                    backgroundColor: '#444654',  // A slightly darker shade for hover
                                }
                            }}
                        >
                            Update Bio
                        </Button>
                    </Box>
    
                </Box>
    
                {/* Right Section */}
                <Box sx={{ flex: 1, padding: '0 20px', gap: 2, display: 'flex', flexDirection: 'column' }}>
    
                    {/* Timezone and Location Box */}
                    <Box sx={{ padding: 2, border: '1px solid #23252b', borderRadius: 2, gap: 2 }}>
                    <TextField
                    id='timezone-outlined'
                    label="Timezone" 
                    value={timezone} 
                    onChange={(e) => setLocation(e.target.value)} 
                    fullWidth
                    variant="outlined"
                    sx={{
                        marginY: 2,
                        '& .MuiInputBase-input': {
                            fontSize: '0.8rem',  // Adjust this value to your liking
                        },
                        '& .MuiInputBase-root': {
                            backgroundColor: '#ffffff',  // Set the background color to white
                        },
                    }}
                />

                        <TextField
                            id='location-outlined'
                            label="Location" 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)} 
                            fullWidth
                            variant="outlined"
                            sx={{
                                marginY: 2,
                                '& .MuiInputBase-input': {
                                    fontSize: '0.8rem',  // Adjust this value to your liking
                                },
                                '& .MuiInputBase-root': {
                                    backgroundColor: '#ffffff',  // Set the background color to white
                                },
                            }}
                        />

                        <Button 
                            variant="contained" 
                            type="submit" 
                            onClick={handleUpdate} 
                            sx={{ 
                                mt: 2,
                                backgroundColor: '#0c0a26',
                                color: '#FFFFFF',
                                '&:hover': {
                                    backgroundColor: '#444654',  // A slightly darker shade for hover
                                    }
                            }}
                            >
                            Update Timezone & Location
                        </Button>
                    </Box>
    
                </Box>
    
            </Box>
    
        </Container>
    );
    
      
}

export default UserProfile;
