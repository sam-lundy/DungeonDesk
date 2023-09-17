import '../../types/character.d.ts'
import { Box, Typography, Divider, Paper } from '@mui/material';

interface CharacterSheetProps {
  character: CharacterData;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character }) => {
  return (
    <Paper elevation={3}>
      <Box p={3}>

        {/* Header */}
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h4">{character.name}</Typography>
          <Typography variant="subtitle1">Level {character.level} {character.class}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Basic Info */}
        <Box display="flex" justifyContent="space-between">
          <Typography>Race: {character.race}</Typography>
          <Typography>Background: {character.background}</Typography>
          <Typography>Alignment: {character.alignment}</Typography>
          <Typography>Experience: {character.experiencePoints} XP</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Ability Scores */}
        <Box display="flex" justifyContent="space-around">
          {Object.entries(character.abilityScores).map(([key, value]) => (
            <Box key={key} textAlign="center">
              <Typography variant="h6">{key.charAt(0).toUpperCase() + key.slice(1)}</Typography>
              <Typography variant="h5">{value}</Typography>
            </Box>
          ))}
        </Box>

        {/* ... add other sections like Combat, Attacks, Equipment, etc. ... */}

      </Box>
    </Paper>
  );
};

export default CharacterSheet;

