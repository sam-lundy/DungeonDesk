import { useContext, useState, useEffect, ChangeEvent, FC } from 'react';
import { AuthContext } from '../firebase/firebase.auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import { 
    Container, Typography, TextField, Button, Select,
     Box, Modal, MenuItem, InputLabel, FormControl, SelectChangeEvent
} from '@mui/material';
import campaignimage from '../../assets/images/campaign-tavern.jpg';
import FileUpload from './FileUpload';
import Invitations from '../social/Invitations';


const StyledList = styled('ul')({
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    flexGrow: 1,
});

const StyledListItem = styled('li')({
    padding: '8px 16px',
    backgroundColor: '#f7fafc',
    borderBottom: '1px solid #e2e8f0',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
});


const FileList = styled('ul')({
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    flexGrow: 1,
});


const FileListItem = styled('li')({
    padding: '8px 16px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});


export type UserType = {
    uid: string;
    username: string;
    profile_pic: string;
    timezone: string;
};


const Dashboard: FC = () => {
    const navigate = useNavigate();
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [invitations, setInvitations] = useState<string[]>(['']);
    const [status, setStatus] = useState('');
    const [campaignFiles, setCampaignFiles] = useState<{ id: number, filename: string, uploaded_at: string }[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [userCampaigns, setUserCampaigns] = useState<any[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
    const context = useContext(AuthContext)
    const currentUser = context ? context.currentUser : null;
    const userId = currentUser ? currentUser.uid : null;
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [acceptedUsers, setAcceptedUsers] = useState<UserType[]>([]);


    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:5000/api/users/${userId}/campaigns`)
            .then(response => {
                setUserCampaigns(response.data);
                // Find the selected campaign from the response data
                const selectedCampaign = response.data.find(c => c.id === selectedCampaignId);
                if (selectedCampaign) {
                    setStatus(selectedCampaign.status);
                }
            })
            .catch(error => {
                console.error("Error fetching user's campaigns:", error);
            });
        }
    }, [userId, selectedCampaignId]);    

    
    useEffect(() => {
        const selectedCampaign = userCampaigns.find(c => c.id === selectedCampaignId);
        if (selectedCampaign) {
            setStatus(selectedCampaign.status);
        }
    }, [selectedCampaignId, userCampaigns]);
    


    useEffect(() => {
        if (selectedCampaignId) {
            axios.get(`http://localhost:5000/api/campaigns/${selectedCampaignId}/files`)
            .then(response => {
                setCampaignFiles(response.data);
                setFetchError(null);
            })
            .catch(error => {
                console.error("Error fetching campaign files:", error);
                setFetchError("Failed to fetch campaign files. Please try again later.");
            });
        }
    }, [selectedCampaignId]);       
    
    
    useEffect(() => {
        if (selectedCampaignId) {
            axios.get(`http://localhost:5000/api/campaigns/${selectedCampaignId}/accepted-invites`)
            .then(response => {
                setAcceptedUsers(response.data);
            })
            .catch(error => {
                console.error("Error fetching accepted users:", error);
            });
        }
    }, [selectedCampaignId]);    
    

    const handleInvite = () => {
        const validInvitations = invitations.filter(invite => invite.trim() !== '');
        if (validInvitations.length === 0) {
            return;
        }
    
        axios.post(`http://localhost:5000/api/campaigns/${selectedCampaignId}/invitations`, { invitations: validInvitations })
        .then(response => {
            setFeedbackMessage("Invitations sent successfully!");
            setTimeout(() => {
                setFeedbackMessage(null);
            }, 3000);
            setInviteModalOpen(false);
        })
        .catch(error => {
            console.error("Error:", error);
            if (error.response && error.response.data && error.response.data.message) {

                setFeedbackMessage(error.response.data.message);
            } else {
                setFeedbackMessage("Error sending invitations. Please try again later.");
            }
            setTimeout(() => {
                setFeedbackMessage(null);
            }, 3000);
        });
        
    };


    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = event.target.value;
        setStatus(newStatus);
        
        // Send the updated status to the backend
        axios.put(`http://localhost:5000/api/campaigns/${selectedCampaignId}/status`, { status: newStatus })
        .then(response => {
            console.log("Status updated!", response.data);
        })
        .catch(error => {
            console.error("Error:", error);
        });
    };
    


    const deleteFile = (fileId: number) => {
        axios.delete(`http://localhost:5000/api/campaigns/files/${fileId}`)
        .then(response => {
            setCampaignFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
        })
        .catch(error => {
            console.error("Error deleting file:", error);
        });
    };


    return (
        <Container 
            sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                mt: '-20px',
                bgcolor: '#d2d1cd',
                color: '#252422',
                height: '90vh',
            }}
        >
    
            {/* Campaign Overview Box */}
            <Box 
                sx={{
                    display: 'flex',
                    gap: 2,
                    width: '70%',
                    height: '400px',
                    justifyContent: 'flex-start',
                    flexDirection: 'column', 
                    border: '1px solid #0c0a26', 
                    borderRadius: 1, 
                    bgcolor: '#e2e8f0',
                    m: '16px',
                }}
            >
                <Typography 
                    variant="h6" 
                    sx={{ 
                        bgcolor: '#0c0a26', 
                        color: '#FFFFFF', 
                        padding: '1rem', 
                        marginBottom: '1rem',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    Campaign Overview
                    <Button variant="contained" color="primary" onClick={() => { navigate('/create-campaign') }}>
                        Create Campaign
                    </Button>
                </Typography>
    
                {userCampaigns.length === 0 && 
                    <Typography variant="h6">
                        You don't have any campaigns. Start or join one to begin your adventure!
                    </Typography>
                }
    
                <img src={campaignimage} alt="Forest Tavern" />
    
                <div className="w-3/4 mx-auto">
                    <div className="my-4 text-center">
                        <label htmlFor="campaign-select" className="block text-sm font-medium text-gray-700">Select Campaign</label>
                        <select 
                            id="campaign-select"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-800 focus:border-indigo-800 sm:text-sm"
                            value={selectedCampaignId || ""}
                            onChange={(event) => setSelectedCampaignId(Number(event.target.value))}
                        >
                            {userCampaigns.map(campaign => (
                                <option key={campaign.id} value={campaign.id}>
                                    {campaign.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCampaignId && (
                        <div className="my-4 text-center">
                            <label htmlFor="status-select" className="block text-sm font-medium text-gray-700">Campaign Status</label>
                            <select 
                                id="status-select"
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-800 focus:border-indigo-800 sm:text-sm"
                                value={status}
                                onChange={handleStatusChange}
                            >
                                <option value="scheduled">Scheduled</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    )}
                </div>
            </Box>

            {/* Right Container for the smaller boxes */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '30%' }}>

            {/* Party Members Box */}
            <Box 
                sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid #0c0a26', 
                    borderRadius: 1,
                    height: '350px',
                    bgcolor: '#e2e8f0',
                    m: '16px'
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
                    Party Members
                </Typography>
                <StyledList>
                    {acceptedUsers.map(user => (
                        <StyledListItem key={user.uid}>
                            {user.username}
                        </StyledListItem>
                    ))}
                </StyledList>

                <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => setInviteModalOpen(true)}
                    sx={{
                        mt: 2,
                        mb: 2,
                        alignSelf: 'center',
                    }}
                >
                    Invite Players
                </Button>
            </Box>


        <Modal
            open={inviteModalOpen}
            onClose={() => setInviteModalOpen(false)}
            aria-labelledby="invite-players-modal"
            aria-describedby="modal-to-invite-players"
        >
            <Box sx={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 1,
                outline: 'none'
            }}>
                <Typography variant="h5" gutterBottom>
                    Invite Players
                </Typography>
                
                {invitations.map((invite, index) => (
                    <TextField
                        key={index}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        label="Username or Email"
                        value={invite}
                        onChange={(e) => {
                            const newInvitations = [...invitations];
                            newInvitations[index] = e.target.value;
                            setInvitations(newInvitations);
                        }}
                    />
                ))}

                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleInvite}
                    sx={{ mt: 2 }}
                >
                    Send Invitations
                </Button>
            </Box>
        </Modal>
        {/* Campaign Files Box */}
        <Box 
            sx={{ 
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '350px',
                border: '1px solid #0c0a26', 
                borderRadius: 1, 
                bgcolor: '#e2e8f0',
                m: '16px'
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
                Campaign Files
            </Typography>

            {userCampaigns.length > 0 && 
                <FileList>
                    {campaignFiles.map(file => (
                        <FileListItem key={file.id}>
                            <a href={file.filename} target="_blank" rel="noopener noreferrer">
                                {file.filename.split('/').pop()}
                            </a>
                            <Button onClick={() => deleteFile(file.id)}>Delete</Button> 
                        </FileListItem>
                    ))}
                </FileList>
            }
                <FileUpload campaignId={selectedCampaignId} />
                </Box>
                <Invitations />
            </Box>
        </Container>
    );
}

export default Dashboard;
