import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { 
    Container, Typography, TextField, Button, Box 
} from '@mui/material';

function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        try {
            let userEmail = identifier;
            
            // If identifier doesn't include @, assume username
            if (!identifier.includes('@')) {
                //fetch email associated with username in backend
                const response = await fetch(`http://localhost:5000/api/get-email?username=${identifier}`);
                const data = await response.json();
                userEmail = data.email;
            }

            const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
            const user = userCredential.user;

            // Fetch the JWT
            const idToken = await user.getIdToken(true);

            // Store JWT in local storage or context
            localStorage.setItem('jwt', idToken);
            
            // Redirect to home after successful login
            navigate('/dashboard');
        } catch (error) {
            // Handle Errors here.
            console.error(error);
        }
    };
  
    return (
        <Container component="main" maxWidth="xs" sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-start', 
            height: '80vh'
            }}>
            <Typography variant="h5" align="center">Please Sign-In</Typography>
            <Box component="form" mt={3}>
                <TextField 
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label="Email or Username"
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                />
                <TextField 
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <Button
                    type="button"
                    variant="contained"
                    onClick={handleLogin}
                    sx={{ 
                        marginTop: 3,
                        width: '100px',
                        backgroundColor: '#0c0a26',
                        color: '#FFFFFF',
                        '&:hover': {
                            backgroundColor: '#444654',  // A slightly darker shade for hover
                        }
                    }}
                >
                    Login
                </Button>
            </Box>
        </Container>
    );
}
  
export default Login;
