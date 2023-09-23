import { useState, useEffect } from 'react';
import { 
    Container, Typography, Box, Button, 
    Modal, Checkbox
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { gql, useLazyQuery } from '@apollo/client';
import { useFormik } from 'formik';
import { useCharacterCreation } from './CharCreationContext';


interface ProficiencyOptionItem {
    name: string;
}

interface ProficiencyOption {
    item: ProficiencyOptionItem;
}

interface ProficiencyChoice {
    desc: string;
    choose: number;
    from: {
        options: ProficiencyOption[];
    };
}


interface ClassDetails {
    name?: string;
    hit_die?: number;
    saving_throws?: { name: string }[] | null;
    proficiencies?: { name: string }[] | null;
    proficiency_choices: ProficiencyChoice[] | null;
}


interface ClassData {
    class: ClassDetails;
}


const CharClass: React.FC = () => {
    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { characterData, setCharacterData } = useCharacterCreation();
    const [selectedProficiencies, setSelectedProficiencies] = useState<string[]>([]);
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            selectedClass: ''
        },
        onSubmit: () => {
            setCharacterData(prevData => ({
                ...prevData,
                proficiencies: selectedProficiencies
            }));
            navigate('/character-create/abilities');
        }
    });

    const handleClassSelection = (charClass: string) => {
        formik.setFieldValue('selectedClass', charClass);
        setCharacterData(prevData => ({
            ...prevData,
            class: charClass
        }));
        getClassDetails({ variables: { index: charClass.toLowerCase() } });
        setShowModal(true);
    };    

      
    const handleProficiencyChange = (proficiency: string) => {
        if (selectedProficiencies.includes(proficiency)) {
            // If proficiency is already selected, remove it
            setSelectedProficiencies(prev => prev.filter(p => p !== proficiency));
        } else {
            // Add the proficiency if not already selected
            setSelectedProficiencies(prev => [...prev, proficiency]);
        }
    };
    
    

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
        proficiency_choices {
        desc
        choose
        from {
            options {
            ... on ProficiencyReferenceOption {
                item {
                name
                }
            }
            }
        }
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
        setSelectedProficiencies([]);
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
                            sx={{
                                backgroundColor: '#0C0A26',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#0C0A26',
                                    opacity: 0.8
                                }
                            }}
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
                            overflowY: 'auto',
                            maxHeight: '75vh',
                            textAlign: 'center'
                        }}
                    >
                    <Typography variant="h6" sx={{ marginBottom: 2 }}>{classDetails?.name}</Typography>
                    <Typography variant="body1" sx={{ marginBottom: 2 }}>Hit Die: {classDetails?.hit_die}</Typography>
                    <Typography variant="subtitle1" sx={{ marginTop: 2, marginBottom: 1 }}>Saving Throws:</Typography>
                    {classDetails?.saving_throws?.map((saving_throw) => (
                        <Typography key={saving_throw.name} variant="body2" sx={{ marginBottom: 1 }}>{saving_throw.name}</Typography>
                    ))}

                    <Typography variant="subtitle1" sx={{ marginTop: 2, marginBottom: 1 }}>Proficiencies:</Typography>
                    {classDetails?.proficiencies?.map((proficiency) => (
                        <Typography key={proficiency.name} variant="body2" sx={{ marginBottom: 1 }}>{proficiency.name}</Typography>
                    ))}

                    <Typography variant="subtitle1" sx={{ marginTop: 2, marginBottom: 1 }}>
                        Choose Proficiencies:
                    </Typography>
                    {classDetails?.proficiency_choices?.map((choice, index) => (
                        <div key={index}>
                            <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                {choice.desc}
                            </Typography>
                            {choice.from.options.map((option: any) => {
                                if (!option.item) return null;

                                const proficiencyName = option.item.name;
                                const isChecked = selectedProficiencies.includes(proficiencyName);
                                const isDisabled = !isChecked && selectedProficiencies.length >= choice.choose;

                                return (
                                    <div key={proficiencyName}>
                                        <Checkbox
                                            checked={isChecked}
                                            onChange={() => handleProficiencyChange(proficiencyName, choice.choose)}
                                            disabled={isDisabled}
                                        />
                                        <label>{proficiencyName}</label>
                                    </div>
                                );
                            })}
                        </div>
                    ))}


                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                            <Button 
                                variant="outlined" 
                                onClick={handleCloseModal}
                                sx={{
                                    backgroundColor: '#0C0A26',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'red',
                                        opacity: 0.8
                                    }
                                  }}
                                >
                                Cancel
                            </Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={formik.submitForm}
                                sx={{
                                    backgroundColor: '#0C0A26',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#0C0A26',
                                        opacity: 0.8
                                    }
                                }}
                                >
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
