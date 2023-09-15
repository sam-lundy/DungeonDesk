import { useState, useEffect } from 'react';
import { 
    Container, Typography, Box, Button, Modal
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { gql, useLazyQuery } from '@apollo/client';
import { useFormik } from 'formik';


interface ClassDetails {
    name?: string;
    hit_die?: number;
    saving_throws?: { name: string }[] | null;
    proficiencies?: { name: string }[] | null;
}


interface ClassData {
    class: ClassDetails;
}


const CharClass: React.FC = () => {
    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            selectedClass: ''
        },
        onSubmit: () => {
            navigate('/character-create/abilities');
        }
    });

    const handleClassSelection = (charClass: string) => {
        formik.setFieldValue('selectedClass', charClass);
        getClassDetails({ variables: { index: charClass.toLowerCase() } });
        setShowModal(true);
    };

    // GraphQL query to fetch class details.
    const GET_CLASS_DETAILS = gql`
    query Class($index: String) {
        class(index: $index) {
            name
            hit_die
            saving_throws {
                name
            }
            proficiencies {
                name
            }
        }
    }
`;

    const [getClassDetails, { data: classData }] = useLazyQuery<ClassData>(GET_CLASS_DETAILS);


    useEffect(() => {
        if (classData && classData.class) {
            setClassDetails(classData.class);
        }
    }, [classData]);
    

    const classes = [
        'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 
        'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
    ];
    

    const handleCloseModal = () => {
        formik.setFieldValue('selectedClass', '');
        setShowModal(false);
    };


    return (
        <Container>
            <Typography variant="h5">Choose Class</Typography>

            <form onSubmit={formik.handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    {classes.map(charClass => (
                        <Button 
                            key={charClass} 
                            variant="contained" 
                            color={formik.values.selectedClass === charClass ? "secondary" : "primary"}
                            onClick={() => handleClassSelection(charClass)}
                        >
                            {charClass}
                        </Button>
                    ))}
                </Box>

            {showModal && (
                <Modal 
                    open={showModal} 
                    onClose={handleCloseModal}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Box 
                        sx={{
                            bgcolor: 'background.paper', 
                            boxShadow: 24, 
                            p: 4, 
                            width: '80vw', 
                            maxWidth: '400px', 
                            borderRadius: '8px',
                            overflowY: 'auto',  // Allow vertical scrolling
                            maxHeight: '70vh'  // Set a maximum height
                        }}
                    >
                    <Typography variant="h6">{classDetails?.name}</Typography>
                    <Typography variant="body1">Hit Die: {classDetails?.hit_die}</Typography>
                    <Typography variant="subtitle1">Saving Throws:</Typography>
                    {classDetails?.saving_throws?.map((saving_throw) => (
                        <Typography key={saving_throw.name} variant="body2">{saving_throw.name}</Typography>
                    ))}
                    <Typography variant="subtitle1">Proficiencies:</Typography>
                    {classDetails?.proficiencies?.map((proficiency) => (
                        <Typography key={proficiency.name} variant="body2">{proficiency.name}</Typography>
                    ))}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                            <Button variant="outlined" onClick={handleCloseModal}>Cancel</Button>
                            <Button variant="contained" color="primary" onClick={formik.submitForm}>
                                Next: Abilities
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            )}
            </form>
        </Container>
    );
}

export default CharClass;
