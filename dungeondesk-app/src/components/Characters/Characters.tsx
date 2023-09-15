import React, { useContext, useState, useEffect, ChangeEvent } from "react";
import { AuthContext } from "../firebase/firebase.auth.tsx";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Avatar,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";

interface Character {
  id: string;
  name: string;
  imageUrl: string;
}

const mockCharacters: Character[] = [
  {
    id: "1",
    name: "Aragon",
    imageUrl: "https://example.com/aragon.jpg",
  },
  {
    id: "2",
    name: "Legolas",
    imageUrl: "https://example.com/legolas.jpg",
  },
  // ... Add more mock characters as needed
];

const Characters: React.FC = () => {
  const characters = mockCharacters;

  return (
    <Container>
      {/* Top content */}
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
        >
          Create
        </Button>
      </Box>

      <Typography variant="body1">Slots used: {characters.length}/4</Typography>

      {/* Characters grid */}
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
