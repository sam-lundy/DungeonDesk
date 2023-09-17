import { useState, useEffect } from 'react';
import { 
    Container, Typography, Box, Button, List, ListItem, ListItemButton, ListItemText, Checkbox
} from '@mui/material';
import { useFormik } from 'formik';

import { gql, useQuery } from '@apollo/client';
import { useCharacterCreation } from './CharCreationContext';
import { useNavigate } from 'react-router-dom';


const GET_STARTING_EQUIPMENT_OPTIONS = gql`
  query Starting_equipment_options($name: String!) {
    classes(name: $name) {
      starting_equipment_options {
        choose
        desc
      }
      starting_equipment {
        equipment {
          name
        }
      }
    }
  }
`;


type EquipmentOption = {
    choose: number;
    desc: string;
};


const CharEquip: React.FC = () => {
    const { characterData, setCharacterData } = useCharacterCreation();
    const className = characterData.class;
    const navigate = useNavigate();
    console.log(characterData)

    const { data, loading, error } = useQuery(GET_STARTING_EQUIPMENT_OPTIONS, {
      variables: { name: className } // Make sure className contains a valid string
    });

    const [equipmentOptions, setEquipmentOptions] = useState<EquipmentOption[]>([]);

    const formik = useFormik({
        initialValues: {
            selectedEquipment: [] as string[]
        },
        onSubmit: (values) => {
            console.log(values.selectedEquipment);
            setCharacterData(prevData => ({
                ...prevData,
                equipment: values.selectedEquipment
            }));
            navigate('/character-create/preview');
        }
    });

    useEffect(() => {
        if (!loading && data) {
            setEquipmentOptions(data.classes[0].starting_equipment_options);
        }
    }, [data]);

    const handleEquipmentToggle = (value: string) => {
       if (formik.values.selectedEquipment.includes(value)) {
           formik.setFieldValue('selectedEquipment', formik.values.selectedEquipment.filter(item => item !== value));
       } else {
           formik.setFieldValue('selectedEquipment', [...formik.values.selectedEquipment, value]);
       }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;


    function splitEquipmentChoices(desc: string): string[] {
        // Split the string by commas, then by 'or'
        let choices = desc.split(/,|\bor\b/).map(s => s.trim());
        
        // Remove any leading "(a)", "(b)", etc.
        choices = choices.map(s => s.replace(/^\([a-z]\)\s*/, ''));
        
        // Filter out any empty or very short fragments
        choices = choices.filter(s => s.length > 2);
        
        return choices;
    }


    return (
        <Container 
        sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh'
            }}
        >
        <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: '5rem' }}>Choose Equipment</Typography>
        
        {/* Default Starting Equipment */}
        <Typography variant="h6" sx={{ textAlign: 'center' }}>Default Starting Equipment:</Typography>
        
        <List 
            sx={{ 
                maxWidth: '80vw', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: '2rem',  // To add space between items
            }}
        >
                {data.classes[0].starting_equipment.map((item: { equipment: { name: string } }, index: number) => (
            <ListItem key={index} sx={{ display: 'inline-block' }}>
                <ListItemText primary={item.equipment.name} />
            </ListItem>
                ))}
            </List>
            
            {data.classes[0].starting_equipment_options.map((option: EquipmentOption, index: number) => {
                const choices = splitEquipmentChoices(option.desc);
                
                if (choices.length === 0) return null;  // Don't render this section if no choices
                
                return (
                    <Box key={index} sx={{ margin: '1rem 0' }}>
                        <Typography variant="h6">Choose {option.choose} from:</Typography>
                        <List dense>
                            {choices.map((item: string) => (
                                <ListItemButton key={item} onClick={() => handleEquipmentToggle(item)}>
                                    <Checkbox
                                        edge="start"
                                        checked={formik.values.selectedEquipment.includes(item)}
                                        tabIndex={-1}
                                        disableRipple
                                    />
                                    <ListItemText primary={item} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Box>
                );
            })}
        {/* Confirm & Save Button */}
        <Button 
                variant="contained" 
                color="primary" 
                type="submit" 
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
                Preview Character
            </Button>
        </Container>
    );
}

export default CharEquip;
