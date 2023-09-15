import React from 'react';
import { 
    Container, TextField, Button, Avatar, 
    Select, MenuItem, FormControl, Box, InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { useCharacterCreation } from './CharCreationContext';

const CharacterCreate: React.FC = () => {
    const navigate = useNavigate();
    const { characterData, setCharacterData } = useCharacterCreation();

    const formik = useFormik({
        initialValues: {
            name: characterData.name,
            hitPointType: characterData.hitpointType || 'Fixed'
        },
        onSubmit: values => {
            setCharacterData(prev => ({ ...prev, ...values }));
            navigate('/character-create/race');
        }
    });

    return (
        <Container>
            <form onSubmit={formik.handleSubmit}>
                {/* Picture and Name */}
                <Box sx={{ display: 'flex', gap: 2, marginBottom: '1rem' }}>
                    <Avatar sx={{ width: '120px', height: '120px' }} /> {/* Placeholder for image upload */}
                    <TextField 
                        label="Character Name" 
                        variant="outlined" 
                        fullWidth
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                    />
                </Box>

                {/* Hit Point Type */}
                <FormControl fullWidth variant="outlined" sx={{ marginBottom: '1rem' }}>
                    <InputLabel id="hit-point-type-label">Hit Point Type</InputLabel>
                    <Select
                        labelId="hit-point-type-label"
                        name="hitPointType"
                        value={formik.values.hitPointType}
                        onChange={formik.handleChange}
                        label="Hit Point Type"
                    >
                        <MenuItem value="Fixed">Fixed</MenuItem>
                        <MenuItem value="Manual">Manual</MenuItem>
                    </Select>
                </FormControl>

                {/* Next Button */}
                <Button variant="contained" color="primary" type="submit">
                    Next: Race
                </Button>
            </form>
        </Container>
    );
}

export default CharacterCreate;
