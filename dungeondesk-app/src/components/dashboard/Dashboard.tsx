import { useContext, useState, useEffect, ChangeEvent, FC } from 'react';
import { AuthContext } from '../firebase/firebase.auth';
import axios from 'axios';
import { Router, useNavigate } from 'react-router-dom';
import { 
    Container, Typography, TextField, Button, Select,
     Box, Modal, MenuItem, InputLabel, FormControl, SelectChangeEvent
} from '@mui/material';
import campaignimage from '../../assets/images/campaign-tavern.jpg';
import FileUpload from './FileUpload';


interface CampaignFile {
    id: number;
    filename: string;
}




const Dashboard: FC = () => {
    const navigate = useNavigate();
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [invitations, setInvitations] = useState<string[]>(['']);
    const [status, setStatus] = useState('scheduled');
    const [campaignFiles, setCampaignFiles] = useState<CampaignFile[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [userCampaigns, setUserCampaigns] = useState<any[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
    const context = useContext(AuthContext)
    const currentUser = context ? context.currentUser : null;
    const userId = currentUser ? currentUser.uid : null;



    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:5000/api/users/${userId}/campaigns`)
            .then(response => {
                setUserCampaigns(response.data);
            })
            .catch(error => {
                console.error("Error fetching user's campaigns:", error);
            });
        }
    }, [userId]);

    

    useEffect(() => {
        axios.get(`http://localhost:5000/api/campaigns/${selectedCampaignId}/files`)
        .then(response => {
            const files: CampaignFile[] = response.data.map((file: any) => ({
                id: file.id,
                filename: file.filename
            }));
            setCampaignFiles(files);
            setFetchError(null);
        })
        .catch(error => {
            console.error("Error fetching campaign files:", error);
            setFetchError("Failed to fetch campaign files. Please try again later.");
        });
    }, []);
    
    

    const handleInvite = () => {
        axios.post(`http://localhost:5000/api/campaigns/${selectedCampaignId}/invite`, { invitations })
        .then(response => {
            console.log("Invitations sent!", response.data);
            setInviteModalOpen(false);
        })
        .catch(error => {
            console.error("Error:", error);
        });
    };


    const handleStatusChange = (event: SelectChangeEvent) => {
        const newStatus = event.target.value as string;
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
        axios.delete(`/api/campaigns/files/${fileId}`)
        .then(response => {
            // Remove the file from the campaignFiles state
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
                    bgcolor: '#FFFFFF',
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
    
                {/* Displaying the campaigns */}
                {userCampaigns.map((campaign, index) => (
                    <Box key={index} sx={{ marginBottom: '1rem' }}>
                        <Typography variant="h6">
                            {campaign.name}  {/* Assuming each campaign has a name property */}
                        </Typography>
                        <Typography variant="body2">
                            {/* You can add other campaign details here */}
                        </Typography>
                    </Box>
                ))}
                <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel id="status-label">Campaign Status</InputLabel>
                    <Select
                        labelId="status-label"
                        value={status}
                        onChange={handleStatusChange}
                        label="Campaign Status"
                    >
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel id="campaign-select-label">Select Campaign</InputLabel>
                    <Select
                        labelId="campaign-select-label"
                        value={selectedCampaignId || ""}
                        onChange={(event) => setSelectedCampaignId(Number(event.target.value))}
                    >
                        {userCampaigns.map(campaign => (
                            <MenuItem key={campaign.id} value={campaign.id}>
                                {campaign.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Right Container for the smaller boxes */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '30%' }}>

                {/* Party Members Box */}
                <Box 
                    sx={{ 
                        // padding: 2, 
                        border: '1px solid #0c0a26', 
                        borderRadius: 2,
                        height: '400px',
                        bgcolor: '#FFFFFF',
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
                            <Button 
            variant="contained" 
            color="secondary" 
            onClick={() => setInviteModalOpen(true)}
        >
            Invite Players
        </Button>

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
                borderRadius: 2,
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

                </Box>

                {/* Info Box */}
                <Box 
                    sx={{ 
                        height: '235px',
                        border: '1px solid #0c0a26', 
                        borderRadius: 2, 
                        bgcolor: '#FFFFFF',
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
                        Campaign Details
                    </Typography>

                    {userCampaigns.length > 0 && 
                    <Box>
                    
                    <Typography variant="h6">
                        Campaign Files
                    </Typography>
                    <ul>
                        {campaignFiles.map((file, index) => (
                            <li key={index}>
                                <a href={file.filename} target="_blank" rel="noopener noreferrer">
                                    {file.filename.split('/').pop()}
                                </a>
                                <Button onClick={() => deleteFile(file.id)}>Delete</Button>
                            </li>
                        ))}
                    </ul>
                </Box>
                }
                
                <FileUpload campaignId={selectedCampaignId} />

                </Box>
            </Box>
        </Container>

    );
}


export default Dashboard;
