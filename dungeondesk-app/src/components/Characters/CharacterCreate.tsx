import { 
    Container, TextField, Button, Typography, Box
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
    console.log(characterData)


    const formik = useFormik({
        validationSchema: validationSchema,
        initialValues: {
            name: characterData.name
        },
        onSubmit: values => {
            setCharacterData(prev => ({ ...prev, ...values }));
            navigate('/character-create/race');
        }
    });


    return (
        <Container>
            <Box display="flex" alignItems="center" height="100vh">
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
