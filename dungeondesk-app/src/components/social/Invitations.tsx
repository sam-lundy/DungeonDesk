import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@mui/material';
import { AuthContext } from '../firebase/firebase.auth';

const Invitations: React.FC = () => {
    const [invitations, setInvitations] = useState<any[]>([]);

    useEffect(() => {
        const userUid = 'currentUserId'; // replace with appropriate value

        axios.get(`http://localhost:5000/api/users/${userUid}/invitations`)
            .then(response => {
                setInvitations(response.data);
            })
            .catch(error => {
                console.error("Error fetching invitations:", error);
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
        <div>
            <h2>Your Invitations</h2>
            <ul>
                {invitations.map(invite => (
                    <li key={invite.id}>
                        Campaign ID: {invite.campaign_id}
                        <Button onClick={() => handleAccept(invite.id)}>Accept</Button>
                        <Button onClick={() => handleDecline(invite.id)}>Decline</Button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Invitations;
