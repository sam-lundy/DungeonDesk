import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../firebase/firebase.auth.tsx";
import { Link } from "react-router-dom";
import { toast } from "react-toastify"
import { Container, Typography, Button, Box, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle, CircularProgress,
    Card, CardMedia, CardContent, CardActions } from "@mui/material";


interface Character {
  id: string;
  name: string;
  imageUrl: string;
}


const Characters: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const context = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);


  if (!context) {
      throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { currentUser } = context;
  const [characters, setCharacters] = useState<Character[]>([]);


  const handleOpen = (character: Character) => {
    setCharacterToDelete(character);
    setOpen(true);
  };
  

  const handleClose = () => {
      setOpen(false);
      setCharacterToDelete(null);
  };
  

  const deleteCharacter = async (characterId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/delete-character/${characterId}`, {
          method: 'DELETE'
      });
      if (response.ok) {
        // Functionality moved to handleDelete
      } else {
        // Handle error (e.g., show an error message)
        toast.error('Failed to delete the character.');
      }
    } catch (error) {
      // Handle fetch error (e.g., show an error message)
      toast.error('An error occurred while deleting the character.');
    }
  };
  

  const handleDelete = async () => {
    if (characterToDelete !== null) { // Check if characterToDelete is null
      await deleteCharacter(characterToDelete.id);
  
      // Optimistically remove the character from UI
      setCharacters(prevCharacters => prevCharacters.filter(c => c.id !== characterToDelete.id));
      
      // Show success message
      toast.success('Character successfully deleted.');
  
      // Close the confirmation dialog
      handleClose();
    }
  };


  useEffect(() => {
    let isMounted = true;

    async function fetchCharacters() {
      setIsLoading(true);
      if (currentUser) {
          try {
              const endpoint = "http://localhost:5000/api/get-characters";
              const response = await fetch(endpoint, {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      'uid': currentUser.uid
                  },
              });
  
              if (response.status === 404) {
                  // If no characters are found, set an empty list and return.
                  setCharacters([]);
                  return;
              }
  
              if (!response.ok) {
                  throw new Error("Failed to fetch characters.");
              }
  
              const data = await response.json();
              if (isMounted) {
                  if (data.characters) {
                      // If data has a characters key, use that
                      setCharacters(data.characters);
                  } else if (Array.isArray(data)) {
                      // If data is an array (meaning characters were found)
                      setCharacters(data);
                  } else {
                      console.error("Unexpected response structure:", data);
                      setCharacters([]);
                  }
                  setIsLoading(false);
              }
          } catch (error: any) {
              if (error.name !== 'AbortError') {
                  console.error("Error fetching characters:", error);
              }
          }
      }
  }  
  
    fetchCharacters();
    return () => {
      isMounted = false;
  };
}, [currentUser]);

  const canCreateCharacter = characters.length < 4;


  return (
    <Container >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <Typography variant="h5">My Characters</Typography>
        {!canCreateCharacter && (
          <Typography variant="body2" color="error">
            You've reached the maximum number of characters allowed.
          </Typography>
        )}
        </Box>
        {!canCreateCharacter && <Typography variant="body2" color="error">You've reached the maximum number of characters allowed.</Typography>}

      <Typography variant="body1">Slots used: {characters.length}/4</Typography>

      {isLoading ? (
      <CircularProgress />
    ) : (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "start",
          flexWrap: "wrap",
          gap: 2,
          marginTop: "2rem",
        }}
      >
        {characters.map((character) => (
          <Card
            key={character.id}
            sx={{
              width: "240px",
              height: "320px",
              border: "1px solid #0c0a26",
              borderRadius: "8px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#f1f5f9"
            }}
          >
            <CardMedia
              component="img"
              image={character.imageUrl}
              title={character.name}
              sx={{ width: "120px", height: "120px", borderRadius: "50%" }}
            />
            <CardContent>
              <Typography variant="h6" sx={{ marginTop: "1rem" }}>
                {character.name}
              </Typography>
            </CardContent>
            <CardActions sx={{ marginTop: "auto", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Link to={`/character-sheet/${character.id}`}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  sx={{
                    backgroundColor: '#0C0A26',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#0C0A26',
                      opacity: 0.8
                    }
                  }}
                >
                  View
                </Button>
              </Link>
              <Button 
                variant="outlined"
                color="secondary"
                sx={{ 
                  marginTop: "0.5rem",
                  backgroundColor: '#0C0A26',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'red',
                    opacity: 0.9
                  }
                }}
                onClick={() => handleOpen(character)}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "2rem",
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          component={Link}
          to="/character-create"
          disabled={!canCreateCharacter}
          sx={{
            backgroundColor: "#0C0A26",
            color: "white",
            "&:hover": {
              backgroundColor: "#0C0A26",
              opacity: 0.8,
            },
          }}
        >
          Create
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Are you sure you'd like to delete {characterToDelete?.name}?
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose} 
              color="primary"
              sx={{
                backgroundColor: '#0C0A26',
                color: 'white',
                '&:hover': {
                    backgroundColor: '#0C0A26',
                    opacity: 0.9
                }
              }}
              >
              Cancel
            </Button>
            <Button onClick={handleDelete} 
            color="primary" autoFocus
            sx={{
              backgroundColor: '#0C0A26',
              color: 'white',
              '&:hover': {
                  backgroundColor: 'red',
                  opacity: 0.9
              }
            }}
            >
                Delete
            </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Characters;
