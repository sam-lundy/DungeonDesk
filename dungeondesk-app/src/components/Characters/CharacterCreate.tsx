import React, { useState } from 'react';
import { 
    Container, Typography, TextField, Button, Avatar, 
    Select, MenuItem, FormControl, FormControlLabel,
    Radio, RadioGroup, Box, InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';


type CharacterState = {
    name: string;
    hitPointType: string;
    visibility: string;
    race?: string;
    className?: string;
    equipment?: string[];
  };


const CharacterCreate: React.FC = () => {
    const navigate = useNavigate();

    const [character, setCharacter] = useState<CharacterState>({
        name: "",
        hitPointType: "Fixed",
        visibility: "Public"
    });


    const updateCharacter = (updates: Partial<CharacterState>) => {
        setCharacter(prev => ({ ...prev, ...updates }));
    };


    const [hitPointType, setHitPointType] = useState<string>('Fixed');
    const [visibility, setVisibility] = useState<string>('Public');

    const handleNext = () => {
        // Here you can save the current character state or perform validation
        if (!character.race) {
        navigate('/character-race');
        } else if (!character.className) {
        navigate('/character-class');
        } else if (!character.equipment) {
        navigate('/character-equip');
        } else {
        // All steps are done, maybe navigate to a summary or confirmation page?
        navigate('/character-confirm');
        }
    };

    return (
        <Container>
            {/* Picture and Name */}
            <Box sx={{ display: 'flex', gap: 2, marginBottom: '1rem' }}>
                <Avatar sx={{ width: '120px', height: '120px' }} /> {/* Placeholder for image upload */}
                <TextField label="Character Name" variant="outlined" fullWidth />
            </Box>

            {/* Hit Point Type */}
            <FormControl fullWidth variant="outlined" sx={{ marginBottom: '1rem' }}>
                <InputLabel id="hit-point-type-label">Hit Point Type</InputLabel>
                <Select
                    labelId="hit-point-type-label"
                    value={character.hitPointType}
                    onChange={(e) => updateCharacter({ hitPointType: e.target.value })}
                    label="Hit Point Type"
                >
                    <MenuItem value="Fixed">Fixed</MenuItem>
                    <MenuItem value="Manual">Manual</MenuItem>
                </Select>
            </FormControl>

            {/* Visibility */}
            <FormControl component="fieldset" sx={{ marginBottom: '1rem' }}>
                <Typography component="legend">Visibility</Typography>
                <RadioGroup 
                    value={character.visibility} 
                    onChange={(e) => updateCharacter({ visibility: e.target.value })}
                >
                    <FormControlLabel value="Public" control={<Radio />} label="Public" />
                    <FormControlLabel value="Private" control={<Radio />} label="Private" />
                </RadioGroup>
            </FormControl>

            {/* Next Button */}
            <Button variant="contained" color="primary" onClick={handleNext}>
                Next: Race
            </Button>
        </Container>
    );
}

export default CharacterCreate;
