import { useState, ChangeEvent } from 'react';
import { 
    Container, TextField, Button, Avatar, Typography, Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCharacterCreation } from './CharCreationContext';


const validationSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
})


const CharacterCreate: React.FC = () => {
    const navigate = useNavigate();
    const { characterData, setCharacterData } = useCharacterCreation();
    const [profilePic, setProfilePic] = useState('');
    console.log(characterData)


    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0];
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            setCharacterData(prev => ({ ...prev, profilePic: reader.result as string }));
            setProfilePic(reader.result as string);

        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    };

    const formik = useFormik({
        validationSchema: validationSchema,
        initialValues: {
            name: characterData.name,
            profilePic: characterData.profilePic
        },
        onSubmit: values => {
            setCharacterData(prev => ({ ...prev, ...values }));
            navigate('/character-create/race');
        }
    });


    return (
        <Container>
            <Box display="flex" alignItems="center" height="100vh">
                {/* Avatar Container */}
                <Box flexGrow={1} display="flex" flexDirection="column" alignItems="flex-start" pl={4}>
                    {profilePic ? (
                        <img src={profilePic} alt="Character" width="120" height="120" />
                    ) : (
                        <Avatar sx={{ width: '120px', height: '120px' }} />
                    )}
                    <input 
                        type="file" 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        style={{ marginTop: '1rem', marginBottom: '-1.5rem' }}
                    />
                </Box>

                {/* Form Content */}
                <Box flexGrow={4} display="flex" flexDirection="column" alignItems="center">
                <Typography 
                    variant="h4" 
                    sx={{ marginBottom: '5rem' }}
                >
                    Create Character
                </Typography>


                    {formik.errors.name && formik.touched.name && <div>{formik.errors.name}</div>}

                    <form onSubmit={formik.handleSubmit}>
                        <TextField 
                            label="Character Name" 
                            variant="outlined" 
                            name="name"
                            fullWidth
                            error={Boolean(formik.errors.name && formik.touched.name)}
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            
                            sx={{ 
                                marginBottom: '5rem',
                                borderColor: formik.errors.name && formik.touched.name ? 'red' : 'initial'
                            }}
                            
                        />

                        <Button 
                            variant="contained" 
                            color="primary" 
                            type="submit"
                            sx={{
                                backgroundColor: '#0C0A26',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#0C0A26',
                                    opacity: 0.8
                                }
                            }}
                            >
                            Next: Race
                        </Button>
                    </form>
                </Box>
            </Box>
        </Container>

    );
}

export default CharacterCreate;
