import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig.ts';
import { 
    Container, Typography, TextField, Button, Box 
} from '@mui/material';


function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Now, send the additional user data to your Flask backend
      const additionalUserData = {
        uid: user.uid,
        username: username,
        email: email
        // ... any other data like bio, profile_pic, etc.
      };

      // const jwt = localStorage.getItem('jwt');

      // Fetch the JWT
      const idToken = await user.getIdToken(true);

      // store JWT in local storage or context
      localStorage.setItem('jwt', idToken);
  
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(additionalUserData)
      });
  
      const data = await response.json();
      
  
      if (data.success) {
        setMessage(`Welcome ${user.email}! Registration successful.`);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage(data.error);
      }

    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
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

      <Typography variant="h5" align="center">Register to DungeonDesk</Typography>
      <Box component="form" mt={3}>
      <TextField 
          variant="outlined"
          margin="normal"
          fullWidth
          label="Username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <TextField 
          variant="outlined"
          margin="normal"
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
          color="primary"
          onClick={handleRegister}
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
          Register
        </Button>
        {message && <Typography variant="body2" align="center" color="error">{message}</Typography>}
      </Box>
    </Container>
  );
}

export default Register;