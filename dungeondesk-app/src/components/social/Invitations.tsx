import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Button, Box, Typography,  } from '@mui/material';
import { AuthContext } from '../firebase/firebase.auth';


type ErrorType = { message: string } | null;


const Invitations: React.FC = () => {
    const context = useContext(AuthContext)
    const currentUser = context ? context.currentUser : null;
    const [invitations, setInvitations] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorType>(null);



    useEffect(() => {
        axios.get('http://localhost:5000/api/enriched-invitations')
            .then(response => {
                setInvitations(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching enriched invitations:", err);
                setError(err);
                setLoading(false);
            });
    }, []);

    const handleAccept = (invitationId: number) => {
        axios.post(`http://localhost:5000/api/invitations/${invitationId}/accept`)
            .then(response => {
                // Remove accepted invitation from the list or update its status
                setInvitations(prevInvitations => 
                    prevInvitations.filter(invite => invite.id !== invitationId)
                );
            })
            .catch(error => {
                console.error("Error accepting invitation:", error);
            });
    };

    const handleDecline = (invitationId: number) => {
        axios.post(`http://localhost:5000/api/invitations/${invitationId}/decline`)
            .then(response => {
                // Remove declined invitation from the list or update its status
                setInvitations(prevInvitations => 
                    prevInvitations.filter(invite => invite.id !== invitationId)
                );
            })
            .catch(error => {
                console.error("Error declining invitation:", error);
            });
    };


    return (
        <Box 
            sx={{ 
                height: '250px',
                border: '1px solid #0c0a26', 
                borderRadius: 1,
                bgcolor: '#f1f5f9',
                m: '16px',
                overflowY: 'auto'
            }}
        >
            <Typography 
                variant="h6" 
                sx={{ 
                    bgcolor: '#0c0a26', 
                    color: '#FFFFFF', 
                    padding: '1rem', 
                    marginBottom: '1rem' 
                }}
            >
                Invitations
            </Typography>
    
            <Box>
                <Typography variant="body1">
                    You have {invitations.length} pending invitations.
                </Typography>
    
                <ul>
                    {invitations.map(invite => (
                        <li key={invite.id}>
                            Invitation from <strong>{invite.dm_username}</strong> to join the campaign: <strong>{invite.campaign_name}</strong>
                            <Button onClick={() => handleAccept(invite.id)}>Accept</Button>
                            <Button onClick={() => handleDecline(invite.id)}>Decline</Button>
                        </li>
                    ))}
                </ul>
            </Box>
        </Box>
    );
    
};

export default Invitations;
