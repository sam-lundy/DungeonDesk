import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../firebase/firebase.auth.tsx";
import { Link } from "react-router-dom";
import { Container, Typography, Button, Avatar, Box } from "@mui/material";

interface Character {
  id: string;
  name: string;
  imageUrl: string;
}

const Characters: React.FC = () => {
  const context = useContext(AuthContext);
  if (!context) {
      throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { currentUser } = context;
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchCharacters() {
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
                  setCharacters(data);
              }
  
          } catch (error: any) {
              if (error.name !== 'AbortError') {
                  console.error("Error fetching characters:", error);
              }
          }
      }
  }
  
    
    fetchCharacters();

}, [currentUser]);

  const canCreateCharacter = characters.length < 4;

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <Typography variant="h5">My Characters</Typography>
        <Button
          variant="outlined"
          color="primary"
          component={Link}
          to="/character-create"
          disabled={!canCreateCharacter}
        >
          Create
        </Button>
        {!canCreateCharacter && <Typography variant="body2" color="error">You've reached the maximum number of characters allowed.</Typography>}
      </Box>

      <Typography variant="body1">Slots used: {characters.length}/4</Typography>


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
          <Box
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
            }}
          >
            <Avatar
              src={character.imageUrl}
              sx={{ width: "120px", height: "120px" }}
            />
            <Typography variant="h6" sx={{ marginTop: "1rem" }}>
              {character.name}
            </Typography>
            <Box sx={{ marginTop: "auto" }}>
              <Button variant="outlined" color="primary">
                View
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                sx={{ marginLeft: "0.5rem" }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default Characters;
