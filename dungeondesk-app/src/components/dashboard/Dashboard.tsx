import React, { useContext, useState, useEffect, ChangeEvent } from 'react';
import { AuthContext } from '../firebase/firebase.auth';
import { 
    Container, Typography, TextField, Button, Avatar, 
    Grid, Divider, IconButton, Tooltip, Box
} from '@mui/material';
import campaignimage from '../../assets/images/campaign-tavern.jpg';


const Dashboard: React.FC = () => {
    return (
        <Container 
            sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                mt: '-50px',
                bgcolor: '#d2d1cd',
                fontFamily: 'Barlow, sans-serif',
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
                    // padding: 2, 
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
                    }}
                >
                    Campaign Overview
                </Typography>
                <img src={campaignimage} alt="Forest Tavern" />
                {/* ... rest of the content for this box */}
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
                    {/* ... rest of the content for this box */}
                </Box>

                {/* Info Box */}
                <Box 
                    sx={{ 
                        // padding: 2,
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
                    {/* ... rest of the content for this new box */}
                </Box>
            </Box>
        </Container>

    );
}


export default Dashboard;
