import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, TextField, Container, Typography } from '@mui/material';
import { AuthContext } from '../firebase/firebase.auth';


const CampaignCreation: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startingLocation, setStartingLocation] = useState('');
    const context = useContext(AuthContext)
    const currentUser = context ? context.currentUser : null;
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser || !currentUser.uid) {
            console.error("No valid user found. Cannot create campaign.");
            return;
        }
    
        const data = {
            name: name,
            description: description,
            starting_location: startingLocation,
            dm_uid: currentUser.uid
        };
    
        axios.post('http://localhost:5000/api/campaigns', data)
            .then(response => {
                setShowSuccess(true);

                setTimeout(() => {
                    navigate('/dashboard');
                }, 3000);
            console.log("Campaign created!", response.data);
        })
        .catch(error => {
            console.error("Error:", error);
        });
    };

    return (
        <div>
        {showSuccess && <div>Success! Redirecting to Dashboard...</div>}

        <Container>
            <Typography variant="h4" gutterBottom>
                Create a New Campaign
            </Typography>
            
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="Campaign Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                
                <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={4}
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                
                <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="Starting Location"
                    value={startingLocation}
                    onChange={(e) => setStartingLocation(e.target.value)}
                />

                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    style={{ marginTop: '1rem' }}
                >
                    Create Campaign
                </Button>
            </form>
        </Container>
        </div>
    );
}

export default CampaignCreation;
